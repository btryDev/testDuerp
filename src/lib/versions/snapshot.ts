import type { TypeMesure } from "@/lib/referentiels/types";

export type MesureSnapshot = {
  id: string;
  libelle: string;
  type: TypeMesure;
  statut: "existante" | "prevue";
  echeance: string | null; // ISO
  responsable: string | null;
};

export type RisqueSnapshot = {
  id: string;
  referentielId: string | null;
  libelle: string;
  description: string | null;
  gravite: number;
  probabilite: number;
  maitrise: number;
  criticite: number;
  cotationSaisie: boolean;
  /** Nombre de salariés exposés — critère d'appréciation INRS ED 840. */
  nombreSalariesExposes: number | null;
  /** Date des dernières mesures physiques (ISO) — bruit, éclairement, etc. */
  dateMesuresPhysiques: string | null;
  /** Exposition à un agent CMR (R. 4412-59+). */
  exposeCMR: boolean;
  mesures: MesureSnapshot[];
};

export type UniteSnapshot = {
  id: string;
  nom: string;
  description: string | null;
  estTransverse: boolean;
  /**
   * Justification libre saisie par l'employeur lorsqu'une unité a été évaluée
   * et déclarée sans risque significatif (cf. INRS ED 840 — l'évaluation peut
   * légitimement conclure à l'absence de risque significatif si elle est
   * documentée).
   */
  aucunRisqueJustif: string | null;
  risques: RisqueSnapshot[];
};

export type EntrepriseSnapshot = {
  raisonSociale: string;
  siret: string | null;
  codeNaf: string;
  effectif: number;
  adresse: string;
};

export type DuerpSnapshot = {
  version: number;
  genereLe: string; // ISO 8601
  motif: string | null;
  /** Identifiant du référentiel sectoriel INRS utilisé pour initialiser le DUERP. */
  referentielSecteurId: string | null;
  entreprise: EntrepriseSnapshot;
  unites: UniteSnapshot[];
};
