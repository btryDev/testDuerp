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

/**
 * Forme minimale d'unité que le prédicat sait lire : une ligne `UniteTravail`
 * comme une unité de snapshot. `referentielUniteId` est déclaré optionnel
 * exprès — voir la distinction `undefined` / `null` dans `estHorsReferentiel`.
 */
export type UniteEvaluable = {
  referentielUniteId?: string | null;
  estTransverse: boolean;
};

/**
 * Une unité est « hors référentiel sectoriel » quand aucune unité type du
 * référentiel ne lui correspond : `risquesProposesPourUnite` lui rend alors
 * une liste vide, et l'utilisateur repart d'une page blanche — pas de risques
 * types, pas de cotation métier, pas de mesures suggérées.
 *
 * Ce cas naît de l'ajout manuel d'une unité (`ajouterUnite`) ou de l'import
 * d'un DUERP existant : ni l'un ni l'autre ne pose `referentielUniteId`. Le
 * signal est donc exclusivement structurel — on ne devine jamais rien du nom
 * de l'unité, le référentiel couvre ou ne couvre pas, et lui seul le dit.
 *
 * Deux exclusions, pour la même raison de fond : ne rien signaler qui ne soit
 * pas un manque réel.
 *
 * 1. Les unités transverses (`estTransverse`) portent elles aussi un
 *    `referentielUniteId` nul, parce qu'elles ne sont pas issues du référentiel
 *    sectoriel : leurs risques viennent du référentiel transverse via les
 *    questions détecteurs. Rien ne manque, c'est le fonctionnement nominal.
 * 2. `undefined` — c'est-à-dire l'information absente, typiquement un snapshot
 *    de version validée avant l'introduction du champ, conservé 40 ans et
 *    relu tel quel — n'est pas traité comme un `null`. Un snapshot muet ne
 *    permet pas d'affirmer que l'unité était hors référentiel : le dire
 *    reviendrait à écrire, sur un document à valeur légale, une réponse que
 *    personne n'a donnée.
 */
export function estHorsReferentiel(unite: UniteEvaluable): boolean {
  if (unite.estTransverse) return false;
  return unite.referentielUniteId === null;
}

/** Filtre pratique pour les vues qui listent les unités concernées. */
export function unitesHorsReferentiel<T extends UniteEvaluable>(
  unites: readonly T[],
): T[] {
  return unites.filter(estHorsReferentiel);
}
