# Relecture à la source — nuit du 26 au 27 août 2026

Six agents ont relu 123 articles sur Légifrance, chacun chargé de rapporter du
verbatim et un verdict sur ce que le corpus affirme. Ce document trie leurs
retours. **Rien ici n'a été appliqué au code** hors ce qui est marqué APPLIQUÉ.

Trois niveaux :

- **CONTRE-VÉRIFIÉ** — j'ai relu l'article moi-même à la source.
- **À CONTRE-VÉRIFIER** — rapporté par un agent, plausible, non recoupé.
- **SUR-APPEL** — l'agent conclut à un défaut qui n'en est pas un.

---

## 1. Appliqué cette nuit

**PO 8 § 1 et PO 12 étendent les périodicités hôtelières aux établissements
existants.** CONTRE-VÉRIFIÉ. PO 1 § 3 est dans la section « à construire ou à
modifier » ; PO 8 § 1 le réimporte nommément dans la section « établissements
existant », et PO 12 fait de même pour PO 7. La question était ouverte, elle est
fermée. Commit `9f13f91`.

**PO 13 — second attribut d'établissement manquant.** Le « très petit hôtel »
(≤ 20 personnes en chambres, plancher bas < 8 m) ouvre des dispenses ET une
aggravation : détection généralisée si l'on renonce à l'encloisonnement.

---

## 2. Défauts probables, à trancher avec l'utilisatrice

### 2.1 Des périodicités attribuées à des articles qui ne les portent pas

C'est le constat systémique du rapport Code du travail. Le Code renvoie presque
toujours la périodicité à un arrêté. Citer l'article du code seul, sans
l'arrêté, revient à attribuer un chiffre à un texte qui ne le contient pas.

**SUR-APPEL confirmé sur un cas :** `elec-travail-periodique-annuelle` cite
R. 4226-16 **et** l'arrêté du 26 décembre 2011, art. 3. La périodicité est donc
fondée. L'agent jugeait chaque article isolément.

**À CONTRE-VÉRIFIER, article par article :** lesquelles de nos obligations
citent un article de code SANS l'arrêté qui porte le chiffre ? C'est une
requête mécanique à écrire, pas une relecture.

### 2.2 Rattachements sans base textuelle

| Obligation | Référence mise en cause | Ce que dit l'article |
|---|---|---|
| `incendie-travail-eclairage-securite-*` | `R. 4226-19` | Ne vise QUE les vérifications électriques R. 4226-14 et R. 4226-16. Ne dit rien de l'éclairage de sécurité. |
| `stockage-dangereux-verification-etancheite` | `R. 4412-11` | Ni « rétention » ni « étanchéité » n'y figurent. Seul le 2° parle de « procédures d'entretien régulières ». |
| `aeration-travail-mise-en-service` | `R. 4222-21` | Impose une CONSIGNE d'utilisation écrite, pas une vérification à la mise en service. |
| `incendie-registre-securite` | `L. 4711-5` | C'est une FACULTÉ de fusionner des registres (« est autorisé à »), pas l'obligation d'en tenir un. Le socle est L. 4711-1 et L. 4711-2. |
| `esp-personnel-formation` | `R. 4323-1` | Porte une INFORMATION, pas une formation. La formation renouvelée est à R. 4323-3 et R. 4323-4. |

Tous À CONTRE-VÉRIFIER. Si confirmés, ce sont des cas règle 6.

### 2.3 Champs d'application plus larges que ce qu'on retient

Motif déjà connu — c'est celui de PE 4 § 2 et de R. 4222-20, qui bloquent déjà
sur le porteur d'échéance.

- `R. 4224-17` vise « les installations et dispositifs techniques et de sécurité
  des lieux de travail » — tout le bâti technique. Nous l'avons rattaché aux
  seules portes automatiques. Cas d'école.
- `R. 4224-12` (absent du corpus) : « Les portes et portails sont entretenus et
  contrôlés régulièrement » — TOUTES les portes, pas seulement les automatiques.
- `R. 4323-22/-23/-25/-28` visent tous les équipements de travail, pas le levage.
- `R. 4544-11-1` couvre aussi les travaux sous tension (R. 4544-11), pas
  seulement le voisinage de pièces nues. **Un cas d'usage entier manque.**
- `R. 4227-39` impose « des essais et visites périodiques du matériel » ET des
  exercices, tous deux au moins semestriels. Nous n'avons retenu que l'exercice.
- `R. 4412-38` : le CSE est destinataire au même titre que les travailleurs.

---

## 3. Rythmes trouvés que le référentiel ne porte pas

| Article | Rythme | État |
|---|---|---|
| `DF 10 § 3` | Triennale par organisme agréé, si désenfumage MÉCANIQUE + SSI catégorie A ou B | **CONTRE-VÉRIFIÉ** — verbatim relevé. Condition croisant deux équipements : le modèle ne sait pas l'exprimer. |
| `CH 58` | Triennale sur les dispositifs de sécurité des systèmes thermodynamiques (CH 35 § 3) + contrôle d'étanchéité | À CONTRE-VÉRIFIER. Version du 10/09/2025, arrêté du 1er septembre 2025. |
| `PE 4 § 1` | Contrat ANNUEL d'entretien de la détection incendie, établissements avec locaux à sommeil | CONTRE-VÉRIFIÉ par deux agents indépendants, deux URL. |
| `R. 4226-21` | Processus de vérification des installations électriques TEMPORAIRES | À CONTRE-VÉRIFIER. Version du 25/12/2025. Rien chez nous. |

---

## 4. Sur-couvertures possibles

- `MS 73` : la triennale ne vaut que pour les **SSI de catégories A et B** et les
  **sprinkleurs**, par personne ou organisme agréé. Si notre libellé dit « SSI »
  sans restriction, nous sur-couvrons.
- `GE 4` : ce n'est **pas une périodicité unique**. Le tableau croise type ×
  catégorie et donne **3 ans OU 5 ans**. Le § 3 permet en outre de prolonger à
  cinq ans sous conditions. Toute obligation traitant GE 4 comme une constante
  est fausse pour une partie des cases.
- `R. 4412-87` : ne vise que les agents CMR. Rattaché à une obligation générique
  de stockage, il sur-couvre le CMR et sous-couvre le reste.

---

## 5. Fondements à recaler (l'article cité n'est pas le bon)

- `elec-erp-mise-en-service` → cite `GE 6`, qui dit seulement QUI vérifie. Le
  fondement est `GE 7` / `GE 8 § 1`, via `EL 19 § 2`.
- `cuisson-erp-extinction-automatique-annuelle` → cite `GC 22`, où « extinction
  automatique » n'apparaît pas. Le fondement serait `MS 73`.
- `cuisson-erp-verification-initiale` → `GC 22 § 1` renvoie à la section II du
  chapitre Ier ; le fondement direct est `GE 7` / `GE 8`.
- `incendie-erp-baes-annuelle` → `EC 15` est un pur renvoi ; l'annualité vient
  de `EL 19 § 3`.
- `aeration-erp-chauffage-ventilation-annuelle` → `CH 57` porte l'ENTRETIEN et
  le ramonage annuels ; la VÉRIFICATION annuelle est à `CH 58`.
- `incendie-travail-exercice-semestriel` → `R. 4227-34` définit le champ
  d'application ; la périodicité est à `R. 4227-39`.

---

## 6. Textes modifiés récemment — à surveiller

**Refonte majeure.** Le chapitre GZ est passé de GZ 1–30 à **GZ 1–15** (arrêté
du 23 février 2025, en vigueur au 1er janvier 2026). Toute citation d'un ancien
numéro GZ est à recontrôler. Cohérent avec l'abrogation de GZ 30 déjà traitée.

**Versions postérieures à 2024 relevées :** PE 22, PE 23 (01/08/2025) · PE 7,
PE 9, PE 21, GZ 15 (01/01/2026) · PE 27 (01/05/2026, arrêté du 4 février 2026)
· PE 10, PE 4 (01/07/2026) · CH 58 (10/09/2025) · R. 4544-10, R. 4544-11,
R. 4544-11-1, R. 4544-11-2 (01/10/2025) · R. 4226-20, R. 4226-21 (25/12/2025).

**Fins de version programmées :** `GE 6` au 1er juin 2027 · `R. 4227-37` au
1er janvier 2027.

---

## 7. PE 4, texte intégral confirmé

Deux agents, deux URL, mot pour mot identique. Version en vigueur au
**1er juillet 2026** (arrêté du 1er décembre 2025, art. 3 et 4).

> « § 2. Tous les trois ans au plus, l'exploitant doit procéder, ou faire
> procéder, par des techniciens compétents, aux opérations d'entretien et de
> vérification des installations et des équipements techniques de son
> établissement (chauffage, éclairage, installations électriques, installations
> de gaz, appareils de cuisson, circuits d'extraction de l'air vicié, des buées
> et des graisses des grandes cuisines, des offices de remise en température et
> des îlots, ascenseurs, moyens de secours, **etc.**). »

Ce que l'arrêté du 1er décembre 2025 a changé : « En cours d'exploitation »
devient « Tous les trois ans au plus », et « installations de gaz » entre dans
la liste.

**Le point décisif pour l'architecture :** la liste se termine par « etc. ».
Elle n'est pas limitative. Elle ne peut donc pas être traduite en une
énumération fermée de catégories d'équipement — ce qui confirme le classement
en `obligation_manquante` et non en obligation décomposée par domaine.

`PE 2 § 3` confirme la portée : les établissements de moins de 20 personnes
restent soumis à PE 4. Et le champ est plus large que ce que nous disions — il
couvre aussi « les locaux professionnels recevant du public situés dans les
bâtiments d'habitation ou dans les immeubles de bureaux ».

---

## 8. Confirmé sans réserve

- `PE 28` à `PE 36` : aucune périodicité. Seul `PE 37` en porte une.
- `PU 1` à `PU 6` : aucune obligation récurrente. Règles de construction. Le
  seul gisement possible est le renvoi de `PU 5` aux articles U 51 à U 64.
- `PX 1` : pur renvoi, et plus étroit qu'on ne disait — il n'importe que les
  « dispositions techniques » du chapitre XII.
- `PE 1`, `PE 3`, `PE 8`, `PE 18`, `PE 20` : conformes.
- `EC 14` : les deux rythmes (mensuel, semestriel) sont correctement portés.
- `MS 73`, `EL 19`, `R. 4227-39`, `R. 4544-10`, `R. 4226-14` : conformes.
- Aucun article n'est resté illisible. Les 123 ont été lus.

---

## 9. Sixième rapport — arrêtés divers

### 9.1 Corroboration indépendante du travail sur les ascenseurs

`CCH R. 134-6`, version du **1er avril 2026** (décret n° 2026-166 du 4 mars 2026),
confirme article par article la lecture faite sur capture d'écran de l'annexe de
l'arrêté du 18 novembre 2004 :

> « a) Une visite toutes les six semaines en vue de surveiller le fonctionnement
> de l'installation et effectuer les réglages nécessaires ; b) La vérification
> toutes les six semaines de l'efficacité des serrures des portes palières […] ;
> c) L'examen semestriel du bon état des câbles et la vérification annuelle des
> parachutes ; d) Le nettoyage annuel de la cuvette de l'installation, du toit de
> cabine et du local des machines ; f) La vérification toutes les six semaines du
> bon fonctionnement des moyens d'alerte et de communication avec un service
> d'intervention. »

Deux sources indépendantes, même résultat : câbles semestriels, parachutes
annuels, visite de base toutes les six semaines. La contradiction interne
corrigée ce soir l'était dans le bon sens.

**SUR-APPEL** : l'agent conclut que « nos slugs inversent les objets » en lisant
les IDENTIFIANTS (`examen-annuel-securite`, `examen-semestriel-secours`). Ces
identifiants sont stockés en base sous contrainte d'unicité et n'ont
délibérément pas été renommés ; leur contenu, lui, est juste depuis `1089e4a`.

**À CONTRE-VÉRIFIER, et neuf** : `R. 134-6` impose aussi un **nettoyage annuel**
de la cuvette, du toit de cabine et du local des machines — le d). Et `R. 134-11`
(version du 15 mai 2026) ajoute au contrôle quinquennal la vérification que les
moyens d'alerte sont **compatibles avec autre chose que le RTC ou la 3G**.
Exigence nouvelle, liée à l'extinction de ces réseaux.

### 9.2 Rythmes trouvés que le référentiel ne porte pas

| Article | Rythme manquant |
|---|---|
| `Arrêté 2011-12-26 art. 3` | La périodicité annuelle **peut être portée à deux ans** si le rapport précédent est sans observation, sous réserve d'informer l'inspecteur du travail par LRAR. Nous ne portons que l'annuelle. |
| `GH 5` (IGH) | **Quatre** rythmes : six mois, un an, deux ans (paratonnerres), cinq ans (charge calorifique). Nous n'en portons qu'un. Plus la règle des 20 %/an bouclée à cinq ans. |
| `Arrêté 1987-10-08 art. 4` | Annuel **et** semestriel lorsqu'il existe un système de recyclage. |
| `Arrêté 2017-11-20 art. 15` | Six régimes d'inspection (1 an, 4 ans, 2 ans, 4 ans, 3 ans pour la première, 40 mois transitoire), plus « avant chaque remplissage » pour les récipients mobiles. |
| `Arrêté 2017-11-20 art. 18` | Six échéances de requalification (2, 3, 6, 6, 6, 10 ans) plus un régime propre aux extincteurs. Nous ne portons que la décennale, cas résiduel. |
| `Arrêté 2015-06-01 art. 22` | Tests de fonctionnement **au moins semestriels** des dispositifs actifs de drainage. |
| `PS 32` | Vérification **quinquennale par organisme agréé** et vérification à la mise en service, en plus du couple annuel/biennal selon le seuil de 250 véhicules. |

### 9.3 URL fausses dans le corpus

Concret et mécanique à corriger :

- `arrete-2011-12-14-eclairage` → le bon texte est `JORFTEXT000025055364`
- `arrete-2011-12-30-igh` → `JORFTEXT000025167121`
- `Arrêté 2012-08-07` → pointe sur l'arrêté du 18 novembre 2004 ; le bon est
  `JORFTEXT000026286347`
- `C. env. R. 557-14-1` → est dans le code de l'environnement, pas dans l'arrêté
- `Arrêté 2015-06-01 art. 22` → `JORFTEXT000030673177`

### 9.4 Autres fondements mis en cause

- `PS 32` : nos deux obligations isolent la « surveillance de la qualité de
  l'air », or l'article traite **toute une liste d'installations** et **exclut
  expressément** la qualité de l'air du contrôle quinquennal. Notre découpage
  porte sur le seul champ traité différemment.
- `C. env. L. 512-1` ne traite que de l'**autorisation** ; le régime
  **déclaratif** est à L. 512-8.
- `CCH R. 134-1` est un article de définition ; les moyens d'alerte sont au 6° de
  `R. 134-2`.
- `Arrêté 2004-03-01 art. 20` : le « 6 mois » est une **condition de dispense**
  de remise en service, pas une périodicité de VGP.
- `Arrêté 1993-12-21 art. 2` ne vise que le passage de **véhicules** — cohérent
  avec la correction faite ce soir sur `porte-auto-portail-piete-coulissant`.

### 9.5 Versions postérieures à 2024, deuxième vague

`GH 5` (arrêté du 1er septembre 2025, effet 1er janvier 2026) · ESP art. 26 et 28
(arrêté du 5 septembre 2025) · `CCH R. 134-6`, `R. 134-11` et l'arrêté du
7 août 2012 (décret n° 2026-166 et arrêté du 4 mars 2026, effets 1er avril et
15 mai 2026).

---

## 10. Ce que je retiens de la nuit

Le motif dominant n'est pas l'erreur isolée, c'est **le second rythme du même
article**. Il apparaît maintenant sur au moins quinze articles. Le référentiel a
été construit en retenant une périodicité par article, et le droit n'est pas
écrit comme ça.

Le second motif est **le fondement approximatif** : citer l'article qui parle du
sujet plutôt que celui qui prescrit. Le Code du travail renvoie presque toujours
la périodicité à un arrêté ; citer le code seul attribue un chiffre à un texte
qui ne le contient pas.

Aucun des 123 articles n'est resté illisible.
