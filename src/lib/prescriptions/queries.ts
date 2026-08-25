import { prisma } from "@/lib/prisma";
import {
  appliquerPrescriptions,
  determineObligationsApplicables,
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

/**
 * Liste les prescriptions d'un établissement avec leur état **calculé** —
 * active / levée / ignorée (raison) — en rejouant la même fonction pure que
 * le générateur. Rien n'est persisté : même entrée, même sortie (ADR-014).
 */
export async function listerPrescriptions(
  etablissementId: string,
  now: Date = new Date(),
): Promise<PrescriptionListee[]> {
  const etab = await prisma.etablissement.findUnique({
    where: { id: etablissementId },
    include: {
      equipements: { where: { actif: true } },
      prescriptionsParticulieres: { orderBy: { dateDocument: "desc" } },
    },
  });
  if (!etab) return [];

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
  const ignorees = new Map(res.ignorees.map((i) => [i.prescription.id, i.raison]));

  return etab.prescriptionsParticulieres.map((p) => {
    let etat: EtatPrescription;
    const raison = ignorees.get(p.id);
    if (!p.actif) {
      etat = { etat: "levee", detail: "Désactivée." };
    } else if (raison?.startsWith("Prescription levée")) {
      etat = { etat: "levee", detail: raison };
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
}

/** Obligations du référentiel applicables ici — les seules qu'une
 *  prescription `renforce_periodicite` peut cibler. */
export async function obligationsCiblables(etablissementId: string) {
  const etab = await prisma.etablissement.findUnique({
    where: { id: etablissementId },
    include: { equipements: { where: { actif: true } } },
  });
  if (!etab) return { obligations: [], equipements: [] };
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
    etab.equipements.map((eq) => ({
      id: eq.id,
      libelle: eq.libelle,
      categorie: eq.categorie,
      caracteristiques: (eq.caracteristiques ?? null) as Record<
        string,
        unknown
      > | null,
    })),
  );
  return {
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
