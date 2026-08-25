import { prisma } from "@/lib/prisma";
import { cleJourCivil } from "@/lib/dates";
import {
  appliquerPrescriptions,
  determineObligationsApplicables,
  prescriptionEnVigueur,
  type PrescriptionMatching,
} from "@/lib/matching";
import { obligationParId } from "@/lib/referentiels/conformite";

export type EtatPrescription =
  | { etat: "active"; detail: string }
  | { etat: "levee"; detail: string }
  | { etat: "ignoree"; detail: string };

export type PrescriptionListee = PrescriptionMatching & {
  actif: boolean;
  etat: EtatPrescription;
  /** Libellé lisible de l'obligation ciblée (effet renforce_periodicite). */
  libelleObligationCiblee: string | null;
};

export type DonneesPagePrescriptions = {
  prescriptions: PrescriptionListee[];
  /** Obligations du référentiel applicables ici — les seules qu'une
   *  prescription `renforce_periodicite` peut cibler. */
  obligations: { id: string; libelle: string; periodicite: string }[];
  equipements: { id: string; libelle: string; categorie: string }[];
};

/**
 * Tout ce que la page « Prescriptions » affiche, en **une** lecture et **une**
 * passe de matching : la liste des prescriptions avec leur état calculé, les
 * obligations ciblables et les équipements déclarés.
 *
 * L'état de chaque prescription — active / levée / ignorée (raison) — n'est
 * jamais persisté : il est rejoué à l'affichage par la même fonction pure que
 * le générateur, donc même entrée, même sortie (ADR-014).
 *
 * Les deux moitiés partagent délibérément la même lecture : séparées, elles
 * relisaient l'établissement et ses équipements deux fois et faisaient tourner
 * le moteur de matching deux fois par rendu, pour un résultat identique.
 */
export async function chargerPagePrescriptions(
  etablissementId: string,
  now: Date = new Date(),
): Promise<DonneesPagePrescriptions> {
  const etab = await prisma.etablissement.findUnique({
    where: { id: etablissementId },
    include: {
      equipements: { where: { actif: true } },
      prescriptionsParticulieres: { orderBy: { dateDocument: "desc" } },
    },
  });
  if (!etab) return { prescriptions: [], obligations: [], equipements: [] };

  const equipements = etab.equipements.map((eq) => ({
    id: eq.id,
    libelle: eq.libelle,
    categorie: eq.categorie,
    caracteristiques: (eq.caracteristiques ?? null) as Record<
      string,
      unknown
    > | null,
  }));
  const applicables = determineObligationsApplicables(
    {
      id: etab.id,
      effectifSurSite: etab.effectifSurSite,
      estEtablissementTravail: etab.estEtablissementTravail,
      estERP: etab.estERP,
      estIGH: etab.estIGH,
      estHabitation: etab.estHabitation,
      typeErp: etab.typeErp,
      categorieErp: etab.categorieErp,
      classeIgh: etab.classeIgh,
      personnesPresentesHabituellement: etab.personnesPresentesHabituellement,
      manipuleMatieresR422722: etab.manipuleMatieresR422722,
    },
    equipements,
  );
  const actives = etab.prescriptionsParticulieres.filter((p) => p.actif);
  const res = appliquerPrescriptions(applicables, actives, equipements, now);
  const ignorees = new Map(
    res.ignorees.map((i) => [i.prescription.id, i.raison]),
  );
  const prescriptions = etab.prescriptionsParticulieres.map((p) => {
    let etat: EtatPrescription;
    const raison = ignorees.get(p.id);
    if (!p.actif) {
      etat = { etat: "levee", detail: "Désactivée." };
    } else if (!prescriptionEnVigueur(p, now)) {
      // Fin d'effet datée et atteinte : « levée », pas « ignorée ». Le
      // prédicat est celui du moteur, pas une reconnaissance de message.
      etat = {
        etat: "levee",
        detail:
          raison ??
          `Prescription levée le ${p.dateFin ? cleJourCivil(p.dateFin) : "?"}.`,
      };
    } else if (raison) {
      etat = { etat: "ignoree", detail: raison };
    } else {
      etat = {
        etat: "active",
        detail:
          p.effet === "renforce_periodicite"
            ? `Périodicité portée à « ${p.periodicite} ».`
            : `Obligation propre à votre établissement, ${p.periodicite}.`,
      };
    }
    return {
      ...p,
      etat,
      libelleObligationCiblee: p.obligationId
        ? (obligationParId(p.obligationId)?.libelle ?? p.obligationId)
        : null,
    };
  });

  return {
    prescriptions,
    obligations: applicables.map((a) => ({
      id: a.obligation.id,
      libelle: a.obligation.libelle,
      periodicite: a.obligation.periodicite,
    })),
    equipements: etab.equipements.map((e) => ({
      id: e.id,
      libelle: e.libelle,
      categorie: e.categorie,
    })),
  };
}
