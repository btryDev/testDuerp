/**
 * L'état de charge d'une zone, tel qu'il s'écrit sur sa carte.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LE DÉFAUT
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * `PastilleCharge` lisait un seul nombre — `nbEnRetard` — et en tirait deux
 * états : zéro, « À jour » ; sinon, « n à traiter ». Une zone où **rien n'a
 * jamais été déclaré** a naturellement zéro retard, et l'écran affirmait donc :
 *
 *     Terrasse et local technique · 0 équipement · À jour
 *
 * Relevé au contrôle visuel du 2026-09-03. Ce n'est pas une gêne de lecture :
 * c'est une **affirmation fausse sur un écran de conformité**, et la plus
 * coûteuse qui soit, puisqu'elle rassure. Le dépôt interdit exactement cela —
 * « l'outil assiste, il ne certifie pas ». Un lieu dont on ignore le parc n'est
 * pas conforme : il n'est pas encore renseigné.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TROIS ÉTATS, PAS DEUX — ET C'EST LA RÈGLE DU NON-RENSEIGNÉ
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * L'ADR-022 pose que **l'incertitude ne réduit jamais la couverture** : un
 * attribut non renseigné ne vaut pas « non ». Ici la même règle se lit à
 * l'envers et donne la même conclusion — un parc vide ne vaut pas « rien à
 * faire », il vaut « on ne sait pas encore ».
 *
 *   - `sansObjet`  — aucun équipement déclaré. L'outil n'a rien à dire, et il
 *                    le dit. Ni vert, ni rouge : ardoise.
 *   - `aJour`      — des équipements, aucune échéance dépassée. C'est le seul
 *                    cas où « à jour » repose sur quelque chose.
 *   - `enRetard`   — n échéances dépassées.
 *
 * `sansObjet` est **prioritaire** sur les deux autres : il se lit sur
 * `nbEquipements`, avant tout comptage de retard. C'est ce qui rend le défaut
 * structurellement inatteignable plutôt que corrigé au cas par cas — il n'y a
 * pas de chemin qui mène à `aJour` avec un parc vide, et le test le vérifie sur
 * tout le domaine plutôt que sur un exemple.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POURQUOI UNE FONCTION PLUTÔT QU'UN TERNAIRE DANS LE COMPOSANT
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Le ternaire fautif tenait sur une ligne, et c'est précisément ce qui l'a fait
 * passer trois revues. Sorti du JSX, l'état devient une **union discriminée**
 * que le compilateur ferme : ajouter un quatrième cas sans l'afficher ne compile
 * pas, et le rendre ailleurs — le dossier de conformité remis à un tiers, par
 * exemple — n'oblige plus à réécrire la règle une seconde fois.
 */

import { LIBELLE_ETAT_COURT } from "@/lib/calendrier/etats";

/** Ce qu'une carte de zone a le droit d'annoncer. Union fermée. */
export type EtatCharge =
  | { readonly nature: "sansObjet" }
  | { readonly nature: "aJour" }
  | { readonly nature: "enRetard"; readonly nbEnRetard: number };

/**
 * L'état d'une zone d'après son parc et ses échéances dépassées.
 *
 * `nbEquipements` d'abord : une zone sans équipement est `sansObjet` quoi que
 * dise le comptage de retard. Un `nbEnRetard` non nul sur un parc vide ne
 * devrait pas exister — mais s'il arrivait, dire « sans objet » d'un lieu vide
 * reste vrai, là où « à jour » serait faux.
 */
export function etatCharge({
  nbEquipements,
  nbEnRetard,
}: {
  nbEquipements: number;
  nbEnRetard: number;
}): EtatCharge {
  if (nbEquipements <= 0) return { nature: "sansObjet" };
  if (nbEnRetard > 0) return { nature: "enRetard", nbEnRetard };
  return { nature: "aJour" };
}

/**
 * Ce que la pastille écrit, par état.
 *
 * « Sans objet » et non « Rien à signaler » : la seconde dirait que l'outil a
 * regardé et n'a rien trouvé. Il n'a rien à regarder. Le mot porte exactement
 * ce qui est vrai — la question de la charge ne se pose pas —, et la carte a
 * déjà écrit pourquoi, juste au-dessus : « 0 équipement ». Deux mots suffisent
 * donc, et il n'y a pas la place pour davantage : le volume mesure 156 px dès
 * qu'une quatrième zone existe.
 *
 * `enRetard` ÉCRIVAIT « à traiter », ET C'ÉTAIT LE QUATRIÈME MOT D'UN MÊME
 * ÉTAT. À un clic de cette pastille, le relevé du hero disait « DÉPASSÉES », le
 * bandeau du parc « EN RETARD » et la carte d'un appareil « 5 dépassées » — le
 * dirigeant avait donc à deviner que ces quatre-là parlaient de la même chose.
 * Le mot vient désormais de `LIBELLE_ETAT_COURT` (`lib/calendrier/etats`), qui
 * tenait déjà la couleur de chaque état et tient maintenant son mot. La forme
 * courte, et pas la longue, parce que la place est celle qu'elle est ; c'est le
 * même mot abrégé, jamais un synonyme.
 *
 * `sansObjet` et `aJour` n'ont pas d'entrée là-bas et n'en auront pas : ce ne
 * sont pas des états d'échéance mais des états de ZONE — l'un dit qu'il n'y a
 * rien de déclaré, l'autre qu'aucune échéance n'est dépassée sur un parc qui,
 * lui, existe. Les faire entrer dans le registre des lignes ferait croire
 * qu'une occurrence peut être « sans objet ».
 */
export function libelleCharge(etat: EtatCharge): string {
  switch (etat.nature) {
    case "sansObjet":
      return "Sans objet";
    case "aJour":
      return "À jour";
    case "enRetard":
      return LIBELLE_ETAT_COURT.enRetard;
  }
}
