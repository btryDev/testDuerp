/**
 * L'ordre des lignes de « Ce qui doit être en place ».
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IL NE DÉPEND PAS DE LA DÉCLARATION, ET C'EST TOUT SON OBJET
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * L'ordre précédent poussait les lignes déclarées au bas de leur groupe — « un
 * écran dont le haut est déjà coché ne dit pas ce qu'il reste ». L'intention
 * était juste et la conséquence ne l'était pas : **la liste se réordonne sous
 * la souris**. Déclarer la première ligne d'un domaine la fait descendre au
 * bas du groupe, et toutes les suivantes remontent d'un rang.
 *
 * Constaté au contrôle visuel du 2026-09-03, puis reproduit : sur l'écran de
 * démonstration, « Consignation des rapports de vérification électrique »
 * occupait le premier rang d'ÉLECTRICITÉ ; une fois déclarée, elle passait au
 * troisième et « Habilitation électrique du personnel » prenait sa place. **Deux
 * clics au même pixel déclaraient deux obligations différentes**, la seconde
 * non voulue.
 *
 * Sur une page qui invite à passer vingt-huit lignes en revue de haut en bas,
 * ce n'est pas une gêne : c'est une fabrique de déclarations fausses. Et ces
 * déclarations ne sont pas cosmétiques — la page écrit elle-même que ce qui est
 * déclaré part au dossier de conformité remis à un tiers, avec sa date.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POURQUOI UN ORDRE FIGÉ PLUTÔT QU'UN REGROUPEMENT DIFFÉRÉ
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Trois remèdes se présentaient : figer l'ordre le temps de la revue (le tenir
 * côté client), retarder le regroupement au rechargement suivant, ou renoncer
 * au tri par état. Les deux premiers gardent le tri en le rendant paresseux :
 * ils font dépendre une garantie de sûreté d'un état de composant qui survit à
 * un rendu — et le jour où un `key` change ou où l'on navigue et revient,
 * l'ordre se rejoue et le défaut revient, silencieusement.
 *
 * Le troisième la rend structurelle : **si l'ordre ne lit pas la déclaration,
 * aucune déclaration ne peut le changer.** Rien à figer, rien qui puisse
 * dégeler.
 *
 * Ce qu'on perd — les lignes restantes groupées en haut — n'était de toute
 * façon pas ce que cet écran demande. Il demande une REVUE : « Passez-les en
 * revue », dit son chapeau, et une revue se fait une fois de haut en bas. Ce
 * qu'il reste se lit au compteur d'en-tête (« 3 sur 28 »), qui ne bouge pas
 * sous le curseur.
 *
 * Et c'est ce que l'ADR-027 demande par ailleurs : une déclaration doit rester
 * **révocable et lisible**. Une ligne qui saute ailleurs au moment où on la
 * déclare est plus difficile à défaire qu'à faire ; celle qui reste sous le
 * curseur porte immédiatement « Revenir dessus ».
 */

/** Ce dont l'ordre a besoin, et rien de plus — surtout pas `declareLe`. */
export type LigneOrdonnable = {
  obligation: { id: string; libelle: string };
};

/**
 * Compare deux lignes. **Ne lit que le libellé et l'identifiant** : c'est cette
 * signature qui porte la garantie, plus qu'aucun commentaire — une comparaison
 * qui n'a pas accès à la date de déclaration ne peut pas en dépendre.
 *
 * L'identifiant départage les libellés identiques, pour que l'ordre soit total
 * et non seulement stable : `Array.prototype.sort` est stable depuis ES2019,
 * mais l'entrée qu'on lui donne vient d'un parcours du référentiel dont rien ne
 * garantit qu'il ne sera pas réordonné un jour.
 */
export function comparerLignes(a: LigneOrdonnable, b: LigneOrdonnable): number {
  const parLibelle = a.obligation.libelle.localeCompare(
    b.obligation.libelle,
    "fr",
  );
  return parLibelle !== 0
    ? parLibelle
    : a.obligation.id.localeCompare(b.obligation.id);
}

/** Trie une liste de lignes en place, et la rend. */
export function ordonnerLignes<T extends LigneOrdonnable>(lignes: T[]): T[] {
  return lignes.sort(comparerLignes);
}
