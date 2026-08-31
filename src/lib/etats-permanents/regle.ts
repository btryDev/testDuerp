/**
 * Ce qui n'a pas de rendez-vous, et qu'un écran doit pourtant montrer.
 *
 * L'ADR-022 nomme quatre natures d'obligation. La première — l'échéance
 * récurrente — a un écran depuis le début : le calendrier. Les trois autres
 * n'en avaient aucun, et le contrôle visuel du 2026-08-31 l'a mesuré : sur un
 * dossier né de l'onboarding, le moteur calculait dix-huit obligations et
 * l'application en affichait deux.
 *
 * Ce module tient la règle qui décide **quelles obligations relèvent de l'écran
 * « Ce qui doit être en place »**, et **sous quel verbe**. Il ne rend rien : la
 * garde tracée le 2026-08-31 après trois défauts nés de deux widgets jumeaux
 * dit « partage la règle, pas la mise en page ». C'est la règle, elle vit ici,
 * et le générateur de calendrier s'en sert aussi.
 *
 * ## Le critère n'est pas « pas de périodicité »
 *
 * Une première rédaction du brief dimensionnait cet écran sur les quarante-trois
 * obligations à `periodicite: "autre"`. Ce critère mélange quatre natures :
 * mesuré sur le référentiel du 2026-08-31, il rassemble 29 états permanents,
 * 4 échéances récurrentes à rythme inconnu, 7 événementielles et 3 ponctuelles.
 * Une case « déclaré en place » ment aux trois dernières familles — une
 * obligation événementielle redevient due au fait suivant, et rien dans le
 * produit n'observe ce fait.
 *
 * Le critère est donc la **nature**, et elle est un champ du référentiel depuis
 * l'ADR-026.
 *
 * ## Mais la nature seule ne suffit pas non plus
 *
 * `nature === "etat_permanent"` compte **trente** obligations, et l'une d'elles
 * produit bel et bien une ligne de calendrier : `porte-auto-portail-piete-coulissant`
 * est un état permanent porté par un équipement, avec
 * `periodicite: "mise_en_service_uniquement"` — que le générateur date de la
 * mise en service au lieu de la sauter. La retenir ici lui donnerait **deux
 * surfaces** : une ligne au calendrier et une case sur cet écran, deux états qui
 * divergeraient à la première correction. C'est exactement le défaut que la
 * journée du 2026-08-31 a passé à retirer.
 *
 * D'où `estSansRendezVous()` : la condition n'est pas « pas de périodicité »
 * mais **« le générateur n'en produit aucune ligne »**. Les deux se ressemblent
 * et ne coïncident pas.
 *
 * ## La périodicité effective, pas celle du référentiel
 *
 * `generateur.ts` lit la périodicité **après surcharge** d'une prescription
 * particulière (ADR-014) : un arrêté préfectoral peut donner un rythme à une
 * obligation qui n'en avait pas. Ce jour-là, l'obligation quitte cet écran pour
 * le calendrier — elle a un rendez-vous. La règle prend donc la périodicité
 * effective en paramètre plutôt que de la lire sur l'obligation.
 */

import type { Obligation } from "../referentiels/conformite";
import type { Periodicite } from "../referentiels/types-communs";

/**
 * Le générateur produit-il une ligne de calendrier pour cette périodicité ?
 *
 * **Source unique de la règle**, appelée par `generateur.ts` et par cet écran.
 * Écrite ici plutôt que dupliquée des deux côtés : deux lectures d'une même
 * règle finissent par diverger, et le jour où elles divergent une obligation
 * apparaît aux deux endroits ou à aucun.
 *
 * `mise_en_service_uniquement` produit bien une ligne — le générateur la date de
 * la mise en service quand il la connaît. Seule `autre` n'en produit aucune.
 */
export function estSansRendezVous(periodicite: Periodicite): boolean {
  return periodicite === "autre";
}

/**
 * L'obligation se déclare-t-elle « en place » ?
 *
 * Un état à constituer puis à maintenir, dont le produit ne peut tenir aucune
 * date : soit il est là, soit il ne l'est pas.
 */
export function estEtatADeclarer(
  o: Obligation,
  periodiciteEffective: Periodicite = o.periodicite,
): boolean {
  return o.nature === "etat_permanent" && estSansRendezVous(periodiciteEffective);
}

/**
 * Les obligations que le texte fait revenir sans dire à quel rythme.
 *
 * Elles tiennent sur cet écran **sous un autre verbe** — « fait le », jamais
 * « en place ». Un fait daté vieillit ; un état ne vieillit pas. Et elles
 * n'entrent pas au compteur d'en-tête, qui porte une affirmation et non un
 * décompte : « 6 sur 12 en place » ne peut pas compter une obligation qui
 * reviendra.
 */
export function estFaitADater(
  o: Obligation,
  periodiciteEffective: Periodicite = o.periodicite,
): boolean {
  if (o.nature !== "echeance_recurrente") return false;
  if (!estSansRendezVous(periodiciteEffective)) return false;
  return !EXCLUES_DU_FAIT_DATE.has(o.id);
}

/**
 * Ce qui revient sans rythme écrit et que l'employeur ne déclenche pourtant
 * pas.
 *
 * `incendie-erp-5-visite-commission` : la visite périodique de la commission de
 * sécurité est **initiée par l'administration**. « En place » lui ment — elle
 * reviendra ; « fait le » aussi — ce n'est pas l'employeur qui la fait. Ce qui
 * se trace est la visite quand elle a eu lieu, et le registre de sécurité le
 * fait déjà. Deux surfaces pour un même acte, c'est ce qu'on évite.
 */
const EXCLUES_DU_FAIT_DATE: ReadonlySet<string> = new Set([
  "incendie-erp-5-visite-commission",
]);

/** Le verbe sous lequel une ligne se déclare, et ce qu'il entraîne. */
export type ModeDeclaration =
  | {
      /** « Déclaré en place le … ». Entre au compteur d'en-tête. */
      mode: "etat";
      compteDansLEnTete: true;
    }
  | {
      /** « Fait le … ». N'entre pas au compteur : la ligne reviendra. */
      mode: "fait";
      compteDansLEnTete: false;
    };

/**
 * Le mode d'une obligation, ou `null` si elle n'a rien à faire sur cet écran.
 *
 * **Le mode n'est jamais persisté.** Il se déduit de la nature, qui vit au
 * référentiel : le stocker dupliquerait une règle qui existe déjà, et c'est la
 * seconde moitié de « partage la règle, pas la mise en page ». Une obligation
 * dont la nature change au prochain dépouillement change de verbe sans
 * migration.
 */
export function modeDeclaration(
  o: Obligation,
  periodiciteEffective: Periodicite = o.periodicite,
): ModeDeclaration | null {
  if (estEtatADeclarer(o, periodiciteEffective)) {
    return { mode: "etat", compteDansLEnTete: true };
  }
  if (estFaitADater(o, periodiciteEffective)) {
    return { mode: "fait", compteDansLEnTete: false };
  }
  return null;
}

/**
 * Ce que le produit demande **en plus** de la case, quand le texte attend un
 * écrit.
 *
 * L'écran ne collecte aucune pièce — c'est une décision du brief, et elle est
 * juste pour une affiche au mur ou de l'eau potable. Mais cocher « en place »
 * sur un registre de sécurité est une déclaration qui ressemble à une preuve.
 * `pieceAttendue` nomme l'écrit ; l'écran l'affiche pour que le dirigeant sache
 * ce qu'il affirme détenir. Douze des lignes de cet écran en portent un.
 */
export function pieceAttendue(o: Obligation): string | null {
  return o.pieceAttendue;
}
