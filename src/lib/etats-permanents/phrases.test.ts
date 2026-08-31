import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { phraseCompteur, phraseFaitsDates, phraseRestantes } from "./phrases";

/**
 * La garde que le contrôle visuel du 2026-08-31 a rendue nécessaire.
 *
 * L'écran a affiché « Elles n'entrepas dans le compte » : une locution coupée en
 * deux par un ternaire JSX, dont l'espace de jonction a disparu au rendu. Le
 * défaut n'était pas rattrapable par un test tant que la phrase n'existait
 * nulle part en entier.
 *
 * Ces tests balaient **toutes les branches d'accord**, y compris celles qu'un
 * dossier réel ne montre jamais — c'est la remarque du relecteur : si une
 * phrase assemblée est cassée, les autres peuvent l'être dans une branche non
 * exercée.
 */

/** Toutes les phrases du module, sur un éventail de comptes. */
function toutesLesPhrases(): { cas: string; texte: string }[] {
  const out: { cas: string; texte: string }[] = [];
  for (const n of [0, 1, 2, 3, 12, 19]) {
    const r = phraseRestantes(n);
    if (r) out.push({ cas: `restantes(${n})`, texte: r });
    out.push({ cas: `compteur(0,${n})`, texte: phraseCompteur(0, n) });
    out.push({ cas: `compteur(${n},${n})`, texte: phraseCompteur(n, n) });
    for (let k = 0; k <= n; k++) {
      const f = phraseFaitsDates(n, k);
      if (f) out.push({ cas: `faits(${n},${k})`, texte: f });
    }
  }
  return out;
}

describe("les phrases assemblées", () => {
  it("chaque branche rend EXACTEMENT la phrase attendue", () => {
    // La garde qui remplace une expression régulière trop maligne. Une première
    // version cherchait les collages par motif ; elle attrapait « n'entrepas »
    // parce qu'on l'avait écrit en dur dans le motif, et laissait passer
    // « lignereste ». Un défaut de jonction entre deux mots minuscules n'est pas
    // reconnaissable sans dictionnaire.
    //
    // Ce qui l'est, c'est l'égalité : quelqu'un écrit ici la phrase telle
    // qu'elle doit se lire, et toute jonction manquée fait diverger la chaîne.
    // C'est plus long à écrire et ça ne se trompe pas.
    expect(phraseRestantes(1)).toBe(
      "Une ligne reste à passer en revue. Une ligne non cochée n'est pas un manquement constaté : c'est une question à laquelle vous n'avez pas encore répondu.",
    );
    expect(phraseRestantes(12)).toBe(
      "12 lignes restent à passer en revue. Une ligne non cochée n'est pas un manquement constaté : c'est une question à laquelle vous n'avez pas encore répondu.",
    );

    expect(phraseFaitsDates(1, 0)).toBe(
      "Le texte fait revenir cette obligation, sans dire à quel rythme. Elle se date donc — « fait le » — au lieu de se déclarer en place, et elle n'entre pas dans le compte de l'en-tête, qui ne parle que d'états. Elle ne porte pas encore de date.",
    );
    expect(phraseFaitsDates(1, 1)).toBe(
      "Le texte fait revenir cette obligation, sans dire à quel rythme. Elle se date donc — « fait le » — au lieu de se déclarer en place, et elle n'entre pas dans le compte de l'en-tête, qui ne parle que d'états. Elle porte une date.",
    );
    expect(phraseFaitsDates(3, 1)).toBe(
      "Les textes font revenir ces 3 obligations, sans dire à quel rythme. Elles se datent donc — « fait le » — au lieu de se déclarer en place, et elles n'entrent pas dans le compte de l'en-tête, qui ne parle que d'états. 1 sur 3 portent une date.",
    );
    expect(phraseFaitsDates(3, 3)).toBe(
      "Les textes font revenir ces 3 obligations, sans dire à quel rythme. Elles se datent donc — « fait le » — au lieu de se déclarer en place, et elles n'entrent pas dans le compte de l'en-tête, qui ne parle que d'états. Toutes portent une date.",
    );
  });

  it("aucune ne double un espace ni n'en laisse traîner", () => {
    for (const { cas, texte } of toutesLesPhrases()) {
      expect(texte, cas).not.toMatch(/ {2}/);
      expect(texte, cas).toBe(texte.trim());
    }
  });

  it("chacune est une phrase finie", () => {
    for (const { cas, texte } of toutesLesPhrases()) {
      expect(texte.length, cas).toBeGreaterThan(0);
      // Les phrases complètes se terminent par un point ; le libellé du
      // compteur est un groupe nominal et n'en porte pas.
      if (cas.startsWith("compteur")) expect(texte, cas).not.toMatch(/\.$/);
      else expect(texte, cas).toMatch(/\.$/);
    }
  });

  it("s'accordent, et le singulier ne dit pas le pluriel", () => {
    expect(phraseRestantes(1)).toContain("Une ligne reste");
    expect(phraseRestantes(2)).toContain("2 lignes restent");
    expect(phraseRestantes(0)).toBeNull();

    const une = phraseFaitsDates(1, 0)!;
    expect(une).toContain("cette obligation");
    expect(une).toContain("Elle se date");
    expect(une).toContain("elle n'entre pas");
    expect(une).not.toContain("Elles");

    const deux = phraseFaitsDates(2, 0)!;
    expect(deux).toContain("ces 2 obligations");
    expect(deux).toContain("Elles se datent");
    expect(deux).toContain("elles n'entrent pas");
  });

  it("dit l'état des dates sans se contredire", () => {
    expect(phraseFaitsDates(3, 0)!).toContain("Aucune ne porte encore de date.");
    expect(phraseFaitsDates(3, 3)!).toContain("Toutes portent une date.");
    expect(phraseFaitsDates(3, 1)!).toContain("1 sur 3 portent une date.");
    expect(phraseFaitsDates(1, 1)!).toContain("Elle porte une date.");
    expect(phraseFaitsDates(1, 0)!).toContain("Elle ne porte pas encore de date.");
  });

  it("le compteur ne certifie jamais", () => {
    // Règle 8 de CLAUDE.md. La contrainte est ferme, elle mérite un test et
    // pas seulement un commentaire.
    for (const { texte } of toutesLesPhrases()) {
      expect(texte.toLowerCase()).not.toContain("conforme");
    }
    expect(phraseCompteur(0, 12)).toContain("par vous");
    expect(phraseCompteur(12, 12)).toContain("par vous");
  });

  it("le témoin : rien ne se rend vide, sur aucune branche", () => {
    // Sans lui, une fonction qui renverrait la chaîne vide partout passerait
    // les contrôles de forme — « pas de double espace » et « déjà trimé » sont
    // vrais d'une chaîne vide.
    let rendues = 0;
    for (const { texte } of toutesLesPhrases()) {
      expect(texte.split(" ").length).toBeGreaterThan(2);
      rendues += 1;
    }
    expect(rendues, "le balayage n'exerce plus aucune branche").toBeGreaterThan(20);
  });
});

describe("aucune phrase ne se recoud dans le JSX", () => {
  /**
   * **La garde générale, celle que le relecteur a demandée.** Corriger
   * « Elles n'entrepas » ne suffisait pas : le pied de page assemblait
   * plusieurs phrases par accord de nombre, et si l'une était cassée les autres
   * pouvaient l'être dans une branche qu'aucun dossier n'exerce.
   *
   * La règle est donc structurelle et non cosmétique : **aucun ternaire de
   * chaîne dans les `.tsx` de cet écran.** Un accord se décide dans
   * `phrases.ts`, où la phrase existe en entier — donc se lit, et se teste sur
   * toutes ses branches.
   *
   * Éprouvée en réinjectant le défaut : remettre
   * `{n === 1 ? "Elle n'entre" : "Elles n'entrent"} pas` dans la page fait
   * tomber ce test, avec le fichier et la ligne.
   */
  // Une chaîne peut contenir une apostrophe — « Elle n'entre » — donc la classe
  // qui décrit son contenu ne peut pas exclure la simple quote. La première
  // rédaction le faisait, et son propre témoin l'a montrée aveugle au défaut
  // qu'elle citait en exemple.
  const MOTIF_TERNAIRE_DE_CHAINE = /\?\s*"[^"]*"\s*:\s*"|\?\s*'[^']*'\s*:\s*'/;

  const TSX_DE_L_ECRAN = [
    "src/components/etats-permanents",
    "src/app/etablissements/[id]/etats-permanents",
  ];

  function tsx(dir: string, acc: string[] = []): string[] {
    for (const nom of readdirSync(dir)) {
      const chemin = join(dir, nom);
      if (statSync(chemin).isDirectory()) tsx(chemin, acc);
      else if (nom.endsWith(".tsx")) acc.push(chemin);
    }
    return acc;
  }

  it("aucun ternaire de chaîne dans les composants de l'écran", () => {
    // Un ternaire qui choisit entre deux littéraux de chaîne dans du JSX est
    // toujours un accord — et un accord coupé en deux est le défaut.
    const motif = MOTIF_TERNAIRE_DE_CHAINE;
    const fautifs: string[] = [];

    for (const rel of TSX_DE_L_ECRAN) {
      const dir = join(process.cwd(), rel);
      for (const f of tsx(dir)) {
        const lignes = readFileSync(f, "utf8").split("\n");
        lignes.forEach((l, i) => {
          if (motif.test(l)) fautifs.push(`${rel}/${basename(f)}:${i + 1}`);
        });
      }
    }

    expect(
      fautifs,
      "Un accord de nombre se décide dans `phrases.ts`, jamais dans le JSX : une locution coupée en deux confie sa cohésion à une règle de mise en page, et personne ne relit une phrase qui n'existe nulle part en entier.",
    ).toEqual([]);
  });

  it("le témoin : la garde reconnaît le défaut d'origine", () => {
    const motif = MOTIF_TERNAIRE_DE_CHAINE;
    expect(motif.test(`{n === 1 ? "Elle n'entre" : "Elles n'entrent"} pas`)).toBe(
      true,
    );
    expect(motif.test("{texteFaits && <p>{texteFaits}</p>}")).toBe(false);
    expect(motif.test("mode === \"etat\" ? etatIcon : faitIcon")).toBe(false);
  });
});
