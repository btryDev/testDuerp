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
 * avec > 250 véhicules). Reste déclaratif pour rester auditable : aucune
 * fonction TypeScript arbitraire n'entre dans le référentiel (ADR-003).
 *
 * Trois formes, qui se distinguent par leur comportement **quand la propriété
 * n'est pas renseignée** — c'est le point de sécurité du modèle :
 *
 *  - `equipement_propriete_numerique` : propriété absente ⇒ condition NON
 *    satisfaite. À réserver aux obligations dont la portée exacte dépend d'un
 *    chiffre que l'utilisateur doit fournir (capacité de parking…), et dont la
 *    sur-application serait aussi fausse que la sous-application.
 *  - `equipement_propriete_booleenne` : propriété absente ⇒ condition NON
 *    satisfaite. Sémantique « opt-in » : l'obligation n'apparaît qu'après une
 *    réponse positive explicite.
 *  - `equipement_propriete_non_infirmee` : la condition est satisfaite **tant
 *    que l'utilisateur n'a pas répondu « non »** (propriété absente, ou d'un
 *    type inattendu ⇒ satisfaite ; seule la valeur booléenne `false` la rend
 *    non satisfaite). Sémantique « opt-out ».
 *  - `equipement_propriete_infirmee` : le miroir de la précédente. La
 *    condition est satisfaite **tant que l'utilisateur n'a pas répondu
 *    « oui »** (seule la valeur booléenne `true` la rend non satisfaite).
 *    Elle sert à écarter une obligation générale au profit d'une obligation
 *    plus spécifique, sans jamais créer de trou : si la question n'a pas été
 *    posée, c'est la règle générale qui continue de s'appliquer. C'est le cas
 *    de la VGP de levage, annuelle par principe et semestrielle pour les
 *    chariots élévateurs et gerbeurs (arrêté du 1er mars 2004, art. 20-II
 *    et 23) — les deux périodicités s'excluent, et l'absence de réponse
 *    laisse la périodicité annuelle en place plutôt que de tout éteindre.
 *
 * Règle de rédaction (verrouillée par `conformite.test.ts`) : ajouter une
 * condition sur une obligation **déjà publiée** de criticité ≥ 4 impose une
 * forme qui reste satisfaite quand la propriété est absente, c'est-à-dire
 * `non_infirmee` ou `infirmee`. Sinon, tous les équipements déjà déclarés —
 * qui n'ont évidemment pas la nouvelle propriété — perdraient l'obligation en
 * silence, sans que personne ne soit averti. Sur une obligation de criticité
 * élevée, une sur-application visible et corrigeable par une réponse « non »
 * est toujours préférable à un faux négatif muet.
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
    }
  | {
      type: "equipement_propriete_non_infirmee";
      categorie: CategorieEquipement;
      propriete: string;
    }
  | {
      type: "equipement_propriete_infirmee";
      categorie: CategorieEquipement;
      propriete: string;
    };

export type Obligation = {
  /** Identifiant stable, versionné avec le code. Jamais réutilisé. */
  id: string;
  domaine: DomaineObligation;
  /** Libellé court affichable dans l'UI et le calendrier. */
  libelle: string;
  /** Texte long optionnel pour la fiche détaillée et le registre. */
  description?: string;
  /**
   * Liste non vide de références. Au moins une source primaire opposable.
   *
   * Convention d'ordre : `referencesLegales[0]` est l'article qui **fonde**
   * l'obligation — celui qu'on citerait seul devant un inspecteur. Les
   * suivantes sont du contexte (article qui pose un seuil, texte d'application,
   * fiche INRS). Le test anti-doublon du référentiel s'appuie sur cette
   * convention : deux obligations fondées sur le même article, pour la même
   * catégorie d'équipement et la même périodicité, sont un doublon.
   */
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
