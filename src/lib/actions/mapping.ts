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

export type StatutActionV2 = "ouverte" | "en_cours" | "levee" | "abandonnee";
export type StatutMesureUI = "existante" | "prevue";

export function statutActionVersUI(statut: StatutActionV2): StatutMesureUI {
  return statut === "levee" ? "existante" : "prevue";
}

export function statutUIVersAction(
  statut: StatutMesureUI,
  echeance: Date | null | undefined,
  now: Date = new Date(),
): StatutActionV2 {
  if (statut === "existante") return "levee";
  if (echeance && echeance.getTime() < now.getTime()) return "en_cours";
  return "ouverte";
}

export function actionVersMesureUI<T extends { statut: StatutActionV2 }>(
  a: T,
): Omit<T, "statut"> & { statut: StatutMesureUI } {
  return { ...a, statut: statutActionVersUI(a.statut) };
}
