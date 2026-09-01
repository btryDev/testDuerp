# ADR-031 — Refuser à l'entrée ce qu'on ne sait pas servir du tout

- **Statut** : acceptée, 2026-09-01 (réunion d'équipe)
- **Portée** : `src/lib/onboarding/` (validation, schéma, actions),
  `src/lib/etablissements/schema.ts`, `src/lib/perimetre/couverture.ts`,
  `src/lib/referentiels/corpus/perimetre.ts`
- **Amende** l'ADR-020, qu'elle ne renverse pas · **Découle de** l'ADR-025

## Le problème

La doctrine du produit est de **nommer ce qu'il ne couvre pas plutôt que de
refuser**. Elle est portée par l'ADR-020, par `perimetre/couverture.ts` — qui
rend des manques et des indéterminations, jamais un score —, par
`docs/couverture-declaree-du-produit.md` sous la garde d'un test, et par le
bandeau du calendrier. Elle a une bonne raison : refuser un dossier au motif
qu'un point n'est pas couvert ferme la porte à un dirigeant qui aurait profité de
tout le reste. C'est exactement la faute qu'a corrigée `onboarding/scope.ts`, qui
refusait la création hors des trois secteurs de DUERP instruits et bloquait ainsi
l'accès au référentiel de conformité, lequel ne lit jamais le code NAF.

Le cadrage du 2026-09-01 demande pourtant un **refus à l'entrée** pour une liste
de régimes. Il faut donc dire précisément où passe la frontière, sinon la
prochaine session appliquera l'une ou l'autre doctrine au hasard de celle qu'elle
aura lue.

## La décision

**On refuse ce que le produit ne sait pas servir *du tout*. On déclare ce qu'il
sert incomplètement.**

Le critère est la nature du manque, pas sa taille.

| | Refus à l'entrée | Déclaration continue |
|---|---|---|
| **Ce qui le déclenche** | Un régime dont le produit n'a lu aucun règlement, ou une exposition qu'il ne sait pas détecter | Un régime servi, dont une partie manque |
| **Exemples** | IGH, ICPE, gares, CTS, pénitentiaires, équipements sportifs, ATEX, DRPCE, CEM, CMR, amiante, plomb, radon, rayonnements ionisants ; effectif au-delà de cinquante | ERP de 1re à 4e catégorie, secteur de DUERP non instruit, équipement hors référentiel, obligations suspendues au public reçu |
| **Ce que voit le dirigeant** | La création s'arrête et dit pourquoi | Le dossier vit et le prévient en permanence |

**L'ADR-020 n'est pas renversée.** Son mécanisme — ce qu'un DUERP ne couvre pas
se déclare et se grave avec la version — reste entier, et le module de couverture
avec lui : ils gouvernent toute la colonne de droite. Ce que cette ADR ajoute est
une classe de cas traitée **en amont**, avant que le dossier n'existe.

Trois précisions, parce que chacune a failli être prise à l'envers.

**1. La borne d'effectif vaut à la création, pas en édition.** Un client qui
passe de quarante-cinq à soixante salariés reste servi : lui fermer son dossier
parce qu'il a embauché serait absurde. Mais la promesse implicite doit rester
explicite — au-delà de cinquante, son dossier porte un manque de couverture qui
le dit. C'est le même traitement d'honnêteté que les ERP de 1re à 4e catégorie.

**2. Le refus ne borne jamais le déclenchement d'une obligation.** Les seuils du
référentiel se lisent sur ce qu'ils visent : `personnesPresentesHabituellement`
n'est pas plafonné par la borne d'effectif, et un établissement de trente
salariés qui reçoit soixante personnes déclenche toujours la consigne et
l'exercice semestriel. Un test verrouille ce cas précis : c'est exactement le
genre de conséquence qu'une borne posée trop haut dans la pile emporterait sans
bruit.

**3. Un refus n'est jamais un cul-de-sac.** L'écran de refus nomme le régime,
dit pourquoi le produit ne le sert pas, et renvoie vers la page des éléments
exclus, qui donne des indications. Refuser sans expliquer serait pire que servir
mal.

## Ce que ça coûte si on se trompe

Un refus est plus dur à découvrir qu'un bandeau : la personne refusée ne
reviendra pas dire qu'elle l'a été à tort. La liste des régimes refusés est donc
un objet à relire — pas une constante qu'on augmente au fil des cas gênants.
Chaque ajout à cette liste passe par une décision, comme celui-ci.
