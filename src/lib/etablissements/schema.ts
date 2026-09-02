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

export const FAMILLES_HABITATION = [
  "PREMIERE", "DEUXIEME", "TROISIEME_A", "TROISIEME_B", "QUATRIEME",
] as const;

/**
 * La borne du produit (ADR-025 § 1). Elle porte sur les **travailleurs**, et
 * sur eux seuls : le public reçu ne la déclenche jamais. Un restaurant de huit
 * salariés qui sert trois cents couverts relève de la 3ᵉ catégorie d'ERP et
 * reste dans la cible — la catégorie mesure le public, pas l'effectif.
 *
 * Elle vit ici, au plus bas, parce que trois écrits la posent : le schéma
 * d'onboarding, celui de création d'un établissement suivant, et la validation
 * client du wizard. Elle a d'abord été déclarée dans `onboarding/schema.ts`, ce
 * qui a fabriqué un cycle d'imports — et un cycle, en Zod, ne casse pas à la
 * compilation mais à l'initialisation : `z.enum(TYPE_ERP)` recevait
 * `undefined`. Le chiffre appartient au périmètre du produit, pas à l'un de ses
 * parcours.
 */
export const EFFECTIF_MAX = 50;

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
    familleHabitation: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.enum(FAMILLES_HABITATION).optional(),
    ),
    // Locaux à sommeil pour le public (arrêté du 25 juin 1980, Livre III —
    // PE 4 § 1, PE 33, PE 35, PE 37). Trois états comme
    // `manipuleMatieresR422722`, et la même règle : vide = « pas encore
    // répondu », jamais « non ».
    //
    // `undefined` traverse au lieu d'être coercé en `null` — c'est ce qui
    // distingue « le champ n'a pas été posté » (bloc ERP replié) de
    // « l'utilisateur a remis « je ne sais pas ». Sans lui, décocher l'ERP
    // effacerait un « non » déjà donné et ferait réapparaître quatre lignes.
    comporteLocauxSommeilPublic: z.preprocess(
      (v) =>
        v === "oui"
          ? true
          : v === "non"
            ? false
            : v === true || v === false
              ? v
              : v === undefined
                ? undefined
                : null,
      z.boolean().nullable().optional(),
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

    // La famille ne se pose que sur un immeuble d'habitation. Elle n'est pas
    // EXIGÉE ici : ce schéma sert aussi à modifier un dossier existant, et les
    // dossiers d'habitation créés avant le 2026-09-01 n'en ont pas. Leur
    // interdire toute modification tant qu'ils ne l'ont pas renseignée
    // bloquerait des écrans qui n'ont rien à voir avec l'habitation.
    // L'exigence vit dans `etablissementCreationSchema`, plus bas.
    if (!val.estHabitation && val.familleHabitation) {
      ctx.addIssue({
        code: "custom",
        path: ["familleHabitation"],
        message:
          "Ne doit être posée que si l'établissement est un immeuble d'habitation",
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

/**
 * Schéma de **création** d'un établissement (ADR-025 § 4, ADR-031).
 *
 * Il ajoute ce qu'un dossier neuf doit porter et qu'un dossier ancien n'a pas
 * forcément : la famille d'habitation. La dissymétrie création / modification
 * est la forme que prend la coexistence — une règle neuve ne rend pas
 * inutilisable ce qui a été saisi avant elle, elle borne ce qui entre.
 */
export const etablissementCreationSchema = etablissementSchema.superRefine(
  (val, ctx) => {
    if (val.estHabitation && !val.familleHabitation) {
      ctx.addIssue({
        code: "custom",
        path: ["familleHabitation"],
        message:
          "Famille d'habitation requise (1ʳᵉ, 2ᵉ, 3ᵉ A, 3ᵉ B ou 4ᵉ)",
      });
    }

    // Les deux refus de périmètre (ADR-031). Ils vivent ici et non dans
    // `etablissementSchema` pour la même raison que la famille : ce schéma-là
    // sert aussi à modifier un dossier ancien, et un client qui passe de
    // quarante-cinq à soixante salariés reste servi — son dossier porte alors
    // un manque de couverture, il ne se ferme pas.
    //
    // Ils vivent ici et PAS SEULEMENT dans le wizard : depuis l'ADR-028, un
    // second établissement se crée par un autre chemin. Une règle posée sur le
    // parcours et non sur la porte se contourne en changeant de parcours.
    if (val.effectifSurSite > EFFECTIF_MAX) {
      ctx.addIssue({
        code: "custom",
        path: ["effectifSurSite"],
        message: `Rojer prend en charge les structures jusqu'à ${EFFECTIF_MAX} salariés.`,
      });
    }

    // La borne compte les TRAVAILLEURS. Le public reçu ne la déclenche jamais :
    // un restaurant de huit salariés qui sert trois cents couverts est classé
    // en 3ᵉ catégorie d'ERP et reste dans la cible.
    if (val.estERP && val.estIGH) {
      ctx.addIssue({
        code: "custom",
        path: ["estIGH"],
        message:
          "Un établissement recevant du public situé dans un immeuble de grande hauteur relève du règlement de sécurité des IGH, que Rojer ne couvre pas.",
      });
    }
  },
);
