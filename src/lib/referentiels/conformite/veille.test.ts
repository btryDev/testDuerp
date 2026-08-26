// La liste de travail de la veille, vérifiée sur le référentiel réel.
//
// L'horloge est injectée : sans cela, « constaté il y a plus d'un an » serait
// vrai un jour et faux la veille, et le test raconterait le calendrier plutôt
// que le référentiel.

import { describe, expect, it } from "vitest";
import { construireListe } from "../../../../scripts/veille-worklist";
import { obligationsConformite } from "./index";

const LE_JOUR = new Date("2026-08-26T12:00:00Z");

describe("veille — liste de travail", () => {
  it("dépouille toutes les références porteuses d'une URL", () => {
    const attendu = obligationsConformite.flatMap((o) =>
      o.referencesLegales.filter((r) => r.url),
    ).length;
    expect(construireListe(LE_JOUR).stats.references).toBe(attendu);
  });

  it("classe une référence jamais constatée comme telle", () => {
    const { entrees } = construireListe(LE_JOUR);
    for (const e of entrees) {
      if (e.versionConstatee === null) {
        expect(e.motif, e.reference).toBe("jamais_constatee");
        expect(e.anciennete, e.reference).toBeNull();
      }
    }
  });

  it("extrait l'identifiant Légifrance de l'URL quand il y en a un", () => {
    const { entrees } = construireListe(LE_JOUR);
    const avecId = entrees.filter((e) => e.identifiants.length > 0);
    // Le référentiel cite Légifrance pour l'essentiel : si presque plus
    // aucune entrée ne porte d'identifiant, c'est que les URL ont changé de
    // forme et que la liste de travail est devenue aveugle.
    expect(avecId.length).toBeGreaterThan(entrees.length / 2);
    for (const e of avecId) {
      for (const id of e.identifiants) {
        expect(id, e.url).toMatch(/^(LEGIARTI|LEGISCTA|LEGITEXT|JORFTEXT|KALIARTI)\d+$/);
      }
    }
  });

  it("met le plus critique et le moins constaté en tête", () => {
    const { entrees } = construireListe(LE_JOUR);
    for (let i = 1; i < entrees.length; i++) {
      const a = entrees[i - 1];
      const b = entrees[i];
      expect(a.criticite, `${a.obligationId} avant ${b.obligationId}`)
        .toBeGreaterThanOrEqual(b.criticite);
    }
  });

  it("compte les jours écoulés depuis un constat", () => {
    const { entrees } = construireListe(new Date("2026-08-26T00:00:00Z"));
    const constatee = entrees.find((e) => e.versionConstatee === "2026-07-01");
    expect(constatee, "aucune référence constatée au 1er juillet 2026").toBeDefined();
    expect(constatee?.anciennete).toBe(56);
    expect(constatee?.motif).toBe("a_jour");
  });

  it("rend les rendez-vous de relecture avec le temps qui reste", () => {
    const { rendezVous } = construireListe(new Date("2026-08-26T00:00:00Z"));
    const rdv = rendezVous.find((r) => r.le === "2027-01-01");
    expect(rdv, "le rendez-vous du 1er janvier 2027 a disparu").toBeDefined();
    expect(rdv?.joursRestants).toBe(128);
  });
});
