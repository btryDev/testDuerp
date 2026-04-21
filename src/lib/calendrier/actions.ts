"use server";

import { revalidatePath } from "next/cache";
import type { Realisateur } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { determineObligationsApplicables } from "@/lib/matching";
import {
  genererProchainesVerifications,
  type VerificationsPrecedentes,
} from "./generateur";

export type GenerationResult = {
  created: number;
  updated: number;
  deleted: number;
};

/**
 * (Re)génère le calendrier de vérifications d'un établissement :
 *  1. Lit l'établissement + ses équipements (avec caractéristiques).
 *  2. Passe par le moteur de matching pour déterminer les obligations
 *     applicables (sortie étape 5).
 *  3. Construit la map `verificationsPrecedentes` à partir des vérifs
 *     déjà réalisées (dateRealisee non null) — on garde la plus récente
 *     par couple (obligationId, equipementId).
 *  4. Passe au générateur (étape 6) qui produit la prochaine occurrence
 *     par couple.
 *  5. Supprime les vérifications encore non réalisées (a_planifier,
 *     planifiee, depassee) — leur régénération est la source de vérité.
 *  6. Insère les nouvelles occurrences.
 *
 * Les rapports de vérification (entité `RapportVerification`) pointent
 * vers `verification.dateRealisee` ; on ne supprime **jamais** une
 * vérification déjà réalisée, ce qui préserve l'historique.
 */
export async function genererCalendrier(
  etablissementId: string,
): Promise<GenerationResult> {
  // 1. Lecture établissement + équipements
  const etab = await prisma.etablissement.findUnique({
    where: { id: etablissementId },
    include: { equipements: true },
  });
  if (!etab) throw new Error("Établissement introuvable");

  // 2. Matching
  const obligations = determineObligationsApplicables(
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

  // 3. Historique — dernière vérif réalisée par couple (obligationId, equipementId)
  const realisees = await prisma.verification.findMany({
    where: {
      etablissementId,
      dateRealisee: { not: null },
    },
    orderBy: { dateRealisee: "desc" },
    select: {
      obligationId: true,
      equipementId: true,
      dateRealisee: true,
    },
  });

  const prec: VerificationsPrecedentes = new Map();
  for (const r of realisees) {
    const cle = `${r.obligationId}::${r.equipementId}`;
    if (!prec.has(cle) && r.dateRealisee) {
      prec.set(cle, r.dateRealisee);
    }
  }

  // 4. Génération
  const aGenerer = genererProchainesVerifications(obligations, prec);

  // 5. Suppression des occurrences non réalisées (statuts planifiables)
  const suppr = await prisma.verification.deleteMany({
    where: {
      etablissementId,
      statut: { in: ["a_planifier", "planifiee", "depassee"] },
    },
  });

  // 6. Insertion
  if (aGenerer.length === 0) {
    revalidatePath(`/etablissements/${etablissementId}/calendrier`);
    revalidatePath(`/etablissements/${etablissementId}`);
    return { created: 0, updated: 0, deleted: suppr.count };
  }

  const result = await prisma.verification.createMany({
    data: aGenerer.map((v) => ({
      etablissementId,
      equipementId: v.equipementId,
      obligationId: v.obligationId,
      libelleObligation: v.libelleObligation,
      periodicite: v.periodicite,
      realisateurRequis: v.realisateurRequis as Realisateur[],
      datePrevue: v.datePrevue,
      statut: v.statut,
    })),
  });

  revalidatePath(`/etablissements/${etablissementId}/calendrier`);
  revalidatePath(`/etablissements/${etablissementId}`);

  return { created: result.count, updated: 0, deleted: suppr.count };
}
