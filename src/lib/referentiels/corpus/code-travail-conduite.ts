// Corpus : code du travail — autorisation de conduite des équipements mobiles
// automoteurs et des équipements servant au levage.
//
// Étendue « integral » : la section 7 du chapitre III compte exactement trois
// articles (R. 4323-55 à R. 4323-57), et les trois sont ici.
//
// POURQUOI UN FICHIER À PART DE `code-travail-levage.ts`. Celui-là se déclare
// « Section 4 du chapitre III : vérification initiale, vérifications
// périodiques, remise en service, consignation au registre » — les
// vérifications d'un ÉQUIPEMENT. La section 7 porte sur la compétence d'une
// PERSONNE. Deux sections du même chapitre, deux sujets, deux corpus.
//
// LE DÉCRET DU 18 AVRIL 2025 EST LE MÊME QU'EN ÉLECTRICITÉ. `R. 4323-56` a été
// réécrit au 1er octobre 2025 par le décret n° 2025-355 — celui-là même qui a
// créé `R. 4544-11-1`, l'attestation médicale de l'habilitation électrique,
// aujourd'hui la seule obligation salarié du référentiel. Les deux articles se
// lisent presque mot pour mot : même durée de cinq ans, même délivrance par le
// médecin du travail, même conservation d'une copie par l'employeur. Ce n'est
// pas une coïncidence, c'est une réforme unique du suivi médical des travailleurs
// exposés, et le référentiel n'en portait jusqu'ici que la moitié.
//
// CE QUI N'EST PAS ICI : LE CACES. Il n'apparaît dans aucun des trois articles,
// et pour cause — il n'est pas dans le Code du travail. C'est un dispositif
// conventionnel, porté par des recommandations de la Caisse nationale
// d'assurance maladie, et le Code n'exige jamais d'en être titulaire. Ce qu'il
// exige est ailleurs : une « formation adéquate » (R. 4323-55) et une
// « autorisation de conduite délivrée par l'employeur » (R. 4323-56). Le CACES
// est l'un des moyens usuels de démontrer la première ; il n'est pas
// l'obligation. L'encoder comme telle aurait fait entrer une norme privée dans
// un référentiel qui n'en accepte aucune.
//
// Lecture : `agent_verbatim`, relevés sur Légifrance le 2026-08-31.

import type { Corpus } from "./types";

export const CODE_TRAVAIL_CONDUITE: Corpus = {
  id: "code-travail-conduite",
  intitule:
    "Code du travail — formation et autorisation de conduite des équipements mobiles et de levage",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018489837/",
  etendue: "integral",
  portee:
    "Section 7 « Autorisation de conduite pour l'utilisation de certains équipements de travail mobiles ou servant au levage de charges » : formation adéquate à la conduite (R. 4323-55), autorisation de conduite délivrée par l'employeur et attestation médicale quinquennale qui en conditionne la validité (R. 4323-56), renvoi aux arrêtés d'application (R. 4323-57). ATTENTION : R. 4323-56 a été réécrit au 1er octobre 2025 par le décret n° 2025-355 du 18 avril 2025, le même qui a créé R. 4544-11-1.",
  articles: [
    {
      ref: "R. 4323-55",
      intitule: "Formation adéquate à la conduite",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531407",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "La conduite des équipements de travail mobiles automoteurs et des équipements servant au levage est réservée aux travailleurs ayant reçu une formation adéquate, complétée et réactualisée chaque fois que nécessaire.",
      citationCle:
        "La conduite des équipements de travail mobiles automoteurs et des équipements de travail servant au levage est réservée aux travailleurs qui ont reçu une formation adéquate. Cette formation est complétée et réactualisée chaque fois que nécessaire.",
      statut: "retenu",
      obligations: ["conduite-salarie-formation"],
      reserve:
        "« Complétée et réactualisée chaque fois que nécessaire » ne chiffre aucune durée, et rien dans le Code ne la chiffre ailleurs. La périodicité de l'obligation est donc « autre ». Les recyclages à cinq ans que l'on rencontre en pratique viennent des recommandations CACES de la Caisse nationale d'assurance maladie, pas du droit : les encoder ferait exactement ce que ce dépôt a déjà eu à défaire une fois.",
    },
    {
      ref: "R. 4323-56",
      intitule:
        "Autorisation de conduite et attestation médicale quinquennale",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769343",
      versionEnVigueur: "2025-10-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "La conduite de certains équipements est subordonnée à une autorisation de conduite délivrée par l'employeur, dont la validité est subordonnée à la détention par le travailleur d'une attestation d'absence de contre-indication médicale d'une validité de cinq ans délivrée par le médecin du travail.",
      citationCle:
        "La conduite de certains équipements présentant des risques particuliers, en raison de leurs caractéristiques ou de leur objet, est subordonnée à l'obtention d'une autorisation de conduite délivrée par l'employeur. La validité de cette autorisation de conduite est subordonnée à la détention, par le travailleur, d'une attestation qu'il ne présente pas de contre-indications médicales à la conduite du ou des équipements dont la conduite est autorisée. Cette attestation, d'une validité de cinq ans, est délivrée par le médecin du travail à l'issue d'un examen médical qu'il réalise. Elle est présentée par le travailleur à l'employeur, qui en conserve une copie pendant toute sa durée de validité.",
      statut: "retenu",
      obligations: [
        "conduite-salarie-autorisation",
        "conduite-salarie-attestation-medicale",
      ],
      reserve:
        "Deux alinéas de l'article ne sont pas encodés. Le premier prévoit que l'attestation « est conforme à un modèle fixé par arrêté du ministre chargé du travail et du ministre chargé de l'agriculture » — l'arrêté n'est pas dépouillé, donc pas cité. Le second ouvre au salarié comme à l'employeur une contestation du refus de délivrance devant le conseil de prud'hommes selon la procédure accélérée au fond : c'est une voie de recours, pas une échéance, et le produit n'a rien à en faire.",
    },
    {
      ref: "R. 4323-57",
      intitule: "Renvoi aux arrêtés d'application",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531403",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      citationCle:
        "Des arrêtés des ministres chargés du travail ou de l'agriculture déterminent : 1° Les conditions de la formation exigée à l'article R. 4323-55 ; 2° Les catégories d'équipements de travail dont la conduite nécessite d'être titulaire d'une autorisation de conduite ; 3° Les conditions dans lesquelles l'employeur s'assure que le travailleur dispose de la compétence et de l'aptitude nécessaires pour assumer, en toute sécurité, la fonction de conducteur d'un équipement de travail ; 4° La date à compter de laquelle, selon les catégories d'équipements, entre en vigueur l'obligation d'être titulaire d'une autorisation de conduite.",
      statut: "sans_objet",
      motif:
        "Article d'habilitation : il ne prescrit rien à un employeur, il donne compétence aux ministres. Il porte cependant une conséquence à connaître — c'est un arrêté, et non le Code, qui fixe LA LISTE des équipements dont la conduite exige une autorisation. Le référentiel ne peut donc pas dire quels équipements déclenchent `conduite-salarie-autorisation` : il dit que l'obligation existe et laisse l'employeur déclarer qui détient l'autorisation. Un arrêté du 26 septembre 2025 relatif à la formation à la conduite existe et n'est pas dépouillé ; tant qu'il ne l'est pas, aucune obligation ne peut s'y appuyer.",
    },
  ],
};
