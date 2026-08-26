/**
 * Obligations réglementaires — Équipements de levage (P3).
 *
 * Sources primaires :
 *   - Code du travail, articles R. 4323-22 à R. 4323-28 (vérifications
 *     générales périodiques des équipements de travail).
 *   - Arrêté du 1er mars 2004 relatif aux vérifications des appareils et
 *     accessoires de levage (modalités de réalisation des vérifications
 *     et contenu du rapport).
 *   - Arrêté du 2 mars 2004 relatif au carnet de maintenance des appareils
 *     de levage (il ne fixe aucune périodicité : la VGP semestrielle du
 *     levage de personnes est à l'art. 23 de l'arrêté du 1er mars 2004).
 *
 * Audit des sources 2026-08-25 : R. 4323-22 = vérification initiale,
 * R. 4323-23/24 = VGP, R. 4323-25 à 27 = registre, R. 4323-28 = remise en
 * service.
 *
 * Scope MVP : équipements courants en TPE/PME — hayons élévateurs, gerbeurs,
 * chariots élévateurs, petits palans. Les grues mobiles, portiques et appareils
 * soumis à régime ICPE sortent du périmètre V2.
 *
 * Les MONTE-CHARGES en ont été retirés le 2026-08-26 : l'annexe de l'arrêté
 * exclut expressément « les ascenseurs et les monte-charges ainsi que les
 * élévateurs de personnes n'excédant pas une vitesse de 0,15 m/s, installés à
 * demeure ». Ils relevaient donc d'un texte que cet arrêté ne régit pas — les
 * ascenseurs ont leur propre domaine.
 *
 * Ce qui entre dans le champ ne se déduit ni de la motorisation ni du nom de
 * l'engin, mais du **changement de niveau significatif** de la charge
 * (arrêté du 1er mars 2004, art. 2 a) : « N'est pas considéré comme
 * significatif un changement de niveau correspondant à ce qui est juste
 * nécessaire pour déplacer la charge en la décollant du sol et n'est pas susceptible d'engendrer de risques en cas de défaillance du support de charge ». L'annexe du
 * même arrêté (version du 9 janvier 2011) exclut d'ailleurs nommément « les
 * transpalettes levant la charge juste de la hauteur nécessaire pour la
 * déplacer en la décollant du sol et n'est pas susceptible d'engendrer de risques en cas de défaillance du support de charge » — un transpalette, même électrique, reste
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
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 5 (examen d'adéquation et de montage) et art. 12 à 15",
        article: "Arrêté 2004-03-01 art. 5",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000439029",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-22",
        article: "R. 4323-22",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531483/",
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
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 6, 10 et 11 (essai de fonctionnement, épreuves statique et dynamique)",
        article: "Arrêté 2004-03-01 art. 10-11",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000439029",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-22",
        article: "R. 4323-22",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531483/",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait R. 4323-25, qui traite de la consignation au registre.",
  },
  {
    id: "levage-vgp-annuelle-charges",
    domaine: "levage",
    libelle: "Vérification générale périodique annuelle (levage de charges)",
    description:
      "Les appareils servant au levage de charges font l'objet d'une vérification générale périodique (VGP) au moins annuelle par une personne qualifiée. Elle comporte l'examen de l'état de conservation prévu à l'article 9 — dispositifs de calage, amarrage et freinage, freins, dispositifs contrôlant la descente des charges, poulies de mouflage, limiteurs de charge et de moment de renversement, dispositifs limitant les mouvements, crochets et appareils de préhension, câbles et chaînes de charge — et les essais des b et c de l'article 6.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-23 et R. 4323-24",
        article: "R. 4323-23",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531479/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 23 (périodicité de 12 mois)",
        article: "Arrêté 2004-03-01 art. 23",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006680469",
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
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 23 a)",
        article: "Arrêté 2004-03-01 art. 23",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006680469",
        note: "« Toutefois, cette périodicité est de : a) Six mois pour les appareils de levage ci-après : - appareils de levage listés aux II et III de l'article 20 […] ».",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-23",
        article: "R. 4323-23",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531479",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 20-II",
        article: "Arrêté 2004-03-01 art. 20",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006680466",
        note: "Liste où figurent les « chariots élévateurs » et les « hayons élévateurs ».",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, annexe",
        article: "Arrêté 2004-03-01 annexe",
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
      "Obligation créée en 2026-08 : le référentiel ne connaissait que la VGP annuelle et une VGP semestrielle réservée au levage de personnes, si bien qu'un gerbeur ou un chariot élévateur — l'appareil de levage le plus courant en commerce et en réserve — héritait d'une périodicité annuelle contraire à l'article 23. Condition stricte (`booleenne`) assumée bien que la criticité soit de 5 : l'obligation est nouvelle, aucun équipement déjà en base ne peut la perdre, et la couverture par défaut reste assurée par `levage-vgp-annuelle-charges`, qui s'applique tant que la question n'a pas reçu « oui ». Le critère de champ n'est ni la motorisation ni le nom de l'engin mais le changement de niveau significatif de la charge (art. 2 a) — voir l'en-tête du fichier.\n\nAmendement 2026-08-26 : R. 4323-23 était en refs[0] ici, alors que les trois autres obligations de VGP du fichier mettent l'arrêté du 1er mars 2004 en premier. Même rôle juridique, deux traitements — et le test anti-doublon compare sur refs[0], donc l'incohérence le rendait aveugle entre ces obligations. L'arrêté passe fondateur partout : R. 4323-23 renvoie la périodicité à un arrêté, c'est l'arrêté qui la fixe.",
  },
    {
    id: "levage-vgp-trimestrielle-force-humaine",
    domaine: "levage",
    libelle:
      "Vérification générale trimestrielle (appareil manuel élevant un poste de travail)",
    description:
      "Les appareils de levage mus par la force humaine employée directement, utilisés pour déplacer en élévation un poste de travail, font l'objet d'une vérification générale périodique tous les trois mois par une personne qualifiée. Elle comporte l'examen de l'état de conservation prévu à l'article 9 et les essais des b et c de l'article 6.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference:
          "Arrêté du 1er mars 2004, art. 23 b) (périodicité de 3 mois)",
        article: "Arrêté 2004-03-01 art. 23",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006680469",
        note: "« Toutefois, cette périodicité est de : […] b) Trois mois pour les appareils de levage, mus par la force humaine employée directement, utilisés pour déplacer en élévation un poste de travail. » Verbatim relevé le 2026-08-26.",
        versionConstatee: "2005-03-31",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-23",
        article: "R. 4323-23",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531479/",
      },
    ],
    periodicite: "trimestrielle",
    realisateurs: ["personne_qualifiee", "organisme_agree"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
    conditions: [
      {
        type: "equipement_propriete_booleenne",
        categorie: "EQUIPEMENT_LEVAGE",
        propriete: "estMuParForceHumaine",
        valeur: true,
      },
      {
        type: "equipement_propriete_non_infirmee",
        categorie: "EQUIPEMENT_LEVAGE",
        propriete: "sertAuLevageDePersonnes",
      },
    ],
    notesInternes:
      "Créée le 2026-08-26. Le référentiel ne connaissait aucune périodicité trimestrielle : l'article 23 distingue six mois pour les appareils mus par une énergie AUTRE que la force humaine (a) et trois mois pour ceux mus par la force humaine employée directement (b), et seule la première branche était encodée. Un treuil à manivelle ou un palan à chaîne servant à élever un poste de travail recevait donc six mois au lieu de trois.\n\nLa propriété `estMuParForceHumaine` a été créée pour cela — elle n'existait pas, ce qui m'avait fait présenter à tort le manque comme non corrigeable. Condition stricte (`booleenne`) bien que la criticité soit de 5 : l'obligation est nouvelle, aucun équipement déjà en base ne peut la perdre, et la couverture par défaut reste assurée par la semestrielle, qui s'applique tant que la question n'a pas reçu « oui ».",
  },
{
    id: "levage-vgp-semestrielle-personnes",
    domaine: "levage",
    libelle: "Vérification générale semestrielle (levage de personnes)",
    description:
      "Les appareils de levage mus par une énergie autre que la force humaine employée directement, utilisés pour le transport des personnes ou pour déplacer en élévation un poste de travail, font l'objet d'une VGP tous les six mois par une personne qualifiée. Les plates-formes élévatrices mobiles de personnes y sont visées directement par la liste de l'article 20-II. Lorsque l'appareil est mû par la force humaine employée directement, l'article 23 b) ramène la périodicité à trois mois — cas non encodé, faute d'une propriété d'équipement qui le distingue.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 23 (périodicité de 6 mois pour les appareils servant au transport de personnes ou à l'élévation d'un poste de travail)",
        article: "Arrêté 2004-03-01 art. 23",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006680469",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-23",
        article: "R. 4323-23",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531479/",
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
      {
        // Forme `infirmee` : satisfaite tant que le dirigeant n'a pas répondu
        // « oui ». Un appareil mû à la force humaine bascule alors sur la
        // trimestrielle de l'article 23 b), et seulement à ce moment-là. Le
        // silence ne fait perdre aucune échéance — il en laisse une plus
        // longue, visible et corrigeable.
        type: "equipement_propriete_infirmee",
        categorie: "EQUIPEMENT_LEVAGE",
        propriete: "estMuParForceHumaine",
      },
    ],
    notesInternes:
      "EQUIPEMENT_LEVAGE est une catégorie fourre-tout : sans condition, un simple transpalette héritait d'une VGP semestrielle « levage de personnes » juridiquement inapplicable. Forme `non_infirmee` (criticité 5). Corrigé à l'audit 2026-08 : l'ancienne version attribuait la périodicité de 6 mois à « l'arrêté du 2 mars 2004 », qui ne traite que du carnet de maintenance ; elle est à l'art. 23 de l'arrêté du 1er mars 2004.",
  },
  {
    id: "levage-vgp-accessoires-annuelle",
    domaine: "levage",
    libelle: "Vérification périodique des accessoires de levage (élingues, crochets, anneaux)",
    description:
      "Les accessoires de levage (élingues, chaînes, câbles, crochets, anneaux, manilles, palonniers) sont soumis tous les douze mois à une vérification portant sur leur bon état de conservation, et notamment sur toute détérioration — déformation, hernie, étranglement, toron cassé, nombre de fils cassés supérieur à celui admissible, linguet détérioré — ou toute autre limite d'emploi précisée par la notice du fabricant.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 24 (vérification périodique des accessoires)",
        article: "Arrêté 2004-03-01 art. 24",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000439029",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-23",
        article: "R. 4323-23",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531479/",
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
      "Lors de chaque VGP, l'examen de l'état de conservation a pour objet de déceler toute détérioration susceptible d'être à l'origine de situations dangereuses, sur les éléments essentiels que l'article 9 énumère. Il comprend un examen visuel détaillé, complété en tant que de besoin d'essais de fonctionnement.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 9 (examen de l'état de conservation) et art. 22",
        article: "Arrêté 2004-03-01 art. 9",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000439029",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-23",
        article: "R. 4323-23",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531479/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EQUIPEMENT_LEVAGE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait R. 4323-27, qui traite du support du registre de sécurité.",
  },
  {
    id: "levage-remise-en-service-apres-reparation",
    domaine: "levage",
    libelle: "Examen approfondi à la remise en service (après réparation notable)",
    description:
      "La vérification lors de la remise en service comprend l'examen d'adéquation, le cas échéant l'examen de montage et d'installation, l'examen de l'état de conservation, l'épreuve statique et l'épreuve dynamique. Elle est due après démontage et remontage ou modification (R. 4323-28), et l'article 20-I y ajoute le changement de site d'utilisation, le changement de configuration ou des conditions d'utilisation sur un même site, et la suite de tout accident provoqué par la défaillance d'un organe essentiel.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-28",
        article: "R. 4323-28",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531467/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er mars 2004, art. 18 à 21 (remise en service)",
        article: "Arrêté 2004-03-01 art. 19",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000439029",
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
      "Le résultat des vérifications générales périodiques est consigné sur le ou les registres de sécurité mentionnés à l'article L. 4711-5. Lorsque la vérification est faite par un tiers, son rapport est annexé au registre ; à défaut, la date de la vérification, celle de la remise du rapport et son lieu d'archivage y sont portées.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-25",
        article: "R. 4323-25",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531475",
        note: "Fonde la consignation : « Le résultat des vérifications générales périodiques est consigné sur le ou les registres de sécurité mentionnés à l'article L. 4711-5. »",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-26",
        article: "R. 4323-26",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531473",
        note: "Annexion au registre des rapports établis par un vérificateur extérieur à l'établissement.",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4323-27",
        article: "R. 4323-27",
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
