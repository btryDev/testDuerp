import { z } from "zod";
import { TypeReseauEau } from "@prisma/client";

const DATE_FMT = /^\d{4}-\d{2}-\d{2}$/;

export const TYPES_RESEAU = [
  "ECS",
  "EFS",
  "ECS_BOUCLAGE",
] as const satisfies readonly TypeReseauEau[];

export const LABEL_RESEAU: Record<TypeReseauEau, string> = {
  ECS: "Eau chaude sanitaire (ECS)",
  EFS: "Eau froide sanitaire",
  ECS_BOUCLAGE: "ECS — bouclage",
};

export const SEUIL_DEFAUT: Record<TypeReseauEau, number> = {
  ECS: 50, // au puisage (arrêté 01-02-2010)
  EFS: 20, // borne haute pour EFS, au-dessus = suspect
  ECS_BOUCLAGE: 55, // retour de boucle
};

export const pointReleveSchema = z.object({
  nom: z.string().trim().min(1, "Nom requis").max(200),
  localisation: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z.string().max(200).optional(),
  ),
  typeReseau: z.enum(TYPES_RESEAU),
  seuilMinCelsius: z.coerce.number().min(0).max(100).default(50),
});

export const releveTemperatureSchema = z.object({
  pointReleveId: z.string().min(1),
  dateReleve: z
    .string()
    .regex(DATE_FMT, "Format attendu : AAAA-MM-JJ")
    .transform((v) => new Date(v)),
  temperatureCelsius: z.coerce.number().min(0).max(100),
  operateur: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z.string().max(200).optional(),
  ),
  commentaire: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z.string().max(1000).optional(),
  ),
});

export const analyseLegionelleSchema = z.object({
  dateAnalyse: z
    .string()
    .regex(DATE_FMT, "Format attendu : AAAA-MM-JJ")
    .transform((v) => new Date(v)),
  laboratoire: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z.string().max(200).optional(),
  ),
  valeurUfcParL: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(0).max(1_000_000).optional(),
  ),
  commentaire: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z.string().max(2000).optional(),
  ),
});

export type PointReleveInput = z.infer<typeof pointReleveSchema>;
export type ReleveTemperatureInput = z.infer<typeof releveTemperatureSchema>;
export type AnalyseLegionelleInput = z.infer<typeof analyseLegionelleSchema>;

/**
 * Seuil d'action légal pour les analyses de légionelles (Legionella
 * pneumophila) — arrêté 01-02-2010 annexe II.
 */
export const SEUIL_LEGIONELLE_UFC_PAR_L = 1000;

/**
 * Vérifie si un relevé est conforme en fonction du seuil du point.
 * Pour ECS : température ≥ seuilMinCelsius (50°C au puisage par défaut).
 * Pour EFS : température ≤ seuilMinCelsius (traité comme plafond supérieur).
 */
export function estReleveConforme(
  temperatureCelsius: number,
  seuilMinCelsius: number,
  typeReseau: TypeReseauEau,
): boolean {
  if (typeReseau === "EFS") {
    return temperatureCelsius <= seuilMinCelsius;
  }
  return temperatureCelsius >= seuilMinCelsius;
}
