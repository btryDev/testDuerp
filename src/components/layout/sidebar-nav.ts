// Construction des sections de la sidebar — logique pure, sans React,
// pour être testable (l'environnement vitest du projet est `node`).
//
// Refonte de l'arborescence : le découpage précédent (Suivi / Référentiel /
// Administration) était pensé depuis le système. Il est remplacé par un
// découpage adressé au dirigeant non-expert, calqué sur les trois questions
// qu'il se pose : « qu'est-ce que je dois faire ? », « qu'est-ce que j'ai
// déclaré ? », « qu'est-ce que je peux présenter ? ».
//
// Deux principes complémentaires :
//
//   1. Une seule porte par question. Calendrier / Plan d'actions /
//      Interventions restent distincts mais sont regroupés sous « À faire »,
//      en tête, avec le tableau de bord comme point d'entrée.
//
//   2. Divulgation progressive des registres de domaine. Un bureau de six
//      personnes n'a pas à voir « Permis de feu » et « Carnet sanitaire »
//      dans son rail permanent. Ces entrées sont repliées tant que
//      l'établissement n'a rien déclaré dedans.
//
// Garde-fou important (cf. CLAUDE.md — « l'outil ne dit jamais vous êtes
// conforme ») : replier n'est PAS déclarer inapplicable. On ne se sert
// jamais d'une déduction juridique pour masquer une entrée — uniquement de
// faits observables (il existe des permis de feu enregistrés, l'établissement
// est déclaré ERP…). Les entrées repliées restent accessibles en un clic,
// sous un libellé neutre, et rien dans l'UI n'affirme qu'elles ne concernent
// pas l'utilisateur.

import {
  LayoutDashboard,
  Wrench,
  Calendar,
  FileText,
  ListChecks,
  FileCheck2,
  Settings,
  Users,
  Accessibility,
  Flame,
  HandshakeIcon,
  Droplets,
  Ticket,
  ShieldCheck,
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

/**
 * Faits observables servant à décider ce qui est replié. Volontairement
 * factuel : aucun champ ne porte de jugement d'applicabilité réglementaire.
 * Quand le profil est absent (ex. shell DUERP, qui ne charge pas ces
 * compteurs), on n'infère rien et on déplie tout.
 */
export type ProfilRegistres = {
  estERP: boolean;
  aRegistreAccessibilite: boolean;
  nbPermisFeu: number;
  nbPlansPrevention: number;
  aCarnetSanitaire: boolean;
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
  /** Entrées repliées derrière une divulgation (« Autres registres »). */
  repliables?: NavItem[];
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

/**
 * Un registre de domaine est mis en avant s'il porte déjà de la matière,
 * ou si un fait déclaré le rend structurellement certain (ERP → registre
 * public d'accessibilité, art. L. 141-13 CCH). Sinon il est replié.
 */
function estMisEnAvant(
  id: SidebarItemId,
  profil: ProfilRegistres | undefined,
): boolean {
  if (!profil) return true; // pas d'info → on ne masque rien
  switch (id) {
    case "accessibilite":
      return profil.estERP || profil.aRegistreAccessibilite;
    case "permis-feu":
      return profil.nbPermisFeu > 0;
    case "plan-prevention":
      return profil.nbPlansPrevention > 0;
    case "carnet-sanitaire":
      return profil.aCarnetSanitaire;
    default:
      return true;
  }
}

export function construireSections({
  etablissementId,
  counts,
  profil,
  actif,
}: {
  etablissementId: string;
  counts?: SidebarCounts;
  profil?: ProfilRegistres;
  actif: SidebarItemId;
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

  // Toujours visibles : les deux registres transverses, quel que soit le
  // profil de l'établissement.
  const registresSocle: NavItem[] = [
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
  ];

  const registresDomaine: NavItem[] = [
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

  // L'item actif remonte toujours dans la liste principale : sinon on
  // navigue vers un registre replié et le rail « oublie » où l'on est.
  const visibles = registresDomaine.filter(
    (it) => it.id === actif || estMisEnAvant(it.id, profil),
  );
  const repliables = registresDomaine.filter((it) => !visibles.includes(it));

  return [
    { title: "À faire", items: aFaire },
    { title: "Mon établissement", items: monEtablissement },
    {
      title: "Mes registres",
      items: [...registresSocle, ...visibles],
      repliables: repliables.length > 0 ? repliables : undefined,
    },
  ];
}
