/**
 * Types partagés entre référentiels DUERP et Conformité (ADR-003).
 *
 * Les valeurs correspondent **à l'identique** aux enums Prisma du modèle V2
 * (cf. `prisma/schema.prisma`). Toute divergence rend le seed ou le moteur de
 * matching incohérent — si l'un bouge, l'autre doit bouger en PR jumelle.
 *
 * Sources de typologie (ADR-004) :
 * - Arrêté du 25 juin 1980 (ERP) — dispositions générales du règlement de
 *   sécurité contre les risques d'incendie et de panique dans les ERP.
 *   https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/
 * - Arrêté du 22 juin 1990 (ERP 5ᵉ cat — règles PE).
 *   https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000171201/
 * - Arrêté du 30 décembre 2011 (IGH — règlement de sécurité).
 *   https://www.legifrance.gouv.fr/loda/id/JORFTEXT000025118025/
 * - CCH art. R. 143-1 s. (ERP) et R. 146-3 s. (IGH).
 */

// -----------------------------------------------------------------------------
// Périodicité — reflet exact de l'enum Prisma `Periodicite`
// -----------------------------------------------------------------------------

export const PERIODICITES = [
  "hebdomadaire",
  "mensuelle",
  "trimestrielle",
  "semestrielle",
  "annuelle",
  "biennale",
  "triennale",
  "quinquennale",
  "decennale",
  "mise_en_service_uniquement",
  "autre",
] as const;

export type Periodicite = (typeof PERIODICITES)[number];

/**
 * Durée approximative d'une périodicité, exprimée en jours. Utilisée par le
 * moteur de génération du calendrier (étape 6) pour calculer la prochaine
 * échéance à partir d'une date connue. Les valeurs sont des approximations
 * métier, pas des durées calendaires exactes.
 */
export const PERIODICITE_EN_JOURS: Record<Periodicite, number | null> = {
  hebdomadaire: 7,
  mensuelle: 30,
  trimestrielle: 91,
  semestrielle: 182,
  annuelle: 365,
  biennale: 730,
  triennale: 1095,
  quinquennale: 1825,
  decennale: 3650,
  mise_en_service_uniquement: null,
  autre: null,
};

// -----------------------------------------------------------------------------
// Profil du réalisateur — reflet exact de l'enum Prisma `Realisateur`
// -----------------------------------------------------------------------------

export const REALISATEURS = [
  "organisme_agree",
  "organisme_accredite",
  "personne_qualifiee",
  "personne_competente",
  "exploitant",
  "fabricant",
  "bureau_controle",
] as const;

export type Realisateur = (typeof REALISATEURS)[number];

// -----------------------------------------------------------------------------
// Typologie — ADR-004 (régimes cumulables)
// -----------------------------------------------------------------------------

export const TYPES_ERP = [
  "M", "N", "O", "L", "P", "R", "S", "T", "U", "V",
  "W", "X", "Y", "PA", "CTS", "SG", "PS", "REF", "GA", "OA", "EF",
] as const;
export type TypeErp = (typeof TYPES_ERP)[number];

export const CATEGORIES_ERP = ["N1", "N2", "N3", "N4", "N5"] as const;
export type CategorieErp = (typeof CATEGORIES_ERP)[number];

export const CLASSES_IGH = [
  "GHA", "GHW", "GHO", "GHR", "GHS", "GHU", "GHZ", "ITGH",
] as const;
export type ClasseIgh = (typeof CLASSES_IGH)[number];

/**
 * Critère d'application d'une obligation à un établissement (ADR-004).
 *
 * Sémantique des champs :
 *  - `undefined` = critère indifférent (pas de contrainte sur ce régime)
 *  - `true`      = requis (doit être vrai côté établissement)
 *  - `false`     = exclu (doit être faux côté établissement)
 *  - `{ categories: [...] }` = requis ET restreint à ces catégories ERP
 *  - `{ classes:   [...] }` = requis ET restreint à ces classes IGH
 *
 * Cette structure est consommée par le moteur de matching (étape 5) de manière
 * purement déclarative, sans fonction TS arbitraire — condition nécessaire à
 * l'auditabilité du système.
 */
export type TypologieApplication = {
  travail?: boolean;
  erp?: boolean | { categories: CategorieErp[] };
  igh?: boolean | { classes: ClasseIgh[] };
  habitation?: boolean;
  effectifMin?: number;
  effectifMax?: number;
};

// -----------------------------------------------------------------------------
// Catégorie d'équipement — reflet exact de l'enum Prisma `CategorieEquipement`
// -----------------------------------------------------------------------------

export const CATEGORIES_EQUIPEMENT = [
  "INSTALLATION_ELECTRIQUE",
  "EXTINCTEUR",
  "BAES",
  "ALARME_INCENDIE",
  "DESENFUMAGE",
  "VMC",
  "CTA",
  "HOTTE_PRO",
  "APPAREIL_CUISSON_ERP",
  "ASCENSEUR",
  "PORTE_AUTO",
  "PORTAIL_AUTO",
  "EQUIPEMENT_SOUS_PRESSION",
  "STOCKAGE_MATIERE_DANGEREUSE",
  "EQUIPEMENT_LEVAGE",
  "AUTRE",
] as const;

export type CategorieEquipement = (typeof CATEGORIES_EQUIPEMENT)[number];
