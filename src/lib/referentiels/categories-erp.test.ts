// La nomenclature des catégories d'ERP, tenue à sa source.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE QUE CE FICHIER ÉTABLIT, ET IL FAUT COMMENCER PAR LÀ
// ─────────────────────────────────────────────────────────────────────────────
//
// **La liste était juste.** Cinq catégories au texte, cinq au modèle, aucune
// manquante, aucune en trop — c'est le seul résultat de ce genre parmi les
// trois listes ouvertes le 2026-09-03. Ce n'est pas une raison de ne pas poser
// la garde : `TypeErp` était fausse, `ClasseIgh` l'était aussi, et la seule
// différence entre les trois est qu'on a fini par regarder. Une liste vérifiée
// une fois puis laissée sans garde redevient une liste affirmée dès le
// lendemain.
//
// **La SOURCE, elle, était fausse**, et c'est la trouvaille. Les catégories
// étaient attribuées à l'article `GN 2` de l'arrêté du 25 juin 1980. `GN 2` a
// été ouvert : il traite du « classement des groupements d'établissements ou
// des établissements en plusieurs bâtiments voisins non isolés entre eux » —
// comment additionner les effectifs de plusieurs exploitations, pas quelles
// catégories existent. Le règlement de sécurité EMPLOIE la nomenclature ; il ne
// la pose pas. Elle est au code, article `R. 143-19`.
//
// L'écart importe pour la suite : chercher la liste dans le règlement au lieu
// du code est exactement ce qui a coûté trois classes à `ClasseIgh`, où le même
// mauvais renvoi a produit un vrai défaut.
//
// ─────────────────────────────────────────────────────────────────────────────
// POURQUOI CE N'EST PAS UNE LISTE EXHAUSTIVE RECOPIÉE
// ─────────────────────────────────────────────────────────────────────────────
//
// Écrire `expect(CATEGORIES_ERP).toEqual(["N1", …, "N5"])` serait une copie de
// plus, réparable au copier-coller. La référence est DÉRIVÉE du verbatim de
// R. 143-19 dépouillé au corpus (`corpus/cch-classement-erp-igh.ts`), en lisant
// les rangs que le texte écrit en tête de chacune de ses lignes de catégorie.
//
// La clé du modèle est « N » suivi du rang — `N1` pour la 1re catégorie. Le
// passage du rang à la clé est une règle d'une ligne, pas une table de
// correspondance : une table serait la copie déguisée qu'on cherche à éviter.
//
// ─────────────────────────────────────────────────────────────────────────────
// LES SEUILS COMPTENT AUTANT QUE LES CLÉS
// ─────────────────────────────────────────────────────────────────────────────
//
// `N3` ne dit rien à personne. Ce qu'un dirigeant lit dans le menu déroulant,
// c'est « 3ᵉ catégorie (301 à 700) », et ce sont ces chiffres — eux seuls — qui
// lui permettent de se ranger. Un libellé qui écrirait « 700 à 1500 » sur la
// 2ᵉ catégorie le rangerait dans la mauvaise, et rien ne le lui dirait.
//
// Le test confronte donc les nombres de chaque libellé à ceux que R. 143-19
// écrit sur la même catégorie. La 5ᵉ n'en porte aucun, et c'est le texte qui le
// veut : elle ne se définit pas par une tranche mais par renvoi à R. 143-14 et
// au seuil que le règlement fixe TYPE PAR TYPE. Exiger un chiffre là aurait été
// exiger d'en inventer un.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE QUE LA GARDE NE VÉRIFIE PAS, ET IL FAUT LE DIRE
// ─────────────────────────────────────────────────────────────────────────────
//
// **Que le verbatim soit fidèle.** S'il est faux, la garde valide un faux avec
// application. C'est ce qui le rend différent d'un commentaire : il porte
// `versionEnVigueur`, `luLe`, `lecture` et `modifiePar`, et `corpus.test.ts`
// exige ces champs.
//
// **La règle de CALCUL de l'effectif.** R. 143-19 classe « d'après l'effectif
// du public ET DU PERSONNEL » et fait majorer le public par le personnel qui ne
// dispose pas de dégagements propres ; `src/lib/etablissements/labels.ts`
// affirme au contraire que les seuils « comptent le public admis, jamais les
// salariés ». L'écart est relevé au motif de l'entrée de corpus, PAS tranché
// ici : il porte sur le calcul, pas sur la liste, et le trancher déplacerait la
// frontière 4ᵉ/5ᵉ de dossiers déjà saisis.
//
// **Le classement des GROUPEMENTS.** `GN 2` — la source qu'on croyait — règle
// le cas de plusieurs exploitations non isolées entre elles, qui forment un
// seul ERP dont la catégorie s'obtient en additionnant les effectifs. Le modèle
// ne porte qu'une catégorie par établissement et ne sait pas représenter un
// groupement. Ce n'est pas un défaut de la liste.

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CORPUS, type ArticleDepouille } from "./corpus";
import { CATEGORIES_ERP } from "./types-communs";
import { CATEGORIES_ERP as CATEGORIES_ERP_ZOD } from "@/lib/etablissements/schema";
import { LABEL_CATEGORIE_ERP } from "@/lib/etablissements/labels";

/** L'entrée de corpus qui porte la nomenclature. */
function articleR143_19(): ArticleDepouille {
  const trouves = CORPUS.flatMap((c) =>
    c.articles.filter((a) => a.ref === "CCH R. 143-19"),
  );
  // Zéro entrée et la garde ne garderait plus rien ; deux, et on ne saurait pas
  // laquelle fait foi. Les deux cas doivent crier, pas se rattraper.
  expect(
    trouves.length,
    "`CCH R. 143-19` doit être dépouillé une fois et une seule dans `CORPUS` : " +
      "c'est l'article qui porte la nomenclature des catégories d'ERP, et " +
      "toute cette garde en dépend. Ce n'est PAS `GN 2` de l'arrêté du " +
      "25 juin 1980, qui traite des groupements d'établissements.",
  ).toBe(1);
  return trouves[0];
}

/**
 * Les catégories que le TEXTE écrit, extraites de son verbatim.
 *
 * R. 143-19 pose une ligne par catégorie, ouverte par le tiret d'énumération
 * de Légifrance — collé au mot, « -1re catégorie : au-dessus de 1 500
 * personnes ; ». Les alinéas qui précèdent (règle de calcul, majoration par le
 * personnel) ne portent pas cette forme et ne matchent pas.
 */
function categoriesEcritesParR143_19(
  verbatim = articleR143_19().citationCle ?? "",
): { rang: number; cle: string; definition: string }[] {
  return verbatim
    .split("\n")
    .map((l) => l.trim())
    .flatMap((ligne) => {
      const m = /^-\s*(\d+)(?:re|e) catégorie\s*:\s*(\S.*?)\s*[;.]?$/.exec(ligne);
      // La clé du modèle est « N » + le rang. Règle d'une ligne, pas de table.
      return m
        ? [{ rang: Number(m[1]), cle: `N${m[1]}`, definition: m[2] }]
        : [];
    });
}

/** Les valeurs de l'énumération Prisma, lues dans le fichier de schéma. */
function enumPrismaCategorieErp(): string[] {
  const schema = readFileSync(
    path.join(process.cwd(), "prisma", "schema.prisma"),
    "utf8",
  );
  const bloc = /enum CategorieErp \{([^}]*)\}/.exec(schema);
  expect(
    bloc,
    "`enum CategorieErp` introuvable dans prisma/schema.prisma",
  ).not.toBeNull();
  return bloc![1]
    .split("\n")
    .map((l) => l.split("//")[0].trim())
    .filter((l) => l.length > 0);
}

/** L'écart entre deux listes, dans les deux sens. Une valeur de trop est un défaut. */
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
    `${quoi} ne dit pas la même chose que l'article R. 143-19 du CCH.\n` +
    (e.manquants.length
      ? `MANQUE(NT) : ${e.manquants.join(", ")} — le code les écrit, la ` +
        `déclaration non.\n`
      : "") +
    (e.enTrop.length
      ? `EN TROP : ${e.enTrop.join(", ")} — la déclaration les écrit, le code ` +
        `non.\n`
      : "") +
    `La liste attendue est DÉRIVÉE du verbatim de R. 143-19 dépouillé au corpus ` +
    `(\`corpus/cch-classement-erp-igh.ts\`). Elle ne se répare pas en recopiant ` +
    `une autre déclaration : soit celle-ci s'écarte du texte et se corrige, ` +
    `soit le relevé est faux et il faut rouvrir Légifrance.`
  );
}

/**
 * Les effectifs, en personnes, qu'une ligne de R. 143-19 écrit.
 *
 * Deux précautions. L'espace fine des milliers de Légifrance (« 1 500 ») est
 * refermée avant lecture, sans quoi on lirait 1 et 500. Et les renvois
 * d'article — « l'article R. 143-14 » sur la 5ᵉ catégorie — sont retirés
 * d'abord : ce sont des numéros de texte, pas des effectifs.
 */
function seuilsDuTexte(definition: string): number[] {
  const sansRenvois = definition.replace(/\b[RLD]\.\s*\d+(?:-\d+)*/g, "");
  const sansEspaceFine = sansRenvois.replace(/(\d)[  ](\d{3})\b/g, "$1$2");
  return [
    ...new Set(
      [...sansEspaceFine.matchAll(/\b(\d{3,})\b/g)].map((m) => Number(m[1])),
    ),
  ].sort((a, b) => a - b);
}

/** Les seuils qu'un libellé du produit donne à lire, mêmes règles. */
function seuilsDuLibelle(libelle: string): number[] {
  const sansEspaceFine = libelle.replace(/(\d)[  ](\d{3})\b/g, "$1$2");
  return [
    ...new Set(
      [...sansEspaceFine.matchAll(/\b(\d{3,})\b/g)].map((m) => Number(m[1])),
    ),
  ].sort((a, b) => a - b);
}

describe("catégories d'ERP — la liste du modèle est celle de l'article R. 143-19", () => {
  it("le verbatim de R. 143-19 porte bien une nomenclature, et le parseur la voit", () => {
    // CONTRE-ÉPREUVE DU PRÉDICAT, avant toute comparaison. Un parseur qui ne
    // trouverait jamais rien laisserait les tests suivants comparer deux listes
    // vides et passer pour une garantie.
    const lues = categoriesEcritesParR143_19();
    expect(lues.length).toBeGreaterThan(3);
    for (const c of lues) expect(c.definition.length, c.cle).toBeGreaterThan(3);
    // Les rangs se suivent depuis 1 : une nomenclature par tranches, pas une
    // collection de lignes qui se ressemblent.
    expect(lues.map((c) => c.rang)).toEqual(lues.map((_, i) => i + 1));

    // Le parseur suit le TEXTE, et on le prouve en le lui changeant. Sans cette
    // épreuve, un `citationCle` que personne ne lit deviendrait de l'ornement.
    const ampute = (articleR143_19().citationCle ?? "").replace(
      /^-4e catégorie.*\n/m,
      "",
    );
    expect(categoriesEcritesParR143_19(ampute).map((c) => c.cle)).not.toContain(
      "N4",
    );
    const gonfle = (articleR143_19().citationCle ?? "").replace(
      "Les catégories sont les suivantes :\n",
      "Les catégories sont les suivantes :\n-6e catégorie : catégorie inventée de toutes pièces ;\n",
    );
    expect(categoriesEcritesParR143_19(gonfle).map((c) => c.cle)).toContain("N6");
  });

  it("l'énumération Prisma `CategorieErp` porte exactement les catégories du texte", () => {
    // La déclaration qui contraint la base : une valeur absente de
    // l'énumération PostgreSQL rend la donnée insaisissable quoi qu'en dise le
    // TypeScript.
    const e = ecart(
      categoriesEcritesParR143_19().map((c) => c.cle),
      enumPrismaCategorieErp(),
    );
    expect(
      e,
      messageEcart("`enum CategorieErp` (prisma/schema.prisma)", e),
    ).toEqual({ manquants: [], enTrop: [] });
  });

  it("`CATEGORIES_ERP` (référentiel) porte exactement les catégories du texte", () => {
    const e = ecart(
      categoriesEcritesParR143_19().map((c) => c.cle),
      CATEGORIES_ERP,
    );
    expect(
      e,
      messageEcart("`CATEGORIES_ERP` (src/lib/referentiels/types-communs.ts)", e),
    ).toEqual({ manquants: [], enTrop: [] });
  });

  it("`CATEGORIES_ERP` (schéma Zod) porte exactement les catégories du texte", () => {
    // Troisième copie littérale, et celle par laquelle une catégorie absente
    // devient INSAISISSABLE : c'est elle qui valide les formulaires et remplit
    // les menus déroulants.
    const e = ecart(
      categoriesEcritesParR143_19().map((c) => c.cle),
      CATEGORIES_ERP_ZOD,
    );
    expect(
      e,
      messageEcart("`CATEGORIES_ERP` (src/lib/etablissements/schema.ts)", e),
    ).toEqual({ manquants: [], enTrop: [] });
  });

  it("chaque catégorie a un libellé, et ses seuils sont ceux du texte", () => {
    // TROIS AUTRES DÉCLARATIONS EXISTENT — `LABEL_CATEGORIE_ERP`,
    // `LIBELLE_CATEGORIE_ERP` (moteur) et `LIBELLE_CATEGORIE` (couverture) —,
    // et toutes trois sont des `Record<CategorieErp, string>` : le compilateur
    // garantit déjà qu'aucune clé n'y manque, et `npx tsc --noEmit` est la
    // garde qui le vérifie. Six déclarations en tout, dont trois tenues par le
    // type et trois par ce fichier.
    //
    // CE QUE LE COMPILATEUR NE GARANTIT PAS, C'EST QUE LA VALEUR SOIT VRAIE.
    // `N3: "3ᵉ catégorie (700 à 1500)"` compilerait, et rangerait un dirigeant
    // de 800 personnes en 3ᵉ catégorie alors que le texte l'y refuse. Les
    // seuils sont donc confrontés au verbatim, chiffre pour chiffre.
    const e = ecart(
      categoriesEcritesParR143_19().map((c) => c.cle),
      Object.keys(LABEL_CATEGORIE_ERP),
    );
    expect(e, messageEcart("`LABEL_CATEGORIE_ERP`", e)).toEqual({
      manquants: [],
      enTrop: [],
    });

    const fautifs: string[] = [];
    for (const categorie of categoriesEcritesParR143_19()) {
      const libelle =
        LABEL_CATEGORIE_ERP[
          categorie.cle as keyof typeof LABEL_CATEGORIE_ERP
        ] ?? "";
      // La FORME d'abord : le rang, puis une désignation. Pas de longueur
      // minimale — un plancher forcerait à rallonger un libellé que le texte
      // fait court, et c'est la faute que le lot `TypeErp` a rencontrée sur
      // « Y · Musée ».
      if (!new RegExp(`^${categorie.rang}[ᵉʳ]`).test(libelle)) {
        fautifs.push(
          `${categorie.cle} → « ${libelle} » ne commence pas par son rang`,
        );
        continue;
      }
      // Puis les seuils, dans les DEUX SENS. Un seuil oublié empêche de se
      // ranger ; un seuil que le texte n'écrit pas sur cette catégorie y range
      // quelqu'un qui n'en relève pas — et la 5ᵉ, que le texte définit sans
      // aucun chiffre, ne doit pas s'en voir attribuer un.
      const attendus = seuilsDuTexte(categorie.definition);
      const affiches = seuilsDuLibelle(libelle);
      const oublies = attendus.filter((s) => !affiches.includes(s));
      const inventes = affiches.filter((s) => !attendus.includes(s));
      if (oublies.length > 0 || inventes.length > 0) {
        fautifs.push(
          `${categorie.cle} → « ${libelle} » : ` +
            (oublies.length ? `oublie ${oublies.join(", ")} ` : "") +
            (inventes.length ? `invente ${inventes.join(", ")} ` : "") +
            `— le texte écrit « ${categorie.definition} »`,
        );
      }
    }
    expect(
      fautifs,
      "Ces libellés ne disent pas ce que R. 143-19 écrit de leur catégorie. " +
        "Un dirigeant se range d'après le chiffre affiché, pas d'après la " +
        "lettre : un seuil faux le met dans la mauvaise catégorie, et rien " +
        "dans le produit ne le lui dira.\n" +
        fautifs.join("\n"),
    ).toEqual([]);
  });
});
