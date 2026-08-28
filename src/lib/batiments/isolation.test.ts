// Cloisonnement des deux lectures de bâtiment qui reçoivent un identifiant nu.
//
// `charge.test.ts` couvre déjà `listerBatimentsAvecCharge`, mais par une
// assertion de **forme** sur le `where` émis. Les deux fonctions testées ici
// n'étaient couvertes par rien : retirer leur prédicat laissait les 1568 tests
// verts. Elles sont pourtant celles où la fuite serait la plus concrète —
// `resoudreBatimentOptionnel` est ce qui **valide** un `batimentId` avant
// écriture, et c'est aussi ce module qui porte la doctrine du prédicat.
//
// Même montage que `salaries/isolation.test.ts` : le faux Prisma **évalue** le
// `where` contre deux entreprises en mémoire, et lève sur toute clause qu'il ne
// sait pas interpréter — jamais de filtre ignoré en silence.

import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_A = "user-a";
const ETAB_A = "etab-a";
const ETAB_B = "etab-b";

const h = vi.hoisted(() => {
  type Ligne = Record<string, unknown>;

  const db = {
    entreprises: [] as Ligne[],
    etablissements: [] as Ligne[],
    batiments: [] as Ligne[],
  };

  const RELATIONS: Record<string, (l: Ligne) => Ligne | undefined> = {
    etablissement: (b) =>
      db.etablissements.find((e) => e.id === b.etablissementId),
    entreprise: (e) => db.entreprises.find((en) => en.id === e.entrepriseId),
  };

  function correspond(ligne: Ligne, where: Ligne): boolean {
    for (const [cle, attendu] of Object.entries(where)) {
      const relation = RELATIONS[cle];
      if (relation) {
        const liee = relation(ligne);
        if (!liee) return false;
        if (!correspond(liee, attendu as Ligne)) return false;
        continue;
      }
      if (attendu !== null && typeof attendu === "object") {
        throw new Error(
          `Faux Prisma : filtre non géré sur « ${cle} » — ` +
            `${JSON.stringify(attendu)}. Étendre \`correspond\` plutôt que ` +
            `laisser passer une clause non évaluée.`,
        );
      }
      if (ligne[cle] !== attendu) return false;
    }
    return true;
  }

  const prisma = {
    batiment: {
      findFirst: async ({ where }: { where: Ligne }) =>
        db.batiments.find((b) => correspond(b, where)) ?? null,
      findMany: async ({ where }: { where: Ligne }) =>
        db.batiments.filter((b) => correspond(b, where)),
    },
  };

  return { db, prisma, requireUser: vi.fn() };
});

vi.mock("@/lib/prisma", () => ({ prisma: h.prisma }));
vi.mock("@/lib/auth/require-user", () => ({
  requireUser: h.requireUser,
  getOptionalUser: vi.fn(),
}));

const { batimentParDefaut, resoudreBatimentOptionnel } = await import(
  "./queries"
);

beforeEach(() => {
  h.requireUser.mockResolvedValue({ id: USER_A, email: "a@exemple.fr" });
  h.db.entreprises = [
    { id: "ent-a", userId: USER_A },
    { id: "ent-b", userId: "user-b" },
  ];
  h.db.etablissements = [
    { id: ETAB_A, entrepriseId: "ent-a" },
    { id: ETAB_B, entrepriseId: "ent-b" },
  ];
  h.db.batiments = [
    { id: "bat-a", etablissementId: ETAB_A, nom: "Siège", ordre: 0 },
    { id: "bat-b", etablissementId: ETAB_B, nom: "Atelier voisin", ordre: 0 },
  ];
});

describe("resoudreBatimentOptionnel — la fonction qui valide avant écriture", () => {
  it("refuse le bâtiment d'un autre dossier", async () => {
    // Le scénario que le prédicat ferme : un appelant qui n'aurait pas gardé
    // son `etablissementId` ferait confirmer par cette fonction le bâtiment
    // d'un autre compte, et le permis de feu s'y rattacherait. Les quatre
    // appelants gardent aujourd'hui — c'est ce qui ne doit pas être seul.
    expect(await resoudreBatimentOptionnel(ETAB_B, "bat-b")).toEqual({
      ok: false,
    });
  });

  it("refuse aussi un bâtiment étranger présenté sur SON établissement", async () => {
    expect(await resoudreBatimentOptionnel(ETAB_A, "bat-b")).toEqual({
      ok: false,
    });
  });

  it("accepte le bâtiment du dossier de l'utilisateur", async () => {
    // Contre-épreuve : sans elle, une implémentation qui refuse tout
    // passerait les deux cas ci-dessus.
    expect(await resoudreBatimentOptionnel(ETAB_A, "bat-a")).toEqual({
      ok: true,
      id: "bat-a",
    });
  });

  it("laisse passer l'absence de bâtiment, sans ouvrir la base", async () => {
    expect(await resoudreBatimentOptionnel(ETAB_A, null)).toEqual({
      ok: true,
      id: null,
    });
  });
});

describe("batimentParDefaut", () => {
  it("lève sur un établissement d'un autre dossier, sans rien en dire", async () => {
    // Le refus passe par l'erreur d'invariant ADR-019 : bruyant, et il ne
    // divulgue rien du dossier voisin — le message ne nomme que
    // l'identifiant que l'appelant a lui-même fourni.
    await expect(batimentParDefaut(ETAB_B)).rejects.toThrow(/invariant ADR-019/);
  });

  it("rend le bâtiment d'ordre 0 du dossier de l'utilisateur", async () => {
    expect(await batimentParDefaut(ETAB_A)).toMatchObject({ id: "bat-a" });
  });
});
