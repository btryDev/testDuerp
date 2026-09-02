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
 *   https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000000525278
 * - Arrêté du 30 décembre 2011 (IGH — règlement de sécurité).
 *   https://www.legifrance.gouv.fr/loda/id/JORFTEXT000025167121
 * - CCH art. R. 143-1 s. (ERP) et R. 146-3 s. (IGH).
 */

// -----------------------------------------------------------------------------
// Périodicité — reflet exact de l'enum Prisma `Periodicite`
// -----------------------------------------------------------------------------

export const PERIODICITES = [
  "hebdomadaire",
  "bimensuelle",
  "mensuelle",
  "six_semaines",
  "trimestrielle",
  "semestrielle",
  "annuelle",
  "biennale",
  "triennale",
  "quadriennale",
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
  // Quinze jours. Introduite pour EL 18 § 4, qui impose « tous les quinze
  // jours » la vérification des niveaux d'un groupe électrogène de sécurité.
  // Sans elle, le choix se réduisait à `hebdomadaire` — qui double la charge
  // réelle — ou `mensuelle`, qui tait l'obligation. Quatorze jours et non
  // quinze : la conversion sert à calculer une échéance, et un multiple de
  // sept fait retomber le rendez-vous le même jour de la semaine.
  bimensuelle: 14,
  mensuelle: 30,
  // Quarante-deux jours. L'annexe de l'arrêté du 18 novembre 2004 écrit un
  // « INTERVALLE maximum de six semaines » pour la visite de base des
  // ascenseurs. Six semaines n'est pas un mois et demi : le texte compte en
  // semaines, la conversion est exacte.
  six_semaines: 42,
  trimestrielle: 91,
  semestrielle: 182,
  annuelle: 365,
  biennale: 730,
  triennale: 1095,
  quadriennale: 1460,
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
  // Le médecin du travail, nommément. Ajouté avec le suivi médical (lot 7) :
  // `R. 4624-28` réserve le renouvellement du suivi individuel renforcé au
  // médecin du travail, et `R. 4323-56` lui réserve la délivrance de
  // l'attestation d'absence de contre-indication à la conduite. Aucune valeur
  // existante ne le disait. `exploitant` aurait été le repli naturel — c'est
  // celui qu'a pris `elec-salarie-attestation-medicale-voisinage` avant ce lot
  // — et il annonce au dirigeant qu'il réalise lui-même un acte qu'il lui est
  // interdit de réaliser.
  "medecin_travail",
  // « L'un des professionnels de santé mentionnés au premier alinéa de
  // l'article L. 4624-1 » — médecin du travail, mais aussi collaborateur
  // médecin, interne, infirmier de santé au travail. `R. 4624-10` (visite
  // d'information et de prévention) et la visite intermédiaire de
  // `R. 4624-28` l'écrivent ainsi, là où le renouvellement du SIR exige le
  // médecin. La distinction est dans le texte : la rabattre sur une seule
  // valeur ferait croire qu'une VIP requiert un médecin du travail, ce qui
  // resserre l'obligation au-delà de ce que le Code impose.
  "professionnel_sante_travail",
  // L'équipe pluridisciplinaire d'un service de prévention et de santé au
  // travail interentreprises. `R. 4624-46` la distingue explicitement du
  // médecin : la fiche d'entreprise est établie « par le médecin du travail
  // OU, dans les services de prévention et de santé au travail
  // interentreprises, l'équipe pluridisciplinaire » — verbatim relevé le
  // 2026-08-31, version en vigueur du 2022-04-28.
  //
  // Ce n'est pas un cas limite mais le cas ORDINAIRE de la cible du produit :
  // une TPE de six personnes adhère à un service interentreprises, elle ne
  // salarie pas de médecin du travail. Rabattre ce réalisateur sur
  // `professionnel_sante_travail` restreindrait au personnel soignant une
  // mission que le texte confie à une équipe qui ne l'est pas toute.
  "equipe_pluridisciplinaire",
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
 * Familles d'habitation — arrêté du 31 janvier 1986 (ADR-025 § 4).
 * Reflet exact de l'enum Prisma `FamilleHabitation`.
 *
 * La 3ᵉ famille est scindée : 3A et 3B se distinguent par la desserte par la
 * voie échelle, et cette distinction emporte des obligations différentes.
 */
export const FAMILLES_HABITATION = [
  "PREMIERE",
  "DEUXIEME",
  "TROISIEME_A",
  "TROISIEME_B",
  "QUATRIEME",
] as const;
export type FamilleHabitation = (typeof FAMILLES_HABITATION)[number];

/**
 * Critère d'application d'une obligation à un établissement (ADR-004).
 *
 * Sémantique des champs :
 *  - `undefined` = critère indifférent (pas de contrainte sur ce régime)
 *  - `true`      = requis (doit être vrai côté établissement)
 *  - `false`     = exclu (doit être faux côté établissement)
 *  - `{ categories: [...] }` = requis ET restreint à ces catégories ERP
 *  - `{ types:      [...] }` = requis ET restreint à ces types d'exploitation ERP
 *  - `{ typesExclus: [...] }` = requis SAUF pour ces types d'exploitation ERP
 *  - `{ classes:   [...] }` = requis ET restreint à ces classes IGH
 *
 * `categories` et `types` sont indépendants et cumulables : une obligation
 * peut viser « les ERP de type O, toutes catégories », « les ERP de 1ʳᵉ à 4ᵉ
 * catégorie, tous types », ou les deux à la fois. Chacun se lit **en ET** avec
 * le reste (cf. moteur de matching), et l'absence de la précision côté
 * établissement vaut rejet — comme pour les catégories : une restriction que
 * l'on ne peut pas vérifier ne doit pas être silencieusement ignorée.
 *
 * Restriction par type : à n'employer que si le texte fondateur vise
 * explicitement un ou plusieurs types d'exploitation (dispositions
 * particulières du règlement de sécurité). Les articles des dispositions
 * générales (EL, MS, EC, DF, CH, GC, GZ, GE) s'appliquent à tous les types :
 * y ajouter une liste de types serait une restriction inventée. **Une
 * exception, et elle est la raison d'être de `typesExclus`** : `GE 4 § 1`
 * est un article des dispositions générales dont le corps est un TABLEAU
 * croisant le type et la catégorie. Il ne restreint pas son champ à quelques
 * types — il s'applique à tous — mais il ne leur donne pas la même
 * périodicité.
 *
 * `typesExclus` : le complément de `types`, et il n'en est PAS le symétrique
 * exact. Là où `types` rejette un ERP dont le `typeErp` est inconnu — une
 * restriction invérifiable ne s'ignore pas —, `typesExclus` le **retient** :
 * une exclusion invérifiable ne s'applique pas. L'asymétrie est délibérée et
 * va dans le même sens que la première : dans les deux cas, l'ignorance du
 * type ne fait jamais disparaître une ligne d'un calendrier. Elle est ce qui
 * permet d'écrire le complément d'un tableau sans creuser un faux négatif
 * muet chez l'établissement qui n'a pas précisé son activité.
 *
 * `types` et `typesExclus` sont mutuellement exclusifs sur une même
 * obligation (un test le vérifie) : écrire les deux, c'est écrire deux fois
 * la même frontière et se garantir qu'elles divergeront.
 *
 * Cette structure est consommée par le moteur de matching (étape 5) de manière
 * purement déclarative, sans fonction TS arbitraire — condition nécessaire à
 * l'auditabilité du système.
 */
export type TypologieApplication = {
  travail?: boolean;
  erp?:
    | boolean
    | {
        categories?: CategorieErp[];
        types?: TypeErp[];
        typesExclus?: TypeErp[];
      };
  igh?: boolean | { classes: ClasseIgh[] };
  /**
   * `{ familles: [...] }` = requis ET restreint à ces familles d'habitation.
   *
   * **La famille non renseignée ne rejette PAS**, à l'inverse de la catégorie
   * ERP et du type d'exploitation. La dissymétrie est voulue et elle tient à
   * qui subit l'erreur : la catégorie ERP est demandée à la création depuis
   * toujours, son absence est une anomalie ; la famille d'habitation n'existe
   * que depuis le 2026-09-01, et tous les dossiers antérieurs en sont
   * dépourvus. Les écarter reviendrait à retirer en silence des obligations à
   * des dossiers qui les doivent peut-être — un faux négatif que personne ne
   * peut voir. On retient donc l'obligation, en disant dans la raison qu'elle
   * est à confirmer : un dirigeant qui lit une échéance qu'il ne doit pas a
   * une chance de s'en apercevoir, l'inverse n'en a aucune.
   */
  habitation?: boolean | { familles: FamilleHabitation[] };
  /**
   * Présence, **pour le public**, de locaux à sommeil — chambres d'hôtel,
   * chambres d'hôtes, hébergement. Évalué sur
   * `Etablissement.comporteLocauxSommeilPublic`. En ET avec le reste : ce
   * n'est pas un régime, c'est une caractéristique de l'établissement, au même
   * titre qu'un seuil d'effectif.
   *
   * Quatre articles du Livre III de l'arrêté du 25 juin 1980 s'y adossent :
   * PE 4 § 1, PE 33, PE 35 et PE 37.
   *
   * LES DEUX SENS N'ONT PAS LE MÊME COMPORTEMENT FACE AU SILENCE, et c'est
   * toute la raison d'être de ce champ. C'est la règle du non-renseigné
   * (`.claude/CLAUDE.md`), écrite pour un attribut d'ÉTABLISSEMENT — l'inverse
   * exact d'`equipement_propriete_booleenne`, où une propriété absente dit
   * « cet équipement n'a pas cette caractéristique » :
   *
   *   - `true` (l'obligation exige des locaux à sommeil) : l'attribut non
   *     renseigné **ne rejette pas**. L'obligation est retenue, et la raison
   *     dit « à confirmer ». Même dissymétrie qu'`habitation: { familles }`,
   *     et pour le même motif — la colonne n'existe que depuis le 2026-09-01,
   *     aucun dossier antérieur ne porte de réponse, et les écarter retirerait
   *     en silence une visite de commission à un hôtel.
   *   - `false` (l'obligation ne vise que les établissements SANS locaux à
   *     sommeil — un allègement de régime) : l'attribut non renseigné
   *     **rejette**. Un allègement ne se donne pas sur une absence supposée ;
   *     il attend que l'absence soit déclarée.
   *
   * Aucune obligation n'écrit `false` à ce jour, et le sens existe quand même :
   * PE 2 § 3 réduit le régime des établissements « ne comportant pas de locaux
   * à sommeil » qui reçoivent au plus 19 personnes. Le jour où cet allègement
   * s'encode, la moitié qui protège est déjà là et éprouvée.
   */
  locauxSommeilPublic?: boolean;
  effectifMin?: number;
  effectifMax?: number;
  /**
   * Seuil sur les personnes habituellement présentes — salariés **et**
   * public — évalué sur `personnesPresentesHabituellement`, à défaut sur
   * `effectifSurSite`. Source : R. 4227-34 CT (« occupées ou réunies
   * habituellement »), à distinguer de `effectifMin` qui ne compte que les
   * salariés.
   */
  personnesPresentesMin?: number;
  /**
   * Champ d'application de R. 4227-34 CT, disjonctif par nature : satisfait
   * si `personnesPresentesMin` est atteint **OU** si l'établissement déclare
   * manipuler et mettre en œuvre des matières visées par R. 4227-22
   * (`manipuleMatieresR422722 === true`). C'est le seul OU inter-critères du
   * moteur, nommé d'après son article pour rester auditable : le référentiel
   * écrit `{ personnesPresentesMin: 51, champR422734: true }`, le chiffre
   * reste dans le référentiel, la logique dans le moteur.
   *   https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532067
   */
  champR422734?: true;
};

// -----------------------------------------------------------------------------
// Catégorie d'équipement — reflet exact de l'enum Prisma `CategorieEquipement`
// -----------------------------------------------------------------------------

export const CATEGORIES_EQUIPEMENT = [
  "INSTALLATION_ELECTRIQUE",
  "EXTINCTEUR",
  "RIA",
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
  "INSTALLATION_FRIGORIFIQUE",
  "AUTRE",
] as const;

export type CategorieEquipement = (typeof CATEGORIES_EQUIPEMENT)[number];
