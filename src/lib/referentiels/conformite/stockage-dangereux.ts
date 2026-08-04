/**
 * Obligations réglementaires — Stockage de matières dangereuses (P3).
 *
 * Sources primaires :
 *   - Code de l'environnement, articles L. 511-1 et s. (installations
 *     classées pour la protection de l'environnement — ICPE).
 *   - Arrêté du 3 octobre 2010 modifié relatif au stockage en récipients
 *     mobiles exploités au sein d'une ICPE soumise à autorisation,
 *     enregistrement ou déclaration au titre de l'une ou plusieurs des
 *     rubriques n° 1436, 4330, 4331, 4722, 4734, 4742, 4743, 4744, 4746,
 *     4747 ou 4748.
 *   - Code du travail, articles R. 4412-1 et s. (prévention du risque
 *     chimique).
 *   - Code du travail, art. R. 4227-20 et s. (matières inflammables
 *     utilisées dans les locaux de travail).
 *
 * Scope MVP : stockage courant en TPE/PME (produits d'entretien, solvants,
 * bouteilles de gaz en petite quantité). Les installations soumises à
 * autorisation ou enregistrement ICPE sortent du périmètre V2 — une note
 * d'orientation est prévue pour les diriger vers un accompagnement
 * spécialisé.
 */

import type { Obligation } from "./types";

export const obligationsStockageDangereux: Obligation[] = [
  {
    id: "stockage-dangereux-declaration-icpe",
    domaine: "stockage_dangereux",
    libelle: "Vérification du régime ICPE applicable (stockage matières dangereuses)",
    description:
      "L'exploitant vérifie si les quantités stockées placent l'établissement sous un régime ICPE (déclaration, enregistrement ou autorisation) et effectue les démarches correspondantes (rubriques 1436, 4330, 4331, 4734…). Le classement conditionne les contrôles périodiques ultérieurs.",
    referencesLegales: [
      {
        source: "CODE_ENVIRONNEMENT",
        reference: "L. 512-8 (déclaration) · L. 512-7 (enregistrement) · L. 512-1 (autorisation)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074220/LEGISCTA000022495604/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 4,
    typologies: { travail: true },
    categoriesEquipement: ["STOCKAGE_MATIERE_DANGEREUSE"],
    notesInternes:
      "Étape de qualification initiale. Une fois le régime connu, les obligations ICPE spécifiques s'appliquent — sortie de périmètre MVP.",
  },
  {
    id: "stockage-dangereux-retention",
    domaine: "stockage_dangereux",
    libelle: "Capacité de rétention (stockage liquides dangereux)",
    description:
      "Tout stockage de liquides dangereux (inflammables, toxiques, corrosifs) en récipients mobiles ou fixes est placé sur une capacité de rétention étanche. Le volume de rétention est au moins égal à 100 % du plus grand récipient ou 50 % du volume total.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 3 octobre 2010, art. 6",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000022973321/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["STOCKAGE_MATIERE_DANGEREUSE"],
  },
  {
    id: "stockage-dangereux-verification-etancheite",
    domaine: "stockage_dangereux",
    libelle: "Vérification visuelle mensuelle de l'étanchéité (stockage)",
    description:
      "L'exploitant réalise une vérification visuelle mensuelle de l'état du stockage : intégrité des récipients, absence de fuite, état du bac de rétention, ventilation. Les anomalies sont consignées et corrigées.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 3 octobre 2010, art. 7",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000022973321/",
      },
    ],
    periodicite: "mensuelle",
    realisateurs: ["exploitant"],
    criticite: 4,
    typologies: { travail: true },
    categoriesEquipement: ["STOCKAGE_MATIERE_DANGEREUSE"],
  },
  {
    id: "stockage-dangereux-ventilation-locaux",
    domaine: "stockage_dangereux",
    libelle: "Ventilation des locaux de stockage et contrôle annuel",
    description:
      "Les locaux de stockage de matières dangereuses sont ventilés en permanence. Le bon fonctionnement de la ventilation fait l'objet d'un contrôle annuel (débit, absence d'accumulation de vapeurs).",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4222-20",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490423/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 3 octobre 2010, art. 10",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000022973321/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { travail: true },
    categoriesEquipement: ["STOCKAGE_MATIERE_DANGEREUSE"],
  },
  {
    id: "stockage-dangereux-fiches-donnees",
    domaine: "stockage_dangereux",
    libelle: "Fiches de données de sécurité à jour et accessibles",
    description:
      "L'exploitant conserve et rend accessibles les fiches de données de sécurité (FDS) de toutes les substances et mélanges dangereux stockés. Les FDS sont actualisées à chaque modification (règlement REACH).",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4412-38",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018490855/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true },
    categoriesEquipement: ["STOCKAGE_MATIERE_DANGEREUSE"],
  },
  {
    id: "stockage-dangereux-formation-personnel",
    domaine: "stockage_dangereux",
    libelle: "Formation du personnel manipulant des matières dangereuses",
    description:
      "Les salariés qui manipulent des substances ou mélanges dangereux reçoivent une formation adaptée aux risques chimiques et aux consignes de stockage. La formation est renouvelée régulièrement et lors de tout changement notable.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4412-38 et R. 4412-87",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018491065/",
      },
    ],
    periodicite: "triennale",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true },
    categoriesEquipement: ["STOCKAGE_MATIERE_DANGEREUSE"],
    notesInternes:
      "Périodicité triennale est une pratique usuelle (INRS), pas une obligation stricte du Code du travail. Affichée comme rappel, non comme écart.",
  },
];
