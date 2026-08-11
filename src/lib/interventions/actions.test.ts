// Clôture d'un signalement — cœur de la boucle ticket ↔ DUERP (ADR-009).
//
// Les deux écritures (clôture du ticket, remise à zéro de la cotation du
// risque) étaient séparées. Si la seconde échouait, le ticket restait « fait »
// — donc non reclôturable — et le risque n'apparaissait jamais dans
// `listerRisquesAReevaluer`, qui ne remonte que les risques à
// `cotationSaisie: false`. La boucle se cassait définitivement, sans message.

import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const db = {
    intervention: {
      id: "itv-1",
      statut: "en_cours",
      risqueId: "risque-1" as string | null,
      motifCloture: null as string | null,
    },
    risque: { id: "risque-1", cotationSaisie: true },
    /** Force l'échec de la seconde écriture, pour éprouver l'atomicité. */
    risqueUpdateCasse: false,
  };

  const operations = {
    intervention: {
      update: async ({ data }: { data: Record<string, unknown> }) => {
        Object.assign(db.intervention, data);
        return { risqueId: db.intervention.risqueId };
      },
    },
    risque: {
      // `updateMany` et non `update` : la réévaluation filtre sur la chaîne
      // Risque → Unite → Duerp → Etablissement, pour qu'un `risqueId` hérité
      // du formulaire ne puisse pas désigner le risque d'un autre client.
      updateMany: async ({
        where,
        data,
      }: {
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }) => {
        if (db.risqueUpdateCasse) throw new Error("écriture refusée");
        if (where.id !== db.risque.id) return { count: 0 };
        Object.assign(db.risque, data);
        return { count: 1 };
      },
    },
  };

  // Le faux `$transaction` reproduit la propriété qui compte : si le callback
  // lève, aucune écriture n'est visible. On restaure donc l'instantané pris à
  // l'entrée.
  const prisma = {
    ...operations,
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) => {
      const avant = {
        intervention: { ...db.intervention },
        risque: { ...db.risque },
      };
      try {
        return await fn(operations);
      } catch (e) {
        db.intervention = avant.intervention;
        db.risque = avant.risque;
        throw e;
      }
    },
  };

  return { db, prisma };
});

vi.mock("@/lib/prisma", () => ({ prisma: h.prisma }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/scope", () => ({
  assertEtablissementOwnership: vi.fn(async () => ({ id: "user-1" })),
  // La clôture part désormais du ticket et non de l'établissement annoncé par
  // l'appelant : c'est `requireIntervention` qui établit la propriété et rend
  // l'établissement de rattachement (cf. isolation.test.ts).
  requireIntervention: vi.fn(async (interventionId: string) => ({
    user: { id: "user-1" },
    intervention: { id: interventionId, etablissementId: "etab-1" },
    etablissementId: "etab-1",
  })),
}));
vi.mock("@/lib/auth/require-user", () => ({
  requireUser: vi.fn(async () => ({ id: "user-1" })),
}));

const { cloturerIntervention } = await import("./actions");

beforeEach(() => {
  h.db.intervention = {
    id: "itv-1",
    statut: "en_cours",
    risqueId: "risque-1",
    motifCloture: null,
  };
  h.db.risque = { id: "risque-1", cotationSaisie: true };
  h.db.risqueUpdateCasse = false;
});

describe("cloturerIntervention", () => {
  it("clôture le ticket et rouvre la cotation du risque lié", async () => {
    await cloturerIntervention("etab-1", "itv-1", "Réparé", true);

    expect(h.db.intervention.statut).toBe("fait");
    expect(h.db.intervention.motifCloture).toBe("Réparé");
    expect(h.db.risque.cotationSaisie).toBe(false);
  });

  it("ne touche pas au risque si la réévaluation n'est pas demandée", async () => {
    await cloturerIntervention("etab-1", "itv-1", "Réparé", false);

    expect(h.db.intervention.statut).toBe("fait");
    expect(h.db.risque.cotationSaisie).toBe(true);
  });

  it("laisse le ticket ouvert si la réévaluation du risque échoue", async () => {
    h.db.risqueUpdateCasse = true;

    await expect(
      cloturerIntervention("etab-1", "itv-1", "Réparé", true),
    ).rejects.toThrow("écriture refusée");

    // Le point clé : le ticket n'est PAS clos. L'utilisateur peut recommencer.
    expect(h.db.intervention.statut).toBe("en_cours");
    expect(h.db.risque.cotationSaisie).toBe(true);
  });
});
