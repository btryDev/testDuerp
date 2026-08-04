import { describe, expect, it } from "vitest";
import type { MesureSnapshot } from "./snapshot";

/**
 * Les snapshots `DuerpVersion` sont conservés 40 ans (art. L. 4121-3-1).
 * Même après le passage à `Action` en base (ADR-002), le snapshot écrit
 * dans la version conserve le format `mesures: { statut: existante | prevue }`
 * consommé par le moteur PDF. Ce test fige ce contrat.
 */

function snapshotMesureDepuisAction(a: {
  statut: string;
  libelle: string;
  echeance: Date | null;
}): Pick<MesureSnapshot, "statut" | "libelle" | "echeance"> {
  return {
    libelle: a.libelle,
    statut: a.statut === "levee" ? "existante" : "prevue",
    echeance: a.echeance ? a.echeance.toISOString() : null,
  };
}

describe("snapshot DUERP — compatibilité mesures", () => {
  it("Action 'levee' → MesureSnapshot 'existante'", () => {
    expect(
      snapshotMesureDepuisAction({
        statut: "levee",
        libelle: "Gants anti-coupure",
        echeance: null,
      }).statut,
    ).toBe("existante");
  });

  it("Action 'ouverte' → MesureSnapshot 'prevue'", () => {
    expect(
      snapshotMesureDepuisAction({
        statut: "ouverte",
        libelle: "Formation Prap",
        echeance: new Date("2026-09-01"),
      }).statut,
    ).toBe("prevue");
  });

  it("écriture ISO stable de l'échéance", () => {
    const s = snapshotMesureDepuisAction({
      statut: "ouverte",
      libelle: "x",
      echeance: new Date("2026-09-01T00:00:00Z"),
    });
    expect(s.echeance).toBe("2026-09-01T00:00:00.000Z");
  });
});
