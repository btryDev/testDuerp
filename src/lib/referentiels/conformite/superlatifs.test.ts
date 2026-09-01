import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Un rang écrit à la main se périme au dépouillement suivant.
 *
 * Une note qui classe un article — le mieux placé, le plus fraîchement
 * modifié — n'énonce pas une propriété du texte : elle énonce une propriété de
 * l'ENSEMBLE des textes encodés, qui grandit à chaque lot. Elle est donc vraie
 * le jour où on l'écrit et fausse dès qu'un lot ajoute mieux placé qu'elle,
 * sans qu'aucun diff ne la touche. Aucune revue de code ne peut la voir : il
 * n'y a pas de diff à revoir.
 *
 * MESURÉ AVANT D'ÊTRE ÉCRIT, sur le dépôt réel au 2026-09-01. Six notes
 * classaient un article par sa fraîcheur au sein du référentiel ou d'un lot.
 * Les six étaient fausses, vérifiées contre les `versionConstatee` que le
 * référentiel porte lui-même — sans Légifrance, sans source externe : la
 * donnée qui les dément était déjà dans le fichier d'à côté. Deux d'entre
 * elles disaient d'un même article qu'il était le plus récent de tout le
 * référentiel ; il est huitième.
 *
 * SIX SUR SIX, ET ZÉRO FAUX POSITIF hors de ce répertoire : les emplois
 * légitimes du mot — « du plus récent au plus ancien », « le plus récent est
 * mis en avant » — décrivent un TRI, pas un rang dans un ensemble que le dépôt
 * possède, et la borne ci-dessous ne les voit pas. C'est cette borne qui fait
 * la différence entre la règle et le bruit.
 *
 * CE QUE CETTE GARDE NE FAIT PAS, et il faut le dire : elle interdit une
 * tournure, elle ne vérifie pas une affirmation. Un rang reformulé sans ces
 * mots passerait. C'est assumé — un rang dans un ensemble qui grandit n'est
 * dérivable par aucun test tant qu'il vit dans de la prose, et le remède est
 * de ne pas l'écrire. La date en vigueur dit tout ce que le rang disait
 * d'utile, et elle ne bouge pas : c'est une trace, pas un compteur.
 *
 * PORTÉE : `conformite/` seulement, et ce n'est pas un choix de confort. Deux
 * instances de plus vivent dans `corpus/` — `code-travail-sante-travail.ts`
 * (« l'article le plus récemment modifié de tout le référentiel », faux) et
 * `code-travail-locaux-sociaux.ts` (« la version la plus récente de tout le
 * lot 8 », faux). Ce répertoire appartient à un autre lot au 2026-09-01 :
 * élargir la garde aujourd'hui rendrait la suite rouge sur des fichiers que je
 * ne dois pas corriger. Une fois ces deux notes reprises, `RACINES` doit
 * remonter d'un cran, à `src/lib/referentiels`.
 */

const RACINES = ["src/lib/referentiels/conformite"];

/**
 * Un superlatif de fraîcheur, BORNÉ à un ensemble que le dépôt possède.
 *
 * La borne est le deuxième groupe, et elle porte tout le pouvoir de tri de la
 * règle : sans elle, la moitié des occurrences du dépôt sont des descriptions
 * d'ordre de tri parfaitement légitimes.
 */
const RANG_ECRIT_A_LA_MAIN =
  /(plus\s+(?:récent[e]?|récemment))[^."]{0,70}?\b(référentiel|lot|corpus)\b/gi;

/** Ce fichier parle de la tournure qu'il interdit : il ne s'inspecte pas
 *  lui-même. Sans cette ligne la garde resterait verte en se lisant. La
 *  contre-épreuve plus bas prouve que l'exclusion ne masque rien d'autre. */
const MOI = "superlatifs.test.ts";

function fichiersInspectes(): string[] {
  const out: string[] = [];
  for (const racine of RACINES) {
    for (const f of readdirSync(join(process.cwd(), racine))) {
      if (!f.endsWith(".ts") || f === MOI) continue;
      out.push(join(racine, f));
    }
  }
  return out;
}

function rangsTrouves(chemins: string[]): string[] {
  const out: string[] = [];
  for (const chemin of chemins) {
    const src = readFileSync(join(process.cwd(), chemin), "utf8");
    src.split("\n").forEach((ligne, i) => {
      for (const m of ligne.matchAll(RANG_ECRIT_A_LA_MAIN)) {
        out.push(`${chemin}:${i + 1} — « ${m[0].replace(/\s+/g, " ")} »`);
      }
    });
  }
  return out;
}

describe("les rangs écrits à la main dans le référentiel", () => {
  it("n'existent pas : un rang se périme, une date en vigueur non", () => {
    expect(
      rangsTrouves(fichiersInspectes()),
      "Une note classe un article par sa fraîcheur au sein du référentiel ou " +
        "d'un lot. Ce rang est vrai le jour où il est écrit et faux au " +
        "dépouillement suivant, sans qu'aucun diff ne le touche — six notes " +
        "sur six l'étaient au 2026-09-01. Écrivez la date en vigueur de " +
        "l'article : elle dit ce que le rang disait d'utile, et elle ne bouge " +
        "pas.",
    ).toEqual([]);
  });

  it("la garde voit bien la tournure qu'elle interdit", () => {
    // Contre-épreuve. Sans elle, une expression rendue inopérante — par une
    // faute de frappe, par une borne trop étroite — laisserait le test
    // ci-dessus vert et vide, ce qui est le mode de panne exact de ce genre
    // de garde. On lui présente les deux formes réellement rencontrées.
    expect(
      "l'article le plus récemment modifié de tout le référentiel".match(
        RANG_ECRIT_A_LA_MAIN,
      ),
    ).not.toBeNull();
    expect(
      "la version la plus récente de tout le lot 8".match(
        RANG_ECRIT_A_LA_MAIN,
      ),
    ).not.toBeNull();

    // Et qu'elle ne voit PAS une description de tri, qui est l'emploi
    // légitime et majoritaire du mot dans le dépôt.
    expect(
      "les rapports sont classés du plus récent au plus ancien".match(
        RANG_ECRIT_A_LA_MAIN,
      ),
    ).toBeNull();
  });

  it("inspecte réellement des fichiers, et le bon répertoire", () => {
    // Une garde qui ne lit rien passe. `readdirSync` sur un chemin renommé
    // rendrait une liste vide sans lever d'erreur si quelqu'un l'entourait
    // d'un try/catch un jour.
    const fichiers = fichiersInspectes();
    expect(fichiers.length).toBeGreaterThan(10);
    expect(fichiers.some((f) => f.endsWith("sante-travail.ts"))).toBe(true);
    expect(fichiers.every((f) => !f.endsWith(MOI))).toBe(true);
  });
});
