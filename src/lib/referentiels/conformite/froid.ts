/**
 * Obligations réglementaires — Installations frigorifiques (contrôle
 * d'étanchéité des fluides frigorigènes).
 *
 * Sources primaires :
 *   - Code de l'environnement, art. R. 543-79 : le détenteur d'un équipement
 *     dont la charge dépasse cinq tonnes équivalent CO2 de HFC ou de PFC fait
 *     procéder à un contrôle d'étanchéité à la mise en service, renouvelé
 *     « périodiquement et chaque fois que des modifications affectant le
 *     circuit frigorifique sont apportées », par un opérateur disposant de
 *     l'attestation de capacité de l'article R. 543-99.
 *   - Règlement (UE) 2024/573 du 7 février 2024, art. 5 : seuils de
 *     déclenchement, exemption des équipements hermétiquement scellés et
 *     paliers de périodicité.
 *
 * ── Pourquoi le règlement européen et non le droit national ────────────────
 *
 * R. 543-79 et l'arrêté du 29 février 2016 renvoient encore au règlement
 * (UE) n° 517/2014, **abrogé le 11 mars 2024** par le règlement (UE) 2024/573.
 * Le droit national n'a pas encore été mis à jour. Un règlement européen étant
 * d'application directe, c'est le 2024/573 qui porte aujourd'hui les seuils et
 * les fréquences : le référentiel le cite lui, et jamais le texte abrogé. Le
 * jour où le code de l'environnement sera réécrit, les références nationales
 * de ce fichier seront à revoir — pas les périodicités.
 *
 * ── Réserve de vérification, à lever avant mise en production ──────────────
 *
 * R. 543-79 a été lu verbatim sur Légifrance. Les paliers de l'article 5 du
 * règlement, eux, ont été relevés sur le texte consolidé d'EUR-Lex, dont
 * l'extraction s'est révélée instable — deux lectures concordantes, puis des
 * réponses vides. Le résumé officiel d'EUR-Lex corrobore l'amplitude (« tous
 * les 3 à 24 mois ») et les trois seuils (5, 50 et 500 tonnes équivalent CO2),
 * mais une table de synthèse publiée par le portail environnement
 * luxembourgeois donne des colonnes qui ne se recoupent pas exactement.
 *
 * Les six périodicités de ce fichier doivent donc être confrontées au PDF du
 * Journal officiel de l'Union européenne avant toute mise en production. Rien
 * de ce qui est écrit ici n'a été inventé, mais la règle 6 du CLAUDE.md exige
 * une source vérifiable, et une lecture instable n'en est pas tout à fait une.
 *
 * ── Note de conception : six périodicités, quatre questions fermées ────────
 *
 * L'article 5 croise deux variables : un palier de charge (moins de 50 t CO2e,
 * de 50 à 500, 500 et plus — ou, pour les fluides insaturés de l'annexe II
 * section 1, moins de 10 kg, de 10 à 100, 100 et plus) et la présence d'un
 * système fixe de détection des fuites, qui double l'intervalle. Six cas, donc
 * six obligations qui s'excluent.
 *
 * La tentation était de demander la charge en tonnes équivalent CO2 et de
 * poser les paliers en conditions numériques. C'eût été un piège : une
 * condition numérique n'est **pas** satisfaite quand la propriété est absente,
 * et ce chiffre ne se lit pas sur la porte d'une chambre froide — il se
 * calcule à partir du fluide et de sa charge. Le dirigeant qui déclare son
 * groupe froid sans le connaître — le cas de loin le plus fréquent — n'aurait
 * déclenché aucune des six obligations. Silence total sur une obligation de
 * criticité 4, exactement ce que la doctrine du dépôt interdit.
 *
 * Le modèle retenu est donc celui du couple de VGP de levage, étendu à trois
 * paliers : des **questions fermées à trois états**, et une obligation par
 * combinaison, rédigée de sorte qu'exactement une s'applique quel que soit
 * l'état des réponses.
 *
 *   `estChargeSuperieure50TCo2`   ·  `estChargeSuperieure500TCo2`
 *   `aDetectionDeFuites`          ·  `estHermetiquementScelleSousSeuil`
 *
 * Chaque obligation cumule des conditions `infirmee` (satisfaites tant que la
 * réponse n'est pas « oui ») et `booleenne` (satisfaites sur un « oui »
 * explicite). Le tableau des vingt-sept états possibles se lit ainsi :
 *
 *   palier 500 = oui  → trimestriel, ou semestriel si détection ;
 *   sinon palier 50 = oui  → semestriel, ou annuel si détection ;
 *   sinon → annuel, ou biennal si détection.
 *
 * Aucune réponse n'éteint rien : un équipement déclaré sans qu'aucune question
 * n'ait reçu de réponse tombe sur le contrôle **annuel**, qui est la
 * périodicité de l'écrasante majorité des parcs de TPE/PME. Répondre ne fait
 * que déplacer l'échéance vers le palier exact — jamais la faire disparaître.
 *
 * La seule réponse qui retire des obligations est le « oui » explicite à la
 * dispense des équipements hermétiquement scellés (art. 5 : scellé, étiqueté
 * comme tel, et sous 10 t CO2e ou 2 kg selon l'annexe du fluide). Elle est
 * posée en `infirmee` sur les huit obligations : tant qu'elle n'a pas été
 * tranchée, les échéances restent affichées.
 *
 * Scope : installations frigorifiques **fixes** — chambres froides, vitrines
 * et meubles réfrigérés, groupes froid, refroidisseurs. Les unités de
 * réfrigération des véhicules et conteneurs, que le règlement 2024/573 fait
 * entrer dans le champ par étapes jusqu'au 12 mars 2027, sortent du périmètre.
 */

import type { Obligation } from "./types";

const CATEGORIE = "INSTALLATION_FRIGORIFIQUE" as const;

/** Article national fondateur — vérifié sur Légifrance, version du 1ᵉʳ janvier 2025. */
const REF_ENVIRONNEMENT_MISE_EN_SERVICE = {
  source: "CODE_ENVIRONNEMENT",
  reference: "R. 543-79, al. 1",
  urlLegifrance:
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000031790640",
  note: "Contrôle d'étanchéité à la mise en service, par un opérateur disposant de l'attestation de capacité prévue à l'article R. 543-99.",
} as const;

const REF_ENVIRONNEMENT_RENOUVELLEMENT = {
  source: "CODE_ENVIRONNEMENT",
  reference: "R. 543-79, al. 2",
  urlLegifrance:
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000031790640",
  note: "« Le contrôle est renouvelé périodiquement et chaque fois que des modifications affectant le circuit frigorifique sont apportées. »",
} as const;

/** Article européen qui fixe les seuils et les paliers de périodicité. */
const REF_REGLEMENT_ART_5 = {
  source: "REGLEMENT_UE",
  reference: "Règlement (UE) 2024/573, art. 5",
  urlLegifrance: "https://eur-lex.europa.eu/eli/reg/2024/573/oj/fra",
  note: "Contrôles d'étanchéité. Déclenchement à 5 t CO2e de gaz de l'annexe I ou 1 kg de gaz de l'annexe II section 1 ; dispense des équipements hermétiquement scellés étiquetés comme tels sous 10 t CO2e ou 2 kg. Abroge le règlement (UE) n° 517/2014 depuis le 11 mars 2024.",
} as const;

/** Dispense des équipements hermétiquement scellés — posée sur les huit obligations. */
const HORS_DISPENSE = {
  type: "equipement_propriete_infirmee",
  categorie: CATEGORIE,
  propriete: "estHermetiquementScelleSousSeuil",
} as const;

const SANS_DETECTION = {
  type: "equipement_propriete_infirmee",
  categorie: CATEGORIE,
  propriete: "aDetectionDeFuites",
} as const;

const AVEC_DETECTION = {
  type: "equipement_propriete_booleenne",
  categorie: CATEGORIE,
  propriete: "aDetectionDeFuites",
  valeur: true,
} as const;

const SOUS_50 = {
  type: "equipement_propriete_infirmee",
  categorie: CATEGORIE,
  propriete: "estChargeSuperieure50TCo2",
} as const;

const AU_DESSUS_50 = {
  type: "equipement_propriete_booleenne",
  categorie: CATEGORIE,
  propriete: "estChargeSuperieure50TCo2",
  valeur: true,
} as const;

const SOUS_500 = {
  type: "equipement_propriete_infirmee",
  categorie: CATEGORIE,
  propriete: "estChargeSuperieure500TCo2",
} as const;

const AU_DESSUS_500 = {
  type: "equipement_propriete_booleenne",
  categorie: CATEGORIE,
  propriete: "estChargeSuperieure500TCo2",
  valeur: true,
} as const;

export const obligationsFroid: Obligation[] = [
  {
    id: "froid-controle-etancheite-mise-en-service",
    domaine: "froid",
    libelle: "Contrôle d'étanchéité à la mise en service (installation frigorifique)",
    description:
      "Avant première mise en service, l'installation frigorifique fait l'objet d'un contrôle d'étanchéité du circuit de fluide frigorigène, réalisé par un opérateur titulaire de l'attestation de capacité. Le résultat est remis au détenteur de l'équipement.",
    referencesLegales: [REF_ENVIRONNEMENT_MISE_EN_SERVICE, REF_REGLEMENT_ART_5],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { travail: true, erp: true },
    categoriesEquipement: [CATEGORIE],
    conditions: [HORS_DISPENSE],
    notesInternes:
      "Aucune des valeurs de `Realisateur` ne dit « opérateur titulaire de l'attestation de capacité prévue à R. 543-99 » : `personne_qualifiee` est la plus proche, la description porte l'exigence de certification. À revoir si l'enum s'enrichit.",
  },
  {
    id: "froid-controle-etancheite-annuel",
    domaine: "froid",
    libelle: "Contrôle d'étanchéité annuel (installation frigorifique)",
    description:
      "L'installation frigorifique fait l'objet d'un contrôle d'étanchéité au moins tous les douze mois. Le contrôle porte sur l'ensemble du circuit de fluide frigorigène et sur les organes susceptibles de fuir (raccords, vannes, joints, échangeurs).",
    referencesLegales: [REF_REGLEMENT_ART_5, REF_ENVIRONNEMENT_RENOUVELLEMENT],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { travail: true, erp: true },
    categoriesEquipement: [CATEGORIE],
    conditions: [HORS_DISPENSE, SOUS_500, SOUS_50, SANS_DETECTION],
    notesInternes:
      "Obligation par défaut du domaine : c'est elle qui s'applique quand aucune des quatre questions n'a reçu de réponse, ce qui sera le cas le plus fréquent. Ses quatre conditions sont toutes de la forme `infirmee`, donc toutes satisfaites au silence. Palier « moins de 50 t CO2e (ou moins de 10 kg pour un fluide de l'annexe II section 1), sans système de détection des fuites » de l'article 5.",
  },
  {
    id: "froid-controle-etancheite-biennal-detection",
    domaine: "froid",
    libelle:
      "Contrôle d'étanchéité tous les deux ans (détection de fuites installée)",
    description:
      "Lorsque l'installation est équipée d'un système fixe de détection des fuites, l'intervalle entre deux contrôles d'étanchéité est porté à vingt-quatre mois.",
    referencesLegales: [REF_REGLEMENT_ART_5, REF_ENVIRONNEMENT_RENOUVELLEMENT],
    periodicite: "biennale",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { travail: true, erp: true },
    categoriesEquipement: [CATEGORIE],
    conditions: [HORS_DISPENSE, SOUS_500, SOUS_50, AVEC_DETECTION],
    notesInternes:
      "Condition stricte (`booleenne`) assumée sur une criticité 4 : l'obligation est neuve, aucun équipement en base ne peut la perdre, et `froid-controle-etancheite-annuel` couvre l'installation tant que la question de la détection n'a pas reçu « oui ». Allonger l'intervalle sur une réponse explicite est le sens même de l'article 5.",
  },
  {
    id: "froid-controle-etancheite-semestriel-50t",
    domaine: "froid",
    libelle:
      "Contrôle d'étanchéité semestriel (charge supérieure à 50 t CO2e)",
    description:
      "Au-delà de cinquante tonnes équivalent CO2 de fluide frigorigène — ou de dix kilogrammes pour un fluide insaturé de l'annexe II section 1 — le contrôle d'étanchéité a lieu au moins tous les six mois.",
    referencesLegales: [REF_REGLEMENT_ART_5, REF_ENVIRONNEMENT_RENOUVELLEMENT],
    periodicite: "semestrielle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { travail: true, erp: true },
    categoriesEquipement: [CATEGORIE],
    conditions: [HORS_DISPENSE, SOUS_500, AU_DESSUS_50, SANS_DETECTION],
    notesInternes:
      "Condition stricte (`booleenne`) assumée : obligation neuve, et la couverture par défaut reste assurée par `froid-controle-etancheite-annuel` tant que le palier n'a pas été confirmé. Le palier ne se déduit d'aucun autre champ — il est déclaré par le dirigeant, qui le lit sur le rapport de son frigoriste.",
  },
  {
    id: "froid-controle-etancheite-annuel-50t-detection",
    domaine: "froid",
    libelle:
      "Contrôle d'étanchéité annuel (charge supérieure à 50 t CO2e, détection de fuites)",
    description:
      "Au-delà de cinquante tonnes équivalent CO2, la présence d'un système fixe de détection des fuites porte l'intervalle entre deux contrôles d'étanchéité de six à douze mois.",
    referencesLegales: [REF_REGLEMENT_ART_5, REF_ENVIRONNEMENT_RENOUVELLEMENT],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { travail: true, erp: true },
    categoriesEquipement: [CATEGORIE],
    conditions: [HORS_DISPENSE, SOUS_500, AU_DESSUS_50, AVEC_DETECTION],
    notesInternes:
      "Même périodicité que `froid-controle-etancheite-annuel`, pour une raison différente : ici le palier de charge est franchi mais la détection de fuites double l'intervalle. Les deux obligations s'excluent par leurs conditions ; en garder deux plutôt qu'une seule permet au registre de dire pourquoi l'échéance tombe à douze mois. Condition stricte assumée, cf. les obligations voisines.",
  },
  {
    id: "froid-controle-etancheite-trimestriel-500t",
    domaine: "froid",
    libelle:
      "Contrôle d'étanchéité trimestriel (charge supérieure à 500 t CO2e)",
    description:
      "Au-delà de cinq cents tonnes équivalent CO2 de fluide frigorigène — ou de cent kilogrammes pour un fluide insaturé de l'annexe II section 1 — le contrôle d'étanchéité a lieu au moins tous les trois mois.",
    referencesLegales: [REF_REGLEMENT_ART_5, REF_ENVIRONNEMENT_RENOUVELLEMENT],
    periodicite: "trimestrielle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { travail: true, erp: true },
    categoriesEquipement: [CATEGORIE],
    conditions: [HORS_DISPENSE, AU_DESSUS_500, SANS_DETECTION],
    notesInternes:
      "Palier rare dans le périmètre TPE/PME — quelques centaines de kilogrammes de fluide — mais modélisé pour ne pas laisser une installation de ce type sur une périodicité fausse. Pas de condition sur `estChargeSuperieure50TCo2` : franchir 500 emporte 50, et les obligations des paliers inférieurs sont déjà écartées par leur condition `infirmee` sur `estChargeSuperieure500TCo2`.",
  },
  {
    id: "froid-controle-etancheite-semestriel-500t-detection",
    domaine: "froid",
    libelle:
      "Contrôle d'étanchéité semestriel (charge supérieure à 500 t CO2e, détection de fuites)",
    description:
      "Au-delà de cinq cents tonnes équivalent CO2, la présence d'un système fixe de détection des fuites porte l'intervalle entre deux contrôles d'étanchéité de trois à six mois.",
    referencesLegales: [REF_REGLEMENT_ART_5, REF_ENVIRONNEMENT_RENOUVELLEMENT],
    periodicite: "semestrielle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { travail: true, erp: true },
    categoriesEquipement: [CATEGORIE],
    conditions: [HORS_DISPENSE, AU_DESSUS_500, AVEC_DETECTION],
    notesInternes:
      "Même périodicité que `froid-controle-etancheite-semestriel-50t`, palier et motif différents. Condition stricte assumée, cf. les obligations voisines.",
  },
  {
    id: "froid-controle-etancheite-apres-modification",
    domaine: "froid",
    libelle: "Contrôle d'étanchéité après modification du circuit frigorifique",
    description:
      "Toute modification affectant le circuit frigorifique impose un nouveau contrôle d'étanchéité, indépendamment du calendrier périodique. Après réparation d'une fuite, le contrôle est refait sur l'installation remise en fonctionnement.",
    referencesLegales: [REF_ENVIRONNEMENT_RENOUVELLEMENT, REF_REGLEMENT_ART_5],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { travail: true, erp: true },
    categoriesEquipement: [CATEGORIE],
    conditions: [HORS_DISPENSE],
    notesInternes:
      "Événementiel — une occurrence par modification ou réparation. Traité comme `mise_en_service_uniquement` par le générateur de calendrier, comme `levage-remise-en-service-apres-reparation`. Les délais précis du contrôle après réparation (au plus tôt vingt-quatre heures de fonctionnement, au plus tard un mois) relèvent du règlement 2024/573 et ne sont pas modélisés en périodicité : le modèle n'a pas de forme pour un délai borné des deux côtés.",
  },
];
