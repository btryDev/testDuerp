import { describe, expect, it } from "vitest";
import { estHorsReferentiel } from "@/lib/risques/helpers";
import type { MesureSnapshot, UniteSnapshot } from "./snapshot";

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

/**
 * `referentielUniteId` est arrivé dans le snapshot après coup. Les versions
 * validées avant n'en portent pas trace, et le PDF les régénère à
 * l'identique pendant 40 ans : leurs unités ne doivent pas se mettre à
 * afficher une mention que personne n'a produite au moment de la validation.
 */
describe("snapshot DUERP — mention hors référentiel", () => {
  function unite(over: Partial<UniteSnapshot>): UniteSnapshot {
    return {
      id: "u1",
      nom: "Boucherie",
      description: null,
      estTransverse: false,
      aucunRisqueJustif: null,
      risques: [],
      ...over,
    };
  }

  it("une unité de snapshot ancien (champ absent) n'est pas mentionnée", () => {
    const ancienne = unite({});
    delete ancienne.referentielUniteId;
    expect(estHorsReferentiel(ancienne)).toBe(false);
  });

  it("une unité de snapshot récent sans unité type est mentionnée", () => {
    expect(estHorsReferentiel(unite({ referentielUniteId: null }))).toBe(true);
  });

  it("une unité de snapshot récent issue du référentiel ne l'est pas", () => {
    expect(
      estHorsReferentiel(unite({ referentielUniteId: "com-mise-rayon" })),
    ).toBe(false);
  });

  it("l'unité transverse d'un snapshot n'est jamais mentionnée", () => {
    expect(
      estHorsReferentiel(
        unite({
          nom: "Risques transverses",
          estTransverse: true,
          referentielUniteId: null,
        }),
      ),
    ).toBe(false);
  });
});
