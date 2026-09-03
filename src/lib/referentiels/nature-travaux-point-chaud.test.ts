// Les natures de travaux par point chaud — une liste sans nomenclature, et le
// test qui dit exactement ça.
//
// ─────────────────────────────────────────────────────────────────────────────
// LE VERDICT, ET C'EST LE RÉSULTAT DU LOT
// ─────────────────────────────────────────────────────────────────────────────
//
// Le § 9 de `docs/chantiers-ouverts.md` range `NatureTravauxPointChaud` parmi
// les sept listes qui « transcrivent une nomenclature écrite dans un texte », et
// lui donne pour source « INRS ED 6030 ».
//
// **Cette liste n'a aucune source normative, et sa source documentaire ne porte
// pas de nomenclature non plus.** Les deux moitiés comptent :
//
// 1. **ED 6030 n'est pas opposable.** C'est une brochure de douze pages révisée
//    en août 2019, éditée par une association loi 1901. L'ADR-032 nomme l'INRS
//    dans la liste des référentiels privés que ce dépôt « s'interdit par
//    construction de traiter comme des sources opposables », aux côtés du CACES,
//    des recommandations CNAM, de l'APSAD et des normes NF.
//
// 2. **ED 6030 ne porte pas de liste fermée.** Ouverte le 2026-09-03, sa
//    définition (p. 3) est ouverte par construction : deux catégories suivies de
//    points de suspension — « (découpage, meulage, ébarbage…) » —, puis un
//    fourre-tout explicite, « de manière générale, cette désignation comprend
//    tous les travaux générateurs d'étincelles ou de surfaces chaudes ». Et sa
//    seule liste cochable, dans le formulaire modèle, en compte QUATRE, avec
//    deux lignes vides imprimées pour en ajouter.
//
//    Une liste que son auteur laisse ouverte n'est pas une nomenclature. Onze
//    valeurs face à quatre items et deux lignes vides : il n'y a rien à
//    comparer, dans aucun des deux sens.
//
// **Le droit nomme un travail par point chaud, et un seul** : l'arrêté du
// 19 mars 1993, art. 1er, 21° — « Travaux de soudage oxyacétylénique exigeant le
// recours à un permis de feu ». Et il le nomme pour autre chose : pour dire
// qu'un plan de PRÉVENTION doit être écrit, pas pour énumérer les points chauds.
// Il suppose le permis de feu, il ne le fonde pas.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE QU'UN TEST PEUT ENCORE FAIRE, ET CE QU'IL AURAIT ÉTÉ MALHONNÊTE DE FAIRE
// ─────────────────────────────────────────────────────────────────────────────
//
// Il aurait été facile d'écrire ici `expect(NATURES_TRAVAUX).toEqual([...onze
// valeurs])`. Ce serait une quatrième copie de la liste, réparable au
// copier-coller, et surtout : elle feindrait de vérifier une conformité à une
// nomenclature qui n'existe pas. Le brief le disait — « ne lui invente pas de
// source ».
//
// Trois choses se vérifient vraiment, et ce fichier ne prétend pas à plus :
//
// - **La borne basse est de droit.** Le seul procédé qu'un texte opposable
//   nomme doit rester déclarable. Il est extrait du verbatim du 21°, pas
//   recopié — et il se reconnaît sans table de correspondance, la valeur du
//   modèle étant les mots du texte à l'underscore près.
// - **La borne haute n'est pas de droit, et le dépôt le sait par écrit.**
//   ED 6030 est au corpus, classé `sans_objet`, et aucune obligation du
//   référentiel ne se fonde sur une source INRS. C'est la garde de l'ADR-032,
//   posée sur la couche voisine plutôt que sur la liste elle-même.
// - **Les trois déclarations disent la même chose.** C'est là que vivait le
//   défaut de `TypeErp` : quatre copies concordantes, zéro lecture.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE QUE CE FICHIER NE VÉRIFIE PAS, ET IL FAUT LE DIRE
// ─────────────────────────────────────────────────────────────────────────────
//
// **Que les dix autres valeurs soient justes.** Elles ne peuvent pas l'être ni
// fausses : aucune source ne les arbitre. `decoupe_plasma` et `brasage` sont des
// procédés réels que la brochure ne nomme pas ; les ajouter ou les retirer est
// une décision de produit, prise sur l'usage, et aucun test ne la tranchera.
//
// **Que la liste soit complète.** Elle ne le sera jamais : ED 6030 dit
// « tous les travaux générateurs d'étincelles ou de surfaces chaudes ». C'est
// `autre` qui porte cette ouverture, et c'est pour cela qu'elle doit rester.
//
// **UN DÉFAUT RELEVÉ AU PASSAGE, QUE LE TEST NE CORRIGE PAS.** `chalumeau` est
// une valeur de `NatureTravauxPointChaud` ; dans ED 6030, « chalumeau » est un
// MATÉRIEL, rubrique voisine du formulaire, pas un type de travaux. Le modèle a
// fusionné les deux colonnes. Ce n'est pas faux au sens où le dirigeant s'y
// retrouve, et le corriger changerait une donnée existante pour un gain nul ;
// mais cela interdit de présenter la liste comme le reflet du document, ce que
// le motif du corpus dit désormais.

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CORPUS, type ArticleDepouille } from "./corpus";
import { obligationsConformite } from "./conformite";
import { LABEL_NATURE, NATURES_TRAVAUX } from "@/lib/permis-feu/schema";

/** Accents, casse et ponctuation de liaison retirés. */
function sansAccent(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function article(ref: string): ArticleDepouille {
  const trouves = CORPUS.flatMap((c) => c.articles.filter((a) => a.ref === ref));
  expect(
    trouves.length,
    `\`${ref}\` doit être dépouillé une fois et une seule dans \`CORPUS\`.`,
  ).toBe(1);
  return trouves[0];
}

/**
 * Le seul travail par point chaud qu'un texte opposable nomme.
 *
 * Extrait du verbatim de l'arrêté du 19 mars 1993, art. 1er : l'unique point de
 * la liste des vingt et un qui mentionne le permis de feu. On ne le cherche pas
 * par son numéro — un point renuméroté ferait alors passer le test à côté —
 * mais par la locution qui le caractérise.
 */
function pointNommantLePermisDeFeu(
  verbatim = article("Arrêté 1993-03-19 art. 1er").citationCle ?? "",
): string[] {
  return verbatim
    .split(/\s(?=\d{1,2}\.\s)/)
    .map((p) => p.trim())
    .filter((p) => /permis de feu/i.test(p));
}

/** L'énumération Prisma, lue dans le fichier de schéma. */
function enumPrismaNature(): string[] {
  const schema = readFileSync(
    path.join(process.cwd(), "prisma", "schema.prisma"),
    "utf8",
  );
  const bloc = /enum NatureTravauxPointChaud \{([^}]*)\}/.exec(schema);
  expect(
    bloc,
    "`enum NatureTravauxPointChaud` introuvable dans prisma/schema.prisma",
  ).not.toBeNull();
  return bloc![1]
    .split("\n")
    .map((l) => l.split("//")[0].trim())
    .filter((l) => l.length > 0);
}

function ecart(
  attendus: readonly string[],
  declares: readonly string[],
): { manquants: string[]; enTrop: string[] } {
  return {
    manquants: attendus.filter((t) => !declares.includes(t)),
    enTrop: declares.filter((t) => !attendus.includes(t)),
  };
}

describe("travaux par point chaud — une convention, et sa seule borne de droit", () => {
  it("le texte ne nomme qu'un point chaud, et le parseur le trouve", () => {
    // CONTRE-ÉPREUVE DU PRÉDICAT. Un parseur qui ne trouverait jamais rien
    // laisserait le test suivant chercher dans un ensemble vide et passer pour
    // une garantie.
    const points = pointNommantLePermisDeFeu();
    expect(
      points.length,
      "L'article 1er de l'arrêté du 19 mars 1993 doit porter exactement un " +
        "point mentionnant le permis de feu. S'il en porte plusieurs, le " +
        "droit nomme désormais plus d'un travail par point chaud — c'est une " +
        "nouvelle, et la borne basse de la liste s'élargit d'autant.\n" +
        points.join("\n"),
    ).toBe(1);
    expect(points[0]).toMatch(/soudage/i);

    // Le parseur suit le TEXTE, et on le prouve en le lui changeant.
    const verbatim = article("Arrêté 1993-03-19 art. 1er").citationCle ?? "";
    const ampute = verbatim.replace(
      /21\. Travaux de soudage oxyacétylénique[^.]*\./,
      "",
    );
    expect(pointNommantLePermisDeFeu(ampute)).toEqual([]);
    const gonfle = verbatim.replace(
      "17. Travaux de démolition.",
      "17. Travaux de démolition. 17 bis. Travaux de brasage exigeant le recours à un permis de feu.",
    );
    expect(pointNommantLePermisDeFeu(gonfle).length).toBeGreaterThan(1);
  });

  it("le procédé que le droit nomme reste déclarable", () => {
    // LA BORNE BASSE, ET LA SEULE CHOSE QUE LE DROIT IMPOSE À CETTE LISTE.
    // Aucune table de correspondance n'est nécessaire : la valeur du modèle
    // EST les mots du texte, à l'underscore près. Si quelqu'un renommait
    // `soudage_oxyacetylenique`, ce test rougirait — et c'est bien ce qu'on
    // veut, la valeur n'étant pas libre.
    const point = sansAccent(pointNommantLePermisDeFeu()[0]);
    const portent = NATURES_TRAVAUX.filter((n) =>
      point.includes(n.replace(/_/g, " ")),
    );
    expect(
      portent,
      "Aucune valeur de `NatureTravauxPointChaud` ne dit le seul travail par " +
        "point chaud qu'un texte opposable nomme :\n" +
        `« ${pointNommantLePermisDeFeu()[0]} »\n` +
        "(arrêté du 19 mars 1993, art. 1er, 21°). Un donneur d'ordre qui fait " +
        "faire ce travail-là doit pouvoir le déclarer : c'est celui pour " +
        "lequel un écrit est dû au titre du plan de prévention, quelle que " +
        "soit la durée de l'opération.\n" +
        "La valeur attendue est DÉRIVÉE du verbatim dépouillé au corpus. Elle " +
        "ne se répare pas en recopiant une autre déclaration.",
    ).toEqual(["soudage_oxyacetylenique"]);
  });

  it("la brochure qui inspire le reste de la liste ne porte pas de nomenclature", () => {
    // LE VERDICT, VÉRIFIÉ PLUTÔT QU'AFFIRMÉ. Si l'INRS publiait un jour une
    // liste fermée, ces marqueurs disparaîtraient de son verbatim et ce test
    // rougirait — auquel cas il y aurait enfin quelque chose à comparer, et ce
    // fichier devrait être réécrit sur le patron de `types-erp.test.ts`.
    const ed6030 = article("INRS ED 6030");
    const verbatim = ed6030.citationCle ?? "";

    const marqueursDOuverture = [
      // Les points de suspension à l'intérieur de l'énumération.
      "…)",
      // Le fourre-tout explicite qui suit la définition.
      "tous les travaux générateurs",
      // Les lignes laissées vides sous la liste cochable du formulaire.
      "lignes laissées vides",
    ].filter((m) => !verbatim.includes(m));
    expect(
      marqueursDOuverture,
      "Le verbatim d'ED 6030 ne porte plus les marques qui font de sa liste " +
        "une liste OUVERTE : " +
        `${marqueursDOuverture.join(", ")}.\n` +
        "Tout ce fichier repose là-dessus. Si la brochure a été refondue avec " +
        "une nomenclature fermée, il faut la relever et écrire ici la " +
        "comparaison dans les deux sens — en gardant à l'esprit qu'une " +
        "brochure INRS reste non opposable (ADR-032), et que la comparaison " +
        "ne vaudrait alors que comme cohérence documentaire.",
    ).toEqual([]);

    expect(
      ed6030.statut,
      "ED 6030 doit rester classée `sans_objet` au corpus : une brochure de " +
        "recommandations n'établit aucune obligation. La classer `retenu` " +
        "reviendrait à dire qu'une obligation du référentiel s'y appuie, ce " +
        "que l'ADR-032 interdit.",
    ).toBe("sans_objet");
  });

  it("aucune obligation du référentiel ne se fonde sur une source INRS", () => {
    // LA GARDE DE L'ADR-032, POSÉE SUR LA COUCHE VOISINE. La liste elle-même
    // ne peut pas être tenue à une source ; ce qui peut l'être, c'est
    // l'interdiction qu'une source INRS fonde une échéance datée. Le dépôt
    // s'est déjà fait avoir une fois — la règle APSAD R43 apparaissait dans
    // des pastilles réglementaires sans qualification.
    //
    // Une référence INRS reste permise « en appui » : `ED 6127` est citée par
    // l'habilitation électrique, dont le fondement est `R. 4544-9`. Ce qui est
    // vérifié est donc que toute référence INRS du référentiel pointe un
    // article de corpus classé `sans_objet` — c'est-à-dire un document dont il
    // est ÉCRIT qu'il n'établit rien.
    const fautives: string[] = [];
    for (const o of obligationsConformite) {
      for (const r of o.referencesLegales) {
        if (r.source !== "INRS") continue;
        const cible = CORPUS.flatMap((c) =>
          c.articles.filter((a) => a.ref === r.article),
        );
        if (cible.length === 0 || cible.some((a) => a.statut !== "sans_objet"))
          fautives.push(`${o.id} → ${r.reference} (article « ${r.article} »)`);
      }
    }
    expect(
      fautives,
      "Ces obligations citent une source INRS qui n'est pas dépouillée, ou " +
        "qui n'est pas classée `sans_objet`. Un guide de l'INRS n'est pas " +
        "opposable : il se cite en appui d'une obligation dont le fondement " +
        "est un texte de droit, jamais comme ce fondement. C'est la ligne de " +
        "l'ADR-032, et le dépôt l'a déjà franchie une fois avec la règle " +
        "APSAD R43.\n" +
        fautives.join("\n"),
    ).toEqual([]);
  });

  it("les trois déclarations du modèle disent la même liste", () => {
    // Là où vivait le défaut de `TypeErp` : trois copies recopiées l'une sur
    // l'autre. Rien ici ne dit que la liste est JUSTE — aucune source ne le
    // dirait — mais au moins elle est une.
    const reference = enumPrismaNature();
    for (const [nom, liste] of [
      ["NATURES_TRAVAUX (src/lib/permis-feu/schema.ts)", [...NATURES_TRAVAUX]],
      ["LABEL_NATURE", Object.keys(LABEL_NATURE)],
    ] as const) {
      const e = ecart(reference, liste);
      expect(
        e,
        `${nom} ne dit pas la même liste que \`enum NatureTravauxPointChaud\`.\n` +
          (e.manquants.length ? `MANQUE(NT) : ${e.manquants.join(", ")}\n` : "") +
          (e.enTrop.length ? `EN TROP : ${e.enTrop.join(", ")}\n` : "") +
          "L'enum Prisma fait foi ici FAUTE DE MIEUX : c'est elle qui " +
          "contraint la base, et une valeur qui n'y est pas est insaisissable " +
          "quoi qu'en dise le TypeScript. Ce n'est pas une source — cette " +
          "liste n'en a pas.",
      ).toEqual({ manquants: [], enTrop: [] });
    }
  });

  it("la liste reste ouverte, parce que la brochure l'est", () => {
    // `autre` n'est pas une commodité : c'est ce qui rend la liste honnête.
    // ED 6030 écrit « tous les travaux générateurs d'étincelles ou de surfaces
    // chaudes » et imprime deux lignes vides sous ses quatre cases. Une liste
    // fermée à onze valeurs prétendrait dire plus que sa source.
    expect(
      NATURES_TRAVAUX,
      "`autre` doit rester : sans elle, la liste se donne pour exhaustive " +
        "alors que sa source — non opposable — se déclare explicitement " +
        "ouverte. Un donneur d'ordre dont le procédé n'est pas listé ne " +
        "pourrait plus établir son permis de feu.",
    ).toContain("autre");
  });
});
