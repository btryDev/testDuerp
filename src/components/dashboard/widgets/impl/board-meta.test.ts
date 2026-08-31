import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Une seule politique de troncature pour les deux widgets qui rendent une
 * recommandation.
 *
 * `CarteTache` (« Par où commencer ») et `BlocAFaire` (« À faire ») ont des
 * mises en page légitimement différentes. Ce qui n'a aucune raison de diverger,
 * c'est ce qu'on s'autorise à couper d'une phrase écrite pour être lue — et
 * c'est pourtant ce qui a divergé.
 *
 * TROIS DÉFAUTS EN UNE JOURNÉE se sont logés dans ces deux fonctions : la file
 * amputée par `priorite <= 5`, la clé React en double, et la troncature du
 * sous-titre. Les deux premiers ont dû être signalés deux fois. Le troisième a
 * été corrigé d'un seul côté — **celui que personne ne voit**, puisque sur un
 * dossier neuf le tableau de bord affiche « À faire » et qu'il faut ajouter
 * « Par où commencer » à la main depuis le tiroir.
 *
 * Trois fois, c'est une donnée. Ce test garde la fusion.
 */

const SRC = readFileSync(
  join(process.cwd(), "src/components/dashboard/widgets/impl/board.tsx"),
  "utf8",
);

describe("la troncature des méta de recommandation", () => {
  it("passe par le composant partagé, jamais par un paragraphe écrit à la main", () => {
    // `{meta}` ne doit apparaître que dans un `MetaRecommandation`. Un
    // paragraphe posé à la main rouvrirait la divergence en silence : c'est
    // exactement ce qu'était le `truncate` resté dans `BlocAFaire`.
    const bruts = [
      ...SRC.matchAll(/<p[^>]*>\s*\{meta\}\s*<\/p>/g),
    ].map((m) => m[0]);
    expect(
      bruts,
      "Un `{meta}` est rendu dans un <p> écrit à la main. Employez " +
        "`MetaRecommandation`, qui tient la politique de troncature pour les " +
        "deux widgets.",
    ).toEqual([]);

    // Contre-épreuve : sans elle, renommer la variable rendrait ce test vert
    // et vide.
    expect(
      SRC.match(/<MetaRecommandation/g)?.length ?? 0,
      "Les deux widgets doivent employer le composant partagé.",
    ).toBe(2);
  });

  it("le composant clampe à deux lignes, ce sur quoi le budget est calibré", () => {
    // Le lien entre ce fichier et `recommandations.test.ts` : le seuil de
    // longueur y vaut deux lignes. Si le composant repassait à `truncate` —
    // donc à une ligne, ~104 signes — le budget de 170 deviendrait faux sans
    // que rien ne le dise. C'est l'erreur exacte qu'a commise sa première
    // rédaction : calibrée sur deux lignes quand le widget affiché n'en avait
    // qu'une, elle acceptait 138 signes que l'écran coupait.
    const composant = SRC.slice(
      SRC.indexOf("function MetaRecommandation("),
      SRC.indexOf("function CarteTache("),
    );
    expect(composant).toContain("line-clamp-2");
    expect(
      composant,
      "`truncate` ramène la méta à une ligne : le budget de longueur, calibré " +
        "sur deux, deviendrait faux.",
    ).not.toContain("truncate");
  });
});
