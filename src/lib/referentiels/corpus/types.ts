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
  /**
   * Lu, dans le périmètre, et il CRÉE une obligation que le référentiel ne
   * porte pas.
   *
   * C'est le statut qui justifie tout l'exercice. Sans lui, un texte lu qui
   * impose quelque chose qu'on n'a pas encodé n'a que deux issues : être
   * classé « retenu » en désignant une obligation qui n'existe pas, ou
   * « sans objet » — ce qui serait un mensonge. Les deux effacent la
   * trouvaille.
   *
   * Une obligation manquante n'est pas un défaut du dépouillement : c'est son
   * produit. Le compte de ces articles est ce que le référentiel doit rattraper.
   */
  | { statut: "obligation_manquante"; motif: string; bloquePar?: string }
  /** Écarté par une exclusion déclarée du périmètre. */
  | { statut: "hors_perimetre"; exclusion: MotifExclusion; motif?: string }
  /** Présent au corpus, pas encore lu. */
  | { statut: "non_depouille" };

/**
 * Comment l'article a été lu. Le degré de confiance est une donnée, pas un
 * souvenir : sans lui, une lecture indirecte et une lecture à la source se
 * ressemblent une fois écrites.
 */
export type SourceLecture =
  /** Lu sur Légifrance, verbatim relevé par la personne qui l'encode. */
  | "premiere_main"
  /**
   * Lu sur Légifrance par un agent, qui en a rapporté le verbatim et la date
   * de version. Vaut constat, pas garantie : le verbatim n'a pas été recoupé.
   */
  | "agent_verbatim"
  /**
   * Lu ailleurs qu'à la source — reproduction consolidée, base
   * professionnelle, résumé. NE PEUT PAS fonder une entrée du référentiel :
   * deux reproductions concordantes peuvent dériver du même relevé, et aucune
   * ne porte la date de version faisant foi.
   */
  | "indirect";

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
  /** Date à laquelle l'article a été lu. */
  luLe?: string;
  /** Comment il a été lu. Obligatoire dès qu'il est dépouillé. */
  lecture?: SourceLecture;
} & StatutArticle;

export type Corpus = {
  id: string;
  intitule: string;
  url: string;
  /** Ce que ce corpus gouverne, en une phrase — pour situer sa portée. */
  portee: string;
  /**
   * `articles` couvre-t-il TOUT le texte, ou seulement une partie ?
   *
   * Sans ce drapeau, « complet » signifierait « j'ai lu tout ce que j'ai bien
   * voulu inscrire » — une tautologie. Un corpus partiel ne peut jamais se
   * déclarer complet, quel que soit l'état de ses articles.
   *
   * `integral` : la liste énumère tous les articles du texte, y compris ceux
   * qui n'intéressent pas le produit.
   * `articles_cites` : la liste ne contient que les articles que le référentiel
   * cite. Utile — c'est là que la dette se rembourse — mais ne prouve rien sur
   * ce que le texte contient d'autre.
   */
  etendue: "integral" | "articles_cites";
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
  /** Articles qui imposent quelque chose que le référentiel ne porte pas. */
  obligationsManquantes: number;
  nonDepouilles: number;
  /**
   * Vrai seulement si le corpus est intégral ET qu'aucun article n'est resté
   * non dépouillé. Un corpus partiel est toujours faux, par construction.
   */
  complet: boolean;
  etendue: Corpus["etendue"];
};

export function couverture(c: Corpus): CouvertureCorpus {
  const par = (s: StatutArticle["statut"]) =>
    c.articles.filter((a) => a.statut === s).length;
  const nonDepouilles = par("non_depouille");
  return {
    corpusId: c.id,
    etendue: c.etendue,
    total: c.articles.length,
    depouilles: c.articles.length - nonDepouilles,
    retenus: par("retenu"),
    sansObjet: par("sans_objet"),
    horsPerimetre: par("hors_perimetre"),
    obligationsManquantes: par("obligation_manquante"),
    nonDepouilles,
    complet: c.etendue === "integral" && nonDepouilles === 0,
  };
}
