# ADR-021 — Le registre est composé, pas imprimé à l'identique

- Statut : acceptée
- Date : 2026-08-26
- Portée : `src/lib/registre/` (`sections.ts`, `composition.ts`, `champs.ts`,
  `schema.ts`, `queries.ts`, `actions.ts`), `src/components/registre/`,
  `src/lib/pdf/RegistreDocument.tsx`, `Etablissement` (4 colonnes),
  modèle `FicheRegistre`, export de `matchTypologie`
- Dépend de : ADR-003 (référentiels en TypeScript), ADR-004 (régimes
  cumulables), ADR-011 (dates civiles), ADR-012 (conservation des preuves)

## Contexte

Ce que le produit appelait « registre de sécurité » était un document d'une
page : deux tableaux, les rapports archivés et les vérifications en attente.
C'est un extrait du calendrier de conformité.

Un registre réel — celui qu'on présente à une commission — compte une
quarantaine de fiches : organisation des secours, inventaire des moyens,
vérifications par famille, contrôles administratifs, événements, annexes.

La tentation naturelle est de reproduire ce document tel quel. Elle est
mauvaise. Un bureau de huit personnes n'a pas de service de sécurité incendie,
pas de colonne sèche, pas de commission de sécurité. Lui imprimer quarante-neuf
fiches vides, c'est noyer les cinq qui le concernent — et lui faire croire que
son registre est un échec alors qu'il est complet.

### Ce qui est opposable, et ce qui ne l'est pas

Distinction décisive, et vérifiée avant d'être encodée.

**Opposable** — le *contenu* :

- **ERP** : CCH R. 143-44, réécrit par le décret n° 2025-1100 et en vigueur
  depuis le 1ᵉʳ juillet 2026. Il énumère cinq rubriques (travaux
  d'aménagement ; état nominatif et hiérarchique du service de sécurité ;
  consignes ; dates des contrôles et vérifications ; dates des exercices de
  sécurité incendie) et renvoie aux articles R. 141-10 et R. 141-11, créés à la
  même date. Il vise « les établissements soumis aux prescriptions du présent
  chapitre » — donc tous les ERP, 5ᵉ catégorie comprise.
- **IGH** : CCH R. 146-35, même date, mêmes rubriques plus un 6° propre —
  « l'état et les plans de situation des moyens de secours » — et un débiteur
  différent : le propriétaire, pas l'exploitant.
- **Travail** : C. trav. R. 4227-39 impose de consigner la date et les
  observations des essais et exercices périodiques sur un registre tenu à la
  disposition de l'inspection du travail.

**Convention** — la *forme* :

Aucun texte n'impose de plan, de modèle ni de format. Le découpage en cinq
parties, l'ordre des rubriques, les intercalaires, le « Feuille n° » : tout cela
vient des registres vendus en librairie professionnelle. Recherche menée sur
Légifrance sans résultat — et c'est un résultat, pas une lacune.

Conséquence pratique : **l'inventaire des moyens de secours n'a de base
textuelle qu'en IGH** (le 6° de R. 146-35). L'imposer à un ERP relève de la
convention, pas de l'obligation. On le garde — il est utile et attendu — mais on
sait ce qu'on fait.

### Ce que L. 4711-5 ne dit pas

L'article ne crée aucun registre. Il dispose que l'employeur « est autorisé à »
réunir en un document unique des informations qui figurent ailleurs dans des
registres distincts. C'est une faculté, et c'est ce qui rend licite de tout
regrouper — pas ce qui oblige à tenir quoi que ce soit. La page du produit
l'énonçait à l'envers (« c'est le fondement du registre unique »), corrigé.

### Ce que la 5ᵉ catégorie change

Les articles MS 45 à MS 52 du règlement de sécurité — service de sécurité
incendie, agents qualifiés, poste de sécurité — appartiennent au **Livre II**,
« Dispositions applicables aux établissements des quatre premières
catégories ». Or PE 1 § 1 dispose que « les dispositions du livre II ne sont pas
applicables sauf celles relevant d'articles expressément mentionnés dans la
suite du présent livre », et les articles PE 1 à PE 4 ne renvoient à aucun
article MS.

Un ERP de 5ᵉ catégorie — l'immense majorité de la cible du produit — n'a donc
ni service de sécurité au sens de MS 46, ni agents SSIAP. Mais R. 143-44 2° lui
impose malgré tout l'état nominatif des personnes du service de sécurité. Ce qui
tombe, c'est l'appareil ; pas l'obligation de nommer qui fait quoi.

## Décision

### 1. Le registre est composé selon l'établissement

Un module pur, `src/lib/registre/composition.ts`, rend les fiches dues à partir
d'un `EtablissementMatching` et de son parc d'équipements. Il alimente à la fois
l'écran et le document : le sommaire et les pages viennent de la même liste,
sinon ils divergent.

### 2. Deux déclencheurs, pas un

C'est le cœur de l'ADR. Les fiches ne sont pas dues pour la même raison :

| Déclencheur | Ce qui l'ouvre | Exemples |
|---|---|---|
| `typologies` | Le régime et les seuils | Renseignements ERP, service de sécurité, contrôles de commission |
| `categoriesEquipement` | La **présence** d'un équipement | Colonnes sèches, RIA, exutoires, paratonnerres |
| aucun | Due dans tous les cas | Renseignements généraux, événements, annexes |

Une fiche d'inventaire ne dépend pas du régime : un ERP sans colonne sèche n'a
pas de fiche colonne sèche. C'est le même déclencheur que le calendrier, et il
existait déjà.

### 3. On réutilise `TypologieApplication`, on n'en écrit pas une seconde

La question « à qui cette ligne s'applique-t-elle ? » est déjà résolue par le
moteur de matching, avec ses exclusions, ses restrictions de catégorie et son
seul OU inter-critères nommé d'après son article (`champR422734`). `matchTypologie`
est donc **exporté** plutôt que réécrit. Une union maison
(`"erp" | "igh" | …`) n'aurait pas su exprimer `{ erp: { categories: ["N1",…,"N4"] } }`,
qui est précisément ce dont le service de sécurité a besoin.

Une fiche peut porter **plusieurs typologies, lues en OU**. Nécessaire pour les
exercices, dus par deux fondements indépendants : le champ de R. 4227-34 côté
travail, et le 5° de R. 143-44 côté ERP. Une typologie unique ne saurait pas le
dire — le moteur lit les régimes en OU mais les seuils en ET, si bien que
`{ travail: true, erp: true, personnesPresentesMin: 51 }` imposerait le seuil
aux ERP aussi, et un ERP de 5ᵉ catégorie de vingt personnes échapperait
silencieusement à la fiche.

### 4. Les fiches à saisie libre partagent un seul modèle

Quinze fiches ne font que poser des questions et ranger des réponses. Leur
donner un modèle chacune serait huit tables pour une seule mécanique. Elles
partagent `FicheRegistre` (`sectionId`, `contenu` JSONB), et ce sont les
**questions** qui varient — décrites en TypeScript versionné
(`src/lib/registre/champs.ts`), au même titre que le référentiel d'obligations
(ADR-003). Une question posée à un dirigeant se relit dans l'historique Git.

Trois formes de saisie :

- **`etablissement`** — la réponse vit déjà sur une colonne. La fiche la montre
  et renvoie à l'écran où elle se modifie ; elle ne stocke **rien** en propre.
  Deux emplacements pour la même donnée divergent toujours, et c'est le
  registre — celui qu'on présente à la commission — qui afficherait la valeur
  périmée. Un test verrouille l'invariant, un autre vérifie que chaque champ
  marqué « en base » désigne une colonne réelle de `schema.prisma`.
- **`formulaire`** — un jeu de réponses, mis à jour par upsert.
- **`journal`** — des lignes **append-only**. Un journal de sécurité ne se
  corrige pas, il se complète : une ligne réécrite après coup ne prouve plus
  rien, et c'est l'immuabilité de la suite qui fait la valeur de la pièce.

Les exercices de sécurité restent **hors** de ce mécanisme : ils portent une
périodicité, soldent une ligne du calendrier et reçoivent deux visas. Ce n'est
pas un formulaire, c'est une preuve datée — leur modèle propre viendra.

### 5. Toutes les valeurs sont des chaînes

Y compris les nombres et les dates. Ces réponses s'impriment, elles ne se
calculent jamais. Une date reste une clé de jour civil « AAAA-MM-JJ »
(ADR-011) : un registre consigne le jour d'un exercice, pas l'instant UTC
auquel quelqu'un a rempli le champ.

### 6. L'écran dit ce qui manque, et à qui la faute

Une fiche due que l'application ne recueille pas est un trou **du produit**, pas
du dirigeant. Elle reste affichée, annoncée comme telle, et n'est comptée ni
dans les fiches faites ni dans celles à remplir. Une fiche tenue ailleurs dans
l'outil (parc d'équipements, calendrier) est signalée comme telle sans être
déclarée remplie : on ne l'a pas vérifié.

Le compteur dit l'état de remplissage, jamais la conformité (règle 8 du
CLAUDE.md). La note sous la jauge le dit en toutes lettres.

## Ce qui a été vérifié, et ce qui ne l'a pas été

Le référentiel de ce produit n'accepte que des sources primaires relues. La même
règle vaut pour cet ADR.

**Vérifié en verbatim sur Légifrance le 2026-08-26** : R. 143-44 CCH (version au
1ᵉʳ juillet 2026, cinq rubriques et renvoi) ; R. 141-10 et R. 141-11 CCH ;
R. 146-35 CCH ; PE 1 § 1 de l'arrêté du 25 juin 1980 ; le rattachement des
articles MS 45 à MS 52 au Livre II, Titre Iᵉʳ, Chapitre XI, Section 4 ; l'absence
de renvoi à un article MS dans PE 1 à PE 4.

**Non vérifié en première main, à recouper avant tout usage nouveau** :

- Les chapitres du Livre III au-delà de PE 4, et les dispositions particulières
  par type. Un renvoi exprès à un article MS qui y subsisterait rétablirait la
  fiche « service de sécurité » pour le type concerné. La restriction aux
  catégories N1 à N4 est donc **assumée sous ce résidu**, et il est écrit dans
  `sections.ts`.
- L'abrogation de R. 146-21 : corroborée par la note d'audit du référentiel
  (`incendie.ts`) et par la recherche, mais l'article abrogé n'a pas été relu
  directement.
- Le verbatim de L. 4711-1 et L. 4711-5, de D. 4711-2 et D. 4711-3.
- La version de R. 4227-37 au 1ᵉʳ janvier 2027, et les articles R. 144-16 et
  R. 144-17 créés à cette date pour les bâtiments à usage professionnel.

**Veille à programmer** : le décret n° 2025-1100 a une seconde vague au
**1ᵉʳ janvier 2027**. Elle touche R. 4227-37 du Code du travail — dont dépend
tout le champ des exercices côté travail — et crée un régime de registre pour
les bâtiments à usage professionnel. À relire à cette date.

## Conséquences

- Le catalogue de fiches devient un référentiel de plus à tenir. Il suit les
  mêmes règles que celui des obligations : sources primaires, notes
  d'amendement, tests d'invariants.
- `sectionId` n'est pas une clé étrangère — le catalogue n'est pas en base. Un
  identifiant renommé orphelinerait des réponses ; un test relit le catalogue
  pour l'empêcher.
- Sept catégories d'équipement manquent encore à l'enum (`PARATONNERRE`,
  `PORTE_COUPE_FEU`, `CLAPET_COUPE_FEU`, `COLONNE_SECHE`, `COLONNE_HUMIDE`,
  `RESSOURCE_EAU`, `ARI`). Les déclencheurs correspondants sont typés
  `readonly string[]` en attendant, ce qui est un relâchement assumé et
  documenté : à resserrer dès que l'enum les porte, pour que le compilateur
  signale les fiches orphelines.
- Le référentiel ne connaît toujours ni le 5° de R. 143-44, ni R. 141-10, ni
  R. 141-11. L'obligation `incendie-registre-securite` est modélisée
  `{ travail: true }` en MVP, ce que ses propres `notesInternes` signalent. À
  reprendre.

## Alternatives écartées

**Un registre unique imprimé pour tous.** Simple, et faux : il facture au
dirigeant de TPE la complexité d'un ERP de 1ʳᵉ catégorie, et rend le document
illisible là où il devrait être une check-list de cinq lignes.

**Un modèle Prisma par fiche.** Huit tables, huit formulaires, huit migrations,
pour une mécanique unique. Écarté au profit d'un modèle générique piloté par un
catalogue — sauf pour les exercices, dont la nature diffère réellement.

**Une union de régimes propre au registre.** Deuxième vocabulaire pour la même
question, garanti de diverger du premier le jour où l'un des deux est corrigé.
