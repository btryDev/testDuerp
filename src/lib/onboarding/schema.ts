import { z } from "zod";
import {
  CATEGORIES_ERP,
  CLASSES_IGH,
  TYPE_ERP,
} from "@/lib/etablissements/schema";
import { evaluerScopeSecteur } from "./scope";

/**
 * Schéma fusionné du parcours d'onboarding — couvre Entreprise + premier
 * Etablissement en une seule validation.
 *
 * Les champs sont mutualisés : adresse / codeNaf / effectif sont saisis
 * UNE fois et copiés dans les deux entités côté server action.
 *
 * Les règles de cohérence flags ↔ précisions (ADR-004) sont recyclées
 * ici depuis `etablissements/schema.ts` — pas de duplication.
 */

const siretRegex = /^\d{14}$/;
const nafRegex = /^\d{2}\.?\d{2}[A-Z]?$/;
// Adresse recomposée côté client : "12 rue des Halles, 44000 Nantes".
// On revalide ici la forme finale pour détecter un client-side bypass.
const adresseRegex = /^.{3,},\s*\d{5}\s.{2,}$/;

export const onboardingSchema = z
  .object({
    // ─── Étape 1 — Identité juridique + lieu ──────────────
    raisonSociale: z
      .string()
      .trim()
      .min(1, "La raison sociale est obligatoire")
      .max(200, "200 caractères maximum"),
    siret: z.preprocess(
      (v) =>
        typeof v === "string" ? v.trim() || undefined : v,
      z
        .string()
        .regex(siretRegex, "SIRET = 14 chiffres")
        .optional(),
    ),
    adresse: z
      .string()
      .trim()
      .regex(
        adresseRegex,
        "Adresse attendue au format « Rue, 75000 Ville »",
      )
      .max(300),
    codeNaf: z
      .string()
      .trim()
      .toUpperCase()
      .regex(nafRegex, "Code NAF invalide (ex. 56.10A)"),
    effectifSurSite: z.coerce
      .number()
      .int("Effectif entier")
      .min(1, "Au moins 1 salarié")
      .max(9999),

    // ─── Étape 3 — Typologie (ADR-004, flags cumulables) ────
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
    // Filtrage du périmètre V2 (lib/onboarding/scope.ts) : le code NAF
    // doit correspondre à un des 3 secteurs couverts (restauration,
    // commerce, tertiaire). Refuser sinon : le DUERP produit ne serait
    // pas fiable.
    const scope = evaluerScopeSecteur(val.codeNaf);
    if (scope.status === "hors_perimetre") {
      ctx.addIssue({
        code: "custom",
        path: ["codeNaf"],
        message: scope.raison,
      });
    }

    // Mêmes invariants que etablissementSchema (ADR-004).
    if (val.estERP) {
      if (!val.typeErp) {
        ctx.addIssue({
          code: "custom",
          path: ["typeErp"],
          message: "Type ERP requis si l'établissement accueille du public",
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

export type OnboardingInput = z.infer<typeof onboardingSchema>;

/**
 * Valeurs par défaut d'un wizard vide. Utilisé comme état initial
 * côté client (WizardShell).
 */
export const onboardingValeursInitiales = {
  raisonSociale: "",
  siret: "",
  adresse: "",
  codeNaf: "",
  effectifSurSite: "" as string | number,
  estEtablissementTravail: true,
  estERP: false,
  estIGH: false,
  estHabitation: false,
  typeErp: "" as string | undefined,
  categorieErp: "" as string | undefined,
  classeIgh: "" as string | undefined,
};
