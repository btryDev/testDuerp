import { z } from "zod";

/**
 * Un bâtiment est un **lieu** nommé à l'intérieur d'un établissement
 * (ADR-019). Il ne porte aucun régime : rien ici ne parle d'ERP, de
 * catégorie ou d'effectif — ces champs vivent sur l'établissement.
 */

/** Nom donné par la migration et à la création d'établissement. */
export const NOM_BATIMENT_PRINCIPAL = "Bâtiment principal";

const texteOptionnel = (max: number, message: string) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(max, message).optional(),
  );

export const batimentSchema = z.object({
  nom: z
    .string({ error: "Le nom est requis" })
    .trim()
    .min(1, "Le nom est requis")
    .max(80, "80 caractères maximum"),
  // Le message est écrit, comme celui du nom : le message par défaut de Zod
  // est en anglais, et il finit sous l'œil de l'utilisateur.
  complementAdresse: texteOptionnel(200, "200 caractères maximum"),
});

export type BatimentInput = z.infer<typeof batimentSchema>;
