import { describe, expect, it } from "vitest";
import { articlesNonCouverts } from "@/lib/referentiels/corpus";
import { famillesNonPortees } from "./familles";

describe("famillesNonPortees", () => {
  it("n'en laisse aucun de côté — pas même ceux qu'un `declareA` prétend annoncer", () => {
    // La garantie qui compte, et celle qui a manqué à la première version :
    // filtrée sur l'absence de `declareA`, elle rendait zéro entrée alors que
    // le corpus en porte vingt-sept. Un axe qui ne peut jamais se déclencher
    // est une décoration.
    expect(famillesNonPortees().map((f) => f.ref)).toEqual(
      articlesNonCouverts().map((a) => a.ref),
    );
  });

  it("en rend effectivement, et pas une liste vide qui passerait pour un dépôt sans dette", () => {
    expect(famillesNonPortees().length).toBeGreaterThan(0);
  });

  it("projette le motif du corpus sans le réécrire", () => {
    // Le motif est rédigé là où l'article a été dépouillé, par la personne qui
    // l'a lu. Une reformulation ici vieillirait à part de la source.
    const source = articlesNonCouverts();
    for (const f of famillesNonPortees()) {
      const origine = source.find(
        (a) => a.ref === f.ref && a.corpus === f.corpus,
      );
      expect(origine, `${f.corpus} / ${f.ref}`).toBeDefined();
      expect(f.motif).toBe(origine?.motif);
      // Et le motif projeté n'est pas tronqué : le corpus impose plus de 120
      // caractères à chacun, l'écran doit en montrer autant.
      expect(f.motif.length).toBeGreaterThan(120);
    }
  });
});
