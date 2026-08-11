import type {
  CategorieErp,
  TypeErp,
} from "@/lib/referentiels/types-communs";

/**
 * Logique déterministe (pure, testable) pour déduire le `typeErp` et la
 * `categorieErp` à partir des questions simples posées au dirigeant dans
 * l'assistant.
 *
 * ── Ce que le texte permet de déduire, et ce qu'il ne permet pas ──────────
 *
 * L'article R. 143-19 du CCH (ex R. 123-19) classe les ERP d'après l'effectif
 * du public et du personnel :
 *   - 1ʳᵉ catégorie : au-dessus de 1500 personnes
 *   - 2ᵉ catégorie  : de 701 à 1500
 *   - 3ᵉ catégorie  : de 301 à 700
 *   - 4ᵉ catégorie  : 300 personnes et au-dessous, **à l'exception** des
 *     établissements relevant de la 5ᵉ catégorie
 *   - 5ᵉ catégorie  : établissements dans lesquels l'effectif du public
 *     n'atteint pas le chiffre minimal fixé, **pour chaque type
 *     d'exploitation**, par le règlement de sécurité (arrêté du 25 juin 1980 ;
 *     règles PE de l'arrêté du 22 juin 1990 pour cette 5ᵉ catégorie)
 *
 * Les quatre premières bornes sont donc universelles et déductibles. La
 * frontière 4ᵉ / 5ᵉ, elle, **ne l'est pas** : elle dépend d'un seuil propre au
 * type d'ERP (et, pour plusieurs types, du niveau — sous-sol, étages, total).
 * Aucun seuil universel de 300 ne sépare la 4ᵉ de la 5ᵉ.
 *
 * ── Conséquence sur le code (amendement 2026-08) ─────────────────────────
 *
 * L'ancienne version approximait « moins de 300 → 5ᵉ catégorie », et ne
 * produisait donc **jamais** de 4ᵉ catégorie. L'approximation n'était pas
 * neutre : un restaurant de 250 personnes classé à tort en 5ᵉ recevait la
 * vérification électrique quinquennale (`elec-erp-cat5-quinquennale`) au lieu
 * de la vérification ANNUELLE par organisme agréé de criticité 5
 * (`elec-erp-cat1-4-annuelle`), et perdait la vérification triennale du SSI.
 * Un faux négatif silencieux sur une obligation vitale.
 *
 * La table des seuils du second groupe par type d'ERP n'est pas encodée ici :
 * chaque chiffre devrait être relu sur Légifrance et cité avec son article
 * exact, ce qui n'a pas été fait (CLAUDE.md — ne jamais inventer une référence
 * réglementaire). Tant que ce travail de sourçage n'est pas mené, le code ne
 * tranche pas à la place du dirigeant : sous 300 personnes, la catégorie est
 * **demandée**, la 4ᵉ figure explicitement dans les choix, et toute déduction
 * automatique est présentée comme une proposition modifiable.
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
 * Bornes du premier groupe, telles qu'écrites à l'article R. 143-19 du CCH.
 * Exposées pour que l'UI et les tests parlent des mêmes chiffres.
 */
export const SEUIL_1RE_CATEGORIE = 1500;
export const SEUIL_2E_CATEGORIE = 700;
export const SEUIL_3E_CATEGORIE = 300;

/**
 * Tranches de capacité d'accueil simultanée proposées au dirigeant.
 *
 * La bande « 300 personnes et au-dessous » donne lieu à **deux** choix, 4ᵉ et
 * 5ᵉ catégorie, parce qu'aucun effectif ne permet de trancher entre les deux
 * (cf. en-tête de fichier). La question est posée en termes vérifiables par un
 * non-expert — ce qui figure sur l'arrêté d'ouverture ou le procès-verbal de la
 * commission de sécurité — plutôt qu'en termes de seuils réglementaires.
 */
export const TRANCHES_EFFECTIF_PUBLIC = [
  {
    id: "moins-300-5e",
    label: "300 personnes ou moins — 5ᵉ catégorie",
    hint: "Le cas le plus fréquent en TPE. Petit établissement, sous le seuil fixé pour votre type d'activité par le règlement de sécurité.",
    categorieErp: "N5" as CategorieErp,
  },
  {
    id: "moins-300-4e",
    label: "300 personnes ou moins — 4ᵉ catégorie",
    hint: "À choisir si votre arrêté d'ouverture ou le PV de la commission de sécurité indique « 4ᵉ catégorie ». Entraîne la vérification électrique annuelle par organisme agréé.",
    categorieErp: "N4" as CategorieErp,
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
 * Résultat d'une déduction de catégorie ERP à partir d'un effectif.
 *
 * Deux états, jamais confondus :
 *   - `proposee` : les bornes de R. 143-19 tranchent. La valeur reste une
 *     **proposition** que l'UI doit afficher comme modifiable — l'effectif
 *     saisi par le dirigeant est une estimation, pas une donnée certifiée.
 *   - `a_confirmer` : l'effectif est dans la bande « 300 et au-dessous », où la
 *     frontière 4ᵉ / 5ᵉ dépend du type d'ERP. Le code ne choisit pas : il rend
 *     les deux catégories possibles et la question à poser.
 */
export type DeductionCategorieErp =
  | {
      statut: "proposee";
      categorieErp: CategorieErp;
      /** Explication affichable, déterministe. */
      motif: string;
      /** Message d'avertissement si l'effectif frôle une borne. */
      avertissement?: string;
    }
  | {
      statut: "a_confirmer";
      categoriesPossibles: readonly CategorieErp[];
      motif: string;
      question: string;
    };

/**
 * Marge de proximité d'une borne, en pourcentage de la borne.
 *
 * Ce n'est pas une règle de droit mais un garde-fou d'interface : un effectif
 * annoncé « environ 700 » peut basculer d'une catégorie à l'autre, et une
 * erreur de catégorie change la nature des vérifications électriques. On
 * préfère poser la question. Valeur fixe pour rester déterministe.
 */
export const MARGE_PROXIMITE_SEUIL = 0.1;

/**
 * Renvoie un avertissement lorsque l'effectif est à moins de
 * `MARGE_PROXIMITE_SEUIL` d'une borne du premier groupe, sinon `undefined`.
 */
export function avertissementProximiteSeuil(
  effectif: number,
): string | undefined {
  for (const borne of [
    SEUIL_3E_CATEGORIE,
    SEUIL_2E_CATEGORIE,
    SEUIL_1RE_CATEGORIE,
  ]) {
    if (Math.abs(effectif - borne) <= borne * MARGE_PROXIMITE_SEUIL) {
      return `Effectif proche de la limite des ${borne} personnes : au-dessus, la catégorie change et les vérifications avec elle. Vérifiez la catégorie indiquée sur votre arrêté d'ouverture ou sur le PV de la commission de sécurité.`;
    }
  }
  return undefined;
}

/**
 * Déduit ce qui est déductible d'un effectif (public + personnel) et signale
 * explicitement ce qui ne l'est pas. Fonction de secours lorsque l'utilisateur
 * saisit un chiffre libre plutôt que de choisir une tranche.
 */
export function deduireCategorieErp(effectif: number): DeductionCategorieErp {
  if (effectif > SEUIL_1RE_CATEGORIE) {
    return {
      statut: "proposee",
      categorieErp: "N1",
      motif: `Plus de ${SEUIL_1RE_CATEGORIE} personnes : 1ʳᵉ catégorie (CCH, art. R. 143-19).`,
      avertissement: avertissementProximiteSeuil(effectif),
    };
  }
  if (effectif > SEUIL_2E_CATEGORIE) {
    return {
      statut: "proposee",
      categorieErp: "N2",
      motif: `De ${SEUIL_2E_CATEGORIE + 1} à ${SEUIL_1RE_CATEGORIE} personnes : 2ᵉ catégorie (CCH, art. R. 143-19).`,
      avertissement: avertissementProximiteSeuil(effectif),
    };
  }
  if (effectif > SEUIL_3E_CATEGORIE) {
    return {
      statut: "proposee",
      categorieErp: "N3",
      motif: `De ${SEUIL_3E_CATEGORIE + 1} à ${SEUIL_2E_CATEGORIE} personnes : 3ᵉ catégorie (CCH, art. R. 143-19).`,
      avertissement: avertissementProximiteSeuil(effectif),
    };
  }
  return {
    statut: "a_confirmer",
    categoriesPossibles: ["N4", "N5"],
    motif: `${SEUIL_3E_CATEGORIE} personnes ou moins : l'établissement relève de la 4ᵉ ou de la 5ᵉ catégorie. La limite entre les deux dépend d'un seuil propre à votre type d'activité, fixé par le règlement de sécurité — l'effectif seul ne permet pas de trancher.`,
    question:
      "Votre arrêté d'ouverture ou le PV de la commission de sécurité indique-t-il « 4ᵉ catégorie » ou « 5ᵉ catégorie » ?",
  };
}

/**
 * Variante à valeur simple : renvoie la catégorie quand elle est déductible,
 * et `null` quand la question doit être posée (bande « 300 et au-dessous »).
 *
 * Le `null` est volontaire : renvoyer « N5 » par défaut est précisément le
 * bug corrigé en 2026-08. Aucun appelant ne doit substituer une valeur par
 * défaut à ce `null` — la catégorie doit venir d'une réponse du dirigeant.
 */
export function deduireCategorieErpDepuisEffectif(
  effectifPublic: number,
): CategorieErp | null {
  const d = deduireCategorieErp(effectifPublic);
  return d.statut === "proposee" ? d.categorieErp : null;
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
