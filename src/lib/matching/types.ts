import type {
  CategorieErp,
  CategorieEquipement,
  ClasseIgh,
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
};
