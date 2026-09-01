# Où en est le projet — ma réponse, écrite avant l'audit externe

**Scellée le 2026-09-01, avant qu'aucun agent externe n'ait lu le dépôt.**
Elle existe pour être comparée, y compris là où elle a tort.

C'est moi qui dispatche ce projet depuis plusieurs jours. Ce document est donc
juge et partie : le seul usage honnête qu'on puisse en faire est de le confronter
à une lecture qui ne me doit rien.

## L'état que j'affirme

`main` à `76d24ba`, propre, poussée. 1836 tests verts, `tsc` propre, un
avertissement eslint préexistant (`normaliserFormData`). 116 obligations,
17 domaines. 27 ADR.

## Ce que j'affirme couvert

Le socle réglementaire du périmètre V1, selon les trois paliers de
`docs/cadrage-v1.md` : faux négatifs rebranchés, socle employeur, obligations
d'activité et d'effectif. 31 obligations encodées là où le cadrage en prévoyait 22.

## Ce que j'affirme manquant

**Couverture réglementaire — deux trous.**

1. **Le travail en hauteur** (`R. 4323-58` et s.). Vérifié par grep le
   2026-09-01 : **zéro entrée de corpus, zéro citation au référentiel**. Le sujet
   n'est pas exclu du périmètre — il avait été confondu avec les EPI, qui le sont.
   C'est le seul trou de couverture franc que je connaisse.
2. **`R. 4544-11`** — je l'ai listé comme « dépouillé, non encodé ». **Le grep me
   contredit en partie** : `electricite.ts:131` porte
   `reference: "R. 4544-9 à R. 4544-11"` avec `article: "R. 4544-10"`. Le texte
   est donc cité, mais la clé d'article rapproche sur le milieu de la plage. C'est
   le défaut (a) du lot 3 — neuf références de plage portant une seule clé —, pas
   une obligation absente. **Ma formulation d'hier était fausse.**

**Risque de veille — un.** Le décret n° 2026-253 du 8 avril 2026 n'a jamais été
dépouillé. Il a déjà touché deux articles du référentiel, tous deux découverts par
accident : il a réécrit `R. 4624-23`, et abrogé `R. 4412-160` — que le référentiel
avait un temps déclaré « vérifié ». S'il en a touché d'autres, personne ne le sait.
C'est la seule dette qui peut révéler des obligations **fausses**, pas manquantes.

**Quatre limites de modèle**, qui ne sont pas des trous de couverture mais des
obligations correctes qui n'atteignent personne :
`Salarie.entreLe` ne date rien ; le signal de transmission ignore les personnes ;
la famille d'habitation n'existe pas alors que neuf obligations portent la
typologie ; `comporteLocauxSommeilPublic` n'existe pas.

**Deux dettes techniques** : l'avertissement React de clé manquante sur
`BarreAnnee`, cause jamais trouvée ; et aucune recherche systématique des autres
phrases conditionnées par une date.

**L'ADR-025 n'est pas tranché** — sept questions, dont trois contredisent des ADR
en vigueur.

## Ce dont je me méfie dans ma propre réponse

- **Elle est optimiste par construction.** J'ai compté au moins une fois des notes
  de correction comme de la couverture. Le biais va toujours dans le sens
  rassurant.
- **Je n'ai pas mesuré la couverture, je la déduis d'un cadrage que j'ai écrit.**
  Si le cadrage a manqué une famille d'obligations, ma réponse la manque aussi —
  et c'est exactement ce qui s'est produit pour le travail en hauteur, absent du
  cadrage jusqu'à hier.
- **« 1836 tests verts » ne dit rien de la couverture réglementaire.** Cette
  semaine a produit des gardes vertes qui ne mesuraient pas ce qu'elles
  annonçaient : une garde calibrée sur le mauvais composant, une autre rendue verte
  par un commentaire.
- **Le chiffre de 116 obligations n'a pas de dénominateur.** Personne ne sait
  combien il en faudrait.

## La question à laquelle je veux une réponse extérieure

Pas « ai-je raison sur cette liste », mais : **qu'est-ce qui manque à cette liste
elle-même ?** Une famille entière d'obligations, de risques ou de dettes que ni le
cadrage ni moi n'avons vue.

---

# Addendum — reçu APRÈS le scellement, d'une session voisine

**Ne fait pas partie de ma réponse.** Consigné ici parce qu'il en dit long sur
elle : ces cinq points ne figuraient dans aucune de mes listes, et aucun ne vient
de moi.

- La **revue d'assemblage n'a jamais rendu**. Ses cinq sous-agents d'axe ont été
  coupés le 31 au soir sans résultat, et le merge a eu lieu sans eux. Aucun
  résultat intermédiaire n'est fiable. Point de reprise :
  `docs/revues/cadrage-revue-avant-merge.md`. **J'ai présenté la revue comme
  « à reprendre » ; elle est en réalité à faire entièrement.**
- `R. 4323-56` est cité dans le commentaire de l'enum `Realisateur`
  (`schema.prisma`) là où la migration jumelle `20260831120000` cite
  `R. 4624-28`. À contre-vérifier sur Légifrance.
- Une **garde d'action ignore la surcharge de prescription** : par requête forgée
  sur son propre compte, on écrit une déclaration sur une obligation passée au
  calendrier.
- Un **champ de texte libre sans borne de longueur**.
- La 9ᵉ lecture Prisma sans prédicat de tenancy
  (`etats-permanents/queries.ts:98`), plus la question ouverte d'une garde
  mécanique lint/AST.

**Ce que cet addendum démontre avant même l'audit externe** : ma réponse scellée
ne couvre pas la sécurité applicative ni la cohérence des commentaires de schéma.
Elle regarde le référentiel, parce que c'est ce que j'ai piloté.

## Contre-vérification du 2026-09-01 — l'écart `R. 4323-56` était un faux positif

Signalé par une session voisine comme une divergence entre le commentaire de
l'enum `Realisateur` (`schema.prisma:583-588`) et la migration jumelle
`20260831120000_realisateur_sante_travail`.

**Vérifié sur Légifrance, version en vigueur du 1ᵉʳ octobre 2025.** Verbatim de
`R. 4323-56`, alinéa 2 :

> « La validité de cette autorisation de conduite est subordonnée à la détention,
> par le travailleur, d'une attestation qu'il ne présente pas de contre-indications
> médicales à la conduite du ou des équipements dont la conduite est autorisée.
> Cette attestation, **d'une validité de cinq ans**, est **délivrée par le médecin
> du travail** à l'issue d'un examen médical qu'il réalise. »

Le commentaire du schéma est donc **exact**. Il n'y a pas de contradiction : le
schéma cite deux fondements pour `medecin_travail` — `R. 4624-28` (renouvellement
du SIR) et `R. 4323-56` (attestation de conduite) — quand la migration n'en cite
qu'un. **Justification incomplète côté migration, pas référence fausse.**
Aucune correction de code n'est due.

Confirme au passage la validité de cinq ans assertée par `conformite.test.ts:1440`.

**Ce que cet épisode apprend** : un signalement de session voisine se contre-vérifie
comme le reste. Celui-ci portait sur quatre autres points, dont trois que je
n'avais pas ; il en portait aussi un qui ne tenait pas.

## L'addendum ci-dessus était lui-même périmé quand je l'ai écrit

Vingt minutes après l'avoir consigné, la session voisine s'est corrigée : trois de
ses cinq points **étaient déjà réglés dans `main`**. Avec le faux positif
`R. 4323-56`, **il ne reste rien de la liste de cinq**.

Le commit est `6662fa7` « Quatre gardes du module “états permanents”, et deux qui
ne gardaient rien », entré à 10:06 le 2026-09-01. **Contre-vérifié sur pièce ici,
pas relayé** :

- `src/lib/etats-permanents/actions.ts:62-96` — `obligationDeclarable` fait une
  passe de matching complète et termine par `modeDeclarationApplique(app) !== null`.
  La règle a perdu son second argument à défaut commode : l'appelant ne peut plus
  l'omettre par distraction. Un second cas est fermé au passage — l'obligation non
  applicable au dossier, que l'ancienne garde laissait passer sans même invoquer
  une surcharge.
- `actions.ts:116` — `NOTE_MAX = 500`, **rejeté et non tronqué**. Le motif écrit :
  tronquer stockerait une phrase que le dirigeant n'a pas écrite, sur un écran où
  il affirme quelque chose sur sa propre conformité.
- `queries.ts:114-118` — `requireUser()` importé et appelé, `where` portant
  `etablissement: { entreprise: { userId: user.id } }`. Le commentaire dit
  pourquoi la sécurité d'une lecture ne doit pas dépendre de son appelant.

### Ce que cet aller-retour démontre, et c'est le vrai résultat

Le document qui **définit** la revue à faire, `cadrage-revue-avant-merge.md`, a
été mergé dans `main` à 10:39. `6662fa7` était entré à **10:06**. Le cadrage était
donc **périmé sur trois points avant son propre merge**.

C'est exactement la famille de défauts que cette semaine a isolée — une
affirmation juste à l'écriture, laissée debout après que ce qu'elle décrivait a
bougé — appliquée cette fois **au document qui organise la chasse à ces défauts**.

Et mon addendum de 10h50 en est le troisième étage : j'ai relayé une liste sans
ouvrir le code, exactement comme la session voisine, et exactement comme je me
l'étais interdit par écrit trois jours plus tôt.

**Aucune des trois couches n'a été rattrapée par une revue. Les trois l'ont été
parce que quelqu'un a ouvert le fichier.**

Reste ouverte, et c'est la seule chose de valeur qui survive à cet échange : la
**garde mécanique lint/AST** contre les lectures Prisma sans prédicat
d'établissement. Neuf cas, une convention écrite depuis des mois, et un lot pressé
qui la manque quand même — le neuvième a été corrigé à la main comme les huit
précédents. Tant qu'elle est humaine, il y aura un dixième.
