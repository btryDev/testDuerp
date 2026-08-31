# Palier 1 — rapport

Branche `fix/faux-negatifs-ancrage`, partie de `main` (`de2d857`).
Relecture et rebranchement conduits le 2026-08-31.

**Trois obligations sur six ont été rebranchées. Trois ne l'ont pas été, et ce
rapport dit pourquoi** — dont une pour une raison qui appelle une décision, et
une parce que la ligne elle-même ne tenait pas à la vérification.

Toutes les lectures ci-dessous ont été faites sur Légifrance, article par
article, ce jour. Là où ce rapport dit « verbatim », le texte a été ouvert ;
là où il ne le dit pas, il ne le dit pas.

## Note sur le brief lui-même

**Le brief de ce lot envoyait vérifier un travail déjà fait.** Il annonçait, en
s'appuyant sur une note de `incendie.ts`, que la description de `R. 143-44`
reprenait la version antérieure de l'article et ignorait le 5° et le renvoi à
`R. 141-10` / `R. 141-11`, et que `typologies` devait encore gagner `erp: true`.
Les deux étaient corrigés sur `main` avant l'ouverture du lot.

La cause est nommée parce qu'elle se répète : **la note du code décrivait un état
révolu, et le brief l'a relayée comme si elle décrivait le contenu.** Personne
n'avait rouvert le fichier. C'est la même famille d'erreur que la règle du dépôt
« ouvre le texte avant de le qualifier » vise pour les textes de loi — et elle
s'applique aussi bien au code qu'à Légifrance.

Cela n'a pas coûté cher ici : la relecture était de toute façon nécessaire pour
décider de l'ancrage, et elle a produit la trouvaille du § 2. Mais un brief se
relit comme une note se relit, et celui-ci a envoyé quelqu'un contrôler du
travail terminé. La note fautive de `incendie.ts` est réécrite ; les briefs de ce
dépôt gagneraient à citer le fichier plutôt que la note qui le commente.

---

## 1. La relecture de `R. 143-44`, version au 1er juillet 2026

C'était la condition d'entrée du lot : relire avant de rebrancher, pour ne pas
figer une description périmée sur une obligation qu'on rend visible à beaucoup
plus de monde.

**Verbatim relevé** (version en vigueur depuis le 01/07/2026, décret
n° 2025-1100 du 19 novembre 2025) :

> Dans les établissements soumis aux prescriptions du présent chapitre, il doit
> être tenu un registre de sécurité sur lequel sont reportés les renseignements
> indispensables à la bonne marche du service de sécurité.
>
> Ce registre comprend, outre les pièces attendues aux articles R. 141-10 et
> R. 141-11 :
>
> 1° Les dates des travaux d'aménagement et de transformation, leur nature, les
> noms du ou des entrepreneurs et, s'il y a lieu, de l'architecte ou du
> technicien chargé de surveiller les travaux ;
> 2° L'état nominatif et hiérarchique des personnes appartenant au service de
> sécurité ;
> 3° Les diverses consignes, générales et particulières, établies en cas
> d'incendie, y compris les consignes d'évacuation prenant en compte les
> différents types de handicap ;
> 4° Les dates des divers contrôles et vérifications ainsi que les observations
> auxquelles ceux-ci ont donné lieu ;
> 5° Les dates des exercices de sécurité incendie.

### Ce qui change par rapport à ce que le brief annonçait

**Le brief se trompait sur deux de ses trois points, et il faut le dire.** La
note de `incendie.ts` — que le brief cite — annonçait trois corrections non
faites. Deux l'étaient déjà.

| Point annoncé non traité | État réel au 2026-08-31 |
|---|---|
| (1) La description ignore le 5° et le renvoi à R. 141-10 / R. 141-11 | **Déjà corrigé.** La description encodée porte les cinq numéros et le renvoi. Vérifiée ligne à ligne contre le verbatim ci-dessus. |
| (2) `typologies` devrait gagner `erp: true` | **Déjà corrigé.** `typologies: { travail: true, erp: true }`. |
| (3) `R. 146-35` (IGH) cité sans `igh: true` | **Tient toujours**, et c'est voulu : l'IGH est hors périmètre produit, la référence n'est pas décorative pour autant. Inchangé. |

Ce n'est pas le contenu qui était périmé, c'est **la note qui décrivait son
état**. Elle est restée en place après que les corrections ont été faites, et
c'est elle qui m'a envoyé rouvrir R. 143-44 — comportement voulu, mais une note
qui décrit un état révolu finit par faire refaire le travail. Elle est réécrite.

### Ce que la relecture confirme, et qui décide de l'ancrage

« **Dans les établissements soumis aux prescriptions du présent chapitre** » :
le champ est le chapitre ERP tout entier, 5ᵉ catégorie comprise. **L'article ne
nomme aucun équipement.** C'est ce qui fonde le rebranchement de l'obligation 1.

### `erp: true` : oui, et il y était déjà

R. 143-44 fonde le registre en ERP **par lui-même** — « les établissements
soumis aux prescriptions du présent chapitre », sans référence à la qualité
d'employeur. Comme `matchTypologie` traite les régimes positifs en
**disjonction**, `{ travail: true, erp: true }` dit bien « employeur **ou**
ERP », et non « employeur **et** ERP ». C'est la bonne traduction.

---

## 2. Ce que j'ai trouvé et que le brief ne demandait pas

**La branche `travail: true` du registre reposait sur une faculté.**

C'est le constat le plus gênant du lot, et il est venu de la relecture, pas de
la liste.

Avant ce lot, `incendie-registre-securite` ne portait que deux références Code
du travail :

- `R. 4227-39` — dont le champ est celui de `R. 4227-34`, c'est-à-dire **pas
  tout employeur** ;
- `L. 4711-5`, dont voici le verbatim : « Lorsqu'il est prévu que les
  informations énumérées aux articles L. 4711-1 et L. 4711-2 figurent dans des
  registres distincts, l'employeur **est autorisé à** réunir ces informations
  dans un registre unique […] »

Le verbe est une **autorisation**. Une faculté ne fonde rien. L'obligation
s'appliquait donc à tout employeur — `travail: true`, sans seuil — sans
qu'aucune des références citées ne l'établisse pour lui.

**Corrigé** en ajoutant les articles qui l'obligent réellement, tous relus au
verbatim ce jour :

| Article | Ce qu'il impose | Version constatée |
|---|---|---|
| `L. 4711-1` | Les pièces des vérifications de santé-sécurité portent des mentions obligatoires | 2008-05-01 |
| `L. 4711-2` | L'employeur conserve les observations et mises en demeure de l'inspection | 2008-05-01 |
| `D. 4711-2` | Ces pièces sont datées et nomment le vérificateur | 2008-05-01 |
| `D. 4711-3` | Conservation cinq ans, et en tout état de cause les deux derniers contrôles | 2008-05-01 |

Aucun ne pose de condition d'effectif, d'équipement ni de classement ERP.
**La typologie ne bouge pas ; ce qui la fonde est désormais écrit.** `L. 4711-5`
reste cité, requalifié en toutes lettres comme la forme permise et non le
fondement.

Les quatre articles sont entrés au **corpus** avec leur verbatim et leur date de
lecture. Le cliquet de dette de lecture est resté à **0** — il n'a pas été
desserré pour les accueillir.

Une réserve est inscrite au corpus sur `D. 4711-3` : la durée de conservation de
cinq ans n'est portée par **aucun champ** du référentiel. `periodicite: "autre"`
dit « état à maintenir » et ne dit rien d'une rétention. Le produit conserve les
rapports déposés sans jamais annoncer la durée que le texte exige. Nommé, non
comblé.

---

## 3. Les six, une par une

### ✅ 1 — Tenue du registre de sécurité (`incendie-registre-securite`)

| | |
|---|---|
| **Ancrage constaté** | `categoriesEquipement: ["EXTINCTEUR", "ALARME_INCENDIE"]` |
| **Ce que le texte fonde** | `R. 143-44` : tous les ERP du chapitre, aucun équipement nommé. `L. 4711-1`, `L. 4711-2`, `D. 4711-2`, `D. 4711-3` : tout employeur, sans seuil. |
| **Porteur retenu** | `etablissement` |

**Pourquoi.** Aucun des cinq articles qui fondent l'obligation ne la subordonne
à un équipement. L'ancrage exigeait un extincteur ou une alarme **déclarés dans
l'outil** — une condition que le droit n'écrit nulle part. Les deux catégories
passent en `equipementsEnContexte`, à titre indicatif.

### ✅ 2 — Exercices et essais semestriels (`incendie-travail-exercice-semestriel`)

| | |
|---|---|
| **Ancrage constaté** | `categoriesEquipement: ["ALARME_INCENDIE"]` |
| **Ce que le texte fonde** | `R. 4227-39`, champ tenu de `R. 4227-34` par double renvoi (39 → 37 → 34) |
| **Porteur retenu** | `etablissement` |

**Pourquoi — et c'est le plus lourd du lot.** Verbatim de `R. 4227-34` :

> Les établissements dans lesquels peuvent se trouver occupées ou réunies
> habituellement plus de cinquante personnes, ainsi que ceux, quelle que soit
> leur importance, où sont manipulées et mises en œuvre des matières
> inflammables mentionnées à l'article R. 4227-22 **sont équipés d'un système
> d'alarme sonore**.

L'article **impose** l'alarme aux établissements de son champ. L'alarme y est le
**contenu d'une obligation**, jamais le critère qui fait entrer dans le champ.
Ancrer l'exercice semestriel dessus revenait à **ne l'exiger que de ceux qui
avaient déjà obéi** — et à laisser sans aucune ligne l'établissement de plus de
cinquante personnes qui n'a rien déclaré, c'est-à-dire précisément celui qui est
en défaut. Criticité 4, échéance semestrielle réelle, zéro ligne affichée.

La note du code le disait déjà — « le déclencheur ALARME_INCENDIE reste une
heuristique : l'alarme est une conséquence de R. 4227-34, pas sa condition » —
sans avoir été suivie d'effet.

**Le champ ne bouge pas** : `personnesPresentesMin: 51` et `champR422734`
restent la seule restriction.

### ✅ 3 — Consigne de sécurité incendie (`incendie-travail-consigne-affichee`)

| | |
|---|---|
| **Ancrage constaté** | `categoriesEquipement: ["EXTINCTEUR", "ALARME_INCENDIE"]` |
| **Ce que le texte fonde** | `R. 4227-37` : « Dans les établissements mentionnés à l'article R. 4227-34, une consigne de sécurité incendie est établie et affichée de manière très apparente » |
| **Porteur retenu** | `etablissement` |

**Pourquoi.** L'article ne mentionne aucun équipement. Son champ — celui de
`R. 4227-34` — **était déjà encodé en typologies**. La liste d'équipements ne
restreignait donc rien de ce que le texte restreint : elle ajoutait une
condition que le texte n'écrit pas.

Le matériel figure bien dans la consigne (`R. 4227-38` 1°), mais **le désigner
n'est pas en avoir déclaré un dans l'outil**. Les deux catégories passent en
`equipementsEnContexte`.

`versionConstatee: "2011-11-10"` ajoutée, avec le terme au 2027-01-01 déjà porté
par `relectureDue`.

### ❌ 4 — Visites de la commission de sécurité (`incendie-erp-5-visite-commission`)

**Non rebranchée. Le faux négatif est réel ; le rebranchement produirait un faux
positif plus large.**

`R. 143-41` (version en vigueur depuis le 2021-07-01) fonde les visites sans
condition d'équipement : « **Ces établissements** doivent faire l'objet, dans les
conditions fixées au règlement de sécurité, de visites périodiques de contrôle
et de visites inopinées effectuées par la commission de sécurité compétente. »
L'antécédent est l'ensemble des établissements soumis au chapitre. Un hôtel qui
n'a pas déclaré d'alarme ne reçoit donc **aucune ligne**, alors qu'il est visité.

Mais `PE 37` est intitulé « **Contrôle des établissements de 5e catégorie
comportant des locaux à sommeil** » et ne vise que « les établissements
comportant, **pour le public**, des locaux à sommeil ». C'est le **seul** article
du Livre III qui organise une visite périodique en 5ᵉ catégorie : `GE 4` ne
couvre que les 1ʳᵉ à 4ᵉ et relève du Livre II, écarté par `PE 1 § 1`.

**La restriction « locaux à sommeil » décide donc de l'existence de la visite,
pas de son rythme.** La retirer ferait naître une échéance chez chaque
restaurant et chaque boutique de 5ᵉ catégorie.

Or `ObligationPorteeParEtablissement` interdit `conditions` — à raison : une
condition porte sur une propriété d'équipement, et il n'y aurait plus
d'équipement pour la porter. Aujourd'hui `dessertLocauxSommeil` vit sur
l'`ALARME_INCENDIE`, ce qui est déjà un pis-aller : les locaux à sommeil sont un
attribut de l'**établissement**, pas de son alarme.

**Ce qui m'en a empêché** : le déblocage est un attribut d'établissement — du
genre `comporteLocauxSommeilPublic` — donc une migration, donc
`prisma/schema.prisma`, que le brief place explicitement hors de mon périmètre.
**Question remontée à la session qui a délégué le lot, non tranchée à ce jour.**

Entre un faux négatif borné aux établissements à locaux à sommeil sans alarme
déclarée et un faux positif sur tous les ERP de 5ᵉ catégorie, j'ai gardé le
premier — et je l'écris ici plutôt que de le corriger de travers. Un test le
fige et **devra tomber** le jour où l'attribut existera.

### ❌ 5 — Registre unique de sécurité

**Rien à rebrancher : la ligne ne tient pas.**

Le brief la donnait « partielle », la carto la classe `A15` sur
`CT D. 4711-1 à D. 4711-3`. Lecture faite :

- `L. 4711-5` — « l'employeur **est autorisé à** réunir ces informations dans un
  registre unique ». **Une faculté.** Il n'existe aucune obligation de tenir un
  « registre unique de sécurité » ; il existe une permission de regrouper.
- `D. 4711-1` — affichage des adresses du médecin du travail, des secours et de
  l'inspection. Obligation réelle, mais **ce n'est pas un registre** : c'est
  l'affichage `A14` de la carto, absent du référentiel.
- `D. 4711-2` et `D. 4711-3` — datation, identité du vérificateur, conservation
  cinq ans. Obligations réelles, **désormais portées** par
  `incendie-registre-securite` (§ 2 ci-dessus).

**Aucune obligation créée, aucune touchée.** La ligne `A15` de la carto est mal
qualifiée : elle nomme « registre unique » ce que le texte donne comme une
faculté de regroupement. À corriger dans la carto, hors de ce lot.

### ❌ 6 — Agents chimiques, notice de poste

**Non rebranchée. Le porteur n'est pas le problème.**

`R. 4412-38` (version en vigueur depuis le 2018-01-01) : « L'employeur veille à
ce que les travailleurs […] reçoivent des informations […] sur **les agents
chimiques dangereux se trouvant sur le lieu de travail** […] aient accès aux
fiches de données de sécurité […] reçoivent une formation […] »

Le déclencheur du texte est la **présence d'agents chimiques dangereux**. Ce
n'est ni un statut d'employeur, ni un équipement : c'est le **cinquième
déclencheur** de la carto, « activité réellement exercée », **non implémenté**.

Passer au porteur établissement imposerait la formation au risque chimique et
les FDS à **tout employeur du produit** — un cabinet, une boutique de
vêtements. C'est l'erreur symétrique, sur du criticité 3.

`STOCKAGE_MATIERE_DANGEREUSE` reste l'ancrage **en connaissance de cause** :
proxy imparfait — un établissement peut détenir des produits d'entretien classés
sans avoir déclaré de stockage — mais proxy **dans le bon sens**, qui
sous-applique au lieu de sur-appliquer. La correction juste est un attribut de
présence d'agents chimiques dangereux, pas un changement de porteur.

**Sur la notice de poste elle-même** : `R. 4412-39` n'est encodé **nulle part**
au référentiel. Ce n'est pas un ancrage à corriger, c'est une **obligation
absente** — hors du périmètre de ce lot, qui ne traite que des ancrages
existants.

---

## 4. La mesure du lot

Ce que reçoit un établissement **sans aucun équipement déclaré**, avant et après.

| Établissement | Avant | Après |
|---|---|---|
| ERP 5ᵉ catégorie (restaurant, 8 salariés) | **1** | **2** |
| Employeur non-ERP, 60 personnes présentes (champ `R. 4227-34`) | **1** | **4** |
| Employeur non-ERP, 12 salariés, hors champ `R. 4227-34` | **1** | **2** |
| Petit employeur, 4 salariés | **1** | **2** |

Le détail, figé par test :

- **ERP 5ᵉ** : `aeration-controle-installations-r4222-20` +
  `incendie-erp-pe4-entretien-installations-techniques` (déjà là) —
  **`incendie-registre-securite` apparaît**.
- **Employeur du champ `R. 4227-34`** : `aeration-controle-installations-r4222-20`
  (déjà là) — **`incendie-registre-securite`,
  `incendie-travail-consigne-affichee` et
  `incendie-travail-exercice-semestriel` apparaissent**.

Le restaurateur du brief, qui n'a pas déclaré d'alarme, ne lisait aucun exercice
d'évacuation. Il en lit un maintenant — s'il est dans le champ du texte, et
seulement s'il y est.

**Compte du référentiel** : 85 obligations, inchangé. La répartition par porteur
passe de 83 / 1 / 1 à **80 équipement / 5 établissement / 1 salarié**.

---

## 5. Vérification

| | |
|---|---|
| `pnpm vitest run` | **1756 passés** (1745 au départ + 11 écrits pour ce lot), 0 échec |
| `npx tsc --noEmit` | propre |
| `npx eslint src` | 1 avertissement, le préexistant `normaliserFormData` |

`REFERENTIEL_VERSION` : `2026-08-27.6` → `2026-08-31.1`.
`EMPREINTE_ATTENDUE` : `85-23798b9c81f3ce74` → `85-a1ecbc416487d453`.

### La vérification qui compte : les tests passent par le moteur

`src/lib/matching/faux-negatifs-ancrage.test.ts`, 11 tests. Chacun appelle
`determineObligationsApplicables` sur le **référentiel réel**, avec un parc
**vide** — jamais un tableau d'obligations fabriqué pour l'occasion, jamais une
réimplémentation du prédicat. C'est le piège que le brief signalait, et il est
évité par construction : le test ne peut pas rester vert si la garantie est
neutralisée, puisqu'il n'a pas d'autre source de vérité que le moteur.

Chaque assertion « l'obligation apparaît » est **doublée** d'une assertion « et
elle n'apparaît pas ailleurs » : l'habitation pure ne reçoit pas le registre, le
salon de coiffure de 4 personnes ne reçoit ni consigne ni exercice. Rebrancher
trop large ferait échouer la suite.

### La garantie a été cassée, une fois par obligation

Défaut réinjecté — ancrage d'origine remis, porteur retiré —, suite complète
relancée, puis réparé. **Les tests nommés tombent, et eux seuls.**

| Défaut réinjecté | Tests qui tombent |
|---|---|
| `incendie-registre-securite` | les 2 tests « registre » + les 2 tests de mesure, **nommément** |
| `incendie-travail-exercice-semestriel` | les 2 tests « exercices » + les tests de mesure, **nommément** |
| `incendie-travail-consigne-affichee` | les 2 tests « consigne » + les tests de mesure, **nommément** |

S'y ajoutent, dans les trois cas, deux **sentinelles structurelles** qui doivent
réagir à toute modification du contenu du référentiel, et dont le
déclenchement confirme qu'elles fonctionnent :

- l'empreinte de `conformite.test.ts` ;
- la cartographie des catégories sans obligation de `engine.test.ts`, et le
  guide « chez vous », qui figent l'un et l'autre l'état de couverture.

Une garantie qu'on n'a pas cassée est une décoration. Celle-ci a été cassée
trois fois.

---

## 6. Ce que ce lot laisse ouvert

### 1. La conséquence d'écran — à regarder en premier au contrôle visuel

**Un employeur non-ERP qui déclare son alarme incendie verra désormais « aucune
échéance calculée » sur cet appareil.**

C'est juste au regard du modèle : les trois obligations que l'alarme déclenchait
sont maintenant portées par l'établissement, et elles s'affichent — ailleurs, et
pour tout le monde, y compris pour qui n'a rien déclaré. Mais **un dirigeant qui
vient de saisir son alarme peut le lire comme un bug**, et rien à l'écran ne lui
dit que ses échéances ont simplement changé de place.

Figé dans `engine.test.ts` (liste `vides` du bureau non-ERP) **avec sa raison
écrite**, plutôt que corrigé ici : le corriger demande de décider ce que l'écran
doit dire d'un appareil dont les obligations sont portées par l'établissement,
et c'est un lot d'interface.

**C'est le premier point qu'un contrôle visuel doit regarder.**

### 2. L'attribut « locaux à sommeil » — dette nommée, arbitrage rendu

Bloque le seul faux négatif que je n'ai pas pu corriger (obligation 4).

**Ce qu'il faudrait pour la lever** : un attribut d'établissement du type
`comporteLocauxSommeilPublic` — mais ce n'est pas qu'une colonne. C'est une
**donnée nouvelle à collecter** : une question d'onboarding, un champ de fiche
établissement, et une règle de matching.

**Arbitrage rendu par la session coordinatrice le 2026-08-31 : on ne l'ouvre
pas.** Le cadrage V1 exclut ce qui demande une donnée que le produit ne détient
pas — c'est le critère qui a déjà écarté le DTA amiante et le radon. La ligne 4
relève du même arbitrage.

L'état actuel **sous-applique** au lieu de sur-appliquer, et c'est la bonne
erreur des deux : une échéance manquante se voit à la relecture, une échéance née
chez chaque boutique de 5ᵉ catégorie décrédibilise le produit chez tous ses
utilisateurs.

### 3. La durée de conservation de cinq ans

`D. 4711-3` exige la conservation des documents des cinq dernières années, et en
tout état de cause des deux derniers contrôles. **Aucun champ du référentiel ne
la porte.** Réserve inscrite au corpus sur l'article.

### 4. Deux obligations réelles, absentes du référentiel

- **`R. 4412-39`** — notice de poste pour chaque poste exposant à des agents
  chimiques dangereux.
- **`D. 4711-1`** — affichage des adresses du médecin du travail, des secours et
  de l'inspection (ligne `A14` de la carto).

Ni l'une ni l'autre n'est un **ancrage à corriger** : ce sont des absences, hors
du périmètre de ce lot.

### 5. La carto — corrigée en passant

`A15`, `A13`, `A20`, `C1`, `C2`, `C4` et `E7` de
`docs/carto-obligations-hors-equipement.md` ont été mises à jour avec le résultat
de ce lot et les verbatim relevés. `A15` en particulier est **requalifiée** : elle
annonçait une obligation de « registre unique » que le texte donne comme une
faculté. Sans cette correction, elle relancerait quelqu'un dans trois semaines.
