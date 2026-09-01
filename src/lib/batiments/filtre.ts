// Le filtre par zone, sans la base.
//
// Trois écrans filtrent par zone — le parc, le calendrier, la fiche
// d'établissement — et chacun réécrivait les mêmes deux règles de
// l'ADR-019 en trois lignes de ternaire. Elles vivent ici, une fois, et
// elles se testent sans prisma.
//
// Les fonctions gardent `Batiment` dans leur nom : le modèle s'appelle
// toujours ainsi en base (ADR-029), seul l'écran dit « zone ».

/**
 * Un établissement « multi-zones » est celui qui en a plus d'une. Tant que
 * ce n'est pas le cas, l'interface ne montre ni sélecteur, ni colonne, ni
 * filtre — et **ne prononce jamais le mot « zone »** : c'est le
 * comportement de l'ADR-019, que l'ADR-029 conserve mot pour mot. Un
 * dirigeant qui n'a qu'un local ne paie pas la complexité du multi.
 */
export function estMultiBatiments(batiments: { id: string }[]): boolean {
  return batiments.length > 1;
}

/**
 * La zone réellement filtrée, depuis ce que porte l'URL.
 *
 * Deux règles, et elles vont dans le même sens — ne jamais rétrécir un
 * écran sur une valeur que l'utilisateur n'a pas choisie :
 *
 *  - en dessous de deux zones, il n'y a pas de filtre du tout, même si le
 *    paramètre nomme la seule zone existante ;
 *  - un identifiant inconnu (URL périmée, mise en favori après la
 *    suppression d'une zone, valeur forgée) vaut « tous », jamais
 *    « aucun » : un écran vide se lirait comme un parc vide.
 */
export function resoudreFiltreBatiment(
  batiments: { id: string }[],
  brut: string | undefined,
): string | undefined {
  if (!estMultiBatiments(batiments)) return undefined;
  return batiments.some((b) => b.id === brut) ? brut : undefined;
}

/**
 * Restreint à une zone une liste d'objets qui en portent une.
 * `undefined` — le cas courant — rend la liste telle quelle.
 */
export function restreindreAuBatiment<T extends { batimentId: string | null }>(
  objets: T[],
  batimentId: string | undefined,
): T[] {
  if (!batimentId) return objets;
  return objets.filter((o) => o.batimentId === batimentId);
}
