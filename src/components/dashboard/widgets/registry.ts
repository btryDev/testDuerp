// Registre central des widgets du tableau de bord.
// Chaque entrée : id stable, taille, variants, composant de rendu,
// statut par défaut (inclus ou masqué).

import { WidgetEtablissement } from "./impl/etablissement";
import { WidgetScore } from "./impl/score";
import {
  WidgetKpiEnRetard,
  WidgetKpiSous30j,
  WidgetKpiActions,
  WidgetKpiRapports,
} from "./impl/kpis";
import { WidgetBarsObligations } from "./impl/bars";
import { WidgetProchainesEcheances } from "./impl/echeances";
import {
  WidgetPlanActions,
  WidgetRegistre,
  WidgetEquipements,
  WidgetDuerp,
  WidgetGuide,
  WidgetRecos,
} from "./impl/simples";
import { WidgetCalendrierType } from "./impl/calendrier-type";
import {
  WidgetIndicateurs,
  WidgetEcheances,
  WidgetActivite,
} from "./impl/groupes";
import { WidgetDocuments } from "./impl/documents";
import { WidgetFocusAction } from "./impl/focus-action";
import { WidgetCountdown } from "./impl/countdown";
import { WidgetAnciennete } from "./impl/anciennete";
import { WidgetSemaine } from "./impl/semaine";
import { WidgetFluxRegistre } from "./impl/flux-registre";
import { WidgetMeteo } from "./impl/meteo";
import type { LayoutItem, WidgetDefinition, WidgetId } from "./types";

export const REGISTRY: Record<WidgetId, WidgetDefinition> = {
  etablissement: {
    id: "etablissement",
    titre: "Identité établissement",
    description:
      "Carte d'identité de l'établissement — raison, adresse, effectif, NAF/SIRET, régimes, avec un CTA vers un préventeur. Widget obligatoire, non retirable.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetEtablissement,
    obligatoire: true,
  },
  score: {
    id: "score",
    titre: "Score de conformité",
    description:
      "Indicateur global + détail par famille. Trois visualisations disponibles.",
    taille: "medium",
    variants: [
      { id: "anneau", label: "Anneau" },
      { id: "gauge", label: "Jauge" },
      { id: "nombre", label: "Nombre seul" },
    ],
    defaultVariant: "anneau",
    Component: WidgetScore,
  },
  indicateurs: {
    id: "indicateurs",
    titre: "Indicateurs",
    description:
      "Vue d'ensemble en 6 chiffres : en retard · à planifier · sous 30 j, puis actions en cours · rapports 12 m · délai depuis le dernier rapport.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetIndicateurs,
  },
  echeances: {
    id: "echeances",
    titre: "Échéances (séparé)",
    description:
      "Compteurs vérifications isolés — déjà inclus dans le widget « Indicateurs ».",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetEcheances,
    exclueDuDefaut: true,
  },
  activite: {
    id: "activite",
    titre: "Activité (séparé)",
    description:
      "Compteurs actions & rapports isolés — déjà inclus dans le widget « Indicateurs ».",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetActivite,
    exclueDuDefaut: true,
  },
  "kpi-en-retard": {
    id: "kpi-en-retard",
    titre: "KPI · En retard",
    description:
      "Compteur isolé des vérifications dépassées (déjà présent dans Échéances).",
    taille: "small",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetKpiEnRetard,
    exclueDuDefaut: true,
  },
  "kpi-sous-30j": {
    id: "kpi-sous-30j",
    titre: "KPI · Échéances sous 30 j",
    description:
      "Compteur isolé des vérifications à planifier sous un mois (déjà présent dans Échéances).",
    taille: "small",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetKpiSous30j,
    exclueDuDefaut: true,
  },
  "kpi-actions": {
    id: "kpi-actions",
    titre: "KPI · Actions en cours",
    description:
      "Compteur isolé des actions ouvertes (déjà présent dans Activité).",
    taille: "small",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetKpiActions,
    exclueDuDefaut: true,
  },
  "kpi-rapports": {
    id: "kpi-rapports",
    titre: "KPI · Rapports 12 mois",
    description:
      "Compteur isolé des rapports déposés sur 12 mois (déjà présent dans Activité).",
    taille: "small",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetKpiRapports,
    exclueDuDefaut: true,
  },
  "bars-obligations": {
    id: "bars-obligations",
    titre: "Obligations · volumes",
    description:
      "Volume d'obligations par mois, réparti par statut. Vue chiffrée complémentaire à la frise « Calendrier ».",
    taille: "medium",
    variants: [
      { id: "bars", label: "Barres" },
      { id: "radial", label: "Donut" },
    ],
    defaultVariant: "bars",
    Component: WidgetBarsObligations,
    exclueDuDefaut: true,
  },
  "prochaines-echeances": {
    id: "prochaines-echeances",
    titre: "Prochaines échéances",
    description:
      "Les 5 prochaines vérifications — en liste ou sur une frise horizontale.",
    taille: "medium",
    variants: [
      { id: "list", label: "Liste" },
      { id: "timeline", label: "Frise" },
    ],
    defaultVariant: "list",
    Component: WidgetProchainesEcheances,
  },
  "plan-actions": {
    id: "plan-actions",
    titre: "Plan d'actions",
    description: "Actions correctives en cours, triées par échéance.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetPlanActions,
  },
  registre: {
    id: "registre",
    titre: "Registre — dernières entrées",
    description: "Les 4 derniers rapports déposés au registre de sécurité.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetRegistre,
  },
  "equipements-grid": {
    id: "equipements-grid",
    titre: "Équipements",
    description: "Grille des équipements déclarés + bouton d'ajout rapide.",
    taille: "large",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetEquipements,
  },
  documents: {
    id: "documents",
    titre: "Vos documents",
    description:
      "Hub consolidé : DUERP, registre, plan d'actions, dossier complet — Voir · Télécharger · « à faire » contextuel par ligne.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetDocuments,
  },
  duerp: {
    id: "duerp",
    titre: "DUERP",
    description:
      "Accès rapide à la dernière version du Document Unique (déjà inclus dans le hub « Vos documents »).",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetDuerp,
    exclueDuDefaut: true,
  },
  guide: {
    id: "guide",
    titre: "Guide pédagogique",
    description:
      "Rappel des obligations, du rythme annuel et des rôles — lien vers la page Comprendre.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetGuide,
  },
  recos: {
    id: "recos",
    titre: "À faire en priorité",
    description:
      "Les 3 actions les plus urgentes (vérif dépassée, action en retard, DUERP à jour). Masqué par défaut car redondant avec les prochaines échéances.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetRecos,
    exclueDuDefaut: true,
  },
  "calendrier-type": {
    id: "calendrier-type",
    titre: "Calendrier · 12 mois",
    description:
      "Frise de l'année — un événement par mois, construit à partir de vos vérifications. Retombe sur un exemple pédagogique si vos équipements ne sont pas encore déclarés.",
    taille: "large",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetCalendrierType,
  },
  "focus-action": {
    id: "focus-action",
    titre: "Focus de la semaine",
    description:
      "La recommandation prioritaire du moment avec les 2-3 raisons qui la justifient. Déduite du moteur de recos.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetFocusAction,
  },
  countdown: {
    id: "countdown",
    titre: "Prochaine échéance",
    description:
      "Compte à rebours en gros chiffre (J-N / J+N / Aujourd'hui / À planifier) sur la vérification la plus urgente.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetCountdown,
  },
  anciennete: {
    id: "anciennete",
    titre: "Âge des documents",
    description:
      "DUERP et dernier rapport : depuis combien de jours ? Ton rouge / ambre / vert selon le seuil.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetAnciennete,
  },
  semaine: {
    id: "semaine",
    titre: "Semaine en cours",
    description:
      "Mini-agenda 7 jours — intervention(s) par jour, aujourd'hui mis en évidence.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetSemaine,
  },
  "flux-registre": {
    id: "flux-registre",
    titre: "Activité registre",
    description:
      "Feed chronologique inverse des derniers rapports déposés avec leur résultat.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetFluxRegistre,
  },
  meteo: {
    id: "meteo",
    titre: "Météo · 30 jours",
    description:
      "Heatmap 30 jours glissants, chaque case est un jour coloré selon l'urgence dominante.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetMeteo,
  },
};

export type { WidgetId } from "./types";

/**
 * Vérifie qu'un variant donné appartient bien à la définition du widget.
 * Les "default" implicites restent acceptés même s'ils ne figurent pas
 * dans la liste de variants explicites.
 */
export function variantValide(
  def: WidgetDefinition,
  variantId: string,
): boolean {
  if (variantId === def.defaultVariant) return true;
  return def.variants.some((v) => v.id === variantId);
}

/**
 * Ordre canonique des widgets dans le layout par défaut.
 * Respecte l'équilibre de la grille 6-col :
 *   row 1 : score (6)
 *   row 2 : 3 petits KPIs (2+2+2)
 *   row 3 : 4ᵉ KPI (2) + bars (3) [+ trou d'1 col, comblé par dense]
 *   ...
 */
const ORDRE_DEFAUT: WidgetId[] = [
  "etablissement",
  "score",
  "indicateurs",
  "calendrier-type",
  "prochaines-echeances",
  "documents",
  "equipements-grid",
  "plan-actions",
  "guide",
];

export function layoutParDefaut(): LayoutItem[] {
  return ORDRE_DEFAUT.filter((id) => !REGISTRY[id].exclueDuDefaut).map(
    (widgetId) => ({
      widgetId,
      variant: REGISTRY[widgetId].defaultVariant,
    }),
  );
}

export function tailleEnCol(taille: WidgetDefinition["taille"]): number {
  if (taille === "small") return 2;
  if (taille === "medium") return 3;
  return 6;
}

/** IDs des widgets dans l'ordre du registre — utile pour le tiroir. */
export function tousLesWidgetIds(): WidgetId[] {
  return Object.keys(REGISTRY) as WidgetId[];
}
