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
  WidgetRegistre,
  WidgetEquipements,
  WidgetDuerp,
  WidgetGuide,
  WidgetRecos,
} from "./impl/simples";
import {
  WidgetIndicateurs,
  WidgetEcheances,
  WidgetActivite,
} from "./impl/groupes";
import {
  BlocActionsEnRetard,
  BlocCeQuiAChange,
  BlocControle,
  BlocDocuments,
  BlocFrise,
  BlocPlanActions,
  BlocProchaineEcheance,
} from "./impl/board";
import { WidgetAnciennete } from "./impl/anciennete";
import { WidgetSemaine } from "./impl/semaine";
import { WidgetMeteo } from "./impl/meteo";
import type { LayoutItem, WidgetDefinition, WidgetId } from "./types";

export const REGISTRY: Record<WidgetId, WidgetDefinition> = {
  etablissement: {
    id: "etablissement",
    titre: "Identité établissement",
    description:
      "Carte d'identité de l'établissement — raison, adresse, effectif, NAF/SIRET, régimes, avec un CTA vers un préventeur.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: WidgetEtablissement,
    exclueDuDefaut: true,
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
    titre: "Où en est le plan d'actions",
    description:
      "Répartition des actions en anneau — ouvertes, en cours, clôturées ce mois — avec le nombre d'échéances dépassées.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: BlocPlanActions,
  },
  "actions-retard": {
    id: "actions-retard",
    titre: "Actions en retard",
    description:
      "Combien d'actions dépassent leur échéance, de combien de jours en moyenne, et laquelle traîne depuis le plus longtemps.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: BlocActionsEnRetard,
  },
  controle: {
    id: "controle",
    titre: "Préparer un contrôle",
    description:
      "Raccourci vers le dossier à présenter en cas de visite — inspection, assurance, bailleur.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: BlocControle,
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
    titre: "Vos documents, en un coup d'œil",
    description:
      "Matrice en pastilles : pour le DUERP, le registre, les vérifications et le plan d'actions — en place, à jour, sans retard.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: BlocDocuments,
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
    titre: "La frise des échéances",
    description:
      "Frise horizontale défilante de vos vérifications, de 3 mois en arrière à 24 mois en avant, avec zoom 90 jours / 12 mois et bascule en vue calendrier.",
    taille: "large",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: BlocFrise,
  },
  countdown: {
    id: "countdown",
    titre: "Prochaine échéance",
    description:
      "La vérification la plus proche, avec le nombre de jours restants en gros chiffre.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: BlocProchaineEcheance,
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
    titre: "Ce qui a changé",
    description:
      "Les derniers rapports déposés au registre, avec leur résultat, et le premier « à faire » du moteur de recommandations.",
    taille: "medium",
    variants: [{ id: "default", label: "Défaut" }],
    defaultVariant: "default",
    Component: BlocCeQuiAChange,
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
 * Ordre canonique du layout par défaut — le « board éditorial » (4a).
 * Le brief n'y figure pas : c'est le bandeau de tête, rendu par la page.
 * Grille 6 colonnes :
 *   row 1 : la frise          (6)
 *   row 2 : prochaine échéance (3) + actions en retard (3)
 *   row 3 : plan d'actions     (3) + documents         (3)
 *   row 4 : ce qui a changé    (3) + préparer un contrôle (3)
 *
 * Tout le reste du registre demeure disponible dans le tiroir
 * « Ajouter un widget » — le board est un point de départ, pas un mur.
 */
const ORDRE_DEFAUT: WidgetId[] = [
  "calendrier-type",
  "countdown",
  "actions-retard",
  "plan-actions",
  "documents",
  "flux-registre",
  "controle",
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
