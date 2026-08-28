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

  it("tolère le point absent — « 5610A » désigne bien la restauration", () => {
    // Corrigé le 2026-08-28 dans `trouverReferentielParNaf`. Avant :
    // `evaluerScopeSecteur` validait le NAF avec le point FACULTATIF puis
    // déléguait à une comparaison par préfixe contre des codes écrits AVEC le
    // point. Un restaurateur qui saisissait « 5610A » passait la validation et
    // s'entendait dire qu'aucun référentiel n'existait pour son activité,
    // alors que le sien est livré.
    //
    // B1 aggravait le défaut plutôt que de le laisser dormir : le cas était
    // refusé avant, il créait ensuite un dossier portant un axe « secteur
    // retenu par défaut » injustifié — une fausse déclaration de non-
    // couverture, exactement ce que ce dossier existe pour empêcher.
    expect(secteurCorrespondAuNaf("5610A", "restauration")).toBe(true);
    expect(secteurCorrespondAuNaf("5610a", "restauration")).toBe(true);
    expect(secteurCorrespondAuNaf("4711B", "commerce")).toBe(true);
  });

  it("n'invente pas de point dans un code trop court pour en porter un", () => {
    // Les référentiels écrivent aussi des divisions nues (« 62 » pour le
    // tertiaire). Y insérer un séparateur casserait la comparaison par
    // préfixe dans l'autre sens.
    expect(secteurCorrespondAuNaf("62", "bureau")).toBe(true);
  });

  it("ne tronque pas un code trop long pour en fabriquer un valide", () => {
    // Le motif de normalisation est ancré aux deux bouts, et c'est ce qui
    // compte ici. Non ancré, « 561011 » et « 5610AB » se feraient rogner en
    // « 56.10 » et « 56.10A » — deux codes malformés promus en restauration,
    // et un dossier pré-rempli pour un métier que personne n'a déclaré.
    expect(secteurCorrespondAuNaf("561011", "restauration")).toBe(false);
    expect(secteurCorrespondAuNaf("5610AB", "restauration")).toBe(false);
  });

  it("ne rend pas un code sans point plus permissif qu'avec", () => {
    // La normalisation ne doit pas élargir le filet : « 5610A » vaut
    // « 56.10A », pas « n'importe quoi qui commence par 56 ».
    expect(secteurCorrespondAuNaf("5610A", "commerce")).toBe(false);
    expect(secteurCorrespondAuNaf("4322A", "restauration")).toBe(false);
  });
});
