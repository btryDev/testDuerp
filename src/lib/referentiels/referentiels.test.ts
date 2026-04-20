import { describe, expect, it } from "vitest";
import {
  referentielsSectoriels,
  risquesTransverses,
  tousRisquesConnus,
  trouverReferentielParNaf,
} from "./index";

describe("referentiels", () => {
  it("résout un NAF de restauration vers le référentiel restauration", () => {
    expect(trouverReferentielParNaf("56.10A")?.id).toBe("restauration");
    expect(trouverReferentielParNaf("56.10a")?.id).toBe("restauration");
  });

  it("ne résout rien pour un NAF inconnu", () => {
    expect(trouverReferentielParNaf("99.99Z")).toBeUndefined();
    expect(trouverReferentielParNaf(null)).toBeUndefined();
  });

  it("tousRisquesConnus contient les risques sectoriels et transverses", () => {
    const map = tousRisquesConnus();
    // au moins un risque sectoriel connu (sourcé INRS ED 880)
    expect(map.has("resto-coupure")).toBe(true);
    // et un transverse (ED 840 fiche 4)
    expect(map.has("trv-routier")).toBe(true);
  });

  it("aucun ID de risque n'est dupliqué entre secteurs et transverses", () => {
    const transIds = new Set(risquesTransverses.map((r) => r.id));
    for (const ref of referentielsSectoriels) {
      for (const r of ref.risques) {
        expect(transIds.has(r.id)).toBe(false);
      }
    }
  });

  it("les unitesAssociees d'un risque existent dans le référentiel", () => {
    for (const ref of referentielsSectoriels) {
      const unitIds = new Set(ref.unitesTravailSuggerees.map((u) => u.id));
      for (const r of ref.risques) {
        for (const u of r.unitesAssociees) {
          expect(unitIds.has(u)).toBe(true);
        }
      }
    }
  });
});
