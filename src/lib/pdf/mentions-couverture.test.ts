import { describe, expect, it } from "vitest";
import type { CouvertureSnapshot } from "@/lib/versions/snapshot";
import { phrasesMethodologie, quandSansReponse } from "./mentions-couverture";

function couverture(
  activites: { id: string; exercee: boolean | null }[],
): CouvertureSnapshot {
  return {
    referentielSecteurId: "commerce",
    activites: activites.map((a) => ({
      id: a.id,
      libelle: `Activité ${a.id}`,
      cequiManque: "des risques types absents du référentiel",
      exercee: a.exercee,
    })),
  };
}

const rien = { nbUnitesHorsReferentiel: 0, brouillon: false };

describe("phrasesMethodologie", () => {
  it("ne dit rien quand il n'y a rien à dire", () => {
    expect(
      phrasesMethodologie({
        couverture: couverture([{ id: "com-decoupe-viande", exercee: false }]),
        ...rien,
      }),
    ).toEqual([]);
  });

  it("ne dit rien d'une version validée avant l'introduction de la couverture", () => {
    // Champ absent : le document doit rester exactement celui qu'il était le
    // jour de sa validation. Aucune mention, aucune réserve.
    expect(phrasesMethodologie({ couverture: undefined, ...rien })).toEqual([]);
  });

  it("signale les unités hors référentiel", () => {
    const p = phrasesMethodologie({
      couverture: undefined,
      nbUnitesHorsReferentiel: 2,
      brouillon: false,
    });
    expect(p).toHaveLength(1);
    expect(p[0]).toContain("aucune unité type du référentiel sectoriel");
  });

  it("nomme les activités déclarées, et tait alors les questions sans réponse", () => {
    const p = phrasesMethodologie({
      couverture: couverture([
        { id: "com-decoupe-viande", exercee: true },
        { id: "com-rayon-maree", exercee: null },
      ]),
      ...rien,
    });
    // Une seule phrase : la liste des activités porte déjà la nuance, et la
    // mention isolée se lirait comme un reproche fait au dossier.
    expect(p).toHaveLength(1);
    expect(p[0]).toContain("ne couvre pas toutes les activités");
    expect(p.join(" ")).not.toContain("sans réponse");
  });

  it("distingue un dossier muet d'un dossier qui a répondu « non » partout", () => {
    const muet = phrasesMethodologie({
      couverture: couverture([
        { id: "com-decoupe-viande", exercee: null },
        { id: "com-rayon-maree", exercee: null },
      ]),
      ...rien,
    });
    expect(muet).toHaveLength(1);
    expect(muet[0]).toContain("2 questions");
    expect(muet[0]).toContain("sont restées");
    expect(muet[0]).toContain("n'affirme ni que");

    const tranche = phrasesMethodologie({
      couverture: couverture([
        { id: "com-decoupe-viande", exercee: false },
        { id: "com-rayon-maree", exercee: false },
      ]),
      ...rien,
    });
    expect(tranche).toEqual([]);
  });

  it("accorde la phrase au singulier sur une seule question", () => {
    const p = phrasesMethodologie({
      couverture: couverture([{ id: "com-decoupe-viande", exercee: null }]),
      ...rien,
    });
    expect(p[0]).toContain("1 question ");
    expect(p[0]).toContain("est restée");
  });

  it("garde l'ordre : unités, puis activités déclarées", () => {
    const p = phrasesMethodologie({
      couverture: couverture([{ id: "com-decoupe-viande", exercee: true }]),
      nbUnitesHorsReferentiel: 1,
      brouillon: false,
    });
    expect(p).toHaveLength(2);
    expect(p[0]).toContain("unité type");
    expect(p[1]).toContain("activités déclarées");
  });

  it("ne date pas d'une validation ce qui n'est qu'un aperçu", () => {
    const apercu = phrasesMethodologie({
      couverture: couverture([{ id: "com-decoupe-viande", exercee: null }]),
      nbUnitesHorsReferentiel: 0,
      brouillon: true,
    });
    expect(apercu[0]).toContain("à ce jour");
    expect(apercu[0]).not.toContain("date de validation");
  });

  it("aucune phrase ne conclut ni ne mesure", () => {
    const toutes = [
      ...phrasesMethodologie({
        couverture: couverture([
          { id: "com-decoupe-viande", exercee: true },
          { id: "com-rayon-maree", exercee: null },
        ]),
        nbUnitesHorsReferentiel: 3,
        brouillon: false,
      }),
      ...phrasesMethodologie({
        couverture: couverture([{ id: "com-rayon-maree", exercee: null }]),
        ...rien,
      }),
    ].join(" ");
    for (const interdit of ["conforme", "complet", "%", "exhaustif"]) {
      expect(toutes.toLowerCase()).not.toContain(interdit);
    }
  });
});

describe("quandSansReponse", () => {
  it("ne parle de validation que sur une version figée", () => {
    expect(quandSansReponse(false)).toBe("à la date de validation");
    expect(quandSansReponse(true)).toBe("à ce jour");
  });
});
