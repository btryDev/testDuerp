import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { comparerLignes, ordonnerLignes } from "./ordre";

/**
 * L'ordre de « Ce qui doit être en place » ne bouge pas quand on déclare.
 *
 * CE QUE CE TEST EMPÊCHE, et qui est arrivé : le tri poussait les lignes
 * déclarées au bas de leur groupe. Déclarer la première ligne d'un domaine la
 * faisait descendre et remontait toutes les suivantes d'un rang — **deux clics
 * au même pixel déclaraient deux obligations différentes**. Reproduit à l'écran
 * le 2026-09-03 sur ÉLECTRICITÉ, où « Consignation des rapports » passait du
 * premier au troisième rang et « Habilitation électrique » prenait sa place.
 *
 * Ce n'est pas une gêne d'affichage : la page écrit elle-même que ce qui est
 * déclaré part au dossier remis à un tiers, avec sa date.
 */

type Ligne = {
  obligation: { id: string; libelle: string };
  declareLe: Date | null;
};

const CORPUS: Ligne[] = [
  {
    obligation: {
      id: "elec-travail-consignation-registre",
      libelle: "Consignation des rapports de vérification électrique au registre",
    },
    declareLe: null,
  },
  {
    obligation: {
      id: "elec-travail-habilitation-personnel",
      libelle:
        "Habilitation électrique du personnel opérant sur ou à proximité d'installations électriques",
    },
    declareLe: null,
  },
  {
    obligation: {
      id: "elec-salarie-carnet-prescriptions",
      libelle: "Remise d'un carnet de prescriptions à chaque travailleur habilité",
    },
    declareLe: null,
  },
];

const rangs = (lignes: Ligne[]) =>
  ordonnerLignes([...lignes]).map((l) => l.obligation.id);

describe("l'ordre ne dépend pas de la déclaration", () => {
  it("déclarer une ligne ne déplace aucune ligne", () => {
    const avant = rangs(CORPUS);

    // On déclare celle du premier rang — le cas exact qui a été vu.
    for (const cible of CORPUS) {
      const apres = rangs(
        CORPUS.map((l) =>
          l.obligation.id === cible.obligation.id
            ? { ...l, declareLe: new Date("2026-09-03") }
            : l,
        ),
      );
      expect(apres).toEqual(avant);
    }
  });

  it("déclarer TOUTES les lignes ne déplace aucune ligne", () => {
    expect(
      rangs(CORPUS.map((l) => ({ ...l, declareLe: new Date("2026-09-03") }))),
    ).toEqual(rangs(CORPUS));
  });

  it("l'ordre est total : deux libellés identiques se départagent", () => {
    const meme = (id: string) => ({ obligation: { id, libelle: "Même mot" } });
    expect(comparerLignes(meme("b"), meme("a"))).toBeGreaterThan(0);
    expect(comparerLignes(meme("a"), meme("b"))).toBeLessThan(0);
    expect(comparerLignes(meme("a"), meme("a"))).toBe(0);
  });

  it("l'ordre reste alphabétique — sinon il ne se relit pas deux fois pareil", () => {
    expect(rangs(CORPUS)).toEqual([
      "elec-travail-consignation-registre",
      "elec-travail-habilitation-personnel",
      "elec-salarie-carnet-prescriptions",
    ]);
  });
});

/**
 * La garantie ci-dessus ne tient que si la lecture PASSE par `ordonnerLignes`.
 * Un tri réintroduit dans `queries.ts` la contournerait sans faire rougir une
 * seule assertion : le comparateur resterait juste, et l'écran redeviendrait
 * faux.
 */
describe("la lecture n'a pas d'ordre à elle", () => {
  const queries = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "queries.ts"),
    "utf8",
  );

  it("`queries.ts` ne trie jamais sur `declareLe`", () => {
    // Un tri sur la date de déclaration, sous quelque forme que ce soit.
    const lignes = queries
      .split("\n")
      .filter((l) => /declareLe/.test(l) && !l.trimStart().startsWith("//"));
    // `declareLe` reste lu — la ligne le porte, l'en-tête la compte. Ce qui est
    // interdit, c'est qu'un comparateur la lise.
    expect(lignes.some((l) => /sort|localeCompare|return .*\?.*-1/.test(l))).toBe(
      false,
    );
  });

  it("le tri des lignes passe par `ordonnerLignes`", () => {
    expect(queries).toContain("ordonnerLignes(lignes)");
    expect(queries).toContain("ordonnerLignes(faits)");
  });
});
