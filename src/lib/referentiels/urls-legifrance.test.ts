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
 * CE QU'IL NE PROUVE PAS : qu'un article servi par un seul identifiant
 * DISTINCT soit servi par le bon. Le nombre de citations n'y change rien, et la
 * première rédaction de cette phrase — « cité une seule fois » — sous-estimait
 * le trou. Le mauvais identifiant de `R. 4224-13` était cité DEUX fois, aux
 * deux emplacements du même fichier : réinjecté ainsi, la garde reste verte.
 * C'est un des quatre défauts de ce lot, et il lui échappe. Il n'y a pas de
 * remède local : il faudrait ouvrir la page, et un test ne le fera pas.
 *
 * Deuxième limite, de portée : la règle ne s'appuie que sur un numéro
 * d'article de CODE. Les quarante et une occurrences `LEGIARTI` dont la
 * référence voisine nomme un article d'arrêté — « MS 73 », « EL 19 »,
 * « Arrêté 2004-03-01 art. 23 » — n'ont pas de clé comparable et restent hors
 * de portée.
 *
 * Ces deux limites sont écrites ici pour ne pas passer pour acquises.
 */

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * Un numéro d'article français, ramené à une forme unique.
 *
 * Le dépôt écrit « Art. R4121-1 CT », « R. 4121-1 », « Art. R. 4121-1 CT ·
 * DUERP ». Comparer ces chaînes telles quelles ne rapprocherait rien. Seule la
 * lettre et le numéro comptent, et ils suffisent à identifier l'article.
 *
 * `\d{2,4}` et non `\d{4}` : le Code du travail numérote sur quatre chiffres
 * (R. 4121-1), mais le CCH et le code de l'environnement sur trois (R. 134-6,
 * R. 143-44, R. 543-79). La première rédaction les rendait tous invisibles —
 * dont `ascenseurs.ts`, qui cite le même identifiant pour « CCH R. 134-6 » à
 * quatre endroits. Mesuré : 62 occurrences `LEGIARTI` rattachées avant,
 * 72 après, sans aucune contradiction nouvelle.
 */
const MOTIF_ARTICLE = /\b([LRD])\.?\s?(\d{2,4}-\d+(?:-\d+)*)\b/g;

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
  // Vide, et c'est le résultat attendu. Une dérogation a vécu ici le
  // 2026-08-28 : `R. 4224-17` pointait un identifiant servant `R. 4434-9`,
  // un article sur le bruit. Le défaut était corrigé sur une branche voisine
  // et le corriger deux fois aurait produit un conflit pour un gain nul.
  //
  // Le test ci-dessous a fait exactement ce qu'on attendait de lui : au merge
  // réel des deux branches, il est tombé pour réclamer le retrait de sa
  // propre dérogation. Il n'avait jusque-là été éprouvé qu'en simulation.
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

/**
 * Le sens inverse — un identifiant revendiqué pour deux articles — n'est PAS
 * testé, et c'est une décision, pas un oubli.
 *
 * Il porte la même signature de copier-coller, donc l'idée est bonne. Mais elle
 * est mesurée : le dépôt n'en compte qu'un cas, `LEGIARTI000037389145` cité
 * pour « Art. L. 8222-1 · D. 8222-5 CT ». Ce n'est pas une faute — c'est une
 * référence qui nomme légitimement deux articles, et le dépôt en écrit
 * couramment (« R. 4224-12 et R. 4224-13 », « R. 4544-9 à R. 4544-11 »).
 *
 * La règle serait donc rouge dès son écriture, sur son unique cas réel, et il
 * faudrait l'excepter aussitôt — ou la vider en dispensant toute référence qui
 * nomme plus d'un article, c'est-à-dire précisément celles qu'elle viserait.
 * Une règle qu'on excepte sur son seul cas n'est pas une garde.
 */

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
    // Le CCH et le code de l'environnement numérotent sur trois chiffres, et
    // échappaient entièrement au motif.
    expect(articlesCites("CCH R. 134-6")).toContain("R. 134-6");
    expect(articlesCites("Art. R. 143-44 CCH")).toContain("R. 143-44");
    expect(articlesCites("C. env. R. 543-79, al. 1")).toContain("R. 543-79");

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
