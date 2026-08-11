"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAction, requireVerification } from "@/lib/auth/scope";
import { estActionEnRetard } from "@/lib/dates/retard";
import {
  actionVerificationSchema,
  cloturerActionSchema,
  modifierActionSchema,
} from "./schema";
import { assertOrigineActionValide } from "./origine";

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
 *
 * Cloisonnement : `verificationId` et `actionId` viennent du client, et la
 * RLS PostgreSQL n'est pas effective (le rôle Prisma la contourne). Chaque
 * action commence donc par `requireVerification` / `requireAction`, qui
 * remontent jusqu'à `Entreprise.userId` et répondent 404 quand l'objet
 * appartient à un autre client — sans révéler qu'il existe.
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
  const { verification: verif } = await requireVerification(verificationId);

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

  // Statut initial : une action dont l'échéance est déjà passée naît « en
  // cours » plutôt qu'« ouverte ». Le prédicat vient de `lib/dates/retard`
  // (ADR-011) : comparer l'échéance à `new Date()` brut faisait basculer en
  // retard une action créée le jour même de son échéance dès 02:00 à Paris,
  // parce qu'une date civile est stockée à minuit UTC. Une échéance du jour
  // n'est jamais en retard.
  const estDepassee = estActionEnRetard(
    { statut: "ouverte", echeance: parsed.data.echeance ?? null },
    new Date(),
  );

  assertOrigineActionValide({ risqueId: null, verificationId: verif.id });
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
  const { etablissementId } = await requireAction(actionId);

  const parsed = modifierActionSchema.safeParse(patch);
  if (!parsed.success) throw new Error("Patch invalide");

  await prisma.action.update({
    where: { id: actionId },
    data: parsed.data,
  });
  revalidateAction(etablissementId);
}

export async function cloturerAction(
  actionId: string,
  _prev: ActionPlanState,
  formData: FormData,
): Promise<ActionPlanState> {
  const { action: existante } = await requireAction(actionId);

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

  if (existante.statut === "levee") {
    return { status: "error", message: "Action déjà clôturée" };
  }

  // `rapportId` vient lui aussi du formulaire : sans contrôle, une clôture
  // pouvait s'adosser au rapport d'un autre client (et le faire apparaître
  // comme justificatif dans le dossier de conformité). On exige un rapport
  // du même établissement que l'action.
  if (parsed.data.rapportId) {
    const rapport = await prisma.rapportVerification.findFirst({
      where: {
        id: parsed.data.rapportId,
        etablissementId: existante.etablissementId,
      },
      select: { id: true },
    });
    if (!rapport) {
      return { status: "error", message: "Rapport justificatif introuvable" };
    }
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
  const { etablissementId } = await requireAction(actionId);

  await prisma.action.update({
    where: { id: actionId },
    data: {
      statut: "ouverte",
      leveeLe: null,
      leveeCommentaire: null,
      leveeRapportId: null,
    },
  });
  revalidateAction(etablissementId);
}

export async function supprimerActionPlan(actionId: string): Promise<void> {
  const { etablissementId } = await requireAction(actionId);

  await prisma.action.delete({ where: { id: actionId } });
  revalidateAction(etablissementId);
}
