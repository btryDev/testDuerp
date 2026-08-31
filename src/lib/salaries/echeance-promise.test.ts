import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cataloguerTitres } from "./catalogue";
import { PERIODICITE_EN_JOURS } from "@/lib/referentiels/types-communs";

/**
 * Ce que l'écran promet sur l'échéance doit être ce que le générateur fait.
 *
 * `FormulaireTitre` a longtemps affiché, sous le champ « Valable jusqu'au » :
 * « Laissez vide si aucune date n'est portée sur le titre. **Rojer
 * n'inventera pas d'échéance.** »
 *
 * C'était vrai par coïncidence, pas par construction. Le générateur calcule
 * `t.echeanceLe ?? prochaineDate(t.delivreLe, o.periodicite)`
 * (`calendrier/generateur.ts`) : il n'invente rien tant que `prochaineDate`
 * rend `null`, ce qu'elle fait pour les seules périodicités dont
 * `PERIODICITE_EN_JOURS` vaut `null` — `autre` et
 * `mise_en_service_uniquement`. Le catalogue ne contenait qu'un titre, en
 * `autre` : la promesse tenait.
 *
 * Le lot 7 y a fait entrer six titres à durée chiffrée. La promesse est
 * devenue fausse pour eux, et fausse dans le sens permissif : sur une VIP, la
 * date calculée est le PLAFOND de cinq ans, alors que le médecin du travail a
 * pu fixer trois ans. Une échéance inventée, et la plus tardive possible.
 *
 * C'est aussi ce qui ruinait le garde-fou invoqué pour encoder ces plafonds —
 * « `TitreSalarie.echeanceLe` déclaré par l'employeur prime sur tout calcul ».
 * Il ne prime que si le dirigeant saisit la date, et l'aide du champ l'en
 * dissuadait expressément.
 *
 * Ce test lie les deux faits pour qu'ils ne puissent plus diverger en silence.
 */

const SOURCE_FORMULAIRE = join(
  process.cwd(),
  "src/components/salaries/FormulaireTitre.tsx",
);

/** Les périodicités pour lesquelles le générateur ne calcule rien. */
const SANS_DUREE = new Set(
  Object.entries(PERIODICITE_EN_JOURS)
    .filter(([, jours]) => jours === null)
    .map(([p]) => p),
);

describe("la promesse d'échéance de l'écran et ce que le générateur fait", () => {
  it("l'écran ne promet plus rien sans condition", () => {
    // La promesse inconditionnelle est le défaut lui-même : elle vaut pour
    // tout le catalogue, alors qu'elle n'est vraie que d'une partie.
    const source = readFileSync(SOURCE_FORMULAIRE, "utf8");
    expect(
      source.includes(
        "Laissez vide si aucune date n'est portée sur le titre. Rojer n'inventera pas d'échéance.",
      ),
      "L'aide du champ « Valable jusqu'au » promet, pour TOUS les titres, que " +
        "Rojer n'inventera pas d'échéance. C'est faux dès qu'un titre porte une " +
        "durée chiffrée : le générateur calcule alors `delivreLe + periodicite`.",
    ).toBe(false);
  });

  it("l'écran distingue les deux cas, et le catalogue contient bien les deux", () => {
    // Sans cette contre-épreuve, retirer purement et simplement la phrase
    // ferait passer le test précédent — vert pour la mauvaise raison.
    const source = readFileSync(SOURCE_FORMULAIRE, "utf8");
    expect(source).toContain("SANS_DUREE");
    expect(source).toContain("LABEL_PERIODICITE");

    const titres = cataloguerTitres();
    const calculables = titres.filter((o) => !SANS_DUREE.has(o.periodicite));
    const permanents = titres.filter((o) => SANS_DUREE.has(o.periodicite));

    // Si l'un des deux groupes se vidait, l'aide conditionnelle n'aurait plus
    // de raison d'être et quelqu'un la simplifierait — en réintroduisant le
    // défaut. Le test le dira avant.
    expect(
      calculables.length,
      "Aucun titre à durée chiffrée : l'aide conditionnelle est devenue inutile.",
    ).toBeGreaterThan(0);
    expect(
      permanents.length,
      "Aucun titre permanent : l'aide conditionnelle est devenue inutile.",
    ).toBeGreaterThan(0);
  });

  it("tout titre à durée chiffrée produit bien une échéance calculée", () => {
    // Le fait que l'écran doit annoncer, vérifié sur le référentiel livré
    // plutôt que sur la lecture du code du générateur.
    for (const o of cataloguerTitres()) {
      if (SANS_DUREE.has(o.periodicite)) continue;
      expect(
        PERIODICITE_EN_JOURS[o.periodicite],
        `${o.id} (${o.periodicite}) : périodicité chiffrée sans durée en jours`,
      ).not.toBeNull();
    }
  });
});
