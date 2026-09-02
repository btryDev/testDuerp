// Ce que les écrans citent, et que le corpus ne connaît pas.
//
// POURQUOI CE MODULE EXISTE. Le corpus garantit qu'aucune OBLIGATION ne
// s'appuie sur un texte non dépouillé — `corpus.test.ts` le tient à zéro. Mais
// une obligation n'est pas la seule chose qui cite du droit au dirigeant : les
// écrans, les PDF et les exports en citent aussi, en prose, hors du mécanisme.
// Et là, rien ne vérifiait rien.
//
// Trois cas constatés le 2026-09-02, chacun sur une surface que l'utilisateur
// voit :
//
//  - `R. 4121-2` — la mise à jour du DUERP, affichée avec son seuil d'effectif
//    sur l'écran de synthèse. Personne n'a ouvert l'article.
//  - `R. 4512-7` — le plan de prévention, affiché avec un EXTRAIT entre
//    guillemets. Aucun `R. 4512-*` n'est au corpus : le verbatim montré au
//    dirigeant ne vient d'aucun relevé.
//  - `R. 4323-99` — les vérifications périodiques des EPI, en documents
//    obligatoires, sur la même mécanique d'habilitation par arrêté que
//    `R. 4323-23` — que le dépôt a instruite, elle.
//
// CE QUE CE MODULE NE DIT PAS. Qu'une citation soit fausse. Elle est
// probablement juste : ces articles sont connus, et la prose qui les entoure a
// été écrite par quelqu'un qui savait de quoi il parlait. Ce module dit
// seulement que **rien dans le dépôt ne le prouve** — pas de version constatée,
// pas de verbatim, pas de date de lecture. C'est la différence entre une
// affirmation et un fondement, et c'est la seule chose que le corpus mesure.
//
// LE PÉRIMÈTRE DU BALAYAGE est celui des surfaces qui s'affichent : les écrans,
// les composants, les documents générés. Pas `referentiels/` lui-même, dont les
// citations passent déjà par `ReferenceLegale` et sont rapprochées du corpus
// par ailleurs — les mesurer ici les compterait deux fois, avec deux règles
// différentes.
//
// LES LIGNES DE COMMENTAIRE SONT EXCLUES, et c'est délibéré. Un commentaire qui
// cite un article raconte une décision — souvent une correction, comme ceux de
// `code-travail-secours.ts` qui expliquent pourquoi un `grep` sur `R. 4224-15`
// rend des résultats trompeurs. Le dirigeant ne les lit pas.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { CORPUS } from "./index";

/** Les répertoires dont le contenu atteint l'utilisateur. */
export const SURFACES_AFFICHEES = [
  "src/app",
  "src/components",
  "src/lib/pdf",
] as const;

/**
 * Un article du droit français cité en clair : `R. 4121-2`, `L. 4711-5`,
 * `D. 8222-5`, et les formes à deux tirets comme `R. 4121-1-1`.
 */
const MOTIF_ARTICLE = /\b[LRD]\.\s?\d{4}-\d+(?:-\d+)*\b/g;

const normaliser = (ref: string) => ref.replace(/\s+/g, " ").trim();

/** Toutes les clés d'article que le corpus déclare avoir dépouillées. */
export function articlesDuCorpus(): Set<string> {
  const cles = new Set<string>();
  for (const corpus of CORPUS) {
    for (const article of corpus.articles) cles.add(normaliser(article.ref));
  }
  return cles;
}

function fichiersSources(racine: string, dossier: string): string[] {
  const chemin = join(racine, dossier);
  const trouves: string[] = [];
  const descendre = (d: string) => {
    for (const entree of readdirSync(d)) {
      const p = join(d, entree);
      if (statSync(p).isDirectory()) {
        if (entree !== "node_modules") descendre(p);
      } else if (/\.tsx?$/.test(p) && !/\.test\./.test(p)) {
        trouves.push(p);
      }
    }
  };
  descendre(chemin);
  return trouves;
}

export type CitationOrpheline = {
  /** La clé d'article, normalisée. */
  ref: string;
  /** Où elle apparaît, en `chemin:ligne`, relatif à la racine du dépôt. */
  emplacements: string[];
};

/**
 * Les articles cités sur une surface qui s'affiche, et qu'aucun corpus ne
 * déclare avoir ouverts.
 */
export function citationsSansCorpus(racine: string): CitationOrpheline[] {
  const connus = articlesDuCorpus();
  const orphelines = new Map<string, string[]>();

  for (const dossier of SURFACES_AFFICHEES) {
    for (const fichier of fichiersSources(racine, dossier)) {
      const lignes = readFileSync(fichier, "utf8").split("\n");
      lignes.forEach((ligne, index) => {
        const nue = ligne.trim();
        if (nue.startsWith("//") || nue.startsWith("*") || nue.startsWith("/*")) {
          return;
        }
        for (const trouve of ligne.matchAll(MOTIF_ARTICLE)) {
          const ref = normaliser(trouve[0]);
          if (connus.has(ref)) continue;
          const ou = `${fichier.slice(racine.length + 1)}:${index + 1}`;
          const deja = orphelines.get(ref);
          if (deja) deja.push(ou);
          else orphelines.set(ref, [ou]);
        }
      });
    }
  }

  return [...orphelines]
    .map(([ref, emplacements]) => ({ ref, emplacements }))
    .sort((a, b) => a.ref.localeCompare(b.ref));
}
