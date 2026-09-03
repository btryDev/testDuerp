// La nomenclature des classes d'IGH, tenue à sa source.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE QUE CE FICHIER EMPÊCHE
// ─────────────────────────────────────────────────────────────────────────────
//
// `enum ClasseIgh` a vécu avec HUIT classes là où l'article R. 146-4 du code de
// la construction et de l'habitation en écrit DIX. L'écart allait dans les deux
// sens, et les deux sens comptent :
//
//   MANQUAIENT   GHTC (tour de contrôle), GHW1 et GHW2 (bureaux).
//   EN TROP      GHW — le code ne l'écrit nulle part.
//
// LA CAUSE EST UNE SOURCE MAL DÉSIGNÉE, PAS UNE COQUILLE. La liste était
// attribuée à l'arrêté du 30 décembre 2011, le règlement de sécurité des IGH.
// Ce règlement n'énumère pas les classes : son `GH 1` renvoie explicitement au
// code « pour les prescriptions générales communes aux diverses classes », et
// son titre III se contente d'ORGANISER des chapitres par classe — dont un
// chapitre unique « GH W » qui couvre GH W 1 et GH W 2. Un chapitre de
// règlement n'est pas une classe. Le code, lui, écrit `GHW 1` et `GHW 2`, et
// les sépare par la seule chose qui les distingue : la hauteur du plancher bas
// du dernier niveau, plus de 28 mètres et au plus 50 pour l'une, plus de 50
// pour l'autre.
//
// LE MEMBRE EN TROP FAISAIT AUTANT DE MAL QUE LES MANQUANTS. Un exploitant de
// tour de bureaux cochait « GHW · Bureaux », enregistrait une valeur qui n'est
// pas une classe, et n'était jamais interrogé sur la hauteur. Le manquant
// `GHTC`, lui, faisait l'inverse : une tour de contrôle n'avait pas de ligne.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE QUI EST CORRIGÉ AUJOURD'HUI, ET CE QUI ATTEND — LIRE AVANT DE TOUCHER AU
// TEST
// ─────────────────────────────────────────────────────────────────────────────
//
// Les trois MANQUANTS sont entrés : migration additive, aucune ligne réécrite.
//
// Le membre EN TROP, lui, sort en deux temps, et ce fichier porte la trace du
// premier. `GHW` a disparu de tous les CHOIX — `CLASSES_IGH` de
// `src/lib/etablissements/schema.ts` (qui valide les formulaires et remplit les
// menus), `CHOIX_CLASSES_IGH`, `LABEL_CLASSE_IGH` : **plus personne ne peut en
// créer.** Il reste dans le TYPE — l'énumération PostgreSQL et son reflet
// `CLASSES_IGH` de `types-communs.ts` — parce que des dossiers peuvent en
// porter et qu'on ne le sait pas encore.
//
// **CE N'EST PAS UN SEUIL DESSERRÉ POUR ÉVITER UNE CORRECTION.** Retirer une
// valeur d'un type énuméré PostgreSQL réécrit la colonne, et les lignes qui la
// portent doivent recevoir un sort : `GHW` n'a pas d'équivalent, il ne dit pas
// si le plancher bas est à 40 mètres (GHW 1) ou à 60 (GHW 2). La seule valeur
// honnête est NULL, et c'est une perte. Or `package.json` porte
// « build: prisma generate && prisma migrate deploy && next build » : pousser
// le retrait sur `main` l'exécute en production au prochain déploiement, sur
// des lignes dont on ignore l'existence — la lecture de la base de production
// n'a pas pu être faite.
//
// Un comptage préalable n'y suffirait pas : tant que `GHW` est offert au
// formulaire, un déclarant peut en écrire un entre la lecture et le
// déploiement. C'est ce que ce palier corrige, et c'est ce qui rend le comptage
// concluant — après lui, le compte ne peut plus remonter.
//
// **La condition de levée est écrite**, et c'est ce qui distingue un palier
// d'une rustine : `docs/chantiers-ouverts.md` § 9 bis. Elle dit à quel moment
// compter, quelle migration écrire, et ce qu'il faut prévoir si le compte n'est
// pas nul.
//
// ─────────────────────────────────────────────────────────────────────────────
// POURQUOI CE N'EST PAS UNE LISTE EXHAUSTIVE RECOPIÉE
// ─────────────────────────────────────────────────────────────────────────────
//
// Ce dépôt a une règle contre les listes exhaustives en test : une liste qu'on
// répare en la recopiant cesse de vérifier. Écrire ici
// `expect(CLASSES_IGH).toEqual(["GHA", …])` serait une SIXIÈME copie, réparable
// au copier-coller depuis la cinquième.
//
// La référence est donc DÉRIVÉE du verbatim de R. 146-4 dépouillé au corpus
// (`corpus/cch-classement-erp-igh.ts`), en lisant les sigles que le texte écrit
// en tête de chacune de ses lignes. Un test qui rougit ici ne se répare que de
// deux façons — corriger la déclaration qui s'écarte, ou rouvrir Légifrance et
// corriger le relevé.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA SEULE TRANSFORMATION ENTRE LE TEXTE ET LA LISTE ATTENDUE, ET ELLE EST DITE
// ─────────────────────────────────────────────────────────────────────────────
//
// Le code écrit « GHW 1 » avec une espace. Aucune valeur d'énumération
// PostgreSQL ou TypeScript ne peut en porter une. Le parseur retire donc les
// espaces INTERNES au sigle, et rien d'autre — pas de mise en majuscules, pas
// de retrait de points, pas de table de correspondance. Une table de
// correspondance serait une copie déguisée ; une normalisation d'une ligne ne
// l'est pas, et elle est ici sous les yeux du lecteur.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE QUE LA GARDE NE VÉRIFIE PAS, ET IL FAUT LE DIRE
// ─────────────────────────────────────────────────────────────────────────────
//
// **Que le verbatim soit fidèle.** Il est le point d'appui : s'il est faux, la
// garde valide un faux avec application. C'est ce qui le rend différent d'un
// commentaire — il porte `versionEnVigueur`, `luLe`, `lecture` et `modifiePar`,
// et `corpus.test.ts` exige ces champs.
//
// **L'ordre.** Les listes du produit ne sont pas toutes dans l'ordre du texte :
// la grille d'onboarding met les bureaux devant parce que c'est le cas le plus
// probable. Un ordre est un choix d'affichage ; le déguiser en lecture serait
// pire que de ne rien vérifier. La comparaison porte donc sur des ENSEMBLES.
//
// **Ce que `GHW` empêcherait de voir.** La dérogation ci-dessous est NOMMÉE et
// ne couvre qu'elle-même : tout autre membre en trop, dans n'importe laquelle
// des cinq déclarations, fait tomber le test. Éprouvé en injectant un second
// membre.
//
// **Les mots des libellés.** Ce qui est vérifié est la FORME — le sigle, un
// séparateur, une désignation non vide — et les HAUTEURS, jamais la
// formulation. Voir le test des libellés pour la raison : une longueur minimale
// aurait forcé à rallonger « GHA · Habitation », qui est le mot du texte.

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CORPUS, type ArticleDepouille } from "./corpus";
import { CLASSES_IGH } from "./types-communs";
import { CLASSES_IGH as CLASSES_IGH_ZOD } from "@/lib/etablissements/schema";
import { CHOIX_CLASSES_IGH } from "@/lib/onboarding/deduction-erp";

/** L'entrée de corpus qui porte la nomenclature. */
function articleR146_4(): ArticleDepouille {
  const trouves = CORPUS.flatMap((c) =>
    c.articles.filter((a) => a.ref === "CCH R. 146-4"),
  );
  // Zéro entrée et la garde ne garderait plus rien ; deux, et on ne saurait pas
  // laquelle fait foi. Les deux cas doivent crier, pas se rattraper.
  expect(
    trouves.length,
    "`CCH R. 146-4` doit être dépouillé une fois et une seule dans `CORPUS` : " +
      "c'est l'article qui porte la nomenclature des classes d'IGH, et toute " +
      "cette garde en dépend.",
  ).toBe(1);
  return trouves[0];
}

/**
 * Les classes que le TEXTE écrit, extraites de son verbatim.
 *
 * Le I de R. 146-4 pose une ligne par classe, ouverte par le sigle :
 * « GHA : immeubles à usage d'habitation ; », « GHW 1 : immeubles à usage de
 * bureaux … ». La phrase d'introduction (« I.-Les immeubles de grande hauteur
 * sont répartis… ») ne commence pas par un sigle et ne matche pas.
 *
 * La lecture s'arrête au II — qui traite de l'immeuble à usages multiples et
 * ne définit aucune classe — pour qu'aucune énumération voisine ne puisse
 * entrer par accident.
 */
function classesEcritesParR146_4(
  verbatim = articleR146_4().citationCle ?? "",
): { sigle: string; designation: string }[] {
  const bornes = verbatim.split("II.-");
  expect(
    bornes.length,
    "Le verbatim de R. 146-4 doit porter son II : c'est lui qui borne la " +
      "lecture du I. Sans borne, le parseur lirait des phrases qui ne sont pas " +
      "des classes.",
  ).toBeGreaterThan(1);

  return bornes[0]
    .split("\n")
    .map((l) => l.trim())
    .flatMap((ligne) => {
      const m = /^((?:GH[A-Z]{1,2}(?: \d)?)|ITGH)\s*:\s*(\S.*?)\s*[;.]?$/.exec(
        ligne,
      );
      // LA SEULE NORMALISATION : l'espace interne de « GHW 1 » tombe, parce
      // qu'aucune énumération ne peut la porter. Rien d'autre n'est touché.
      return m ? [{ sigle: m[1].replace(/\s+/g, ""), designation: m[2] }] : [];
    });
}

/** Les valeurs de l'énumération Prisma, lues dans le fichier de schéma. */
function enumPrismaClasseIgh(): string[] {
  const schema = readFileSync(
    path.join(process.cwd(), "prisma", "schema.prisma"),
    "utf8",
  );
  const bloc = /enum ClasseIgh \{([^}]*)\}/.exec(schema);
  expect(
    bloc,
    "`enum ClasseIgh` introuvable dans prisma/schema.prisma",
  ).not.toBeNull();
  return bloc![1]
    .split("\n")
    // Les commentaires de l'énumération citent des sigles en prose (« un GHW
    // que le code n'écrit pas ») : les garder ferait entrer du texte dans la
    // liste. On coupe au `//` avant de lire la valeur.
    .map((l) => l.split("//")[0].trim())
    .filter((l) => l.length > 0);
}

/**
 * Les libellés du menu du formulaire, lus à la source.
 *
 * `LABEL_CLASSE_IGH` vit dans un composant client (`EtablissementForm.tsx`) que
 * ce test ne peut pas importer sans tirer React. On le lit donc dans le
 * fichier, comme l'énumération Prisma — et deux tests s'en servent : celui qui
 * confronte les libellés au texte, et celui qui vérifie qu'aucune valeur en
 * sursis n'y est offerte.
 */
function libellesDuFormulaire(): Map<string, string> {
  const source = readFileSync(
    path.join(
      process.cwd(),
      "src",
      "components",
      "etablissements",
      "EtablissementForm.tsx",
    ),
    "utf8",
  );
  const bloc = /const LABEL_CLASSE_IGH[^{]*\{([^}]*)\}/.exec(source);
  expect(
    bloc,
    "`LABEL_CLASSE_IGH` introuvable dans EtablissementForm.tsx",
  ).not.toBeNull();
  return new Map(
    [...bloc![1].matchAll(/^\s*(\w+)\s*:\s*"([^"]*)"/gm)].map((m) => [
      m[1],
      m[2],
    ]),
  );
}

/**
 * L'écart entre deux listes, dans les deux sens, rendu lisible.
 *
 * Une classe de TROP est un défaut au même titre qu'une manquante : elle ouvre
 * au dirigeant une case que le code ne connaît pas, et la donnée saisie n'a
 * alors aucun sens réglementaire. C'est exactement ce qui s'est passé avec
 * `GHW`. Les deux sens sont donc rendus ensemble.
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

/**
 * LA DÉROGATION, ET ELLE NE PEUT QUE RÉTRÉCIR.
 *
 * Les valeurs que l'énumération de la base porte encore alors que R. 146-4 ne
 * les écrit pas. Elle vaut pour les deux déclarations qui décrivent ce que la
 * base peut CONTENIR — l'énumération Prisma et son reflet `CLASSES_IGH` de
 * `types-communs.ts` —, **et pour elles seules** : les trois déclarations qui
 * décrivent ce qu'on peut DÉCLARER restent strictes, et un test dédié vérifie
 * qu'aucune valeur en sursis n'y est offerte.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * `GHW` — inscrite le 2026-09-03, à retirer au temps 2.
 * ───────────────────────────────────────────────────────────────────────────
 *
 * CE QU'ELLE N'EST PAS. Ce n'est pas un plafond qu'on relève pour faire taire
 * un test, ni un « à corriger plus tard ». `GHW` est une valeur fausse, elle
 * est reconnue comme telle, et elle n'est plus atteignable : aucun formulaire,
 * aucun menu, aucun schéma de validation ne l'accepte depuis ce jour.
 *
 * CE QU'ELLE EST. Le retrait d'une valeur d'un type énuméré PostgreSQL réécrit
 * la colonne et impose de donner un sort aux lignes qui la portent. `GHW` n'a
 * pas d'équivalent — il ne dit pas si le plancher bas du dernier niveau est à
 * 40 mètres (GHW 1) ou à 60 (GHW 2) —, et NULL est la seule valeur honnête :
 * c'est une perte. On ignore s'il existe de telles lignes, et `pnpm build` joue
 * `prisma migrate deploy` : le retrait s'exécuterait en production au prochain
 * déploiement, sur des données que personne n'a vues.
 *
 * CONDITION DE LEVÉE, et elle est la raison d'être de cette constante : une
 * fois ce palier déployé, compter les lignes `Etablissement` dont `classeIgh`
 * vaut `'GHW'` en production. Le compte est alors DÉFINITIF — plus rien ne peut
 * en créer. Marche à suivre selon le résultat, migration à écrire, et ce qu'il
 * faut prévoir si le compte n'est pas nul : `docs/chantiers-ouverts.md` § 9 bis.
 *
 * ELLE NE PEUT QUE RÉTRÉCIR, ET LE TEST LE TIENT. Une entrée n'y survit que
 * tant qu'elle est VRAIE des deux côtés : absente du texte, ET encore présente
 * dans les déclarations qu'elle couvre. Le jour où `GHW` sortira de
 * l'énumération, l'entrée deviendra périmée et le test tombera en demandant sa
 * suppression. Une dérogation qui reste après sa cause est un mensonge, et
 * c'est ainsi qu'un palier devient une rustine.
 */
const EN_SURSIS_JUSQU_AU_TEMPS_2: readonly string[] = ["GHW"];

/**
 * L'écart, la dérogation déduite du seul sens où elle s'applique.
 *
 * On ne retire JAMAIS rien des manquants : une classe que le texte écrit et que
 * le modèle n'a pas n'a aucune excuse. La dérogation ne joue que sur les
 * membres en trop, et seulement sur ceux qu'elle nomme.
 */
function ecartHorsSursis(
  attendus: readonly string[],
  declares: readonly string[],
): { manquants: string[]; enTrop: string[] } {
  const brut = ecart(attendus, declares);
  return {
    manquants: brut.manquants,
    enTrop: brut.enTrop.filter((c) => !EN_SURSIS_JUSQU_AU_TEMPS_2.includes(c)),
  };
}

function messageEcart(quoi: string, e: ReturnType<typeof ecart>): string {
  return (
    `${quoi} ne dit pas la même chose que l'article R. 146-4 du CCH.\n` +
    (e.manquants.length
      ? `MANQUE(NT) : ${e.manquants.join(", ")} — le code les écrit, la ` +
        `déclaration non. Un exploitant de cette classe ne peut pas se ` +
        `déclarer pour ce qu'il est.\n`
      : "") +
    (e.enTrop.length
      ? `EN TROP : ${e.enTrop.join(", ")} — la déclaration les écrit, le code ` +
        `non. Une valeur que le code ne connaît pas est cochable et ne veut ` +
        `rien dire ; c'est ce qu'était « GHW », qui a masqué la coupure ` +
        `GHW 1 / GHW 2 pendant deux ans.\n`
      : "") +
    `La liste attendue est DÉRIVÉE du verbatim de R. 146-4 dépouillé au corpus ` +
    `(\`corpus/cch-classement-erp-igh.ts\`). Elle ne se répare pas en recopiant ` +
    `une autre déclaration : soit celle-ci s'écarte du texte et se corrige, ` +
    `soit le relevé est faux et il faut rouvrir Légifrance. Et si vous cherchez ` +
    `la nomenclature dans l'arrêté du 30 décembre 2011, elle n'y est pas : ` +
    `\`GH 1\` renvoie au code.`
  );
}

/**
 * Les hauteurs que le texte écrit sur une classe, en mètres.
 *
 * C'est la seule information qui SÉPARE deux classes de la nomenclature :
 * « bureaux » ne dit pas si l'on est en GHW 1 ou en GHW 2, « habitation » ne
 * dit pas si l'on est en GHA ou en GHZ. Un libellé qui la tait ne permet pas
 * de choisir, et c'est ainsi que le modèle a vécu avec un « GHW » unique.
 */
function hauteursDuTexte(designation: string): number[] {
  return [
    ...new Set(
      [...designation.matchAll(/(\d+)\s*mètres/g)].map((m) => Number(m[1])),
    ),
  ].sort((a, b) => a - b);
}

/** Les nombres qu'un libellé du produit donne à lire. */
function nombresDuLibelle(libelle: string): number[] {
  return [...libelle.matchAll(/\d+/g)].map((m) => Number(m[0]));
}

describe("classes d'IGH — la liste du modèle est celle de l'article R. 146-4", () => {
  it("le verbatim de R. 146-4 porte bien une nomenclature, et le parseur la voit", () => {
    // CONTRE-ÉPREUVE DU PRÉDICAT, avant toute comparaison. Un parseur qui ne
    // trouverait jamais rien laisserait les tests suivants comparer deux
    // listes vides et passer pour une garantie.
    const lues = classesEcritesParR146_4();
    expect(lues.length).toBeGreaterThan(7);
    // Chaque entrée porte une désignation, pas un sigle nu : c'est ce qui
    // distingue une ligne de nomenclature d'un fragment de phrase.
    for (const c of lues) expect(c.designation.length, c.sigle).toBeGreaterThan(3);

    // Le parseur suit le TEXTE, et on le prouve en le lui changeant. Une ligne
    // retirée du verbatim doit disparaître de la liste dérivée ; une ligne
    // ajoutée doit y entrer. Sans cette épreuve, un `citationCle` que personne
    // ne lit pourrait devenir de l'ornement sans que rien ne bouge.
    const ampute = (articleR146_4().citationCle ?? "").replace(
      /^GHTC : .*\n/m,
      "",
    );
    expect(classesEcritesParR146_4(ampute).map((c) => c.sigle)).not.toContain(
      "GHTC",
    );
    const gonfle = (articleR146_4().citationCle ?? "").replace(
      "GHZ : ",
      "GHQ : immeubles à usage inventé de toutes pièces ;\nGHZ : ",
    );
    expect(classesEcritesParR146_4(gonfle).map((c) => c.sigle)).toContain("GHQ");

    // L'espace interne de « GHW 1 » est bien tombée, et elle seule : le sigle
    // dérivé se compare à des valeurs d'énumération, qui n'en portent pas.
    expect(lues.map((c) => c.sigle)).toContain("GHW1");
  });

  it("l'énumération Prisma `ClasseIgh` porte les classes du texte, plus les seules valeurs en sursis", () => {
    // CE QUE LA BASE PEUT CONTENIR — la dérogation s'y applique. Une valeur
    // absente de l'énumération PostgreSQL rend la donnée insaisissable quoi
    // qu'en dise le TypeScript ; une valeur en trop, elle, ne peut plus être
    // écrite depuis que les choix ne l'offrent plus, mais elle doit rester
    // lisible tant qu'on ignore si des lignes la portent.
    //
    // Les MANQUANTS restent stricts : la dérogation ne les couvre jamais.
    const e = ecartHorsSursis(
      classesEcritesParR146_4().map((c) => c.sigle),
      enumPrismaClasseIgh(),
    );
    expect(e, messageEcart("`enum ClasseIgh` (prisma/schema.prisma)", e)).toEqual(
      { manquants: [], enTrop: [] },
    );
  });

  it("`CLASSES_IGH` (référentiel) reflète l'énumération de la base, sursis compris", () => {
    // Le reflet TypeScript de l'énumération Prisma : même rôle, même
    // dérogation. C'est le type que portent les valeurs LUES en base, d'où la
    // nécessité qu'il couvre encore `GHW` — sans quoi une ligne existante
    // deviendrait intypable et le produit planterait à la lecture.
    const e = ecartHorsSursis(
      classesEcritesParR146_4().map((c) => c.sigle),
      CLASSES_IGH,
    );
    expect(
      e,
      messageEcart("`CLASSES_IGH` (src/lib/referentiels/types-communs.ts)", e),
    ).toEqual({ manquants: [], enTrop: [] });
  });

  it("`CLASSES_IGH` (schéma Zod) porte exactement les classes du texte, sans dérogation", () => {
    // CE QU'ON PEUT DÉCLARER — et ici `ecart`, pas `ecartHorsSursis` : la
    // dérogation ne descend PAS jusqu'aux choix. C'est ce qui donne son sens au
    // palier : `GHW` reste lisible en base et devient inécrivable le même jour.
    // Cette liste valide les formulaires de création et d'onboarding ; une
    // valeur qui y figure est une valeur qu'on peut encore fabriquer.
    const e = ecart(
      classesEcritesParR146_4().map((c) => c.sigle),
      CLASSES_IGH_ZOD,
    );
    expect(
      e,
      messageEcart("`CLASSES_IGH` (src/lib/etablissements/schema.ts)", e),
    ).toEqual({ manquants: [], enTrop: [] });
  });

  it("`CHOIX_CLASSES_IGH` (onboarding) porte exactement les classes du texte", () => {
    // QUATRIÈME COPIE, ET LA PLUS EXPOSÉE. C'est elle qui remplit la grille du
    // parcours d'entrée. Contrairement aux `Record<ClasseIgh, …>` du dépôt,
    // elle n'est PAS vérifiée par le compilateur : c'est un tableau de
    // littéraux, et rien n'y aurait signalé l'absence de `GHTC`.
    //
    // `ecart` et non `ecartHorsSursis` : c'est un CHOIX offert, la dérogation
    // ne s'y applique pas.
    const e = ecart(
      classesEcritesParR146_4().map((c) => c.sigle),
      CHOIX_CLASSES_IGH.map((c) => c.id),
    );
    expect(
      e,
      messageEcart("`CHOIX_CLASSES_IGH` (src/lib/onboarding/deduction-erp.ts)", e),
    ).toEqual({ manquants: [], enTrop: [] });
  });

  it("la dérogation ne couvre que du vrai, et se périme d'elle-même", () => {
    // SANS CE TEST, LA DÉROGATION SERAIT UNE RUSTINE. Une liste d'exceptions
    // qu'on peut allonger et qui survit à sa cause finit par décrire l'état du
    // code au lieu de le contraindre. Deux conditions la tiennent, et une
    // entrée doit satisfaire les DEUX pour y rester.
    const duTexte = classesEcritesParR146_4().map((c) => c.sigle);
    const dansLaBase = new Set([...enumPrismaClasseIgh(), ...CLASSES_IGH]);

    // (1) Une valeur EN SURSIS doit être absente du texte. Le jour où R. 146-4
    // écrirait « GHW », la dérogation n'aurait plus d'objet : ce ne serait plus
    // un membre en trop, mais une classe à honorer.
    const pourtantAuTexte = EN_SURSIS_JUSQU_AU_TEMPS_2.filter((c) =>
      duTexte.includes(c),
    );
    expect(
      pourtantAuTexte,
      `${pourtantAuTexte.join(", ")} figure(nt) à l'article R. 146-4 : ce ne ` +
        `sont pas des membres en trop, et rien ne justifie de les tolérer. ` +
        `Retirez-les de \`EN_SURSIS_JUSQU_AU_TEMPS_2\` et traitez-les comme ` +
        `les autres classes du texte.`,
    ).toEqual([]);

    // (2) Une valeur EN SURSIS doit être encore présente dans les déclarations
    // qu'elle couvre. C'EST LE CLIQUET : au temps 2, quand `GHW` sortira de
    // l'énumération, cette entrée deviendra périmée et ce test tombera en
    // demandant qu'on l'efface. Une dérogation ne peut donc que rétrécir —
    // elle ne peut pas survivre à ce qu'elle excusait.
    const perimees = EN_SURSIS_JUSQU_AU_TEMPS_2.filter(
      (c) => !dansLaBase.has(c),
    );
    expect(
      perimees,
      `${perimees.join(", ")} ne figure(nt) plus dans l'énumération de la base : ` +
        `le temps 2 est fait, la dérogation n'a plus d'objet. Retirez ` +
        `l'entrée de \`EN_SURSIS_JUSQU_AU_TEMPS_2\` — et si la liste devient ` +
        `vide, retirez la constante et \`ecartHorsSursis\` avec elle, puis ` +
        `soldez le § 9 bis de docs/chantiers-ouverts.md. Une dérogation qui ` +
        `survit à sa cause est un mensonge.`,
    ).toEqual([]);
  });

  it("aucune valeur en sursis n'est offerte au choix — plus personne ne peut en créer", () => {
    // LA MOITIÉ QUI REND LE COMPTAGE CONCLUANT. La dérogation dit « cette
    // valeur peut encore être LUE » ; elle ne doit jamais dire « cette valeur
    // peut encore être ÉCRITE ». Tant qu'un menu l'offre, un déclarant peut en
    // fabriquer une entre la lecture de la base et le déploiement du retrait,
    // et le compte n'a aucune valeur.
    //
    // Les trois surfaces par lesquelles une classe s'attribue sont donc
    // vérifiées séparément — le schéma Zod (création et onboarding), la grille
    // d'onboarding, les libellés du formulaire de modification.
    const offertes: { ou: string; valeurs: string[] }[] = [];
    for (const [ou, liste] of [
      ["`CLASSES_IGH` (src/lib/etablissements/schema.ts, schémas Zod)", [...CLASSES_IGH_ZOD]],
      ["`CHOIX_CLASSES_IGH` (grille d'onboarding)", CHOIX_CLASSES_IGH.map((c) => c.id)],
      ["`LABEL_CLASSE_IGH` (menu du formulaire)", [...libellesDuFormulaire().keys()]],
    ] as const) {
      const fautives = liste.filter((c) =>
        EN_SURSIS_JUSQU_AU_TEMPS_2.includes(c),
      );
      if (fautives.length > 0) offertes.push({ ou, valeurs: [...fautives] });
    }
    expect(
      offertes,
      "Une valeur EN SURSIS est encore proposée à la déclaration :\n" +
        offertes.map((o) => `  ${o.ou} → ${o.valeurs.join(", ")}`).join("\n") +
        "\nLa dérogation autorise à LIRE cette valeur en base, jamais à en " +
        "écrire une nouvelle. Tant qu'un menu l'offre, le comptage qui doit " +
        "déclencher le temps 2 ne conclut rien — voir " +
        "docs/chantiers-ouverts.md § 9 bis.",
    ).toEqual([]);
  });

  it("chaque libellé de la grille porte les hauteurs qui distinguent sa classe", () => {
    // LA RÈGLE N'EST PAS UNE LONGUEUR MINIMALE, C'EST LA PRÉSENCE DU FAIT QUI
    // DISCRIMINE. Un plancher de caractères ferait rougir « GHA · Habitation »,
    // qui est le mot du texte, et pousserait à rallonger la nomenclature avec
    // des mots qu'elle n'a pas — la faute exacte que le lot `TypeErp` a
    // rencontrée sur « Y · Musée ».
    //
    // Ce qui se vérifie ici est ce que le TEXTE écrit et que le libellé ne doit
    // pas taire : la hauteur du plancher bas. Elle sépare GHW 1 de GHW 2 et GHZ
    // de GHA ; sans elle, « Bureaux » ne permet à personne de choisir, et le
    // modèle a effectivement vécu avec un « GHW » unique faute de l'avoir
    // jamais demandée. Les classes dont la définition ne porte aucune hauteur
    // — GHA, GHO, GHR, GHS, GHTC, GHU — n'ont rien à porter et ne sont pas
    // contraintes.
    const muets: string[] = [];
    for (const classe of classesEcritesParR146_4()) {
      const attendues = hauteursDuTexte(classe.designation);
      if (attendues.length === 0) continue;
      const choix = CHOIX_CLASSES_IGH.find((c) => c.id === classe.sigle);
      if (!choix) continue; // l'écart de liste est le sujet du test précédent.
      const lus = nombresDuLibelle(`${choix.label} ${choix.description}`);
      const oubliees = attendues.filter((h) => !lus.includes(h));
      if (oubliees.length > 0) {
        muets.push(
          `${classe.sigle} → « ${choix.label} — ${choix.description} » ` +
            `ne dit pas : ${oubliees.join(", ")} m`,
        );
      }
    }
    expect(
      muets,
      "Ces entrées de la grille taisent une hauteur que R. 146-4 écrit sur " +
        "leur classe. C'est le seul fait qui permet de choisir entre deux " +
        "classes voisines : un dirigeant qui ne sait pas si sa tour de bureaux " +
        "relève de GHW 1 ou de GHW 2 ne coche rien de juste, et l'obligation " +
        "ne se déclenche jamais sur la bonne classe.\n" +
        muets.join("\n"),
    ).toEqual([]);
  });

  it("chaque classe a un libellé de formulaire, et il dit plus que le sigle", () => {
    // `LABEL_CLASSE_IGH` est un `Record` exhaustif dont les clés sont déjà
    // garanties par le compilateur — comme les trois autres `Record` keyés sur
    // `ClasseIgh` du dépôt. Ce que le compilateur ne garantit pas, c'est que la
    // valeur apprenne quelque chose : `GHTC: "GHTC"` compilerait.
    //
    // `ecart` et non `ecartHorsSursis` : ces libellés remplissent un MENU,
    // c'est-à-dire un choix offert. La dérogation ne s'y applique pas.
    const libelles = libellesDuFormulaire();

    const e = ecart(
      classesEcritesParR146_4().map((c) => c.sigle),
      [...libelles.keys()],
    );
    expect(e, messageEcart("`LABEL_CLASSE_IGH`", e)).toEqual({
      manquants: [],
      enTrop: [],
    });

    const fautifs: string[] = [];
    for (const classe of classesEcritesParR146_4()) {
      const libelle = libelles.get(classe.sigle) ?? "";
      // La FORME : le sigle, un séparateur, une désignation non vide.
      if (!new RegExp(`^${classe.sigle} · \\S`).test(libelle)) {
        fautifs.push(`${classe.sigle} → « ${libelle} » n'est pas « sigle · désignation »`);
        continue;
      }
      // Et les hauteurs, pour la même raison que dans la grille d'onboarding.
      const oubliees = hauteursDuTexte(classe.designation).filter(
        (h) => !nombresDuLibelle(libelle).includes(h),
      );
      if (oubliees.length > 0) {
        fautifs.push(
          `${classe.sigle} → « ${libelle} » ne dit pas : ${oubliees.join(", ")} m`,
        );
      }
    }
    expect(
      fautifs,
      "Ces libellés du formulaire ne permettent pas à un dirigeant de " +
        "reconnaître sa classe : écrivez, après le sigle et le séparateur, ce " +
        "que R. 146-4 dit de la classe — hauteur du plancher bas comprise " +
        "quand le texte en donne une.\n" +
        fautifs.join("\n"),
    ).toEqual([]);
  });
});
