import { describe, expect, it } from "vitest";
import { sha256Hex } from "./hash";

describe("SHA-256", () => {
  it("produit un hash stable pour 'abc'", () => {
    // Vecteur de test : SHA-256("abc") d'après Node.js crypto.
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("produit le hash de la chaîne vide", () => {
    expect(sha256Hex("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("produit toujours 64 caractères hexadécimaux", () => {
    const h = sha256Hex("Rapport de vérification du 2026-04-23 — Apave");
    expect(h).toMatch(/^[a-f0-9]{64}$/);
  });

  it("détecte qu'un octet modifie le hash", () => {
    const h1 = sha256Hex("Document v1");
    const h2 = sha256Hex("Document v2");
    expect(h1).not.toBe(h2);
  });
});
