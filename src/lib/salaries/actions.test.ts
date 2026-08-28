// Les invalidations de cache des mutations du module Équipe.
//
// Le défaut que ce fichier ferme : `modifierSalarie` a perdu l'invalidation du
// calendrier et du tableau de bord quand `rafraichir` a été remplacée par
// `regenererEtRafraichir`. Les deux appels que la première faisait sont partis
// avec elle, sans que rien ne le signale — ni un test, ni le compilateur.
//
// Or le nom d'une personne s'affiche HORS du module Équipe : cinq écrans
// appellent `libellePorteur` sur les échéances. Un employeur qui corrige une
// orthographe — le geste que cet écran existe pour permettre, au titre de
// l'article 16 du RGPD — ne repropageait donc pas sa correction.

import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const salarie = {
    updateMany: vi.fn(async () => ({ count: 1 })),
    create: vi.fn(async () => ({ id: "sal-1" })),
  };
  return {
    prisma: { salarie },
    revalidatePath: vi.fn(),
    genererCalendrier: vi.fn(async () => {}),
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: h.prisma }));
vi.mock("next/cache", () => ({ revalidatePath: h.revalidatePath }));
vi.mock("@/lib/auth/scope", () => ({
  assertEtablissementOwnership: vi.fn(async () => {}),
}));
vi.mock("@/lib/calendrier/actions", () => ({
  genererCalendrier: h.genererCalendrier,
}));
vi.mock("@/lib/calendrier/reconciliation", () => ({
  marquerCalendrierPerime: vi.fn(async () => {}),
}));

const { creerSalarie, modifierSalarie } = await import("./actions");

function formulaire(nom: string, prenom: string): FormData {
  const fd = new FormData();
  fd.set("nom", nom);
  fd.set("prenom", prenom);
  fd.set("poste", "");
  fd.set("entreLe", "");
  return fd;
}

beforeEach(() => {
  h.revalidatePath.mockClear();
  h.genererCalendrier.mockClear();
  h.prisma.salarie.updateMany.mockClear();
});

describe("modifierSalarie — la correction d'un nom se repropage", () => {
  it("invalide le calendrier et le tableau de bord", async () => {
    const res = await modifierSalarie(
      "etab-1",
      "sal-1",
      { status: "idle" },
      formulaire("Dupont", "Jean"),
    );
    expect(res.status).toBe("success");

    const chemins = h.revalidatePath.mock.calls.map((c) => c[0]);
    // Les deux qui manquaient — le nom s'y affiche par `libellePorteur`.
    expect(chemins).toContain("/etablissements/etab-1/calendrier");
    expect(chemins).toContain("/etablissements/etab-1");
    // Et les deux du module lui-même, qui n'avaient pas disparu.
    expect(chemins).toContain("/etablissements/etab-1/equipe");
    expect(chemins).toContain("/etablissements/etab-1/equipe/sal-1");
  });

  it("ne relance PAS le générateur — renommer ne change aucune échéance", () => {
    // Le nom n'est écrit dans aucune colonne de `Verification` : il est joint à
    // la lecture. Régénérer ici serait une transaction complète pour rien.
    expect(h.genererCalendrier).not.toHaveBeenCalled();
  });

  it("ne touche à rien si la personne n'appartient pas à l'établissement", async () => {
    h.prisma.salarie.updateMany.mockResolvedValueOnce({ count: 0 });
    const res = await modifierSalarie(
      "etab-1",
      "sal-etranger",
      { status: "idle" },
      formulaire("Dupont", "Jean"),
    );
    expect(res.status).toBe("error");
    expect(h.revalidatePath).not.toHaveBeenCalled();
  });
});

describe("creerSalarie — n'invalide que son module, et c'est voulu", () => {
  it("ne touche ni le calendrier ni le tableau de bord", async () => {
    // Une personne sans titre ne porte aucune échéance : rien à repropager
    // ailleurs. C'est la seule mutation du module dans ce cas, et son
    // commentaire le dit — contrairement à `modifierSalarie`, dont l'omission
    // n'était justifiée nulle part, ce qui a fait penser à un oubli. C'en
    // était un.
    await creerSalarie("etab-1", { status: "idle" }, formulaire("Martin", "Léa"));
    const chemins = h.revalidatePath.mock.calls.map((c) => c[0]);
    expect(chemins).toEqual(["/etablissements/etab-1/equipe"]);
  });
});
