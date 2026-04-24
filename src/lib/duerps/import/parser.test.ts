import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { parserFichierDuerp, planifierImport } from "./parser";

function excel(rows: Record<string, unknown>[]): Buffer {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DUERP");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

describe("parserFichierDuerp", () => {
  it("détecte les colonnes avec des noms français standards", () => {
    const buf = excel([
      {
        "Unité de travail": "Cuisine",
        "Risque": "Coupure avec couteaux",
        "Description": "Manipulation régulière",
        "Gravité": 3,
        "Probabilité": 3,
        "Maîtrise": 2,
        "Mesures existantes": "Gants | Formation affûtage",
      },
    ]);
    const res = parserFichierDuerp(buf);
    expect(res.erreurs).toHaveLength(0);
    expect(res.lignes).toHaveLength(1);
    const l = res.lignes[0];
    expect(l.uniteTravail).toBe("Cuisine");
    expect(l.libelleRisque).toBe("Coupure avec couteaux");
    expect(l.gravite).toBe(3);
    expect(l.maitrise).toBe(2);
    expect(l.mesuresExistantes).toEqual(["Gants", "Formation affûtage"]);
  });

  it("accepte les variantes de nommage (accents/casse)", () => {
    const buf = excel([
      {
        unite: "Salle",
        risque: "TMS",
        gravite: 2,
        probabilite: 3,
        maitrise: 2,
      },
    ]);
    const res = parserFichierDuerp(buf);
    expect(res.erreurs).toHaveLength(0);
    expect(res.lignes[0].uniteTravail).toBe("Salle");
  });

  it("remonte les erreurs de cotation hors plage", () => {
    const buf = excel([
      {
        "Unité de travail": "Cuisine",
        Risque: "Brûlure",
        Gravité: 5,
        Probabilité: 2,
        Maîtrise: 2,
      },
    ]);
    const res = parserFichierDuerp(buf);
    expect(res.erreurs.some((e) => e.champ === "gravite")).toBe(true);
    expect(res.lignes).toHaveLength(0);
  });

  it("ignore les lignes totalement vides sans lever d'erreur", () => {
    const buf = excel([
      {
        "Unité de travail": "Cuisine",
        Risque: "Coupure",
        Gravité: 2,
        Probabilité: 2,
        Maîtrise: 2,
      },
      {
        "Unité de travail": "",
        Risque: "",
        Gravité: "",
        Probabilité: "",
        Maîtrise: "",
      },
    ]);
    const res = parserFichierDuerp(buf);
    expect(res.lignes).toHaveLength(1);
    expect(res.erreurs).toHaveLength(0);
  });

  it("regroupe par unité de travail dans le plan d'import", () => {
    const buf = excel([
      { unite: "Cuisine", risque: "A", gravite: 2, probabilite: 2, maitrise: 2 },
      { unite: "Cuisine", risque: "B", gravite: 3, probabilite: 2, maitrise: 2 },
      { unite: "Salle", risque: "C", gravite: 1, probabilite: 2, maitrise: 3 },
    ]);
    const res = parserFichierDuerp(buf);
    const plan = planifierImport(res.lignes);
    expect(plan.unites).toHaveLength(2);
    expect(plan.nbRisques).toBe(3);
    expect(
      plan.unites.find((u) => u.nom === "Cuisine")!.risques,
    ).toHaveLength(2);
  });
});
