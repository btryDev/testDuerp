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

/**
 * Ce que le seuil ne conditionne PAS, et que le produit laissait croire.
 *
 * `R. 4512-6` fait naître le plan : dès que l'analyse conjointe révèle un
 * risque d'interférence, les employeurs « arrêtent d'un commun accord, avant
 * le début des travaux, un plan de prévention » — quelle que soit la durée.
 * `R. 4512-7` ne commande que l'ÉCRIT. Sous le seuil, le dirigeant doit donc
 * toujours coordonner et inspecter ; le diagnostic lui disait à la place que
 * l'écrit était « fortement recommandé » parce qu'il « protège les deux
 * parties en cas de litige » — un argument de prudence à la place d'une
 * obligation, sur le seul écran qui répond à la question.
 */
describe("sous le seuil, ce qui reste dû", () => {
  const sousLeSeuil = diagnostiquerPlan({
    dureeHeuresEstimee: 120,
    travauxDangereux: false,
  });

  it("le diagnostic ne conclut pas que l'écrit est obligatoire", () => {
    // La borne basse : sans elle, les deux suivantes mesureraient le message
    // de l'autre branche, qui parle d'obligation par construction.
    expect(sousLeSeuil.ecritObligatoire).toBe(false);
  });

  it("il dit que le plan lui-même reste dû", () => {
    expect(
      sousLeSeuil.recommandation,
      "Le message sous le seuil ne dit pas que le plan est dû : le dirigeant " +
        "lit qu'il n'a rien à faire tant qu'il n'atteint pas 400 heures.",
    ).toMatch(/plan reste dû/i);
  });

  it("il nomme les deux actes qui ne dépendent d'aucun seuil", () => {
    // Coordonner et inspecter — c'est la phrase de R. 4512-6 et celle de
    // R. 4512-2, les deux que la durée ne conditionne pas.
    expect(sousLeSeuil.recommandation).toMatch(/inspection commune/i);
    expect(sousLeSeuil.recommandation).toMatch(/accord sur les mesures/i);
  });

  it("il ne présente plus l'écrit comme une précaution contre le litige", () => {
    // Le mot qui portait le défaut : la raison donnée était le litige, pas le
    // texte. Un argument de prudence se discute ; une obligation, non.
    expect(
      sousLeSeuil.recommandation.toLowerCase(),
      "Le diagnostic justifie l'écrit par la protection en cas de litige : " +
        "c'est un conseil, là où R. 4512-6 porte une obligation.",
    ).not.toContain("litige");
  });
});
