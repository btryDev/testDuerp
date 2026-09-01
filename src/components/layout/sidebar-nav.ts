// Construction des sections de la sidebar — logique pure, sans React,
// pour être testable (l'environnement vitest du projet est `node`).
//
// Refonte de l'arborescence : le découpage précédent (Suivi / Référentiel /
// Administration) était pensé depuis le système. Il est remplacé par un
// découpage adressé au dirigeant non-expert, calqué sur les trois questions
// qu'il se pose : « qu'est-ce que je dois faire ? », « qu'est-ce que j'ai
// déclaré ? », « qu'est-ce que je peux présenter ? ».
//
// Principe : une seule porte par question. Le panneau « À faire » ne porte que
// des **activités** — jamais l'état filtré d'une autre entrée. Un filtre est
// un réglage d'écran, il vit dans l'écran ; le promouvoir en entrée de
// navigation crée deux lignes voisines qui décrivent partiellement le même
// objet avec deux compteurs différents (cf. ADR-015, révision).
//
// Le tableau de bord, lui, n'est pas une chose à faire : c'est un résumé. Il
// n'a donc ni entrée de panneau ni entrée de rail — il est la page
// d'accueil du dossier, et c'est la marque en tête de rail qui y ramène,
// comme un logo ramène à l'accueil partout ailleurs (ADR-015, révision).
//
// Tous les registres vivent à plat sous « Mes registres » — la divulgation
// progressive (« Autres registres » replié) a été retirée : les entrées se
// lisent d'un coup d'œil et un registre caché se cherchait.
//
// Ce qui fait un registre : il se tient **en continu** et s'ouvre une fois.
// Le permis de feu et le plan de prévention n'en sont pas — ils naissent
// d'un chantier daté et meurent clos. Ils ont leur propre catégorie,
// « Opérations » (ADR-017), qui porte le même mot que la famille d'échéance
// correspondante au calendrier : l'utilisateur l'apprend une fois.
//
// Les registres sont **qualifiés, jamais masqués**. La navigation était le
// seul endroit du produit à ne rien savoir de l'établissement : elle offrait
// « Accessibilité » à un non-ERP, dont la page répond « Non applicable », et
// alignait six portes dont trois ou quatre ouvraient sur une pièce vide au
// lendemain de l'onboarding. Elle applique désormais la même doctrine que la
// matrice du tableau de bord (cf. `src/lib/dashboard/obligations.ts`) :
//
//   actif          — le registre concerne l'établissement, traitement normal
//   non-ouvert     — événementiel, pas encore commencé ; l'entrée reste un
//                    lien (c'est par là qu'on ouvre le registre le jour venu)
//   non-applicable — l'obligation ne vise pas cet établissement ; l'entrée
//                    reste un lien, la page explique et permet de corriger
//                    le régime si la déclaration était fausse
//
// Rien ne disparaît donc de la liste : masquer rendrait un registre
// introuvable le jour où il devient nécessaire, et c'est exactement ce qui
// avait fait retirer la divulgation progressive. L'entrée dit son état plutôt
// que de laisser croire à un dossier vide.

import {
  LayoutDashboard,
  Wrench,
  Calendar,
  FileText,
  NotebookText,
  ListChecks,
  ListTodo,
  FileCheck2,
  Settings,
  Users,
  IdCard,
  Accessibility,
  Flame,
  HandshakeIcon,
  Droplets,
  ShieldCheck,
  Building2,
  Warehouse,
  HardHat,
  Archive,
  CircleCheck,
} from "lucide-react";

/** Ids historiques — conservés tels quels pour la prop `active`. */
export type SidebarActive =
  | "tableau"
  | "equipements"
  | "calendrier"
  | "registre"
  | "actions"
  | "prestataires"
  | "accessibilite"
  | "permis-feu"
  | "plan-prevention"
  | "carnet-sanitaire"
  | "controle"
  | "etats-permanents"
  | "duerp"
  | "guide"
  | "connecter";

/** Ids réellement présents dans le rail (les deux derniers n'étaient pas
 *  adressables auparavant : `/modifier` surlignait « Tableau de bord »). */
export type SidebarItemId = SidebarActive | "batiments" | "fiche" | "prescriptions" | "equipe";

/**
 * Le nom de chaque écran, en un seul endroit. La sidebar s'en sert pour
 * intituler ses entrées ; `src/lib/navigation/provenance.ts` s'en sert pour
 * intituler un lien de retour. Les deux doivent nommer un écran de la même
 * façon, sans quoi le fil de retour dit « Calendrier » là où le rail dit
 * autre chose.
 */
export const LABEL_ITEM: Record<SidebarItemId, string> = {
  tableau: "Tableau de bord",
  calendrier: "Calendrier",
  actions: "Plan d'actions",
  controle: "Préparer un contrôle",
  // « Ce qui doit être en place » et non « États permanents » : le second est
  // le vocabulaire de l'ADR-022, pas celui d'un dirigeant. L'identifiant et la
  // route gardent le terme technique — c'est le rôle de cette table que de les
  // découpler.
  "etats-permanents": "Ce qui doit être en place",
  guide: "Comprendre",
  // L'identifiant et la route restent `connecter` : renommer une URL casse
  // les liens déjà partagés et les provenances enregistrées, pour un gain
  // nul. Seul le nom affiché change — c'est précisément le rôle de cette
  // table que de les découpler.
  connecter: "Paramètres",
  equipements: "Équipements",
  batiments: "Zones",
  prestataires: "Prestataires",
  prescriptions: "Prescriptions particulières",
  fiche: "Fiche établissement",
  equipe: "Équipe",
  duerp: "DUERP",
  registre: "Registre de sécurité",
  accessibilite: "Accessibilité",
  "permis-feu": "Permis de feu",
  "plan-prevention": "Plans de prévention",
  "carnet-sanitaire": "Carnet sanitaire",
};

export type SidebarCounts = {
  equipements?: number;
  /** Échéances dépassées, **toutes familles** (vérifications + registre
   *  d'échéances, ADR-010). Un seul nombre, un seul périmètre : deux
   *  compteurs voisins de périmètres différents se sont déjà contredits
   *  une fois (ADR-015). Cf. `repartirRetards`. */
  enRetardTotal?: number;
  actions?: number;
  prestatairesAlertes?: number;
  /** Titres de salariés dont l'échéance est dépassée, effectif actif
   *  seulement. Un titre sans terme écrit n'y entre pas : il n'est pas en
   *  attente, il n'a simplement pas de rendez-vous (ADR-023 § 6). */
  titresEnRetard?: number;
};

/**
 * État d'un registre vis-à-vis de l'établissement. Voir l'en-tête du fichier
 * pour la doctrine — et `EtatModule` n'est jamais un jugement de conformité :
 * il dit si l'obligation vise l'établissement et si le registre est commencé,
 * pas si le dossier est en règle.
 */
export type EtatModule = "actif" | "non-ouvert" | "non-applicable";

/**
 * Ce que la sidebar a besoin de savoir de l'établissement pour qualifier les
 * registres. Mêmes signaux que `ModulesMatrice` côté tableau de bord, réduits
 * à ce qui change l'état d'une entrée.
 *
 * Optionnel à l'appel : sans lui, tout est rendu « actif » — la sidebar se
 * comporte alors comme avant. Un appelant qui ne peut pas fournir l'état vaut
 * mieux qu'une entrée qualifiée à tort.
 */
export type SidebarModules = {
  estERP: boolean;
  /** Permis de feu créés, tous statuts confondus. */
  nbPermisFeu: number;
  /** Plans de prévention créés, tous statuts confondus. */
  nbPlansPrevention: number;
  /** Le carnet sanitaire a été ouvert (la présence d'un réseau ECS ne se
   *  déduit pas : c'est la création du carnet qui fait foi). */
  carnetSanitaireExiste: boolean;
};

/** Ordre d'affichage des registres : ce qui concerne l'établissement d'abord. */
const RANG_ETAT: Record<EtatModule, number> = {
  actif: 0,
  "non-ouvert": 1,
  "non-applicable": 2,
};

export type NavItem = {
  id: SidebarItemId;
  label: string;
  href: string;
  Icon: typeof LayoutDashboard;
  count?: number;
  alert?: boolean;
  /** Destination pas encore implémentée : rendue inerte et signalée comme
   *  telle plutôt qu'en lien mort indiscernable d'un lien réel. */
  bientot?: boolean;
  /** Registres et opérations. Absent = rien à qualifier (toujours actif). */
  etat?: EtatModule;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

/**
 * Déduit l'item actif depuis le pathname, à défaut de prop explicite.
 *
 * L'arborescence tient **entièrement dans le chemin**. Un filtre d'écran
 * (`?famille=`, `?vue=`) est un réglage, pas une place dans l'arbre : le
 * panneau ne porte aucune entrée qui soit l'état filtré d'une autre.
 */
export function deduireActif(
  pathname: string,
  etablissementId: string,
): SidebarItemId {
  const base = `/etablissements/${etablissementId}`;
  if (pathname === `${base}/modifier`) return "fiche";
  if (pathname === base) return "tableau";
  if (pathname.startsWith(`${base}/calendrier`)) return "calendrier";
  if (pathname.startsWith(`${base}/verifications`)) return "calendrier";
  if (pathname.startsWith(`${base}/actions`)) return "actions";
  if (pathname.startsWith(`${base}/registre`)) return "registre";
  if (pathname.startsWith(`${base}/equipements`)) return "equipements";
  if (pathname.startsWith(`${base}/batiments`)) return "batiments";
  if (pathname.startsWith(`${base}/prestataires`)) return "prestataires";
  if (pathname.startsWith(`${base}/equipe`)) return "equipe";
  if (pathname.startsWith(`${base}/prescriptions`)) return "prescriptions";
  if (pathname.startsWith(`${base}/accessibilite`)) return "accessibilite";
  if (pathname.startsWith(`${base}/permis-feu`)) return "permis-feu";
  if (pathname.startsWith(`${base}/plan-prevention`)) return "plan-prevention";
  if (pathname.startsWith(`${base}/carnet-sanitaire`)) return "carnet-sanitaire";
  if (pathname.startsWith(`${base}/etats-permanents`)) return "etats-permanents";
  if (pathname.startsWith(`${base}/controle`)) return "controle";
  if (pathname.startsWith(`${base}/duerp`)) return "duerp";
  if (pathname.startsWith(`${base}/guide`)) return "guide";
  if (pathname.startsWith(`${base}/connecter`)) return "connecter";
  return "tableau";
}

export function construireSections({
  etablissementId,
  counts,
  modules,
}: {
  etablissementId: string;
  counts?: SidebarCounts;
  modules?: SidebarModules;
}): NavSection[] {
  const href = (suffixe: string) =>
    `/etablissements/${etablissementId}${suffixe}`;

  const aFaire: NavItem[] = [
    {
      id: "calendrier",
      label: LABEL_ITEM.calendrier,
      href: href("/calendrier"),
      Icon: Calendar,
      count: counts?.enRetardTotal,
      alert: (counts?.enRetardTotal ?? 0) > 0,
    },
    {
      id: "actions",
      label: LABEL_ITEM.actions,
      href: href("/actions"),
      Icon: ListChecks,
      count: counts?.actions,
    },
    // Quatrième activité du panneau, et non une entrée de rail.
    //
    // L'ADR-022 nomme quatre natures d'obligation ; la première — l'échéance
    // récurrente — a le calendrier, la deuxième n'avait aucune surface. Elle se
    // range ici parce que les deux répondent à la même question du dirigeant :
    // « qu'est-ce que j'ai à faire ». La décision 4 de l'ADR-015 pose que ce
    // panneau ne porte que des ACTIVITÉS et qu'aucune entrée n'est l'état
    // filtré d'une autre ; mettre en place est une activité, et ce n'est pas un
    // filtre du calendrier — `estSansRendezVous` fait que ces lignes ne peuvent
    // pas y exister.
    //
    // PAS DE `count`, délibérément. Le badge du Calendrier compte des retards ;
    // ici rien n'est en retard, puisque rien n'a d'échéance. Un compteur voisin
    // portant un autre périmètre est exactement ce que la décision 5 du même
    // ADR interdit — « un seul compteur de retard, un seul périmètre ».
    {
      id: "etats-permanents",
      label: LABEL_ITEM["etats-permanents"],
      href: href("/etats-permanents"),
      Icon: CircleCheck,
    },
    {
      id: "controle",
      label: LABEL_ITEM.controle,
      href: href("/controle"),
      Icon: ShieldCheck,
    },
  ];

  const monEtablissement: NavItem[] = [
    {
      id: "equipements",
      label: LABEL_ITEM.equipements,
      href: href("/equipements"),
      Icon: Wrench,
      count: counts?.equipements,
    },
    {
      // Toujours présent, même sous une seule zone : c'est ici qu'on en déclare
      // un second. Le reste de l'interface (sélecteurs, filtres, colonnes)
      // n'apparaît qu'à partir de deux (ADR-019).
      id: "batiments",
      label: LABEL_ITEM.batiments,
      href: href("/batiments"),
      Icon: Warehouse,
    },
    {
      id: "prestataires",
      label: LABEL_ITEM.prestataires,
      href: href("/prestataires"),
      Icon: Users,
      count: counts?.prestatairesAlertes,
      alert: (counts?.prestatairesAlertes ?? 0) > 0,
    },
    {
      id: "fiche",
      label: LABEL_ITEM.fiche,
      href: href("/modifier"),
      Icon: Settings,
    },
    {
      id: "prescriptions",
      label: "Prescriptions",
      href: href("/prescriptions"),
      Icon: FileText,
    },
    {
      id: "equipe",
      label: LABEL_ITEM.equipe,
      href: href("/equipe"),
      // `Users` nommait déjà « Prestataires » : la même icône ne peut pas
      // désigner deux objets. `IdCard` est aussi plus juste ici — l'écran ne
      // gère pas des personnes en tant qu'utilisateurs, il tient le registre
      // des titres nominatifs qu'elles détiennent.
      Icon: IdCard,
      count: counts?.titresEnRetard,
      alert: (counts?.titresEnRetard ?? 0) > 0,
    },
  ];

  // Qualification des registres. Les règles reprennent une à une celles de
  // `ModulesMatrice` (`src/lib/dashboard/obligations.ts`), pour que la
  // navigation et la matrice ne racontent jamais deux choses différentes du
  // même établissement.
  //
  //   · DUERP et registre de sécurité : jamais qualifiés. Tout employeur tient
  //     un DUERP (R. 4121-1) ; le registre de sécurité reçoit les rapports de
  //     n'importe quelle vérification, donc de tout établissement.
  //   · Accessibilité : obligation propre aux ERP. Elle reste « actif » dès que
  //     l'établissement est ERP, même si le registre n'est pas encore créé —
  //     c'est précisément ce qu'il reste à faire.
  //   · Carnet sanitaire : la présence d'un réseau d'eau chaude collectif ne se
  //     déduit d'aucune donnée déclarée ; l'ouverture du carnet fait foi.
  const etat = (valeur: EtatModule): EtatModule | undefined =>
    modules ? valeur : undefined;
  const evenementiel = (enCours: boolean) =>
    etat(enCours ? "actif" : "non-ouvert");

  // Les deux opérations ponctuelles sont **événementielles** au même titre
  // qu'un registre non ouvert : l'entrée reste un lien, c'est par là qu'on
  // ouvre le permis le jour du chantier. Elles ne sont pas triées — à deux,
  // le rang n'ordonne rien, et la page d'entrée de la catégorie doit rester
  // stable.
  const operations: NavItem[] = [
    {
      id: "permis-feu",
      label: LABEL_ITEM["permis-feu"],
      href: href("/permis-feu"),
      Icon: Flame,
      etat: evenementiel((modules?.nbPermisFeu ?? 0) > 0),
    },
    {
      id: "plan-prevention",
      label: LABEL_ITEM["plan-prevention"],
      href: href("/plan-prevention"),
      Icon: HandshakeIcon,
      etat: evenementiel((modules?.nbPlansPrevention ?? 0) > 0),
    },
  ];

  const registres: NavItem[] = [
    {
      id: "duerp",
      label: LABEL_ITEM.duerp,
      href: href("/duerp"),
      Icon: FileCheck2,
    },
    {
      id: "registre",
      label: LABEL_ITEM.registre,
      href: href("/registre"),
      // `FileText` nommait aussi « Prescriptions ». Collision antérieure à
      // l'entrée Équipe, révélée par le test d'unicité : un registre est un
      // cahier qu'on tient, une prescription est une pièce qu'on reçoit — les
      // deux ne peuvent pas porter la même icône.
      Icon: NotebookText,
    },
    {
      id: "accessibilite",
      label: LABEL_ITEM.accessibilite,
      href: href("/accessibilite"),
      Icon: Accessibility,
      etat: etat(modules?.estERP ? "actif" : "non-applicable"),
    },
    {
      id: "carnet-sanitaire",
      label: LABEL_ITEM["carnet-sanitaire"],
      href: href("/carnet-sanitaire"),
      Icon: Droplets,
      etat: evenementiel(modules?.carnetSanitaireExiste ?? false),
    },
  ];

  // Ce qui concerne l'établissement remonte, le reste suit dans l'ordre
  // d'origine. Tri stable : sans `modules`, tous les rangs valent 0 et la
  // liste garde exactement l'ordre déclaré ci-dessus.
  registres.sort(
    (a, b) => RANG_ETAT[a.etat ?? "actif"] - RANG_ETAT[b.etat ?? "actif"],
  );

  return [
    { title: "À faire", items: aFaire },
    { title: "Opérations", items: operations },
    { title: "Mon établissement", items: monEtablissement },
    { title: "Mes registres", items: registres },
  ];
}

// ---------------------------------------------------------------------------
// Rail à deux niveaux.
//
// Le rail principal ne porte plus les items mais les *questions* du
// dirigeant (À faire / Opérations / Mon établissement / Mes registres) ; les
// items d'une catégorie s'affichent dans un second panneau accolé.
//
// Ordre : les deux catégories d'activité d'abord — ce qui revient tout seul
// (« À faire ») puis ce qu'un chantier déclenche (« Opérations ») —, les deux
// catégories descriptives ensuite (ADR-017).
//
// Règle (ADR-015) : **une entrée de rail = une page d'entrée + un panneau**.
// Toute catégorie porte donc un `href` : cliquer navigue *et* ouvre le
// panneau. Auparavant, une icône de premier niveau n'était qu'un tiroir —
// deux clics obligatoires pour arriver quelque part.
//
// Le tableau de bord n'y figure pas : c'est l'écran d'atterrissage, et on
// y revient par la marque en tête de rail — une entrée de plus l'aurait mis
// au même rang que les quatre questions, alors qu'il les résume toutes.
// « Paramètres » ferme la marche, sans panneau. « Comprendre » a quitté le
// rail : le guide reste en ligne (`/guide`) mais n'est plus une des questions
// du dirigeant — c'est une lecture, pas un endroit où l'on travaille, et une
// entrée de rail permanente lui donnait le même rang qu'un registre tenu.
//
// « Compte » n'est plus une entrée de rail : elle a rejoint la barre haute
// (`BarreCompte`). Le partage tient en une phrase — la sidebar porte la
// hiérarchie du **produit**, la barre haute porte les utilitaires de
// **session**. Ce déménagement est aussi ce qui justifie la barre : sans le
// compte, elle n'aurait rien à porter, le produit n'ayant ni recherche ni
// notifications.
//
// Cette dernière phrase ajoutait « ni établissement à commuter » jusqu'au
// 2026-09-01. L'ADR-028 l'a retirée du réel : une entreprise porte autant
// d'établissements qu'elle en a, et le sélecteur vit dans la barre haute — pas
// dans le rail. Le partage ne change pas pour autant, il se confirme : commuter
// d'établissement répond à « où je travaille », qui est un repère de session au
// même titre que « qui je suis », et non une branche du produit. Le rail, lui,
// reste celui de l'établissement où l'on se trouve.

export type RailCategorieId =
  | "tableau"
  | "a-faire"
  | "operations"
  | "etablissement"
  | "registres"
  | "parametres";

export type RailCategorie = {
  id: RailCategorieId;
  /** Libellé complet — panneau et aria-label. */
  label: string;
  /** Libellé court affiché sous l'icône du rail. */
  labelCourt: string;
  Icon: typeof LayoutDashboard;
  /** Page d'entrée de la catégorie — toujours présente : cliquer une
   *  entrée de rail navigue (ADR-015). */
  href: string;
  /** Absent = catégorie sans panneau (lien seul). */
  items?: NavItem[];
  /** Au moins un item du panneau porte une alerte. */
  alert?: boolean;
  /** Marque la césure entre les catégories du dossier et les modes
   *  d'accès. Portée par la donnée plutôt que devinée au rendu. */
  separateurAvant?: boolean;
};

/**
 * Catégorie du rail à laquelle appartient un item — sert à savoir quel
 * panneau ouvrir et quelle entrée du rail surligner.
 *
 * `null` quand la page n'appartient à aucune entrée : rien ne s'allume, rien
 * ne s'ouvre. C'est le cas du guide, qui a perdu son entrée de rail mais pas
 * sa page. Le rattacher au voisin le plus proche allumait « Paramètres » sur
 * un écran qui n'est pas dedans, et la tuile menait ailleurs — l'ADR-015
 * veut qu'une entrée de rail désigne une page, pas une approximation.
 */
export function categorieDeItem(id: SidebarItemId): RailCategorieId | null {
  switch (id) {
    case "tableau":
      return "tableau";
    case "guide":
      return null;
    case "connecter":
      return "parametres";
    case "equipements":
    case "batiments":
    case "prestataires":
    case "fiche":
    case "prescriptions":
    case "equipe":
      return "etablissement";
    case "permis-feu":
    case "plan-prevention":
      return "operations";
    case "duerp":
    case "registre":
    case "accessibilite":
    case "carnet-sanitaire":
      return "registres";
    default:
      return "a-faire";
  }
}

export function construireRail(params: {
  etablissementId: string;
  counts?: SidebarCounts;
  modules?: SidebarModules;
}): RailCategorie[] {
  // On dérive du même arbre que le rail simple : mêmes items, mêmes badges —
  // seule la présentation change.
  const [aFaire, operations, etablissement, registres] =
    construireSections(params);
  const base = `/etablissements/${params.etablissementId}`;
  const alerte = (items: NavItem[]) => items.some((it) => it.alert);

  return [
    {
      id: "a-faire",
      label: "À faire",
      labelCourt: "À faire",
      Icon: ListTodo,
      href: `${base}/calendrier`,
      items: aFaire.items,
      alert: alerte(aFaire.items),
    },
    {
      // Le ponctuel encadré : un permis de feu naît le jour d'un chantier,
      // un plan de prévention le jour où un tiers intervient. Ni des
      // corrections, ni des registres tenus en continu (ADR-017).
      id: "operations",
      label: "Opérations",
      labelCourt: "Opérations",
      Icon: HardHat,
      href: `${base}/permis-feu`,
      items: operations.items,
      alert: alerte(operations.items),
    },
    {
      id: "etablissement",
      label: "Mon établissement",
      labelCourt: "Établissement",
      Icon: Building2,
      href: `${base}/equipements`,
      items: etablissement.items,
      alert: alerte(etablissement.items),
    },
    {
      id: "registres",
      label: "Mes registres",
      labelCourt: "Registres",
      Icon: Archive,
      href: `${base}/duerp`,
      items: registres.items,
      alert: alerte(registres.items),
    },
    {
      // Une entrée de premier niveau sans panneau. Elle n'apparaît pas dans
      // `construireSections` — ce n'est ni un registre ni une tâche, mais la
      // façon de régler le dossier et d'y brancher un tiers.
      id: "parametres",
      label: "Paramètres",
      labelCourt: "Paramètres",
      Icon: Settings,
      href: `${base}/connecter`,
      separateurAvant: true,
    },
  ];
}
