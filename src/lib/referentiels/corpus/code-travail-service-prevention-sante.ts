// Corpus : code du travail — organisation du service de prévention et de santé
// au travail.
//
// Étendue « articles_cites » : quatre articles. Le titre II du livre VI en
// compte plusieurs dizaines — agrément, contrat pluriannuel, financement,
// gouvernance des services interentreprises — qui règlent la vie du SERVICE et
// non les obligations de l'employeur qui y adhère. Ils ne sont pas lus.
//
// LE FONDEMENT EST D'UNE MINCEUR REMARQUABLE, ET IL A FALLU LE VÉRIFIER.
// `L. 4622-1` tient en une phrase : « Les employeurs relevant du présent titre
// organisent des services de prévention et de santé au travail. » Ni
// « adhèrent », ni « interentreprises », ni délai. C'est pourtant lui le
// fondateur : ce sont `D. 4622-1` et `D. 4622-2` qui donnent au verbe
// « organisent » son contenu — service autonome ou interentreprises, au choix
// de l'employeur quand il l'a.
//
// CE QUE CE DÉPOUILLEMENT A ÉCARTÉ. `L. 4622-7` est couramment cité comme
// l'article de l'adhésion à un service interentreprises. Ouvert le 2026-08-31,
// il dit tout autre chose : il soumet les RESPONSABLES du groupement ou de
// l'organisme aux mêmes prescriptions et aux mêmes sanctions que l'employeur.
// Le citer en fondateur aurait fait reposer l'obligation de l'employeur sur un
// article qui traite de la responsabilité d'un tiers.
//
// AUCUNE PÉRIODICITÉ. Ni l'article L. ni les articles D. ne fixent de durée, de
// renouvellement ni d'échéance d'adhésion. La cotisation annuelle d'un service
// interentreprises est une réalité de gestion, pas une prescription du Code.

import type { Corpus } from "./types";

export const CODE_TRAVAIL_SERVICE_PREVENTION_SANTE: Corpus = {
  id: "code-travail-service-prevention-sante",
  intitule:
    "Code du travail — organisation et adhésion au service de prévention et de santé au travail",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000006178104/",
  etendue: "articles_cites",
  portee:
    "Le préalable de tout le suivi individuel de l'état de santé : l'obligation faite à l'employeur d'organiser un service de prévention et de santé au travail (L. 4622-1), et les deux formes que ce service peut prendre (D. 4622-1, D. 4622-2). Le reste du titre II — agrément, contrat pluriannuel d'objectifs et de moyens, financement, gouvernance des services interentreprises — règle la vie du service et non les obligations de l'employeur ; il n'est pas dépouillé.",
  articles: [
    {
      ref: "L. 4622-1",
      intitule:
        "Les employeurs organisent des services de prévention et de santé au travail",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043893834",
      versionEnVigueur: "2022-03-31",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Tout employeur relevant du titre II organise un service de prévention et de santé au travail.",
      citationCle:
        "Les employeurs relevant du présent titre organisent des services de prévention et de santé au travail.",
      statut: "retenu",
      obligations: ["sante-travail-etablissement-adhesion-spst"],
      reserve:
        "L'article n'écrit ni délai d'adhésion, ni renouvellement, ni sanction propre. Il ne dit pas non plus « adhérer » : c'est D. 4622-1 qui ouvre le choix entre service autonome et service interentreprises, ce dernier étant en pratique la seule voie ouverte à une TPE.",
    },
    {
      ref: "L. 4622-7",
      intitule:
        "Responsabilité des dirigeants d'un service assuré par un groupement distinct",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000006189753/",
      versionEnVigueur: "2022-03-31",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Lorsque le service est assuré par un groupement ou organisme distinct de l'établissement, les responsables de ce groupement sont soumis, dans les mêmes conditions que l'employeur et sous les mêmes sanctions, aux prescriptions du titre.",
      citationCle:
        "Lorsque le service de prévention et de santé au travail est assuré par un groupement ou organisme distinct de l'établissement employant les travailleurs bénéficiaires de ce service, les responsables de ce groupement ou de cet organisme sont soumis, dans les mêmes conditions que l'employeur et sous les mêmes sanctions, aux prescriptions du présent titre.",
      statut: "sans_objet",
      motif:
        "Article de responsabilité, et non d'obligation : il désigne QUI répond des prescriptions du titre quand le service est externalisé, il n'impose rien de nouveau à l'employeur. Il est lu et consigné ici précisément parce qu'il est souvent cité comme l'article de l'adhésion, ce qu'il n'est pas.",
    },
    {
      ref: "D. 4622-1",
      intitule: "Formes du service de prévention et de santé au travail",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018492757/",
      versionEnVigueur: "2022-04-28",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le service de prévention et de santé au travail est organisé sous la forme soit d'un service autonome, soit d'un service de prévention et de santé au travail interentreprises.",
      statut: "retenu",
      obligations: ["sante-travail-etablissement-adhesion-spst"],
    },
    {
      ref: "D. 4622-2",
      intitule: "Le choix de la forme appartient à l'employeur",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018492757/",
      versionEnVigueur: "2022-04-28",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Lorsque l'entreprise a le choix entre les deux formes de service, ce choix est fait par l'employeur.",
      statut: "retenu",
      obligations: ["sante-travail-etablissement-adhesion-spst"],
      reserve:
        "Les articles D. 4622-14 et suivants, qui règlent la mise en place et l'administration des services interentreprises, ne sont pas dépouillés : ils s'adressent au service, pas à l'employeur adhérent.",
    },
  ],
};
