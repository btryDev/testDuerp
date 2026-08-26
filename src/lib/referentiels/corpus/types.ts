// L'état de dépouillement d'un corpus réglementaire.
//
// Le référentiel d'obligations sait dire ce qu'il CONNAÎT. Il ne sait pas dire
// ce qu'il a LU. Aucun test ne peut donc échouer parce qu'une obligation
// manque : seulement parce qu'une obligation est fausse. Une liste rassemblée
// ne prouve jamais sa complétude — on ne découvre ce qui manque qu'en butant
// dessus, ce qui est arrivé quatre fois en une seule journée.
//
// Ce module tient le registre inverse : les textes qui gouvernent le
// périmètre, article par article, chacun classé et motivé. La couverture
// devient alors une phrase qu'on peut écrire ou ne pas écrire — « PE : 37
// articles sur 37 dépouillés » — au lieu d'une impression.
//
// Ce n'est pas de la veille. La veille surveille ce qui change ; ceci établit
// ce qu'on a lu. L'une suppose l'autre, et l'ordre avait été pris à l'envers.
//
// Module **pur** : ni Prisma, ni React.

import type { MotifExclusion } from "./perimetre";

/**
 * Le sort d'un article après lecture.
 *
 * `non_depouille` est une valeur de plein droit, et c'est le point : un
 * article présent au corpus mais non lu se compte, se voit, et empêche
 * d'annoncer une couverture complète. Sans elle, un article oublié serait
 * simplement absent — indistinguable d'un article qui n'existe pas.
 */
export type StatutArticle =
  /** Retenu : l'article fonde une ou plusieurs obligations du référentiel. */
  | {
      statut: "retenu";
      /** Les `Obligation.id` qui s'appuient dessus. Au moins un. */
      obligations: [string, ...string[]];
    }
  /**
   * Lu, dans le périmètre, mais ne produit aucune échéance : définition,
   * renvoi, règle ponctuelle sans récurrence. À distinguer absolument de
   * `hors_perimetre` — celui-ci dit « ça nous concerne mais il n'y a rien à
   * inscrire au calendrier », l'autre dit « ça ne nous concerne pas ».
   */
  | { statut: "sans_objet"; motif: string }
  /** Écarté par une exclusion déclarée du périmètre. */
  | { statut: "hors_perimetre"; exclusion: MotifExclusion; motif?: string }
  /** Présent au corpus, pas encore lu. */
  | { statut: "non_depouille" };

export type ArticleDepouille = {
  /** Tel qu'il se cite : « PE 4 », « R. 4227-39 », « MS 73 ». */
  ref: string;
  intitule?: string;
  url?: string;
  /** Date de la version lue, en clé de jour civil. */
  versionEnVigueur?: string;
  /** Terme ou version future programmée, s'il y en a une. */
  versionFuture?: string;
  /** Ce que l'article impose, et à qui. Une phrase. */
  prescrit?: string;
  /** Le verbatim de la phrase décisive, quand elle en porte une. */
  citationCle?: string;
  /** Date à laquelle l'article a été lu à la source. */
  luLe?: string;
} & StatutArticle;

export type Corpus = {
  id: string;
  intitule: string;
  url: string;
  /** Ce que ce corpus gouverne, en une phrase — pour situer sa portée. */
  portee: string;
  articles: readonly ArticleDepouille[];
};

/** Ce qu'on peut dire de la couverture d'un corpus, sans l'embellir. */
export type CouvertureCorpus = {
  corpusId: string;
  total: number;
  depouilles: number;
  retenus: number;
  sansObjet: number;
  horsPerimetre: number;
  nonDepouilles: number;
  /** Vrai seulement si aucun article n'est resté non dépouillé. */
  complet: boolean;
};

export function couverture(c: Corpus): CouvertureCorpus {
  const par = (s: StatutArticle["statut"]) =>
    c.articles.filter((a) => a.statut === s).length;
  const nonDepouilles = par("non_depouille");
  return {
    corpusId: c.id,
    total: c.articles.length,
    depouilles: c.articles.length - nonDepouilles,
    retenus: par("retenu"),
    sansObjet: par("sans_objet"),
    horsPerimetre: par("hors_perimetre"),
    nonDepouilles,
    complet: nonDepouilles === 0,
  };
}
