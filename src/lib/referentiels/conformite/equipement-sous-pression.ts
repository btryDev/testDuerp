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
        article: "Arrêté 2017-11-20 art. 7-11",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036128632",
      },
      {
        source: "CODE_ENVIRONNEMENT",
        reference: "R. 557-14-1 et s. (suivi en service)",
        article: "C. env. R. 557-14-1",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074220/LEGISCTA000030833481/",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    nature: "ponctuelle",
    pieceAttendue: null,
    realisateurs: ["exploitant", "personne_competente", "organisme_agree"],
    criticite: 5,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
    conditions: CONDITION_SUIVI_EN_SERVICE,
    notesInternes: "NATURE : PONCTUELLE (ADR-026). Déclaration et contrôle dus une fois, avant exploitation. Le contrôle après intervention notable est porté par `esp-intervention-reparation`, ligne distincte et événementielle.",
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
        article: "Arrêté 2017-11-20 art. 15",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036128632",
      },
    ],
    periodicite: "quadriennale",
    premierDelai: "triennale",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["personne_competente", "organisme_agree"],
    criticite: 5,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
    conditions: CONDITION_SUIVI_EN_SERVICE,
    notesInternes:
      "PÉRIODICITÉ PORTÉE À QUATRE ANS LE 2026-09-01, sur décision de la propriétaire. Elle était `triennale`, et la note justifiait ainsi : « l'enum n'a pas de quadriennale, proxy conservateur des 4 ans réglementaires ». La raison avait cessé d'être vraie sans que la ligne bouge : `quadriennale` existe dans l'énumération (`types-communs.ts:33`) et `elec-travail-rapport-quadriennal` s'en sert. C'est le motif de la journée — une justification juste à l'écriture, laissée debout après que ce qu'elle décrivait a changé.\n\nCE N'EST PAS UN DESSERRAGE DE CONFORT, et la distinction compte. Le dépôt encode partout les plafonds comme « la date au-delà de laquelle l'exploitant est nécessairement en défaut » — c'est la doctrine des cinq ans de la VIP, des quatre ans du SIR, des trois ans de PE 4. Trois ans inventait une échéance PLUS TÔT que le droit : l'outil déclarait en retard un exploitant qui ne l'était pas. Quatre ans est la borne du texte.\n\nLE PREMIER CYCLE EST PORTÉ PAR `premierDelai`, ajouté le 2026-09-01. Sans lui, passer la récurrence à quatre ans repoussait la première inspection d'un an — une sous-application que personne ne peut voir, sur une ligne de criticité 5. Le relevé de l'article 15, au corpus depuis le 2026-08-27, portait déjà les deux valeurs et le diagnostic : « 4 ans pour tous les autres hors tuyauteries, 3 ans pour la PREMIÈRE inspection […]. Le référentiel encode `triennale` : or le 3 ans n'est ni le régime général ni récurrent, c'est le plafond du premier cycle. » Cette ligne a porté deux justifications successives, toutes deux fausses, pendant que la bonne dormait dans le corpus — ne reformulez pas ce relevé, citez-le.\n\nCE QUI RESTE NON ENCODÉ, et que la description dit : deux ans pour les générateurs de vapeur et les appareils à couvercle amovible à fermeture rapide, un an pour certains récipients mobiles. Le modèle ne porte pas l'attribut qui distinguerait ces familles — même blocage que le recyclage d'aération avant le 2026-09-01. Ces équipements (autoclaves, stérilisateurs) sont improbables dans la cible TPE/PME, ce qui explique l'ordre de priorité, pas l'absence. S'y ajoute le 40 mois transitoire de l'article 15, réservé aux équipements déclarés avant son entrée en vigueur : non encodé, et sans objet pour un parc déclaré aujourd'hui. Corrigé à l'audit 2026-08 : l'ancienne version citait « art. 19 » (= requalification) et « 40 mois » comme intervalle général — or 40 mois figure bien à l'article 15 de l'arrêté de 2017, mais comme mesure TRANSITOIRE réservée aux équipements déclarés avant son entrée en vigueur ; l'intervalle général est de quatre ans (constaté 2026-08-26).",
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
        article: "Arrêté 2017-11-20 art. 18-19",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036128632",
      },
    ],
    periodicite: "decennale",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["organisme_agree"],
    criticite: 5,
    transmet: [],
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
        article: "Arrêté 2017-11-20 art. 6",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036128632",
      },
    ],
    periodicite: "autre",
    nature: "etat_permanent",
    pieceAttendue: "dossier d'exploitation",
    realisateurs: ["exploitant"],
    criticite: 3,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
    conditions: CONDITION_SUIVI_EN_SERVICE,
    notesInternes: "NATURE : ÉTAT PERMANENT, `pieceAttendue: \"dossier d'exploitation\"` (ADR-026). L'article 6 de l'arrêté du 20 novembre 2017 impose le dossier lui-même, pas un acte périodique.",
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
        article: "Arrêté 2017-11-20 art. 26-28",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036128632",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    nature: "evenementielle",
    pieceAttendue: null,
    realisateurs: ["organisme_agree"],
    criticite: 5,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
    conditions: CONDITION_SUIVI_EN_SERVICE,
    notesInternes:
      "Événementiel — une occurrence par intervention notable. Le générateur MVP la traite en mise_en_service_uniquement ; à affiner étape 12 avec un déclenchement manuel.\n\nNATURE : ÉVÉNEMENTIELLE (ADR-026). Aucun titre de mise en service ici : l'acte n'est dû qu'« après toute intervention notable ». La périodicité `mise_en_service_uniquement` est un tenant-lieu — elle produit une ligne unique, ce qui est le bon nombre, mais le nom de la valeur dit le contraire de ce que l'obligation fait.",
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
        article: "R. 4323-1",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018489707/",
      },
    ],
    periodicite: "autre",
    nature: "etat_permanent",
    pieceAttendue: null,
    realisateurs: ["exploitant"],
    criticite: 3,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_SOUS_PRESSION"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait R. 4323-55 à 57, qui régissent l'autorisation de conduite des équipements mobiles et de levage, sans rapport avec les ESP.\n\nNATURE : ÉTAT PERMANENT (ADR-026). R. 4323-1 à R. 4323-5 imposent que les opérateurs SOIENT informés et formés — un état à maintenir. Aucun rythme, aucun fait déclencheur nommé dans ces articles.",
  },
];
