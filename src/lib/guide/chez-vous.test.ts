import { describe, expect, it } from "vitest";
import type {
  EquipementMatching,
  EtablissementMatching,
} from "@/lib/matching";
import { construireChezVous, SEUIL_MAJ_ANNUELLE_DUERP } from "./chez-vous";

function etabBureau(
  over: Partial<EtablissementMatching> = {},
): EtablissementMatching {
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
    personnesPresentesHabituellement: null,
    manipuleMatieresR422722: null,
    ...over,
  };
}

function elec(): EquipementMatching {
  return {
    id: "eq-elec",
    libelle: "TGBT",
    categorie: "INSTALLATION_ELECTRIQUE",
    caracteristiques: null,
  };
}

function extincteur(): EquipementMatching {
  return {
    id: "eq-ext",
    libelle: "Extincteurs",
    categorie: "EXTINCTEUR",
    caracteristiques: null,
  };
}

function autre(): EquipementMatching {
  return {
    id: "eq-autre",
    libelle: "Machine spéciale",
    categorie: "AUTRE",
    caracteristiques: null,
  };
}

describe("construireChezVous — DUERP", () => {
  it("effectif ≥ 11 → mise à jour au moins annuelle", () => {
    const r = construireChezVous(etabBureau({ effectifSurSite: 11 }), []);
    expect(r.duerp.misAJourAnnuel).toBe(true);
    expect(r.duerp.effectif).toBe(11);
  });

  it("effectif < 11 → pas d'annualité imposée", () => {
    const r = construireChezVous(etabBureau({ effectifSurSite: 8 }), []);
    expect(r.duerp.misAJourAnnuel).toBe(false);
  });

  it("le seuil exporté correspond à R. 4121-2", () => {
    expect(SEUIL_MAJ_ANNUELLE_DUERP).toBe(11);
  });
});

describe("construireChezVous — domaines", () => {
  it("bureau avec élec + extincteurs → domaines électricité et incendie, dans l'ordre du référentiel", () => {
    const r = construireChezVous(etabBureau(), [elec(), extincteur()]);
    const ids = r.domaines.map((d) => d.domaine);
    expect(ids).toContain("electricite");
    expect(ids).toContain("incendie");
    expect(ids.indexOf("electricite")).toBeLessThan(ids.indexOf("incendie"));
    const elecDom = r.domaines.find((d) => d.domaine === "electricite")!;
    expect(elecDom.nbObligations).toBeGreaterThan(0);
    expect(elecDom.equipements).toContain("TGBT");
    expect(elecDom.raisons.length).toBeGreaterThan(0);
  });

  it("les périodicités sont triées de la plus fréquente à la plus espacée, sans doublon", () => {
    const r = construireChezVous(etabBureau(), [elec()]);
    const elecDom = r.domaines.find((d) => d.domaine === "electricite")!;
    expect(new Set(elecDom.periodicites).size).toBe(
      elecDom.periodicites.length,
    );
    // annuelle (rang 4) avant mise_en_service_uniquement (rang 9)
    const iAnnuelle = elecDom.periodicites.indexOf("annuelle");
    const iMes = elecDom.periodicites.indexOf("mise_en_service_uniquement");
    if (iAnnuelle !== -1 && iMes !== -1) {
      expect(iAnnuelle).toBeLessThan(iMes);
    }
  });

  it("les raisons sont dédupliquées entre obligations d'un même domaine", () => {
    const r = construireChezVous(etabBureau(), [elec()]);
    const elecDom = r.domaines.find((d) => d.domaine === "electricite")!;
    expect(new Set(elecDom.raisons).size).toBe(elecDom.raisons.length);
  });

  it("ERP pur avec ascenseur → domaine ascenseur présent (disjonction des régimes)", () => {
    const erpPur = etabBureau({
      estEtablissementTravail: false,
      estERP: true,
      typeErp: "M",
      categorieErp: "N3",
    });
    const r = construireChezVous(erpPur, [
      {
        id: "eq-asc",
        libelle: "Ascenseur",
        categorie: "ASCENSEUR",
        caracteristiques: null,
      },
    ]);
    expect(r.domaines.map((d) => d.domaine)).toContain("ascenseur");
  });
});

describe("construireChezVous — trous honnêtes", () => {
  it("catégorie AUTRE déclarée → signalée comme sans obligation générée", () => {
    const r = construireChezVous(etabBureau(), [elec(), autre()]);
    expect(r.categoriesSansObligation).toContain("AUTRE");
    expect(r.categoriesSansObligation).not.toContain(
      "INSTALLATION_ELECTRIQUE",
    );
  });

  it("aucun équipement déclaré → aucunEquipement, mais pas zéro obligation", () => {
    // Ce test figeait `domaines: []` jusqu'au 2026-08-27, et il figeait donc
    // un faux négatif : un employeur sans appareil déclaré lisait, dans un
    // guide qui s'intitule « chez vous », qu'il ne lui incombait rien. Or
    // R. 4222-20 lui impose d'entretenir et de contrôler l'ensemble de ses
    // installations d'aération, déclarées ou non (ADR-022).
    const r = construireChezVous(etabBureau(), []);
    expect(r.aucunEquipement).toBe(true);
    expect(r.categoriesSansObligation).toEqual([]);

    // Le domaine apparaît, et il apparaît SANS équipement rattaché : c'est
    // ce couple qui distingue « vous n'avez rien déclaré » de « rien ne vous
    // incombe ».
    //
    // `incendie` a rejoint `aeration` le 2026-08-31, lot « faux négatifs
    // d'ancrage » : la tenue du registre de sécurité était accrochée à un
    // EXTINCTEUR ou une ALARME_INCENDIE déclarés, alors que L. 4711-1 et
    // L. 4711-2 l'imposent à tout employeur et R. 143-44 à tout ERP, sans
    // condition d'équipement. Ce test disait donc encore, pour l'incendie,
    // exactement ce que son propre commentaire reproche : « rien ne vous
    // incombe » à quelqu'un à qui quelque chose incombe.
    expect(r.domaines.map((d) => d.domaine)).toEqual(["incendie", "aeration"]);
    for (const d of r.domaines) {
      expect(d.equipements, d.domaine).toEqual([]);
      expect(d.raisons.join(" "), d.domaine).toContain(
        "porte sur l'établissement",
      );
    }
  });
});
