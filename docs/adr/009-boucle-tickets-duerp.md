# ADR-009 — Boucle tickets ↔ DUERP : le DUERP comme document vivant

- **Date** : 2026-04-23
- **Statut** : Acceptée
- **Auteur** : Claude Code (sur brief Paloma)
- **Relatif à** : ADR-002 (Action unifiée), modules Interventions et DUERP

## Contexte

Le DUERP (Document Unique d'Évaluation des Risques Professionnels) est
historiquement traité comme un **livrable annuel** : on le construit en
une passe, on le fige, on le ressort en cas de contrôle. L'article
**R4121-2 du Code du travail** impose pourtant sa **mise à jour** dans
trois cas :

1. Au moins une fois par an pour les entreprises de 11 salariés et plus ;
2. Lors de toute décision d'aménagement important modifiant les
   conditions de santé et de sécurité ;
3. Lorsqu'une information supplémentaire intéressant l'évaluation d'un
   risque est portée à la connaissance de l'employeur.

En pratique, les dirigeants de TPE/PME ignorent les cas 2 et 3 parce
qu'ils n'ont **aucun mécanisme opérationnel** pour les détecter. Un
extincteur déplacé, une trancheuse défectueuse, une fuite, une
observation en analyse légionelle — rien n'alerte que le DUERP doit
être retouché.

Or l'audit concurrentiel (cf. compte-rendu Deemply) a confirmé que
**aucun outil du marché** ne fait dialoguer la vie quotidienne d'un
établissement (tickets, rapports, analyses) avec le document légal. Le
DUERP reste un silo annuel.

**Question** : comment matérialiser en code et en UX les cas 2/3 de
l'art. R4121-2, pour faire du DUERP un document qui vit au rythme du
terrain ?

## Décision

Quand un utilisateur clôture un **ticket d'intervention** (module
`Intervention`, cf. Phase 2.4) et que ce ticket est rattaché à un
risque du DUERP via `Intervention.risqueId`, il se voit proposer une
case **« Déclencher la réévaluation du risque DUERP lié »**. Si cochée :

1. Le champ `Risque.cotationSaisie` repasse à `false`.
2. Le risque réapparaît comme « non coté » dans le wizard DUERP, le
   plan d'actions et la synthèse.
3. Un **bandeau rouge** s'affiche sur la page d'entrée du DUERP listant
   ces risques avec un lien direct vers leur édition (composant
   `BannerRisquesAReevaluer`).
4. Un **compteur d'alerte** apparaît dans la sidebar sur l'item DUERP
   (pastille rouge avec le nombre de risques à recoter).
5. La sidebar et le bandeau sont alimentés par la même fonction
   `listerRisquesAReevaluer(etablissementId)` qui joint
   `Risque.cotationSaisie = false` avec un ticket `fait` ayant pointé
   vers ce risque.

### Opt-in utilisateur, pas automatique

La réévaluation n'est **jamais automatique** : c'est une case à cocher
explicite à la clôture du ticket, avec un libellé pédagogique :

> *« [Titre du risque] sera marqué comme à recoter dans votre DUERP.
> C'est la boucle vertueuse : le terrain nourrit le document légal. »*

L'utilisateur reste seul juge de ce qui constitue un *« changement
important »* au sens de R4121-2.

### Réutilisation du champ existant

On utilise le champ `Risque.cotationSaisie` (déjà présent dans le
modèle, déjà consommé par la synthèse et le PDF DUERP) plutôt que de
créer une nouvelle entité `DemandeReevaluation`. Le risque est :

- `cotationSaisie = true` → coté, inclus dans le plan d'actions, visible
  dans le PDF avec sa criticité.
- `cotationSaisie = false` → non coté, affiché comme « n.c. » dans le PDF,
  listé dans les « Points à vérifier » de la synthèse, et désormais
  remonté dans le nouveau bandeau si issu d'un ticket clôturé.

Cette réutilisation assure qu'aucune partie du code n'a besoin d'être
modifiée pour que l'information se propage : le DUERP « sait déjà » ce
qu'est un risque non-coté, on utilise juste un nouveau déclencheur.

### Pattern ouvert à d'autres sources

La boucle tickets ↔ DUERP est la **première** implémentation de ce
pattern. Le même mécanisme pourra être utilisé par :

- Un **rapport de vérification** avec résultat `ecart_majeur` qui cible
  un équipement associé à un risque DUERP (ex. installation électrique
  non conforme → risque électrique à recoter).
- Une **analyse légionelle** non conforme qui impacte un risque
  bactériologique.
- La **clôture d'une action corrective** qui peut faire descendre la
  criticité du risque source.

L'ADR pose donc le pattern : *toute source « métier » qui détecte un
changement d'exposition peut remettre `cotationSaisie = false` sur un
risque lié, moyennant un opt-in explicite de l'utilisateur au moment
où la décision est prise*.

## Conséquences

### Positives
- **Conformité réelle à R4121-2** : les cas 2 et 3 deviennent
  opérationnels, pas seulement théoriques. Argument commercial fort.
- **Différenciateur produit majeur** : aucun concurrent n'implémente
  cette boucle (audit Deemply confirmé). C'est ce qui transforme le
  DUERP de document annuel en outil quotidien.
- **Pas de nouveau modèle de données** : on réutilise `cotationSaisie`,
  zéro dette technique, zéro migration.
- **Piste d'audit** : un ticket clôturé garde son `risqueId` → on peut
  toujours prouver pourquoi un risque a été recoté à une date donnée.

### Négatives / coûts
- Un utilisateur pressé qui décoche systématiquement la case « réévaluer »
  continue d'avoir un DUERP obsolète. On ne peut pas forcer la main —
  c'est lui qui reste juridiquement responsable du document. L'UX
  (sous-titre pédagogique, bandeau rouge récurrent) incite sans bloquer.
- Si la même intervention concerne 3 risques et que seul un `risqueId`
  est capturé, les 2 autres risques ne seront pas signalés. Au MVP on
  accepte cette simplification (1 ticket → 1 risque). Extension possible
  plus tard avec une table `InterventionRisque` many-to-many.
- La query `listerRisquesAReevaluer` fait une jointure Prisma sur chaque
  chargement de layout établissement. Coût minime tant que le volume
  reste < quelques centaines de tickets. À surveiller avec des index.

### Neutres
- Le champ `cotationSaisie` prenait déjà `false` dans un cas existant :
  un risque pré-rempli depuis un référentiel sectoriel mais jamais coté
  par l'utilisateur. Le bandeau ne doit afficher **que** les risques
  ayant un ticket clôturé lié — la query filtre sur
  `ticketsParRisque.has(r.id)` pour ne pas polluer.

## Alternatives rejetées

### Alternative A — Ne rien faire, laisser l'utilisateur mettre à jour son DUERP manuellement
Rejetée : c'est ce que font tous les outils du marché, et c'est exactement
ce qui fait que les DUERP sont systématiquement obsolètes sur le terrain.
Perdre ce différenciateur nous met à parité avec Deemply sans raison.

### Alternative B — Entité dédiée `DemandeReevaluation` avec sa propre table
Envisageable, rejetée : dupliquerait l'information (`cotationSaisie = false`
signifie déjà « risque non coté »). Deux sources de vérité sur la même
notion, risque de divergence. Le wizard DUERP, le PDF, la synthèse
devraient tous être adaptés pour consulter les deux. Complexité non
justifiée.

### Alternative C — Re-coter automatiquement le risque à sa valeur max (16/16)
Rejetée pour raison juridique : ferait **mentir** le document. Si la
résolution du ticket a au contraire baissé le risque (trancheuse
remplacée par modèle sécurisé), re-noter à 16/16 serait faux. La seule
réponse correcte est : « ce risque doit être réévalué par un humain ».

### Alternative D — Réévaluation automatique silencieuse
Mettre `cotationSaisie = false` sans case à cocher. Rejetée : donne
l'impression que l'outil « triche » ou fait des choses dans le dos de
l'utilisateur, ce qui est particulièrement sensible sur un document à
valeur légale. On garde la décision humaine.

### Alternative E — Notification externe (email) plutôt qu'alerte in-app
Rejetée au MVP : la plupart des utilisateurs ne reviendront pas à l'outil
juste sur un email. L'alerte in-app est plus efficace parce que l'utilisateur
passe déjà régulièrement sur le dashboard. À combiner avec un digest email
hebdomadaire plus tard (hors MVP).

## Checklist de mise en œuvre

État au 2026-04-23 (tout fait) :

- [x] Champ `Intervention.risqueId` dans le schéma Prisma + migration
- [x] Clôture de ticket avec case « réévaluer » (composant
      `CloturerTicketForm`)
- [x] Server action `cloturerIntervention` qui repasse `cotationSaisie`
      à `false` si demandé
- [x] Query `listerRisquesAReevaluer(etablissementId)`
- [x] Count `countRisquesAReevaluer(etablissementId)` → passé au layout
      et à la sidebar
- [x] Badge rouge sur l'item DUERP de la sidebar
- [x] Composant `BannerRisquesAReevaluer` affiché sur la page d'entrée
      du DUERP (unités)

## Extensions possibles

- [ ] Ajouter la réévaluation depuis un rapport de vérification avec
      résultat `ecart_majeur` (étendre la query et la case à cocher à
      la saisie du rapport).
- [ ] Ajouter la réévaluation depuis une analyse légionelle non conforme
      (seuil 1000 UFC/L dépassé).
- [ ] Historique : quand le risque est recoté, loguer le fait que la
      réévaluation a été déclenchée par le ticket #X → trace complète.
- [ ] Many-to-many `InterventionRisque` si besoin de lier un ticket à
      plusieurs risques.

## Notes de conformité

- **Art. R4121-2 CT** : l'employeur met à jour le DUERP au moins une fois
  par an (≥ 11 salariés), lors de tout aménagement important, et quand
  une information nouvelle intéresse l'évaluation d'un risque. La boucle
  tickets couvre les cas 2 et 3.
- **Traçabilité** : chaque réévaluation déclenchée garde une trace via
  `Intervention.risqueId` + `Intervention.dateCloture` + `Intervention.motifCloture`.
  Un inspecteur peut reconstruire la chaîne : *« ce risque a été recoté
  suite au ticket #X clôturé le YYYY-MM-DD parce que Z »*.
- **Pas de LLM** (principe CLAUDE.md) : la décision de réévaluer reste
  humaine, la case à cocher est la seule source. Aucune détection
  automatique de « ce qui constitue un changement important » — ce
  concept juridique n'est pas déléguable à une machine.
