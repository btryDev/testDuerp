/**
 * Ce que « répondue » veut dire pour une question de paramétrage —
 * ADR-025 § 7, migration 20260901170000.
 *
 * Une fonction nommée, et pas un `!== null` recopié dans la page : la règle
 * qu'elle porte est facile à écrire à l'envers, et l'envers ne se voit pas.
 * `faite: etab.epiPresents === true` compile, s'affiche correctement pour qui
 * répond « oui », et **rouvre indéfiniment la question à qui répond « non »**
 * — c'est-à-dire à la majorité des dossiers, donc à la majorité des
 * utilisateurs. La checklist qui ne s'efface jamais devient un reproche
 * permanent pour une question déjà traitée.
 *
 * `null` veut dire « pas encore répondu », jamais « non ». C'est aussi la
 * règle du non-renseigné de l'ADR-022, prise ici du côté de l'affichage :
 * l'incertitude est visible, elle n'est jamais rabattue sur une valeur.
 */
export function questionRepondue(valeur: boolean | null | undefined): boolean {
  return valeur === true || valeur === false;
}
