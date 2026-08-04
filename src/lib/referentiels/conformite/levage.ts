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
 * Scope MVP : équipements courants en TPE/PME — transpalettes électriques,
 * monte-charges, hayons élévateurs, petits palans. Les grues mobiles,
 * portiques et appareils soumis à régime ICPE sortent du périmètre V2.
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
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490943/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 5",
        urlLegifrance:
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
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490949/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 6 et 7",
        urlLegifrance:
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
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490945/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 22",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000249655/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee", "organisme_agree"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
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
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490945/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 2 mars 2004",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000251000/",
      },
    ],
    periodicite: "semestrielle",
    realisateurs: ["personne_qualifiee", "organisme_agree"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
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
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490945/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 23",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000249655/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
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
        urlLegifrance:
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
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490955/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 9 à 11",
        urlLegifrance:
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
      "Les résultats des vérifications (VGP, examens d'adéquation, épreuves, remises en service) sont consignés sans délai sur le registre de sécurité de l'établissement (L. 4711-5 CT) et tenus à la disposition de l'inspection du travail.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "L. 4711-5 et R. 4323-26",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490951/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
  },
];
