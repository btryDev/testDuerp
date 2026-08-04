/**
 * Moteur de recommandations pour le tableau de bord (étape 9).
 *
 * Renvoie jusqu'à 5 actions à faire, triées par urgence réelle. Fonction
 * pure, pas d'accès DB, pas d'horloge implicite (horloge injectable).
 *
 * Règles de priorité :
 *   1. Vérifications dépassées (statut = depassee) — la plus ancienne d'abord
 *   2. Actions correctives en retard (echeance < now, statut ∈ {ouverte, en_cours})
 *   3. Vérifications à venir sous 7 jours
 *   4. Actions à venir sous 15 jours
 *   5. DUERP à mettre à jour (> 11 mois sans nouvelle version)
 *
 * Toutes les catégories contribuent à la liste ; le tri par priorité +
 * date (tie-breaker) fait remonter les items les plus urgents. Le total
 * est tronqué à 5 (paramétrable).
 */

export type Recommandation = {
  kind:
    | "verif_depassee"
    | "action_en_retard"
    | "verif_proche"
    | "action_proche"
    | "duerp_a_jour";
  titre: string;
  sousTitre?: string;
  href: string;
  /** Priorité numérique pour le tri (plus bas = plus urgent). */
  priorite: number;
  /** Date pertinente (datePrevue, echeance, ou lastMaj) pour l'affichage. */
  date?: Date;
};

export type EntreeRecos = {
  verifications: Array<{
    id: string;
    statut: "a_planifier" | "planifiee" | "depassee" | string;
    datePrevue: Date;
    libelleObligation: string;
    equipementLibelle: string;
  }>;
  actions: Array<{
    id: string;
    statut: "ouverte" | "en_cours" | "levee" | "abandonnee" | string;
    echeance: Date | null;
    libelle: string;
  }>;
  duerpAgeJours?: number; // âge de la dernière version validée
  etablissementId: string;
  /** DUERPs actifs : pour le lien "mettre à jour". */
  duerpId?: string;
};

const JOUR_MS = 1000 * 60 * 60 * 24;

export type OptionsRecommandations = {
  /** Horloge injectable pour tests. */
  now?: Date;
  /** Limite totale d'items retournés (défaut 5). */
  limite?: number;
};

export function genererRecommandations(
  e: EntreeRecos,
  options: OptionsRecommandations = {},
): Recommandation[] {
  const now = options.now ?? new Date();
  const limite = options.limite ?? 5;
  const nowMs = now.getTime();

  const etab = e.etablissementId;
  const acc: Recommandation[] = [];

  // 1. Vérifications dépassées
  for (const v of e.verifications) {
    const depassee =
      v.statut === "depassee" ||
      (v.statut === "a_planifier" && v.datePrevue.getTime() <= nowMs);
    if (!depassee) continue;
    acc.push({
      kind: "verif_depassee",
      titre: v.libelleObligation,
      sousTitre: `${v.equipementLibelle} — échéance dépassée`,
      href: `/etablissements/${etab}/verifications/${v.id}`,
      priorite: 1,
      date: v.datePrevue,
    });
  }

  // 2. Actions en retard
  for (const a of e.actions) {
    if (a.statut !== "ouverte" && a.statut !== "en_cours") continue;
    if (a.echeance === null || a.echeance.getTime() >= nowMs) continue;
    acc.push({
      kind: "action_en_retard",
      titre: a.libelle,
      sousTitre: "Action corrective en retard",
      href: `/etablissements/${etab}/actions/${a.id}`,
      priorite: 2,
      date: a.echeance,
    });
  }

  // 3. Vérifications à venir sous 7 jours
  const horizon7j = nowMs + 7 * JOUR_MS;
  for (const v of e.verifications) {
    if (v.statut !== "planifiee") continue;
    if (v.datePrevue.getTime() < nowMs || v.datePrevue.getTime() > horizon7j)
      continue;
    acc.push({
      kind: "verif_proche",
      titre: v.libelleObligation,
      sousTitre: `${v.equipementLibelle} — dans les 7 jours`,
      href: `/etablissements/${etab}/verifications/${v.id}`,
      priorite: 3,
      date: v.datePrevue,
    });
  }

  // 4. Actions à venir sous 15 jours
  const horizon15j = nowMs + 15 * JOUR_MS;
  for (const a of e.actions) {
    if (a.statut !== "ouverte" && a.statut !== "en_cours") continue;
    if (a.echeance === null) continue;
    if (a.echeance.getTime() < nowMs || a.echeance.getTime() > horizon15j)
      continue;
    acc.push({
      kind: "action_proche",
      titre: a.libelle,
      sousTitre: "Action à réaliser sous 15 jours",
      href: `/etablissements/${etab}/actions/${a.id}`,
      priorite: 4,
      date: a.echeance,
    });
  }

  // 5. DUERP à mettre à jour (> 11 mois)
  if (e.duerpAgeJours !== undefined && e.duerpAgeJours > 330 && e.duerpId) {
    acc.push({
      kind: "duerp_a_jour",
      titre: "DUERP à mettre à jour",
      sousTitre: `Dernière version il y a ${Math.round(e.duerpAgeJours / 30)} mois`,
      href: `/duerp/${e.duerpId}`,
      priorite: 5,
    });
  }

  // Tri stable par priorité, puis par date
  acc.sort((a, b) => {
    if (a.priorite !== b.priorite) return a.priorite - b.priorite;
    const da = a.date?.getTime() ?? Infinity;
    const db = b.date?.getTime() ?? Infinity;
    return da - db;
  });

  return acc.slice(0, limite);
}
