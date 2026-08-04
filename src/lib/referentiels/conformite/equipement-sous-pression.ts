/**
 * Obligations réglementaires — Équipements sous pression (P3).
 *
 * Sources primaires :
 *   - Code de l'environnement, articles L. 557-1 et s. (surveillance des
 *     équipements sous pression).
 *   - Décret n° 2015-799 du 1er juillet 2015 relatif aux produits et
 *     équipements à risques.
 *   - Arrêté du 20 novembre 2017 relatif au suivi en service des
 *     équipements sous pression et des récipients à pression simples.
 *
 * Scope MVP : équipements courants en TPE/PME (compresseurs, réservoirs
 * d'air comprimé). Les chaudières à haute pression, cisternes et autres
 * équipements complexes sortent du périmètre V2 (cf. CLAUDE.md).
 */

import type { Obligation } from "./types";

export const obligationsEquipementSousPression: Obligation[] = [
  {
    id: "esp-declaration-mise-en-service",
    domaine: "equipement_sous_pression",
    libelle: "Déclaration et contrôle de mise en service (équipement sous pression)",
    description:
      "Les équipements sous pression dépassant les seuils fixés par l'arrêté du 20 novembre 2017 font l'objet d'une déclaration et d'un contrôle de mise en service avant leur exploitation.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 20 novembre 2017, art. 13 à 15",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036061986/",
      },
      {
        source: "CODE_ENVIRONNEMENT",
        reference: "L. 557-28 et s.",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074220/LEGISCTA000029121143/",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["organisme_agree"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
  },
  {
    id: "esp-inspection-periodique",
    domaine: "equipement_sous_pression",
    libelle: "Inspection périodique (équipement sous pression)",
    description:
      "Inspection périodique réalisée par une personne compétente selon une périodicité fixée par l'arrêté, au maximum tous les 40 mois pour la majorité des équipements. Le rapport est conservé.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 20 novembre 2017, art. 19 et annexes",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036061986/",
      },
    ],
    periodicite: "triennale",
    realisateurs: ["personne_competente", "organisme_agree"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
    notesInternes:
      "Périodicité modélisée triennale en MVP (proxy des 40 mois réglementaires). La valeur exacte dépend du type et du régime — à affiner avec une propriété d'équipement en étape ultérieure.",
  },
  {
    id: "esp-requalification-decennale",
    domaine: "equipement_sous_pression",
    libelle: "Requalification périodique (équipement sous pression)",
    description:
      "Requalification tous les dix ans (ou périodicité fixée par l'arrêté pour certains équipements) par un organisme habilité. Comprend une inspection détaillée et une épreuve hydraulique lorsque c'est requis.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 20 novembre 2017, art. 23 à 27",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036061986/",
      },
    ],
    periodicite: "decennale",
    realisateurs: ["organisme_agree"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
  },
  {
    id: "esp-dossier-suivi",
    domaine: "equipement_sous_pression",
    libelle: "Tenue du dossier de suivi (équipement sous pression)",
    description:
      "L'exploitant tient un dossier permettant de retrouver à tout moment l'historique de l'équipement : déclaration, contrôles, inspections, requalifications, interventions de réparation.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 20 novembre 2017, art. 8",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036061986/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
  },
  {
    id: "esp-intervention-reparation",
    domaine: "equipement_sous_pression",
    libelle: "Contrôle après intervention notable (équipement sous pression)",
    description:
      "Après toute intervention notable (modification, remplacement de pièce sous pression, réparation importante), l'équipement est soumis à un contrôle avant remise en service.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 20 novembre 2017, art. 30",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036061986/",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["organisme_agree"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
    notesInternes:
      "Événementiel — une occurrence par intervention notable. Le générateur MVP la traite en mise_en_service_uniquement ; à affiner étape 12 avec un déclenchement manuel.",
  },
  {
    id: "esp-personnel-formation",
    domaine: "equipement_sous_pression",
    libelle: "Formation et information des opérateurs (équipement sous pression)",
    description:
      "Les opérateurs qui utilisent ou surveillent un équipement sous pression sont informés des consignes de sécurité et formés au fonctionnement de l'équipement et aux actions en cas d'anomalie.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-55 à R. 4323-57",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018491007/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
  },
];
