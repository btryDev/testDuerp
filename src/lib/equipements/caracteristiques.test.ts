import { describe, expect, it } from "vitest";
import { caracteristiquesLisibles } from "./caracteristiques";

describe("caracteristiquesLisibles", () => {
  it("ne rend rien quand la catégorie n'a ni propriété ni question", () => {
    expect(caracteristiquesLisibles("AUTRE", null)).toEqual([]);
    expect(caracteristiquesLisibles("AUTRE", undefined)).toEqual([]);
  });

  it("survit à un JSON qui n'est pas un objet", () => {
    // La colonne est un Json libre : rien ne garantit sa forme côté base.
    expect(caracteristiquesLisibles("AUTRE", "n'importe quoi")).toEqual([]);
    expect(caracteristiquesLisibles("AUTRE", [1, 2])).toEqual([]);
  });

  it("pose les questions de la catégorie même sans aucune donnée", () => {
    // Un extincteur sans caractéristiques enregistrées porte quand même la
    // question RIA : c'est elle qui explique l'échéance au calendrier.
    const c = caracteristiquesLisibles("EXTINCTEUR", null);
    expect(c.map((x) => x.cle)).toEqual(["aRobinetsIncendieArmes"]);
    expect(c[0].enAttente).toBe(true);
  });

  it("annonce une question sans réponse plutôt que de la taire", () => {
    // C'est le point : l'obligation reste au calendrier tant que la
    // réponse manque, et la fiche est le seul endroit qui l'explique.
    const c = caracteristiquesLisibles("EXTINCTEUR", { nombre: 3 });
    const ria = c.find((x) => x.cle === "aRobinetsIncendieArmes");
    expect(ria).toMatchObject({
      valeur: "Pas encore répondu",
      enAttente: true,
    });
  });

  it("rend « oui » et « non » sans les confondre avec l'absence de réponse", () => {
    const oui = caracteristiquesLisibles("EXTINCTEUR", {
      aRobinetsIncendieArmes: true,
    });
    expect(oui[0]).toMatchObject({ valeur: "Oui", enAttente: false });

    const non = caracteristiquesLisibles("EXTINCTEUR", {
      aRobinetsIncendieArmes: false,
    });
    expect(non[0]).toMatchObject({ valeur: "Non", enAttente: false });
  });

  it("n'affiche que les questions de la catégorie", () => {
    // « Sert au levage de personnes » sur un extincteur ferait douter du
    // reste de la fiche.
    const cles = caracteristiquesLisibles("EXTINCTEUR", {}).map((x) => x.cle);
    expect(cles).toContain("aRobinetsIncendieArmes");
    expect(cles).not.toContain("sertAuLevageDePersonnes");

    const levage = caracteristiquesLisibles("EQUIPEMENT_LEVAGE", {}).map(
      (x) => x.cle,
    );
    expect(levage).toEqual([
      "sertAuLevageDePersonnes",
      "estChariotOuGerbeur",
      "aAccessoiresDeLevage",
    ]);
  });

  it("réserve le groupe électrogène à l'installation électrique", () => {
    const elec = caracteristiquesLisibles("INSTALLATION_ELECTRIQUE", {
      aGroupeElectrogene: true,
    });
    expect(elec.map((x) => x.cle)).toContain("aGroupeElectrogene");

    const hotte = caracteristiquesLisibles("HOTTE_PRO", {
      aGroupeElectrogene: true,
    });
    expect(hotte.map((x) => x.cle)).not.toContain("aGroupeElectrogene");
  });

  it("écarte une note vide", () => {
    const c = caracteristiquesLisibles("HOTTE_PRO", { notes: "   " });
    expect(c.map((x) => x.cle)).not.toContain("notes");
  });
});
