import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  articlesDuCorpus,
  citationsSansCorpus,
  SURFACES_AFFICHEES,
} from "./citations-ecran";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");

describe("ce que les écrans citent sans que personne l'ait ouvert", () => {
  // CLIQUET. Mesuré à 23 le 2026-09-02 au matin : 23 articles étaient cités
  // sur une surface qui s'affiche sans qu'aucun corpus les déclare dépouillés.
  // **16 le même jour**, après le dépouillement du socle DUERP
  // (`code-travail-duerp.ts`) : les sept articles fondateurs — `L. 4121-1`,
  // `-2`, `-3`, `-3-1`, `R. 4121-1`, `-1-1`, `-2` — sont entrés au corpus, en
  // deux corpus intégraux. Le plus exposé était `R. 4121-2`, affiché sur
  // l'écran de synthèse AVEC un seuil d'effectif : la lecture a confirmé le
  // seuil de onze et montré que les deux autres déclencheurs de mise à jour,
  // qui n'ont pas de seuil, ne sont portés par rien.
  //
  // Restent notamment la vigilance prestataires (`L. 8222-1`, `D. 8222-5`) et
  // le plan de prévention entier (`R. 4512-2`, `-6`, `-7`, `-12`), ce dernier
  // avec un extrait cité entre guillemets à l'écran.
  //
  // Il ne remonte pas. Chaque dépouillement qui en absorbe un l'abaisse d'autant.
  const PLAFOND = 16;

  it("ne dépasse pas le plafond, et le plafond ne remonte pas", () => {
    const orphelines = citationsSansCorpus(RACINE);
    expect(
      orphelines.length,
      `${orphelines.length} article(s) cité(s) à l'écran sans entrée de corpus ` +
        `(plafond ${PLAFOND}). Si ce nombre a BAISSÉ, abaisser PLAFOND d'autant : ` +
        `c'est un cliquet, il ne remonte pas. S'il a AUGMENTÉ, une surface cite ` +
        `au dirigeant un article que personne n'a ouvert — dépouiller le texte ` +
        `avant de l'afficher, ou retirer la citation.\n\n` +
        orphelines
          .map((o) => `  ${o.ref}  —  ${o.emplacements[0]}`)
          .join("\n"),
    ).toBeLessThanOrEqual(PLAFOND);
  });

  it("le plafond colle à la réalité : il ne reste pas gonflé", () => {
    // Un plafond très au-dessus du réel ne protège plus de rien : il laisserait
    // rentrer de nouvelles citations orphelines sans que rien ne bouge. On
    // tolère un écart de 2, pas davantage.
    const orphelines = citationsSansCorpus(RACINE);
    expect(
      PLAFOND - orphelines.length,
      `Le plafond est à ${PLAFOND} pour ${orphelines.length} citation(s) ` +
        `réelle(s). Un plafond gonflé cesse de tenir : l'abaisser à ` +
        `${orphelines.length}.`,
    ).toBeLessThanOrEqual(2);
  });

  it("le balayage voit vraiment une citation orpheline qu'on lui injecte", () => {
    // RÉINJECTION DE DÉFAUT. Sans ceci, un motif d'expression régulière mort
    // rendrait zéro et le cliquet passerait au vert en ne mesurant plus rien —
    // c'est arrivé dans ce dépôt, deux fois le même jour.
    const bac = mkdtempSync(join(tmpdir(), "citations-"));
    try {
      for (const surface of SURFACES_AFFICHEES) {
        mkdirSync(join(bac, surface), { recursive: true });
      }
      // Un article qu'aucun corpus ne connaît, écrit en clair dans du JSX.
      writeFileSync(
        join(bac, "src/app", "faux-ecran.tsx"),
        `export const E = () => <p>art. R. 9999-1 du code du travail</p>;\n`,
      );
      const vues = citationsSansCorpus(bac);
      expect(vues.map((v) => v.ref)).toContain("R. 9999-1");
      expect(vues[0]?.emplacements[0]).toContain("faux-ecran.tsx");
    } finally {
      rmSync(bac, { recursive: true, force: true });
    }
  });

  it("un article que le corpus porte n'est pas compté comme orphelin", () => {
    // La borne haute du même balayage : si tout était rendu orphelin, le test
    // précédent passerait aussi et ne prouverait rien.
    const bac = mkdtempSync(join(tmpdir(), "citations-"));
    try {
      for (const surface of SURFACES_AFFICHEES) {
        mkdirSync(join(bac, surface), { recursive: true });
      }
      const connu = [...articlesDuCorpus()][0];
      expect(connu, "le corpus est vide, le balayage ne prouverait rien").toBeTruthy();
      writeFileSync(
        join(bac, "src/app", "ecran.tsx"),
        `export const E = () => <p>art. ${connu} du code du travail</p>;\n`,
      );
      expect(citationsSansCorpus(bac)).toEqual([]);
    } finally {
      rmSync(bac, { recursive: true, force: true });
    }
  });

  it("une citation en commentaire n'est pas comptée", () => {
    // Un commentaire qui cite un article raconte une décision, souvent une
    // correction. Le dirigeant ne le lit pas.
    const bac = mkdtempSync(join(tmpdir(), "citations-"));
    try {
      for (const surface of SURFACES_AFFICHEES) {
        mkdirSync(join(bac, surface), { recursive: true });
      }
      writeFileSync(
        join(bac, "src/app", "ecran.tsx"),
        `// corrigé le 2026-01-01 : ce n'est pas R. 9999-2 mais R. 9999-3\nexport const E = 1;\n`,
      );
      expect(citationsSansCorpus(bac)).toEqual([]);
    } finally {
      rmSync(bac, { recursive: true, force: true });
    }
  });
});
