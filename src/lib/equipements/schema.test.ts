import { describe, expect, it } from "vitest";
import { equipementSchema, serialiserCaracteristiques } from "./schema";

const base = {
  libelle: "TGBT principal",
  categorie: "INSTALLATION_ELECTRIQUE" as const,
};

describe("equipementSchema — validations de base", () => {
  it("accepte un équipement minimal", () => {
    const res = equipementSchema.safeParse(base);
    expect(res.success).toBe(true);
  });

  it("refuse un libellé vide", () => {
    const res = equipementSchema.safeParse({ ...base, libelle: "  " });
    expect(res.success).toBe(false);
  });

  it("refuse une catégorie inconnue", () => {
    const res = equipementSchema.safeParse({
      ...base,
      categorie: "EXOTIQUE",
    });
    expect(res.success).toBe(false);
  });

  it("accepte une date ISO courte AAAA-MM-JJ et la parse en Date", () => {
    const res = equipementSchema.safeParse({
      ...base,
      dateMiseEnService: "2024-03-15",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.dateMiseEnService).toBeInstanceOf(Date);
    }
  });

  it("refuse une date au format invalide", () => {
    const res = equipementSchema.safeParse({
      ...base,
      dateMiseEnService: "15/03/2024",
    });
    expect(res.success).toBe(false);
  });

  it("laisse la date vide passer comme undefined", () => {
    const res = equipementSchema.safeParse({
      ...base,
      dateMiseEnService: "",
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.dateMiseEnService).toBeUndefined();
  });
});

describe("equipementSchema — cohérence catégorie / propriétés (superRefine)", () => {
  it("refuse aGroupeElectrogene=true hors installation électrique", () => {
    const res = equipementSchema.safeParse({
      ...base,
      categorie: "VMC",
      aGroupeElectrogene: true,
    });
    expect(res.success).toBe(false);
  });

  it("accepte aGroupeElectrogene=true sur une installation électrique", () => {
    const res = equipementSchema.safeParse({
      ...base,
      categorie: "INSTALLATION_ELECTRIQUE",
      aGroupeElectrogene: true,
    });
    expect(res.success).toBe(true);
  });

  it("refuse nbVehiculesParkingCouvert sur une hotte", () => {
    const res = equipementSchema.safeParse({
      ...base,
      categorie: "HOTTE_PRO",
      nbVehiculesParkingCouvert: 300,
    });
    expect(res.success).toBe(false);
  });

  it("accepte nbVehiculesParkingCouvert sur une VMC", () => {
    const res = equipementSchema.safeParse({
      libelle: "VMC parking souterrain",
      categorie: "VMC",
      nbVehiculesParkingCouvert: 420,
    });
    expect(res.success).toBe(true);
  });

  it("refuse estLocalPollutionSpecifique sur un extincteur", () => {
    const res = equipementSchema.safeParse({
      libelle: "Extincteur CO₂ 5kg",
      categorie: "EXTINCTEUR",
      estLocalPollutionSpecifique: true,
    });
    expect(res.success).toBe(false);
  });

  it("accepte estLocalPollutionSpecifique sur une VMC / CTA / Hotte", () => {
    for (const c of ["VMC", "CTA", "HOTTE_PRO"] as const) {
      const res = equipementSchema.safeParse({
        libelle: "Aération",
        categorie: c,
        estLocalPollutionSpecifique: true,
      });
      expect(res.success).toBe(true);
    }
  });
});

describe("serialiserCaracteristiques", () => {
  it("renvoie null si rien de spécifique n'est positionné", () => {
    const res = equipementSchema.safeParse(base);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(serialiserCaracteristiques(res.data)).toBeNull();
    }
  });

  it("conserve uniquement les clés renseignées", () => {
    const res = equipementSchema.safeParse({
      ...base,
      aGroupeElectrogene: true,
      nombre: 3,
      notes: "  Sur façade ouest  ",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      const json = serialiserCaracteristiques(res.data);
      expect(json).toEqual({
        aGroupeElectrogene: true,
        nombre: 3,
        notes: "Sur façade ouest",
      });
    }
  });
});
