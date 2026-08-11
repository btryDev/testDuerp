/**
 * Score de conformité interne (étape 9).
 *
 * **Formule interne, pas une norme officielle.** Aucun texte réglementaire
 * n'impose de score agrégé — l'indicateur est là pour donner au dirigeant
 * un sens de "où j'en suis", pas pour certifier sa conformité.
 *
 * Principe :
 *   - dénominateur = nombre total d'engagements actifs
 *       (vérifications de la période + actions correctives ouvertes + 1 pour
 *        le DUERP s'il est ouvert)
 *   - pénalité   = nombre d'engagements en retard, pondérés par gravité
 *       - vérification en retard ................. ×3
 *       - action en retard (ouverte/en_cours) .... ×2
 *       - DUERP non à jour ....................... ×1
 *
 *   score = 100 * max(0, 1 − pénalité / (dénominateur × 3))
 *
 * Seuils d'affichage (interprétation UI, documentés ici) :
 *   - ≥ 80 : "conformité satisfaisante"
 *   - 50-79 : "à surveiller"
 *   - < 50 : "rattrapage nécessaire"
 *
 * **Une seule porte d'entrée** : `calculerScoreDepuisEtat`. Le tableau de
 * bord et le dossier de conformité PDF affichaient des scores différents au
 * même instant parce que chacun composait son propre dénominateur (l'un
 * comptait les vérifications « à planifier », l'autre les oubliait). Les
 * deux appelants passent désormais par la même fonction, alimentée par la
 * même répartition (`repartirVerifications`) et le même état de DUERP
 * (`evaluerEtatDuerp`).
 */

import type { EtatDuerp } from "./duerp";

export type Score = {
  valeur: number; // 0..100 arrondi à l'entier
  niveau: "satisfaisante" | "a_surveiller" | "rattrapage";
  libelle: string;
};

export const SEUIL_SATISFAISANT = 80;
export const SEUIL_SURVEILLANCE = 50;

/** Poids relatifs des retards. Une vérification réglementaire dépassée pèse
 *  plus qu'une action corrective, qui pèse plus qu'un document à rafraîchir. */
export const POIDS_VERIF_EN_RETARD = 3;
export const POIDS_ACTION_EN_RETARD = 2;
export const POIDS_DUERP_NON_A_JOUR = 1;

export type EntreeScoreConformite = {
  verifs: {
    /** Toutes les occurrences de la période — retards, « à planifier »,
     *  à venir sous 30 jours et réalisées sur 12 mois. C'est exactement le
     *  `total` de `repartirVerifications`, dont les quatre ensembles sont
     *  disjoints : pas de double compte possible. */
    total: number;
    enRetard: number;
  };
  actions: {
    /** Actions encore à traiter (ouvertes + en cours). */
    ouvertesTotal: number;
    enRetard: number;
  };
  /** `null` quand aucun DUERP n'est ouvert : un dossier qui n'a pas commencé
   *  n'est pas noté sur ce point — c'est l'amorçage qui le porte, pas le
   *  score. */
  duerp: EtatDuerp | null;
};

function niveauDepuisValeur(v: number): Score["niveau"] {
  if (v >= SEUIL_SATISFAISANT) return "satisfaisante";
  if (v >= SEUIL_SURVEILLANCE) return "a_surveiller";
  return "rattrapage";
}

const LIBELLE_NIVEAU: Record<Score["niveau"], string> = {
  satisfaisante: "Situation satisfaisante",
  a_surveiller: "À surveiller",
  rattrapage: "Rattrapage nécessaire",
};

/**
 * Le DUERP pèse-t-il sur le score, et combien ?
 *
 * Deux situations coûtent le même point, pour une raison assumée :
 *
 *  - **version trop ancienne** alors que l'entreprise est soumise à la mise
 *    à jour annuelle (art. R. 4121-2) — l'échéance est dépassée ;
 *  - **aucune version validée** alors que le DUERP est ouvert — la
 *    transcription des résultats de l'évaluation n'a pas été figée
 *    (art. R. 4121-1).
 *
 * Ne pénaliser que la première reviendrait à récompenser l'inaction : un
 * DUERP jamais validé sortait du calcul (il ne coûtait rien) pendant qu'une
 * version de 366 jours coûtait un point. Le tableau de bord affichait donc
 * un meilleur score à qui ne validait jamais.
 */
function penaliteDuerp(d: EtatDuerp | null): number {
  if (d === null || !d.ouvert) return 0;
  return d.estAJour ? 0 : POIDS_DUERP_NON_A_JOUR;
}

export function calculerScoreDepuisEtat(e: EntreeScoreConformite): Score {
  const denominateur =
    e.verifs.total +
    e.actions.ouvertesTotal +
    (e.duerp !== null && e.duerp.ouvert ? 1 : 0);

  if (denominateur === 0) {
    // Aucun engagement à suivre → score neutre haut
    return {
      valeur: 100,
      niveau: "satisfaisante",
      libelle: LIBELLE_NIVEAU.satisfaisante,
    };
  }

  const penalite =
    e.verifs.enRetard * POIDS_VERIF_EN_RETARD +
    e.actions.enRetard * POIDS_ACTION_EN_RETARD +
    penaliteDuerp(e.duerp);

  const brut =
    100 * Math.max(0, 1 - penalite / (denominateur * POIDS_VERIF_EN_RETARD));
  const valeur = Math.round(brut);
  const niveau = niveauDepuisValeur(valeur);
  return { valeur, niveau, libelle: LIBELLE_NIVEAU[niveau] };
}
