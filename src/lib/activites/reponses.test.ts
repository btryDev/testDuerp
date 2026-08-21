import { describe, expect, it } from "vitest";
import { lireReponsesActivites } from "./reponses";

/**
 * Tout ce module tourne autour d'une seule règle : une réponse absente est
 * absente. Elle ne devient jamais « non », ni à la lecture de la colonne JSON,
 * ni au moment de compter. Un DUERP part chez un inspecteur, un assureur ou un
 * acquéreur — lui faire dire « le dirigeant a déclaré ne pas exercer cette
 * activité » alors que personne n'a répondu serait une affirmation inventée.
 */
describe("lireReponsesActivites", () => {
  it("rend un objet vide quand la colonne n'a jamais été écrite", () => {
    expect(lireReponsesActivites(null)).toEqual({});
    expect(lireReponsesActivites(undefined)).toEqual({});
  });

  it("conserve les deux réponses explicites, oui comme non", () => {
    expect(
      lireReponsesActivites({ "com-decoupe-viande": true, "com-station": false }),
    ).toEqual({ "com-decoupe-viande": true, "com-station": false });
  });

  it("ignore une valeur non booléenne au lieu d'en déduire un « non »", () => {
    const lu = lireReponsesActivites({
      "com-decoupe-viande": "oui",
      "com-station": 0,
      "com-pressing": null,
      "com-cuisson": true,
    });
    expect(lu).toEqual({ "com-cuisson": true });
    expect("com-decoupe-viande" in lu).toBe(false);
  });

  it("ignore une forme aberrante (tableau, scalaire)", () => {
    expect(lireReponsesActivites([true, false])).toEqual({});
    expect(lireReponsesActivites("com-decoupe-viande")).toEqual({});
    expect(lireReponsesActivites(42)).toEqual({});
  });
});

/**
 * Le tri « déclarée / écartée / sans réponse » est testé chez son propriétaire,
 * `src/lib/duerps/couverture.test.ts`. Ici on ne garde que ce qui est propre à
 * la colonne : ce qu'on accepte d'y lire, et ce qu'on refuse d'en déduire.
 */
