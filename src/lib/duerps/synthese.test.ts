import { describe, expect, it } from "vitest";
import { construireSynthese } from "./synthese";

const uniteMinimale = {
  id: "u1",
  nom: "Cuisine",
  estTransverse: false,
  risques: [],
};

function faireRisque(
  overrides: Partial<{
    id: string;
    referentielId: string | null;
    libelle: string;
    gravite: number;
    probabilite: number;
    maitrise: number;
    criticite: number;
    cotationSaisie: boolean;
    mesures: Array<{
      id: string;
      libelle: string;
      type: string;
      statut: string;
      echeance: Date | null;
      responsable: string | null;
    }>;
  }>,
) {
  return {
    id: "r1",
    referentielId: null,
    libelle: "Risque",
    gravite: 2,
    probabilite: 2,
    maitrise: 2,
    criticite: 2,
    cotationSaisie: true,
    mesures: [],
    ...overrides,
  };
}

describe("construireSynthese", () => {
  it("trie les risques par criticité décroissante puis gravité", () => {
    const u = {
      ...uniteMinimale,
      risques: [
        faireRisque({ id: "a", criticite: 4, gravite: 2 }),
        faireRisque({ id: "b", criticite: 8, gravite: 3 }),
        faireRisque({ id: "c", criticite: 4, gravite: 4 }),
      ],
    };
    const res = construireSynthese([u]);
    expect(res.lignes.map((l) => l.risqueId)).toEqual(["b", "c", "a"]);
  });

  it("compte les mesures existantes et prévues séparément", () => {
    const u = {
      ...uniteMinimale,
      risques: [
        faireRisque({
          mesures: [
            {
              id: "m1",
              libelle: "x",
              type: "formation",
              statut: "existante",
              echeance: null,
              responsable: null,
            },
            {
              id: "m2",
              libelle: "y",
              type: "suppression",
              statut: "prevue",
              echeance: new Date("2026-06-01"),
              responsable: "DAF",
            },
          ],
        }),
      ],
    };
    const res = construireSynthese([u]);
    expect(res.nbMesuresExistantes).toBe(1);
    expect(res.nbMesuresPrevues).toBe(1);
    expect(res.actionsPrevues).toHaveLength(1);
    expect(res.actionsPrevues[0].responsable).toBe("DAF");
  });

  it("trie les actions prévues par échéance puis criticité du risque", () => {
    const faire = (
      id: string,
      date: string | null,
      crit: number,
    ) =>
      faireRisque({
        id: `r-${id}`,
        criticite: crit,
        mesures: [
          {
            id,
            libelle: id,
            type: "suppression",
            statut: "prevue",
            echeance: date ? new Date(date) : null,
            responsable: null,
          },
        ],
      });
    const u = {
      ...uniteMinimale,
      risques: [
        faire("late", "2026-12-01", 16),
        faire("soon", "2026-06-01", 4),
        faire("undated", null, 12),
      ],
    };
    const res = construireSynthese([u]);
    expect(res.actionsPrevues.map((a) => a.mesureId)).toEqual([
      "soon",
      "late",
      "undated",
    ]);
  });

  it("compte les alertes hiérarchie basse et sous-cotation", () => {
    const u = {
      ...uniteMinimale,
      risques: [
        faireRisque({
          id: "h",
          mesures: [
            {
              id: "m",
              libelle: "EPI",
              type: "protection_individuelle",
              statut: "existante",
              echeance: null,
              responsable: null,
            },
          ],
        }),
        faireRisque({
          id: "s",
          referentielId: "resto-coupure", // ref secteur = 6 (INRS ED 880)
          cotationSaisie: true,
          criticite: 1,
        }),
      ],
    };
    const res = construireSynthese([u]);
    expect(res.nbAlertesHierarchie).toBe(1);
    expect(res.nbAlertesSousCotation).toBe(1);
  });
});
