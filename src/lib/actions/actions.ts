"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { tousRisquesConnus } from "@/lib/referentiels";
import type { TypeMesure } from "@/lib/referentiels/types";
import { statutUIVersAction } from "./mapping";

/**
 * Server actions pour l'entité `Action` — unifiée DUERP + vérifications
 * (cf. ADR-002). Ce module remplace l'ancien `lib/mesures/actions.ts`.
 * Les libellés UI « mesure » sont préservés dans le wizard DUERP : une
 * `Action` dont `risqueId` est non-null est sémantiquement une mesure de
 * prévention au sens L. 4121-2.
 */

const TYPES_ACTION = [
  "suppression",
  "reduction_source",
  "protection_collective",
  "protection_individuelle",
  "formation",
  "organisationnelle",
] as const;

// Statuts possibles pour une action (nouveau vocabulaire V2).
// Les anciens `existante` / `prevue` du wizard DUERP sont mappés :
//   existante  → levee
//   prevue     → ouverte (ou en_cours si échéance passée)
const STATUTS_ACTION = ["ouverte", "en_cours", "levee", "abandonnee"] as const;

// Alias DUERP : le wizard continue d'exposer `statut: existante | prevue`.
// La conversion se fait ici pour préserver la compatibilité avec les
// composants existants tant que l'UI n'est pas refondue (étape 8 du plan).
const STATUTS_DUERP = ["existante", "prevue"] as const;

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

async function resoudreEtablissementViaRisque(
  risqueId: string,
): Promise<string> {
  const r = await prisma.risque.findUnique({
    where: { id: risqueId },
    include: { unite: { include: { duerp: true } } },
  });
  if (!r) throw new Error("Risque introuvable");
  return r.unite.duerp.etablissementId;
}

export async function toggleMesureReferentiel(
  risqueId: string,
  referentielMesureId: string,
): Promise<void> {
  const risque = await prisma.risque.findUnique({ where: { id: risqueId } });
  if (!risque) throw new Error("Risque introuvable");

  const existant = await prisma.action.findUnique({
    where: {
      risqueId_referentielMesureId: { risqueId, referentielMesureId },
    },
  });

  if (existant) {
    await prisma.action.delete({ where: { id: existant.id } });
  } else {
    if (!risque.referentielId) {
      throw new Error("Risque personnalisé : pas de mesure référentielle");
    }
    const ref = tousRisquesConnus().get(risque.referentielId);
    const mesureRef = ref?.mesuresRecommandees.find(
      (m) => m.id === referentielMesureId,
    );
    if (!mesureRef) throw new Error("Mesure référentielle inconnue");

    const etablissementId = await resoudreEtablissementViaRisque(risqueId);
    await prisma.action.create({
      data: {
        etablissementId,
        risqueId,
        referentielMesureId,
        libelle: mesureRef.libelle,
        type: mesureRef.type,
        statut: "levee", // "existante" côté UI = mesure déjà en place
        leveeLe: new Date(),
      },
    });
  }

  await revalidateMesure(risqueId);
}

const mesureCustomSchema = z.object({
  libelle: z.string().trim().min(1, "Libellé requis").max(300),
  type: z.enum(TYPES_ACTION),
  statut: z.enum(STATUTS_DUERP),
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

  const etablissementId = await resoudreEtablissementViaRisque(risqueId);
  const statutAction = statutUIVersAction(
    parsed.data.statut,
    parsed.data.echeance ?? null,
  );

  await prisma.action.create({
    data: {
      etablissementId,
      risqueId,
      libelle: parsed.data.libelle,
      type: parsed.data.type,
      statut: statutAction,
      echeance: parsed.data.echeance,
      responsable: parsed.data.responsable,
      leveeLe: statutAction === "levee" ? new Date() : null,
    },
  });

  await revalidateMesure(risqueId);
  return { status: "success" };
}

const patchSchema = z.object({
  statut: z.enum(STATUTS_DUERP).optional(),
  type: z.enum(TYPES_ACTION).optional(),
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

  const { statut: statutDuerp, ...rest } = parsed.data;
  const data: Parameters<typeof prisma.action.update>[0]["data"] = { ...rest };
  if (statutDuerp !== undefined) {
    const actuelle = await prisma.action.findUnique({
      where: { id: mesureId },
    });
    if (!actuelle) throw new Error("Action introuvable");
    const echeanceEff =
      rest.echeance !== undefined ? rest.echeance : actuelle.echeance;
    const nouveau = statutUIVersAction(statutDuerp, echeanceEff);
    data.statut = nouveau;
    data.leveeLe = nouveau === "levee" ? actuelle.leveeLe ?? new Date() : null;
  }

  const m = await prisma.action.update({
    where: { id: mesureId },
    data,
  });
  if (m.risqueId) await revalidateMesure(m.risqueId);
}

export async function supprimerMesure(mesureId: string): Promise<void> {
  const m = await prisma.action.delete({ where: { id: mesureId } });
  if (m.risqueId) await revalidateMesure(m.risqueId);
}

export type { TypeMesure };
