// Les phrases par lesquelles un dossier de conformité dit ce qu'il ne couvre
// pas.
//
// Même raison d'être que `mentions-couverture.ts`, un cran plus haut :
// celui-là porte les mentions du **DUERP** (ADR-020), celui-ci celles du
// **dossier** — les cinq axes de `lib/perimetre/couverture.ts`. Les deux
// existent parce que le dossier `pdf/` n'a presque aucun test de rendu : une
// condition inversée dans le JSX passait la suite verte, alors que ces
// phrases sont la seule chose qui empêche un document d'apparence complète
// d'être lu comme exhaustif.
//
// Sorties du JSX, elles se vérifient. Le document n'a plus qu'à les rendre
// dans l'ordre, sans décider de rien.
//
// Module **pur**.

import type { CouvertureEtablissement } from "@/lib/perimetre/couverture";

export type BlocPerimetre = {
  /** Le fait, en tête de paragraphe. */
  titre: string;
  /** Ce que le document ne dit donc pas. */
  corps: string;
};

/**
 * La phrase d'introduction du bloc, ou `null` s'il n'y a rien à écrire.
 *
 * Un dossier sans manque identifié n'écrit **rien** : pas même « ce dossier
 * couvre tout ». Le référentiel a un périmètre, le droit n'en a pas, et une
 * mention rassurante sur une pièce conservée serait une affirmation que rien
 * ne fonde.
 */
export function chapeauPerimetre(
  couverture: CouvertureEtablissement,
): string | null {
  const n = couverture.manques.length + couverture.indeterminations.length;
  if (n === 0) return null;
  return (
    "Ce dossier est produit à partir du référentiel de Rojer, qui a un " +
    "périmètre. Les points ci-dessous nomment ce que ce référentiel ne " +
    "traite pas pour cet établissement, à la date d'édition. Ils ne " +
    "qualifient pas la situation de l'établissement au regard du droit : " +
    "une obligation non traitée ici reste due si un texte l'impose."
  );
}

/**
 * Les blocs à imprimer, dans l'ordre. Tableau vide = rien à ajouter, et c'est
 * un état normal.
 *
 * Les manques d'abord, les questions ouvertes ensuite — un fait établi se lit
 * avant une question à laquelle personne n'a répondu. Le détail article par
 * article (`details`) n'est **pas** imprimé : le dossier de conformité se
 * remet à un tiers, et vingt-sept motifs de dépouillement rédigés pour un
 * relecteur interne y seraient illisibles. Le décompte, lui, y est.
 */
export function blocsPerimetre(
  couverture: CouvertureEtablissement,
): BlocPerimetre[] {
  return [
    ...couverture.manques.map((m) => ({ titre: m.motif, corps: m.consequence })),
    ...couverture.indeterminations.map((i) => ({
      titre: i.motif,
      corps: i.quoiFaire,
    })),
  ];
}
