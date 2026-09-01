import { describe, expect, it } from "vitest";
import { estMultiEtablissements } from "./selection";

/**
 * La règle d'affichage du sélecteur (ADR-028), aux trois endroits où elle peut
 * se tromper : zéro, un, deux.
 *
 * Le cas à un est le seul qui compte vraiment. C'est celui d'aujourd'hui pour
 * la quasi-totalité des comptes, et c'est celui où un `>= 1` écrit de travers
 * poserait un menu déroulant annonçant un choix qui n'existe pas.
 */
describe("estMultiEtablissements", () => {
  it("est faux sur un compte sans établissement", () => {
    expect(estMultiEtablissements([])).toBe(false);
  });

  it("est faux sur un compte qui n'en a qu'un — il n'y a rien à commuter", () => {
    expect(estMultiEtablissements([{ id: "etab-A" }])).toBe(false);
  });

  it("devient vrai au deuxième, et pas avant", () => {
    expect(estMultiEtablissements([{ id: "etab-A" }, { id: "etab-B" }])).toBe(
      true,
    );
  });
});
