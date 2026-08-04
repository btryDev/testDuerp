"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  actionVerificationSchema,
  cloturerActionSchema,
  modifierActionSchema,
} from "./schema";

/**
 * Server actions du plan d'actions unifié (étape 8).
 *
 * Ces actions complètent `src/lib/actions/actions.ts` (qui gère les
 * mesures DUERP via le wizard) en couvrant les parcours :
 *   - création d'une action corrective depuis une vérification (écart)
 *   - modification d'une action (statut, échéance, responsable, type)
 *   - clôture d'une action avec justificatif obligatoire
 *   - suppression
 *
 * Les actions DUERP existantes (rattachées à un `Risque`) restent éditables
 * via le wizard pour ne pas casser l'UX existante ; la vue unifiée en
 * lecture les affiche sans spécificité.
 */

export type ActionPlanState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    }
  | { status: "success"; actionId: string };

function revalidateAction(etablissementId: string): void {
  revalidatePath(`/etablissements/${etablissementId}`);
  revalidatePath(`/etablissements/${etablissementId}/actions`);
  revalidatePath(`/etablissements/${etablissementId}/calendrier`);
}

export async function creerActionDepuisVerification(
  verificationId: string,
  _prev: ActionPlanState,
  formData: FormData,
): Promise<ActionPlanState> {
  const parsed = actionVerificationSchema.safeParse({
    libelle: formData.get("libelle"),
    description: formData.get("description"),
    type: formData.get("type"),
    criticite: formData.get("criticite"),
    echeance: formData.get("echeance"),
    responsable: formData.get("responsable"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const verif = await prisma.verification.findUnique({
    where: { id: verificationId },
    select: { id: true, etablissementId: true },
  });
  if (!verif) {
    return { status: "error", message: "Vérification introuvable" };
  }

  const now = new Date();
  const estDepassee =
    parsed.data.echeance && parsed.data.echeance.getTime() < now.getTime();

  const a = await prisma.action.create({
    data: {
      etablissementId: verif.etablissementId,
      verificationId: verif.id,
      libelle: parsed.data.libelle,
      description: parsed.data.description,
      type: parsed.data.type,
      criticite: parsed.data.criticite,
      echeance: parsed.data.echeance,
      responsable: parsed.data.responsable,
      statut: estDepassee ? "en_cours" : "ouverte",
    },
  });

  revalidateAction(verif.etablissementId);
  revalidatePath(
    `/etablissements/${verif.etablissementId}/verifications/${verif.id}`,
  );
  return { status: "success", actionId: a.id };
}

export async function modifierActionPlan(
  actionId: string,
  patch: Parameters<typeof modifierActionSchema.safeParse>[0],
): Promise<void> {
  const parsed = modifierActionSchema.safeParse(patch);
  if (!parsed.success) throw new Error("Patch invalide");

  const a = await prisma.action.update({
    where: { id: actionId },
    data: parsed.data,
  });
  revalidateAction(a.etablissementId);
}

export async function cloturerAction(
  actionId: string,
  _prev: ActionPlanState,
  formData: FormData,
): Promise<ActionPlanState> {
  const parsed = cloturerActionSchema.safeParse({
    commentaire: formData.get("commentaire"),
    rapportId: formData.get("rapportId"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existante = await prisma.action.findUnique({
    where: { id: actionId },
    select: { id: true, etablissementId: true, statut: true },
  });
  if (!existante) {
    return { status: "error", message: "Action introuvable" };
  }
  if (existante.statut === "levee") {
    return { status: "error", message: "Action déjà clôturée" };
  }

  await prisma.action.update({
    where: { id: actionId },
    data: {
      statut: "levee",
      leveeLe: new Date(),
      leveeCommentaire: parsed.data.commentaire,
      leveeRapportId: parsed.data.rapportId,
    },
  });

  revalidateAction(existante.etablissementId);
  revalidatePath(`/etablissements/${existante.etablissementId}/actions/${actionId}`);
  return { status: "success", actionId };
}

export async function rouvrirAction(actionId: string): Promise<void> {
  const a = await prisma.action.update({
    where: { id: actionId },
    data: {
      statut: "ouverte",
      leveeLe: null,
      leveeCommentaire: null,
      leveeRapportId: null,
    },
  });
  revalidateAction(a.etablissementId);
}

export async function supprimerActionPlan(actionId: string): Promise<void> {
  const a = await prisma.action.delete({ where: { id: actionId } });
  revalidateAction(a.etablissementId);
}
