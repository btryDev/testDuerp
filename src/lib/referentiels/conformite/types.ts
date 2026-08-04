import type {
  CategorieEquipement,
  Periodicite,
  Realisateur,
  TypologieApplication,
} from "../types-communs";

/**
 * Référentiel d'obligations réglementaires (ADR-003).
 *
 * Règle absolue : chaque `Obligation` cite **au moins une** référence primaire
 * vérifiable sur Légifrance (Code du travail, CCH, arrêté) ou sur une source
 * institutionnelle reconnue (INRS). Pas de normes privées (APSAD, NF),
 * pas de recommandations sans force opposable.
 *
 * Les obligations vivent en TypeScript versionné avec le code (pas en base),
 * ce qui garantit l'auditabilité via l'historique Git (ADR-003).
 */

export const DOMAINES_OBLIGATION = [
  "electricite",
  "incendie",
  "aeration",
  "cuisson_hotte",
  "ascenseur",
  "porte_portail",
  "equipement_sous_pression",
  "stockage_dangereux",
  "levage",
] as const;

export type DomaineObligation = (typeof DOMAINES_OBLIGATION)[number];

export const SOURCES_LEGALES = [
  "CODE_TRAVAIL",
  "CCH",
  "CODE_ENVIRONNEMENT",
  "ARRETE",
  "DECRET",
  "INRS",
] as const;

export type SourceLegale = (typeof SOURCES_LEGALES)[number];

export type ReferenceLegale = {
  source: SourceLegale;
  /**
   * Référence littérale telle qu'on la citerait dans un document officiel.
   * Ex. : "R. 4226-16", "Arrêté du 25 juin 1980, art. EL 19".
   */
  reference: string;
  /**
   * URL Légifrance cible. Doit renvoyer vers la dernière version consolidée
   * en cas de doute — les URL LEGIARTI sont stables dans le temps.
   */
  urlLegifrance?: string;
  /**
   * Commentaire libre pour expliciter la portée (ex. périmètre d'application
   * restreint, dérogation possible…). Optionnel.
   */
  note?: string;
};

/**
 * Condition d'application complémentaire à la typologie. Couvre les règles
 * qui dépendent d'attributs portés par un équipement (ex. parking couvert
 * avec > 250 véhicules). Reste déclaratif pour rester auditable.
 */
export type ConditionApplication =
  | {
      type: "equipement_propriete_numerique";
      categorie: CategorieEquipement;
      propriete: string;
      operateur: ">" | ">=" | "<" | "<=" | "==";
      valeur: number;
    }
  | {
      type: "equipement_propriete_booleenne";
      categorie: CategorieEquipement;
      propriete: string;
      valeur: boolean;
    };

export type Obligation = {
  /** Identifiant stable, versionné avec le code. Jamais réutilisé. */
  id: string;
  domaine: DomaineObligation;
  /** Libellé court affichable dans l'UI et le calendrier. */
  libelle: string;
  /** Texte long optionnel pour la fiche détaillée et le registre. */
  description?: string;
  /** Liste non vide de références. Au moins une source primaire opposable. */
  referencesLegales: [ReferenceLegale, ...ReferenceLegale[]];
  periodicite: Periodicite;
  /** Réalisateurs acceptés. Au moins un. En général 1, parfois 2 (ex. "personne qualifiée OU organisme agréé"). */
  realisateurs: [Realisateur, ...Realisateur[]];
  /** 1 = informatif, 5 = vital (mise en danger directe si manquement). */
  criticite: 1 | 2 | 3 | 4 | 5;
  /** Régimes auxquels l'obligation s'applique. */
  typologies: TypologieApplication;
  /** Catégories d'équipement qui déclenchent l'obligation (au moins une). */
  categoriesEquipement: [CategorieEquipement, ...CategorieEquipement[]];
  /** Conditions supplémentaires (propriétés d'équipement). Optionnel. */
  conditions?: ConditionApplication[];
  /** Note de contexte interne (ex. précisions de portée) — non affichée par défaut. */
  notesInternes?: string;
};
