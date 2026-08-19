// Fiche établissement — deux régressions silencieuses couvertes ici :
//
//  1. modifier le régime ou la catégorie ne recalculait jamais les
//     obligations : une boutique qui devenait ERP n'héritait pas de la
//     vérification électrique annuelle par organisme agréé ;
//  2. supprimer l'établissement effaçait les versions de DUERP, que la loi
//     impose de conserver 40 ans. La base refuse désormais ; l'utilisateur
//     doit lire une explication, pas une erreur Prisma.

import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const db = {
    etablissement: {
      id: "etab-1",
      entrepriseId: "ent-1",
      raisonDisplay: "Le Bistrot",
      adresse: "1 rue des Lilas",
      codeNaf: "56.10A",
      effectifSurSite: 5,
      estEtablissementTravail: true,
      estERP: false,
      estIGH: false,
      estHabitation: false,
      typeErp: null as string | null,
      categorieErp: null as string | null,
      classeIgh: null as string | null,
    },
    nbVersionsDuerp: 0,
    supprimes: [] as string[],
  };

  const prisma = {
    etablissement: {
      // Copie : Prisma rend un objet détaché, et c'est essentiel ici —
      // l'action compare l'état lu avant `update` à celui écrit après.
      findUnique: async () => ({ ...db.etablissement }),
      findFirst: async () => ({ ...db.etablissement }),
      update: async ({ data }: { data: Record<string, unknown> }) => {
        Object.assign(db.etablissement, data);
        return db.etablissement;
      },
      create: async () => db.etablissement,
      delete: async ({ where }: { where: { id: string } }) => {
        db.supprimes.push(where.id);
        return db.etablissement;
      },
    },
    duerpVersion: {
      count: async () => db.nbVersionsDuerp,
    },
  };

  return {
    db,
    prisma,
    genererCalendrier: vi.fn(async () => ({})),
    marquerCalendrierPerime: vi.fn(async () => {}),
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: h.prisma }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));
vi.mock("@/lib/auth/scope", () => ({
  assertEtablissementOwnership: vi.fn(async () => ({ id: "user-1" })),
  assertEntrepriseOwnership: vi.fn(async () => ({ id: "user-1" })),
}));
vi.mock("@/lib/calendrier/actions", () => ({
  genererCalendrier: h.genererCalendrier,
  marquerCalendrierPerime: h.marquerCalendrierPerime,
}));

const { modifierEtablissement, supprimerEtablissement } = await import(
  "./actions"
);

/** Le formulaire poste toutes ses cases : les non cochées sont absentes. */
function formulaire(over: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("raisonDisplay", "Le Bistrot");
  fd.set("adresse", "1 rue des Lilas");
  fd.set("codeNaf", "56.10A");
  fd.set("effectifSurSite", "5");
  fd.set("estEtablissementTravail", "on");
  for (const [k, v] of Object.entries(over)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  h.db.etablissement.estERP = false;
  h.db.etablissement.typeErp = null;
  h.db.etablissement.categorieErp = null;
  h.db.etablissement.effectifSurSite = 5;
  h.db.nbVersionsDuerp = 0;
  h.db.supprimes = [];
  h.genererCalendrier.mockClear();
});

describe("modifierEtablissement — recalcul des obligations", () => {
  it("régénère le calendrier quand l'établissement devient ERP", async () => {
    const res = await modifierEtablissement(
      "etab-1",
      { status: "idle" },
      formulaire({ estERP: "on", typeErp: "N", categorieErp: "N5" }),
    );

    expect(res.status).toBe("success");
    expect(h.genererCalendrier).toHaveBeenCalledWith("etab-1");
  });

  it("régénère quand la catégorie ERP change (5e → 3e)", async () => {
    h.db.etablissement.estERP = true;
    h.db.etablissement.typeErp = "N";
    h.db.etablissement.categorieErp = "N5";

    await modifierEtablissement(
      "etab-1",
      { status: "idle" },
      formulaire({ estERP: "on", typeErp: "N", categorieErp: "N3" }),
    );

    expect(h.genererCalendrier).toHaveBeenCalledTimes(1);
  });

  it("régénère quand l'effectif change (les seuils font basculer des obligations)", async () => {
    await modifierEtablissement(
      "etab-1",
      { status: "idle" },
      formulaire({ effectifSurSite: "42" }),
    );

    expect(h.genererCalendrier).toHaveBeenCalledTimes(1);
  });

  it("ne régénère pas pour un simple changement d'adresse", async () => {
    await modifierEtablissement(
      "etab-1",
      { status: "idle" },
      formulaire({ adresse: "2 rue des Lilas" }),
    );

    expect(h.genererCalendrier).not.toHaveBeenCalled();
  });

  it("avertit sans faire échouer la saisie si la régénération casse", async () => {
    h.genererCalendrier.mockImplementation(async () => {
      throw new Error("base indisponible");
    });

    const res = await modifierEtablissement(
      "etab-1",
      { status: "idle" },
      formulaire({ estERP: "on", typeErp: "N", categorieErp: "N5" }),
    );

    expect(res.status).toBe("success_avec_avertissement");
    h.genererCalendrier.mockImplementation(async () => ({}));
  });
});

describe("supprimerEtablissement — conservation 40 ans", () => {
  it("refuse la suppression quand une version de DUERP est archivée", async () => {
    h.db.nbVersionsDuerp = 2;

    const res = await supprimerEtablissement("etab-1");

    expect(res.statut).toBe("refus");
    expect(h.db.supprimes).toEqual([]);
    // Le message doit être compréhensible sans être juriste, et citer le texte.
    expect(res.message).toContain("R. 4121-4");
    expect(res.message).toContain("40 ans");
    expect(res.exportHref).toBe("/etablissements/etab-1/controle");
  });

  it("ne laisse jamais remonter une erreur Prisma brute", async () => {
    h.db.nbVersionsDuerp = 0; // le comptage ne voit rien…
    const original = h.prisma.etablissement.delete;
    // …mais la base refuse quand même (course, ou nouveau Restrict).
    h.prisma.etablissement.delete = async () => {
      throw Object.assign(new Error("Foreign key constraint failed"), {
        code: "P2003",
      });
    };

    const res = await supprimerEtablissement("etab-1");

    expect(res.statut).toBe("refus");
    expect(res.message).not.toContain("P2003");
    expect(res.message).toContain("conservation obligatoire");

    h.prisma.etablissement.delete = original;
  });

  it("supprime — et redirige — quand aucune pièce à conserver n'existe", async () => {
    h.db.nbVersionsDuerp = 0;

    await expect(supprimerEtablissement("etab-1")).rejects.toThrow(
      "NEXT_REDIRECT",
    );
    expect(h.db.supprimes).toEqual(["etab-1"]);
  });
});
