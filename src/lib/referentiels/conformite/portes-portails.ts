/**
 * Obligations réglementaires — Portes et portails automatiques (P2).
 *
 * Sources primaires :
 *   - Code du travail, art. R. 4224-12 et R. 4224-13 (portes et portails,
 *     automatiques) et R. 4224-17 (maintenance et dossier). R. 4224-15,
 *     cité auparavant, traite de la formation de secouriste.
 *   - Arrêté du 21 décembre 1993 modifié, portant application du décret
 *     90-568 du 27 juin 1990, relatif aux portes et portails
 *     automatiques et semi-automatiques sur les lieux de travail.
 *
 * Portée : portes et portails motorisés utilisés pour le passage de
 * personnes ou de véhicules sur les lieux de travail.
 */

import type { Obligation } from "./types";

export const obligationsPortesPortails: Obligation[] = [
  {
    id: "porte-auto-verification-initiale",
    domaine: "porte_portail",
    libelle: "Examen de sécurité à la mise en service (porte automatique)",
    description:
      "À la mise en service ou après modification, un examen de sécurité est réalisé pour vérifier la conformité aux prescriptions de l'arrêté du 21 décembre 1993 : détection d'obstacle, vitesse, dispositifs d'arrêt d'urgence, signalisation.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 21 décembre 1993 (portes et portails automatiques), art. 2 à 4 (installations neuves)",
        article: "Arrêté 1993-12-21 art. 2",
        url:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006082855",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4224-13",
        article: "R. 4224-13",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532211/",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["personne_qualifiee", "organisme_agree"],
    criticite: 5,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["PORTE_AUTO", "PORTAIL_AUTO"],
  },
  {
    id: "porte-auto-verification-semestrielle",
    domaine: "porte_portail",
    libelle: "Vérification semestrielle du bon fonctionnement (porte automatique)",
    description:
      "Les portes et portails automatiques font l'objet d'un contrôle semestriel portant sur les organes de sécurité (cellules, barres palpeuses, limiteurs d'effort, détecteurs) et les mécanismes. Les résultats sont consignés sur le dossier de maintenance.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 21 décembre 1993 (portes et portails automatiques), art. 9",
        article: "Arrêté 1993-12-21 art. 9",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006679563",
      },
    ],
    periodicite: "semestrielle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["PORTE_AUTO", "PORTAIL_AUTO"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : la périodicité semestrielle est à l'article 9, pas à l'article 3.",
  },
  {
    id: "porte-auto-dossier-maintenance",
    domaine: "porte_portail",
    libelle: "Tenue du dossier de maintenance (porte automatique)",
    description:
      "Un dossier de maintenance est constitué et tenu à jour : notice d'instructions, preuves de conformité, résultats des vérifications, interventions correctives. Il est conservé pendant toute la durée d'exploitation.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 21 décembre 1993 (portes et portails automatiques), art. 8 et 9 (livret d'entretien)",
        article: "Arrêté 1993-12-21 art. 9",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006679563",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4224-17",
        article: "R. 4224-17",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532197/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["PORTE_AUTO", "PORTAIL_AUTO"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait R. 4224-15, qui traite de la formation de secouriste. Le dossier d'entretien est celui de R. 4224-17.",
  },
  {
    id: "porte-auto-maintien-en-etat",
    domaine: "porte_portail",
    libelle: "Maintien en état et réparation sans délai (porte automatique)",
    description:
      "Les portes et portails automatiques doivent être maintenus en bon état de fonctionnement. Toute défectuosité susceptible d'affecter la santé et la sécurité des travailleurs est éliminée le plus rapidement possible. Lorsque la chute d'une porte peut présenter un danger, la périodicité des contrôles et les interventions sont consignées dans le dossier prévu à l'article R. 4224-17.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4224-12 et R. 4224-13",
        article: "R. 4224-13",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532211/",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4224-17",
        article: "R. 4224-17",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532197/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 5,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["PORTE_AUTO", "PORTAIL_AUTO"],
    notesInternes:
      "Obligation de moyens permanente, sans échéance fixe. Corrigé à l'audit 2026-08 : R. 4224-15 (secouriste) remplacé par R. 4224-12/13 (portes et portails) et R. 4224-17 (maintenance).",
  },
  {
    id: "porte-auto-portail-piete-coulissant",
    domaine: "porte_portail",
    libelle: "Sécurité positive et détection d'obstacle (portail motorisé de véhicules)",
    description:
      "Les installations de portes ou portails automatiques et semi-automatiques destinées au passage de véhicules comportent un dispositif à sécurité positive interrompant immédiatement tout mouvement d'ouverture ou de fermeture lorsque celui-ci peut causer un dommage à une personne, ainsi que des détections de présence et de contact. C'est une exigence d'installation, non une échéance : leur bon fonctionnement est contrôlé lors de la vérification au minimum semestrielle de l'article 9.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 21 décembre 1993 (portes et portails automatiques), art. 2 et 5 (passages de véhicules)",
        article: "Arrêté 1993-12-21 art. 2",
        url:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006082855",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["PORTAIL_AUTO"],
    notesInternes:
      "DÉFAUT CONSTATÉ LE 2026-08-26, non corrigé ici parce qu'il appelle une décision. Cette obligation porte une périodicité semestrielle alors que ses deux références — les articles 2 et 5 de l'arrêté du 21 décembre 1993 — n'en fixent AUCUNE : ce sont des prescriptions techniques d'installation. La périodicité vient de l'article 9, qui n'est pas cité. Or l'ajouter fait échouer le test anti-doublon : l'obligation partagerait catégorie, périodicité et article fondateur avec `porte-auto-verification-semestrielle`, qui couvre déjà PORTAIL_AUTO au même rythme. Les deux font double emploi, et la référence manquante est ce qui le masquait. Trancher suppose de choisir : fusionner, ou restreindre celle-ci à ce que les articles 2 et 5 prescrivent vraiment — des caractéristiques d'installation, sans échéance. Troisième défaut : l'identifiant dit « piete » alors que l'article 2 vise le passage de VÉHICULES.\n\nRÉSOLU LE 2026-08-26, en suivant le texte plutôt qu'en fusionnant les deux obligations. Les articles 2 et 5 sont des PRESCRIPTIONS TECHNIQUES D'INSTALLATION : ils exigent un dispositif à sécurité positive et des détections de présence et de contact, sans fixer aucune périodicité. `periodicite` passe à `mise_en_service_uniquement` — l'exigence est due à l'installation et après modification, le contrôle périodique de son bon fonctionnement relevant de l'article 9. Le doublon d'échéance avec `porte-auto-verification-semestrielle` disparaît sans qu'aucune exigence ne soit perdue.\n\nDeux corrections de rédaction : le libellé restreignait aux portails COULISSANTS alors que l'article 2 vise toute installation destinée au passage de véhicules, sans distinguer coulissant, battant ou basculant. Et « dispositif d'arrêt d'urgence » n'est pas le vocabulaire du texte, qui dit « dispositif à sécurité positive ».\n\nL'identifiant conserve « piete » alors que l'article vise le passage de VÉHICULES : il est stocké en base sous contrainte d'unicité."
  },
];
