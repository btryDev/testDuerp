import { describe, expect, it } from "vitest";
import { batimentSchema } from "./schema";

describe("batimentSchema", () => {
  it("accepte un nom seul", () => {
    const r = batimentSchema.safeParse({ nom: "Réserve" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.complementAdresse).toBeUndefined();
  });

  it("refuse un nom vide ou blanc", () => {
    expect(batimentSchema.safeParse({ nom: "" }).success).toBe(false);
    expect(batimentSchema.safeParse({ nom: "   " }).success).toBe(false);
    expect(batimentSchema.safeParse({}).success).toBe(false);
  });

  it("un complément d'adresse vide (formulaire) devient absent", () => {
    const r = batimentSchema.safeParse({ nom: "Atelier", complementAdresse: "  " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.complementAdresse).toBeUndefined();
  });

  it("ne connaît aucun champ de régime (ADR-019)", () => {
    // Un `estERP` passé au formulaire est ignoré : le schéma ne le déclare
    // pas, Zod le retire. Le bâtiment ne peut pas devenir un ERP par la bande.
    const r = batimentSchema.safeParse({ nom: "Annexe", estERP: true });
    expect(r.success).toBe(true);
    if (r.success) expect("estERP" in r.data).toBe(false);
  });
});
