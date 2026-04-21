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
 *   - Arrêté du 25 avril 1985 relatif à la vérification et à l'entretien des
 *     installations collectives de VMC-Gaz dans les bâtiments d'habitation.
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
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490423/",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4222-21",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490425/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 8 octobre 1987, art. 2, 3 et 4",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000869716/",
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
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490423/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 8 octobre 1987, art. 3",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000869716/",
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
    libelle: "Contrôle semestriel des installations en locaux à pollution spécifique",
    description:
      "Dans les locaux à pollution spécifique (poussières, gaz, vapeurs, aérosols), l'efficacité des systèmes de captage et l'ambiance des locaux font l'objet de contrôles au moins semestriels, en complément du contrôle annuel général.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 8 octobre 1987, art. 3 § II",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000869716/",
      },
    ],
    periodicite: "semestrielle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { travail: true },
    categoriesEquipement: ["VMC", "CTA", "HOTTE_PRO"],
    notesInternes:
      "Applicable uniquement si l'établissement déclare un local à pollution spécifique — affinage côté moteur de matching (propriété de l'équipement ou flag dédié).",
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
        reference: "Arrêté du 25 juin 1980, art. PS 32",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
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
        reference: "Arrêté du 25 juin 1980, art. PS 32",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
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
  {
    id: "aeration-hotte-pro-annuelle",
    domaine: "aeration",
    libelle: "Ramonage et vérification annuelle des hottes et conduits d'extraction (grandes cuisines ERP)",
    description:
      "Les circuits d'extraction d'air vicié et de buées (hottes, conduits) des grandes cuisines situées dans un ERP font l'objet d'un ramonage et d'une vérification au moins annuels, au titre de l'article GC 20 du règlement ERP et des règlements sanitaires départementaux.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. GC 20",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { erp: { categories: ["N1", "N2", "N3", "N4", "N5"] } },
    categoriesEquipement: ["HOTTE_PRO"],
    notesInternes:
      "Applicable quand le type ERP est N (restaurant, débit de boissons) et qu'une hotte professionnelle est déclarée. Le moteur de matching (étape 5) affinera sur le type ERP.",
  },

  // ---------------------------------------------------------------------------
  // Habitation — VMC-Gaz (arrêté du 25 avril 1985)
  // ---------------------------------------------------------------------------
  {
    id: "aeration-habitation-vmc-gaz-annuelle",
    domaine: "aeration",
    libelle: "Entretien et vérification annuelle des installations collectives de VMC-Gaz (habitation)",
    description:
      "Le propriétaire ou syndic d'un immeuble d'habitation équipé d'une ventilation mécanique contrôlée desservant des appareils à gaz fait entretenir et vérifier périodiquement l'ensemble de ces installations par un professionnel qualifié, sous contrat écrit.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 avril 1985, art. 1 et 2",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000686049/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { habitation: true },
    categoriesEquipement: ["VMC"],
    notesInternes:
      "Hors périmètre principal TPE/PME mais retenu car une TPE peut gérer un immeuble d'habitation (cf. flag estHabitation, ADR-004).",
  },
];
