import { describe, expect, it } from "vitest";

/**
 * Règles de conversion de statut UI (wizard DUERP) → Action (V2).
 * Décrites dans ADR-002 :
 *   existante            → levee
 *   prevue + futur/nulle → ouverte
 *   prevue + passé       → en_cours
 *
 * Ces tests formalisent les invariants qu'on attend des server actions
 * (ajouterMesureCustom, modifierMesure). Le mapping réciproque est testé
 * dans actions.test.ts via actionVersMesureUI.
 */

type StatutUI = "existante" | "prevue";
type StatutAction = "ouverte" | "en_cours" | "levee" | "abandonnee";

function mapper(
  statut: StatutUI,
  echeance: Date | null,
  now: Date = new Date(),
): StatutAction {
  if (statut === "existante") return "levee";
  if (echeance && echeance.getTime() < now.getTime()) return "en_cours";
  return "ouverte";
}

describe("statut UI → Action (wizard DUERP)", () => {
  const now = new Date("2026-04-21T12:00:00Z");

  it("'existante' devient 'levee' quelle que soit l'échéance", () => {
    expect(mapper("existante", null, now)).toBe("levee");
    expect(mapper("existante", new Date("2020-01-01"), now)).toBe("levee");
    expect(mapper("existante", new Date("2030-01-01"), now)).toBe("levee");
  });

  it("'prevue' + échéance future devient 'ouverte'", () => {
    expect(mapper("prevue", new Date("2026-12-01"), now)).toBe("ouverte");
  });

  it("'prevue' + échéance passée devient 'en_cours'", () => {
    expect(mapper("prevue", new Date("2025-01-01"), now)).toBe("en_cours");
  });

  it("'prevue' sans échéance devient 'ouverte'", () => {
    expect(mapper("prevue", null, now)).toBe("ouverte");
  });
});
