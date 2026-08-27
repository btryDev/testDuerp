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
  // Code de la santé publique. Il porte des obligations de sécurité du
  // bâtiment que le Code du travail ne couvre pas — dossier technique amiante,
  // radon, constat de risque d'exposition au plomb — et il est consultable sur
  // Légifrance au même titre qu'un article du Code du travail. Aucune
  // obligation ne le cite encore (ADR-022).
  "CSP",
  // Code de la sécurité sociale. Il fonde le registre des accidents bénins et
  // la déclaration d'accident du travail, aujourd'hui hors périmètre produit.
  // Déclaré ici pour que la source existe le jour où le périmètre bouge, sans
  // qu'on soit tenté de ranger ces obligations sous CODE_TRAVAIL, qui ne les
  // porte pas (ADR-022).
  "CSS",
] as const;

export type SourceLegale = (typeof SOURCES_LEGALES)[number];

/**
 * Ce que chaque source s'appelle quand on la montre à quelqu'un.
 *
 * L'interface affichait jusqu'ici la valeur brute de l'enum — `CODE_TRAVAIL`,
 * `ARRETE`. Passable tant que les sigles se lisaient ; illisible dès `CSP` et
 * `CSS`, qu'aucun dirigeant n'a à décoder. Un `Record` exhaustif plutôt qu'un
 * objet libre : ajouter une source sans lui donner de nom ne compile pas.
 */
export const LIBELLE_SOURCE: Record<SourceLegale, string> = {
  CODE_TRAVAIL: "Code du travail",
  CCH: "Code de la construction et de l'habitation",
  CODE_ENVIRONNEMENT: "Code de l'environnement",
  ARRETE: "Arrêté",
  DECRET: "Décret",
  INRS: "INRS",
  REGLEMENT_UE: "Règlement européen",
  CSP: "Code de la santé publique",
  CSS: "Code de la sécurité sociale",
};

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
   * Identifiant canonique de l'article visé, tel qu'un corpus le nomme :
   * « MS 38 », « PE 4 », « R. 4227-39 », « CCH R. 143-44 ».
   *
   * `reference` est faite pour être lue par un humain — elle porte le texte
   * porteur, le paragraphe, parfois l'ancienne numérotation. Elle ne peut pas
   * servir de clé : rapprocher « Arrêté du 25 juin 1980, art. MS 38 § 4 » de
   * l'article « MS 38 » d'un corpus supposait une comparaison de sous-chaînes,
   * c'est-à-dire une devinette. Ce champ est la clé ; `reference` reste la
   * citation.
   *
   * `undefined` = pas encore rattaché à un corpus. Le rattachement est ce qui
   * permet d'affirmer qu'une obligation repose sur un texte lu.
   */
  article?: string;
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

/**
 * Sur quoi porte l'échéance que l'obligation engendre (ADR-022).
 *
 * - `equipement` : une ligne par équipement déclaré qui la déclenche.
 * - `etablissement` : **une seule** ligne, quels que soient les équipements
 *   déclarés — y compris aucun. C'est le point décisif : `PE 4 § 2` reste dû
 *   via `PE 2 § 3` par les établissements qui ont le moins déclaré, et une
 *   décomposition par installation y produirait zéro ligne.
 *
 * `salarie` n'est pas encore une valeur : il ouvre la réécriture de
 * `docs/rgpd.md`, le dépouillement d'ED 6298 et un onglet Personnel. L'union
 * est faite pour l'accueillir sans rien changer d'autre (ADR-022).
 */
export type PorteurObligation = "equipement" | "etablissement";

/** Champs communs à toutes les obligations, quel que soit leur porteur. */
type ObligationCommune = {
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
  /** Note de contexte interne (ex. précisions de portée) — non affichée par défaut. */
  notesInternes?: string;
  /**
   * Rendez-vous de relecture annoncé par le texte lui-même. Un test échoue
   * quand la date est passée : une note qui ne réveille personne n'est pas un
   * garde-fou.
   */
  relectureDue?: RelectureDue;
};

/**
 * Obligation déclenchée par un équipement déclaré : une ligne de calendrier
 * par équipement qui la déclenche, aucune si aucun n'est déclaré.
 */
export type ObligationPorteeParEquipement = ObligationCommune & {
  /**
   * Absent vaut `"equipement"` : les 85 obligations livrées avant l'ADR-022
   * n'ont pas à être annotées une par une pour rester ce qu'elles sont.
   */
  porteur?: "equipement";
  /** Catégories d'équipement qui déclenchent l'obligation (au moins une). */
  categoriesEquipement: [CategorieEquipement, ...CategorieEquipement[]];
  /** Conditions supplémentaires (propriétés d'équipement). Optionnel. */
  conditions?: ConditionApplication[];
  /** Interdit ici : le contexte n'a de sens que pour un porteur établissement. */
  equipementsEnContexte?: never;
};

/**
 * Obligation portée par l'établissement : **une seule** ligne de calendrier,
 * indépendante des équipements déclarés (ADR-022, § 4).
 */
export type ObligationPorteeParEtablissement = ObligationCommune & {
  porteur: "etablissement";
  /**
   * Interdit : aucune catégorie ne déclenche cette obligation. Le champ est
   * déclaré en `never` plutôt qu'omis pour que l'erreur soit lisible — sans
   * lui, TypeScript ne signalerait qu'une propriété « inconnue ».
   */
  categoriesEquipement?: never;
  /** Interdit : les conditions portent sur des propriétés d'équipement. */
  conditions?: never;
  /**
   * Catégories affichées **à titre indicatif** sous l'obligation, pour que le
   * dirigeant voie lesquels de ses équipements sont concernés. Ce n'est pas un
   * déclencheur : la ligne existe même si aucun n'est déclaré, et l'interface
   * accompagne la liste de la mention « non limitative » — `PE 4 § 2` finit
   * par « etc. », le produit ne doit pas prétendre le contraire.
   */
  equipementsEnContexte?: CategorieEquipement[];
};

export type Obligation =
  | ObligationPorteeParEquipement
  | ObligationPorteeParEtablissement;

/**
 * Le porteur d'une obligation, avec sa valeur par défaut appliquée.
 * À préférer à `o.porteur` partout : ce dernier est `undefined` sur les
 * obligations d'équipement qui ne l'annoncent pas.
 */
export function porteurDe(o: Obligation): PorteurObligation {
  return o.porteur ?? "equipement";
}

/**
 * Rétrécit une obligation à sa variante « équipement ». Les lecteurs qui ne
 * savent traiter que ce cas s'en servent comme garde, plutôt que de supposer
 * que `categoriesEquipement` existe.
 */
export function estPorteeParEquipement(
  o: Obligation,
): o is ObligationPorteeParEquipement {
  return porteurDe(o) === "equipement";
}
