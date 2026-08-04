import { describe, expect, it } from "vitest";
import { onboardingSchema } from "./schema";

const base = {
  raisonSociale: "Bistrot du marché SARL",
  siret: "",
  adresse: "12 rue des halles, 44000 Nantes",
  codeNaf: "56.10A",
  effectifSurSite: 8,
  estEtablissementTravail: true,
  estERP: false,
  estIGH: false,
  estHabitation: false,
};

describe("onboardingSchema", () => {
  it("accepte une saisie minimale valide (travail seul)", () => {
    const res = onboardingSchema.safeParse(base);
    expect(res.success).toBe(true);
  });

  it("accepte un SIRET valide à 14 chiffres", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      siret: "12345678901234",
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.siret).toBe("12345678901234");
  });

  it("refuse un SIRET invalide", () => {
    const res = onboardingSchema.safeParse({ ...base, siret: "12345" });
    expect(res.success).toBe(false);
  });

  it("accepte un SIRET vide (optionnel)", () => {
    const res = onboardingSchema.safeParse({ ...base, siret: "" });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.siret).toBeUndefined();
  });

  it("normalise le code NAF en majuscules", () => {
    const res = onboardingSchema.safeParse({ ...base, codeNaf: "56.10a" });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.codeNaf).toBe("56.10A");
  });

  it("refuse une adresse non structurée (n'importe quoi)", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      adresse: "chez moi",
    });
    expect(res.success).toBe(false);
  });

  it("refuse une adresse sans code postal 5 chiffres", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      adresse: "12 rue X, 4400 Nantes",
    });
    expect(res.success).toBe(false);
  });

  it("exige type + catégorie ERP si estERP=true", () => {
    const res = onboardingSchema.safeParse({ ...base, estERP: true });
    expect(res.success).toBe(false);
    if (!res.success) {
      const champs = res.error.flatten().fieldErrors;
      expect(champs.typeErp).toBeDefined();
      expect(champs.categorieErp).toBeDefined();
    }
  });

  it("accepte un ERP complet (type + catégorie)", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      estERP: true,
      typeErp: "N",
      categorieErp: "N5",
    });
    expect(res.success).toBe(true);
  });

  it("refuse typeErp si estERP=false", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      estERP: false,
      typeErp: "N",
    });
    expect(res.success).toBe(false);
  });

  it("exige classeIgh si estIGH=true", () => {
    const res = onboardingSchema.safeParse({ ...base, estIGH: true });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.classeIgh).toBeDefined();
    }
  });

  it("refuse aucun régime coché", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      estEtablissementTravail: false,
      estERP: false,
      estIGH: false,
      estHabitation: false,
    });
    expect(res.success).toBe(false);
  });

  it("accepte le cumul ERP + IGH", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      estERP: true,
      typeErp: "W",
      categorieErp: "N1",
      estIGH: true,
      classeIgh: "GHW",
    });
    expect(res.success).toBe(true);
  });
});
