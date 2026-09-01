// La règle d'affichage du sélecteur d'établissement, sans la base.
//
// Elle est la sœur d'`estMultiBatiments` (`batiments/filtre.ts`) et pour la
// même raison : le mono ne paie pas la complexité du multi. Elle vit ici, pure,
// parce que `BarreCompte` est un composant client — un `queries.ts` y serait
// intestable, et un ternaire recopié dans le composant serait invérifiable.

/**
 * Un compte « multi-établissements » est celui qui en porte plus d'un. En
 * dessous, l'interface ne montre ni sélecteur ni commutation (ADR-028, même
 * sobriété que l'ADR-019 pour les bâtiments) : un menu déroulant à une entrée
 * annonce un choix qui n'existe pas.
 *
 * Attention à ce que la règle NE dit pas : elle porte sur la commutation, pas
 * sur la création. « Ajouter un établissement » doit rester atteignable à un
 * compte qui n'en a qu'un — c'est même le seul compte qui en a besoin.
 */
export function estMultiEtablissements(etablissements: { id: string }[]): boolean {
  return etablissements.length > 1;
}
