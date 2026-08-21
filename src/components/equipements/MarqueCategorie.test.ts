import { describe, expect, it } from "vitest";
import { MARQUE_CATEGORIE } from "./MarqueCategorie";
import { LABEL_CATEGORIE_EQUIPEMENT } from "@/lib/equipements/labels";

describe("MARQUE_CATEGORIE", () => {
  it("couvre toutes les catégories du modèle", () => {
    // La table des libellés fait foi : une catégorie ajoutée au schéma
    // sans sa marque afficherait « ?? » en silence.
    expect(Object.keys(MARQUE_CATEGORIE).sort()).toEqual(
      Object.keys(LABEL_CATEGORIE_EQUIPEMENT).sort(),
    );
  });

  it("n'attribue jamais deux fois la même marque", () => {
    // C'est tout l'intérêt d'une table écrite à la main : dérivée du
    // libellé, « porte automatique » et « portail automatique » donneraient
    // le même monogramme.
    const marques = Object.values(MARQUE_CATEGORIE);
    expect(new Set(marques).size).toBe(marques.length);
  });

  it("tient en deux capitales", () => {
    for (const m of Object.values(MARQUE_CATEGORIE)) {
      expect(m).toMatch(/^[A-Z]{2}$/);
    }
  });
});
