# Relevé — le tableau de l'article GE 4 § 1 (arrêté du 25 juin 1980)

Périodicité des visites de commission de sécurité, croisée par type d'ERP et par catégorie.
Version en vigueur depuis le **1er janvier 2015**, sans terme.

Relevé fait le **2026-09-02**. Branche `releve/ge4-tableau`, partie de `origin/integration/2026-09-01-recadrage`.
**Aucun fichier de `src/` n'est touché.** Ce document établit un fait ; son encodage appartient à la propriétaire.

---

## 1. Ce qui est établi, en une phrase

Le tableau ne connaît que **deux barreaux — trois ans et cinq ans** — et **quatre types seulement gardent trois ans en 4ᵉ catégorie** (J, O, R avec hébergement, U). Le type **V (culte) est à cinq ans dans les quatre catégories**, seul type dans ce cas. Le type **Y (musées) est à trois ans en 1ʳᵉ et 2ᵉ catégories, à cinq ans en 3ᵉ et 4ᵉ** — il n'a rien d'une exception.

---

## 2. Sources

### 2.1 Ce qui n'a pas pu être ouvert

**Le fac-similé du Journal officiel n'a pas pu être lu.** Le PDF « Extrait du Journal officiel électronique authentifié » est servi par Légifrance derrière une vérification Cloudflare : toute requête non-navigateur reçoit `403` et la page d'attente « Just a moment… ». Trois voies ont été essayées (client HTTP direct avec en-têtes de navigateur et cookies, outil de récupération de page, proxy de lecture public) ; les trois rendent la page de défi, jamais le PDF. C'est un fait de cette session, pas une opinion sur la source.

La cible exacte, si quelqu'un peut l'ouvrir depuis un navigateur :
`https://www.legifrance.gouv.fr/download/pdf?id=yQBE3OK0gff6hSKbw4vJgxqAan03mhLJC5z3cVMEAsc=`
(lien « Extrait du Journal officiel électronique authentifié » de la page `https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000029641453`).

### 2.2 Ce qui a été ouvert à la place

| # | Source | Nature | Ce qu'elle apporte |
|---|---|---|---|
| A | **Jeu de données LEGI, DILA** — `Freemium_legi_global_20250713-140000.tar.gz`, fichier `LEGIARTI000029642660.xml`, sur `https://echanges.dila.gouv.fr/OPENDATA/LEGI/` | **Donnée officielle consolidée** (le jeu de données que Légifrance publie et dont son site est le rendu) | Le texte des § 1 à § 4 au verbatim ; les métadonnées de version ; le **nombre exact de croix de chaque ligne** du tableau |
| B | **Jeu de données JORF, DILA** — `Freemium_jorf_global_20250713-140000.tar.gz`, fichiers `JORFTEXT000029641453.xml` et `JORFARTI000029641460.xml` (l'annexe de l'arrêté du 20 octobre 2014), sur `https://echanges.dila.gouv.fr/OPENDATA/JORF/` | **Donnée officielle du texte tel que publié au JO** | L'identité exacte du modificatif (NOR, numéro de JO, page, rang du texte) et **le tableau tel qu'il a été édicté en 2014**, avec les mêmes cardinalités de ligne que A |
| C | `https://www.sdis70.fr/guide-de-securite-erp-2026.pdf` — Guide de sécurité ERP, SDIS de Haute-Saône | Reproduction par un service public départemental (secondaire) | Le tableau **en clair** : chaque case porte « 3 ans » ou « 5 ans », aucune case vide à interpréter |
| D | `https://www.sdis77.fr/wp-content/uploads/2019/10/Tableau-périodicités-des-visites-ERP.pdf` — SDIS de Seine-et-Marne | Reproduction par un service public départemental (secondaire) | Le tableau en croix, mise en page PDF conservée |
| E | `https://batiss.fr/content/uploads/rglt-secu-30juin2017/Batiss_Securite_Incendie_GE.pdf` — documentation professionnelle Batiss, articles « GE » | Reproduction éditoriale professionnelle (secondaire) | Le tableau en croix, mise en page PDF conservée |
| F | `https://sitesecurite.com/contenu/_erp/erp/ge02a05.php` — SiteSecurite.com | Reproduction éditoriale professionnelle (secondaire) | Le tableau en `<table>` HTML **avec les cellules vides conservées**, donc la grille complète de 15 colonnes |

C, D, E et F sont **quatre reproductions secondaires**. Elles ne valent pas fac-similé. Ce qui les rend utilisables ici, c'est qu'elles sont de **quatre éditeurs différents et de trois formats de rendu différents** (PDF en clair, PDF en croix, table HTML à cellules vides préservées), et surtout qu'elles sont recoupées par une **grandeur mesurée sur la donnée officielle** — voir § 5.

### 2.3 Une correction au passage : il y a deux arrêtés du 20 octobre 2014

Le brief et la `reserve` du corpus renvoient à « un arrêté du 20 octobre 2014 ». Il y en a **deux**, du même jour, au même JO, au titre identique au mot près :

- **`JORFTEXT000029641453`, NOR `INTE1420988A`** — JORF n°0250 du 28 octobre 2014, **texte n°23, page 17818**, ELI `https://www.legifrance.gouv.fr/eli/arrete/2014/10/20/INTE1420988A/jo/texte`. C'est **celui-ci** qui remplace le tableau de GE 4 § 1 et réécrit le § 3. Son annexe, au verbatim (source B) : « L'article GE4 est ainsi modifié : Le tableau du chapitre Ier est remplacé par le tableau suivant : […] Dans le chapitre III, les mots : "dans la limite de quatre ans s'il était de deux ans et dans la limite de cinq ans s'il était de trois ans" sont remplacés par les mots : "dans la limite de cinq ans". »
- `JORFTEXT000029641444`, NOR `INTE1421827A` — même JO, qui modifie **REF 7** (refuges de montagne) et **ne touche pas à GE 4**.

Citer « l'arrêté du 20 octobre 2014 » sans son NOR désigne donc deux textes à la fois. Le bon est `INTE1420988A`.

---

## 3. Le tableau

Quinze types, quatre catégories. Chaque case porte la périodicité en années.

| Type | Intitulé | 1ʳᵉ cat. | 2ᵉ cat. | 3ᵉ cat. | 4ᵉ cat. |
|---|---|:--:|:--:|:--:|:--:|
| **J** | Structures d'accueil pour personnes âgées et personnes handicapées | 3 | 3 | **3** | **3** |
| **L** | Salles d'auditions, de conférences, de réunions, de spectacles | 3 | 3 | **3** | 5 |
| **M** | Magasins de vente, centres commerciaux | 3 | 3 | 5 | 5 |
| **N** | Restaurants et débits de boissons | 3 | 3 | 5 | 5 |
| **O** | Hôtels et pensions de famille | 3 | 3 | **3** | **3** |
| **P** | Salles de danse et salles de jeux | 3 | 3 | **3** | 5 |
| **R (1)** | Enseignement, colonies — **avec hébergement** | 3 | 3 | **3** | **3** |
| **R (2)** | Enseignement, colonies — **sans hébergement** | 3 | 3 | **3** | 5 |
| **S** | Bibliothèques, centres de documentation | 3 | 3 | 5 | 5 |
| **T** | Salles d'expositions | 3 | 3 | 5 | 5 |
| **U** | Établissements de soins | 3 | 3 | **3** | **3** |
| **V** | Établissements de culte | **5** | **5** | 5 | 5 |
| **W** | Administrations, banques, bureaux | 3 | 3 | 5 | 5 |
| **X** | Établissements sportifs couverts | 3 | 3 | 5 | 5 |
| **Y** | Musées | 3 | 3 | 5 | 5 |

Les intitulés de types ne viennent pas de GE 4 — ils sont donnés pour lecture, GE 4 ne porte que les lettres. Ils sont ceux de la nomenclature GN 1.

La même chose sous la forme où le texte l'écrit — deux blocs, une croix par case :

**Bloc « 3 ans »**

| | J | L | M | N | O | P | R(1) | R(2) | S | T | U | V | W | X | Y | croix |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 1ʳᵉ cat. | X | X | X | X | X | X | X | X | X | X | X | · | X | X | X | **14** |
| 2ᵉ cat. | X | X | X | X | X | X | X | X | X | X | X | · | X | X | X | **14** |
| 3ᵉ cat. | X | X | · | · | X | X | X | X | · | · | X | · | · | · | · | **7** |
| 4ᵉ cat. | X | · | · | · | X | · | X | · | · | · | X | · | · | · | · | **4** |

**Bloc « 5 ans »**

| | J | L | M | N | O | P | R(1) | R(2) | S | T | U | V | W | X | Y | croix |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 1ʳᵉ cat. | · | · | · | · | · | · | · | · | · | · | · | X | · | · | · | **1** |
| 2ᵉ cat. | · | · | · | · | · | · | · | · | · | · | · | X | · | · | · | **1** |
| 3ᵉ cat. | · | · | X | X | · | · | · | · | X | X | · | X | X | X | X | **8** |
| 4ᵉ cat. | · | X | X | X | · | X | · | X | X | X | · | X | X | X | X | **11** |

Notes du tableau, au verbatim de la donnée officielle (source A) : « (1) Avec hébergement. (2) Sans hébergement. »

---

## 4. Lue ou déduite, cellule par cellule

Il n'y a **aucune cellule déduite** au sens d'une case comblée par raisonnement. Mais les deux moitiés de chaque cellule ne viennent pas du même endroit, et il faut le dire séparément.

**Le libellé des colonnes et des lignes, et le texte des § 1 à § 4 : LUS sur la donnée officielle** (source A). Quinze colonnes `J L M N O P R (1) R (2) S T U V W X Y`, deux blocs `3 ans` et `5 ans`, quatre lignes de catégorie par bloc. Aucune colonne de plus, aucune ligne de plus.

**Le nombre de croix de chaque ligne : LU sur DEUX jeux de données officiels indépendants** (sources A et B). Ce sont les huit nombres de la colonne « croix » ci-dessus. Le tableau consolidé de LEGI et le tableau tel qu'édicté à l'annexe de l'arrêté de 2014 dans JORF donnent, ligne par ligne, exactement les mêmes comptes — deux chaînes de production différentes, un même résultat. Voir § 5 pour ce qu'ils valent.

**La position de chaque croix : LUE sur quatre reproductions secondaires concordantes** (sources C, D, E, F), **jamais sur une source officielle**. Les quatre donnent la même grille, cellule par cellule, sans un écart. C'est le point faible du relevé et il est nommé ici plutôt qu'au § 7 seulement.

**Rien n'est déduit**, à une réserve près qui va dans le bon sens : sur les lignes « 1ʳᵉ » et « 2ᵉ » du bloc 3 ans, la donnée officielle dit qu'il manque **exactement une** case sur quinze ; les quatre reproductions disent laquelle (V) ; il n'y a donc qu'une seule cellule possible à mettre en cause sur ces deux lignes, et elle est corroborée quatre fois.

---

## 5. Le contrôle qui ferme le tableau — et pourquoi les extractions d'hier se contredisaient

**La cause du désordre d'hier est identifiée, et elle est plus profonde qu'un défaut de rendu HTML.**

Dans la **donnée officielle elle-même**, les cellules vides du tableau **ne sont pas encodées**. Et ce n'est pas un accident de la consolidation : le défaut est déjà là dans le **texte tel que publié au JO** (source B, l'annexe de l'arrêté du 20 octobre 2014) et il se retrouve à l'identique dans le **texte consolidé** (source A). Les deux jeux de données ont les mêmes lignes incomplètes, avec les mêmes comptes. Les lignes n'ont donc pas toutes le même nombre de cellules :

```
ligne « 1re catégorie » du bloc 3 ans : 15 cellules  (1 libellé + 14 croix)
ligne « 3e catégorie » du bloc 3 ans :   8 cellules  (1 libellé +  7 croix)
ligne « 4e catégorie » du bloc 3 ans :   5 cellules  (1 libellé +  4 croix)
ligne « 1re catégorie » du bloc 5 ans :   2 cellules  (1 libellé +  1 croix)
ligne « 3e catégorie » du bloc 5 ans :   9 cellules  (1 libellé +  8 croix)
ligne « 4e catégorie » du bloc 5 ans :  12 cellules  (1 libellé + 11 croix)
```

Une extraction qui aligne ces cellules à gauche produit un tableau faux — et faux **différemment** selon l'outil, ce qui explique quatre lectures divergentes. Les « 14 croix là où le rendu brut en montrait 4 » et les « totaux qui ne se reconstituent pas à 15 colonnes » sont exactement cela : deux lignes différentes du même tableau. **Ce n'est pas le rendu HTML de Légifrance qui aplatit : c'est la donnée source, dès sa publication au JO.** Corriger l'outil de lecture n'y aurait rien changé, et aucune relecture du site, si attentive soit-elle, ne pouvait rendre les cases perdues.

Ce défaut se retourne pourtant en instrument de contrôle. Les cardinalités sont, elles, **exactes et officielles**. Elles doivent se compléter à quinze, bloc contre bloc, catégorie par catégorie :

| Catégorie | croix « 3 ans » | croix « 5 ans » | somme |
|---|:--:|:--:|:--:|
| 1ʳᵉ | 14 | 1 | **15** |
| 2ᵉ | 14 | 1 | **15** |
| 3ᵉ | 7 | 8 | **15** |
| 4ᵉ | 4 | 11 | **15** |

Les quatre sommes tombent juste. La grille reconstituée au § 3 respecte ces huit nombres, et aucun type n'y porte deux croix ni zéro croix. **Une source secondaire qui se serait trompée d'une case aurait cassé une de ces sommes.**

C'est le point qui distingue ce relevé d'une simple concordance entre reproductions : les positions viennent de sources secondaires, mais elles sont **contraintes par une grandeur mesurée sur la donnée officielle**. Ce n'est toujours pas un fac-similé, et le § 7 dit précisément ce que ce contrôle ne couvre pas.

---

## 6. Les deux questions annexes

### 6.1 « Trois ans partout sauf le type Y » — **faux**

Le type **Y (musées)** est à **trois ans en 1ʳᵉ et 2ᵉ catégories**, à **cinq ans en 3ᵉ et 4ᵉ**. Il suit exactement le régime de M, N, S, T, W et X. Il n'est l'exception de rien.

**Le type qui est à cinq ans dans les quatre catégories est V (établissements de culte)**, et c'est le seul. La note de corpus décrit donc une règle exacte — « trois ans partout sauf ce type-là », vraie en 1ʳᵉ et 2ᵉ catégories — mais **sur la mauvaise lettre**. Un glissement **V → Y** rendrait la note exacte pour les deux premières catégories. Ce n'est qu'une explication plausible de l'origine de l'erreur ; la lettre juste, elle, est établie : V.

### 6.2 « Cinq ans en 4ᵉ catégorie hors Y » — **faux deux fois**

En 4ᵉ catégorie, **onze types sur quinze sont à cinq ans**, mais **quatre restent à trois ans : J, O, R (1) avec hébergement, et U**. Ce sont les types à public vulnérable ou hébergé — personnes âgées et handicapées, hôtels, établissements d'enseignement avec hébergement, soins.

Et **Y n'est pas l'exception : Y est à cinq ans en 4ᵉ catégorie**, avec la majorité. La note se trompe donc sur la règle *et* sur son exception.

**Conséquence directe, et c'est celle qui compte :** encoder « cinq ans en 4ᵉ catégorie » sans réserve mettrait à cinq ans un EHPAD, un hôtel, un internat et une clinique de 4ᵉ catégorie que le texte visite tous les trois ans. Ce serait une sous-application de deux ans sur exactement les établissements où elle se paie le plus cher.

---

## 7. Ce que je n'ai pas pu établir

C'est la section qui commande la suite. Une case incertaine laissée à trois ans ne coûte rien ; une case fausse à cinq ans laisse un établissement se croire à jour deux ans de trop.

**(a) Aucune position de croix n'a été lue sur une source officielle.** Les huit cardinalités le sont deux fois ; les positions, elles, viennent de quatre reproductions secondaires — les deux jeux de données officiels ne les portent pas, puisque c'est justement l'information qu'ils ont perdue. Le contrôle du § 5 détecte toute erreur qui changerait un compte, mais **il ne détecterait pas une permutation** — deux types qui auraient échangé leur régime au sein d'une même ligne, dans les quatre reproductions à la fois. C'est peu probable de quatre éditeurs indépendants ; ce n'est pas impossible, et il n'est pas exclu que ces éditeurs se recopient entre eux, ce que je n'ai aucun moyen de vérifier. **Le fac-similé du JO reste à ouvrir**, § 2.1 donne l'URL.

**(b) Les huit types spéciaux n'ont aucune colonne.** Le tableau ne connaît que les quinze types du premier groupe. **PA, CTS, SG, PS, GA, OA, REF, EF** n'y figurent pas — GE 4 § 1 ne leur fixe **aucune** périodicité. Où la leur est fixée, je ne l'ai pas établi. Une reproduction (source D) porte deux notes de bas de tableau sur les parcs de stationnement couverts — visités avec l'établissement auquel ils sont liés, et tous les cinq ans au-delà de 250 véhicules — qui ne viennent pas de GE 4 et que je n'ai pas vérifiées à la source. **Pour ces types, rien dans ce relevé n'autorise à quitter trois ans.**

**(c) La 5ᵉ catégorie reste hors sujet, et c'est confirmé.** Le tableau n'a que quatre lignes de catégorie par bloc. Le § 1 lu au verbatim vise « les établissements des 1re, 2e, 3e et 4e catégories ». La `reserve` du corpus était juste sur ce point.

**(d) La distinction R (1) / R (2) suppose une donnée que je n'ai pas regardée.** En 4ᵉ catégorie, R avec hébergement est à trois ans et R sans hébergement à cinq. Ce sont deux colonnes du tableau, pas une nuance : **un type R dont on ignore s'il héberge n'a pas de case**. Si le produit ne sait pas répondre, la seule lecture sûre est la plus courte, trois ans.

**(e) Le tableau ne se lit pas seul sur un établissement multi-bâtiments.** § 2, au verbatim (source A) : quand l'établissement comprend plusieurs bâtiments isolés entre eux, la catégorie s'apprécie bâtiment par bâtiment et les visites se font pour l'ensemble « avec la périodicité la plus courte de celles qui correspondent aux catégories des bâtiments ». Un établissement peut donc relever d'une case plus courte que celle de sa propre catégorie.

**(f) § 3 et § 4 peuvent déplacer la case, dans les deux sens, et ne sont pas modélisables ici.** § 3, au verbatim : après deux visites périodiques favorables consécutives, pour un établissement **sans locaux d'hébergement**, « le délai fixé pour sa prochaine visite par le tableau ci-dessus peut être prolongé dans la limite de cinq ans », sur proposition de la commission inscrite au procès-verbal. C'est un **plafond soumis à décision**, pas un rythme — la `reserve` du corpus le disait déjà, et elle reste exacte. § 4 : le maire ou le préfet peut modifier la fréquence par arrêté après avis de la commission. Une case du tableau est donc un **point de départ**, jamais le dernier mot sur un dossier donné.

**(g) Ce relevé ne dit rien du tableau antérieur au 1er janvier 2015, sinon qu'il était différent.** L'annexe de l'arrêté de 2014, au verbatim (source B), remplace au § 3 les mots « dans la limite de quatre ans s'il était de deux ans et dans la limite de cinq ans s'il était de trois ans » par « dans la limite de cinq ans » : le tableau d'avant comportait donc bien des cases à **deux ans**, aujourd'hui disparues. Sans intérêt pour l'encodage — mais cela veut dire qu'**une reproduction antérieure à 2015 ne doit jamais servir de recoupement**. Les quatre retenues sont toutes postérieures et portent la mention de la modification du 20 octobre 2014.

---

## 8. Pièges du brief, vérifiés

**GE 4 n'a aucune fin de vigueur — confirmé sur la donnée officielle.** Le XML LEGI de `LEGIARTI000029642660` porte `DATE_DEBUT 2015-01-01`, `DATE_FIN 2999-01-01`, `ETAT VIGUEUR`. `2999-01-01` est la valeur d'absence de terme dans ce jeu de données. La rectification portée par la `reserve` du corpus le 2026-09-01 est donc juste, et elle est maintenant appuyée sur autre chose qu'une lecture d'écran : la fin de vigueur au 01/06/2027 appartient bien à GE 2 et GE 6, pas à GE 4.

**Le type « Q » n'existe pas.** Ni dans le tableau (source A, quinze colonnes nommées), ni dans la nomenclature ERP. L'extraction qui l'avait inventé lisait sa propre sortie.

**Deux lectures concordantes ne valent rien si elles partagent l'angle mort.** C'est précisément ce qui s'est produit hier : toutes les extractions passaient par le rendu de Légifrance, dont on sait maintenant (§ 5) que la donnée sous-jacente perd les cases vides. Le présent relevé ne s'en sort pas parce qu'il a lu plus attentivement, mais parce qu'il a lu **une grandeur d'un autre ordre** — des cardinalités — sur la donnée officielle, et l'a confrontée à des positions venues d'ailleurs.

---

## 9. Si cela devait être encodé — pour information seulement

Ce lot n'encode rien. Ce paragraphe est là pour que la décision se prenne sur pièces.

L'obligation encodée aujourd'hui `triennale` pour les catégories 1 à 4 est **exacte ou sur-appliquée, jamais sous-appliquée** : le tableau n'a que trois et cinq ans, et trois ans n'est jamais au-dessus d'une case. Le statu quo est donc du bon côté de l'erreur, et le rester ne coûte que des visites anticipées.

Ce que le tableau rendrait, s'il était encodé :

- **1ʳᵉ et 2ᵉ catégories** : une seule case change, **V passe à cinq ans**. Quatorze types sur quinze restent à trois ans.
- **3ᵉ catégorie** : huit types passent à cinq ans — **M, N, S, T, V, W, X, Y**. Sept restent à trois — J, L, O, P, R (1), R (2), U.
- **4ᵉ catégorie** : onze types passent à cinq ans — **L, M, N, P, R (2), S, T, V, W, X, Y**. Quatre restent à trois — **J, O, R (1), U**.

Deux conditions à ne pas contourner, tirées du § 7 :

1. La colonne R exige de savoir si l'établissement **héberge**. Sans cette donnée, R reste à trois ans.
2. Les **types spéciaux** (PA, CTS, SG, PS, GA, OA, REF, EF) et la **5ᵉ catégorie** ne sont pas dans ce tableau. Rien ici ne permet de les faire passer à cinq ans.

Et une réserve de méthode : tant que le fac-similé du JO n'est pas ouvert (§ 2.1, § 7 a), **les positions reposent sur des sources secondaires**. Passer une case de trois à cinq ans sur cette base avance une date de deux ans dans le mauvais sens. La décision appartient à la propriétaire.
