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
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532294/",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4222-21",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036483604/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 8 octobre 1987, art. 2, 3 et 4",
        urlLegifrance:
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
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532294/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 8 octobre 1987, art. 3",
        urlLegifrance:
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
        urlLegifrance:
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
        reference: "Arrêté du 25 juin 1980, art. CH 58",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
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
        urlLegifrance:
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
        urlLegifrance:
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
    id: "aeration-habitation-vmc-gaz-annuelle",
    domaine: "aeration",
    libelle: "Entretien et vérification annuelle des installations collectives de VMC-Gaz (habitation)",
    description:
      "Le propriétaire ou syndic d'un immeuble d'habitation équipé d'une ventilation mécanique contrôlée desservant des appareils à gaz fait entretenir et vérifier périodiquement l'ensemble de ces installations par un professionnel qualifié, dans le cadre d'un contrat écrit.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 23 février 2018 (installations de gaz des bâtiments d'habitation) — remplace l'arrêté du 25 avril 1985, abrogé le 5 mars 2018",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036667631",
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
      "Hors périmètre principal TPE/PME mais retenu car une TPE peut gérer un immeuble d'habitation (cf. flag estHabitation, ADR-004). L'arrêté du 25 avril 1985 ne vise QUE les VMC desservant des appareils à gaz (VMC-Gaz) : la condition `estVmcGaz` évite d'appliquer la règle à toute VMC d'habitation. Forme `non_infirmee` obligatoire ici (criticité 5) — les VMC déjà déclarées gardent l'obligation tant que le dirigeant n'a pas répondu « non » à la question du raccordement gaz.",
  },
];
