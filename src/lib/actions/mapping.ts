/**
 * Mapping réciproque entre le vocabulaire `Action` (modèle V2, ADR-002) et
 * le vocabulaire historique `Mesure` tel qu'affiché dans le wizard DUERP.
 *
 * Règles :
 *   - "levee" ↔ "existante" (mesure en place)
 *   - autres ("ouverte" / "en_cours" / "abandonnee") → "prevue"
 *
 * Ces helpers sont purs. Ils vivent séparés des server actions pour rester
 * importables depuis les composants clients et les tests sans déclencher
 * l'erreur Next.js « Server Actions must be async functions ».
 */

import { estEnRetard } from "@/lib/dates/retard";

export type StatutActionV2 = "ouverte" | "en_cours" | "levee" | "abandonnee";
export type StatutMesureUI = "existante" | "prevue";

export function statutActionVersUI(statut: StatutActionV2): StatutMesureUI {
  return statut === "levee" ? "existante" : "prevue";
}

/**
 * Statut initial d'une mesure saisie au wizard.
 *
 * Une mesure « prévue » dont l'échéance est **déjà passée** naît
 * directement `en_cours` : elle ne peut plus être simplement « à faire ».
 * Le passage se juge au jour civil de Paris, par le prédicat canonique
 * (ADR-011) — une mesure datée d'aujourd'hui reste `ouverte` toute la
 * journée. La comparaison d'horodatage qui vivait ici la basculait
 * `en_cours` dès 02:00 le matin même de son échéance, alors que
 * l'échéance est stockée à minuit UTC.
 *
 * `now` garde une valeur par défaut : les appelants actuels
 * (`src/lib/actions/actions.ts`) capturent leur horloge plus haut mais ne
 * l'injectent pas encore. C'est une commodité de transition, pas une
 * autorisation de lire l'horloge dans une règle métier.
 */
export function statutUIVersAction(
  statut: StatutMesureUI,
  echeance: Date | null | undefined,
  now: Date = new Date(),
): StatutActionV2 {
  if (statut === "existante") return "levee";
  if (echeance && estEnRetard(echeance, now)) return "en_cours";
  return "ouverte";
}

export function actionVersMesureUI<T extends { statut: StatutActionV2 }>(
  a: T,
): Omit<T, "statut"> & { statut: StatutMesureUI } {
  return { ...a, statut: statutActionVersUI(a.statut) };
}
