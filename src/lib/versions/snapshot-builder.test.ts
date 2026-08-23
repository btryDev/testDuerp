// La jonction entre ce qui est saisi et ce qui est gravé — base simulée.
//
// `figerCouverture` et `questionsActivites` sont testés chacun de leur côté.
// Ce qui ne l'était pas, c'est leur raccord : `Duerp.reponsesActivitesNonCouvertes`
// → `questionsActivites(secteur, réponses)` → `figerCouverture` →
// `snapshot.couverture`. C'est pourtant le seul point du dépôt où une réponse
// cesse d'être modifiable et devient une pièce conservée quarante ans. Une
// inversion d'arguments ou un secteur lu au mauvais endroit y passerait sans
// faire échouer aucun des tests unitaires voisins.

import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const db = {
    duerp: null as unknown,
  };
  const prisma = {
    duerp: { findFirst: async () => db.duerp },
  };
  return { db, prisma, requireUser: vi.fn(async () => ({ id: "user-1" })) };
});

vi.mock("@/lib/prisma", () => ({ prisma: h.prisma }));
vi.mock("@/lib/auth/require-user", () => ({ requireUser: h.requireUser }));

const { construireSnapshot } = await import("./snapshot-builder");

const VIANDE = "com-decoupe-viande";
const MAREE = "com-rayon-maree";

/** Un DUERP minimal : ce test ne regarde que la couverture. */
function duerpAvec(
  referentielSecteurId: string | null,
  reponses: unknown,
): unknown {
  return {
    id: "duerp-1",
    referentielSecteurId,
    reponsesActivitesNonCouvertes: reponses,
    unites: [],
    etablissement: {
      codeNaf: "47.11B",
      effectifSurSite: 8,
      adresse: "2 rue du Marché",
      entreprise: { raisonSociale: "Épicerie du coin", siret: "12345678901234", codeNaf: "47.11B" },
    },
  };
}

beforeEach(() => {
  h.db.duerp = duerpAvec("commerce", null);
});

describe("construireSnapshot — la couverture qui part dans la version", () => {
  it("grave un « oui » comme une activité déclarée, avec ce qui manque", async () => {
    h.db.duerp = duerpAvec("commerce", { [VIANDE]: true });

    const snap = await construireSnapshot("duerp-1", { numero: 1, motif: null });

    const ligne = snap!.couverture!.activites.find((a) => a.id === VIANDE);
    expect(ligne?.exercee).toBe(true);
    // Le libellé et le `cequiManque` sont recopiés au moment de figer : le
    // document ne dépendra plus du référentiel pour se relire.
    expect(ligne?.libelle.length).toBeGreaterThan(0);
    expect(ligne?.cequiManque.length).toBeGreaterThan(0);
  });

  it("distingue le refus du silence, question par question", async () => {
    h.db.duerp = duerpAvec("commerce", { [VIANDE]: false });

    const snap = await construireSnapshot("duerp-1", { numero: 1, motif: null });
    const activites = snap!.couverture!.activites;

    expect(activites.find((a) => a.id === VIANDE)?.exercee).toBe(false);
    // Jamais `false` par défaut : une question non posée n'est pas un « non ».
    expect(activites.find((a) => a.id === MAREE)?.exercee).toBeNull();
  });

  it("grave les questions posées même quand rien n'a été répondu", async () => {
    const snap = await construireSnapshot("duerp-1", { numero: 1, motif: null });

    expect(snap!.couverture!.activites.length).toBeGreaterThan(0);
    expect(
      snap!.couverture!.activites.every((a) => a.exercee === null),
      "un dossier muet doit graver des silences, pas une liste vide — sinon " +
        "il devient indistinguable d'un dossier à qui rien n'a été demandé",
    ).toBe(true);
  });

  it("ignore une réponse qui ne relève pas du secteur retenu", async () => {
    // Reste d'un secteur précédent, ou clé écrite à la main en base : le
    // référentiel du secteur retenu est la seule autorité sur les questions
    // qui existent.
    h.db.duerp = duerpAvec("commerce", { "resto-repas-hors-site": true });

    const snap = await construireSnapshot("duerp-1", { numero: 1, motif: null });

    expect(snap!.couverture!.activites.map((a) => a.id)).not.toContain(
      "resto-repas-hors-site",
    );
    expect(snap!.couverture!.activites.every((a) => a.exercee === null)).toBe(true);
  });

  it("reporte le secteur dans la couverture, y compris quand il est absent", async () => {
    h.db.duerp = duerpAvec("commerce", null);
    let snap = await construireSnapshot("duerp-1", { numero: 1, motif: null });
    expect(snap!.couverture!.referentielSecteurId).toBe("commerce");

    h.db.duerp = duerpAvec(null, null);
    snap = await construireSnapshot("duerp-1", { numero: 1, motif: null });
    expect(snap!.couverture!.referentielSecteurId).toBeNull();
    // Aucun secteur : aucune question n'a pu être posée, donc aucune ligne —
    // et surtout pas des lignes « sans réponse » qui laisseraient croire
    // qu'on a demandé quelque chose.
    expect(snap!.couverture!.activites).toEqual([]);
  });

  it("rend null pour un DUERP hors périmètre, sans rien graver", async () => {
    h.db.duerp = null;
    expect(
      await construireSnapshot("duerp-1", { numero: 1, motif: null }),
    ).toBeNull();
  });
});
