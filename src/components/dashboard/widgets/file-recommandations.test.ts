import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Le défaut que ce fichier verrouille était **invisible partout où l'on
 * regarde d'habitude**, et c'est ce qui le rend intéressant.
 *
 * Le moteur (`lib/dashboard/recommandations.ts`) trie par priorité, puis par
 * date, et un test vérifie déjà qu'« une urgence réelle passe toujours devant
 * une amorce ». Ce test était vert, et il avait raison : le moteur faisait son
 * travail. C'est la CARTE qui défaisait le tri, deux fichiers plus loin :
 *
 *     const reelles = recommandations.filter((r) => r.priorite <= 5);
 *     const file = (reelles.length > 0 ? reelles : recommandations).slice(0, n);
 *
 * Écrit pour dire « les urgences d'abord », il dit en réalité : dès qu'il
 * existe **une seule** recommandation de priorité ≤ 5, tout le reste **sort
 * de la file** au lieu de passer derrière.
 *
 * Ce qu'il a coûté : l'ADR-024 écrit « Priorités 9 et 10, donc DERRIÈRE les
 * amorçages » pour les transmissions — la seule famille de recommandations de
 * ce produit qui ne soit pas fondée sur une date, et le cœur du mécanisme de
 * conséquence. Sur un dossier de démonstration à 27 retards, elle n'apparaît
 * sur aucune carte. Un dossier sans la moindre urgence l'aurait montrée,
 * c'est-à-dire à peu près aucun dossier réel. La fonctionnalité était livrée,
 * testée, relue trois fois — et n'atteignait personne.
 *
 * Elle a été trouvée **à l'écran**, en ajoutant le widget depuis le tiroir et
 * en lisant ce qu'il affichait. Aucun test unitaire ne pouvait la voir : le
 * moteur rendait la bonne liste, la carte la tronquait après coup.
 *
 * D'où cette garde, qui lit le source plutôt que d'exécuter : la forme
 * fautive se fabrique à l'écriture, et elle compile parfaitement.
 */

// Quatre niveaux : ce fichier vit dans `src/components/dashboard/widgets/`.
const RACINE = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);

function fichiersSource(dir: string, acc: string[] = []): string[] {
  for (const nom of readdirSync(dir)) {
    if (nom === "node_modules" || nom === ".next") continue;
    const chemin = join(dir, nom);
    if (statSync(chemin).isDirectory()) fichiersSource(chemin, acc);
    else if (/\.tsx?$/.test(nom) && !nom.includes(".test.")) acc.push(chemin);
  }
  return acc;
}

describe("la file de recommandations n'est jamais amputée", () => {
  it("aucune carte ne repartitionne les recommandations sur la priorité", () => {
    const fautifs: string[] = [];

    for (const chemin of fichiersSource(join(RACINE, "src"))) {
      const source = readFileSync(chemin, "utf8");
      // Le tri appartient au moteur. Le comparer ailleurs redérive une règle
      // qui existe déjà, et c'est exactement comme ça que celle-ci s'est
      // perdue.
      if (relative(RACINE, chemin).endsWith("lib/dashboard/recommandations.ts"))
        continue;
      // Deux restrictions, et sans elles la garde crie à tort : seuls les
      // fichiers qui manipulent des recommandations sont concernés — un
      // `PermisFeu` porte aussi une `priorite`, qui n'a rien à voir —, et
      // seuls les ORDRES (`<`, `>`) trient ou partitionnent. Une égalité
      // désigne un item précis, elle n'ampute rien.
      if (!source.includes("recommandations")) continue;
      const filtres = source.match(/\.priorite\s*[<>]=?/g);
      if (filtres) {
        fautifs.push(
          `${relative(RACINE, chemin)} → ${[...new Set(filtres)].join(" , ")}`,
        );
      }
    }

    expect(
      fautifs,
      "La priorité d'une recommandation ne se compare qu'à un endroit : le moteur, qui trie déjà. La comparer ailleurs pour choisir ce qu'on montre finit par faire SORTIR de la file ce qui devait passer derrière — c'est ce qui a rendu les transmissions de l'ADR-024 invisibles sur tout dossier ayant une urgence. Prenez la tête de la liste telle que le moteur la rend.",
    ).toEqual([]);
  });

  it("aucune carte ne rattrape une liste vide par un repli sur la liste entière", () => {
    // La seconde moitié de la forme fautive, et la plus trompeuse : le
    // `x.length > 0 ? x : tout` a l'air d'un garde-fou contre une carte
    // vide. C'est en réalité l'aveu que le filtre au-dessus retire trop.
    const fautifs: string[] = [];

    for (const chemin of fichiersSource(join(RACINE, "src"))) {
      const source = readFileSync(chemin, "utf8");
      if (/\.length\s*>\s*0\s*\?\s*\w+\s*:\s*recommandations/.test(source)) {
        fautifs.push(relative(RACINE, chemin));
      }
    }

    expect(
      fautifs,
      "Un repli « si ma sélection est vide, prends tout » dit que la sélection retire ce qu'elle devrait garder. Ne sélectionnez pas : le moteur a trié.",
    ).toEqual([]);
  });
});
