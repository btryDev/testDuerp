import { describe, it, expect } from "vitest";
import { diagnostiquerPlan } from "./schema";

/**
 * Le seuil des 400 heures, tenu par un test parce qu'il s'affiche comme un fait.
 *
 * `R. 4512-7` dit « un nombre total d'heures de travail prévisible **égal au
 * moins à** 400 heures », et ajoute « dès lors qu'il apparaît, en cours
 * d'exécution des travaux, que le nombre d'heures **doit atteindre** 400
 * heures ». Verbatim relevé sur Légifrance le 2026-08-27, version en vigueur
 * au 2008-05-01.
 *
 * Le code comparait `> 400`. À 400 heures pile, il affichait donc « plan écrit
 * recommandé » là où le texte le rend obligatoire — l'inverse exact, sur un
 * écran qui présente le seuil comme un fait de droit.
 */
describe("seuil des 400 h — art. R. 4512-7", () => {
  const diag = (heures: number | null, dangereux = false) =>
    diagnostiquerPlan({
      dureeHeuresEstimee: heures,
      travauxDangereux: dangereux,
    });

  it("rend l'écrit obligatoire à 400 heures pile", () => {
    expect(diag(400).ecritObligatoire).toBe(true);
  });

  it("ne le rend pas obligatoire à 399 heures", () => {
    expect(diag(399).ecritObligatoire).toBe(false);
  });

  it("le rend obligatoire au-delà", () => {
    expect(diag(401).ecritObligatoire).toBe(true);
  });

  it("le rend obligatoire sur des travaux dangereux, quelle que soit la durée", () => {
    // Le 2° de l'article : « quelle que soit la durée prévisible de
    // l'opération ». Les deux motifs sont indépendants, chacun suffit.
    expect(diag(1, true).ecritObligatoire).toBe(true);
    expect(diag(null, true).ecritObligatoire).toBe(true);
  });

  it("dit « atteignent » et non « dépassent »", () => {
    // Le texte dit « atteindre ». « Dépasser » exclut la valeur pivot, et
    // c'est précisément l'erreur que la comparaison portait.
    expect(diag(400).raisons.join(" ")).toContain("atteignent");
  });
});
