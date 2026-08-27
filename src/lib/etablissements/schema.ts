import { z } from "zod";
import { depuisCleJourCivil } from "@/lib/dates";

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
/**
 * Une date civile facultative saisie en AAAA-MM-JJ.
 *
 * `depuisCleJourCivil` ancre la date dans le fuseau de référence (ADR-011).
 * Passer par `new Date("2026-08-26")` la placerait à minuit UTC, soit la
 * veille au soir à Paris — le bug déjà rencontré sur les échéances.
 *
 * Le format est validé AVANT la conversion, et c'est ce qui compte :
 * `depuisCleJourCivil` **jette** sur une chaîne mal formée. Dans un
 * `z.preprocess`, ce throw traverse `safeParse` — qui cesse alors de rendre
 * `{ success: false }` pour propager une exception. Les deux actions serveur
 * appellent `safeParse` hors de tout try/catch : une date saisie « 26/08/2026 »
 * par un navigateur sans `type=date` natif ou par une autocomplétion faisait
 * planter l'action et perdre le formulaire entier, au lieu d'afficher « Format
 * attendu ». Le reste du dépôt valide déjà dans cet ordre (`rapports/schema.ts`,
 * `equipements/schema.ts`) ; ce champ était le seul à s'en écarter.
 */
const DATE_FMT = /^\d{4}-\d{2}-\d{2}$/;

const dateCivileOptionnelle = z
  .union([
    z.literal("").transform(() => null),
    z.null(),
    z
      .string()
      .regex(DATE_FMT, "Format attendu : AAAA-MM-JJ")
      .transform((v) => depuisCleJourCivil(v)),
  ])
  .optional();

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
    // Champ de R. 4227-34 CT (cf. schema.prisma) : personnes habituellement
    // présentes, salariés + public, et manipulation de matières R. 4227-22.
    // Optionnels : vide = « non renseigné », jamais 0 ni « non » par défaut.
    personnesPresentesHabituellement: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? null : v),
      z.coerce.number().int("Nombre entier").min(0).max(99999).nullable(),
    ),
    manipuleMatieresR422722: z.preprocess(
      (v) => (v === "oui" ? true : v === "non" ? false : v === true || v === false ? v : null),
      z.boolean().nullable(),
    ),
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

    // Renseignements de la fiche « Renseignements généraux » du registre de
    // sécurité (CCH R. 143-44). Ils vivent sur l'établissement, pas dans une
    // fiche de registre : le registre les lit, il ne les recopie pas.
    // Tous optionnels — vide = non renseigné, jamais une valeur par défaut.
    natureActivite: z.preprocess(
      (v) => (typeof v === "string" ? v.trim() || null : (v ?? null)),
      z.string().max(500).nullable(),
    ),
    // `undefined` traverse au lieu d'être coercé en `null` : c'est ce qui
    // distingue « le champ n'a pas été posté » de « l'utilisateur l'a vidé ».
    // Le premier cas arrive dès qu'on décoche ERP — le champ n'est alors plus
    // rendu — et il ne doit rien écrire. Sans ça, `normaliserFormData` avait
    // beau omettre la clé, le schéma la recréait à `null` et Prisma l'écrasait.
    effectifPublicAdmis: z
      .preprocess(
        (v) => (v === "" || v === null ? null : v),
        z.coerce
          .number()
          .int("Nombre entier")
          .min(0, "Effectif positif")
          .max(999999)
          .nullable(),
      )
      .optional(),
    // Dates civiles (ADR-011) : saisies en AAAA-MM-JJ, converties dans le
    // fuseau de référence — jamais `new Date(chaine)`, qui interpréterait en
    // UTC et décalerait la veille.
    dateAutorisationOuverture: dateCivileOptionnelle,
    dateCertificatConformite: dateCivileOptionnelle,
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
