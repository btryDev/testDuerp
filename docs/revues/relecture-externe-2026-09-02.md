# Relecture externe du dossier référentiel — 2026-09-02

Le PDF `Rojer-referentiel-complet.pdf` (généré depuis `10cf3ce`, 135 obligations)
a été soumis à un lecteur externe généraliste. Ce document consigne ce qu'il a
rendu, et surtout **comment il l'a établi** — la seconde chose important plus que
la première.

## Le verdict, et sa portée exacte

Aucune erreur de droit relevée sur les références, conditions et périodicités.

**Cette validation n'est pas probante, et il faut l'écrire ici pour qu'on ne s'y
adosse pas plus tard.** Le lecteur valide par reconnaissance : il écrit
« conformes à l'arrêté du 1er mars 2004 », « les seuils sont correctement cités »,
sans avoir ouvert Légifrance. Il compare le document à ce qu'il sait, pas à la
source.

C'est exactement le mode de défaillance que ce dépôt a rencontré sur
`R. 4226-19` le 2026-08-31 : deux lots ont lu l'article indépendamment, l'ont
cité identiquement, ont conclu identiquement — et se trompaient tous les deux,
parce qu'aucun n'est remonté voir *qui cite* l'article. **Une concordance entre
deux lectures qui partagent le même angle mort n'est pas une preuve.**

À traiter donc comme un indice favorable, pas comme une relecture.

## Une confirmation qui, elle, vaut quelque chose

Sur l'habilitation électrique, le lecteur conclut de lui-même que Rojer ne porte
pas la périodicité de renouvellement, et que **c'est fidèle au Code** — le
recyclage triennal venant de la NF C 18-510 et non de `R. 4544-10`.

C'est l'arbitrage écrit dans les `notesInternes` de
`elec-salarie-habilitation`, atteint sans l'avoir lu. Le raisonnement se
reconstruit depuis le texte seul, ce qui est le meilleur signe qu'il est juste.

## Trois incomplétudes à vérifier

Aucune n'est corrigée. Aucune n'est confirmée non plus : elles sont **relevées**,
et leur vérification à la source reste à faire.

| # | Objet | Ce qui serait incomplet | Cible concernée |
|---|---|---|---|
| 1 | `PS 32` — parcs de stationnement couverts | Le référentiel ne modélise qu'un cas type (surveillance de la qualité de l'air, parcs d'au plus 250 véhicules). Les autres configurations de l'article — parcs de plus de 250 véhicules, désenfumage, détection CO — ne sont pas encodées | Marginale : un parc couvert n'est pas un établissement des trois secteurs cibles |
| 2 | Règlement (UE) 2024/573 — gaz fluorés | Les seuils (50 et 500 t CO₂e) et le renvoi à `R. 543-79` sont justes, mais le règlement distingue des types d'équipements, des catégories de gaz et une obligation de détection automatique que la ligne unique de Rojer aplatit | Réelle pour une cuisine professionnelle avec installation frigorifique |
| 3 | Arrêté du 8 octobre 1987 — aération | Le contrôle initial à la mise en service est bien fondé. Les contrôles périodiques de l'arrêté (débits, concentrations) sont plus détaillés que ce que porte la ligne Rojer | Réelle pour la restauration |

**La 2 et la 3 sont dans la cible produit et méritent une lecture à la source.**
La 1 ne la mérite pas, et doit alors être **écartée avec motif** plutôt que
laissée en silence.

## Un point de formulation, et il est réel

Le lecteur signale qu'une obligation marquée **« sans rythme écrit » peut se lire
comme « rien à faire »**.

C'est notre propre règle de l'ADR-010 — *le calendrier ne doit pas mentir par
omission* — appliquée à un endroit qu'on n'a pas regardé. Dans le produit, les
quatorze obligations en `periodicite: "autre"` ont leur écran (ADR-027, « Ce qui
doit être en place »). **Dans le PDF, rien ne le dit**, et la mention isolée se
lit comme un vide.

Ce n'est pas un défaut du référentiel, c'est un défaut du document qui le
présente. Non corrigé.

## Ce que cette relecture ne pouvait pas voir

Le gros de la critique porte sur des **risques d'usage** — ce qu'un utilisateur
comprendra mal, ce qu'une déclaration erronée fera disparaître. Le lecteur le
formule bien : *« le risque est dans la déclaration, pas dans la règle »*.

Or un PDF du référentiel ne montre aucun écran. **L'artefact soumis ne permettait
pas de juger ce que la critique vise.** C'est une erreur de sélection de notre
côté, pas une faiblesse du lecteur.
