import { describe, expect, it } from "vitest";
import { onboardingSchema } from "./schema";

const base = {
  raisonSociale: "Bistrot du marché SARL",
  siret: "",
  adresse: "12 rue des halles, 44000 Nantes",
  codeNaf: "56.10A",
  effectifSurSite: 8,
  estEtablissementTravail: true,
  estERP: false,
  estIGH: false,
  estHabitation: false,
};

describe("onboardingSchema", () => {
  it("accepte une saisie minimale valide (travail seul)", () => {
    const res = onboardingSchema.safeParse(base);
    expect(res.success).toBe(true);
  });

  it("accepte un SIRET valide à 14 chiffres", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      siret: "12345678901234",
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.siret).toBe("12345678901234");
  });

  it("refuse un SIRET invalide", () => {
    const res = onboardingSchema.safeParse({ ...base, siret: "12345" });
    expect(res.success).toBe(false);
  });

  it("accepte un SIRET vide (optionnel)", () => {
    const res = onboardingSchema.safeParse({ ...base, siret: "" });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.siret).toBeUndefined();
  });

  it("normalise le code NAF en majuscules", () => {
    const res = onboardingSchema.safeParse({ ...base, codeNaf: "56.10a" });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.codeNaf).toBe("56.10A");
  });

  it("refuse une adresse non structurée (n'importe quoi)", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      adresse: "chez moi",
    });
    expect(res.success).toBe(false);
  });

  it("refuse une adresse sans code postal 5 chiffres", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      adresse: "12 rue X, 4400 Nantes",
    });
    expect(res.success).toBe(false);
  });

  it("exige type + catégorie ERP si estERP=true", () => {
    const res = onboardingSchema.safeParse({ ...base, estERP: true });
    expect(res.success).toBe(false);
    if (!res.success) {
      const champs = res.error.flatten().fieldErrors;
      expect(champs.typeErp).toBeDefined();
      expect(champs.categorieErp).toBeDefined();
    }
  });

  it("accepte un ERP complet (type + catégorie)", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      estERP: true,
      typeErp: "N",
      categorieErp: "N5",
    });
    expect(res.success).toBe(true);
  });

  it("refuse typeErp si estERP=false", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      estERP: false,
      typeErp: "N",
    });
    expect(res.success).toBe(false);
  });

  it("exige classeIgh si estIGH=true", () => {
    const res = onboardingSchema.safeParse({ ...base, estIGH: true });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.classeIgh).toBeDefined();
    }
  });

  it("refuse aucun régime coché", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      estEtablissementTravail: false,
      estERP: false,
      estIGH: false,
      estHabitation: false,
    });
    expect(res.success).toBe(false);
  });

  // Famille d'habitation (ADR-025 § 4). Les trois cas qui décident : exigée
  // quand le régime est déclaré, interdite quand il ne l'est pas, acceptée
  // quand les deux vont ensemble. Le premier seul se réparerait en retirant
  // la règle, le second seul en la retirant aussi.
  it("exige la famille si estHabitation=true", () => {
    const res = onboardingSchema.safeParse({ ...base, estHabitation: true });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.familleHabitation).toBeDefined();
    }
  });

  it("accepte une habitation avec sa famille", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      estHabitation: true,
      familleHabitation: "TROISIEME_B",
    });
    expect(res.success).toBe(true);
  });

  it("refuse la famille si estHabitation=false", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      familleHabitation: "PREMIERE",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.familleHabitation).toBeDefined();
    }
  });

  it("refuse une famille qui n'existe pas", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      estHabitation: true,
      familleHabitation: "CINQUIEME",
    });
    expect(res.success).toBe(false);
  });

  // Ce test disait l'inverse jusqu'au 2026-09-01 : le cumul ERP + IGH était
  // accepté. Il est désormais le SEUL cumul de régimes refusé (ADR-025 § 1) —
  // un ERP situé dans un immeuble de grande hauteur relève du règlement de
  // sécurité des IGH, que le référentiel ne connaît pas.
  it("refuse le cumul ERP + IGH", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      estERP: true,
      typeErp: "W",
      categorieErp: "N1",
      estIGH: true,
      classeIgh: "GHW1",
    });
    expect(res.success).toBe(false);
  });

  // La moitié qu'on oublierait volontiers, et sans laquelle le test ci-dessus
  // se réparerait en refusant l'IGH tout court. Un employeur locataire d'une
  // tour de bureaux relève du Code du travail, que le produit sert en entier ;
  // les obligations du règlement IGH pèsent sur l'exploitant de l'immeuble.
  it("accepte l'IGH seul", () => {
    const res = onboardingSchema.safeParse({
      ...base,
      estIGH: true,
      classeIgh: "GHW1",
    });
    expect(res.success).toBe(true);
  });

  // La borne du produit porte sur les TRAVAILLEURS. Le public reçu ne la
  // déclenche jamais : c'est ce qui permet de servir un restaurant de huit
  // salariés classé en 3ᵉ catégorie parce qu'il sert trois cents couverts.
  it("accepte 50 salariés", () => {
    const res = onboardingSchema.safeParse({ ...base, effectifSurSite: 50 });
    expect(res.success).toBe(true);
  });

  it("refuse 51 salariés", () => {
    const res = onboardingSchema.safeParse({ ...base, effectifSurSite: 51 });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.effectifSurSite).toBeDefined();
    }
  });

  it("ne borne pas un ERP de 1ʳᵉ catégorie à petit effectif", () => {
    // Le cas qui a tranché le périmètre : la catégorie mesure le public, la
    // borne mesure les salariés. Les confondre reviendrait à refuser la cible.
    const res = onboardingSchema.safeParse({
      ...base,
      effectifSurSite: 8,
      estERP: true,
      typeErp: "N",
      categorieErp: "N1",
    });
    expect(res.success).toBe(true);
  });
});
