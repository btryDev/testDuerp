import { describe, expect, it } from "vitest";
import { calculerScoreConformite } from "./score";

describe("calculerScoreConformite", () => {
  it("renvoie 100 quand aucun engagement n'est suivi", () => {
    const s = calculerScoreConformite({
      verifsTotal: 0,
      verifsEnRetard: 0,
      actionsOuvertesTotal: 0,
      actionsEnRetard: 0,
      duerpAgeJours: undefined,
    });
    expect(s.valeur).toBe(100);
    expect(s.niveau).toBe("satisfaisante");
  });

  it("renvoie 100 quand tout est à jour", () => {
    const s = calculerScoreConformite({
      verifsTotal: 10,
      verifsEnRetard: 0,
      actionsOuvertesTotal: 3,
      actionsEnRetard: 0,
      duerpAgeJours: 120, // DUERP récent
    });
    expect(s.valeur).toBe(100);
  });

  it("pénalise plus une vérif dépassée qu'une action en retard", () => {
    const base = {
      verifsTotal: 10,
      actionsOuvertesTotal: 10,
      duerpAgeJours: 120,
    };
    const avecVerif = calculerScoreConformite({
      ...base,
      verifsEnRetard: 1,
      actionsEnRetard: 0,
    });
    const avecAction = calculerScoreConformite({
      ...base,
      verifsEnRetard: 0,
      actionsEnRetard: 1,
    });
    expect(avecVerif.valeur).toBeLessThan(avecAction.valeur);
  });

  it("pénalise un DUERP périmé (>1 an)", () => {
    const sansPerime = calculerScoreConformite({
      verifsTotal: 10,
      verifsEnRetard: 0,
      actionsOuvertesTotal: 0,
      actionsEnRetard: 0,
      duerpAgeJours: 200,
    });
    const avecPerime = calculerScoreConformite({
      verifsTotal: 10,
      verifsEnRetard: 0,
      actionsOuvertesTotal: 0,
      actionsEnRetard: 0,
      duerpAgeJours: 500,
    });
    expect(avecPerime.valeur).toBeLessThan(sansPerime.valeur);
  });

  it("ne descend pas sous 0", () => {
    const s = calculerScoreConformite({
      verifsTotal: 1,
      verifsEnRetard: 1,
      actionsOuvertesTotal: 1,
      actionsEnRetard: 1,
      duerpAgeJours: 900,
    });
    expect(s.valeur).toBeGreaterThanOrEqual(0);
  });

  it("niveau 'rattrapage' quand score < 50", () => {
    const s = calculerScoreConformite({
      verifsTotal: 2,
      verifsEnRetard: 2,
      actionsOuvertesTotal: 2,
      actionsEnRetard: 2,
      duerpAgeJours: 900,
    });
    expect(s.niveau).toBe("rattrapage");
    expect(s.valeur).toBeLessThan(50);
  });

  it("niveau 'a_surveiller' entre 50 et 80", () => {
    // 10 vérifs (4 en retard ×3 = 12), 5 actions (2 en retard ×2 = 4), DUERP OK
    // denom = 16, penalite = 16, ratio = 16/48 ≈ 0.33, score ≈ 67
    const s = calculerScoreConformite({
      verifsTotal: 10,
      verifsEnRetard: 4,
      actionsOuvertesTotal: 5,
      actionsEnRetard: 2,
      duerpAgeJours: 200,
    });
    expect(s.valeur).toBeGreaterThanOrEqual(50);
    expect(s.valeur).toBeLessThan(80);
    expect(s.niveau).toBe("a_surveiller");
  });

  it("déterministe : deux appels identiques = même résultat", () => {
    const input = {
      verifsTotal: 8,
      verifsEnRetard: 1,
      actionsOuvertesTotal: 3,
      actionsEnRetard: 1,
      duerpAgeJours: 280,
    };
    expect(calculerScoreConformite(input)).toEqual(
      calculerScoreConformite(input),
    );
  });
});
