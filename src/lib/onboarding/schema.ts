import { z } from "zod";
import {
  CATEGORIES_ERP,
  CLASSES_IGH,
  FAMILLES_HABITATION,
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

/**
 * La borne du produit (ADR-025 § 1). Elle porte sur les **travailleurs**, et
 * sur eux seuls : le public reçu ne la déclenche jamais. Un restaurant de huit
 * salariés qui sert trois cents couverts relève de la 3ᵉ catégorie d'ERP et
 * reste dans la cible — la catégorie mesure le public, pas l'effectif.
 *
 * Exportée parce que la validation client (`components/onboarding/validation`)
 * doit poser la même borne : un refus qui n'apparaît qu'au submit fait
 * ressaisir tout le formulaire.
 */
export const EFFECTIF_MAX = 50;

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
      .max(
        EFFECTIF_MAX,
        `Rojer prend en charge les structures jusqu'à ${EFFECTIF_MAX} salariés.`,
      ),

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
    familleHabitation: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.enum(FAMILLES_HABITATION).optional(),
    ),
  })
  .superRefine((val, ctx) => {
    // Le code NAF ne conditionne plus la création (lib/onboarding/scope.ts).
    // Seul son FORMAT est exigé : un code illisible n'est rattachable à rien,
    // ni référentiel sectoriel ni écran, et c'est une erreur de saisie.
    //
    // L'absence de référentiel pour un code bien formé n'est pas une erreur
    // de formulaire : c'est un fait du produit, dit à l'écran puis porté en
    // permanence par `perimetre/couverture.ts`. Le refuser ici bloquait
    // l'accès au référentiel de conformité — qui ne lit jamais le NAF — pour
    // une cotation de risques que l'utilisateur n'avait pas demandée.
    if (evaluerScopeSecteur(val.codeNaf).status === "format_invalide") {
      ctx.addIssue({
        code: "custom",
        path: ["codeNaf"],
        message: "Le code NAF doit ressembler à 56.10A.",
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

    // Le seul cumul refusé (ADR-025 § 1) : un ERP en IGH relève du règlement
    // de sécurité des IGH, jamais dépouillé. L'IGH seul reste servi — un
    // employeur locataire d'une tour de bureaux relève du Code du travail, que
    // le produit sert entièrement, et les obligations du règlement IGH pèsent
    // sur l'exploitant de l'immeuble, pas sur lui.
    if (val.estERP && val.estIGH) {
      ctx.addIssue({
        code: "custom",
        path: ["estIGH"],
        message:
          "Un établissement recevant du public situé dans un immeuble de grande hauteur relève du règlement de sécurité des IGH, que Rojer ne couvre pas.",
      });
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

    // Famille d'habitation (ADR-025 § 4). Exigée ici — c'est une création —
    // alors que `etablissementSchema` ne l'exige pas : un dossier antérieur
    // au 2026-09-01 n'en a pas et doit rester modifiable.
    if (val.estHabitation) {
      if (!val.familleHabitation) {
        ctx.addIssue({
          code: "custom",
          path: ["familleHabitation"],
          message: "Famille d'habitation requise (1ʳᵉ, 2ᵉ, 3ᵉ A, 3ᵉ B ou 4ᵉ)",
        });
      }
    } else if (val.familleHabitation) {
      ctx.addIssue({
        code: "custom",
        path: ["familleHabitation"],
        message:
          "Ne doit être posée que si l'établissement est un immeuble d'habitation",
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
  familleHabitation: "" as string | undefined,
};
