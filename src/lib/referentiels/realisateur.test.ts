// Les réalisateurs, tenus à un texte chacun — parce qu'il n'y a pas de liste.
//
// ─────────────────────────────────────────────────────────────────────────────
// LE RÉSULTAT PRINCIPAL EST QU'IL N'Y A RIEN À COMPARER
// ─────────────────────────────────────────────────────────────────────────────
//
// Le § 9 de `docs/chantiers-ouverts.md` range `Realisateur` parmi les sept
// listes qui « transcrivent une nomenclature écrite dans un texte », et lui
// donne pour source « `R. 4323-24` et voisins ».
//
// **`R. 4323-24` ne nomme qu'un des dix réalisateurs.** Ouvert le 2026-09-03 :
// « Les vérifications générales périodiques sont réalisées par des personnes
// qualifiées, appartenant ou non à l'établissement, dont la liste est tenue à
// la disposition de l'inspection du travail. » Une figure, pas dix. Et il n'y a
// pas d'article, ni d'arrêté, qui énumère les qualifications admises pour
// vérifier : chaque texte nomme celle qu'il exige — l'organisme agréé du
// règlement ERP, l'organisme accrédité de l'électricité, le médecin du travail
// du suivi individuel renforcé — et le produit les agrège.
//
// Il n'y a donc **aucune liste de référence** contre laquelle comparer
// `Realisateur` dans les deux sens. Écrire un test qui le prétendrait serait
// pire que ne rien écrire : il donnerait à une agrégation de produit
// l'apparence d'une transcription.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE QUI SE VÉRIFIE À LA PLACE, ET POURQUOI ÇA VAUT LA PEINE
// ─────────────────────────────────────────────────────────────────────────────
//
// Une propriété plus faible, mais vraie et utile : **aucune de ces valeurs
// n'est un mot de métier sans texte derrière**. `ANCRAGE_REALISATEUR`
// (`types-communs.ts`) désigne, pour chacune, l'article du corpus dont le
// verbatim l'écrit, et ce fichier va RELIRE ce verbatim. Une valeur ajoutée
// sans ancrage fait rougir le test ; elle ne se répare pas en recopiant une
// autre déclaration, mais en trouvant le texte — ou en découvrant qu'il n'y en
// a pas, ce qui est le résultat intéressant.
//
// C'est le geste inverse de `types-erp.test.ts`, et c'est voulu. Là-bas, un
// texte porte la liste et le modèle doit la refléter en entier. Ici, le modèle
// porte la liste et chaque membre doit produire son texte. Une même exigence —
// rien par affirmation — sous deux formes, parce que les sources ne sont pas de
// la même espèce.
//
// ─────────────────────────────────────────────────────────────────────────────
// DEUX VALEURS DIVERGENT DU MOT DU TEXTE, ET C'EST DÉCLARÉ
// ─────────────────────────────────────────────────────────────────────────────
//
// `bureau_controle` est la seule dont le mot n'est dans aucun texte : le droit
// dit « contrôleur technique ». `exploitant` couvre « l'employeur procède » de
// `R. 4323-23` autant que « l'exploitant » du règlement ERP. Les deux sont
// ancrées sur le mot du TEXTE, pas sur leur propre clé — c'est précisément à
// quoi sert le champ `expression`, et ce qui distingue cette table d'une
// cinquième copie de la liste.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE QUE CE FICHIER NE VÉRIFIE PAS
// ─────────────────────────────────────────────────────────────────────────────
//
// **Que la liste soit complète.** Elle ne peut pas l'être par construction : il
// n'existe pas d'inventaire des qualifications du droit français. Un
// réalisateur qu'un texte exige et que le modèle ne sait pas dire resterait
// invisible ici, et c'est le mode de panne assumé — il se rattrape au
// dépouillement, où une obligation encodée sans réalisateur juste se voit.
//
// **Que chaque valeur soit EMPLOYÉE.** `fabricant` est ancré et n'est le
// `realisateurs` d'aucune obligation ; c'est une valeur disponible, pas un
// défaut. Le vérifier reviendrait à interdire d'ajouter un mot avant l'article
// qui s'en sert.
//
// **Que l'ancrage soit le MEILLEUR.** Plusieurs articles écrivent « personnes
// qualifiées » ; celui qui est désigné est celui qui définit la figure, pas le
// seul qui l'emploie. C'est un choix de rédaction, pas une propriété du texte.

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CORPUS } from "./corpus";
import { ANCRAGE_REALISATEUR, REALISATEURS } from "./types-communs";
import { LABEL_REALISATEUR } from "@/lib/calendrier/labels";

/** Accents et casse retirés : on compare des mots, pas des graphies. */
function sansAccent(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** Tous les verbatims du corpus portant cette référence d'article. */
function verbatimsDe(ref: string): string[] {
  return CORPUS.flatMap((c) =>
    c.articles.filter((a) => a.ref === ref).map((a) => a.citationCle ?? ""),
  );
}

/** L'énumération Prisma, lue dans le fichier de schéma. */
function enumPrismaRealisateur(): string[] {
  const schema = readFileSync(
    path.join(process.cwd(), "prisma", "schema.prisma"),
    "utf8",
  );
  const bloc = /enum Realisateur \{([^}]*)\}/.exec(schema);
  expect(
    bloc,
    "`enum Realisateur` introuvable dans prisma/schema.prisma",
  ).not.toBeNull();
  return bloc![1]
    .split("\n")
    // Les commentaires de l'enum citent des articles et des valeurs en prose
    // (« le repli était `exploitant` ») : les garder ferait entrer du texte
    // dans la liste des valeurs.
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

describe("réalisateurs — chaque valeur produit le texte qui la nomme", () => {
  it("l'article que le § 9 donnait pour source n'en nomme qu'un, et on le lit", () => {
    // CONTRE-ÉPREUVE, ET RÉSULTAT DU LOT EN MÊME TEMPS. Ce `it` est là pour
    // que la prémisse de tout le fichier — « il n'y a pas de nomenclature » —
    // soit vérifiée sur le texte, et non seulement écrite en tête.
    //
    // Si `R. 4323-24` venait un jour à énumérer les qualifications admises,
    // ce test rougirait, et il faudrait alors écrire ici la comparaison dans
    // les deux sens que `types-erp.test.ts` fait sur GN 1.
    const [verbatim] = verbatimsDe("R. 4323-24");
    expect(
      verbatim,
      "`R. 4323-24` doit être dépouillé au corpus : c'est l'article que le " +
        "§ 9 de `docs/chantiers-ouverts.md` donnait pour source de " +
        "`Realisateur`, et toute la démonstration part de sa lecture.",
    ).toBeTruthy();

    const nommes = REALISATEURS.filter((r) =>
      sansAccent(verbatim).includes(
        sansAccent(ANCRAGE_REALISATEUR[r].expression),
      ),
    );
    expect(
      nommes,
      "`R. 4323-24` nomme désormais plus d'un réalisateur : " +
        `${nommes.join(", ")}.\n` +
        "Si le texte a changé, il porte peut-être maintenant une véritable " +
        "nomenclature — auquel cas ce fichier doit être réécrit sur le patron " +
        "de `types-erp.test.ts`, qui compare dans les deux sens. Ne pas se " +
        "contenter d'élargir cette assertion.",
    ).toEqual(["personne_qualifiee"]);
  });

  it("chaque réalisateur désigne un article que le corpus porte", () => {
    const orphelins = REALISATEURS.filter(
      (r) => verbatimsDe(ANCRAGE_REALISATEUR[r].ref).length === 0,
    ).map((r) => `${r} → ${ANCRAGE_REALISATEUR[r].ref}`);
    expect(
      orphelins,
      "Ces réalisateurs désignent un article qui n'est dans aucun corpus. " +
        "Un ancrage vers un article non dépouillé ne prouve rien : il faut " +
        "d'abord ouvrir le texte et le porter au corpus.\n" +
        orphelins.join("\n"),
    ).toEqual([]);
  });

  it("le verbatim de cet article écrit bien la figure annoncée", () => {
    // LE CŒUR DE LA GARDE. C'est ici qu'une valeur inventée se voit : la
    // référence peut exister, l'expression doit se trouver DANS son texte.
    //
    // La première écriture de `ANCRAGE_REALISATEUR` a rougi ici. Elle donnait
    // à `organisme_accredite` l'expression « organismes accrédités », au
    // pluriel comme son voisin `GE 6` ; `R. 4226-19` écrit « par un organisme
    // accrédité », au singulier. Le mot venait de la symétrie avec la ligne
    // d'à côté, pas du texte — exactement ce que cette garde existe pour
    // attraper.
    const sansTexte: string[] = [];
    for (const r of REALISATEURS) {
      const { ref, expression } = ANCRAGE_REALISATEUR[r];
      const trouve = verbatimsDe(ref).some((v) =>
        sansAccent(v).includes(sansAccent(expression)),
      );
      if (!trouve) sansTexte.push(`${r} → « ${expression} » dans ${ref}`);
    }
    expect(
      sansTexte,
      "Ces réalisateurs annoncent une expression que le verbatim de leur " +
        "article n'écrit pas. Un réalisateur affiché au dirigeant lui dit QUI " +
        "doit intervenir : si le mot ne vient d'aucun texte, l'application " +
        "invente une qualification, et le dirigeant paie un prestataire " +
        "qu'aucune règle n'exige — ou croit pouvoir s'en passer.\n" +
        sansTexte.join("\n") +
        "\nLa vérification porte sur le `citationCle` relevé au corpus. Elle " +
        "ne se répare pas en alignant `expression` sur une autre déclaration " +
        "du modèle : soit le mot du texte est ailleurs, soit le verbatim est " +
        "faux et il faut rouvrir Légifrance.",
    ).toEqual([]);
  });

  it("les quatre déclarations du modèle disent la même liste", () => {
    // `Realisateur` est déclarée QUATRE fois — l'enum Prisma, `REALISATEURS`,
    // `LABEL_REALISATEUR` du calendrier, et une SECONDE table de libellés
    // privée à `PrescriptionForm.tsx`, qui parle à la deuxième personne. La
    // quatrième n'est pas exportée : le compilateur la tient exhaustive parce
    // que c'est un `Record<Realisateur, string>`, ce que ce test ne peut pas
    // atteindre et n'a pas à refaire.
    const reference = Object.keys(ANCRAGE_REALISATEUR);
    for (const [nom, liste] of [
      ["enum Realisateur (prisma/schema.prisma)", enumPrismaRealisateur()],
      ["REALISATEURS (src/lib/referentiels/types-communs.ts)", [...REALISATEURS]],
      ["LABEL_REALISATEUR (src/lib/calendrier/labels.ts)", Object.keys(LABEL_REALISATEUR)],
    ] as const) {
      const e = ecart(reference, liste);
      expect(
        e,
        `${nom} ne dit pas la même liste que les autres déclarations.\n` +
          (e.manquants.length ? `MANQUE(NT) : ${e.manquants.join(", ")}\n` : "") +
          (e.enTrop.length ? `EN TROP : ${e.enTrop.join(", ")}\n` : "") +
          "`ANCRAGE_REALISATEUR` fait foi ici parce qu'elle est la seule des " +
          "quatre reliée aux textes : le test précédent relit chacune de ses " +
          "expressions dans le verbatim de son article.",
      ).toEqual({ manquants: [], enTrop: [] });
    }
  });

  it("chaque libellé est une désignation lisible, pas l'identifiant", () => {
    // CE TEST A ROUGI SUR UNE DONNÉE LÉGITIME, ET C'EST LA RÈGLE QUI A CHANGÉ.
    // Sa première écriture exigeait que le libellé DIFFÈRE de sa clé une fois
    // accents et casse retirés. `fabricant → « Fabricant »` a rougi — alors
    // que « fabricant » est le mot du texte lui-même (arrêté du 1er mars 2004,
    // art. 5 : « la notice d'instructions du fabricant »). Rallonger le
    // libellé en « Fabricant de l'équipement » pour faire taire le test aurait
    // été la rustine exacte que le lot `TypeErp` avait refusée sur `Y · Musée`
    // et `GA · Gare` : réparer la donnée pour sauver une règle mal posée.
    //
    // Ce que la règle visait vraiment est plus étroit : un libellé qui serait
    // l'IDENTIFIANT, `medecin_travail: "medecin_travail"`, lequel compile et
    // n'apprend rien à personne. Elle se dit donc en deux traits de forme —
    // pas d'underscore, et pas la clé nue — et ne dit rien de la longueur ni
    // du nombre de mots, qui sont des choix de rédaction.
    const identifiants: string[] = [];
    for (const [cle, libelle] of Object.entries(LABEL_REALISATEUR)) {
      const brut = !libelle.trim() || libelle.includes("_") || libelle === cle;
      if (brut) identifiants.push(`${cle} → « ${libelle} »`);
    }
    expect(
      identifiants,
      "Ces libellés sont l'identifiant plutôt qu'une désignation. Le " +
        "réalisateur est la seule chose que l'écran dise au dirigeant sur QUI " +
        "appeler : écrivez-le dans ses mots.\n" +
        identifiants.join("\n"),
    ).toEqual([]);
  });
});
