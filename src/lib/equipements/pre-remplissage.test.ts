import { describe, expect, it } from "vitest";
import { suggererEquipements } from "./pre-remplissage";

function categories(out: ReturnType<typeof suggererEquipements>): string[] {
  return out.map((e) => e.categorie).sort();
}

describe("suggererEquipements — secteurs cibles V2", () => {
  it("restauration classique (NAF 56.10A) — ERP N cat 5 + travail", () => {
    const r = suggererEquipements({
      codeNaf: "56.10A",
      estEtablissementTravail: true,
      estERP: true,
      estIGH: false,
      estHabitation: false,
    });
    const cats = categories(r);
    expect(cats).toContain("HOTTE_PRO");
    expect(cats).toContain("APPAREIL_CUISSON_ERP");
    expect(cats).toContain("INSTALLATION_ELECTRIQUE");
    expect(cats).toContain("EXTINCTEUR");
    expect(cats).toContain("BAES");
    expect(cats).toContain("ALARME_INCENDIE");
    expect(cats).toContain("VMC");
  });

  it("commerce de détail (NAF 47.11B) — ERP + travail", () => {
    const r = suggererEquipements({
      codeNaf: "47.11B",
      estEtablissementTravail: true,
      estERP: true,
      estIGH: false,
      estHabitation: false,
    });
    const cats = categories(r);
    expect(cats).toContain("INSTALLATION_ELECTRIQUE");
    expect(cats).toContain("BAES");
    expect(cats).toContain("EXTINCTEUR");
    expect(cats).toContain("ALARME_INCENDIE");
  });

  it("bureau tertiaire (NAF 70.22Z) — travail seul", () => {
    const r = suggererEquipements({
      codeNaf: "70.22Z",
      estEtablissementTravail: true,
      estERP: false,
      estIGH: false,
      estHabitation: false,
    });
    const cats = categories(r);
    expect(cats).toContain("INSTALLATION_ELECTRIQUE");
    expect(cats).toContain("BAES");
    expect(cats).toContain("ALARME_INCENDIE");
    expect(cats).toContain("VMC");
    expect(cats).toContain("EXTINCTEUR");
    // pas d'équipement ERP propre (MS 73…) puisque estERP=false
    expect(cats).not.toContain("DESENFUMAGE");
  });

  it("déduplique EXTINCTEUR quand à la fois travail + ERP", () => {
    const r = suggererEquipements({
      codeNaf: "56.10A",
      estEtablissementTravail: true,
      estERP: true,
      estIGH: false,
      estHabitation: false,
    });
    const extincteurs = r.filter((e) => e.categorie === "EXTINCTEUR");
    expect(extincteurs.length).toBe(1);
  });

  it("IGH ajoute désenfumage et ascenseur", () => {
    const r = suggererEquipements({
      codeNaf: "70.10Z",
      estEtablissementTravail: true,
      estERP: false,
      estIGH: true,
      estHabitation: false,
    });
    const cats = categories(r);
    expect(cats).toContain("DESENFUMAGE");
    expect(cats).toContain("ASCENSEUR");
  });

  it("habitation seule — suggère la VMC (cas VMC-Gaz)", () => {
    const r = suggererEquipements({
      codeNaf: null,
      estEtablissementTravail: false,
      estERP: false,
      estIGH: false,
      estHabitation: true,
    });
    const cats = categories(r);
    expect(cats).toContain("VMC");
  });

  it("établissement sans aucun régime (cas improbable) — suggère rien", () => {
    const r = suggererEquipements({
      codeNaf: null,
      estEtablissementTravail: false,
      estERP: false,
      estIGH: false,
      estHabitation: false,
    });
    expect(r.length).toBe(0);
  });

  it("NAF inconnu — tombe sur les règles de typologie seulement", () => {
    const r = suggererEquipements({
      codeNaf: "99.99Z",
      estEtablissementTravail: true,
      estERP: false,
      estIGH: false,
      estHabitation: false,
    });
    const cats = categories(r);
    // aucune règle sectorielle, mais règles travail → élec, VMC, extincteurs
    expect(cats).toContain("INSTALLATION_ELECTRIQUE");
    expect(cats).toContain("VMC");
    expect(cats).toContain("EXTINCTEUR");
    // pas de hotte (pas de restauration)
    expect(cats).not.toContain("HOTTE_PRO");
  });
});

describe("suggererEquipements — chaque entrée a une raison non vide", () => {
  it("tous les contextes possibles renvoient des raisons renseignées", () => {
    const combos: Parameters<typeof suggererEquipements>[0][] = [
      { codeNaf: "56.10A", estEtablissementTravail: true, estERP: true, estIGH: false, estHabitation: false },
      { codeNaf: "47.11B", estEtablissementTravail: true, estERP: true, estIGH: false, estHabitation: false },
      { codeNaf: "70.22Z", estEtablissementTravail: true, estERP: false, estIGH: false, estHabitation: false },
      { codeNaf: null,     estEtablissementTravail: false, estERP: false, estIGH: true,  estHabitation: true  },
    ];
    for (const ctx of combos) {
      for (const e of suggererEquipements(ctx)) {
        expect(e.raison.trim().length).toBeGreaterThan(10);
        expect(e.libelle.trim().length).toBeGreaterThan(3);
      }
    }
  });
});
