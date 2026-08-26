// Le vocabulaire du registre de sécurité.
//
// Deux écrans le consomment : la liste — l'état du document, fiche par fiche
// — et la fiche elle-même. `CorpsFicheRegistre` tranche pour la seconde
// quelle que soit la forme de saisie, et rend même la fiche que l'outil ne
// recueille pas encore : c'est ce qui empêche une fiche due de disparaître.

export { CorpsFicheRegistre } from "./CorpsFicheRegistre";
export { TeteFicheRegistre } from "./TeteFicheRegistre";
export { ContenuTenuAilleurs } from "./ContenuTenuAilleurs";
export { LigneRegistre, PartieRegistre } from "./LigneRegistre";
export { NavigationFiches, type FicheVoisine } from "./NavigationFiches";
export { JaugeRegistre } from "./JaugeRegistre";
export { PastilleCompletude } from "./PastilleCompletude";
export { FicheFormulaire } from "./FicheFormulaire";
export { FicheJournal } from "./FicheJournal";
export { FicheLecture } from "./FicheLecture";
export { ChampSaisie } from "./ChampSaisie";
// `completude`, `valeur` et `alimentation` ont quitté ce dossier pour
// `lib/registre` : ce sont des modules purs que le PDF consomme autant que
// l'écran, et un calcul partagé par les deux n'appartient à aucun. Ils
// s'importent de la lib, pas d'ici — ce baril ne rend que des composants.
export {
  ETAT_INITIAL,
  type ActionFiche,
  type EtatFiche,
  type LigneJournal,
} from "./types";
