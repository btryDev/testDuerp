import { describe, expect, it } from "vitest";
import {
  construireGrilleAnnee,
  construireGrilleMois,
  type EvenementGrille,
} from "./grille";

const LE_8_AOUT = new Date(2026, 7, 8);

function ev(id: string, y: number, m: number, d: number): EvenementGrille {
  return {
    id,
    libelle: `Événement ${id}`,
    equipement: `Équipement ${id}`,
    tone: "ok",
    date: new Date(y, m - 1, d, 9, 30),
  };
}

const grille = (mois: Date, evenements: EvenementGrille[] = []) =>
  construireGrilleMois({ mois, evenements, aujourdhui: LE_8_AOUT });

describe("construireGrilleMois — structure", () => {
  it("découpe le mois en semaines entières commençant le lundi", () => {
    const g = grille(LE_8_AOUT);
    for (const s of g.semaines) expect(s).toHaveLength(7);
    // 1er août 2026 = samedi → la grille ouvre le lundi 27 juillet.
    expect(g.semaines[0][0].date).toEqual(new Date(2026, 6, 27));
    expect(g.semaines[0][0].dansLeMois).toBe(false);
  });

  it("couvre le mois sans ligne superflue", () => {
    // Août 2026 : 31 jours, démarre un samedi → 6 semaines.
    expect(grille(LE_8_AOUT).semaines).toHaveLength(6);
    // Février 2027 : 28 jours, démarre un lundi → 4 semaines pile.
    expect(grille(new Date(2027, 1, 15)).semaines).toHaveLength(4);
  });

  it("marque les jours du mois affiché et les jours de débordement", () => {
    const jours = grille(LE_8_AOUT).semaines.flat();
    expect(jours.filter((j) => j.dansLeMois)).toHaveLength(31);
    expect(jours[jours.length - 1].dansLeMois).toBe(false);
  });

  it("marque le jour courant, et lui seul", () => {
    const marques = grille(LE_8_AOUT)
      .semaines.flat()
      .filter((j) => j.estAujourdhui);
    expect(marques.map((j) => j.cle)).toEqual(["2026-08-08"]);
  });

  it("ne marque aucun jour courant sur un autre mois", () => {
    const g = grille(new Date(2026, 10, 3));
    expect(g.semaines.flat().some((j) => j.estAujourdhui)).toBe(false);
  });

  it("titre le mois en français, initiale capitale", () => {
    expect(grille(LE_8_AOUT).libelle).toBe("Août 2026");
  });
});

describe("construireGrilleMois — événements", () => {
  it("range chaque événement dans sa case, quelle que soit l'heure", () => {
    const g = grille(LE_8_AOUT, [ev("a", 2026, 8, 24), ev("b", 2026, 8, 24)]);
    const jour = g.semaines.flat().find((j) => j.cle === "2026-08-24");
    expect(jour?.evenements.map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("affiche les événements des jours de débordement sans les compter", () => {
    // 1er septembre : visible en dernière ligne d'août, mais il compte
    // pour septembre — sinon le total du mois affiché serait faux.
    const g = grille(LE_8_AOUT, [ev("sept", 2026, 9, 1)]);
    const jour = g.semaines.flat().find((j) => j.cle === "2026-09-01");
    expect(jour?.evenements).toHaveLength(1);
    expect(g.nbEvenements).toBe(0);
  });

  it("compte les événements du mois affiché", () => {
    const g = grille(LE_8_AOUT, [
      ev("a", 2026, 8, 3),
      ev("b", 2026, 8, 20),
      ev("hors", 2026, 10, 20),
    ]);
    expect(g.nbEvenements).toBe(2);
  });

  it("trie les événements d'une même journée", () => {
    const tard = ev("tard", 2026, 8, 12);
    tard.date = new Date(2026, 7, 12, 17, 0);
    const tot = ev("tot", 2026, 8, 12);
    tot.date = new Date(2026, 7, 12, 8, 0);
    const g = grille(LE_8_AOUT, [tard, tot]);
    const jour = g.semaines.flat().find((j) => j.cle === "2026-08-12");
    expect(jour?.evenements.map((e) => e.id)).toEqual(["tot", "tard"]);
  });
});

const annee = (
  a: number,
  evenements: EvenementGrille[] = [],
  fenetre?: { debut: Date; fin: Date },
) => construireGrilleAnnee({ annee: a, evenements, aujourdhui: LE_8_AOUT, fenetre });

describe("construireGrilleAnnee", () => {
  it("aligne douze cartes-mois, libellées en français", () => {
    const g = annee(2026);
    expect(g.mois).toHaveLength(12);
    expect(g.mois[0].libelle).toBe("Janv.");
    expect(g.mois[7].libelle).toBe("Août");
    expect(g.mois[7].mois).toEqual(new Date(2026, 7, 1));
  });

  it("compte les événements par mois et par ton", () => {
    const g = annee(2026, [
      { ...ev("a", 2026, 8, 3), tone: "alerte" },
      { ...ev("b", 2026, 8, 20), tone: "warn" },
      ev("c", 2026, 8, 24),
      ev("d", 2026, 11, 2),
    ]);
    expect(g.mois[7].nbParTon).toEqual({ alerte: 1, warn: 1, ok: 1 });
    expect(g.mois[7].nbTotal).toBe(3);
    expect(g.mois[10].nbTotal).toBe(1);
    expect(g.nbEvenements).toBe(4);
  });

  it("ignore les événements des autres années", () => {
    const g = annee(2026, [ev("avant", 2025, 12, 31), ev("apres", 2027, 1, 1)]);
    expect(g.nbEvenements).toBe(0);
    expect(g.mois.every((m) => m.nbTotal === 0)).toBe(true);
  });

  it("marque le mois courant, sur la bonne année seulement", () => {
    expect(annee(2026).mois.map((m) => m.estMoisCourant)).toEqual(
      Array.from({ length: 12 }, (_, m) => m === 7),
    );
    expect(annee(2027).mois.some((m) => m.estMoisCourant)).toBe(false);
  });

  it("grise les mois entièrement hors de la fenêtre chargée", () => {
    // Fenêtre mai 2026 → août 2028 : janvier–avril 2026 sont hors champ,
    // mai reste dedans même si la fenêtre s'ouvre en cours de mois.
    const g = annee(2026, [], {
      debut: new Date(2026, 4, 15),
      fin: new Date(2028, 7, 31),
    });
    expect(g.mois.map((m) => m.dansFenetre)).toEqual(
      Array.from({ length: 12 }, (_, m) => m >= 4),
    );
  });

  it("laisse tout accessible sans fenêtre déclarée", () => {
    expect(annee(2030).mois.every((m) => m.dansFenetre)).toBe(true);
  });
});
