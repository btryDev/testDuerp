/**
 * Obligations réglementaires — Stockage de matières dangereuses (P3).
 *
 * Sources primaires :
 *   - Code de l'environnement, articles L. 511-1 et s. (installations
 *     classées pour la protection de l'environnement — ICPE).
 *   - Code du travail, art. R. 4412-11 (procédures sûres de stockage et de
 *     manipulation des agents chimiques dangereux).
 *   - Arrêté du 1er juin 2015 (rubriques 4331/4734, enregistrement), art. 22,
 *     cité pour les valeurs de rétention — opposable seulement sous ce
 *     régime ICPE.
 *
 * Audit des sources 2026-08-25 : l'arrêté du 3 octobre 2010 cité auparavant
 * ne vise que les réservoirs aériens des ICPE soumises à autorisation
 * (rubrique 1432) ; il a été retiré.
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
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074220/LEGISCTA000006159273/",
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
      "Tout stockage de liquides dangereux (inflammables, toxiques, corrosifs) est organisé de façon à prévenir les épandages : récipients placés sur une capacité de rétention étanche. La règle chiffrée des arrêtés ICPE (rétention ≥ 100 % du plus grand récipient ou ≥ 50 % du volume total) n'est opposable qu'aux établissements classés ; hors ICPE, elle sert de référence de bonne pratique.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4412-11 (procédures de stockage sûres des agents chimiques dangereux)",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018530929/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er juin 2015 (rubriques 4331/4734, enregistrement), art. 22 — valeurs de rétention, opposables uniquement sous ce régime ICPE",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044166790",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["STOCKAGE_MATIERE_DANGEREUSE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version fondait cette règle sur l'arrêté du 3 octobre 2010, qui ne s'applique qu'aux réservoirs aériens des ICPE soumises à autorisation (rubrique 1432) — inapplicable à une TPE non classée.",
  },
  {
    id: "stockage-dangereux-verification-etancheite",
    domaine: "stockage_dangereux",
    libelle: "Vérification régulière de l'état du stockage (rétention, fuites)",
    description:
      "L'exploitant vérifie régulièrement l'état du stockage : intégrité des récipients, absence de fuite, état du bac de rétention, ventilation. Les anomalies sont consignées et corrigées. Aucun texte ne fixe de fréquence hors régime ICPE ; une vérification visuelle mensuelle est une pratique usuelle.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4412-11 (entretien régulier des équipements de stockage)",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018530929/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 4,
    typologies: { travail: true },
    categoriesEquipement: ["STOCKAGE_MATIERE_DANGEREUSE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : la périodicité mensuelle était attribuée à l'arrêté du 3 octobre 2010 (ICPE autorisation), inapplicable ici. Aucune source opposable ne fixant de fréquence, l'obligation passe en « autre » et n'est plus planifiée au calendrier.",
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
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532294/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 8 octobre 1987, art. 4 (locaux à pollution spécifique)",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006678611",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { travail: true },
    categoriesEquipement: ["STOCKAGE_MATIERE_DANGEREUSE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'arrêté du 3 octobre 2010 (ICPE autorisation) remplacé par l'arrêté du 8 octobre 1987, qui fonde le contrôle annuel de la ventilation des locaux à pollution spécifique.",
  },
  {
    id: "stockage-dangereux-fiches-donnees",
    domaine: "stockage_dangereux",
    libelle: "Fiches de données de sécurité à jour et accessibles",
    description:
      "L'employeur veille à ce que les travailleurs aient accès aux fiches de données de sécurité (FDS) fournies par le fournisseur pour chaque substance ou mélange dangereux présent, et à ce que l'information soit actualisée à chaque changement.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4412-38 (accès des travailleurs aux fiches de données de sécurité)",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036483735/",
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
        reference: "R. 4412-38 (agents chimiques dangereux)",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036483735/",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4412-87 (agents CMR uniquement)",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036483731/",
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
