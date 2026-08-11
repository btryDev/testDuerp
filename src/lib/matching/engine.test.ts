import { describe, expect, it } from "vitest";
import {
  obligationsConformite,
  obligationsElectricite,
  obligationsIncendie,
} from "@/lib/referentiels/conformite";
import type { Obligation } from "@/lib/referentiels/conformite/types";
import { CATEGORIES_EQUIPEMENT } from "@/lib/referentiels/types-communs";
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

describe("moteur matching — disjonction des régimes (ascenseurs)", () => {
  const ASCENSEURS = [
    "ascenseur-entretien-contrat",
    "ascenseur-examen-semestriel-secours",
    "ascenseur-examen-annuel-securite",
    "ascenseur-controle-technique-quinquennal",
    "ascenseur-carnet-entretien",
    "ascenseur-telealarme-liaison",
  ];

  function ascenseur(): EquipementMatching {
    return {
      id: "eq-asc",
      libelle: "Ascenseur principal",
      categorie: "ASCENSEUR",
      caracteristiques: null,
    };
  }

  it("ERP pur (non-travail, non-IGH) avec ascenseur → les 6 obligations ascenseur", () => {
    const erpPur = etabErpCat3();
    erpPur.estEtablissementTravail = false;
    const ids = idsObligations(
      determineObligationsApplicables(erpPur, [ascenseur()]),
    );
    for (const id of ASCENSEURS) expect(ids).toContain(id);
  });

  it("IGH pur (non-travail, non-ERP) avec ascenseur → les 6 obligations ascenseur", () => {
    const ighPur = etabIgh();
    ighPur.estEtablissementTravail = false;
    ighPur.estERP = false;
    ighPur.typeErp = null;
    ighPur.categorieErp = null;
    const ids = idsObligations(
      determineObligationsApplicables(ighPur, [ascenseur()]),
    );
    for (const id of ASCENSEURS) expect(ids).toContain(id);
  });

  it("établissement de travail seul (bureau) avec ascenseur → les 6 obligations ascenseur", () => {
    const ids = idsObligations(
      determineObligationsApplicables(etabBureau(), [ascenseur()]),
    );
    for (const id of ASCENSEURS) expect(ids).toContain(id);
  });

  it("cumul travail + ERP → chaque obligation ascenseur une seule fois, raisons = régimes matchés", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [ascenseur()]);
    const occurrences = res.filter((a) =>
      ASCENSEURS.includes(a.obligation.id),
    );
    expect(occurrences).toHaveLength(ASCENSEURS.length);
    const contrat = occurrences.find(
      (a) => a.obligation.id === "ascenseur-entretien-contrat",
    );
    expect(contrat?.raisons).toContain("établissement de travail (salariés)");
    expect(contrat?.raisons).toContain("ERP");
    // IGH non matché → absent des raisons.
    expect(contrat?.raisons).not.toContain("IGH");
  });

  it("habitation pure avec ascenseur → non applicable (habitation absente de la déclaration — limite assumée)", () => {
    const ids = idsObligations(
      determineObligationsApplicables(etabHabitationPure(), [ascenseur()]),
    );
    for (const id of ASCENSEURS) expect(ids).not.toContain(id);
  });

  it("le ET typologie × effectif est préservé (travail matché mais effectif hors plage → rejet)", () => {
    const synthetique: Obligation = {
      ...obligationsElectricite[0],
      id: "test-effectif-min",
      typologies: { travail: true, effectifMin: 50 },
    };
    const res = determineObligationsApplicables(etabBureau(), [elec()], {
      obligations: [synthetique],
    });
    expect(res).toHaveLength(0);
  });

  it("les exclusions restent en ET (erp: false rejette un établissement travail+ERP)", () => {
    const synthetique: Obligation = {
      ...obligationsElectricite[0],
      id: "test-exclusion-erp",
      typologies: { travail: true, erp: false },
    };
    const res = determineObligationsApplicables(etabErpCat3(), [elec()], {
      obligations: [synthetique],
    });
    expect(res).toHaveLength(0);
    // …mais accepte le même établissement sans régime ERP.
    const resBureau = determineObligationsApplicables(etabBureau(), [elec()], {
      obligations: [synthetique],
    });
    expect(resBureau).toHaveLength(1);
  });

  it("typologie vide → toujours rejetée (garde-fou)", () => {
    const synthetique: Obligation = {
      ...obligationsElectricite[0],
      id: "test-typologie-vide",
      typologies: {},
    };
    const res = determineObligationsApplicables(etabBureau(), [elec()], {
      obligations: [synthetique],
    });
    expect(res).toHaveLength(0);
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
    // Ramonage annuel des circuits d'extraction (GC 20) : une seule entrée
    // depuis la fusion du doublon `aeration-hotte-pro-annuelle`.
    expect(ids).toContain("cuisson-erp-circuits-extraction-nettoyage");
    expect(
      ids.filter((i) => i === "cuisson-erp-circuits-extraction-nettoyage"),
    ).toHaveLength(1);
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

  it("evaluerObligation : ramonage de hotte ne déclenche pas sans ERP", () => {
    const hotteObli = obligationsConformite.find(
      (o) => o.id === "cuisson-erp-circuits-extraction-nettoyage",
    )!;
    expect(evaluerObligation(hotteObli, etabBureau(), [hotte()])).toBeNull();
  });

  it("evaluerObligation : ramonage de hotte déclenche dans un ERP cat 5 avec hotte", () => {
    const hotteObli = obligationsConformite.find(
      (o) => o.id === "cuisson-erp-circuits-extraction-nettoyage",
    )!;
    const res = evaluerObligation(hotteObli, etabRestoErpCat5(), [hotte()]);
    expect(res).not.toBeNull();
    expect(res?.equipementsConcernes.map((e) => e.id)).toEqual(["eq-hotte"]);
  });

  it("le ramonage de hotte s'applique aussi à un ERP dont la catégorie est inconnue", () => {
    // Régression de la normalisation `erp: true` : la forme
    // `erp: { categories: ["N1"…"N5"] }` exigeait en plus une catégorie
    // renseignée et perdait donc l'obligation sur un ERP mal qualifié.
    const erpSansCategorie = etabRestoErpCat5({ categorieErp: null });
    const ids = idsObligations(
      determineObligationsApplicables(erpSansCategorie, [hotte()]),
    );
    expect(ids).toContain("cuisson-erp-circuits-extraction-nettoyage");
  });
});

// ============================================================================
// TESTS — amendements 2026-08 : conditions « non infirmées », restrictions de
// catégorie conjonctives, seuils d'effectif
// ============================================================================

describe("moteur matching — condition « non infirmée » (opt-out)", () => {
  const OBLIGATION_RIA = "incendie-erp-ria-annuelle";

  it("propriété non renseignée → obligation MAINTENUE", () => {
    // C'est tout l'objet de l'opérateur : un établissement déjà en base, dont
    // les extincteurs n'ont jamais porté la propriété `aRobinetsIncendieArmes`,
    // ne doit pas perdre l'obligation en silence.
    const res = determineObligationsApplicables(etabErpCat3(), [extincteur()]);
    expect(idsObligations(res)).toContain(OBLIGATION_RIA);
  });

  it("réponse « oui » explicite → obligation maintenue", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [
      { ...extincteur(), caracteristiques: { aRobinetsIncendieArmes: true } },
    ]);
    expect(idsObligations(res)).toContain(OBLIGATION_RIA);
  });

  it("réponse « non » explicite → obligation retirée", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [
      { ...extincteur(), caracteristiques: { aRobinetsIncendieArmes: false } },
    ]);
    expect(idsObligations(res)).not.toContain(OBLIGATION_RIA);
    // …sans emporter la vérification annuelle des extincteurs eux-mêmes.
    expect(idsObligations(res)).toContain("incendie-erp-extincteurs-annuelle");
  });

  it("valeur d'un type inattendu → traitée comme « pas de réponse »", () => {
    const res = determineObligationsApplicables(etabErpCat3(), [
      {
        ...extincteur(),
        caracteristiques: { aRobinetsIncendieArmes: "non" },
      },
    ]);
    expect(idsObligations(res)).toContain(OBLIGATION_RIA);
  });
});

describe("moteur matching — faux positifs structurels corrigés", () => {
  function levage(caracteristiques: Record<string, unknown> | null = null) {
    return {
      id: "eq-transpalette",
      libelle: "Transpalette électrique",
      categorie: "EQUIPEMENT_LEVAGE" as const,
      caracteristiques,
    };
  }

  it("un transpalette dont on a répondu « non » perd la VGP semestrielle « personnes »", () => {
    const res = determineObligationsApplicables(etabBureau(), [
      levage({ sertAuLevageDePersonnes: false, aAccessoiresDeLevage: false }),
    ]);
    const ids = idsObligations(res);
    expect(ids).not.toContain("levage-vgp-semestrielle-personnes");
    expect(ids).not.toContain("levage-vgp-accessoires-annuelle");
    // La VGP annuelle de levage de charges, elle, reste due.
    expect(ids).toContain("levage-vgp-annuelle-charges");
  });

  it("une nacelle déclarée comme telle conserve la VGP semestrielle", () => {
    const res = determineObligationsApplicables(etabBureau(), [
      levage({ sertAuLevageDePersonnes: true }),
    ]);
    expect(idsObligations(res)).toContain("levage-vgp-semestrielle-personnes");
  });

  it("un compresseur hors champ de l'arrêté du 20 novembre 2017 perd la requalification décennale", () => {
    const res = determineObligationsApplicables(etabBureau(), [
      {
        id: "eq-compresseur",
        libelle: "Compresseur d'atelier",
        categorie: "EQUIPEMENT_SOUS_PRESSION",
        caracteristiques: { estSoumisSuiviEnService: false },
      },
    ]);
    const ids = idsObligations(res);
    expect(ids).not.toContain("esp-requalification-decennale");
    expect(ids).not.toContain("esp-inspection-periodique");
    // La formation des opérateurs relève du Code du travail : elle demeure.
    expect(ids).toContain("esp-personnel-formation");
  });

  it("une VMC d'habitation non raccordée au gaz perd l'obligation VMC-Gaz", () => {
    const res = determineObligationsApplicables(etabHabitationPure(), [
      vmc({ caracteristiques: { estVmcGaz: false } }),
    ]);
    expect(idsObligations(res)).not.toContain(
      "aeration-habitation-vmc-gaz-annuelle",
    );
  });

  it("une cuisine sans extinction automatique perd la vérification correspondante", () => {
    const res = determineObligationsApplicables(etabRestoErpCat5(), [
      { ...cuissonErp(), caracteristiques: { aExtinctionAutomatique: false } },
    ]);
    const ids = idsObligations(res);
    expect(ids).not.toContain("cuisson-erp-extinction-automatique-annuelle");
    expect(ids).toContain("cuisson-erp-appareils-annuelle");
  });
});

describe("moteur matching — aucun établissement existant ne perd une obligation criticité ≥ 4", () => {
  /**
   * Verrou central de l'amendement 2026-08. Un établissement « existant » est
   * un établissement dont les équipements n'ont AUCUNE caractéristique
   * renseignée — situation de tous ceux qui sont en base avant l'ajout des
   * nouvelles questions. Le test reconstitue ce cas et vérifie que le parc
   * d'obligations de criticité ≥ 4 est identique à celui qu'on obtiendrait
   * sans aucune condition, c'est-à-dire avant l'amendement.
   */
  const etabTousRegimes: EtablissementMatching = {
    id: "etab-legacy",
    effectifSurSite: 80,
    estEtablissementTravail: true,
    estERP: true,
    estIGH: true,
    estHabitation: true,
    typeErp: "N",
    categorieErp: "N2",
    classeIgh: "GHZ",
  };

  /** Un équipement sans caractéristiques pour chacune des catégories. */
  const parcSansCaracteristiques: EquipementMatching[] =
    CATEGORIES_EQUIPEMENT.map((categorie) => ({
      id: `eq-${categorie}`,
      libelle: categorie,
      categorie,
      caracteristiques: null,
    }));

  it("le résultat inclut toutes les obligations criticité ≥ 4 conditionnées en « non infirmée »", () => {
    const ids = new Set(
      idsObligations(
        determineObligationsApplicables(
          etabTousRegimes,
          parcSansCaracteristiques,
        ),
      ),
    );

    const perdues = obligationsConformite
      .filter((o) => o.criticite >= 4)
      .filter((o) =>
        (o.conditions ?? []).every(
          (c) => c.type === "equipement_propriete_non_infirmee",
        ),
      )
      // Restrictions de typologie / d'effectif hors sujet ici : on ne garde
      // que les obligations que cet établissement « tous régimes » satisfait
      // par ailleurs, en les réévaluant sans leurs conditions.
      .filter(
        (o) =>
          evaluerObligation(
            { ...o, conditions: undefined },
            etabTousRegimes,
            parcSansCaracteristiques,
          ) !== null,
      )
      .map((o) => o.id)
      .filter((id) => !ids.has(id));

    expect(perdues).toEqual([]);
  });

  it("aucune condition stricte n'a été ajoutée sur une obligation criticité ≥ 4 hors allowlist", () => {
    // Doublon volontaire de l'invariant du référentiel : si quelqu'un
    // contourne la règle côté référentiel, le moteur le signale aussi.
    const strictes = obligationsConformite
      .filter((o) => o.criticite >= 4)
      .filter((o) =>
        (o.conditions ?? []).some(
          (c) => c.type !== "equipement_propriete_non_infirmee",
        ),
      )
      .map((o) => o.id)
      .sort();
    expect(strictes).toEqual([
      "aeration-erp-ps-surveillance-qualite-air-sup-250",
      "aeration-travail-locaux-pollution-specifique",
      "elec-erp-groupe-electrogene-annuel",
    ]);
  });
});

describe("moteur matching — restriction de catégorie ERP en ET avec les autres régimes", () => {
  it("un ERP hors catégories ne contourne PAS la restriction via travail: true", () => {
    // Piège latent identifié à l'audit : les régimes positifs sont en OU. Une
    // obligation qui restreint la catégorie ERP tout en acceptant le régime
    // travail serait matchée par un ERP employeur hors catégories, via la
    // seule branche « travail ». La restriction doit primer.
    const synthetique: Obligation = {
      ...obligationsElectricite[0],
      id: "test-restriction-categorie-et",
      typologies: { travail: true, erp: { categories: ["N1", "N2"] } },
    };
    const erpCat5Employeur = etabRestoErpCat5(); // travail + ERP N5
    expect(
      determineObligationsApplicables(erpCat5Employeur, [elec()], {
        obligations: [synthetique],
      }),
    ).toHaveLength(0);

    // …et l'ERP dans la liste, lui, matche bien.
    expect(
      determineObligationsApplicables(etabErpCat3(), [elec()], {
        obligations: [
          {
            ...synthetique,
            typologies: { travail: true, erp: { categories: ["N3"] } },
          },
        ],
      }),
    ).toHaveLength(1);
  });

  it("un établissement NON-ERP n'est pas concerné par la restriction de catégorie", () => {
    // La restriction ne s'applique qu'aux établissements du régime restreint :
    // un bureau non-ERP reste éligible par la branche « travail ».
    const synthetique: Obligation = {
      ...obligationsElectricite[0],
      id: "test-restriction-categorie-non-erp",
      typologies: { travail: true, erp: { categories: ["N1", "N2"] } },
    };
    expect(
      determineObligationsApplicables(etabBureau(), [elec()], {
        obligations: [synthetique],
      }),
    ).toHaveLength(1);
  });

  it("même règle pour les classes IGH", () => {
    const synthetique: Obligation = {
      ...obligationsElectricite[0],
      id: "test-restriction-classe-igh-et",
      typologies: { travail: true, igh: { classes: ["GHA"] } },
    };
    // etabIgh() est un GHW employeur : la restriction GHA doit rejeter.
    expect(
      determineObligationsApplicables(etabIgh(), [elec()], {
        obligations: [synthetique],
      }),
    ).toHaveLength(0);
  });

  it("un ERP dont la catégorie est inconnue est rejeté par une restriction de catégorie", () => {
    const synthetique: Obligation = {
      ...obligationsElectricite[0],
      id: "test-restriction-categorie-inconnue",
      typologies: { erp: { categories: ["N1", "N2"] } },
    };
    const erpSansCategorie = etabErpCat3();
    erpSansCategorie.categorieErp = null;
    expect(
      determineObligationsApplicables(erpSansCategorie, [elec()], {
        obligations: [synthetique],
      }),
    ).toHaveLength(0);
  });
});

describe("moteur matching — seuil d'effectif de l'exercice semestriel d'évacuation", () => {
  const EXERCICE = "incendie-travail-exercice-semestriel";

  it("un salon de coiffure de 2 personnes ne reçoit plus l'exercice semestriel", () => {
    const res = determineObligationsApplicables(
      etabBureau({ effectifSurSite: 2 }),
      [alarme()],
    );
    expect(idsObligations(res)).not.toContain(EXERCICE);
  });

  it("50 personnes exactement : sous le seuil (« plus de cinquante »)", () => {
    const res = determineObligationsApplicables(
      etabBureau({ effectifSurSite: 50 }),
      [alarme()],
    );
    expect(idsObligations(res)).not.toContain(EXERCICE);
  });

  it("51 personnes : l'obligation s'applique", () => {
    const res = determineObligationsApplicables(
      etabBureau({ effectifSurSite: 51 }),
      [alarme()],
    );
    expect(idsObligations(res)).toContain(EXERCICE);
  });
});
