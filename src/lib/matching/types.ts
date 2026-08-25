import type {
  CategorieErp,
  CategorieEquipement,
  ClasseIgh,
  Periodicite,
  Realisateur,
  TypeErp,
} from "@/lib/referentiels/types-communs";
import type { Obligation } from "@/lib/referentiels/conformite/types";

/**
 * Types utilisés par le moteur de matching (étape 5, ADR-005).
 *
 * On projette volontairement `Etablissement` et `Equipement` Prisma vers des
 * formes **minimales** pour garder le moteur pur et testable sans Prisma.
 */

export type EtablissementMatching = {
  id: string;
  effectifSurSite: number;
  estEtablissementTravail: boolean;
  estERP: boolean;
  estIGH: boolean;
  estHabitation: boolean;
  typeErp: TypeErp | null;
  categorieErp: CategorieErp | null;
  classeIgh: ClasseIgh | null;
  /**
   * Personnes habituellement présentes, salariés + public + tiers réguliers
   * (R. 4227-34 : « occupées ou réunies habituellement »). Optionnel pour ne
   * pas casser les projections existantes : absent ou `null` ⇒ le moteur
   * retombe sur `effectifSurSite`, sous-estimation assumée.
   */
  personnesPresentesHabituellement?: number | null;
  /**
   * Manipulation et mise en œuvre de matières visées par R. 4227-22
   * (explosives, comburantes, extrêmement inflammables). Absent ou `null` ⇒
   * lu comme « non » : cette branche ne fait qu'ajouter des cas, aucun
   * établissement ne peut perdre une obligation par son silence.
   */
  manipuleMatieresR422722?: boolean | null;
};

export type EquipementMatching = {
  id: string;
  libelle: string;
  categorie: CategorieEquipement;
  caracteristiques: Record<string, unknown> | null;
};

/**
 * Résultat du matching pour une obligation donnée.
 *
 * `equipementsConcernes` est vide pour les obligations dont
 * `categoriesEquipement` contient une catégorie universelle ou quand aucun
 * équipement n'était requis (cas rare ; aucune à ce stade du référentiel).
 * `raisons` est le mode "explain" : liste ordonnée d'explications
 * déterministes, en français, destinées à être affichées en UI ou au support.
 */
export type ObligationApplicable = {
  obligation: Obligation;
  equipementsConcernes: EquipementMatching[];
  raisons: string[];
  /**
   * Surcharges de périodicité imposées par une prescription particulière
   * (ADR-014), par identifiant d'équipement. Absent = périodicité du
   * référentiel pour tous les équipements déclencheurs.
   */
  surcharges?: Record<string, SurchargePeriodicite>;
};

// -----------------------------------------------------------------------------
// Prescriptions particulières (ADR-014)
// -----------------------------------------------------------------------------

export type SurchargePeriodicite = {
  periodicite: Periodicite;
  prescriptionId: string;
  raison: string;
};

/** Projection minimale d'une `PrescriptionParticuliere` active. */
export type PrescriptionMatching = {
  id: string;
  source: string;
  effet: "renforce_periodicite" | "obligation_sur_mesure";
  reference: string;
  autorite: string | null;
  dateDocument: Date;
  dateFin: Date | null;
  obligationId: string | null;
  libelle: string | null;
  description: string | null;
  periodicite: Periodicite;
  realisateurRequis: Realisateur[];
  categorieEquipement: CategorieEquipement | null;
  equipementId: string | null;
};

/** Obligation hors référentiel, créée par une prescription `obligation_sur_mesure`. */
export type ObligationSurMesureApplicable = {
  prescription: PrescriptionMatching;
  equipementsConcernes: EquipementMatching[];
  raisons: string[];
};

/** Prescription non appliquée, avec la raison en clair (mode explain). */
export type PrescriptionIgnoree = {
  prescription: PrescriptionMatching;
  raison: string;
};
