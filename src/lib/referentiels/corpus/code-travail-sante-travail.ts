// Corpus : code du travail — suivi individuel de l'état de santé du travailleur.
//
// Étendue « articles_cites » : la section 2 du chapitre IV court de R. 4624-10
// à R. 4624-45-9 — une quarantaine d'articles, dont les examens de reprise, le
// suivi post-exposition, la fiche d'entreprise, les contestations d'avis. Six
// seulement sont lus ici, ceux sur lesquels s'appuient les quatre obligations
// encodées. Le reste n'est pas dépouillé et ne se déclare pas lu.
//
// CE QUE CE CORPUS A DE PARTICULIER, ET QUI DOIT SE LIRE AVANT DE L'ÉTENDRE.
// C'est le seul corpus du référentiel dont toutes les obligations salarié
// portent `pieceMedicale: true`. Le produit ne détient de ces visites que trois
// choses — qu'elles ont eu lieu, quand, et quand la suivante est due. Jamais
// l'avis d'aptitude, jamais une restriction, jamais un motif, jamais la pièce.
// C'est plus strict que le droit, et c'est un choix produit assumé, motivé dans
// `docs/rgpd.md` § 2.3.
//
// LES PÉRIODICITÉS SONT DES PLAFONDS, PAS DES RENDEZ-VOUS. Le texte écrit « qui
// ne peut excéder cinq ans » (R. 4624-16) et « qui ne peut être supérieure à
// quatre ans » (R. 4624-28) ; dans les deux cas le médecin du travail fixe le
// délai réel, plus court, en fonction de l'âge, de l'état de santé et des
// risques. Les cinq et quatre ans encodés sont donc la borne extérieure — la
// date au-delà de laquelle l'employeur est nécessairement en défaut — et non le
// rythme que le médecin a retenu. Ce n'est pas une périodicité inventée : les
// deux nombres sont écrits dans le Code. Mais un dirigeant qui lirait « échéance
// dans cinq ans » là où son médecin a fixé trois ans serait mal informé, et
// c'est pourquoi chaque obligation le dit dans sa `description`, et pourquoi
// `TitreSalarie.echeanceLe`, déclaré par l'employeur, prime sur tout calcul.
//
// Lecture : `agent_verbatim`, relevés sur Légifrance le 2026-08-31.

import type { Corpus } from "./types";

export const CODE_TRAVAIL_SANTE_TRAVAIL: Corpus = {
  id: "code-travail-sante-travail",
  intitule:
    "Code du travail — suivi individuel de l'état de santé du travailleur",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018493140/",
  etendue: "articles_cites",
  portee:
    "Extraits de la section 2 du chapitre IV : visite d'information et de prévention et sa périodicité (R. 4624-10, R. 4624-16), suivi individuel renforcé — champ, liste des postes à risques particuliers, examen d'aptitude et périodicité (R. 4624-22 à R. 4624-24, R. 4624-28). ATTENTION : R. 4624-23 a été réécrit au 10 avril 2026 par le décret n° 2026-253 du 8 avril 2026 — c'est l'article le plus récemment modifié de tout le référentiel.",
  articles: [
    {
      ref: "R. 4624-10",
      intitule: "Visite d'information et de prévention initiale",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769085",
      versionEnVigueur: "2017-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Tout travailleur bénéficie d'une visite d'information et de prévention dans un délai qui n'excède pas trois mois à compter de la prise effective du poste.",
      citationCle:
        "Tout travailleur bénéficie d'une visite d'information et de prévention, réalisée par l'un des professionnels de santé mentionnés au premier alinéa de l'article L. 4624-1 dans un délai qui n'excède pas trois mois à compter de la prise effective du poste de travail.",
      statut: "retenu",
      obligations: ["sante-travail-salarie-vip"],
      reserve:
        "Le délai de trois mois court depuis la prise effective du poste, pas depuis la visite précédente : ce n'est pas une périodicité, et le modèle ne l'exprime pas. `Periodicite` décrit une récurrence, et `TitreSalarie.delivreLe` porte la date de la visite reçue, pas celle de l'embauche. Le délai est rappelé dans la description de l'obligation ; il n'est pas calculé.",
    },
    {
      ref: "R. 4624-16",
      intitule: "Périodicité du renouvellement de la visite d'information",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769063",
      versionEnVigueur: "2017-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le renouvellement de la visite d'information et de prévention intervient selon une périodicité qui ne peut excéder cinq ans, fixée par le médecin du travail au regard des conditions de travail, de l'âge, de l'état de santé et des risques.",
      citationCle:
        "Le travailleur bénéficie d'un renouvellement de la visite d'information et de prévention initiale, réalisée par un professionnel de santé mentionné au premier alinéa de l'article L. 4624-1, selon une périodicité qui ne peut excéder cinq ans. Ce délai, qui prend en compte les conditions de travail, l'âge et l'état de santé du salarié, ainsi que les risques auxquels il est exposé, est fixé par le médecin du travail dans le cadre du protocole mentionné à l'article L. 4624-1.",
      statut: "retenu",
      obligations: ["sante-travail-salarie-vip"],
    },
    {
      ref: "R. 4624-22",
      intitule: "Champ du suivi individuel renforcé",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769092",
      versionEnVigueur: "2017-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Tout travailleur affecté à un poste présentant des risques particuliers au sens de R. 4624-23 bénéficie d'un suivi individuel renforcé de son état de santé.",
      citationCle:
        "Tout travailleur affecté à un poste présentant des risques particuliers pour sa santé ou sa sécurité ou pour celles de ses collègues ou des tiers évoluant dans l'environnement immédiat de travail défini à l'article R. 4624-23 bénéficie d'un suivi individuel renforcé de son état de santé selon des modalités définies par la présente sous-section.",
      statut: "retenu",
      obligations: ["sante-travail-salarie-sir"],
    },
    {
      ref: "R. 4624-23",
      intitule: "Postes présentant des risques particuliers",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036483826",
      versionEnVigueur: "2026-04-10",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le I fixe la liste des expositions ouvrant un suivi individuel renforcé ; le III met à la charge de l'employeur une liste complémentaire de postes, motivée par écrit, transmise au service de prévention et de santé au travail et mise à jour tous les ans.",
      citationCle:
        "S'il le juge nécessaire, l'employeur complète la liste des postes entrant dans les catégories mentionnées au I. par des postes présentant des risques particuliers […] après avis du ou des médecins concernés et du comité social et économique s'il existe, en cohérence avec l'évaluation des risques prévue à l'article L. 4121-3 et, le cas échéant, la fiche d'entreprise prévue à l'article R. 4624-46. Cette liste est transmise au service de prévention et de santé au travail, tenue à disposition du directeur régional des entreprises, de la concurrence, de la consommation, du travail et de l'emploi et des services de prévention des organismes de sécurité sociale et mise à jour tous les ans. L'employeur motive par écrit l'inscription de tout poste sur cette liste.",
      statut: "retenu",
      obligations: ["sante-travail-etablissement-liste-postes-risques"],
      reserve:
        "Le I — amiante, plomb, agents CMR, agents biologiques des groupes 3 et 4, rayonnements ionisants, risque hyperbare, chute de hauteur au montage d'échafaudages — n'est pas encodé comme déclencheur, et ne peut pas l'être : rien dans le modèle ne dit à quoi un salarié est exposé, et le déduire serait le cinquième déclencheur (activité réellement exercée), non implémenté. Le II — tout poste dont l'affectation est conditionnée à un examen d'aptitude spécifique prévu par le Code — reste également hors du calcul. Le IV, qui fait consulter le Conseil d'orientation des conditions de travail tous les trois ans sur la mise à jour de la liste du I, ne concerne pas l'employeur.",
    },
    {
      ref: "R. 4624-24",
      intitule: "Examen médical d'aptitude préalable à l'affectation",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769104",
      versionEnVigueur: "2017-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le suivi individuel renforcé comprend un examen médical d'aptitude, qui se substitue à la visite d'information et de prévention et qui est effectué par le médecin du travail préalablement à l'affectation sur le poste.",
      citationCle:
        "Le suivi individuel renforcé comprend un examen médical d'aptitude, qui se substitue à la visite d'information et de prévention prévue à l'article R. 4624-10. Il est effectué par le médecin du travail préalablement à l'affectation sur le poste.",
      statut: "retenu",
      obligations: ["sante-travail-salarie-sir"],
      reserve:
        "Les cinq finalités énumérées par l'article — vérifier l'aptitude au poste, rechercher une affection dangereuse pour les autres, proposer des adaptations, informer et sensibiliser le travailleur — décrivent le contenu médical de l'examen. Rien n'en est encodé, et rien ne doit l'être : c'est exactement ce que `docs/rgpd.md` § 2.3 exclut du produit. Le référentiel retient de cet article qu'un examen est dû avant l'affectation, et qu'il se substitue à la VIP.",
    },
    {
      ref: "R. 4624-28",
      intitule: "Périodicité du suivi individuel renforcé",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769094",
      versionEnVigueur: "2017-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le renouvellement est effectué par le médecin du travail selon une périodicité qu'il détermine et qui ne peut être supérieure à quatre ans ; une visite intermédiaire est effectuée par un professionnel de santé au plus tard deux ans après la visite avec le médecin du travail.",
      citationCle:
        "Tout travailleur affecté à un poste présentant des risques particuliers […] bénéficie, à l'issue de l'examen médical d'embauche, d'un renouvellement de cette visite, effectuée par le médecin du travail selon une périodicité qu'il détermine et qui ne peut être supérieure à quatre ans. Une visite intermédiaire est effectuée par un professionnel de santé mentionné au premier alinéa de l'article L. 4624-1 au plus tard deux ans après la visite avec le médecin du travail.",
      statut: "retenu",
      obligations: [
        "sante-travail-salarie-sir",
        "sante-travail-salarie-sir-visite-intermediaire",
      ],
    },
  ],
};
