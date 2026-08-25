import { describe, expect, it } from "vitest";
import { verdictSuiviEnService } from "./esp";

describe("ESP — verdict indicatif R. 557-14-1", () => {
  it("compresseur d'atelier 200 L / 10 bar (air = groupe 2) → soumis (2 000 bar·L > 200)", () => {
    const v = verdictSuiviEnService({
      famille: "recipient_gaz_groupe2",
      pressionMaxAdmissibleBar: 10,
      volumeLitres: 200,
    });
    expect(v.verdict).toBe("soumis");
    expect(v.motif).toContain("R. 557-14-1");
  });

  it("petit compresseur 24 L / 8 bar → non soumis (192 bar·L ≤ 200)", () => {
    expect(
      verdictSuiviEnService({
        famille: "recipient_gaz_groupe2",
        pressionMaxAdmissibleBar: 8,
        volumeLitres: 24,
      }).verdict,
    ).toBe("non_soumis");
  });

  it("groupe 2 à PS ≤ 4 bar → exclu quel que soit le volume", () => {
    expect(
      verdictSuiviEnService({
        famille: "recipient_gaz_groupe2",
        pressionMaxAdmissibleBar: 4,
        volumeLitres: 5000,
      }).verdict,
    ).toBe("non_soumis");
  });

  it("couvercle amovible à fermeture rapide : seuil PS abaissé à 2,5 bar", () => {
    expect(
      verdictSuiviEnService({
        famille: "recipient_gaz_groupe2",
        pressionMaxAdmissibleBar: 3,
        volumeLitres: 500,
        couvercleAmovible: true,
      }).verdict,
    ).toBe("soumis");
  });

  it("groupe 1 : seuil 50 bar·L, exclusion V ≤ 1 L et PS ≤ 200", () => {
    expect(
      verdictSuiviEnService({
        famille: "recipient_gaz_groupe1",
        pressionMaxAdmissibleBar: 15,
        volumeLitres: 10,
      }).verdict,
    ).toBe("soumis");
    expect(
      verdictSuiviEnService({
        famille: "recipient_gaz_groupe1",
        pressionMaxAdmissibleBar: 150,
        volumeLitres: 1,
      }).verdict,
    ).toBe("non_soumis");
  });

  it("générateur de vapeur : V > 25 L", () => {
    expect(
      verdictSuiviEnService({
        famille: "generateur_vapeur",
        pressionMaxAdmissibleBar: undefined,
        volumeLitres: 30,
      }).verdict,
    ).toBe("soumis");
    expect(
      verdictSuiviEnService({
        famille: "generateur_vapeur",
        pressionMaxAdmissibleBar: undefined,
        volumeLitres: 25,
      }).verdict,
    ).toBe("non_soumis");
  });

  it("récipient de vapeur : 200 bar·L, exclusion V ≤ 1 L", () => {
    expect(
      verdictSuiviEnService({
        famille: "recipient_vapeur",
        pressionMaxAdmissibleBar: 10,
        volumeLitres: 50,
      }).verdict,
    ).toBe("soumis");
  });

  it("données manquantes, famille inconnue ou tuyauterie → indéterminé, jamais un défaut", () => {
    expect(
      verdictSuiviEnService({
        famille: "recipient_gaz_groupe2",
        pressionMaxAdmissibleBar: 10,
        volumeLitres: undefined,
      }).verdict,
    ).toBe("indetermine");
    expect(
      verdictSuiviEnService({
        famille: undefined,
        pressionMaxAdmissibleBar: 10,
        volumeLitres: 100,
      }).verdict,
    ).toBe("indetermine");
    expect(
      verdictSuiviEnService({
        famille: "tuyauterie",
        pressionMaxAdmissibleBar: 10,
        volumeLitres: 100,
      }).verdict,
    ).toBe("indetermine");
  });
});
