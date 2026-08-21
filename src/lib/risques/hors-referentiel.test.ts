import { describe, expect, it } from "vitest";
import {
  estHorsReferentiel,
  risquesProposesPourUnite,
  unitesHorsReferentiel,
} from "./helpers";

/**
 * Le prédicat existe pour empêcher qu'un écran vide se lise comme une
 * évaluation aboutie. Ces tests fixent les trois cas qui se ressemblent en
 * base et ne veulent pas dire la même chose : une unité issue du référentiel,
 * une unité créée à la main, une unité transverse.
 */

const uniteRef = {
  referentielUniteId: "stockage",
  estTransverse: false,
};
const uniteManuelle = { referentielUniteId: null, estTransverse: false };
const uniteTransverse = { referentielUniteId: null, estTransverse: true };

describe("estHorsReferentiel", () => {
  it("une unité issue du référentiel sectoriel n'est pas signalée", () => {
    expect(estHorsReferentiel(uniteRef)).toBe(false);
  });

  it("une unité ajoutée à la main est signalée", () => {
    expect(estHorsReferentiel(uniteManuelle)).toBe(true);
  });

  it("une unité transverse n'est pas un faux positif", () => {
    // Elle n'a jamais eu d'unité type sectorielle : ses risques viennent du
    // référentiel transverse via les questions détecteurs. Rien ne manque.
    expect(estHorsReferentiel(uniteTransverse)).toBe(false);
  });

  it("l'information absente ne vaut pas hors référentiel", () => {
    // Cas d'un snapshot de version validée avant l'introduction du champ,
    // relu tel quel des années plus tard : on ne sait pas, donc on se tait.
    expect(estHorsReferentiel({ estTransverse: false })).toBe(false);
    expect(estHorsReferentiel({ referentielUniteId: undefined, estTransverse: false })).toBe(
      false,
    );
  });

  it("le signal ne dépend que de la donnée, jamais du nom de l'unité", () => {
    const boucherieHorsRef = {
      nom: "Boucherie",
      referentielUniteId: null,
      estTransverse: false,
    };
    const boucherieDuRef = {
      nom: "Boucherie",
      referentielUniteId: "com-mise-rayon",
      estTransverse: false,
    };
    expect(estHorsReferentiel(boucherieHorsRef)).toBe(true);
    expect(estHorsReferentiel(boucherieDuRef)).toBe(false);
  });
});

describe("unitesHorsReferentiel", () => {
  it("ne retient que les unités sectorielles sans correspondance", () => {
    const unites = [
      { id: "a", ...uniteRef },
      { id: "b", ...uniteManuelle },
      { id: "c", ...uniteTransverse },
    ];
    expect(unitesHorsReferentiel(unites).map((u) => u.id)).toEqual(["b"]);
  });

  it("ne signale rien quand toutes les unités viennent du référentiel", () => {
    expect(unitesHorsReferentiel([{ id: "a", ...uniteRef }])).toEqual([]);
  });
});

describe("cohérence avec les propositions de risques", () => {
  it("une unité signalée est exactement une unité sans proposition", () => {
    // C'est le fait qu'on décrit à l'écran : la liste est vide parce que le
    // référentiel ne connaît pas l'unité, pas parce qu'il n'y a rien à évaluer.
    expect(risquesProposesPourUnite(uniteManuelle.referentielUniteId)).toEqual(
      [],
    );
  });

  it("une unité du référentiel reçoit au moins une proposition", () => {
    // Garde-fou : si l'identifiant type venait à disparaître du référentiel,
    // l'unité cesserait d'être signalée tout en n'ayant plus rien à proposer.
    expect(
      risquesProposesPourUnite(uniteRef.referentielUniteId).length,
    ).toBeGreaterThan(0);
  });
});
