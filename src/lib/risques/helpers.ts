import { referentielsSectoriels } from "@/lib/referentiels";

/**
 * Liste les IDs de risques du référentiel applicables à une unité,
 * basée sur `unitesAssociees` du référentiel sectoriel et l'unité associée.
 */
export function risquesProposesPourUnite(
  referentielUniteId: string | null | undefined,
): string[] {
  if (!referentielUniteId) return [];
  const ids: string[] = [];
  for (const ref of referentielsSectoriels) {
    for (const r of ref.risques) {
      if (r.unitesAssociees.includes(referentielUniteId)) ids.push(r.id);
    }
  }
  return ids;
}
