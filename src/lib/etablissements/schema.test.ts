import { describe, expect, it } from "vitest";
import { etablissementSchema } from "./schema";

const base = {
  raisonDisplay: "Restaurant du Marché",
  adresse: "12 rue des Halles, 75001 Paris",
  effectifSurSite: 8,
  estEtablissementTravail: true,
  estERP: false,
  estIGH: false,
  estHabitation: false,
};

describe("etablissementSchema — typologie (ADR-004)", () => {
  it("accepte un établissement de travail simple", () => {
    const res = etablissementSchema.safeParse(base);
    expect(res.success).toBe(true);
  });

  it("refuse un ERP sans type + sans catégorie", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      estERP: true,
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      const champs = res.error.issues.map((i) => i.path[0]);
      expect(champs).toContain("typeErp");
      expect(champs).toContain("categorieErp");
    }
  });

  it("accepte un ERP restaurant cat. 4", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      estERP: true,
      typeErp: "N",
      categorieErp: "N4",
    });
    expect(res.success).toBe(true);
  });

  it("refuse typeErp/categorieErp si l'établissement n'est pas ERP", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      estERP: false,
      typeErp: "N",
      categorieErp: "N4",
    });
    expect(res.success).toBe(false);
  });

  it("refuse un IGH sans classe", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      estIGH: true,
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      const champs = res.error.issues.map((i) => i.path[0]);
      expect(champs).toContain("classeIgh");
    }
  });

  it("accepte ERP + IGH cumulés (régimes non exclusifs)", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      estERP: true,
      typeErp: "W",
      categorieErp: "N2",
      estIGH: true,
      classeIgh: "GHW",
    });
    expect(res.success).toBe(true);
  });

  it("refuse un établissement sans aucun régime coché", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      estEtablissementTravail: false,
    });
    expect(res.success).toBe(false);
  });

  it("refuse un code NAF invalide", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      codeNaf: "invalide",
    });
    expect(res.success).toBe(false);
  });

  it("accepte un code NAF vide (hérite de l'entreprise)", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      codeNaf: "",
    });
    expect(res.success).toBe(true);
  });
});
