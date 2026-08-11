import { describe, expect, it } from "vitest";
import {
  TENTATIVES_NUMEROTATION,
  estConflitDeNumeroVersion,
} from "./numerotation";

/** Forme d'une erreur Prisma de contrainte unique. */
function erreurPrisma(code: string, target?: unknown) {
  return { code, meta: target === undefined ? undefined : { target } };
}

describe("estConflitDeNumeroVersion", () => {
  it("reconnaît une collision sur (duerpId, numero)", () => {
    expect(
      estConflitDeNumeroVersion(erreurPrisma("P2002", ["duerpId", "numero"])),
    ).toBe(true);
  });

  it("accepte la cible sous forme de chaîne", () => {
    expect(
      estConflitDeNumeroVersion(
        erreurPrisma("P2002", "DuerpVersion_duerpId_numero_key"),
      ),
    ).toBe(true);
  });

  it("considère un P2002 sans cible comme rejouable", () => {
    // La seule contrainte unique de la table est (duerpId, numero).
    expect(estConflitDeNumeroVersion(erreurPrisma("P2002"))).toBe(true);
  });

  it("ignore une contrainte unique portant sur un autre champ", () => {
    expect(estConflitDeNumeroVersion(erreurPrisma("P2002", ["siret"]))).toBe(
      false,
    );
  });

  it("laisse remonter toute autre erreur", () => {
    // Masquer une panne réelle en la prenant pour un conflit de
    // concurrence ferait perdre silencieusement une version de DUERP.
    expect(estConflitDeNumeroVersion(erreurPrisma("P1001"))).toBe(false);
    expect(estConflitDeNumeroVersion(new Error("connexion perdue"))).toBe(false);
    expect(estConflitDeNumeroVersion(null)).toBe(false);
    expect(estConflitDeNumeroVersion("P2002")).toBe(false);
  });

  it("laisse au moins une reprise possible", () => {
    expect(TENTATIVES_NUMEROTATION).toBeGreaterThanOrEqual(2);
  });
});
