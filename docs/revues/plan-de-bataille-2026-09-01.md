# Plan de bataille — 2026-09-01

Trois sources, recoupées : ma liste scellée avant l'audit
(`ou-en-est-le-projet-reponse-scellee.md`), l'audit externe indépendant, et les
six axes de la revue d'assemblage. **Aucune des trois ne contenait les deux
autres**, et c'est le résultat le plus utile de la journée.

## Le filtre, posé par la propriétaire

Un constat **se corrige** s'il remplit l'une des deux portes :

- **(a)** quelqu'un peut s'en apercevoir — un dirigeant à l'écran, un contrôleur ;
- **(b)** c'est grave, touche au réglementaire, ou **fait mentir la
  réglementation**.

La porte (b) **n'admet aucune dette** : elle se corrige même si personne ne s'en
aperçoit jamais. Un référentiel qui ment n'a pas besoin d'être vu pour être faux.

Tout le reste **se consigne**. Le volume de constats n'est pas une mesure de la
qualité d'une revue ; passé un seuil, c'en est l'inverse.

## Ce qui est déjà fait

**Le score de conformité** (`116a278`, branche `fix/score-etats-permanents`).
Il annonçait « 100 — Situation satisfaisante » à un dossier n'ayant rien
renseigné. Il ne conclut plus « satisfaisante » tant qu'une part du périmètre
est sans réponse, sans pour autant pénaliser ce qu'il n'établit pas.

---

# Porte (b) — se corrige, aucune dette possible

## Lot A — le produit fabrique une échéance que le droit exclut

**Le plus grave de la journée.** Deux exclusions écrites en toutes lettres dans
le référentiel, et rien dans le code ne les porte.

- `R. 4451-82` : « Pour un travailleur classé en catégorie A […] **la visite
  intermédiaire mentionnée au même article n'est pas requise.** »
- `R. 4624-24` : l'examen du suivi renforcé « **se substitue à** la visite
  d'information et de prévention ». Un salarié a l'un ou l'autre, jamais les deux.

Les notes de `sante-travail.ts:81`, `:141`, `:251` et `:281` énoncent la
conséquence sans détour — « l'interface ne doit pas proposer les deux ensemble ».
`grep` sur `exclusif|incompatib|mutuelle` dans `src/lib/salaries/` et
`src/components/equipe/` : **zéro occurrence**. `cataloguerTitres()`
(`salaries/catalogue.ts:33`) dérive génériquement du porteur et propose donc les
titres côte à côte, sans que rien ne les oppose. `declarerTitre`
(`salaries/actions.ts:170`) ne connaît aucune exclusion.

**Atteignable en usage ordinaire, sans requête forgée** : l'employeur coche les
deux, le générateur inscrit l'échéance, et le calendrier affiche un rendez-vous
que le droit exclut. C'est le genre d'échéance inventée qui se présente à un
contrôle.

Le modèle n'a aucun moyen de l'exprimer aujourd'hui : `ConditionApplication`
porte sur des propriétés d'**équipement** et est interdite sur un porteur
salarié. **La forme du remède est à concevoir, pas seulement à écrire** — c'est
le lot qui demande le plus de réflexion et le moins de lignes.

Fichiers : `referentiels/conformite/types.ts`, `salaries/`, `components/equipe/`.

## Lot B — `L. 4622-1` encodé deux fois, dans deux sens opposés

`corpus/code-travail-sante-travail.ts:87` le porte en `obligation_manquante`
avec un `bloquePar` affirmant qu'encoder serait prématuré.
`corpus/code-travail-service-prevention-sante.ts:40` le porte en `retenu`,
désignant `sante-travail-etablissement-adhesion-spst` — qui existe et qui est
juste. Même `ref`, même URL, même `versionEnVigueur`, même `citationCle`, même
`luLe`. Le lot 8 a créé un corpus neuf et laissé l'entrée d'origine derrière lui.

Effet : `obligationsManquantes()` surcompte de un, `couvertureParCorpus()`
compte l'article deux fois, et le registre qui dit **ce qui manque au
référentiel** déclare manquante une obligation encodée depuis trois jours.

**Et la garde s'oppose au correctif, pas au défaut.** `corpus.test.ts:243` porte
une liste exhaustive écrite à la main qui exige `L. 4622-1` parmi les manquantes.
Mesuré par l'axe 5 : la correction honnête donne `1 failed | 1835 passed`, et le
seul test à protester est celui-là. **Verte sur l'état faux, rouge sur l'état
juste, réparable en supprimant une ligne.**

Le test d'unicité (`corpus.test.ts:15`) ne vérifie l'unicité qu'**à l'intérieur**
d'un corpus. Trois `ref` sont dupliquées entre corpus — `L. 4711-5`,
`R. 4226-19`, `L. 4622-1` ; les deux premières sont cohérentes.

Deux remèdes mesurés, à trancher dans le lot : « même `ref`, statuts
divergents » donne 1 vrai positif et **0 faux positif** sur 33 corpus et 237
articles, mais n'attrape que ce défaut-ci ; « article `obligation_manquante`
cité par une obligation encodée » attrape la classe entière, 1 sur 12 et 0 faux
positif aujourd'hui, mais **criera faux un jour** — `ReferenceLegale` n'a aucun
champ distinguant une citation fondatrice d'une citation de contexte.

Fichiers : `referentiels/corpus/`.

## Lot C — un faux négatif réglementaire sur le champ le plus banal

`matching/engine.ts:247-252` : `personnesPresentesHabituellement` absent
retombe sur l'effectif salarié. Le champ est demandé à l'onboarding, mais
**facultatif**.

Un restaurant de 6 salariés qui reçoit 60 personnes et laisse le champ vide **ne
voit ni la consigne de sécurité incendie ni les exercices d'évacuation
semestriels** — précisément les deux lignes que le palier 1 a été construit pour
restaurer. L'entorse à la règle de l'ADR-022 est consignée
(`dette-chantier-porteur-echeance.md` § 4) ; **sa conséquence sur ce couple
d'obligations ne l'est nulle part.**

À trancher dans le lot : rendre le champ obligatoire, ou nommer le trou à
l'écran. La seconde voie est celle du dépôt ; la première change l'onboarding.

## Lot D — trois dépouillements

**D1 — le travail en hauteur** (`R. 4323-58` et s.). Vérifié au grep : **zéro
entrée de corpus, zéro citation**. Le sujet n'est pas hors périmètre — il avait
été confondu avec les EPI, qui le sont. **Seul trou de couverture franc connu.**

**D2 — le décret n° 2026-253 du 8 avril 2026**, jamais dépouillé. Il a déjà
touché deux articles du référentiel, **tous deux découverts par accident** : il
a réécrit `R. 4624-23` et abrogé `R. 4412-160`, que le référentiel avait un temps
déclaré « vérifié ». **C'est la seule dette qui peut révéler des obligations
fausses, pas manquantes.**

**D3 — quatre familles sans aucune trace dans le dépôt**, relevées par l'audit
externe : pénibilité / C2P (`L. 4161-*`, `L. 4163-*`), le **chapitre chaleur** du
décret n° 2025-482 du 27 mai 2025, le **défibrillateur** (CCH), et la seconde
branche de `R. 4323-23` (arrêté du 5 mars 1993, machines soumises à vérification
périodique).

**Ces quatre-là ne sont pas vérifiées en droit** — l'audit le dit lui-même. Elles
se recoupent sur Légifrance **avant** tout encodage. Trois références de brief se
sont déjà révélées fausses cette semaine pour avoir sauté cette étape.

Le cas de la chaleur mérite d'être lu deux fois : le dépôt a lu **un** article de
ce décret — l'eau « fraîche » de `R. 4225-2` — et pas son objet principal, alors
que la cuisine de restaurant en est le cas d'école.

## Lot E — quatre phrases qui mentent

- `calendrier/labels.ts:21` : `autre: "permanente"`. Le guide affiche donc
  « Rythme : permanente » pour 12 obligations **événementielles**, 9 **ponctuelles**
  et 3 récurrentes sans rythme. L'ADR-026 a défait ce mélange au référentiel
  sans le défaire dans la table de libellés.
- `conformite/formation-securite.ts:25-26` : « **Aucune obligation de ce fichier
  ne porte de périodicité chiffrée** » — or ligne 435,
  `formation-securite-salarie-cse-sst` porte `quadriennale` sur `L. 2315-17`, et
  sa propre note raconte la correction.
- `components/dashboard/widgets/impl/board.tsx:1712` : « 2 actions sur 5
  dépassent **son** échéance ». Le verbe s'accorde, le possessif non. Porte (a),
  atteignable dès la deuxième action en retard.
- `.claude/CLAUDE.md` : « dix-sept obligations » pour le bureau de six personnes.
  Deux mesures indépendantes en comptent **dix-huit**. Le fichier qui fait
  autorité est le seul des trois à dire dix-sept. **Appartient à la propriétaire**
  — à lui signaler, pas à corriger.

---

# Porte (a) — se corrige

## Lot F — le dossier remis à un tiers ne porte rien des lots 7 et 8

**Aucun générateur de document n'appelle le moteur de matching.** Vérifié :
aucun des sept appelants de `determineObligationsApplicables` n'est un
générateur. Ni `pdf/builders.ts`, ni `api/etablissements/[id]/controle-zip`.

Conséquence : le ZIP « Préparer un contrôle » et le dossier de conformité PDF ne
portent **ni les obligations d'établissement sans échéance, ni les déclarations
« en place »**. Un dirigeant qui a coché ses douze états permanents ne peut le
montrer à personne — et c'est le document qu'on présente à un inspecteur.

C'est le pendant documentaire du défaut de score déjà corrigé, et probablement
moins cher.

---

# Se consigne — dette, pas défaut

Aucun de ces points ne passe les deux portes. Ils sont écrits pour ne pas être
retrouvés une troisième fois, pas pour être traités aujourd'hui.

- **La règle lint/AST** sur les lectures Prisma sans prédicat. **Mesurée avant
  d'être écartée** : 172 lectures, 161 sur 163 portent déjà leur portée, et le
  balayage exploratoire a levé 12 drapeaux dont **10 faux positifs**. C'est
  l'argument contre la règle, pas pour.
- **Six obligations sans aucune surface** — `periodicite: "autre"` **et**
  `nature ∈ {evenementielle, ponctuelle}`. Trois tombent sur le dossier le plus
  banal du produit. Ce n'est pas une règle qui manque, c'est une **troisième
  surface**, et c'est une décision produit, pas une correction.
- **Deux transmissions mortes par construction** — portées par des obligations
  `porteur: "salarie"`, que `transmissions.ts:185` ne voit jamais puisque le
  moteur rend `null` pour ce porteur.
- **`CATEGORIES_COUVERTES = ["N5"]`** : un restaurant recevant plus de 200
  personnes est en 4ᵉ catégorie et se voit dire que son dossier restera
  incomplet. Honnête, mais c'est une part de la cible déclarée.
- **Les composants ne sont pas testés** : 2 fichiers de test sur 248 `.tsx`.
  Dans un produit dont toute la valeur récente est « est-ce que ça atteint un
  écran », c'est le ratio qui compte.
- `dev.log` (2,4 Mo) versionné ; `normaliserFormData` morte.
- **93 obligations sur 116 n'ont reçu aucune lecture Légifrance** dans cette
  revue. Ce n'est pas un défaut, c'est l'état de la vérification.

---

# Ce qui reste à trancher par la propriétaire

| # | Question |
|---|---|
| 1 | Les six obligations sans surface : troisième surface, ou silence assumé et écrit ? |
| 2 | `personnesPresentesHabituellement` : champ obligatoire, ou trou nommé à l'écran ? |
| 3 | La garde de cohérence du corpus : le remède étroit (0 faux positif, n'attrape que ce cas) ou le large (attrape la classe, criera faux un jour) ? |
| 4 | L'ADR-025 — sept questions, dont trois contredisent des ADR en vigueur. Non ouvert depuis le 31. |

---

# Règles communes à tous les lots

Tirées de cette semaine, chacune payée par un défaut réel.

- **Ouvre le fichier avant de qualifier ce qu'il contient.** Toutes les erreurs
  coûteuses viennent d'une conclusion tirée d'un grep, d'un commentaire ou d'un
  résumé — y compris dans des briefs que j'ai écrits, et y compris ce matin.
- **Éprouve chaque garde en réinjectant le défaut qu'elle prétend interdire.**
  Cette semaine a produit une garde restée verte après suppression du prédicat
  qu'elle protégeait, parce que le mot cherché figurait dans son propre
  commentaire ; une autre calibrée sur un composant que personne n'affiche ; une
  troisième qui a fabriqué le défaut qu'elle prévenait. Une garde qu'on n'a pas
  cassée exprès est une décoration.
- **Pas de liste exhaustive écrite à la main.** Elle se répare en recopiant,
  donc elle cesse de vérifier. Le lot B en tient la démonstration.
- **Écris tes constats au fil de l'eau**, pas à la fin. Cinq agents d'axe ont été
  coupés le 31 au soir sans rien rendre : un axe à 80 % rend autant qu'un axe
  qui n'a rien fait.
- **Pas de sur-engineering, pas de faux positif.** Consigne de la propriétaire,
  en vigueur depuis plusieurs revues.
- **pnpm, jamais npm.** Un worktree par lot, avec son propre `node_modules`.
- Partir de `origin/main`. Ne bouger aucune ref existante.
