import { describe, expect, it } from "vitest";
import type { EcheanceCalendrier, FamilleEcheance } from "./echeances";
import { repartirRetards } from "./retards";

/**
 * Seul `repartirRetards` est testé : c'est la partie pure, et c'est elle
 * qui porte la promesse de l'ADR-015 — sidebar et bandeau du calendrier
 * lisent le même nombre. `compterEnRetardParFamille` ne fait qu'y verser
 * deux requêtes déjà couvertes ailleurs.
 */
const echeance = (
  famille: FamilleEcheance,
  tone: "alerte" | "ok",
): EcheanceCalendrier => ({
  id: `${famille}-${tone}-${Math.abs(famille.length * 7)}`,
  // La famille est ce que le test pilote ; le type n'a qu'à être cohérent.
  type: famille === "controle" ? "verification" : "intervention",
  famille,
  libelle: "Peu importe",
  origine: "Peu importe",
  date: new Date("2026-08-10T00:00:00.000Z"),
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
