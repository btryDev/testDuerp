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

/**
 * Le code NAF sous la forme dans laquelle les référentiels l'écrivent :
 * deux chiffres, un point, deux chiffres, une lettre facultative.
 *
 * Le point est **le** point : les `codesNaf` des trois référentiels le portent
 * dès qu'ils dépassent la division (« 56.10A », « 47.11 », mais « 62 » nu), et
 * la comparaison se fait par préfixe. Un code saisi sans point ne pouvait donc
 * en préfixer aucun.
 *
 * Ce n'était pas théorique. `evaluerScopeSecteur` valide le code avec un point
 * FACULTATIF (`/^(\d{2})\.?\d{2}[A-Z]?$/`) et le wizard ne fait qu'un
 * `.toUpperCase()` : un restaurateur qui saisissait « 5610A » — une façon
 * parfaitement normale d'écrire un code NAF — passait la validation et
 * s'entendait dire qu'aucun référentiel n'existait pour son activité, alors
 * que le sien est livré. La fonction normalisait déjà les espaces et la casse ;
 * il lui manquait le séparateur.
 *
 * Un seul motif, et **ancré aux deux bouts** : le code doit être un NAF
 * entier écrit sans point pour qu'on en insère un. Tout le reste — « 62 » nu,
 * un code qui a déjà son point, une saisie malformée — ressort tel quel, par
 * la même branche.
 *
 * La première version testait `/^\d{4}/` non ancré, précédé d'un
 * `if (naf.includes(".")) return naf`. Les deux étaient décoratifs : « 56.10A »
 * échoue déjà le motif, et « 62 » → « 62. » préfixe encore « 62 ». Une
 * réinjection l'a montré — les deux mutations restaient vertes non parce que
 * les tests dormaient, mais parce que ces branches ne changeaient jamais
 * l'issue. Un garde qui ne garde rien se lit pourtant comme une garantie ;
 * c'est pire que son absence.
 */
const NAF_SANS_POINT = /^(\d{2})(\d{2}[A-Z]?)$/;

function normaliserNaf(codeNaf: string): string {
  const naf = codeNaf.trim().toUpperCase().replace(/\s+/g, "");
  const m = NAF_SANS_POINT.exec(naf);
  return m ? `${m[1]}.${m[2]}` : naf;
}

export function trouverReferentielParNaf(
  codeNaf: string | null | undefined,
): Referentiel | undefined {
  if (!codeNaf) return undefined;
  const naf = normaliserNaf(codeNaf);
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
