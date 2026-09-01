// Ce que le moteur ne sait pas trancher faute de connaître le public reçu.
//
// `engine.ts:249-258` pose une règle de repli : `personnesPresentesHabituellement`
// absent ⇒ on retient l'effectif salarié. La règle est délibérée et son
// intention est juste — elle refuse de fabriquer une obligation sur une donnée
// qu'elle n'a pas, et ne produit donc jamais de faux positif.
//
// Elle produit en revanche un **silence**. R. 4227-34 compte « les personnes
// occupées ou réunies habituellement », public compris ; un restaurant de six
// salariés qui reçoit soixante couverts est dans son champ, et s'il laisse le
// champ vide — il est facultatif à l'onboarding — le repli le range sous le
// seuil. Ni la consigne de sécurité incendie ni les exercices semestriels
// n'apparaissent, et rien à l'écran ne dit qu'une question est restée ouverte.
// C'est l'entorse à l'ADR-022 § 7 (« l'incertitude ne réduit jamais la
// couverture »), recensée là-bas et dans `docs/dette-chantier-porteur-echeance.md`
// § 4 — mais sa conséquence sur ces obligations n'était écrite nulle part.
//
// Ce module ne corrige pas le repli : le retirer transformerait la
// sous-estimation en sur-application silencieuse, ce qui est pire. Il rend
// **ce que le repli écarte**, pour que `perimetre/couverture.ts` puisse le
// nommer au dirigeant.
//
// ## Pourquoi il n'écrit aucun seuil
//
// Le seuil de 51 vit dans le référentiel (`conformite/incendie.ts`) et dans
// `registre/sections.ts`. Le recopier ici en ferait une troisième déclaration,
// et deux constantes dans deux modules ne se contredisent jamais par un test :
// elles divergent en silence. L'hypothèse testée est donc **le seuil de
// l'obligation elle-même**, lu sur elle.
//
// ## Pourquoi il rejoue `evaluerObligation` au lieu de `matchTypologie`
//
// Une obligation dont la seule typologie passerait n'apparaîtrait pas pour
// autant : le porteur salarié rend toujours `null` (ADR-023), et une
// obligation d'équipement demande encore un appareil déclaré. Rejouer le
// verdict complet est la seule façon de n'annoncer que des obligations qui
// apparaîtraient réellement — zéro faux positif par construction, et non par
// une liste de cas tenue à la main.
//
// Module **pur** : ni Prisma, ni React, ni horloge.

import { obligationsConformite } from "@/lib/referentiels/conformite";
import type { Obligation } from "@/lib/referentiels/conformite/types";
import { evaluerObligation } from "./engine";
import type { EquipementMatching, EtablissementMatching } from "./types";

/**
 * Une obligation que ce dossier verrait si le nombre manquant atteignait son
 * seuil, et qu'il ne voit pas.
 */
export type ObligationSuspendueAuPublic = {
  id: string;
  /** Le libellé, tel qu'il s'affiche partout ailleurs — jamais reformulé. */
  libelle: string;
  /** Le seuil de personnes présentes que porte cette obligation. */
  seuil: number;
};

/**
 * Les obligations suspendues au public reçu, pour ce dossier.
 *
 * Vide dès que le chiffre est déclaré : il n'y a alors plus rien à trancher,
 * quelle que soit la réponse. Vide aussi quand le repli donne déjà la même
 * réponse — un établissement dont l'effectif salarié atteint le seuil, ou qui a
 * déclaré manipuler des matières de R. 4227-22, reçoit l'obligation de toute
 * façon.
 */
export function obligationsSuspenduesAuPublicRecu(
  etab: EtablissementMatching,
  equipements: EquipementMatching[],
  obligations: readonly Obligation[] = obligationsConformite,
): ObligationSuspendueAuPublic[] {
  // Le chiffre est déclaré : le moteur ne se replie sur rien, il n'y a aucun
  // doute à lever. C'est ce qui rend l'axe muet sur un dossier renseigné.
  if (etab.personnesPresentesHabituellement !== null) return [];

  const suspendues: ObligationSuspendueAuPublic[] = [];

  for (const o of obligations) {
    const seuil = o.typologies.personnesPresentesMin;
    // Sans seuil déclaré, il n'y a pas d'hypothèse à formuler. `champR422734`
    // seul ne se traduit pas en nombre — et le référentiel interdit d'ailleurs
    // de le poser sans `personnesPresentesMin` (`conformite.test.ts`).
    if (seuil === undefined) continue;

    // Déjà applicable : le repli n'a rien retiré.
    if (evaluerObligation(o, etab, equipements) !== null) continue;

    // L'hypothèse, et elle est minimale : le nombre manquant atteint tout juste
    // le seuil de cette obligation-là.
    const avecLeChiffre: EtablissementMatching = {
      ...etab,
      personnesPresentesHabituellement: seuil,
    };
    // Toujours écartée avec le chiffre : c'est un autre critère qui l'exclut —
    // le régime, un équipement absent, le porteur salarié. Le public reçu n'y
    // changerait rien, et l'annoncer serait un faux positif.
    if (evaluerObligation(o, avecLeChiffre, equipements) === null) continue;

    suspendues.push({ id: o.id, libelle: o.libelle, seuil });
  }

  return suspendues;
}
