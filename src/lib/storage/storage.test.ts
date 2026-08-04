import { describe, expect, it } from "vitest";
import { cleRapport } from "./index";

describe("cleRapport", () => {
  it("construit une clé de la forme rapports/{etabId}/{rapId}-{filename}", () => {
    expect(cleRapport("etab-abc", "rap-123", "rapport.pdf")).toBe(
      "rapports/etab-abc/rap-123-rapport.pdf",
    );
  });

  it("sanitise les caractères exotiques du nom de fichier", () => {
    expect(cleRapport("e", "r", "rapport final (2026) — v2.pdf")).toBe(
      "rapports/e/r-rapport_final__2026____v2.pdf",
    );
  });

  it("tronque un nom de fichier très long", () => {
    const long = "a".repeat(500) + ".pdf";
    const res = cleRapport("e", "r", long);
    expect(res.length).toBeLessThan(300);
  });
});
