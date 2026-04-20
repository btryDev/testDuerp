import { HIERARCHIE_MESURES, type TypeMesure } from "../referentiels/types";

/**
 * Retourne true si l'ensemble de mesures ne contient que des types placés
 * bas dans la hiérarchie (EPI, formation, organisationnelles) et aucune
 * mesure de type suppression, réduction à la source ou protection collective.
 * Sert à déclencher un avertissement — jamais un blocage.
 */
export function mesuresUniquementBasNiveau(types: TypeMesure[]): boolean {
  if (types.length === 0) return false;
  const basNiveau = new Set<TypeMesure>([
    "protection_individuelle",
    "formation",
    "organisationnelle",
  ]);
  return types.every((t) => basNiveau.has(t));
}

/**
 * Trie un ensemble de mesures selon la hiérarchie légale (art. L. 4121-2).
 * Ordre : suppression > réduction source > collective > individuelle > formation > organisationnelle.
 */
export function trierParHierarchie<T extends { type: TypeMesure }>(
  mesures: T[],
): T[] {
  const ordre = new Map(HIERARCHIE_MESURES.map((t, i) => [t, i]));
  return [...mesures].sort(
    (a, b) => (ordre.get(a.type) ?? 99) - (ordre.get(b.type) ?? 99),
  );
}
