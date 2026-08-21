import { describe, expect, it } from "vitest";
import { ICONE_CATEGORIE } from "./MarqueCategorie";
import { LABEL_CATEGORIE_EQUIPEMENT } from "@/lib/equipements/labels";

describe("ICONE_CATEGORIE", () => {
  it("couvre toutes les catégories du modèle", () => {
    // La table des libellés fait foi : une catégorie ajoutée au schéma sans
    // son dessin retomberait en silence sur le colis d'« autre équipement ».
    expect(Object.keys(ICONE_CATEGORIE).sort()).toEqual(
      Object.keys(LABEL_CATEGORIE_EQUIPEMENT).sort(),
    );
  });

  it("n'attribue jamais deux fois le même dessin", () => {
    // C'est tout l'intérêt d'une table écrite à la main : « porte
    // automatique » et « portail automatique », ou la VMC et la CTA,
    // deviendraient indistinguables dans une liste triée par catégorie.
    const icones = Object.values(ICONE_CATEGORIE);
    expect(new Set(icones).size).toBe(icones.length);
  });
});
