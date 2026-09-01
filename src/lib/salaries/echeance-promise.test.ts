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

/** La fiche d'une personne : c'est elle qui NOMME l'état d'un titre échu. */
const SOURCE_FICHE = join(
  process.cwd(),
  "src/app/etablissements/[id]/equipe/[salarieId]/page.tsx",
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

  it("la fiche ne présente pas une échéance saisie comme un état de droit", () => {
    // Le pendant du test précédent, sur l'autre écran et dans l'autre sens.
    // Celui-là garde ce que le produit CALCULE ; celui-ci garde ce qu'il
    // QUALIFIE. La fiche d'une personne peint un titre dont la date est passée
    // et le nomme d'un mot. Tant qu'un seul titre du catalogue porte une
    // périodicité sans durée écrite, ce mot ne peut pas être un simple
    // « Expiré » : sur `elec-salarie-habilitation`, la date saisie vient de
    // l'organisme de formation — `R. 4544-10` renvoie à des modalités de
    // normes qu'il qualifie lui-même de recommandées —, et un état de droit
    // affirmé là-dessus serait une non-conformité inventée.
    //
    // L'ANTÉCÉDENT EST MESURÉ, PAS SUPPOSÉ : si le catalogue cessait de porter
    // un tel titre, la règle n'aurait plus d'objet et le test le dirait au
    // lieu de rester vert pour rien.
    const sansDureeEcrite = cataloguerTitres().filter((o) =>
      SANS_DUREE.has(o.periodicite),
    );
    expect(
      sansDureeEcrite.length,
      "Plus aucun titre sans durée écrite au catalogue : cette garantie n'a " +
        "plus d'objet, la relire avant de la retirer.",
    ).toBeGreaterThan(0);

    const source = readFileSync(SOURCE_FICHE, "utf8");
    const motDuRetard = source.match(/\n\s*enRetard: "([^"]+)",/);
    expect(
      motDuRetard,
      "`MOT_DE_L_ETAT.enRetard` est introuvable dans la fiche : le test ne " +
        "garde plus rien. Retrouver le mot avant de toucher au reste.",
    ).not.toBeNull();

    // Ce que le mot doit dire : à qui appartient l'échéance. Pas une liste de
    // formulations autorisées — elle se réparerait en y ajoutant la suivante.
    expect(
      motDuRetard?.[1],
      `Le mot affiché sur un titre échu est « ${motDuRetard?.[1]} ». Il doit ` +
        `nommer l'échéance DÉCLARÉE : sur un titre sans durée écrite, la date ` +
        `passée est celle que le dirigeant a saisie, jamais un terme légal.`,
    ).toMatch(/déclarée/i);
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
