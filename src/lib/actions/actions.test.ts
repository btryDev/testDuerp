import { describe, expect, it } from "vitest";
import { actionVersMesureUI } from "./mapping";

describe("actionVersMesureUI", () => {
  it("map 'levee' vers 'existante' (mesure en place côté wizard DUERP)", () => {
    const m = actionVersMesureUI({
      statut: "levee",
      libelle: "Formation Prap",
    });
    expect(m.statut).toBe("existante");
  });

  it("map 'ouverte', 'en_cours', 'abandonnee' vers 'prevue'", () => {
    expect(actionVersMesureUI({ statut: "ouverte" }).statut).toBe("prevue");
    expect(actionVersMesureUI({ statut: "en_cours" }).statut).toBe("prevue");
    expect(actionVersMesureUI({ statut: "abandonnee" }).statut).toBe("prevue");
  });

  it("préserve les autres champs de l'action", () => {
    const m = actionVersMesureUI({
      statut: "levee",
      libelle: "x",
      echeance: new Date("2026-06-01"),
      responsable: "DAF",
    });
    expect(m.libelle).toBe("x");
    expect(m.echeance).toEqual(new Date("2026-06-01"));
    expect(m.responsable).toBe("DAF");
  });
});
