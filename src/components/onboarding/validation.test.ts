import { describe, expect, it } from "vitest";
import { VALEURS_INITIALES, type OnboardingState } from "./types";
import { validerIdentite, validerTypologie } from "./validation";

const complet: OnboardingState = {
  ...VALEURS_INITIALES,
  raisonSociale: "Hôtel du Port",
  adresseRue: "12 rue du Port",
  adresseCodePostal: "29200",
  adresseVille: "Brest",
  codeNaf: "56.10A",
  effectifSurSite: "4",
  estEtablissementTravail: true,
};

describe("étape 1 — la porte ne se ferme plus sur le secteur", () => {
  // C'est ici que la porte se fermait réellement : un dirigeant bloqué à
  // l'étape 1 du wizard n'atteint jamais la server action, donc le
  // `superRefine` du schéma Zod n'était pas le filet qu'on croyait. La revue
  // du 2026-08-28 l'a montré — la mutation qui rétablit le verrou ici laissait
  // les 57 tests d'onboarding au vert.
  it.each([
    ["55.10Z", "hôtellerie"],
    ["43.22A", "BTP"],
    ["45.20A", "garage"],
    ["96.02A", "coiffure"],
    ["86.10Z", "santé"],
    ["5610A", "restauration écrite sans point"],
  ])("laisse passer %s (%s)", (codeNaf) => {
    expect(validerIdentite({ ...complet, codeNaf })).toBeNull();
  });

  it("laisse passer les trois secteurs instruits", () => {
    for (const codeNaf of ["56.10A", "47.25Z", "70.22Z"]) {
      expect(validerIdentite({ ...complet, codeNaf })).toBeNull();
    }
  });

  it("ne parle jamais de secteur dans ses messages", () => {
    // Le message « Secteur non couvert. … » était le refus lui-même. S'il
    // réapparaît, c'est que le verrou est revenu par une autre porte.
    for (const codeNaf of ["43.22A", "", "pas-un-naf", "56.10A"]) {
      const m = validerIdentite({ ...complet, codeNaf });
      if (m !== null) expect(m, codeNaf).not.toMatch(/secteur|couvert/i);
    }
  });
});

describe("étape 1 — ce qui bloque encore", () => {
  it("refuse un code NAF illisible", () => {
    expect(validerIdentite({ ...complet, codeNaf: "pas-un-naf" })).toBe(
      "Le code NAF doit ressembler à 56.10A.",
    );
    expect(validerIdentite({ ...complet, codeNaf: "561" })).not.toBeNull();
    expect(validerIdentite({ ...complet, codeNaf: "5610ABC" })).not.toBeNull();
  });

  it("distingue un code absent d'un code illisible", () => {
    // Deux gestes différents pour l'utilisateur : en saisir un, ou corriger
    // celui qu'il a tapé.
    expect(validerIdentite({ ...complet, codeNaf: "  " })).toBe(
      "Indiquez le code NAF.",
    );
  });

  it.each([
    ["raisonSociale", "", "Indiquez la raison sociale pour continuer."],
    ["adresseRue", "ab", "Indiquez le numéro et la rue."],
    ["adresseCodePostal", "2920", "Le code postal doit faire 5 chiffres."],
    ["adresseVille", "B", "Indiquez la ville."],
    ["effectifSurSite", "0", "Indiquez un effectif (au moins 1)."],
    ["effectifSurSite", "2.5", "Indiquez un effectif (au moins 1)."],
    ["effectifSurSite", "", "Indiquez un effectif (au moins 1)."],
  ])("refuse %s = « %s »", (champ, valeur, message) => {
    expect(validerIdentite({ ...complet, [champ]: valeur })).toBe(message);
  });
});

describe("étape 2 — les régimes (ADR-004)", () => {
  const erp: OnboardingState = {
    ...complet,
    estEtablissementTravail: false,
    estERP: true,
    typeErp: "O",
    categorieErp: "N5",
  };

  it("accepte un ERP complètement renseigné", () => {
    expect(validerTypologie(erp)).toBeNull();
  });

  it("exige au moins un régime", () => {
    expect(
      validerTypologie({
        ...complet,
        estEtablissementTravail: false,
        estERP: false,
        estIGH: false,
        estHabitation: false,
      }),
    ).toBe("Cochez au moins un régime (travail, ERP, IGH ou habitation).");
  });

  it("exige le type et la catégorie d'un ERP", () => {
    expect(validerTypologie({ ...erp, typeErp: "" })).toBe(
      "Précisez votre activité ERP.",
    );
    expect(validerTypologie({ ...erp, categorieErp: "" })).toBe(
      "Précisez votre capacité d'accueil.",
    );
  });

  it("exige la classe d'un IGH", () => {
    expect(
      validerTypologie({ ...complet, estIGH: true, classeIgh: "" }),
    ).toBe("Précisez la classe IGH.");
  });

  // Le seul cumul refusé (ADR-025 § 1). Les deux moitiés comptent : sans la
  // seconde, la règle se réparerait en refusant l'IGH tout court, ce qui
  // fermerait la porte à un employeur locataire d'une tour de bureaux — qui
  // relève du Code du travail et que le produit sert entièrement.
  it("refuse un ERP situé dans un IGH", () => {
    expect(
      validerTypologie({ ...erp, estIGH: true, classeIgh: "GHW" }),
    ).toContain("immeuble de grande hauteur");
  });

  it("accepte un IGH qui n'est pas un ERP", () => {
    expect(
      validerTypologie({ ...complet, estIGH: true, classeIgh: "GHW" }),
    ).toBeNull();
  });
});

describe("étape 2 — une réponse retirée ne laisse pas sa précision derrière", () => {
  // Le cul-de-sac que la revue a trouvé : répondre « Oui » à l'habitation,
  // choisir une famille, puis revenir à « Non » laissait la famille dans
  // l'état. L'étape 2 passait, le schéma serveur refusait, et son message ne
  // s'affichait que dans le bloc qu'on venait de démonter — bouton sans effet,
  // aucune carte à désélectionner, sortie par rechargement de page.
  //
  // La garde vit dans le composant (le bouton nettoie), donc ce test décrit
  // l'invariant que la validation doit voir : un état cohérent passe, un état
  // incohérent est refusé par le schéma serveur — c'est lui qui tranche.
  it("accepte une habitation abandonnée dont la famille a été nettoyée", () => {
    expect(
      validerTypologie({
        ...complet,
        estHabitation: false,
        familleHabitation: "",
      }),
    ).toBeNull();
  });

  it("exige la famille tant que l'habitation est cochée", () => {
    expect(
      validerTypologie({
        ...complet,
        estHabitation: true,
        familleHabitation: "",
      }),
    ).toBe("Précisez la famille de l'immeuble d'habitation.");
  });
});

describe("étape 1 — la borne d'effectif (ADR-031)", () => {
  // Elle porte sur les TRAVAILLEURS. Le refus vit ici autant que dans le
  // schéma Zod : un dirigeant bloqué à l'étape 1 n'atteint jamais la server
  // action, et un refus qui n'arriverait qu'au submit ferait ressaisir tout
  // le formulaire.
  it("accepte 50 salariés", () => {
    expect(validerIdentite({ ...complet, effectifSurSite: "50" })).toBeNull();
  });

  it("refuse 51 salariés en nommant la limite", () => {
    const message = validerIdentite({ ...complet, effectifSurSite: "51" });
    expect(message).toContain("50");
  });

  it("ne regarde pas le public reçu", () => {
    // Un ERP de 1ʳᵉ catégorie — plus de 1500 personnes admises — avec quatre
    // salariés passe. Confondre les deux chiffres reviendrait à refuser la
    // cible du produit.
    expect(
      validerIdentite({ ...complet, estERP: true, categorieErp: "N1" }),
    ).toBeNull();
  });
});
