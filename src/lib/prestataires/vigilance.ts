import type { Prestataire } from "@prisma/client";

/**
 * Calcul de l'état de vigilance d'un prestataire au regard des obligations
 * du donneur d'ordre (art. L8222-1 et D8222-5 CT).
 *
 * Jalons réglementaires :
 * - Attestation URSSAF : à renouveler **tous les 6 mois** pour tout contrat
 *   ≥ 5 000 € HT (art. D8222-5 1°).
 * - RC Pro et immatriculation (Kbis) : à tenir à jour (pas de périodicité
 *   légale unique, mais la RC est contractuellement annuelle chez tout
 *   assureur).
 *
 * On n'impose pas de date-cible pour le Kbis — c'est informatif.
 */

export const SEUIL_ALERTE_JOURS = 30;

export type StatutPiece =
  | "a_jour"
  | "expire_bientot"
  | "expiree"
  | "manquante";

export type VigilanceSnapshot = {
  urssaf: StatutPiece;
  urssafExpireDans: number | null; // jours, négatif = expiré
  rcPro: StatutPiece;
  rcProExpireDans: number | null;
  kbis: "present" | "absent";
  alertesOuvertes: number; // count de pieces != a_jour (hors kbis absent seul)
};

function statutParDate(date: Date | null, seuilJours: number): {
  statut: StatutPiece;
  joursRestants: number | null;
} {
  if (!date) return { statut: "manquante", joursRestants: null };
  const now = Date.now();
  const deltaMs = date.getTime() - now;
  const jours = Math.floor(deltaMs / (1000 * 60 * 60 * 24));
  if (jours < 0) return { statut: "expiree", joursRestants: jours };
  if (jours <= seuilJours) return { statut: "expire_bientot", joursRestants: jours };
  return { statut: "a_jour", joursRestants: jours };
}

export function computeVigilance(prestataire: Prestataire): VigilanceSnapshot {
  const u = statutParDate(
    prestataire.attestationUrssafValableJusquA,
    SEUIL_ALERTE_JOURS,
  );
  const r = statutParDate(
    prestataire.assuranceRcProValableJusquA,
    SEUIL_ALERTE_JOURS,
  );
  const kbis: "present" | "absent" = prestataire.kbisCle ? "present" : "absent";

  const alertesOuvertes =
    (u.statut === "a_jour" ? 0 : 1) + (r.statut === "a_jour" ? 0 : 1);

  return {
    urssaf: u.statut,
    urssafExpireDans: u.joursRestants,
    rcPro: r.statut,
    rcProExpireDans: r.joursRestants,
    kbis,
    alertesOuvertes,
  };
}

export function messageExpiration(jours: number | null): string {
  if (jours === null) return "Non renseignée";
  if (jours < 0) return `Expirée il y a ${Math.abs(jours)} j`;
  if (jours === 0) return "Expire aujourd'hui";
  if (jours === 1) return "Expire demain";
  if (jours <= 30) return `Expire dans ${jours} j`;
  return `Valide ${jours} j de plus`;
}
