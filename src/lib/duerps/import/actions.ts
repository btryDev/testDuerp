"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertEtablissementOwnership } from "@/lib/auth/scope";
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
  let nbRisquesCrees = 0;

  // Transaction unique : toutes les écritures ou rien.
  await prisma.$transaction(async (tx) => {
    for (const u of plan.unites) {
      // Unité : réutilise si existe par nom, sinon crée.
      const existing = await tx.uniteTravail.findFirst({
        where: { duerpId, nom: u.nom },
      });
      const unite =
        existing ??
        (await tx.uniteTravail.create({
          data: { duerpId, nom: u.nom },
        }));

      for (const r of u.risques) {
        const criticite = Math.max(
          1,
          Math.min(16, Math.round((r.gravite * r.probabilite) / r.maitrise)),
        );
        const risque = await tx.risque.create({
          data: {
            id: `risq_${randomUUID()}`,
            uniteId: unite.id,
            libelle: r.libelleRisque,
            description: r.description,
            gravite: r.gravite,
            probabilite: r.probabilite,
            maitrise: r.maitrise,
            criticite,
            cotationSaisie: true,
          },
        });

        nbRisquesCrees++;

        // Chaque mesure listée → Action avec statut « levee » (elle est
        // déjà en place selon la convention d'import d'un DUERP existant).
        for (const libelle of r.mesuresExistantes) {
          await tx.action.create({
            data: {
              id: `act_${randomUUID()}`,
              etablissementId,
              risqueId: risque.id,
              libelle,
              type: "organisationnelle", // défaut prudent — l'utilisateur peut retyper
              statut: "levee",
              leveeLe: new Date(),
              leveeCommentaire: "Importé depuis le DUERP initial",
            },
          });
        }
      }
    }
  });

  revalidatePath(`/etablissements/${etablissementId}`);
  revalidatePath(`/duerp/${duerpId}/risques`);
  revalidatePath(`/duerp/${duerpId}/synthese`);

  return { status: "success", duerpId, nbRisques: nbRisquesCrees };
}
