// Corpus : code du travail — organisation de la prévention dans l'entreprise.
//
// Étendue « articles_cites » : cinq articles, ceux sur lesquels s'appuient les
// obligations du domaine `organisation_prevention` et la formation santé-
// sécurité du domaine `formation_securite`. Ils viennent de trois livres
// différents — la quatrième partie pour le salarié désigné, la deuxième pour le
// CSE, la première pour le règlement intérieur — et aucun de ces trois
// ensembles n'est dépouillé de bout en bout.
//
// CE QUE CE DÉPOUILLEMENT A CORRIGÉ DANS LE BRIEF DU LOT 8. Une référence sur
// deux y était approximative, et deux l'étaient assez pour changer
// l'obligation :
//
//   * `L. 1311-2` était donné comme le fondement du « règlement intérieur —
//     volet hygiène et sécurité ». Ouvert, il ne dit rien du contenu : il pose
//     le seuil de cinquante salariés et le délai de douze mois, rien d'autre.
//     C'est `L. 1321-1` 1° qui fait entrer le règlement intérieur dans le
//     périmètre santé-sécurité de Rojer. Le fondateur a été déplacé.
//
//   * `L. 2315-18` était présenté comme une obligation à part, portée par le
//     salarié. Elle l'est — mais `L. 4644-1` y renvoie expressément pour la
//     formation du salarié désigné compétent. Une seule ligne de catalogue
//     porte donc les deux populations ; en écrire deux aurait posé deux
//     obligations sur le même article fondateur.
//
// AUCUN DES CINQ ARTICLES N'ÉCRIT DE PÉRIODICITÉ. Les seuls chiffres qu'ils
// portent sont des seuils d'effectif (onze, cinquante), des délais d'entrée en
// obligation (douze mois) et des durées de stage (cinq jours, trois jours).
// Aucun n'est un rythme. Les cinq obligations qui s'y appuient portent
// `periodicite: "autre"`.

import type { Corpus } from "./types";

export const CODE_TRAVAIL_ORGANISATION_PREVENTION: Corpus = {
  id: "code-travail-organisation-prevention",
  intitule:
    "Code du travail — salarié désigné compétent, comité social et économique, règlement intérieur",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000024391542/",
  etendue: "articles_cites",
  portee:
    "Ce qui organise la prévention avant qu'il soit question d'un équipement : la désignation d'un salarié compétent (L. 4644-1), la mise en place du CSE au seuil de onze salariés (L. 2311-2) et la formation santé-sécurité de ses membres (L. 2315-18), l'obligation d'un règlement intérieur au seuil de cinquante (L. 1311-2) et son volet santé-sécurité (L. 1321-1). Ni le livre VI de la quatrième partie, ni le titre Ier du livre III de la deuxième partie, ni le titre II du livre III de la première partie ne sont dépouillés en entier.",
  articles: [
    {
      ref: "L. 4644-1",
      intitule:
        "Désignation d'un ou plusieurs salariés compétents en protection et prévention",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043893856",
      versionEnVigueur: "2022-03-31",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "L'employeur désigne un ou plusieurs salariés compétents pour s'occuper des activités de protection et de prévention des risques professionnels ; à défaut de compétences internes, il peut faire appel à un intervenant extérieur.",
      citationCle:
        "I.-L'employeur désigne un ou plusieurs salariés compétents pour s'occuper des activités de protection et de prévention des risques professionnels de l'entreprise.",
      statut: "retenu",
      obligations: [
        "prevention-etablissement-salarie-designe",
        "formation-securite-salarie-cse-sst",
      ],
      reserve:
        "Le recours aux intervenants extérieurs (IPRP, service de prévention de la caisse, OPPBTP, ANACT) des alinéas 3 à 5 n'est porté par aucune obligation : c'est une faculté conditionnée à l'absence de compétences internes, pas un acte dû. Aucun texte ne fixe de délai à la désignation elle-même.",
    },
    {
      ref: "L. 2311-2",
      intitule: "Champ d'application du comité social et économique",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035609353",
      versionEnVigueur: "2018-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Un CSE est mis en place dans les entreprises d'au moins onze salariés, l'obligation ne naissant que si l'effectif est atteint pendant douze mois consécutifs.",
      citationCle:
        "Un comité social et économique est mis en place dans les entreprises d'au moins onze salariés. Sa mise en place n'est obligatoire que si l'effectif d'au moins onze salariés est atteint pendant douze mois consécutifs.",
      statut: "retenu",
      obligations: ["prevention-etablissement-cse"],
      reserve:
        "Les douze mois consécutifs ne sont pas calculés : le modèle ne porte que l'effectif courant, sans historique. La ligne apparaît au franchissement constaté, donc en avance sur l'échéance légale. L'article compte par ENTREPRISE, le moteur évalue par établissement (`effectifSurSite`) : une entreprise multi-sites dont aucun site n'atteint onze ne verra pas la ligne.",
    },
    {
      ref: "L. 2315-18",
      intitule:
        "Formation en santé, sécurité et conditions de travail des membres de la délégation du personnel",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036761949",
      versionEnVigueur: "2022-03-31",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Les membres de la délégation du personnel du CSE et le référent harcèlement bénéficient d'une formation en santé, sécurité et conditions de travail, d'une durée minimale de cinq jours au premier mandat et de trois jours au renouvellement ; l'employeur la finance.",
      citationCle:
        "La formation est d'une durée minimale de cinq jours lors du premier mandat des membres de la délégation du personnel. En cas de renouvellement de ce mandat, la formation est d'une durée minimale : 1° De trois jours pour chaque membre de la délégation du personnel, quelle que soit la taille de l'entreprise ; 2° De cinq jours pour les membres de la commission santé, sécurité et conditions de travail dans les entreprises d'au moins trois cents salariés.",
      statut: "retenu",
      obligations: ["formation-securite-salarie-cse-sst"],
      reserve:
        "Cinq jours et trois jours sont des DURÉES DE STAGE, pas des périodicités : le rythme suit le mandat, que le produit ne modélise pas. Le 2° (cinq jours pour la CSSCT à partir de trois cents salariés) est hors cible et n'est pas encodé. La prise en charge du financement par l'employeur n'est pas une obligation distincte : c'est une règle de financement d'un acte unique.",
    },
    {
      ref: "L. 1321-1",
      intitule: "Contenu du règlement intérieur",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006901432",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le règlement intérieur est un document écrit par lequel l'employeur fixe exclusivement les mesures d'application de la réglementation en santé et sécurité, les conditions de participation des salariés au rétablissement de conditions de travail protectrices, et les règles générales de discipline.",
      citationCle:
        "1° Les mesures d'application de la réglementation en matière de santé et de sécurité dans l'entreprise ou l'établissement, notamment les instructions prévues à l'article L. 4122-1 ;",
      statut: "retenu",
      obligations: ["prevention-etablissement-reglement-interieur"],
      reserve:
        "Le 3° — discipline, nature et échelle des sanctions — relève du droit du travail non-SST, hors périmètre déclaré du produit. L'obligation encodée porte le seul volet santé-sécurité, et son libellé le dit.",
    },
    {
      ref: "L. 1311-2",
      intitule: "Établissement obligatoire du règlement intérieur",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038610176",
      versionEnVigueur: "2020-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "L'établissement d'un règlement intérieur est obligatoire à partir de cinquante salariés, au terme d'un délai de douze mois à compter du franchissement du seuil.",
      citationCle:
        "L'établissement d'un règlement intérieur est obligatoire dans les entreprises ou établissements employant au moins cinquante salariés. L'obligation prévue au premier alinéa s'applique au terme d'un délai de douze mois à compter de la date à laquelle le seuil de cinquante salariés a été atteint, conformément à l'article L. 2312-2.",
      statut: "retenu",
      obligations: ["prevention-etablissement-reglement-interieur"],
      reserve:
        "Cet article porte le SEUIL, pas le contenu : il ne suffirait pas à fonder une obligation dans un produit qui ne couvre que la santé-sécurité. Il est cité en contexte derrière L. 1321-1. Le délai de douze mois n'est pas calculé, pour la même raison que sur L. 2311-2 : le modèle ne porte pas la date de franchissement.",
    },
  ],
};
