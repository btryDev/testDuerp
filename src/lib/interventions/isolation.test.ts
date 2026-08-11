import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Non-régression sur le cloisonnement des lectures d'interventions.
 *
 * `listRisquesEtablissement` n'avait aucun scope : appelée depuis une page
 * avec l'`etablissementId` de l'URL, elle rendait le libellé de tous les
 * risques du DUERP visé — l'évaluation complète d'un autre client, lisible
 * en changeant un identifiant dans la barre d'adresse. Une fuite en lecture
 * seule reste une fuite : le DUERP décrit l'organisation interne d'une
 * entreprise.
 */

const { prismaMock, requireUserMock } = vi.hoisted(() => {
  const modele = () => ({
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
  });
  return {
    prismaMock: {
      etablissement: modele(),
      intervention: modele(),
      risque: modele(),
      commentaireIntervention: modele(),
      $transaction: vi.fn(),
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

import {
  ajouterCommentaire,
  changerPrioriteIntervention,
  changerStatutIntervention,
  cloturerIntervention,
} from "./actions";
import { listInterventions, listRisquesEtablissement } from "./queries";

const USER = { id: "user-legitime", email: "dirigeant@exemple.fr" };

function estNotFound(e: unknown): boolean {
  const digest = (e as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.includes("404");
}

beforeEach(() => {
  vi.clearAllMocks();
  requireUserMock.mockResolvedValue(USER);
  // `$transaction` n'est pas un modèle : il n'a ni findFirst ni findMany.
  for (const modele of Object.values(prismaMock)) {
    if (typeof modele !== "object" || modele === null) continue;
    if (!("findFirst" in modele)) continue;
    modele.findFirst.mockResolvedValue(null);
    modele.findMany.mockResolvedValue([]);
  }
});

describe("lectures interventions — établissement d'un autre client", () => {
  it("listRisquesEtablissement refuse et ne lit aucun risque", async () => {
    await expect(
      listRisquesEtablissement("etab-autre-client"),
    ).rejects.toSatisfy(estNotFound);
    expect(prismaMock.risque.findMany).not.toHaveBeenCalled();
  });

  it("listInterventions refuse et ne lit aucune intervention", async () => {
    await expect(listInterventions("etab-autre-client")).rejects.toSatisfy(
      estNotFound,
    );
    expect(prismaMock.intervention.findMany).not.toHaveBeenCalled();
  });
});

/**
 * Non-régression sur le cloisonnement des ÉCRITURES.
 *
 * Les actions du module recevaient un `etablissementId` et un `interventionId`,
 * vérifiaient le premier, puis écrivaient sur le second : prouver qu'on possède
 * l'établissement qu'on annonce ne dit rien du ticket qu'on vise. Un utilisateur
 * légitime pouvait donc clore, reprioriser ou commenter le ticket d'un autre
 * client en envoyant son propre établissement avec l'identifiant du ticket visé.
 * Le garde porte désormais sur l'objet manipulé (`requireIntervention`).
 */
describe("écritures interventions — ticket d'un autre client", () => {
  it("changerStatutIntervention refuse et n'écrit rien", async () => {
    await expect(
      changerStatutIntervention("etab-du-user", "itv-autre-client", "fait"),
    ).rejects.toSatisfy(estNotFound);
    expect(prismaMock.intervention.update).not.toHaveBeenCalled();
  });

  it("changerPrioriteIntervention refuse et n'écrit rien", async () => {
    await expect(
      changerPrioriteIntervention("etab-du-user", "itv-autre-client", "urgente"),
    ).rejects.toSatisfy(estNotFound);
    expect(prismaMock.intervention.update).not.toHaveBeenCalled();
  });

  it("cloturerIntervention refuse et n'ouvre aucune transaction", async () => {
    await expect(
      cloturerIntervention("etab-du-user", "itv-autre-client", "Réglé", true),
    ).rejects.toSatisfy(estNotFound);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("ajouterCommentaire refuse et ne crée aucun commentaire", async () => {
    const formData = new FormData();
    formData.set("auteurNom", "Intrus");
    formData.set("contenu", "Commentaire déposé chez le voisin");

    await expect(
      ajouterCommentaire(
        "etab-du-user",
        "itv-autre-client",
        { status: "idle" },
        formData,
      ),
    ).rejects.toSatisfy(estNotFound);
    expect(prismaMock.commentaireIntervention.create).not.toHaveBeenCalled();
  });
});

describe("lectures interventions — chemin nominal", () => {
  it("listRisquesEtablissement rend les risques du DUERP du user", async () => {
    prismaMock.etablissement.findFirst.mockResolvedValue({ id: "e1" });
    prismaMock.risque.findMany.mockResolvedValue([
      { id: "r1", libelle: "Coupure", unite: { nom: "Cuisine" } },
    ]);

    const risques = await listRisquesEtablissement("e1");

    expect(risques).toEqual([
      { id: "r1", libelle: "Coupure", uniteNom: "Cuisine" },
    ]);
  });
});
