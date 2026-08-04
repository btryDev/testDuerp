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

La `TypologieApplication` d'une obligation agrège plusieurs critères qui
s'appliquent **en ET** :

| Champ            | Effet sur le matching                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `travail: true`  | l'établissement doit avoir `estEtablissementTravail = true`                                                                                                          |
| `erp: true`      | l'établissement doit être ERP (toutes catégories)                                                                                                                    |
| `erp: { categories: [...] }` | l'établissement doit être ERP **et** sa `categorieErp` doit appartenir à la liste                                                                        |
| `igh: true`      | l'établissement doit être IGH                                                                                                                                        |
| `igh: { classes: [...] }`    | l'établissement doit être IGH **et** sa `classeIgh` doit appartenir à la liste                                                                           |
| `habitation: true`| l'établissement doit avoir `estHabitation = true`                                                                                                                   |
| `effectifMin`    | `effectifSurSite` doit être ≥ `effectifMin` (bornes incluses)                                                                                                        |
| `effectifMax`    | `effectifSurSite` doit être ≤ `effectifMax` (bornes incluses)                                                                                                        |

**Règle importante** : si la typologie d'une obligation est vide (aucun
champ défini), elle est **rejetée**. C'est un garde-fou contre les
obligations mal rédigées — un test dédié le vérifie dans le référentiel.

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
```

Les propriétés lues sont celles du champ `caracteristiques` (JSON) de
l'équipement en base, renseigné par le formulaire de déclaration (étape 4).
Si la propriété est absente ou d'un type incompatible (ex. string au lieu
de number), la condition est considérée comme **non satisfaite** — jamais
comme « ignorée ».

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
obligation: aeration-hotte-pro-annuelle
equipementsConcernes: [eq-hotte (Hotte cuisine)]
raisons:
  - "ERP catégorie 5 (règle limitée à 1, 2, 3, 4, 5)"
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

Les tests du moteur (`src/lib/matching/engine.test.ts`, 42 scénarios) et
les tests de cohérence du référentiel (`src/lib/referentiels/conformite/
conformite.test.ts`, 18 invariants) vérifient ces règles.

## Limites connues

- **Pas de filtrage par type ERP** (M, N, W…) : seules les catégories N1-N5
  sont filtrées. L'obligation « hotte pro annuelle » s'applique à tout ERP
  déclarant une hotte, quel que soit son type ERP. Pour un W (bureau) qui
  déclarerait une hotte, c'est une sur-application ; en pratique aucun W
  ne déclare de hotte. À affiner si besoin en étape 11 par ajout d'un
  champ `types` dans `TypologieApplication.erp`.
- **Pas de règle d'effectif pour l'alarme incendie** : l'obligation
  d'alarme de type 4 à partir de 50 salariés (R. 4227-29) est implicitement
  couverte par le fait que l'utilisateur déclare un équipement
  `ALARME_INCENDIE`. Une règle `effectifMin: 50` pourrait être ajoutée
  pour rendre l'obligation applicable automatiquement — reporté à l'étape 6
  quand le générateur de calendrier saura aussi créer les équipements
  manquants.
- **Pas de logique temporelle** : le moteur détermine *quelles* obligations
  s'appliquent, pas *quand* la prochaine vérification est due. Cela relève
  de l'étape 6 (générateur de calendrier).

## Tests de non-régression

Toute modification du moteur doit laisser passer :

- `src/lib/matching/engine.test.ts` — 42 scénarios couvrant les
  combinaisons typologie × équipement × effectif + conditions.
- `src/lib/referentiels/conformite/conformite.test.ts` — cohérence du
  référentiel.

Avant d'ajouter une règle métier transverse (ex. « toute obligation marquée
criticité ≥ 4 doit avoir un réalisateur agréé »), écrire d'abord le test
dans le référentiel — pas dans le moteur.
