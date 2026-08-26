import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CHAMPS_PAR_SECTION, saisiePourSection } from "./champs";
import { SECTIONS_REGISTRE } from "./sections";

describe("catalogue de champs — cohérence avec les fiches", () => {
  it("chaque fiche outillée existe au catalogue des sections", () => {
    const connus = new Set(SECTIONS_REGISTRE.map((s) => s.id));
    for (const id of Object.keys(CHAMPS_PAR_SECTION)) {
      expect(connus.has(id), `fiche inconnue : ${id}`).toBe(true);
    }
  });

  it("aucune clé de champ en double dans une même fiche", () => {
    for (const [id, saisie] of Object.entries(CHAMPS_PAR_SECTION)) {
      const cles =
        saisie.forme === "journal"
          ? saisie.colonnes.map((c) => c.cle)
          : saisie.champs.map((c) => c.cle);
      expect(new Set(cles).size, id).toBe(cles.length);
    }
  });

  it("chaque champ porte un libellé lisible", () => {
    for (const [id, saisie] of Object.entries(CHAMPS_PAR_SECTION)) {
      const champs =
        saisie.forme === "journal" ? saisie.colonnes : saisie.champs;
      expect(champs.length, id).toBeGreaterThan(0);
      for (const c of champs) {
        expect(c.libelle.length, `${id}.${c.cle}`).toBeGreaterThan(2);
      }
    }
  });
});

describe("fiches adossées à l'établissement", () => {
  // Le point de vigilance : une fiche « etablissement » ne doit JAMAIS stocker
  // en propre, sans quoi la même donnée existerait à deux endroits et le
  // registre finirait par imprimer une adresse périmée.
  it("chaque champ désigne la colonne qui porte déjà la réponse", () => {
    for (const [id, saisie] of Object.entries(CHAMPS_PAR_SECTION)) {
      if (saisie.forme !== "etablissement") continue;
      for (const c of saisie.champs) {
        expect(c.source, `${id}.${c.cle}`).toMatch(
          /^(Etablissement|Entreprise)\.[a-zA-Z]+$/,
        );
      }
    }
  });

  // `enBase` dit qu'une colonne existe pour recueillir la réponse. Épingler la
  // valeur du drapeau ne prouve rien — elle change à chaque migration. Ce qu'il
  // faut vérifier, c'est qu'elle ne mente pas : un champ marqué `enBase: true`
  // dont la colonne n'existe pas produirait un formulaire qui perd la saisie
  // sans rien dire.
  it("tout champ marqué en base désigne une colonne réelle du schéma Prisma", () => {
    const schema = readFileSync(
      join(process.cwd(), "prisma", "schema.prisma"),
      "utf8",
    );
    const bloc = (modele: string) => {
      const i = schema.indexOf(`model ${modele} {`);
      expect(i, `modèle ${modele} introuvable`).toBeGreaterThan(-1);
      return schema.slice(i, schema.indexOf("\n}", i));
    };
    const champsDe = new Map(
      ["Etablissement", "Entreprise"].map((m) => [
        m,
        new Set(
          bloc(m)
            .split("\n")
            .map((l) => l.trim().split(/\s+/)[0])
            .filter(Boolean),
        ),
      ]),
    );

    for (const [id, saisie] of Object.entries(CHAMPS_PAR_SECTION)) {
      if (saisie.forme !== "etablissement") continue;
      for (const c of saisie.champs) {
        if (!c.enBase) continue;
        const [modele, colonne] = c.source.split(".");
        expect(
          champsDe.get(modele)?.has(colonne),
          `${id}.${c.cle} → ${c.source} : colonne absente du schéma`,
        ).toBe(true);
      }
    }
  });
});

describe("saisiePourSection", () => {
  it("rend undefined pour une fiche qu'un modèle métier alimente déjà", () => {
    expect(saisiePourSection("verif-extincteurs")).toBeUndefined();
    expect(saisiePourSection("inv-extincteurs")).toBeUndefined();
  });

  it("rend undefined pour les exercices, qui ne sont pas un formulaire", () => {
    expect(saisiePourSection("exercices-themes")).toBeUndefined();
    expect(saisiePourSection("exercices-comptes-rendus")).toBeUndefined();
  });
});
