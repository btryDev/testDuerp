import { describe, expect, it } from "vitest";
import {
  estMultiBatiments,
  resoudreFiltreBatiment,
  restreindreAuBatiment,
} from "./filtre";

const A = { id: "bat-a" };
const B = { id: "bat-b" };

describe("estMultiBatiments", () => {
  it("est faux tant qu'il n'y a qu'un bâtiment", () => {
    expect(estMultiBatiments([])).toBe(false);
    expect(estMultiBatiments([A])).toBe(false);
  });

  it("est vrai à partir de deux", () => {
    expect(estMultiBatiments([A, B])).toBe(true);
  });
});

describe("resoudreFiltreBatiment", () => {
  it("rend le bâtiment nommé quand il existe", () => {
    expect(resoudreFiltreBatiment([A, B], "bat-b")).toBe("bat-b");
  });

  it("n'a pas de filtre sans paramètre", () => {
    expect(resoudreFiltreBatiment([A, B], undefined)).toBeUndefined();
  });

  it("traite un identifiant inconnu comme « tous », jamais comme « aucun »", () => {
    // Un écran vide se lirait comme un parc vide : une URL périmée ou
    // forgée doit rendre l'écran complet.
    expect(resoudreFiltreBatiment([A, B], "bat-supprime")).toBeUndefined();
    expect(resoudreFiltreBatiment([A, B], "")).toBeUndefined();
  });

  it("ne filtre pas un établissement mono-bâtiment, même sur le bon id", () => {
    expect(resoudreFiltreBatiment([A], "bat-a")).toBeUndefined();
    expect(resoudreFiltreBatiment([], "bat-a")).toBeUndefined();
  });
});

describe("restreindreAuBatiment", () => {
  const parc = [
    { id: "eq-1", batimentId: "bat-a" },
    { id: "eq-2", batimentId: "bat-b" },
    { id: "eq-3", batimentId: "bat-a" },
  ];

  it("rend la liste entière sans filtre", () => {
    expect(restreindreAuBatiment(parc, undefined)).toBe(parc);
  });

  it("ne garde que ce qui est dans le bâtiment", () => {
    expect(restreindreAuBatiment(parc, "bat-a").map((e) => e.id)).toEqual([
      "eq-1",
      "eq-3",
    ]);
  });

  it("rend une liste vide plutôt que tout, quand le bâtiment est vide", () => {
    // Le bâtiment existe et n'a rien : c'est une réponse, pas une absence
    // de filtre. L'écran dira « aucun équipement dans ce bâtiment ».
    expect(restreindreAuBatiment(parc, "bat-c")).toEqual([]);
  });

  it("laisse de côté ce qui n'est rattaché à aucun bâtiment", () => {
    const mixte = [
      { id: "p-1", batimentId: null },
      { id: "p-2", batimentId: "bat-a" },
    ];
    expect(restreindreAuBatiment(mixte, "bat-a").map((e) => e.id)).toEqual([
      "p-2",
    ]);
  });
});
