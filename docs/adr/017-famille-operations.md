# ADR-017 — Les opérations ponctuelles ne sont ni des corrections ni des registres

Date : 2026-08-20
Statut : accepté

Amende l'ADR-010 (registre de sources d'échéances) et l'ADR-015 (« À faire »
est un écran, tableau de bord au rail).

## Contexte

Deux rangements décrivaient les mêmes deux objets — le **permis de feu** et
le **plan de prévention** — et tous deux les rangeaient mal.

**Au calendrier**, ils étaient versés dans la famille `travaux`. L'ADR-010
définit cette famille comme « réparer, corriger, opérations de travaux » :
le troisième terme n'a été ajouté que pour les y faire entrer. Le libellé
présenté à l'utilisateur, lui, ne l'a jamais repris — le panneau de filtres
dit « Corrections & réparations », et `MarqueurFamille.tsx` documentait déjà
l'écart. Le code savait donc qu'il mentait, et l'ADR-016 (champ `type` à
côté de la famille) en était le pansement : on nommait l'objet ligne à ligne
parce que la famille ne le nommait plus.

Or le geste attendu n'est pas de corriger. Un permis de feu ne répare rien :
il autorise un travail par point chaud et impose une surveillance après.
Un plan de prévention ne répare rien non plus : il encadre la venue d'une
entreprise extérieure et impose une inspection commune avant. Ce que
l'échéance dit dans les deux cas, c'est « une opération datée arrive, le
préalable obligatoire ne doit pas être manqué ».

**À la navigation**, les deux vivaient sous « Mes registres ». Un registre se
tient en continu et s'ouvre une fois — registre de sécurité, accessibilité,
carnet sanitaire, DUERP. Un permis de feu naît à chaque chantier et meurt
clos. Là encore le code le savait : ces deux entrées (avec le carnet, pour
une autre raison) étaient les seules à passer par `evenementiel()` dans
`sidebar-nav.ts`.

Une même anomalie, donc, vue de deux endroits : le produit n'avait pas de
place pour **le ponctuel encadré**.

## Décision

**Le critère de rangement est la durée de vie de l'objet, pas le module dont
il sort.** Ce qui se tient en continu est un registre ; ce qui naît d'un
événement daté et meurt clos est une opération.

Deux conséquences symétriques, le même mot des deux côtés — l'utilisateur
l'apprend une fois :

1. **Une cinquième famille d'échéance `operations`** (« Opérations
   encadrées »), qui reçoit les types `permis-feu` et `plan-prevention`.
   `travaux` redevient ce que son libellé annonce : des écarts à corriger
   (actions DUERP, actions de vérification).
2. **Une entrée de rail « Opérations »**, qui reçoit les deux modules.
   « Mes registres » retombe à quatre entrées, toutes réellement continues.

Le rail suit l'ordre : À faire · **Opérations** · Mon établissement · Mes
registres (le tableau de bord y a eu une entrée jusqu'à la seconde révision
de l'ADR-015 ; on y revient désormais par la marque, en tête de rail). Les
deux catégories d'activité voisinent, les deux catégories descriptives
suivent.

## Options écartées

- **Ranger le permis de feu en `papiers`.** La famille `papiers` porte le
  renouvellement d'un document à date fixe (DUERP + 1 an, attestation qui
  expire). Un permis de feu ne se renouvelle pas : sa date est celle du
  début des travaux. C'eût été remplacer un libellé faux par un autre.
- **Ne rien faire**, et laisser le champ `type` (ADR-016) porter seul la
  nuance. Coût nul, mais le filtre et la légende continuaient d'annoncer
  « Corrections » sur des objets qui n'en sont pas — et la navigation de
  promettre un registre là où il n'y en a pas.

## Ce que cette décision ne tranche pas

> **Tranché depuis, par l'ADR-018** : le module a été retiré, et avec lui la
> boucle de l'ADR-009. L'action libre reste, comme ci-dessous, à traiter pour
> elle-même.

Le sort du module **Interventions** reste ouvert. Le doute est légitime — un
dirigeant de TPE saisit-il vraiment ses signalements au fil de l'eau ? — mais
c'est une question de valeur produit, pas de rangement. Et sa réponse
engagerait davantage : Interventions est aujourd'hui le seul chemin pour
qu'un constat de terrain devienne une action datée, et le seul déclencheur
de la boucle de l'ADR-009. Le remplacement naturel serait l'**action libre**,
qui n'existe pas : le type `action-libre` figurait dans l'ADR-016 mais aucune
donnée ne pouvait le produire, et il a été supprimé. L'ouvrir supposerait
d'assouplir le XOR de l'ADR-002 en « au plus une origine » — c'est-à-dire de
défaire l'invariant, pas d'en réutiliser un existant. À traiter pour
elle-même.

## Conséquences

- `FAMILLE_DE_TYPE` reste la seule autorité : un type sans famille ne
  compile pas, et le déplacement de deux types a suffi à déplacer les
  échéances partout (filtres, légende, pastilles, cartes « Autres
  échéances »), l'aval étant piloté par la donnée depuis l'ADR-010.
- `repartirRetards` ventile désormais cinq familles. Le total est inchangé —
  aucune échéance n'entre ni ne sort, elles changent de colonne.
- Une URL `?famille=travaux` mise en favori sur un permis de feu ne le
  montre plus. Le filtre est un réglage d'écran, non une adresse stable
  (ADR-015) : accepté.
- Tout futur module ponctuel et encadré (travaux de mise en accessibilité,
  Ad'AP) a désormais une place évidente, des deux côtés.
