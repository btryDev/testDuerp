// Types partagés par le système de widgets du tableau de bord.
// Le "gabarit" produit est volontairement simple : un widget = un id
// stable + un rendu React + des variants de visualisation optionnels.
// L'ordre et le choix de variant sont pilotés par l'utilisateur via
// localStorage (voir useLayoutPerso).

import type { ComponentType } from "react";
import type {
  BarMois,
  DashboardData,
  EvenementMoisReel,
} from "@/lib/dashboard/queries";

export type Taille = "small" | "medium" | "large";
// small = 2 col · medium = 3 col · large = 6 col (grille à 6 colonnes)

export type WidgetId =
  | "score"
  | "indicateurs"
  | "echeances"
  | "activite"
  | "kpi-en-retard"
  | "kpi-sous-30j"
  | "kpi-actions"
  | "kpi-rapports"
  | "bars-obligations"
  | "prochaines-echeances"
  | "plan-actions"
  | "registre"
  | "equipements-grid"
  | "duerp"
  | "guide"
  | "recos"
  | "calendrier-type"
  | "documents";

export type LayoutItem = {
  widgetId: WidgetId;
  /** identifiant de variant — « default » si non précisé */
  variant: string;
};

export type PersistedLayout = {
  version: number;
  items: LayoutItem[];
};

/* ─── Bundle de données consommé par tous les widgets ─────── */

type EtablissementLite = {
  id: string;
  raisonDisplay: string;
  entrepriseId: string;
};

type EquipementLite = {
  id: string;
  libelle: string;
  categorie: string;
};

type VerificationLite = {
  id: string;
  libelleObligation: string;
  datePrevue: Date;
  statut: string;
  equipement: { libelle: string };
};

type ActionLite = {
  id: string;
  libelle: string;
  statut: string;
  echeance: Date | null;
};

type RapportLite = {
  id: string;
  dateRapport: Date;
  resultat:
    | "conforme"
    | "observations_mineures"
    | "ecart_majeur"
    | "non_verifiable";
  verification: { libelleObligation: string };
};

type DuerpLite = {
  id: string;
  versions: Array<{ numero: number; createdAt: Date }>;
};

export type DashboardBundle = {
  etablissementId: string;
  etablissement: EtablissementLite;
  dashboard: DashboardData;
  equipements: EquipementLite[];
  barsData: BarMois[];
  evenementsAnnee: Array<EvenementMoisReel | null>;
  prochainesVerifs: VerificationLite[];
  actionsEnCours: ActionLite[];
  rapportsRecents: RapportLite[];
  nbVerifs: number;
  nbRapports: number;
  duerpDernier: DuerpLite | null;
  jourDernierRapport: number | null;
  moisCourant: number;
};

/* ─── Définition d'un widget dans le registre ─────────────── */

export type Variant = { id: string; label: string };

export type WidgetDefinition = {
  id: WidgetId;
  titre: string;
  /** Phrase courte affichée dans le tiroir « Ajouter un widget » */
  description: string;
  taille: Taille;
  variants: readonly Variant[];
  defaultVariant: string;
  Component: ComponentType<{ bundle: DashboardBundle; variant: string }>;
  /** Exclu du layout par défaut (disponible mais pas monté d'office) */
  exclueDuDefaut?: boolean;
  /** Si la fonction renvoie false, le widget est masqué même s'il est
   * dans le layout (ex. widget DUERP alors qu'aucun DUERP n'existe). */
  visibleQuand?: (b: DashboardBundle) => boolean;
};

