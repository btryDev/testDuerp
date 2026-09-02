# Dénominateur — Livre II de l'arrêté du 25 juin 1980 (ERP du 1er groupe)

**Document de constat. Il ne recommande rien, n'arbitre rien, et ne modifie aucun
fichier de `src/`.** Établi le **2026-09-03**, sur la donnée officielle consolidée
de la DILA, à jour du 2026-09-02.

Il répond à une question et une seule : *18 articles cités, sur combien ?*

---

## 1. Les chiffres, en tête

| Grandeur | Entrées au plan | Articles numérotés |
|---|--:|--:|
| **Livre II entier** | **799** | **794** |
| — Titre Ier, dispositions générales (GE, CO, AM, DF, CH, GZ, EL, EC, AS, GC, MS) | 313 | **312** |
| — Titre II, dispositions particulières (14 chapitres de type) | 486 | 482 |
| **Sous-total d'un restaurant de type N** (Titre Ier + chapitre N) | 333 | **332** |
| **Sous-total d'un commerce de type M** (Titre Ier + chapitre M) | 371 | **370** |
| *Pour mémoire, un bureau de type W* (Titre Ier + chapitre W) | 329 | 328 |

L'écart entre les deux colonnes tient à **cinq entrées du Livre II qui ne sont pas
des articles numérotés** : un « Appendice » au chapitre Ier (GE), deux « Annexe I »
et « Annexe II » au chapitre du type O, une « Annexe » au chapitre du type T, une
« Annexe » au chapitre du type X. Les deux comptes sont donnés parce que Légifrance
les liste comme des articles, et qu'un lecteur qui recompte doit retrouver le même
nombre que moi.

**Les 18 articles cités par `arrete-1980-livre-2.ts` représentent :**

| Rapporté à | Proportion |
|---|--:|
| Livre II entier (794 art.) | **2,3 %** |
| Titre Ier seul (312 art.) | 5,8 % |
| **Sous-total type N (332 art.)** | **5,4 %** |
| Sous-total type M (370 art.) | 4,9 % |
| Chapitre du type N (20 art.) | **0 %** |
| Chapitre du type M (58 art.) | **0 %** |

**Les 18 sont tous au Titre Ier. Aucun ne vient d'un chapitre de type.**

Et sur la seule matière qui produit une échéance :

| | Articles portant un rythme | Cités par le référentiel |
|---|--:|--:|
| Livre II entier | 27 (26 art. + 1 annexe) | 12 |
| **Titre Ier** | **19** | **12 — soit 63 %** |
| Chapitre du type N | **0** | — |
| Chapitre du type M | **0** | — |
| **Périmètre d'un restaurant de type N** | **19** | **12 — soit 63 %** |

---

## 2. Méthode

### 2.1 Ce qui a été ouvert

| # | Source | Nature | Ce qu'elle apporte |
|---|---|---|---|
| A | **Jeu de données LEGI, DILA** — `Freemium_legi_global_20250713-140000.tar.gz` sur `https://echanges.dila.gouv.fr/OPENDATA/LEGI/` | Donnée officielle consolidée (le jeu dont le site Légifrance est le rendu) | La structure complète du texte `LEGITEXT000020303557` / `JORFTEXT000000290033` : 442 fichiers de section, 1 931 fichiers d'article |
| B | **417 livraisons incrémentales LEGI**, du `LEGI_20250715-205701` au `LEGI_20260902-210756`, même serveur | Même donnée officielle, mises à jour quotidiennes | **44 d'entre elles touchent ce texte.** Appliquées en séquence sur A, elles portent le texte du 2025-07-13 au **2026-09-02** |
| C | `legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/…` — pages de section, ouvertes le 2026-09-03 | Rendu public du même corpus | Recoupement indépendant de quatre bornes (voir § 2.4) |
| D | `src/lib/referentiels/corpus/arrete-1980-livre-3.ts` (dépôt) | Dépouillement intégral fait à la main sur Légifrance en août 2026 | Recoupement de la méthode entière (voir § 2.3) |

**Le site Légifrance ne répond pas à un client HTTP ordinaire** : toute requête non
navigateur reçoit la page de défi Cloudflare « Just a moment… ». C'est le même
constat que `releve-ge4-tableau.md` du 2026-09-02. C'est ce qui a décidé du passage
par la DILA plutôt que par le rendu web.

### 2.2 Ce que « compter » veut dire ici

Un article est compté s'il est **en vigueur le 2026-09-03**, au sens de la donnée
LEGI : le lien `LIEN_ART` qui le rattache à sa section porte `debut <= 2026-09-03 < fin`.
Les versions antérieures d'un même article (`MODIFIE`), les versions futures
(`VIGUEUR_DIFF` dont le `debut` est postérieur à aujourd'hui), les articles annulés
et les « morts-nés » sont exclus.

Le parcours part de la section racine `LEGISCTA000020303815` et descend récursivement,
en n'entrant que dans les sous-sections elles-mêmes en vigueur au même sens. **Aucune
page de sommaire n'a été lue** : la structure est reconstituée section par section
depuis les fichiers, ce qui est exactement la parade au piège du § 2.5.

Les fichiers de section ne sont pas repris tels quels : 442 fichiers existent sur
disque pour 404 sections effectivement atteignables, la différence étant des versions
de section périmées que le parcours ne visite pas. C'est ce qui explique l'écart
entre 1 223 liens d'articles marqués « VIGUEUR » sur disque et **1 164 articles
effectivement en vigueur dans l'arbre vivant** du texte entier.

### 2.3 La méthode a été éprouvée avant d'être crue

Le Livre III est dépouillé `integral` dans le dépôt, à la main, sur Légifrance, en
août 2026. Le même parcours automatique appliqué au Livre III rend **58 entrées** :
`PE 1` à `PE 37`, `PO 1` à `PO 13`, l'« Annexe à l'article PO 11 », `PU 1` à `PU 6`,
`PX 1`. Le corpus du dépôt en compte 59, et **la comparaison terme à terme ne fait
apparaître aucun écart de fond** : les 58 entrées de la DILA sont toutes au corpus,
et la 59ᵉ du corpus est une seconde entrée pour `PO 1 § 3`, c'est-à-dire un paragraphe
isolé du même article, pas un article de plus.

Un dépouillement humain et le parcours automatique tombent donc sur exactement le
même ensemble. C'est la garantie qui autorise à publier le chiffre de 794.

Second contrôle, sur la fraîcheur : le corpus donne `PE 4` dans sa rédaction issue
de l'arrêté du 1er décembre 2025, applicable au 1er juillet 2026, dont le § 2 commence
par « **Tous les trois ans au plus** ». Le jeu global du 2025-07-13, seul, rend une
version de `PE 4` **sans cette phrase**. Après application des 44 livraisons
incrémentales, il la rend. La chaîne de mise à jour fonctionne, et la mesure porte
bien sur le droit d'aujourd'hui — pas sur celui d'il y a quatorze mois.

### 2.4 Recoupement indépendant sur le rendu Légifrance

Quatre bornes ont été relevées le 2026-09-03 sur les pages de section, en demandant
l'intitulé affiché et rien d'autre :

- « Chapitre III : Etablissements du type "N" Restaurants et débits de boissons
  (Articles N 1 à N 20) », **liste complète relevée : N 1 à N 20, soit 20** — identique
  au compte DILA ;
- « Chapitre II : Construction. (Articles CO 1 à CO 61) » — identique ;
- « Chapitre XI : Moyens de secours contre l'incendie (Articles MS 1 à MS 75) » —
  borne haute identique (la DILA compte 73 articles en vigueur : `MS 26` et `MS 27`
  n'y figurent plus) ;
- « Titre Ier : Dispositions générales. (Articles GE 1 à MS 75) » et « Titre II :
  Dispositions particulières. (Articles L 1 à J 40) » — bornes identiques, et
  l'« Appendice » du chapitre Ier apparaît bien dans l'intitulé rendu par Légifrance
  (« Articles GE 1 à Appendice »), ce qui confirme qu'il est listé comme un article.

### 2.5 Les deux pièges du brief, rencontrés

**Le plan tronqué : constaté, deux fois.** La page du Titre Ier rend son sommaire et
s'arrête après le chapitre II ; celle du Titre II s'arrête après le chapitre Ier.
La page de plan du texte entier, elle, rend les livres et les onze chapitres du
Titre Ier, puis résume le Titre II d'une ligne. **Aucun de ces sommaires n'a servi
au comptage.**

**L'intitulé inventé : constaté une fois, et ce n'est pas un intitulé mais une liste.**
Interrogée sur le chapitre du type M, la récupération de page a rendu une liste
« M 1 … M 49 » contiguë comportant un **M 23** qui n'est pas en vigueur, en signalant
elle-même que la page était tronquée. Cette liste n'est pas retenue. Le chapitre M
compte **58 articles** à la DILA — `M 23` absent, `M 50-1` présent — et sa borne haute
`M 58` est cohérente avec l'intitulé affiché.

---

## 3. Le dénominateur, et ce qu'il contient

### 3.1 Le Livre II, chapitre par chapitre

**Titre Ier — Dispositions générales (313 entrées, 312 articles)**

| Chapitre | Articles | Numéros |
|---|--:|---|
| Ier : Généralités. | 11 | GE 1 à GE 10, plus « Appendice » |
| II : Construction. | 61 | CO 1 à CO 61 |
| III : Aménagements intérieurs, décoration et mobilier. | 20 | AM 1 à AM 20 |
| IV : Désenfumage. | 10 | DF 1 à DF 10 |
| V : Chauffage, ventilation, réfrigération, climatisation, conditionnement d'air… | 52 | CH 1 à CH 17 et CH 12-1, puis CH 23 à CH 29, CH 32 à CH 58 |
| VI : Installations aux gaz combustibles et aux hydrocarbures liquéfiés | 15 | GZ 1 à GZ 15 |
| VII : Installations électriques | 23 | EL 1 à EL 23 |
| VIII : Eclairage | 15 | EC 1 à EC 15 |
| IX : Ascenseurs, escaliers mécaniques et trottoirs roulants | 11 | AS 1 à AS 11 |
| X : Installation d'appareils de cuisson destinés à la restauration | 22 | GC 1 à GC 22 |
| XI : Moyens de secours contre l'incendie | 73 | MS 1 à MS 25, MS 28 à MS 75 |

**Titre II — Dispositions particulières (486 entrées, 482 articles)**

| Chapitre | Type | Articles | Borne haute |
|---|---|--:|---|
| Ier | L — salles d'audition, conférences, réunions, spectacles, usages multiples | 85 | L 85 |
| II | **M — magasins de vente, centres commerciaux** | **58** | M 58 (M 23 absent, M 50-1 présent) |
| III | **N — restaurants et débits de boissons** | **20** | N 20 |
| IV | O — hôtels et autres établissements d'hébergement | 26 | O 24, plus « Annexe I » et « Annexe II » |
| V | P — salles de danse et salles de jeux | 23 | P 24 (P 10 absent) |
| VI | R — éveil, enseignement, formation, centres de vacances et de loisirs | 29 | R 33 |
| VII | S — bibliothèques, centres de documentation | 17 | S 19 |
| VIII | T — salles d'expositions | 54 | T 52 et T 38-1, plus « Annexe » |
| IX | U — établissements de soins | 57 | U 64 |
| X | V — établissements de culte | 13 | V 13 |
| XI | **W — administrations, banques, bureaux** | **16** | W 16 |
| XII | X — établissements sportifs couverts | 28 | X 27, plus « Annexe » |
| XIII | Y — musées | 21 | Y 22 (Y 16 absent) |
| XIV | J — structures d'accueil pour personnes âgées et personnes handicapées | 39 | J 40 |

### 3.2 Ce que ce total inclut, et ce qu'il exclut

Le total de 794 couvre **les onze chapitres du Titre Ier et les quatorze chapitres de
type du Titre II**, et rien d'autre.

Il **n'inclut pas** :

- le **Livre Ier** — `GN 1` à `GN 15`, 15 articles, chapitre unique. Le brief range
  `GN` parmi les préfixes du Livre II ; c'est inexact, `GN` est le Livre Ier et
  s'applique à *tous* les ERP, 5ᵉ catégorie comprise ;
- le **Livre III** — `PE`, `PO`, `PU`, `PX`, 58 entrées ;
- le **Livre IV, établissements spéciaux** — 292 entrées : PA (13), CTS (87), SG (26),
  OA (30), REF (44), PS (43), GA (49). Le brief range **`PA` et `CTS` parmi les
  chapitres de type du Livre II** ; c'est inexact, ils sont au Livre IV. Le dépôt le
  savait déjà : `arrete-1980-livre-4-parcs.ts` place PS au Livre IV et écrit que
  « le Livre IV n'est PAS le Livre II ».

Les quatre livres réunis comptent **1 164 entrées en vigueur** (15 + 799 + 58 + 292).
Le texte porte en outre **trois articles liminaires** (« 1 », « 2 », « 3 »), rattachés au
texte et non à une section : ils sont hors de ce total, comme ils sont hors du Livre II.

---

## 4. Le sous-total qui compte : ce à quoi un dirigeant est soumis

### 4.1 Le fondement de l'addition, au verbatim

`GE 1 § 1`, relu à la source ce jour :

> « Le titre Ier comprend les prescriptions communes à tous les types d'établissements.
> Il est complété par le titre II, qui comprend les prescriptions particulières à chaque
> type d'établissement et qui fixe les mesures à prendre en atténuation ou en aggravation
> des prescriptions communes pour tenir compte des risques spécifiques à chaque type
> d'exploitation. »

L'addition « Titre Ier + chapitre de son type » est donc **celle que le texte prescrit
lui-même**, et non un découpage de commodité.

Une réserve, et elle joue dans le sens qui rétrécit : `GE 1 § 2` ajoute que « sauf
indications contraires, les dispositions du présent livre, relatives aux aménagements
et installations techniques, ne s'appliquent qu'aux locaux ouverts au public », et un
chapitre entier ne concerne un établissement donné que s'il détient l'installation
visée — le chapitre GC ne s'ouvre qu'au-delà de 20 kW de puissance utile (`GC 1 § 3`),
le chapitre AS suppose un ascenseur. **Le sous-total mesure donc ce qui *peut*
s'appliquer, pas ce qui s'applique à coup sûr.** Il n'existe aucune façon de resserrer
davantage sans connaître le parc d'un établissement précis.

### 4.2 Restaurant de type N

- **332 articles** : 312 du Titre Ier + 20 du chapitre N.
- Le chapitre est le **deuxième plus court des quatorze**, après le type V (13).
- `N 1`, au verbatim : le chapitre ne s'applique qu'aux restaurants, cafés, brasseries,
  débits de boissons et bars « dans lesquels l'effectif du public est supérieur ou égal
  à l'un des chiffres suivants : ― 100 personnes en sous-sol ; ― 200 personnes en étages,
  galeries et autres ouvrages en élévation ; ― 200 personnes au total ». En deçà,
  l'établissement est de 5ᵉ catégorie et relève du Livre III.

### 4.3 Commerce de type M

- **370 articles** : 312 du Titre Ier + 58 du chapitre M.
- `M 1 § 1` : seuils de 100 personnes en sous-sol, en étages, galeries et ouvrages en
  surélévation, ou 200 au total. `M 1 § 2` et `§ 3` traitent en outre du centre
  commercial, qui est un « groupement d'établissements recevant du public ».

### 4.4 Bureau tertiaire — la formule du brief mérite d'être corrigée

Le brief écrit qu'« un bureau tertiaire n'est en principe pas un ERP ». **Le règlement
dit autre chose.** Le type W existe et s'intitule « Administrations, banques, bureaux » ;
`W 1`, au verbatim :

> « Les dispositions du présent chapitre sont applicables aux administrations, aux banques
> et aux bureaux dans lesquels l'effectif du public est supérieur ou égal à l'un des
> chiffres suivants : - 100 personnes en sous-sol ; - 100 personnes en étage et autres
> ouvrages en élévation ; - 200 personnes au total. »

Un bureau qui reçoit du public au-delà de ces seuils **est** un ERP du 1er groupe, de
type W, et son sous-total est de **328 articles** (312 + 16). En deçà, il est de
5ᵉ catégorie ; s'il ne reçoit aucun public, il n'est pas un ERP et ne relève que du
Code du travail. La formule exacte est donc : *un bureau n'est pas nécessairement un
ERP*, et non *n'est en principe pas un ERP*.

---

## 5. Les 18 articles cités : où ils tombent

Les 18 `ref` du corpus `arrete-1980-livre-2.ts` ont été retrouvés un à un dans la
structure officielle. **Les 18 existent et sont en vigueur au 2026-09-03. Les 18
relèvent du Titre Ier.**

| Article | Chapitre du Titre Ier |
|---|---|
| GE 4 | Ier — Généralités |
| GE 6 | Ier — Généralités |
| DF 10 | IV — Désenfumage |
| CH 57 | V — Chauffage, ventilation, réfrigération, climatisation |
| CH 58 | V — Chauffage, ventilation, réfrigération, climatisation |
| GZ 13 | VI — Installations aux gaz combustibles |
| GZ 14 | VI — Installations aux gaz combustibles |
| GZ 15 | VI — Installations aux gaz combustibles |
| EL 18 | VII — Installations électriques |
| EL 19 | VII — Installations électriques |
| EC 14 | VIII — Éclairage |
| EC 15 | VIII — Éclairage |
| GC 1 | X — Appareils de cuisson |
| GC 8 | X — Appareils de cuisson |
| GC 21 | X — Appareils de cuisson |
| GC 22 | X — Appareils de cuisson |
| MS 38 | XI — Moyens de secours contre l'incendie |
| MS 73 | XI — Moyens de secours contre l'incendie |

**Aucune citation ne vient d'un chapitre de type.** Ni du chapitre N (20 articles), ni
du chapitre M (58), ni d'aucun des douze autres. C'est le résultat le plus net de ce
relevé : les 486 articles du Titre II sont, pour le référentiel, un continent entier
jamais abordé.

Trois chapitres du Titre Ier ne sont pas davantage abordés : **CO** (61 articles),
**AM** (20) et **AS** (11) — soit 92 articles de plus.

### 5.1 La `portee` déclarée est inexacte sur ses deux moitiés

Le corpus déclare :

> « Dispositions générales (MS, EC, EL, DF, GE) et particulières par type. »

Confronté à la liste ci-dessus, l'énoncé est faux dans les deux sens :

1. **Il omet trois préfixes qui sont pourtant cités** — `CH` (2 articles), `GZ` (3) et
   `GC` (4), soit **neuf des dix-huit**, c'est-à-dire la moitié du corpus. La
   parenthèse « (MS, EC, EL, DF, GE) » couvre les neuf autres.
2. **Il annonce des dispositions « particulières par type » qu'il ne contient pas.**
   Zéro article de type au corpus.

L'énoncé est donc plus étroit que la réalité sur les préfixes généraux, et plus large
qu'elle sur les dispositions de type. Le second écart est le plus coûteux : il
donne à lire une couverture par type qui n'existe pas. Constaté, non corrigé — le
mandat de ce relevé exclut de toucher `src/`.

---

## 6. Combien portent une périodicité

### 6.1 Comment la mesure a été faite, et pourquoi elle est vérifiable

Le texte de chacun des 794 articles a été extrait de la donnée LEGI, puis passé au
crible d'une liste de tournures de rythme (« tous les ans », « une fois par an »,
« annuellement », « tous les *n* ans », « tous les six mois », « une fois par mois »,
« par semaine », « hebdomadaire », « semestriel », « triennal », « quotidien »,
« journalier », « au moins une fois »…). **Puis chacun des articles retenus a été relu
en contexte**, sur ±170 caractères autour de la tournure, et les faux positifs ont été
écartés à la main. Le crible ne décide de rien seul ; il ne fait que ramener les
candidats.

**Quatre faux positifs écartés**, tous parce que le mot de rythme y qualifie une quantité
et non une fréquence : `CH 49` (« dans la limite de sa consommation **quotidienne** »),
`M 16` (« marchandises destinées aux besoins **journaliers** »), `N 14` (« la quantité
de bois […] limitée à la consommation **quotidienne** »), `J 10` (« recoupés **au moins
une fois** […] par une cloison CF »).

**Deux ajouts que le crible avait manqués**, retrouvés par un second passage sur toutes
les occurrences de durée en années ou en mois :

- **`GE 4`** — son rythme est dans un **tableau** (3 ans / 5 ans par type et par
  catégorie), et le corps de l'article n'écrit que « selon la fréquence fixée au tableau
  suivant ». Aucune tournure de rythme n'y figure en toutes lettres.
- **`CH 39`** — « Une visite périodique doit être effectuée par l'utilisateur ou son
  représentant. Cette périodicité ne doit pas être supérieure à **un an**. En l'absence
  d'un système de mesure et d'alarme fonctionnant en permanence, cette périodicité est
  ramenée à **trois mois**. »

Un cas est laissé **hors du compte et signalé** : `T 6` exige du chargé de sécurité
« une attestation datant de moins de trois ans obtenue suite à un stage de maintien et
d'actualisation des connaissances ». C'est une durée de validité d'un titre de personne,
pas un rythme de vérification d'un établissement. Le compter changerait le total de
Titre II de 7 à 8.

Onze articles emploient « périodique » ou « périodicité » **sans écrire aucun rythme**
et ne sont donc pas comptés : `DF 9`, `CH 54`, `EL 20`, `EC 12`, `MS 67`, `MS 68`,
`MS 74`, `L 11`, `T 35`, `U 47`, `U 62`. `MS 68` est le plus net : il impose un contrat
d'entretien dont « les consignes […] doivent préciser la périodicité des interventions »
— le texte délègue le rythme au contrat au lieu de le fixer.

### 6.2 Le compte

**Titre Ier — 19 articles portent un rythme, sur 312.**

| Article | Rythme écrit | Cité au corpus |
|---|---|:--:|
| GE 4 | 3 ans ou 5 ans, par type et catégorie (tableau) | **oui** |
| CO 61 | inspection de la tribune télescopique tous les 5 ans | non |
| DF 10 | désenfumage : 1 an ; 3 ans si mécanique + SSI cat. A ou B | **oui** |
| CH 39 | filtres : visite périodique ≤ 1 an, ramenée à 3 mois sans mesure permanente | non |
| CH 57 | ramonage et nettoyage une fois par an | **oui** |
| CH 58 | vérifications périodiques tous les ans ; asservissements des systèmes thermodynamiques tous les 3 ans | **oui** |
| GZ 15 | vérifications techniques des installations de gaz, annuellement | **oui** |
| EL 18 | groupes électrogènes de sécurité : tous les quinze jours et tous les mois | **oui** |
| EL 19 | installations non modifiées : annuellement | **oui** |
| EC 14 | éclairage de sécurité : une fois par mois, une fois tous les six mois | **oui** |
| AS 9 | ascenseurs : vérification par organisme agréé tous les 5 ans | non |
| AS 10 | escaliers mécaniques et trottoirs roulants : annuellement, plus un examen à mi-période | non |
| GC 18 | conduit d'extraction d'un module ou conteneur : au moins tous les six mois | non |
| GC 21 | ramonage annuel ; filtres au minimum une fois par semaine | **oui** |
| GC 22 | vérifications périodiques tous les ans | **oui** |
| MS 38 | extincteurs : vérification annuelle, révision tous les dix ans | **oui** |
| MS 69 | alarme : l'exploitant s'assure du bon fonctionnement une fois par semaine au moins | non |
| MS 71 | communications radioélectriques : une fois avant ouverture, puis tous les 3 ans | non |
| MS 73 | au moins une fois par an ; SSI cat. A ou B et sprinkleurs tous les 3 ans | **oui** |

**Titre II — 7 articles portent un rythme, sur 482**, plus une annexe :

| Article | Type | Rythme écrit |
|---|---|---|
| L 13 | L | vérification annuelle des installations temporaires ou semi-permanentes, par organisme agréé |
| L 57 | L | vérifications techniques tous les 3 ans ; vérification annuelle des déversoirs et rideaux d'eau ; dépoussiérage annuel des cintres et dessous |
| T 52 | T | nettoyage régulier (quotidien) ; déchets enlevés chaque jour avant l'ouverture |
| U 64 | U | gaz médicaux : vérifications périodiques tous les ans |
| Y 11 | Y | dépoussiérage annuel |
| J 33 | J | vérification au moins une fois par an |
| J 39 | J | exercices pratiques au moins une fois par semestre |
| *Annexe* | X | traitement du chlore : vérifications journalières par l'exploitant |

**Ni le chapitre N ni le chapitre M ne comportent un seul article portant un rythme.**
Le type N compte 20 articles de construction, d'aménagement et d'exploitation, dont
aucun ne fixe de fréquence ; le type M, 58, dont aucun non plus.

### 6.3 Ce que cela fait au sous-total

Pour un **restaurant de type N** comme pour un **commerce de type M**, le périmètre
d'articles portant un rythme est **le même : les 19 du Titre Ier**, et rien d'autre.

Le référentiel en cite **12**, soit **63 %**.

**Les 7 non cités**, avec ce à quoi chacun se rattache :

| Article | S'attache à | Servi ailleurs dans le dépôt ? |
|---|---|---|
| `AS 9` | ascenseur | **Oui** — `ascenseur-controle-technique-quinquennal`, fondée sur le CCH, porte le même contrôle quinquennal |
| `AS 10` | escalier mécanique, trottoir roulant | **Non.** Aucune occurrence de « escalier mécanique » ni « trottoir roulant » dans `src/`, et aucune catégorie d'équipement correspondante |
| `MS 69` | équipement d'alarme | **Non.** Aucune obligation hebdomadaire du domaine incendie ; la seule ligne hebdomadaire du référentiel est `cuisson-erp-filtres-hebdomadaire` |
| `MS 71` | installation de communication radioélectrique des secours | **Non.** Ne vise que les ERP disposant de plus d'un niveau de sous-sol |
| `CH 39` | installation de filtration d'air | **Non.** `CH 39` n'apparaît nulle part dans `src/` |
| `GC 18` | module ou conteneur spécialisé de cuisson | **Non.** `GC 18` n'apparaît nulle part dans `src/` ; `GC 1` distingue pourtant déjà le module du reste du chapitre |
| `CO 61` | tribune fixe par destination ou télescopique | **Non.** Sans objet dans les trois secteurs cibles |

Vérifié en cherchant chaque référence dans `src/` : `AS 9` n'y figure que dans une
citation du Livre III, `CH 35` que dans les notes de `CH 58`, `MS 68` que dans un
commentaire d'`incendie.ts`. Aucune de ces occurrences n'est une `reference` vivante.

### 6.4 Et sur les 18 cités

**12 des 18 portent un rythme** : `GE 4`, `DF 10`, `CH 57`, `CH 58`, `GZ 15`, `EL 18`,
`EL 19`, `EC 14`, `GC 21`, `GC 22`, `MS 38`, `MS 73`.

**6 n'en portent aucun**, et c'est conforme à ce que le corpus en dit déjà lui-même :
`GE 6` (article de régime : qui vérifie), `EC 15` (renvoi d'une phrase à `EL 19`),
`GC 1` (définition du seuil de 20 kW), `GC 8` (existence du dispositif d'extinction),
`GZ 13` (vérification avant mise en service), `GZ 14` (entretien à la charge de
l'exploitant, sans rythme).

Autrement dit : **le corpus ne cite pas six articles inutiles ; il cite six articles qui
fondent, définissent ou renvoient**, et douze qui datent. La distinction du § 6 du brief
se vérifie donc dans les deux sens.

---

## 7. Le terme de comparaison : le Livre III

Pour que « 18 sur 332 » se lise, voici la même mesure sur le livre que le dépôt
dépouille intégralement.

`PE 1 § 2`, au verbatim : « Les chapitres Ier et II du présent livre comprennent les
prescriptions communes applicables à tous les établissements de 5e catégorie. Ils sont
complétés par les chapitres III, IV, V et VI qui comprennent les prescriptions
particulières applicables à certains types d'établissement. » Le sous-total d'un
établissement de 5ᵉ catégorie se construit donc exactement comme celui du 1er groupe.

| Chapitre du Livre III | Articles | Portant un rythme |
|---|--:|---|
| Ier — Dispositions générales | 4 | `PE 4` |
| II — Règles techniques | 23 | aucun |
| III — Locaux réservés au sommeil | 10 | `PE 37` |
| IV — Hôtels | 14 | `PO 1`, `PO 7` |
| V — Petits établissements de soins | 6 | aucun |
| VI — Établissements sportifs (PX) | 1 | aucun |

**Le socle d'un restaurant de 5ᵉ catégorie sans local à sommeil est de 27 articles**
(chapitres Ier et II), dont **un seul porte un rythme** : `PE 4`, dont le § 2 impose,
« tous les trois ans au plus », l'entretien et la vérification de l'ensemble des
installations techniques. Le dépôt le porte.

La comparaison, à périmètre égal — un restaurant, dans les deux cas :

| | 5ᵉ catégorie | 3ᵉ catégorie, type N |
|---|--:|--:|
| Articles du périmètre | 27 | **332** |
| Articles dépouillés | 27 (100 %) | 18 (5,4 %) |
| Articles portant un rythme | 1 | **19** |
| Rythmes couverts | 1 sur 1 | **12 sur 19** |

---

## 8. Ce que je n'ai pas pu établir

1. **Le fac-similé du Journal officiel n'a pas été ouvert.** Comme le 2026-09-02, les
   PDF « Extrait du Journal officiel électronique authentifié » de Légifrance sont
   derrière la vérification Cloudflare. Le comptage repose sur la donnée consolidée de
   la DILA, qui est officielle mais qui est une consolidation, pas un fac-similé.

2. **Je n'ai pas lu les 794 articles.** J'en ai lu le texte intégral par machine, et
   j'ai relu à l'œil les 40 environ que le crible de périodicité a ramenés, dans les
   deux sens. Un article qui exprimerait un rythme dans une tournure qu'aucun de mes
   deux passages ne couvre — un tableau muet comme celui de `GE 4`, un schéma, un renvoi
   à une instruction technique — m'aurait échappé. `GE 4` a été rattrapé ; je ne peux
   pas garantir qu'il était le seul de son espèce.

3. **Le compte des articles « applicables » à un établissement donné n'est pas établi,
   et ne peut pas l'être ici.** Le sous-total de 332 est le périmètre potentiel. Combien
   de ces 332 s'appliquent à un restaurant réel dépend de son parc et de sa
   configuration — `GE 1 § 2` réserve les dispositions techniques aux locaux ouverts au
   public, le chapitre GC suppose 20 kW, le chapitre AS un ascenseur. Établir ce compte
   supposerait de lire l'assiette de chacun des 332 articles, ce qui est un dépouillement
   et non une mesure.

4. **Les atténuations et aggravations du Titre II sur le Titre Ier n'ont pas été
   dépouillées.** `GE 1 § 1` dit que les chapitres de type « fixe[nt] les mesures à
   prendre en atténuation ou en aggravation des prescriptions communes ». Un article de
   type peut donc modifier le rythme d'un article général sans porter lui-même de
   tournure de rythme — auquel cas mon crible ne l'a pas vu. J'ai constaté au moins un
   article de type qui déroge explicitement au Titre Ier (`N 14` : « En dérogation aux
   articles GC… ») sans que la dérogation porte sur une périodicité. Je n'ai pas vérifié
   les 482 sur ce point.

5. **Le Livre Ier n'a pas été analysé au-delà de son compte** (15 articles, `GN 1` à
   `GN 15`). Il s'applique à tous les ERP, 5ᵉ catégorie comprise, et il n'entre donc pas
   dans le dénominateur du Livre II — mais aucune mesure de sa couverture n'a été faite,
   et ce relevé ne dit rien de ce qu'il porte.

6. **Une seule livraison incrémentale de la DILA a pu manquer sans que je le voie.** Les
   417 livraisons postérieures au jeu global ont toutes été téléchargées et inspectées ;
   44 touchent ce texte et ont été appliquées. Si l'une avait échoué en silence, la
   structure resterait celle de la veille. Le contrôle qui rend cette hypothèse peu
   probable est celui du § 2.3 : après application, `PE 4` porte bien sa rédaction du
   1er juillet 2026, `CH 58` ses « systèmes thermodynamiques » et `GZ 15` sa rédaction
   du 1er janvier 2026 — trois modifications de trois dates différentes, toutes
   postérieures au jeu global, toutes présentes.

7. **L'arrêté du 19 février 2026 n'est pas dans la mesure, et c'est correct.** Il entre
   en vigueur le 1er juin 2027 et ne s'applique qu'aux demandes d'autorisation de travaux
   déposées à compter de cette date (`veille-textes.ts`). Il crée `GN 16`, qui est au
   Livre Ier. Il ne crée aucun article du Livre II d'après la liste qu'en donne le dépôt
   — liste que je n'ai pas revérifiée à la source.

---

## 9. Annexe — comment refaire la mesure

```
# 1. Jeu global consolidé, et extraction du seul arrêté du 25 juin 1980
curl -s https://echanges.dila.gouv.fr/OPENDATA/LEGI/Freemium_legi_global_20250713-140000.tar.gz \
  | tar -xz '*JORFTEXT000000290033*'

# 2. Les 417 livraisons incrémentales postérieures, même filtre.
#    44 d'entre elles contiennent des fichiers de ce texte ; appliquées
#    dans l'ordre chronologique, elles écrasent les fichiers du jeu global.

# 3. Parcours de la structure depuis la section racine LEGISCTA000020303815,
#    en ne retenant qu'un LIEN_ART ou un LIEN_SECTION_TA dont
#    debut <= 2026-09-03 < fin, et dont l'etat n'est ni ANNULE ni MODIFIE_MORT_NE.
```

Le parcours rend 1 164 articles pour le texte entier, dont 799 pour le Livre II.
