import { z } from "zod";
import { PrioriteIntervention, StatutIntervention } from "@prisma/client";

export const PRIORITES = [
  "basse",
  "moyenne",
  "urgente",
  "bloquante",
] as const satisfies readonly PrioriteIntervention[];

export const STATUTS = [
  "ouvert",
  "assigne",
  "en_cours",
  "fait",
  "annule",
] as const satisfies readonly StatutIntervention[];

export const LABEL_PRIORITE: Record<PrioriteIntervention, string> = {
  basse: "Basse",
  moyenne: "Moyenne",
  urgente: "Urgente",
  bloquante: "Bloquante",
};

export const LABEL_STATUT: Record<StatutIntervention, string> = {
  ouvert: "À traiter",
  assigne: "Assigné",
  en_cours: "En cours",
  fait: "Fait",
  annule: "Annulé",
};

export const COULEUR_PRIORITE: Record<PrioriteIntervention, string> = {
  basse: "var(--seal)",
  moyenne: "var(--warm)",
  urgente: "oklch(0.72 0.15 70)",
  bloquante: "var(--minium)",
};

export const interventionSchema = z.object({
  titre: z.string().trim().min(3, "Titre trop court").max(200),
  description: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z.string().max(4000).optional(),
  ),
  priorite: z.enum(PRIORITES).default("moyenne"),
  localisation: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z.string().max(200).optional(),
  ),
  assigneA: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z.string().max(200).optional(),
  ),
  echeance: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format AAAA-MM-JJ")
      .optional()
      .transform((v) => (v ? new Date(v) : undefined)),
  ),
  risqueId: z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? v : undefined),
    z.string().optional(),
  ),
});

export type InterventionInput = z.infer<typeof interventionSchema>;

export const commentaireSchema = z.object({
  auteurNom: z.string().trim().min(1).max(200),
  contenu: z.string().trim().min(1).max(2000),
});
