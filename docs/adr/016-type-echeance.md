# ADR-016 — La nature d'une échéance est un type fermé, la famille s'en déduit

- Statut : acceptée, **amendée par l'ADR-018** (le type `intervention` a
  quitté l'union avec son module ; le raisonnement, lui, tient)
- Date : 2026-08-20
- Portée : `src/lib/calendrier/echeances.ts`, `src/lib/calendrier/evenements.ts`,
  `src/lib/dashboard/frise.ts`, `src/components/calendrier/MarqueurFamille.tsx`,
  les surfaces qui affichent une échéance
- Dépend de : ADR-010 (registre d'échéances), ADR-015 (navigation)

## Contexte

Une ligne d'échéance doit dire **deux choses** : quand elle tombe, et ce que
c'est. Le « quand » est bien traité — la couleur porte l'urgence, sur une table
d'états unique. Le « ce que c'est » ne l'est pas.

**La famille est trop grossière.** `FamilleEcheance` compte quatre valeurs, et
`travaux` en fusionne cinq objets de natures très différentes : action issue du
DUERP, action issue d'une vérification, intervention, permis de feu, plan de
prévention. Un dirigeant qui regarde une ligne « Corrections » ne sait pas s'il
a devant lui une mesure de prévention qu'il a lui-même inscrite à son DUERP ou
un signalement de son cuisinier.

**Le détail existe, mais en texte libre.** Chaque source produit un champ
`origine: string` — « Suite au contrôle "X" », « Signalement n°7 », « À
redemander au prestataire », « Travaux par point chaud ». Huit formulations,
écrites à huit endroits, non typées, non filtrables, non testables autrement que
par comparaison de chaînes. C'est la seule chose qui distingue réellement les
objets, et c'est la moins exploitable.

**Et la nature se perd en chemin.** `fusionnerEvenements` pose `famille` dans
`EvenementGrille`, puis `EvenementFrise` et `EvenementFenetre`
(`src/lib/dashboard/frise.ts`, `src/lib/dashboard/queries.ts`) ne la déclarent
pas : la frise et les widgets du tableau de bord **ne peuvent pas** afficher la
nature, même si on le voulait. Ce n'est pas un oubli de style, c'est un trou de
type.

## Décision

**Un champ typé unique, `TypeEcheance`, porte la nature. La famille s'en
déduit.**

```ts
export type TypeEcheance =
  | "verification"          // vérification périodique d'un équipement
  | "action-duerp"          // action née d'un risque du DUERP
  | "action-verification"   // action née d'un écart constaté en vérification
  | "permis-feu"
  | "plan-prevention"
  | "duerp-maj"             // mise à jour annuelle du document
  | "attestation"           // pièce de vigilance prestataire
  | "legionelles";

export const FAMILLE_DE_TYPE: Record<TypeEcheance, FamilleEcheance> = { … };
```

Trois conséquences voulues :

1. **Une seule source de vérité.** `famille` n'est plus posée à la main par
   chaque source : elle est dérivée. Une source ne peut plus se tromper de
   famille, ni deux sources se contredire. Le filtre par famille et les
   regroupements existants continuent de fonctionner à l'identique.
2. **`origine` devient un complément, pas une phrase.** Le mot standard vient du
   type (« Vérification », « Action DUERP », « Intervention ») ; `origine` ne
   porte plus que ce que le type ne dit pas : le libellé de la vérification
   d'où sort l'action, le numéro du signalement. On cesse d'écrire « Suite au
   contrôle "X" » pour afficher « Action · suite à la vérification "X" », où le
   premier mot est typé et le second contextuel.
3. **La nature descend jusqu'aux surfaces.** `TypeEcheance` est ajouté à
   `EvenementGrille`, `EvenementFrise` et `EvenementMarqueur`. La frise et les
   widgets peuvent enfin dire ce qu'ils montrent.

**Le canal visuel reste celui déjà décidé : icône + mot, jamais la couleur.**
`src/components/actions/BadgeOrigine.tsx` l'énonce depuis l'origine — *l'origine
n'est pas un état, ce qui les distingue est le mot, pas la couleur* — et la
couleur est déjà prise six fois (état d'échéance, statut de vérification, statut
d'action, résultat de rapport, priorité d'intervention, statut d'intervention),
fond et encre. Lui ajouter un septième sens la viderait de tout sens.

Corollaire d'accessibilité : toute marque de nature s'accompagne d'un **mot**,
visible ou `sr-only`. `MarqueurFamille` est aujourd'hui systématiquement
`aria-hidden` et seule la liste mensuelle a une doublure textuelle — une
signalétique qui disparaît en niveaux de gris ne dit rien.

## Ce qui n'est pas décidé ici

**Le modèle de données ne bouge pas.** `TypeEcheance` est calculé à la lecture,
depuis ce que chaque source sait déjà (`Action.risqueId` / `Action.verificationId`
tranchent le XOR de l'ADR-002 sans colonne nouvelle). Aucune migration, aucun
champ en base. Une nature déduite de la donnée ne peut pas se désynchroniser
d'elle.

**La famille `personnel` reste déclarée sans source.** Elle est étiquetée et
iconifiée mais aucune source ne la produit, et `FAMILLES_FILTRABLES` l'exclut.
`FAMILLE_DE_TYPE` ne la référence donc pas encore ; le jour où un module la
produira, il déclarera son type et la table le rattachera.

**Ce jour est venu le 2026-08-28** (ADR-023 § 7, amendement) : le type
`titre-salarie` rattache `personnel`, et `FAMILLES_FILTRABLES` — désormais
voisine de `FAMILLE_DE_TYPE` dans `calendrier/echeances.ts` plutôt que dans la
page — l'inclut. Le mécanisme a tenu sa promesse : le rattachement s'est fait
en déclarant un type, sans que la fusion, la grille ni la frise aient à
connaître la famille. Il n'a pas suffi pour autant, et c'est l'enseignement du
lot : le **compteur** de retards ne passe pas par `FAMILLE_DE_TYPE` —
`repartirRetards` versait le flux des vérifications dans `controle` en bloc.
Une table de dérivation ne protège que les lecteurs qui la consultent.

## Correction — `action-libre` n'a jamais pu exister

La liste ci-dessus comptait un dixième type, `action-libre`, « action saisie
hors des deux origines ». Il contredisait l'ADR-002 : le XOR y impose
*exactement* une origine, ni deux ni zéro, et l'invariant est tenu à trois
endroits (contrainte SQL `Action_origine_xor`, `assertOrigineActionValide`
appelée dans les trois chemins de création, import DUERP et seeds). La branche
qui produisait ce type était donc inatteignable depuis son écriture.

Elle a été supprimée, avec son libellé et son icône. `origineAction` ne prend
plus qu'un `verificationLibelle` : `Verification.libelleObligation` étant non
nul en base, son absence signifie exactement « pas de vérification », donc
« rattachée à un risque ». Le paramètre `duerp` doublait cette information et
pouvait la contredire.

Ce que l'erreur enseigne : un ADR qui énonce un invariant de données doit
livrer son test. L'ADR-002 l'a fait et a tenu ; celle-ci ne l'a pas fait.

## Conséquences

- Ajouter un module produisant des échéances impose désormais **deux** gestes :
  l'inscrire dans `SOURCES_ECHEANCES` (ADR-010) et déclarer son type dans
  `FAMILLE_DE_TYPE`. Le typage rend le second obligatoire — un type non
  rattaché ne compile pas.
- Les tables de libellés de famille (`LABEL_FAMILLE`, `LABEL_FAMILLE_LONG`,
  `LABEL_FAMILLE_SINGULIER`) restent : elles nomment le regroupement, pas
  l'objet. Une table `LABEL_TYPE` les complète au niveau fin. On ne crée pas de
  quatrième table de famille.
- Le lexique fixé par l'ADR-015 s'applique aux libellés de type : « Vérification »
  et non « Contrôle », « Intervention » et non « Ticket », « Action » et non
  « Action corrective ».
