// La nomenclature des handicaps, tenue à sa source — qui n'est pas celle qu'on
// croyait.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE QUE LE RELEVÉ A ÉTABLI, ET C'EST LA MOITIÉ DU RÉSULTAT
// ─────────────────────────────────────────────────────────────────────────────
//
// `HandicapAccessible` sert le champ `handicapsAccueillis` du registre public
// d'accessibilité. On attendait donc que le droit de l'accessibilité porte sa
// nomenclature — c'est ce que le § 9 de `docs/chantiers-ouverts.md` supposait.
//
// **Il n'en porte aucune.** `L. 161-1` et `L. 164-1` du CCH, `R. 164-6` qui
// institue le registre, et les quatre articles de fond de l'arrêté du
// 19 avril 2017 qui en fixe le contenu ont été ouverts le 2026-09-03 : les
// quatre disent « les personnes handicapées », sans jamais les répartir.
// L'arrêté énumère NEUF pièces et pas une famille.
//
// Cette absence n'est pas une note de bas de page, c'est une propriété que ce
// fichier VÉRIFIE — dernier `it` du premier bloc. Le verbatim de l'arrêté est
// au corpus pour ça, et pour rien d'autre. Sans lui, « le droit de
// l'accessibilité ne nomme aucune famille » resterait une affirmation, du même
// genre que le « (~20 valeurs) » de l'ADR-004 qui a coûté le type J.
//
// **« Les quatre familles de handicap » n'est dans aucun de ces textes.** La
// formule circule partout ; elle vient du document ministériel d'aide à
// l'accueil que l'arrêté fait ANNEXER au registre (art. 1er, I, 8°) sans en
// édicter le contenu. Le modèle ne l'avait d'ailleurs pas prise : il portait
// six valeurs, pas quatre.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA NOMENCLATURE EXISTE, AILLEURS — ET IL EN MANQUAIT DEUX MEMBRES
// ─────────────────────────────────────────────────────────────────────────────
//
// `L. 114` du code de l'action sociale et des familles, écrit par l'article 2
// de la loi du 11 février 2005, est la seule énumération du droit français :
// cinq familles de fonctions — physiques, sensorielles, mentales, cognitives,
// psychiques — puis DEUX situations qu'il met sur le même plan, le
// polyhandicap et le trouble de santé invalidant.
//
// Ces deux dernières manquaient au modèle. C'est le défaut du type `J`, dans un
// autre module : un établissement adapté au polyhandicap ouvrait la liste et
// n'y trouvait pas la sienne, cochait « mental » ou rien, et le registre public
// qu'il publie disait moins que ce que l'établissement fait.
//
// ─────────────────────────────────────────────────────────────────────────────
// POURQUOI UNE TABLE DE CORRESPONDANCE, ET POURQUOI CE N'EST PAS UNE COPIE
// ─────────────────────────────────────────────────────────────────────────────
//
// Le modèle n'écrit pas les mots de `L. 114` : il en affine deux — `moteur`
// pour « physiques », `visuel` et `auditif` pour « sensorielles ». Comparer
// bêtement les deux listes rendrait quatre manquants et trois en trop, et la
// seule façon de faire taire ce test serait d'imposer au dirigeant le
// vocabulaire d'une loi de définition. Ce serait une rustine à l'envers.
//
// Ce qui est vérifié à la place est la SURJECTION, dans les deux sens :
// - toute famille que le texte écrit a au moins une valeur qui la porte —
//   sinon quelqu'un est muet dans le modèle, c'est le défaut `J` ;
// - toute valeur du modèle nomme une famille que le texte écrit — sinon elle
//   se réclame d'un mot inventé.
//
// La table `FAMILLE_L114` n'est donc pas une cinquième copie : ses valeurs sont
// confrontées au VERBATIM de `L. 114`, extrait du corpus. On ne la répare pas
// en recopiant `HANDICAPS` — il faut nommer un mot que le texte écrit, ou
// rouvrir Légifrance.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE QUE CE FICHIER NE VÉRIFIE PAS
// ─────────────────────────────────────────────────────────────────────────────
//
// **Que l'affinage soit juste en droit.** Que `moteur` soit un bon découpage de
// « physiques » est un jugement, pas une propriété du texte. Le test constate
// qu'il est DÉCLARÉ et que rien ne reste sans expression ; il ne dit pas que
// c'est le meilleur découpage.
//
// **L'ordre.** `L. 114` est une phrase, pas un tableau : son ordre est celui de
// la syntaxe française, et le reprendre dans un menu déroulant n'aurait aucun
// sens. La comparaison porte sur des ENSEMBLES.
//
// **Le libellé mot pour mot.** Comme pour `TypeErp`, ce qui se vérifie est la
// FORME — le libellé dit les mots de la valeur —, jamais un gabarit. « Handicap
// moteur » et « Polyhandicap » ne peuvent pas suivre le même patron, et
// exiger un préfixe « Handicap » aurait forcé à écrire « Handicap
// polyhandicap ». Aucune longueur minimale non plus : c'est le plancher de huit
// caractères qui avait fait rougir `Y · Musée` au lot `TypeErp`.

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CORPUS, type ArticleDepouille } from "./corpus";
import {
  FAMILLE_L114,
  HANDICAPS,
  LABEL_HANDICAP,
} from "@/lib/accessibilite/schema";

/** Accents et casse retirés : on compare des mots, pas des graphies. */
function sansAccent(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** L'unique entrée de corpus qui porte la définition légale du handicap. */
function articleL114(): ArticleDepouille {
  const trouves = CORPUS.flatMap((c) =>
    c.articles.filter((a) => a.ref === "L. 114"),
  );
  // Zéro et la garde ne garderait plus rien ; deux, et on ne saurait pas
  // laquelle fait foi.
  expect(
    trouves.length,
    "`L. 114` doit être dépouillé une fois et une seule dans `CORPUS` : c'est " +
      "l'unique article du droit français qui énumère les familles de " +
      "handicap, et toute cette garde en dépend " +
      "(`corpus/accessibilite-handicap.ts`).",
  ).toBe(1);
  return trouves[0];
}

/** Les quatre articles de fond de l'arrêté qui fixe le contenu du registre. */
function articlesArrete2017(): ArticleDepouille[] {
  const corpus = CORPUS.find(
    (c) => c.id === "arrete-2017-04-19-registre-accessibilite",
  );
  expect(
    corpus,
    "Le corpus de l'arrêté du 19 avril 2017 doit être déclaré : c'est lui qui " +
      "porte la preuve que le droit de l'accessibilité ne nomme aucune " +
      "famille de handicap.",
  ).toBeDefined();
  return [...corpus!.articles];
}

/**
 * Les familles que le TEXTE écrit, extraites de son verbatim.
 *
 * `L. 114` est une phrase unique. Son énumération commence après « d'une ou
 * plusieurs fonctions » et court jusqu'au point final : cinq adjectifs séparés
 * par des virgules puis « ou », puis deux syntagmes introduits par « d'un ».
 * On coupe sur ces séparateurs et on retire l'article partitif.
 */
function famillesEcritesParL114(
  verbatim = articleL114().citationCle ?? "",
): string[] {
  const AMORCE = "d'une ou plusieurs fonctions ";
  const debut = verbatim.indexOf(AMORCE);
  expect(
    debut,
    "Le verbatim de `L. 114` doit porter la formule « d'une ou plusieurs " +
      "fonctions », qui ouvre son énumération. Sans elle, le parseur ne sait " +
      "pas où commence la liste — et une garde qui ne lit rien vaut moins que " +
      "pas de garde.",
  ).toBeGreaterThanOrEqual(0);

  return verbatim
    .slice(debut + AMORCE.length)
    .replace(/\.\s*$/, "")
    .split(/,\s*|\s+ou\s+/)
    .map((m) => m.trim().replace(/^d'(?:un|une)\s+/, ""))
    .filter((m) => m.length > 0);
}

/** L'énumération Prisma, lue dans le fichier de schéma. */
function enumPrismaHandicap(): string[] {
  const schema = readFileSync(
    path.join(process.cwd(), "prisma", "schema.prisma"),
    "utf8",
  );
  const bloc = /enum HandicapAccessible \{([^}]*)\}/.exec(schema);
  expect(
    bloc,
    "`enum HandicapAccessible` introuvable dans prisma/schema.prisma",
  ).not.toBeNull();
  return bloc![1]
    .split("\n")
    // Les commentaires de l'enum citent le texte en prose (« d'un
    // polyhandicap ou d'un trouble… ») : les garder ferait entrer des mots
    // dans la liste des valeurs.
    .map((l) => l.split("//")[0].trim())
    .filter((l) => l.length > 0);
}

/** L'écart entre deux listes, dans les deux sens. */
function ecart(
  attendus: readonly string[],
  declares: readonly string[],
): { manquants: string[]; enTrop: string[] } {
  return {
    manquants: attendus.filter((t) => !declares.includes(t)),
    enTrop: declares.filter((t) => !attendus.includes(t)),
  };
}

describe("handicaps — la liste du modèle répond de l'article L. 114", () => {
  it("le verbatim de L. 114 porte bien une énumération, et le parseur la voit", () => {
    // CONTRE-ÉPREUVE DU PRÉDICAT, avant toute comparaison. Un parseur qui ne
    // trouverait jamais rien laisserait les tests suivants comparer deux
    // ensembles vides et passer pour une garantie.
    const lues = famillesEcritesParL114();
    expect(lues.length).toBeGreaterThan(4);
    for (const f of lues) expect(f.length, f).toBeGreaterThan(3);

    // Le parseur suit le TEXTE, et on le prouve en le lui changeant. Sans
    // cette épreuve, un `citationCle` que personne ne lit pourrait devenir de
    // l'ornement sans que rien ne bouge.
    const verbatim = articleL114().citationCle ?? "";
    const ampute = verbatim.replace("cognitives ou ", "");
    expect(famillesEcritesParL114(ampute)).not.toContain("cognitives");
    const gonfle = verbatim.replace(
      "mentales,",
      "mentales, chimériques,",
    );
    expect(famillesEcritesParL114(gonfle)).toContain("chimériques");
  });

  it("chaque famille écrite par le texte a au moins une valeur qui la porte", () => {
    // LE SENS QUI COMPTE LE PLUS : une famille sans expression rend muet
    // quelqu'un. C'est ce sens-là qui a rendu `polyhandicap` et
    // `trouble de santé invalidant`, absents des trois déclarations du modèle.
    const ecrites = famillesEcritesParL114();
    const portees = new Set(Object.values(FAMILLE_L114));
    const sansExpression = ecrites.filter((f) => !portees.has(f));
    expect(
      sansExpression,
      "Ces familles sont écrites par `L. 114` et aucune valeur de " +
        "`HandicapAccessible` ne les porte. Un exploitant adapté à l'une " +
        "d'elles ne peut pas le déclarer, et le registre public qu'il publie " +
        "dit moins que ce que son établissement fait.\n" +
        `MANQUE(NT) : ${sansExpression.join(", ")}\n` +
        "La liste attendue est DÉRIVÉE du verbatim de `L. 114` dépouillé au " +
        "corpus. Elle ne se répare pas en recopiant `HANDICAPS` : il faut " +
        "ajouter une valeur au modèle (migration additive) et lui donner sa " +
        "famille dans `FAMILLE_L114`.",
    ).toEqual([]);
  });

  it("aucune valeur ne se réclame d'un mot que le texte n'écrit pas", () => {
    // Le sens inverse, et il est aussi nécessaire : sans lui, `FAMILLE_L114`
    // se réparerait en inventant un mot, ce qui est exactement la faute que
    // le corpus existe pour empêcher.
    const ecrites = famillesEcritesParL114();
    const inventees = Object.entries(FAMILLE_L114)
      .filter(([, f]) => !ecrites.includes(f))
      .map(([v, f]) => `${v} → « ${f} »`);
    expect(
      inventees,
      "Ces valeurs déclarent une famille que `L. 114` n'écrit pas. La colonne " +
        "de droite de `FAMILLE_L114` porte les mots du TEXTE, pas ceux du " +
        "produit — et elle est relue sur le verbatim du corpus, pas sur une " +
        "autre déclaration.\n" +
        inventees.join("\n") +
        `\nCe que le texte écrit : ${ecrites.join(", ")}.`,
    ).toEqual([]);
  });

  it("les trois déclarations libres du modèle disent la même liste", () => {
    // `HandicapAccessible` est déclarée QUATRE fois, et il a fallu casser la
    // compilation pour s'en apercevoir : l'enum Prisma, `HANDICAPS` (qui
    // alimente aussi le `z.enum` du schéma et les cases du formulaire),
    // `LABEL_HANDICAP`, et une table de pictogrammes privée à la page publique
    // du registre (`app/accessibilite/[slug]/page.tsx`). Chacune avait été
    // recopiée sur la précédente, et les deux membres manquants manquaient aux
    // quatre. C'est là que vit le défaut, pas dans le membre absent.
    //
    // La quatrième n'est pas listée ici, et c'est délibéré : c'est un
    // `Record<HandicapAccessible, string>`, donc le COMPILATEUR la tient
    // exhaustive — c'est même elle qui a fait rougir `tsc` quand les deux
    // valeurs sont entrées. Trois des quatre déclarations n'ont pas cette
    // garantie ; ce sont celles-là que ce test tient.
    const reference = Object.keys(FAMILLE_L114);
    for (const [nom, liste] of [
      ["enum HandicapAccessible (prisma/schema.prisma)", enumPrismaHandicap()],
      ["HANDICAPS (src/lib/accessibilite/schema.ts)", [...HANDICAPS]],
      ["LABEL_HANDICAP", Object.keys(LABEL_HANDICAP)],
    ] as const) {
      const e = ecart(reference, liste);
      expect(
        e,
        `${nom} ne dit pas la même liste que les autres déclarations.\n` +
          (e.manquants.length ? `MANQUE(NT) : ${e.manquants.join(", ")}\n` : "") +
          (e.enTrop.length ? `EN TROP : ${e.enTrop.join(", ")}\n` : "") +
          "`FAMILLE_L114` fait foi ici parce qu'elle est la seule des quatre " +
          "reliée au texte : les deux tests précédents la confrontent au " +
          "verbatim de `L. 114`.",
      ).toEqual({ manquants: [], enTrop: [] });
    }
  });

  it("chaque libellé dit les mots de sa valeur, et pas seulement sa clé", () => {
    // `LABEL_HANDICAP` est un `Record` exhaustif : le compilateur garantit
    // qu'aucune clé ne manque. Ce qu'il ne garantit pas, c'est que la valeur
    // apprenne quelque chose — `moteur: "moteur"` compilerait.
    //
    // LA RÈGLE EST « LE LIBELLÉ DIT LES MOTS DE LA VALEUR », PAS UN GABARIT.
    // Six valeurs prennent la forme « Handicap X » ; `polyhandicap` et
    // `trouble_sante_invalidant` ne le peuvent pas, parce que `L. 114` écrit
    // « d'un polyhandicap », jamais « handicap polyhandicap ». Imposer le
    // préfixe aurait forcé à rallonger le libellé avec un mot que le texte n'a
    // pas — c'est le plancher de huit caractères du lot `TypeErp`, qui avait
    // fait rougir `Y · Musée`, sous une autre forme.
    const muets: string[] = [];
    for (const [cle, libelle] of Object.entries(LABEL_HANDICAP)) {
      const mots = sansAccent(cle).split("_");
      const dit = mots.every((m) => sansAccent(libelle).includes(m));
      if (!dit || libelle.trim().length === 0)
        muets.push(`${cle} → « ${libelle} »`);
    }
    expect(
      muets,
      "Ces libellés ne disent pas les mots de leur valeur. Un dirigeant qui " +
        "cherche sa ligne dans la liste ne saura pas que c'est la sienne — et " +
        "un handicap qu'il ne coche pas est un service que son registre " +
        "public n'annonce pas.\n" +
        muets.join("\n"),
    ).toEqual([]);
  });

  it("le droit de l'accessibilité, lui, ne nomme aucune de ces familles", () => {
    // LE RÉSULTAT NÉGATIF, VÉRIFIÉ PLUTÔT QU'AFFIRMÉ. C'est le texte que le
    // produit cite au dirigeant sur l'écran du registre. S'il portait un jour
    // une nomenclature — une refonte, un arrêté modificatif —, ce test le
    // dirait, et c'est alors LUI qui deviendrait la source plutôt que
    // `L. 114`.
    const verbatims = articlesArrete2017()
      .map((a) => sansAccent(a.citationCle ?? ""))
      .join("\n");

    // Contre-épreuve : le prédicat lit bien le bon texte. L'arrêté parle
    // abondamment des personnes handicapées — il ne les répartit simplement
    // jamais.
    expect(
      verbatims,
      "Les verbatims de l'arrêté du 19 avril 2017 doivent parler des " +
        "personnes handicapées : sans cela, le test ci-dessous serait vert " +
        "parce qu'il lit le mauvais texte, ou rien du tout.",
    ).toContain("personnes handicapees");

    // Les mots cherchés sont DÉRIVÉS des deux côtés : ceux du texte de
    // `L. 114`, et ceux du modèle lui-même. Aucune liste recopiée ici.
    const cherches = [
      ...famillesEcritesParL114(),
      ...Object.keys(FAMILLE_L114).map((k) => k.replace(/_/g, " ")),
    ];
    const trouves = cherches.filter((m) =>
      new RegExp(`\\b${sansAccent(m)}`).test(verbatims),
    );
    expect(
      trouves,
      "L'arrêté du 19 avril 2017 nomme désormais une ou plusieurs familles de " +
        `handicap : ${trouves.join(", ")}.\n` +
        "Ce n'est pas une régression du test, c'est une nouvelle du droit — " +
        "et elle change la source de `HandicapAccessible`. Rouvrir le texte, " +
        "reprendre le verbatim au corpus, et refonder `FAMILLE_L114` sur lui " +
        "plutôt que sur `L. 114` du CASF.",
    ).toEqual([]);
  });
});
