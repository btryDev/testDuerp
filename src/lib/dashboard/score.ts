/**
 * Score de conformité interne (étape 9).
 *
 * **Formule interne, pas une norme officielle.** Aucun texte réglementaire
 * n'impose de score agrégé — l'indicateur est là pour donner au dirigeant
 * un sens de "où j'en suis", pas pour certifier sa conformité.
 *
 * Principe :
 *   - dénominateur = nombre total d'engagements actifs
 *       (vérifications programmées + actions correctives ouvertes + 1 pour
 *        le DUERP s'il existe)
 *   - pénalité   = nombre d'engagements en retard, pondérés par gravité
 *       - vérification dépassée ................. ×3
 *       - action en retard (ouverte/en_cours) .... ×2
 *       - DUERP non à jour (> 12 mois) ........... ×1
 *
 *   score = 100 * max(0, 1 − pénalité / (dénominateur × 3))
 *
 * Seuils d'affichage (interprétation UI, documentés ici) :
 *   - ≥ 80 : "conformité satisfaisante"
 *   - 50-79 : "à surveiller"
 *   - < 50 : "rattrapage nécessaire"
 */

export type EntreeScore = {
  verifsTotal: number;
  verifsEnRetard: number; // statut = depassee
  actionsOuvertesTotal: number;
  actionsEnRetard: number; // echeance < now, statut in [ouverte, en_cours]
  /** Âge en jours de la version de DUERP la plus récente. undefined si pas de DUERP. */
  duerpAgeJours: number | undefined;
};

export type Score = {
  valeur: number; // 0..100 arrondi à l'entier
  niveau: "satisfaisante" | "a_surveiller" | "rattrapage";
  libelle: string;
};

export const SEUIL_SATISFAISANT = 80;
export const SEUIL_SURVEILLANCE = 50;
export const SEUIL_DUERP_A_METTRE_A_JOUR_JOURS = 365;

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

export function calculerScoreConformite(e: EntreeScore): Score {
  const duerpARetard =
    e.duerpAgeJours !== undefined &&
    e.duerpAgeJours > SEUIL_DUERP_A_METTRE_A_JOUR_JOURS;

  const denominateur =
    e.verifsTotal + e.actionsOuvertesTotal + (e.duerpAgeJours !== undefined ? 1 : 0);

  if (denominateur === 0) {
    // Aucun engagement à suivre → score neutre haut
    return {
      valeur: 100,
      niveau: "satisfaisante",
      libelle: LIBELLE_NIVEAU.satisfaisante,
    };
  }

  const penalite =
    e.verifsEnRetard * 3 + e.actionsEnRetard * 2 + (duerpARetard ? 1 : 0);

  const brut = 100 * Math.max(0, 1 - penalite / (denominateur * 3));
  const valeur = Math.round(brut);
  const niveau = niveauDepuisValeur(valeur);
  return { valeur, niveau, libelle: LIBELLE_NIVEAU[niveau] };
}
