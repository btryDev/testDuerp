export type Cotation = {
  gravite: number;
  probabilite: number;
  maitrise: number;
};

export const BORNE_MIN = 1;
export const BORNE_MAX = 4;
export const CRITICITE_MIN = 1;
export const CRITICITE_MAX = 16;

export class CotationHorsBornesError extends Error {
  constructor(champ: keyof Cotation, valeur: number) {
    super(
      `${champ}=${valeur} hors bornes [${BORNE_MIN}, ${BORNE_MAX}]`,
    );
    this.name = "CotationHorsBornesError";
  }
}

function validerBornes(cotation: Cotation): void {
  for (const champ of ["gravite", "probabilite", "maitrise"] as const) {
    const v = cotation[champ];
    if (!Number.isInteger(v) || v < BORNE_MIN || v > BORNE_MAX) {
      throw new CotationHorsBornesError(champ, v);
    }
  }
}

/**
 * Criticité = (gravité × probabilité) / maîtrise, arrondi au plus proche,
 * bornée [1, 16]. Arrondi `round` (0.5 → 1) retenu pour ne pas sous-évaluer.
 */
export function calculerCriticite(cotation: Cotation): number {
  validerBornes(cotation);
  const brut = (cotation.gravite * cotation.probabilite) / cotation.maitrise;
  const arrondi = Math.round(brut);
  return Math.min(CRITICITE_MAX, Math.max(CRITICITE_MIN, arrondi));
}

export type RisqueCote = {
  id: string;
  gravite: number;
  criticite: number;
};

/**
 * Trie les risques par criticité décroissante, gravité décroissante en
 * cas d'égalité. Tri stable.
 */
export function prioriser<T extends RisqueCote>(risques: T[]): T[] {
  return [...risques].sort((a, b) => {
    if (b.criticite !== a.criticite) return b.criticite - a.criticite;
    return b.gravite - a.gravite;
  });
}
