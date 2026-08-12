"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertEtablissementOwnership } from "@/lib/auth/scope";
import { construireEcrituresImport } from "./ecritures";
import { parserFichierDuerp, planifierImport } from "./parser";
import { validerFichier } from "@/lib/rapports/validator";

/**
 * Import d'un DUERP Excel ou CSV.
 *
 * Le fichier est parsé côté serveur (xlsx gère les deux formats). Chaque
 * ligne devient :
 *   - une `UniteTravail` (créée ou réutilisée par nom),
 *   - un `Risque` avec cotation gravité/probabilité/maîtrise,
 *   - une `Action` par mesure listée (statut « levee » — déjà en place).
 *
 * L'import est transactionnel : en cas d'erreur, rien n'est créé. Une
 * étape de preview (sans écriture) précède l'import pour que l'utilisateur
 * corrige le mapping de colonnes si la détection automatique a raté.
 */

const MIME_IMPORT_AUTORISES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "application/vnd.ms-excel", // xls
  "text/csv",
  "text/plain", // certains navigateurs envoient CSV en text/plain
] as const;

export type PreviewImportState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
    }
  | {
      status: "preview";
      nomFichier: string;
      nbLignes: number;
      nbRisques: number;
      nbMesures: number;
      nbUnites: number;
      nbErreurs: number;
      resume: Array<{ unite: string; nbRisques: number; exemples: string[] }>;
    };

/**
 * Étape 1 : upload + parsing + preview (pas d'écriture).
 * Côté UI, l'action est appelée depuis un form multipart.
 */
export async function previewImport(
  etablissementId: string,
  _prev: PreviewImportState,
  formData: FormData,
): Promise<PreviewImportState> {
  await assertEtablissementOwnership(etablissementId);

  const fichier = formData.get("fichier");
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { status: "error", message: "Aucun fichier fourni." };
  }
  // Validation MIME spécifique à l'import (PDF exclu).
  if (!(MIME_IMPORT_AUTORISES as readonly string[]).includes(fichier.type)) {
    // Fallback : accepter un fichier CSV même si le navigateur envoie
    // un type générique sous réserve de l'extension.
    const extCsv = fichier.name.toLowerCase().endsWith(".csv");
    const extXlsx =
      fichier.name.toLowerCase().endsWith(".xlsx") ||
      fichier.name.toLowerCase().endsWith(".xls");
    if (!extCsv && !extXlsx) {
      return {
        status: "error",
        message: `Format non accepté (${fichier.type || "inconnu"}). Fournissez un fichier Excel (.xlsx / .xls) ou CSV.`,
      };
    }
  }
  const check = validerFichier(fichier);
  if (!check.ok) return { status: "error", message: check.erreur };

  const buffer = Buffer.from(await fichier.arrayBuffer());
  const res = parserFichierDuerp(buffer);
  const plan = planifierImport(res.lignes);

  return {
    status: "preview",
    nomFichier: fichier.name,
    nbLignes: res.totalLignes,
    nbRisques: plan.nbRisques,
    nbMesures: plan.nbMesures,
    nbUnites: plan.unites.length,
    nbErreurs: res.erreurs.length,
    resume: plan.unites.slice(0, 30).map((u) => ({
      unite: u.nom,
      nbRisques: u.risques.length,
      exemples: u.risques
        .slice(0, 3)
        .map((r) => r.libelleRisque)
        .filter(Boolean),
    })),
  };
}

export type CommitImportState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; duerpId: string; nbRisques: number };

/**
 * Étape 2 : commit transactionnel. Relit le fichier, ré-applique le parsing,
 * puis écrit en base. On ne stocke pas le fichier entre les deux étapes
 * pour garder l'action stateless — au prix d'un re-parse.
 */
export async function commitImport(
  etablissementId: string,
  _prev: CommitImportState,
  formData: FormData,
): Promise<CommitImportState> {
  await assertEtablissementOwnership(etablissementId);

  const fichier = formData.get("fichier");
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { status: "error", message: "Fichier manquant." };
  }
  const check = validerFichier(fichier);
  if (!check.ok) return { status: "error", message: check.erreur };

  const buffer = Buffer.from(await fichier.arrayBuffer());
  const res = parserFichierDuerp(buffer);
  if (res.lignes.length === 0) {
    return {
      status: "error",
      message:
        res.erreurs.length > 0
          ? "Toutes les lignes sont invalides. Corrigez le fichier avant d'importer."
          : "Fichier sans donnée exploitable.",
    };
  }
  const plan = planifierImport(res.lignes);

  // Trouve ou crée un DUERP actif sur l'établissement.
  let duerp = await prisma.duerp.findFirst({
    where: { etablissementId },
    orderBy: { updatedAt: "desc" },
  });
  if (!duerp) {
    duerp = await prisma.duerp.create({
      data: { etablissementId },
    });
  }

  const duerpId = duerp.id;

  // Unités déjà en base, lues **avant** la transaction et en une fois. La
  // version précédente les cherchait une par une depuis l'intérieur de la
  // transaction, ce qui forçait celle-ci à rester interactive et à payer un
  // aller-retour réseau par ligne du fichier.
  const unitesExistantes = await prisma.uniteTravail.findMany({
    where: { duerpId, nom: { in: plan.unites.map((u) => u.nom) } },
    select: { id: true, nom: true },
  });

  // Les identifiants sont générés ici, donc plus aucune écriture n'attend le
  // résultat d'une autre : les trois listes partent en autant de `createMany`,
  // dans une transaction séquentielle envoyée en un seul lot.
  const ecritures = construireEcrituresImport({
    plan,
    unitesExistantes,
    duerpId,
    etablissementId,
    genererId: (prefixe) => `${prefixe}_${randomUUID()}`,
    maintenant: new Date(),
  });

  const nbRisquesCrees = ecritures.risques.length;

  // Transaction unique : toutes les écritures ou rien. L'ordre du tableau est
  // celui de l'exécution — les unités avant les risques qui les référencent,
  // les risques avant leurs actions.
  const operations: Prisma.PrismaPromise<unknown>[] = [];
  if (ecritures.unitesACreer.length > 0) {
    operations.push(
      prisma.uniteTravail.createMany({ data: ecritures.unitesACreer }),
    );
  }
  if (ecritures.risques.length > 0) {
    operations.push(prisma.risque.createMany({ data: ecritures.risques }));
  }
  if (ecritures.actions.length > 0) {
    operations.push(prisma.action.createMany({ data: ecritures.actions }));
  }
  await prisma.$transaction(operations);

  revalidatePath(`/etablissements/${etablissementId}`);
  revalidatePath(`/duerp/${duerpId}/risques`);
  revalidatePath(`/duerp/${duerpId}/synthese`);

  return { status: "success", duerpId, nbRisques: nbRisquesCrees };
}
