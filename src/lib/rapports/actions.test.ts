// Dépôt et retrait d'un rapport de vérification — server actions, base et
// stockage simulés.
//
// Le cas critique testé ici est le résultat « non vérifiable » : le
// prestataire s'est déplacé mais n'a pas pu contrôler (local inaccessible,
// installation à l'arrêt). L'ancienne implémentation écrivait `dateRealisee`
// avec un statut `a_planifier`, ce qui faisait passer le contrôle pour
// réalisé, repoussait l'échéance d'une période entière, et faisait détruire le
// rapport par la régénération qui suivait dans la même requête.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { depuisCleJourCivil } from "@/lib/dates";

type LigneVerif = {
  id: string;
  etablissementId: string;
  datePrevue: Date;
  dateRealisee: Date | null;
  statut: string;
  /** Porteur de la ligne. Non nul = échéance d'une personne, sur laquelle
   *  aucun document ne se dépose (ADR-023 § 2). */
  salarieId: string | null;
};

const h = vi.hoisted(() => {
  const db = {
    verification: null as LigneVerif | null,
    rapports: [] as Record<string, unknown>[],
  };
  const stockage = { fichiers: new Set<string>() };

  const prisma: Record<string, unknown> = {
    verification: {
      findUnique: async () => db.verification,
      update: async ({ data }: { data: Record<string, unknown> }) => {
        Object.assign(db.verification as object, data);
        return db.verification;
      },
    },
    rapportVerification: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        db.rapports.push(data);
        return data;
      },
      findUnique: async () => db.rapports[0] ?? null,
      delete: async () => {
        return db.rapports.pop();
      },
      count: async () => db.rapports.length,
    },
  };
  prisma.$transaction = async (arg: unknown) =>
    typeof arg === "function"
      ? (arg as (tx: unknown) => Promise<unknown>)(prisma)
      : Promise.all(arg as Promise<unknown>[]);

  return { db, prisma, stockage, genererCalendrier: vi.fn(async () => ({})) };
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
}));
vi.mock("@/lib/calendrier/actions", () => ({
  genererCalendrier: h.genererCalendrier,
}));
vi.mock("@/lib/storage", () => ({
  getStorage: () => ({
    put: async (cle: string) => {
      h.stockage.fichiers.add(cle);
    },
    delete: async (cle: string) => {
      h.stockage.fichiers.delete(cle);
    },
  }),
  cleRapport: (etab: string, id: string, nom: string) =>
    `rapports/${etab}/${id}-${nom}`,
}));

const { supprimerRapport, uploadRapport } = await import("./actions");

function formulaire(resultat: string, dateRapport: string): FormData {
  const fd = new FormData();
  fd.set("dateRapport", dateRapport);
  fd.set("resultat", resultat);
  // Le formulaire poste toujours ces champs, vides le cas échéant.
  fd.set("organismeVerif", "");
  fd.set("commentaires", "");
  fd.set(
    "fichier",
    new File([new Uint8Array([1, 2, 3])], "rapport.pdf", {
      type: "application/pdf",
    }),
  );
  return fd;
}

beforeEach(() => {
  h.db.rapports = [];
  h.stockage.fichiers.clear();
  h.genererCalendrier.mockClear();
  h.db.verification = {
    salarieId: null,
    id: "v-1",
    etablissementId: "etab-1",
    datePrevue: new Date("2026-01-15T00:00:00Z"), // échéance déjà passée
    dateRealisee: null,
    statut: "a_planifier",
  };
});

describe("uploadRapport — résultat « non vérifiable »", () => {
  it("n'écrit pas de date de réalisation", async () => {
    const res = await uploadRapport("v-1", { status: "idle" }, formulaire("non_verifiable", "2026-06-01"));

    expect(res.status).toBe("success");
    expect(h.db.verification?.dateRealisee).toBeNull();
  });

  it("ne repousse pas l'échéance et la signale comme dépassée", async () => {
    const echeance = h.db.verification!.datePrevue;
    await uploadRapport("v-1", { status: "idle" }, formulaire("non_verifiable", "2026-06-01"));

    expect(h.db.verification?.datePrevue).toEqual(echeance);
    expect(h.db.verification?.statut).toBe("depassee");
  });

  it("conserve le rapport et son fichier", async () => {
    await uploadRapport("v-1", { status: "idle" }, formulaire("non_verifiable", "2026-06-01"));

    expect(h.db.rapports).toHaveLength(1);
    expect(h.db.rapports[0].resultat).toBe("non_verifiable");
    expect(h.stockage.fichiers.size).toBe(1);
  });
});

describe("uploadRapport — résultats valant réalisation", () => {
  it("écrit la date de réalisation et le statut correspondant", async () => {
    await uploadRapport("v-1", { status: "idle" }, formulaire("conforme", "2026-06-01"));

    // La date saisie est une date **civile** : elle est ancrée à minuit heure
    // de Paris, pas à minuit UTC (ADR-011). `new Date("2026-06-01")` aurait
    // désigné 02:00 du matin heure française — l'écart qui faisait basculer
    // une échéance du jour en « en retard » dès 2 h.
    expect(h.db.verification?.dateRealisee).toEqual(
      depuisCleJourCivil("2026-06-01"),
    );
    expect(h.db.verification?.statut).toBe("realisee_conforme");
    expect(h.genererCalendrier).toHaveBeenCalledWith("etab-1");
  });

  it("nettoie le fichier si la base refuse l'écriture", async () => {
    const create = (h.prisma as { rapportVerification: { create: unknown } })
      .rapportVerification.create;
    (h.prisma as { rapportVerification: { create: unknown } }).rapportVerification.create =
      async () => {
        throw new Error("contrainte violée");
      };

    await expect(
      uploadRapport("v-1", { status: "idle" }, formulaire("conforme", "2026-06-01")),
    ).rejects.toThrow("contrainte violée");
    expect(h.stockage.fichiers.size).toBe(0);

    (h.prisma as { rapportVerification: { create: unknown } }).rapportVerification.create =
      create;
  });
});

describe("supprimerRapport", () => {
  it("rouvre le cycle quand le dernier justificatif disparaît", async () => {
    // Une vérification réalisée, dont le rapport est retiré du registre.
    h.db.verification = {
    salarieId: null,
      id: "v-1",
      etablissementId: "etab-1",
      datePrevue: new Date("2026-01-15T00:00:00Z"),
      dateRealisee: new Date("2026-01-10T00:00:00Z"),
      statut: "realisee_conforme",
    };
    h.db.rapports = [
      {
        id: "rap-1",
        etablissementId: "etab-1",
        verificationId: "v-1",
        fichierCle: "rapports/etab-1/rap-1-x.pdf",
        verification: { datePrevue: new Date("2026-01-15T00:00:00Z") },
      },
    ];
    h.stockage.fichiers.add("rapports/etab-1/rap-1-x.pdf");

    // `redirect` lève, comme en production : on l'absorbe.
    await expect(supprimerRapport("rap-1")).rejects.toThrow("NEXT_REDIRECT");

    // Plus de preuve → plus de réalisation affichée. Un statut
    // « realisee_conforme » sans justificatif est exactement ce qu'un
    // contrôle ne pardonne pas.
    expect(h.db.verification?.dateRealisee).toBeNull();
    expect(h.db.verification?.statut).toBe("depassee");
    // Le fichier n'est libéré qu'après le commit.
    expect(h.stockage.fichiers.size).toBe(0);
  });
});

describe("uploadRapport — la frontière médicale, tenue côté serveur", () => {
  /**
   * D'un titre de salarié, l'outil ne garde que l'existence, la date et
   * l'échéance — jamais le document (ADR-023 § 2, `docs/rgpd.md` § 2.3).
   *
   * Trois documents l'affirmaient, et rien ne l'empêchait : la garde vivait
   * dans un ternaire JSX de la fiche de vérification. Cette action serveur est
   * exposée en RPC ; un appel direct, ou une refonte de cet écran, déposait le
   * fichier sans un mot — l'attestation médicale d'une personne dans le
   * système de fichiers.
   */
  beforeEach(() => {
    h.db.verification = {
      salarieId: "sal-1",
      id: "v-titre",
      etablissementId: "etab-1",
      datePrevue: new Date("2026-01-15T00:00:00Z"),
      dateRealisee: null,
      statut: "a_planifier",
    };
  });

  it("refuse un dépôt sur l'échéance d'une personne", async () => {
    const res = await uploadRapport(
      "v-titre",
      { status: "idle" },
      formulaire("conforme", "2026-06-01"),
    );
    expect(res.status).toBe("error");
  });

  it("ne stocke aucun fichier et ne crée aucun rapport", async () => {
    // Le point qui compte : le refus doit intervenir AVANT l'écriture. Un
    // message d'erreur rendu après avoir posé le buffer dans le stockage ne
    // vaudrait rien.
    await uploadRapport(
      "v-titre",
      { status: "idle" },
      formulaire("conforme", "2026-06-01"),
    );
    expect(h.stockage.fichiers.size).toBe(0);
    expect(h.db.rapports).toEqual([]);
  });

  it("le refus porte sur le PORTEUR, pas sur le caractère médical", async () => {
    // Dix-neuf titres salarié restent à encoder, dont la plupart ne sont pas
    // médicaux — SST, CACES, autorisation de conduite. Aucun n'a de document à
    // déposer ici non plus : indexer la garde sur `pieceMedicale` la lèverait
    // au premier d'entre eux.
    const res = await uploadRapport(
      "v-titre",
      { status: "idle" },
      formulaire("conforme", "2026-06-01"),
    );
    expect(res.status === "error" && res.message).toMatch(/personne/i);
  });
});
