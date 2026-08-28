import { describe, expect, it } from "vitest";
import { secteurCorrespondAuNaf } from "./secteur";

describe("secteurCorrespondAuNaf", () => {
  it("confirme quand le secteur retenu est celui du code NAF", () => {
    expect(secteurCorrespondAuNaf("56.10A", "restauration")).toBe(true);
    expect(secteurCorrespondAuNaf("47.25Z", "commerce")).toBe(true);
    expect(secteurCorrespondAuNaf("70.22Z", "bureau")).toBe(true);
  });

  it("infirme quand un secteur instruit a été retenu à la place d'un autre", () => {
    expect(secteurCorrespondAuNaf("56.10A", "commerce")).toBe(false);
  });

  it("infirme quand le code NAF ne résout aucun référentiel — le cas central", () => {
    // Le dirigeant hors des trois secteurs instruits : la page de choix du
    // DUERP lui propose « le secteur le plus proche », il en retient un, et
    // son document sort pré-rempli pour un autre métier. C'est ce cas que
    // l'ouverture de la porte d'onboarding rend courant.
    expect(secteurCorrespondAuNaf("55.10Z", "restauration")).toBe(false);
    expect(secteurCorrespondAuNaf("45.20A", "commerce")).toBe(false);
    expect(secteurCorrespondAuNaf("96.02A", "bureau")).toBe(false);
  });

  it("ne tranche pas sans secteur retenu — et ne suppose surtout pas que ça colle", () => {
    // `null` n'est pas un `true` prudent : rendre `true` ferait passer pour
    // vérifiée une correspondance que personne n'a établie.
    expect(secteurCorrespondAuNaf("56.10A", null)).toBeNull();
    expect(secteurCorrespondAuNaf("56.10A", undefined)).toBeNull();
    expect(secteurCorrespondAuNaf("56.10A", "")).toBeNull();
  });

  it("ne tranche pas sans code NAF", () => {
    expect(secteurCorrespondAuNaf(null, "restauration")).toBeNull();
    expect(secteurCorrespondAuNaf("", "restauration")).toBeNull();
  });

  it("tolère la casse", () => {
    expect(secteurCorrespondAuNaf("56.10a", "restauration")).toBe(true);
  });

  it("NE tolère PAS le point absent — comportement constaté, pas voulu", () => {
    // Défaut préexistant, signalé et non corrigé ici (hors périmètre du lot).
    //
    // `evaluerScopeSecteur` valide le code NAF avec `/^(\d{2})\.?\d{2}[A-Z]?$/`
    // — le point est FACULTATIF — puis délègue à `trouverReferentielParNaf`,
    // qui compare par `startsWith` à des codes écrits AVEC le point
    // (« 56.10 »). Un restaurateur qui saisit « 5610A » passe donc la
    // validation et s'entend dire qu'aucun référentiel n'existe pour son
    // activité. Rien dans le wizard ne réinsère le point : `StepIdentite` ne
    // fait que `.toUpperCase()`.
    //
    // Ce test fige le fait pour qu'il ne se découvre pas deux fois. Le jour où
    // la normalisation est faite, il tombe au rouge, et c'est le signal
    // attendu — pas une régression.
    expect(secteurCorrespondAuNaf("5610A", "restauration")).toBe(false);
  });
});
