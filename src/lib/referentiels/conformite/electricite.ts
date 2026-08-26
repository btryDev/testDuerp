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
        article: "R. 4226-14",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022765072/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 26 décembre 2011 (vérifications des installations électriques), art. 2 et 6",
        article: "Arrêté 2011-12-26 art. 2",
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
        article: "R. 4226-16",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022765070/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 26 décembre 2011 (vérifications des installations électriques), art. 3",
        article: "Arrêté 2011-12-26 art. 3",
        note: "L'article 3 fixe la périodicité à un an, puis ouvre une faculté que le référentiel ne portait pas : « Toutefois, le délai entre deux vérifications peut être porté à deux ans par le chef d'établissement si le rapport précédent ne présente aucune observation ou si, avant l'échéance, le chef d'établissement a fait réaliser les travaux de mise en conformité de nature à répondre aux observations contenues dans le rapport de vérification. » Le texte ne la subordonne pas à une autorisation : « Le chef d'établissement informe l'inspecteur du travail par lettre recommandée avec accusé de réception, accompagnée des éléments prouvant qu'il n'y a pas de non-conformité ou que les non-conformités ont été levées. Cet envoi doit comprendre, le cas échéant, l'avis des membres du CHSCT ou des délégués du personnel. » Constaté le 2026-08-26.",
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
        reference: "R. 4226-19",
        article: "R. 4226-19",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022765064/",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "L. 4711-5",
        article: "L. 4711-5",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006903389/",
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
        article: "R. 4544-10",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022849102/",
      },
      {
        source: "INRS",
        reference: "INRS ED 6127 « Habilitation électrique »",
        article: "INRS ED 6127",
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
      "La périodicité triennale est une pratique INRS (ED 6127), pas une obligation du Code du travail au sens strict. Affichée comme recommandation, non comme écart bloquant.\n\nAmendement 2026-08-26 : L. 4711-5 était en refs[0], c'est-à-dire présenté comme l'article FONDATEUR (convention ADR-003). Or il n'institue aucun registre — il autorise à en réunir plusieurs en un seul, ce que le CLAUDE.md du dépôt écrit noir sur blanc. La contradiction était interne. R. 4226-19 passe en premier : c'est lui qui impose la consignation des résultats de vérification. Ce n'est pas cosmétique : le test anti-doublon compare les obligations sur leur article fondateur, donc un refs[0] faux le rend aveugle — le mécanisme même qui masquait le doublon des portails.",
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
        article: "GE 6",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020303884/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EL 19 § 2 (installations neuves ou modifiées)",
        article: "EL 19",
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
      "Corrigé à l'audit 2026-08 : l'ancienne version citait EL 5, qui définit les locaux de service électrique. La vérification avant ouverture et après travaux relève des articles GE 6 à GE 8 (rapport RVRAT), auxquels EL 19 § 2 renvoie.\n\nSur-application assumée en 5ᵉ catégorie (constatée 2026-08-26). L'article cité relève du Livre II du règlement de sécurité, écarté en 5ᵉ catégorie par PE 1 § 1 ; le dépouillement intégral du Livre III a établi qu'il n'en rouvre que MS 39 et MS 70. GE 7 § 1 le confirme en propre : il ne vise que les établissements des 1ʳᵉ à 4ᵉ catégories. Ce qui traite le même objet en N5 est PE 4 § 1, plus étroit — vérification à la construction et avant ouverture par personnes ou organismes agréés, et seulement « dans les établissements avec locaux à sommeil ». La ligne est MAINTENUE : la retirer créerait un faux négatif muet chez 100 % des utilisateurs, alors qu'une sur-application visible reste corrigeable. À reprendre quand le référentiel saura porter l'attribut « locaux à sommeil ».",
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
        article: "EL 19",
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
        article: "PE 4",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020374770/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er décembre 2025 modifiant le règlement de sécurité ERP (applicable au 1er juillet 2026)",
        article: "Arrêté 2025-12-01",
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
    id: "elec-erp-groupe-electrogene-quinzaine",
    domaine: "electricite",
    libelle:
      "Vérification des niveaux du groupe électrogène de sécurité (ERP)",
    description:
      "Tous les quinze jours, l'exploitant vérifie le niveau d'huile, d'eau et de combustible du groupe électrogène de sécurité, le dispositif de réchauffage du moteur et l'état de la source utilisée pour le démarrage (batterie ou air comprimé). Les interventions et leurs résultats sont consignés dans un registre d'entretien tenu à la disposition de la commission de sécurité.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference:
          "Arrêté du 25 juin 1980, art. EL 18 § 4 (première périodicité)",
        article: "EL 18",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038485456/",
        note: "« Les groupes électrogènes de sécurité doivent faire l'objet d'un entretien régulier et d'essais selon la périodicité minimale suivante : ― tous les quinze jours, vérification du niveau d'huile, d'eau et de combustible, du dispositif de réchauffage du moteur et de l'état de la source utilisée pour le démarrage (batterie ou air comprimé) […]. » Verbatim confirmé par relecture indépendante le 2026-08-26.",
        versionConstatee: "2019-07-01",
      },
    ],
    periodicite: "bimensuelle",
    realisateurs: ["exploitant"],
    criticite: 4,
    typologies: { erp: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    notesInternes:
      "Créée le 2026-08-26. EL 18 § 4 fixe DEUX périodicités minimales, et le référentiel n'en portait qu'une : l'obligation unique était encodée « mensuelle », si bien que la vérification des niveaux tous les quinze jours ne produisait aucune échéance. Elle ne vivait que dans la prose d'une description — sur un matériel dont le seul rôle est de démarrer quand tout le reste a lâché.\n\nLa valeur `bimensuelle` a été ajoutée à l'énumération et à la base pour cela : le choix se réduisait auparavant à `hebdomadaire`, qui double la charge réelle, ou `mensuelle`, qui tait l'obligation. Conversion à quatorze jours et non quinze — un multiple de sept fait retomber l'échéance le même jour de la semaine.\n\nSur-application assumée en 5ᵉ catégorie, comme les autres obligations de ce fichier fondées sur le Livre II : EL 18 relève du Livre II, écarté par PE 1 § 1, et ce qui traite du même objet en N5 est PE 4 § 2. La ligne est maintenue pour ne pas créer un faux négatif muet.",
  },
  {
    id: "elec-erp-groupe-electrogene-annuel",
    domaine: "electricite",
    libelle: "Entretien et essais des groupes électrogènes de sécurité (ERP)",
    description:
      "Tous les mois, le groupe électrogène de sécurité fait l'objet, en plus de la vérification des niveaux, d'un essai de démarrage automatique avec une charge minimale de 50 % de la puissance du groupe et d'un fonctionnement sous cette charge pendant une durée minimale de trente minutes. Les interventions et leurs résultats sont consignés dans un registre d'entretien tenu à la disposition de la commission de sécurité.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EL 18 § 4 (entretien et essais des groupes électrogènes de sécurité)",
        article: "EL 18",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038485456/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EL 19 (vérification annuelle)",
        article: "EL 19",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000021231068/",
      },
    ],
    periodicite: "mensuelle",
    realisateurs: ["exploitant", "personne_qualifiee", "organisme_agree"],
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
      "Corrigé à l'audit 2026-08 : l'ancienne version citait EL 20, qui traite des installations temporaires.\n\nSur-application assumée en 5ᵉ catégorie (constatée 2026-08-26). L'article cité relève du Livre II du règlement de sécurité, écarté en 5ᵉ catégorie par PE 1 § 1 ; le dépouillement intégral du Livre III a établi qu'il n'en rouvre que MS 39 et MS 70. GE 7 § 1 le confirme en propre : il ne vise que les établissements des 1ʳᵉ à 4ᵉ catégories. Ce qui traite le même objet en N5 est PE 4 § 1, plus étroit — vérification à la construction et avant ouverture par personnes ou organismes agréés, et seulement « dans les établissements avec locaux à sommeil ». La ligne est MAINTENUE : la retirer créerait un faux négatif muet chez 100 % des utilisateurs, alors qu'une sur-application visible reste corrigeable. À reprendre quand le référentiel saura porter l'attribut « locaux à sommeil ».\n\nAmendement 2026-08-26 : EL 18 § 4 fixe DEUX périodicités minimales — tous les quinze jours (niveaux d'huile, d'eau, de combustible, réchauffage moteur, source de démarrage) et tous les mois (essai de démarrage automatique sous 50 % de charge pendant trente minutes). Le champ `periodicite` n'en porte qu'une : l'énumération `Periodicite` n'a pas de valeur quinzomadaire, et le seul voisin disponible, `hebdomadaire`, doublerait la charge réelle. La quinzaine ne vit donc que dans la `description` et ne produit aucune échéance — sous-application connue, à lever en ajoutant une valeur à l'énumération.\n\nL'identifiant conserve « annuel » alors que la périodicité est mensuelle : `Verification.obligationId` est stocké en base sous contrainte d'unicité, et le renommer orphelinerait les lignes de calendrier existantes. Le libellé, lui, a été corrigé.\n\n`realisateurs` gagne `exploitant` : EL 18 § 4 n'exige aucun tiers, l'entretien et les essais lui incombent, et le registre d'entretien est tenu à disposition de la commission. L'organisme agréé relève d'EL 19, pas d'EL 18.",
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
        article: "GH 5",
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
  {
    id: "incendie-hotel-po-controle-annuel-electricite",
    domaine: "electricite",
    libelle:
      "Contrôle annuel des installations électriques (hôtel de 5ᵉ catégorie)",
    description:
      "Dans un hôtel, les installations électriques sont contrôlées chaque année par un technicien compétent. Cette échéance vise les établissements de 5ᵉ catégorie de type O, que la vérification annuelle des ERP des quatre premières catégories ne couvre pas.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference:
          "Arrêté du 25 juin 1980, art. PO 1 § 3 (règles spécifiques aux hôtels)",
        article: "PO 1",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020374775/2018-01-01",
        note: "« L'ensemble des installations techniques doit être contrôlé par un technicien compétent tous les deux ans, à l'exception des installations électriques et des systèmes de détection incendie qui doivent être contrôlés annuellement. » Verbatim relevé en première main le 2026-08-26.",
        versionConstatee: "2018-01-01",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { erp: { categories: ["N5"], types: ["O"] } },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    notesInternes:
      "Créée le 2026-08-26. `elec-erp-cat1-4-annuelle` s'arrête aux quatre premières catégories : un petit hôtel de 5ᵉ catégorie n'avait AUCUN contrôle électrique annuel, alors que PO 1 § 3 le lui impose nommément. Le manque était déclaré `non_couvert` sur le chapitre PO avec la mention « le manque est un choix, pas une impossibilité » — il ne l'est plus.\n\nLa détection incendie, que le même paragraphe soumet au même rythme annuel, n'est PAS ajoutée ici : `incendie-erp-ssi-annuelle` porte `erp: true` et couvre donc déjà tous les ERP, cinquième catégorie comprise. L'ajouter aurait créé un doublon.\n\n`personne_qualifiee` traduit « technicien compétent » : le texte n'exige ni organisme agréé ni accréditation, et l'exploitant ne peut pas s'en charger lui-même.\n\nDomaine `electricite` et non `incendie` : le domaine décrit l'objet contrôlé, pas le texte qui l'impose. L'obligation vit donc auprès des autres vérifications électriques, où le dirigeant la cherchera.",
  },
];
