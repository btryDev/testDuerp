# Rapport — lot 8, le socle de l'employeur, l'activité et l'effectif

Branche `feat/socle-employeur`, rebasée sur `feat/depouillement-salarie` (lot 7).
Dépouillement du 2026-08-31, toutes lectures sur Légifrance, `lecture: "agent_verbatim"`.

**Quinze obligations encodées, 28 articles consignés au corpus — plus quatre lus
sans être encodés —, six corpus créés, quatre domaines ajoutés.** Une ligne du brief n'est pas encodée et la raison est
au § 5. Une autre a été retirée en cours de route, le lot 7 l'ayant livrée.

---

## 1. La mesure : ce que reçoit un établissement sans aucun équipement

C'est le chiffre que le brief demandait, et c'est celui qui dit si le lot sert.
Obtenu en appelant `determineObligationsApplicables` sur un établissement de
travail, non-ERP, **sans aucun équipement déclaré**.

| Effectif | Avant le lot 8 | Après | Écart |
|---|---|---|---|
| 6 salariés | 6 | **17** | +11 |
| 12 salariés | 6 | **18** | +12 |
| 55 salariés | 6 | **19** | +13 |

Le « avant » est calculé par soustraction des identifiants de ce lot du relevé
après : ajouter des obligations au référentiel ne peut pas en retirer aux
dossiers existants, donc la soustraction est exacte. Il vaut 6 et non 7 — la
septième obligation d'établissement du lot 7 est `PE 4 § 2`, qui exige un ERP de
5ᵉ catégorie et ne s'applique pas à un bureau.

Pour situer : **avant le 2026-08-31, ce même établissement en recevait une
seule** (le contrôle des installations d'aération de `R. 4222-20`). Le lot 7 l'a
portée à six, le lot 8 à dix-sept.

Les trois lignes montrent aussi que les seuils fonctionnent : le CSE apparaît à
12 et pas à 6, le règlement intérieur à 55 et pas à 12, et le local de
restauration **remplace** l'emplacement à 55 — jamais les deux, jamais aucun.

---

## 2. Ce qui a été encodé, article par article

Toutes les périodicités sont `autre`, sans exception. Ce n'est pas une
commodité : **aucun des textes lus n'écrit de durée**. Les seuls chiffres qu'ils
portent sont des seuils d'effectif (11, 50), des délais d'entrée en obligation
(douze mois) et des durées de stage (cinq jours, trois jours). Le § 4 détaille
les quatre endroits où un chiffre aurait pu être pris pour un rythme.

### Domaine `organisation_prevention` — 3 obligations

| Obligation | Fondateur | Version lue | Porteur | Seuil |
|---|---|---|---|---|
| `prevention-etablissement-salarie-designe` | `L. 4644-1` I | 2022-03-31 | établissement | — |
| `prevention-etablissement-cse` | `L. 2311-2` | 2018-01-01 | établissement | `effectifMin: 11` |
| `prevention-etablissement-reglement-interieur` | `L. 1321-1` 1° | 2008-05-01 | établissement | `effectifMin: 50` |

Verbatim de `L. 4644-1` : « I.-L'employeur désigne un ou plusieurs salariés
compétents pour s'occuper des activités de protection et de prévention des
risques professionnels de l'entreprise. »

Verbatim de `L. 2311-2` : « Un comité social et économique est mis en place dans
les entreprises d'au moins onze salariés. Sa mise en place n'est obligatoire que
si l'effectif d'au moins onze salariés est atteint pendant douze mois
consécutifs. »

Verbatim de `L. 1321-1` 1° : « Les mesures d'application de la réglementation en
matière de santé et de sécurité dans l'entreprise ou l'établissement, notamment
les instructions prévues à l'article L. 4122-1 ».

### Domaine `information_travailleurs` — 2 obligations

| Obligation | Fondateur | Version lue | Porteur |
|---|---|---|---|
| `information-etablissement-affichages-obligatoires` | `D. 4711-1` | 2008-05-01 | établissement |
| `information-etablissement-avis-acces-duerp` | `R. 4121-4` dernier alinéa | 2022-03-31 | établissement |

Verbatim de `D. 4711-1` : « L'employeur affiche, dans des locaux normalement
accessibles aux travailleurs, l'adresse et le numéro d'appel : 1° Du médecin du
travail ou du service de santé au travail compétent pour l'établissement ;
2° Des services de secours d'urgence ; 3° De l'inspection du travail compétente
ainsi que le nom de l'inspecteur compétent. »

Verbatim du dernier alinéa de `R. 4121-4` : « Un avis indiquant les modalités
d'accès des travailleurs au document unique est affiché à une place convenable
et aisément accessible dans les lieux de travail. Dans les entreprises ou
établissements dotés d'un règlement intérieur, cet avis est affiché au même
emplacement que celui réservé au règlement intérieur. »

### Domaine `locaux_sociaux` — 4 obligations

| Obligation | Fondateur | Version lue | Seuil |
|---|---|---|---|
| `locaux-etablissement-installations-sanitaires` | `R. 4228-1` | 2008-05-01 | — |
| `locaux-etablissement-eau-potable` | `R. 4225-2` | **2025-06-02** | — |
| `locaux-etablissement-local-restauration` | `R. 4228-22` | 2020-01-02 | `effectifMin: 50` |
| `locaux-etablissement-emplacement-restauration` | `R. 4228-23` | 2020-01-02 | `effectifMax: 49` |

`R. 4225-2` porte la version la plus récente de tout le lot : réécrit par le
décret n° 2025-482 du 27 mai 2025. La rédaction antérieure ne portait pas « et se
rafraîchir » ; l'encoder de mémoire aurait cité un texte abrogé.

### Domaine `co_activite` — 1 obligation

`co-activite-etablissement-protocole-securite`, fondée sur `R. 4515-4`
(2008-05-01), avec `R. 4515-1`, `R. 4515-9` et `R. 4515-11` en contexte.
Criticité 4 — la seule du lot au-dessus de 3.

### Ajouts aux domaines du lot 7 — 5 obligations

| Obligation | Domaine | Fondateur | Version lue | Porteur |
|---|---|---|---|---|
| `sante-travail-etablissement-adhesion-spst` | `sante_travail` | `L. 4622-1` | 2022-03-31 | établissement |
| `sante-travail-etablissement-fiche-entreprise` | `sante_travail` | `R. 4624-46` | 2022-04-28 | établissement |
| `formation-securite-etablissement-manutention` | `formation_securite` | `R. 4541-8` | 2008-05-01 | établissement |
| `formation-securite-etablissement-travail-sur-ecran` | `formation_securite` | `R. 4542-16` | 2008-05-01 | établissement |
| `formation-securite-salarie-cse-sst` | `formation_securite` | `L. 2315-18` | 2022-03-31 | **salarié** |

---

## 3. Les trois questions de modélisation, tranchées

### Q1 — La nature d'un affichage

**État permanent, `periodicite: "autre"`**, suivant le précédent de
l'habilitation électrique. Aucun des deux articles d'affichage n'écrit de durée.

Une nuance qui n'était pas dans la question : un affichage n'est pas pour autant
une obligation qui se solde une fois. Le nom de l'inspecteur du travail change,
l'adresse du service de santé au travail aussi. C'est dit dans le libellé et la
description de l'obligation ; **l'outil ne fabrique pas d'échéance pour
l'imposer**, faute de texte qui en écrive une.

### Q2 — Le seuil d'effectif : déclencheur ou condition ?

**Ni l'un ni l'autre : un critère de typologie, et le mécanisme existait déjà.**

`TypologieApplication` porte `effectifMin` et `effectifMax` depuis l'ADR-004, et
`matching/engine.ts:223` les évalue en ET avec le reste. Les quatre obligations à
seuil de ce lot s'écrivent donc `typologies: { travail: true, effectifMin: 11 }`
et rien de plus.

Aucun sixième déclencheur, aucun nouveau type de `ConditionApplication`. Le
second aurait d'ailleurs été le mauvais outil : `conditions` porte des propriétés
d'**équipement** et vaut `never` sur le porteur établissement, ce qui est
cohérent — un effectif n'est pas une propriété d'équipement.

**Ce que le produit ne sait pas faire, et qui est écrit plutôt que simulé.**
`L. 2311-2` et `L. 1311-2` datent tous deux leur obligation par une durée de
douze mois à compter du franchissement du seuil. Le modèle ne porte que
`Etablissement.effectifSurSite`, un effectif courant : il n'historise aucune
variation, donc rien ne permet de calculer cette date. **La ligne apparaît au
franchissement constaté** — en avance sur l'échéance légale, jamais en retard.
L'inverse aurait supposé de fabriquer une date depuis un historique inexistant.

**Un faux négatif connu, signalé et non comblé.** `L. 2311-2` compte l'effectif
de l'**entreprise** ; le moteur évalue `effectifSurSite`, celui de
l'établissement. Pour une TPE mono-site — la cible — les deux coïncident. Pour
une entreprise de quinze personnes réparties sur deux sites de sept et huit, la
ligne CSE n'apparaîtra pas. Le corriger suppose un effectif d'entreprise agrégé
que le modèle ne porte pas. De même, `R. 4228-22` et `R. 4228-23` renvoient au
décompte de `L. 130-1` du code de la sécurité sociale — moyenne sur l'année civile
précédente — là où le moteur lit un effectif courant : autour du seuil de
cinquante, les deux peuvent diverger, mais l'une ou l'autre des deux lignes
s'affichera toujours, jamais aucune.

### Q3 — Le porteur

Le critère appliqué est celui que le lot 7 a posé : **une formation devient un
titre de salarié quand le texte la date par personne et lui fait produire une
pièce nominative** — et, condition qui s'est révélée décisive, quand le produit
sait à qui l'attribuer.

| Obligation | Porteur retenu | Pourquoi |
|---|---|---|
| Salarié désigné (`L. 4644-1`) | établissement | Le texte impose de **désigner** : acte de l'employeur, une ligne par établissement |
| Formation du désigné et du CSE (`L. 2315-18`) | **salarié** | Mandat nominatif, durée par personne, et le dirigeant sait qui a été élu ou désigné |
| Manutention (`R. 4541-8`) | établissement | Aucune durée, aucune pièce, et « les travailleurs dont l'activité comporte » n'est pas une population que le produit sait nommer |
| Travail sur écran (`R. 4542-16`) | établissement | Daté par personne, mais aucune pièce, et même impossibilité de nommer qui |
| Fiche d'entreprise (`R. 4624-46`) | établissement | Réalisée par un tiers, due par l'employeur — le régime des vérifications par organisme agréé |

**Le cas qui aurait pu faire deux obligations et n'en fait qu'une.**
`L. 4644-1` renvoie la formation du salarié désigné « aux conditions prévues aux
articles L. 2315-16 à L. 2315-18 » : même régime, même contenu, mêmes durées que
la formation des membres du CSE. Écrire deux lignes aurait posé **deux
obligations sur le même article fondateur `L. 2315-18`**, ce que le test
anti-doublon attrape à juste titre. Il y a donc une seule ligne de catalogue, dont
le libellé nomme les deux qualités, et les deux obligations d'établissement
(`salarie-designe`, `cse`) y renvoient par une `Transmission` — l'usage prévu par
l'ADR-024 : nommer ce que l'obligation implique ailleurs sans le dériver.

**Le cas qui fait bien deux obligations.** `R. 4228-22` et `R. 4228-23` ne sont
pas une règle et son exception : ce sont deux régimes qui se partagent tout
l'espace au seuil de cinquante, et ce qu'ils imposent diffère — un **local**
équipé d'un côté, un simple **emplacement** de l'autre. En écrire une seule ligne
aurait obligé à taire l'un des deux, et c'est celui de la cible du produit qu'on
aurait tu.

**Ce que le porteur établissement coûte, et je le dis.** Sur la manutention et
l'écran, l'outil ne saura jamais **qui** a été formé — donc rien ne se prouve
nominativement en contrôle. C'est une perte réelle, préférée au faux négatif muet
d'un titre que personne ne sait attribuer (aucune ligne tant que le dirigeant
n'aurait pas deviné). Elle se rattrapera le jour où le cinquième déclencheur
existera.

---

## 4. Les quatre périodicités qu'il ne fallait pas inventer

Le brief prévenait ; voici les quatre endroits où le piège s'est effectivement
présenté.

1. **La fiche d'entreprise.** `R. 4624-46` écrit « établit **et met à jour** »,
   sans rythme. On lit couramment « tous les quatre ans » ou « à chaque
   changement notable ». Aucun n'est dans l'article. Et `R. 4624-47` — « la fiche
   est établie dans l'année qui suit l'adhésion » — est un **délai de départ**,
   pas une périodicité.

2. **La formation santé-sécurité du CSE.** `L. 2315-18` porte des chiffres, cinq
   jours et trois jours, mais ils comptent des **jours de stage** et non des
   années entre deux formations. Le rythme réel suit le mandat, qui dure quatre
   ans par défaut (`L. 2314-33`) mais qu'un accord peut ramener à deux — et que
   le produit ne modélise pas. Encoder `quadriennale` aurait fabriqué une
   échéance à partir d'une durée par défaut : le « triennal » d'origine NF avec
   un autre visage.

3. **L'eau potable.** `R. 4225-2` n'écrit ni analyse, ni prélèvement, ni durée.
   Les rythmes d'analyse d'eau relèvent du Code de la santé publique et du carnet
   sanitaire, que ce produit sert déjà par un module dédié, sur d'autres textes.
   Une échéance ici aurait été sans texte **et** en doublon avec un module
   existant.

4. **Le protocole de sécurité.** `R. 4515-9` a la forme d'une durée sans en être
   une : le protocole « reste applicable aussi longtemps que les employeurs
   intéressés considèrent que les conditions de déroulement des opérations n'ont
   subi aucune modification significative ». C'est une **condition appréciée par
   les parties**. Une revue annuelle aurait été une prudence encodée comme du
   droit.

La formation à la manutention rejoint la liste par la bande : le « recyclage
gestes et postures tous les deux ans » qu'on lit partout n'est nulle part dans
`R. 4541-8`.

---

## 5. Ce que je n'ai pas encodé, et pourquoi

### B4 — Travail en hauteur / EPI antichute (`R. 4323-104` et s.) : **non encodée**

Deux raisons, et la première suffirait.

**La référence du brief ne dit pas ce qu'il annonce.** Les trois articles ont été
ouverts le 2026-08-31 :

- `R. 4323-104` (2008-05-01) porte l'**information** du travailleur sur les EPI
  en général — risques couverts, conditions d'utilisation, consignes, conditions
  de mise à disposition ;
- `R. 4323-105` (2018-01-01) porte la **consigne d'utilisation** écrite, tenue à
  la disposition du CSE ;
- `R. 4323-106` (2008-05-01) porte la **formation au port**, « renouvelée aussi
  souvent que nécessaire » — donc sans périodicité.

**Aucun des trois ne parle de travail en hauteur ni d'antichute.** Le travail en
hauteur relève de `R. 4323-58` et suivants, qui n'ont pas été ouverts. Le brief
conflait deux sujets ; c'est `R. 4323-106` qui aurait fondé une obligation de
formation aux EPI, pas `R. 4323-104`.

**Et les EPI sont hors périmètre déclaré.** `.claude/CLAUDE.md` les liste parmi
les registres non couverts, et le brief lui-même le rappelle dans « Ce qu'on ne
fait pas » — tout en portant B4 dans sa liste des quinze. C'est une contradiction
interne au brief, pas une décision que je pouvais prendre seul. Conformément à la
consigne — « si tu croises une obligation qui te semble devoir y entrer,
signale-la, ne l'encode pas » —, la ligne est **signalée et non encodée**, et la
carto est corrigée avec ce que disent réellement les trois articles.

### `R. 4225-3` — boisson non alcoolisée gratuite : **`obligation_manquante`**

L'article impose deux actes réels : mettre gratuitement une boisson à
disposition, et tenir la liste des postes concernés après avis du médecin du
travail et du CSE. Il n'est pas encodé parce que son champ — « lorsque des
conditions particulières de travail conduisent les travailleurs à se désaltérer
fréquemment » — suppose une qualification que ni le parc d'équipements ni le code
NAF ne donnent. Il est décrit dans la description de l'obligation sur l'eau
potable, où il informe sans produire de ligne, et compté au corpus comme
obligation manquante avec son `bloquePar`.

Il est classé `obligation_manquante` et **non** `non_couvert` délibérément : ce
n'est pas un choix produit de ne pas le porter, c'est un mécanisme qui manque.
Accessoirement, le cliquet des manques non déclarés est saturé à 27 sur 27, et un
28ᵉ `non_couvert` sans adresse visible l'aurait fait tomber — mais ce n'est pas
la raison du classement, c'est une conséquence heureuse d'un classement juste.

### Ce qui n'a pas été lu, et se dit plutôt que de se taire

- `R. 4228-2` à `R. 4228-18` (aménagement des sanitaires) — **non ouverts**. La
  description de l'obligation les résume d'après les intitulés de sous-sections,
  pas d'après leur texte, et le corpus le dit. Le nettoyage quotidien qu'on
  attribue couramment à `R. 4228-13` n'est donc ni vérifié ni encodé.
- `R. 4515-8` (échange préalable) — **non ouvert**, connu par le renvoi de
  `R. 4515-10`. Marqué `non_depouille` au corpus, ce qui empêche le chapitre de
  se déclarer intégral.
- `R. 4542-3` (analyse des postes) et `R. 4542-17` (examen ophtalmologique) —
  **non ouverts**.
- `R. 4624-48` à `R. 4624-50` (transmission de la fiche, présentation au CSE,
  modèle par arrêté) — **non ouverts**, connus par le sommaire de la
  sous-section, ce qui ne vaut pas lecture.
- L'arrêté de `R. 4541-6` (facteurs individuels de risque) et l'arrêté de
  `R. 4228-23` (contenu de la déclaration de dérogation) — **non recherchés**.
- `L. 2314-1` (désignation du référent harcèlement) — **non ouvert**. Le référent
  partage la formation de `L. 2315-18`, sa désignation n'est portée par aucune
  obligation.

---

## 6. Trois erreurs du brief, corrigées après lecture

Le brief prévenait que ses références venaient d'un document de travail. Trois se
sont révélées fausses, et chacune aurait produit une obligation inexacte.

### `R. 4224-16` n'est pas un affichage — et la correction a servi au lot 7

Le brief l'annonçait comme « consignes de premiers secours affichées ». Le texte
(version du 2021-02-13) n'écrit ni « consignes » ni « affiche » : il impose des
mesures d'organisation prises après avis du médecin du travail, et « **consignées
dans un document tenu à la disposition de l'agent de contrôle de l'inspection du
travail** ».

L'affichage des secours existe bien, mais c'est le **2° de `D. 4711-1`** —
l'adresse et le numéro des services de secours d'urgence — donc déjà couvert par
`information-etablissement-affichages-obligatoires`. Encodé comme le brief
l'écrivait, ce lot aurait posé **deux fois l'affichage et zéro fois le
document** : un faux positif et un faux négatif dans la même ligne.

Le verbatim relevé ici a été transmis au lot 7, qui portait la section
`R. 4224-14` à `-16`. L'obligation est la sienne — `secours-etablissement-mesures`
— et ce lot ne la double pas.

### Le protocole de sécurité ne se fonde pas sur l'arrêté de 1996

L'arrêté du 26 avril 1996 existe et il est à l'origine du dispositif. Sa version
initiale a été lue (JORFTEXT000000548018) : il a été pris « en application de
l'article **R. 237-1** du code du travail » et son article 2 renvoie aux
« articles **R. 237-7** et suivants » — la numérotation d'avant la recodification
de 2008, qui ne résout plus. Le dispositif vit aujourd'hui aux articles
`R. 4515-1` à `R. 4515-11`. C'est cette référence qui est encodée.

### Le règlement intérieur n'entre pas dans le périmètre par `L. 1311-2`

Le brief citait `L. 1311-2` seul. Ouvert, cet article dit **quand** un règlement
intérieur est dû — cinquante salariés, plus douze mois — et rien de son contenu.
Ce qui fait entrer le règlement intérieur dans le périmètre santé-sécurité de
Rojer, c'est `L. 1321-1` **1°**. La convention d'ordre de `referencesLegales` veut
que l'index 0 soit l'article qu'on citerait seul devant un inspecteur : c'est
`L. 1321-1`, et `L. 1311-2` suit en contexte parce qu'il porte le seuil.

### Une quatrième référence, vérifiée et écartée

`L. 4622-7` est couramment cité comme l'article de l'adhésion à un service de
prévention et de santé au travail. Ouvert, il traite de la **responsabilité des
dirigeants** du groupement qui assure le service, pas de l'obligation de
l'employeur. Le fondateur reste `L. 4622-1`, complété par `D. 4622-1` et
`D. 4622-2` qui donnent au verbe « organisent » son contenu. L'article est
consigné au corpus en `sans_objet`, précisément pour que le prochain lecteur ne
refasse pas le détour.

---

## 7. Un écart de modèle, signalé et non comblé

**Le réalisateur de la fiche d'entreprise n'a pas de valeur juste.**
`R. 4624-46` confie la fiche « au médecin du travail **ou**, dans les services de
prévention et de santé au travail interentreprises, à l'**équipe
pluridisciplinaire** ». Or l'équipe pluridisciplinaire de `L. 4622-8` est plus
large que les professionnels de santé : elle comprend les intervenants en
prévention des risques professionnels, qui ne sont pas des soignants. La valeur
`professionnel_sante_travail` ajoutée par le lot 7 — définie comme « l'un des
professionnels de santé mentionnés au premier alinéa de `L. 4624-1` » — les
exclut.

La valeur juste serait `equipe_pluridisciplinaire`, qui n'existe pas. L'ajouter
suppose une migration Prisma sur l'enum `Realisateur`, qui relève du lot 7 et non
de celui-ci. Le repli retenu est `["medecin_travail", "professionnel_sante_travail"]`
— le moins faux des deux disponibles, et il désigne bien un tiers du service et
non l'exploitant. **C'est la cible du produit qui est concernée** : une TPE adhère
à un service interentreprises, donc c'est l'équipe et non le médecin seul qui
établit sa fiche.

**Une incohérence de seuil, assumée et signalée.**
`formation-securite-salarie-cse-sst` porte `effectifMin: 11`, parce qu'un CSE
n'existe pas en deçà et qu'un catalogue proposant un titre CSE à une entreprise
de trois personnes serait faux. Mais le **salarié désigné compétent** de
`L. 4644-1` est dû dès le premier salarié, et sa formation relève de la même
ligne. Un employeur de six personnes doit donc désigner quelqu'un sans que la
ligne de catalogue de sa formation lui soit proposée.

Deux façons d'en sortir : retirer le seuil, au prix d'un titre CSE proposé à des
entreprises sans CSE ; ou scinder en deux lignes, au prix d'un doublon sur
`L. 2315-18`. J'ai retenu le seuil et **je signale le trou plutôt que de le
combler par une ligne fausse**. C'est un arbitrage à reprendre, pas une décision
définitive.

**Un écart déjà connu, que ce lot rencontre à son tour.** Le protocole de
sécurité attend un écrit daté et signé à deux parties, tenu à disposition de
l'inspection ; le produit n'offre qu'un dépôt de fichier. Même configuration que
`R. 4227-39` (registre des exercices) et `R. 4224-16`. **Aucune transmission
`modele_absent` n'est déclarée** : `docs/registre-securite-ecart.md` recense les
modèles manquants sous des noms précis, et en inventer un sans avoir vérifié
cette nomenclature créerait une référence fantôme. Point à instruire, pas
décision prise.

---

## 8. Les corpus

Six créés, tous `articles_cites`, chacun disant dans sa `portee` ce qu'il laisse
non lu. Un septième complété.

| Corpus | Articles | Dont non dépouillés |
|---|---|---|
| `code-travail-organisation-prevention` | 5 | 0 |
| `code-travail-information-travailleurs` | 2 | 0 |
| `code-travail-locaux-sociaux` | 5 | 0 (1 `obligation_manquante`) |
| `code-travail-co-activite` | 9 | 1 (`R. 4515-8`) |
| `code-travail-service-prevention-sante` | 4 | 0 (1 `sans_objet`) |
| `code-travail-manutention-ecran` | 2 | 0 |
| `code-travail-sante-travail` (lot 7) | +2 | 0 |

Trois articles sont classés `sans_objet` dans le corpus de co-activité —
`R. 4515-5`, `-6`, `-7` — parce qu'ils décrivent le **contenu** du protocole et
non un acte distinct. Les classer `retenu` aurait rompu le lien bidirectionnel
que `liensRetenusRompus()` vérifie : un article retenu doit être cité par
l'obligation qu'il désigne.

---

## 9. Garanties éprouvées en réinjectant le défaut

Un test qui n'a jamais échoué ne prouve rien. Trois ont été cassés puis restaurés.

| Garantie | Défaut injecté | Résultat |
|---|---|---|
| `aucun_tiers_attendu` ne couvre pas une obligation à réalisateur tiers | `realisateurs: ["organisme_agree"]` sur l'affichage de `D. 4711-1` | **tombe** — `domaines.test.ts`, message explicite |
| Le cliquet du corpus | l'obligation de co-activité cite `R. 4515-8`, non dépouillé | **tombe deux fois** — lien bidirectionnel rompu, et plafond 0 dépassé |
| L'anti-doublon | `R. 4228-23` posé en fondateur des deux obligations de restauration | **tombe** — `conformite.test.ts` |

---

## 10. Vérification

```
pnpm vitest run   → 1746 tests verts (123 fichiers)
npx tsc --noEmit  → propre
npx eslint src    → 1 avertissement, préexistant (normaliserFormData)
```

`REFERENTIEL_VERSION` passe à `2026-08-31.2`, `EMPREINTE_ATTENDUE` à
`113-8ac86f99169f49a5`.

---

## 11. Fichiers de compte partagés avec les autres lots

Trois lots touchent les mêmes assertions le même jour. Conformément à
l'avertissement de la session de coordination, **aucun commentaire écrit ici
n'annonce un total** : chacun dit ce que ce lot ajoute, et rien de plus.

| Fichier | Ce que ce lot y écrit |
|---|---|
| `conformite.test.ts` | +15 obligations, détaillées par domaine ; compte porté à 113, empreinte recalculée |
| `chez-vous.test.ts` | +4 domaines dans la liste exhaustive (`co_activite`, `information_travailleurs`, `locaux_sociaux`, `organisation_prevention`) |
| `frontiere-medicale.test.ts` | +1 ligne (`formation-securite-salarie-cse-sst → pieceMedicale: false`) |
| `corpus.test.ts` | +1 obligation manquante (`R. 4225-3`) |
| `.claude/CLAUDE.md` | comptes, porteurs, corpus, et les deux corrections de référence |
| `Cadran.tsx`, `Etapes.tsx` | 113 obligations · 17 domaines |
| `REFERENTIEL_VERSION` | `2026-08-31.2` — à trancher à l'intégration, deux autres lots posent la leur |

`docs/carto-obligations-hors-equipement.md` est corrigé sur seize lignes : A2, A6,
A7, A8, **A12** (l'erreur d'affichage), A14, A18, A19, B1, B2, B4, B5, E4, E5, E6
et E14. Les trois corrections de référence du § 6 y figurent avec leur raison,
pour que personne ne relance dans trois semaines une obligation d'affichage qui
n'en est pas une.
