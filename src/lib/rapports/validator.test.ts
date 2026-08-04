import { describe, expect, it } from "vitest";
import {
  MIME_AUTORISES,
  TAILLE_MAX_OCTETS,
  validerFichier,
} from "./validator";

// Helper pour construire un File (disponible en env Node récente + jsdom).
function fakeFile(
  name: string,
  mime: string,
  taille: number,
): File {
  const data = new Uint8Array(taille);
  return new File([data], name, { type: mime });
}

describe("validerFichier", () => {
  it("accepte un PDF de taille raisonnable", () => {
    const res = validerFichier(fakeFile("rapport.pdf", "application/pdf", 1024));
    expect(res.ok).toBe(true);
  });

  it("refuse un fichier vide", () => {
    const res = validerFichier(fakeFile("vide.pdf", "application/pdf", 0));
    expect(res.ok).toBe(false);
  });

  it("refuse si null", () => {
    expect(validerFichier(null).ok).toBe(false);
  });

  it("refuse un fichier trop gros", () => {
    const res = validerFichier(
      fakeFile("gros.pdf", "application/pdf", TAILLE_MAX_OCTETS + 1),
    );
    expect(res.ok).toBe(false);
  });

  it("refuse un type MIME non listé (ex. zip)", () => {
    const res = validerFichier(
      fakeFile("archive.zip", "application/zip", 512),
    );
    expect(res.ok).toBe(false);
  });

  it("accepte les 4 types MIME prévus", () => {
    for (const mime of MIME_AUTORISES) {
      const res = validerFichier(fakeFile(`f.${mime}`, mime, 100));
      expect(res.ok).toBe(true);
    }
  });
});
