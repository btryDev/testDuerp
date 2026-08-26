// Rendre une réponse de fiche telle qu'elle doit se lire.
//
// Toutes les réponses sont stockées en chaîne, y compris les dates et les
// nombres (`lib/registre/schema.ts`) : ces valeurs s'impriment, elles ne se
// calculent jamais. La seule qui ne se lise pas telle quelle est la date,
// rangée en clé de jour civil « AAAA-MM-JJ » (ADR-011) — sans quoi le
// registre s'afficherait à moitié en format ISO.
//
// Une seule fonction pour le tableau du journal et pour la fiche en lecture :
// une même réponse ne doit pas se formater différemment selon l'écran.

import type { ChampFiche } from "./champs";
import { depuisCleJourCivil, formaterDateCourteFr } from "@/lib/dates";

/** Ce qu'on écrit à la place d'une réponse absente. */
export const NON_RENSEIGNE = "—";

export function afficherValeur(
  valeur: string | null | undefined,
  champ: ChampFiche,
): string {
  if (valeur === null || valeur === undefined || valeur.trim() === "") {
    return NON_RENSEIGNE;
  }
  if (champ.type !== "date") return valeur;
  try {
    return formaterDateCourteFr(depuisCleJourCivil(valeur));
  } catch {
    // Une clé illisible s'affiche brute plutôt que d'être escamotée : mieux
    // vaut une valeur étrange à l'écran qu'une case vide, qui ferait croire
    // à une absence de réponse.
    return valeur;
  }
}

/** L'horodatage de saisie d'une ligne — distinct de la date de l'événement. */
export function afficherSaisieLe(iso: string): string | null {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : formaterDateCourteFr(d);
}
