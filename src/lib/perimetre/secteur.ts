// Le référentiel sectoriel retenu est-il celui que le code NAF désigne ?
//
// Une comparaison de deux données déclarées — le code NAF saisi à
// l'onboarding, l'identifiant de secteur confirmé au DUERP. Rien n'est déduit
// d'un libellé, d'une raison sociale ni d'un nom d'unité.
//
// Elle vivait dans `faits.ts`, entre deux appels Prisma, et n'était donc
// couverte par aucun test : une mutation qui la remplaçait par `true`
// constant passait au vert. Or c'est elle, et elle seule, qui décide si le
// dossier annonce que son document unique décrit un autre métier. Sortie ici,
// elle se vérifie.
//
// Séparée de `couverture.ts` pour la même raison que `familles.ts` l'est :
// c'est une lecture du référentiel au runtime, et le module central doit
// rester sans arête sortante (cf. l'avertissement de `CATEGORIES_COUVERTES`
// sur le cycle `referentiels → perimetre → referentiels`).
//
// Module **pur** : ni Prisma, ni React.

import { trouverReferentielParNaf } from "@/lib/referentiels";

/**
 * `true` si le secteur retenu est celui du code NAF, `false` s'il en diffère,
 * `null` si la question n'a pas de sens.
 *
 * `null` n'est pas un `true` prudent, et c'est tout l'intérêt du troisième
 * état : sans secteur confirmé il n'y a rien à comparer (l'axe DUERP le dit
 * déjà autrement), et sans code NAF il n'y a pas de terme de comparaison.
 * Rendre `true` dans ces cas ferait passer pour vérifiée une correspondance
 * que personne n'a établie.
 *
 * Un code NAF qui ne résout aucun référentiel rend `false` quand un secteur a
 * été retenu — et c'est le cas central : c'est exactement le dirigeant hors
 * des trois secteurs instruits, à qui la page de choix du DUERP a proposé
 * « le secteur le plus proche ».
 */
export function secteurCorrespondAuNaf(
  codeNaf: string | null | undefined,
  referentielSecteurId: string | null | undefined,
): boolean | null {
  if (!referentielSecteurId || !codeNaf) return null;
  return trouverReferentielParNaf(codeNaf)?.id === referentielSecteurId;
}
