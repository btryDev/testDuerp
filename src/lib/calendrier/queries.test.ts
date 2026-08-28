import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Les lectures du calendrier décident de ce que l'utilisateur voit — et,
 * jusqu'ici, de ce qu'il ne voyait pas. Deux défauts sont couverts ici :
 *
 *  - la liste mensuelle et la grille ne montraient pas le même ensemble
 *    (la liste embarquait tout l'historique réalisé et n'avait aucune
 *    borne haute, la grille écartait le réalisé et s'arrêtait à deux ans) ;
 *  - « urgents » retenait toutes les occurrences `a_planifier`, y compris
 *    celles dont l'échéance n'était pas atteinte, et laissait sortir les
 *    occurrences planifiées dépassées.
 *
 * On teste les **clauses envoyées à la base**, pas la base : c'est là que
 * vit la règle. Le prisma est donc mocké, et l'horloge figée — sans quoi
 * les bornes de jour civil seraient irreproductibles.
 */

const { prismaMock, requireUserMock } = vi.hoisted(() => ({
  prismaMock: {
    verification: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
  requireUserMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/require-user", () => ({
  requireUser: requireUserMock,
  getOptionalUser: vi.fn(),
}));

import {
  compterEtatCalendrier,
  grouperParMois,
  listerVerifications,
  type VerificationListee,
} from "./queries";

/** 10 août 2026, 9 h à Paris (07:00 UTC). */
const NOW = new Date("2026-08-10T07:00:00Z");
/** Minuit civil de Paris ce jour-là : 09/08 22:00 UTC. */
const DEBUT_DU_JOUR = new Date("2026-08-09T22:00:00Z");
/** Date civile telle que Prisma la rend. */
const jour = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  prismaMock.verification.findMany.mockClear().mockResolvedValue([]);
  requireUserMock.mockResolvedValue({ id: "user-1" });
});

afterEach(() => {
  vi.useRealTimers();
});

const dernierWhere = () =>
  prismaMock.verification.findMany.mock.calls.at(-1)![0].where;

describe("listerVerifications — lecture documentaire par défaut", () => {
  it("ne pose aucune borne : les PDF ont besoin de tout l'historique", async () => {
    await listerVerifications("etab-1");
    const where = dernierWhere();
    expect(where).toEqual({
      etablissementId: "etab-1",
      etablissement: { entreprise: { userId: "user-1" } },
    });
  });

  it("scope toujours la lecture sur l'entreprise du user", async () => {
    await listerVerifications("etab-1", { urgentsSeulement: true });
    expect(dernierWhere().etablissement).toEqual({
      entreprise: { userId: "user-1" },
    });
  });
});

describe("listerVerifications — filtre « urgents »", () => {
  it("retient le retard réel, pas le statut", async () => {
    await listerVerifications("etab-1", { urgentsSeulement: true });
    const where = dernierWhere();
    // Une occurrence réalisée n'est jamais urgente, quel que soit son statut.
    expect(where.dateRealisee).toBeNull();
    expect(where.OR).toEqual([
      { statut: "depassee" },
      {
        statut: { in: ["planifiee", "a_planifier"] },
        datePrevue: { lt: DEBUT_DU_JOUR },
      },
    ]);
  });

  it("borne le retard au début du jour civil, pas à l'heure courante", async () => {
    await listerVerifications("etab-1", { urgentsSeulement: true });
    const borne = dernierWhere().OR[1].datePrevue.lt as Date;
    // Une occurrence datée d'aujourd'hui (stockée à 00:00 UTC, soit 02:00
    // à Paris) est postérieure à cette borne : elle n'est pas urgente.
    expect(jour("2026-08-10").getTime()).toBeGreaterThan(borne.getTime());
    expect(jour("2026-08-09").getTime()).toBeLessThan(borne.getTime());
  });
});

describe("compterEtatCalendrier", () => {
  const verif = (
    statut: string,
    datePrevue: string,
    dateRealisee: string | null = null,
    /** Le porteur (ADR-023) : `null` = équipement ou établissement. */
    salarieId: string | null = null,
  ) => ({
    statut,
    datePrevue: jour(datePrevue),
    dateRealisee: dateRealisee ? jour(dateRealisee) : null,
    salarieId,
  });

  it("partitionne en quatre ensembles disjoints", async () => {
    prismaMock.verification.findMany.mockResolvedValue([
      // En retard : la date décide, pas le statut (ADR-011).
      verif("a_planifier", "2026-08-01"),
      verif("planifiee", "2026-07-15"),
      verif("depassee", "2026-06-01"),
      // À planifier : pas encore dépassée.
      verif("a_planifier", "2026-09-30"),
      // À venir : dans l'horizon proche.
      verif("planifiee", "2026-08-10"),
      verif("planifiee", "2026-09-09"),
      // Hors horizon : ni retard, ni engagement de la période.
      verif("planifiee", "2026-12-01"),
      // Historique.
      verif("realisee_conforme", "2026-02-01", "2026-02-03"),
      verif("realisee_conforme", "2025-02-01", "2025-02-03"),
    ]);

    const etat = await compterEtatCalendrier("etab-1", NOW);
    expect(etat).toEqual({
      enRetard: 3,
      aPlanifier: 1,
      aVenir: 2,
      realisees12m: 1,
      enRetardParType: { verification: 3, "titre-salarie": 0 },
      aVenirParType: { verification: 2, "titre-salarie": 0 },
      toutesParType: { verification: 9, "titre-salarie": 0 },
    });
  });

  it("ventile les mêmes lignes par nature, selon leur porteur", async () => {
    // Le total ne bouge pas, sa ventilation si — c'est toute la promesse
    // du rattachement de la famille « personnel » (ADR-016, ADR-023).
    prismaMock.verification.findMany.mockResolvedValue([
      verif("depassee", "2026-06-01"),
      verif("depassee", "2026-06-01", null, "sal-1"),
      verif("planifiee", "2026-08-10", null, "sal-2"),
    ]);

    const etat = await compterEtatCalendrier("etab-1", NOW);
    expect(etat.enRetard).toBe(2);
    expect(etat.enRetardParType).toEqual({
      verification: 1,
      "titre-salarie": 1,
    });
    expect(etat.aVenirParType).toEqual({
      verification: 0,
      "titre-salarie": 1,
    });
    expect(etat.toutesParType).toEqual({
      verification: 1,
      "titre-salarie": 2,
    });
  });

  it("ne compte pas deux fois une occurrence à planifier et dépassée", async () => {
    prismaMock.verification.findMany.mockResolvedValue([
      verif("a_planifier", "2026-08-01"),
    ]);
    const etat = await compterEtatCalendrier("etab-1", NOW);
    expect(etat.enRetard).toBe(1);
    expect(etat.aPlanifier).toBe(0);
  });

  it("laisse sa journée à une échéance du jour", async () => {
    prismaMock.verification.findMany.mockResolvedValue([
      verif("planifiee", "2026-08-10"),
    ]);
    const etat = await compterEtatCalendrier("etab-1", NOW);
    expect(etat.enRetard).toBe(0);
    expect(etat.aVenir).toBe(1);
  });

  it("ne tient pas pour en retard une occurrence déjà réalisée", async () => {
    prismaMock.verification.findMany.mockResolvedValue([
      verif("depassee", "2026-01-01", "2026-01-15"),
    ]);
    const etat = await compterEtatCalendrier("etab-1", NOW);
    expect(etat.enRetard).toBe(0);
    expect(etat.realisees12m).toBe(1);
  });
});

describe("grouperParMois", () => {
  it("range chaque occurrence dans son mois civil de Paris", () => {
    const ligne = (id: string, d: Date) =>
      ({ id, datePrevue: d }) as unknown as VerificationListee;
    const map = grouperParMois([
      ligne("a", jour("2026-08-01")),
      ligne("b", jour("2026-08-31")),
      // 31 août 23:30 à Paris : l'heure UTC est déjà le 31 à 21:30, mais
      // une clé calculée en UTC sur un horodatage du soir d'hiver basculerait
      // au mois suivant.
      ligne("c", new Date("2026-08-31T21:30:00Z")),
      ligne("d", jour("2026-09-01")),
    ]);
    expect([...map.keys()]).toEqual(["2026-08", "2026-09"]);
    expect(map.get("2026-08")).toHaveLength(3);
  });
});
