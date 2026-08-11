# Règles de matching équipements ↔ obligations

Ce document décrit la logique déterministe du moteur `src/lib/matching/`
(étape 5 du plan V2). Il est destiné au support, à l'audit et à quiconque
doit comprendre *pourquoi* l'outil indique qu'une obligation s'applique.

## Contrat

```typescript
determineObligationsApplicables(
  etablissement: EtablissementMatching,
  equipements: EquipementMatching[],
  options?: { obligations?: Obligation[] },
): ObligationApplicable[]
```

Le moteur est une **fonction pure** : pas d'I/O, pas d'horloge, pas
d'aléatoire. Deux appels avec les mêmes entrées donnent le même résultat.
C'est la condition d'auditabilité posée par CLAUDE.md (principe zéro-IA).

Chaque obligation retenue sort avec :

- `equipementsConcernes` : la liste des équipements qui déclenchent la règle
  pour cet établissement.
- `raisons` : les explications textuelles (mode *explain*) qui permettent à
  l'UI d'afficher « cette obligation s'applique parce que… ».

## Algorithme

Pour chaque `Obligation` du référentiel :

1. **Typologie** — la typologie de l'obligation doit être compatible avec
   celle de l'établissement (cf. section suivante). Sinon, l'obligation est
   rejetée.
2. **Équipements** — au moins un `Equipement` de l'établissement doit avoir
   sa catégorie dans `obligation.categoriesEquipement`.
3. **Conditions** — si l'obligation a des `conditions[]`, pour chaque
   équipement candidat, on vérifie que **toutes** les conditions dont la
   `categorie` cible la catégorie de cet équipement sont satisfaites par
   lui.
4. Si au moins un équipement passe les étapes 2 et 3, l'obligation est
   retenue avec la liste des équipements déclencheurs et les raisons
   textuelles.

## Typologie (ADR-004)

> **Amendement 2026-08 — correction ascenseurs.** Les critères de régime
> **positifs** (`travail: true`, `erp: true | {categories}`,
> `igh: true | {classes}`, `habitation: true`) s'appliquent désormais
> **en OU entre eux** : l'établissement doit en satisfaire au moins un.
> Une obligation déclarant `{ travail: true, erp: true, igh: true }`
> (les 6 obligations ascenseurs) s'applique donc aux établissements de
> travail **ou** ERP **ou** IGH — c'était l'intention rédactionnelle, mais
> l'ancien moteur évaluait ces lignes en ET, si bien qu'un ERP non-IGH
> avec ascenseur ne recevait aucune obligation ascenseur. Les critères
> **négatifs** (`travail: false`, `erp: false`, …) restent des exclusions
> en ET, et `effectifMin`/`effectifMax` restent en ET avec le reste.
> Sans effet sur le reste du référentiel : toutes les autres obligations
> ne déclarent qu'un seul régime positif, et pour un critère unique
> OU ≡ ET.

> **Amendement 2026-08 — restrictions de catégorie en ET.** La disjonction
> ci-dessus portait un piège : une obligation déclarant
> `{ travail: true, erp: { categories: ["N1"] } }` aurait été matchée par un
> ERP de 5ᵉ catégorie employeur *via la seule branche « travail »*,
> contournant en silence la restriction de catégorie. Les restrictions de
> **catégorie ERP** et de **classe IGH** sont donc évaluées **en ET**, avant
> la disjonction : si l'établissement relève du régime restreint (il *est*
> ERP, il *est* IGH) mais tombe hors de la liste — y compris parce que sa
> catégorie est inconnue —, l'obligation est rejetée quels que soient les
> autres régimes. Un établissement qui ne relève pas du régime restreint
> (un bureau non-ERP) n'est, lui, pas concerné : il est simplement hors de
> cette branche.

La `TypologieApplication` d'une obligation agrège plusieurs critères.
Les lignes de régime (travail/ERP/IGH/habitation) s'appliquent **en OU
entre elles** ; les exclusions (`false`), les restrictions de catégorie
ou de classe, et l'effectif s'appliquent **en ET** :

| Champ            | Critère (régimes : matché si… / effectif : requis)                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `travail: true`  | matché si `estEtablissementTravail = true`                                                                                                                           |
| `erp: true`      | matché si l'établissement est ERP (toutes catégories)                                                                                                                |
| `erp: { categories: [...] }` | matché si l'établissement est ERP **et** sa `categorieErp` appartient à la liste                                                                         |
| `igh: true`      | matché si l'établissement est IGH                                                                                                                                    |
| `igh: { classes: [...] }`    | matché si l'établissement est IGH **et** sa `classeIgh` appartient à la liste                                                                            |
| `habitation: true`| matché si `estHabitation = true`                                                                                                                                    |
| `effectifMin`    | requis (ET) : `effectifSurSite` ≥ `effectifMin` (bornes incluses)                                                                                                    |
| `effectifMax`    | requis (ET) : `effectifSurSite` ≤ `effectifMax` (bornes incluses)                                                                                                    |

**Règle importante** : si la typologie d'une obligation est vide (aucun
champ défini), elle est **rejetée**. C'est un garde-fou contre les
obligations mal rédigées — un test dédié le vérifie dans le référentiel.

### Forme normalisée : `erp: true` ou `erp: { categories }`

`erp: true` et `erp: { categories: ["N1", …, "N5"] }` ne sont **pas**
équivalents, alors que les deux formes cohabitaient dans le référentiel.
La seconde exige en plus que `categorieErp` soit renseignée : un ERP dont
la catégorie est inconnue perd l'obligation. Écrire une restriction qui
n'exclut rien revient donc à créer un faux négatif silencieux.

Convention retenue, verrouillée par un test :

- le texte ne restreint pas par catégorie → **`erp: true`** ;
- le texte restreint réellement → `erp: { categories: [...] }` avec la
  liste des seules catégories visées (jamais les cinq).

Même logique pour `igh: true` et `igh: { classes: [...] }`.

### Cas du cumul ERP × IGH

Un établissement peut être ERP cat N1 **et** IGH classe GHZ en même temps.
Dans ce cas, toutes les obligations ERP applicables à sa catégorie **et**
toutes les obligations IGH applicables à sa classe sont cumulées. Les
domaines ne sont pas déduits par l'outil : la liste est la somme des
obligations qui matchent chaque ligne de typologie.

### Cas du registre de sécurité

L'obligation `incendie-registre-securite` est modélisée sur `travail: true`
en MVP V2 : en pratique tous les établissements du scope emploient au moins
un salarié. Les références CCH (R. 143-44 ERP / R. 146-21 IGH) restent
citées en `referencesLegales` pour couvrir les cas hors scope sans
multiplier les entrées dans le référentiel. Si un jour le scope inclut des
ERP/IGH sans salarié, cette obligation sera scindée.

## Équipements : catégorie + conditions

Pour qu'une obligation s'applique, **au moins un équipement** de
l'établissement doit :

1. Avoir sa catégorie dans `obligation.categoriesEquipement`.
2. Satisfaire **toutes** les conditions de l'obligation dont la propriété
   `categorie` cible la catégorie de cet équipement.

Si aucune condition ne cible la catégorie d'un équipement, les conditions
sont considérées comme **triviallement satisfaites** pour lui.

### Conditions supportées

```typescript
// Condition sur une propriété numérique (ex. capacité de parking)
{
  type: "equipement_propriete_numerique",
  categorie: "VMC",
  propriete: "nbVehiculesParkingCouvert",
  operateur: ">",   // ">" | ">=" | "<" | "<=" | "=="
  valeur: 250,
}

// Condition sur une propriété booléenne (ex. présence groupe électrogène)
{
  type: "equipement_propriete_booleenne",
  categorie: "INSTALLATION_ELECTRIQUE",
  propriete: "aGroupeElectrogene",
  valeur: true,
}

// Condition « maintenue tant que l'utilisateur n'a pas répondu non »
{
  type: "equipement_propriete_non_infirmee",
  categorie: "EXTINCTEUR",
  propriete: "aRobinetsIncendieArmes",
}
```

Les propriétés lues sont celles du champ `caracteristiques` (JSON) de
l'équipement en base, renseigné par le formulaire de déclaration (étape 4).

### Propriété non renseignée : opt-in contre opt-out

C'est le point de sécurité du modèle. Deux comportements coexistent, et le
choix entre les deux n'est pas esthétique :

| Type de condition       | Propriété absente | Sémantique |
| ----------------------- | ----------------- | ---------- |
| `..._numerique`         | non satisfaite    | opt-in     |
| `..._booleenne`         | non satisfaite    | opt-in     |
| `..._non_infirmee`      | **satisfaite**    | opt-out    |

Le type d'une valeur incompatible (string au lieu de number) est traité
comme une absence, jamais comme une valeur « ignorée ».

**Règle de rédaction (amendement 2026-08).** Ajouter une condition à une
obligation **déjà publiée** de criticité ≥ 4 impose la forme
`non_infirmee`. Les équipements déjà en base n'ont évidemment pas la
nouvelle propriété : avec une condition stricte, ils perdraient tous
l'obligation, sans le moindre signal, à la prochaine régénération du
calendrier. Sur une obligation de criticité élevée, une sur-application
visible — que le dirigeant éteint en répondant « non » — vaut toujours
mieux qu'un faux négatif muet.

Côté formulaire, ces propriétés sont donc des questions à **trois états**
(oui / non / « je ne sais pas encore ») et non des cases à cocher : une
case décochée ne distingue pas « non » de « pas encore répondu ».

Trois conditions strictes sur des obligations de criticité ≥ 4 sont
antérieures à cette règle et explicitement tolérées
(`elec-erp-groupe-electrogene-annuel`,
`aeration-travail-locaux-pollution-specifique`,
`aeration-erp-ps-surveillance-qualite-air-sup-250`) : elles n'ont jamais
été appliquées sans réponse, donc personne ne peut les perdre. La liste
est figée dans les tests ; toute nouvelle entrée doit être justifiée.

### Exclusivité PS 32

Les deux obligations `aeration-erp-ps-surveillance-qualite-air-inf-250`
(biennale) et `…-sup-250` (annuelle) sont par construction **mutuellement
exclusives** sur une même VMC : les conditions sont `<= 250` et `> 250`. Si
la propriété `nbVehiculesParkingCouvert` n'est pas renseignée, aucune des
deux ne se déclenche — c'est le comportement attendu (l'utilisateur doit
répondre à la question du parking pour que la règle s'active).

## Mode explain

Pour chaque obligation retenue, le moteur produit une liste de raisons.
Exemples pour un restaurant ERP cat 5 avec hotte déclarée :

```
obligation: cuisson-erp-circuits-extraction-nettoyage
equipementsConcernes: [eq-hotte (Hotte cuisine)]
raisons:
  - "ERP"
  - "équipement déclenche la règle (Hotte cuisine)"
```

Ces raisons sont destinées à :

- **l'affichage en UI** : le détail d'une obligation dans le calendrier
  (étape 6) pourra les afficher dans un panneau « Pourquoi cette règle ? »
- **le support** : un utilisateur qui conteste une obligation doit pouvoir
  consulter la logique qui y mène, sans que le support ait à explorer le
  code
- **l'audit** : les raisons sont déterministes et reproductibles, ce qui
  est exigé pour un outil à valeur légale

## Conséquences pour le référentiel

Toute obligation qui entre dans `src/lib/referentiels/conformite/` doit :

1. Déclarer une `typologies` **non vide** (sinon rejetée par le moteur).
2. Déclarer au moins une catégorie dans `categoriesEquipement`.
3. Si sa portée réelle dépend d'un attribut (ex. présence de groupe
   électrogène), ajouter une `conditions[]` explicite — **pas** de logique
   implicite en commentaire `notesInternes`. Les `notesInternes` sont
   réservées à la documentation interne, pas à la logique d'application.

4. Ne pas dupliquer une obligation déjà présente. Deux entrées fondées sur
   le **même article** (`referencesLegales[0]`), pour la même catégorie
   d'équipement et la même périodicité, sont un doublon : elles produisent
   deux échéances pour un seul travail à faire et faussent les agrégats de
   conformité. Un test le vérifie.
5. Si sa description énonce un seuil d'effectif, le déclarer en
   `effectifMin` / `effectifMax` — un seuil écrit en prose et jamais encodé
   est un seuil qui n'existe pas. Un test le vérifie également.

Les tests du moteur (`src/lib/matching/engine.test.ts`) et les tests de
cohérence du référentiel
(`src/lib/referentiels/conformite/conformite.test.ts`) vérifient ces règles.

## Limites connues

- **Pas de filtrage par type ERP** (M, N, W…) : seules les catégories N1-N5
  sont filtrées. Le ramonage annuel des circuits d'extraction s'applique à
  tout ERP déclarant une hotte professionnelle, quel que soit son type ERP.
  Pour un W (bureau) qui déclarerait une hotte, c'est une sur-application ;
  en pratique aucun W ne déclare de hotte. À affiner si besoin par ajout
  d'un champ `types` dans `TypologieApplication.erp`.
- **Frontière 4ᵉ / 5ᵉ catégorie ERP non déductible** : elle dépend d'un
  seuil propre au type d'ERP fixé par le règlement de sécurité, pas d'un
  seuil universel de 300 personnes. La table de ces seuils n'est pas
  encodée (elle n'a pas encore été sourcée article par article sur
  Légifrance), donc `deduireCategorieErpDepuisEffectif` renvoie `null` sous
  300 personnes et la catégorie est **demandée** au dirigeant, la 4ᵉ figurant
  explicitement dans les choix. Enjeu : une 4ᵉ classée à tort en 5ᵉ perd la
  vérification électrique annuelle par organisme agréé (criticité 5) et la
  vérification triennale du SSI. Cf. `src/lib/onboarding/deduction-erp.ts`.
- **Seuils PS × V des équipements sous pression non encodés** : l'arrêté du
  20 novembre 2017 borne son champ par des seuils de pression et de volume
  que le référentiel ne reproduit pas (même raison de sourçage). En
  attendant, les cinq obligations concernées sont bornées par une réponse
  du dirigeant (`estSoumisSuiviEnService`), en mode opt-out.
- **Branche « matières inflammables » de l'exercice semestriel** :
  `incendie-travail-exercice-semestriel` déclare `effectifMin: 51`, mais le
  seuil réglementaire est disjonctif — plus de cinquante personnes **ou**
  manipulation de matières inflammables quel que soit l'effectif. Le moteur
  ne sait pas exprimer un OU entre un critère d'effectif et la présence
  d'un équipement ; la seconde branche n'est donc pas automatisée. Par
  ailleurs le texte vise les personnes *occupées ou réunies*, quand le
  moteur ne dispose que de `effectifSurSite`.
- **Pas de logique temporelle** : le moteur détermine *quelles* obligations
  s'appliquent, pas *quand* la prochaine vérification est due. Cela relève
  de l'étape 6 (générateur de calendrier).
- **Ascenseurs en habitation pure** : les 6 obligations ascenseurs
  déclarent `{ travail, erp, igh }` mais pas `habitation`. Un immeuble
  d'habitation pur (sans salarié, non-ERP, non-IGH) avec ascenseur ne
  reçoit donc aucune obligation ascenseur — limite assumée, le scope V2
  vise les établissements employeurs. Couvert par un test dédié.
- **RIA sans catégorie d'équipement dédiée** : l'enum Prisma
  `CategorieEquipement` n'a pas d'entrée RIA. L'obligation reste rattachée
  à `EXTINCTEUR` et bornée par la propriété `aRobinetsIncendieArmes`. À
  rebasculer sur une catégorie propre le jour où l'enum évoluera.

## Tests de non-régression

Toute modification du moteur doit laisser passer :

- `src/lib/matching/engine.test.ts` — combinaisons typologie × équipement ×
  effectif × conditions, dont la disjonction des régimes, la conjonction
  des restrictions de catégorie, la sémantique « non infirmée » et le
  verrou « aucun établissement existant ne perd une obligation de criticité
  ≥ 4 » (amendements 2026-08).
- `src/lib/referentiels/conformite/conformite.test.ts` — cohérence du
  référentiel : conditions vivantes, absence de doublon, seuils d'effectif
  encodés, forme normalisée des typologies.
- `src/lib/equipements/schema.test.ts` — toute propriété conditionnant une
  obligation est bien collectée par le formulaire, et « non » reste distinct
  de « pas encore répondu ».

Avant d'ajouter une règle métier transverse (ex. « toute obligation marquée
criticité ≥ 4 doit avoir un réalisateur agréé »), écrire d'abord le test
dans le référentiel — pas dans le moteur.
