/**
 * Moteur de matching équipements ↔ obligations (étape 5, spec/PLAN.md).
 *
 * Entrée :
 *   - un `Etablissement` (typologie + effectif)
 *   - la liste de ses `Equipement`s déclarés
 *   - optionnellement une liste d'obligations (injection pour les tests)
 *
 * Sortie :
 *   - la liste des obligations applicables, avec pour chacune les
 *     équipements qui les déclenchent et les raisons textuelles
 *     (« mode explain »).
 *
 * Règles (doc : `docs/regles-matching.md`) :
 *   1. La typologie de l'obligation doit matcher l'établissement — les
 *      régimes positifs (travail/ERP/IGH/habitation) en OU entre eux, les
 *      exclusions (`false`) et l'effectif en ET (amendement 2026-08).
 *   2. Au moins un équipement de l'établissement doit avoir sa catégorie
 *      dans `obligation.categoriesEquipement`.
 *   3. Si l'obligation a des `conditions[]`, elles sont regroupées par
 *      catégorie d'équipement ; il doit exister au moins un équipement
 *      E satisfaisant TOUTES les conditions dont `categorie === E.categorie`.
 *   4. Si l'obligation a `effectifMin`/`effectifMax`, l'effectif sur site
 *      doit être dans la plage (bornes incluses).
 *
 * Le moteur est **pur** : pas d'I/O, pas d'horloge, pas d'aléatoire. Deux
 * appels avec les mêmes entrées renvoient le même résultat, ce qui est la
 * condition d'auditabilité (cf. CLAUDE.md, principe zéro-IA).
 */

import { obligationsConformite } from "@/lib/referentiels/conformite";
import type {
  ConditionApplication,
  Obligation,
} from "@/lib/referentiels/conformite/types";
import type {
  CategorieEquipement,
  TypologieApplication,
} from "@/lib/referentiels/types-communs";
import type {
  EquipementMatching,
  EtablissementMatching,
  ObligationApplicable,
} from "./types";

// -----------------------------------------------------------------------------
// Étape 1 — Typologie
// -----------------------------------------------------------------------------

type ResultatTypologie = { ok: true; raisons: string[] } | { ok: false };

/**
 * Évaluation d'un critère de régime : `absent` (non déclaré par
 * l'obligation), `match` (satisfait, avec sa raison textuelle) ou
 * `mismatch` (déclaré mais non satisfait).
 */
type EvalRegime =
  | { etat: "absent" }
  | { etat: "match"; raison: string }
  | { etat: "mismatch" };

function evaluerErp(
  critere: TypologieApplication["erp"],
  etab: EtablissementMatching,
): EvalRegime {
  if (critere === undefined || critere === false) return { etat: "absent" };
  if (!etab.estERP) return { etat: "mismatch" };
  if (typeof critere === "object") {
    if (critere.categories && critere.categories.length > 0) {
      if (
        !etab.categorieErp ||
        !critere.categories.includes(etab.categorieErp)
      ) {
        return { etat: "mismatch" };
      }
      return {
        etat: "match",
        raison: `ERP catégorie ${etab.categorieErp.slice(1)} (règle limitée à ${critere.categories
          .map((c) => c.slice(1))
          .join(", ")})`,
      };
    }
    return { etat: "match", raison: "ERP" };
  }
  return { etat: "match", raison: "ERP" };
}

function evaluerIgh(
  critere: TypologieApplication["igh"],
  etab: EtablissementMatching,
): EvalRegime {
  if (critere === undefined || critere === false) return { etat: "absent" };
  if (!etab.estIGH) return { etat: "mismatch" };
  if (typeof critere === "object") {
    if (critere.classes && critere.classes.length > 0) {
      if (!etab.classeIgh || !critere.classes.includes(etab.classeIgh)) {
        return { etat: "mismatch" };
      }
      return { etat: "match", raison: `IGH classe ${etab.classeIgh}` };
    }
    return { etat: "match", raison: "IGH" };
  }
  return { etat: "match", raison: "IGH" };
}

/**
 * Sémantique (amendement 2026-08, cf. `docs/regles-matching.md`) :
 *   - Les critères de régime **positifs** (`travail: true`, `erp: true |
 *     {categories}`, `igh: true | {classes}`, `habitation: true`) forment
 *     une **disjonction** : l'établissement doit en satisfaire AU MOINS UN.
 *     Une obligation déclarant `{ travail: true, erp: true, igh: true }`
 *     s'applique donc aux établissements de travail OU ERP OU IGH
 *     (cas des ascenseurs).
 *   - Les critères **négatifs** (`travail: false`, `erp: false`, …) restent
 *     des **exclusions en ET** : un seul violé suffit à rejeter.
 *   - `effectifMin`/`effectifMax` restent en ET avec le reste.
 *   - Les `raisons` ne contiennent que les régimes effectivement matchés.
 */
function matchTypologie(
  t: TypologieApplication,
  etab: EtablissementMatching,
): ResultatTypologie {
  // 1. Exclusions (ET) — un critère négatif violé rejette immédiatement.
  if (t.travail === false && etab.estEtablissementTravail) return { ok: false };
  if (t.erp === false && etab.estERP) return { ok: false };
  if (t.igh === false && etab.estIGH) return { ok: false };
  if (t.habitation === false && etab.estHabitation) return { ok: false };

  // 2. Régimes positifs (OU) — au moins un déclaré doit matcher.
  const regimes: EvalRegime[] = [
    t.travail === true
      ? etab.estEtablissementTravail
        ? { etat: "match", raison: "établissement de travail (salariés)" }
        : { etat: "mismatch" }
      : { etat: "absent" },
    evaluerErp(t.erp, etab),
    evaluerIgh(t.igh, etab),
    t.habitation === true
      ? etab.estHabitation
        ? { etat: "match", raison: "immeuble d'habitation" }
        : { etat: "mismatch" }
      : { etat: "absent" },
  ];

  const declares = regimes.filter((r) => r.etat !== "absent");
  const matches = regimes.filter((r) => r.etat === "match");
  if (declares.length > 0 && matches.length === 0) {
    return { ok: false };
  }

  const raisons = matches.map((r) => (r as { raison: string }).raison);

  // 3. Effectif (ET).
  if (t.effectifMin !== undefined && etab.effectifSurSite < t.effectifMin) {
    return { ok: false };
  }
  if (t.effectifMax !== undefined && etab.effectifSurSite > t.effectifMax) {
    return { ok: false };
  }
  if (t.effectifMin !== undefined || t.effectifMax !== undefined) {
    raisons.push(
      `effectif sur site ${etab.effectifSurSite} dans la plage [${
        t.effectifMin ?? "—"
      } ; ${t.effectifMax ?? "—"}]`,
    );
  }

  // Si aucune contrainte de typologie n'a été posée ET aucune raison n'a
  // été ajoutée, l'obligation est considérée comme non applicable (garde-fou :
  // évite de matcher toutes les obligations mal rédigées sans typologie).
  if (raisons.length === 0) {
    return { ok: false };
  }

  return { ok: true, raisons };
}

// -----------------------------------------------------------------------------
// Étape 2 — Équipements (catégorie + conditions)
// -----------------------------------------------------------------------------

function lireProprieteNumerique(
  eq: EquipementMatching,
  propriete: string,
): number | undefined {
  const v = eq.caracteristiques?.[propriete];
  return typeof v === "number" ? v : undefined;
}

function lireProprieteBooleenne(
  eq: EquipementMatching,
  propriete: string,
): boolean | undefined {
  const v = eq.caracteristiques?.[propriete];
  return typeof v === "boolean" ? v : undefined;
}

function conditionSatisfaite(
  cond: ConditionApplication,
  eq: EquipementMatching,
): boolean {
  if (cond.type === "equipement_propriete_numerique") {
    const v = lireProprieteNumerique(eq, cond.propriete);
    if (v === undefined) return false;
    switch (cond.operateur) {
      case ">":
        return v > cond.valeur;
      case ">=":
        return v >= cond.valeur;
      case "<":
        return v < cond.valeur;
      case "<=":
        return v <= cond.valeur;
      case "==":
        return v === cond.valeur;
    }
  }
  if (cond.type === "equipement_propriete_booleenne") {
    const v = lireProprieteBooleenne(eq, cond.propriete);
    if (v === undefined) return false;
    return v === cond.valeur;
  }
  return false;
}

function conditionsParCategorie(
  conditions: ConditionApplication[] | undefined,
): Map<CategorieEquipement, ConditionApplication[]> {
  const out = new Map<CategorieEquipement, ConditionApplication[]>();
  if (!conditions) return out;
  for (const c of conditions) {
    const bucket = out.get(c.categorie) ?? [];
    bucket.push(c);
    out.set(c.categorie, bucket);
  }
  return out;
}

type ResultatEquipements = {
  ok: boolean;
  declencheurs: EquipementMatching[];
  raison?: string;
};

function matchEquipements(
  o: Obligation,
  equipements: EquipementMatching[],
): ResultatEquipements {
  const categoriesAcceptees = new Set<CategorieEquipement>(
    o.categoriesEquipement,
  );
  const conditions = conditionsParCategorie(o.conditions);

  const declencheurs: EquipementMatching[] = [];
  for (const eq of equipements) {
    if (!categoriesAcceptees.has(eq.categorie)) continue;
    const condsCategorie = conditions.get(eq.categorie) ?? [];
    const toutes = condsCategorie.every((c) => conditionSatisfaite(c, eq));
    if (toutes) declencheurs.push(eq);
  }

  if (declencheurs.length === 0) {
    return {
      ok: false,
      declencheurs: [],
    };
  }

  return {
    ok: true,
    declencheurs,
    raison: `équipement${declencheurs.length > 1 ? "s" : ""} déclenche${
      declencheurs.length > 1 ? "nt" : ""
    } la règle (${declencheurs.map((e) => e.libelle).join(", ")})`,
  };
}

// -----------------------------------------------------------------------------
// API publique
// -----------------------------------------------------------------------------

export function evaluerObligation(
  o: Obligation,
  etab: EtablissementMatching,
  equipements: EquipementMatching[],
): ObligationApplicable | null {
  const typo = matchTypologie(o.typologies, etab);
  if (!typo.ok) return null;

  const eq = matchEquipements(o, equipements);
  if (!eq.ok) return null;

  const raisons = [...typo.raisons];
  if (eq.raison) raisons.push(eq.raison);

  return {
    obligation: o,
    equipementsConcernes: eq.declencheurs,
    raisons,
  };
}

export type DetermineOptions = {
  /** Remplacement complet du référentiel par défaut — utile pour les tests. */
  obligations?: Obligation[];
};

export function determineObligationsApplicables(
  etab: EtablissementMatching,
  equipements: EquipementMatching[],
  options?: DetermineOptions,
): ObligationApplicable[] {
  const source = options?.obligations ?? obligationsConformite;
  const out: ObligationApplicable[] = [];
  for (const o of source) {
    const res = evaluerObligation(o, etab, equipements);
    if (res) out.push(res);
  }
  return out;
}
