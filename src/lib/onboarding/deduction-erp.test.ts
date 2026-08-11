import { describe, expect, it } from "vitest";
import { CATEGORIES_ERP } from "@/lib/referentiels/types-communs";
import {
  CHOIX_ACTIVITE_ERP,
  CHOIX_CLASSES_IGH,
  SEUIL_1RE_CATEGORIE,
  SEUIL_2E_CATEGORIE,
  SEUIL_3E_CATEGORIE,
  TRANCHES_EFFECTIF_PUBLIC,
  avertissementProximiteSeuil,
  categorieErpDepuisTranche,
  deduireCategorieErp,
  deduireCategorieErpDepuisEffectif,
  typeErpDepuisChoix,
} from "./deduction-erp";

describe("deduireCategorieErp — bornes du premier groupe (CCH R. 143-19)", () => {
  it("301 à 700 → 3ᵉ catégorie proposée", () => {
    for (const n of [301, 500, 700]) {
      const d = deduireCategorieErp(n);
      expect(d.statut).toBe("proposee");
      if (d.statut === "proposee") expect(d.categorieErp).toBe("N3");
    }
  });

  it("701 à 1500 → 2ᵉ catégorie proposée", () => {
    for (const n of [701, 1200, 1500]) {
      const d = deduireCategorieErp(n);
      expect(d.statut).toBe("proposee");
      if (d.statut === "proposee") expect(d.categorieErp).toBe("N2");
    }
  });

  it("> 1500 → 1ʳᵉ catégorie proposée", () => {
    for (const n of [1501, 5000]) {
      const d = deduireCategorieErp(n);
      expect(d.statut).toBe("proposee");
      if (d.statut === "proposee") expect(d.categorieErp).toBe("N1");
    }
  });

  it("chaque motif cite l'article qui pose la borne", () => {
    for (const n of [500, 1000, 4000]) {
      const d = deduireCategorieErp(n);
      if (d.statut === "proposee") expect(d.motif).toContain("R. 143-19");
    }
  });
});

describe("deduireCategorieErp — bande « 300 et au-dessous » (régression 2026-08)", () => {
  it("ne tranche JAMAIS entre 4ᵉ et 5ᵉ catégorie sur le seul effectif", () => {
    for (const n of [0, 19, 150, 250, 299, 300]) {
      const d = deduireCategorieErp(n);
      expect(d.statut).toBe("a_confirmer");
      if (d.statut === "a_confirmer") {
        expect(d.categoriesPossibles).toEqual(["N4", "N5"]);
        expect(d.question.length).toBeGreaterThan(0);
      }
    }
  });

  it("un restaurant de 250 personnes n'est plus classé d'office en 5ᵉ catégorie", () => {
    // Régression directe : cette déduction silencieuse faisait perdre
    // `elec-erp-cat1-4-annuelle` (criticité 5, organisme agréé, annuelle) au
    // profit d'une quinquennale, et supprimait la vérification triennale du SSI.
    expect(deduireCategorieErpDepuisEffectif(250)).toBeNull();
  });

  it("deduireCategorieErpDepuisEffectif renvoie la catégorie quand elle est déductible", () => {
    expect(deduireCategorieErpDepuisEffectif(400)).toBe("N3");
    expect(deduireCategorieErpDepuisEffectif(900)).toBe("N2");
    expect(deduireCategorieErpDepuisEffectif(2000)).toBe("N1");
  });
});

describe("avertissementProximiteSeuil", () => {
  it("avertit lorsque l'effectif frôle une borne", () => {
    expect(avertissementProximiteSeuil(SEUIL_3E_CATEGORIE + 5)).toBeDefined();
    expect(avertissementProximiteSeuil(SEUIL_2E_CATEGORIE - 10)).toBeDefined();
    expect(avertissementProximiteSeuil(SEUIL_1RE_CATEGORIE + 100)).toBeDefined();
  });

  it("reste silencieux loin de toute borne", () => {
    expect(avertissementProximiteSeuil(500)).toBeUndefined();
    expect(avertissementProximiteSeuil(50)).toBeUndefined();
  });

  it("est remonté dans la déduction proposée", () => {
    const d = deduireCategorieErp(SEUIL_3E_CATEGORIE + 2);
    expect(d.statut).toBe("proposee");
    if (d.statut === "proposee") expect(d.avertissement).toBeDefined();
  });
});

describe("categorieErpDepuisTranche", () => {
  it("résout chaque tranche sans erreur", () => {
    expect(categorieErpDepuisTranche("moins-300-5e")).toBe("N5");
    expect(categorieErpDepuisTranche("moins-300-4e")).toBe("N4");
    expect(categorieErpDepuisTranche("301-700")).toBe("N3");
    expect(categorieErpDepuisTranche("701-1500")).toBe("N2");
    expect(categorieErpDepuisTranche("plus-1500")).toBe("N1");
  });

  it("lève sur une tranche inconnue", () => {
    expect(() =>
      categorieErpDepuisTranche("inexistante" as never),
    ).toThrowError();
  });
});

describe("typeErpDepuisChoix", () => {
  it("résout les 8 activités proposées", () => {
    expect(typeErpDepuisChoix("resto")).toBe("N");
    expect(typeErpDepuisChoix("commerce")).toBe("M");
    expect(typeErpDepuisChoix("bureau")).toBe("W");
    expect(typeErpDepuisChoix("hotel")).toBe("O");
    expect(typeErpDepuisChoix("soins")).toBe("U");
    expect(typeErpDepuisChoix("enseignement")).toBe("R");
    expect(typeErpDepuisChoix("spectacle")).toBe("L");
    expect(typeErpDepuisChoix("exposition")).toBe("T");
  });
});

describe("cohérence tables", () => {
  it("CHOIX_ACTIVITE_ERP : ids uniques", () => {
    const ids = CHOIX_ACTIVITE_ERP.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("TRANCHES_EFFECTIF_PUBLIC : les 5 catégories sont atteignables, 4ᵉ comprise", () => {
    const categories = TRANCHES_EFFECTIF_PUBLIC.map((t) => t.categorieErp);
    for (const c of CATEGORIES_ERP) expect(categories).toContain(c);
    // Une catégorie par tranche : le reverse lookup de l'assistant
    // (catégorie → tranche sélectionnée) suppose l'unicité.
    expect(new Set(categories).size).toBe(categories.length);
  });

  it("TRANCHES_EFFECTIF_PUBLIC : ordre croissant de capacité", () => {
    expect(TRANCHES_EFFECTIF_PUBLIC.map((t) => t.categorieErp)).toEqual([
      "N5",
      "N4",
      "N3",
      "N2",
      "N1",
    ]);
  });

  it("TRANCHES_EFFECTIF_PUBLIC : ids uniques", () => {
    const ids = TRANCHES_EFFECTIF_PUBLIC.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("CHOIX_CLASSES_IGH : toutes présentes (GHA à ITGH)", () => {
    const ids = CHOIX_CLASSES_IGH.map((c) => c.id);
    expect(ids).toContain("GHA");
    expect(ids).toContain("GHW");
    expect(ids).toContain("GHO");
    expect(ids).toContain("GHR");
    expect(ids).toContain("GHS");
    expect(ids).toContain("GHU");
    expect(ids).toContain("GHZ");
    expect(ids).toContain("ITGH");
    expect(ids.length).toBe(8);
  });
});
