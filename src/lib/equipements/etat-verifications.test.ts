import { describe, expect, it } from "vitest";
import { repartirParEquipement } from "./etat-verifications";

/**
 * Dates civiles à minuit UTC, horloge à un instant réel (ADR-011).
 */
const jour = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
/** 10 août 2026, 9 h à Paris. */
const AUJOURDHUI = new Date("2026-08-10T07:00:00Z");

const verif = (
  equipementId: string,
  datePrevue: string,
  o: { statut?: string; dateRealisee?: string; libelle?: string } = {},
) => ({
  equipementId,
  libelleObligation: o.libelle ?? "Vérification annuelle",
  statut: o.statut ?? "planifiee",
  datePrevue: jour(datePrevue),
  dateRealisee: o.dateRealisee ? jour(o.dateRealisee) : null,
});

describe("repartirParEquipement", () => {
  it("compte les dépassées par appareil", () => {
    const m = repartirParEquipement(
      [
        verif("eq1", "2026-06-01"),
        verif("eq1", "2026-07-01"),
        verif("eq2", "2026-09-01"),
      ],
      AUJOURDHUI,
    );

    expect(m.get("eq1")?.enRetard).toBe(2);
    expect(m.get("eq2")?.enRetard).toBe(0);
  });

  it("retient la prochaine échéance à venir, pas la plus lointaine", () => {
    const m = repartirParEquipement(
      [
        verif("eq1", "2026-09-01", { libelle: "Extincteurs" }),
        verif("eq1", "2027-01-01", { libelle: "Électricité" }),
      ],
      AUJOURDHUI,
    );

    expect(m.get("eq1")?.prochaine?.libelle).toBe("Extincteurs");
    expect(m.get("eq1")?.prochaine?.date).toEqual(jour("2026-09-01"));
  });

  it("prend une occurrence dépassée comme prochaine si rien d'autre n'attend", () => {
    // Le retard EST le prochain rendez-vous : le taire donnerait un appareil
    // qui n'annonce rien alors qu'il est le plus urgent du parc.
    const m = repartirParEquipement([verif("eq1", "2026-06-01")], AUJOURDHUI);

    expect(m.get("eq1")?.prochaine?.etat).toBe("enRetard");
  });

  it("n'annonce jamais une occurrence « à planifier » comme rendez-vous", () => {
    // Sa `datePrevue` est une date de génération, pas une date choisie
    // (ADR-010) : la poser comme prochaine échéance mentirait.
    const m = repartirParEquipement(
      [verif("eq1", "2026-12-01", { statut: "a_planifier" })],
      AUJOURDHUI,
    );

    expect(m.get("eq1")?.prochaine).toBeNull();
    expect(m.get("eq1")?.aPlanifier).toBe(1);
  });

  it("garde la vérification réalisée la plus récente", () => {
    const m = repartirParEquipement(
      [
        verif("eq1", "2025-02-01", {
          statut: "realisee_conforme",
          dateRealisee: "2025-02-03",
        }),
        verif("eq1", "2026-02-01", {
          statut: "realisee_conforme",
          dateRealisee: "2026-02-04",
        }),
      ],
      AUJOURDHUI,
    );

    expect(m.get("eq1")?.derniere).toEqual(jour("2026-02-04"));
    expect(m.get("eq1")?.enRetard).toBe(0);
  });

  it("retombe sur la date prévue quand une occurrence faite n'a pas de date de réalisation", () => {
    const m = repartirParEquipement(
      [verif("eq1", "2026-02-01", { statut: "realisee_conforme" })],
      AUJOURDHUI,
    );

    expect(m.get("eq1")?.derniere).toEqual(jour("2026-02-01"));
  });

  it("distingue « aucune vérification connue » de « à jour »", () => {
    // Un appareil sans occurrence n'a pas d'entrée : l'écran dit alors
    // qu'il n'a aucune vérification rattachée, et surtout pas qu'il va bien.
    const m = repartirParEquipement([verif("eq1", "2026-09-01")], AUJOURDHUI);

    expect(m.has("eq2")).toBe(false);
    expect(m.get("eq1")?.derniere).toBeNull();
  });
});
