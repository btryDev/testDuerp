import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Non-régression IDOR sur les risques transverses.
 *
 * `validerTransverses` faisait un `duerp.update` sur l'identifiant brut reçu
 * du client : n'importe quel DUERP pouvait être marqué « transverses
 * répondues », ce qui fait disparaître l'étape du parcours d'un autre client
 * et fausse son avancement. `toggleRisqueTransverse` créait ou supprimait des
 * risques dans son document. Aucune RLS ne rattrape ça en base.
 */

const { prismaMock, requireUserMock } = vi.hoisted(() => {
  const modele = () => ({
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  });
  return {
    prismaMock: {
      duerp: modele(),
      uniteTravail: modele(),
      risque: modele(),
    },
    requireUserMock: vi.fn(),
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/require-user", () => ({
  requireUser: requireUserMock,
  getOptionalUser: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { toggleRisqueTransverse, validerTransverses } from "./actions";
import { risquesTransverses } from "@/lib/referentiels";

const USER = { id: "user-legitime", email: "dirigeant@exemple.fr" };
const UN_RISQUE_TRANSVERSE = risquesTransverses[0].id;

function estNotFound(e: unknown): boolean {
  const digest = (e as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.includes("404");
}

function aucuneEcriture(): void {
  for (const modele of Object.values(prismaMock)) {
    expect(modele.create).not.toHaveBeenCalled();
    expect(modele.update).not.toHaveBeenCalled();
    expect(modele.delete).not.toHaveBeenCalled();
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  requireUserMock.mockResolvedValue(USER);
  for (const modele of Object.values(prismaMock)) {
    modele.findFirst.mockResolvedValue(null);
    modele.findUnique.mockResolvedValue(null);
    modele.findMany.mockResolvedValue([]);
  }
});

describe("risques transverses — DUERP d'un autre client", () => {
  it("toggleRisqueTransverse refuse et n'écrit rien", async () => {
    await expect(
      toggleRisqueTransverse("duerp-autre-client", UN_RISQUE_TRANSVERSE),
    ).rejects.toSatisfy(estNotFound);
    aucuneEcriture();
  });

  it("toggleRisqueTransverse refuse avant de créer l'unité transverse", async () => {
    // Le garde passe avant `obtenirUniteTransverse`, qui crée une unité si
    // elle n'existe pas : sans lui, un simple appel polluait le DUERP visé.
    await expect(
      toggleRisqueTransverse("duerp-autre-client", UN_RISQUE_TRANSVERSE),
    ).rejects.toSatisfy(estNotFound);
    expect(prismaMock.uniteTravail.create).not.toHaveBeenCalled();
  });

  it("validerTransverses refuse et n'écrit rien", async () => {
    await expect(
      validerTransverses("duerp-autre-client"),
    ).rejects.toSatisfy(estNotFound);
    expect(prismaMock.duerp.update).not.toHaveBeenCalled();
    aucuneEcriture();
  });
});

describe("risques transverses — chemin nominal", () => {
  it("validerTransverses marque le DUERP du user", async () => {
    prismaMock.duerp.findFirst.mockResolvedValue({
      id: "d1",
      etablissement: { id: "e1", entreprise: { id: "ent1" } },
    });

    await validerTransverses("d1");

    expect(prismaMock.duerp.update).toHaveBeenCalledWith({
      where: { id: "d1" },
      data: { transversesRepondues: true },
    });
  });
});
