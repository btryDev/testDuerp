// Réduction des libellés d'obligation à un sujet affichable.
//
// Les libellés réglementaires sont des phrases entières — « Habilitation
// électrique du personnel opérant sur ou à proximité d'installations
// électriques ». Dans une pastille du brief ou une carte de frise, ils
// débordent ou se font tronquer au milieu d'un mot. On coupe donc à la
// source : préfixe de périodicité, article, puis la précision juridique
// qui suit le sujet.
//
// Partagé par le brief et la frise : les deux ont exactement ce besoin.

/** Longueur au-delà de laquelle le libellé déborde son contenant. */
export const LONGUEUR_LIBELLE_MAX = 32;

/**
 * Réduit un libellé d'obligation à un sujet court et lisible.
 */
export function raccourcirLibelle(libelle: string): string {
  let t = libelle
    .replace(
      /^V[ée]rification\s+(p[ée]riodique\s+)?(annuelle|semestrielle|trimestrielle|mensuelle|hebdomadaire|biennale|triennale|quinquennale|d[ée]cennale)?\s*(de\s+la\s+|de\s+l['’]\s*|des\s+|de\s+|du\s+|d['’]\s*)?/i,
      "",
    )
    .replace(/^Entretien\s+(annuel|semestriel|trimestriel)?\s*(de\s+la\s+|de\s+l['’]\s*|des\s+|de\s+|du\s+)?/i, "")
    .replace(/^Maintien\s+en\s+bon\s+[ée]tat\s+/i, "")
    .replace(/^Exercice\s+(d['’]\s*)?/i, "")
    .trim();

  // Première proposition seulement : ce qui suit « du personnel opérant
  // sur… » est de la précision juridique, pas un sujet.
  t = t.split(/\s+(?:du personnel|des personnels|opérant|situé|destiné)\b/i)[0];
  t = t.split(/[,(]/)[0].trim();

  if (t.length > LONGUEUR_LIBELLE_MAX) {
    const coupe = t.slice(0, LONGUEUR_LIBELLE_MAX);
    const espace = coupe.lastIndexOf(" ");
    t = (espace > 12 ? coupe.slice(0, espace) : coupe).trim() + "…";
  }

  return t.charAt(0).toUpperCase() + t.slice(1);
}
