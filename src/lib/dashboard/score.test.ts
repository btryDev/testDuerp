import { describe, expect, it } from "vitest";
import { instantCivil } from "@/lib/dates";
import { evaluerEtatDuerp, type EtatDuerp } from "./duerp";
import {
  calculerScoreDepuisEtat,
  type EntreeScoreConformite,
} from "./score";

const NOW = instantCivil(2026, 8, 10, 8);

/** Raccourci : un DUERP ouvert dont la dernière version a `ageJours` jours,
 *  dans une entreprise soumise à la mise à jour annuelle. */
function duerpDe(ageJours: number | null, effectif = 20): EtatDuerp {
  return evaluerEtatDuerp(
    {
      ouvert: true,
      dateDerniereVersion:
        ageJours === null
          ? null
          : new Date(NOW.getTime() - ageJours * 86_400_000),
      effectif,
    },
    NOW,
  );
}

const base = (p: Partial<EntreeScoreConformite> = {}): EntreeScoreConformite => ({
  verifs: { total: 10, enRetard: 0 },
  actions: { ouvertesTotal: 0, enRetard: 0 },
  duerp: duerpDe(120),
  ...p,
});

describe("calculerScoreDepuisEtat", () => {
  it("renvoie 100 quand aucun engagement n'est suivi", () => {
    const s = calculerScoreDepuisEtat({
      verifs: { total: 0, enRetard: 0 },
      actions: { ouvertesTotal: 0, enRetard: 0 },
      duerp: null,
    });
    expect(s.valeur).toBe(100);
    expect(s.niveau).toBe("satisfaisante");
  });

  it("renvoie 100 quand tout est à jour", () => {
    expect(
      calculerScoreDepuisEtat(base({ actions: { ouvertesTotal: 3, enRetard: 0 } }))
        .valeur,
    ).toBe(100);
  });

  it("pénalise plus une vérif dépassée qu'une action en retard", () => {
    const avecVerif = calculerScoreDepuisEtat(
      base({
        verifs: { total: 10, enRetard: 1 },
        actions: { ouvertesTotal: 10, enRetard: 0 },
      }),
    );
    const avecAction = calculerScoreDepuisEtat(
      base({
        verifs: { total: 10, enRetard: 0 },
        actions: { ouvertesTotal: 10, enRetard: 1 },
      }),
    );
    expect(avecVerif.valeur).toBeLessThan(avecAction.valeur);
  });

  it("ne descend pas sous 0", () => {
    const s = calculerScoreDepuisEtat({
      verifs: { total: 1, enRetard: 1 },
      actions: { ouvertesTotal: 1, enRetard: 1 },
      duerp: duerpDe(900),
    });
    expect(s.valeur).toBeGreaterThanOrEqual(0);
  });

  it("niveau 'rattrapage' quand score < 50", () => {
    const s = calculerScoreDepuisEtat({
      verifs: { total: 2, enRetard: 2 },
      actions: { ouvertesTotal: 2, enRetard: 2 },
      duerp: duerpDe(900),
    });
    expect(s.niveau).toBe("rattrapage");
    expect(s.valeur).toBeLessThan(50);
  });

  it("niveau 'a_surveiller' entre 50 et 80", () => {
    // 10 vérifs (4 en retard ×3 = 12), 5 actions (2 en retard ×2 = 4),
    // DUERP à jour → denom = 16, pénalité = 16, score ≈ 67.
    const s = calculerScoreDepuisEtat({
      verifs: { total: 10, enRetard: 4 },
      actions: { ouvertesTotal: 5, enRetard: 2 },
      duerp: duerpDe(200),
    });
    expect(s.valeur).toBeGreaterThanOrEqual(50);
    expect(s.valeur).toBeLessThan(80);
    expect(s.niveau).toBe("a_surveiller");
  });

  it("déterministe : deux appels identiques = même résultat", () => {
    const e = base({
      verifs: { total: 8, enRetard: 1 },
      actions: { ouvertesTotal: 3, enRetard: 1 },
      duerp: duerpDe(280),
    });
    expect(calculerScoreDepuisEtat(e)).toEqual(calculerScoreDepuisEtat(e));
  });
});

describe("calculerScoreDepuisEtat — DUERP", () => {
  it("pénalise une version périmée", () => {
    const sain = calculerScoreDepuisEtat(base({ duerp: duerpDe(200) }));
    const perime = calculerScoreDepuisEtat(base({ duerp: duerpDe(500) }));
    expect(perime.valeur).toBeLessThan(sain.valeur);
  });

  it("pénalise autant un DUERP jamais validé qu'une version périmée", () => {
    // Régression du tableau de bord : un DUERP sans aucune version sortait
    // du calcul et ne coûtait rien, pendant qu'une version de 366 jours
    // coûtait un point. Ne jamais valider améliorait donc le score.
    const jamaisValide = calculerScoreDepuisEtat(base({ duerp: duerpDe(null) }));
    const perime = calculerScoreDepuisEtat(base({ duerp: duerpDe(500) }));
    expect(jamaisValide.valeur).toBe(perime.valeur);
    expect(jamaisValide.valeur).toBeLessThan(
      calculerScoreDepuisEtat(base({ duerp: duerpDe(100) })).valeur,
    );
  });

  it("ne pénalise pas l'ancienneté sous onze salariés (art. R. 4121-2)", () => {
    const petite = calculerScoreDepuisEtat(base({ duerp: duerpDe(500, 4) }));
    const grande = calculerScoreDepuisEtat(base({ duerp: duerpDe(500, 20) }));
    expect(petite.valeur).toBe(100);
    expect(grande.valeur).toBeLessThan(100);
  });

  it("compte le DUERP ouvert au dénominateur, même sans version", () => {
    const sans = calculerScoreDepuisEtat({
      verifs: { total: 3, enRetard: 1 },
      actions: { ouvertesTotal: 0, enRetard: 0 },
      duerp: null,
    });
    const avec = calculerScoreDepuisEtat({
      verifs: { total: 3, enRetard: 1 },
      actions: { ouvertesTotal: 0, enRetard: 0 },
      duerp: duerpDe(null),
    });
    // Le dénominateur grandit (4 au lieu de 3) mais la pénalité aussi : le
    // DUERP non figé ne doit pas *améliorer* le score.
    expect(avec.valeur).toBeLessThanOrEqual(sans.valeur);
  });
});
