import { depuisCleJourCivil } from "@/lib/dates";
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
    .transform((v) => depuisCleJourCivil(v))
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
 *
 * ⚠ Trois résultats seulement. « Non vérifiable » n'y figure pas, et ce n'est
 * pas un oubli : la vérification **n'a pas eu lieu**. L'ancienne table la
 * mappait sur `a_planifier`, et `lib/rapports/actions.ts` écrivait ce statut
 * *avec* une `dateRealisee` — la vérification passait donc pour réalisée alors
 * que rien n'avait été contrôlé, et la prochaine échéance était repoussée
 * d'une période entière à compter de la date du rapport. Deux mensonges pour
 * un contrôle qui n'a pas pu se faire.
 *
 * Le traitement de « non vérifiable » est donc explicite côté action :
 * le rapport est conservé (c'est une pièce, le prestataire s'est déplacé),
 * `dateRealisee` n'est pas écrite, et l'échéance ne bouge pas.
 */
import type { StatutVerification } from "@prisma/client";

/** Résultats qui valent réalisation du contrôle. */
export const RESULTATS_REALISES = [
  "conforme",
  "observations_mineures",
  "ecart_majeur",
] as const;

export type ResultatRealise = (typeof RESULTATS_REALISES)[number];

export function estResultatRealise(r: Resultat): r is ResultatRealise {
  return (RESULTATS_REALISES as readonly string[]).includes(r);
}

export const STATUT_DEPUIS_RESULTAT: Record<
  ResultatRealise,
  StatutVerification
> = {
  conforme: "realisee_conforme",
  observations_mineures: "realisee_observations",
  ecart_majeur: "realisee_ecart_majeur",
};
