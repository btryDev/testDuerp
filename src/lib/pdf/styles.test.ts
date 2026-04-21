import { describe, expect, it } from "vitest";
import { formatDateCourte, formatDateLongue, slugifyFilename } from "./styles";

describe("styles utilitaires", () => {
  it("slugifyFilename retire accents et caractères spéciaux", () => {
    expect(slugifyFilename("Café de la Paix (Nantes)")).toBe(
      "Cafe_de_la_Paix__Nantes_",
    );
  });

  it("formatDateCourte DD/MM/YYYY", () => {
    expect(formatDateCourte(new Date("2026-03-05T12:00:00Z"))).toBe(
      "05/03/2026",
    );
  });

  it("formatDateCourte renvoie — si null", () => {
    expect(formatDateCourte(null)).toBe("—");
  });

  it("formatDateLongue contient le nom du mois", () => {
    const res = formatDateLongue(new Date("2026-06-12T12:00:00Z"));
    expect(res).toMatch(/juin/i);
    expect(res).toMatch(/2026/);
  });
});
