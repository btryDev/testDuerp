/**
 * Agrégation du référentiel d'obligations réglementaires (ADR-003).
 *
 * Chaque domaine est exporté séparément pour permettre un filtrage simple
 * côté moteur de matching (étape 5) et côté UI (vue par domaine). La liste
 * `obligationsConformite` fusionne le tout.
 *
 * Les obligations P2 et P3 (cuisson-hotte au-delà du P1, ascenseurs, portes
 * et portails, sous-pression, stockage dangereux, levage) sont ajoutées à
 * l'étape 11. Pour l'instant, aeration.ts couvre déjà la hotte ERP P1.
 */

import type { DomaineObligation, Obligation } from "./types";
import { obligationsElectricite } from "./electricite";
import { obligationsIncendie } from "./incendie";
import { obligationsAeration } from "./aeration";

export { obligationsElectricite, obligationsIncendie, obligationsAeration };
export * from "./types";

export const obligationsConformite: Obligation[] = [
  ...obligationsElectricite,
  ...obligationsIncendie,
  ...obligationsAeration,
];

/**
 * Indexation par id pour lookup O(1) côté moteur de matching et snapshot
 * de calendrier. Construite à la première demande, mémoïsée.
 */
let _index: Map<string, Obligation> | null = null;

export function obligationParId(id: string): Obligation | undefined {
  if (!_index) {
    _index = new Map();
    for (const o of obligationsConformite) _index.set(o.id, o);
  }
  return _index.get(id);
}

export function obligationsParDomaine(
  domaine: DomaineObligation,
): Obligation[] {
  return obligationsConformite.filter((o) => o.domaine === domaine);
}
