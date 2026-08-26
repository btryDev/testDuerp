import { describe, expect, it } from "vitest";
import type { FormeSaisie } from "@/lib/registre/champs";
import { alimentationDeLaPartie } from "./alimentation";
import {
  bilanDuRegistre,
  completudeDeLaFiche,
  libelleCompletude,
  tonCompletude,
  type Completude,
} from "./completude";

const FORMULAIRE: FormeSaisie = {
  forme: "formulaire",
  champs: [
    { cle: "a", libelle: "A", type: "texte" },
    { cle: "b", libelle: "B", type: "texte" },
  ],
};

const JOURNAL: FormeSaisie = {
  forme: "journal",
  colonnes: [{ cle: "date", libelle: "Date", type: "date" }],
};

const ETABLISSEMENT: FormeSaisie = {
  forme: "etablissement",
  champs: [
    {
      cle: "raisonSociale",
      libelle: "Raison sociale",
      type: "texte",
      source: "Entreprise.raisonSociale",
      enBase: true,
    },
    {
      cle: "aVenir",
      libelle: "Question sans colonne",
      type: "texte",
      source: "Etablissement.aVenir",
      enBase: false,
    },
  ],
};

describe("completudeDeLaFiche", () => {
  it("dit qu'une fiche hors catalogue n'est pas outillée", () => {
    const c = completudeDeLaFiche(undefined, null);
    expect(c.outillee).toBe(false);
    expect(tonCompletude(c)).toBe("muet");
    expect(libelleCompletude(c)).toBe("À tenir hors de l'outil");
  });

  it("compte les réponses non vides, pas les champs remplis d'espaces", () => {
    const c = completudeDeLaFiche(FORMULAIRE, {
      champs: { a: "  ", b: "oui" },
    });
    expect(c.repondues).toBe(1);
    expect(c.questions).toBe(2);
    expect(libelleCompletude(c)).toBe("1 réponse sur 2");
    expect(tonCompletude(c)).toBe("attente");
  });

  it("ne réclame pas une réponse à une question sans emplacement en base", () => {
    const c = completudeDeLaFiche(ETABLISSEMENT, {
      champs: { raisonSociale: "Btry" },
    });
    expect(c.sansEmplacement).toBe(1);
    // Une seule question est répondable, elle l'est : la fiche est faite.
    expect(tonCompletude(c)).toBe("faite");
    expect(libelleCompletude(c)).toBe("Toutes les réponses");
  });

  it("juge un journal sur ses lignes, jamais sur ses colonnes", () => {
    const vide = completudeDeLaFiche(JOURNAL, { lignes: [] });
    expect(tonCompletude(vide)).toBe("attente");
    expect(libelleCompletude(vide)).toBe("Aucune ligne consignée");

    const tenu = completudeDeLaFiche(JOURNAL, {
      lignes: [{ id: "1", valeurs: { date: "2026-01-02" }, saisieLe: "x" }],
    });
    expect(tonCompletude(tenu)).toBe("faite");
    expect(libelleCompletude(tenu)).toBe("1 ligne consignée");
  });

  it("traite un contenu absent comme une fiche vide, pas comme une erreur", () => {
    expect(completudeDeLaFiche(FORMULAIRE, null).repondues).toBe(0);
    expect(completudeDeLaFiche(JOURNAL, undefined).lignes).toBe(0);
  });
});

describe("bilanDuRegistre", () => {
  it("sépare ce qui est fait, ce qui reste à remplir et ce qui n'est pas outillé", () => {
    const completudes: Completude[] = [
      completudeDeLaFiche(FORMULAIRE, { champs: { a: "x", b: "y" } }),
      completudeDeLaFiche(FORMULAIRE, { champs: {} }),
      completudeDeLaFiche(undefined, null),
      completudeDeLaFiche(undefined, null),
    ];
    expect(bilanDuRegistre(completudes)).toEqual({
      dues: 4,
      outillees: 2,
      faites: 1,
      aRemplir: 1,
      tenuesAilleurs: 0,
      nonOutillees: 2,
    });
  });

  it("rend un bilan nul sur une liste vide plutôt que de diviser par zéro", () => {
    expect(bilanDuRegistre([])).toEqual({
      dues: 0,
      outillees: 0,
      faites: 0,
      aRemplir: 0,
      tenuesAilleurs: 0,
      nonOutillees: 0,
    });
  });
});

describe("une fiche tenue sur un autre écran", () => {
  const base = "/etablissements/abc";

  it("est outillée, et n'est donc pas comptée comme un trou de l'outil", () => {
    // 2.1 « Matériel d'intervention » n'a pas de formulaire ici : c'est le
    // parc d'équipements qui la tient. Comptée « pas encore outillée », elle
    // ferait dire à la jauge l'inverse de la vérité.
    const c = completudeDeLaFiche(
      undefined,
      null,
      alimentationDeLaPartie("2.1", base),
    );
    expect(c.outillee).toBe(true);
    expect(tonCompletude(c)).toBe("renvoi");
    expect(libelleCompletude(c)).toBe("Tenue dans vos équipements");
    expect(c.alimentee?.href).toBe("/etablissements/abc/equipements");
  });

  it("ne se prononce pas sur son remplissage tant qu'on ne l'a pas compté", () => {
    const sansCompte = completudeDeLaFiche(
      undefined,
      null,
      alimentationDeLaPartie("3.1", base),
    );
    expect(tonCompletude(sansCompte)).toBe("renvoi");

    const avecCompte = completudeDeLaFiche(
      undefined,
      null,
      alimentationDeLaPartie("3.1", base, 3),
    );
    expect(tonCompletude(avecCompte)).toBe("faite");
    expect(libelleCompletude(avecCompte)).toBe("3 rapports archivés");

    const vide = completudeDeLaFiche(
      undefined,
      null,
      alimentationDeLaPartie("3.1", base, 0),
    );
    expect(tonCompletude(vide)).toBe("attente");
    expect(libelleCompletude(vide)).toBe("Rien dans votre calendrier");
  });

  it("reste « pas encore outillée » pour une partie qu'aucun écran ne tient", () => {
    // 1.1 « Exercices périodiques » et 5 « Annexes » : personne ne les tient.
    const c = completudeDeLaFiche(
      undefined,
      null,
      alimentationDeLaPartie("1.1", base),
    );
    expect(c.outillee).toBe(false);
    expect(tonCompletude(c)).toBe("muet");
  });

  it("sépare, dans le bilan, ce qui est tenu ailleurs de ce qui manque", () => {
    const bilan = bilanDuRegistre([
      completudeDeLaFiche(FORMULAIRE, { champs: { a: "x", b: "y" } }),
      completudeDeLaFiche(undefined, null, alimentationDeLaPartie("2.1", base)),
      completudeDeLaFiche(undefined, null, alimentationDeLaPartie("3.2", base)),
      completudeDeLaFiche(undefined, null, alimentationDeLaPartie("5", base)),
    ]);
    expect(bilan).toEqual({
      dues: 4,
      outillees: 3,
      faites: 1,
      aRemplir: 0,
      tenuesAilleurs: 2,
      nonOutillees: 1,
    });
  });
});
