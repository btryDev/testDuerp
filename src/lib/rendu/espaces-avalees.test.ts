import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  espacesAvalees,
  nettoyerTexteJsx,
  rendreTexteJsx,
} from "./espaces-avalees";

/**
 * Aucune espace avalée par JSX dans une phrase d'écran.
 *
 * CE QUI REND CE TEST NÉCESSAIRE : rien d'autre ne l'attrape. Ni `tsc`, ni
 * ESLint, ni Prettier — qui préserve la sémantique du blanc mais n'a aucune
 * raison d'ajouter une espace que l'auteur n'a pas écrite. Et surtout pas un
 * `grep` : **le source porte bien l'espace**, sous la forme d'un retour à la
 * ligne, et c'est le compilateur qui la supprime. Chercher `</strong>\S` dans
 * le texte rend zéro sur le seul défaut réel du dépôt.
 *
 * Le raisonnement complet est en tête de `espaces-avalees.ts`.
 */
const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function fichiersTsx(dir: string, acc: string[] = []): string[] {
  for (const nom of readdirSync(dir)) {
    if (nom === "node_modules" || nom === ".next") continue;
    const chemin = join(dir, nom);
    if (statSync(chemin).isDirectory()) fichiersTsx(chemin, acc);
    else if (nom.endsWith(".tsx")) acc.push(chemin);
  }
  return acc;
}

describe("la règle de nettoyage de JSX", () => {
  it("efface le blanc de bord qui porte un retour à la ligne", () => {
    // C'est tout le défaut, en une ligne : l'espace écrite avant `au-delà` est
    // au bord du nœud, donc elle disparaît.
    expect(nettoyerTexteJsx("\n      au-delà de 50 mètres.\n    ")).toBe(
      "au-delà de 50 mètres.",
    );
  });

  it("garde le blanc du milieu, devenu une espace simple", () => {
    expect(nettoyerTexteJsx(" de plus de\n      28 mètres, ")).toBe(
      " de plus de 28 mètres, ",
    );
  });
});

describe("la règle propre à la chaîne qui livre", () => {
  it("une entité HTML fait perdre au nœud son blanc de tête", () => {
    // Relevé sur la sortie de `next build`, pas déduit :
    //   children:" renforce"}),"vos obligations : …   ← entité, espace mangée
    //   children:"un"}),"  DUERP tenu à jour…"        ← sans entité, conservée
    expect(rendreTexteJsx(" n&apos;y figure pas")).toBe("n&apos;y figure pas");
    expect(rendreTexteJsx(" ny figure pas")).toBe(" ny figure pas");
  });

  it("le blanc de QUEUE, lui, survit à l'entité", () => {
    // La dissymétrie est vérifiée sur le même build :
    //   "de vos vérifications et ",(0,b.jsx)("strong…
    expect(rendreTexteJsx("l&apos;acte ")).toBe("l&apos;acte ");
  });

  it("aucune règle de nettoyage ne s'applique à une expression", () => {
    // C'est pourquoi c'est le remède : une expression n'est pas un nœud de
    // texte, et son espace survit à Babel comme à Turbopack.
    expect(
      espacesAvalees(`
        export const A = () => (
          <p>
            le <strong>CACES</strong>{" "}
            n&apos;y figure pas.
          </p>
        );
      `),
    ).toEqual([]);
  });
});

describe("les trois formes de soudure", () => {
  // Forme 1 — la balise finit la ligne. C'est celle qu'on voit à l'écran et
  // qu'aucun grep ne trouve.
  it("relève une balise inline en fin de ligne", () => {
    const releve = espacesAvalees(`
      export const A = () => (
        <p>
          Les bureaux sont <strong>GHW1</strong> jusqu'à 50 mètres,{" "}
          <strong>GHW2</strong>
          au-delà.
        </p>
      );
    `);
    expect(releve).toHaveLength(1);
    expect(releve[0].forme).toBe("balise");
    expect(releve[0].droite).toContain("au-delà");
  });

  // Forme 2 — l'adjacence à une `{expression}`. Un balayage qui ne cherche que
  // la première rend zéro sur celle-ci, et réciproquement.
  it("relève une {expression} en fin de ligne", () => {
    const releve = espacesAvalees(`
      export const A = ({ compte }: { compte: number }) => (
        <p>
          Vous avez {compte}
          fiches en attente.
        </p>
      );
    `);
    expect(releve).toHaveLength(1);
    expect(releve[0].forme).toBe("expression");
  });

  // Forme 3 — l'entité mange une espace ORDINAIRE, sans aucun retour à la
  // ligne. C'est la plus nombreuse — trente et une occurrences dans ce dépôt —
  // et celle qu'aucun grep de la forme 1 ne pouvait trouver : le source montre
  // bien l'espace, c'est le compilateur qui la retire.
  it("relève une espace mangée par une entité, sans retour à la ligne", () => {
    const releve = espacesAvalees(`
      export const A = () => (
        <p>
          le <strong>CACES</strong> n&apos;y figure pas.
        </p>
      );
    `);
    expect(releve).toHaveLength(1);
    expect(releve[0].droite).toContain("figure pas");
  });

  it("relève aussi le texte soudé à une {expression} qui le suit", () => {
    const releve = espacesAvalees(`
      export const A = ({ nom }: { nom: string }) => (
        <p>
          Dossier de
          {nom}, ouvert hier.
        </p>
      );
    `);
    expect(releve).toHaveLength(1);
    expect(releve[0].forme).toBe("expression");
  });
});

describe("ce que le balayage laisse passer, et pourquoi", () => {
  // Sans ces quatre discriminants, le balayage rendait 117 lignes sur ce dépôt
  // pour un seul défaut. Chacun est structurel : aucun n'énumère de cas.
  it("une soudure écrite sur une seule ligne est sous les yeux de l'auteur", () => {
    expect(
      espacesAvalees(`export const A = () => (<p>Type <strong>J</strong>x</p>);`),
    ).toEqual([]);
  });

  it("une branche vide dit que la soudure est voulue (le pluriel)", () => {
    expect(
      espacesAvalees(`
        export const A = ({ n }: { n: number }) => (
          <p>
            {n} salarié
            {n > 1 ? "s" : ""} sur site.
          </p>
        );
      `),
    ).toEqual([]);
  });

  it("une branche qui porte son blanc dit que l'auteur espace dans l'expression", () => {
    expect(
      espacesAvalees(`
        export const A = ({ n }: { n: number }) => (
          <p>
            {n} unité
            {n > 1 ? "s n'ont" : " n'a"} aucun risque coché.
          </p>
        );
      `),
    ).toEqual([]);
  });

  it("un conteneur qui dispose en boîtes sépare par sa gouttière", () => {
    expect(
      espacesAvalees(`
        export const A = () => (
          <p className="flex items-baseline gap-2.5">
            <span>Aujourd'hui</span>
            <time dateTime="2026-09-03">3 septembre</time>
          </p>
        );
      `),
    ).toEqual([]);
  });

  it("une balise à marge horizontale s'écarte elle-même", () => {
    expect(
      espacesAvalees(`
        export const A = ({ v }: { v: string }) => (
          <p>
            <span className="board-eyebrow mr-2">Observations</span>
            {v}
          </p>
        );
      `),
    ).toEqual([]);
  });

  it("un <br /> sépare mieux qu'une espace", () => {
    expect(
      espacesAvalees(`
        export const A = () => (
          <h1>
            Vos obligations,
            <br />
            <em>au clair</em>.
          </h1>
        );
      `),
    ).toEqual([]);
  });

  it("un bloc ou un composant n'est pas une phrase", () => {
    expect(
      espacesAvalees(`
        export const A = () => (
          <li>
            <LegalBadge reference="R. 4227-34" />
            Exercices semestriels.
          </li>
        );
      `),
    ).toEqual([]);
  });

  it("deux inconnues ne prouvent rien", () => {
    expect(
      espacesAvalees(`
        export const A = ({ a, b }: { a: string; b: string }) => (
          <p>
            {a}
            {b}
          </p>
        );
      `),
    ).toEqual([]);
  });
});

describe("le dépôt", () => {
  const fichiers = fichiersTsx(join(RACINE, "src"));

  it("le balayage trouve bien les écrans — sinon il ne prouve rien", () => {
    // Un balayage qui ne parcourt rien passe au vert sans rien vérifier.
    expect(fichiers.length).toBeGreaterThan(100);
    expect(
      fichiers.some((f) => f.endsWith(join("etablissements", "EtablissementForm.tsx"))),
    ).toBe(true);
  });

  it("aucune phrase d'écran ne colle deux mots", () => {
    const soudures: string[] = [];
    for (const chemin of fichiers) {
      for (const e of espacesAvalees(readFileSync(chemin, "utf8"), chemin)) {
        soudures.push(
          `${relative(RACINE, chemin)}:${e.ligne} [${e.forme}] …${e.gauche}⟩⟨${e.droite}…`,
        );
      }
    }
    expect(soudures).toEqual([]);
  });
});
