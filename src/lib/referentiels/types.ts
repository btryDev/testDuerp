export type TypeMesure =
  | "suppression"
  | "reduction_source"
  | "protection_collective"
  | "protection_individuelle"
  | "formation"
  | "organisationnelle";

export const HIERARCHIE_MESURES: TypeMesure[] = [
  "suppression",
  "reduction_source",
  "protection_collective",
  "protection_individuelle",
  "formation",
  "organisationnelle",
];

export type StatutMesure = "existante" | "prevue";

export type MesureRecommandee = {
  id: string;
  libelle: string;
  type: TypeMesure;
};

export type UniteTravailSuggeree = {
  id: string;
  nom: string;
  description?: string;
};

export type RisqueReferentiel = {
  id: string;
  libelle: string;
  description?: string;
  unitesAssociees: string[];
  graviteParDefaut: number;
  probabiliteParDefaut: number;
  maitriseParDefaut?: number;
  mesuresRecommandees: MesureRecommandee[];
  criticiteReferenceSecteur?: number;
};

export type OptionQuestion = {
  libelle: string;
  valeur: number;
};

export type QuestionCotation = {
  axe: "gravite" | "probabilite" | "maitrise";
  intitule: string;
  options: OptionQuestion[];
};

export type QuestionDetection = {
  id: string;
  intitule: string;
  risqueIdAssocie: string;
  uniteCible?: string;
};

export type Referentiel = {
  id: string;
  nom: string;
  codesNaf: string[];
  unitesTravailSuggerees: UniteTravailSuggeree[];
  risques: RisqueReferentiel[];
  questionsDetection: QuestionDetection[];
};
