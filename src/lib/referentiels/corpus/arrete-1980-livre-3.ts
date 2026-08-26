// Arrêté du 25 juin 1980, Livre III — établissements de 5e catégorie.
//
// Premier corpus dépouillé de bout en bout, le 26 août 2026. C'est le corpus
// qui gouverne 100 % de la base d'utilisateurs : tous les établissements sont
// des ERP de 5e catégorie.
//
// Le résultat tient en une phrase : sur 58 articles, UN SEUL crée une
// obligation périodique pour un établissement des secteurs couverts — PE 4.
// Hors hôtels, le Livre III ne fixe aucune autre fréquence chiffrée à un
// exploitant de restaurant, de commerce ou de bureau. Toute ligne de calendrier
// que le produit porte pour ces secteurs vient donc d'ailleurs — PE 4, le Code
// du travail — et doit le dire.
//
// Deux articles portent le statut `obligation_manquante` : PE 4 et PE 27. Ce
// n'est pas un défaut du dépouillement, c'est son produit.

import type { Corpus } from "./types";

export const CORPUS_PE: Corpus = {
  id: "arrete-1980-livre-3",
  intitule:
    "Arrêté du 25 juin 1980, Livre III — Dispositions applicables aux établissements de 5e catégorie",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020374770/",
  etendue: "integral",
  portee:
    "Règles PE, PO, PU et PX. Gouverne tous les ERP du deuxième groupe, donc l'intégralité de la base d'utilisateurs du produit.",
  articles: [
  {
    ref: "PE 1",
    intitule: "Objet. - Textes applicables",
    versionEnVigueur: "1990-08-27",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "sans_objet",
    motif:
      "Article de champ d'application : il énonce que le Livre III complète le Livre Ier, vise le deuxième groupe (GN 1 § 2 a) et écarte le Livre II sauf renvoi exprès. Il n'impose rien à l'exploitant, mais c'est lui qui commande le classement de tout le reste du corpus.",
  },
  {
    ref: "PE 2",
    intitule: "Etablissements assujettis",
    versionEnVigueur: "2026-01-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "sans_objet",
    motif:
      "Définit les seuils d'assujettissement et réduit, au § 3, le régime des établissements sans locaux à sommeil recevant au plus 19 personnes aux seuls PE 4, PE 10 B, PE 24 § 1, PE 26 § 1 et PE 27. Aucune obligation propre, mais PE 4 y figure : aucune TPE n'échappe au triennal.",
  },
  {
    ref: "PE 3",
    intitule: "Calcul de l'effectif",
    versionEnVigueur: "1990-08-27",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "sans_objet",
    motif:
      "Méthode de calcul de l'effectif théorique du public. Aucune action récurrente.",
  },
  {
    ref: "PE 4",
    intitule: "Vérifications techniques",
    versionEnVigueur: "2026-07-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "obligation_manquante",
    motif:
      "Impose DEUX obligations périodiques que le référentiel ne porte pas : au § 2, l'entretien et la vérification de l'ensemble des installations techniques « tous les trois ans au plus » par des techniciens compétents, pour tous les établissements ; au § 1, un contrat annuel d'entretien du système de détection incendie, restreint aux établissements avec locaux à sommeil. Version réécrite par l'arrêté du 1er décembre 2025.",
    bloquePar:
      "Porteur d'échéance. Trois obligations CITENT PE 4 § 2 — `elec-erp-cat5-quinquennale`, `cuisson-gaz-installations-triennale`, et les notes de `incendie-erp-ria-annuelle` — mais chacune accroche un fragment à une catégorie d'équipement : installations électriques, appareils de cuisson, moyens de secours. Citer l'article n'est pas porter l'obligation. Le texte vise « l'ensemble des installations et des équipements techniques de son établissement », pris comme un tout, avec une liste ouverte (« etc. »). Un ERP de 5e catégorie qui n'a déclaré aucun équipement de ces catégories ne reçoit AUCUNE ligne triennale, alors que PE 2 § 3 maintient PE 4 jusqu'aux établissements de moins de vingt personnes. La décomposition par domaine reproduit exactement le faux négatif que le porteur « établissement » doit corriger — elle le masque au lieu de le révéler. Repassé de « retenu » à « obligation manquante » le 2026-08-26, sur signalement.",
  },
  {
    ref: "PE 5",
    intitule: "Structures, patios et puits de lumière",
    versionEnVigueur: "1997-04-10",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "hors_perimetre",
    exclusion: "construction",
  },
  {
    ref: "PE 6",
    intitule: "Isolement. - Parc de stationnement",
    versionEnVigueur: "2006-07-08",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "hors_perimetre",
    exclusion: "construction",
  },
  {
    ref: "PE 7",
    intitule: "Accès des secours",
    versionEnVigueur: "2026-01-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "hors_perimetre",
    exclusion: "construction",
  },
  {
    ref: "PE 8",
    intitule: "Enfouissement",
    versionEnVigueur: "1990-08-27",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "sans_objet",
    motif:
      "Article de pur renvoi aux articles CO 39 § 1 et CO 40. Ne prescrit rien en propre.",
  },
  {
    ref: "PE 9",
    intitule: "Locaux présentant des risques particuliers",
    versionEnVigueur: "2026-01-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "hors_perimetre",
    exclusion: "construction",
  },
  {
    ref: "PE 10",
    intitule: "Stockage d'hydrocarbures (A) et installations de gaz combustibles (B)",
    versionEnVigueur: "2026-07-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "sans_objet",
    motif:
      "Fixe les conditions de stockage des hydrocarbures et la conformité des installations de gaz, avec vérification à la construction ou après travaux — pas de récurrence. Le triennal des installations de gaz vient de PE 4 § 2. Attention : « PE 10 B » désigne une subdivision, pas un article distinct.",
  },
  {
    ref: "PE 11",
    intitule: "Dégagements",
    versionEnVigueur: "2004-07-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "sans_objet",
    motif:
      "Règles d'évacuation et obligation permanente de non-encombrement des dégagements. Permanente et non datée : ne se traduit pas en échéance.",
  },
  {
    ref: "PE 12",
    intitule: "Conduits et gaines",
    versionEnVigueur: "1990-08-27",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "hors_perimetre",
    exclusion: "construction",
  },
  {
    ref: "PE 13",
    intitule: "Comportement au feu des matériaux",
    versionEnVigueur: "2010-06-16",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "hors_perimetre",
    exclusion: "construction",
  },
  {
    ref: "PE 14",
    intitule: "Évacuation des fumées",
    versionEnVigueur: "2004-07-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "sans_objet",
    motif:
      "Impose l'existence et la manœuvrabilité des dispositifs de désenfumage, sans essai ni vérification récurrente. Le désenfumage figure en revanche dans la liste triennale de PE 4 § 2.",
  },
  {
    ref: "PE 15",
    intitule: "Règles d'installation et dispositions générales (cuisson)",
    versionEnVigueur: "2006-03-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "hors_perimetre",
    exclusion: "construction",
  },
  {
    ref: "PE 16",
    intitule: "Grandes cuisines",
    versionEnVigueur: "2008-08-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "sans_objet",
    motif:
      "Caractéristiques constructives des grandes cuisines et du circuit d'extraction. Exige que les éléments de rétention des graisses « puissent être facilement nettoyés », sans aucune fréquence : le nettoyage périodique des circuits d'extraction ne vient pas d'ici mais de PE 4 § 2.",
  },
  {
    ref: "PE 17",
    intitule: "Office de remise en température",
    versionEnVigueur: "2006-03-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "hors_perimetre",
    exclusion: "construction",
  },
  {
    ref: "PE 18",
    intitule: "Îlots de cuisson installés dans les salles",
    versionEnVigueur: "2008-08-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "sans_objet",
    motif:
      "Conditions d'exploitation d'un îlot de cuisson, dont la présence de personnel pendant le fonctionnement — obligation continue, pas une échéance.",
  },
  {
    ref: "PE 19",
    intitule: "Appareils installés dans les locaux accessibles ou non au public",
    versionEnVigueur: "2006-03-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "hors_perimetre",
    exclusion: "construction",
  },
  {
    ref: "PE 20",
    intitule: "Généralités (chauffage, ventilation)",
    versionEnVigueur: "2004-05-22",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "sans_objet",
    motif:
      "Article d'articulation renvoyant au Livre II pour les installations admises en 4e catégorie. Ne prescrit rien en propre.",
  },
  {
    ref: "PE 21",
    intitule: "Installations d'appareils à combustion",
    versionEnVigueur: "2026-01-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "hors_perimetre",
    exclusion: "construction",
  },
  {
    ref: "PE 22",
    intitule: "Circuits aérauliques",
    versionEnVigueur: "2025-08-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "hors_perimetre",
    exclusion: "construction",
  },
  {
    ref: "PE 23",
    intitule: "Installation de ventilation mécanique contrôlée",
    versionEnVigueur: "2025-08-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "hors_perimetre",
    exclusion: "construction",
  },
  {
    ref: "PE 24",
    intitule: "Installations électriques, éclairage",
    versionEnVigueur: "2024-05-24",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "sans_objet",
    motif:
      "Impose des installations prévenant les risques d'incendie (NF C 15-100 réputée satisfaisante) et un éclairage de sécurité d'évacuation. Aucune périodicité : la vérification périodique de l'électricité vient de PE 4 § 2 côté ERP et du Code du travail côté employeur.",
  },
  {
    ref: "PE 25",
    intitule: "Règles générales (ascenseurs)",
    versionEnVigueur: "2023-08-25",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "hors_perimetre",
    exclusion: "construction",
  },
  {
    ref: "PE 26",
    intitule: "Moyens de secours",
    versionEnVigueur: "2008-10-08",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "sans_objet",
    motif:
      "Impose au moins un extincteur portatif installé selon MS 39, un appareil pour 300 m² et un par niveau. C'est une règle de dotation et de dimensionnement, sans récurrence. Point décisif du dépouillement : PE 26 n'ouvre le Livre II que sur MS 39, qui n'est pas un article de vérification.",
  },
  {
    ref: "PE 27",
    intitule: "Alarme, alerte, consignes",
    versionEnVigueur: "2026-05-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "obligation_manquante",
    motif:
      "Impose au § 5 que « le personnel doit être instruit sur les conduites à tenir en cas d'incendie et être entraîné à la manœuvre des moyens de secours », sans périodicité écrite, pour tous les ERP de 5e catégorie. Le référentiel ne porte aucune ligne de formation du personnel côté ERP. Le § 4 c précise que l'information « peut être complétée par des exercices périodiques d'évacuation » — facultatif, à ne pas confondre avec R. 4227-39. N'ouvre le Livre II que sur MS 70. Réécrit par l'arrêté du 4 février 2026.",
    bloquePar:
      "Porteur d'échéance : l'obligation naît de l'établissement, pas d'un équipement. `categoriesEquipement` est requis et `Verification.equipementId` n'est pas nullable.",
  },
  {
    ref: "PE 28",
    intitule: "Structure et planchers coupe-feu",
    versionEnVigueur: "1990-08-27",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre III — établissements de 5ᵉ catégorie comportant des locaux réservés au sommeil. Ce sont des ERP du deuxième groupe comme les autres : rien dans le texte ne les met hors de portée du produit. Ce qui manque est chez nous — l'attribut « locaux à sommeil » n'existe pas en base, alors que quatre articles du Livre III s'y adossent (PE 4 § 1, PE 28, PE 32, PE 37). C'est un manque de couverture assumé, pas une non-question.",
    declareA:
      "Non déclaré à ce jour. Le bandeau de couverture annonce la catégorie d'ERP, pas les locaux à sommeil.",
  },
  {
    ref: "PE 29",
    intitule: "Cloisons et portes des locaux réservés au sommeil",
    versionEnVigueur: "1990-08-27",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre III — établissements de 5ᵉ catégorie comportant des locaux réservés au sommeil. Ce sont des ERP du deuxième groupe comme les autres : rien dans le texte ne les met hors de portée du produit. Ce qui manque est chez nous — l'attribut « locaux à sommeil » n'existe pas en base, alors que quatre articles du Livre III s'y adossent (PE 4 § 1, PE 28, PE 32, PE 37). C'est un manque de couverture assumé, pas une non-question.",
    declareA:
      "Non déclaré à ce jour. Le bandeau de couverture annonce la catégorie d'ERP, pas les locaux à sommeil.",
  },
  {
    ref: "PE 30",
    intitule: "Couloirs",
    versionEnVigueur: "2002-04-07",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre III — établissements de 5ᵉ catégorie comportant des locaux réservés au sommeil. Ce sont des ERP du deuxième groupe comme les autres : rien dans le texte ne les met hors de portée du produit. Ce qui manque est chez nous — l'attribut « locaux à sommeil » n'existe pas en base, alors que quatre articles du Livre III s'y adossent (PE 4 § 1, PE 28, PE 32, PE 37). C'est un manque de couverture assumé, pas une non-question.",
    declareA:
      "Non déclaré à ce jour. Le bandeau de couverture annonce la catégorie d'ERP, pas les locaux à sommeil.",
  },
  {
    ref: "PE 31",
    intitule: "Cheminées à foyer ouvert",
    versionEnVigueur: "1990-08-27",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre III — établissements de 5ᵉ catégorie comportant des locaux réservés au sommeil. Ce sont des ERP du deuxième groupe comme les autres : rien dans le texte ne les met hors de portée du produit. Ce qui manque est chez nous — l'attribut « locaux à sommeil » n'existe pas en base, alors que quatre articles du Livre III s'y adossent (PE 4 § 1, PE 28, PE 32, PE 37). C'est un manque de couverture assumé, pas une non-question.",
    declareA:
      "Non déclaré à ce jour. Le bandeau de couverture annonce la catégorie d'ERP, pas les locaux à sommeil.",
  },
  {
    ref: "PE 32",
    intitule: "Détection automatique d'incendie et système d'alarme",
    versionEnVigueur: "2011-10-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre III — établissements de 5ᵉ catégorie comportant des locaux réservés au sommeil. Ce sont des ERP du deuxième groupe comme les autres : rien dans le texte ne les met hors de portée du produit. Ce qui manque est chez nous — l'attribut « locaux à sommeil » n'existe pas en base, alors que quatre articles du Livre III s'y adossent (PE 4 § 1, PE 28, PE 32, PE 37). C'est un manque de couverture assumé, pas une non-question.",
    declareA:
      "Non déclaré à ce jour. Le bandeau de couverture annonce la catégorie d'ERP, pas les locaux à sommeil.",
  },
  {
    ref: "PE 33",
    intitule: "Registre de sécurité, consignes",
    versionEnVigueur: "2011-11-04",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre III — établissements de 5ᵉ catégorie comportant des locaux réservés au sommeil. Ce sont des ERP du deuxième groupe comme les autres : rien dans le texte ne les met hors de portée du produit. Ce qui manque est chez nous — l'attribut « locaux à sommeil » n'existe pas en base, alors que quatre articles du Livre III s'y adossent (PE 4 § 1, PE 28, PE 32, PE 37). C'est un manque de couverture assumé, pas une non-question.",
    declareA:
      "Non déclaré à ce jour. Le bandeau de couverture annonce la catégorie d'ERP, pas les locaux à sommeil.",
  },
  {
    ref: "PE 34",
    intitule: "Signalisations",
    versionEnVigueur: "2003-05-07",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre III — établissements de 5ᵉ catégorie comportant des locaux réservés au sommeil. Ce sont des ERP du deuxième groupe comme les autres : rien dans le texte ne les met hors de portée du produit. Ce qui manque est chez nous — l'attribut « locaux à sommeil » n'existe pas en base, alors que quatre articles du Livre III s'y adossent (PE 4 § 1, PE 28, PE 32, PE 37). C'est un manque de couverture assumé, pas une non-question.",
    declareA:
      "Non déclaré à ce jour. Le bandeau de couverture annonce la catégorie d'ERP, pas les locaux à sommeil.",
  },
  {
    ref: "PE 35",
    intitule: "Affichages",
    versionEnVigueur: "1990-08-27",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre III — établissements de 5ᵉ catégorie comportant des locaux réservés au sommeil. Ce sont des ERP du deuxième groupe comme les autres : rien dans le texte ne les met hors de portée du produit. Ce qui manque est chez nous — l'attribut « locaux à sommeil » n'existe pas en base, alors que quatre articles du Livre III s'y adossent (PE 4 § 1, PE 28, PE 32, PE 37). C'est un manque de couverture assumé, pas une non-question.",
    declareA:
      "Non déclaré à ce jour. Le bandeau de couverture annonce la catégorie d'ERP, pas les locaux à sommeil.",
  },
  {
    ref: "PE 36",
    intitule: "Éclairage de sécurité",
    versionEnVigueur: "2010-05-16",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre III — établissements de 5ᵉ catégorie comportant des locaux réservés au sommeil. Ce sont des ERP du deuxième groupe comme les autres : rien dans le texte ne les met hors de portée du produit. Ce qui manque est chez nous — l'attribut « locaux à sommeil » n'existe pas en base, alors que quatre articles du Livre III s'y adossent (PE 4 § 1, PE 28, PE 32, PE 37). C'est un manque de couverture assumé, pas une non-question.",
    declareA:
      "Non déclaré à ce jour. Le bandeau de couverture annonce la catégorie d'ERP, pas les locaux à sommeil.",
  },
  {
    ref: "PE 37",
    intitule:
      "Contrôle des établissements de 5ᵉ catégorie comportant des locaux à sommeil",
    versionEnVigueur: "2004-11-24",
    luLe: "2026-08-26",
    lecture: "premiere_main",
    statut: "obligation_manquante",
    motif:
      "« Ces établissements doivent être visités tous les cinq ans par la commission de sécurité compétente ; la fréquence de ces visites peut être augmentée, s\'il est jugé nécessaire, par arrêté du maire ou du préfet, après avis de la commission. » C\'est le SEUL article du Livre III qui fixe une périodicité de visite de commission, et il infirme l\'affirmation contraire portée quelques heures plus tôt sur `incendie-erp-5-visite-commission`. Il ne vise cependant que les établissements comportant, pour le public, des locaux à sommeil — distinction qu\'aucun attribut d\'établissement ne porte aujourd\'hui : ni colonne en base, ni question d\'onboarding. Poser la quinquennale sur tous les ERP de 5ᵉ catégorie sur-appliquerait à la boutique et au bureau. L\'obligation existe donc, elle est fondée, et il manque l\'attribut qui la déclencherait.",
    bloquePar: "attribut-locaux-a-sommeil",
  },
  {
    ref: "PO 1",
    intitule: "Généralités",
    versionEnVigueur: "2018-01-01",
    luLe: "2026-08-26",
    lecture: "premiere_main",
    statut: "retenu",
    obligations: ["incendie-hotel-po-controle-annuel-electricite"],
    citationCle:
      "« § 3. L'ensemble des installations techniques doit être contrôlé par un technicien compétent tous les deux ans, à l'exception des installations électriques et des systèmes de détection incendie qui doivent être contrôlés annuellement. Le contrôle des ascenseurs relève des dispositions particulières précisées dans le cadre de l'article AS 9 du règlement. »",
    prescrit:
      "Chapitre IV — hôtels (type O) de 5ᵉ catégorie. Trois rythmes : biennal sur l'ensemble des installations techniques, annuel sur les installations électriques et les systèmes de détection incendie, renvoi à AS 9 pour les ascenseurs. Le volet électrique est porté depuis le 2026-08-26 : il comblait un vrai trou, `elec-erp-cat1-4-annuelle` s'arrêtant aux quatre premières catégories. Le volet détection est déjà couvert par `incendie-erp-ssi-annuelle`, qui vaut pour tous les ERP. Le volet biennal est déclaré à part. Lu en première main le 2026-08-26.",
  },
  {
    ref: "PO 1 § 3 — contrôle biennal des installations techniques",
    intitule: "Le volet biennal, qui porte sur « l'ensemble »",
    versionEnVigueur: "2018-01-01",
    luLe: "2026-08-26",
    lecture: "premiere_main",
    statut: "obligation_manquante",
    motif:
      "« L'ensemble des installations techniques doit être contrôlé par un technicien compétent tous les deux ans. » Le référentiel ne sait pas porter « l'ensemble » : une obligation s'accroche à des catégories d'équipement énumérées, et énumérer reviendrait à décider à la place du texte ce qu'est une installation technique d'hôtel. Deux catégories plausibles — VMC et installation frigorifique — portent déjà une obligation BIENNALE valant pour tous les ERP : une ligne supplémentaire y ferait doublon. Cinquième occurrence du motif PE 4 § 2. Les ascenseurs sont explicitement exclus par le renvoi à AS 9.",
      bloquePar: "porteur-d-echeance-hors-equipement",
  },
  {
    ref: "PO 7",
    intitule: "Instruction et entraînement du personnel, deux fois par an",
    versionEnVigueur: "2018-01-01",
    luLe: "2026-08-26",
    lecture: "premiere_main",
    statut: "obligation_manquante",
    motif:
      "« Le personnel doit participer deux fois par an à des séances d'instruction et d'entraînement de façon compatible avec les conditions d'exploitation, compte tenu, le cas échéant, de son rythme saisonnier. » Périodicité chiffrée, donc encodable — mais l'obligation ne porte sur AUCUN équipement, et toute obligation du référentiel s'accroche aujourd'hui à une catégorie d'équipement. C'est le même blocage que PE 27 § 5 et R. 4544-11-1. Verbatim relevé en première main le 2026-08-26.",
      bloquePar: "porteur-d-echeance-hors-equipement",
  },
  {
    ref: "PO 2",
    intitule: "Halls et escaliers",
    versionEnVigueur: "2011-10-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre IV — règles spécifiques aux hôtels (type O), établissements de 5ᵉ catégorie. PO 1 § 3 et PO 7 portent les seules périodicités chiffrées du Livre III pour un exploitant : contrôle biennal des installations techniques, annuel pour l'électricité et la détection, et deux séances d'instruction du personnel par an. Un très petit hôtel est exactement le genre de TPE que le produit sait servir par ailleurs — le manque est un choix, pas une impossibilité.",
    declareA:
      "Non déclaré à ce jour. Un exploitant hôtelier ne verra rien qui l'avertisse que ces trois obligations lui manquent.",
  },
  {
    ref: "PO 3",
    intitule: "Système d'alarme",
    versionEnVigueur: "2011-10-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre IV — règles spécifiques aux hôtels (type O), établissements de 5ᵉ catégorie. PO 1 § 3 et PO 7 portent les seules périodicités chiffrées du Livre III pour un exploitant : contrôle biennal des installations techniques, annuel pour l'électricité et la détection, et deux séances d'instruction du personnel par an. Un très petit hôtel est exactement le genre de TPE que le produit sait servir par ailleurs — le manque est un choix, pas une impossibilité.",
    declareA:
      "Non déclaré à ce jour. Un exploitant hôtelier ne verra rien qui l'avertisse que ces trois obligations lui manquent.",
  },
  {
    ref: "PO 4",
    intitule: "Portes",
    versionEnVigueur: "2011-10-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre IV — règles spécifiques aux hôtels (type O), établissements de 5ᵉ catégorie. PO 1 § 3 et PO 7 portent les seules périodicités chiffrées du Livre III pour un exploitant : contrôle biennal des installations techniques, annuel pour l'électricité et la détection, et deux séances d'instruction du personnel par an. Un très petit hôtel est exactement le genre de TPE que le produit sait servir par ailleurs — le manque est un choix, pas une impossibilité.",
    declareA:
      "Non déclaré à ce jour. Un exploitant hôtelier ne verra rien qui l'avertisse que ces trois obligations lui manquent.",
  },
  {
    ref: "PO 5",
    intitule: "Utilisation du gaz dans les chambres",
    versionEnVigueur: "2011-10-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre IV — règles spécifiques aux hôtels (type O), établissements de 5ᵉ catégorie. PO 1 § 3 et PO 7 portent les seules périodicités chiffrées du Livre III pour un exploitant : contrôle biennal des installations techniques, annuel pour l'électricité et la détection, et deux séances d'instruction du personnel par an. Un très petit hôtel est exactement le genre de TPE que le produit sait servir par ailleurs — le manque est un choix, pas une impossibilité.",
    declareA:
      "Non déclaré à ce jour. Un exploitant hôtelier ne verra rien qui l'avertisse que ces trois obligations lui manquent.",
  },
  {
    ref: "PO 6",
    intitule: "Détection automatique d'incendie",
    versionEnVigueur: "2011-10-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre IV — règles spécifiques aux hôtels (type O), établissements de 5ᵉ catégorie. PO 1 § 3 et PO 7 portent les seules périodicités chiffrées du Livre III pour un exploitant : contrôle biennal des installations techniques, annuel pour l'électricité et la détection, et deux séances d'instruction du personnel par an. Un très petit hôtel est exactement le genre de TPE que le produit sait servir par ailleurs — le manque est un choix, pas une impossibilité.",
    declareA:
      "Non déclaré à ce jour. Un exploitant hôtelier ne verra rien qui l'avertisse que ces trois obligations lui manquent.",
  },
  {
    ref: "PO 8",
    intitule: "Généralités (établissements existants)",
    versionEnVigueur: "2011-10-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre IV — règles spécifiques aux hôtels (type O), établissements de 5ᵉ catégorie. PO 1 § 3 et PO 7 portent les seules périodicités chiffrées du Livre III pour un exploitant : contrôle biennal des installations techniques, annuel pour l'électricité et la détection, et deux séances d'instruction du personnel par an. Un très petit hôtel est exactement le genre de TPE que le produit sait servir par ailleurs — le manque est un choix, pas une impossibilité.",
    declareA:
      "Non déclaré à ce jour. Un exploitant hôtelier ne verra rien qui l'avertisse que ces trois obligations lui manquent.",
  },
  {
    ref: "PO 9",
    intitule: "Escaliers",
    versionEnVigueur: "2011-10-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre IV — règles spécifiques aux hôtels (type O), établissements de 5ᵉ catégorie. PO 1 § 3 et PO 7 portent les seules périodicités chiffrées du Livre III pour un exploitant : contrôle biennal des installations techniques, annuel pour l'électricité et la détection, et deux séances d'instruction du personnel par an. Un très petit hôtel est exactement le genre de TPE que le produit sait servir par ailleurs — le manque est un choix, pas une impossibilité.",
    declareA:
      "Non déclaré à ce jour. Un exploitant hôtelier ne verra rien qui l'avertisse que ces trois obligations lui manquent.",
  },
  {
    ref: "PO 10",
    intitule: "Isolement des locaux dangereux",
    versionEnVigueur: "2011-10-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre IV — règles spécifiques aux hôtels (type O), établissements de 5ᵉ catégorie. PO 1 § 3 et PO 7 portent les seules périodicités chiffrées du Livre III pour un exploitant : contrôle biennal des installations techniques, annuel pour l'électricité et la détection, et deux séances d'instruction du personnel par an. Un très petit hôtel est exactement le genre de TPE que le produit sait servir par ailleurs — le manque est un choix, pas une impossibilité.",
    declareA:
      "Non déclaré à ce jour. Un exploitant hôtelier ne verra rien qui l'avertisse que ces trois obligations lui manquent.",
  },
  {
    ref: "PO 11",
    intitule: "Consignes - Signalisations - Affichages",
    versionEnVigueur: "2011-10-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre IV — règles spécifiques aux hôtels (type O), établissements de 5ᵉ catégorie. PO 1 § 3 et PO 7 portent les seules périodicités chiffrées du Livre III pour un exploitant : contrôle biennal des installations techniques, annuel pour l'électricité et la détection, et deux séances d'instruction du personnel par an. Un très petit hôtel est exactement le genre de TPE que le produit sait servir par ailleurs — le manque est un choix, pas une impossibilité.",
    declareA:
      "Non déclaré à ce jour. Un exploitant hôtelier ne verra rien qui l'avertisse que ces trois obligations lui manquent.",
  },
  {
    ref: "PO 12",
    intitule: "Formation du personnel en sécurité incendie",
    versionEnVigueur: "2011-10-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre IV — règles spécifiques aux hôtels (type O), établissements de 5ᵉ catégorie. PO 1 § 3 et PO 7 portent les seules périodicités chiffrées du Livre III pour un exploitant : contrôle biennal des installations techniques, annuel pour l'électricité et la détection, et deux séances d'instruction du personnel par an. Un très petit hôtel est exactement le genre de TPE que le produit sait servir par ailleurs — le manque est un choix, pas une impossibilité.",
    declareA:
      "Non déclaré à ce jour. Un exploitant hôtelier ne verra rien qui l'avertisse que ces trois obligations lui manquent.",
  },
  {
    ref: "PO 13",
    intitule: "Cas particulier des très petits hôtels existants",
    versionEnVigueur: "2011-10-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre IV — règles spécifiques aux hôtels (type O), établissements de 5ᵉ catégorie. PO 1 § 3 et PO 7 portent les seules périodicités chiffrées du Livre III pour un exploitant : contrôle biennal des installations techniques, annuel pour l'électricité et la détection, et deux séances d'instruction du personnel par an. Un très petit hôtel est exactement le genre de TPE que le produit sait servir par ailleurs — le manque est un choix, pas une impossibilité.",
    declareA:
      "Non déclaré à ce jour. Un exploitant hôtelier ne verra rien qui l'avertisse que ces trois obligations lui manquent.",
  },
  {
    ref: "Annexe à l'article PO 11",
    intitule: "Conduite à tenir en cas d'incendie",
    versionEnVigueur: "2011-10-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre IV — règles spécifiques aux hôtels (type O), établissements de 5ᵉ catégorie. PO 1 § 3 et PO 7 portent les seules périodicités chiffrées du Livre III pour un exploitant : contrôle biennal des installations techniques, annuel pour l'électricité et la détection, et deux séances d'instruction du personnel par an. Un très petit hôtel est exactement le genre de TPE que le produit sait servir par ailleurs — le manque est un choix, pas une impossibilité.",
    declareA:
      "Non déclaré à ce jour. Un exploitant hôtelier ne verra rien qui l'avertisse que ces trois obligations lui manquent.",
  },
  {
    ref: "PU 1",
    intitule: "Généralités",
    versionEnVigueur: "2005-04-22",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre V — petits établissements de soins (type U). Ces articles n'imposent aucune échéance récurrente à l'exploitant : ce sont des règles de construction et d'équipement, plus un renvoi aux articles U 51 à U 64 sur les gaz médicaux, qui n'a pas été dépouillé. Le manque de couverture porte donc surtout sur ce renvoi.",
    declareA:
      "Non déclaré à ce jour.",
  },
  {
    ref: "PU 2",
    intitule: "Structures",
    versionEnVigueur: "2005-04-22",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre V — petits établissements de soins (type U). Ces articles n'imposent aucune échéance récurrente à l'exploitant : ce sont des règles de construction et d'équipement, plus un renvoi aux articles U 51 à U 64 sur les gaz médicaux, qui n'a pas été dépouillé. Le manque de couverture porte donc surtout sur ce renvoi.",
    declareA:
      "Non déclaré à ce jour.",
  },
  {
    ref: "PU 3",
    intitule: "Escaliers",
    versionEnVigueur: "2005-04-22",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre V — petits établissements de soins (type U). Ces articles n'imposent aucune échéance récurrente à l'exploitant : ce sont des règles de construction et d'équipement, plus un renvoi aux articles U 51 à U 64 sur les gaz médicaux, qui n'a pas été dépouillé. Le manque de couverture porte donc surtout sur ce renvoi.",
    declareA:
      "Non déclaré à ce jour.",
  },
  {
    ref: "PU 4",
    intitule: "Fonctionnement des portes",
    versionEnVigueur: "2005-04-22",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre V — petits établissements de soins (type U). Ces articles n'imposent aucune échéance récurrente à l'exploitant : ce sont des règles de construction et d'équipement, plus un renvoi aux articles U 51 à U 64 sur les gaz médicaux, qui n'a pas été dépouillé. Le manque de couverture porte donc surtout sur ce renvoi.",
    declareA:
      "Non déclaré à ce jour.",
  },
  {
    ref: "PU 5",
    intitule: "Conditions d'installation des gaz médicaux",
    versionEnVigueur: "2005-04-22",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre V — petits établissements de soins (type U). Ces articles n'imposent aucune échéance récurrente à l'exploitant : ce sont des règles de construction et d'équipement, plus un renvoi aux articles U 51 à U 64 sur les gaz médicaux, qui n'a pas été dépouillé. Le manque de couverture porte donc surtout sur ce renvoi.",
    declareA:
      "Non déclaré à ce jour.",
  },
  {
    ref: "PU 6",
    intitule: "Détection automatique d'incendie et système d'alarme",
    versionEnVigueur: "2005-04-22",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre V — petits établissements de soins (type U). Ces articles n'imposent aucune échéance récurrente à l'exploitant : ce sont des règles de construction et d'équipement, plus un renvoi aux articles U 51 à U 64 sur les gaz médicaux, qui n'a pas été dépouillé. Le manque de couverture porte donc surtout sur ce renvoi.",
    declareA:
      "Non déclaré à ce jour.",
  },
  {
    ref: "PX 1",
    intitule: "Établissements sportifs — dispositions applicables",
    versionEnVigueur: "2001-03-20",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "non_couvert",
    motif:
      "Chapitre VI — établissements sportifs. Article de pur renvoi qui importe tout le chapitre XII du Livre II, non dépouillé. Les équipements sportifs figurent par ailleurs parmi les risques spécialisés que le produit déclare ne pas traiter.",
    declareA:
      "Non déclaré à ce jour.",
  },
  ],
};
