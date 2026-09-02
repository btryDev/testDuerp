import { describe, expect, it } from "vitest";
import {
  CHAPEAU_ANNEXE_EXPOSITION,
  TITRE_ANNEXE_EXPOSITION,
} from "./mentions-exposition";

const chapeau = CHAPEAU_ANNEXE_EXPOSITION.join(" ");
/** Le paragraphe qui décrit le tableau — le seul qui parle de son contenu. */
const [ceQueLaPageEst, ceQuElleNEstPas] = CHAPEAU_ANNEXE_EXPOSITION;

describe("le titre de l'annexe d'exposition", () => {
  it("ne porte aucun numéro d'article", () => {
    // Une page de PDF titrée d'un numéro d'article est lue par son
    // destinataire — inspecteur, assureur, acquéreur — comme la pièce que cet
    // article réclame. Celle-ci ne l'est pas.
    expect(TITRE_ANNEXE_EXPOSITION).not.toMatch(/\b[LRD]\.\s?\d{4}-\d/);
  });

  it("dit ce que la page est", () => {
    expect(TITRE_ANNEXE_EXPOSITION).toMatch(/dénombrement indicatif/i);
  });
});

describe("le chapeau de l'annexe d'exposition", () => {
  it("décrit le contenu du tableau sans jamais l'appeler une proportion", () => {
    // Le défaut corrigé, mot pour mot : le chapeau annonçait « la proportion
    // de salariés exposés au-delà des seuils réglementaires » au-dessus d'une
    // colonne d'effectifs bruts.
    //
    // La vérification porte sur le PREMIER paragraphe seul, parce que c'est
    // le seul qui dise ce que la page contient. Le second parle de ce que
    // l'article demande, et doit pouvoir écrire « proportion » : c'est le
    // mot du texte, et le lui retirer effacerait l'écart qu'on veut nommer.
    expect(ceQueLaPageEst).not.toMatch(/proportion|seuil/i);
    expect(ceQueLaPageEst).toMatch(/nombre de salariés exposés/i);
  });

  it("sépare le paragraphe qui décrit de celui qui détrompe", () => {
    // Deux paragraphes, et l'ordre compte : ce que la page est, puis ce
    // qu'elle n'est pas. Les fondre en un seul rendrait le test ci-dessus
    // ininterprétable, et la page relisible comme la pièce de l'article.
    expect(CHAPEAU_ANNEXE_EXPOSITION).toHaveLength(2);
    expect(ceQueLaPageEst).not.toMatch(/\b[LRD]\.\s?\d{4}-\d/);
    expect(ceQuElleNEstPas).toMatch(/\b[LRD]\.\s?\d{4}-\d/);
  });

  it("dit explicitement que ce n'est pas l'annexe de l'article", () => {
    // La phrase porte tout le correctif : sans elle, un tableau qui cite
    // l'article et donne des chiffres se lit comme la pièce de l'article.
    expect(chapeau).toMatch(
      /n'est pas l'annexe prévue par l'article R\. 4121-1-1/,
    );
    expect(chapeau).toMatch(/ne la remplace pas/);
  });

  it("nomme ce qui manque pour calculer ce que l'article demande", () => {
    // Deux manques, et il en faut deux : le rattachement aux facteurs, et la
    // comparaison à un seuil. N'en nommer qu'un laisserait croire que
    // l'autre est acquis.
    expect(chapeau).toMatch(/ne rattache aucun de ses risques à ces facteurs/);
    expect(chapeau).toMatch(/ne compare aucune exposition à un seuil/);
  });

  it("dit ce qu'est le nombre imprimé", () => {
    expect(chapeau).toMatch(/effectif, et non une proportion/);
  });

  it("ne cite aucun article que le corpus du dépôt n'a pas ouvert", () => {
    // Le facteur auquel l'article renvoie vit dans un article que le corpus
    // ne porte pas ; le chapeau le désigne donc par ses mots, sans son
    // numéro. `citations-ecran.test.ts` tient la même règle sur toutes les
    // surfaces affichées — ce test la rend lisible à l'endroit où elle se
    // décide.
    const cites = [...chapeau.matchAll(/\b[LRD]\.\s?\d{4}-\d+(?:-\d+)*\b/g)];
    expect(cites.map((c) => c[0])).toEqual(["R. 4121-1-1"]);
  });

  it("ne conclut pas sur le droit", () => {
    expect(chapeau).not.toMatch(/conforme|en règle|en infraction|satisfait à/i);
  });
});
