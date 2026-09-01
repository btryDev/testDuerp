import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Le plafond de cinq unités de travail (ADR-033), aux trois points d'écriture
 * qui vivent ici — la création du DUERP, le choix du secteur, l'ajout manuel.
 * Le quatrième, l'import, se prouve dans `import/ecritures.test.ts`.
 *
 * Prisma est simulé et les vrais helpers de `lib/auth/scope` sont utilisés,
 * comme dans `isolation.test.ts` : ce qui est en cause ici est la décision de
 * l'action, pas l'atomicité de la transaction.
 */

const { prismaMock, requireUserMock, redirectMock } = vi.hoisted(() => {
  const modele = () => ({
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: "cree" }),
    update: vi.fn(),
    delete: vi.fn(),
  });
  return {
    prismaMock: {
      etablissement: modele(),
      duerp: modele(),
      uniteTravail: modele(),
      risque: modele(),
      // La transaction rend simplement ce qu'on lui donne : ici, ce sont les
      // appels enregistrés par les mocks qui font foi.
      $transaction: vi.fn(async (ops: unknown[]) => ops),
    },
    requireUserMock: vi.fn(),
    redirectMock: vi.fn(() => {
      // `redirect` lève en production ; on l'imite pour que le code après
      // l'appel ne s'exécute pas non plus dans le test.
      throw new Error("REDIRECT");
    }),
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/require-user", () => ({
  requireUser: requireUserMock,
  getOptionalUser: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", async (importer) => ({
  ...(await importer<typeof import("next/navigation")>()),
  redirect: redirectMock,
}));

import { ajouterUnite, choisirSecteur, creerDuerp } from "./actions";
import { MAX_UNITES_TRAVAIL } from "./plafond-unites";

const USER = { id: "user-1", email: "dirigeant@exemple.fr" };
const DUERP = { id: "d1", etablissementId: "e1", referentielSecteurId: null };

const unite = (nom: string) => ({ nom, estTransverse: false });
const TRANSVERSE = { nom: "Risques transverses", estTransverse: true };

/** Les noms d'unités que la transaction du choix de secteur ferait créer. */
function unitesCreeesParLeSecteur(): string[] {
  return prismaMock.uniteTravail.create.mock.calls.map(
    (appel) => (appel[0] as { data: { nom: string } }).data.nom,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  requireUserMock.mockResolvedValue(USER);
  prismaMock.etablissement.findFirst.mockResolvedValue({
    id: "e1",
    entrepriseId: "ent-1",
  });
  prismaMock.duerp.findFirst.mockResolvedValue(DUERP);
  prismaMock.uniteTravail.findMany.mockResolvedValue([]);
  prismaMock.uniteTravail.create.mockImplementation(
    async ({ data }: { data: { nom: string } }) => ({ id: `u-${data.nom}` }),
  );
});

describe("creerDuerp — l'unité transverse ne consomme aucune place", () => {
  it("la crée toujours à l'ouverture, sans regarder le plafond", async () => {
    prismaMock.duerp.findFirst.mockResolvedValue(null);
    prismaMock.duerp.create.mockResolvedValue({ id: "d-neuf" });

    await expect(creerDuerp("e1")).rejects.toThrow("REDIRECT");

    const data = prismaMock.duerp.create.mock.calls[0][0] as {
      data: { unites: { create: { nom: string; estTransverse: boolean } } };
    };
    expect(data.data.unites.create).toMatchObject({
      nom: "Risques transverses",
      estTransverse: true,
    });
  });
});

describe("choisirSecteur — le pré-remplissage s'arrête au plafond", () => {
  it("installe les cinq unités de la restauration à côté de la transverse", async () => {
    // Le cas cible du produit : cinq unités sectorielles plus la transverse.
    // Compter la transverse ferait échouer l'étape la plus normale.
    prismaMock.uniteTravail.findMany.mockResolvedValue([TRANSVERSE]);

    await expect(choisirSecteur("d1", "restauration")).rejects.toThrow(
      "REDIRECT",
    );

    expect(unitesCreeesParLeSecteur()).toHaveLength(MAX_UNITES_TRAVAIL);
  });

  it("n'en installe que ce qui tient quand des unités sont déjà là", async () => {
    prismaMock.uniteTravail.findMany.mockResolvedValue([
      TRANSVERSE,
      unite("Terrasse"),
      unite("Cave"),
      unite("Bureau"),
    ]);

    await expect(choisirSecteur("d1", "restauration")).rejects.toThrow(
      "REDIRECT",
    );

    expect(unitesCreeesParLeSecteur()).toHaveLength(2);
  });

  it("n'en installe aucune sur un DUERP déjà plein", async () => {
    prismaMock.uniteTravail.findMany.mockResolvedValue([
      TRANSVERSE,
      ...["A", "B", "C", "D", "E"].map(unite),
    ]);

    await expect(choisirSecteur("d1", "restauration")).rejects.toThrow(
      "REDIRECT",
    );

    expect(unitesCreeesParLeSecteur()).toEqual([]);
  });

  it("n'en installe aucune sur un DUERP ancien qui en porte huit", async () => {
    // `placesRestantes` ne descend pas sous zéro : un `slice(0, -3)` aurait
    // compté depuis la fin du tableau et créé deux unités de plus.
    prismaMock.uniteTravail.findMany.mockResolvedValue(
      Array.from({ length: 8 }, (_, i) => unite(`Ancienne ${i + 1}`)),
    );

    await expect(choisirSecteur("d1", "restauration")).rejects.toThrow(
      "REDIRECT",
    );

    expect(unitesCreeesParLeSecteur()).toEqual([]);
  });
});

describe("ajouterUnite — la sixième est refusée", () => {
  const ajouter = (nom: string) => {
    const fd = new FormData();
    fd.set("nom", nom);
    return ajouterUnite("d1", { status: "idle" }, fd);
  };

  it("accepte la cinquième", async () => {
    prismaMock.uniteTravail.findMany.mockResolvedValue([
      TRANSVERSE,
      ...["A", "B", "C", "D"].map(unite),
    ]);

    const res = await ajouter("Terrasse");

    expect(res.status).toBe("success");
    expect(prismaMock.uniteTravail.create).toHaveBeenCalled();
  });

  it("refuse la sixième, et le message nomme la limite", async () => {
    prismaMock.uniteTravail.findMany.mockResolvedValue([
      TRANSVERSE,
      ...["A", "B", "C", "D", "E"].map(unite),
    ]);

    const res = await ajouter("Terrasse");

    expect(res.status).toBe("error");
    if (res.status === "error") {
      expect(res.message).toContain("5 unités de travail");
    }
    expect(prismaMock.uniteTravail.create).not.toHaveBeenCalled();
  });

  it("porte l'erreur sur le champ « nom », le seul que le formulaire affiche", async () => {
    prismaMock.uniteTravail.findMany.mockResolvedValue(
      ["A", "B", "C", "D", "E"].map(unite),
    );

    const res = await ajouter("Terrasse");

    expect(res.status).toBe("error");
    if (res.status === "error") {
      expect(res.fieldErrors?.nom?.[0]).toBe(res.message);
    }
  });

  it("un DUERP ancien à huit unités refuse l'ajout sans rien perdre", async () => {
    prismaMock.uniteTravail.findMany.mockResolvedValue(
      Array.from({ length: 8 }, (_, i) => unite(`Ancienne ${i + 1}`)),
    );

    const res = await ajouter("Neuvième");

    expect(res.status).toBe("error");
    expect(prismaMock.uniteTravail.create).not.toHaveBeenCalled();
    expect(prismaMock.uniteTravail.delete).not.toHaveBeenCalled();
    expect(prismaMock.uniteTravail.update).not.toHaveBeenCalled();
  });
});
