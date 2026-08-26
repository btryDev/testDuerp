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
  "froid",
] as const;

export type DomaineObligation = (typeof DOMAINES_OBLIGATION)[number];

export const SOURCES_LEGALES = [
  "CODE_TRAVAIL",
  "CCH",
  "CODE_ENVIRONNEMENT",
  "ARRETE",
  "DECRET",
  "INRS",
  // Un règlement européen est d'application directe : il est opposable sans
  // transposition, et se cite donc comme source primaire au même titre qu'un
  // article de code. Ajouté pour le contrôle d'étanchéité des fluides
  // frigorigènes, dont les seuils et les périodicités ne vivent plus que dans
  // le règlement (UE) 2024/573 — le droit national renvoyant encore au texte
  // qu'il abroge.
  "REGLEMENT_UE",
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
   * URL de la source, telle qu'un lecteur peut l'ouvrir. Légifrance pour le
   * droit national — la dernière version consolidée en cas de doute, les URL
   * LEGIARTI étant stables dans le temps — mais pas seulement : le droit de
   * l'Union se cite sur EUR-Lex, et le champ s'appelait `urlLegifrance` alors
   * qu'il portait déjà autre chose. Un champ dont le nom ne décrit plus le
   * contenu finit par faire passer une source pour une autre.
   */
  url?: string;
  /**
   * Commentaire libre pour expliciter la portée (ex. périmètre d'application
   * restreint, dérogation possible…). Optionnel.
   */
  note?: string;
  /**
   * Date de la version du texte constatée à la dernière relecture, en clé de
   * jour civil « AAAA-MM-JJ ».
   *
   * C'est le point de comparaison de la veille : Légifrance affiche pour
   * chaque article la date depuis laquelle sa version est en vigueur. Si elle
   * a bougé depuis celle-ci, le texte a été modifié et l'obligation est à
   * relire.
   *
   * Sans ce repère, rien ne distingue une référence relue hier d'une
   * référence encodée il y a deux ans : R. 143-44 a été réécrit le
   * 1er juillet 2026 et le référentiel a continué de le citer deux mois,
   * sans que rien ne puisse le signaler.
   *
   * `undefined` = jamais constatée. À traiter comme « à vérifier », pas
   * comme « à jour ».
   */
  versionConstatee?: string;
};

/**
 * Un rendez-vous de relecture, quand le texte lui-même en annonce un.
 *
 * Deux cas seulement, et ils sont réels : un article porte une version future
 * programmée (R. 4227-37 change au 1er janvier 2027), ou un arrêté est publié
 * avec une date d'application différée (arrêté du 1er décembre 2025 applicable
 * au 1er juillet 2026).
 *
 * Cette information existait déjà — mais en prose, dans `notesInternes`, donc
 * illisible par une machine et invisible le jour venu. Deux des trois
 * rendez-vous que portait le référentiel étaient déjà échus sans que personne
 * ne l'ait su.
 */
export type RelectureDue = {
  /** Clé de jour civil « AAAA-MM-JJ ». */
  le: string;
  /** Ce qui change, et où le lire. Une phrase. */
  motif: string;
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
  /**
   * Rendez-vous de relecture annoncé par le texte lui-même. Un test échoue
   * quand la date est passée : une note qui ne réveille personne n'est pas un
   * garde-fou.
   */
  relectureDue?: RelectureDue;
};
