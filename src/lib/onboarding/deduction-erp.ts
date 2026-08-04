import type {
  CategorieErp,
  TypeErp,
} from "@/lib/referentiels/types-communs";

/**
 * Logique déterministe (pure, testable) pour déduire le `typeErp` et la
 * `categorieErp` à partir des questions simples posées au dirigeant dans
 * l'assistant ludique.
 *
 * Seuils catégorie ERP — articles R. 143-1 et suivants du CCH, arrêté
 * du 25 juin 1980 et arrêté du 22 juin 1990 (règles PE) :
 *   - 1ʳᵉ catégorie : effectif public > 1500
 *   - 2ᵉ catégorie  : 701 à 1500
 *   - 3ᵉ catégorie  : 301 à 700
 *   - 4ᵉ catégorie  : seuil du type jusqu'à 300
 *   - 5ᵉ catégorie  : petits établissements sous le seuil de déclaration
 *
 * La 4ᵉ et la 5ᵉ se distinguent par un « seuil du type » (variable selon
 * l'activité). Pour un non-expert, on approxime : « moins de 300
 * personnes » → 5ᵉ (cas le plus fréquent en TPE). L'assistant prévoit
 * un mode avancé pour ceux qui connaissent leur catégorie exacte.
 */

/**
 * Grille des choix d'activité proposés au dirigeant. L'ordre compte pour
 * l'affichage : le plus fréquent en TPE d'abord.
 */
export const CHOIX_ACTIVITE_ERP = [
  {
    id: "resto",
    label: "Restaurant, bar, café",
    description: "Restauration, débit de boissons, brasserie.",
    typeErp: "N" as TypeErp,
  },
  {
    id: "commerce",
    label: "Commerce, boutique",
    description: "Magasin, supermarché, centre commercial.",
    typeErp: "M" as TypeErp,
  },
  {
    id: "bureau",
    label: "Bureau recevant du public",
    description: "Banque, agence, administration ouverte au public.",
    typeErp: "W" as TypeErp,
  },
  {
    id: "hotel",
    label: "Hôtel, hébergement",
    description: "Hôtel, pension, gîte ouvert au public.",
    typeErp: "O" as TypeErp,
  },
  {
    id: "soins",
    label: "Soins, santé",
    description: "Cabinet médical, clinique, institut.",
    typeErp: "U" as TypeErp,
  },
  {
    id: "enseignement",
    label: "Enseignement",
    description: "École, centre de formation, crèche.",
    typeErp: "R" as TypeErp,
  },
  {
    id: "spectacle",
    label: "Salle, spectacle, culte",
    description: "Salle de réunion, cinéma, théâtre, lieu de culte.",
    typeErp: "L" as TypeErp,
  },
  {
    id: "exposition",
    label: "Musée, exposition",
    description: "Galerie, salon, espace d'exposition.",
    typeErp: "T" as TypeErp,
  },
] as const;

export type ChoixActiviteId = (typeof CHOIX_ACTIVITE_ERP)[number]["id"];

/**
 * Tranches de capacité d'accueil simultanée → catégorie ERP.
 */
export const TRANCHES_EFFECTIF_PUBLIC = [
  {
    id: "moins-300",
    label: "Moins de 300 personnes",
    hint: "Le cas le plus fréquent en TPE.",
    categorieErp: "N5" as CategorieErp,
  },
  {
    id: "301-700",
    label: "301 à 700 personnes",
    hint: "3ᵉ catégorie — commission de sécurité plus exigeante.",
    categorieErp: "N3" as CategorieErp,
  },
  {
    id: "701-1500",
    label: "701 à 1500 personnes",
    hint: "2ᵉ catégorie — règles renforcées.",
    categorieErp: "N2" as CategorieErp,
  },
  {
    id: "plus-1500",
    label: "Plus de 1500 personnes",
    hint: "1ʳᵉ catégorie — règles les plus strictes.",
    categorieErp: "N1" as CategorieErp,
  },
] as const;

export type TrancheEffectifPublicId =
  (typeof TRANCHES_EFFECTIF_PUBLIC)[number]["id"];

/**
 * Déduit la catégorie ERP depuis un effectif public numérique.
 * Fonction de secours lorsque l'utilisateur saisit un chiffre libre
 * plutôt qu'une tranche.
 */
export function deduireCategorieErpDepuisEffectif(
  effectifPublic: number,
): CategorieErp {
  if (effectifPublic > 1500) return "N1";
  if (effectifPublic > 700) return "N2";
  if (effectifPublic > 300) return "N3";
  return "N5";
}

/**
 * Résout un ID de tranche en catégorie ERP.
 */
export function categorieErpDepuisTranche(
  id: TrancheEffectifPublicId,
): CategorieErp {
  const t = TRANCHES_EFFECTIF_PUBLIC.find((x) => x.id === id);
  if (!t) throw new Error(`Tranche inconnue : ${id}`);
  return t.categorieErp;
}

/**
 * Résout un ID d'activité en type ERP.
 */
export function typeErpDepuisChoix(id: ChoixActiviteId): TypeErp {
  const c = CHOIX_ACTIVITE_ERP.find((x) => x.id === id);
  if (!c) throw new Error(`Activité inconnue : ${id}`);
  return c.typeErp;
}

/**
 * Grille des classes IGH avec libellés lisibles pour le dirigeant.
 * Cas très rare en TPE — pour les quelques cas où un TPE gère un
 * immeuble de grande hauteur, on affiche la grille mais avec une aide
 * claire « rare chez vous ».
 */
export const CHOIX_CLASSES_IGH = [
  { id: "GHW", label: "Bureaux", description: "Tour de bureaux." },
  { id: "GHA", label: "Habitation", description: "Immeuble de logement." },
  { id: "GHO", label: "Hôtel", description: "Tour hôtelière." },
  { id: "GHR", label: "Enseignement", description: "Établissement scolaire." },
  { id: "GHS", label: "Archives", description: "Centre d'archives." },
  { id: "GHU", label: "Sanitaire", description: "Hôpital, clinique." },
  { id: "GHZ", label: "Mixte", description: "Plusieurs activités." },
  {
    id: "ITGH",
    label: "Très grande hauteur",
    description: "Immeuble > 200 m.",
  },
] as const;
