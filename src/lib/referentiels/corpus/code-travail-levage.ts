// Corpus : code du travail — vérifications des équipements de travail (levage).
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const CODE_TRAVAIL_LEVAGE: Corpus = {
  id: "code-travail-levage",
  intitule:
    "Code du travail — vérifications des équipements de travail (levage)",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018489757/",
  etendue: "articles_cites",
  portee:
    "Section 4 du chapitre III : vérification initiale (R. 4323-22), vérifications périodiques (R. 4323-23 et s.), remise en service (R. 4323-28), consignation au registre (R. 4323-25 à -27). S'applique à tout employeur.",
  articles: [
    {
      ref: "R. 4323-22",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      prescrit:
        "Article d'habilitation, non prescriptif par lui-même : il renvoie à des arrêtés du ministre chargé du travail ou de l'agriculture le soin de désigner les équipements soumis à vérification initiale lors de leur mise en service dans l'établissement, et aligne les conditions de cette vérification sur celles des vérifications périodiques de la sous-section 2. Aucune liste d'équipements ni aucun contenu de vérification ne figure dans l'article. Chemin : partie réglementaire, quatrième partie, livre III, titre II, chapitre III, section 4, sous-section 1 « Vérification initiale ».",
      citationCle:
        "Des arrêtés du ministre chargé du travail ou du ministre chargé de l'agriculture déterminent les équipements de travail et les catégories d'équipements de travail pour lesquels l'employeur procède ou fait procéder à une vérification initiale, lors de leur mise en service dans l'établissement, en vue de s'assurer qu'ils sont installés conformément aux spécifications prévues, le cas échéant, par la notice d'instructions du fabricant et peuvent être utilisés en sécurité. Cette vérification est réalisée dans les mêmes conditions que les vérifications périodiques prévues à la sous-section 2.",
      statut: "retenu",
      obligations: [
        "levage-epreuve-initiale-fonctionnement",
        "levage-examen-adequation-mise-en-service",
      ],
    },
    {
      ref: "R. 4323-23",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      prescrit:
        "Article d'habilitation. Il ne porte AUCUNE périodicité : il renvoie à des arrêtés du ministre chargé du travail ou de l'agriculture le soin de désigner les équipements soumis à vérification générale périodique ET d'en fixer la périodicité, la nature et le contenu. Sa portée est celle de tous les équipements de travail, pas seulement le levage : le corpus ne l'a instruit que par sa branche levage — l'arrêté du 1er mars 2004 —, alors qu'au moins une autre branche existe, l'arrêté du 5 mars 1993 relatif aux vérifications des machines hors appareils de levage, qui n'est instruite nulle part au référentiel. Le « retenu » ci-dessous ne vaut donc que pour la branche levage. Chemin : livre III, titre II, chapitre III, section 4, sous-section 2 « Vérifications périodiques ».",
      citationCle:
        "Des arrêtés du ministre chargé du travail ou du ministre chargé de l'agriculture déterminent les équipements de travail ou les catégories d'équipement de travail pour lesquels l'employeur procède ou fait procéder à des vérifications générales périodiques afin que soit décelée en temps utile toute détérioration susceptible de créer des dangers. Ces arrêtés précisent la périodicité des vérifications, leur nature et leur contenu.",
      statut: "retenu",
      obligations: [
        "levage-examen-etat-conservation",
        "levage-vgp-accessoires-annuelle",
        "levage-vgp-annuelle-charges",
        "levage-vgp-semestrielle-chariot-gerbeur",
        "levage-vgp-semestrielle-personnes",
        // Ajoutée le 2026-09-01. Elle manquait seule parmi les cinq VGP de
        // levage, sans raison : R. 4323-23 les fonde toutes de la même façon —
        // il oblige à la vérification générale périodique et renvoie la
        // périodicité à l'arrêté, ici l'article 23 b) de l'arrêté du 1er mars
        // 2004. Article rouvert à la source ce jour avant l'ajout.
        "levage-vgp-trimestrielle-force-humaine",
      ],
    },
    {
      ref: "R. 4323-25",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      prescrit:
        "Impose à l'employeur de consigner le résultat des vérifications générales périodiques sur le ou les registres de sécurité de l'article L. 4711-5. Obligation de traçabilité, sans périodicité propre : elle suit celle de la vérification.",
      citationCle:
        "Le résultat des vérifications générales périodiques est consigné sur le ou les registres de sécurité mentionnés à l'article L. 4711-5.",
      statut: "retenu",
      obligations: ["levage-registre-securite-consignation"],
    },
    {
      ref: "R. 4323-26",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      prescrit:
        "Quand la vérification est faite par un intervenant extérieur à l'établissement, impose d'annexer son rapport au registre de sécurité ; à défaut, d'y porter la date de la vérification, la date de remise du rapport et son lieu d'archivage dans l'établissement. Les deux branches sont des obligations, la seconde n'est pas une dispense.",
      citationCle:
        "Lorsque les vérifications périodiques sont réalisées par des personnes n'appartenant pas à l'établissement, les rapports établis à la suite de ces vérifications sont annexés au registre de sécurité. A défaut, les indications précises relatives à la date des vérifications, à la date de remise des rapports correspondants et à leur archivage dans l'établissement sont portées sur le registre de sécurité.",
      statut: "retenu",
      obligations: ["levage-registre-securite-consignation"],
    },
    {
      ref: "R. 4323-27",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      prescrit:
        "Autorise la tenue et la conservation du registre de sécurité et des rapports sur tout support, dans les conditions de l'article L. 8113-6. Permissif : ne crée aucune obligation nouvelle, lève l'exigence d'un support papier.",
      citationCle:
        "Le registre de sécurité et les rapports peuvent être tenus et conservés sur tout support dans les conditions prévues par l'article L. 8113-6.",
      statut: "retenu",
      obligations: ["levage-registre-securite-consignation"],
    },
    {
      ref: "R. 4323-28",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      prescrit:
        "Article d'habilitation : renvoie à des arrêtés ministériels le soin de désigner les équipements soumis à vérification lors de la remise en service après démontage-remontage ou après modification susceptible de mettre en cause la sécurité. Le déclencheur est l'opération, pas le calendrier — aucune récurrence ne s'en déduit. Chemin : section 4, sous-section 3 « Vérification lors de la remise en service ».",
      citationCle:
        "Des arrêtés des ministres chargés du travail ou de l'agriculture déterminent les équipements de travail et les catégories d'équipements de travail pour lesquels l'employeur procède ou fait procéder à une vérification, dans les conditions prévues à la sous-section 2, lors de leur remise en service après toute opération de démontage et remontage ou modification susceptible de mettre en cause leur sécurité, en vue de s'assurer de l'absence de toute défectuosité susceptible de créer des situations dangereuses.",
      statut: "retenu",
      obligations: ["levage-remise-en-service-apres-reparation"],
    },
  ],
};
