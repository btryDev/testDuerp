// La nomenclature des types d'ERP, tenue à sa source.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE QUE CE FICHIER EMPÊCHE
// ─────────────────────────────────────────────────────────────────────────────
//
// L'énumération `TypeErp` a vécu deux ans avec vingt et un types là où
// l'article GN 1 § 1 de l'arrêté du 25 juin 1980 en compte vingt-deux. Le type
// J — structures d'accueil pour personnes âgées et personnes handicapées — n'y
// était pas, si bien qu'un EHPAD ouvrait la liste et n'y trouvait pas la
// sienne.
//
// **Ce n'était pas une coquille.** L'ADR-004 est le seul endroit où cette
// liste ait jamais été écrite, et elle l'a été ainsi : « enum M, N, U, R, L,
// O, S, T, V, W, X, Y, PA, CTS, SG, PS, REF, GA, OA, EF **(~20 valeurs)** ».
// Le tilde dit tout. L'auteur savait sa liste approximative ; personne ne l'a
// ensuite confrontée à la nomenclature. Elle s'est recopiée quatre fois —
// l'enum Prisma, `TYPES_ERP`, `TYPE_ERP`, `LABEL_TYPE_ERP` —, chacune d'après
// la précédente. Quatre copies concordantes, zéro lecture. Une liste complète
// par affirmation, jamais par construction.
//
// Corriger la liste sans poser cette garde n'aurait rien réparé : la prochaine
// aurait recommencé.
//
// ─────────────────────────────────────────────────────────────────────────────
// POURQUOI CE N'EST PAS UNE LISTE EXHAUSTIVE RECOPIÉE
// ─────────────────────────────────────────────────────────────────────────────
//
// Ce dépôt a une règle explicite contre les listes exhaustives en test : une
// liste qu'on répare en la recopiant cesse de vérifier quoi que ce soit. Écrire
// ici `expect(TYPES_ERP).toEqual(["M", "N", …, "J", …])` serait exactement ça —
// une CINQUIÈME copie, réparable au copier-coller depuis la quatrième, et
// muette sur ce que le texte dit.
//
// La référence est donc **dérivée** : elle est extraite du verbatim de GN 1 § 1
// dépouillé au corpus (`corpus/arrete-1980-livre-1.ts`), en lisant les lettres
// que le texte écrit en tête de chacune de ses lignes. Un test qui rougit ici
// ne se répare que de deux façons — corriger la déclaration qui s'écarte, ou
// rouvrir Légifrance et corriger le relevé. Réaligner deux copies l'une sur
// l'autre ne le fait pas taire.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE QUE LA GARDE NE VÉRIFIE PAS, ET IL FAUT LE DIRE
// ─────────────────────────────────────────────────────────────────────────────
//
// **Que le verbatim soit fidèle.** Il est le point d'appui : s'il est faux, la
// garde valide un faux avec application. C'est ce qui le rend différent d'un
// commentaire — il porte `versionEnVigueur`, `luLe`, `lecture` et `modifiePar`,
// et `corpus.test.ts` exige ces champs. Deux lectures indépendantes de GN 1 le
// 2026-09-03 ont rendu la même liste, lettre pour lettre.
//
// **L'ordre.** Les listes du produit ne sont pas dans l'ordre du texte : GN 1
// ouvre par J, le produit met en avant les types des secteurs cibles. La
// comparaison porte donc sur des ENSEMBLES. Ce qui est repris du texte, et que
// les commentaires des quatre déclarations tiennent, est son découpage en deux
// groupes — a) bâtiment, b) spéciaux. Un ordre est un choix d'affichage ; le
// déguiser en lecture serait pire que de ne rien vérifier.
//
// **Le libellé.** Le test en vérifie la FORME — la lettre, un séparateur, une
// désignation non vide —, jamais les mots. Un libellé de menu déroulant est une
// reformulation, et l'exiger identique au texte reviendrait à interdire de
// rendre la nomenclature lisible à un dirigeant. Une longueur minimale serait
// pire encore : GN 1 § 1 écrit « Y Musées » et « GA Gares », deux mots seuls,
// et un plancher aurait forcé à rallonger la nomenclature avec des mots qu'elle
// n'a pas.

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CORPUS, type ArticleDepouille } from "./corpus";
import { TYPES_ERP } from "./types-communs";
import { TYPE_ERP } from "@/lib/etablissements/schema";
import { LABEL_TYPE_ERP } from "@/lib/etablissements/labels";

/** L'entrée de corpus qui porte la nomenclature. */
function articleGn1(): ArticleDepouille {
  const trouves = CORPUS.flatMap((c) =>
    c.articles.filter((a) => a.ref === "GN 1"),
  );
  // Zéro entrée et la garde ne garderait plus rien ; deux, et on ne saurait
  // pas laquelle fait foi. Les deux cas doivent crier, pas se rattraper.
  expect(
    trouves.length,
    "GN 1 doit être dépouillé une fois et une seule dans `CORPUS` : c'est " +
      "l'article qui porte la nomenclature des types d'ERP, et toute cette " +
      "garde en dépend.",
  ).toBe(1);
  return trouves[0];
}

/**
 * Les types que le TEXTE écrit, extraits de son verbatim.
 *
 * Le § 1 de GN 1 pose une ligne par type, ouverte par la lettre : « J
 * Structures d'accueil… », « CTS Chapiteaux, tentes et structures ». Les
 * en-têtes de groupe (« a) Etablissements installés dans un bâtiment : »)
 * commencent par une minuscule et ne matchent pas.
 *
 * La lecture s'arrête au § 2 — qui classe en GROUPES et non en types — pour
 * qu'aucune énumération voisine ne puisse entrer par accident.
 */
function typesEcritsParGn1(verbatim = articleGn1().citationCle ?? ""): {
  lettre: string;
  libelle: string;
}[] {
  const bornes = verbatim.split("§ 2.");
  expect(
    bornes.length,
    "Le verbatim de GN 1 doit porter son § 2 : c'est lui qui borne la lecture " +
      "du § 1. Sans borne, le parseur lirait des énumérations qui ne sont pas " +
      "des types.",
  ).toBeGreaterThan(1);

  return bornes[0]
    .split("\n")
    .map((l) => l.trim())
    .flatMap((ligne) => {
      const m = /^([A-Z]{1,3}) (\S.*?)\s*[;.]?$/.exec(ligne);
      return m ? [{ lettre: m[1], libelle: m[2] }] : [];
    });
}

/** Les valeurs de l'enum Prisma, lues dans le fichier de schéma. */
function enumPrismaTypeErp(): string[] {
  const schema = readFileSync(
    path.join(process.cwd(), "prisma", "schema.prisma"),
    "utf8",
  );
  const bloc = /enum TypeErp \{([^}]*)\}/.exec(schema);
  expect(bloc, "`enum TypeErp` introuvable dans prisma/schema.prisma").not.toBeNull();
  return bloc![1]
    .split("\n")
    // Les commentaires de l'enum portent des lettres de type en prose
    // (« J ferme le groupe a) ») : les garder ferait entrer du texte dans la
    // liste. On coupe donc au `//` avant de lire la valeur.
    .map((l) => l.split("//")[0].trim())
    .filter((l) => l.length > 0);
}

/**
 * L'écart entre deux listes, dans les deux sens, rendu lisible.
 *
 * Un type de TROP est un défaut au même titre qu'un type manquant : il ouvre
 * au dirigeant une case que le règlement ne connaît pas, et la donnée saisie
 * n'a alors aucun sens réglementaire. Les deux sens sont donc rendus ensemble.
 */
function ecart(
  attendus: readonly string[],
  declares: readonly string[],
): { manquants: string[]; enTrop: string[] } {
  return {
    manquants: attendus.filter((t) => !declares.includes(t)),
    enTrop: declares.filter((t) => !attendus.includes(t)),
  };
}

function messageEcart(quoi: string, e: ReturnType<typeof ecart>): string {
  return (
    `${quoi} ne dit pas la même chose que l'article GN 1 § 1.\n` +
    (e.manquants.length
      ? `MANQUE(NT) : ${e.manquants.join(", ")} — le texte les écrit, la ` +
        `déclaration non. Un exploitant de ce type ne peut pas se déclarer ` +
        `pour ce qu'il est.\n`
      : "") +
    (e.enTrop.length
      ? `EN TROP : ${e.enTrop.join(", ")} — la déclaration les écrit, le texte ` +
        `non. Une valeur que le règlement ne connaît pas.\n`
      : "") +
    `La liste attendue est DÉRIVÉE du verbatim de GN 1 dépouillé au corpus ` +
    `(\`corpus/arrete-1980-livre-1.ts\`). Elle ne se répare pas en recopiant ` +
    `une autre déclaration : soit celle-ci s'écarte du texte et se corrige, ` +
    `soit le relevé est faux et il faut rouvrir Légifrance.`
  );
}

describe("types d'ERP — la liste du modèle est celle de l'article GN 1", () => {
  it("le verbatim de GN 1 porte bien une nomenclature, et le parseur la voit", () => {
    // CONTRE-ÉPREUVE DU PRÉDICAT, avant toute comparaison. Un parseur qui ne
    // trouverait jamais rien laisserait les quatre tests suivants comparer
    // deux listes vides et passer pour une garantie. Même raison d'être que le
    // « corpus témoin » de `corpus.test.ts`.
    const lus = typesEcritsParGn1();
    expect(lus.length).toBeGreaterThan(15);
    // Chaque entrée porte un libellé, pas une lettre nue : c'est ce qui
    // distingue une ligne de nomenclature d'un fragment de phrase.
    for (const t of lus) expect(t.libelle.length, t.lettre).toBeGreaterThan(3);

    // Le parseur suit le TEXTE, et on le prouve en le lui changeant. Une
    // ligne retirée du verbatim doit disparaître de la liste dérivée ; une
    // ligne ajoutée doit y entrer. Sans cette épreuve, un `citationCle` que
    // personne ne lit pourrait devenir de l'ornement sans que rien ne bouge.
    const ampute = (articleGn1().citationCle ?? "").replace(
      /^R Etablissements d'éveil.*\n/m,
      "",
    );
    expect(typesEcritsParGn1(ampute).map((t) => t.lettre)).not.toContain("R");
    const gonfle = (articleGn1().citationCle ?? "").replace(
      "b) Etablissements spéciaux :\n",
      "b) Etablissements spéciaux :\nQ Type inventé de toutes pièces ;\n",
    );
    expect(typesEcritsParGn1(gonfle).map((t) => t.lettre)).toContain("Q");
  });

  it("l'énumération Prisma `TypeErp` porte exactement les types du texte", () => {
    // La déclaration qui compte le plus : c'est elle qui contraint la base, et
    // une valeur absente de l'enum PostgreSQL rend la donnée insaisissable
    // quoi qu'en dise le TypeScript.
    const e = ecart(
      typesEcritsParGn1().map((t) => t.lettre),
      enumPrismaTypeErp(),
    );
    expect(e, messageEcart("`enum TypeErp` (prisma/schema.prisma)", e)).toEqual({
      manquants: [],
      enTrop: [],
    });
  });

  it("`TYPES_ERP` (référentiel) porte exactement les types du texte", () => {
    const e = ecart(typesEcritsParGn1().map((t) => t.lettre), TYPES_ERP);
    expect(
      e,
      messageEcart("`TYPES_ERP` (src/lib/referentiels/types-communs.ts)", e),
    ).toEqual({ manquants: [], enTrop: [] });
  });

  it("`TYPE_ERP` (schéma Zod) porte exactement les types du texte", () => {
    // Troisième copie, et celle par laquelle un type absent devient
    // INSAISISSABLE même s'il existe partout ailleurs : c'est elle qui valide
    // les formulaires et qui remplit les menus déroulants.
    const e = ecart(typesEcritsParGn1().map((t) => t.lettre), TYPE_ERP);
    expect(
      e,
      messageEcart("`TYPE_ERP` (src/lib/etablissements/schema.ts)", e),
    ).toEqual({ manquants: [], enTrop: [] });
  });

  it("chaque type a un libellé, et le libellé dit plus que la lettre", () => {
    // `LABEL_TYPE_ERP` est un `Record` exhaustif : le compilateur garantit
    // déjà qu'aucune clé ne manque. Ce qu'il ne garantit pas, c'est que la
    // valeur apprenne quelque chose. « J » tout court compilerait, et
    // n'aiderait personne à savoir si sa maison de retraite est un type J.
    const e = ecart(
      typesEcritsParGn1().map((t) => t.lettre),
      Object.keys(LABEL_TYPE_ERP),
    );
    expect(e, messageEcart("`LABEL_TYPE_ERP`", e)).toEqual({
      manquants: [],
      enTrop: [],
    });

    // LA RÈGLE EST « LA LETTRE PUIS UNE DÉSIGNATION », PAS UNE LONGUEUR
    // MINIMALE. La première écriture de ce test posait un plancher de huit
    // caractères ; il a fait rougir `Y · Musée` et `GA · Gare`, qui sont
    // pourtant les libellés du texte lui-même — GN 1 § 1 écrit « Y Musées » et
    // « GA Gares », deux mots seuls. Un plancher aurait forcé à rallonger la
    // nomenclature avec des mots qu'elle n'a pas, c'est-à-dire à réparer le
    // libellé pour faire taire le test. Ce qui se vérifie ici est donc la
    // FORME, qui est la seule chose que le texte impose : une lettre, un
    // séparateur, et une désignation non vide. C'est exactement le défaut à
    // empêcher — `J: "J"` compilerait et n'apprendrait rien à personne.
    const muets: string[] = [];
    for (const [lettre, libelle] of Object.entries(LABEL_TYPE_ERP)) {
      const attendu = new RegExp(`^${lettre} · \\S`);
      if (!attendu.test(libelle)) muets.push(`${lettre} → « ${libelle} »`);
    }
    expect(
      muets,
      "Ces libellés ne sont pas de la forme « lettre · désignation ». Un " +
        "dirigeant qui cherche sa ligne dans le menu déroulant ne saura pas " +
        "que c'est la sienne : écrivez ce que GN 1 § 1 dit du type, après la " +
        "lettre et le séparateur.\n" +
        muets.join("\n"),
    ).toEqual([]);
  });

  it("les deux groupes du texte se retrouvent dans le modèle", () => {
    // GN 1 § 1 ne pose pas une liste plate : il la coupe en a) établissements
    // installés dans un bâtiment et b) établissements spéciaux. Ce découpage
    // est le SEUL trait d'ordre que les listes du produit reprennent — leur
    // ordre interne, lui, met en avant les secteurs cibles et ne prétend rien
    // du texte. Le vérifier empêche qu'un type spécial se glisse au milieu des
    // types de bâtiment (ou l'inverse) lors d'un prochain ajout.
    const verbatim = articleGn1().citationCle ?? "";
    const [avant, apres] = verbatim.split("b) Etablissements spéciaux :");
    expect(
      apres,
      "Le verbatim de GN 1 doit porter ses deux groupes, a) et b).",
    ).toBeDefined();
    const batiment = typesEcritsParGn1(avant + "§ 2.").map((t) => t.lettre);
    const speciaux = typesEcritsParGn1(apres + "§ 2.").map((t) => t.lettre);
    expect(batiment.length + speciaux.length).toBe(
      typesEcritsParGn1().length,
    );

    // Dans chaque liste du produit, tous les types de bâtiment précèdent tous
    // les types spéciaux.
    for (const [nom, liste] of [
      ["TYPES_ERP", [...TYPES_ERP]],
      ["TYPE_ERP", [...TYPE_ERP]],
      ["enum TypeErp", enumPrismaTypeErp()],
    ] as const) {
      const dernierBatiment = Math.max(
        ...liste.map((t, i) => (batiment.includes(t) ? i : -1)),
      );
      const premierSpecial = Math.min(
        ...liste.map((t, i) => (speciaux.includes(t) ? i : Infinity)),
      );
      expect(
        dernierBatiment < premierSpecial,
        `${nom} mélange les deux groupes de GN 1 § 1 : les établissements ` +
          `installés dans un bâtiment (${batiment.join(", ")}) doivent tous ` +
          `précéder les établissements spéciaux (${speciaux.join(", ")}). ` +
          `L'ordre INTERNE de chaque groupe est libre — c'est un choix ` +
          `d'affichage —, la frontière entre les deux ne l'est pas.`,
      ).toBe(true);
    }
  });
});
