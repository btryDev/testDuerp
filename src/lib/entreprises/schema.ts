import { z } from "zod";

const siretRegex = /^\d{14}$/;
const nafRegex = /^\d{2}\.?\d{2}[A-Z]?$/;

export const entrepriseSchema = z.object({
  raisonSociale: z
    .string()
    .trim()
    .min(1, "La raison sociale est obligatoire")
    .max(200, "200 caractères maximum"),
  siret: z
    .string()
    .trim()
    .regex(siretRegex, "SIRET = 14 chiffres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  codeNaf: z
    .string()
    .trim()
    .toUpperCase()
    .regex(nafRegex, "Code NAF invalide (ex. 56.10A)"),
  effectif: z.coerce
    .number()
    .int("Effectif entier")
    .min(1, "Au moins 1 salarié"),
  adresse: z.string().trim().min(1, "L'adresse est obligatoire"),
});

export type EntrepriseInput = z.infer<typeof entrepriseSchema>;
