import { depuisCleJourCivil } from "@/lib/dates";
import { z } from "zod";
import { CATEGORIES_EQUIPEMENT } from "@/lib/referentiels/types-communs";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";
import { FAMILLES_ESP } from "./esp";

/**
 * Schéma de validation d'un équipement. Les propriétés spécifiques à une
 * catégorie (p. ex. `aGroupeElectrogene` pour une installation électrique)
 * sont toutes optionnelles au niveau Zod — leur cohérence catégorielle est
 * imposée par `superRefine` pour éviter qu'une hotte déclare un nombre de
 * véhicules de parking.
 *
 * Les propriétés qui alimentent les conditions d'obligations du référentiel
 * (cf. `src/lib/referentiels/conformite/`) sont :
 *   - `aGroupeElectrogene`          → ERP, art. EL 20
 *   - `estLocalPollutionSpecifique` → travail, arrêté 08-10-1987 art. 4 § 2
 *   - `aSystemeDeRecyclage`         → travail, arrêté 08-10-1987 art. 4 b)
 *     (contrôle semestriel des gaines de recyclage, en SUS de l'annuel)
 *   - `nbVehiculesParkingCouvert`   → ERP, art. PS 32 (biennale ou annuelle)
 *   - `estVmcGaz`                   → habitation, arrêté 25-04-1985
 *   - `aRobinetsIncendieArmes`      → ERP, vérification annuelle des RIA
 *   - `aExtinctionAutomatique`      → ERP, extinction automatique en cuisine
 *   - `sertAuLevageDePersonnes`     → travail, VGP semestrielle (arrêté 02-03-2004)
 *   - `estChariotOuGerbeur`         → travail, VGP semestrielle (arrêté 01-03-2004, art. 20-II et 23)
 *   - `estMuParForceHumaine`        → travail, VGP trimestrielle (arrêté 01-03-2004, art. 23 b)
 *   - `aAccessoiresDeLevage`        → travail, vérification des accessoires
 *   - `estSoumisSuiviEnService`     → arrêté du 20 novembre 2017 (ESP)
 *   - `estChargeSousSeuilControle` → règlement (UE) 2024/573, art. 5 et
 *     code de l'environnement, art. R. 543-79 al. 1 (seuil de déclenchement :
 *     sous lui, aucun contrôle d'étanchéité n'est dû)
 *   - `estHermetiquementScelleSousSeuil` → règlement (UE) 2024/573, art. 5
 *     (dispense des équipements hermétiquement scellés)
 *   - `aDetectionDeFuites`          → règlement (UE) 2024/573, art. 5
 *     (l'intervalle entre deux contrôles d'étanchéité est doublé)
 *   - `estChargeSuperieure50TCo2`   → règlement (UE) 2024/573, art. 5 (palier)
 *   - `estChargeSuperieure500TCo2`  → règlement (UE) 2024/573, art. 5 (palier)
 *
 * `dessertLocauxSommeil` a été RETIRÉ le 2026-09-01 (lot A11). Il portait à lui
 * seul la restriction « locaux à sommeil » de PE 37, faute d'attribut
 * d'établissement pour elle. `Etablissement.comporteLocauxSommeilPublic`
 * existe désormais, et les quatre articles du Livre III qui s'y adossent
 * (PE 4 § 1, PE 33, PE 35, PE 37) s'y branchent directement. Laisser la
 * question sur l'alarme aurait été pire que la retirer : le dirigeant y
 * répondait en croyant que ça comptait, et le libellé du champ — « cette
 * alarme dessert des locaux à sommeil » — ne distinguait pas le sommeil du
 * public de celui du personnel, là où PE 37 écrit « pour le public ».
 *
 * ── Booléens à deux états contre booléens à trois états ────────────────────
 *
 * Les deux premières propriétés sont des **cases à cocher** : décochée vaut
 * « non ». C'est acceptable parce qu'elles gouvernent des obligations en
 * « opt-in » (l'obligation n'apparaît qu'après une réponse positive).
 *
 * Les treize suivantes (`CHAMPS_TRI_ETAT`) bornent au contraire des obligations **déjà publiées**, de
 * criticité élevée, en « opt-out » : elles restent applicables tant que le
 * dirigeant n'a pas répondu « non ». Une case à cocher ne convient donc pas —
 * elle ne distingue pas « j'ai répondu non » de « je n'ai pas encore répondu »,
 * et le silence d'un formulaire éteindrait une obligation vitale. Elles sont
 * modélisées en **trois états** : `true` (oui), `false` (non), `undefined`
 * (pas encore répondu, l'obligation reste affichée).
 */

const DATE_FMT = /^\d{4}-\d{2}-\d{2}$/;

export { CATEGORIES_EQUIPEMENT };
export type { CategorieEquipement } from "@/lib/referentiels/types-communs";

/**
 * Valeurs acceptées en entrée pour un booléen à trois états. On reste
 * tolérant sur la casse et sur les formes envoyées par un `<select>` HTML,
 * mais on n'accepte JAMAIS de repli implicite : toute valeur non reconnue
 * devient `undefined` (« pas encore répondu »), jamais `false`.
 */
const OUI = new Set(["true", "on", "oui", "1"]);
const NON = new Set(["false", "off", "non", "0"]);

export function normaliserTriEtat(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  if (typeof v !== "string") return undefined;
  const s = v.trim().toLowerCase();
  if (OUI.has(s)) return true;
  if (NON.has(s)) return false;
  return undefined;
}

/** Champ Zod pour un booléen à trois états. */
const triEtat = z.preprocess(
  normaliserTriEtat,
  z.boolean().optional(),
);

/**
 * Catégories qui portent la question du local à pollution spécifique. Elle
 * vivait dans le formulaire, seul à l'avoir posée jusqu'ici ; la fiche doit
 * relire la réponse, et une seconde liste dériverait.
 */
export const CATEGORIES_AERATION: readonly CategorieEquipement[] = [
  "VMC",
  "CTA",
  "HOTTE_PRO",
];

/**
 * Les treize questions à trois états, dans l'ordre d'affichage.
 *
 * Le compte est écrit à la main et se périme donc seul : deux commentaires se
 * superposaient ici, l'un annonçant douze questions et l'autre sept, aucun des
 * deux n'étant juste. Ils sont remplacés par un seul, recompté le 2026-09-01
 * après le retrait de `dessertLocauxSommeil`. Si vous en ajoutez une, ce
 * nombre est à corriger — ou à supprimer, ce qui vaudrait mieux.
 */
export const CHAMPS_TRI_ETAT = [
  "estVmcGaz",
  "aRobinetsIncendieArmes",
  "aExtinctionAutomatique",
  "sertAuLevageDePersonnes",
  "estChariotOuGerbeur",
  "aAccessoiresDeLevage",
  "estSoumisSuiviEnService",
  "estChargeSousSeuilControle",
  "estHermetiquementScelleSousSeuil",
  "estChargeSuperieure50TCo2",
  "estChargeSuperieure500TCo2",
  "aDetectionDeFuites",
  "estMuParForceHumaine",
] as const;

export type ChampTriEtat = (typeof CHAMPS_TRI_ETAT)[number];

/**
 * Table de cohérence catégorie ↔ question à trois états. Déclarative pour
 * rester lisible, et parcourue à la fois par `superRefine` et par les tests.
 */
export const CATEGORIES_TRI_ETAT: readonly {
  champ: ChampTriEtat;
  categories: readonly CategorieEquipement[];
  message: string;
}[] = [
  {
    champ: "estVmcGaz",
    categories: ["VMC"],
    message: "Spécifique aux VMC raccordées à des appareils à gaz",
  },
  {
    champ: "aRobinetsIncendieArmes",
    categories: ["EXTINCTEUR"],
    message: "Spécifique aux moyens d'extinction (RIA)",
  },
  {
    champ: "aExtinctionAutomatique",
    categories: ["APPAREIL_CUISSON_ERP"],
    message: "Spécifique aux appareils de cuisson d'ERP",
  },
  {
    champ: "sertAuLevageDePersonnes",
    categories: ["EQUIPEMENT_LEVAGE"],
    message: "Spécifique aux équipements de levage",
  },
  {
    champ: "estMuParForceHumaine",
    categories: ["EQUIPEMENT_LEVAGE"],
    message: "Spécifique aux équipements de levage",
  },
  {
    champ: "estChariotOuGerbeur",
    categories: ["EQUIPEMENT_LEVAGE"],
    message: "Spécifique aux équipements de levage",
  },
  {
    champ: "aAccessoiresDeLevage",
    categories: ["EQUIPEMENT_LEVAGE"],
    message: "Spécifique aux équipements de levage",
  },
  {
    champ: "estSoumisSuiviEnService",
    categories: ["EQUIPEMENT_SOUS_PRESSION"],
    message: "Spécifique aux équipements sous pression",
  },
  {
    champ: "estChargeSousSeuilControle",
    categories: ["INSTALLATION_FRIGORIFIQUE"],
    message: "Spécifique aux installations frigorifiques",
  },
  {
    champ: "estHermetiquementScelleSousSeuil",
    categories: ["INSTALLATION_FRIGORIFIQUE"],
    message: "Spécifique aux installations frigorifiques",
  },
  {
    champ: "estChargeSuperieure50TCo2",
    categories: ["INSTALLATION_FRIGORIFIQUE"],
    message: "Spécifique aux installations frigorifiques",
  },
  {
    champ: "estChargeSuperieure500TCo2",
    categories: ["INSTALLATION_FRIGORIFIQUE"],
    message: "Spécifique aux installations frigorifiques",
  },
  {
    champ: "aDetectionDeFuites",
    categories: ["INSTALLATION_FRIGORIFIQUE"],
    message: "Spécifique aux installations frigorifiques",
  },
];

/** Valeurs du `<select>` de l'interface — partagées avec `EquipementForm`. */
export const VALEURS_TRI_ETAT = [
  { value: "", label: "Je ne sais pas encore" },
  { value: "oui", label: "Oui" },
  { value: "non", label: "Non" },
] as const;

/**
 * Sérialisation inverse : d'un booléen à trois états vers la valeur du
 * `<select>`. Utilisée pour pré-remplir le formulaire d'édition.
 */
export function valeurTriEtat(v: boolean | undefined | null): string {
  if (v === true) return "oui";
  if (v === false) return "non";
  return "";
}

export const equipementSchema = z
  .object({
    libelle: z
      .string()
      .trim()
      .min(1, "Libellé requis")
      .max(200, "Libellé trop long"),
    categorie: z.enum(CATEGORIES_EQUIPEMENT),
    // ADR-019 : le bâtiment où se trouve l'équipement. Optionnel au niveau
    // du formulaire — absent, l'action prend le bâtiment principal — mais
    // toujours écrit en base, où la colonne est requise.
    batimentId: z.string().trim().min(1).optional(),
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
        .transform((v) => (v ? depuisCleJourCivil(v) : undefined)),
    ),
    nombre: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().int().min(1).max(9999).optional(),
    ),
    // Cases à cocher (deux états).
    aGroupeElectrogene: z.coerce.boolean().optional(),
    estLocalPollutionSpecifique: z.coerce.boolean().optional(),
    aSystemeDeRecyclage: z.coerce.boolean().optional(),
    nbVehiculesParkingCouvert: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().int().min(0).max(99999).optional(),
    ),
    // Équipements sous pression — plaque constructeur (C. env. R. 557-14-1).
    // Servent au verdict indicatif `verdictSuiviEnService` (lib/equipements/esp.ts)
    // qui pré-remplit `estSoumisSuiviEnService` ; jamais lus par le moteur.
    familleEsp: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.enum(FAMILLES_ESP).optional(),
    ),
    pressionMaxAdmissibleBar: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().min(0).max(10000).optional(),
    ),
    volumeLitres: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().min(0).max(1000000).optional(),
    ),
    // Questions à trois états (oui / non / pas encore répondu).
    estVmcGaz: triEtat,
    aRobinetsIncendieArmes: triEtat,
    aExtinctionAutomatique: triEtat,
    sertAuLevageDePersonnes: triEtat,
    estChariotOuGerbeur: triEtat,
    estMuParForceHumaine: triEtat,
    aAccessoiresDeLevage: triEtat,
    estSoumisSuiviEnService: triEtat,
    estChargeSousSeuilControle: triEtat,
    estHermetiquementScelleSousSeuil: triEtat,
    estChargeSuperieure50TCo2: triEtat,
    estChargeSuperieure500TCo2: triEtat,
    aDetectionDeFuites: triEtat,
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

    if (val.aSystemeDeRecyclage && !categoriesPollutionOk.includes(val.categorie)) {
      ctx.addIssue({
        code: "custom",
        path: ["aSystemeDeRecyclage"],
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

    // Questions à trois états : même contrôle de cohérence. On rejette dès
    // qu'une réponse (oui OU non) est donnée hors de la catégorie visée —
    // une réponse « non » hors catégorie n'a pas plus de sens qu'un « oui ».
    for (const { champ, categories, message } of CATEGORIES_TRI_ETAT) {
      if (val[champ] !== undefined && !categories.includes(val.categorie)) {
        ctx.addIssue({ code: "custom", path: [champ], message });
      }
    }
  });

export type EquipementInput = z.infer<typeof equipementSchema>;

/**
 * Normalise un `FormData` de formulaire d'équipement avant validation Zod.
 *
 * Vit ici — et non dans les Server Actions — pour que la correspondance entre
 * les champs du formulaire, le schéma et les propriétés lues par le moteur de
 * matching soit décrite en un seul endroit. Toute nouvelle propriété
 * d'équipement s'ajoute donc dans ce fichier, sans modification des actions.
 *
 * Deux conventions distinctes, cf. l'en-tête :
 *   - case à cocher : absente du FormData ⇒ `false` ;
 *   - question à trois états : valeur vide ou absente ⇒ `undefined`
 *     (« pas encore répondu »), ce qui n'éteint aucune obligation.
 */
export function normaliserFormDataEquipement(
  fd: FormData,
): Record<string, unknown> {
  const raw = Object.fromEntries(fd);
  const caseCochee = (k: string) => raw[k] !== undefined;
  const out: Record<string, unknown> = {
    libelle: raw.libelle,
    categorie: raw.categorie || undefined,
    batimentId: raw.batimentId || undefined,
    localisation: raw.localisation,
    dateMiseEnService: raw.dateMiseEnService,
    nombre: raw.nombre,
    aGroupeElectrogene: caseCochee("aGroupeElectrogene"),
    estLocalPollutionSpecifique: caseCochee("estLocalPollutionSpecifique"),
    aSystemeDeRecyclage: caseCochee("aSystemeDeRecyclage"),
    nbVehiculesParkingCouvert: raw.nbVehiculesParkingCouvert,
    // Plaque constructeur d'un équipement sous pression (cf. `esp.ts`).
    familleEsp: raw.familleEsp,
    pressionMaxAdmissibleBar: raw.pressionMaxAdmissibleBar,
    volumeLitres: raw.volumeLitres,
    notes: raw.notes,
  };
  for (const champ of CHAMPS_TRI_ETAT) {
    out[champ] = normaliserTriEtat(raw[champ]);
  }
  return out;
}

/**
 * Construit la valeur sérialisable en `Json` de `caracteristiques` à partir
 * des champs Zod. Ne stocke que les clés effectivement renseignées pour
 * éviter des JSON volumineux — et, pour les questions à trois états, pour que
 * « pas encore répondu » reste distinct de « non » côté moteur de matching.
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
  if (val.aSystemeDeRecyclage !== undefined)
    out.aSystemeDeRecyclage = val.aSystemeDeRecyclage;
  if (val.nbVehiculesParkingCouvert !== undefined)
    out.nbVehiculesParkingCouvert = val.nbVehiculesParkingCouvert;
  if (val.familleEsp !== undefined) out.familleEsp = val.familleEsp;
  if (val.pressionMaxAdmissibleBar !== undefined)
    out.pressionMaxAdmissibleBar = val.pressionMaxAdmissibleBar;
  if (val.volumeLitres !== undefined) out.volumeLitres = val.volumeLitres;
  for (const champ of CHAMPS_TRI_ETAT) {
    const v = val[champ];
    if (v !== undefined) out[champ] = v;
  }
  if (val.notes !== undefined) out.notes = val.notes;
  return Object.keys(out).length === 0 ? null : out;
}
