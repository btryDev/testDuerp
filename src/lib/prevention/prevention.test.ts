import { describe, expect, it } from "vitest";
import { mesuresUniquementBasNiveau, trierParHierarchie } from "./index";

describe("mesuresUniquementBasNiveau", () => {
  it("déclenche l'avertissement si uniquement EPI", () => {
    expect(mesuresUniquementBasNiveau(["protection_individuelle"])).toBe(true);
  });

  it("déclenche si EPI + formation uniquement", () => {
    expect(
      mesuresUniquementBasNiveau(["protection_individuelle", "formation"]),
    ).toBe(true);
  });

  it("ne déclenche pas si au moins une mesure collective", () => {
    expect(
      mesuresUniquementBasNiveau([
        "protection_individuelle",
        "protection_collective",
      ]),
    ).toBe(false);
  });

  it("ne déclenche pas si suppression présente", () => {
    expect(
      mesuresUniquementBasNiveau(["suppression", "protection_individuelle"]),
    ).toBe(false);
  });

  it("ne déclenche pas si aucune mesure (cas vide)", () => {
    expect(mesuresUniquementBasNiveau([])).toBe(false);
  });
});

describe("trierParHierarchie", () => {
  it("place suppression en premier et organisationnelle en dernier", () => {
    const mesures = [
      { id: "a", type: "formation" as const },
      { id: "b", type: "suppression" as const },
      { id: "c", type: "organisationnelle" as const },
      { id: "d", type: "protection_collective" as const },
    ];
    expect(trierParHierarchie(mesures).map((m) => m.id)).toEqual([
      "b",
      "d",
      "a",
      "c",
    ]);
  });
});
