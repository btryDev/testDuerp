import { describe, expect, it } from "vitest";
import {
  construireFrise,
  ECART_MIN_PCT,
  MAX_MARQUEURS,
  type EvenementFrise,
} from "./frise";

const LE_8_AOUT = new Date(2026, 7, 8);

function ev(
  id: string,
  dansNJours: number,
  tone: EvenementFrise["tone"] = "ok",
): EvenementFrise {
  return {
    id,
    libelle: `Événement ${id}`,
    equipement: `Équipement ${id}`,
    tone,
    date: new Date(LE_8_AOUT.getTime() + dansNJours * 86400000),
  };
}

const frise = (evenements: EvenementFrise[], horizonJours = 90) =>
  construireFrise({ evenements, aujourdhui: LE_8_AOUT, horizonJours });

describe("construireFrise — retards", () => {
  it("épingle les événements passés hors de l'axe", () => {
    const f = frise([ev("a", -5), ev("b", -1), ev("c", 20)]);
    expect(f.nbEnRetard).toBe(2);
    expect(f.marqueurs.map((m) => m.id)).toEqual(["c"]);
  });

  it("place un événement du jour à l'origine de l'axe", () => {
    expect(frise([ev("a", 0)]).marqueurs[0].pct).toBe(0);
  });
});

describe("construireFrise — placement", () => {
  it("positionne en pourcentage de l'horizon", () => {
    const f = frise([ev("a", 45)]);
    expect(f.marqueurs[0].pct).toBeCloseTo(50, 5);
  });

  it("ignore ce qui dépasse l'horizon", () => {
    const f = frise([ev("a", 30), ev("b", 120)]);
    expect(f.marqueurs.map((m) => m.id)).toEqual(["a"]);
    expect(f.nbMasques).toBe(0);
  });

  it("alterne les côtés pour éviter le chevauchement", () => {
    const f = frise([ev("a", 0), ev("b", 20), ev("c", 40), ev("d", 60)]);
    expect(f.marqueurs.map((m) => m.cote)).toEqual([
      "haut",
      "bas",
      "haut",
      "bas",
    ]);
  });

  it("trie par date même si l'entrée ne l'est pas", () => {
    const f = frise([ev("c", 60), ev("a", 10), ev("b", 35)]);
    expect(f.marqueurs.map((m) => m.id)).toEqual(["a", "b", "c"]);
  });

  it("formate la date en libellé court majuscule", () => {
    // 8 août + 47 j = 24 septembre 2026
    expect(frise([ev("a", 47)]).marqueurs[0].libelleDate).toBe("24 SEPT.");
  });
});

describe("construireFrise — dégraissage", () => {
  it("écarte les événements trop rapprochés et le dit", () => {
    // 4 événements sur 9 jours : moins de ECART_MIN_PCT % d'écart chacun.
    const f = frise([ev("a", 1), ev("b", 3), ev("c", 6), ev("d", 9)]);
    expect(f.marqueurs).toHaveLength(1);
    expect(f.nbMasques).toBe(3);
  });

  it("respecte le seuil d'écart minimal", () => {
    const jours = Math.ceil((ECART_MIN_PCT / 100) * 90) + 1;
    const f = frise([ev("a", 0), ev("b", jours)]);
    expect(f.marqueurs).toHaveLength(2);
  });

  it("étale la sélection sur une série régulière", () => {
    // Régression : huit échéances tous les 11 jours sont toutes sous le
    // seuil d'écart. Un filtre glouton n'en gardait qu'une et masquait les
    // sept autres — la frise paraissait vide alors qu'elle était pleine.
    const evs = Array.from({ length: 8 }, (_, i) => ev(`e${i}`, 4 + i * 11));
    const f = frise(evs);
    // 4 et non 5 : l'échantillonnage régulier en propose 5, dont deux
    // finissent à 12 % l'un de l'autre — l'anti-chevauchement en écarte un.
    expect(f.marqueurs).toHaveLength(4);
    expect(f.nbMasques).toBe(4);
    // Ce qui compte : la sélection couvre toute la largeur de l'axe.
    expect(f.marqueurs[0].pct).toBeLessThan(15);
    expect(f.marqueurs[f.marqueurs.length - 1].pct).toBeGreaterThan(80);
  });

  it("garde tous les événements quand ils sont peu nombreux et espacés", () => {
    const f = frise([ev("a", 5), ev("b", 30), ev("c", 60)]);
    expect(f.marqueurs.map((m) => m.id)).toEqual(["a", "b", "c"]);
    expect(f.nbMasques).toBe(0);
  });

  it("plafonne le nombre de marqueurs et comptabilise le reste", () => {
    // 9 événements espacés de 14 j : 7 tombent dans les 90 jours, on en
    // affiche 5. `nbMasques` ne compte que les 2 écartés de l'horizon —
    // pas les 2 qui sont simplement hors fenêtre.
    const evs = Array.from({ length: 9 }, (_, i) => ev(`e${i}`, i * 14));
    const f = frise(evs);
    expect(f.marqueurs).toHaveLength(MAX_MARQUEURS);
    expect(f.nbMasques).toBe(2);
  });

  it("laisse une alerte prendre la place d'un événement calme voisin", () => {
    const f = frise([ev("calme", 2, "ok"), ev("urgent", 4, "alerte")]);
    expect(f.marqueurs.map((m) => m.id)).toEqual(["urgent"]);
  });

  it("ne remplace pas une alerte par une autre alerte voisine", () => {
    const f = frise([ev("premier", 2, "alerte"), ev("second", 4, "alerte")]);
    expect(f.marqueurs.map((m) => m.id)).toEqual(["premier"]);
  });
});

describe("construireFrise — graduations", () => {
  it("ouvre sur le mois courant à l'origine", () => {
    expect(frise([]).mois[0]).toEqual({ label: "Août", pct: 0 });
  });

  it("gradue chaque 1er du mois compris dans l'horizon", () => {
    expect(frise([]).mois.map((m) => m.label)).toEqual([
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
    ]);
  });

  it("suit l'horizon quand il change", () => {
    expect(frise([], 30).mois.map((m) => m.label)).toEqual(["Août", "Septembre"]);
  });

  it("garde les graduations dans l'axe", () => {
    for (const m of frise([]).mois) {
      expect(m.pct).toBeGreaterThanOrEqual(0);
      expect(m.pct).toBeLessThanOrEqual(100);
    }
  });
});
