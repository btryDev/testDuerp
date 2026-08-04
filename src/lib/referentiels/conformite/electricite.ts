/**
 * Obligations réglementaires — Électricité (P1).
 *
 * Sources primaires :
 *   - Code du travail, Section 5 « Utilisation des installations électriques »,
 *     articles R. 4226-1 à R. 4226-21 (vérifications), R. 4544-1 à R. 4544-11
 *     (habilitation électrique du personnel).
 *   - Arrêté du 26 décembre 2011 relatif aux vérifications ou processus de
 *     vérification des installations électriques en milieu de travail.
 *   - Arrêté du 25 juin 1980 modifié (règlement de sécurité ERP) — section EL
 *     (articles EL 3 à EL 20).
 *   - Arrêté du 22 juin 1990 modifié (règles PE pour ERP 5ᵉ catégorie).
 *   - Arrêté du 30 décembre 2011 (règlement IGH) — article GH 50.
 *
 * Aucune norme privée (APSAD, NF C 15-100) n'est citée comme obligation : ces
 * normes définissent des règles de l'art, mais l'opposabilité vient du texte
 * réglementaire qui les vise.
 */

import type { Obligation } from "./types";

export const obligationsElectricite: Obligation[] = [
  // ---------------------------------------------------------------------------
  // Travail (Code du travail)
  // ---------------------------------------------------------------------------
  {
    id: "elec-travail-mise-en-service",
    domaine: "electricite",
    libelle: "Vérification initiale des installations électriques à la mise en service ou après modification",
    description:
      "À la mise en service et après toute modification de structure, l'employeur fait procéder à une vérification des installations électriques. Le rapport doit être transmis à l'inspection du travail sur demande.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4226-14",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000025809999/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 26 décembre 2011, art. 3 à 5",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000025115666/",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["organisme_accredite"],
    criticite: 4,
    typologies: { travail: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
  },
  {
    id: "elec-travail-periodique-annuelle",
    domaine: "electricite",
    libelle: "Vérification périodique annuelle des installations électriques (travail)",
    description:
      "Vérification annuelle par un organisme accrédité ou une personne qualifiée désignée par l'employeur. Les modalités sont fixées par l'arrêté du 26 décembre 2011.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4226-16",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000025810013/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 26 décembre 2011, art. 1 et 2",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000025115666/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["organisme_accredite", "personne_qualifiee"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
  },
  {
    id: "elec-travail-consignation-registre",
    domaine: "electricite",
    libelle: "Consignation des rapports de vérification électrique au registre",
    description:
      "Les rapports des vérifications électriques et les justificatifs des mesures prises pour remédier aux anomalies sont tenus à la disposition de l'inspection du travail dans le dossier technique prévu à l'article L. 4711-5.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "L. 4711-5",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006903157/",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4226-19",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000025810023/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
  },
  {
    id: "elec-travail-habilitation-personnel",
    domaine: "electricite",
    libelle: "Habilitation électrique du personnel opérant sur ou à proximité d'installations électriques",
    description:
      "L'employeur s'assure que les travailleurs qui effectuent des opérations sur ou à proximité d'installations électriques sont titulaires d'une habilitation adaptée au type d'opération. La formation initiale est à renouveler périodiquement selon la NF C 18-510 visée par le Code du travail.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4544-9 à R. 4544-11",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000025279121/",
      },
      {
        source: "INRS",
        reference: "INRS ED 6127 « Habilitation électrique »",
        urlLegifrance: "https://www.inrs.fr/media.html?refINRS=ED%206127",
      },
    ],
    periodicite: "triennale",
    realisateurs: ["exploitant"],
    criticite: 4,
    typologies: { travail: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    notesInternes:
      "La périodicité triennale est une pratique INRS (ED 6127), pas une obligation du Code du travail au sens strict. Affichée comme recommandation, non comme écart bloquant.",
  },

  // ---------------------------------------------------------------------------
  // ERP (arrêté du 25 juin 1980 et arrêté du 22 juin 1990)
  // ---------------------------------------------------------------------------
  {
    id: "elec-erp-mise-en-service",
    domaine: "electricite",
    libelle: "Vérification électrique à la mise en service ou après travaux (ERP)",
    description:
      "Les installations électriques des ERP sont vérifiées à la mise en service et après travaux par un organisme agréé, qui établit le rapport de vérification réglementaire après travaux (RVRAT).",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EL 5 et EL 19",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["organisme_agree"],
    criticite: 5,
    typologies: { erp: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
  },
  {
    id: "elec-erp-cat1-4-annuelle",
    domaine: "electricite",
    libelle: "Vérification électrique annuelle (ERP 1ʳᵉ à 4ᵉ catégorie)",
    description:
      "Les installations électriques des ERP des quatre premières catégories font l'objet d'une vérification annuelle par un organisme agréé. Le rapport est consigné au registre de sécurité.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EL 19 § 1 et § 2",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["organisme_agree"],
    criticite: 5,
    typologies: {
      erp: { categories: ["N1", "N2", "N3", "N4"] },
    },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
  },
  {
    id: "elec-erp-cat5-quinquennale",
    domaine: "electricite",
    libelle: "Vérification électrique périodique (ERP 5ᵉ catégorie)",
    description:
      "Dans les ERP de 5ᵉ catégorie (règles PE), la vérification des installations électriques est à réaliser, après mise en service, tous les cinq ans au maximum par un technicien compétent.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 22 juin 1990 (ERP 5ᵉ cat), art. PE 4 § 3",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000171201/",
      },
    ],
    periodicite: "quinquennale",
    realisateurs: ["personne_competente", "organisme_agree"],
    criticite: 4,
    typologies: { erp: { categories: ["N5"] } },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
  },
  {
    id: "elec-erp-groupe-electrogene-annuel",
    domaine: "electricite",
    libelle: "Vérification annuelle des groupes électrogènes de sécurité (ERP)",
    description:
      "Lorsque l'ERP est équipé d'un groupe électrogène de sécurité, celui-ci fait l'objet d'essais périodiques et d'une vérification annuelle.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EL 20",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee", "organisme_agree"],
    criticite: 4,
    typologies: { erp: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    conditions: [
      {
        type: "equipement_propriete_booleenne",
        categorie: "INSTALLATION_ELECTRIQUE",
        propriete: "aGroupeElectrogene",
        valeur: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // IGH (arrêté du 30 décembre 2011)
  // ---------------------------------------------------------------------------
  {
    id: "elec-igh-annuelle",
    domaine: "electricite",
    libelle: "Vérification annuelle des installations électriques (IGH)",
    description:
      "Les installations électriques des immeubles de grande hauteur sont vérifiées annuellement par un organisme agréé conformément à l'article GH 50 du règlement IGH.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 30 décembre 2011, art. GH 50",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000025118025/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["organisme_agree"],
    criticite: 5,
    typologies: { igh: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
  },
];
