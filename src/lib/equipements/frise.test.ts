import { describe, expect, it } from "vitest";
import { construireFrise, type JalonFrise } from "./frise";

/** Dates civiles à minuit UTC, horloge à un instant réel (ADR-011). */
const jour = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
/** 20 août 2026, 9 h à Paris. */
const AUJOURDHUI = new Date("2026-08-20T07:00:00Z");

const jalon = (
  cle: string,
  date: string,
  o: Partial<JalonFrise> = {},
): JalonFrise => ({
  cle,
  date: jour(date),
  libelle: o.libelle ?? cle,
  etat: o.etat ?? "faite",
  ...o,
});

describe("construireFrise", () => {
  it("ne rend rien tant qu'il n'y a qu'un seul jalon", () => {
    expect(
      construireFrise({
        jalons: [jalon("mes", "2021-03-03")],
        maintenant: AUJOURDHUI,
      }),
    ).toBeNull();
  });

  it("borne l'axe au premier et au dernier jalon", () => {
    const f = construireFrise({
      jalons: [
        jalon("fin", "2027-02-10", { etat: "lointain" }),
        jalon("debut", "2021-03-03"),
        jalon("milieu", "2024-02-20"),
      ],
      maintenant: AUJOURDHUI,
    })!;

    expect(f.debut).toEqual(jour("2021-03-03"));
    expect(f.fin).toEqual(jour("2027-02-10"));
    // Les jalons ressortent triés, quel que soit l'ordre d'entrée.
    expect(f.jalons.map((j) => j.cle)).toEqual(["debut", "milieu", "fin"]);
    expect(f.jalons[0].position).toBe(0);
    expect(f.jalons[2].position).toBe(1);
    expect(f.jalons[1].position).toBeGreaterThan(0);
    expect(f.jalons[1].position).toBeLessThan(1);
  });

  it("place le repère du jour proportionnellement à l'axe", () => {
    // Deux ans jour pour jour, aujourd'hui à mi-parcours (± un jour).
    const f = construireFrise({
      jalons: [jalon("a", "2025-08-20"), jalon("b", "2027-08-20")],
      maintenant: AUJOURDHUI,
    })!;

    expect(f.aujourdhui).toBeCloseTo(0.5, 2);
  });

  it("étire l'axe jusqu'à aujourd'hui quand tout est derrière", () => {
    // Un appareil dont la dernière échéance est dépassée : sans cet
    // étirement, le présent tomberait hors cadre et la frise cesserait de
    // dire où l'on en est.
    const f = construireFrise({
      jalons: [jalon("a", "2022-03-01"), jalon("b", "2026-06-14")],
      maintenant: AUJOURDHUI,
    })!;

    expect(f.fin).toEqual(AUJOURDHUI);
    expect(f.aujourdhui).toBe(1);
    expect(f.jalons[1].position).toBeLessThan(1);
  });

  it("étire l'axe en arrière quand tout est devant", () => {
    const f = construireFrise({
      jalons: [jalon("a", "2027-01-01"), jalon("b", "2028-01-01")],
      maintenant: AUJOURDHUI,
    })!;

    expect(f.debut).toEqual(AUJOURDHUI);
    expect(f.aujourdhui).toBe(0);
  });

  it("empile les jalons du même jour plutôt que de diviser par zéro", () => {
    const f = construireFrise({
      jalons: [
        jalon("a", "2026-08-20"),
        jalon("b", "2026-08-20", { etat: "proche" }),
      ],
      maintenant: AUJOURDHUI,
    })!;

    expect(f.jalons.every((j) => j.position === 0)).toBe(true);
    expect(f.aujourdhui).toBe(0);
    expect(Number.isNaN(f.aujourdhui)).toBe(false);
  });

  it("compte en jours civils : le passage à l'heure d'été ne décale rien", () => {
    // Bornes posées à minuit heure de Paris de part et d'autre du 29 mars
    // 2026 : en millisecondes, l'axe perd une heure et le point du milieu
    // glisse. En jours civils, il tombe pile au tiers. L'axe est étiré
    // jusqu'à aujourd'hui, d'où le dénominateur de 172 jours.
    const f = construireFrise({
      jalons: [
        jalon("a", "2026-03-01"),
        jalon("m", "2026-04-01"),
        jalon("b", "2026-06-01"),
      ],
      maintenant: AUJOURDHUI,
    })!;

    expect(f.jalons[1].position).toBeCloseTo(31 / 172, 6);
  });

  it("range la vedette et les seconds sur la rangée basse", () => {
    const f = construireFrise({
      jalons: [
        jalon("mes", "2022-03-01"),
        jalon("next", "2026-09-01", { etat: "proche", vedette: true }),
        jalon("autre", "2026-10-01", { etat: "lointain", second: true }),
      ],
      maintenant: AUJOURDHUI,
    })!;

    const rangee = Object.fromEntries(f.jalons.map((j) => [j.cle, j.rangee]));
    expect(rangee).toEqual({ mes: "haute", next: "basse", autre: "basse" });
  });

  it("efface l'étiquette d'un jalon trop serré contre son voisin", () => {
    // Deux réalisations à quelques jours d'écart sur un axe de quatre ans :
    // les deux points restent, un seul mot s'écrit.
    const f = construireFrise({
      jalons: [
        jalon("mes", "2022-03-01"),
        jalon("v1", "2026-02-10"),
        jalon("v2", "2026-02-20"),
      ],
      maintenant: AUJOURDHUI,
    })!;

    expect(f.jalons.every((j) => j.position >= 0 && j.position <= 1)).toBe(true);
    expect(f.jalons.filter((j) => j.etiquette).length).toBeLessThan(3);
  });

  it("laisse la place au repère du jour sur la rangée haute", () => {
    // Une réalisation la semaine dernière : son étiquette se cognerait à
    // « aujourd'hui », c'est elle qui cède.
    const f = construireFrise({
      jalons: [jalon("mes", "2026-08-01"), jalon("v1", "2026-08-18")],
      maintenant: AUJOURDHUI,
    })!;

    expect(f.jalons.find((j) => j.cle === "v1")!.etiquette).toBe(false);
  });
});
