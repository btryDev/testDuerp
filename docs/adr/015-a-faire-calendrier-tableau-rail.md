# ADR-015 — « À faire » est un écran, pas un dossier : le calendrier en devient la porte

- Statut : acceptée
- Date : 2026-08-20
- Portée : `src/components/layout/sidebar-nav.ts`, `AppSidebar.tsx`,
  `src/lib/navigation/`, `src/lib/calendrier/retards.ts`, la page calendrier
- Dépend de : ADR-010 (registre d'échéances du calendrier), ADR-014
  (provenance de navigation)

## Contexte

La section « À faire » du panneau listait cinq destinations : Tableau de
bord, Calendrier, Plan d'actions, Interventions, Préparer un contrôle. Un
test produit a montré que cette liste ne se laisse pas lire.

**Le tableau de bord n'est pas une chose à faire.** C'est un résumé — le
board de widgets, le brief du jour. Le ranger en tête d'une liste de tâches
oblige le dirigeant à traverser « À faire » pour atteindre l'écran qui lui
dit, justement, ce qu'il y a à faire. La porte d'entrée du produit était
cachée dans un tiroir.

**Le calendrier disait déjà tout, sans le dire.** Depuis l'ADR-010, il
fusionne deux flux : les vérifications périodiques et le registre des autres
échéances (actions, interventions, permis, plans de prévention, mise à jour
du DUERP, attestations de vigilance). C'est-à-dire **tout ce qui est daté et
qui attend le dirigeant**. Il portait pourtant le nom d'un module parmi
d'autres, et un `<h1>` — « Vérifications périodiques » — qui décrivait un
seul de ses quatre flux.

**Aucun écran ne montrait les contrôles matériel seuls.** Le filtre existait
(`?famille=controle`, `FAMILLES_FILTRABLES`), mais enfoui dans un popover
« Filtres ». Le dirigeant qui demande « où je vois mes contrôles ? » n'avait
pas d'entrée de navigation à cliquer.

**Deux compteurs « en retard » se contredisaient.** Le badge de la sidebar
comptait les vérifications ; le bandeau du calendrier comptait toutes les
familles. L'écart était si visible qu'il avait fini par être *documenté*
dans l'aide de l'écran (« le badge de la barre latérale ne compte, lui, que
les vérifications périodiques : 3 sur 11 »). Un produit qui explique son
incohérence au lieu de la corriger a déjà perdu la confiance qu'il demande.

**Enfin, le rail ne naviguait pas.** Cliquer « À faire », « Établissement »
ou « Registres » ouvrait un panneau sans changer de page : deux clics
obligatoires pour arriver quelque part, et une icône de premier niveau qui
ne mène nulle part.

## Décision

**1. Le tableau de bord monte au rail, en première position.** Entrée
autonome, lien direct, sans panneau. C'est l'écran d'atterrissage à la
connexion ; il mérite le premier niveau et ne se range plus sous une
catégorie qui le contredit.

**2. « À faire » est un écran, et c'est le calendrier.** Le rail « À faire »
mène à `/calendrier`, toutes familles confondues. Le `<h1>` de la page suit
le filtre actif : « À faire » sans filtre, « Contrôles matériel » sur
`?famille=controle`, le libellé long de la famille sinon.

**3. Règle de rail : une entrée = une page d'entrée + un panneau.** Cliquer
une catégorie navigue **et** ouvre son panneau — À faire → `/calendrier`,
Établissement → `/equipements`, Registres → `/duerp`. Le choix manuel de
panneau reste possible et survit jusqu'à la navigation suivante, comme
avant. Corollaire : `RailCategorie.href` devient obligatoire.

**4. Le panneau « À faire » compte cinq items** : Tout · Contrôles matériel
· Plan d'actions · Interventions · Préparer un contrôle. « Comprendre » sort
de la section — le rail y mène déjà.

**5. Les deux compteurs sont réconciliés, et disent chacun leur périmètre.**
« Tout » porte les retards **toutes familles** (`enRetardTotal`), « Contrôles
matériel » les **vérifications périodiques seules**
(`verificationsEnRetard`). Une fonction unique,
`repartirRetards` (`src/lib/calendrier/retards.ts`), sert la sidebar **et**
le bandeau du calendrier : les deux lectures ne peuvent plus diverger. Le
paragraphe d'aide qui documentait l'écart est supprimé.

Nuance assumée : le registre range les analyses légionelles dans la famille
`controle`. La vue `?famille=controle` les affiche donc, alors que le badge
« Contrôles matériel » ne les compte pas. Le badge nomme ce qui a un
calendrier réglementaire d'équipement ; l'écart est de l'ordre de l'unité et
la vue elle-même est explicite. `parFamille.controle` reste disponible si on
veut un jour aligner strictement les deux.

**6. Les mêmes compteurs partout.** `chargerSidebarCounts` est partagée par
le shell établissement et le shell DUERP, qui montait la sidebar sans
`counts` : les pastilles disparaissaient dès qu'on entrait dans le wizard.

**7. Ce qui est sans date est signalé, pas caché.** Une action sans échéance
n'a pas de jour où se poser — l'ADR-010 refuse d'en inventer un. Elle est
désormais **annoncée** : pilule « N action(s) sans échéance — les dater » sur
la vue Tout du calendrier, tuile « À dater » sur le plan d'actions, toutes
deux issues de `compterActions().sansEcheance`. Le calendrier reste un
écran de dates ; il ne prétend plus être exhaustif en silence.

## Ce qui n'a pas été fait, et pourquoi

**Plan d'actions et Interventions ne deviennent pas des filtres du
calendrier.** La tentation était forte — tout y est déjà, famille `travaux`.
Mais le calendrier ne montre que du daté : une action sans échéance et un
ticket sans date n'y apparaissent jamais. Faire pointer « Plan d'actions »
vers `?famille=travaux` aurait rendu ces objets **invisibles depuis leur
propre entrée de navigation**. Les deux pages restent autonomes ; le
calendrier en est une lecture datée, pas le contenant.

**« Préparer un contrôle » reste dans « À faire ».** La question ouverte du
backlog est tranchée dans le sens de la contre-proposition : se tenir prêt
est un entretien continu, pas un événement subi.

## Conséquences

- `SidebarItemId` gagne `"controles"` ; `"calendrier"` reste l'id de l'item
  « Tout » (l'id nomme la route, le libellé nomme l'écran).
- `LABEL_ITEM.calendrier` devient « À faire » : par l'ADR-014, le fil de
  retour et le `<h1>` changent **de concert**, sans table parallèle. Une
  vérification ouverte depuis la vue Tout affiche « ← À faire », depuis la
  vue filtrée « ← Contrôles matériel ». Le mot du retour est celui que le
  dirigeant vient de cliquer.
- `deduireActif` reçoit désormais la query : le surlignage du panneau
  distingue `?famille=controle` du reste. C'est la première fois qu'un
  paramètre d'URL gouverne l'arborescence — borné à ce seul paramètre, et à
  une valeur d'une liste fermée.
- La maquette de la landing (`components/landing/TableauDeBord.tsx`) suit la
  même arborescence : elle montre le produit, elle ne peut pas montrer un
  autre produit.
