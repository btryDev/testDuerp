import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Aucune invalidation de cache depuis un rendu.
 *
 * Next l'a dit à l'ouverture du calendrier, en production :
 *
 *   Route /etablissements/[id]/calendrier used "revalidatePath ..." during
 *   render which is unsupported. To ensure revalidation is performed
 *   consistently it must always happen outside of renders and cached
 *   functions.
 *
 * L'appel était **ignoré** : la génération passait, la transaction s'exécutait,
 * les échéances existaient. Seule l'invalidation ne se faisait pas. Rien n'était
 * perdu — mais Next le déclare non supporté, et ce genre d'usage devient une
 * erreur dure aux versions suivantes.
 *
 * CE QUI REND CE TEST NÉCESSAIRE : rien d'autre ne l'attrape. Ni le
 * compilateur, ni la suite de tests, ni le build. Le défaut ne se voit qu'en
 * ouvrant la page, et il a dormi des mois parce qu'un garde `if (nbEquipements
 * > 0)` empêchait la branche de s'exécuter.
 */
const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** Les fonctions qui invalident le cache, directement ou par transitivité. */
const INVALIDENT = ["revalidatePath", "revalidateTag", "genererCalendrier"];

function fichiersDeRendu(dir: string, acc: string[] = []): string[] {
  for (const nom of readdirSync(dir)) {
    if (nom === "node_modules" || nom === ".next") continue;
    const chemin = join(dir, nom);
    if (statSync(chemin).isDirectory()) fichiersDeRendu(chemin, acc);
    // Les fichiers de route d'App Router : ils s'exécutent pendant un rendu.
    // `route.ts` en est exclu — un gestionnaire de requête n'est pas un rendu.
    else if (/^(page|layout|template|loading|error)\.tsx?$/.test(nom)) {
      acc.push(chemin);
    }
  }
  return acc;
}

describe("aucune invalidation de cache pendant un rendu", () => {
  const pages = fichiersDeRendu(join(RACINE, "src", "app"));

  it("le balayage trouve bien les pages — sinon il ne prouve rien", () => {
    // Un test de garde qui ne parcourt rien passe au vert sans rien vérifier.
    expect(pages.length).toBeGreaterThan(30);
    expect(
      pages.some((p) => p.endsWith(join("calendrier", "page.tsx"))),
    ).toBe(true);
  });

  it("aucune page n'appelle une fonction qui invalide", () => {
    const fautives: string[] = [];
    for (const chemin of pages) {
      const source = readFileSync(chemin, "utf8");
      for (const fn of INVALIDENT) {
        // L'appel, pas la mention en commentaire ni l'import d'un homonyme.
        if (new RegExp(`(?<![\\w.])${fn}\\s*\\(`).test(source)) {
          fautives.push(`${relative(RACINE, chemin)} → ${fn}`);
        }
      }
    }

    expect(
      fautives,
      "Cette page appelle une fonction qui invalide le cache pendant son rendu. Next le refuse — « it must always happen outside of renders ». Séparez : une fonction qui fait le travail sans effet de cache pour la page, une action serveur qui l'enveloppe et invalide (cf. `regenererSansInvalider` / `genererCalendrier`).",
    ).toEqual([]);
  });
});
