# Journal des vérifications réglementaires

Ce document répond à une seule question : **qu'est-ce qui a été relu dans le
droit, quand, comment — et qu'en a-t-on fait ?**

Il existe parce que la réponse n'existait nulle part. Elle ne vivait que dans
des messages de commit, que personne ne relit. Conséquence mesurée : le
2026-09-01, la propriétaire et une session Claude ont cru successivement
qu'aucune relecture n'avait eu lieu, puis que tout était vérifié, et ont failli
relancer une relecture complète de textes lus le 2026-08-26.

**Deux règles de tenue, et elles sont le document.**

1. *Un rapport rendu n'est pas un défaut corrigé.* La chronologie (partie 1)
   dit ce qui a été **cherché** ; le registre (partie 2) dit ce qui a été
   **appliqué**. Les deux ne se déduisent pas l'un de l'autre.
2. *Un état se relève dans le code, jamais dans un message de commit.* Chaque
   ligne d'état du registre porte sa preuve : un fichier, une commande, un
   chiffre qu'on peut refaire tomber.

Établi le 2026-09-01 sur `origin/main` = `840abe2`, référentiel
**2026-08-31.4** — 116 obligations, 226 lignes de référence, 276 articles au
corpus. Tous les chiffres de ce document ont été mesurés à cette révision, par
les commandes citées. Aucun n'est repris d'un rapport.

> **Ce document n'est pas le registre du projet.** Le registre vit dans le
> code — champs `statut`, `reserve`, `lecture`, `luLe`, `versionConstatee` du
> corpus — et se lit par `pnpm relecture`. Ce document est ce que le code ne
> sait pas dire : *l'histoire*, et l'état des constats faits **hors** du code,
> dans des rapports. Voir la partie 3.

---

## Partie 1 — Chronologie des campagnes

Ne sont retenues ici que les campagnes qui **ouvrent un texte de droit**. Les
revues d'écran, les contrôles visuels et les audits de surface produit n'y
figurent que lorsqu'ils ont produit un constat réglementaire.

Pour chacune : **quand · par quoi · sur quoi · comment lu · ce qui en sort · ce
qui a été appliqué.** La dernière colonne est celle qui manquait.

Trois provenances de lecture sont distinguées partout, selon le vocabulaire que
le code s'est donné (`SourceLecture`, `corpus/types.ts`) : **première main**
(la personne qui encode a ouvert Légifrance et relevé le verbatim), **agent**
(un agent a ouvert Légifrance et rapporté le verbatim — « vaut constat, pas
garantie »), **indirect** (source secondaire — interdit de fonder une entrée).

---

### C1 · 2026-08-20 → 08-21 — Recalages ponctuels, sans aucun dispositif

**Périmètre** — deux obligations, prises isolément.
**Méthode** — lecture ciblée d'un article, sans trace structurée : à cette date
le corpus n'existe pas, aucun champ ne porte la version lue ni la provenance.

- `648969f` (08-20 22:25) *Le registre s'appuie sur l'article qui l'autorise,
  pas sur celui qui le range* — **première mise en cause de `L. 4711-5`**.
- `23ac89b` (08-21 11:20) — l'éclairage de sécurité en lieu de travail est
  rattaché à `R. 4227-14` et à l'article 11 de l'arrêté du 14 décembre 2011.
  Deux obligations créées. Point de départ du sur-appel documenté en 2.A #1.

**Appliqué** : oui, intégralement — mais rien ne le mesure, et rien ne
l'indexe. C'est le régime dont tout ce qui suit cherche à sortir.

---

### C2 · 2026-08-23 — Le froid, et la citation approximative

**Périmètre** — le domaine froid (`R. 543-79` c. env., règlement UE 517/2014),
plus quatre obligations ERP.
**Méthode** — **première main**, version datée relevée (« Texte relu sur
Légifrance le 23 août 2026, version en vigueur au 1ᵉʳ janvier 2025 »).

- `4c7cbd6` *Une paraphrase entre guillemets escamotait le maillon décisif* —
  une citation entre guillemets **n'était pas le texte** : elle laissait tomber
  « dans les conditions définies par arrêté », c'est-à-dire le maillon qui
  explique la chaîne des périodicités. « Sur un document opposable, une
  citation approximative vaut une référence inventée. »
- `609efd8` *EC 15 ne vérifie rien, il renvoie* · `32a53d3` *Le relais annoncé
  remplaçait quatorze actes par an par un seul* · `415b30f`.

**Sortie** — 4 constats. **Appliqué** : les quatre, le jour même.
**Ce qui reste** : le sort de `EC 15` sera repris par la nuit du 26 (§ 5 #4),
signe que le constat de C2 n'a pas été enregistré là où on le retrouverait.

---

### C3 · 2026-08-25 — « Sources relues sur Légifrance », premier audit large

`2d341ac` (16:25), avec ses reliquats `802232d`, `ab0b85b`, `6c52292`.

**Périmètre** — six limites du dossier de relecture : frontière 4ᵉ/5ᵉ catégorie
ERP (10 articles de seuils), champ de `R. 4227-34`/`-39`, ascenseurs (`L. 134-1`,
`L. 134-3`, `R. 134-11`), RIA, ESP, prescriptions particulières. Plus « l'audit
des références du référentiel mené en parallèle » — URL, périodicités.
**Méthode** — **première main** revendiquée : « Chaque encodage s'appuie sur un
texte relu le 2026-08-25, cité avec son article, sa version et son URL dans le
code. »
**Appliqué** — oui, et c'est la campagne qui installe l'habitude de citer la
version.

**Mais.** Le lendemain, `7736869` établit que cet audit a manqué `R. 143-44`,
réécrit deux mois plus tôt : *« la description encodée reprenait la version
antérieure — deux mois de retard, alors que l'audit du 25 août était
sérieux. »* La cause est nommée, et c'est une leçon de méthode : la référence
était rangée en « citée pour information », et *« un audit relit ce dont le
moteur se sert ; ce que le code a déclaré décoratif, personne ne le rouvre. »*

---

### C4 · 2026-08-26, journée — Le jour où le dépôt s'est donné des instruments

C'est la journée pivot. Elle commence par deux erreurs constatées et finit par
un corpus.

**Les deux erreurs qui déclenchent tout** (16:11–16:12) :

- `7736869` — `R. 143-44` CCH cité dans sa version périmée depuis deux mois.
- `dbf511f` — *Deux PDF présentés à une commission citaient un article
  abrogé.* `R. 146-21` CCH, **abrogé par le décret n° 2025-1100**, et qui
  n'avait jamais traité du registre. Le référentiel avait été corrigé à l'audit
  d'août ; *« la correction n'était jamais descendue dans les documents. C'est
  pourtant le document qu'on tend à l'inspection, pas le référentiel. »* Même
  commit : le badge `L. 4711-5` annonçait « c'est le fondement du registre
  unique » — deuxième passage sur cet article.

**Les instruments, dans l'ordre où ils naissent** :

| Heure | Commit | Ce qui est créé |
|---|---|---|
| 16:36 | `ca7d448` | `ReferenceLegale.versionConstatee` et `Obligation.relectureDue`, **et un test qui rougit quand une relecture est due**. Mesure d'entrée : sur 78 obligations, 56 portaient des notes, 33 citaient une année, **3 seulement un vrai rendez-vous — dont deux échus depuis des semaines**. |
| 16:44 | `22a62aa` | `TEXTES_A_VENIR` — les textes à application différée qui ne visent aucune ligne existante. |
| 17:21 | `12480ee` | **Le premier corpus lu de bout en bout** : 58 articles du Livre III (PE, PO, PU, PX). Crée le statut `obligation_manquante`, parce qu'« un article lu, dans le périmètre, qui impose quelque chose que le référentiel ne porte pas n'avait aucune case ». Résultat : **un seul** article y crée une obligation périodique hors hôtels, `PE 4`. |
| 17:46 → 19:04 | `e26dc32`, `8631d15` | La **clé d'article** : les 138 références du référentiel portent chacune la leur, ce qui rend le rapprochement corpus ↔ référentiel mécanique. |
| 19:19 | `5c6f96f` | **Les dix domaines dépouillés** : 23 corpus, 142 articles, chacun avec sa version constatée et la provenance de sa lecture. **La dette « obligation appuyée sur un texte non lu » passe de 78 à 1.** |
| 19:49 | `1e01484` | `referencesLegales[0]` devient le fondement déclaré (ADR-003) — le test anti-doublon s'en sert. |

**Ce que le dépouillement trouve, et qui est appliqué le soir même** —
`GZ 30` abrogé et son URL en 404 · `R. 134-13` « dans le mois » ≠ « trente
jours » · deux affirmations retirées faute d'article qui les porte ·
`R. 4222-20` porté en fragments (`b91fcda`) · `EL 18 § 4` à deux rythmes
(`08e2e2e`) · le doublon des portails (`59fdc3f`) · la contradiction interne
des ascenseurs (`1089e4a`, `5bf3210`) · `PE 37` (`99d0f87`, qui corrige un
commit du matin) · `GC 1` (`9814bb3`) · le rapport quadriennal ignoré
(`beef8e0`) · `PO 8 § 1` et `PO 12` (`9f13f91`).

**Et une contre-vérification indépendante** — `3c14fcf` (20:09) : un agent sans
les rapports d'origine ni le raisonnement, « avec pour consigne que trouver une
erreur était le résultat le plus utile ». **5 corrections sur 6 confirmées, une
infirmée** (`EL 18 § 4` : l'énumération `Periodicite` n'a pas de valeur
quinzomadaire), plus deux défauts non vus. C'est le premier dispositif de
recoupement du dépôt, et il fonctionne.

---

### C5 · Nuit du 26 au 27 août — Six agents, 123 articles

`618a91a` (23:09) dépose `docs/relecture-source-2026-08-26.md` ; `6dfbc85`
(23:12) y ajoute le sixième rapport.

**Périmètre** — « les 123 articles que le corpus portait en `agent_verbatim` »,
c'est-à-dire tout ce qui, à 19:19, était déclaré lu par un agent et non recoupé.
Six rapports : Code du travail, Livre III ERP, Livre II ERP, froid/aération,
ascenseurs, arrêtés divers.
**Méthode** — **agent, sur Légifrance, verbatim rapporté**, avec recoupement
partiel en première main par la session pilote. Le document se donne trois
niveaux explicites : `CONTRE-VÉRIFIÉ` (relu à la source par la pilote),
`À CONTRE-VÉRIFIER` (rapporté, plausible, non recoupé), `SUR-APPEL` (l'agent
conclut à un défaut qui n'en est pas un). **Aucun des 123 n'est resté
illisible.**

**Sortie** — dix sections, dont huit de constats à trancher : environ
**40 constats**, dont 5 rattachements sans base textuelle, 6 fondements à
recaler, 6 champs d'application trop étroits, 11 rythmes non portés, 3
sur-couvertures, 5 URL fausses, 5 fondements mis en cause. Plus un motif
dominant, chiffré : **le second rythme du même article, sur au moins quinze
articles.** « Le référentiel a été construit en retenant une périodicité par
article. Le droit n'est pas écrit comme ça. »

**Appliqué cette nuit-là** — deux choses seulement, et le commit le dit :
« **Rien n'est appliqué. La décision revient à l'utilisatrice.** »

**Appliqué depuis** — voir la partie 2, qui reprend les dix sections une par
une. En résumé : la section mécanique (URL) est soldée, deux rattachements sur
cinq sont corrigés, les six champs d'application sont ouverts à cinq sur six,
et **quatre constats visaient un état déjà révolu au moment où ils ont été
écrits** — deux d'entre eux de moins de quatre heures.

---

### C6 · 2026-08-27, 11:16 → 11:55 — Ce que la nuit a rendu applicable

Quarante minutes de commits, et c'est tout ce que la nuit a produit
directement.

| Commit | Ce qu'il fait | Méthode |
|---|---|---|
| `5826fc5` | Les cinq adresses fausses du corpus, **chacune rouverte avant substitution** : « je ne substitue pas une URL fausse par une autre sans avoir ouvert la page » | première main |
| `d9770b4` | Trois périodicités affichées sans qu'aucun texte ne les donne | première main |
| `491157c` | **Sur onze accusations portées contre nos fondements, deux tenaient** : `R. 4412-17` sur les deux obligations de stockage, `MS 73` + `GC 8` sur l'extinction automatique | première main, verbatim au corpus |
| `f4124e1` | **Six rythmes que le référentiel ne porte pas, inscrits au corpus et non en note de bas de page** — « chacun bute sur un porteur qui n'existe pas, et inventer le rattachement reviendrait à décider à la place du texte » | déclaration, pas encodage |
| `9f54964` | **`pnpm relecture`** — la « requête mécanique » que le § 2.1 du document réclamait. Mesure d'alors : 85 obligations, 155 références, 152 articles dépouillés, 0 jamais lu | relevé mécanique |

**Le rapport d'application de la nuit est donc : ~40 constats → 2 fondements
corrigés, 5 URL, 6 rythmes déclarés, 1 outil.** Neuf sur onze accusations sur
les fondements étaient des sur-appels. Ce chiffre — **deux sur onze** — est la
mesure la plus honnête de ce que vaut une lecture d'agent non recoupée, et il
justifie à lui seul le champ `lecture`.

`9f54964` nomme au passage trois défauts que rien ne portait, dont celui qui
reviendra deux fois : *« Dix-sept références nomment plusieurs articles et ne
portent qu'une clé […] Les autres ne sont ni déclarés lus ni surveillés : c'est
le mécanisme exact qui avait fait rater R. 4544-11-1, créé en octobre 2025 sur
un article voisin de celui que la clé désignait. »*

---

### C7 · 2026-08-27 après-midi — ADR-022, le modèle cesse de bloquer

`9ecef5e` *Une échéance peut naître d'autre chose qu'un équipement déclaré* ·
`bd6db71` *Le porteur d'échéance devient l'établissement, et deux articles
cessent d'être muets.*

Ce n'est pas une campagne de lecture, c'est **la levée du blocage qui empêchait
d'appliquer une famille entière de constats** : jusque-là une obligation ne
pouvait s'accrocher qu'à une catégorie d'équipement déclarée. Trois constats de
la nuit du 26 attendaient cela. Le lot qui les traite viendra quatre jours plus
tard (C9) — l'écart entre la levée du blocage et son exploitation est un des
endroits où la mémoire du projet a coûté cher.

---

### C8 · 2026-08-28 — Le balayage des URL Légifrance, et la troisième mise en cause de `L. 4711-5`

**Périmètre** — les **127 URL Légifrance du dépôt**, ouvertes une par une.
**Méthode** — ouverture manuelle, « seule l'ouverture une par une l'a montré,
et personne ne rouvrira 127 pages à chaque commit ».
**Sortie** — **17 fausses**. La plus coûteuse : `LEGIARTI000018530833`, annoncé
« R. 4121-1 · document unique », servait `R. 4412-49` — « la pastille affichait
un extrait du DUERP à côté d'un lien vers un texte sans rapport ». Rien ne
pouvait le voir : l'URL répond 200, la page s'ouvre, elle est en vigueur.

**Appliqué** — oui : `80ad4c5`, `3dec0a4`, `8bba612`, `5d8fbf6`, `ed7f772`,
`11e0c2e`, plus la garde `f0cd868` (`urls-legifrance.test.ts`) — *un article
cité deux fois porte le même identifiant*, avec normalisation des graphies
testée, et une dérogation assortie d'une condition de péremption (« une
dérogation sans condition de péremption devient une permission permanente »).
La garde dit elle-même ce qu'elle ne prouve pas.

**Et `3d4ee41` (12:05)** *L. 4711-5 ne fonde pas le registre de sécurité* —
troisième passage sur le même article en huit jours (`648969f` le 20,
`dbf511f` le 26, celui-ci le 28), et il reviendra une quatrième fois le 31.
**Aucun de ces quatre passages ne savait que les trois autres avaient eu lieu.**
C'est le meilleur argument pour ce journal.

---

### C9 · 2026-08-31 — Trois lots en parallèle : 85 obligations deviennent 116

La plus grosse campagne du dossier, et la première conduite par briefs écrits
d'avance (`e8cd15f`, `d7c8171`, `f964574`, 15:24–15:49).

**Palier 1 — faux négatifs d'ancrage** (`a2186cf`, `35c5f90`)
*Périmètre* : six obligations accrochées à une catégorie d'équipement qui ne
les conditionne pas. *Méthode* : relecture au verbatim avant tout encodage.
*Sortie* : **trois rebranchées au porteur établissement, trois refusées — et
l'agent a eu raison de refuser les trois.** Le commit de la session pilote
s'intitule *Trois de mes six « faux négatifs » n'en étaient pas*, et nomme la
cause : « la carto et une note recopiées sans être recoupées sur les textes ».
Il ajoute la phrase qui résume tout le dossier : **« Une note qui dit "à faire"
ne dit pas que ça reste à faire. »**
*Trouvaille hors brief* : la branche `travail: true` du registre reposait sur
`L. 4711-5`, une faculté. Corrigée. → partie 2, § 2.2 #4.

**Lot 7 — dépouillement salarié** (`3cd8b72`)
*Périmètre* : **38 articles lus sur Légifrance**, quatre corpus, treize
obligations — formation à la sécurité, suivi médical, secours, conduite.
*Résultat* : 85 → 98 obligations, 10 → 13 domaines ; le catalogue de titres de
salarié passe de 1 à 9 lignes. *Choix signalés comme discutables* : trois
périodicités du suivi médical sont des **plafonds**, pas des rythmes.

**Lot 8 — socle employeur** (`022fadd`)
*Périmètre* : **28 articles**, six corpus, quinze obligations — organisation de
la prévention, information des travailleurs, locaux sociaux, co-activité.
98 → 113 obligations. *Sortie remarquable* : **trois références du brief
étaient fausses et la lecture les a corrigées** (`R. 4224-16` n'est pas un
affichage mais un document consigné ; le protocole de chargement ne se fonde
pas sur l'arrêté de 1996 mais sur `R. 4515-1` et s. ; le règlement intérieur
n'entre par la santé-sécurité que par `L. 1321-1 1°`), plus une quatrième
vérification **négative** consignée en `sans_objet` « pour que personne ne
refasse le détour ».

**Assemblage** (`888a32c`, 17:09) : **85 → 116 obligations, 10 → 17 domaines.**
Un bureau de six personnes sans aucun équipement déclaré recevait une
obligation le matin, il en reçoit dix-sept.

**Le soir**, seconde vague de relecture sur les rapports eux-mêmes : `ab87ced`
*Un article abrogé cité comme droit vivant, et trois intervalles jamais
ouverts* · `157fd4c` `R. 4544-11` inscrit · `5955414` `L. 4622-1` remis ·
`45fbb00` *Le seul renvoi d'intervalle que le lot 8 laissait sans nom* ·
`774d9c0` `PE 37` · `032bc22` le II de `R. 4624-23`. Puis `fcc63cd` /
`41c050b` : **la nature d'une obligation devient un champ (ADR-026)**, sur
dépouillement, « et deux consignes que la lecture a corrigées ».

---

### C10 · 2026-09-01 — Plan de bataille, six lots, trois sources recoupées

`4ff5b5f` (11:25) : *« Ma liste scellée avant l'audit, l'audit externe
indépendant et les six axes de la revue d'assemblage. **Aucune des trois ne
contenait les deux autres.** »*

| Lot | Périmètre | Méthode | Sortie · application |
|---|---|---|---|
| **D2** `d797d23` | décret n° 2026-253 du 8 avril 2026 : 7 articles, 13 articles de code touchés | première lecture du décret, **puis croisement mécanique** contre les 116 obligations et les 237 articles des 33 corpus | Un seul point de contact (`R. 4624-23`), conforme mot pour mot. **Aucune obligation n'est fausse.** Trois affirmations que le dépôt tirait du décret sans l'avoir ouvert sont corrigées |
| **D3** `39a6e94` | les quatre familles relevées par l'audit externe et non recoupées par lui | recoupement en droit, **lot en lecture seule, aucun fichier de `src/` modifié** | Les quatre existent ; deux donnent des obligations à encoder (chapitre chaleur `R. 4463-1` à `-8` ; VGP trimestrielle de l'arrêté du 5 mars 1993 sur presses à balles, compacteurs et massicots). **Rien encodé** |
| **D1** `c21beb9`, `d8e3758` | travail en hauteur : **section 8 lue INTÉGRALEMENT, 33 articles `R. 4323-58` à `-90`**, plus l'arrêté du 21 décembre 2004 art. 1 à 7 | agent, Légifrance, 2026-09-01 ; **la borne réelle relevée à la source** — « "et suivants" n'annonçait pas le paragraphe des échelles » | 40 articles dépouillés, corpus neuf. Trois périodicités opposables trouvées, **aucune dans le Code** |
| **A, B, C, E** | exclusions mutuelles, cohérence du corpus, public reçu indéterminé, phrases qui mentent | mixte | `d8de57c` (`L. 4622-1` cessait d'être déclaré manquant **et** encodé), `2fdab49`, `fcb49b9`, `4f2d1ad`, `d915db1` |

Tous ces lots sont sur `origin/main`.

**Deux campagnes du 1er septembre ne le sont pas** — elles vivent sur
`integration/2026-09-01-recadrage` :

- `dfac392` **la confrontation à un guide professionnel** (Qualiconsult) —
  quatrième angle après la liste scellée, l'audit externe et la revue. Le
  référentiel est **trois fois plus juste que le guide** (`PE 4` : le guide
  donne un an, le texte trois depuis l'arrêté du 1er décembre 2025 ;
  l'habilitation électrique : le guide affiche la NF C 18-510 comme du droit ;
  les échelles : un annuel qu'aucun article ne fonde). Quatre pistes, **aucune
  encodée sur la foi du document — « il est commercial, il date de novembre
  2021, et il dit lui-même n'être pas exhaustif »**. C'est l'application la
  plus nette de l'interdiction du niveau `indirect`.
- `f758fb8` **le semestriel des gaines de recyclage** — voir l'encadré de la
  partie 2, § 9.2. Lu le 26 août, déclaré manquant en majuscules dans le code
  le 27, posé le 1er septembre, **et toujours pas sur `main`**.

---

### Ce que la chronologie donne à voir

1. **Le dépôt lit beaucoup et applique peu, et l'écart est systématique.** La
   nuit du 26 : ~40 constats, deux fondements corrigés. Le lot D3 : quatre
   familles fondées, zéro encodée. Ce n'est pas une négligence — c'est
   presque toujours une cause nommée (un porteur qui n'existe pas, un attribut
   que le formulaire ne pose pas, une valeur absente d'une énumération). Mais
   la cause est écrite dans un commit, et le constat meurt avec.
2. **Ce qui est appliqué est ce qui ne demande pas de lecture.** URL,
   identifiants, ordres de références. Tout ce qui suppose de rouvrir un
   article attend.
3. **Le même article est mis en cause quatre fois en onze jours** (`L. 4711-5`,
   les 20, 26, 28 et 31 août) sans qu'aucun passage sache des autres.
4. **Une lecture d'agent non recoupée se trompe souvent** : 2 sur 11 accusations
   tenaient le 27 août ; 3 sur 6 « faux négatifs » du brief du 31 n'en étaient
   pas ; 3 références de brief sur 4 étaient fausses au lot 8. Le dispositif
   qui rattrape cela — briefs contredits, contre-vérification indépendante,
   agents qui refusent — fonctionne, et c'est la meilleure nouvelle du dossier.
5. **Les instruments ont été construits, et ils sont bons.** Corpus, clé
   d'article, `versionConstatee`, `relectureDue`, `lecture`,
   `obligation_manquante`, `reserve`, `pnpm veille`, `pnpm relecture`,
   `urls-legifrance.test.ts`. Ce qui manquait n'était pas l'outillage : c'était
   le fil de l'histoire.

---

## Partie 2 — Registre des constats en suspens

### Comment lire les états

| État | Ce qu'il signifie |
|---|---|
| **CORRIGÉ** | Le référentiel d'aujourd'hui ne porte plus le défaut, et le changement est postérieur au constat. |
| **PARTIEL** | Une partie du remède est en place, une partie nommée ne l'est pas. |
| **NON CORRIGÉ** | Le référentiel porte le défaut tel que décrit, et rien n'a bougé depuis le constat. |
| **SANS OBJET** | Le constat décrivait un état déjà révolu **au moment où il a été écrit**. Ce n'est pas un succès : c'est un sur-appel qui n'a pas été détecté comme tel, et qui a coûté une relecture. |
| **ENREGISTRÉ** | Le constat est confirmé et porté par le code (statut `obligation_manquante`, ou `reserve` de lecture) — donc il ne se reperdra plus. Le manque, lui, demeure. |

**Attention à SANS OBJET.** Quatre constats de la nuit du 26 août portaient sur
un état du référentiel antérieur de quelques heures à leur rédaction. C'est le
défaut de méthode le plus coûteux du dossier, et il est invisible sans ce
tableau : un lecteur du document d'origine croit avoir cinq défauts à traiter
là où il en a deux.

---

## 2.A — `docs/relecture-source-2026-08-26.md`, constat par constat

Le document dit de lui-même, en tête : « **Rien ici n'a été appliqué au code**
hors ce qui est marqué APPLIQUÉ », et son commit (`618a91a`, 2026-08-26 23:09)
conclut « Rien n'est appliqué. La décision revient à l'utilisatrice. »

**C'était vrai le 26 au soir. Ça ne l'est plus, et le document n'a jamais
bougé.** Il porte dix sections, dont huit de constats à trancher. Ce qui suit
les reprend une par une.

Méthode de vérification : l'état de chaque obligation a été relevé **deux
fois** — sur l'arbre à `618a91a` (le commit du document lui-même) et sur
`origin/main` aujourd'hui — par extraction des clés d'article dans l'ordre des
`referencesLegales`. La convention ADR-003 fait de `referencesLegales[0]` le
**fondement** ; les suivantes sont du contexte. Comparer les deux relevés est
ce qui sépare CORRIGÉ de SANS OBJET.

### § 2.2 — Les cinq « rattachements sans base textuelle »

C'est le tableau le plus cité du document. Relevé complet :

| # | Obligation | Références au 26/08 23:09 | Références aujourd'hui | État |
|---|---|---|---|---|
| 1 | `incendie-travail-eclairage-securite-*` | `Arrêté 2011-12-14 art. 11` · `R. 4227-14` · `R. 4226-19` · `Arrêté 2011-12-14 art. 1` | identiques | **SANS OBJET** |
| 2 | `stockage-dangereux-verification-etancheite` | `R. 4412-11` | `R. 4412-11` · **`R. 4412-17`** | **CORRIGÉ** |
| 3 | `aeration-travail-mise-en-service` | `R. 4222-20` · `R. 4222-21` · `Arrêté 1987-10-08 art. 3` | identiques | **NON CORRIGÉ** |
| 4 | `incendie-registre-securite` | `R. 4227-39` · `L. 4711-5` · `CCH R. 143-44` · `R. 141-10` · `R. 141-11` · `R. 146-35` | **`L. 4711-1`, `L. 4711-2`, `D. 4711-2`, `D. 4711-3` ajoutés ; `L. 4711-5` requalifié** | **CORRIGÉ** |
| 5 | `esp-personnel-formation` | `R. 4323-1` | `R. 4323-1` | **PARTIEL** |

**Le compte est donc : 2 corrigés, 1 partiel, 1 non corrigé, 1 sans objet.**
Ce n'est pas « trois traités sur cinq ». Un des trois que l'on croit traités
n'a jamais eu besoin de l'être, et deux constats sur cinq restent ouverts.

---

**#1 — `incendie-travail-eclairage-securite-*` / `R. 4226-19` · SANS OBJET**

Le constat : « `R. 4226-19` ne vise QUE les vérifications électriques
R. 4226-14 et R. 4226-16. Ne dit rien de l'éclairage de sécurité. »

Il est exact sur le fond, et sans portée sur le code. L'obligation ne s'est
jamais fondée sur `R. 4226-19` : depuis `23ac89b` (**2026-08-21**, cinq jours
avant le constat), son fondement est l'article 11 de l'arrêté du 14 décembre
2011, relevé au verbatim, et `R. 4226-19` y figure en troisième position avec
une note qui dit exactement ce que le constat reproche :

> « Registre sur lequel l'article 11 de l'arrêté fait porter le résultat des
> opérations. **Support de consignation, pas fondement de la périodicité.** »

Cette note était déjà présente à `618a91a` — vérifié : `grep -c 'Support de
consignation' <fichier à 618a91a>` rend `2`, une occurrence par obligation du
couple. L'agent a jugé la référence sans lire la note qui l'accompagnait.

*Preuve aujourd'hui :* `src/lib/referentiels/conformite/incendie.ts`,
obligations `incendie-travail-eclairage-securite-essai-mensuel` et
`-autonomie-semestrielle`.

---

**#2 — `stockage-dangereux-verification-etancheite` / `R. 4412-11` · CORRIGÉ**

Le constat : « Ni "rétention" ni "étanchéité" n'y figurent. Seul le 2° parle de
"procédures d'entretien régulières". »

Corrigé le **2026-08-27** par `491157c`, *« Les deux fondements que l'arbitrage
a retenus, vérifiés puis recalés »* — sur onze accusations portées contre les
fondements, deux tenaient, et celle-ci en était une. `R. 4412-17` a été ajouté
aux deux obligations de stockage, **lu en première main** avec verbatim, et
entré au corpus.

*Preuve aujourd'hui :* `src/lib/referentiels/conformite/stockage-dangereux.ts`
porte les deux références, `R. 4412-11` étant réétiqueté « (entretien régulier
des équipements de stockage) » — c'est-à-dire réduit à ce que le constat lui
concédait. `src/lib/referentiels/corpus/code-travail-risque-chimique.ts` porte
`R. 4412-17` en `lecture: "premiere_main"`, `luLe: "2026-08-27"`, avec sa
`citationCle`.

---

**#3 — `aeration-travail-mise-en-service` / `R. 4222-21` · NON CORRIGÉ**

Le constat : « Impose une CONSIGNE d'utilisation écrite, pas une vérification à
la mise en service. »

Rien n'a bougé. `R. 4222-21` est toujours cité en contexte 1 de l'obligation, et
n'a jamais été rouvert : au corpus, il est en `lecture: "agent_verbatim"`,
`luLe: "2026-08-26"`, **sans `citationCle` et sans `versionEnVigueur`
constatée**. L'export mécanique le signale de lui-même — la ligne porte
`SANS_VERBATIM` et `VERSION_JAMAIS_CONSTATEE` dans
`docs/relecture-references-2026-08-27.csv` comme dans l'export d'aujourd'hui.

Ce constat est donc **encore à instruire**, et l'instruire coûte une lecture
d'un seul article.

*Preuve :* `src/lib/referentiels/conformite/aeration.ts` (obligation) et
`src/lib/referentiels/corpus/code-travail-risque-chimique.ts` (entrée corpus,
premier article du tableau).

---

**#4 — `incendie-registre-securite` / `L. 4711-5` · CORRIGÉ**

Le constat : « C'est une FACULTÉ de fusionner des registres ("est autorisé à"),
pas l'obligation d'en tenir un. Le socle est L. 4711-1 et L. 4711-2. »

Corrigé le **2026-08-31** par `35c5f90`, et le commit dit que ce n'était pas
prévu : *« Trouvaille hors brief : la branche travail du registre reposait sur
L. 4711-5, c'est-à-dire sur une faculté. »* `L. 4711-1`, `L. 4711-2`,
`D. 4711-2` et `D. 4711-3` ont été ajoutés, chacun avec son verbatim relevé le
2026-08-31, et dépouillés au corpus. `L. 4711-5` reste cité, requalifié dans
son propre libellé de référence : « **faculté de regroupement, PAS un
fondement** ».

Le remède est exactement celui que le constat prescrivait. Il a été retrouvé
indépendamment, cinq jours plus tard, par un lot qui ne cherchait pas cela —
c'est-à-dire au prix d'une seconde découverte.

*Preuve :* `src/lib/referentiels/conformite/incendie.ts`, obligation
`incendie-registre-securite` ; réserve `L. 4711-5` dans
`src/lib/referentiels/corpus/code-travail-incendie.ts`.

---

**#5 — `esp-personnel-formation` / `R. 4323-1` · PARTIEL**

Le constat : « Porte une INFORMATION, pas une formation. La formation
renouvelée est à R. 4323-3 et R. 4323-4. »

Ce qui couvre le constat : le libellé de la référence dit
« `R. 4323-1 à R. 4323-5` (information et formation à l'utilisation des
équipements de travail) » et son URL pointe la **section** entière
(`LEGISCTA000018489707`), donc R. 4323-3 et R. 4323-4 avec. Mais ce libellé
date de `2d341ac` (**2026-08-25**) : il est antérieur au constat, et rien n'a
été fait depuis.

Ce qui ne le couvre pas, et c'est mesurable :

- la **clé d'article** de la référence est `R. 4323-1` seul. `R. 4323-3` et
  `R. 4323-4` **ne sont pas au corpus** — vérifié : `grep -o 'ref: "R\. 4323-[0-9-]*"'
  sur `src/lib/referentiels/corpus/` rend 43 clés, dont `R. 4323-1`, `R. 4323-22`
  à `-28`, `R. 4323-55` à `-57` et `R. 4323-58` à `-90` ; ni `-3` ni `-4` ;
- ils ne sont donc **ni déclarés lus, ni surveillés par la veille** ;
- `R. 4323-1` lui-même est en `lecture: "agent_verbatim"` sans `citationCle` :
  l'article dont le constat conteste le contenu n'a jamais été rouvert.

C'est le motif exact que le dépôt a nommé le lendemain, dans `9f54964` : *« Dix-sept
références nomment plusieurs articles et ne portent qu'une clé — R. 4544-9 à
-11 ramené à R. 4544-10. Les autres ne sont ni déclarés lus ni surveillés :
c'est le mécanisme exact qui avait fait rater R. 4544-11-1. »* Le constat #5
est un cas de ce motif ; il a été nommé, jamais traité sur cette ligne.

*Preuve :* `src/lib/referentiels/conformite/equipement-sous-pression.ts` ;
`src/lib/referentiels/corpus/code-travail-risque-chimique.ts`.

---

### § 5 — Les six « fondements à recaler »

Même méthode, même relevé à deux dates. Le constat porte ici sur l'**ordre** :
`referencesLegales[0]` est le fondement (ADR-003), et le reproche est qu'il
désigne l'article qui parle du sujet plutôt que celui qui prescrit.

| # | Obligation | Fondement au 26/08 | Fondement aujourd'hui | Ce que le constat demandait | État |
|---|---|---|---|---|---|
| 1 | `elec-erp-mise-en-service` | `GE 6` (+ `EL 19`) | inchangé | `GE 7` / `GE 8 § 1` via `EL 19 § 2` | **NON CORRIGÉ** |
| 2 | `cuisson-erp-extinction-automatique-annuelle` | `GC 22` | `GC 22` (+ **`MS 73`**, **`GC 8`**) | `MS 73` | **PARTIEL** |
| 3 | `cuisson-erp-verification-initiale` | `GC 22` (+ `GE 6`, `GC 1`) | inchangé | `GE 7` / `GE 8` | **NON CORRIGÉ** |
| 4 | `incendie-erp-baes-annuelle` | `EC 15` (+ `EL 19`) | inchangé | `EL 19 § 3` | **NON CORRIGÉ** |
| 5 | `aeration-erp-chauffage-ventilation-annuelle` | **`CH 58`** (+ `CH 57`) | inchangé | `CH 58` | **SANS OBJET** |
| 6 | `incendie-travail-exercice-semestriel` | **`R. 4227-39`** (+ `R. 4227-34`) | inchangé | `R. 4227-39` | **SANS OBJET** |

**Deux sur six sans objet, et de peu.** `CH 58` était devenu le fondement de
son obligation à `86346e9`, le **2026-08-26 à 19:19** — *quatre heures avant*
le dépôt du document qui le réclame. Les six agents ont travaillé sur un état
du référentiel antérieur à leur propre nuit.

**Trois sur six sont ouverts, et pour un motif commun :** `GE 7` et `GE 8`
**n'existent pas au corpus**. Vérifié : `grep 'ref: "GE '` sur
`src/lib/referentiels/corpus/` ne rend que `GE 6` et `GE 4`. Les deux articles
que le constat désigne comme le vrai fondement de trois obligations n'ont
jamais été ouverts. Tant qu'ils ne le sont pas, ces trois lignes ne peuvent pas
être recalées — la règle du dépôt interdit d'appuyer une obligation sur un
texte non lu.

Le cas #2 mérite sa nuance : `491157c` (2026-08-27) a bien ajouté `MS 73`
**et** `GC 8` (celui-ci lu en première main, avec verbatim), en constatant que
« l'expression [extinction automatique] n'apparaît pas [dans GC 22], et ses
deux listes sont fermées ». Mais `GC 22` est resté en position de fondement.
Le contenu du constat est traité, sa conséquence sur l'ordre ne l'est pas — et
l'ordre n'est pas cosmétique : le test anti-doublon compare les obligations sur
leur article fondateur, ce que la note de `elec-travail-consignation-registre`
documente noir sur blanc.

*Preuve :* `pnpm relecture --csv`, colonnes `obligation`, `rang`, `article`.

---

### § 2.1 — « Des périodicités attribuées à des articles qui ne les portent pas » · ENREGISTRÉ, 10 lignes ouvertes

Le document ne tranchait pas : il disait que ce constat systémique « est une
requête mécanique à écrire, pas une relecture ».

**La requête a été écrite**, le lendemain, par `9f54964` : c'est
`scripts/export-relecture.ts` (`pnpm relecture`), qui déplie une ligne par
couple obligation × référence — précisément parce que « le dossier de relecture
PDF n'imprime qu'une référence par obligation […] et replie les autres dans un
"+ 1 réf." ». Le constat mécanique s'appelle `PERIODICITE_SANS_TEXTE_PORTEUR`.

Il rend aujourd'hui **10 lignes sur 10 obligations** :

`elec-salarie-attestation-medicale-voisinage` (quinquennale) ·
`incendie-travail-exercice-semestriel` (semestrielle) ·
`formation-securite-salarie-cse-sst` (quadriennale) ·
`sante-travail-salarie-vip` (quinquennale) ·
`sante-travail-salarie-sir` (quadriennale) ·
`sante-travail-salarie-sir-visite-intermediaire` (biennale) ·
`sante-travail-etablissement-liste-postes-risques` (annuelle) ·
`sante-travail-salarie-vip-adaptee` (triennale) ·
`sante-travail-salarie-sir-categorie-a` (annuelle) ·
`conduite-salarie-attestation-medicale` (quinquennale)

Neuf des dix relèvent du Code du travail (santé au travail, formation,
conduite) : le motif est bien celui que le document annonçait — le Code renvoie
la périodicité à un arrêté, et la citer sans l'arrêté attribue un chiffre à un
texte qui ne le porte pas. Le sur-appel que le document avait déjà détecté
(`elec-travail-periodique-annuelle`, qui cite bien l'arrêté du 26 décembre 2011)
n'apparaît pas dans la liste : la requête ne le lève pas à tort.

**Ce qui manque : la lecture.** L'outil dit *où regarder*, il ne dit pas si le
chiffre est faux. Aucune de ces dix lignes n'a été instruite.

*Preuve :* `pnpm relecture` (bloc « Constats mécaniques »).

---

### § 2.3 — « Champs d'application plus larges que ce qu'on retient »

| Constat | État aujourd'hui | Preuve |
|---|---|---|
| `R. 4224-17` vise tout le bâti technique, rattaché aux seules portes automatiques | **NON CORRIGÉ** — cité en contexte de `porte-auto-dossier-maintenance` et `porte-auto-maintien-en-etat`, et de rien d'autre | export `--csv` |
| `R. 4224-12` (« toutes les portes et portails ») absent du corpus | **NON CORRIGÉ** — toujours absent du référentiel et du corpus | export `--csv` |
| `R. 4323-22/-23/-25/-28` visent tous les équipements de travail, pas le levage | **NON CORRIGÉ** — les quatre ne servent que des obligations `levage-*` (10 rattachements, tous du domaine levage) | export `--csv` |
| `R. 4544-11` (travaux sous tension) : « un cas d'usage entier manque » | **ENREGISTRÉ** — l'article est entré au corpus le 2026-08-31 en `obligation_manquante`, motif : « DEUX obligations d'employeur, distinctes de l'habilitation ordinaire de R. 4544-10 […] et aucune des deux n'est encodée ». Le manque est déclaré, il n'est pas comblé | `corpus/code-travail-electricite.ts` |
| `R. 4227-39` impose des essais **et** visites périodiques semestriels, pas seulement l'exercice | **NON CORRIGÉ** — `incendie-travail-exercice-semestriel` reste la seule ligne semestrielle de l'article | export `--csv` |
| `R. 4412-38` : le CSE est destinataire au même titre que les travailleurs | **NON CORRIGÉ** — l'article fonde `stockage-dangereux-fiches-donnees` et `-formation-personnel` ; aucune ne porte le CSE. Un motif voisin est en revanche tracé : `35c5f90` refuse de rebrancher cet article au porteur établissement, « déclencheur non implémenté » | export `--csv` ; `35c5f90` |

**Cinq ouverts sur six, un enregistré.** C'est la section la moins traitée du
document, et c'est la plus coûteuse : un champ d'application trop étroit
produit un faux négatif, c'est-à-dire un silence — l'erreur que
`35c5f90` décrit ainsi : « *le trou se voit, le faux négatif rassure à tort* ».

---

### § 3 — Rythmes trouvés que le référentiel ne porte pas

| Article | Rythme | État |
|---|---|---|
| `DF 10 § 3` — triennale par organisme agréé si désenfumage mécanique **et** SSI catégorie A ou B | **NON CORRIGÉ, et motivé** — `incendie-erp-desenfumage-annuelle` porte l'annuelle et rien d'autre. Le document donnait déjà la cause : la condition croise deux catégories d'équipement, « le modèle ne sait pas l'exprimer ». Cette cause n'a pas été levée. |
| `CH 58` — triennale sur les dispositifs de sécurité des systèmes thermodynamiques | **NON CORRIGÉ** — `aeration-erp-chauffage-ventilation-annuelle` se fonde sur `CH 58` mais n'en porte que l'annuelle. Le constat était marqué « à contre-vérifier » ; il ne l'a pas été. |
| `PE 4 § 1` — contrat **annuel** d'entretien de la détection incendie, locaux à sommeil | **ENREGISTRÉ** — la réserve portée sur `PE 4` au corpus le dit : « Le § 1 impose un contrat annuel d'entretien du système de détection automatique d'incendie, restreint aux établissements comportant des locaux à sommeil : il attend l'attribut ». Le § 2 (triennal), lui, est encodé. |
| `R. 4226-21` — vérification des installations électriques **temporaires** | **NON CORRIGÉ** — l'article est absent du référentiel comme du corpus. |

---

### § 4 — Sur-couvertures possibles

| Constat | État |
|---|---|
| `MS 73` : la triennale ne vaut que pour les SSI A/B et les sprinkleurs | **CORRIGÉ, et par une distinction explicite** — le référentiel porte deux lignes séparées, `incendie-erp-ssi-annuelle` (annuelle) et `incendie-erp-ssi-triennale` (triennale), toutes deux fondées sur `MS 73`. `491157c` a par ailleurs tranché le cas voisin : « La triennale par organisme agréé du même MS 73 § 2 ne vise QUE les SSI de catégories A et B et les sprinkleurs : un système sous hotte de friteuse relève bien de l'annuelle ». |
| `GE 4` : ce n'est pas une périodicité unique, le tableau croise type × catégorie et donne 3 ou 5 ans | **NON CORRIGÉ** — `GE 4` n'est cité qu'en contexte de `incendie-erp-5-visite-commission`, en `quinquennale` constante. Voisin, mais distinct : `PE 37` a été rouvert le 2026-08-31, et sa réserve au corpus documente le débat sur-application / sous-application. |
| `R. 4412-87` : ne vise que les agents CMR, rattaché à une obligation générique | **NON CORRIGÉ** — cité en contexte de `stockage-dangereux-formation-personnel`, qui n'est pas restreinte aux CMR. |

---

### § 6 — Textes modifiés récemment · PARTIELLEMENT INSTRUMENTÉ

Trois constats distincts, trois sorts différents.

- **Refonte GZ (GZ 1–30 → GZ 1–15, arrêté du 23 février 2025).** *Sans objet
  pour le référentiel* : aucune obligation ne cite d'article `GZ` — l'export ne
  rend aucune ligne. Le document notait lui-même que l'abrogation de GZ 30
  était « déjà traitée ». Reste vrai comme consigne : toute citation `GZ`
  future est à contrôler.
- **Seize versions postérieures à 2024 relevées.** *Non instrumenté comme
  telles* : ces dates ont été relevées dans un document, pas inscrites au code.
  Le champ qui les porterait est `versionEnVigueur` au corpus, et l'export
  compte aujourd'hui **119 lignes / 74 obligations** en
  `VERSION_JAMAIS_CONSTATEE`. Autrement dit : le relevé de la nuit du 26 n'a pas
  réduit cette dette, parce qu'il n'a pas été reversé dans le code.
- **Fins de version programmées** (`GE 6` au 1er juin 2027, `R. 4227-37` au
  1er janvier 2027). **INSTRUMENTÉ.** L'export rend exactement trois lignes
  `VERSION_FUTURE` : `elec-erp-mise-en-service` (`GE 6`),
  `cuisson-erp-verification-initiale` (`GE 6`) et
  `incendie-travail-consigne-affichee` (`R. 4227-37`). Le mécanisme adjacent
  existe aussi : `src/lib/referentiels/conformite/veille-textes.ts` porte les
  textes à application différée qui ne visent aucune ligne existante, avec un
  test qui échoue le jour venu, et un champ `verifieLe` qui date la lecture de
  la disposition d'entrée en vigueur à la source.

---

### § 9.1 — Ascenseurs, corroboration indépendante

- **Le sur-appel sur les slugs** (`examen-annuel-securite` /
  `examen-semestriel-secours` « inversés ») : le document le tranchait déjà —
  les identifiants sont sous contrainte d'unicité en base, leur contenu est
  juste. **Sans objet, et il l'était déjà.**
- **`R. 134-6 d)` — nettoyage annuel de la cuvette, du toit de cabine et du
  local des machines. NON CORRIGÉ.** `CCH R. 134-6` sert quatre obligations
  (`ascenseur-visite-six-semaines`, `-entretien-contrat`,
  `-examen-semestriel-secours`, `-examen-annuel-securite`) ; aucune ne porte le
  nettoyage. Le constat était marqué « à contre-vérifier, et neuf ».
- **`R. 134-11` — compatibilité des moyens d'alerte hors RTC et 3G. NON
  CORRIGÉ.** L'article fonde `ascenseur-controle-technique-quinquennal` ;
  l'exigence nouvelle n'y apparaît pas.

---

### § 9.2 — Sept rythmes trouvés, hors du référentiel

| Article | Rythme manquant | État |
|---|---|---|
| `Arrêté 2011-12-26 art. 3` | l'annuelle peut passer à deux ans si le rapport précédent est sans observation | **NON CORRIGÉ** — cité en contexte de `elec-travail-periodique-annuelle`, qui reste annuelle sans alternative |
| `GH 5` (IGH) | quatre rythmes (6 mois, 1 an, 2 ans, 5 ans) + règle des 20 %/an | **NON CORRIGÉ** — fonde `elec-igh-annuelle` et `incendie-igh-moyens-secours-annuelle`, une seule fréquence chacune. L'IGH est hors cible produit, ce qui atténue la portée sans annuler le constat |
| `Arrêté 1987-10-08 art. 4` | annuel **et** semestriel en présence d'un recyclage | **CORRIGÉ HORS `main`** — voir l'encadré ci-dessous |
| `Arrêté 2017-11-20 art. 15` | six régimes d'inspection | **NON CORRIGÉ** — fonde `esp-inspection-periodique`, en `triennale` unique |
| `Arrêté 2017-11-20 art. 18` | six échéances de requalification + régime des extincteurs | **NON CORRIGÉ** — l'article est absent du référentiel |
| `Arrêté 2015-06-01 art. 22` | tests semestriels des dispositifs actifs de drainage | **NON CORRIGÉ** — cité en contexte de `stockage-dangereux-retention`, en `periodicite: autre` |
| `PS 32` | quinquennale par organisme agréé + vérification à la mise en service | **NON CORRIGÉ** — fonde les deux lignes `aeration-erp-ps-surveillance-qualite-air-*` (biennale et annuelle selon le seuil de 250 véhicules), sans la quinquennale |

> **Le cas du semestriel de recyclage, et pourquoi il compte plus que les six
> autres.** Ce constat est le seul des sept à avoir été traité — dix jours plus
> tard, par `f758fb8`, *« Le contrôle semestriel des gaines de recyclage, lu
> depuis dix jours et jamais posé »*. Le titre du commit dit l'échec de mémoire
> mieux que ce document ne pourrait le faire.
>
> Mieux : le défaut était **doublement enregistré et resté sans suite**. La
> `notesInternes` de `aeration-controle-installations-r4222-20` l'écrit depuis
> le 2026-08-27 : « Ce dernier cas **N'EST PORTÉ PAR AUCUNE OBLIGATION** […]
> C'est un manque réel, et il n'est pas de mon fait — il précède ce chantier. »
> Un constat écrit dans le code, en majuscules, n'a pas suffi.
>
> **Et il n'est toujours pas sur `origin/main` au 2026-09-01.** `f758fb8` vit
> sur `integration/2026-09-01-recadrage`. Un correctif sur une branche non
> intégrée n'est pas un correctif : c'est le motif « Vercel déploie main ».
> **À rouvrir au merge, pas avant.**

---

### § 9.3 — URLs fausses dans le corpus · CORRIGÉ (5/5)

Le constat listait cinq identifiants Légifrance faux ou déplacés. Les quatre
qui appelaient une correction d'identifiant sont en place aujourd'hui — vérifié
par recherche directe des identifiants prescrits :

| Prescrit | Présent dans |
|---|---|
| `JORFTEXT000025055364` (arrêté 2011-12-14 éclairage) | `corpus/arrete-2011-12-14-eclairage.ts` |
| `JORFTEXT000025167121` (arrêté 2011-12-30 IGH) | `corpus/arrete-2011-12-30-igh.ts`, `types-communs.ts` |
| `JORFTEXT000026286347` (arrêté 2012-08-07) | `corpus/arretes-ascenseurs.ts`, `conformite/ascenseurs.ts` |
| `JORFTEXT000030673177` (arrêté 2015-06-01 art. 22) | `corpus/icpe-stockage.ts` |

Le cinquième — « `C. env. R. 557-14-1` est dans le code de l'environnement, pas
dans l'arrêté » — est respecté : l'article est cité comme `C. env. R. 557-14-1`
partout où il apparaît (`components/equipements/EquipementForm.tsx`,
`lib/equipements/schema.ts`, `lib/equipements/esp.test.ts`).

C'est la seule section du document intégralement soldée, et ce n'est pas un
hasard : le document la qualifiait lui-même de « concret et mécanique à
corriger ». **Le corollaire est le vrai enseignement : ce qui a été appliqué
est ce qui ne demandait pas de lecture.**

Une garde existe depuis, `src/lib/referentiels/urls-legifrance.test.ts` — un
article de code cité deux fois doit pointer le même identifiant. Elle dit
elle-même ce qu'elle ne prouve pas : « qu'un article servi par un seul
identifiant DISTINCT soit servi par le bon », et les 41 occurrences dont la
référence voisine nomme un article d'arrêté (« MS 73 », « EL 19 ») restent hors
de sa portée.

---

### § 9.4 — Autres fondements mis en cause

| Constat | État |
|---|---|
| `PS 32` : nos deux obligations isolent la qualité de l'air, que l'article **exclut** du contrôle quinquennal | **NON CORRIGÉ** — les deux lignes `aeration-erp-ps-surveillance-qualite-air-*` portent toujours ce seul champ |
| `C. env. L. 512-1` ne traite que de l'autorisation ; le régime déclaratif est à `L. 512-8` | **NON CORRIGÉ** — `stockage-dangereux-declaration-icpe` se fonde sur `L. 512-1` ; `L. 512-8` est absent du référentiel |
| `CCH R. 134-1` est un article de définition ; les moyens d'alerte sont au 6° de `R. 134-2` | **NON CORRIGÉ** — `ascenseur-telealarme-liaison` se fonde sur `R. 134-1` ; `R. 134-2` est absent |
| `Arrêté 2004-03-01 art. 20` : le « 6 mois » est une condition de dispense, pas une périodicité de VGP | **À INSTRUIRE** — l'article est cité en contexte 2 de `levage-vgp-semestrielle-chariot-gerbeur`, dont la semestrialité est fondée ailleurs (`Arrêté 2004-03-01 art. 23`, `R. 4323-23`). Le constat ne dit pas que la périodicité est fausse, il dit que cet article ne la porte pas : à requalifier en note, pas à retirer |
| `Arrêté 1993-12-21 art. 2` ne vise que le passage de véhicules | **SANS OBJET** — le document le note lui-même : « cohérent avec la correction faite ce soir sur `porte-auto-portail-piete-coulissant` » |

---

### § 1, § 7, § 8 — ce qui ne demande rien

- **§ 1 « Appliqué cette nuit »** — PO 8 § 1 / PO 12 (commit `9f13f91`) et le
  second attribut « très petit hôtel » de PO 13. Rien à rouvrir sur le premier.
  Le second est un besoin de modèle, tracé ailleurs.
- **§ 7 « PE 4, texte intégral confirmé »** — le point décisif (« la liste se
  termine par *etc.*, elle n'est pas limitative ») est **tenu par le code** :
  `PE 4` porte au corpus une réserve qui distingue le § 2 encodé du § 1 en
  attente d'attribut, et `incendie-erp-pe4-entretien-installations-techniques`
  existe en `triennale`. Constat **appliqué**.
- **§ 8 « Confirmé sans réserve »** — aucune action attendue. C'est la seule
  section du document qui n'a pas vieilli, parce qu'elle n'affirme rien sur le
  code.

---

## 2.B — Ce que le code porte déjà, et qui n'a pas besoin de ce document

Trois registres vivent dans le code et se mesurent. Ils sont la partie du
constat qui **ne se périmera pas**, et il ne faut pas les recopier ici.

| Registre | Où | Compte aujourd'hui |
|---|---|---|
| Articles lus qui imposent une obligation que le référentiel ne porte pas | `statut: "obligation_manquante"` au corpus | **19** |
| Articles écartés par un choix explicite de ne pas les porter | statuts `hors_perimetre` / `sans_objet` | **28**, dont **1 sans mention à l'utilisateur** |
| Réserves de lecture — ce qu'un article dit et que le modèle ne sait pas exprimer | champ `reserve` | **42** |
| Dette de lecture | articles au corpus jamais lus | **2** sur 276 |

*Mesuré par `pnpm relecture` et par parcours de `CORPUS`.*

Et quatre constats mécaniques, également mesurés à chaque exécution :

| Constat | Lignes | Obligations |
|---|---|---|
| `SANS_VERBATIM` — article retenu sans citation relevée | 114 | 72 |
| `VERSION_JAMAIS_CONSTATEE` | 119 | 74 |
| `PERIODICITE_SANS_TEXTE_PORTEUR` | 10 | 10 |
| `CORPUS_NE_RENVOIE_PAS` | 11 | 9 |
| `VERSION_FUTURE` | 3 | 3 |
| `TITRE_HORS_CATALOGUE` | 1 | 1 |

**Le chiffre à retenir : 72 obligations sur 116 s'appuient sur au moins un
article retenu sans verbatim relevé.** La nuit du 26 août a fait lire 123
articles ; elle n'a pas fait baisser ce compte, parce que ses relevés sont
restés dans un document.

---

## 2.C — La qualité de lecture, mesurée

Le corpus distingue trois provenances (`SourceLecture`, `corpus/types.ts`), et
la distinction est le cœur du dossier :

- `premiere_main` — « Lu sur Légifrance, verbatim relevé par la personne qui
  l'encode » ;
- `agent_verbatim` — « Lu sur Légifrance par un agent, qui en a rapporté le
  verbatim et la date de version. **Vaut constat, pas garantie** : le verbatim
  n'a pas été recoupé » ;
- `indirect` — « Lu ailleurs qu'à la source […] **NE PEUT PAS fonder une entrée
  du référentiel** : deux reproductions concordantes peuvent dériver du même
  relevé, et aucune ne porte la date de version faisant foi ».

Répartition aujourd'hui, mesurée sur `src/lib/referentiels/corpus/` :

| Provenance | Articles |
|---|---|
| `agent_verbatim` | **238** |
| `premiere_main` | **36** |
| `indirect` | **0** |
| *(total dépouillé)* | *274* |

**87 % du corpus tient sur une lecture d'agent non recoupée.** C'est le régime
normal du dépôt et ce n'est pas un défaut en soi — le type dit que cela « vaut
constat ». Ce qui est un défaut est de l'oublier : c'est exactement le
mécanisme qui a produit les deux références fausses, dont un article abrogé
depuis quatre mois, qui ont motivé l'invention du champ `lecture`.
L'interdiction du niveau `indirect` est, elle, **tenue** : zéro entrée.

---

## Partie 3 — Pour que ce document ne se périme pas

Un journal qu'il faut reconstituer à la main est un journal qui mourra une
seconde fois. Celui-ci a été reconstitué en une session, et il ne faut pas
recommencer.

### Ce qui a tué les documents précédents

**Trois documents de ce dépôt sont morts de la même façon**, et le mécanisme
est chaque fois identique : *le document a raison le jour où il est écrit, le
code bouge, le document ne bouge pas, et quelqu'un s'y fie.*

1. **`docs/relecture-source-2026-08-26.md`** — il annonce « rien n'est
   appliqué » ; six jours plus tard, deux de ses cinq rattachements sont
   corrigés, sa section URL est soldée, et quatre de ses constats visaient déjà
   un état révolu. Le document, lui, dit toujours la même chose. C'est celui
   qui a coûté la journée du 1er septembre.
2. **`docs/carto-obligations-hors-equipement.md`** — honnête sur elle-même
   (« ⚠️ Les références ci-dessous sont présumées […] pas d'une lecture de
   Légifrance »), et pourtant recopiée sans recoupement dans deux briefs du
   31 août : `a2186cf` en tire le constat que « les deux erreurs ont la même
   cause : la carto et une note recopiées sans être recoupées ». Aujourd'hui
   son premier paragraphe est faux — il fonde tout le document sur le fait que
   « `Obligation.categoriesEquipement` est obligatoire et non vide
   (`types.ts:168`) », que l'ADR-022 a levé, et la ligne citée désigne
   désormais autre chose.
3. **Une `notesInternes` de `incendie.ts`** — pas un document, et c'est le plus
   inquiétant : le code lui-même a menti. La note annonçait trois corrections
   « non réparées » ; deux l'étaient. Le brief du palier 1 l'a lue et l'a prise
   pour l'état du code. Le lot a fini par écrire la leçon dans le fichier :
   **« une note qui décrit un état révolu finit par faire refaire le travail »**
   — et `a2186cf`, plus court : **« Une note qui dit "à faire" ne dit pas que ça
   reste à faire. »**

**Le contre-exemple existe, et il est dans le dépôt.**
`docs/couverture-declaree-du-produit.md` a remplacé une carte vivante par une
liste figée — la mort programmée — et n'est pas mort, parce que `7d71b72` lui a
adossé `src/lib/referentiels/corpus/doc-couverture.test.ts` : le test lit le
`.md`, le compare au corpus **dans les deux sens**, et le message d'échec dit
quoi écrire et où. Il a attrapé un écart dès sa première exécution.

C'est le patron à reprendre. Il tient en une phrase : **un document qui affirme
quelque chose du code doit échouer quand le code le dément.**

### Les quatre gestes, et qui les porte

**Geste 1 — au moment de la lecture, par la session qui lit.**
*Règle : un commit qui pose ou modifie un `luLe` au corpus touche ce fichier.*
Cinq lignes en partie 1 : date, sha, périmètre chiffré, provenance de lecture
(`première main` / `agent` / `indirect`), et — la seule qui compte — **ce qui a
été appliqué et ce qui ne l'a pas été**. La chronologie s'écrit au fil de
l'eau ou elle ne s'écrit pas : elle a coûté une session à reconstituer sur
douze jours, elle coûtera une heure à reconstituer sur trois mois.

Cette règle est mécaniquement vérifiable en CI sur un diff (`git diff` touche
`corpus/` avec un `luLe:` ajouté **et** ne touche pas
`docs/journal-des-verifications.md` → échec). **Ne l'automatisez pas tout de
suite** : commencez par la règle de revue, et n'ajoutez la garde que si elle
est enfreinte. Une garde posée avant que le défaut existe est une garde qu'on
apprend à contourner.

**Geste 2 — dans le dépôt, une fois, par la prochaine session qui touche au
référentiel.**
Un test du genre de `doc-couverture.test.ts`, sur ce fichier, qui porte
**deux** garanties et pas une de plus :

- *(a)* tout identifiant d'obligation cité entre accents graves dans ce journal
  existe encore au référentiel, ou figure dans `OBLIGATIONS_RETIREES`. Sans
  cela, le journal parlera un jour d'une ligne qui n'existe plus, et personne
  ne le saura.
- *(b)* **le sens qui compte** : chaque constat marqué `NON CORRIGÉ` sur
  l'ABSENCE d'un article — `R. 4224-12`, `R. 4226-21`, `C. env. L. 512-8`,
  `CCH R. 134-2`, `Arrêté 2017-11-20 art. 18` — **fait rougir la suite le jour
  où l'article entre au référentiel**, avec pour message : *« cet article est
  désormais cité ; le constat de la partie 2 est peut-être corrigé — relisez-le
  et changez son état. »*

C'est (b) qui a manqué en août. Un constat qui devient faux doit se signaler
lui-même ; sinon il reste ouvert dans un document pendant qu'il est clos dans
le code, ce qui est exactement l'état trouvé le 1er septembre.

> **La liste de (b) n'est pas une liste exhaustive du référentiel**, et c'est
> ce qui la rend légitime : elle énumère les constats OUVERTS de ce journal,
> et sa réparation — retirer une ligne parce que son constat a été tranché —
> **est le geste qu'on veut**. Une liste qu'on répare en recopiant cesse de
> vérifier ; celle-ci, on la répare en décidant.

**Geste 3 — à chaque intégration, par la session qui assemble.**
Rejouer `pnpm relecture` et **recoller les compteurs** des tableaux de la
partie 2.B depuis la sortie, sans les retaper. Six chiffres, trente secondes.
Ils sont l'unique mesure de progrès du dossier : la nuit du 26 août a fait lire
123 articles sans faire baisser `SANS_VERBATIM`, et seul ce compteur pouvait le
dire.

**Geste 4 — celui qui aurait évité la journée du 1er septembre, et il est
gratuit.**
Mettre ce journal **sur le chemin de celui qui va lire un texte**. Concrètement :
`AGENTS.md` et `.claude/CLAUDE.md` doivent porter la consigne *« avant d'ouvrir
un texte de droit, lis `docs/journal-des-verifications.md` § 2 — il a peut-être
déjà été lu, et le constat qui te concerne y est peut-être déjà tranché »*, et
la compétence `veille-reglementaire` doit renvoyer ici avant sa première étape.
Un document que personne n'ouvre au bon moment est mort quel que soit son
contenu.

### Ce qu'il faut faire des documents morts, maintenant

Ne pas les supprimer : ils portent des verbatims et des raisonnements qu'on ne
refera pas. **Les dater et les renvoyer ici.** Un bandeau de trois lignes en
tête suffit, et il est posé sur `docs/relecture-source-2026-08-26.md` par le
même commit que ce journal.

Restent à traiter, et ce n'est pas le périmètre de ce travail :
`docs/carto-obligations-hors-equipement.md`, dont le premier paragraphe fonde
tout le document sur une contrainte que l'ADR-022 a levée.

### Ce que ce journal ne doit jamais devenir

Il ne doit **pas** recopier le registre qui vit dans le code. Les 19
`obligation_manquante`, les 42 réserves de lecture, les 28 articles écartés se
mesurent par `pnpm relecture` et se périment à la seconde où on les recopie
ici. La partie 2.B en donne les **compteurs**, pas les listes, et c'est
délibéré.

Ce journal porte ce que le code ne sait pas dire : **qui a lu quoi, quand,
comment — et ce qu'on en a fait.**
