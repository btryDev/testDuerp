"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type Realisateur } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertEtablissementOwnership } from "@/lib/auth/scope";
import { determineObligationsApplicables } from "@/lib/matching";
import { REFERENTIEL_VERSION } from "@/lib/referentiels/conformite";
import {
  genererProchainesVerifications,
  reconcilierCalendrier,
  type OccurrenceExistante,
  type StatutVerificationPersiste,
} from "./generateur";

/**
 * Marque le calendrier d'un établissement comme périmé.
 *
 * Sert au seul cas que l'auto-réparation ne voyait pas : une mutation
 * d'équipement réussit, la régénération qui la suit échoue, et le
 * calendrier reste ni vide ni périmé en version — juste faux. Personne ne
 * le sait, et il faudrait un geste de l'utilisateur pour le rattraper.
 *
 * En effaçant la version de référentiel, on replace l'établissement dans
 * l'état « désynchronisé » que `calendrierDesynchronise` détecte déjà :
 * la prochaine ouverture du calendrier le régénère toute seule. Aucun
 * nouveau concept, aucun bouton — le mécanisme existait, il lui manquait
 * d'être armé quand ça casse.
 *
 * N'échoue jamais : elle s'exécute dans un `catch`, et si la base est
 * elle-même indisponible il n'y a rien à marquer.
 */
export async function marquerCalendrierPerime(
  etablissementId: string,
): Promise<void> {
  try {
    await prisma.etablissement.update({
      where: { id: etablissementId },
      data: { referentielVersionCalendrier: null },
    });
  } catch (err) {
    console.error(
      `[calendrier] impossible de marquer ${etablissementId} comme périmé`,
      err,
    );
  }
}

export type GenerationResult = {
  /** Lignes de suivi nouvellement ouvertes (nouvel équipement, nouvelle
   *  obligation applicable). */
  created: number;
  /** Lignes existantes réalignées — identifiants inchangés. */
  updated: number;
  /** Lignes supprimées : uniquement celles qui ne portaient ni rapport, ni
   *  action corrective, ni date de réalisation. */
  deleted: number;
  /** Lignes devenues non applicables mais porteuses de preuve : marquées
   *  « Ne s'applique plus », conservées. */
  archived: number;
  /** Lignes que la régénération n'a pas eu à toucher. */
  unchanged: number;
};

/**
 * (Re)génère le calendrier de vérifications d'un établissement, **de façon
 * idempotente** — cf. ADR-012.
 *
 * Déroulé :
 *  1. Lit l'établissement et ses équipements **actifs** (un équipement
 *     désactivé ne génère plus d'obligation, cf. `lib/equipements/actions.ts`).
 *  2. Passe par le moteur de matching pour déterminer les obligations
 *     applicables.
 *  3. Demande au générateur l'ensemble des couples (obligation, équipement)
 *     applicables — **sans** historique : les dates réelles sont recalculées
 *     ligne par ligne par le réconciliateur, à partir de ce qu'il y a en base.
 *  4. Réconcilie (fonction pure) : créations, mises à jour, archivages,
 *     suppressions.
 *  5. Applique le plan dans **une seule transaction**.
 *
 * Ce que cette fonction ne fait plus, et ne doit jamais refaire : supprimer
 * les vérifications non réalisées pour les recréer. `Action.verificationId`
 * et `RapportVerification.verificationId` sont en `onDelete: Cascade` — un
 * `deleteMany` sur les vérifications emporte silencieusement les actions
 * correctives du dirigeant et les rapports déposés par ses prestataires.
 */
export async function genererCalendrier(
  etablissementId: string,
): Promise<GenerationResult> {
  await assertEtablissementOwnership(etablissementId);
  const now = new Date();

  // 1. Lecture établissement + équipements encore en service.
  const etab = await prisma.etablissement.findUnique({
    where: { id: etablissementId },
    include: { equipements: { where: { actif: true } } },
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

  // 3. Ensemble des couples applicables. Historique volontairement vide :
  //    cf. la doc de `reconcilierCalendrier`.
  const aGenerer = genererProchainesVerifications(obligations, new Map(), {
    now,
  });

  // 4. État en base. `_count` sert au seul arbitrage qui autorise une
  //    suppression : une ligne sans rapport ni action ne porte aucune preuve.
  const existantesBrutes = await prisma.verification.findMany({
    where: { etablissementId },
    select: {
      id: true,
      obligationId: true,
      equipementId: true,
      libelleObligation: true,
      periodicite: true,
      realisateurRequis: true,
      datePrevue: true,
      dateRealisee: true,
      statut: true,
      _count: { select: { rapports: true, actions: true } },
    },
  });

  const existantes: OccurrenceExistante[] = existantesBrutes.map((v) => ({
    id: v.id,
    obligationId: v.obligationId,
    equipementId: v.equipementId,
    libelleObligation: v.libelleObligation,
    periodicite: v.periodicite,
    realisateurRequis: v.realisateurRequis,
    datePrevue: v.datePrevue,
    dateRealisee: v.dateRealisee,
    statut: v.statut as StatutVerificationPersiste,
    porteUnePreuve: v._count.rapports > 0 || v._count.actions > 0,
  }));

  const plan = reconcilierCalendrier(existantes, aGenerer, { now });

  // 5. Application du plan — tout ou rien. Un calendrier à moitié régénéré
  //    (créations passées, mises à jour perdues) afficherait des échéances
  //    incohérentes sans que personne ne le sache.
  //
  //    Le plan est entièrement calculé avant d'ouvrir la transaction : aucune
  //    opération ci-dessous ne lit la base, et aucune ne dépend du résultat
  //    d'une autre. La forme **séquentielle** de `$transaction` convient donc,
  //    et c'est elle qu'il faut : elle envoie tout le lot en un seul
  //    aller-retour, là où la forme interactive payait la latence réseau une
  //    fois par écriture. Sur 43 occurrences, cela faisait 46 allers-retours
  //    dans une même transaction, assez pour en dépasser le délai — et comme le
  //    repère de version s'écrit dans le lot, l'échec relançait l'opération au
  //    chargement suivant, indéfiniment (P2028).
  const operations: Prisma.PrismaPromise<unknown>[] = [];

  if (plan.aSupprimer.length > 0) {
    operations.push(
      prisma.verification.deleteMany({
        where: { id: { in: plan.aSupprimer }, etablissementId },
      }),
    );
  }

  if (plan.aCreer.length > 0) {
    // `skipDuplicates` : deux régénérations concurrentes (déclaration
    // d'équipement dans un onglet, dépôt de rapport dans l'autre) peuvent
    // calculer la même création. La contrainte d'unicité tranche, sans
    // faire échouer la transaction.
    operations.push(
      prisma.verification.createMany({
        data: plan.aCreer.map((v) => ({
          etablissementId,
          equipementId: v.equipementId,
          obligationId: v.obligationId,
          libelleObligation: v.libelleObligation,
          periodicite: v.periodicite,
          realisateurRequis: v.realisateurRequis as Realisateur[],
          datePrevue: v.datePrevue,
          statut: v.statut,
        })),
        skipDuplicates: true,
      }),
    );
  }

  for (const m of plan.aMettreAJour) {
    operations.push(
      prisma.verification.update({
        where: { id: m.id },
        data: {
          libelleObligation: m.libelleObligation,
          periodicite: m.periodicite,
          realisateurRequis: m.realisateurRequis as Realisateur[],
          datePrevue: m.datePrevue,
          dateRealisee: m.dateRealisee,
          statut: m.statut,
        },
      }),
    );
  }

  for (const a of plan.aArchiver) {
    operations.push(
      prisma.verification.update({
        where: { id: a.id },
        data: { libelleObligation: a.libelleObligation },
      }),
    );
  }

  // Le calendrier est désormais aligné sur cette version du référentiel.
  // Écrit **dans** la transaction, et en dernier : si le plan échoue,
  // l'établissement reste marqué comme désynchronisé et sera repris au prochain
  // affichage, plutôt que d'être considéré à tort comme à jour.
  operations.push(
    prisma.etablissement.update({
      where: { id: etablissementId },
      data: { referentielVersionCalendrier: REFERENTIEL_VERSION },
    }),
  );

  // Les opérations s'exécutent dans l'ordre du tableau, en une transaction.
  await prisma.$transaction(operations);

  revalidatePath(`/etablissements/${etablissementId}/calendrier`);
  revalidatePath(`/etablissements/${etablissementId}`);

  return {
    created: plan.aCreer.length,
    updated: plan.aMettreAJour.length,
    deleted: plan.aSupprimer.length,
    archived: plan.aArchiver.length,
    unchanged: plan.inchangees,
  };
}
