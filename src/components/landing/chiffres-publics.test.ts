import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { obligationsConformite } from "@/lib/referentiels/conformite";

/**
 * La page d'accueil est **publique** — `middleware.ts` laisse passer `/` sans
 * session. Les chiffres qu'elle affiche sont donc lus par des prospects, pas
 * par des utilisateurs connectés qui pourraient recouper.
 *
 * Deux endroits annonçaient « 64 obligations · 9 domaines » quand le
 * référentiel en portait **85 sur 10**. Les deux portaient un commentaire
 * disant « à recompter quand le référentiel s'étend » — et personne ne l'a
 * fait, parce qu'un commentaire ne recompte rien. Le référentiel a grandi
 * trois fois depuis, le chiffre est resté. Il ne s'est pas trouvé tout seul :
 * il a fallu qu'un contrôle visuel ouvre la page.
 *
 * Le repère du dépôt est le préfixe d'`EMPREINTE_ATTENDUE`, qui fait tomber
 * un test dès que le compte change. La page publique était le seul endroit
 * qui annonçait ce compte **sans** être rattachée à ce mécanisme. Elle l'est
 * maintenant : le test lit le texte rendu et le confronte au référentiel.
 *
 * Il n'impose aucune formulation — seulement que tout nombre présenté comme
 * un compte d'obligations ou de domaines soit le bon.
 */

const DOSSIER = dirname(fileURLToPath(import.meta.url));

const OBLIGATIONS = obligationsConformite.length;
const DOMAINES = new Set(obligationsConformite.map((o) => o.domaine)).size;

/** Les composants de la page publique, sans les tests. */
function sourcesLanding(): { fichier: string; texte: string }[] {
  return readdirSync(DOSSIER)
    .filter((n) => n.endsWith(".tsx") && !n.includes(".test."))
    .map((n) => ({ fichier: n, texte: readFileSync(join(DOSSIER, n), "utf8") }));
}

/**
 * Les nombres annoncés comme un compte, quel que soit le tour de phrase.
 *
 * On accepte que le nombre et son mot soient séparés par des espaces, des
 * retours à la ligne et du JSX — « 85\n obligations sur 10 domaines » se
 * découpe sur plusieurs lignes dans le source, et une expression trop
 * étroite ne verrait que la moitié des occurrences.
 *
 * Mais l'intervalle **ne peut pas contenir un autre chiffre** : sans cette
 * restriction, « 85 obligations · 10 domaines » rattachait aussi 85 au mot
 * « domaines », et le test échouait sur une page pourtant juste. Chaque
 * nombre appartient au mot qui le suit immédiatement, pas au suivant.
 */
function comptesAnnonces(texte: string, mot: RegExp): number[] {
  const motif = new RegExp(String.raw`(\d+)[^\d]{0,40}?` + mot.source, "g");
  return [...texte.matchAll(motif)].map((m) => Number(m[1]));
}

describe("les chiffres de la page publique", () => {
  it("annonce le nombre d'obligations réellement livrées", () => {
    const fautifs: string[] = [];
    for (const { fichier, texte } of sourcesLanding()) {
      for (const n of comptesAnnonces(texte, /obligations?/)) {
        if (n !== OBLIGATIONS) fautifs.push(`${fichier} → ${n}`);
      }
    }

    expect(
      fautifs,
      `La page d'accueil est publique et annonce un nombre d'obligations qui n'est pas celui du référentiel (${OBLIGATIONS}). Corrigez le texte — ne relâchez pas ce test.`,
    ).toEqual([]);
  });

  it("annonce le nombre de domaines réellement couverts", () => {
    const fautifs: string[] = [];
    for (const { fichier, texte } of sourcesLanding()) {
      for (const n of comptesAnnonces(texte, /domaines?/)) {
        if (n !== DOMAINES) fautifs.push(`${fichier} → ${n}`);
      }
    }

    expect(
      fautifs,
      `La page d'accueil annonce un nombre de domaines qui n'est pas celui du référentiel (${DOMAINES}).`,
    ).toEqual([]);
  });

  it("les deux chiffres sont bien annoncés quelque part", () => {
    // Sans quoi le test ci-dessus passerait sur une page qui n'annonce plus
    // rien — vert pour la mauvaise raison, ce que ce dépôt traque ailleurs.
    const tout = sourcesLanding()
      .map((s) => s.texte)
      .join("\n");
    expect(comptesAnnonces(tout, /obligations?/).length).toBeGreaterThan(0);
    expect(comptesAnnonces(tout, /domaines?/).length).toBeGreaterThan(0);
  });
});
