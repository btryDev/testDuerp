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
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022765072/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 26 décembre 2011 (vérifications des installations électriques), art. 3 à 5",
        url:
          "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000025046978",
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
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022765070/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 26 décembre 2011 (vérifications des installations électriques), art. 1 et 2",
        url:
          "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000025046978",
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
      "Les résultats des vérifications électriques et les justifications des travaux menés pour remédier aux anomalies relevées sont consignés sur un registre. Lorsque la vérification est réalisée par un organisme accrédité, son rapport est annexé à ce registre.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "L. 4711-5",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006903389/",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4226-19",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022765064/",
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
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022849102/",
      },
      {
        source: "INRS",
        reference: "INRS ED 6127 « Habilitation électrique »",
        url:
          "https://www.inrs.fr/media.html?refINRS=ED%206127",
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
        reference: "Arrêté du 25 juin 1980, art. GE 6 à GE 8 (vérifications par organismes agréés, rapport RVRAT)",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020303884/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EL 19 § 2 (installations neuves ou modifiées)",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000021231068/",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["organisme_agree"],
    criticite: 5,
    typologies: { erp: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait EL 5, qui définit les locaux de service électrique. La vérification avant ouverture et après travaux relève des articles GE 6 à GE 8 (rapport RVRAT), auxquels EL 19 § 2 renvoie.",
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
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000021231068/",
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
    libelle: "Vérification triennale des installations électriques (ERP 5ᵉ catégorie)",
    description:
      "Dans les ERP de 5ᵉ catégorie, l'exploitant fait procéder tous les trois ans au plus, par des techniciens compétents, à l'entretien et à la vérification des installations électriques (art. PE 4 § 2, rédaction de l'arrêté du 1er décembre 2025 applicable au 1er juillet 2026). Avant cette date, PE 4 n'imposait aucune périodicité en exploitation.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 22 juin 1990 (ERP 5ᵉ catégorie), art. PE 4 § 2, rédaction de l'arrêté du 1er décembre 2025",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020374770/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er décembre 2025 modifiant le règlement de sécurité ERP (applicable au 1er juillet 2026)",
        url:
          "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053020948",
      },
    ],
    periodicite: "triennale",
    realisateurs: ["personne_competente", "organisme_agree"],
    criticite: 4,
    typologies: { erp: { categories: ["N5"] } },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version annonçait « tous les cinq ans » en citant PE 4 § 3, qui traite de la mise en demeure par la commission. PE 4 n'imposait aucune périodicité jusqu'à l'arrêté du 1er décembre 2025, qui fixe « tous les trois ans au plus » pour l'ensemble des installations techniques (électricité, gaz, cuisson, extraction, ascenseurs, moyens de secours). L'id `elec-erp-cat5-quinquennale` est conservé car référencé par les lignes Verification en base ; ne pas le renommer sans migration.",
  },
  {
    id: "elec-erp-groupe-electrogene-annuel",
    domaine: "electricite",
    libelle: "Vérification annuelle des groupes électrogènes de sécurité (ERP)",
    description:
      "Lorsque l'ERP est équipé d'un groupe électrogène de sécurité, celui-ci fait l'objet d'essais périodiques par l'exploitant (niveaux tous les quinze jours, essai de démarrage en charge mensuel, consignés au registre d'entretien — EL 18 § 4) et de la vérification annuelle des installations électriques (EL 19).",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EL 18 § 4 (entretien et essais des groupes électrogènes de sécurité)",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038485456/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EL 19 (vérification annuelle)",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000021231068/",
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
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait EL 20, qui traite des installations temporaires.",
  },

  // ---------------------------------------------------------------------------
  // IGH (arrêté du 30 décembre 2011)
  // ---------------------------------------------------------------------------
  {
    id: "elec-igh-annuelle",
    domaine: "electricite",
    libelle: "Vérification annuelle des installations électriques (IGH)",
    description:
      "Le propriétaire d'un immeuble de grande hauteur fait vérifier annuellement, par un organisme agréé, les installations électriques et l'éclairage des parties communes. Les installations de protection contre la foudre sont vérifiées tous les deux ans.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 30 décembre 2011 (règlement IGH), art. GH 5 (vérifications techniques par organismes agréés)",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000025169258",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["organisme_agree"],
    criticite: 5,
    typologies: { igh: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait GH 50, qui traite de l'alerte (dispositifs phoniques vers le PC sécurité). Les vérifications techniques périodiques sont à l'article GH 5.",
  },
];
