# Rapport — lot 8, le socle de l'employeur, l'activité et l'effectif

Branche `feat/socle-employeur`, rebasée sur `feat/depouillement-salarie` (lot 7),
corrections comprises (`17aa358`).
Dépouillement du 2026-08-31, toutes lectures sur Légifrance, `lecture: "agent_verbatim"`.

**Seize obligations encodées, 31 articles consignés au corpus — plus quatre lus
sans être encodés —, six corpus créés, quatre domaines ajoutés.** Une ligne du
brief n'est pas encodée et la raison est au § 5. Une autre a été retirée en cours
de route, le lot 7 l'ayant livrée.

> **Ce rapport a été corrigé après une relecture.** Sa première version annonçait
> quinze obligations et **quinze périodicités `autre` sur quinze**, en affirmant
> qu'aucun texte lu n'écrivait de durée. C'était faux, et le § 6 bis dit
> pourquoi : `L. 4644-1` renvoie aux articles `L. 2315-16` **à** `L. 2315-18`, et
> seul le dernier avait été ouvert. La lecture des deux autres a changé une
> périodicité et le découpage d'une obligation.

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

Chiffres **revérifiés après le rebasage sur les corrections du lot 7** (`17aa358`,
qui porte sa base de 98 à 100 obligations). Ils n'ont pas bougé : les deux
obligations que le lot 7 a ajoutées sont portées par un salarié, et le porteur
salarié ne franchit pas le moteur de matching (ADR-023).

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

**Quinze périodicités `autre` sur seize.** La seule chiffrée est la formation
santé-sécurité du membre du CSE, `quadriennale` par `L. 2315-17`. Les autres
chiffres des textes lus sont des seuils d'effectif (11, 50), des délais d'entrée
en obligation (douze mois) et des durées de stage (cinq jours, trois jours) —
aucun n'est un rythme. Le § 4 détaille les quatre endroits où un chiffre aurait
pu être pris pour un rythme, et le § 6 bis celui où j'avais d'abord pris un
rythme pour rien.

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
| `formation-securite-salarie-designe-competent` | `formation_securite` | `L. 4644-1` I al. 2 | 2022-03-31 | **salarié** |

`formation-securite-salarie-cse-sst` est la **seule obligation chiffrée du lot** :
`quadriennale`, fondée sur `L. 2315-17` (version du **2026-05-28**) — « Ces
formations sont renouvelées lorsque les représentants ont exercé leur mandat
pendant quatre ans, consécutifs ou non. » Elle porte `effectifMin: 11`.
`formation-securite-salarie-designe-competent` cite le même article et porte
`autre` : voir § 6 bis.

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

**Le cas qui fait bien deux obligations, après m'être trompé une fois.**
J'ai d'abord écrit une seule ligne de catalogue pour la formation du membre du CSE
et celle du salarié désigné, au motif que `L. 4644-1` renvoie « aux conditions
prévues aux articles L. 2315-16 à L. 2315-18 ». La relecture des **trois** articles
du renvoi — je n'avais ouvert que le dernier — a montré que ce sont **deux actes
sous un même régime**. L'argument complet est au § 6 bis ; son indice décisif est
que `L. 2315-17` écrit son renouvellement en termes de « représentants » ayant
« exercé leur mandat », ce qu'un salarié **désigné** n'est ni ne fait.

Les deux lignes ont donc des articles fondateurs différents — `L. 2315-18` pour le
CSE, `L. 4644-1` I alinéa 2 pour le désigné — et il n'y a pas de doublon entre
elles. Il y en a un, en revanche, entre `prevention-etablissement-salarie-designe`
et `formation-securite-salarie-designe-competent`, qui partagent `L. 4644-1` : le
test ne sait pas distinguer deux alinéas, et la paire est déclarée dans
`PAIRES_DECLAREES` avec sa raison, comme la paire `R. 4222-20` avant elle.

Les deux obligations d'établissement (`salarie-designe`, `cse`) renvoient chacune
au titre qui la prolonge par une `Transmission` — l'usage prévu par l'ADR-024 :
nommer ce que l'obligation implique ailleurs sans le dériver.

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

**Et le cinquième, celui qui existe vraiment.** `L. 2315-17` écrit « Ces formations
sont renouvelées lorsque les représentants ont exercé leur mandat pendant quatre
ans, consécutifs ou non ». Ce chiffre-là est dans le Code, il porte sur le
renouvellement de la formation, et la première version de ce lot l'a **tu** faute
d'avoir ouvert l'article. C'est l'erreur symétrique de celles qu'on surveille ici :
non pas afficher une échéance que le droit ne donne pas, mais effacer une échéance
qu'il donne. Une échéance absente est moins visible qu'une échéance fausse, et pas
moins fautive. Voir § 6 bis.

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

### Une quatrième référence, vérifiée et écartée — et la vérification a resservi

`L. 4622-7` est couramment cité comme l'article de l'adhésion à un service de
prévention et de santé au travail. Ouvert, il traite de la **responsabilité des
dirigeants** du groupement qui assure le service, pas de l'obligation de
l'employeur. Le fondateur reste `L. 4622-1`, complété par `D. 4622-1` et
`D. 4622-2` qui donnent au verbe « organisent » son contenu. L'article est
consigné au corpus en `sans_objet`, précisément pour que le prochain lecteur ne
refasse pas le détour.

**Il a resservi le jour même.** Un relecteur a signalé à la session de
coordination l'inverse de ce constat, la coordination l'a relayé sans ouvrir
l'article, et le lot 7 a retiré une citation juste sur cette base. C'est
l'entrée `sans_objet` — celle qui écrit ce qui **n'est pas** la bonne référence —
qui a permis de rattraper l'aller-retour. Une vérification négative ne coûte
qu'une entrée de corpus et elle vaut exactement ce que vaut le détour qu'elle
épargne.

### Le libellé disait « adhésion » là où le texte dit « organisent »

Corrigé après la même contre-vérification. `L. 4622-1` écrit « Les employeurs
**organisent** des services de prévention et de santé au travail ». L'adhésion à
un service interentreprises est **une modalité** de cette organisation — l'autre
étant le service autonome (`D. 4622-1`), le choix appartenant à l'employeur
(`D. 4622-2`) — et les articles qui règlent l'adhésion elle-même, `D. 4622-14` et
suivants, ne sont dépouillés par personne.

Le libellé affiché au calendrier devient donc « Service de prévention et de santé
au travail — adhésion ou service autonome ». Écrire « adhésion » seul aurait
resserré le texte sur une de ses deux branches et fait passer une pratique — la
bonne, pour une TPE — pour une prescription. L'identifiant garde
`adhesion-spst` : c'est une clé stable, pas une affirmation.

---

## 6 bis. Ce que ce lot s'est corrigé à lui-même

La session de coordination m'a renvoyé une question de lecture : la formation du
salarié désigné compétent et celle du membre du CSE sont-elles **le même acte**,
ou seulement le même **régime** ? Y répondre a demandé d'ouvrir deux articles que
je n'avais pas ouverts, et les deux ont corrigé le lot.

### Le défaut de méthode : un renvoi ne se lit pas par son dernier terme

`L. 4644-1` renvoie « dans les conditions prévues aux articles **L. 2315-16 à
L. 2315-18** ». J'avais lu `L. 2315-18` et considéré le renvoi épuisé. Il ne
l'était pas. C'est une variante du défaut que ce dépôt combat partout : une
référence prise sur résumé plutôt que lue en entier — sauf qu'ici le résumé était
le mien.

### Première conséquence : une périodicité existait et je l'avais tue

`L. 2315-17`, version en vigueur depuis le **2026-05-28** :

> « Les formations sont dispensées soit par un organisme enregistré auprès de
> l'autorité administrative dans les conditions prévues aux articles L. 6351-1 à
> L. 6351-8, soit par un des organismes mentionnés à l'article L. 2145-5. **Ces
> formations sont renouvelées lorsque les représentants ont exercé leur mandat
> pendant quatre ans, consécutifs ou non.** »

Le rapport annonçait « quinze périodicités `autre` sur quinze » et « aucun des
textes lus n'écrit de durée ». Les deux étaient faux. `formation-securite-salarie-cse-sst`
passe de `autre` à **`quadriennale`**.

**C'est un troisième cas de figure, après les deux du lot 7.** Le lot 7 avait des
*plafonds* — « qui ne peut excéder cinq ans » —, où le chiffre est une borne
**extérieure** : l'échéance encodée est la date au-delà de laquelle l'employeur est
nécessairement en défaut, et le risque est d'annoncer « à jour » à tort. Ici,
quatre ans de mandat exercé est une borne **intérieure** : c'est le seuil à partir
duquel le renouvellement devient dû. Et les quatre ans comptent du **mandat
exercé**, « consécutifs ou non », non du temps calendaire — un élu qui siège deux
ans, s'interrompt trois, puis siège deux ans encore les atteint au bout de sept
années civiles.

Le produit ne modélise aucun mandat : il n'a ni date d'élection, ni durée, ni
interruption. L'échéance calculée est donc **juste pour un mandat continu — le cas
ordinaire — et en avance pour un mandat interrompu**. J'ai retenu ce sens d'erreur
parce que c'est celui que le dépôt préfère explicitement : une sur-application
visible et corrigeable vaut mieux qu'un faux négatif muet. `TitreSalarie.echeanceLe`,
déclaré par l'employeur, prime de toute façon sur le calcul. Tout cela est écrit
dans `PERIODICITE_SUR_CODE_JUSTIFIEE` avec le verbatim.

**Le test l'a attrapé tout seul, et c'est à signaler.** Je ne connaissais pas
`toute périodicité chiffrée s'appuie sur un texte qui porte un chiffre`. Il a
échoué à la seconde où j'ai posé `quadriennale`, en exigeant soit le texte qui
porte le chiffre, soit le retour à `autre`. C'est une garantie qui a fonctionné
sans que personne ait eu à la déclencher exprès.

### Seconde conséquence : deux actes, donc deux obligations

La réponse à la question posée est : **deux actes sous un même régime.** Quatre
indices, dans l'ordre de leur force.

1. **Le vocabulaire du renvoi.** « Bénéficient d'une formation en matière de santé
   au travail **dans les conditions prévues** aux articles L. 2315-16 à
   L. 2315-18. » « Dans les conditions prévues » renvoie à des modalités. La
   tournure d'identité existe — « bénéficient de la formation prévue à l'article
   L. 2315-18 » — et le législateur ne l'a pas employée.

2. **L'objet diffère.** `L. 2315-18` vise « la formation nécessaire à l'exercice
   de **leurs missions** en matière de santé, de sécurité et de conditions de
   travail **prévues au chapitre II du présent titre** » — les attributions du
   CSE. Un salarié désigné n'en exerce aucune : il s'occupe « des activités de
   protection et de prévention des risques professionnels de l'entreprise ».

3. **L'indice décisif, dans `L. 2315-17`.** Son renouvellement est écrit ainsi :
   « lorsque **les représentants** ont exercé **leur mandat** pendant quatre ans ».
   Un salarié désigné n'est pas un représentant et ne détient aucun mandat :
   `R. 4644-1` (lu le 2026-08-31) le fait **désigner** par l'employeur après avis
   du CSE, il n'est pas élu. Si le renvoi valait identité d'acte, cette condition
   serait inapplicable à la moitié de ses destinataires. Elle n'est cohérente que
   si le renvoi porte sur des conditions dont chacune s'applique là où elle peut.

4. **La conséquence pratique confirme.** Le seuil de onze salariés vient de
   `L. 2311-2`, qui ne vise que le CSE. Le salarié désigné est dû **dès le premier
   salarié**. Une ligne unique obligeait à choisir entre proposer un titre CSE à
   une entreprise de trois personnes, ou priver un employeur de six personnes de
   la formation de son désigné.

**La proposition de la coordination — renommer le titre pour lever le seuil — ne
marche donc pas.** Elle supposait un acte unique ; il y en a deux. Le trou signalé
au § 7 de la première version de ce rapport est en revanche **comblé** : le
désigné a sa ligne, sans condition d'effectif, et le CSE garde légitimement son
seuil de onze.

Le même renvoi produit ainsi **deux périodicités différentes** — `quadriennale`
pour le CSE, `autre` pour le désigné — et ce n'est pas une incohérence : c'est le
texte lu de près.

---

## 7. Un écart de modèle, signalé et non comblé

**Le réalisateur de la fiche d'entreprise : signalé, puis corrigé par le lot 7.**
`R. 4624-46` confie la fiche « au médecin du travail **ou**, dans les services de
prévention et de santé au travail interentreprises, à l'**équipe
pluridisciplinaire** ». Aucune valeur de l'enum `Realisateur` ne disait cela :
`professionnel_sante_travail` désigne « l'un des professionnels de santé
mentionnés au premier alinéa de `L. 4624-1` », alors que l'équipe
pluridisciplinaire de `L. 4622-8` comprend aussi les intervenants en prévention
des risques professionnels, qui ne sont pas des soignants. Et c'est **le cas
ordinaire de la cible** : une TPE adhère à un service interentreprises, donc
c'est l'équipe et non le médecin seul qui établit sa fiche.

La ligne a d'abord porté `["medecin_travail", "professionnel_sante_travail"]`,
le moins faux des deux replis disponibles, avec l'écart écrit en `notesInternes`.
Le lot 7 a depuis ajouté `equipe_pluridisciplinaire` à l'enum, et la ligne porte
maintenant `["medecin_travail", "equipe_pluridisciplinaire"]`. L'écart est clos ;
il est raconté ici parce que c'est le seul point du lot où j'ai sciemment encodé
une valeur que je savais imprécise plutôt que d'élargir un périmètre qui n'était
pas le mien.

**Et cette obligation a un effet de bord qu'aucun de nous n'avait prévu.** Elle
est la première du référentiel à être portée par l'**établissement** — donc à
franchir le moteur de matching — tout en ayant des réalisateurs **tous tiers**.
Elle rend donc `supposeUnTiers()` vrai pour le domaine `sante_travail`, et fait
tomber le test qui fige la liste des domaines dont la contrepartie de prestataire
n'est atteinte par aucune obligation livrée. `sante_travail` quitte cette liste.

Ce n'est pas un défaut : c'est très exactement ce que le commentaire du lot 7
annonçait comme futur — « la fiche d'entreprise de `R. 4624-46`, réalisée par le
médecin du travail ou l'équipe pluridisciplinaire, en est le cas type ». Une
affirmation que le lot 7 avait dû corriger parce qu'elle était fausse chez lui
devient vraie ici. La liste **et** le commentaire ont été mis à jour ensemble,
comme la consigne du test l'exige : un dirigeant qui n'a déclaré aucun service de
santé au travail à l'annuaire s'en voit désormais averti, et `L. 4622-1` fait de
cette adhésion une obligation encodée elle aussi par ce lot.

**L'incohérence de seuil est comblée, et non plus seulement signalée.**
La première version de ce rapport laissait ouvert le fait qu'un employeur de six
personnes doive désigner un salarié compétent sans que la ligne de catalogue de sa
formation lui soit proposée — `formation-securite-salarie-cse-sst` portant
`effectifMin: 11`. Le § 6 bis l'a résolu par la lecture : ce sont deux actes, donc
deux lignes, et celle du désigné n'a pas de seuil. Le CSE garde le sien à bon
droit.

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
| `code-travail-organisation-prevention` | 8 | 0 (1 `sans_objet`) |
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

Une quatrième s'est déclenchée **sans qu'on la provoque**, et c'est la meilleure
preuve des quatre : `toute périodicité chiffrée s'appuie sur un texte qui porte un
chiffre` a échoué à la seconde où `quadriennale` a été posée, en exigeant soit le
texte porteur du chiffre, soit le retour à `autre`. Je ne connaissais pas ce test
avant qu'il tombe.

---

## 10. Vérification

```
pnpm vitest run   → 1746 tests verts (123 fichiers)
npx tsc --noEmit  → propre
npx eslint src    → 1 avertissement, préexistant (normaliserFormData)
```

`EMPREINTE_ATTENDUE` passe à `116-2d5f0304f88695bc` — 100 obligations à la base
du lot 7 corrigé, plus les seize de ce lot. `REFERENTIEL_VERSION` reste à
trancher par la session d'intégration : trois lots ont posé la même valeur.

---

## 11. Fichiers de compte partagés avec les autres lots

Trois lots touchent les mêmes assertions le même jour. Conformément à
l'avertissement de la session de coordination, **aucun commentaire écrit ici
n'annonce un total** : chacun dit ce que ce lot ajoute, et rien de plus.

| Fichier | Ce que ce lot y écrit |
|---|---|
| `conformite.test.ts` | +16 obligations, détaillées par domaine ; compte porté à 116, empreinte recalculée ; une paire déclarée (`L. 4644-1`) et une périodicité justifiée (`L. 2315-17`) |
| `chez-vous.test.ts` | +4 domaines dans la liste exhaustive (`co_activite`, `information_travailleurs`, `locaux_sociaux`, `organisation_prevention`) |
| `frontiere-medicale.test.ts` | +2 lignes (les deux titres de formation, `pieceMedicale: false`) |
| `corpus.test.ts` | +1 obligation manquante (`R. 4225-3`) |
| `.claude/CLAUDE.md` | comptes, porteurs, corpus, et les deux corrections de référence |
| `Cadran.tsx`, `Etapes.tsx` | 116 obligations · 17 domaines |
| `domaines.ts`, `domaines.test.ts` | `sante_travail` quitte la liste des domaines inatteignables — voir § 7 |
| `REFERENTIEL_VERSION` | `2026-08-31.2` — à trancher à l'intégration, deux autres lots posent la leur |

`docs/carto-obligations-hors-equipement.md` est corrigé sur seize lignes : A2, A6,
A7, A8, **A12** (l'erreur d'affichage), A14, A18, A19, B1, B2, B4, B5, E4, E5, E6
et E14. Les trois corrections de référence du § 6 y figurent avec leur raison,
pour que personne ne relance dans trois semaines une obligation d'affichage qui
n'en est pas une.
