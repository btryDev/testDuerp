// Corpus : installations classées — régimes et rétention (hors périmètre produit).
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const ICPE_STOCKAGE: Corpus = {
  id: "icpe-stockage",
  intitule:
    "Installations classées — régimes et rétention (hors périmètre produit)",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074220/LEGISCTA000006159273/",
  etendue: "articles_cites",
  portee:
    "Régimes ICPE (autorisation, enregistrement, déclaration) et valeurs de rétention de l'arrêté du 1er juin 2015. Cités pour situer une frontière : les seuils ne sont pratiquement jamais atteints dans les secteurs couverts.",
  articles: [
    {
      ref: "C. env. L. 512-1",
      intitule: "Installations soumises à autorisation environnementale",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033933233",
      versionEnVigueur: "2017-03-01",
      luLe: "2026-09-01",
      lecture: "agent_verbatim",
      prescrit:
        "Deux phrases, et rien de plus : elles posent le SEUL régime de l'autorisation — les installations qui présentent de graves dangers ou inconvénients pour les intérêts de L. 511-1 —, et renvoient la procédure à l'autorisation environnementale du livre Ier. Aucune démarche d'exploitant n'y est décrite, aucun seuil, aucune rubrique.",
      citationCle:
        "Sont soumises à autorisation les installations qui présentent de graves dangers ou inconvénients pour les intérêts mentionnés à l'article L. 511-1. L'autorisation, dénommée autorisation environnementale, est délivrée dans les conditions prévues au chapitre unique du titre VIII du livre Ier.",
      statut: "retenu",
      obligations: ["stockage-dangereux-declaration-icpe"],
      reserve:
        "UN SEUL DES TROIS RÉGIMES, relevé le 2026-09-01 : le chemin le dit — Livre V, Titre Ier, Chapitre II, SECTION 1 « Installations soumises à autorisation ». L'enregistrement est à la section 2 (L. 512-7 et s.), la déclaration à la section 3 (L. 512-8 et s.). `stockage-dangereux-declaration-icpe` fait porter à cette seule référence la vérification des trois régimes ; sa `reference` nomme bien les trois articles, mais l'`article` ancré au corpus n'est que L. 512-1, et c'est celui de l'autorisation — le régime que les secteurs couverts n'atteignent jamais. Les deux articles réellement utiles à un commerce ou un restaurant, L. 512-7 et L. 512-8, ne sont ni cités ni au corpus. Non corrigé : ajouter une référence n'est pas un relevé.\n\nÀ ne pas confondre avec la nomenclature : ce n'est pas cet article qui classe, c'est le décret de nomenclature pris pour L. 511-2. L'article ne dit pas quelles quantités déclenchent quoi.",
    },
    {
      ref: "Arrêté 2015-06-01 art. 22",
      intitule: "Rétentions",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000030684466",
      versionEnVigueur: "2022-01-01",
      luLe: "2026-09-01",
      lecture: "agent_verbatim",
      prescrit:
        "Fixe, pour les seules installations ENREGISTRÉES au titre des rubriques 4331 ou 4734, le dimensionnement et la tenue des capacités de rétention : le volume minimal (I.A), l'étanchéité et sa pérennité (I.B), la résistance (I.C), l'évacuation des eaux accumulées et la disponibilité permanente de la rétention (I.D), puis des régimes particuliers pour les réservoirs aériens (III), les récipients mobiles (IV), les bâtiments (V) et les rétentions déportées (VI). C'est une exigence d'état permanent : aucune vérification datée de la rétention elle-même.",
      citationCle:
        "Tout stockage de produits liquides susceptibles de créer une pollution de l'eau ou du sol, autres que ceux visés aux points III ; IV et VI de l'article 22 est associé à une capacité de rétention dont le volume est au moins égal à la plus grande des deux valeurs suivantes : -100 % de la capacité du plus grand réservoir ; -50 % de la capacité globale des réservoirs et récipients associés.",
      statut: "retenu",
      obligations: ["stockage-dangereux-retention"],
      reserve:
        "TROIS CHOSES RELEVÉES LE 2026-09-01, ARTICLE LU EN ENTIER.\n\n(1) LE CAS DES PETITS RÉCIPIENTS MANQUE, et c'est celui de tout le périmètre du produit. Le second alinéa du I.A écrit : « Lorsque le stockage est constitué exclusivement de récipients mobiles de capacité unitaire inférieure ou égale à 250 litres, le volume minimal de la rétention est égal soit à la capacité totale des récipients si cette capacité est inférieure à 800 litres, soit à 20 % de la capacité totale avec un minimum de 800 litres si cette capacité excède 800 litres. » Un restaurant ou un commerce stocke des bidons, pas des réservoirs : c'est cette règle-là qui leur parlerait, et la `description` de l'obligation ne cite que celle des réservoirs.\n\n(2) AUCUNE VÉRIFICATION PÉRIODIQUE D'ÉTANCHÉITÉ n'y figure. Ce que l'article impose est un état et une procédure : « La rétention est étanche aux produits qu'elle pourrait contenir. L'exploitant s'assure dans le temps de la pérennité de ce dispositif » (I.B), et « La rétention et ses dispositifs associés font l'objet d'une surveillance et d'une maintenance appropriées, définies dans une procédure » (I.F). La seule fréquence chiffrée de tout l'article est au VI.6, et elle vise autre chose : les dispositifs ACTIFS de drainage des rétentions déportées, testés « à une fréquence à minima semestrielle ». Ce semestre ne se transporte pas sur `stockage-dangereux-verification-etancheite`.\n\n(3) LE CHAMP EST L'ENREGISTREMENT SEUL — rubriques 4331 ou 4734. Ni la déclaration, ni le hors-ICPE. La `reference` de l'obligation le dit déjà (« opposables uniquement sous ce régime ICPE ») ; c'est exact, et cela reste vrai après lecture.",
    },
  ],
};
