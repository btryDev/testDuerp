import { describe, expect, it } from "vitest";
import { TYPES_ERP } from "@/lib/referentiels/types-communs";
import {
  SEUILS_5E_CATEGORIE,
  SEUIL_3E_CATEGORIE,
  deduire4eOu5e,
  deduireCategorieErpComplete,
  deduireCategorieErp,
  deduireCategorieErpDepuisEffectif,
} from "./deduction-erp";

// -----------------------------------------------------------------------------
// Bornes du premier groupe (R. 143-19) — inchangées
// -----------------------------------------------------------------------------

describe("déduction ERP — bornes universelles de R. 143-19", () => {
  it("1501 → 1ʳᵉ, 701 → 2ᵉ, 301 → 3ᵉ", () => {
    expect(deduireCategorieErpDepuisEffectif(1501)).toBe("N1");
    expect(deduireCategorieErpDepuisEffectif(701)).toBe("N2");
    expect(deduireCategorieErpDepuisEffectif(301)).toBe("N3");
  });

  it("300 et au-dessous : la question est posée, jamais un défaut", () => {
    expect(deduireCategorieErpDepuisEffectif(SEUIL_3E_CATEGORIE)).toBeNull();
    const d = deduireCategorieErp(12);
    expect(d.statut).toBe("a_confirmer");
    if (d.statut === "a_confirmer") {
      expect(d.categoriesPossibles).toEqual(["N4", "N5"]);
    }
  });
});

// -----------------------------------------------------------------------------
// Table des seuils du second groupe — invariants de sourçage
// -----------------------------------------------------------------------------

describe("déduction ERP — table SEUILS_5E_CATEGORIE", () => {
  it("chaque entrée cite un article, une version lue, une URL Légifrance et une date de lecture", () => {
    for (const [type, s] of Object.entries(SEUILS_5E_CATEGORIE)) {
      expect(s.article, type).toMatch(/^[A-Z]{1,3} 1$/);
      expect(s.versionLue, type).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(s.dateLecture, type).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(s.urlLegifrance, type).toMatch(
        /^https:\/\/www\.legifrance\.gouv\.fr\//,
      );
      const seuil = s.deductible ? s.seuil : s.seuilTexte;
      if (seuil) expect(seuil.total, type).toBeGreaterThan(0);
    }
  });

  it("un type non déductible ne porte pas de seuil applicable", () => {
    // Garde-fou de l'union : c'est le compilateur qui l'impose désormais,
    // mais le test documente l'invariant. Un seuil qui coexiste avec une
    // condition est de la donnée morte — le cas relevé sur le type X.
    for (const [type, s] of Object.entries(SEUILS_5E_CATEGORIE)) {
      if (s.deductible) continue;
      expect(s.condition.length, type).toBeGreaterThan(0);
      expect(s, type).not.toHaveProperty("seuil");
    }
  });

  it("un type non déductible n'est jamais tranché, même très au-dessus des seuils", () => {
    for (const [type, s] of Object.entries(SEUILS_5E_CATEGORIE)) {
      if (s.deductible) continue;
      const d = deduire4eOu5e(type as keyof typeof SEUILS_5E_CATEGORIE, {
        total: 299,
        sousSol: 299,
        etages: 299,
      });
      expect(d.statut, type).toBe("a_confirmer");
    }
  });

  it("le type O n'est pas tranché : O 1 pose deux seuils (hôtel 100, autre hébergement > 15)", () => {
    // La table du second groupe ne reproduit que le seuil hôtelier. Un
    // établissement d'hébergement non hôtelier de 30 personnes relève du
    // premier groupe ; le classer en 5ᵉ lui retirerait la visite périodique
    // de la commission et la vérification électrique annuelle.
    const o = SEUILS_5E_CATEGORIE.O;
    expect(o?.deductible).toBe(false);
    expect(deduire4eOu5e("O", { total: 30, sousSol: 0, etages: 0 }).statut).toBe(
      "a_confirmer",
    );
  });

  it("les types de la table existent dans l'enum", () => {
    for (const type of Object.keys(SEUILS_5E_CATEGORIE)) {
      expect(TYPES_ERP).toContain(type);
    }
  });

  it("aucun seuil de type ne dépasse la borne des 300 (sinon la 4ᵉ serait vide)", () => {
    for (const [type, s] of Object.entries(SEUILS_5E_CATEGORIE)) {
      const seuil = s.deductible ? s.seuil : s.seuilTexte;
      if (seuil) expect(seuil.total, type).toBeLessThanOrEqual(SEUIL_3E_CATEGORIE);
    }
  });

  it("les types dont le seuil ne se lit pas dans l'effectif ne sont PAS dans la table", () => {
    // R : sous-sol interdit, étages « quel que soit l'effectif », sommeil ;
    // U : lits d'hospitalisation ; J : capacité d'hébergement ; L : deux
    // grilles selon la nature de la salle. Les encoder reviendrait à
    // trancher avec une information que l'assistant ne collecte pas.
    for (const type of ["R", "U", "L"] as const) {
      expect(SEUILS_5E_CATEGORIE[type]).toBeUndefined();
    }
  });
});

// -----------------------------------------------------------------------------
// deduire4eOu5e — application des seuils, règle de prudence
// -----------------------------------------------------------------------------

describe("déduction ERP — deduire4eOu5e", () => {
  it("restaurant (N) : 150 couverts en rez-de-chaussée → 5ᵉ", () => {
    const d = deduire4eOu5e("N", { total: 150, sousSol: 0, etages: 0 });
    expect(d.statut).toBe("proposee");
    if (d.statut === "proposee") {
      expect(d.categorieErp).toBe("N5");
      expect(d.motif).toContain("N 1");
    }
  });

  it("restaurant (N) : 150 couverts dont 100 en sous-sol → 4ᵉ (un seul chiffre atteint suffit)", () => {
    const d = deduire4eOu5e("N", { total: 150, sousSol: 100, etages: 0 });
    expect(d.statut).toBe("proposee");
    if (d.statut === "proposee") expect(d.categorieErp).toBe("N4");
  });

  it("restaurant (N) : 200 au total → 4ᵉ, même sans détail par niveau", () => {
    const d = deduire4eOu5e("N", { total: 200 });
    expect(d.statut).toBe("proposee");
    if (d.statut === "proposee") expect(d.categorieErp).toBe("N4");
  });

  it("restaurant (N) : 150 au total, sous-sol non renseigné → ne tranche pas", () => {
    const d = deduire4eOu5e("N", { total: 150 });
    expect(d.statut).toBe("a_confirmer");
    if (d.statut === "a_confirmer") expect(d.motif).toContain("sous-sol");
  });

  it("restaurant (N) : 150 au total, sous-sol 0, étages non renseignés → ne tranche pas", () => {
    const d = deduire4eOu5e("N", { total: 150, sousSol: 0 });
    expect(d.statut).toBe("a_confirmer");
    if (d.statut === "a_confirmer") expect(d.motif).toContain("étage");
  });

  it("magasin (M) : 100 en étage → 4ᵉ (seuil étages 100), 99 → 5ᵉ", () => {
    const quatre = deduire4eOu5e("M", { total: 150, sousSol: 0, etages: 100 });
    const cinq = deduire4eOu5e("M", { total: 150, sousSol: 0, etages: 99 });
    expect(quatre.statut === "proposee" && quatre.categorieErp).toBe("N4");
    expect(cinq.statut === "proposee" && cinq.categorieErp).toBe("N5");
  });

  it("hébergement (O) : jamais tranché, des deux côtés du seuil hôtelier", () => {
    // Ce test attendait auparavant 100 → 4ᵉ et 99 → 5ᵉ, en appliquant le seul
    // seuil hôtelier. L'audit du 2026-08-25 a montré que l'article O 1 en
    // pose un second, de plus de 15 personnes, pour les hébergements non
    // hôteliers. Comme l'assistant ne demande pas la nature de
    // l'hébergement, les deux réponses restaient fausses une fois sur deux —
    // et du mauvais côté, puisque le type O comporte des locaux à sommeil.
    expect(deduire4eOu5e("O", { total: 100 }).statut).toBe("a_confirmer");
    expect(deduire4eOu5e("O", { total: 99 }).statut).toBe("a_confirmer");
  });

  it("dancing (P) : 20 personnes en sous-sol suffisent → 4ᵉ", () => {
    const d = deduire4eOu5e("P", { total: 60, sousSol: 20, etages: 0 });
    expect(d.statut === "proposee" && d.categorieErp).toBe("N4");
  });

  it("culte (V) : 250 au total, rien en sous-sol ni en étage → 5ᵉ (seuil total 300)", () => {
    const d = deduire4eOu5e("V", { total: 250, sousSol: 0, etages: 0 });
    expect(d.statut === "proposee" && d.categorieErp).toBe("N5");
  });

  it("type X : condition hors effectif → ne tranche pas", () => {
    const d = deduire4eOu5e("X", { total: 250, sousSol: 0, etages: 0 });
    expect(d.statut).toBe("a_confirmer");
  });

  it("type hors table (R, U, L) → ne tranche pas", () => {
    for (const type of ["R", "U", "L"] as const) {
      const d = deduire4eOu5e(type, { total: 10, sousSol: 0, etages: 0 });
      expect(d.statut, type).toBe("a_confirmer");
    }
  });

  it("chaque proposition cite l'article qui la fonde", () => {
    for (const [type, s] of Object.entries(SEUILS_5E_CATEGORIE)) {
      if (!s.deductible) continue;
      const d = deduire4eOu5e(type as keyof typeof SEUILS_5E_CATEGORIE, {
        total: s.seuil.total,
      });
      expect(d.statut, type).toBe("proposee");
      if (d.statut === "proposee") expect(d.motif).toContain(s.article);
    }
  });
});

describe("déduction ERP — deduireCategorieErpComplete (public + personnel)", () => {
  it("bornes hautes sur public + personnel : 295 clients + 10 salariés → 3ᵉ", () => {
    const d = deduireCategorieErpComplete("N", { total: 295 }, 10);
    expect(d.statut === "proposee" && d.categorieErp).toBe("N3");
  });

  it("frontière 4ᵉ/5ᵉ sur le public seul : 190 clients + 10 salariés (N, RDC) → 5ᵉ", () => {
    const d = deduireCategorieErpComplete(
      "N",
      { total: 190, sousSol: 0, etages: 0 },
      10,
    );
    expect(d.statut === "proposee" && d.categorieErp).toBe("N5");
  });

  it("type hors table → ne tranche pas sous 300", () => {
    const d = deduireCategorieErpComplete("R", { total: 50 }, 5);
    expect(d.statut).toBe("a_confirmer");
  });
});
