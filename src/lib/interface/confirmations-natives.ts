// Aucune boîte de dialogue native ne garde un geste de l'application.
//
// POURQUOI CE MODULE EXISTE. Un navigateur qui a déjà ouvert deux boîtes
// natives propose « empêcher cette page d'ouvrir d'autres boîtes de dialogue ».
// Cochée — par lassitude, ou par une extension —, la case fait rendre `false`
// à `confirm()` **sans rien afficher**. Le `if (!confirm(…)) return;` prend
// alors systématiquement la sortie : le bouton ne fait plus rien, sans un mot,
// pour le reste de la visite.
//
// Le correctif du 2026-09-04 a retiré le `confirm()` de l'onboarding en
// affirmant que c'était le seul du dépôt. Il en restait **seize, dans quinze
// fichiers**, et quatorze gardaient une suppression — dont celle de
// l'établissement et celle de l'entreprise, qui emportent le dossier entier.
// L'affirmation n'était pas un mensonge : personne n'avait compté. C'est
// exactement ce que cette garde retire — la possibilité de ne pas compter.
//
// CE QUE LA RÈGLE DIT. Aucun appel à `confirm()` dans `src/`. Elle est simple
// à énoncer, donc simple à tenir, et surtout simple à confronter : elle n'a
// besoin d'aucun registre, d'aucune liste, d'aucun plafond. La question se
// pose dans la page (`components/ui-kit/Confirmation.tsx`), où rien ne peut la
// supprimer.
//
// CE QU'ELLE ATTRAPE. `confirm(…)`, `window.confirm(…)`, `globalThis.confirm(…)`
// et `self.confirm(…)`, sous n'importe quelle indentation, sur plusieurs lignes,
// et quel que soit le nom du fichier — le seizième vivait dans
// `PublicationPanel.tsx`, que personne n'aurait pensé à ouvrir en cherchant des
// boutons « Supprimer ». Elle nomme le fichier ET la ligne : un test qui dirait
// seulement « il en reste un » enverrait chercher.
//
// CE QU'ELLE LAISSE PASSER, et il faut le dire, sinon elle se lit comme un mur
// alors qu'elle est un filet :
//
//  - **`alert()` et `prompt()`**, qui partagent pourtant le défaut exact — la
//    même case les neutralise tous les trois. Le dépôt n'en a aucun ; la règle
//    est restée sur `confirm()` parce que c'est celle qui a été énoncée, et
//    l'élargir sans avoir rien à corriger aurait fait passer pour vérifiée une
//    interdiction que rien n'éprouve.
//  - **Un `confirm` atteint autrement** : `const c = window["conf" + "irm"]`,
//    ou une méthode d'objet (`api.confirm(…)`) que ce module écarte
//    volontairement pour ne pas relever tous les `.confirm()` métier. Une
//    garde qui lit du texte ne suit pas une indirection.
//  - **Une question réécrite à la main** au lieu d'employer le kit. Elle serait
//    correcte au sens de cette règle, et pourtant c'est le vrai chemin de la
//    prochaine divergence : c'est le kit qui tient l'emphase — la porte qui
//    détruit ne doit jamais être celle que l'œil choisit par défaut — et rien
//    ici ne le vérifie.
//  - **Ce qui n'est pas dans `src/`** : `scripts/`, `prisma/`. Aucun n'a de
//    DOM ; la règle n'y aurait pas de sens.
//
// POURQUOI LE TEXTE EST NETTOYÉ AVANT D'ÊTRE LU. Un `grep confirm(` rend six
// faux positifs sur ce dépôt : le commentaire de `WizardShell.tsx` qui raconte
// le défaut, celui du kit, ceux d'ici, et les chaînes de ce module même. Une
// garde qui crie sur ses propres explications finit par être contournée, ou
// pire, désactivée. `sansCommentairesNiChaines` remplace commentaires et
// chaînes par des espaces — **même longueur, retours à la ligne conservés** —
// pour que le numéro de ligne reste juste, et c'est ce qui permet au test de
// balayer ce fichier-ci et son propre test sans les excepter : leurs exemples
// sont des chaînes, donc ils s'effacent. Aucun fichier n'est mis à part, et
// c'est la propriété qui compte : une garde avec une exception a une porte.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Les appels de dialogue natif reconnus.
 *
 * `(?<![\w$.])` n'est pas décoratif : sans lui, `demanderConfirmation(` et
 * `motDePasseConfirm(` seraient relevés, et une garde qui crie faux se
 * désactive. Le point dans la classe écarte `api.confirm(` — un appel de
 * méthode homonyme, pas la boîte du navigateur —, et les trois porteurs
 * globaux sont donc nommés explicitement pour rester pris.
 *
 * `\s*` avant la parenthèse : `confirm (…)` est un appel valide, et un
 * formateur peut écrire `window\n  .confirm(` — d'où `\s*` autour du point.
 */
const APPEL_NATIF = /(?<![\w$.])(?:(?:window|globalThis|self)\s*\.\s*)?confirm\s*\(/g;

/** Un appel relevé, avec de quoi aller le corriger. */
export type AppelNatif = {
  /** 1-indexé, comme un éditeur. */
  ligne: number;
  /** La ligne source telle quelle, pour reconnaître l'appel sans l'ouvrir. */
  extrait: string;
};

/**
 * Le source réduit à son code : commentaires et chaînes deviennent des
 * espaces, à longueur égale.
 *
 * Deux précautions, chacune contre un faux négatif :
 *
 *  - **une apostrophe non fermée ne mange pas la suite du fichier.** Une
 *    chaîne `'…'` ou `"…"` ne franchit pas une fin de ligne en JavaScript :
 *    si le guillemet ouvrant n'a pas de fermant sur sa ligne, ce n'en est pas
 *    un — c'est un caractère dans une regex (`/['"]/`), dans du JSX, ou une
 *    apostrophe française. Sans cette borne, un seul `/["']/` quelque part
 *    aurait effacé tout ce qui suit, et la garde serait passée au vert en ne
 *    lisant plus rien.
 *  - **`${…}` d'un gabarit revient au code.** Un appel écrit dans une
 *    interpolation reste du code, et doit rester vu.
 */
export function sansCommentairesNiChaines(source: string): string {
  const sortie = source.split("");
  const blanchir = (debut: number, fin: number) => {
    for (let k = debut; k < fin && k < sortie.length; k++) {
      if (sortie[k] !== "\n") sortie[k] = " ";
    }
  };

  // Une pile, parce que les gabarits s'imbriquent : `` `a${ `b${c}` }` ``. Le
  // compteur d'accolades qui l'accompagne distingue le `}` qui ferme une
  // interpolation de celui d'un objet écrit dedans — `${JSON.stringify({a:1})}`
  // sortait du gabarit trop tôt sans lui, et le reste du fichier était lu de
  // travers.
  const pile: Array<"code" | "gabarit" | "interpolation"> = ["code"];
  const accolades: number[] = [0];
  let i = 0;

  while (i < source.length) {
    const haut = pile[pile.length - 1];
    const c = source[i];
    const suivant = source[i + 1];

    if (haut === "gabarit") {
      if (c === "\\") {
        blanchir(i, i + 2);
        i += 2;
        continue;
      }
      if (c === "`") {
        blanchir(i, i + 1);
        pile.pop();
        i++;
        continue;
      }
      if (c === "$" && suivant === "{") {
        // Le `${` s'efface, mais pas ce qu'il contient : une interpolation
        // est du code, et un appel qui s'y cacherait doit rester vu.
        blanchir(i, i + 2);
        pile.push("interpolation");
        accolades.push(0);
        i += 2;
        continue;
      }
      blanchir(i, i + 1);
      i++;
      continue;
    }

    if (c === "/" && suivant === "/") {
      const fin = source.indexOf("\n", i);
      const bout = fin === -1 ? source.length : fin;
      blanchir(i, bout);
      i = bout;
      continue;
    }
    if (c === "/" && suivant === "*") {
      const fin = source.indexOf("*/", i + 2);
      const bout = fin === -1 ? source.length : fin + 2;
      blanchir(i, bout);
      i = bout;
      continue;
    }
    if (c === '"' || c === "'") {
      const finLigne = source.indexOf("\n", i);
      const borne = finLigne === -1 ? source.length : finLigne;
      let j = i + 1;
      while (j < borne) {
        if (source[j] === "\\") {
          j += 2;
          continue;
        }
        if (source[j] === c) break;
        j++;
      }
      if (j < borne && source[j] === c) {
        blanchir(i, j + 1);
        i = j + 1;
        continue;
      }
      // Pas de fermant sur la ligne : ce n'était pas une chaîne.
      i++;
      continue;
    }
    if (c === "`") {
      blanchir(i, i + 1);
      pile.push("gabarit");
      i++;
      continue;
    }
    if (haut === "interpolation") {
      if (c === "{") {
        accolades[accolades.length - 1]++;
        i++;
        continue;
      }
      if (c === "}") {
        if (accolades[accolades.length - 1] === 0) {
          blanchir(i, i + 1);
          pile.pop();
          accolades.pop();
          i++;
          continue;
        }
        accolades[accolades.length - 1]--;
        i++;
        continue;
      }
    }
    i++;
  }

  return sortie.join("");
}

/** Les appels de dialogue natif d'un source, ligne par ligne. */
export function appelsNatifs(source: string): AppelNatif[] {
  const code = sansCommentairesNiChaines(source);
  const lignes = source.split("\n");
  const releves: AppelNatif[] = [];

  APPEL_NATIF.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = APPEL_NATIF.exec(code)) !== null) {
    const ligne = code.slice(0, m.index).split("\n").length;
    releves.push({ ligne, extrait: lignes[ligne - 1]?.trim() ?? "" });
  }
  return releves;
}

/** Un appel relevé, situé dans le dépôt. */
export type AppelSitue = AppelNatif & { fichier: string };

/**
 * Tout `src/`, sans exception ni liste — y compris ce module et son test.
 *
 * Exportée à part pour que le test puisse établir que le balayage balaie :
 * un parcours qui n'entrerait dans aucun dossier rendrait zéro appel, et la
 * garde serait verte en ne lisant rien.
 */
export function fichiersSources(racine: string): string[] {
  const trouves: string[] = [];
  const descendre = (dossier: string) => {
    for (const entree of readdirSync(dossier)) {
      if (entree === "node_modules" || entree === ".next") continue;
      const chemin = join(dossier, entree);
      if (statSync(chemin).isDirectory()) descendre(chemin);
      else if (/\.(ts|tsx)$/.test(entree)) trouves.push(chemin);
    }
  };
  descendre(join(racine, "src"));
  return trouves;
}

/**
 * Les appels de dialogue natif de tout `src/`, situés.
 *
 * Le balayage lit le système de fichiers ; il n'est atteint que par le test,
 * jamais par un écran.
 */
export function balayerSources(racine: string): AppelSitue[] {
  return fichiersSources(racine).flatMap((chemin) =>
    appelsNatifs(readFileSync(chemin, "utf8")).map((appel) => ({
      ...appel,
      fichier: relative(racine, chemin),
    })),
  );
}
