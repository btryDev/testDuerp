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
// a quitté ce panneau pour une entrée de rail à part entière (ADR-015), sans
// quoi la porte d'entrée du produit restait rangée dans un tiroir.
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
  ListChecks,
  ListTodo,
  FileCheck2,
  Settings,
  Users,
  Accessibility,
  Flame,
  HandshakeIcon,
  Droplets,
  Ticket,
  ShieldCheck,
  BookOpen,
  Building2,
  HardHat,
  Archive,
  Plug,
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
  | "interventions"
  | "controle"
  | "duerp"
  | "guide"
  | "connecter";

/** Ids réellement présents dans le rail (les deux derniers n'étaient pas
 *  adressables auparavant : `/modifier` surlignait « Tableau de bord »). */
export type SidebarItemId = SidebarActive | "fiche" | "equipe";

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
  interventions: "Interventions",
  controle: "Préparer un contrôle",
  guide: "Comprendre",
  connecter: "Connecter",
  equipements: "Équipements",
  prestataires: "Prestataires",
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
  risquesAReevaluer?: number;
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
  if (pathname.startsWith(`${base}/prestataires`)) return "prestataires";
  if (pathname.startsWith(`${base}/accessibilite`)) return "accessibilite";
  if (pathname.startsWith(`${base}/permis-feu`)) return "permis-feu";
  if (pathname.startsWith(`${base}/plan-prevention`)) return "plan-prevention";
  if (pathname.startsWith(`${base}/carnet-sanitaire`)) return "carnet-sanitaire";
  if (pathname.startsWith(`${base}/interventions`)) return "interventions";
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
    {
      id: "interventions",
      label: LABEL_ITEM.interventions,
      href: href("/interventions"),
      Icon: Ticket,
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
      id: "equipe",
      label: LABEL_ITEM.equipe,
      href: "#",
      Icon: Users,
      // Multi-utilisateurs hors périmètre V2 (cf. CLAUDE.md).
      bientot: true,
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
      count: counts?.risquesAReevaluer,
      alert: (counts?.risquesAReevaluer ?? 0) > 0,
    },
    {
      id: "registre",
      label: LABEL_ITEM.registre,
      href: href("/registre"),
      Icon: FileText,
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
// « Tableau de bord » ouvre le rail : c'est l'écran d'atterrissage, et un
// résumé n'a pas sa place dans une liste de tâches. « Comprendre » et
// « Connecter » ferment la marche, sans panneau. « Compte » est rendue par
// le composant (elle dépend de l'user, pas de l'établissement).

export type RailCategorieId =
  | "tableau"
  | "a-faire"
  | "operations"
  | "etablissement"
  | "registres"
  | "comprendre"
  | "connecter"
  | "compte";

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

/** Catégorie du rail à laquelle appartient un item — sert à savoir quel
 *  panneau ouvrir et quelle entrée du rail surligner. */
export function categorieDeItem(id: SidebarItemId): RailCategorieId {
  switch (id) {
    case "tableau":
      return "tableau";
    case "guide":
      return "comprendre";
    case "connecter":
      return "connecter";
    case "equipements":
    case "prestataires":
    case "fiche":
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
      // Sans panneau, et c'est le propos : le tableau de bord n'a rien à
      // ranger, il montre.
      id: "tableau",
      label: LABEL_ITEM.tableau,
      labelCourt: "Tableau",
      Icon: LayoutDashboard,
      href: base,
    },
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
      id: "comprendre",
      label: "Comprendre",
      labelCourt: "Comprendre",
      Icon: BookOpen,
      href: `${base}/guide`,
      separateurAvant: true,
    },
    {
      // Comme « Comprendre » : une entrée de premier niveau sans panneau.
      // Elle n'apparaît pas dans `construireSections` — ce n'est pas un
      // registre ni une tâche, mais un mode d'accès au dossier.
      id: "connecter",
      label: "Connecter",
      labelCourt: "Connecter",
      Icon: Plug,
      href: `${base}/connecter`,
    },
  ];
}
