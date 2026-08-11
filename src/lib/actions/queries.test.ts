import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Compteurs du plan d'actions. Deux défauts sont couverts ici :
 *
 *  - `echeance` était comparée à `new Date()` brut. Comme la date est
 *    stockée à minuit UTC (ADR-011), une action due **aujourd'hui**
 *    basculait « en retard » dès 02:00 heure de Paris, et le retard moyen
 *    — clampé à zéro — était dilué vers le bas par ces faux retards ;
 *  - une action ouverte **sans échéance** n'était comptée nulle part :
 *    ni au calendrier (qui ne montre que du daté), ni dans les retards
 *    (qui exigent une date passée). Elle disparaissait des radars.
 *
 * Ce sont les clauses envoyées à la base qui portent la règle : on les
 * inspecte directement, prisma mocké et horloge injectée.
 */

const { prismaMock, requireUserMock } = vi.hoisted(() => ({
  prismaMock: {
    action: {
      count: vi.fn().mockResolvedValue(0),
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

import { compterActions, statsActionsEnRetard } from "./queries";

/** 10 août 2026, 9 h à Paris. */
const NOW = new Date("2026-08-10T07:00:00Z");
/** Minuit civil de Paris ce jour-là. */
const DEBUT_DU_JOUR = new Date("2026-08-09T22:00:00Z");
/** Date civile telle que Prisma la rend. */
const jour = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

beforeEach(() => {
  prismaMock.action.count.mockClear().mockResolvedValue(0);
  prismaMock.action.findMany.mockClear().mockResolvedValue([]);
  requireUserMock.mockResolvedValue({ id: "user-1" });
});

/** Retrouve la clause `where` de l'appel qui porte les critères donnés. */
const whereAvec = (predicat: (w: Record<string, unknown>) => boolean) =>
  prismaMock.action.count.mock.calls
    .map((c) => c[0].where as Record<string, unknown>)
    .find(predicat)!;

describe("compterActions", () => {
  it("borne le retard au début du jour civil, pas à l'heure courante", async () => {
    await compterActions("etab-1", NOW);
    const where = whereAvec((w) => w.echeance !== undefined && w.echeance !== null);
    expect(where.echeance).toEqual({ lt: DEBUT_DU_JOUR });
    // Une action datée d'aujourd'hui (minuit UTC = 02:00 à Paris) est
    // postérieure à la borne : elle n'est pas en retard.
    expect(jour("2026-08-10").getTime()).toBeGreaterThan(
      DEBUT_DU_JOUR.getTime(),
    );
  });

  it("dénombre les actions ouvertes sans échéance", async () => {
    prismaMock.action.count.mockResolvedValue(3);
    const compteurs = await compterActions("etab-1", NOW);
    const where = whereAvec((w) => w.echeance === null);
    expect(where.statut).toEqual({ in: ["ouverte", "en_cours"] });
    expect(compteurs.sansEcheance).toBe(3);
  });

  it("compte les levées sur les trente jours civils écoulés", async () => {
    await compterActions("etab-1", NOW);
    const where = whereAvec((w) => w.statut === "levee");
    expect(where.leveeLe).toEqual({
      gte: new Date("2026-07-10T22:00:00.000Z"),
    });
  });

  it("scope toutes les lectures sur l'entreprise du user", async () => {
    await compterActions("etab-1", NOW);
    for (const call of prismaMock.action.count.mock.calls) {
      expect(call[0].where.etablissement).toEqual({
        entreprise: { userId: "user-1" },
      });
      expect(call[0].where.etablissementId).toBe("etab-1");
    }
  });
});

describe("statsActionsEnRetard", () => {
  it("ne retient rien quand aucune échéance n'est dépassée", async () => {
    expect(await statsActionsEnRetard("etab-1", NOW)).toEqual({
      nb: 0,
      retardMoyenJours: 0,
      plusAncienne: null,
    });
  });

  it("exclut les actions dues aujourd'hui de la requête", async () => {
    await statsActionsEnRetard("etab-1", NOW);
    const where = prismaMock.action.findMany.mock.calls.at(-1)![0].where;
    expect(where.echeance).toEqual({ lt: DEBUT_DU_JOUR });
    expect(where.statut).toEqual({ in: ["ouverte", "en_cours"] });
  });

  it("compte le retard en jours civils — la veille vaut 1, jamais 0", async () => {
    prismaMock.action.findMany.mockResolvedValue([
      { id: "a1", libelle: "Remplacer l'extincteur", echeance: jour("2026-08-09") },
    ]);
    const stats = await statsActionsEnRetard("etab-1", NOW);
    expect(stats.nb).toBe(1);
    expect(stats.retardMoyenJours).toBe(1);
    expect(stats.plusAncienne).toEqual({
      id: "a1",
      libelle: "Remplacer l'extincteur",
      joursRetard: 1,
    });
  });

  it("moyenne les retards sans les diluer par des zéros", async () => {
    prismaMock.action.findMany.mockResolvedValue([
      { id: "a1", libelle: "Ancienne", echeance: jour("2026-06-11") },
      { id: "a2", libelle: "Récente", echeance: jour("2026-08-08") },
    ]);
    const stats = await statsActionsEnRetard("etab-1", NOW);
    // 60 jours et 2 jours → 31 en moyenne.
    expect(stats.retardMoyenJours).toBe(31);
    expect(stats.plusAncienne?.joursRetard).toBe(60);
  });
});
