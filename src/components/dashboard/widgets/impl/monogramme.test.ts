// Le monogramme de repli de l'enseigne, quand aucun logo n'est déposé.
//
// Il est dérivé du nom, donc jamais faux. C'est la raison du choix : une
// icône générique de bâtiment aurait ressemblé à un logo par défaut, et
// l'écran aurait suggéré une identité que l'entreprise n'a pas déposée.

import { describe, expect, it } from "vitest";
import { monogramme } from "./hero-batiments";

describe("monogramme", () => {
  it("prend les initiales des deux premiers mots", () => {
    expect(monogramme("Maison Dupont")).toBe("MD");
    expect(monogramme("Boulangerie du Centre")).toBe("BD");
  });

  it("prend les deux premières lettres d'un nom en un seul mot", () => {
    expect(monogramme("Maak")).toBe("MA");
  });

  it("ignore les espaces surnuméraires", () => {
    expect(monogramme("  Maison   Dupont  ")).toBe("MD");
  });

  it("tient sur un nom d'une seule lettre", () => {
    expect(monogramme("M")).toBe("M");
  });

  it("ne rend jamais du vide", () => {
    // Un nom vide ne devrait pas exister — la contrainte est en base — mais
    // un carré blanc muet serait pire qu'un tiret.
    expect(monogramme("")).toBe("—");
    expect(monogramme("   ")).toBe("—");
  });

  it("met en capitales quelle que soit la saisie", () => {
    expect(monogramme("maison dupont")).toBe("MD");
  });

  it("conserve les caractères accentués", () => {
    expect(monogramme("Éclair Épicerie")).toBe("ÉÉ");
  });
});
