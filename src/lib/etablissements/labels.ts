import type { CATEGORIES_ERP, TYPE_ERP } from "./schema";

/**
 * Les libellés lisibles des types et catégories d'ERP.
 *
 * Ils vivaient dans `components/etablissements/EtablissementForm.tsx`, où
 * l'onboarding ne pouvait pas les lire. Depuis que le parcours de création ne
 * déduit plus le type mais le fait **déclarer** (ADR-025 § 2, décision du
 * 2026-09-01), les deux écrans posent exactement la même question et doivent
 * la poser avec les mêmes mots : deux listes recopiées finissent par diverger,
 * et c'est alors le dirigeant qui lit deux fois autre chose.
 *
 * Les `Record` sont exhaustifs par construction : ajouter un type à l'enum
 * sans lui écrire de libellé ne compile pas.
 */

/**
 * **Vingt et un types, et le règlement en compte vingt-deux.** Le type J —
 * structures d'accueil pour personnes âgées et personnes handicapées, ajouté
 * au règlement de sécurité par l'arrêté du 19 novembre 2001 — n'est pas dans
 * `TYPE_ERP`, donc pas ici.
 *
 * Le relevé est fait, la décision ne l'est pas : ouvrir le type J ferait
 * entrer les EHPAD et les structures médico-sociales, dont les obligations
 * (locaux à sommeil, personnel de nuit, désenfumage) ne sont pas servies par
 * le référentiel et qui sortent des trois secteurs cibles. C'est un choix de
 * périmètre, pas un oubli de saisie — et il se tranche ailleurs qu'en
 * ajoutant une ligne à ce `Record`.
 *
 * En attendant, l'écran le DIT (`StepTypologie`) au lieu de promettre « le
 * vôtre y figure », ce qui était faux pour un exploitant de type J : il
 * cherchait sa ligne, ne la trouvait pas, et n'apprenait rien.
 */
export const LABEL_TYPE_ERP: Record<(typeof TYPE_ERP)[number], string> = {
  M: "M · Magasin de vente, centre commercial",
  N: "N · Restaurant, débit de boissons",
  O: "O · Hôtel, pension de famille",
  L: "L · Salle de spectacle, conférence",
  P: "P · Salle de danse, salle de jeux",
  R: "R · Établissement d'enseignement, colonies",
  S: "S · Bibliothèque, centre de documentation",
  T: "T · Salle d'exposition",
  U: "U · Établissement de soins",
  V: "V · Établissement de culte",
  W: "W · Administration, banque, bureau",
  X: "X · Établissement sportif couvert",
  Y: "Y · Musée",
  PA: "PA · Établissement de plein air",
  CTS: "CTS · Chapiteau, tente, structure",
  SG: "SG · Structure gonflable",
  PS: "PS · Parc de stationnement couvert",
  REF: "REF · Refuge de montagne",
  GA: "GA · Gare accessible au public",
  OA: "OA · Hôtel-restaurant d'altitude",
  EF: "EF · Établissement flottant",
};

/**
 * Les seuils entre parenthèses comptent le **public admis**, jamais les
 * salariés. C'est ce qui a tranché le périmètre du produit le 2026-09-01 :
 * un restaurant de huit salariés qui sert trois cents couverts relève de la
 * 3ᵉ catégorie et reste dans la cible, alors que la borne de l'outil est de
 * cinquante travailleurs. Les deux chiffres ne parlent pas de la même chose.
 */
export const LABEL_CATEGORIE_ERP: Record<
  (typeof CATEGORIES_ERP)[number],
  string
> = {
  N1: "1ʳᵉ catégorie (> 1500 personnes)",
  N2: "2ᵉ catégorie (701 à 1500)",
  N3: "3ᵉ catégorie (301 à 700)",
  N4: "4ᵉ catégorie (jusqu'à 300, seuil du type)",
  N5: "5ᵉ catégorie (petits établissements, règles PE)",
};
