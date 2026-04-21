import { describe, expect, it } from "vitest";
import {
  obligationsAeration,
  obligationsConformite,
  obligationsElectricite,
  obligationsIncendie,
} from "@/lib/referentiels/conformite";
import type { Obligation } from "@/lib/referentiels/conformite/types";
import {
  determineObligationsApplicables,
  evaluerObligation,
  type EquipementMatching,
  type EtablissementMatching,
} from "./index";

// ============================================================================
// Fixtures d'établissements
// ============================================================================

function etabBureau(over: Partial<EtablissementMatching> = {}): EtablissementMatching {
  return {
    id: "etab-bureau",
    effectifSurSite: 12,
    estEtablissementTravail: true,
    estERP: false,
    estIGH: false,
    estHabitation: false,
    typeErp: null,
    categorieErp: null,
    classeIgh: null,
    ...over,
  };
}

function etabRestoErpCat5(
  over: Partial<EtablissementMatching> = {},
): EtablissementMatching {
  return {
    id: "etab-resto",
    effectifSurSite: 8,
    estEtablissementTravail: true,
    estERP: true,
    estIGH: false,
    estHabitation: false,
    typeErp: "N",
    categorieErp: "N5",
    classeIgh: null,
    ...over,
  };
}

function etabErpCat3(): EtablissementMatching {
  return {
    id: "etab-centre-comm",
    effectifSurSite: 45,
    estEtablissementTravail: true,
    estERP: true,
    estIGH: false,
    estHabitation: false,
    typeErp: "M",
    categorieErp: "N3",
    classeIgh: null,
  };
}

function etabIgh(): EtablissementMatching {
  return {
    id: "etab-igh",
    effectifSurSite: 600,
    estEtablissementTravail: true,
    estERP: true,
    estIGH: true,
    estHabitation: false,
    typeErp: "W",
    categorieErp: "N1",
    classeIgh: "GHW",
  };
}

function etabHabitationPure(): EtablissementMatching {
  return {
    id: "etab-hab",
    effectifSurSite: 0,
    estEtablissementTravail: false,
    estERP: false,
    estIGH: false,
    estHabitation: true,
    typeErp: null,
    categorieErp: null,
    classeIgh: null,
  };
}

// ============================================================================
// Fixtures d'équipements
// ============================================================================

function elec(over: Partial<EquipementMatching> = {}): EquipementMatching {
  return {
    id: "eq-elec",
    libelle: "TGBT",
    categorie: "INSTALLATION_ELECTRIQUE",
    caracteristiques: null,
    ...over,
  };
}

function extincteur(): EquipementMatching {
  return {
    id: "eq-ext",
    libelle: "Extincteurs",
    categorie: "EXTINCTEUR",
    caracteristiques: { nombre: 4 },
  };
}

function baes(): EquipementMatching {
  return {
    id: "eq-baes",
    libelle: "BAES",
    categorie: "BAES",
    caracteristiques: { nombre: 6 },
  };
}

function vmc(over: Partial<EquipementMatching> = {}): EquipementMatching {
  return {
    id: "eq-vmc",
    libelle: "VMC simple flux",
    categorie: "VMC",
    caracteristiques: null,
    ...over,
  };
}

function hotte(): EquipementMatching {
  return {
    id: "eq-hotte",
    libelle: "Hotte cuisine",
    categorie: "HOTTE_PRO",
    caracteristiques: null,
  };
}

function cuissonErp(): EquipementMatching {
  return {
    id: "eq-cuisson",
    libelle: "Friteuse pro",
    categorie: "APPAREIL_CUISSON_ERP",
    caracteristiques: null,
  };
}

function alarme(): EquipementMatching {
  return {
    id: "eq-alarme",
    libelle: "SSI",
    categorie: "ALARME_INCENDIE",
    caracteristiques: null,
  };
}

function desenfumage(): EquipementMatching {
  return {
    id: "eq-dsf",
    libelle: "Désenfumage mécanique",
    categorie: "DESENFUMAGE",
    caracteristiques: null,
  };
}

function idsObligations(list: ReturnType<typeof determineObligationsApplicables>): string[] {
  return list.map((a) => a.obligation.id).sort();
}

// ============================================================================
// TESTS — typologie
// ============================================================================

describe("moteur matching — typologie Travail seule", () => {
  it("bureau tertiaire avec élec + extincteur + VMC → obligations travail attendues", () => {
    const res = determineObligationsApplicables(etabBureau(), [
      elec(),
      extincteur(),
      vmc(),
    ]);
    const ids = idsObligations(res);
    expect(ids).toContain("elec-travail-periodique-annuelle");
    expect(ids).toContain("elec-travail-mise-en-service");
    expect(ids).toContain("incendie-travail-moyens-lutte");
    expect(ids).toContain("aeration-travail-entretien-annuel");
    // Pas d'obligations ERP
    expect(ids).not.toContain("elec-erp-cat1-4-annuelle");
    expect(ids).not.toContain("elec-erp-cat5-quinquennale");
  });

  it("bureau sans équipement → aucune obligation déclenchée (même si typologie travail)", () => {
    const res = determineObligationsApplicables(etabBureau(), []);
    expect(res).toHaveLength(0);
  });

  it("registre de sécurité (periodicite=autre) apparaît quand travail+ERP+équipements de lutte", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [
      extincteur(),
      alarme(),
    ]);
    expect(idsObligations(res)).toContain("incendie-registre-securite");
  });
});

describe("moteur matching — typologie ERP", () => {
  it("restaurant ERP cat 5 → déclenche la règle quinquennale PE 4, pas l'annuelle cat 1-4", () => {
    const res = determineObligationsApplicables(etabRestoErpCat5(), [elec()]);
    const ids = idsObligations(res);
    expect(ids).toContain("elec-erp-cat5-quinquennale");
    expect(ids).not.toContain("elec-erp-cat1-4-annuelle");
  });

  it("centre commercial ERP cat 3 → déclenche l'annuelle EL 19, pas la quinquennale PE 4", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [elec()]);
    const ids = idsObligations(res);
    expect(ids).toContain("elec-erp-cat1-4-annuelle");
    expect(ids).not.toContain("elec-erp-cat5-quinquennale");
  });

  it("ERP sans équipement électrique déclaré → pas d'obligation élec ERP", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [extincteur()]);
    const ids = idsObligations(res);
    expect(ids).not.toContain("elec-erp-cat1-4-annuelle");
    expect(ids).not.toContain("elec-erp-cat5-quinquennale");
  });

  it("ERP cat 5 → visite commission PE locaux à sommeil (typologie cat N5)", () => {
    const res = determineObligationsApplicables(etabRestoErpCat5(), [alarme()]);
    expect(idsObligations(res)).toContain("incendie-erp-5-visite-commission");
  });

  it("ERP cat 3 → PAS de visite PE (limitée aux cat N5)", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [alarme()]);
    expect(idsObligations(res)).not.toContain("incendie-erp-5-visite-commission");
  });

  it("ERP cat 3 → SSI triennale (limitée aux cat N1-N4)", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [alarme()]);
    expect(idsObligations(res)).toContain("incendie-erp-ssi-triennale");
  });

  it("ERP cat 5 → PAS de SSI triennale (limitée aux cat N1-N4)", () => {
    const res = determineObligationsApplicables(etabRestoErpCat5(), [alarme()]);
    expect(idsObligations(res)).not.toContain("incendie-erp-ssi-triennale");
  });
});

describe("moteur matching — typologie IGH", () => {
  it("IGH avec élec → déclenche GH 50 annuelle", () => {
    const res = determineObligationsApplicables(etabIgh(), [elec()]);
    expect(idsObligations(res)).toContain("elec-igh-annuelle");
  });

  it("IGH avec alarme + extincteur + désenfumage → moyens de secours annuels GH 60 s.", () => {
    const res = determineObligationsApplicables(etabIgh(), [
      alarme(),
      extincteur(),
      desenfumage(),
    ]);
    expect(idsObligations(res)).toContain("incendie-igh-moyens-secours-annuelle");
  });

  it("bureau non-IGH → pas de GH 50", () => {
    const res = determineObligationsApplicables(etabBureau(), [elec()]);
    expect(idsObligations(res)).not.toContain("elec-igh-annuelle");
  });
});

describe("moteur matching — typologie habitation", () => {
  it("habitation avec VMC-Gaz → arrêté 25 avril 1985 applicable", () => {
    const res = determineObligationsApplicables(etabHabitationPure(), [vmc()]);
    expect(idsObligations(res)).toContain("aeration-habitation-vmc-gaz-annuelle");
  });

  it("habitation sans VMC → pas d'obligation VMC-Gaz", () => {
    const res = determineObligationsApplicables(etabHabitationPure(), []);
    expect(idsObligations(res)).not.toContain(
      "aeration-habitation-vmc-gaz-annuelle",
    );
  });

  it("bureau non-habitation → pas de VMC-Gaz habitation même avec VMC", () => {
    const res = determineObligationsApplicables(etabBureau(), [vmc()]);
    expect(idsObligations(res)).not.toContain(
      "aeration-habitation-vmc-gaz-annuelle",
    );
  });
});

// ============================================================================
// TESTS — conditions d'équipement
// ============================================================================

describe("moteur matching — conditions booléennes (groupe électrogène)", () => {
  it("ERP avec groupe électrogène déclaré → EL 20 applicable", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [
      elec({
        caracteristiques: { aGroupeElectrogene: true },
      }),
    ]);
    expect(idsObligations(res)).toContain("elec-erp-groupe-electrogene-annuel");
  });

  it("ERP SANS groupe électrogène → EL 20 NON applicable", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [
      elec({ caracteristiques: { aGroupeElectrogene: false } }),
    ]);
    expect(idsObligations(res)).not.toContain(
      "elec-erp-groupe-electrogene-annuel",
    );
  });

  it("ERP avec caracs absentes → EL 20 NON applicable (condition par défaut = non remplie)", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [elec()]);
    expect(idsObligations(res)).not.toContain(
      "elec-erp-groupe-electrogene-annuel",
    );
  });
});

describe("moteur matching — conditions booléennes (local pollution spécifique)", () => {
  it("travail avec VMC pollution spécifique → contrôle semestriel applicable", () => {
    const res = determineObligationsApplicables(etabBureau(), [
      vmc({ caracteristiques: { estLocalPollutionSpecifique: true } }),
    ]);
    expect(idsObligations(res)).toContain(
      "aeration-travail-locaux-pollution-specifique",
    );
  });

  it("travail avec VMC SANS pollution spécifique → contrôle semestriel non applicable", () => {
    const res = determineObligationsApplicables(etabBureau(), [vmc()]);
    expect(idsObligations(res)).not.toContain(
      "aeration-travail-locaux-pollution-specifique",
    );
  });

  it("travail avec hotte pollution spécifique → contrôle semestriel applicable (VMC/CTA/HOTTE_PRO)", () => {
    const res = determineObligationsApplicables(etabBureau(), [
      { ...hotte(), caracteristiques: { estLocalPollutionSpecifique: true } },
    ]);
    expect(idsObligations(res)).toContain(
      "aeration-travail-locaux-pollution-specifique",
    );
  });
});

describe("moteur matching — conditions numériques (parking couvert)", () => {
  it("parking ≤ 250 véhicules → règle biennale PS 32", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [
      vmc({ caracteristiques: { nbVehiculesParkingCouvert: 180 } }),
    ]);
    const ids = idsObligations(res);
    expect(ids).toContain("aeration-erp-ps-surveillance-qualite-air-inf-250");
    expect(ids).not.toContain("aeration-erp-ps-surveillance-qualite-air-sup-250");
  });

  it("parking > 250 véhicules → règle annuelle PS 32", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [
      vmc({ caracteristiques: { nbVehiculesParkingCouvert: 420 } }),
    ]);
    const ids = idsObligations(res);
    expect(ids).toContain("aeration-erp-ps-surveillance-qualite-air-sup-250");
    expect(ids).not.toContain("aeration-erp-ps-surveillance-qualite-air-inf-250");
  });

  it("parking exactement 250 → biennale (≤ 250)", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [
      vmc({ caracteristiques: { nbVehiculesParkingCouvert: 250 } }),
    ]);
    const ids = idsObligations(res);
    expect(ids).toContain("aeration-erp-ps-surveillance-qualite-air-inf-250");
    expect(ids).not.toContain("aeration-erp-ps-surveillance-qualite-air-sup-250");
  });

  it("VMC sans info parking → aucune des deux règles PS 32", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [vmc()]);
    const ids = idsObligations(res);
    expect(ids).not.toContain("aeration-erp-ps-surveillance-qualite-air-inf-250");
    expect(ids).not.toContain("aeration-erp-ps-surveillance-qualite-air-sup-250");
  });
});

// ============================================================================
// TESTS — parcours métier complets
// ============================================================================

describe("moteur matching — scénarios intégrés", () => {
  it("restaurant complet (NAF 56 ERP cat 5 travail) avec parc équipement pré-rempli", () => {
    const res = determineObligationsApplicables(etabRestoErpCat5(), [
      elec(),
      extincteur(),
      baes(),
      alarme(),
      vmc(),
      hotte(),
      cuissonErp(),
    ]);
    const ids = idsObligations(res);
    // Élec — cat 5 : quinquennale + mise en service + travail annuelle + initiale + reg sécurité élec
    expect(ids).toContain("elec-travail-periodique-annuelle");
    expect(ids).toContain("elec-travail-mise-en-service");
    expect(ids).toContain("elec-erp-cat5-quinquennale");
    expect(ids).toContain("elec-erp-mise-en-service");
    expect(ids).toContain("elec-travail-consignation-registre");
    // Incendie
    expect(ids).toContain("incendie-travail-moyens-lutte");
    expect(ids).toContain("incendie-erp-extincteurs-annuelle");
    expect(ids).toContain("incendie-erp-ssi-annuelle");
    expect(ids).toContain("incendie-erp-baes-annuelle");
    expect(ids).toContain("incendie-registre-securite");
    // Aération
    expect(ids).toContain("aeration-travail-entretien-annuel");
    expect(ids).toContain("aeration-erp-chauffage-ventilation-annuelle");
    expect(ids).toContain("aeration-hotte-pro-annuelle");
  });

  it("bureau minimaliste (travail uniquement) — pas d'obligations ERP ni IGH", () => {
    const res = determineObligationsApplicables(etabBureau(), [
      elec(),
      extincteur(),
      baes(),
      vmc(),
    ]);
    for (const o of res) {
      // Aucune obligation exclusivement ERP ne doit apparaître
      const t = o.obligation.typologies;
      const erpStrict =
        (t.erp === true || typeof t.erp === "object") &&
        t.travail === undefined &&
        !t.habitation &&
        !t.igh;
      expect(erpStrict).toBe(false);
    }
  });

  it("IGH + ERP cat 1 — cumul des deux régimes (élec)", () => {
    const res = determineObligationsApplicables(etabIgh(), [elec()]);
    const ids = idsObligations(res);
    expect(ids).toContain("elec-igh-annuelle");
    expect(ids).toContain("elec-erp-cat1-4-annuelle");
    expect(ids).toContain("elec-travail-periodique-annuelle");
  });
});

// ============================================================================
// TESTS — API et mode explain
// ============================================================================

describe("moteur matching — API et mode explain", () => {
  it("renvoie des raisons pour chaque obligation retenue", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [elec()]);
    for (const o of res) {
      expect(Array.isArray(o.raisons)).toBe(true);
      expect(o.raisons.length).toBeGreaterThan(0);
    }
  });

  it("mode explain cite l'ERP pour une obligation ERP", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [elec()]);
    const annuelle = res.find(
      (o) => o.obligation.id === "elec-erp-cat1-4-annuelle",
    );
    expect(annuelle).toBeDefined();
    expect(annuelle?.raisons.some((r) => r.includes("ERP"))).toBe(true);
  });

  it("mode explain cite la catégorie ERP pour une obligation cat-restreinte", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [alarme()]);
    const tri = res.find((o) => o.obligation.id === "incendie-erp-ssi-triennale");
    expect(tri).toBeDefined();
    expect(tri?.raisons.some((r) => r.includes("catégorie"))).toBe(true);
  });

  it("renvoie les équipements déclencheurs pour chaque obligation", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [
      elec(),
      extincteur(),
    ]);
    const elecObligation = res.find(
      (o) => o.obligation.id === "elec-erp-cat1-4-annuelle",
    );
    expect(elecObligation?.equipementsConcernes.map((e) => e.id)).toEqual([
      "eq-elec",
    ]);
  });

  it("injection d'un référentiel custom (tests)", () => {
    const oneOff: Obligation[] = [obligationsElectricite[0]];
    const res = determineObligationsApplicables(etabBureau(), [elec()], {
      obligations: oneOff,
    });
    expect(res.length).toBe(1);
    expect(res[0].obligation.id).toBe(obligationsElectricite[0].id);
  });
});

// ============================================================================
// TESTS — cohérence globale avec le référentiel complet
// ============================================================================

describe("moteur matching — cohérence avec le référentiel", () => {
  it("chaque obligation du référentiel peut être matchée sur au moins un scénario type", () => {
    // Scénario "grand complet" qui cumule tous les régimes + équipements clés.
    const etabComplet: EtablissementMatching = {
      id: "etab-complet",
      effectifSurSite: 800,
      estEtablissementTravail: true,
      estERP: true,
      estIGH: true,
      estHabitation: true,
      typeErp: "M",
      categorieErp: "N1",
      classeIgh: "GHZ",
    };
    const eqComplet: EquipementMatching[] = [
      elec({ caracteristiques: { aGroupeElectrogene: true } }),
      extincteur(),
      baes(),
      alarme(),
      desenfumage(),
      vmc({
        caracteristiques: {
          estLocalPollutionSpecifique: true,
          nbVehiculesParkingCouvert: 300,
        },
      }),
      hotte(),
      cuissonErp(),
    ];
    // On ne teste pas tous les ids : certains dépendent de cat 5 ou ≤ 250, qui
    // sont exclusifs. Le test vérifie surtout qu'aucune erreur n'est levée et
    // qu'on récupère plus de 15 obligations.
    const res = determineObligationsApplicables(etabComplet, eqComplet);
    expect(res.length).toBeGreaterThan(15);
  });

  it("aucun doublon d'id dans le résultat (les obligations sont uniques)", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [
      elec(),
      extincteur(),
      alarme(),
      baes(),
    ]);
    const ids = res.map((r) => r.obligation.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("le résultat conserve les références d'obligations du référentiel", () => {
    const res = determineObligationsApplicables(etabBureau(), [elec()]);
    for (const r of res) {
      expect(obligationsConformite).toContain(r.obligation);
    }
  });

  it("les 3 domaines P1 sont joignables via le moteur", () => {
    const etab = etabErpCat3();
    const eq = [elec(), extincteur(), alarme(), vmc()];
    const res = determineObligationsApplicables(etab, eq);
    const domaines = new Set(res.map((r) => r.obligation.domaine));
    expect(domaines.has("electricite")).toBe(true);
    expect(domaines.has("incendie")).toBe(true);
    expect(domaines.has("aeration")).toBe(true);
  });

  it("evaluerObligation en direct renvoie null si typologie incompatible", () => {
    const res = evaluerObligation(
      obligationsElectricite.find((o) => o.id === "elec-igh-annuelle")!,
      etabBureau(),
      [elec()],
    );
    expect(res).toBeNull();
  });

  it("evaluerObligation renvoie null si aucun équipement compatible", () => {
    const res = evaluerObligation(
      obligationsIncendie.find((o) => o.id === "incendie-erp-baes-annuelle")!,
      etabErpCat3(),
      [elec()], // pas de BAES
    );
    expect(res).toBeNull();
  });

  it("evaluerObligation : hotte pro ne déclenche pas sans ERP", () => {
    const hotteObli = obligationsAeration.find(
      (o) => o.id === "aeration-hotte-pro-annuelle",
    )!;
    expect(evaluerObligation(hotteObli, etabBureau(), [hotte()])).toBeNull();
  });

  it("evaluerObligation : hotte pro déclenche dans un ERP cat 5 avec hotte", () => {
    const hotteObli = obligationsAeration.find(
      (o) => o.id === "aeration-hotte-pro-annuelle",
    )!;
    const res = evaluerObligation(hotteObli, etabRestoErpCat5(), [hotte()]);
    expect(res).not.toBeNull();
    expect(res?.equipementsConcernes.map((e) => e.id)).toEqual(["eq-hotte"]);
  });
});
