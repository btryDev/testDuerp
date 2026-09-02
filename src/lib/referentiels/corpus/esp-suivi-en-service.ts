// Corpus : suivi en service des équipements sous pression — code de l'environnement et arrêté du 20 novembre 2017.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const ESP_SUIVI_EN_SERVICE: Corpus = {
  id: "esp-suivi-en-service",
  intitule:
    "Suivi en service des équipements sous pression — Code de l'environnement et arrêté du 20 novembre 2017",
  url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036128632",
  etendue: "articles_cites",
  portee:
    "Déclaration et contrôle de mise en service, inspection périodique, requalification, interventions. ATTENTION : les articles 4, 26 et 28 ont été modifiés par l'arrêté du 5 septembre 2025, en vigueur depuis le 8 septembre 2025.",
  articles: [
    {
      ref: "C. env. R. 557-14-1",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033741441",
      versionEnVigueur: "2016-12-31",
      // Page de l'article : « Création Décret n°2016-1925 du 28 décembre 2016 - art. 1 ».
      // Jamais modifié depuis sa création — pas de texte modificateur à signaler.
      modifiePar: null,
      luLe: "2026-09-01",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["esp-declaration-mise-en-service"],      prescrit:
        "Article de CHAMP, non de prescription : il dit à quels équipements s'applique la section « suivi en service » du code de l'environnement — récipients sous pression de gaz des groupes 1 et 2, équipements contenant de la vapeur d'eau ou de l'eau surchauffée, générateurs de vapeur, tuyauteries, avec leurs seuils ; puis les équipements sous pression nucléaires (hors enceintes de confinement et gaines de combustible), les accessoires sous pression et les accessoires de sécurité. Le IV pose la convention de vocabulaire reprise par tout l'arrêté du 20 novembre 2017. Le V renvoie à un arrêté distinct le suivi des équipements de véhicules (R. 321-6 à R. 321-19 du code de la route). Aucune échéance ne s'en déduit : les seuils opérationnels sont à l'article 7 de l'arrêté.",
      citationCle:
        "I. - Les dispositions de la présente section s'appliquent au suivi en service des équipements sous pression […] IV. - Les équipements sous pression, les récipients à pression simples et les équipements sous pression nucléaires mentionnés aux I, II et III sont appelés « équipements » dans la suite de la présente section.",
    },
    {
      ref: "Arrêté 2017-11-20 art. 6",
      versionEnVigueur: "2018-01-01",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["esp-dossier-suivi"],      prescrit:
        "Impose à l'exploitant de constituer, pour tout équipement fixe relevant de L. 557-30 du code de l'environnement, un DOSSIER D'EXPLOITATION : documentation de fabrication (notice, plans, schémas), identification des accessoires de sécurité, preuve de dépôt de la déclaration de mise en service, registre daté de toutes les opérations et interventions, attestations conservées au moins au-delà de l'intervalle maximal entre deux requalifications, et le plan d'inspection quand il en existe un. Il impose en outre la transmission du dossier au nouvel exploitant en cas de changement, et la tenue à jour d'une LISTE des récipients fixes, générateurs de vapeur et tuyauteries soumis — y compris les équipements au chômage — portant pour chacun le type, le régime de surveillance et les dates de la dernière et de la prochaine inspection ainsi que de la dernière et de la prochaine requalification. Aucune périodicité propre : c'est une obligation permanente de tenue, pas une échéance.",
      citationCle:
        "L'exploitant établit pour tout équipement fixe entrant dans le champ d'application de l'article L. 557-30 du code de l'environnement un dossier d'exploitation qui comporte les informations nécessaires à la sécurité de son exploitation, à son entretien, à son contrôle et aux éventuelles interventions : […] L'exploitant tient à jour une liste des récipients fixes, des générateurs de vapeur et des tuyauteries soumis aux dispositions du présent arrêté, y compris les équipements ou installations au chômage. Cette liste indique, pour chaque équipement, le type, le régime de surveillance, les dates de réalisation de la dernière et de la prochaine inspection et de la dernière et de la prochaine requalification périodique.",
    },
    {
      ref: "Arrêté 2017-11-20 art. 7-11",
      versionEnVigueur: "2018-01-01",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["esp-declaration-mise-en-service"],      prescrit:
        "Intervalle lu article par article. L'ART. 7 fixe le CHAMP par seuils — récipients de gaz PS > 4 bar et PS.V > 10 000 bar.l ; tuyauteries PS > 4 bar selon DN et PS.DN par groupe de gaz ; générateurs de vapeur PS > 32 bar OU V > 2 400 l OU PS.V > 6 000 bar ; appareils à couvercle amovible à fermeture rapide fixes — et définit l'objet du contrôle de mise en service. L'ART. 8 pose l'échéance de la déclaration : avant la première mise en service. L'ART. 9 en fixe la forme : téléservice LUNE, liste des pièces, preuve de dépôt. L'ART. 10 énumère les trois faits générateurs du CONTRÔLE de mise en service : première mise en service, nouvelle évaluation de conformité après intervention importante au sens de l'art. 27, remise en service après réinstallation hors de l'établissement précédent. L'ART. 11 dit qui contrôle : organisme habilité pour les générateurs de vapeur et les appareils à couvercle amovible à fermeture rapide, personne compétente pour les autres. Aucun de ces cinq articles ne porte de récurrence : déclaration et contrôle sont des actes de mise en service.",
      citationCle:
        "Sont soumis à la déclaration et au contrôle de mise en service : 1. Les récipients sous pression de gaz dont la pression maximale admissible PS est supérieure à 4 bar et dont le produit pression maximale admissible par le volume est supérieur à 10 000 bar.l ; […] 4. Les appareils à couvercle amovible à fermeture rapide fixes. […] (art. 8) La déclaration de mise en service est requise avant la première mise en service de l'équipement. […] (art. 10) Le contrôle de mise en service est requis avant : - la première mise en service de l'équipement ou après une évaluation de conformité liée à une intervention importante définie à l'article 27 du présent arrêté ; - la remise en service en cas de nouvelle installation en dehors de l'établissement dans lequel l'équipement était précédemment utilisé.",
    },
    {
      ref: "Arrêté 2017-11-20 art. 15",
      versionEnVigueur: "2018-01-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["esp-inspection-periodique"],
      prescrit:
        "STRUCTURE MAL RENDUE, relevée le 2026-08-27. L'article porte plusieurs régimes, tous en « au maximum » et non en échéance fixe : 1 an (bouteilles de plongée, récipients mobiles non métalliques), 4 ans dérogatoire après essai de vieillissement, 2 ans (générateurs de vapeur, appareils à couvercle amovible à fermeture rapide), 4 ans pour tous les autres hors tuyauteries, 3 ans pour la PREMIÈRE inspection, 40 mois en transitoire. S'y ajoutent une vérification avant chaque remplissage des récipients mobiles et un programme de contrôle propre aux tuyauteries. Le référentiel encode `triennale` : or le 3 ans n'est ni le régime général ni récurrent, c'est le plafond du premier cycle.",
    },
    {
      ref: "Arrêté 2017-11-20 art. 18-19",
      versionEnVigueur: "2018-01-01",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["esp-requalification-decennale"],      prescrit:
        "PLAFOND, PAS RYTHME — même défaut de structure que l'article 15 relevé le 2026-08-27. L'article 18 écrit « L'échéance MAXIMALE des requalifications périodiques est fixée à partir de la date de mise en service ou de la dernière requalification périodique », puis échelonne : 2 ans (bouteilles de plongée, récipients mobiles non métalliques), 3 ans (fluides listés non exempts d'impuretés corrosives), 6 ans (fluides toxiques ou corrosifs ; récipients mobiles non métalliques ayant subi les essais de vieillissement ; bouteilles de plongée à inspection au moins annuelle), 10 ans pour les AUTRES récipients, tuyauteries et générateurs de vapeur. Régime propre aux extincteurs de plus de 30 bar : requalification au premier rechargement effectué plus de six ans après la précédente, sans jamais excéder dix ans ; les autres extincteurs ne sont pas soumis. Le II ajoute un fait générateur : renouvellement de la requalification quand l'équipement fixe change à la fois d'établissement ET d'exploitant. L'article 19 en fixe le CONTENU dans un ordre imposé : vérification des documents de l'article 6, inspection, épreuve hydraulique, vérification des accessoires — avec dispense d'épreuve hydraulique pour les néo-soumis, les tuyauteries et leurs accessoires, et les récipients à fluide autre que vapeur ou eau surchauffée dont PS <= 4 bar. Le référentiel encode `decennale` : le dix ans est le cas résiduel, et c'est un maximum, pas une échéance fixe.",
      citationCle:
        "I. - L'échéance maximale des requalifications périodiques est fixée à partir de la date de mise en service ou de la dernière requalification périodique : […] - dix ans pour les autres récipients ou tuyauteries ainsi que pour les générateurs de vapeur. Pour les extincteurs soumis à une pression maximale admissible de plus de 30 bar, la requalification périodique est réalisée à l'occasion du premier rechargement effectué plus de six ans après la requalification précédente, sans que le délai entre deux requalifications périodiques ne puisse excéder dix ans.",
    },
    {
      ref: "Arrêté 2017-11-20 art. 26-28",
      versionEnVigueur: "2025-09-08",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["esp-intervention-reparation"],      prescrit:
        "Intervalle lu article par article. L'ART. 26 (version du 8 septembre 2025, arrêté du 5 septembre 2025) pose la typologie : une intervention en cours d'exploitation est une réparation ou une modification, et elle est importante, notable ou non notable ; les critères de classement ne sont PAS dans l'arrêté mais dans un guide professionnel approuvé par décision ministérielle publiée au Bulletin officiel. L'ART. 27 définit l'intervention IMPORTANTE — celle qui modifie la destination, le type original ou les performances au-delà des limites du fabricant — et la soumet à une nouvelle évaluation de conformité (R. 557-9-5 ou R. 557-10-5 du code de l'environnement). L'ART. 28 (également modifié au 8 septembre 2025) définit l'intervention NOTABLE : celle qui ne relève pas de l'article 27 et qui est susceptible d'avoir une incidence sur la conformité aux exigences essentielles de sécurité. Aucune périodicité : le fait générateur est l'intervention. Le classement dépend d'un guide professionnel que le référentiel ne porte pas et ne peut pas porter.",
      citationCle:
        "(art. 26) Au cours de son exploitation, un équipement peut faire l'objet d'interventions. Il peut s'agir de réparations ou de modifications. Une intervention peut être importante, notable ou non notable. Les critères permettant de classer les interventions sont précisés dans un guide professionnel approuvé par décision du ministre chargé de la sécurité industrielle […] (art. 27) I. - Une intervention est considérée comme importante lorsqu'elle conduit à modifier la destination d'un équipement, son type original ou ses performances, de sorte qu'elles ne s'inscrivent plus dans les limites prévues par le fabricant. […] (art. 28) Une intervention est considérée comme notable lorsqu'elle ne relève pas de l'article 27 et qu'elle est susceptible d'avoir une incidence sur la conformité de l'équipement aux exigences essentielles de sécurité qui lui sont applicables.",
    },
  ],
};
