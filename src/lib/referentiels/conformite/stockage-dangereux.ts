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
        article: "C. env. L. 512-1",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074220/LEGISCTA000006159273/",
      },
    ],
    periodicite: "autre",
    nature: "ponctuelle",
    pieceAttendue: null,
    realisateurs: ["exploitant"],
    criticite: 4,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["STOCKAGE_MATIERE_DANGEREUSE"],
    notesInternes:
      "Étape de qualification initiale. Une fois le régime connu, les obligations ICPE spécifiques s'appliquent — sortie de périmètre MVP.\n\nNATURE : PONCTUELLE (ADR-026). La note ci-dessus la qualifie d'« étape de qualification initiale », et c'est exactement une obligation ponctuelle : faite une fois, elle ne se refait pas — sauf changement des quantités stockées, fait que le produit n'observe pas et qui n'est pas encodé ici. C'est l'une des trois obligations sur lesquelles l'audit du 2026-08-31 a établi que `periodicite: \"autre\"` recouvrait trois natures distinctes.",
  },
  {
    id: "stockage-dangereux-retention",
    domaine: "stockage_dangereux",
    libelle: "Capacité de rétention (stockage liquides dangereux)",
    description:
      "Tout stockage de liquides dangereux (inflammables, toxiques, corrosifs) est organisé de façon à prévenir les épandages : récipients placés sur une capacité de rétention étanche. La règle chiffrée des arrêtés ICPE — capacité de rétention au moins égale à la PLUS GRANDE des deux valeurs : 100 % de la capacité du plus grand réservoir, ou 50 % de la capacité totale des réservoirs associés — n'est opposable qu'aux établissements classés ; hors ICPE, elle sert de référence de bonne pratique.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4412-11 (procédures de stockage sûres des agents chimiques dangereux)",
        article: "R. 4412-11",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018530929/",
        versionConstatee: "2008-05-01",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er juin 2015 (rubriques 4331/4734, enregistrement), art. 22 — valeurs de rétention, opposables uniquement sous ce régime ICPE",
        article: "Arrêté 2015-06-01 art. 22",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044166790",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4412-17 (prévention des débordements et ruptures de parois des récipients)",
        article: "R. 4412-17",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018530917",
        note: "« A cet effet, l'employeur prend les mesures appropriées pour empêcher : […] 2° Les risques de débordement ou d'éclaboussures, ainsi que de déversement par rupture des parois des cuves, bassins, réservoirs et récipients de toute nature contenant des produits susceptibles de provoquer des brûlures d'origine thermique ou chimique. » Verbatim relevé en première main le 2026-08-27. C'est le seul article du Code du travail qui vise la rupture de parois d'un récipient de stockage ; le mot « rétention » n'y figure pas, ni nulle part ailleurs dans le chapitre.",
        versionConstatee: "2008-05-01",
      },
    ],
    periodicite: "autre",
    nature: "etat_permanent",
    pieceAttendue: null,
    realisateurs: ["exploitant"],
    criticite: 5,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["STOCKAGE_MATIERE_DANGEREUSE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version fondait cette règle sur l'arrêté du 3 octobre 2010, qui ne s'applique qu'aux réservoirs aériens des ICPE soumises à autorisation (rubrique 1432) — inapplicable à une TPE non classée.\n\nNATURE : ÉTAT PERMANENT (ADR-026). La rétention est en place ou elle ne l'est pas : c'est un état matériel. `pieceAttendue` est nulle, malgré la criticité 5 — l'obligation ne porte sur aucun écrit.",
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
        article: "R. 4412-11",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018530929/",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4412-17 (prévention des débordements et ruptures de parois des récipients)",
        article: "R. 4412-17",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018530917",
        note: "« A cet effet, l'employeur prend les mesures appropriées pour empêcher : […] 2° Les risques de débordement ou d'éclaboussures, ainsi que de déversement par rupture des parois des cuves, bassins, réservoirs et récipients de toute nature contenant des produits susceptibles de provoquer des brûlures d'origine thermique ou chimique. » Verbatim relevé en première main le 2026-08-27. C'est le seul article du Code du travail qui vise la rupture de parois d'un récipient de stockage ; le mot « rétention » n'y figure pas, ni nulle part ailleurs dans le chapitre.",
        versionConstatee: "2008-05-01",
      },
    ],
    periodicite: "autre",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["exploitant"],
    criticite: 4,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["STOCKAGE_MATIERE_DANGEREUSE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : la périodicité mensuelle était attribuée à l'arrêté du 3 octobre 2010 (ICPE autorisation), inapplicable ici. Aucune source opposable ne fixant de fréquence, l'obligation passe en « autre » et n'est plus planifiée au calendrier.\n\nNATURE : ÉCHÉANCE RÉCURRENTE (ADR-026), ET C'EST LE CAS D'ÉCOLE DU CHAMP. R. 4412-11 écrit que l'exploitant vérifie « RÉGULIÈREMENT » : l'acte revient, seul son rythme manque. Rangée en `periodicite: autre` — ce qui reste juste — elle se lisait comme un état permanent, et un écran de déclaration lui aurait proposé une case à cocher à vie. Le couple nature + périodicité dit maintenant la vérité entière : elle revient, on ne sait pas à quel rythme.",
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
        article: "R. 4222-20",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532294/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 8 octobre 1987, art. 4 (locaux à pollution spécifique)",
        article: "Arrêté 1987-10-08 art. 4",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006678611",
      },
    ],
    periodicite: "annuelle",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    transmet: [],
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
        article: "R. 4412-38",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036483735/",
        versionConstatee: "2018-01-01",
      },
    ],
    periodicite: "autre",
    nature: "evenementielle",
    pieceAttendue: "fiches de données de sécurité",
    realisateurs: ["exploitant"],
    criticite: 3,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["STOCKAGE_MATIERE_DANGEREUSE"],
    notesInternes: "NATURE : ÉVÉNEMENTIELLE (ADR-026). Deux titres : l'accès permanent aux fiches, et leur actualisation « à chaque changement ». La règle de résolution retient le second, qui oblige à refaire l'acte — une FDS de 2019 accessible n'est pas une FDS à jour. `pieceAttendue` nomme l'écrit, qui est ici l'obligation elle-même et non la trace d'un acte.",
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
        article: "R. 4412-38",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036483735/",
        versionConstatee: "2018-01-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4412-87 (agents CMR uniquement)",
        article: "R. 4412-87",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036483731/",
        versionConstatee: "2018-01-01",
      },
    ],
    periodicite: "autre",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["exploitant"],
    criticite: 3,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["STOCKAGE_MATIERE_DANGEREUSE"],
    notesInternes:
      "Périodicité triennale est une pratique usuelle (INRS), pas une obligation stricte du Code du travail. Affichée comme rappel, non comme écart.\n\nAMENDEMENT 2026-08-27, même audit. La note ci-dessus le reconnaissait déjà : « Périodicité triennale est une pratique usuelle (INRS), pas une obligation stricte du Code du travail. » Elle était pourtant encodée comme une échéance triennale, donc affichée au dirigeant comme une date à tenir.\n\nR. 4412-38 exige des informations « périodiquement actualisées » et R. 4412-87 une formation, sans chiffre ni l'un ni l'autre. Reconnaître un écart en note et l'afficher quand même en échéance, c'est le documenter sans le corriger. `periodicite` passe à `autre` : la formation reste due et reste visible, sans date inventée.\n\nEXAMINÉE ET NON REBRANCHÉE — 2026-08-31, lot « faux négatifs d'ancrage ». Le brief portait cette ligne comme « à établir ». Elle est établie, et la réponse est non.\n\nR. 4412-38 relu au verbatim ce jour (version en vigueur depuis le 2018-01-01) : « L'employeur veille à ce que les travailleurs ainsi que le comité social et économique : 1° Reçoivent des informations [...] sur LES AGENTS CHIMIQUES DANGEREUX SE TROUVANT SUR LE LIEU DE TRAVAIL [...] ; 2° Aient accès aux fiches de données de sécurité [...] ; 3° Reçoivent une formation et des informations sur les précautions à prendre [...] »\n\nLe déclencheur du texte est la PRÉSENCE d'agents chimiques dangereux sur le lieu de travail. Ce n'est ni un statut d'employeur, ni un équipement : c'est le cinquième déclencheur de la carto, « activité réellement exercée », qui n'est pas implémenté. Passer au porteur établissement appliquerait la formation au risque chimique et les FDS à tout employeur du produit — un cabinet, une boutique de vêtements —, ce qui est faux et bruyant sur du criticité 3.\n\nSTOCKAGE_MATIERE_DANGEREUSE reste donc l'ancrage, en connaissance de cause : c'est un PROXY imparfait — un établissement peut détenir des produits d'entretien classés sans avoir déclaré de stockage — mais un proxy dans le bon sens, qui sous-applique au lieu de sur-appliquer. La correction juste est un attribut de présence d'agents chimiques dangereux, pas un changement de porteur. Rien n'est modifié ici.\n\nÀ ne pas confondre avec la NOTICE DE POSTE de R. 4412-39, que la carto range sur la même ligne (A20, E7) : elle n'est encodée nulle part au référentiel, ni ici ni ailleurs. Ce n'est pas un ancrage à corriger, c'est une obligation absente — hors du périmètre de ce lot, qui ne traite que des ancrages existants.\n\nNATURE : ÉCHÉANCE RÉCURRENTE (ADR-026). Le texte porte deux titres — « renouvelée régulièrement » et « lors de tout changement notable » —, et la règle de résolution place `echeance_recurrente` avant `evenementielle` : quand l'acte revient à rythme, c'est ce rythme qui commande le suivi, l'événement n'étant qu'un ajout. « Régulièrement » sans chiffre, c'est précisément le couple `echeance_recurrente` + `periodicite: autre`. La note ci-dessus reste vraie : le triennal INRS n'est toujours pas encodé, et ne doit pas l'être.",
  },
];
