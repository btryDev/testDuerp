// Construction des sections de la sidebar — logique pure, sans React,
// pour être testable (l'environnement vitest du projet est `node`).
//
// Refonte de l'arborescence : le découpage précédent (Suivi / Référentiel /
// Administration) était pensé depuis le système. Il est remplacé par un
// découpage adressé au dirigeant non-expert, calqué sur les trois questions
// qu'il se pose : « qu'est-ce que je dois faire ? », « qu'est-ce que j'ai
// déclaré ? », « qu'est-ce que je peux présenter ? ».
//
// Principe : une seule porte par question. Calendrier / Plan d'actions /
// Interventions restent distincts mais sont regroupés sous « À faire »,
// en tête, avec le tableau de bord comme point d'entrée. Tous les registres
// vivent à plat sous « Mes registres » — la divulgation progressive
// (« Autres registres » replié) a été retirée : six entrées se lisent d'un
// coup d'œil et un registre caché se cherchait.

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
  Archive,
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
  | "guide";

/** Ids réellement présents dans le rail (les deux derniers n'étaient pas
 *  adressables auparavant : `/modifier` surlignait « Tableau de bord »). */
export type SidebarItemId = SidebarActive | "fiche" | "equipe";

export type SidebarCounts = {
  equipements?: number;
  verificationsEnRetard?: number;
  actions?: number;
  prestatairesAlertes?: number;
  risquesAReevaluer?: number;
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
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

/** Déduit l'item actif depuis le pathname, à défaut de prop explicite. */
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
  return "tableau";
}

export function construireSections({
  etablissementId,
  counts,
}: {
  etablissementId: string;
  counts?: SidebarCounts;
}): NavSection[] {
  const href = (suffixe: string) =>
    `/etablissements/${etablissementId}${suffixe}`;

  const aFaire: NavItem[] = [
    {
      id: "tableau",
      label: "Tableau de bord",
      href: href(""),
      Icon: LayoutDashboard,
    },
    {
      id: "calendrier",
      label: "Calendrier",
      href: href("/calendrier"),
      Icon: Calendar,
      count: counts?.verificationsEnRetard,
      alert: (counts?.verificationsEnRetard ?? 0) > 0,
    },
    {
      id: "actions",
      label: "Plan d'actions",
      href: href("/actions"),
      Icon: ListChecks,
      count: counts?.actions,
    },
    {
      id: "interventions",
      label: "Interventions",
      href: href("/interventions"),
      Icon: Ticket,
    },
    {
      id: "controle",
      label: "Préparer un contrôle",
      href: href("/controle"),
      Icon: ShieldCheck,
    },
    {
      // Le guide pédagogique répond à la question implicite du dirigeant
      // perdu — « par où je commence ? » — il vit donc dans « À faire »,
      // en dernière position, et plus seulement dans le footer du rail.
      id: "guide",
      label: "Comprendre",
      href: href("/guide"),
      Icon: BookOpen,
    },
  ];

  const monEtablissement: NavItem[] = [
    {
      id: "equipements",
      label: "Équipements",
      href: href("/equipements"),
      Icon: Wrench,
      count: counts?.equipements,
    },
    {
      id: "prestataires",
      label: "Prestataires",
      href: href("/prestataires"),
      Icon: Users,
      count: counts?.prestatairesAlertes,
      alert: (counts?.prestatairesAlertes ?? 0) > 0,
    },
    {
      id: "fiche",
      label: "Fiche établissement",
      href: href("/modifier"),
      Icon: Settings,
    },
    {
      id: "equipe",
      label: "Équipe",
      href: "#",
      Icon: Users,
      // Multi-utilisateurs hors périmètre V2 (cf. CLAUDE.md).
      bientot: true,
    },
  ];

  const registres: NavItem[] = [
    {
      id: "duerp",
      label: "DUERP",
      href: href("/duerp"),
      Icon: FileCheck2,
      count: counts?.risquesAReevaluer,
      alert: (counts?.risquesAReevaluer ?? 0) > 0,
    },
    {
      id: "registre",
      label: "Registre de sécurité",
      href: href("/registre"),
      Icon: FileText,
    },
    {
      id: "accessibilite",
      label: "Accessibilité",
      href: href("/accessibilite"),
      Icon: Accessibility,
    },
    {
      id: "permis-feu",
      label: "Permis de feu",
      href: href("/permis-feu"),
      Icon: Flame,
    },
    {
      id: "plan-prevention",
      label: "Plans de prévention",
      href: href("/plan-prevention"),
      Icon: HandshakeIcon,
    },
    {
      id: "carnet-sanitaire",
      label: "Carnet sanitaire",
      href: href("/carnet-sanitaire"),
      Icon: Droplets,
    },
  ];

  return [
    { title: "À faire", items: aFaire },
    { title: "Mon établissement", items: monEtablissement },
    { title: "Mes registres", items: registres },
  ];
}

// ---------------------------------------------------------------------------
// Rail à deux niveaux.
//
// Le rail principal ne porte plus les items mais les *questions* du
// dirigeant (À faire / Mon établissement / Mes registres) ; les items d'une
// catégorie s'affichent dans un second panneau accolé. « Comprendre » sort
// de la section « À faire » pour devenir une entrée de premier niveau sans
// panneau (lien direct), conformément au découpage demandé. « Compte » est
// la cinquième entrée, rendue par le composant (elle dépend de l'user, pas
// de l'établissement).

export type RailCategorieId =
  | "a-faire"
  | "etablissement"
  | "registres"
  | "comprendre"
  | "compte";

export type RailCategorie = {
  id: RailCategorieId;
  /** Libellé complet — panneau et aria-label. */
  label: string;
  /** Libellé court affiché sous l'icône du rail. */
  labelCourt: string;
  Icon: typeof LayoutDashboard;
  /** Catégorie sans panneau : lien direct. */
  href?: string;
  items?: NavItem[];
  /** Au moins un item du panneau porte une alerte. */
  alert?: boolean;
};

/** Catégorie du rail à laquelle appartient un item — sert à savoir quel
 *  panneau ouvrir et quelle entrée du rail surligner. */
export function categorieDeItem(id: SidebarItemId): RailCategorieId {
  switch (id) {
    case "guide":
      return "comprendre";
    case "equipements":
    case "prestataires":
    case "fiche":
    case "equipe":
      return "etablissement";
    case "duerp":
    case "registre":
    case "accessibilite":
    case "permis-feu":
    case "plan-prevention":
    case "carnet-sanitaire":
      return "registres";
    default:
      return "a-faire";
  }
}

export function construireRail(params: {
  etablissementId: string;
  counts?: SidebarCounts;
}): RailCategorie[] {
  // On dérive du même arbre que le rail simple : mêmes items, mêmes badges —
  // seule la présentation change.
  const [aFaire, etablissement, registres] = construireSections(params);

  // « Comprendre » quitte le panneau « À faire » : il devient une entrée
  // de premier niveau, en lien direct.
  const itemsAFaire = aFaire.items.filter((it) => it.id !== "guide");
  const alerte = (items: NavItem[]) => items.some((it) => it.alert);

  return [
    {
      id: "a-faire",
      label: "À faire",
      labelCourt: "À faire",
      Icon: ListTodo,
      items: itemsAFaire,
      alert: alerte(itemsAFaire),
    },
    {
      id: "etablissement",
      label: "Mon établissement",
      labelCourt: "Établissement",
      Icon: Building2,
      items: etablissement.items,
      alert: alerte(etablissement.items),
    },
    {
      id: "registres",
      label: "Mes registres",
      labelCourt: "Registres",
      Icon: Archive,
      items: registres.items,
      alert: alerte(registres.items),
    },
    {
      id: "comprendre",
      label: "Comprendre",
      labelCourt: "Comprendre",
      Icon: BookOpen,
      href: `/etablissements/${params.etablissementId}/guide`,
    },
  ];
}
