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
 *   1. La typologie de l'obligation doit matcher l'établissement (AND).
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

function matchTypologie(
  t: TypologieApplication,
  etab: EtablissementMatching,
): ResultatTypologie {
  const raisons: string[] = [];

  // Travail
  if (t.travail === true && !etab.estEtablissementTravail) {
    return { ok: false };
  }
  if (t.travail === false && etab.estEtablissementTravail) {
    return { ok: false };
  }
  if (t.travail === true) raisons.push("établissement de travail (salariés)");

  // ERP
  if (t.erp !== undefined) {
    if (t.erp === false && etab.estERP) return { ok: false };
    if (t.erp === true && !etab.estERP) return { ok: false };
    if (typeof t.erp === "object") {
      if (!etab.estERP) return { ok: false };
      if (t.erp.categories && t.erp.categories.length > 0) {
        if (!etab.categorieErp) return { ok: false };
        if (!t.erp.categories.includes(etab.categorieErp)) {
          return { ok: false };
        }
        raisons.push(
          `ERP catégorie ${etab.categorieErp.slice(1)} (règle limitée à ${t.erp.categories
            .map((c) => c.slice(1))
            .join(", ")})`,
        );
      } else {
        raisons.push("ERP");
      }
    } else if (t.erp === true) {
      raisons.push("ERP");
    }
  }

  // IGH
  if (t.igh !== undefined) {
    if (t.igh === false && etab.estIGH) return { ok: false };
    if (t.igh === true && !etab.estIGH) return { ok: false };
    if (typeof t.igh === "object") {
      if (!etab.estIGH) return { ok: false };
      if (t.igh.classes && t.igh.classes.length > 0) {
        if (!etab.classeIgh) return { ok: false };
        if (!t.igh.classes.includes(etab.classeIgh)) return { ok: false };
        raisons.push(`IGH classe ${etab.classeIgh}`);
      } else {
        raisons.push("IGH");
      }
    } else if (t.igh === true) {
      raisons.push("IGH");
    }
  }

  // Habitation
  if (t.habitation === true && !etab.estHabitation) return { ok: false };
  if (t.habitation === false && etab.estHabitation) return { ok: false };
  if (t.habitation === true) raisons.push("immeuble d'habitation");

  // Effectif
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
