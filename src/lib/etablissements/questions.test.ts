import { describe, expect, it } from "vitest";
import { questionRepondue } from "./questions";

describe("questions de paramétrage — ce que « répondue » veut dire", () => {
  it("« oui » est une réponse", () => {
    expect(questionRepondue(true)).toBe(true);
  });

  it("« non » AUSSI est une réponse", () => {
    // Le cœur du test. `=== true` passerait les deux autres cas et échouerait
    // ici seulement — et c'est le cas majoritaire : la plupart des dossiers
    // n'ont ni EPI ni demande d'assureur. La checklist ne s'effacerait jamais
    // pour eux.
    expect(questionRepondue(false)).toBe(true);
  });

  it("l'absence de réponse n'en est pas une", () => {
    expect(questionRepondue(null)).toBe(false);
    expect(questionRepondue(undefined)).toBe(false);
  });
});
