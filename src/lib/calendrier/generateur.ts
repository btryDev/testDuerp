/**
 * Générateur du calendrier de vérifications (étape 6).
 *
 * Fonction pure qui, à partir de la liste d'obligations applicables
 * (sortie du moteur de matching) et des vérifications déjà réalisées
 * pour cet établissement, produit la **prochaine occurrence** de
 * vérification pour chaque couple (obligation, équipement déclencheur).
 *
 * Règles (cf. spec/PLAN.md étape 6) :
 *   1. Une occurrence par couple (obligationId, equipementId).
 *   2. Si la périodicité est `mise_en_service_uniquement` :
 *        - pas de dernière vérif connue → 1 occurrence à planifier maintenant
 *        - dernière vérif connue          → pas de nouvelle occurrence (one-shot)
 *   3. Si la périodicité est `autre` → aucune occurrence (obligation permanente
 *      sans échéance périodique, ex. tenue du registre de sécurité).
 *   4. Si pas de dernière vérif connue → datePrevue = `now`, statut = `a_planifier`.
 *   5. Si dernière vérif connue → datePrevue = `dateRealisee + periodicite`,
 *      statut = `planifiee` si datePrevue ≥ now, `depassee` sinon.
 *
 * Le statut Prisma `a_planifier` couvre deux réalités UI :
 *   - "à planifier d'urgence" (aucune vérif connue)   → priorité haute
 *   - "à planifier normalement"
 * La distinction est faite par le champ `estUrgent` du résultat, pas par
 * un enum en base — pour ne pas polluer l'enum Prisma avec de l'UI.
 */

import {
  PERIODICITE_EN_JOURS,
  type Periodicite,
  type Realisateur,
} from "@/lib/referentiels/types-communs";
import type { ObligationApplicable } from "@/lib/matching";

export type StatutVerificationGen =
  | "a_planifier"
  | "planifiee"
  | "depassee";

export type VerificationGenere = {
  /** Clé stable (obligationId::equipementId) pour l'upsert en base. */
  cleUnique: string;
  obligationId: string;
  libelleObligation: string;
  equipementId: string;
  periodicite: Periodicite;
  realisateurRequis: Realisateur[];
  datePrevue: Date;
  statut: StatutVerificationGen;
  /**
   * true si aucune vérification passée n'est connue — déclenche un signal
   * UI "à planifier d'urgence" sans créer d'enum supplémentaire en base.
   */
  estUrgent: boolean;
  /** Criticité issue de l'obligation (1-5). Sert au tri par priorité. */
  criticiteObligation: 1 | 2 | 3 | 4 | 5;
  /** Raisons textuelles du matching — copiées du résultat du moteur. */
  raisons: string[];
};

export type VerificationsPrecedentes = Map<string, Date>;

export type OptionsGenerateur = {
  /** Horloge injectable pour les tests. Défaut = `new Date()`. */
  now?: Date;
};

function ajouterJours(d: Date, jours: number): Date {
  const out = new Date(d.getTime());
  out.setDate(out.getDate() + jours);
  return out;
}

function prochaineDate(
  derniere: Date,
  periodicite: Periodicite,
): Date | null {
  const jours = PERIODICITE_EN_JOURS[periodicite];
  if (jours === null) return null;
  return ajouterJours(derniere, jours);
}

/**
 * Génère la prochaine occurrence de vérification pour chaque couple
 * (obligation applicable × équipement déclencheur).
 */
export function genererProchainesVerifications(
  obligations: ObligationApplicable[],
  verificationsPrecedentes: VerificationsPrecedentes = new Map(),
  options: OptionsGenerateur = {},
): VerificationGenere[] {
  const now = options.now ?? new Date();
  const out: VerificationGenere[] = [];

  for (const oa of obligations) {
    const o = oa.obligation;

    // Périodicité `autre` → pas d'échéance (obligations permanentes).
    if (o.periodicite === "autre") continue;

    for (const eq of oa.equipementsConcernes) {
      const cleUnique = `${o.id}::${eq.id}`;
      const derniere = verificationsPrecedentes.get(cleUnique);

      // One-shot : mise en service uniquement.
      if (o.periodicite === "mise_en_service_uniquement") {
        if (derniere) continue; // déjà réalisé, pas de nouvelle occurrence
        out.push({
          cleUnique,
          obligationId: o.id,
          libelleObligation: o.libelle,
          equipementId: eq.id,
          periodicite: o.periodicite,
          realisateurRequis: o.realisateurs,
          datePrevue: now,
          statut: "a_planifier",
          estUrgent: true,
          criticiteObligation: o.criticite,
          raisons: oa.raisons,
        });
        continue;
      }

      if (derniere) {
        const prochaine = prochaineDate(derniere, o.periodicite);
        if (!prochaine) continue;
        const estDepassee = prochaine.getTime() < now.getTime();
        out.push({
          cleUnique,
          obligationId: o.id,
          libelleObligation: o.libelle,
          equipementId: eq.id,
          periodicite: o.periodicite,
          realisateurRequis: o.realisateurs,
          datePrevue: prochaine,
          statut: estDepassee ? "depassee" : "planifiee",
          estUrgent: estDepassee,
          criticiteObligation: o.criticite,
          raisons: oa.raisons,
        });
      } else {
        // Aucune vérif précédente connue → urgence.
        out.push({
          cleUnique,
          obligationId: o.id,
          libelleObligation: o.libelle,
          equipementId: eq.id,
          periodicite: o.periodicite,
          realisateurRequis: o.realisateurs,
          datePrevue: now,
          statut: "a_planifier",
          estUrgent: true,
          criticiteObligation: o.criticite,
          raisons: oa.raisons,
        });
      }
    }
  }

  return out;
}

/**
 * Comparateur pour le tri du calendrier : les vérifications urgentes
 * (dépassées ou à planifier) d'abord, puis par date prévue croissante,
 * puis par criticité décroissante en cas d'égalité.
 */
export function comparerParUrgence(
  a: VerificationGenere,
  b: VerificationGenere,
): number {
  // 1. Urgence (urgent avant non-urgent)
  if (a.estUrgent !== b.estUrgent) return a.estUrgent ? -1 : 1;
  // 2. Date prévue croissante
  const da = a.datePrevue.getTime();
  const db = b.datePrevue.getTime();
  if (da !== db) return da - db;
  // 3. Criticité décroissante
  return b.criticiteObligation - a.criticiteObligation;
}
