/**
 * Obligations réglementaires — Ascenseurs (P2).
 *
 * Sources primaires :
 *   - Code de la construction et de l'habitation (CCH), articles R. 134-1
 *     à R. 134-31 (ex R. 125-1 à R. 125-2-5 avant la recodification de
 *     2021).
 *   - Arrêté du 18 novembre 2004 modifié relatif aux travaux de sécurité
 *     à réaliser dans les ascenseurs (visite de maintenance et carnet
 *     d'entretien).
 *   - Arrêté du 13 août 2008 fixant le champ du contrôle technique
 *     quinquennal et les modalités de qualification de la personne
 *     chargée du contrôle.
 *
 * Le champ d'application vise tout immeuble disposant d'un ascenseur au
 * sens du CCH (installations fixes desservant des niveaux définis,
 * équipées d'une cabine). Le flag `categoriesEquipement: ["ASCENSEUR"]`
 * assure que seule la déclaration explicite d'un ascenseur déclenche
 * ces obligations.
 */

import type { Obligation } from "./types";

export const obligationsAscenseurs: Obligation[] = [
  {
    id: "ascenseur-entretien-contrat",
    domaine: "ascenseur",
    libelle: "Contrat d'entretien avec prestations minimales (ascenseur)",
    description:
      "Le propriétaire fait exécuter l'entretien de l'ascenseur par une entreprise spécialisée dans le cadre d'un contrat écrit. Le contrat définit les prestations minimales, dont une visite toutes les six semaines maximum, l'examen semestriel du dispositif de secours et l'examen annuel des dispositifs de sécurité.",
    referencesLegales: [
      {
        source: "CCH",
        reference: "CCH, art. R. 134-1 (ex R. 125-1-1)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000044274856/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 18 novembre 2004, art. 2 et 3",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000449641/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 4,
    typologies: { travail: true, erp: true, igh: true },
    categoriesEquipement: ["ASCENSEUR"],
    notesInternes:
      "Obligation permanente contractuelle — pas d'échéance propre dans le calendrier. Les visites concrètes (toutes les 6 semaines) sont à la charge de l'entreprise d'entretien, hors scope du générateur MVP.",
  },
  {
    id: "ascenseur-examen-semestriel-secours",
    domaine: "ascenseur",
    libelle: "Examen semestriel du dispositif de secours (ascenseur)",
    description:
      "L'entreprise d'entretien procède, au moins une fois tous les six mois, à un examen du dispositif de secours permettant à une personne bloquée dans la cabine d'avertir l'extérieur (téléalarme bidirectionnelle avec service d'intervention).",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 18 novembre 2004, art. 2 § 3",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000449641/",
      },
    ],
    periodicite: "semestrielle",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { travail: true, erp: true, igh: true },
    categoriesEquipement: ["ASCENSEUR"],
  },
  {
    id: "ascenseur-examen-annuel-securite",
    domaine: "ascenseur",
    libelle: "Examen annuel des dispositifs de sécurité (ascenseur)",
    description:
      "Examen annuel par l'entreprise d'entretien des dispositifs de sécurité (parachute, limiteur de vitesse, serrures des portes palières, amortisseurs, verrouillage) et des câbles, chaînes, sangles et pièces de suspension.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 18 novembre 2004, art. 2 § 4",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000449641/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { travail: true, erp: true, igh: true },
    categoriesEquipement: ["ASCENSEUR"],
  },
  {
    id: "ascenseur-controle-technique-quinquennal",
    domaine: "ascenseur",
    libelle: "Contrôle technique quinquennal (ascenseur)",
    description:
      "Tous les cinq ans, le propriétaire fait procéder à un contrôle technique de l'ascenseur par une personne qualifiée indépendante de l'entreprise d'entretien. Le rapport est remis au propriétaire et tenu à la disposition des autorités.",
    referencesLegales: [
      {
        source: "CCH",
        reference: "CCH, art. R. 134-2 (ex R. 125-2-4)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000044274856/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 13 août 2008",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000019312977/",
      },
    ],
    periodicite: "quinquennale",
    realisateurs: ["organisme_accredite", "personne_qualifiee"],
    criticite: 5,
    typologies: { travail: true, erp: true, igh: true },
    categoriesEquipement: ["ASCENSEUR"],
  },
  {
    id: "ascenseur-carnet-entretien",
    domaine: "ascenseur",
    libelle: "Tenue du carnet d'entretien de l'ascenseur",
    description:
      "Le propriétaire tient à jour un carnet d'entretien où figurent les interventions d'entretien, les incidents, les visites et contrôles réalisés. Le carnet est conservé pendant toute la durée de vie de l'ascenseur.",
    referencesLegales: [
      {
        source: "CCH",
        reference: "CCH, art. R. 134-3 (ex R. 125-2-2)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000044274856/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true, erp: true, igh: true },
    categoriesEquipement: ["ASCENSEUR"],
  },
  {
    id: "ascenseur-telealarme-liaison",
    domaine: "ascenseur",
    libelle: "Liaison permanente avec un service d'intervention (téléalarme ascenseur)",
    description:
      "L'ascenseur doit être équipé d'un dispositif permettant à une personne enfermée dans la cabine de donner l'alerte et de recevoir une réponse d'un service d'intervention disponible en permanence (24 h/24, 7 j/7).",
    referencesLegales: [
      {
        source: "CCH",
        reference: "CCH, art. R. 134-4 (ex R. 125-2)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000044274856/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 5,
    typologies: { travail: true, erp: true, igh: true },
    categoriesEquipement: ["ASCENSEUR"],
    notesInternes:
      "Obligation permanente de moyens (contrat d'astreinte), non planifiée dans le calendrier.",
  },
];
