// Le vocabulaire d'état d'une échéance, et les champs qui le portent.
//
// Trois écrans le disent : la règle annuelle (barres), la ligne de la
// liste mensuelle (tuile-date) et la vue par équipement (cases de mois).
// Chacun l'avait redéclaré avec sa propre table de couleurs — trois
// copies d'une même règle, qui dérivent au premier ajustement. Un mois
// « à venir » rendu rose dans un seul des trois suffit à faire lire un
// futur comme un retard.
//
// La règle, tenue ici une fois : la couleur dit l'ÉTAT, jamais le volume.

/**
 * Les quatre états qu'une occurrence datée peut prendre. Exclusifs entre
 * eux, et ordonnés par urgence décroissante dans `PRIORITE_ETAT`.
 */
export type EtatEcheance = "enRetard" | "proche" | "aVenir" | "faite";

/**
 * Ce que porte une ligne de liste : les quatre états, plus « à planifier ».
 *
 * `aPlanifier` n'est pas un cinquième état de la même famille — c'est
 * l'absence de date convenue. Il n'entre donc dans aucun graphique
 * (la date qu'il porte est une date de génération, pas un rendez-vous),
 * mais une ligne de liste doit bien l'afficher.
 */
export type RegistreLigne = EtatEcheance | "aPlanifier";

/**
 * Urgence relative, pour trancher quand une case ne peut porter qu'un
 * état — un mois qui mêle du retard et de l'à-venir se lit rouge.
 */
export const PRIORITE_ETAT: Record<EtatEcheance, number> = {
  enRetard: 3,
  proche: 2,
  aVenir: 1,
  faite: 0,
};

/** Champ (fond) de chaque état, en jetons du board. */
export const CHAMP_ETAT: Record<RegistreLigne, string> = {
  enRetard: "var(--board-signal)",
  proche: "var(--board-amber)",
  aVenir: "var(--board-blue-soft)",
  faite: "var(--board-green)",
  aPlanifier: "var(--board-slate-pale)",
};

/** Encre lisible sur le champ correspondant. Jamais de blanc sur le rose. */
export const ENCRE_ETAT: Record<RegistreLigne, string> = {
  enRetard: "var(--board-signal-ink)",
  proche: "var(--board-amber-ink)",
  aVenir: "var(--board-blue-ink)",
  faite: "var(--board-green-ink)",
  aPlanifier: "var(--board-slate-mid)",
};
