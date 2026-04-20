import { bureau } from "./bureau";
import { commerce } from "./commerce";
import { restauration } from "./restauration";
import {
  questionsDetectionTransverses,
  risquesTransverses,
} from "./commun";
import type { Referentiel, RisqueReferentiel } from "./types";

/**
 * Secteurs couverts par le MVP.
 */
export const referentielsSectoriels: Referentiel[] = [
  restauration,
  commerce,
  bureau,
];

export function trouverReferentielParNaf(
  codeNaf: string | null | undefined,
): Referentiel | undefined {
  if (!codeNaf) return undefined;
  const naf = codeNaf.trim().toUpperCase();
  return referentielsSectoriels.find((r) =>
    r.codesNaf.some((c) => naf.startsWith(c)),
  );
}

export function trouverReferentielParId(
  id: string,
): Referentiel | undefined {
  return referentielsSectoriels.find((r) => r.id === id);
}

export { risquesTransverses, questionsDetectionTransverses };
export * from "./types";

/**
 * Renvoie la fusion des risques sectoriels et transverses par ID. Utilisé
 * côté PDF et côté affichage pour résoudre un referentielId en libellé.
 */
export function tousRisquesConnus(): Map<string, RisqueReferentiel> {
  const map = new Map<string, RisqueReferentiel>();
  for (const ref of referentielsSectoriels) {
    for (const r of ref.risques) map.set(r.id, r);
  }
  for (const r of risquesTransverses) map.set(r.id, r);
  return map;
}
