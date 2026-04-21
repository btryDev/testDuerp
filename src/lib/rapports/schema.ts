import { z } from "zod";

/**
 * Validation du formulaire d'upload d'un rapport de vérification.
 *
 * On valide ici les métadonnées **hors fichier**. Le fichier lui-même
 * (taille + MIME) est validé séparément dans `validator.ts` car la
 * sérialisation par FormData perd les types.
 */

export const RESULTATS = [
  "conforme",
  "observations_mineures",
  "ecart_majeur",
  "non_verifiable",
] as const;

export type Resultat = (typeof RESULTATS)[number];

export const LABEL_RESULTAT: Record<Resultat, string> = {
  conforme: "Conforme",
  observations_mineures: "Observations mineures",
  ecart_majeur: "Écart majeur",
  non_verifiable: "Non vérifiable",
};

const DATE_FMT = /^\d{4}-\d{2}-\d{2}$/;

export const rapportMetadataSchema = z.object({
  dateRapport: z
    .string()
    .regex(DATE_FMT, "Format attendu : AAAA-MM-JJ")
    .transform((v) => new Date(v))
    .refine((d) => !Number.isNaN(d.getTime()), "Date invalide"),
  organismeVerif: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z.string().max(200).optional(),
  ),
  resultat: z.enum(RESULTATS),
  commentaires: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z.string().max(2000).optional(),
  ),
});

export type RapportMetadata = z.infer<typeof rapportMetadataSchema>;

/**
 * Correspondance entre résultat saisi et statut Prisma de la Verification.
 * C'est cette transition qui déclenche l'enregistrement de `dateRealisee`
 * et la régénération de la prochaine occurrence.
 */
import type { StatutVerification } from "@prisma/client";

export const STATUT_DEPUIS_RESULTAT: Record<Resultat, StatutVerification> = {
  conforme: "realisee_conforme",
  observations_mineures: "realisee_observations",
  ecart_majeur: "realisee_ecart_majeur",
  non_verifiable: "a_planifier", // à replanifier
};
