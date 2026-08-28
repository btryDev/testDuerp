import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Un article de loi, un identifiant Légifrance — et pas deux.
 *
 * Un balayage des 127 URL Légifrance du dépôt en a trouvé **17 fausses**. La
 * plupart ne sont pas des erreurs de droit mais des erreurs de RECOPIE : un
 * identifiant collé depuis la mauvaise page, ou depuis la ligne d'à côté. Les
 * plus coûteuses résolvent — silencieusement — vers un autre article :
 * `LEGIARTI000018530833`, annoncé « R. 4121-1 · document unique », sert en
 * réalité R. 4412-49, sur les instructions techniques en matière d'agents
 * chimiques. La pastille affichait un extrait du DUERP à côté d'un lien vers
 * un texte sans rapport.
 *
 * Rien ne pouvait le voir : l'URL répond 200, la page s'ouvre, elle est même
 * en vigueur. Seule l'ouverture une par une l'a montré, et personne ne
 * rouvrira 127 pages à chaque commit.
 *
 * CE QUE CE TEST PROUVE : que le dépôt ne se contredit pas lui-même. Quand un
 * article est cité à deux endroits, les deux citations pointent le même
 * identifiant. Trois des quatre erreurs de ce lot étaient exactement cela — le
 * bon identifiant existait ailleurs dans le dépôt, pour le même article.
 *
 * CE QU'IL NE PROUVE PAS : qu'un identifiant cité UNE SEULE FOIS soit le bon.
 * Un article isolé, faux partout, passe au vert. Il n'y a pas de remède local à
 * ça : il faudrait ouvrir la page, et un test ne le fera pas. C'est la limite,
 * elle est réelle, et elle est écrite ici pour ne pas passer pour acquise.
 */

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * Un numéro d'article français, ramené à une forme unique.
 *
 * Le dépôt écrit « Art. R4121-1 CT », « R. 4121-1 », « Art. R. 4121-1 CT ·
 * DUERP ». Comparer ces chaînes telles quelles ne rapprocherait rien. Seule la
 * lettre et le numéro comptent, et ils suffisent à identifier l'article.
 */
const MOTIF_ARTICLE = /\b([LRD])\.?\s?(\d{4}-\d+(?:-\d+)*)\b/g;

export function articlesCites(texte: string): string[] {
  return [...texte.matchAll(MOTIF_ARTICLE)].map((m) => `${m[1]}. ${m[2]}`);
}

/**
 * Les couples (article cité, identifiant Légifrance) d'un fichier.
 *
 * On regarde en arrière depuis l'URL : dans ce dépôt, `reference` ou `article`
 * précède toujours `url`/`href` de quelques lignes, jamais l'inverse. La
 * dernière rencontrée est la bonne — celle du même bloc.
 */
export function couplesArticleIdentifiant(
  source: string,
): { article: string; identifiant: string; ligne: number }[] {
  const lignes = source.split("\n");
  const couples: { article: string; identifiant: string; ligne: number }[] = [];

  for (let i = 0; i < lignes.length; i++) {
    const id = /(LEGIARTI\d+)/.exec(lignes[i]);
    if (!id) continue;
    const contexte = lignes.slice(Math.max(0, i - 4), i + 1).join(" ");
    const refs = [
      ...contexte.matchAll(
        /(?:reference=|reference:\s*|article:\s*)["']([^"']{2,70})["']/g,
      ),
    ];
    if (refs.length === 0) continue;
    for (const article of articlesCites(refs[refs.length - 1][1])) {
      couples.push({ article, identifiant: id[1], ligne: i + 1 });
    }
  }
  return couples;
}

/**
 * Les contradictions tolérées, avec leur raison ET leur condition de retrait.
 *
 * Une dérogation sans date de péremption devient une permission permanente.
 * Le second test plus bas exige donc que chacune serve encore : le jour où le
 * défaut disparaît, c'est la dérogation qui devient une faute.
 */
const DEROGATIONS: {
  article: string;
  identifiant: string;
  raison: string;
}[] = [
  {
    article: "R. 4224-17",
    identifiant: "LEGIARTI000018530333",
    raison:
      "`permis-feu/page.tsx` annonce « Art. R4224-17 CT » et pointe un identifiant qui sert R. 4434-9 — un article sur le bruit. Le défaut est réel et déjà corrigé sur la branche `fix/affirmations-ecran`, validée en revue et en attente de merge. Le corriger ici aussi produirait un conflit sur la même ligne, pour un gain nul. À retirer de cette liste au merge de cette branche : le test ci-dessous tombera pour le rappeler.",
  },
];

function fichiersSource(dir: string, acc: string[] = []): string[] {
  for (const nom of readdirSync(dir)) {
    if (nom === "node_modules" || nom === ".next") continue;
    const chemin = join(dir, nom);
    if (statSync(chemin).isDirectory()) fichiersSource(chemin, acc);
    else if (/\.tsx?$/.test(nom) && !/\.test\.tsx?$/.test(nom)) acc.push(chemin);
  }
  return acc;
}

/** article → identifiants qui prétendent le servir, avec leurs emplacements. */
function cartographie(): Map<string, Map<string, string[]>> {
  const carte = new Map<string, Map<string, string[]>>();
  for (const abs of fichiersSource(join(RACINE, "src"))) {
    const rel = relative(RACINE, abs);
    for (const c of couplesArticleIdentifiant(readFileSync(abs, "utf8"))) {
      if (!carte.has(c.article)) carte.set(c.article, new Map());
      const par = carte.get(c.article)!;
      if (!par.has(c.identifiant)) par.set(c.identifiant, []);
      par.get(c.identifiant)!.push(`${rel}:${c.ligne}`);
    }
  }
  return carte;
}

function contradictions(): { article: string; detail: string }[] {
  const sorties: { article: string; detail: string }[] = [];
  for (const [article, parIdent] of cartographie()) {
    if (parIdent.size < 2) continue;
    const derogee = DEROGATIONS.some(
      (d) => d.article === article && parIdent.has(d.identifiant),
    );
    if (derogee) continue;
    const detail = [...parIdent]
      .map(([i, locs]) => `${i} (${locs.join(", ")})`)
      .join(" ≠ ");
    sorties.push({ article, detail });
  }
  return sorties;
}

describe("URL Légifrance — un article, un identifiant", () => {
  it("le repérage des articles ramène les graphies du dépôt à une seule", () => {
    // Sans ce contrôle, le test comparerait des chaînes qui ne se rencontrent
    // jamais, et passerait au vert en ne rapprochant rien.
    for (const graphie of [
      "Art. R4121-1 CT",
      "R. 4121-1",
      "Art. R. 4121-1 CT · DUERP",
      "R. 4121-1 (document unique)",
    ]) {
      expect(articlesCites(graphie), graphie).toContain("R. 4121-1");
    }
    // Une citation de plage rend ses deux bornes.
    expect(articlesCites("R. 4224-12 et R. 4224-13")).toEqual([
      "R. 4224-12",
      "R. 4224-13",
    ]);
    // Et un texte sans article ne rend rien.
    expect(articlesCites("Arrêté du 25 juin 1980")).toEqual([]);
  });

  it("le détecteur voit une contradiction, et l'ignore quand il n'y en a pas", () => {
    const contradictoire = `
      reference="Art. R. 4121-1 CT"
      href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000023795562"
      reference="Art. R4121-1 CT"
      href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018530833"
    `;
    const couples = couplesArticleIdentifiant(contradictoire);
    expect(new Set(couples.map((c) => c.identifiant)).size).toBe(2);
    expect(new Set(couples.map((c) => c.article))).toEqual(
      new Set(["R. 4121-1"]),
    );

    const concordant = `
      reference="Art. R. 4121-1 CT"
      href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000023795562"
      reference="R. 4121-1"
      href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000023795562"
    `;
    expect(
      new Set(couplesArticleIdentifiant(concordant).map((c) => c.identifiant))
        .size,
    ).toBe(1);
  });

  it("aucun article n'est servi par deux identifiants différents", () => {
    expect(
      contradictions().map((c) => `${c.article} : ${c.detail}`),
      "Le même article de loi est cité avec deux identifiants Légifrance. L'un " +
        "des deux est faux : un identifiant recopié depuis la mauvaise page " +
        "résout silencieusement vers un autre article. Ouvrez les deux pages, " +
        "gardez celle qui sert l'article annoncé.",
    ).toEqual([]);
  });

  it("chaque dérogation sert encore, et dit pourquoi", () => {
    // Une dérogation dont le défaut a disparu est une permission qui traîne,
    // et qui couvrira un jour une contradiction neuve sur le même article.
    const carte = cartographie();
    for (const { article, identifiant, raison } of DEROGATIONS) {
      expect(raison.length, article).toBeGreaterThan(120);
      const parIdent = carte.get(article);
      expect(
        parIdent?.has(identifiant),
        `Dérogation périmée : ${identifiant} n'est plus cité pour ${article}. ` +
          `Le défaut est corrigé — retirez cette entrée de DEROGATIONS.`,
      ).toBe(true);
      expect(
        (parIdent?.size ?? 0) > 1,
        `Dérogation inutile : ${article} n'est plus servi que par un seul ` +
          `identifiant. Retirez cette entrée.`,
      ).toBe(true);
    }
  });
});
