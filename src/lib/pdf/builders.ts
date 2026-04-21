import { prisma } from "@/lib/prisma";
import { compterActions, listerActions, origineDeLAction } from "@/lib/actions/queries";
import { compterEtatCalendrier, listerVerifications } from "@/lib/calendrier/queries";
import { listerRapportsDeLEtablissement } from "@/lib/rapports/queries";
import { obligationParId } from "@/lib/referentiels/conformite";
import { calculerScoreConformite } from "@/lib/dashboard/score";
import type { LignePlanActions, PlanActionsData } from "./PlanActionsDocument";
import type { LigneRapport, LigneVerif, RegistreData } from "./RegistreDocument";
import type { DossierData } from "./DossierConformiteDocument";

/**
 * Builders qui lisent la DB et construisent les données sérialisables
 * à fournir aux composants PDF. Pas de renduHTML ici — uniquement du
 * shaping de données. Cela permet de tester les builders sans rendre
 * de PDF et de garder les composants PDF purs.
 */

const JOUR_MS = 1000 * 60 * 60 * 24;

function regimesTexte(etab: {
  estEtablissementTravail: boolean;
  estERP: boolean;
  estIGH: boolean;
  estHabitation: boolean;
  typeErp: string | null;
  categorieErp: string | null;
  classeIgh: string | null;
}): string {
  const out: string[] = [];
  if (etab.estEtablissementTravail) out.push("Établissement de travail");
  if (etab.estERP) {
    let lib = "ERP";
    if (etab.typeErp) lib += ` type ${etab.typeErp}`;
    if (etab.categorieErp) lib += ` cat. ${etab.categorieErp.slice(1)}`;
    out.push(lib);
  }
  if (etab.estIGH) out.push(`IGH ${etab.classeIgh ?? ""}`.trim());
  if (etab.estHabitation) out.push("Habitation");
  return out.join(", ");
}

function contexteAction(a: {
  risque: {
    libelle: string;
    unite: { nom: string };
  } | null;
  verification: {
    libelleObligation: string;
    equipement: { libelle: string };
  } | null;
}): string {
  if (a.risque) {
    return `DUERP — ${a.risque.unite.nom} · ${a.risque.libelle}`;
  }
  if (a.verification) {
    return `Vérification — ${a.verification.equipement.libelle}`;
  }
  return "Libre";
}

export async function construirePlanActionsData(
  etablissementId: string,
): Promise<PlanActionsData | null> {
  const etab = await prisma.etablissement.findUnique({
    where: { id: etablissementId },
    include: { entreprise: true },
  });
  if (!etab) return null;

  const [actions, compteurs] = await Promise.all([
    listerActions(etablissementId),
    compterActions(etablissementId),
  ]);

  const lignes: LignePlanActions[] = actions.map((a) => ({
    id: a.id,
    libelle: a.libelle,
    description: a.description,
    type: a.type,
    statut: a.statut,
    criticite: a.criticite,
    echeance: a.echeance,
    responsable: a.responsable,
    origine: origineDeLAction(a),
    contexte: contexteAction(a),
    leveeLe: a.leveeLe,
    leveeCommentaire: a.leveeCommentaire,
  }));

  return {
    entreprise: etab.entreprise.raisonSociale,
    etablissement: etab.raisonDisplay,
    adresse: etab.adresse,
    genereLe: new Date(),
    totalOuvertes: compteurs.ouvertes,
    totalEnCours: compteurs.enCours,
    totalLevees: actions.filter((a) => a.statut === "levee").length,
    actions: lignes,
  };
}

export async function construireRegistreData(
  etablissementId: string,
): Promise<RegistreData | null> {
  const etab = await prisma.etablissement.findUnique({
    where: { id: etablissementId },
    include: { entreprise: true },
  });
  if (!etab) return null;

  const [rapports, verifs] = await Promise.all([
    listerRapportsDeLEtablissement(etablissementId),
    listerVerifications(etablissementId),
  ]);

  const lignesRapports: LigneRapport[] = rapports.map((r) => ({
    id: r.id,
    dateRapport: r.dateRapport,
    resultat: r.resultat,
    organismeVerif: r.organismeVerif,
    libelleObligation: r.verification.libelleObligation,
    equipementLibelle: r.verification.equipement.libelle,
    domaine: obligationParId(r.verification.obligationId)?.domaine ?? null,
    fichierNomOriginal: r.fichierNomOriginal,
    commentaires: r.commentaires,
  }));

  const verifsEnAttente: LigneVerif[] = verifs
    .filter((v) =>
      ["a_planifier", "planifiee", "depassee"].includes(v.statut),
    )
    .map((v) => ({
      id: v.id,
      libelleObligation: v.libelleObligation,
      equipementLibelle: v.equipement.libelle,
      datePrevue: v.datePrevue,
      statut: v.statut,
      domaine: obligationParId(v.obligationId)?.domaine ?? null,
    }));

  return {
    entreprise: etab.entreprise.raisonSociale,
    etablissement: etab.raisonDisplay,
    adresse: etab.adresse,
    genereLe: new Date(),
    rapports: lignesRapports,
    verifsEnAttente,
  };
}

export async function construireDossierConformiteData(
  etablissementId: string,
): Promise<DossierData | null> {
  const etab = await prisma.etablissement.findUnique({
    where: { id: etablissementId },
    include: {
      entreprise: true,
      duerps: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: {
          versions: { orderBy: { numero: "desc" }, take: 1 },
          unites: { include: { risques: true } },
        },
      },
    },
  });
  if (!etab) return null;

  const [compteursActions, etatCalendrier, plan, registre] = await Promise.all([
    compterActions(etablissementId),
    compterEtatCalendrier(etablissementId),
    construirePlanActionsData(etablissementId),
    construireRegistreData(etablissementId),
  ]);

  const now = new Date();
  const duerp = etab.duerps[0] ?? null;
  const derniereVersion = duerp?.versions[0] ?? null;
  const ageJours = derniereVersion
    ? Math.round((now.getTime() - derniereVersion.createdAt.getTime()) / JOUR_MS)
    : null;

  const score = calculerScoreConformite({
    verifsTotal:
      etatCalendrier.enRetard + etatCalendrier.aVenir + etatCalendrier.realisees12m,
    verifsEnRetard: etatCalendrier.enRetard,
    actionsOuvertesTotal: compteursActions.totalACouvrir,
    actionsEnRetard: compteursActions.enRetard,
    duerpAgeJours: ageJours ?? undefined,
  });

  const criticiteMax =
    duerp?.unites
      .flatMap((u) => u.risques)
      .reduce<number | null>(
        (max, r) => (max === null || r.criticite > max ? r.criticite : max),
        null,
      ) ?? null;

  return {
    entreprise: etab.entreprise.raisonSociale,
    siret: etab.entreprise.siret,
    etablissement: etab.raisonDisplay,
    adresse: etab.adresse,
    effectifSurSite: etab.effectifSurSite,
    codeNaf: etab.codeNaf ?? etab.entreprise.codeNaf,
    regimesTexte: regimesTexte(etab),
    genereLe: now,
    score,
    duerp:
      duerp === null
        ? null
        : {
            duerpId: duerp.id,
            numeroDerniereVersion: derniereVersion?.numero ?? null,
            dateDerniereVersion: derniereVersion?.createdAt ?? null,
            nombreUnites: duerp.unites.length,
            nombreRisques: duerp.unites.reduce(
              (n, u) => n + u.risques.length,
              0,
            ),
            criticiteMax,
          },
    compteurs: {
      verifsEnRetard: etatCalendrier.enRetard,
      verifsPlanifiees: etatCalendrier.aVenir,
      verifsRealisees12m: etatCalendrier.realisees12m,
      actionsOuvertes: compteursActions.ouvertes + compteursActions.enCours,
      actionsEnRetard: compteursActions.enRetard,
    },
    rapportsRecents: registre?.rapports.slice(0, 10) ?? [],
    verifsEnRetard:
      registre?.verifsEnAttente.filter(
        (v) => v.statut === "depassee" || v.statut === "a_planifier",
      ) ?? [],
    actionsEnCours:
      plan?.actions.filter(
        (a) => a.statut === "ouverte" || a.statut === "en_cours",
      ) ?? [],
  };
}
