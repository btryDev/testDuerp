# ADR-018 — Le module Interventions est retiré

Date : 2026-08-20
Statut : accepté

Tranche la question laissée ouverte par l'ADR-017 (« Ce que cette décision ne
tranche pas »). Annule l'ADR-009 (boucle tickets ↔ DUERP). Amende l'ADR-010
(registre de sources d'échéances), l'ADR-015 (« À faire ») et l'ADR-016 (type
d'échéance).

## Contexte

L'ADR-017 laissait le sort du module Interventions ouvert : « un dirigeant de
TPE saisit-il vraiment ses signalements au fil de l'eau ? ». La réponse est
non. Un module de ticketing suppose une organisation qui répartit du travail
entre plusieurs personnes ; la cible de Rojer est un dirigeant qui traite lui
-même, et pour qui un signalement de plus est une saisie de plus sans
contrepartie.

Le module coûtait, lui, quatre entrées dans le produit : une page de board,
une source d'échéances au calendrier, une section de l'export contrôle, et
une boucle vers le DUERP (ADR-009) dont le déclencheur — la clôture d'un
ticket avec réévaluation — n'était atteignable que par ce board.

## Décision

**Le module est retiré du produit** : page, entrée de navigation, formulaires,
actions serveur, source d'échéances, section de l'export contrôle et boucle
ADR-009 disparaissent. Le type d'échéance `intervention` sort de l'union
fermée de l'ADR-016 ; la famille `travaux` ne reçoit plus que les deux
origines d'action de l'ADR-002.

**Les modèles `Intervention` et `CommentaireIntervention` restent en base**,
sans code qui les lise ni les écrive. Un `drop` est irréversible et la
suppression d'un module n'est pas le moment de le décider : la migration sera
posée séparément, une fois la décision confirmée à l'usage.

## Ce que cette décision coûte

**Rojer n'a plus de chemin entre un constat de terrain et une action datée.**
C'était la fonction que l'ADR-017 tenait pour la vraie valeur du module — le
ticket, pas le ticketing. Le remplacement reste celui qu'elle nommait :
l'**action libre**, qui suppose d'assouplir le XOR de l'ADR-002 en « au plus
une origine ». À traiter pour elle-même, et non comme un rattrapage de ce
retrait.

**Le DUERP redevient un document que rien ne réveille entre deux mises à
jour.** L'obligation de l'art. R. 4121-2 CT (mise à jour à chaque changement
important) n'est plus outillée : c'est un retour à l'état antérieur à
l'ADR-009, pas une régression réglementaire du produit — Rojer n'a jamais
prétendu détecter ces changements autrement que par une saisie humaine.

## Conséquences

- `SidebarCounts.risquesAReevaluer` disparaît : le badge du DUERP ne comptait
  que les risques décotés par une clôture de ticket.
- L'export contrôle perd son fichier `09_Interventions_en_cours.txt`. La
  numérotation des autres pièces est inchangée — un dossier archivé reste
  lisible.
- Le seed de démonstration ne sème plus de signalements ; ceux déjà semés
  restent en base, invisibles, jusqu'à la migration de suppression.
