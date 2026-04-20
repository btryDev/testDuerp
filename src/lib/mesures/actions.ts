"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { tousRisquesConnus } from "@/lib/referentiels";
import type { TypeMesure } from "@/lib/referentiels/types";

const TYPES_MESURE = [
  "suppression",
  "reduction_source",
  "protection_collective",
  "protection_individuelle",
  "formation",
  "organisationnelle",
] as const;

const STATUTS = ["existante", "prevue"] as const;

export type MesureActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success" };

async function revalidateMesure(risqueId: string) {
  const r = await prisma.risque.findUnique({
    where: { id: risqueId },
    include: { unite: true },
  });
  if (!r) return;
  revalidatePath(
    `/duerp/${r.unite.duerpId}/risques/${r.uniteId}/${risqueId}/mesures`,
  );
  revalidatePath(`/duerp/${r.unite.duerpId}/risques/${r.uniteId}`);
}

export async function toggleMesureReferentiel(
  risqueId: string,
  referentielMesureId: string,
): Promise<void> {
  const risque = await prisma.risque.findUnique({
    where: { id: risqueId },
  });
  if (!risque) throw new Error("Risque introuvable");

  const existant = await prisma.mesure.findUnique({
    where: {
      risqueId_referentielMesureId: { risqueId, referentielMesureId },
    },
  });

  if (existant) {
    await prisma.mesure.delete({ where: { id: existant.id } });
  } else {
    if (!risque.referentielId) {
      throw new Error("Risque personnalisé : pas de mesure référentielle");
    }
    const ref = tousRisquesConnus().get(risque.referentielId);
    const mesureRef = ref?.mesuresRecommandees.find(
      (m) => m.id === referentielMesureId,
    );
    if (!mesureRef) throw new Error("Mesure référentielle inconnue");

    await prisma.mesure.create({
      data: {
        risqueId,
        referentielMesureId,
        libelle: mesureRef.libelle,
        type: mesureRef.type,
        statut: "existante",
      },
    });
  }

  await revalidateMesure(risqueId);
}

const mesureCustomSchema = z.object({
  libelle: z.string().trim().min(1, "Libellé requis").max(300),
  type: z.enum(TYPES_MESURE),
  statut: z.enum(STATUTS),
  echeance: z
    .string()
    .trim()
    .optional()
    .or(z.literal("").transform(() => undefined))
    .transform((v) => (v ? new Date(v) : undefined)),
  responsable: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export async function ajouterMesureCustom(
  risqueId: string,
  _prev: MesureActionState,
  formData: FormData,
): Promise<MesureActionState> {
  const parsed = mesureCustomSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.mesure.create({
    data: {
      risqueId,
      libelle: parsed.data.libelle,
      type: parsed.data.type,
      statut: parsed.data.statut,
      echeance: parsed.data.echeance,
      responsable: parsed.data.responsable,
    },
  });

  await revalidateMesure(risqueId);
  return { status: "success" };
}

const patchSchema = z.object({
  statut: z.enum(STATUTS).optional(),
  type: z.enum(TYPES_MESURE).optional(),
  echeance: z
    .string()
    .optional()
    .or(z.literal("").transform(() => null))
    .transform((v) =>
      v === undefined ? undefined : v === null ? null : new Date(v),
    ),
  responsable: z.string().trim().max(200).optional().nullable(),
});

export async function modifierMesure(
  mesureId: string,
  patch: z.input<typeof patchSchema>,
): Promise<void> {
  const parsed = patchSchema.safeParse(patch);
  if (!parsed.success) throw new Error("Patch invalide");

  const m = await prisma.mesure.update({
    where: { id: mesureId },
    data: parsed.data,
  });
  await revalidateMesure(m.risqueId);
}

export async function supprimerMesure(mesureId: string): Promise<void> {
  const m = await prisma.mesure.delete({ where: { id: mesureId } });
  await revalidateMesure(m.risqueId);
}

export type { TypeMesure };
