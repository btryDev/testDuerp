import { z } from "zod";

// Enums reflétant le schéma Prisma. Si on ajoute une valeur côté Prisma,
// pensez à la refléter ici — pas d'import direct de @prisma/client pour
// garder le schéma Zod isolé (runtime Zod + typage Prisma).
export const TYPE_ERP = [
  "M", "N", "O", "L", "P", "R", "S", "T", "U", "V",
  "W", "X", "Y", "PA", "CTS", "SG", "PS", "REF", "GA", "OA", "EF",
] as const;

export const CATEGORIES_ERP = ["N1", "N2", "N3", "N4", "N5"] as const;

export const CLASSES_IGH = [
  "GHA", "GHW", "GHO", "GHR", "GHS", "GHU", "GHZ", "ITGH",
] as const;

const nafRegex = /^\d{2}\.?\d{2}[A-Z]?$/;

/**
 * Schéma de validation d'un établissement. La typologie est faite de flags
 * cumulables (ADR-004). Les précisions (typeErp, categorieErp, classeIgh)
 * ne sont requises que si le flag correspondant est vrai — on impose la
 * cohérence via un refine global.
 */
export const etablissementSchema = z
  .object({
    raisonDisplay: z
      .string()
      .trim()
      .min(1, "Le nom de l'établissement est obligatoire")
      .max(200),
    adresse: z.string().trim().min(1, "Adresse requise").max(300),
    codeNaf: z.preprocess(
      (v) =>
        typeof v === "string"
          ? v.trim().toUpperCase() || undefined
          : v,
      z
        .string()
        .regex(nafRegex, "Code NAF invalide (ex. 56.10A)")
        .optional(),
    ),
    effectifSurSite: z.coerce
      .number()
      .int("Effectif entier")
      .min(0, "Effectif positif")
      .max(9999),
    estEtablissementTravail: z.coerce.boolean().default(true),
    estERP: z.coerce.boolean().default(false),
    estIGH: z.coerce.boolean().default(false),
    estHabitation: z.coerce.boolean().default(false),
    typeErp: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.enum(TYPE_ERP).optional(),
    ),
    categorieErp: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.enum(CATEGORIES_ERP).optional(),
    ),
    classeIgh: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.enum(CLASSES_IGH).optional(),
    ),
  })
  .superRefine((val, ctx) => {
    // Règle ADR-004 : les précisions sont alignées sur les flags.
    if (val.estERP) {
      if (!val.typeErp) {
        ctx.addIssue({
          code: "custom",
          path: ["typeErp"],
          message: "Type ERP requis dès lors que l'établissement est ERP",
        });
      }
      if (!val.categorieErp) {
        ctx.addIssue({
          code: "custom",
          path: ["categorieErp"],
          message: "Catégorie ERP requise (1 à 5)",
        });
      }
    } else {
      // Si pas ERP, ni typeErp ni categorieErp ne doivent être posés
      if (val.typeErp) {
        ctx.addIssue({
          code: "custom",
          path: ["typeErp"],
          message: "Ne doit être posé que si l'établissement est ERP",
        });
      }
      if (val.categorieErp) {
        ctx.addIssue({
          code: "custom",
          path: ["categorieErp"],
          message: "Ne doit être posée que si l'établissement est ERP",
        });
      }
    }

    if (val.estIGH) {
      if (!val.classeIgh) {
        ctx.addIssue({
          code: "custom",
          path: ["classeIgh"],
          message: "Classe IGH requise (GHA à ITGH)",
        });
      }
    } else if (val.classeIgh) {
      ctx.addIssue({
        code: "custom",
        path: ["classeIgh"],
        message: "Ne doit être posée que si l'établissement est IGH",
      });
    }

    // Un établissement doit relever d'au moins un régime ; si tout est à
    // false, on retombe implicitement sur « travail classique ».
    const aucunRegime =
      !val.estEtablissementTravail &&
      !val.estERP &&
      !val.estIGH &&
      !val.estHabitation;
    if (aucunRegime) {
      ctx.addIssue({
        code: "custom",
        path: ["estEtablissementTravail"],
        message:
          "Cochez au moins un régime : travail, ERP, IGH ou habitation.",
      });
    }
  });

export type EtablissementInput = z.infer<typeof etablissementSchema>;
