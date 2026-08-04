import { z } from "zod";
import { CATEGORIES_EQUIPEMENT } from "@/lib/referentiels/types-communs";

/**
 * Schéma de validation d'un équipement. Les propriétés spécifiques à une
 * catégorie (p. ex. `aGroupeElectrogene` pour une installation électrique)
 * sont toutes optionnelles au niveau Zod — leur cohérence catégorielle est
 * imposée par `superRefine` pour éviter qu'une hotte déclare un nombre de
 * véhicules de parking.
 *
 * Les propriétés qui alimentent les conditions d'obligations du référentiel
 * V2 (cf. `src/lib/referentiels/conformite/`) sont :
 *   - `aGroupeElectrogene`     → obligation ERP EL 20
 *   - `estLocalPollutionSpecifique` → obligation travail (arrêté 08-10-1987 art. 3 § II)
 *   - `nbVehiculesParkingCouvert`   → obligation ERP PS 32 (biennale ou annuelle)
 */

const DATE_FMT = /^\d{4}-\d{2}-\d{2}$/;

export { CATEGORIES_EQUIPEMENT };
export type { CategorieEquipement } from "@/lib/referentiels/types-communs";

export const equipementSchema = z
  .object({
    libelle: z
      .string()
      .trim()
      .min(1, "Libellé requis")
      .max(200, "Libellé trop long"),
    categorie: z.enum(CATEGORIES_EQUIPEMENT),
    localisation: z.preprocess(
      (v) => (typeof v === "string" ? v.trim() || undefined : v),
      z.string().max(200).optional(),
    ),
    dateMiseEnService: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z
        .string()
        .regex(DATE_FMT, "Format attendu : AAAA-MM-JJ")
        .optional()
        .transform((v) => (v ? new Date(v) : undefined)),
    ),
    nombre: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().int().min(1).max(9999).optional(),
    ),
    aGroupeElectrogene: z.coerce.boolean().optional(),
    estLocalPollutionSpecifique: z.coerce.boolean().optional(),
    nbVehiculesParkingCouvert: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().int().min(0).max(99999).optional(),
    ),
    notes: z.preprocess(
      (v) => (typeof v === "string" ? v.trim() || undefined : v),
      z.string().max(1000).optional(),
    ),
  })
  .superRefine((val, ctx) => {
    // Cohérence catégorie ↔ propriétés : une propriété spécifique ne doit
    // pas être positionnée pour une catégorie incompatible.
    if (
      val.aGroupeElectrogene !== undefined &&
      val.aGroupeElectrogene &&
      val.categorie !== "INSTALLATION_ELECTRIQUE"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["aGroupeElectrogene"],
        message: "Spécifique aux installations électriques",
      });
    }

    const categoriesPollutionOk: readonly (typeof val.categorie)[] = [
      "VMC",
      "CTA",
      "HOTTE_PRO",
    ] as const;
    if (
      val.estLocalPollutionSpecifique &&
      !categoriesPollutionOk.includes(val.categorie)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["estLocalPollutionSpecifique"],
        message: "Spécifique aux équipements d'aération",
      });
    }

    if (
      val.nbVehiculesParkingCouvert !== undefined &&
      val.categorie !== "VMC"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["nbVehiculesParkingCouvert"],
        message: "Applicable uniquement à une VMC de parking couvert",
      });
    }
  });

export type EquipementInput = z.infer<typeof equipementSchema>;

/**
 * Construit la valeur sérialisable en `Json` de `caracteristiques` à partir
 * des champs Zod. Ne stocke que les clés effectivement renseignées pour
 * éviter des JSON volumineux.
 */
export function serialiserCaracteristiques(
  val: EquipementInput,
): Record<string, unknown> | null {
  const out: Record<string, unknown> = {};
  if (val.nombre !== undefined) out.nombre = val.nombre;
  if (val.aGroupeElectrogene !== undefined)
    out.aGroupeElectrogene = val.aGroupeElectrogene;
  if (val.estLocalPollutionSpecifique !== undefined)
    out.estLocalPollutionSpecifique = val.estLocalPollutionSpecifique;
  if (val.nbVehiculesParkingCouvert !== undefined)
    out.nbVehiculesParkingCouvert = val.nbVehiculesParkingCouvert;
  if (val.notes !== undefined) out.notes = val.notes;
  return Object.keys(out).length === 0 ? null : out;
}
