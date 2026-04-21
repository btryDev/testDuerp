import { describe, expect, it } from "vitest";
import {
  genererRecommandations,
  type EntreeRecos,
} from "./recommandations";

const NOW = new Date("2026-04-20T10:00:00Z");
const JOUR_MS = 86_400_000;

function dateDecalee(joursDeNow: number): Date {
  return new Date(NOW.getTime() + joursDeNow * JOUR_MS);
}

function baseEntree(): EntreeRecos {
  return {
    etablissementId: "etab-x",
    verifications: [],
    actions: [],
  };
}

describe("genererRecommandations — tri par urgence", () => {
  it("liste vide quand rien à faire", () => {
    expect(
      genererRecommandations(baseEntree(), { now: NOW }).length,
    ).toBe(0);
  });

  it("vérif dépassée passe en tête", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v1",
          statut: "depassee",
          datePrevue: dateDecalee(-10),
          libelleObligation: "Vérification élec",
          equipementLibelle: "TGBT",
        },
      ],
      actions: [
        {
          id: "a1",
          statut: "ouverte",
          echeance: dateDecalee(-5),
          libelle: "Refaire câble",
        },
      ],
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs[0].kind).toBe("verif_depassee");
    expect(recs[1].kind).toBe("action_en_retard");
  });

  it("vérif dépassée plus ancienne avant plus récente", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v-recent",
          statut: "depassee",
          datePrevue: dateDecalee(-1),
          libelleObligation: "VMC",
          equipementLibelle: "CTA",
        },
        {
          id: "v-ancien",
          statut: "depassee",
          datePrevue: dateDecalee(-30),
          libelleObligation: "Extincteurs",
          equipementLibelle: "Extincteurs",
        },
      ],
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs[0].titre).toContain("Extincteurs");
  });

  it("tronque à 5 items max par défaut", () => {
    const verifs = Array.from({ length: 10 }, (_, i) => ({
      id: `v-${i}`,
      statut: "depassee" as const,
      datePrevue: dateDecalee(-i),
      libelleObligation: `Vérif ${i}`,
      equipementLibelle: "X",
    }));
    const e: EntreeRecos = { ...baseEntree(), verifications: verifs };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs.length).toBe(5);
  });

  it("accepte une limite custom", () => {
    const actions = Array.from({ length: 10 }, (_, i) => ({
      id: `a-${i}`,
      statut: "ouverte" as const,
      echeance: dateDecalee(-i - 1),
      libelle: `Action ${i}`,
    }));
    const e: EntreeRecos = { ...baseEntree(), actions };
    const recs = genererRecommandations(e, { now: NOW, limite: 3 });
    expect(recs.length).toBe(3);
  });
});

describe("genererRecommandations — catégories", () => {
  it("vérif à venir sous 7 jours", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v1",
          statut: "planifiee",
          datePrevue: dateDecalee(3),
          libelleObligation: "Contrôle alarme",
          equipementLibelle: "SSI",
        },
      ],
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs[0].kind).toBe("verif_proche");
  });

  it("vérif à venir au-delà de 7 jours — ignorée", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v1",
          statut: "planifiee",
          datePrevue: dateDecalee(30),
          libelleObligation: "Contrôle",
          equipementLibelle: "X",
        },
      ],
    };
    expect(genererRecommandations(e, { now: NOW }).length).toBe(0);
  });

  it("action à venir sous 15 jours", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      actions: [
        {
          id: "a1",
          statut: "ouverte",
          echeance: dateDecalee(10),
          libelle: "Remplacer BAES",
        },
      ],
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs[0].kind).toBe("action_proche");
  });

  it("DUERP > 11 mois → recommande mise à jour", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      duerpAgeJours: 400,
      duerpId: "duerp-x",
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs.some((r) => r.kind === "duerp_a_jour")).toBe(true);
  });

  it("DUERP < 11 mois → pas de recommandation", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      duerpAgeJours: 100,
      duerpId: "duerp-x",
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs.some((r) => r.kind === "duerp_a_jour")).toBe(false);
  });

  it("action clôturée ignorée", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      actions: [
        {
          id: "a-closed",
          statut: "levee",
          echeance: dateDecalee(-30),
          libelle: "Déjà fait",
        },
      ],
    };
    expect(genererRecommandations(e, { now: NOW }).length).toBe(0);
  });
});

describe("genererRecommandations — href", () => {
  it("génère les bons chemins d'URL", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v-123",
          statut: "depassee",
          datePrevue: dateDecalee(-5),
          libelleObligation: "Test",
          equipementLibelle: "E",
        },
      ],
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs[0].href).toBe("/etablissements/etab-x/verifications/v-123");
  });
});
