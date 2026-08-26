/**
 * Obligations réglementaires — Aération et ventilation (P1).
 *
 * Sources primaires :
 *   - Code du travail, articles R. 4222-1 à R. 4222-26 (aération des lieux de
 *     travail), notamment R. 4222-20 (entretien) et R. 4222-21 (contrôle).
 *   - Arrêté du 8 octobre 1987 relatif au contrôle périodique des installations
 *     d'aération et d'assainissement des locaux de travail.
 *   - Arrêté du 25 juin 1980 modifié (règlement ERP) — article CH 58
 *     (installations de chauffage-ventilation), article PS 32 (parcs de
 *     stationnement couverts), article GC 20 (grandes cuisines).
 *   - Arrêté du 23 février 2018 (installations de gaz des bâtiments
 *     d'habitation), qui a abrogé le 5 mars 2018 l'arrêté du 25 avril 1985
 *     sur l'entretien des VMC-Gaz collectives.
 *
 * Audit des sources 2026-08-25 : toutes les URLs ont été ouvertes sur
 * Légifrance ; les contrôles semestriels de l'arrêté de 1987 ne visent que
 * les installations avec recyclage (art. 4).
 *
 * Les seuils (capacité de parking, typologie) sont textuellement issus du
 * règlement ERP — pas d'interprétation interne.
 */

import type { Obligation } from "./types";

export const obligationsAeration: Obligation[] = [
  // ---------------------------------------------------------------------------
  // Travail (Code du travail + arrêté du 8 octobre 1987)
  // ---------------------------------------------------------------------------
  {
    id: "aeration-travail-mise-en-service",
    domaine: "aeration",
    libelle: "Contrôle initial des installations d'aération à la mise en service",
    description:
      "L'employeur fait procéder, au plus tard un mois après la mise en service, aux mesures et contrôles permettant de vérifier la conformité des installations d'aération et d'assainissement de l'air aux prescriptions du Code du travail. Les résultats sont consignés dans le dossier d'installation.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4222-20",
        article: "R. 4222-20",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532294/",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4222-21",
        article: "R. 4222-21",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036483604/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 8 octobre 1987, art. 2, 3 et 4",
        article: "Arrêté 1987-10-08 art. 3",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000863044/",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { travail: true },
    categoriesEquipement: ["VMC", "CTA"],
  },
  {
    id: "aeration-travail-entretien-annuel",
    domaine: "aeration",
    libelle: "Contrôle périodique annuel des installations d'aération (travail)",
    description:
      "L'employeur fait procéder une fois par an à des mesures et contrôles du débit global d'air neuf, du recyclage éventuel, de l'efficacité des systèmes d'épuration, et à l'entretien des systèmes de ventilation. Les résultats sont consignés au dossier.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4222-20",
        article: "R. 4222-20",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532294/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 8 octobre 1987, art. 3",
        article: "Arrêté 1987-10-08 art. 3",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006678610",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee", "personne_competente"],
    criticite: 4,
    typologies: { travail: true },
    categoriesEquipement: ["VMC", "CTA"],
  },
  {
    id: "aeration-travail-locaux-pollution-specifique",
    domaine: "aeration",
    libelle: "Contrôle annuel des installations en locaux à pollution spécifique",
    description:
      "Dans les locaux à pollution spécifique (poussières, gaz, vapeurs, aérosols), l'employeur fait contrôler au moins une fois par an le débit global d'air extrait, les pressions ou vitesses aux points caractéristiques et l'état des éléments de l'installation (captage, gaines, ventilateurs, épuration). Lorsque l'installation recycle l'air, un contrôle semestriel supplémentaire porte sur la concentration en poussières dans les gaines de recyclage et sur les systèmes de surveillance.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 8 octobre 1987, art. 4",
        article: "Arrêté 1987-10-08 art. 4",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006678611",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { travail: true },
    categoriesEquipement: ["VMC", "CTA", "HOTTE_PRO"],
    conditions: [
      {
        type: "equipement_propriete_booleenne",
        categorie: "VMC",
        propriete: "estLocalPollutionSpecifique",
        valeur: true,
      },
      {
        type: "equipement_propriete_booleenne",
        categorie: "CTA",
        propriete: "estLocalPollutionSpecifique",
        valeur: true,
      },
      {
        type: "equipement_propriete_booleenne",
        categorie: "HOTTE_PRO",
        propriete: "estLocalPollutionSpecifique",
        valeur: true,
      },
    ],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version imposait un contrôle SEMESTRIEL à tout local à pollution spécifique en citant « art. 3 § II ». L'art. 3 vise les locaux à pollution NON spécifique ; l'art. 4 (pollution spécifique) prévoit un contrôle annuel, le semestriel ne concernant que les installations avec recyclage de l'air. Le formulaire n'a pas de propriété « recyclage » : le contrôle semestriel est mentionné dans la description mais pas planifié.",
  },

  // ---------------------------------------------------------------------------
  // ERP (arrêté du 25 juin 1980)
  // ---------------------------------------------------------------------------
  {
    id: "aeration-erp-chauffage-ventilation-annuelle",
    domaine: "aeration",
    libelle: "Vérification annuelle des installations techniques de chauffage-ventilation (ERP)",
    description:
      "Les installations de chauffage, de ventilation et de conditionnement d'air des ERP sont vérifiées annuellement par un technicien compétent, pour s'assurer du bon état des matériels et du respect des prescriptions.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. CH 58 (vérification dans les conditions de la section II du chapitre Ier)",
        article: "CH 58",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020304588/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. CH 57 (entretien, ramonage annuel des conduits de fumée)",
        article: "CH 57",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020304588/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { erp: true },
    categoriesEquipement: ["VMC", "CTA"],
  },
  {
    id: "aeration-erp-ps-surveillance-qualite-air-inf-250",
    domaine: "aeration",
    libelle: "Contrôle biennal de la surveillance de la qualité de l'air — parcs couverts ≤ 250 véhicules (ERP)",
    description:
      "Dans les parcs de stationnement couverts des ERP de capacité inférieure ou égale à 250 véhicules, les dispositifs de surveillance de la qualité de l'air (CO, NO₂) sont contrôlés tous les deux ans.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. PS 32 (rédaction arrêté du 9 mai 2006)",
        article: "PS 32",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000024812448/",
      },
    ],
    periodicite: "biennale",
    realisateurs: ["personne_qualifiee"],
    criticite: 3,
    typologies: { erp: true },
    categoriesEquipement: ["VMC"],
    conditions: [
      {
        type: "equipement_propriete_numerique",
        categorie: "VMC",
        propriete: "nbVehiculesParkingCouvert",
        operateur: "<=",
        valeur: 250,
      },
    ],
    notesInternes:
      "Condition sur propriété d'équipement — à alimenter par le formulaire de déclaration (étape 4).",
  },
  {
    id: "aeration-erp-ps-surveillance-qualite-air-sup-250",
    domaine: "aeration",
    libelle: "Contrôle annuel de la surveillance de la qualité de l'air — parcs couverts > 250 véhicules (ERP)",
    description:
      "Dans les parcs de stationnement couverts des ERP de capacité supérieure à 250 véhicules, les dispositifs de surveillance de la qualité de l'air sont contrôlés annuellement.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. PS 32 (rédaction arrêté du 9 mai 2006)",
        article: "PS 32",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000024812448/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { erp: true },
    categoriesEquipement: ["VMC"],
    conditions: [
      {
        type: "equipement_propriete_numerique",
        categorie: "VMC",
        propriete: "nbVehiculesParkingCouvert",
        operateur: ">",
        valeur: 250,
      },
    ],
  },
  // Note (amendement 2026-08) : l'obligation « aeration-hotte-pro-annuelle »
  // (ramonage annuel des circuits d'extraction, art. GC 20) vivait ici ET dans
  // `cuisson-hotte.ts` sous l'id `cuisson-erp-circuits-extraction-nettoyage` —
  // même article, même périodicité, même catégorie d'équipement. Les deux
  // entrées ont été fusionnées dans `cuisson-hotte.ts`, dont le domaine
  // (`cuisson_hotte`) correspond au chapitre « Grandes cuisines » du règlement
  // ERP d'où l'obligation est issue. L'id `aeration-hotte-pro-annuelle` est
  // retiré et ne doit jamais être réutilisé.

  // ---------------------------------------------------------------------------
  // Habitation — VMC-Gaz (arrêté du 23 février 2018, ex-arrêté du 25 avril 1985)
  // ---------------------------------------------------------------------------
  {
    id: "aeration-habitation-vmc-gaz-quinquennale",
    domaine: "aeration",
    libelle:
      "Contrôle quinquennal du réglage et de la sécurité collective des VMC-Gaz (habitation)",
    description:
      "Au moins une fois tous les cinq ans, l'installation collective de VMC-gaz fait l'objet du contrôle et du réglage global de l'ensemble de l'installation — notamment le réglage général du réseau aéraulique, le réglage ou le remplacement des bouches d'air et d'extraction et le relevé des pressions — ainsi que de la vérification du bon fonctionnement de l'ensemble du dispositif de sécurité collective, appareil raccordé par appareil raccordé. Ces opérations donnent lieu à un certificat remis au propriétaire ou au syndic.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference:
          "Arrêté du 23 février 2018, art. 26 § 5° (opérations quinquennales sur les VMC-gaz)",
        article: "Arrêté 23-02-2018 art. 26",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036667631",
        note: "« Les opérations à une fréquence au moins égale à une fois tous les cinq ans portent sur : - le contrôle et le réglage global de l'ensemble de l'installation et notamment le réglage général du réseau aéraulique, le réglage ou le remplacement des bouches d'air et d'extraction et le relevé des pressions, etc. ; - la vérification du bon fonctionnement de l'ensemble du dispositif de sécurité collective ; cette vérification porte également sur chaque appareil raccordé. » Verbatim relevé en première main le 2026-08-26.",
        versionConstatee: "2023-01-01",
      },
    ],
    periodicite: "quinquennale",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { habitation: true },
    categoriesEquipement: ["VMC"],
    conditions: [
      {
        type: "equipement_propriete_non_infirmee",
        categorie: "VMC",
        propriete: "estVmcGaz",
      },
    ],
    notesInternes:
      "Créée le 2026-08-26. L'article 26 § 5° fixe DEUX périodicités minimales — annuelle et quinquennale — et le référentiel ne portait que la première. Le contrôle quinquennal ne produisait donc aucune échéance, alors qu'il est le seul à vérifier le dispositif de sécurité collective DANS SON ENSEMBLE et appareil par appareil : c'est lui qui garantit que la combustion est bien coupée sur chaque logement si l'extraction s'arrête. Le contrôle annuel ne teste que le système de DÉTECTION du défaut.\n\nQuatrième occurrence du même motif après PE 4 § 2, PE 27 § 5 et EL 18 § 4 : un article qui porte plusieurs rythmes n'entrait dans le modèle que par son premier. Même forme `non_infirmee` et même criticité que l'obligation annuelle, dont elle partage la condition de déclenchement.",
  },
  {
    id: "aeration-habitation-vmc-gaz-annuelle",
    domaine: "aeration",
    libelle: "Entretien et vérification annuelle des installations collectives de VMC-Gaz (habitation)",
    description:
      "Le propriétaire ou syndic d'un immeuble d'habitation équipé d'une ventilation mécanique contrôlée desservant des appareils à gaz fait procéder chaque année au nettoyage des pales des ventilateurs, à la vérification et au remplacement éventuel des pièces d'usure, à la vérification du maintien des caractéristiques de fonctionnement de l'installation, de son état de propreté, du fonctionnement des alarmes et de l'absence de dispositifs motorisés raccordés, ainsi qu'au contrôle du bon fonctionnement du système de détection de défaut du dispositif de sécurité collective. Ces opérations donnent lieu à un certificat remis au propriétaire ou au syndic, attestant de leur réalisation effective.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference:
          "Arrêté du 23 février 2018, art. 26 § 5° (opérations annuelles sur les VMC-gaz)",
        article: "Arrêté 23-02-2018 art. 26",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036667631",
        note: "« Les installations collectives de ventilation mécanique contrôlée - gaz, auxquelles sont raccordés des appareils à gaz font l'objet d'opérations périodiques d'entretien et de vérification […] avec l'établissement d'un certificat remis au propriétaire ou au syndic et attestant de leur réalisation effective : Les opérations à une fréquence au moins égale à une fois par an portent sur : - le nettoyage des pales des ventilateurs ; - la vérification et, le cas échéant, le remplacement des pièces d'usure ; - la vérification du maintien des caractéristiques de fonctionnement de la ventilation mécanique contrôlée-gaz, de son état de propreté, du fonctionnement des alarmes éventuelles et de l'absence de dispositifs motorisés raccordés à la ventilation mécanique contrôlée - gaz ; - le bon fonctionnement du système de détection de défaut du dispositif de sécurité collective. » Verbatim relevé en première main le 2026-08-26. L'abrogation de l'arrêté du 25 avril 1985 est confirmée par l'article 32 du même arrêté.",
        versionConstatee: "2023-01-01",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { habitation: true },
    categoriesEquipement: ["VMC"],
    conditions: [
      {
        type: "equipement_propriete_non_infirmee",
        categorie: "VMC",
        propriete: "estVmcGaz",
      },
    ],
    notesInternes:
      "Hors périmètre principal TPE/PME mais retenu car une TPE peut gérer un immeuble d'habitation (cf. flag estHabitation, ADR-004). L'arrêté du 25 avril 1985 ne vise QUE les VMC desservant des appareils à gaz (VMC-Gaz) : la condition `estVmcGaz` évite d'appliquer la règle à toute VMC d'habitation. Forme `non_infirmee` obligatoire ici (criticité 5) — les VMC déjà déclarées gardent l'obligation tant que le dirigeant n'a pas répondu « non » à la question du raccordement gaz.\n\nCORRIGÉ LE 2026-08-26 après lecture du texte au verbatim. La description exigeait un « contrat écrit » que l'article 26 § 5° ne demande pas : il impose un CERTIFICAT remis au propriétaire ou au syndic, attestant de la réalisation effective. Le contrat d'entretien écrit figure bien dans l'arrêté, mais au § 3°, et il porte sur les installations de GAZ situées entre l'organe de coupure générale et les compteurs — pas sur la VMC-gaz. Deux obligations distinctes avaient été confondues. La référence ne citait par ailleurs aucun article, ce qui la rendait impossible à relier au dépouillement.",
  },
];
