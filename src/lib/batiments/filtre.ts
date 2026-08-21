// Le filtre par bâtiment, sans la base.
//
// Trois écrans filtrent par bâtiment — le parc, le calendrier, la fiche
// d'établissement — et chacun réécrivait les mêmes deux règles de
// l'ADR-019 en trois lignes de ternaire. Elles vivent ici, une fois, et
// elles se testent sans prisma.

/**
 * Un établissement « multi-bâtiments » est celui qui en a plus d'un. Tant
 * que ce n'est pas le cas, l'interface ne montre ni sélecteur, ni colonne,
 * ni filtre (ADR-019) : le mono-bâtiment ne paie pas la complexité du
 * multi.
 */
export function estMultiBatiments(batiments: { id: string }[]): boolean {
  return batiments.length > 1;
}

/**
 * Le bâtiment réellement filtré, depuis ce que porte l'URL.
 *
 * Deux règles, et elles vont dans le même sens — ne jamais rétrécir un
 * écran sur une valeur que l'utilisateur n'a pas choisie :
 *
 *  - en dessous de deux bâtiments, il n'y a pas de filtre du tout, même
 *    si le paramètre nomme le seul bâtiment existant ;
 *  - un identifiant inconnu (URL périmée, mise en favori après la
 *    suppression d'un bâtiment, valeur forgée) vaut « tous », jamais
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
 * Restreint à un bâtiment une liste d'objets qui en portent un.
 * `undefined` — le cas courant — rend la liste telle quelle.
 */
export function restreindreAuBatiment<T extends { batimentId: string | null }>(
  objets: T[],
  batimentId: string | undefined,
): T[] {
  if (!batimentId) return objets;
  return objets.filter((o) => o.batimentId === batimentId);
}
