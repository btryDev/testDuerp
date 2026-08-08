import { describe, expect, it } from "vitest";
import {
  compterRestes,
  construireMatrice,
  type EntreeMatrice,
} from "./obligations";

const VIERGE: EntreeMatrice = {
  etablissementId: "etab_1",
  duerp: { existe: false, estAJour: false, duerpId: null },
  nbRapports: 0,
  nbVerifs: 0,
  jourDernierRapport: null,
  compteurs: {
    verifsEnRetard: 0,
    verifsAPlanifier: 0,
    actionsOuvertes: 0,
    actionsEnCours: 0,
    actionsEnRetard: 0,
    actionsLeveesRecemment: 0,
  },
};

const ligne = (e: EntreeMatrice, id: string) =>
  construireMatrice(e).find((l) => l.id === id)!;

describe("construireMatrice", () => {
  it("rend les quatre lignes dans l'ordre du design", () => {
    expect(construireMatrice(VIERGE).map((l) => l.id)).toEqual([
      "duerp",
      "registre",
      "verifications",
      "actions",
    ]);
  });

  it("ne coche rien sur un établissement vierge", () => {
    const etats = construireMatrice(VIERGE).flatMap((l) => l.cellules);
    expect(etats).not.toContain("ok");
  });

  it("ne marque jamais une colonne sans objet comme à faire", () => {
    // Les `na` sont structurels : ils ne doivent pas dépendre des données.
    const plein: EntreeMatrice = {
      ...VIERGE,
      duerp: { existe: true, estAJour: true, duerpId: "d1" },
      nbRapports: 5,
      nbVerifs: 20,
      jourDernierRapport: 10,
      compteurs: { ...VIERGE.compteurs, actionsOuvertes: 3 },
    };
    expect(ligne(plein, "duerp").cellules[2]).toBe("na");
    expect(ligne(VIERGE, "duerp").cellules[2]).toBe("na");
    expect(ligne(plein, "actions").cellules[1]).toBe("na");
  });
});

describe("construireMatrice — DUERP", () => {
  it("pointe vers le DUERP existant quand il y en a un", () => {
    const l = ligne(
      { ...VIERGE, duerp: { existe: true, estAJour: true, duerpId: "d1" } },
      "duerp",
    );
    expect(l.href).toBe("/duerp/d1");
    expect(l.cellules[0]).toBe("ok");
    expect(l.cellules[1]).toBe("ok");
  });

  it("retombe sur la page DUERP de l'établissement sinon", () => {
    expect(ligne(VIERGE, "duerp").href).toBe("/etablissements/etab_1/duerp");
  });

  it("distingue « existe » de « à jour »", () => {
    const l = ligne(
      { ...VIERGE, duerp: { existe: true, estAJour: false, duerpId: "d1" } },
      "duerp",
    );
    expect(l.cellules[0]).toBe("ok");
    expect(l.cellules[1]).toBe("todo");
  });
});

describe("construireMatrice — registre", () => {
  it("considère à jour un registre alimenté dans l'année", () => {
    const l = ligne(
      { ...VIERGE, nbRapports: 3, jourDernierRapport: 200 },
      "registre",
    );
    expect(l.cellules).toEqual(["ok", "ok", "na"]);
  });

  it("marque à faire un registre dormant depuis plus d'un an", () => {
    const l = ligne(
      { ...VIERGE, nbRapports: 3, jourDernierRapport: 400 },
      "registre",
    );
    expect(l.cellules[1]).toBe("todo");
  });
});

describe("construireMatrice — vérifications", () => {
  it("coche les trois colonnes quand le calendrier est sain", () => {
    const l = ligne({ ...VIERGE, nbVerifs: 20 }, "verifications");
    expect(l.cellules).toEqual(["ok", "ok", "ok"]);
  });

  it("ne coche pas « à jour » s'il reste des vérifs à programmer", () => {
    const l = ligne(
      {
        ...VIERGE,
        nbVerifs: 20,
        compteurs: { ...VIERGE.compteurs, verifsAPlanifier: 4 },
      },
      "verifications",
    );
    expect(l.cellules[1]).toBe("todo");
    expect(l.cellules[2]).toBe("ok");
  });

  it("ne coche pas « sans retard » s'il y a des vérifs dépassées", () => {
    const l = ligne(
      {
        ...VIERGE,
        nbVerifs: 20,
        compteurs: { ...VIERGE.compteurs, verifsEnRetard: 2 },
      },
      "verifications",
    );
    expect(l.cellules[2]).toBe("todo");
  });

  it("ne coche rien quand aucune vérification n'existe", () => {
    // Un calendrier vide n'est pas « sans retard » : il est absent.
    expect(ligne(VIERGE, "verifications").cellules).toEqual([
      "todo",
      "todo",
      "todo",
    ]);
  });
});

describe("construireMatrice — plan d'actions", () => {
  it("compte les actions levées dans l'existence du plan", () => {
    const l = ligne(
      {
        ...VIERGE,
        compteurs: { ...VIERGE.compteurs, actionsLeveesRecemment: 2 },
      },
      "actions",
    );
    expect(l.cellules[0]).toBe("ok");
    expect(l.cellules[2]).toBe("ok");
  });

  it("signale les actions en retard", () => {
    const l = ligne(
      {
        ...VIERGE,
        compteurs: {
          ...VIERGE.compteurs,
          actionsOuvertes: 5,
          actionsEnRetard: 2,
        },
      },
      "actions",
    );
    expect(l.cellules[2]).toBe("todo");
  });
});

describe("compterRestes", () => {
  it("compte les faits restant à établir, sans les « sans objet »", () => {
    // 2 (DUERP) + 2 (registre) + 3 (vérifications) + 2 (actions) ; les
    // trois cellules « sans objet » ne comptent pas.
    expect(compterRestes(construireMatrice(VIERGE))).toBe(9);
  });

  it("tombe à zéro sur un dossier complet", () => {
    const complet: EntreeMatrice = {
      ...VIERGE,
      duerp: { existe: true, estAJour: true, duerpId: "d1" },
      nbRapports: 4,
      nbVerifs: 12,
      jourDernierRapport: 30,
      compteurs: { ...VIERGE.compteurs, actionsOuvertes: 1 },
    };
    expect(compterRestes(construireMatrice(complet))).toBe(0);
  });
});
