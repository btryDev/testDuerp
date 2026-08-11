import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Serveur MCP — ce qui est vérifié ici est d'abord une propriété de
 * sécurité, pas un formatage.
 *
 * Le serveur sert **un** établissement, celui qu'on lui a désigné au
 * démarrage. Deux façons de perdre cette garantie :
 *
 *   1. une lecture qui oublie la portée dans sa clause `where` — elle
 *      remonterait alors les lignes de toute la base, tous clients
 *      confondus ;
 *   2. un schéma d'outil qui accepterait un identifiant d'établissement —
 *      le client (donc le modèle, donc l'utilisateur) choisirait le dossier
 *      à lire.
 *
 * Les deux se testent en inspectant ce qui part vers Prisma et ce
 * qu'acceptent les schémas, prisma mocké et horloge injectée — même
 * approche que `src/lib/actions/queries.test.ts`.
 */

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    $on: vi.fn(),
    etablissement: { findUnique: vi.fn() },
    duerp: { findFirst: vi.fn() },
    action: { findMany: vi.fn() },
  },
}));

vi.mock("./prisma", () => ({ prismaMcp: prismaMock }));

import { OUTILS_MCP, type ContexteMcp } from "./tools";
import { getEtatDuerp, listerActions } from "./queries";

/** 10 août 2026, 9 h à Paris. */
const NOW = new Date("2026-08-10T07:00:00Z");
const ETABLISSEMENT_ID = "etab_demo_1";
const AUTRE_ETABLISSEMENT = "etab_du_voisin";

const ctx: ContexteMcp = {
  scope: { etablissementId: ETABLISSEMENT_ID },
  now: NOW,
};

/** Date civile telle que Prisma la rend. */
const jour = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const outil = (nom: string) => {
  const o = OUTILS_MCP.find((x) => x.nom === nom);
  if (!o) throw new Error(`outil ${nom} absent`);
  return o;
};

beforeEach(() => {
  prismaMock.etablissement.findUnique.mockReset().mockResolvedValue(null);
  prismaMock.duerp.findFirst.mockReset().mockResolvedValue(null);
  prismaMock.action.findMany.mockReset().mockResolvedValue([]);
});

describe("portée des lectures", () => {
  it("la fiche est lue sur l'établissement de la session, pas un autre", async () => {
    prismaMock.etablissement.findUnique.mockResolvedValue({
      raisonDisplay: "Café du Port",
      adresse: "1 quai Neuf",
      codeNaf: "56.10A",
      effectifSurSite: 8,
      estEtablissementTravail: true,
      estERP: true,
      estIGH: false,
      estHabitation: false,
      typeErp: "N",
      categorieErp: "cinq",
      entreprise: {
        raisonSociale: "Port SARL",
        siret: "12345678900011",
        codeNaf: "56.10A",
        effectif: 8,
      },
      _count: { equipements: 4, verifications: 12, actions: 3 },
    });

    await outil("fiche_etablissement").executer(ctx, {});

    expect(prismaMock.etablissement.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: ETABLISSEMENT_ID } }),
    );
  });

  it("le DUERP est cherché par etablissementId", async () => {
    await getEtatDuerp(ETABLISSEMENT_ID, NOW);

    expect(prismaMock.duerp.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { etablissementId: ETABLISSEMENT_ID } }),
    );
  });

  it("le plan d'actions porte l'etablissementId, quels que soient les filtres", async () => {
    await listerActions(ETABLISSEMENT_ID, { criticiteMin: 9 }, NOW);

    const [{ where }] = prismaMock.action.findMany.mock.calls[0];
    expect(where.etablissementId).toBe(ETABLISSEMENT_ID);
    expect(where.criticite).toEqual({ gte: 9 });
  });

  it("aucun outil n'accepte d'identifiant d'établissement en argument", () => {
    // Le point de sécurité central : la portée vient du serveur. Un client
    // qui tenterait de désigner un autre dossier ne doit pas seulement être
    // refusé, il ne doit pas avoir de champ où l'écrire.
    for (const o of OUTILS_MCP) {
      const parse = o.schema.safeParse({
        etablissementId: AUTRE_ETABLISSEMENT,
        id: AUTRE_ETABLISSEMENT,
      });
      const retenu = parse.success ? parse.data : {};
      expect(Object.values(retenu)).not.toContain(AUTRE_ETABLISSEMENT);
    }
  });
});

describe("état du DUERP", () => {
  const duerpAvecVersion = (dateVersion: Date, effectif: number) => ({
    versions: [{ numero: 3, createdAt: dateVersion }],
    etablissement: { entreprise: { effectif } },
    unites: [
      {
        nom: "Salle",
        estTransverse: false,
        risques: [
          {
            libelle: "Chute de plain-pied",
            criticite: 12,
            gravite: 3,
            probabilite: 4,
            maitrise: 1,
            exposeCMR: false,
            _count: { actions: 2 },
          },
        ],
      },
    ],
  });

  it("annonce l'absence de DUERP sans inventer d'échéance", async () => {
    const texte = await outil("etat_duerp").executer(ctx, {});
    expect(texte).toContain("Aucun DUERP");
    expect(texte).not.toMatch(/échue|mise à jour annuelle à prévoir/i);
  });

  it("signale la mise à jour annuelle échue au-delà du seuil d'effectif", async () => {
    prismaMock.duerp.findFirst.mockResolvedValue(
      duerpAvecVersion(jour("2024-01-15"), 20),
    );

    const texte = await outil("etat_duerp").executer(ctx, {});

    expect(texte).toContain("Mise à jour annuelle échue");
    expect(texte).toContain("Chute de plain-pied");
    expect(texte).toContain("criticité 12");
  });

  it("n'oppose aucune échéance annuelle sous onze salariés (art. R. 4121-2)", async () => {
    // Une version de plus de deux ans, mais quatre salariés : le produit
    // n'a rien à reprocher au calendrier ici.
    prismaMock.duerp.findFirst.mockResolvedValue(
      duerpAvecVersion(jour("2024-01-15"), 4),
    );

    const texte = await outil("etat_duerp").executer(ctx, {});

    expect(texte).not.toContain("échue");
    expect(texte).toContain("ne s'applique pas");
  });
});

describe("plan d'actions", () => {
  const action = (over: Partial<Record<string, unknown>> = {}) => ({
    libelle: "Poser une main courante",
    statut: "ouverte",
    type: "protection_collective",
    criticite: 12,
    echeance: jour("2026-08-01"),
    responsable: null,
    risqueId: "risq_1",
    verificationId: null,
    risque: { libelle: "Chute dans l'escalier" },
    verification: null,
    ...over,
  });

  it("compte les retards avec le prédicat partagé du produit", async () => {
    prismaMock.action.findMany.mockResolvedValue([
      action(),
      // Échéance du jour même : jamais en retard, l'utilisateur a sa journée.
      action({ libelle: "Changer l'extincteur", echeance: jour("2026-08-10") }),
    ]);

    const texte = await outil("plan_actions").executer(ctx, {});

    expect(texte).toContain("2 action(s), dont 1 en retard.");
    expect(texte).toContain("Poser une main courante");
    expect(texte).toContain("origine DUERP : Chute dans l'escalier");
  });

  it("filtre les actions en retard après évaluation, pas en SQL", async () => {
    prismaMock.action.findMany.mockResolvedValue([
      action(),
      action({ libelle: "Changer l'extincteur", echeance: jour("2026-08-10") }),
    ]);

    const texte = await outil("plan_actions").executer(ctx, {
      enRetardSeulement: true,
    });

    expect(texte).toContain("1 action(s)");
    expect(texte).not.toContain("Changer l'extincteur");
    // Le filtre de statut reste en base : inutile de rapatrier les levées.
    const [{ where }] = prismaMock.action.findMany.mock.calls[0];
    expect(where.statut).toEqual({ in: ["ouverte", "en_cours"] });
  });

  it("le dit franchement quand rien ne correspond", async () => {
    const texte = await outil("plan_actions").executer(ctx, { criticiteMin: 99 });
    expect(texte).toContain("Aucune action");
  });

  it("rejette une criticité hors bornes", () => {
    const parse = outil("plan_actions").schema.safeParse({ criticiteMin: -3 });
    expect(parse.success).toBe(false);
  });
});
