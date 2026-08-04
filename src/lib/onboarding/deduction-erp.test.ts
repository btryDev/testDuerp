import { describe, expect, it } from "vitest";
import {
  CHOIX_ACTIVITE_ERP,
  CHOIX_CLASSES_IGH,
  TRANCHES_EFFECTIF_PUBLIC,
  categorieErpDepuisTranche,
  deduireCategorieErpDepuisEffectif,
  typeErpDepuisChoix,
} from "./deduction-erp";

describe("deduireCategorieErpDepuisEffectif", () => {
  it("≤ 300 personnes → 5ᵉ catégorie", () => {
    expect(deduireCategorieErpDepuisEffectif(0)).toBe("N5");
    expect(deduireCategorieErpDepuisEffectif(150)).toBe("N5");
    expect(deduireCategorieErpDepuisEffectif(300)).toBe("N5");
  });

  it("301 à 700 → 3ᵉ catégorie", () => {
    expect(deduireCategorieErpDepuisEffectif(301)).toBe("N3");
    expect(deduireCategorieErpDepuisEffectif(500)).toBe("N3");
    expect(deduireCategorieErpDepuisEffectif(700)).toBe("N3");
  });

  it("701 à 1500 → 2ᵉ catégorie", () => {
    expect(deduireCategorieErpDepuisEffectif(701)).toBe("N2");
    expect(deduireCategorieErpDepuisEffectif(1200)).toBe("N2");
    expect(deduireCategorieErpDepuisEffectif(1500)).toBe("N2");
  });

  it("> 1500 → 1ʳᵉ catégorie", () => {
    expect(deduireCategorieErpDepuisEffectif(1501)).toBe("N1");
    expect(deduireCategorieErpDepuisEffectif(5000)).toBe("N1");
  });
});

describe("categorieErpDepuisTranche", () => {
  it("résout chaque tranche sans erreur", () => {
    expect(categorieErpDepuisTranche("moins-300")).toBe("N5");
    expect(categorieErpDepuisTranche("301-700")).toBe("N3");
    expect(categorieErpDepuisTranche("701-1500")).toBe("N2");
    expect(categorieErpDepuisTranche("plus-1500")).toBe("N1");
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

  it("TRANCHES_EFFECTIF_PUBLIC : ordre croissant de capacité", () => {
    const categorieOrder = ["N5", "N3", "N2", "N1"];
    expect(
      TRANCHES_EFFECTIF_PUBLIC.map((t) => t.categorieErp),
    ).toEqual(categorieOrder);
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
