// Ce qui empêche de passer à l'étape suivante du parcours de création.
//
// Ces règles vivaient en closures inline dans `ETAPES`, à l'intérieur d'un
// composant client. Aucun test ne les atteignait : la revue du 2026-08-28 l'a
// montré en remplaçant `status === "format_invalide"` par `status !== "ok"`
// — le verrou sectoriel réapparaissait, la suite restait verte. Le
// `superRefine` du schéma Zod tombait bien sur la même mutation, mais un
// dirigeant bloqué à l'étape 1 n'atteint jamais la server action : c'est ici
// que la porte se ferme réellement.
//
// Sorties du composant, elles se vérifient. Le shell n'a plus qu'à les
// appeler.
//
// Module **pur** : ni Prisma, ni React.

import { evaluerScopeSecteur } from "@/lib/onboarding/scope";
import type { OnboardingState } from "./types";

/**
 * Étape 1 — identité et lieu. Rend le message à afficher, ou `null`.
 *
 * Le contrôle de format du code NAF passe par `evaluerScopeSecteur` et par
 * elle seule. Il était écrit **deux fois** : un motif recopié en ligne, puis
 * l'appel — et le second ne pouvait jamais se déclencher, puisqu'il applique
 * le même motif. Deux écritures d'une même règle ne peuvent pas se
 * contredire par un test, elles divergent en silence ; et un garde qui ne
 * garde rien se lit pourtant comme une garantie.
 *
 * Ce qui NE bloque plus : l'absence de référentiel sectoriel. Barrer ici
 * privait l'établissement de tout le référentiel de conformité — qui ne lit
 * jamais le code NAF — pour une cotation de risques qu'il n'avait pas
 * demandée. L'absence se dit à l'écran (`StepIdentite`), puis en permanence
 * sur le dossier (`perimetre/couverture.ts`, axe `secteur_duerp`).
 */
export function validerIdentite(s: OnboardingState): string | null {
  if (s.raisonSociale.trim().length === 0)
    return "Indiquez la raison sociale pour continuer.";
  if (s.adresseRue.trim().length < 3) return "Indiquez le numéro et la rue.";
  if (!/^\d{5}$/.test(s.adresseCodePostal.trim()))
    return "Le code postal doit faire 5 chiffres.";
  if (s.adresseVille.trim().length < 2) return "Indiquez la ville.";
  if (s.codeNaf.trim().length === 0) return "Indiquez le code NAF.";
  if (evaluerScopeSecteur(s.codeNaf).status === "format_invalide")
    return "Le code NAF doit ressembler à 56.10A.";
  const n = Number(s.effectifSurSite);
  if (!Number.isInteger(n) || n < 1)
    return "Indiquez un effectif (au moins 1).";
  return null;
}

/** Étape 2 — les régimes (ADR-004). */
export function validerTypologie(s: OnboardingState): string | null {
  if (!s.estEtablissementTravail && !s.estERP && !s.estIGH && !s.estHabitation)
    return "Cochez au moins un régime (travail, ERP, IGH ou habitation).";
  if (s.estERP && !s.typeErp) return "Précisez votre activité ERP.";
  if (s.estERP && !s.categorieErp) return "Précisez votre capacité d'accueil.";
  if (s.estIGH && !s.classeIgh) return "Précisez la classe IGH.";
  // La famille d'habitation, requise depuis le 2026-09-01 (ADR-025 § 4) :
  // neuf obligations portent la typologie habitation et certaines ne visent
  // qu'une partie des familles. Sans elle, elles s'appliquent toutes à tout
  // le monde.
  if (s.estHabitation && !s.familleHabitation)
    return "Précisez la famille de l'immeuble d'habitation.";
  return null;
}

/** Étape 3 — le résumé ne valide rien : c'est la server action qui tranche. */
export function validerResume(): string | null {
  return null;
}
