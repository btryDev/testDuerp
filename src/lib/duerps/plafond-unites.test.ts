import { describe, expect, it } from "vitest";
import {
  compterUnitesPlafonnees,
  MAX_UNITES_TRAVAIL,
  messagePlafondAjout,
  placesRestantes,
  verifierPlafondImport,
} from "./plafond-unites";

// La borne de l'ADR-033, sans la base. Trois choses s'y jouent : que la
// transverse ne compte pas, qu'un dossier antérieur à la règle ne devienne pas
// négatif, et que le refus d'import dise son chiffre.

const unite = (nom: string) => ({ nom, estTransverse: false });
const TRANSVERSE = { nom: "Risques transverses", estTransverse: true };

describe("compterUnitesPlafonnees", () => {
  it("ne compte pas l'unité transverse", () => {
    expect(
      compterUnitesPlafonnees([TRANSVERSE, unite("Cuisine"), unite("Salle")]),
    ).toBe(2);
  });

  it("compte cinq unités sectorielles plus la transverse comme cinq", () => {
    // Le cas du pré-remplissage restauration et bureau : compter la
    // transverse ferait échouer l'étape la plus normale du produit.
    const cinq = ["A", "B", "C", "D", "E"].map(unite);
    expect(compterUnitesPlafonnees([TRANSVERSE, ...cinq])).toBe(
      MAX_UNITES_TRAVAIL,
    );
  });
});

describe("placesRestantes", () => {
  it("rend ce qu'il reste sous le plafond", () => {
    expect(placesRestantes(0)).toBe(5);
    expect(placesRestantes(4)).toBe(1);
    expect(placesRestantes(5)).toBe(0);
  });

  it("ne descend pas sous zéro sur un dossier antérieur à la règle", () => {
    // Un négatif remonterait dans un `slice(0, n)`, qui compte alors depuis
    // la fin du tableau : le pré-remplissage aurait créé des unités au lieu
    // de n'en créer aucune.
    expect(placesRestantes(8)).toBe(0);
  });
});

describe("messagePlafondAjout", () => {
  it("nomme la limite", () => {
    expect(messagePlafondAjout()).toContain("5 unités de travail");
  });
});

describe("verifierPlafondImport", () => {
  const noms = (n: number) =>
    Array.from({ length: n }, (_, i) => `Unité ${i + 1}`);

  it("accepte cinq unités sur un DUERP vide", () => {
    expect(verifierPlafondImport([], noms(5)).ok).toBe(true);
  });

  it("refuse la sixième", () => {
    const r = verifierPlafondImport([], noms(6));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain("6 unités");
  });

  it("ignore la transverse déjà en base", () => {
    expect(verifierPlafondImport([TRANSVERSE], noms(5)).ok).toBe(true);
  });

  it("ne compte qu'une fois une unité que le fichier réutilise", () => {
    expect(
      verifierPlafondImport(
        [unite("Unité 1"), unite("Unité 2")],
        noms(4),
      ).ok,
    ).toBe(true);
  });

  it("compte deux lignes pour deux unités homonymes déjà en base", () => {
    // Le doublon existe en base ; il occupe une place même si l'import ne le
    // rattachera jamais. Compter les noms distincts aurait laissé passer une
    // sixième unité.
    const r = verifierPlafondImport(
      [unite("Cuisine"), unite("Cuisine"), unite("Salle"), unite("Réserve")],
      ["Terrasse", "Cave"],
    );
    expect(r.ok).toBe(false);
  });
});
