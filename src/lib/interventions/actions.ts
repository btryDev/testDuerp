"use server";

import { randomUUID } from "node:crypto";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertEtablissementOwnership } from "@/lib/auth/scope";
import { requireUser } from "@/lib/auth/require-user";
import { getStorage } from "@/lib/storage";
import { validerFichier } from "@/lib/rapports/validator";
import {
  commentaireSchema,
  interventionSchema,
  PRIORITES,
  STATUTS,
} from "./schema";
import {
  PrioriteIntervention,
  StatutIntervention,
} from "@prisma/client";
import { nextNumeroIntervention } from "./queries";

export type InterventionActionState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    }
  | { status: "success"; interventionId: string; numero: number };

function clePhoto(
  etablissementId: string,
  interventionId: string,
  nomFichier: string,
): string {
  const ext = path.extname(nomFichier).slice(0, 10).replace(/[^a-zA-Z0-9.]/g, "");
  return `interventions/${etablissementId}/${interventionId}/${Date.now()}-${randomUUID().slice(0, 8)}${ext || ".bin"}`;
}

export async function creerIntervention(
  etablissementId: string,
  _prev: InterventionActionState,
  formData: FormData,
): Promise<InterventionActionState> {
  const user = await requireUser();
  await assertEtablissementOwnership(etablissementId);

  const parsed = interventionSchema.safeParse({
    titre: formData.get("titre"),
    description: formData.get("description"),
    priorite: formData.get("priorite"),
    localisation: formData.get("localisation"),
    assigneA: formData.get("assigneA"),
    echeance: formData.get("echeance"),
    risqueId: formData.get("risqueId"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const numero = await nextNumeroIntervention(etablissementId);
  const id = `itv_${randomUUID()}`;

  // Upload des photos (multi, optionnel)
  const storage = getStorage();
  const cles: string[] = [];
  const fichiers = formData.getAll("photos");
  for (const f of fichiers) {
    if (!(f instanceof File) || f.size === 0) continue;
    const val = validerFichier(f);
    if (!val.ok) {
      // Nettoyage de ce qui a déjà été uploadé
      await Promise.all(cles.map((c) => storage.delete(c).catch(() => {})));
      return {
        status: "error",
        message: `Photo rejetée : ${val.erreur}`,
      };
    }
    const cle = clePhoto(etablissementId, id, f.name);
    const buffer = Buffer.from(await f.arrayBuffer());
    await storage.put(cle, buffer, val.mime);
    cles.push(cle);
  }

  try {
    await prisma.intervention.create({
      data: {
        id,
        etablissementId,
        numero,
        titre: parsed.data.titre,
        description: parsed.data.description,
        photos: cles,
        priorite: parsed.data.priorite,
        statut: parsed.data.assigneA ? "assigne" : "ouvert",
        localisation: parsed.data.localisation,
        assigneA: parsed.data.assigneA,
        echeance: parsed.data.echeance,
        risqueId: parsed.data.risqueId,
        creeParUserId: user.id,
      },
    });
  } catch (e) {
    await Promise.all(cles.map((c) => storage.delete(c).catch(() => {})));
    throw e;
  }

  revalidatePath(`/etablissements/${etablissementId}/interventions`);
  return { status: "success", interventionId: id, numero };
}

export async function changerStatutIntervention(
  etablissementId: string,
  interventionId: string,
  statut: StatutIntervention,
): Promise<void> {
  if (!(STATUTS as readonly string[]).includes(statut)) return;
  await assertEtablissementOwnership(etablissementId);
  const data: {
    statut: StatutIntervention;
    dateCloture?: Date | null;
  } = { statut };
  if (statut === "fait" || statut === "annule") {
    data.dateCloture = new Date();
  } else {
    data.dateCloture = null;
  }
  await prisma.intervention.update({
    where: { id: interventionId },
    data,
  });
  revalidatePath(`/etablissements/${etablissementId}/interventions`);
  revalidatePath(
    `/etablissements/${etablissementId}/interventions/${interventionId}`,
  );
}

export async function changerPrioriteIntervention(
  etablissementId: string,
  interventionId: string,
  priorite: PrioriteIntervention,
): Promise<void> {
  if (!(PRIORITES as readonly string[]).includes(priorite)) return;
  await assertEtablissementOwnership(etablissementId);
  await prisma.intervention.update({
    where: { id: interventionId },
    data: { priorite },
  });
  revalidatePath(
    `/etablissements/${etablissementId}/interventions/${interventionId}`,
  );
}

export async function ajouterCommentaire(
  etablissementId: string,
  interventionId: string,
  _prev: InterventionActionState,
  formData: FormData,
): Promise<InterventionActionState> {
  await assertEtablissementOwnership(etablissementId);
  const parsed = commentaireSchema.safeParse({
    auteurNom: formData.get("auteurNom"),
    contenu: formData.get("contenu"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Commentaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  await prisma.commentaireIntervention.create({
    data: {
      id: `cmt_${randomUUID()}`,
      interventionId,
      auteurNom: parsed.data.auteurNom,
      contenu: parsed.data.contenu,
    },
  });
  revalidatePath(
    `/etablissements/${etablissementId}/interventions/${interventionId}`,
  );
  return { status: "success", interventionId, numero: 0 };
}

/**
 * Clôture avec option de demander une réévaluation du risque DUERP lié.
 * Quand l'utilisateur coche « réévaluer », on met `Risque.cotationSaisie = false`
 * pour inviter visuellement à refaire la cotation dans le wizard DUERP.
 */
export async function cloturerIntervention(
  etablissementId: string,
  interventionId: string,
  motif: string,
  reevaluerRisque: boolean,
): Promise<void> {
  await assertEtablissementOwnership(etablissementId);
  const intervention = await prisma.intervention.findUnique({
    where: { id: interventionId },
    select: { risqueId: true },
  });
  await prisma.intervention.update({
    where: { id: interventionId },
    data: {
      statut: "fait",
      dateCloture: new Date(),
      motifCloture: motif,
    },
  });
  if (reevaluerRisque && intervention?.risqueId) {
    await prisma.risque.update({
      where: { id: intervention.risqueId },
      data: { cotationSaisie: false },
    });
  }
  revalidatePath(`/etablissements/${etablissementId}/interventions`);
  revalidatePath(
    `/etablissements/${etablissementId}/interventions/${interventionId}`,
  );
}
