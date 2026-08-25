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

import type { ConditionApplication, Obligation } from "./types";

/**
 * Garde-fou de périmètre (amendement 2026-08).
 *
 * Les cinq obligations issues de l'arrêté du 20 novembre 2017 ne visent que les
 * équipements effectivement soumis au suivi en service : l'arrêté fixe des
 * seuils de pression maximale admissible (PS) et de volume (produit PS × V) en
 * dessous desquels un récipient n'est pas concerné. Ces seuils ne sont **pas**
 * encodés ici : ils forment un tableau par catégorie de fluide et de récipient
 * qu'on ne recopie pas sans l'avoir relu article par article sur Légifrance
 * (CLAUDE.md — ne jamais inventer une référence ni un seuil).
 *
 * En attendant, la portée est portée par une réponse explicite du dirigeant.
 * Sans elle, un petit compresseur d'atelier héritait d'une requalification
 * décennale par organisme habilité. La forme `non_infirmee` garantit qu'aucun
 * équipement déjà déclaré ne perd ces obligations en silence : elles restent
 * affichées tant que la réponse « non » n'a pas été donnée.
 *
 * `esp-personnel-formation` n'est volontairement pas conditionnée : elle
 * découle du Code du travail (R. 4323-1 à R. 4323-5), qui s'applique à tout
 * équipement de travail indépendamment des seuils de l'arrêté.
 */
const CONDITION_SUIVI_EN_SERVICE: ConditionApplication[] = [
  {
    type: "equipement_propriete_non_infirmee",
    categorie: "EQUIPEMENT_SOUS_PRESSION",
    propriete: "estSoumisSuiviEnService",
  },
];

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
        reference: "Arrêté du 20 novembre 2017 (suivi en service des ESP), art. 7 à 11",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036128632",
      },
      {
        source: "CODE_ENVIRONNEMENT",
        reference: "R. 557-14-1 et s. (suivi en service)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074220/LEGISCTA000030833481/",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["organisme_agree"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
    conditions: CONDITION_SUIVI_EN_SERVICE,
  },
  {
    id: "esp-inspection-periodique",
    domaine: "equipement_sous_pression",
    libelle: "Inspection périodique (équipement sous pression)",
    description:
      "Inspection périodique réalisée par une personne compétente. Intervalle maximal fixé par l'arrêté : 4 ans pour la généralité des équipements (première inspection dans les 3 ans suivant la mise en service), 2 ans pour les générateurs de vapeur et les équipements à couvercle amovible à fermeture rapide, 1 an pour certains récipients mobiles. Le rapport est conservé au dossier d'exploitation.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 20 novembre 2017 (suivi en service des ESP), art. 15",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036128632",
      },
    ],
    periodicite: "triennale",
    realisateurs: ["personne_competente", "organisme_agree"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
    conditions: CONDITION_SUIVI_EN_SERVICE,
    notesInternes:
      "Périodicité modélisée triennale (l'enum n'a pas de « quadriennale ») : proxy conservateur des 4 ans réglementaires. Corrigé à l'audit 2026-08 : l'ancienne version citait « art. 19 » (= requalification) et « 40 mois » (ancien arrêté de 2000).",
  },
  {
    id: "esp-requalification-decennale",
    domaine: "equipement_sous_pression",
    libelle: "Requalification périodique (équipement sous pression)",
    description:
      "Requalification périodique tous les dix ans pour la généralité des récipients, tuyauteries et générateurs de vapeur (2, 3 ou 6 ans pour certains récipients mobiles ou fluides corrosifs/toxiques — art. 18), par un organisme habilité. Elle comprend la vérification des documents, une inspection, une épreuve hydraulique et la vérification des accessoires de sécurité (art. 19).",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 20 novembre 2017 (suivi en service des ESP), art. 18 et 19",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036128632",
      },
    ],
    periodicite: "decennale",
    realisateurs: ["organisme_agree"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
    conditions: CONDITION_SUIVI_EN_SERVICE,
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
        reference: "Arrêté du 20 novembre 2017 (suivi en service des ESP), art. 6 (dossier d'exploitation)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036128632",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
    conditions: CONDITION_SUIVI_EN_SERVICE,
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
        reference: "Arrêté du 20 novembre 2017 (suivi en service des ESP), art. 26 à 28",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036128632",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["organisme_agree"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
    conditions: CONDITION_SUIVI_EN_SERVICE,
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
        reference: "R. 4323-1 à R. 4323-5 (information et formation à l'utilisation des équipements de travail)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018489707/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait R. 4323-55 à 57, qui régissent l'autorisation de conduite des équipements mobiles et de levage, sans rapport avec les ESP.",
  },
];
