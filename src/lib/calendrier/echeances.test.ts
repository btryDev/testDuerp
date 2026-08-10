import { describe, expect, it } from "vitest";
import {
  echeanceDuerp,
  echeanceLegionelles,
  echeancePermisFeu,
  echeancePlanPrevention,
  echeancesPrestataire,
  origineAction,
  tonPourDate,
} from "./echeances";

const AUJOURDHUI = new Date(2026, 7, 10); // 10 août 2026

describe("tonPourDate", () => {
  it("classe en alerte une date passée", () => {
    expect(tonPourDate(new Date(2026, 7, 9), AUJOURDHUI)).toBe("alerte");
  });

  it("classe en ok le jour même et le futur", () => {
    expect(tonPourDate(new Date(2026, 7, 10), AUJOURDHUI)).toBe("ok");
    expect(tonPourDate(new Date(2026, 11, 1), AUJOURDHUI)).toBe("ok");
  });

  it("juge au jour calendaire, pas à la minute : une échéance de ce matin n'est pas en retard cet après-midi", () => {
    const cetApresMidi = new Date(2026, 7, 10, 18, 30);
    expect(tonPourDate(new Date(2026, 7, 10, 0, 0), cetApresMidi)).toBe("ok");
    expect(tonPourDate(new Date(2026, 7, 9, 23, 59), cetApresMidi)).toBe(
      "alerte",
    );
  });
});

describe("origineAction", () => {
  it("annonce le contrôle d'origine quand l'action vient d'un rapport", () => {
    expect(
      origineAction({
        verificationLibelle: "Vérification annuelle des extincteurs",
        duerp: false,
      }),
    ).toBe("Suite au contrôle « Vérification annuelle des extincteurs »");
  });

  it("annonce le DUERP quand l'action vient d'un risque", () => {
    expect(origineAction({ verificationLibelle: null, duerp: true })).toBe(
      "Mesure prévue au DUERP",
    );
  });

  it("reste générique quand l'action est libre", () => {
    expect(origineAction({ verificationLibelle: null, duerp: false })).toBe(
      "À faire sur place",
    );
  });
});

describe("echeanceDuerp", () => {
  it("pose l'échéance un an après la dernière version", () => {
    const e = echeanceDuerp({
      etablissementId: "etab1",
      dateDerniereVersion: new Date(2026, 1, 10),
      aujourdhui: AUJOURDHUI,
    });
    expect(e).not.toBeNull();
    expect(e!.date.getFullYear()).toBe(2027);
    expect(e!.date.getMonth()).toBe(1);
    expect(e!.tone).toBe("ok");
    expect(e!.famille).toBe("papiers");
    expect(e!.href).toBe("/etablissements/etab1/duerp");
  });

  it("passe en alerte quand la version a plus d'un an", () => {
    const e = echeanceDuerp({
      etablissementId: "etab1",
      dateDerniereVersion: new Date(2025, 3, 1),
      aujourdhui: AUJOURDHUI,
    });
    expect(e!.tone).toBe("alerte");
  });

  it("ne produit rien sans version validée", () => {
    expect(
      echeanceDuerp({
        etablissementId: "etab1",
        dateDerniereVersion: null,
        aujourdhui: AUJOURDHUI,
      }),
    ).toBeNull();
  });
});

describe("echeancesPrestataire", () => {
  const base = {
    id: "p1",
    raisonSociale: "Vérif Élec SARL",
  };

  it("produit une échéance par pièce datée, avec le bon ton", () => {
    const out = echeancesPrestataire(
      {
        ...base,
        attestationUrssafValableJusquA: new Date(2026, 6, 1), // passée
        assuranceRcProValableJusquA: new Date(2026, 11, 31), // à venir
      },
      AUJOURDHUI,
      "etab1",
    );
    expect(out).toHaveLength(2);
    const urssaf = out.find((e) => e.id.endsWith("urssaf"))!;
    const rcpro = out.find((e) => e.id.endsWith("rcpro"))!;
    expect(urssaf.tone).toBe("alerte");
    expect(rcpro.tone).toBe("ok");
    expect(urssaf.famille).toBe("papiers");
    expect(urssaf.libelle).toContain("Vérif Élec SARL");
    expect(urssaf.href).toBe("/etablissements/etab1/prestataires/p1");
  });

  it("ignore les pièces sans date — le calendrier ne montre que du daté", () => {
    const out = echeancesPrestataire(
      {
        ...base,
        attestationUrssafValableJusquA: null,
        assuranceRcProValableJusquA: null,
      },
      AUJOURDHUI,
      "etab1",
    );
    expect(out).toHaveLength(0);
  });
});

describe("echeancePermisFeu", () => {
  const base = { id: "pf1", numero: 3, lieu: "Toiture", dateDebut: new Date(2026, 7, 20) };

  it("reste ok tant que la date de début n'est pas passée", () => {
    const e = echeancePermisFeu(
      { ...base, statut: "attente_signatures" },
      AUJOURDHUI,
      "etab1",
    );
    expect(e.tone).toBe("ok");
    expect(e.famille).toBe("travaux");
    expect(e.href).toBe("/etablissements/etab1/permis-feu/pf1");
  });

  it("alerte si le début est passé sans que les travaux soient en cours", () => {
    const e = echeancePermisFeu(
      { ...base, dateDebut: new Date(2026, 7, 1), statut: "brouillon" },
      AUJOURDHUI,
      "etab1",
    );
    expect(e.tone).toBe("alerte");
  });

  it("pas d'alerte si les travaux sont en cours", () => {
    const e = echeancePermisFeu(
      { ...base, dateDebut: new Date(2026, 7, 1), statut: "en_cours" },
      AUJOURDHUI,
      "etab1",
    );
    expect(e.tone).toBe("ok");
  });
});

describe("echeancePlanPrevention", () => {
  const base = {
    id: "pp1",
    numero: 2,
    entrepriseExterieureRaison: "BTP Ouest",
    dateDebut: new Date(2026, 7, 1),
  };

  it("alerte si l'opération a commencé sans inspection commune", () => {
    const e = echeancePlanPrevention(
      { ...base, inspectionDate: null },
      AUJOURDHUI,
      "etab1",
    );
    expect(e.tone).toBe("alerte");
  });

  it("ok si l'inspection commune a eu lieu", () => {
    const e = echeancePlanPrevention(
      { ...base, inspectionDate: new Date(2026, 6, 28) },
      AUJOURDHUI,
      "etab1",
    );
    expect(e.tone).toBe("ok");
    expect(e.famille).toBe("travaux");
  });
});

describe("echeanceLegionelles", () => {
  it("pose la prochaine analyse un an après la dernière, en famille contrôles", () => {
    const e = echeanceLegionelles({
      etablissementId: "etab1",
      dateDerniereAnalyse: new Date(2026, 1, 10),
      aujourdhui: AUJOURDHUI,
    });
    expect(e).not.toBeNull();
    expect(e!.famille).toBe("controle");
    expect(e!.date.getFullYear()).toBe(2027);
    expect(e!.tone).toBe("ok");
  });

  it("ne produit rien sans première analyse", () => {
    expect(
      echeanceLegionelles({
        etablissementId: "etab1",
        dateDerniereAnalyse: null,
        aujourdhui: AUJOURDHUI,
      }),
    ).toBeNull();
  });
});
