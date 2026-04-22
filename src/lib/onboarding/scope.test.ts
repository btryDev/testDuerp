import { describe, expect, it } from "vitest";
import { evaluerScopeSecteur } from "./scope";

describe("evaluerScopeSecteur", () => {
  it("accepte la restauration (56.10A)", () => {
    const r = evaluerScopeSecteur("56.10A");
    expect(r.status).toBe("ok");
    if (r.status === "ok") expect(r.secteurId).toBe("restauration");
  });

  it("accepte le commerce de détail (47.25Z)", () => {
    const r = evaluerScopeSecteur("47.25Z");
    expect(r.status).toBe("ok");
    if (r.status === "ok") expect(r.secteurId).toBe("commerce");
  });

  it("accepte le tertiaire (70.22Z)", () => {
    const r = evaluerScopeSecteur("70.22Z");
    expect(r.status).toBe("ok");
    if (r.status === "ok") expect(r.secteurId).toBe("bureau");
  });

  it("refuse le BTP (43.22A) avec raison nommée", () => {
    const r = evaluerScopeSecteur("43.22A");
    expect(r.status).toBe("hors_perimetre");
    if (r.status === "hors_perimetre") {
      expect(r.raison).toContain("BTP");
    }
  });

  it("refuse la santé (86.10Z) avec raison nommée", () => {
    const r = evaluerScopeSecteur("86.10Z");
    expect(r.status).toBe("hors_perimetre");
    if (r.status === "hors_perimetre") {
      expect(r.raison).toContain("santé");
    }
  });

  it("refuse l'industrie (20.15Z — chimie)", () => {
    const r = evaluerScopeSecteur("20.15Z");
    expect(r.status).toBe("hors_perimetre");
    if (r.status === "hors_perimetre") {
      expect(r.raison).toContain("chimique");
    }
  });

  it("refuse un secteur non nommé (96.02A coiffure)", () => {
    const r = evaluerScopeSecteur("96.02A");
    expect(r.status).toBe("hors_perimetre");
    if (r.status === "hors_perimetre") {
      expect(r.raison).toContain("ne correspond pas");
    }
  });

  it("signale un format invalide (xxx)", () => {
    const r = evaluerScopeSecteur("xxx");
    expect(r.status).toBe("format_invalide");
  });

  it("normalise en majuscules (56.10a → ok)", () => {
    const r = evaluerScopeSecteur("56.10a");
    expect(r.status).toBe("ok");
  });
});
