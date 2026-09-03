// Nommer une obligation dans un texte de couverture, de façon confrontable.
//
// POURQUOI CE MODULE EXISTE. Le 2026-09-03, `/perimetre` annonçait au dirigeant
// que le règlement intérieur n'était pas porté par l'outil. Le référentiel le
// livrait depuis le lot 8 — `prevention-etablissement-reglement-interieur`,
// porteur établissement, `effectifMin: 50`, fondée sur `L. 1321-1 1°`. Le même
// dossier, à cinquante-cinq salariés, lisait la ligne dans ses états permanents
// et son absence sur la page qui déclare les manques. La phrase s'imprimait
// aussi en tête du registre de sécurité.
//
// Personne n'avait menti : le lot 8 a livré l'obligation sans que quiconque
// relise les textes de couverture, et rien dans le dépôt ne rapprochait les
// deux. C'est le mode de défaillance exact que cette page existe pour éviter —
// une page dont la raison d'être est de dire la vérité sur ce qui n'est pas
// couvert, et qui annonce un trou comblé, fait douter de tout le reste.
//
// CE QUE CES DEUX FONCTIONS FONT. Rien, au runtime : elles rendent leur
// argument. Elles ne sont pas là pour transformer le texte, elles sont là pour
// que le texte se **déclare**. Une prose libre n'est pas rapprochable
// mécaniquement ; une prose dont chaque obligation nommée passe par un de ces
// deux appels l'est, et sans jamais recopier de liste : le sujet écrit est
// exactement le sujet affiché, et `non-couverture-balayage.ts` le confronte au
// référentiel, qui reste la seule source.
//
//  - `nonPorte(sujet)` — « l'outil ne porte pas ceci ». Le balayage échoue si
//    le référentiel porte une obligation qui répond à ce sujet, en la nommant.
//  - `porte(sujet)` — « l'outil porte ceci ». Le balayage échoue si AUCUNE
//    obligation n'y répond. C'est l'autre moitié, et elle compte autant : une
//    page de couverture qui promet ce que le produit ne livre pas est le même
//    défaut retourné.
//
// LES DEUX SONT L'IDENTITÉ, ET C'EST VOULU. Un marqueur qui décorerait le texte
// — parenthèses, italiques, renvoi — ferait payer au dirigeant le prix d'une
// garantie interne. Il ne doit rien voir de tout ceci ; il doit seulement lire
// une phrase vraie.
//
// Module **pur** : aucune dépendance, pas même le référentiel. Il est importé
// par des modules qui le sont aussi (`couverture.ts` le dit de lui-même) et par
// des écrans. Le balayage, lui, lit le système de fichiers : il vit à part,
// dans `non-couverture-balayage.ts`, et n'est atteint que par les tests.

/**
 * Le sujet d'une affirmation de NON-couverture, rendu tel quel.
 *
 * À employer partout où un texte de couverture nomme une obligation, un
 * document ou un régime que l'outil ne porte pas. Le sujet s'écrit comme il se
 * lit — article compris, la phrase doit rester une phrase.
 *
 * ⚠ Écrire le sujet le plus précis que la phrase permet. « le compartimentage »
 * répond aussi à la description du SSI d'un ERP, que le référentiel porte ; « le
 * compartimentage des IGH » ne répond qu'à lui-même. Le balayage préfère
 * l'alerte au silence, et c'est le bon sens de l'erreur : une alerte se lève en
 * précisant la phrase, un silence ne se lève jamais.
 */
export function nonPorte(sujet: string): string {
  return sujet;
}

/**
 * Le sujet d'une affirmation de couverture, rendu tel quel.
 *
 * À employer quand un texte de couverture dit au dirigeant qu'une obligation
 * lui est bien servie — et il faut parfois le dire, car nommer un manque à côté
 * d'une chose livrée sans distinguer les deux est ce qui a produit le défaut
 * d'origine.
 */
export function porte(sujet: string): string {
  return sujet;
}
