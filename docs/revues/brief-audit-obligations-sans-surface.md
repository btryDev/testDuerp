# Audit — les obligations que le produit calcule et n'affiche pas

**Audit en lecture seule. Aucune correction, aucun commit sur le code.** Tu rends
un rapport.

## Ce qui l'a déclenché

Un contrôle visuel du 2026-08-31, sur un dossier né de l'onboarding — six
personnes, aucun équipement déclaré :

- le moteur calcule **dix-huit obligations** ;
- le calendrier en affiche **deux** ;
- les **seize autres ne sont persistées nulle part**, et n'apparaissent sur aucun
  des neuf écrans ouverts, sauf dans le menu déroulant d'un formulaire de saisie.

`generateur.ts:295` : `if (periodicite === "autre") continue;`. Une obligation
sans périodicité ne produit aucune ligne de `Verification`. **C'est délibéré et
c'est juste** — inventer une date serait pire que n'en afficher aucune. Ce qui ne
l'est pas, c'est qu'aucun écran ne les reprenne ensuite.

**Une première mesure dit que le problème est bien plus large que ce dossier.**
Sur les 116 obligations du référentiel :

| | |
|---|---|
| `periodicite: "autre"` | **43** — 37 % du référentiel |
| dont portées par un **équipement** | 18 |
| dont portées par l'**établissement** | 20 |
| dont portées par un **salarié** | 5 |
| `mise_en_service_uniquement` | 12 — comportement à établir |

Les dix-huit portées par un équipement **existaient avant les lots d'aujourd'hui**.
Elles sont donc invisibles depuis longtemps, sur des dossiers réels.

## Ce que l'audit doit établir

L'ADR-022 nomme **quatre natures** d'obligation : échéance récurrente, état
permanent à constituer puis maintenir, obligation ponctuelle, obligation
événementielle. Le produit a un calendrier, qui sert la première.

**La question de cet audit : quelles natures ont une surface, et qu'advient-il de
celles qui n'en ont pas ?**

### 1. Les 43 sans périodicité — où sont-elles ?

Pour chacune : **est-elle atteignable par un dirigeant, et par quel chemin ?**

Ne te contente pas du calendrier. Le produit a d'autres surfaces — le guide
« Comprendre », la fiche d'un équipement, le registre de sécurité, « Préparer un
contrôle », le tableau de bord et ses widgets, les PDF. **Une obligation peut être
visible ailleurs**, et il serait faux de la compter perdue sans avoir regardé.

Établis-le **par lecture du code**, pas par supposition : quelle surface lit
`obligationsConformite` ou la sortie du moteur, et qu'en montre-t-elle. La liste
des lecteurs se trouve en cherchant qui importe le référentiel.

**Et donne le chiffre qui compte** : combien des 43 ne sont atteignables **par
aucun chemin**.

### 2. Le poids réel, dossier type par dossier type

Le contrôle visuel a mesuré un cas. Mesure-en trois de plus, en appelant
`determineObligationsApplicables` — c'est mécanique et ça ne demande aucune base :

- un **restaurant** : ERP de 5ᵉ catégorie, type N, avec un parc d'équipements
  réaliste (extincteur, alarme, installation électrique, hotte, appareil de
  cuisson, chambre froide, VMC) ;
- un **commerce de détail** : ERP 5ᵉ catégorie, type M, quelques équipements ;
- le **bureau** déjà mesuré, pour la comparaison.

Pour chacun : combien d'obligations applicables, combien datées, combien sans
date. **C'est ce tableau qui dira si le défaut est marginal ou structurel.**

Le jeu de démonstration décrit un restaurant — « Le Bistrot du Marché », neuf
équipements — regarde comment il est composé plutôt que d'inventer un parc.

### 3. `mise_en_service_uniquement` — que devient la ligne une fois soldée ?

Douze obligations portent cette périodicité. `generateur.ts:320` les traite à part.
Lis ce qu'il en fait, et surtout **ce qu'il en advient après réalisation** :
l'obligation disparaît-elle de l'écran, ou reste-t-elle consultable ? Une
vérification de mise en service faite il y a trois ans est une pièce du dossier ;
si elle s'efface, c'est un second trou de la même famille.

### 4. L'événementiel est-il couvert ?

`PermisFeu` et `PlanPrevention` sont des modules dédiés. Couvrent-ils tout ce que
le référentiel classe comme événementiel, ou y a-t-il des obligations
événementielles sans module ? `docs/registre-securite-ecart.md` recense des
modèles manquants — trois obligations attendent aujourd'hui un modèle que le
produit n'a pas. Regarde si ce registre est à jour.

## Ce que tu ne fais pas

- **Tu ne corriges rien.** Ce n'est pas un lot, c'est une mesure.
- **Tu ne proposes pas d'écran.** Un brief existe déjà pour la surface des états
  permanents (`docs/revues/brief-ecran-etats-permanents.md`) — lis-le pour savoir
  ce qui est déjà décidé, et **dis si ta mesure le contredit**. C'est la question
  la plus utile que tu puisses trancher : cet écran a été dimensionné sur seize
  obligations d'établissement ; s'il doit en porter quarante-trois dont dix-huit
  liées à un équipement, ce n'est pas le même écran.
- **Tu ne touches à aucune branche.** Travaille sur
  `origin/integration/2026-08-31`, en lecture. D'autres sessions écrivent sur ce
  dépôt : **crée ton propre worktree**, avec son propre `node_modules` — le client
  Prisma s'écrit dans le `node_modules` partagé et contamine les voisins.

## Les règles

- **Ouvre le fichier avant de qualifier ce qu'il contient.** Toutes les erreurs
  coûteuses de ce chantier viennent d'une conclusion tirée d'un commentaire, d'une
  note ou d'un résumé — y compris plusieurs dans des briefs que j'ai écrits.
- **N'invente aucune vérification.** Une surface que tu n'as pas ouverte se dit
  « non vérifiée ».
- **Pas de faux positif.** Une obligation atteignable par un chemin que tu n'avais
  pas regardé n'est pas un défaut. Cherche avant de conclure.
- **pnpm, jamais npm.**

## Ce que tu rends

`docs/revues/rapport-audit-sans-surface.md`, et dedans :

1. **Le tableau des 43** : obligation, porteur, domaine, surface où elle apparaît —
   ou « aucune ».
2. **Le tableau des quatre dossiers types** : applicables / datées / sans date.
3. **Ce que devient une obligation de mise en service soldée.**
4. **Les quatre natures de l'ADR-022, et leur surface** — c'est la conclusion.
5. **Ce que ta mesure change au brief de l'écran**, s'il change quelque chose.
6. Ce que tu n'as pas pu établir, et pourquoi.

Une question ? Elle vient à la session qui t'a délégué cet audit, pas à la
propriétaire.
