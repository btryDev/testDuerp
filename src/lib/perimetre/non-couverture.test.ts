import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  couverturesSansObligation,
  nonCouverturesContredites,
  obligationsRepondantA,
  piecesAttenduesDuReferentiel,
  piecesNommeesSansMarqueur,
  SURFACES_DE_COUVERTURE,
} from "./non-couverture-balayage";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** Un bac à sable avec les répertoires que le balayage attend. */
function bac(): string {
  const d = mkdtempSync(join(tmpdir(), "non-couverture-"));
  for (const surface of SURFACES_DE_COUVERTURE) {
    mkdirSync(join(d, surface), { recursive: true });
  }
  return d;
}

const ECRAN = join("src", "lib", "perimetre", "faux-texte.ts");

describe("ce que les textes de couverture affirment, et que le référentiel dément", () => {
  // POSÉ À ZÉRO DÈS LE PREMIER JOUR, et c'est ce qui en fait une garantie
  // plutôt qu'un compteur. Le défaut qui l'a motivée était unique et il est
  // corrigé dans le même lot : le règlement intérieur, annoncé non porté par
  // `/perimetre` et par le registre de sécurité alors que le lot 8 l'avait
  // livré.
  //
  // NE LE REMONTE PAS pour faire passer une phrase. Deux remèdes, jamais un
  // troisième : retirer l'affirmation devenue fausse, ou préciser le sujet
  // jusqu'à ce qu'il ne désigne plus que ce qui manque réellement. Le second
  // n'est pas une ruse — c'est le geste qui a transformé « le compartimentage »,
  // qui répond aussi au SSI d'un ERP, en « le compartimentage des immeubles de
  // grande hauteur », qui ne répond qu'à lui-même et qui dit au dirigeant de
  // quoi on parle.
  const PLAFOND = 0;

  it("aucune affirmation de non-couverture n'est démentie par le référentiel", () => {
    const contredites = nonCouverturesContredites(RACINE);
    expect(
      contredites.length,
      `${contredites.length} affirmation(s) de non-couverture que le ` +
        `référentiel dément (plafond ${PLAFOND}). Une page dont la raison ` +
        `d'être est de dire ce qui n'est pas couvert annonce un trou comblé.\n\n` +
        contredites
          .map(
            (a) =>
              `  « ${a.sujet} »  —  ${a.fichier}\n` +
              a.obligations
                .map((o) => `      ↳ ${o.id} : ${o.libelle}`)
                .join("\n"),
          )
          .join("\n"),
    ).toBeLessThanOrEqual(PLAFOND);
  });

  it("aucune affirmation de couverture ne promet ce que le référentiel n'a pas", () => {
    // L'autre moitié, et elle compte autant. Une page de couverture qui dit
    // « celle-ci, vous l'avez » sans que rien ne la porte est le même défaut
    // retourné, à ceci près qu'il rassure au lieu d'inquiéter.
    const sansFond = couverturesSansObligation(RACINE);
    expect(
      sansFond,
      sansFond.length === 0
        ? ""
        : `${sansFond.length} affirmation(s) de couverture que rien ne fonde : ` +
          sansFond.map((a) => `« ${a.sujet} » (${a.fichier})`).join(", ") +
          `. Soit l'obligation n'a jamais existé, soit elle est sortie du ` +
          `référentiel depuis — auquel cas la phrase est à retourner, pas à ` +
          `effacer.`,
    ).toEqual([]);
  });

  it("aucune pièce attendue du référentiel n'est nommée par une prose muette", () => {
    // LA RÈGLE QUI FERME LE CHEMIN D'ENTRÉE. Le lot 8 n'a pas menti dans un
    // `nonPorte()` — il a livré une obligation sous une prose que personne
    // n'avait déclarée. Sans cette règle, la garde n'attraperait que les
    // affirmations dont on a déjà pris la peine de dire qu'elles en sont.
    const muettes = piecesNommeesSansMarqueur(RACINE);
    expect(
      muettes,
      muettes.length === 0
        ? ""
        : `${muettes.length} pièce(s) du référentiel nommée(s) par un texte de ` +
          `couverture qui ne se déclare pas :\n` +
          muettes
            .map(
              (m) =>
                `  « ${m.piece} » — ${m.fichier}\n      … ${m.extrait} …\n` +
                m.obligations.map((o) => `      ↳ ${o.id}`).join("\n"),
            )
            .join("\n") +
          `\nEncadrez-la de \`nonPorte("…")\` ou de \`porte("…")\` : le ` +
          `balayage jugera alors l'affirmation au lieu de la laisser passer.`,
    ).toEqual([]);
  });
});

describe("le balayage voit vraiment ce qu'il prétend voir", () => {
  it("attrape une non-couverture démentie qu'on lui injecte, et nomme l'obligation", () => {
    // RÉINJECTION DU DÉFAUT D'ORIGINE, mot pour mot. Sans elle, un marqueur mal
    // écrit ou un rapprochement mort rendrait zéro et le test passerait au vert
    // en ne mesurant plus rien.
    const d = bac();
    try {
      writeFileSync(
        join(d, ECRAN),
        `import { nonPorte } from "./non-couverture";\n` +
          `export const P = \`des obligations que cet outil ne porte pas — \${nonPorte(\n` +
          `  "le règlement intérieur",\n` +
          `)} — s'ajoutent.\`;\n`,
      );
      const vues = nonCouverturesContredites(d);
      expect(vues.map((v) => v.sujet)).toContain("le règlement intérieur");
      expect(vues[0].obligations.map((o) => o.id)).toContain(
        "prevention-etablissement-reglement-interieur",
      );
      expect(vues[0].fichier).toBe(ECRAN);
    } finally {
      rmSync(d, { recursive: true, force: true });
    }
  });

  it("laisse passer une non-couverture que le référentiel ne dément pas", () => {
    // LA BORNE HAUTE. Si tout était rendu contredit, le test précédent
    // passerait aussi et ne prouverait rien. Le programme annuel de prévention
    // des risques n'est pas au référentiel — vérifié en l'appelant, pas au grep.
    const d = bac();
    try {
      writeFileSync(
        join(d, ECRAN),
        `export const P = \`\${nonPorte("le programme annuel de prévention des risques")}\`;\n`,
      );
      expect(nonCouverturesContredites(d)).toEqual([]);
    } finally {
      rmSync(d, { recursive: true, force: true });
    }
  });

  it("attrape une couverture promise que rien ne fonde", () => {
    const d = bac();
    try {
      writeFileSync(
        join(d, ECRAN),
        `export const P = \`\${porte("le brevet de pilote de ligne")}\`;\n`,
      );
      expect(couverturesSansObligation(d).map((a) => a.sujet)).toEqual([
        "le brevet de pilote de ligne",
      ]);
    } finally {
      rmSync(d, { recursive: true, force: true });
    }
  });

  it("attrape une pièce du référentiel nommée hors de tout marqueur", () => {
    const d = bac();
    try {
      writeFileSync(
        join(d, ECRAN),
        `export const P = "Votre registre de sécurité ne dit rien de tout ceci.";\n`,
      );
      const vues = piecesNommeesSansMarqueur(d);
      expect(vues.map((v) => v.piece)).toContain("registre de sécurité");
      expect(vues[0].extrait).toContain("registre de sécurité");
    } finally {
      rmSync(d, { recursive: true, force: true });
    }
  });

  it("ne compte pas deux fois une pièce déjà encadrée d'un marqueur", () => {
    // La couche voisine : la règle 3 juge la prose MUETTE, pas celle que les
    // règles 1 et 2 jugent déjà. Sans ceci, `porte("registre de sécurité")` —
    // vrai, fondé, et écrit exprès — ferait échouer les deux.
    const d = bac();
    try {
      writeFileSync(
        join(d, ECRAN),
        `export const P = \`Les mêmes se lisent en tête de votre \${porte(\n` +
          `  "registre de sécurité",\n` +
          `)}, avant son contenu.\`;\n`,
      );
      expect(piecesNommeesSansMarqueur(d)).toEqual([]);
      expect(couverturesSansObligation(d)).toEqual([]);
    } finally {
      rmSync(d, { recursive: true, force: true });
    }
  });

  it("ne lit pas ce qui est en commentaire, sur une ligne comme sur un bloc", () => {
    // Un commentaire qui nomme une obligation raconte une décision — celui de
    // `couverture.ts` nomme le règlement intérieur pour expliquer ce défaut-ci.
    // Le dirigeant ne le lit pas, et le compter rendrait la garde impossible à
    // documenter.
    const d = bac();
    try {
      writeFileSync(
        join(d, ECRAN),
        `// La phrase disait \${nonPorte("le règlement intérieur")}, à tort.\n` +
          `/*\n` +
          ` * Et son registre de sécurité n'y changeait rien.\n` +
          ` */\n` +
          `export const P = 1;\n`,
      );
      expect(nonCouverturesContredites(d)).toEqual([]);
      expect(piecesNommeesSansMarqueur(d)).toEqual([]);
    } finally {
      rmSync(d, { recursive: true, force: true });
    }
  });

  it("recolle une prose coupée en deux, par le formateur ou par un `+`", () => {
    // DEUX FAUX NÉGATIFS QUI SE RESSEMBLENT. La prose d'un écran est coupée en
    // fin de ligne par le formateur, et celle d'un module l'est parfois par une
    // concaténation. Une recherche ligne à ligne n'aurait vu ni l'une ni
    // l'autre — et c'est exactement la faute que `citations-ecran.ts` a faite
    // le 2026-09-02 sur les blocs de commentaire.
    const d = bac();
    try {
      writeFileSync(
        join(d, ECRAN),
        `export const A = "Rien de tout ceci n'est dans votre registre de " +\n` +
          `  "sécurité.";\n`,
      );
      expect(piecesNommeesSansMarqueur(d).map((v) => v.piece)).toContain(
        "registre de sécurité",
      );
    } finally {
      rmSync(d, { recursive: true, force: true });
    }

    const e = bac();
    try {
      writeFileSync(
        join(e, join("src", "app", "etablissements", "[id]", "perimetre", "page.tsx")),
        `export const E = () => (\n` +
          `  <p>\n` +
          `    Les mêmes se lisent en tête de votre registre de\n` +
          `    sécurité, avant son contenu.\n` +
          `  </p>\n` +
          `);\n`,
      );
      expect(piecesNommeesSansMarqueur(e).map((v) => v.piece)).toContain(
        "registre de sécurité",
      );
    } finally {
      rmSync(e, { recursive: true, force: true });
    }
  });

  it("distingue `porte` de la fin de `nonPorte`", () => {
    // Sans le garde-fou de gauche dans le motif, `porte` capturerait la fin de
    // `nonPorte` et toutes les affirmations de non-couverture seraient lues à
    // l'envers : le balayage passerait au vert en mesurant le contraire de ce
    // qu'il annonce.
    const d = bac();
    try {
      writeFileSync(
        join(d, ECRAN),
        `export const P = \`\${nonPorte("le règlement intérieur")}\`;\n`,
      );
      expect(couverturesSansObligation(d)).toEqual([]);
      expect(nonCouverturesContredites(d)).toHaveLength(1);
    } finally {
      rmSync(d, { recursive: true, force: true });
    }
  });
});

describe("la référence se dérive du référentiel, elle ne s'y recopie pas", () => {
  it("le rapprochement suit le référentiel article par article", () => {
    // Le sujet est cherché dans le libellé, la description et la pièce
    // attendue de CHAQUE obligation. Aucune liste d'exceptions, aucun
    // identifiant écrit à la main : le jour où une obligation entre ou sort, ce
    // que le balayage répond change avec elle.
    expect(
      obligationsRepondantA("le règlement intérieur").map((o) => o.id),
    ).toContain("prevention-etablissement-reglement-interieur");
    expect(obligationsRepondantA("le programme annuel de prévention des risques")).toEqual([]);
  });

  it("l'article initial et les accents ne décident de rien", () => {
    const nu = obligationsRepondantA("reglement interieur").map((o) => o.id);
    const habille = obligationsRepondantA("Le Règlement Intérieur").map((o) => o.id);
    expect(nu).toEqual(habille);
    expect(nu.length).toBeGreaterThan(0);
  });

  it("les pièces attendues viennent du référentiel et il y en a", () => {
    // Le filet de la règle 3 est fait des `pieceAttendue` du référentiel. S'il
    // devenait vide — un champ renommé, un accès qui ne rend plus rien —, la
    // règle 3 passerait au vert sans plus rien balayer.
    const pieces = piecesAttenduesDuReferentiel();
    expect(pieces.size).toBeGreaterThan(10);
    expect([...pieces.keys()]).toContain("règlement intérieur");
  });
});
