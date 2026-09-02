import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * La question posée au dirigeant doit décrire l'article que le moteur teste.
 *
 * LE DÉFAUT QUE CES TESTS FIXENT. L'attribut `manipuleMatieresR422722` porte
 * dans son nom le numéro de `R. 4227-22`, et l'aide du formulaire citait ce
 * numéro-là. Les trois classes de produits qu'elle énumère sont bien celles de
 * cet article, mot pour mot ; sa CONDITION ne l'est pas. `R. 4227-22` vise les
 * locaux où ces matières sont « entreposées OU manipulées » — le simple
 * entreposage suffit à le déclencher. « Manipulées ET mises en œuvre » est la
 * phrase de `R. 4227-34`, et c'est ce champ-là, et lui seul, que le moteur
 * évalue (`champR422734`, critère 3 bis de `matching/engine.ts`).
 *
 * Conséquence à l'écran, et c'est elle qu'on répare : un établissement qui ne
 * fait qu'entreposer répondait « non » en toute bonne foi à une question qui
 * lui montrait le numéro de l'article dont il relève.
 *
 * CE QUI N'EST PAS TESTÉ ICI, PARCE QUE CE N'EST PAS TRANCHÉ : le champ du
 * moteur. Ces tests disent que la question et le moteur nomment le même
 * article, pas que ce champ est le bon.
 */

const SRC = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

/**
 * Le fichier privé de ses commentaires — c'est ce qui reste qui s'affiche.
 * Sans cette coupe, le commentaire qui EXPLIQUE la correction ferait passer
 * les tests pour la correction elle-même.
 */
const sansCommentaires = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const FORMULAIRE = sansCommentaires(
  SRC("src/components/etablissements/EtablissementForm.tsx"),
);

/**
 * L'aide de CETTE question, et non le formulaire entier.
 *
 * La distinction n'est pas cosmétique : la question voisine — les personnes
 * habituellement présentes — cite légitimement `R. 4227-34`, puisqu'elle porte
 * l'autre branche du même OU. Mesurer le fichier entier ferait passer les
 * tests ci-dessous sur le texte du voisin.
 */
const AIDE = (() => {
  const debut = FORMULAIRE.indexOf(`id="manipuleMatieresR422722-aide"`);
  const fin = FORMULAIRE.indexOf("</p>", debut);
  return debut === -1 || fin === -1 ? "" : FORMULAIRE.slice(debut, fin);
})();

describe("la question sur les matières inflammables nomme l'article qu'elle sert", () => {
  it("le moteur teste bien le champ de R. 4227-34, et le dit", () => {
    // La borne basse : si le moteur cessait de nommer cet article, les deux
    // tests suivants compareraient l'écran à rien.
    // Ici on lit les commentaires, et c'est voulu : `types-communs.ts` ne
    // s'affiche à personne, sa documentation EST son énoncé.
    expect(
      SRC("src/lib/referentiels/types-communs.ts"),
      "`champR422734` ne documente plus l'article dont il porte le champ.",
    ).toContain("R. 4227-34");
  });

  it("l'aide affichée cite R. 4227-34", () => {
    expect(
      AIDE,
      "La question déclenche les obligations du champ de R. 4227-34 " +
        "(alarme, consigne, exercices) sans nommer cet article au dirigeant.",
    ).toContain("R. 4227-34");
  });

  it("elle ne présente plus R. 4227-22 comme l'article qu'elle décrit", () => {
    // R. 4227-22 est au corpus et pourrait légitimement être cité ailleurs.
    // Ce qu'on interdit ici est de le citer SUR CETTE QUESTION, dont la
    // condition n'est pas la sienne : c'est cette citation-là qui faisait
    // répondre « non » à un établissement qui ne fait qu'entreposer.
    expect(
      AIDE,
      "L'aide de la question énonce la condition de R. 4227-34 sous le " +
        "numéro de R. 4227-22, dont le champ est plus large " +
        "(« entreposées OU manipulées »).",
    ).not.toContain("R. 4227-22");
  });

  it("elle dit au dirigeant ce que la question ne couvre pas", () => {
    // Le sens de l'erreur est celui-là : la question reste étroite, et c'est
    // la phrase qui rend l'omission visible à celui qui la subit.
    expect(
      AIDE,
      "Rien ne dit au dirigeant que l'entreposage seul sort de la question.",
    ).toMatch(/entreposer sans les mettre en œuvre/);
  });
});
