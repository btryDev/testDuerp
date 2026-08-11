import { describe, expect, it } from "vitest";
import { assertOrigineActionValide, origineActionValide } from "./origine";

/**
 * XOR d'origine des actions (ADR-002). La contrainte SQL
 * `Action_origine_xor` reste le dernier rempart (cf.
 * `src/lib/migrations-contraintes.test.ts`), mais elle disparaît sur un
 * `prisma db push` et remonte une erreur PostgreSQL illisible quand elle
 * tient. Ces tests couvrent le doublon applicatif.
 */

describe("origineActionValide", () => {
  it("accepte une origine « risque » seule (mesure DUERP)", () => {
    expect(origineActionValide({ risqueId: "r1", verificationId: null })).toBe(
      true,
    );
  });

  it("accepte une origine « vérification » seule (levée d'écart)", () => {
    expect(origineActionValide({ risqueId: null, verificationId: "v1" })).toBe(
      true,
    );
  });

  it("refuse les deux origines à la fois", () => {
    expect(origineActionValide({ risqueId: "r1", verificationId: "v1" })).toBe(
      false,
    );
  });

  it("refuse l'absence d'origine", () => {
    expect(origineActionValide({ risqueId: null, verificationId: null })).toBe(
      false,
    );
    expect(origineActionValide({})).toBe(false);
  });

  it("traite la chaîne vide comme une absence (formulaire vide)", () => {
    // `formData.get()` rend "" là où le code rendrait null : sans cette
    // normalisation, une action sans origine réelle passerait le contrôle.
    expect(origineActionValide({ risqueId: "", verificationId: "v1" })).toBe(
      true,
    );
    expect(origineActionValide({ risqueId: "", verificationId: "" })).toBe(
      false,
    );
  });
});

describe("assertOrigineActionValide", () => {
  it("laisse passer une origine valide", () => {
    expect(() =>
      assertOrigineActionValide({ risqueId: "r1", verificationId: null }),
    ).not.toThrow();
  });

  it("nomme la contrainte quand les deux origines sont fournies", () => {
    expect(() =>
      assertOrigineActionValide({ risqueId: "r1", verificationId: "v1" }),
    ).toThrow(/Action_origine_xor/);
  });

  it("nomme la contrainte quand aucune origine n'est fournie", () => {
    expect(() => assertOrigineActionValide({})).toThrow(
      /aucun n'est renseigné/,
    );
  });
});
