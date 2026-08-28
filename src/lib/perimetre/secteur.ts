// Le référentiel sectoriel retenu par le DUERP est-il celui de l'activité ?
//
// Une comparaison de données déclarées — le code NAF saisi, l'identifiant de
// secteur confirmé. Rien n'est déduit d'un libellé, d'une raison sociale ni
// d'un nom d'unité.
//
// Elle vivait dans `faits.ts`, entre deux appels Prisma, et n'était donc
// couverte par aucun test : une mutation qui la remplaçait par `true`
// constant passait au vert. Or c'est elle, et elle seule, qui décide si le
// dossier annonce que son document unique décrit un autre métier.
//
// Séparée de `couverture.ts` pour la même raison que `familles.ts` l'est :
// c'est une lecture du référentiel au runtime, et le module central doit
// rester sans arête sortante (cf. l'avertissement de `CATEGORIES_COUVERTES`
// sur le cycle `referentiels → perimetre → referentiels`).
//
// Module **pur** : ni Prisma, ni React.

import { trouverReferentielParNaf } from "@/lib/referentiels";

/**
 * D'où vient le code NAF de l'établissement.
 *
 * Les deux champs, et pas seulement celui de l'établissement.
 * `Etablissement.codeNaf` est **optionnel** : il n'est renseigné que lorsqu'il
 * diffère de celui de l'entreprise (cf. `etablissements/illustration.ts`), et
 * `Entreprise.codeNaf` est requis. Cinq modules du dépôt appliquent déjà le
 * repli — `pdf/builders.ts`, `versions/snapshot-builder.ts`, `mcp/tools.ts`,
 * le widget d'identité, l'illustration.
 *
 * Le prendre en paramètre au lieu de recevoir une chaîne déjà résolue est
 * délibéré : la première version acceptait `codeNaf: string | null` et son
 * seul appelant passait `etab.codeNaf` nu. Un établissement secondaire sans
 * NAF propre — le cas courant, le champ étant facultatif au formulaire —
 * rendait alors « indéterminable », et l'axe se taisait sur exactement le
 * dossier qu'il devait signaler. Le type interdit maintenant cet oubli.
 */
export type NafDuDossier = {
  /** `Etablissement.codeNaf` — renseigné seulement s'il diffère. */
  etablissement: string | null | undefined;
  /** `Entreprise.codeNaf` — requis en base, mais on tolère l'absence. */
  entreprise: string | null | undefined;
};

/** Le code effectivement applicable, ou `null` si aucun n'est renseigné. */
export function nafEffectif(naf: NafDuDossier): string | null {
  return naf.etablissement?.trim() || naf.entreprise?.trim() || null;
}

/**
 * Le rapport entre le secteur retenu et celui que le code NAF désigne.
 *
 * Trois états, et le troisième porte une donnée que la seule comparaison
 * booléenne n'avait pas : **quel** référentiel le NAF désigne, s'il en désigne
 * un. Sans elle, l'écran affirmait « aucun référentiel n'est instruit pour
 * votre activité » dans les deux cas — vrai quand le NAF ne résout rien, faux
 * quand le dirigeant a simplement changé de secteur depuis la recommandation
 * (une boulangerie en `47.24Z` a bien son référentiel commerce, et la page de
 * choix offre quand même « Changer de secteur »). Le produit affirmait alors,
 * jusque dans le PDF remis à un tiers, un fait que la comparaison n'établit
 * pas.
 */
export type CorrespondanceSecteur =
  /**
   * Rien à comparer : aucun secteur confirmé (l'axe DUERP le dit déjà
   * autrement), ou aucun code NAF nulle part.
   *
   * Ce n'est **pas** un « ça correspond » prudent. Rendre « correspond » ici
   * ferait passer pour vérifiée une correspondance que personne n'a établie.
   */
  | { statut: "indeterminable" }
  /** Le secteur retenu est celui du code NAF. */
  | { statut: "correspond" }
  | {
      /** Le secteur retenu n'est pas celui du code NAF. */
      statut: "diverge";
      /**
       * Le référentiel que le code NAF désigne, ou `null` si aucun n'est
       * instruit pour ce code. Les deux cas n'appellent pas la même phrase.
       */
      referentielDuNaf: { id: string; nom: string } | null;
    };

export function correspondanceSecteur(
  naf: NafDuDossier,
  referentielSecteurId: string | null | undefined,
): CorrespondanceSecteur {
  const code = nafEffectif(naf);
  if (!referentielSecteurId || !code) return { statut: "indeterminable" };

  const ref = trouverReferentielParNaf(code);
  if (ref?.id === referentielSecteurId) return { statut: "correspond" };

  return {
    statut: "diverge",
    referentielDuNaf: ref ? { id: ref.id, nom: ref.nom } : null,
  };
}
