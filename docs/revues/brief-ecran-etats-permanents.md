# Écran « Ce qui doit être en place »

## Le constat qui l'appelle

Un contrôle visuel du 2026-08-31, sur un dossier né de l'onboarding — six
personnes, aucun équipement déclaré :

- le moteur calcule **dix-huit obligations** ;
- le calendrier en affiche **deux** ;
- les **seize autres ne sont persistées nulle part**, et n'apparaissent sur aucun
  des neuf écrans ouverts — sauf un : le menu déroulant « Obligation concernée »
  du formulaire de déclaration de prescription, sur un écran dont le texte
  d'accueil dit « si aucune autorité ne vous a rien prescrit, il n'y a rien à
  faire ici ».

`generateur.ts:295` : `if (periodicite === "autre") continue;`. Une obligation
sans périodicité ne produit aucune ligne de `Verification`. C'est délibéré et
c'est juste — **inventer une date serait pire que n'en afficher aucune** — mais
la conséquence ne l'est pas : trois lots ont dépouillé des textes, encodé seize
obligations et écrit leurs tests, et **aucun utilisateur ne les verra jamais**.

**Ce n'est pas un défaut d'affichage. Le produit n'a pas de surface pour cette
nature d'obligation.** L'ADR-022 en nomme pourtant quatre — échéance récurrente,
**état permanent à constituer puis maintenir**, obligation ponctuelle, obligation
événementielle. Seule la première a un écran.

## Ce que tu construis

Un écran qui liste les obligations que le dossier déclenche **et qui n'ont pas de
date**, groupées par domaine, chacune déclarable en place.

```
CE QUI DOIT ÊTRE EN PLACE                    6 sur 16 déclarés

 INFORMATION DES TRAVAILLEURS
  ✓  Affichage des coordonnées : médecine, secours      déclaré le 31/08/2026
  ○  Avis affiché sur les modalités d'accès au DUERP

 LOCAUX SOCIAUX
  ✓  Vestiaires, lavabos et cabinets d'aisance          déclaré le 31/08/2026
  ○  Eau potable et fraîche à disposition
  ○  Emplacement pour se restaurer (moins de 50 salariés)

 ORGANISATION DE LA PRÉVENTION
  ○  Salarié désigné compétent en protection et prévention
```

## Les deux décisions déjà prises

Elles sont tranchées, ne les rouvre pas — mais dis-moi si le dépouillement du code
les contredit.

**1. Une déclaration seule, aucune pièce.** Le dirigeant coche, on date la
déclaration, rien d'autre. La plupart de ces obligations n'ont pas de document —
une affiche au mur, de l'eau potable, un salarié désigné. Demander un justificatif
là où le texte n'en produit aucun ferait cocher à vide.

*Conséquence à ne pas rater* : cet écran ne doit ouvrir **aucune surface de
dépôt**. Le balayage de `src/lib/rgpd/frontiere-medicale.test.ts` lit le texte du
source et échoue sur une surface de dépôt non gardée — vérifie qu'il couvre ton
nouveau chemin, et si ce n'est pas le cas, ajoute-le.

**2. Aucune relance, mais la date de déclaration est affichée.** « Déclaré en
place le 31/08/2026 ». Le dirigeant juge lui-même si c'est vieux.

*Pourquoi* : aucun de ces textes n'écrit de rythme. Poser une relance annuelle
serait une périodicité inventée — exactement ce que ce dépôt a retiré ailleurs, le
triennal qui venait d'une norme NF et non du droit. **Ne fabrique pas une échéance
sur cet écran, sous aucune forme**, y compris un badge « à revoir ».

## Ce que le brief ne tranche pas, et que tu proposes

**Où l'écran vit.** La navigation porte cinq entrées de rail (ADR-015). Un cadrage
produit récent (ADR-025, proposé et non tranché) en propose trois — santé-sécurité,
équipement et bâtiment, documentation. **Ne refonds pas la navigation** : pose
l'écran là où il se justifie aujourd'hui, et écris pourquoi. Si aucune place
n'existe sans créer une entrée de rail, dis-le plutôt que d'en créer une.

**Comment se persiste une déclaration.** Il n'y a pas de modèle pour ça. Une
`Verification` sans date serait un contresens — c'est justement ce que le
générateur refuse. Propose, argumente en ADR si c'est structurant.

Contrainte : la **régénération est idempotente** (ADR-012) et les obligations
peuvent être retirées du référentiel. Une déclaration doit survivre à une
régénération, et ne pas devenir un orphelin quand l'obligation disparaît — le
générateur a déjà appris à distinguer « retirée du référentiel » de « n'a plus
d'échéance datable », lis ce qu'il en fait (`generateur.ts`, la boucle finale).

**Ce que compte l'en-tête.** « 6 sur 16 » : seize est le nombre d'obligations sans
date que **ce dossier** déclenche, pas un total du référentiel. Vérifie-le en
appelant le moteur, ne l'écris pas à la main — un compte écrit à la main se répare
en recopiant ce que le code rend, et ce dépôt s'est fait avoir deux fois
aujourd'hui par des listes exhaustives (`chez-vous.test.ts`, l'histoire est dans
son en-tête).

## Ce que l'écran doit dire de lui-même

Le produit **nomme ce qu'il ne couvre pas** au lieu de se taire — c'est sa marque,
et l'ADR-024 en fait un mécanisme. Cet écran ne doit pas devenir une liste de
reproches : seize lignes non cochées chez un dirigeant qui vient de créer son
dossier, ce n'est pas un constat de manquement, c'est une liste de ce qu'il a à
mettre en place. **Le ton compte autant que le contenu.**

Regarde comment le bandeau de couverture du calendrier et l'écran Équipe
formulent ce genre de chose — ils sont récents, relus, et ils ont trouvé la bonne
distance.

## Vérification

`pnpm vitest run`, `npx tsc --noEmit`, `npx eslint src`. Attendu au départ :
**1767 tests verts**, `tsc` propre, un avertissement eslint préexistant
(`normaliserFormData`).

**Ce lot a une vérification qui lui est propre** : le point est qu'une obligation
sans date devienne visible. Un test qui passe ne le montre pas. Écris donc un test
qui établit, **par le moteur**, qu'un établissement de six personnes sans
équipement reçoit seize obligations sans date, et que l'écran les rend toutes.
Éprouve-le en réinjectant le défaut.

## Les règles du dépôt

- **Ouvre le fichier avant de qualifier ce qu'il contient.** Toutes les erreurs
  coûteuses de ce chantier viennent d'une conclusion tirée d'un commentaire ou
  d'un résumé — y compris trois références fausses dans mes propres briefs.
- **N'invente aucune périodicité, ni aucune donnée d'illustration.** Le contrôle
  visuel vient de trouver un `VALIDÉ · v3 · 04/26` figé sur un dossier de dix
  minutes, une ligne au-dessus d'une promesse de « calculé depuis votre dossier ».
- **La charte est le board** (`docs/charte-board.md`) — le « papier » est de la
  dette, jamais une option.
- **pnpm, jamais npm.** Un worktree a son propre `node_modules`.
- **Ne pousse jamais sur `main`.** Branche : `feat/etats-permanents`, à partir de
  `origin/integration/2026-08-31`.

## Ce que tu rends

Une branche et un rapport dans `docs/revues/rapport-etats-permanents.md` :
l'emplacement retenu et pourquoi, le modèle de persistance et son argument, ce que
l'écran affiche sur un dossier neuf, et ce que tu n'as pas su faire.

Une question ? Elle vient à la session qui t'a délégué ce lot.
