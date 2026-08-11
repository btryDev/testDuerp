import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Filet de non-régression sur ADR-011 — dates civiles et fuseau unique.
 *
 * Les deux règles du module `@/lib/dates` ne sont pas exprimables dans le
 * système de types : rien n'empêche un contributeur d'écrire à nouveau
 * `date < new Date()` ou `d.toLocaleDateString("fr-FR")`. Or ces deux
 * fautes sont **invisibles en développement** : la machine de dev est en
 * Europe/Paris, donc le rendu est juste par coïncidence. Elles ne se
 * manifestent qu'en production, sur un serveur en UTC — au pire endroit
 * pour un outil de conformité, qui afficherait une échéance du jour comme
 * « en retard » ou daterait un document de la veille.
 *
 * Ce test relit les sources et échoue sur les deux motifs. Il ne remplace
 * pas les tests de comportement (`retard.test.ts`, `index.test.ts`) : il
 * garantit que ceux-ci sont bien la *seule* définition en vigueur.
 *
 * Il lit des fichiers, ne touche à rien, et coûte quelques millisecondes.
 */

const RACINE_SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Tous les .ts/.tsx de src/, hors tests (qui fabriquent légitimement des
 *  dates et formatent des attendus). */
function listerSources(): { chemin: string; code: string }[] {
  const out: { chemin: string; code: string }[] = [];
  const parcourir = (dossier: string): void => {
    for (const e of readdirSync(dossier, { withFileTypes: true })) {
      const complet = join(dossier, e.name);
      if (e.isDirectory()) {
        parcourir(complet);
      } else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) {
        out.push({
          chemin: relative(RACINE_SRC, complet).split(sep).join("/"),
          code: readFileSync(complet, "utf8"),
        });
      }
    }
  };
  parcourir(RACINE_SRC);
  return out;
}

const SOURCES = listerSources();

/**
 * Neutralise les commentaires en préservant la numérotation des lignes.
 *
 * Indispensable ici : ce dépôt commente densément *le motif fautif
 * lui-même* pour expliquer pourquoi il a été retiré (« comparer à
 * `new Date()` brut faisait basculer… »). Sans ce filtrage, le filet
 * accuserait précisément les explications qui documentent la règle.
 */
function sansCommentaires(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, (bloc) => bloc.replace(/[^\n]/g, " "))
    .split("\n")
    .map((ligne) => ligne.replace(/\/\/.*$/, ""))
    .join("\n");
}

/** Numéro de ligne (1-indexé) de chaque occurrence d'un motif, hors
 *  commentaires. */
function lignesCorrespondantes(code: string, motif: RegExp): number[] {
  return sansCommentaires(code)
    .split("\n")
    .map((ligne, i) => ({ ligne, n: i + 1 }))
    .filter(({ ligne }) => motif.test(ligne))
    .map(({ n }) => n);
}

/** « chemin:ligne » — le format que le rapport d'échec doit donner pour
 *  qu'on saute directement à la faute. */
function localiser(
  motif: RegExp,
  exclus: (chemin: string) => boolean = () => false,
): string[] {
  const out: string[] = [];
  for (const { chemin, code } of SOURCES) {
    if (exclus(chemin)) continue;
    for (const n of lignesCorrespondantes(code, motif)) out.push(`${chemin}:${n}`);
  }
  return out;
}

describe("ADR-011 — aucune règle de date réinventée dans src/", () => {
  it("trouve des sources à analyser", () => {
    // Garde-fou du test lui-même : un chemin faux ferait passer toutes les
    // assertions suivantes à vide, et le filet serait silencieusement percé.
    expect(SOURCES.length).toBeGreaterThan(100);
  });

  it("ne formate jamais une date sans fuseau explicite", () => {
    // `toLocaleDateString` / `toLocaleString` sur une **date** prennent le
    // fuseau du process dès que `timeZone` est absent. Le seul appel toléré
    // est `toLocaleString` sur un *nombre* (séparateurs de milliers), qui
    // n'a pas de fuseau : le motif exige donc un « Date » explicite dans le
    // nom de la méthode, ou un appel dont l'argument d'options manque.
    const coupables = localiser(
      // `toLocaleString` et `toLocaleTimeString` étaient absents du motif :
      // deux des trois occurrences réelles du dépôt sont sous cette forme, le
      // filet les laissait donc passer.
      /\.toLocale(Date|Time)?String\(\s*["'`]/,
      // Le module de dates documente le motif qu'il remplace ; les feuilles
      // de style PDF le citent aussi en commentaire.
      (c) => c === "lib/dates/index.ts" || c === "lib/pdf/styles.ts",
    ).filter((emplacement) => {
      // Un appel étalé sur plusieurs lignes peut porter `timeZone` plus
      // bas : on relit les 10 lignes suivantes avant d'accuser.
      const [chemin, ligne] = emplacement.split(":");
      const src = SOURCES.find((s) => s.chemin === chemin)!;
      const lignes = src.code.split("\n");
      const fenetre = lignes.slice(Number(ligne) - 1, Number(ligne) + 9).join("\n");
      if (fenetre.includes("timeZone")) return false;
      // `toLocaleString` sert aussi à formater des **nombres** (séparateurs de
      // milliers), qui n'ont pas de fuseau. Impossible à distinguer d'un
      // formatage de date par une simple lecture du texte : on exige donc que
      // l'auteur le déclare sur place. L'exemption reste ainsi visible à
      // l'endroit du code concerné, et non cachée dans une liste de fichiers
      // qui couvrirait aussi les vraies dates du même fichier.
      const contexte = lignes
        .slice(Math.max(0, Number(ligne) - 3), Number(ligne))
        .join("\n");
      return !contexte.includes("nombre, pas une date");
    });

    expect(
      coupables,
      "Formatage de date sans `timeZone` — passer par `@/lib/dates` " +
        "(`formaterDateFr`, `formaterDateLongueFr`, `formaterDateCourteFr`, " +
        "`formaterJourMoisFr`, `formaterDateHeureFr`).",
    ).toEqual([]);
  });

  it("ne parse jamais une saisie date ou date-heure avec `new Date(chaîne)`", () => {
    // `new Date("2026-08-10")` produit minuit **UTC**, et
    // `new Date("2026-08-10T14:30")` — une chaîne datetime-local, sans offset —
    // est interprétée dans le fuseau du **runtime**. Ces deux formes tournaient
    // dans des server actions : la référence était donc le serveur, pas
    // l'utilisateur. Sur un runtime en UTC, 14:30 saisi à Paris était stocké
    // 14:30 Z puis réaffiché 16:30 — la fenêtre du permis de feu et sa période
    // de surveillance décalées de deux heures.
    // Deux formes à attraper : le littéral (`new Date("2026-08-10")`) et — le
    // vrai coupable historique — la variable validée par Zod juste au-dessus
    // (`.transform((v) => new Date(v))`), qui échappe à toute analyse du texte
    // si l'on ne cherche que des littéraux.
    const coupables = [
      ...localiser(/new Date\(\s*["'`]\d{4}-\d{2}-\d{2}/, (c) =>
        c.startsWith("lib/dates/"),
      ),
      ...localiser(/\.transform\([^)]*=>\s*.*new Date\(\s*[a-zA-Z_$][\w$]*\s*\)/, (c) =>
        c.startsWith("lib/dates/"),
      ),
    ];

    expect(
      coupables,
      "Parsing d'une saisie de date sans fuseau — utiliser " +
        "`depuisCleJourCivil` (AAAA-MM-JJ) ou `depuisSaisieDateHeure` " +
        "(AAAA-MM-JJTHH:MM) de `@/lib/dates`.",
    ).toEqual([]);
  });

  it("ne compare jamais une échéance à une horloge lue sur place", () => {
    // `echeance < new Date()` et `d.getTime() < Date.now()` sont les deux
    // formes qui avaient essaimé. Le retard se demande à
    // `@/lib/dates/retard`, qui applique la règle produit : une échéance
    // datée d'aujourd'hui n'est pas en retard.
    const coupables = localiser(
      /[<>]=?\s*new Date\(\)|[<>]=?\s*Date\.now\(\)/,
      // Les jetons d'accès et les OTP expirent à un **instant** (TTL en
      // heures), pas à une date civile : la comparaison brute y est
      // correcte, et c'est ce que documentent ces modules.
      (c) => c === "lib/access-tokens/verify.ts",
    );

    expect(
      coupables,
      "Comparaison d'échéance à une horloge locale — utiliser " +
        "`estEnRetard` / `estActionEnRetard` / `estVerificationEnRetard` " +
        "de `@/lib/dates/retard`, avec une horloge injectée.",
    ).toEqual([]);
  });

  it("n'ajoute jamais des jours par arithmétique en millisecondes", () => {
    // `d.getTime() + n * 86_400_000` décale d'une heure aux changements
    // d'heure : une échéance à minuit devient 23:00 la veille, donc un
    // jour civil plus tôt. `ajouterJours` incrémente le jour civil.
    //
    // La **géométrie** (largeur d'un mois en pixels, abscisse d'un
    // marqueur) reste libre d'y recourir : ce sont des mesures d'écran,
    // pas des dates — d'où les deux exemptions ci-dessous, toutes deux
    // documentées dans leur fichier.
    const coupables = localiser(
      /1000 \* 60 \* 60 \* 24|86_?400_?000/,
      (c) =>
        c === "lib/dates/index.ts" ||
        c === "lib/dashboard/frise.ts" ||
        c === "components/dashboard/widgets/impl/echeances.tsx",
    );

    expect(
      coupables,
      "Arithmétique de jours en millisecondes — utiliser `ajouterJours` / " +
        "`joursCivilsEntre` de `@/lib/dates`.",
    ).toEqual([]);
  });
});
