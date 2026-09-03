import { describe, expect, it } from "vitest";
import {
  etablissementCreationSchema,
  etablissementSchema,
} from "./schema";

const base = {
  raisonDisplay: "Restaurant du Marché",
  adresse: "12 rue des Halles, 75001 Paris",
  effectifSurSite: 8,
  estEtablissementTravail: true,
  estERP: false,
  estIGH: false,
  estHabitation: false,
};

describe("etablissementSchema — typologie (ADR-004)", () => {
  it("accepte un établissement de travail simple", () => {
    const res = etablissementSchema.safeParse(base);
    expect(res.success).toBe(true);
  });

  it("refuse un ERP sans type + sans catégorie", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      estERP: true,
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      const champs = res.error.issues.map((i) => i.path[0]);
      expect(champs).toContain("typeErp");
      expect(champs).toContain("categorieErp");
    }
  });

  it("accepte un ERP restaurant cat. 4", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      estERP: true,
      typeErp: "N",
      categorieErp: "N4",
    });
    expect(res.success).toBe(true);
  });

  it("refuse typeErp/categorieErp si l'établissement n'est pas ERP", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      estERP: false,
      typeErp: "N",
      categorieErp: "N4",
    });
    expect(res.success).toBe(false);
  });

  it("refuse un IGH sans classe", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      estIGH: true,
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      const champs = res.error.issues.map((i) => i.path[0]);
      expect(champs).toContain("classeIgh");
    }
  });

  it("accepte ERP + IGH cumulés (régimes non exclusifs)", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      estERP: true,
      typeErp: "W",
      categorieErp: "N2",
      estIGH: true,
      classeIgh: "GHW1",
    });
    expect(res.success).toBe(true);
  });

  it("refuse un établissement sans aucun régime coché", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      estEtablissementTravail: false,
    });
    expect(res.success).toBe(false);
  });

  it("refuse un code NAF invalide", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      codeNaf: "invalide",
    });
    expect(res.success).toBe(false);
  });

  it("accepte un code NAF vide (hérite de l'entreprise)", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      codeNaf: "",
    });
    expect(res.success).toBe(true);
  });
});

describe("etablissementSchema — dates civiles (registre, fiche renseignements)", () => {
  // Ces quatre cas viennent d'une revue : `depuisCleJourCivil` jette sur une
  // chaîne mal formée, et dans un `z.preprocess` ce throw traversait
  // `safeParse`. Les deux actions serveur l'appellent hors de tout try/catch —
  // une date « 26/08/2026 » faisait donc planter l'action et perdre le
  // formulaire entier au lieu d'afficher le message de format.
  it("rend une erreur de validation sur une date mal formée, sans jeter", () => {
    const parse = () =>
      etablissementSchema.safeParse({
        ...base,
        dateAutorisationOuverture: "26/08/2026",
      });
    expect(parse).not.toThrow();
    expect(parse().success).toBe(false);
  });

  it("nomme le champ fautif plutôt que de faire échouer tout le formulaire", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      dateCertificatConformite: "pas une date",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues.map((i) => i.path[0])).toContain(
        "dateCertificatConformite",
      );
    }
  });

  it("accepte une date bien formée et l'ancre dans le fuseau de référence", () => {
    const res = etablissementSchema.safeParse({
      ...base,
      dateAutorisationOuverture: "2026-08-26",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      const d = res.data.dateAutorisationOuverture;
      expect(d).toBeInstanceOf(Date);
      // ADR-011 : le jour civil, pas minuit UTC — qui serait la veille à Paris.
      expect(d?.getDate()).toBe(26);
    }
  });

  it("accepte l'absence de date et la chaîne vide", () => {
    expect(etablissementSchema.safeParse(base).success).toBe(true);
    expect(
      etablissementSchema.safeParse({ ...base, dateAutorisationOuverture: "" })
        .success,
    ).toBe(true);
  });
});

/**
 * La dissymétrie création / modification (ADR-025 § 4, ADR-031).
 *
 * C'est la forme que prend la coexistence : une règle neuve borne ce qui
 * entre, elle ne rend pas inutilisable ce qui était là avant. Un dossier
 * d'habitation créé avant le 2026-09-01 n'a pas de famille ; si le schéma de
 * modification l'exigeait, son propriétaire ne pourrait plus rien changer —
 * pas même son adresse — tant qu'il ne l'aurait pas retrouvée.
 *
 * Les deux moitiés sont testées : sans la seconde, on pourrait retirer la
 * règle de création et le test de modification resterait vert.
 */
describe("famille d'habitation — exigée à la création, pas à la modification", () => {
  const habitationSansFamille = { ...base, estHabitation: true };

  it("la création refuse une habitation sans famille", () => {
    const res = etablissementCreationSchema.safeParse(habitationSansFamille);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.familleHabitation).toBeDefined();
    }
  });

  it("la modification accepte une habitation sans famille", () => {
    const res = etablissementSchema.safeParse(habitationSansFamille);
    expect(res.success).toBe(true);
  });

  it("la création accepte une habitation avec sa famille", () => {
    const res = etablissementCreationSchema.safeParse({
      ...habitationSansFamille,
      familleHabitation: "DEUXIEME",
    });
    expect(res.success).toBe(true);
  });

  it("les deux refusent une famille posée hors régime habitation", () => {
    const hors = { ...base, familleHabitation: "PREMIERE" };
    expect(etablissementSchema.safeParse(hors).success).toBe(false);
    expect(etablissementCreationSchema.safeParse(hors).success).toBe(false);
  });
});

/**
 * Les refus de périmètre sur la PORTE, pas sur le parcours (ADR-031).
 *
 * Depuis l'ADR-028, un second établissement se crée par `/etablissements/nouveau`
 * et non par le wizard. Une règle posée sur le parcours se contournerait donc
 * en changeant de parcours — c'est exactement ce qui a failli arriver : les
 * deux lots ayant été écrits en parallèle, ce chemin est resté un instant sur
 * le schéma de modification, et un dossier refusé à l'onboarding se serait créé
 * en deux clics par l'autre porte.
 */
describe("refus de périmètre — création seulement", () => {
  it("refuse plus de 50 travailleurs à la création", () => {
    const res = etablissementCreationSchema.safeParse({
      ...base,
      effectifSurSite: 51,
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.effectifSurSite).toBeDefined();
    }
  });

  it("accepte 50 travailleurs", () => {
    expect(
      etablissementCreationSchema.safeParse({ ...base, effectifSurSite: 50 })
        .success,
    ).toBe(true);
  });

  it("laisse un dossier existant dépasser 50 en modification", () => {
    // Un client qui embauche ne perd pas son dossier : il porte un manque de
    // couverture, il ne se ferme pas.
    expect(
      etablissementSchema.safeParse({ ...base, effectifSurSite: 60 }).success,
    ).toBe(true);
  });

  it("ne borne pas sur le public reçu", () => {
    // La catégorie mesure le public, la borne mesure les salariés. Les
    // confondre reviendrait à refuser la cible du produit.
    expect(
      etablissementCreationSchema.safeParse({
        ...base,
        effectifSurSite: 8,
        estERP: true,
        typeErp: "N",
        categorieErp: "N1",
      }).success,
    ).toBe(true);
  });

  it("refuse un ERP situé dans un IGH", () => {
    const res = etablissementCreationSchema.safeParse({
      ...base,
      estERP: true,
      typeErp: "M",
      categorieErp: "N5",
      estIGH: true,
      classeIgh: "GHW1",
    });
    expect(res.success).toBe(false);
  });

  it("accepte un IGH qui n'est pas un ERP", () => {
    expect(
      etablissementCreationSchema.safeParse({
        ...base,
        estIGH: true,
        classeIgh: "GHW1",
      }).success,
    ).toBe(true);
  });
});
