/**
 * Obligations réglementaires — Équipements de levage (P3).
 *
 * Sources primaires :
 *   - Code du travail, articles R. 4323-22 à R. 4323-28 (vérifications
 *     générales périodiques des équipements de travail).
 *   - Arrêté du 1er mars 2004 relatif aux vérifications des appareils et
 *     accessoires de levage (modalités de réalisation des vérifications
 *     et contenu du rapport).
 *   - Arrêté du 2 mars 2004 relatif à la vérification des équipements de
 *     travail utilisés pour le levage de personnes.
 *
 * Scope MVP : équipements courants en TPE/PME — monte-charges, hayons
 * élévateurs, gerbeurs, chariots élévateurs, petits palans. Les grues mobiles,
 * portiques et appareils soumis à régime ICPE sortent du périmètre V2.
 *
 * Ce qui entre dans le champ ne se déduit ni de la motorisation ni du nom de
 * l'engin, mais du **changement de niveau significatif** de la charge
 * (arrêté du 1er mars 2004, art. 2 a) : « N'est pas considéré comme
 * significatif un changement de niveau correspondant à ce qui est juste
 * nécessaire pour déplacer la charge en la décollant du sol ». L'annexe du
 * même arrêté (version du 9 janvier 2011) exclut d'ailleurs nommément « les
 * transpalettes levant la charge juste de la hauteur nécessaire pour la
 * déplacer en la décollant du sol » — un transpalette, même électrique, reste
 * donc hors champ, tandis qu'un gerbeur manuel y entre. Cette même annexe
 * range « chariots automoteurs élévateurs à conducteur porté ou non,
 * gerbeurs » dans une seule famille : c'est par elle que le gerbeur rejoint
 * les « chariots élévateurs » du II de l'article 20.
 */

import type { Obligation } from "./types";

export const obligationsLevage: Obligation[] = [
  {
    id: "levage-examen-adequation-mise-en-service",
    domaine: "levage",
    libelle: "Examen d'adéquation à la mise en service (équipement de levage)",
    description:
      "Avant première mise en service, l'employeur procède à un examen d'adéquation : l'appareil est adapté aux travaux à réaliser et aux charges prévues, compte tenu de l'environnement et des conditions d'utilisation.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-22",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531483",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 5",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000249655/",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
  },
  {
    id: "levage-epreuve-initiale-fonctionnement",
    domaine: "levage",
    libelle: "Épreuve de fonctionnement à la première mise en service",
    description:
      "Avant mise en service d'un appareil de levage de charges non spécifiquement conçu pour le levage de personnes, une épreuve statique et une épreuve dynamique de fonctionnement sont réalisées pour vérifier la tenue des charges et des organes de sécurité.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-25",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490949/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 6 et 7",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000249655/",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
  },
  {
    id: "levage-vgp-annuelle-charges",
    domaine: "levage",
    libelle: "Vérification générale périodique annuelle (levage de charges)",
    description:
      "Les appareils servant au levage de charges font l'objet d'une vérification générale périodique (VGP) au moins annuelle par une personne compétente. La VGP contrôle notamment les dispositifs d'arrêt d'urgence, les limiteurs de charge, les freins et l'état des organes de suspension.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-23 et R. 4323-24",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490945/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 22",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000249655/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee", "organisme_agree"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
    conditions: [
      {
        type: "equipement_propriete_infirmee",
        categorie: "EQUIPEMENT_LEVAGE",
        propriete: "estChariotOuGerbeur",
      },
    ],
    notesInternes:
      "Les douze mois sont le principe de l'article 23 de l'arrêté du 1er mars 2004, pas une règle universelle : le même article ramène la périodicité à six mois pour les appareils listés au II de son article 20, dont les chariots élévateurs. La condition `infirmee` écarte donc cette obligation au profit de `levage-vgp-semestrielle-chariot-gerbeur` dès que le dirigeant répond « oui » — et seulement alors. Tant que la question n'a pas été posée, c'est la périodicité annuelle qui reste affichée : une périodicité trop longue est un écart visible et corrigeable, l'absence totale d'échéance sur une obligation de criticité 5 ne le serait pas.",
  },
  {
    id: "levage-vgp-semestrielle-chariot-gerbeur",
    domaine: "levage",
    libelle:
      "Vérification générale périodique semestrielle (chariot élévateur, gerbeur)",
    description:
      "Les chariots élévateurs et les gerbeurs font l'objet d'une vérification générale périodique tous les six mois, et non tous les douze. La vérification porte sur l'état de conservation de l'appareil et sur les essais de fonctionnement des dispositifs de sécurité (freins, limiteurs, organes de suspension).",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-23",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531479",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 23 a)",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006680469",
        note: "« Toutefois, cette périodicité est de : a) Six mois pour les appareils de levage ci-après : - appareils de levage listés aux II et III de l'article 20 […] ».",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 20-II",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006680466",
        note: "Liste où figurent les « chariots élévateurs » et les « hayons élévateurs ».",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, annexe",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000023453892",
        note: "Version du 9 janvier 2011. Range « chariots automoteurs élévateurs à conducteur porté ou non, gerbeurs » dans une même famille — c'est par elle que le gerbeur rejoint les « chariots élévateurs » de l'article 20-II, le mot n'y figurant pas. La même annexe exclut les transpalettes à simple décollement de charge.",
      },
    ],
    periodicite: "semestrielle",
    realisateurs: ["personne_qualifiee", "organisme_agree"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
    conditions: [
      {
        type: "equipement_propriete_booleenne",
        categorie: "EQUIPEMENT_LEVAGE",
        propriete: "estChariotOuGerbeur",
        valeur: true,
      },
    ],
    notesInternes:
      "Obligation créée en 2026-08 : le référentiel ne connaissait que la VGP annuelle et une VGP semestrielle réservée au levage de personnes, si bien qu'un gerbeur ou un chariot élévateur — l'appareil de levage le plus courant en commerce et en réserve — héritait d'une périodicité annuelle contraire à l'article 23. Condition stricte (`booleenne`) assumée bien que la criticité soit de 5 : l'obligation est nouvelle, aucun équipement déjà en base ne peut la perdre, et la couverture par défaut reste assurée par `levage-vgp-annuelle-charges`, qui s'applique tant que la question n'a pas reçu « oui ». Le critère de champ n'est ni la motorisation ni le nom de l'engin mais le changement de niveau significatif de la charge (art. 2 a) — voir l'en-tête du fichier.",
  },
  {
    id: "levage-vgp-semestrielle-personnes",
    domaine: "levage",
    libelle: "Vérification générale semestrielle (levage de personnes)",
    description:
      "Les équipements utilisés pour le levage de personnes font l'objet d'une VGP tous les six mois par une personne compétente. Cette périodicité vaut également pour les appareils servant occasionnellement au levage de personnes (nacelles).",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-23",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490945/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 2 mars 2004",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000251000/",
      },
    ],
    periodicite: "semestrielle",
    realisateurs: ["personne_qualifiee", "organisme_agree"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
    conditions: [
      {
        type: "equipement_propriete_non_infirmee",
        categorie: "EQUIPEMENT_LEVAGE",
        propriete: "sertAuLevageDePersonnes",
      },
    ],
    notesInternes:
      "EQUIPEMENT_LEVAGE est une catégorie fourre-tout : sans condition, un simple transpalette héritait d'une VGP semestrielle « levage de personnes » juridiquement inapplicable. La périodicité de six mois ne vaut que pour les équipements servant — même occasionnellement — au levage de personnes (arrêté du 2 mars 2004). Forme `non_infirmee` (criticité 5) : un appareil déjà déclaré conserve la VGP semestrielle tant que le dirigeant n'a pas répondu « non » à la question du levage de personnes.",
  },
  {
    id: "levage-vgp-accessoires-annuelle",
    domaine: "levage",
    libelle: "Vérification périodique des accessoires de levage (élingues, crochets, anneaux)",
    description:
      "Les accessoires de levage (élingues, chaînes, câbles, crochets, anneaux, manilles, palonniers) font l'objet d'une vérification périodique au moins annuelle portant sur leur état, leur marquage de charge et la conformité de leur utilisation.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-23",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490945/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 23",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000249655/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
    conditions: [
      {
        type: "equipement_propriete_non_infirmee",
        categorie: "EQUIPEMENT_LEVAGE",
        propriete: "aAccessoiresDeLevage",
      },
    ],
    notesInternes:
      "Vérification des ACCESSOIRES (élingues, chaînes, câbles, crochets, anneaux, manilles, palonniers), pas de l'appareil lui-même : elle n'a pas d'objet pour un appareil utilisé sans accessoire, typiquement un transpalette. Forme `non_infirmee` (criticité 4) : l'obligation reste affichée tant que le dirigeant n'a pas répondu « non ».",
  },
  {
    id: "levage-examen-etat-conservation",
    domaine: "levage",
    libelle: "Examen de l'état de conservation (équipement de levage en service)",
    description:
      "Lors de chaque VGP, l'état de conservation des éléments essentiels à la sécurité (structure, mécanismes, organes de sécurité) est examiné. Toute anomalie notable impose une mise hors service jusqu'à remise en conformité.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-27",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490953/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
  },
  {
    id: "levage-remise-en-service-apres-reparation",
    domaine: "levage",
    libelle: "Examen approfondi à la remise en service (après réparation notable)",
    description:
      "Après démontage, modification ou réparation d'un élément essentiel à la sécurité, un examen approfondi est réalisé par une personne compétente avant remise en service. Pour les appareils servant au levage de personnes, une épreuve de fonctionnement est ajoutée.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-28",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490955/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 9 à 11",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000249655/",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
    notesInternes:
      "Événementiel — une occurrence par remise en service. Traité comme mise_en_service_uniquement par le générateur MVP.",
  },
  {
    id: "levage-registre-securite-consignation",
    domaine: "levage",
    libelle: "Tenue du registre de sécurité (vérifications levage)",
    description:
      "Les résultats des vérifications (VGP, examens d'adéquation, épreuves, remises en service) sont consignés sur le ou les registres de sécurité de l'établissement et tenus à la disposition de l'inspection du travail. Lorsque la vérification est faite par un tiers, son rapport est annexé au registre ; à défaut, la date de la vérification, celle de la remise du rapport et son lieu d'archivage y sont portées.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-25",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531475",
        note: "Fonde la consignation : « Le résultat des vérifications générales périodiques est consigné sur le ou les registres de sécurité mentionnés à l'article L. 4711-5. »",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-26",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531473",
        note: "Annexion au registre des rapports établis par un vérificateur extérieur à l'établissement.",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-27",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531471",
        note: "Autorise la tenue et la conservation du registre sur tout support, dans les conditions de l'article L. 8113-6 — c'est cet article qui fonde le registre numérique, et non L. 4711-5.",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
  },
];
