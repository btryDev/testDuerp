import { z } from "zod";
import type { TypeAction, StatutAction } from "@prisma/client";

/**
 * Schémas Zod du plan d'actions unifié (étape 8, ADR-002).
 *
 * Portée V2 : une `Action` peut être rattachée soit à un `Risque` (mesure
 * DUERP) soit à une `Verification` (écart détecté sur un rapport).
 * Les schémas ci-dessous couvrent les parcours "depuis vérif" (création,
 * édition, clôture) — les mesures DUERP utilisent toujours `ajouterMesureCustom`
 * et `modifierMesure` dans `actions.ts` pour préserver le wizard existant.
 */

export const TYPES_ACTION = [
  "suppression",
  "reduction_source",
  "protection_collective",
  "protection_individuelle",
  "formation",
  "organisationnelle",
] as const satisfies readonly TypeAction[];

export const STATUTS_ACTION = [
  "ouverte",
  "en_cours",
  "levee",
  "abandonnee",
] as const satisfies readonly StatutAction[];

const DATE_FMT = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Schéma de création d'action depuis une vérification (écart de rapport).
 * Le type de mesure (hiérarchie L. 4121-2) est optionnel ici : la
 * hiérarchie s'impose aux mesures de prévention rattachées à un risque,
 * pas systématiquement aux actions de levée d'écart (qui peuvent être
 * simplement correctives).
 */
export const actionVerificationSchema = z.object({
  libelle: z.string().trim().min(1, "Libellé requis").max(300),
  description: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z.string().max(2000).optional(),
  ),
  type: z.enum(TYPES_ACTION),
  criticite: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(1).max(5).optional(),
  ),
  echeance: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z
      .string()
      .regex(DATE_FMT, "Format attendu : AAAA-MM-JJ")
      .optional()
      .transform((v) => (v ? new Date(v) : undefined)),
  ),
  responsable: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z.string().max(200).optional(),
  ),
});

export type ActionVerificationInput = z.infer<typeof actionVerificationSchema>;

/**
 * Schéma de clôture d'une action ouverte. Le commentaire est obligatoire
 * pour permettre une trace d'audit : on ne doit jamais fermer une action
 * sans justification.
 */
export const cloturerActionSchema = z.object({
  commentaire: z
    .string()
    .trim()
    .min(5, "Justificatif requis (minimum 5 caractères)")
    .max(2000),
  rapportId: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z.string().optional(),
  ),
});

export type CloturerActionInput = z.infer<typeof cloturerActionSchema>;

/**
 * Schéma de modification partielle — toutes les propriétés optionnelles.
 */
export const modifierActionSchema = z.object({
  statut: z.enum(STATUTS_ACTION).optional(),
  type: z.enum(TYPES_ACTION).optional(),
  criticite: z.coerce.number().int().min(1).max(5).optional().nullable(),
  echeance: z.preprocess(
    (v) => {
      if (v === undefined) return undefined;
      if (v === "" || v === null) return null;
      return v;
    },
    z
      .union([
        z.null(),
        z
          .string()
          .regex(DATE_FMT, "Format attendu : AAAA-MM-JJ")
          .transform((v) => new Date(v)),
      ])
      .optional(),
  ),
  responsable: z.string().trim().max(200).optional().nullable(),
});
