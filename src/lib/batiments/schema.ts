import { z } from "zod";

/**
 * Une **zone** est un lieu nommé à l'intérieur d'un établissement (ADR-029,
 * qui remplace l'ADR-019 en gardant son invariant). Elle ne porte aucun
 * régime : rien ici ne parle d'ERP, de catégorie ou d'effectif — ces champs
 * vivent sur l'établissement.
 *
 * Le modèle s'appelle toujours `Batiment` en base, et les identifiants de
 * code avec lui : la zone *est* le bâtiment de l'ADR-019, renommer la table
 * n'aurait produit qu'une migration et quatre clés étrangères à déplacer.
 * Seul ce que lit l'utilisateur dit « zone ».
 */

/**
 * Trois zones au plus par établissement (ADR-029). La borne vit dans
 * `creerBatiment` et non dans une contrainte de base : elle vaut à l'ajout.
 * Les dossiers qui portent déjà davantage de lieux les gardent — on ne
 * fusionne ni ne détruit une donnée pour la faire entrer dans une règle
 * postérieure à elle.
 */
export const MAX_ZONES = 3;

/** Nom semé à la création d'un établissement. Les dossiers existants gardent
 *  le leur : le nom est libre et affiché tel quel, le migrer ne ferait que
 *  déplacer une chaîne sous une contrainte d'unicité, pour rien (ADR-029). */
export const NOM_BATIMENT_PRINCIPAL = "Zone principale";

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
