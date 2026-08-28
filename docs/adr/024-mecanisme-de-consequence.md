# ADR-024 — Une obligation déclare ce qu'elle implique ailleurs

- Statut : acceptée
- Date : 2026-08-28
- Portée : `src/lib/referentiels/conformite/types.ts` (`Transmission`,
  `ObligationCommune.transmet`), `src/lib/prestataires/domaines.ts`
  (correspondance domaine d'obligation → domaine de prestataire — **côté
  prestataires**, cf. § « Ce qui est dérivable n'est pas déclaré » : le
  référentiel n'importe rien de Prisma), `src/lib/dashboard/transmissions.ts`,
  `src/lib/dashboard/recommandations.ts`, `scripts/export-relecture.ts`
- Dépend de : ADR-003 (référentiel en TypeScript versionné), ADR-010 (registre
  des sources d'échéances), ADR-019 (le bâtiment est un lieu),
  ADR-022 (porteur d'échéance), ADR-023 (porteur salarié)

## Contexte

Le produit a un mécanisme de **naissance** d'obligation très soigné : un moteur
de matching qui explique ses décisions, trois porteurs, un générateur
idempotent, un registre de sources qui interdit qu'une colonne datée reste
orpheline. Il n'a **aucun mécanisme de conséquence**. Une obligation née ne dit
jamais ce qu'elle exige ailleurs.

Le constat est arrivé par une question d'utilisatrice : une électricienne est
déclarée à l'effectif, un tableau électrique est déclaré au parc, et rien nulle
part ne dit qu'une habilitation est peut-être due. Un recensement a suivi. Il
n'a pas trouvé un cas, il en a trouvé treize :

- une obligation exige un `organisme_agree` et rien ne regarde si l'annuaire de
  prestataires en contient un — les deux modules ne s'importent pas ;
- le domaine d'obligation `froid` n'a **aucune contrepartie** dans les quinze
  domaines de prestataire, alors que c'est précisément l'obligation qui exige un
  opérateur certifié ;
- trois domaines portent deux noms selon le module (`aeration` /
  `ventilation_vmc`, `porte_portail` / `porte_automatique`,
  `equipement_sous_pression` / `equipement_pression`), et **deux exports nommés
  `LABEL_DOMAINE` cohabitent** sans jamais être importés ensemble ;
- une mesure de DUERP de type `formation` recouvre mot pour mot des obligations
  réglementaires périodiques, et les deux référentiels ne se connaissent pas ;
- `organismeVerif` est saisi en texte libre sur un rapport, et n'est jamais
  rapproché de la fiche de prestataire dont l'attestation URSSAF a expiré ;
- une analyse de légionelles ne connaît pas le laboratoire qui l'a faite,
  bien que le domaine `carnet_sanitaire` existe à l'annuaire.

Aucun de ces manques n'est une erreur de code. Chacun est une **implication du
texte réglementaire qui n'a jamais été écrite nulle part** : ni dans le
référentiel, ni dans un document, ni dans un test. Elle a été redécouverte, une
par une, en revue.

## Le troisième terme

Le refus de **dériver** est déjà écrit et il est juste. Rien dans le modèle ne
dit qu'une personne opère sur des installations électriques ; appliquer
l'habilitation à tout l'effectif parce qu'un tableau existe serait un faux
positif de masse, et l'ADR-023 le dit. `docs/dette-chantier-porteur-echeance.md`
§ 8 va plus loin : « une page vide y est un constat juste, pas un défaut ».

Mais entre **dériver** — refusé — et **se taire** — l'état actuel —, il existe
un troisième terme, et le dépôt l'applique déjà partout ailleurs : **nommer le
trou sans le combler**.

- `src/lib/equipements/hors-referentiel.ts` : « Le silence ne doit jamais
  ressembler à une réponse. » Trois motifs distincts, trois phrases distinctes,
  et une règle explicite sur ce que le module **ne dit pas**.
- `src/lib/duerps/couverture.ts` : « Ce module ne comble pas le trou : il le
  nomme. »
- `src/lib/perimetre/couverture.ts` : un établissement hors périmètre n'est pas
  bloqué, il est **informé** que ce qu'il lit est incomplet.

Cette décision applique la même doctrine aux conséquences d'une obligation.

## Décision

**1. Une obligation déclare ses transmissions, dans un champ requis.**

`ObligationCommune` porte `transmet: Transmission[]`. Le champ est **requis**, et
c'est tout l'intérêt : un tableau vide est une réponse, un champ absent n'en est
pas une. C'est la quatrième garantie de cette famille dans le référentiel :

| Champ | Ce qu'il force |
|---|---|
| `pieceMedicale: boolean` requis | On ne peut pas ajouter une obligation salarié sans répondre à la question médicale |
| `declareA` sur un article de corpus | Dit **où** le manque est annoncé — oblige à écrire « nulle part » plutôt qu'à se taire |
| `versionConstatee` / `relectureDue` | Chaque référence dit quand elle a été vue ; un test échoue quand la relecture est due |
| `transmet` | Oblige à répondre « cette obligation implique-t-elle quelque chose ailleurs ? » |

Le raisonnement est celui, mot pour mot, qui a rendu `pieceMedicale` requis :
optionnel, le champ se serait tu, et l'oubli aurait été la faute naturelle.
Requis, l'oubli ne compile pas.

**2. Ce qui est dérivable n'est pas déclaré.**

Une obligation qui exige un `organisme_agree` en `electricite` implique un
prestataire d'électricité. Cette implication se calcule à partir de `domaine` et
`realisateurs`, qui existent déjà : la déclarer sur chacune des 85 obligations
serait recopier 85 fois une règle qui tient en une table. Le dépôt interdit
explicitement ce genre de duplication.

La correspondance `DomaineObligation → DomainePrestataire[]` vit donc **une
fois**, dans un `Record` exhaustif — la forme que le référentiel emploie déjà
pour `LIBELLE_SOURCE` : ajouter un domaine sans lui donner de contrepartie ne
compile pas. C'est la garantie qui manquait quand `froid` a été ajouté.

`transmet` ne porte donc que ce qui **ne se dérive pas** : le titre de salarié
visé, la fiche de registre attendue, l'attribut d'établissement ou de bâtiment
qui manque pour trancher.

**3. Le produit nomme la transmission, il ne la dérive jamais en échéance.**

Une transmission ne crée aucune ligne de calendrier, ne coche rien, ne préremplit
rien. Elle **dit** : « cette obligation suppose quelque chose que vous n'avez pas
déclaré ». Le dirigeant tranche.

Corollaire : `transmet` **n'entre pas dans `empreinteReferentiel()`**. L'empreinte
existe pour détecter qu'une obligation productrice d'échéances a changé et qu'il
faut réconcilier tous les calendriers. Une transmission ne produit pas
d'échéance ; l'y faire entrer forcerait la réconciliation de tous les dossiers à
chaque annotation de relecture, pour un résultat identique. Cette exclusion est
délibérée et doit le rester — c'est exactement le genre de décision qu'un lot
ultérieur reprend « par cohérence » sans voir le coût.

**4. Le canal de sortie est le moteur de recommandations.**

`src/lib/dashboard/recommandations.ts` porte huit règles, **toutes fondées sur
des dates** : retards, échéances proches, amorçage. Aucune n'est fondée sur une
**incohérence entre deux modules**. C'est la famille qui manque, et c'est là
qu'elle va.

Elle en hérite les propriétés : fonction pure, horloge injectable, priorité
numérique. Et elle en hérite la règle des amorçages — **une transmission ne
passe jamais devant une urgence réelle**. Un retard réglementaire est un fait ;
une transmission est une question.

**5. La transmission est visible là où la réglementation se lit.**

`pnpm relecture` déplie une ligne par couple obligation × référence : c'est le
document qu'on a sous les yeux quand on vérifie un article sur Légifrance. Il
gagne une colonne `transmet`.

C'est le point qui a motivé cette décision plutôt qu'un simple correctif. Le
mécanisme ne vaut que si la question se pose **au moment où quelqu'un encode ou
relit un texte**, et pas trois mois plus tard en revue. Le type l'impose aux
obligations nouvelles ; l'export de relecture la pose sur les 85 existantes.

## Ce que nous ne faisons pas, et pourquoi

**Pas de cliquet sur les transmissions vides.** L'idée a été écartée après
l'avoir tenue un moment. Un cliquet interdit à un compteur de remonter ; il
suppose donc que ce compteur doive tendre vers zéro. Or la plupart des
obligations ne transmettent réellement rien, et `transmet: []` est pour elles la
réponse juste et définitive. Un cliquet aurait mis une pression mécanique à
inventer des transmissions pour faire baisser un chiffre — un palliatif qui
fabrique de la fausse donnée pour satisfaire un test. La garantie est portée par
le type et par l'export de relecture, pas par un compteur.

**Pas de dérivation, même « suggérée à titre indicatif ».** La frontière est
celle de l'ADR-023 et elle ne bouge pas : l'outil ne dit jamais qu'une personne
doit être habilitée, parce qu'il ne sait pas qui opère sur quoi. Il dit que
l'obligation existe et que personne n'est déclaré.

**Pas de porteur `batiment`.** Deux des transmissions recensées visent un
attribut de bâtiment (année du permis de construire, pour le dossier technique
amiante et le constat de risque d'exposition au plomb). L'ADR-019 a tranché que
le bâtiment est un lieu et ne porte aucun régime ; cette décision ne le rouvre
pas. `transmet` peut **nommer** l'attribut manquant sans qu'aucune échéance ne
naisse — c'est précisément ce que le troisième terme permet.

## Conséquences

- Les 85 obligations reçoivent `transmet`. La très grande majorité reçoit `[]`,
  et le dit plutôt que de se taire.
- Ajouter un domaine d'obligation sans lui donner de contrepartie prestataire ne
  compile plus. `froid` en reçoit une.
- Le moteur de recommandations reçoit des entrées qu'il n'avait pas : ce que le
  parc déclare, ce que l'annuaire couvre, ce que l'effectif déclare. Sa signature
  s'élargit, sa nature — pure, sans base, horloge injectable — ne change pas.
- `pnpm relecture` rend une colonne de plus.

## Ce qui reste ouvert

Le recensement a produit treize transmissions ; cette décision en câble les
premières, celles dont le coût est petit et la donnée déjà présente. Les autres
supposent des modèles qui n'existent pas — `ExerciceSecurite`,
`PersonnelSecurite`, `ControleAdministratif`, recensés dans
`docs/registre-securite-ecart.md` — ou un attribut de bâtiment que l'ADR-019
n'accorde pas. Elles restent nommées, non câblées, et c'est un état déclaré, pas
un oubli.
