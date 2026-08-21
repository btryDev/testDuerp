import { describe, expect, it } from "vitest";
import type { EcheanceCalendrier, FamilleEcheance } from "./echeances";
import { repartirRetards, repartirSous30j } from "./retards";

/**
 * Seules les deux fonctions pures sont testées : ce sont elles qui portent
 * la promesse de l'ADR-015 — sidebar, bandeau du calendrier et tableau de
 * bord lisent le même nombre. `compterEtatEcheances` ne fait qu'y verser
 * deux requêtes déjà couvertes ailleurs.
 */
const LE_10_AOUT = new Date("2026-08-10T00:00:00.000Z");
/** Midi : l'horloge n'est jamais à minuit dans la vraie vie. */
const CE_MIDI = new Date("2026-08-10T12:00:00.000Z");

const echeance = (
  famille: FamilleEcheance,
  tone: "alerte" | "ok",
  date: Date = LE_10_AOUT,
): EcheanceCalendrier => ({
  id: `${famille}-${tone}-${date.getTime()}`,
  // La famille est ce que le test pilote ; le type n'a qu'à être cohérent.
  type: famille === "controle" ? "verification" : "action-duerp",
  famille,
  libelle: "Peu importe",
  origine: "Peu importe",
  date,
  tone,
  href: "#",
  batiment: null,
});

describe("repartirRetards", () => {
  it("ventile les échéances dépassées par famille", () => {
    const r = repartirRetards(
      [
        echeance("travaux", "alerte"),
        echeance("travaux", "alerte"),
        echeance("papiers", "alerte"),
      ],
      0,
    );

    expect(r.parFamille.travaux).toBe(2);
    expect(r.parFamille.papiers).toBe(1);
  });

  it("ignore ce qui n'est pas dépassé", () => {
    const r = repartirRetards(
      [echeance("travaux", "ok"), echeance("papiers", "ok")],
      0,
    );

    expect(r.total).toBe(0);
    expect(r.parFamille.travaux).toBe(0);
  });

  it("compte le total sur toutes les familles, vérifications incluses", () => {
    const r = repartirRetards(
      [
        echeance("controle", "alerte"),
        echeance("travaux", "alerte"),
        echeance("papiers", "alerte"),
      ],
      3,
    );

    expect(r.total).toBe(6);
  });

  it("distingue les vérifications du reste de la famille « controle »", () => {
    // Une analyse légionelle est rangée en famille `controle` par le
    // registre : elle pèse dans `parFamille.controle`, jamais dans le
    // badge « Contrôles matériel ».
    const r = repartirRetards([echeance("controle", "alerte")], 3);

    expect(r.verifications).toBe(3);
    expect(r.parFamille.controle).toBe(4);
  });

  it("présente toutes les familles, même celles sans ligne", () => {
    const r = repartirRetards([], 0);

    expect(r.parFamille).toEqual({
      controle: 0,
      travaux: 0,
      operations: 0,
      papiers: 0,
      personnel: 0,
    });
    expect(r.total).toBe(0);
  });

  it("compte les vérifications même sans aucune autre échéance", () => {
    const r = repartirRetards([], 5);

    expect(r.total).toBe(5);
    expect(r.parFamille.controle).toBe(5);
  });
});

describe("repartirSous30j", () => {
  /** `jours` jours après le 10 août, à minuit — comme une date stockée. */
  const dans = (jours: number) =>
    new Date(LE_10_AOUT.getTime() + jours * 86_400_000);

  it("retient ce qui tombe dans la fenêtre, aujourd'hui compris", () => {
    const v = repartirSous30j(
      [
        echeance("papiers", "ok", dans(0)),
        echeance("operations", "ok", dans(30)),
      ],
      0,
      CE_MIDI,
    );

    expect(v.parFamille.papiers).toBe(1);
    expect(v.parFamille.operations).toBe(1);
    expect(v.total).toBe(2);
  });

  it("écarte le trente-et-unième jour", () => {
    const v = repartirSous30j(
      [echeance("papiers", "ok", dans(31))],
      0,
      CE_MIDI,
    );

    expect(v.total).toBe(0);
  });

  it("n'y range jamais ce qui est déjà dépassé", () => {
    // Le ton `alerte` est le marqueur du dépassement : une échéance
    // d'hier ne peut pas être annoncée deux fois, en retard *et* à venir.
    const v = repartirSous30j(
      [echeance("travaux", "alerte", dans(-1))],
      0,
      CE_MIDI,
    );

    expect(v.total).toBe(0);
  });

  it("verse les vérifications à venir dans la famille des contrôles", () => {
    const v = repartirSous30j([], 4, CE_MIDI);

    expect(v.parFamille.controle).toBe(4);
    expect(v.total).toBe(4);
  });

  it("présente toutes les familles, même celles sans ligne", () => {
    const v = repartirSous30j([], 0, CE_MIDI);

    expect(v.parFamille).toEqual({
      controle: 0,
      travaux: 0,
      operations: 0,
      papiers: 0,
      personnel: 0,
    });
  });
});
