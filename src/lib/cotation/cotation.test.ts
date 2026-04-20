import { describe, expect, it } from "vitest";
import {
  CotationHorsBornesError,
  calculerCriticite,
  prioriser,
} from "./index";

describe("calculerCriticite", () => {
  it("retourne 16 pour la pire combinaison (G=4, P=4, M=1)", () => {
    expect(calculerCriticite({ gravite: 4, probabilite: 4, maitrise: 1 })).toBe(
      16,
    );
  });

  it("retourne 1 pour la meilleure combinaison (G=1, P=1, M=4)", () => {
    expect(calculerCriticite({ gravite: 1, probabilite: 1, maitrise: 4 })).toBe(
      1,
    );
  });

  it("arrondit au plus proche entier", () => {
    // (2 × 3) / 4 = 1.5 → arrondi à 2
    expect(calculerCriticite({ gravite: 2, probabilite: 3, maitrise: 4 })).toBe(
      2,
    );
    // (3 × 3) / 4 = 2.25 → arrondi à 2
    expect(calculerCriticite({ gravite: 3, probabilite: 3, maitrise: 4 })).toBe(
      2,
    );
    // (3 × 3) / 2 = 4.5 → arrondi à 5
    expect(calculerCriticite({ gravite: 3, probabilite: 3, maitrise: 2 })).toBe(
      5,
    );
  });

  it("borne à 1 minimum même si calcul < 1", () => {
    // (1 × 1) / 4 = 0.25 → arrondi 0 → borné à 1
    expect(calculerCriticite({ gravite: 1, probabilite: 1, maitrise: 4 })).toBe(
      1,
    );
  });

  it("borne à 16 maximum", () => {
    // impossible d'excéder 16 avec les bornes mais on teste la garantie
    expect(calculerCriticite({ gravite: 4, probabilite: 4, maitrise: 1 })).toBe(
      16,
    );
  });

  it("rejette des valeurs hors [1, 4]", () => {
    expect(() =>
      calculerCriticite({ gravite: 0, probabilite: 2, maitrise: 2 }),
    ).toThrow(CotationHorsBornesError);
    expect(() =>
      calculerCriticite({ gravite: 5, probabilite: 2, maitrise: 2 }),
    ).toThrow(CotationHorsBornesError);
    expect(() =>
      calculerCriticite({ gravite: 2, probabilite: 2, maitrise: 0 }),
    ).toThrow(CotationHorsBornesError);
  });

  it("rejette des valeurs non entières", () => {
    expect(() =>
      calculerCriticite({ gravite: 2.5, probabilite: 2, maitrise: 2 }),
    ).toThrow(CotationHorsBornesError);
  });
});

describe("prioriser", () => {
  it("trie par criticité décroissante", () => {
    const risques = [
      { id: "a", gravite: 2, criticite: 4 },
      { id: "b", gravite: 4, criticite: 16 },
      { id: "c", gravite: 3, criticite: 8 },
    ];
    expect(prioriser(risques).map((r) => r.id)).toEqual(["b", "c", "a"]);
  });

  it("départage par gravité décroissante en cas d'égalité de criticité", () => {
    const risques = [
      { id: "a", gravite: 2, criticite: 8 },
      { id: "b", gravite: 4, criticite: 8 },
      { id: "c", gravite: 3, criticite: 8 },
    ];
    expect(prioriser(risques).map((r) => r.id)).toEqual(["b", "c", "a"]);
  });

  it("ne mute pas le tableau d'entrée", () => {
    const risques = [
      { id: "a", gravite: 2, criticite: 4 },
      { id: "b", gravite: 4, criticite: 16 },
    ];
    const copie = [...risques];
    prioriser(risques);
    expect(risques).toEqual(copie);
  });
});
