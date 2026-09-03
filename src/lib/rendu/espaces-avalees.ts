import ts from "typescript";

/**
 * Les espaces que JSX avale entre deux enfants.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LE DÉFAUT
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * JSX ne rend pas le texte tel qu'il est écrit. Avant de le passer à React, le
 * compilateur applique la règle de `cleanJSXElementLiteralChild` : dans un nœud
 * de texte, **le blanc de début de ligne et le blanc de fin de ligne sont
 * supprimés**, et une ligne entièrement blanche disparaît. Un retour à la ligne
 * resté au milieu devient une espace ; celui d'un bord ne devient rien.
 *
 * Conséquence : une phrase coupée juste après une balise perd l'espace que
 * l'auteur croit avoir écrite.
 *
 *     Les bureaux sont <strong>GHW1</strong> de plus de 28 mètres à 50 mètres,
 *     <strong>GHW2</strong>
 *     au-delà de 50 mètres.
 *
 * rend « … GHW1 de plus de 28 mètres à 50 mètres, GHW2au-delà de 50 mètres. »
 * Le `GHW1` est juste parce que son voisin est sur la même ligne ; le `GHW2` ne
 * l'est pas parce que la coupure tombe là. **Rien ne distingue les deux à la
 * lecture du source** : c'est la position d'un retour à la ligne, invisible,
 * qui décide.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DEUX FORMES, ET POURQUOI IL FAUT LES DEUX
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. **Balise en fin de ligne**, texte à la ligne suivante — la forme ci-dessus.
 * 2. **Adjacence à une `{expression}`** : `{compte}` en fin de ligne et l'unité
 *    à la suivante, ou l'inverse.
 *
 * **Et une troisième, qui n'est pas dans la spécification et qui est de loin la
 * plus nombreuse** : un nœud de texte qui contient une entité HTML (`&apos;`,
 * `&amp;`, `&#8212;`) perd son blanc de TÊTE, même sans le moindre retour à la
 * ligne. Elle est documentée sur `rendreTexteJsx`, plus bas, avec le relevé de
 * `next build` qui l'établit. Ce dépôt en portait **trente et une**, dont les
 * quatre du relevé visuel du 2026-09-03 que le mécanisme annoncé n'expliquait
 * pas — et qu'aucun `grep` ni aucun balayage fidèle à Babel ne pouvait trouver.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POURQUOI UN GREP NE SUFFIT PAS
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Le source porte bien l'espace — c'est le rendu qui la mange. Chercher
 * `</strong>\S` ne trouve rien : entre `</strong>` et le mot il y a du blanc,
 * une espace ou un retour à la ligne. Il faut **appliquer les règles de
 * nettoyage** pour savoir ce qui en reste, ce que seule une lecture de l'arbre
 * permet — et il faut appliquer celles de la chaîne qui LIVRE, pas celles de la
 * spécification : elles diffèrent, et c'est là que sont trente des trente et
 * une occurrences.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CE QUE CE BALAYAGE NE PRÉTEND PAS FAIRE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Il ne lit pas dans les intentions. `salarié{n > 1 ? "s" : ""}` colle lui aussi
 * deux enfants par-dessus un retour à la ligne, et c'est la seule façon d'écrire
 * un pluriel. Quatre traits distinguent la soudure voulue de l'oubli, et ils
 * sont tous structurels — aucun n'est une liste de cas :
 *
 * - l'expression a **une branche qui ne rend rien** (`""`, `null`, `&&`) : un
 *   mot manquant n'a jamais d'alternative vide ;
 * - une branche **porte son blanc de bord** (`{n > 1 ? "s n'ont" : " n'a"}`) :
 *   l'auteur gère l'espacement dans l'expression ;
 * - le conteneur **dispose en boîtes** (`flex`, `grid`) : la gouttière sépare,
 *   pas l'espace ;
 * - la balise voisine **porte une marge horizontale** (`mr-2`, `ml-1`) : elle
 *   s'écarte elle-même.
 *
 * Sans ces quatre traits, le balayage rend cent dix-sept lignes dont cent
 * seize sont correctes — et un relevé qu'on ne lit plus ne garde rien.
 */
export type EspaceAvalee = {
  /** 1-indexée, la ligne où la soudure se produit. */
  ligne: number;
  /** Ce que le rendu colle à gauche de la soudure. */
  gauche: string;
  /** Ce que le rendu colle à droite. */
  droite: string;
  /**
   * `balise` : un élément inline finit la ligne (`<strong>…</strong>`).
   * `expression` : une `{expression}` est d'un côté de la soudure.
   */
  forme: "balise" | "expression";
};

/**
 * Les balises qui portent une phrase suivie — celles où deux enfants collés se
 * lisent comme un seul mot.
 *
 * Un `<div>` en est exclu, et c'est ce qui rend le relevé lisible : ailleurs,
 * `<div>Rojer<span className="size-[7px] rounded-full" /></div>` empile un nom
 * et une pastille, et compter les `<div>` rend une quarantaine de fausses
 * soudures de ce genre.
 */
const CONTENEURS_DE_PROSE = new Set([
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "dd",
  "dt",
  "figcaption",
  "blockquote",
  "caption",
  "summary",
  "td",
  "th",
  "label",
  "legend",
  "a",
  "strong",
  "em",
]);

/**
 * Les balises qui portent du texte dans le fil de la phrase. Un `<div>` ou un
 * composant en majuscule n'en est pas : ce qui les suit à la ligne n'a pas à
 * être collé.
 */
const BALISES_INLINE = new Set([
  "a",
  "abbr",
  "b",
  "cite",
  "code",
  "dfn",
  "em",
  "i",
  "kbd",
  "mark",
  "q",
  "s",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
]);

/**
 * Un rendu se termine par quelque chose qui appelle une espace : une lettre, un
 * chiffre, ou une ponctuation fermante. Après « GHW2 » comme après « 50 %, » ou
 * « (art. 7) », le mot suivant a besoin d'être décollé.
 */
const FIN_APPELLE_ESPACE = /[\p{L}\p{N}»)\].,;:!?%€]$/u;

/**
 * Un rendu commence par quelque chose qui appelle une espace devant lui. La
 * ponctuation fermante en est exclue : un mot suivi d'une virgule se colle bien.
 */
const DEBUT_APPELLE_ESPACE = /^[\p{L}\p{N}«(\[]/u;

/** Les utilitaires Tailwind qui écartent une balise de sa voisine. */
const MARGE_HORIZONTALE = /(^|[\s"'`])-?m[lrxse]-/;

/**
 * Les balises qui rompent la ligne. Elles séparent mieux qu'une espace, et le
 * balayage les prenait pour rien : sept titres en deux lignes se lisaient
 * « Vos obligations,au clair ».
 */
const SAUTS = new Set(["br", "hr", "wbr"]);

/**
 * La règle de nettoyage de JSX, reprise de
 * `@babel/types/cleanJSXElementLiteralChild` — la même que celle de TypeScript
 * et de SWC. Elle est recopiée ici plutôt qu'importée parce qu'aucun des trois
 * ne l'expose : c'est un détail d'implémentation de leur transformation.
 */
export function nettoyerTexteJsx(brut: string): string {
  const lignes = brut.split(/\r\n|\n|\r/);
  let derniereNonVide = 0;
  for (let i = 0; i < lignes.length; i++) {
    if (/[^ \t]/.test(lignes[i])) derniereNonVide = i;
  }
  let rendu = "";
  for (let i = 0; i < lignes.length; i++) {
    let ligne = lignes[i].replace(/\t/g, " ");
    if (i !== 0) ligne = ligne.replace(/^ +/, "");
    if (i !== lignes.length - 1) ligne = ligne.replace(/ +$/, "");
    if (ligne) {
      if (i !== derniereNonVide) ligne += " ";
      rendu += ligne;
    }
  }
  return rendu;
}

/** Une référence d'entité HTML dans un nœud de texte JSX. */
const ENTITE_HTML = /&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/;

/**
 * Ce que le rendu montre vraiment, la chaîne de compilation de Next comprise.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LA SECONDE RÈGLE, QUI N'EST DANS AUCUNE SPÉCIFICATION
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * **Un nœud de texte qui contient une entité HTML perd son blanc de TÊTE**, y
 * compris une espace simple sans le moindre retour à la ligne. Son blanc de
 * queue, lui, est conservé.
 *
 *     le <strong>CACES</strong> n&apos;y figure pas
 *
 * rend « le CACESn'y figure pas ». Le même texte sans `&apos;` rend l'espace.
 *
 * **Relevé sur la sortie de `next build`**, pas déduit — et pas seulement en
 * développement :
 *
 *     children:" renforce"}),"vos obligations : …      ← entité, espace mangée
 *     children:"un"}),"  DUERP tenu à jour…"           ← sans entité, conservée
 *
 * Ce n'est PAS le comportement de `@swc/core` appelé seul, ni celui de
 * TypeScript, ni celui de Babel : les trois conservent l'espace. C'est donc une
 * particularité de la chaîne qui livre cette application, et c'est celle-là
 * qu'il faut modéliser — un balayage fidèle à Babel rend zéro sur les
 * trente et une occurrences que ce dépôt portait.
 *
 * C'est aussi ce qui explique le relevé visuel du 2026-09-03. Les cinq
 * occurrences annoncées existaient bel et bien ; ce qui était faux, c'est le
 * mécanisme supposé — « JSX supprime le saut de ligne adjacent à une balise » —
 * et c'est pourquoi un `grep` de cette forme-là rendait zéro. Quatre des cinq
 * n'ont AUCUN retour à la ligne à l'endroit incriminé : elles ont une espace,
 * bien visible dans le source, que le compilateur retire.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LE REMÈDE, ET POURQUOI IL NE DÉPEND D'AUCUN COMPILATEUR
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * `{" "}` n'est pas un nœud de texte : c'est une expression, et aucune règle de
 * nettoyage ne s'y applique. Une espace écrite ainsi survit à Babel, à SWC, à
 * Turbopack, et à celui qui les remplacera. Les trente et une occurrences ont
 * été converties.
 */
export function rendreTexteJsx(brut: string): string {
  const rendu = nettoyerTexteJsx(brut);
  return ENTITE_HTML.test(brut) ? rendu.trimStart() : rendu;
}

/**
 * Le texte brut d'un nœud JSX.
 *
 * `getText()` ne convient pas : il part de `getStart()`, qui saute le trivia —
 * sur un `JsxText`, il **mange le blanc de tête**, c'est-à-dire précisément ce
 * qu'on cherche à mesurer. `<strong> renforce</strong>` s'y lisait « renforce »
 * et passait pour une soudure alors que l'espace est dans la balise.
 */
function brutDe(noeud: ts.Node): string {
  return noeud.getSourceFile().text.slice(noeud.pos, noeud.end);
}

/** Le côté d'un nœud qu'on interroge. */
type Cote = "debut" | "fin";

/**
 * Le caractère que le rendu présente d'un côté.
 *
 * - une chaîne d'un caractère : ce que le lecteur verra à ce bord ;
 * - `""` : le nœud ne rend rien — il ne sépare pas, il s'efface ;
 * - `null` : inconnu, parce qu'une `{expression}` peut rendre n'importe quoi.
 *
 * On ne calcule que le bord, jamais le rendu entier : `<span>{email}</span>`
 * commence par un blanc connu et finit par un inconnu, et un seul des deux
 * suffit à trancher la soudure qui l'intéresse.
 */
function bordRendu(noeud: ts.Node, cote: Cote): string | null {
  const extremite = (t: string) =>
    t === "" ? "" : cote === "debut" ? t[0] : t[t.length - 1];

  if (ts.isJsxText(noeud)) return extremite(rendreTexteJsx(brutDe(noeud)));

  if (ts.isStringLiteral(noeud) || ts.isNoSubstitutionTemplateLiteral(noeud)) {
    return extremite(noeud.text);
  }

  if (ts.isParenthesizedExpression(noeud)) {
    return bordRendu(noeud.expression, cote);
  }

  if (
    noeud.kind === ts.SyntaxKind.NullKeyword ||
    noeud.kind === ts.SyntaxKind.FalseKeyword ||
    (ts.isIdentifier(noeud) && noeud.text === "undefined")
  ) {
    return "";
  }

  if (ts.isJsxExpression(noeud)) {
    return noeud.expression ? bordRendu(noeud.expression, cote) : "";
  }

  if (ts.isConditionalExpression(noeud)) {
    const branches = [
      bordRendu(noeud.whenTrue, cote),
      bordRendu(noeud.whenFalse, cote),
    ];
    // Une branche qui porte son blanc de bord innocente toute l'expression :
    // `{n > 1 ? "s n'ont" : " n'a"}` colle son « s » au singulier et pousse
    // l'espace dans l'autre branche. C'est la seule façon d'écrire cet accord.
    if (branches.some((b) => b !== null && b !== "" && /\s/.test(b))) {
      return " ";
    }
    // Une branche vide dit que la soudure est voulue : un mot oublié n'a
    // jamais d'alternative où il ne s'écrit pas.
    if (branches.some((b) => b === "")) return "";
    if (branches.some((b) => b === null)) return null;
    // Les deux rendent un caractère plein : on retient celui qui appelle une
    // espace. Un défaut n'a pas besoin d'être permanent pour être vu.
    const appelle = cote === "debut" ? DEBUT_APPELLE_ESPACE : FIN_APPELLE_ESPACE;
    return branches.find((b) => appelle.test(b!)) ?? branches[0];
  }

  // `{cond && …}` rend `false`, donc rien, quand la condition est fausse.
  if (
    ts.isBinaryExpression(noeud) &&
    (noeud.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
      noeud.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
  ) {
    return "";
  }

  if (ts.isJsxFragment(noeud)) return bordDesEnfants(noeud.children, cote);

  if (ts.isJsxElement(noeud)) {
    if (!BALISES_INLINE.has(noeud.openingElement.tagName.getText())) return null;
    // Une balise qui s'écarte elle-même sépare : le rendu porte une marge et
    // non une espace, mais le lecteur ne voit pas la différence.
    if (margeHorizontale(noeud.openingElement)) return " ";
    return bordDesEnfants(noeud.children, cote);
  }

  if (ts.isJsxSelfClosingElement(noeud)) {
    // Un `<br />` sépare mieux qu'une espace : il rompt la ligne.
    if (SAUTS.has(noeud.tagName.getText())) return " ";
    if (!BALISES_INLINE.has(noeud.tagName.getText())) return null;
    return margeHorizontale(noeud) ? " " : null;
  }

  return null;
}

function bordDesEnfants(
  enfants: ts.NodeArray<ts.JsxChild>,
  cote: Cote,
): string | null {
  const ordre = cote === "debut" ? enfants : [...enfants].reverse();
  for (const enfant of ordre) {
    const bord = bordRendu(enfant, cote);
    if (bord === null) return null;
    if (bord !== "") return bord;
  }
  return "";
}

function margeHorizontale(
  ouvrante: ts.JsxOpeningElement | ts.JsxSelfClosingElement,
): boolean {
  return classNameDe(ouvrante).some((c) => MARGE_HORIZONTALE.test(c));
}

function classNameDe(
  ouvrante: ts.JsxOpeningElement | ts.JsxSelfClosingElement,
): string[] {
  const valeurs: string[] = [];
  for (const attr of ouvrante.attributes.properties) {
    if (!ts.isJsxAttribute(attr)) continue;
    if (attr.name.getText() !== "className") continue;
    const v = attr.initializer;
    if (!v) continue;
    valeurs.push(ts.isStringLiteral(v) ? v.text : v.getText());
  }
  return valeurs;
}

/**
 * Le conteneur dispose-t-il ses enfants en boîtes plutôt qu'en phrase ?
 *
 * Un `<p className="flex items-baseline gap-2.5">` empile un sur-titre et une
 * date : le rendu les sépare par la gouttière, et la balise `p` ne dit rien de
 * cette mise en page. C'est la classe qui la porte.
 */
function disposeEnBoites(ouvrante: ts.JsxOpeningElement): boolean {
  return classNameDe(ouvrante).some((c) => /\b(inline-)?(flex|grid)\b/.test(c));
}

/** Ce qu'on sait du rendu d'un enfant JSX, à ses deux bords. */
type Bord = {
  noeud: ts.Node;
  /** Le rendu est vide des deux côtés : le nœud s'efface, il ne sépare rien. */
  disparait: boolean;
  separeAGauche: boolean;
  separeADroite: boolean;
  /** `null` = bord inconnu. */
  finAppelleEspace: boolean | null;
  debutAppelleEspace: boolean | null;
  apercu: string;
  /** L'enfant est une `{expression}`. */
  expression: boolean;
};

function bordDe(enfant: ts.JsxChild): Bord {
  const apercu = brutDe(enfant).replace(/\s+/g, " ").trim().slice(0, 40);
  const expression = ts.isJsxExpression(enfant);

  // Bloc, composant, image : ce qui les suit à la ligne n'a pas à leur être
  // collé, et ils ne s'effacent pas pour autant.
  const muet =
    (ts.isJsxElement(enfant) &&
      !BALISES_INLINE.has(enfant.openingElement.tagName.getText())) ||
    (ts.isJsxSelfClosingElement(enfant) &&
      !BALISES_INLINE.has(enfant.tagName.getText()) &&
      !SAUTS.has(enfant.tagName.getText()));
  if (muet) {
    return {
      noeud: enfant,
      disparait: false,
      separeAGauche: true,
      separeADroite: true,
      finAppelleEspace: false,
      debutAppelleEspace: false,
      apercu,
      expression,
    };
  }

  const debut = bordRendu(enfant, "debut");
  const fin = bordRendu(enfant, "fin");
  return {
    noeud: enfant,
    disparait: debut === "" && fin === "",
    separeAGauche: debut !== null && debut !== "" && /\s/.test(debut),
    separeADroite: fin !== null && fin !== "" && /\s/.test(fin),
    finAppelleEspace: fin === null ? null : FIN_APPELLE_ESPACE.test(fin),
    debutAppelleEspace:
      debut === null ? null : DEBUT_APPELLE_ESPACE.test(debut),
    apercu,
    expression,
  };
}
function blancEfface(noeud: ts.Node): { tete: string; queue: string } {
  if (!ts.isJsxText(noeud)) return { tete: "", queue: "" };
  const brut = brutDe(noeud);
  return {
    tete: brut.slice(0, brut.length - brut.trimStart().length),
    queue: brut.slice(brut.trimEnd().length),
  };
}

/**
 * Relève les soudures : deux enfants JSX que le rendu colle alors que le source
 * les sépare par un retour à la ligne.
 */
export function espacesAvalees(
  source: string,
  nomFichier = "extrait.tsx",
): EspaceAvalee[] {
  const arbre = ts.createSourceFile(
    nomFichier,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const releve: EspaceAvalee[] = [];

  function souder(a: Bord, b: Bord) {
    if (a.separeADroite || b.separeAGauche) return;
    if (a.finAppelleEspace === false || b.debutAppelleEspace === false) return;
    // Deux inconnues : rien ne prouve qu'il manque quelque chose.
    if (a.finAppelleEspace === null && b.debutAppelleEspace === null) return;

    // Le source sépare-t-il les deux par un retour à la ligne ? C'est la seule
    // trace de l'espace que l'auteur croit avoir écrite. Sur une même ligne, la
    // soudure est sous ses yeux, donc voulue.
    const entre =
      blancEfface(a.noeud).queue +
      source.slice(a.noeud.end, b.noeud.pos) +
      blancEfface(b.noeud).tete;
    if (!/\s/.test(entre)) return;

    releve.push({
      ligne: arbre.getLineAndCharacterOfPosition(b.noeud.end).line + 1,
      gauche: a.apercu,
      droite: b.apercu,
      forme: a.expression || b.expression ? "expression" : "balise",
    });
  }

  function examiner(enfants: ts.NodeArray<ts.JsxChild>) {
    let precedent: Bord | null = null;
    for (const enfant of enfants) {
      const bord = bordDe(enfant);
      if (bord.disparait) continue;
      if (precedent) souder(precedent, bord);
      precedent = bord;
    }
  }

  function parcourir(noeud: ts.Node) {
    if (
      ts.isJsxElement(noeud) &&
      CONTENEURS_DE_PROSE.has(noeud.openingElement.tagName.getText()) &&
      !disposeEnBoites(noeud.openingElement)
    ) {
      examiner(noeud.children);
    }
    ts.forEachChild(noeud, parcourir);
  }

  parcourir(arbre);
  return releve.sort((x, y) => x.ligne - y.ligne);
}
