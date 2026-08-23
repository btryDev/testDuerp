// Les mutations de bâtiment (ADR-019) — base simulée.
//
// Ce fichier n'existait pas, et les invariants centraux de l'ADR ne tenaient
// qu'à la relecture : qu'aucun bâtiment d'un autre établissement ne serve de
// destination, que le dernier bâtiment ne se supprime pas, et que **tout** le
// contenu soit déplacé avant la suppression — équipements retirés du parc
// compris, points de relevé, permis, plans. Le dernier point est le plus
// coûteux à rattraper : un `SetNull` silencieux perd une information que
// l'utilisateur avait donnée, et rien ne le signale.
//
// Ce que ces tests prouvent : les décisions prises par l'action — refus,
// ordre des écritures, portée des filtres. Ce qu'ils ne prouvent pas : que
// PostgreSQL applique la transaction atomiquement.

import { beforeEach, describe, expect, it, vi } from "vitest";

type Appel = { table: string; args: unknown };

const h = vi.hoisted(() => {
  const db = {
    /** Ce que `trouverBatimentDuUser` rendra — `null` = hors périmètre. */
    batiment: null as { id: string; etablissementId: string; ordre: number } | null,
    /** Ce que la recherche de destination rendra. */
    destination: null as { id: string } | null,
    appels: [] as Appel[],
    ordreMax: 2 as number | null,
  };

  const deplacement = (table: string) => ({
    updateMany: async (args: unknown) => {
      db.appels.push({ table, args });
      return { count: 1 };
    },
  });

  const tx = {
    equipement: deplacement("equipement"),
    pointReleve: deplacement("pointReleve"),
    permisFeu: deplacement("permisFeu"),
    planPrevention: deplacement("planPrevention"),
    batiment: {
      delete: async (args: unknown) => {
        db.appels.push({ table: "batiment.delete", args });
        return {};
      },
    },
  };

  const prisma = {
    $transaction: async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx),
    batiment: {
      findFirst: vi.fn(async () => db.destination),
      aggregate: async () => ({ _max: { ordre: db.ordreMax } }),
      create: vi.fn(async ({ data }: { data: { ordre: number } }) => {
        db.appels.push({ table: "batiment.create", args: data });
        return { id: "b-neuf" };
      }),
      update: vi.fn(async () => ({})),
    },
  };

  return {
    db,
    prisma,
    requireUser: vi.fn(async () => ({ id: "user-1" })),
    assertEtablissementOwnership: vi.fn(async () => {}),
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: h.prisma }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/require-user", () => ({ requireUser: h.requireUser }));
vi.mock("@/lib/auth/scope", () => ({
  assertEtablissementOwnership: h.assertEtablissementOwnership,
}));

const { creerBatiment, supprimerBatiment } = await import("./actions");

const ETAB = "etab-1";
const B = { id: "b-reserve", etablissementId: ETAB, ordre: 1 };

beforeEach(() => {
  h.db.batiment = { ...B };
  h.db.destination = { id: "b-principal" };
  h.db.appels = [];
  h.db.ordreMax = 2;
  h.prisma.batiment.findFirst.mockClear();
  h.prisma.batiment.create.mockClear();
  // `trouverBatimentDuUser` et la recherche de destination passent tous deux
  // par `findFirst` : le premier appel rend le bâtiment, le second la cible.
  h.prisma.batiment.findFirst
    .mockImplementationOnce(async () => h.db.batiment)
    .mockImplementation(async () => h.db.destination);
});

describe("supprimerBatiment — le contenu part avant le lieu", () => {
  it("déplace les quatre relations, puis supprime", async () => {
    const res = await supprimerBatiment(B.id, "b-principal");

    expect(res.status).toBe("success");
    expect(h.db.appels.map((a) => a.table)).toEqual([
      "equipement",
      "pointReleve",
      "permisFeu",
      "planPrevention",
      "batiment.delete",
    ]);
  });

  it("déplace sans filtrer sur `actif` : un appareil retiré garde son lieu", () => {
    // Le filet du filet : un `where` qui ne verrait que les équipements en
    // service laisserait les retirés pointer vers un bâtiment supprimé — et
    // ils portent des rapports (ADR-012).
    return supprimerBatiment(B.id, "b-principal").then(() => {
      const eq = h.db.appels.find((a) => a.table === "equipement");
      expect(eq?.args).toEqual({
        where: { batimentId: B.id },
        data: { batimentId: "b-principal" },
      });
    });
  });

  it("refuse un bâtiment hors périmètre, sans rien écrire", async () => {
    h.db.batiment = null;
    h.prisma.batiment.findFirst.mockReset();
    h.prisma.batiment.findFirst.mockImplementation(async () => null);

    const res = await supprimerBatiment(B.id, "b-principal");

    expect(res).toEqual({ status: "error", message: "Bâtiment introuvable" });
    expect(h.db.appels).toEqual([]);
  });

  it("refuse une destination qui n'est pas du même établissement", async () => {
    // La recherche de destination est bornée à `etablissementId` : un id
    // d'un autre dossier ne résout rien.
    h.db.destination = null;

    const res = await supprimerBatiment(B.id, "b-dun-autre");

    expect(res.status).toBe("error");
    expect(h.db.appels).toEqual([]);
  });

  it("refuse le dernier bâtiment, faute de destination possible", async () => {
    h.db.destination = null;

    const res = await supprimerBatiment(B.id, B.id);

    expect(res.status).toBe("error");
    if (res.status === "error") {
      expect(res.message).toContain("autre bâtiment");
    }
    expect(h.db.appels).toEqual([]);
  });

  it("cherche la destination dans le même établissement et hors du supprimé", async () => {
    await supprimerBatiment(B.id, "b-principal");

    const calls = h.prisma.batiment.findFirst.mock.calls as unknown as Array<
      [{ where: Record<string, unknown> }]
    >;
    const recherche = calls.at(-1)![0];
    expect(recherche.where).toMatchObject({
      id: "b-principal",
      etablissementId: ETAB,
      NOT: { id: B.id },
    });
  });
});

describe("creerBatiment — l'ordre", () => {
  it("place le nouveau bâtiment après le dernier", async () => {
    const fd = new FormData();
    fd.set("nom", "Annexe");

    const res = await creerBatiment(ETAB, { status: "idle" }, fd);

    expect(res.status).toBe("success");
    const cree = h.db.appels.find((a) => a.table === "batiment.create");
    expect((cree?.args as { ordre: number }).ordre).toBe(3);
  });

  it("part de zéro quand l'établissement n'a encore aucun bâtiment", async () => {
    h.db.ordreMax = null;
    const fd = new FormData();
    fd.set("nom", "Bâtiment principal");

    await creerBatiment(ETAB, { status: "idle" }, fd);

    const cree = h.db.appels.find((a) => a.table === "batiment.create");
    expect((cree?.args as { ordre: number }).ordre).toBe(0);
  });

  it("refuse un formulaire invalide avant toute écriture", async () => {
    const fd = new FormData();
    fd.set("nom", "");

    const res = await creerBatiment(ETAB, { status: "idle" }, fd);

    expect(res.status).toBe("error");
    expect(h.prisma.batiment.create).not.toHaveBeenCalled();
  });

  it("passe par le contrôle d'appartenance de l'établissement", async () => {
    const fd = new FormData();
    fd.set("nom", "Annexe");

    await creerBatiment(ETAB, { status: "idle" }, fd);

    expect(h.assertEtablissementOwnership).toHaveBeenCalledWith(ETAB);
  });
});
