# ADR-027 — Une déclaration n'est pas une preuve

- **Statut** : accepté, 2026-08-31
- **Contexte** : lot « écran des états permanents » (`feat/etats-permanents`),
  à la suite de l'ADR-022 (les quatre natures d'obligation) et de l'ADR-026
  (la nature devient un champ)

## Le problème

L'ADR-022 nomme quatre natures d'obligation. Une seule — l'échéance récurrente —
avait un support de persistance, `Verification`, et un écran, le calendrier.

Le contrôle visuel du 2026-08-31, sur un dossier né de l'onboarding, l'a mesuré :
le moteur calculait dix-huit obligations, l'application en affichait deux. Les
seize autres n'étaient persistées nulle part. Le générateur les écarte à raison —
sans périodicité, pas de rendez-vous, et inventer une date serait pire que n'en
afficher aucune — mais la conséquence ne l'était pas : trois lots avaient
dépouillé des textes, encodé des obligations et écrit leurs tests, et **aucun
utilisateur ne les aurait jamais vues**.

Donner une surface à ces obligations suppose de persister quelque chose. Et c'est
là que le vrai risque apparaît, qui n'est pas technique.

## La décision

**Ce que l'employeur coche est une déclaration. Ce n'est ni un rapport de
vérification, ni une pièce, ni un constat du produit — et le produit ne doit
jamais les confondre.**

Trois conséquences, toutes trois contraignantes.

### 1. Un support distinct de `Verification`, et ce n'est pas un détail

`DeclarationEtatPermanent` : `etablissementId`, `obligationId` (sans clé
étrangère — le référentiel vit en TypeScript, ADR-003), `declareLe`, `note`,
unique sur le couple.

Une `Verification` sans date aurait été le raccourci évident. C'est exactement ce
que le générateur refuse, et pour une bonne raison : **une `Verification` porte
une échéance, donc une affirmation datée.** C'est ce qui l'oblige, quand son
obligation quitte le référentiel, à tout l'appareil `aArchiver` /
`marquerNonApplicable` de la boucle finale du générateur — une ligne orpheline
qui porte une date ment.

Une déclaration ne porte aucune échéance. Il n'y a rien à barrer. Elle survit à
la régénération **par construction**, le générateur ne lisant ni n'écrivant sa
table ; et une déclaration dont l'obligation a disparu cesse simplement de
s'afficher, parce que l'écran **liste les obligations que le moteur rend et y
joint les déclarations, jamais l'inverse**. La ligne est conservée : si
l'obligation revient, la déclaration revient avec elle.

Le patron est `TitreSalarie` (ADR-023), pas `Verification`.

### 2. Une déclaration n'allume rien ailleurs

Elle ne fait progresser aucun « % prêt », ne passe aucun indicateur au vert,
n'entre dans aucun export comme une pièce du dossier.

Le motif est précis : l'écran *Préparer un contrôle* est celui qu'on ouvre devant
un inspecteur. Y faire remonter une déclaration non vérifiée reviendrait à
récompenser une affirmation de l'employeur **là où la distinction coûte le plus
cher**. Ce dépôt a déjà rencontré le défaut sous une autre forme le même jour :
une coche verte à droite d'un badge rouge « En retard », sans rien qui dise ce
que la coche comptait.

Corollaire de rédaction : « 6 sur 12 **déclarés en place par vous** », jamais
« 6 sur 12 conformes ». Le produit assiste, il ne certifie pas (règle 8 de
`CLAUDE.md`).

### 3. Aucune surface de dépôt, mais l'écrit attendu se nomme

L'écran ne collecte aucune pièce. C'est juste pour une affiche au mur ou de l'eau
potable : demander un justificatif là où le texte n'en produit aucun ferait
cocher à vide.

Mais cocher « en place » sur un registre de sécurité **est** une déclaration qui
ressemble à une preuve. D'où `pieceAttendue` (ADR-026) : l'écran nomme l'écrit
que le texte attend — « Le texte attend un écrit : registre de sécurité » —
sans le demander. **Nommer n'est pas collecter**, et taire l'écart ferait cocher
sans savoir ce qu'on affirme détenir.

## Ce que la décision interdit explicitement

- **Aucune relance, sous aucune forme**, y compris un badge « à revoir ». Aucun
  des textes concernés n'écrit de rythme : en poser un serait une périodicité
  inventée, ce que ce dépôt a déjà eu à retirer — un « triennal » qui venait
  d'une norme NF et non du droit. La date de déclaration s'affiche, le dirigeant
  juge lui-même.
- **Aucun historique de déclarations.** Redéclarer redate la ligne, elle ne
  s'empile pas. Un historique ressemblerait à une trace, et une trace ressemble à
  une preuve.
- **Aucune double surface.** Une obligation est au calendrier ou sur cet écran,
  jamais aux deux. Le partage se lit sur une fonction unique,
  `estSansRendezVous`, appelée par le générateur **et** par l'écran — écrite des
  deux côtés, elle aurait divergé, et c'est le défaut que la journée du
  2026-08-31 a passé à retirer sur deux widgets jumeaux.

## Le critère de sélection, et pourquoi il n'est pas celui qu'on croit

L'écran ne montre pas « les obligations sans périodicité ». Ce critère rassemble
quatre natures, et une case « déclaré en place » ment aux trois qui ne sont pas
des états — une obligation événementielle redevient due au fait suivant, et rien
dans le produit n'observe ce fait.

Il ne montre pas non plus « les états permanents » tout court : l'un d'eux
produit une ligne de calendrier (`mise_en_service_uniquement`, que le générateur
date au lieu de la sauter), et le retenir lui donnerait deux surfaces.

Le critère est donc **`nature === "etat_permanent"` ET le générateur n'en produit
aucune ligne**, cette seconde moitié étant lue sur la périodicité **effective**,
surcharge de prescription particulière comprise (ADR-014) : un arrêté préfectoral
qui donne un rythme à une obligation qui n'en avait pas la fait passer de l'écran
au calendrier.

### Un second verbe, pour ce qui revient sans rythme écrit

Quelques obligations sont des échéances récurrentes que le texte fait revenir
sans dire à quel intervalle. Elles tiennent sur cet écran à deux conditions :

- **le verbe change** — « fait le », jamais « en place » : un fait daté vieillit,
  un état ne vieillit pas ;
- **elles n'entrent pas dans le compteur d'en-tête**, qui porte une affirmation
  et non un décompte.

Le verbe **n'est pas persisté** : il se déduit de la nature, qui vit au
référentiel. Le stocker dupliquerait une règle qui existe déjà, et une obligation
dont la nature change au prochain dépouillement changerait de verbe sans
migration.

## Où l'écran vit

Quatrième item du panneau « À faire », **sans nouvelle entrée de rail**.

La décision 4 de l'ADR-015 pose que ce panneau « ne porte que des activités » et
qu'« aucune entrée n'est l'état filtré d'une autre ». Les deux conditions
tiennent : mettre en place est une activité — c'est même la seule chose à faire
d'un dossier neuf, dont le calendrier est presque vide — et ce n'est pas un
filtre du calendrier pour une raison structurelle et non contingente, puisque ces
lignes **ne peuvent pas** exister comme `Verification`. Un filtre suppose que
l'objet soit là ; ici il n'y est pas et n'y sera jamais.

L'ADR-022 nomme quatre natures ; la première a son écran sous « À faire », la
deuxième se range à côté d'elle parce que les deux répondent à la même question
du dirigeant.

Pas de compteur au rail, délibérément : le badge du Calendrier compte des
retards, et ici rien n'est en retard puisque rien n'a d'échéance. Un compteur
voisin portant un autre périmètre est ce que la décision 5 du même ADR interdit.

## Ce que la décision ne tranche pas

- **Les deux natures restantes.** L'obligation ponctuelle n'a pas besoin d'un
  écran mais d'une date, et le mécanisme existe. L'événementielle n'a toujours
  aucune surface, et cet ADR n'en crée pas : « en place » lui mentirait, « fait
  le » aussi.
- **Le ton devant un contrôle.** Rien ne dit encore ce que devient une
  déclaration dans le dossier remis à un tiers. La décision 2 dit ce qu'elle **ne
  fait pas** ; ce qu'elle pourrait faire, nommée comme déclaration, reste ouvert.
