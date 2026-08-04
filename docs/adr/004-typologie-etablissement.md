# ADR-004 — Représentation de la typologie d'établissement

- **Date** : 2026-04-21
- **Statut** : Acceptée
- **Auteur** : Claude Code (sur brief Paloma)
- **Relatif à** : ADR-001, ADR-003, `spec/PLAN.md` étapes 2, 3, 5

## Contexte

Un établissement relève d'un ou plusieurs régimes réglementaires qui conditionnent ses obligations :

1. **Code du travail** — tout établissement qui emploie au moins un salarié (R. 4121 et suivants). Toujours applicable dès qu'il y a un contrat de travail.
2. **ERP** (Établissement Recevant du Public) — arrêté du 25 juin 1980 et arrêtés sectoriels (PE, GE, PO, etc.). Classé par **type** (M = magasin, N = restaurant, U = soins, R = enseignement, etc.) et par **catégorie** :
   - 1ʳᵉ catégorie : effectif public > 1500
   - 2ᵉ catégorie : 701 à 1500
   - 3ᵉ catégorie : 301 à 700
   - 4ᵉ catégorie : seuil du type jusqu'à 300
   - 5ᵉ catégorie : petits établissements sous le seuil de déclaration (règles PE)
3. **IGH** (Immeuble de Grande Hauteur) — arrêté du 30 décembre 2011. Hauteur > 28 m (habitation) ou > 50 m (autres). Classe GHA, GHW, GHO, GHR, GHS, GHU, GHZ, ITGH.
4. **CCH** (Code de la construction et de l'habitation) — habitation collective, règles de sécurité dédiées (paratonnerres, ascenseurs, ramonage…).

Un établissement n'est pas « soit ERP soit IGH soit Travail » : il est **toujours** soumis au Code du travail, **peut** en plus être ERP, **peut** en plus être IGH (cumul possible). Les obligations se cumulent.

La question : comment modéliser cette typologie pour que le moteur de matching (étape 5) puisse dire « cette obligation s'applique » de manière simple et correcte ?

## Décision

On utilise une **composition de flags** + un enum de catégorie, pas un enum unique.

```prisma
model Etablissement {
  // ... (cf. ADR-001)

  // Flags de régime réglementaire — combinables, non exclusifs
  estEtablissementTravail  Boolean @default(true)   // true dès qu'il y a un salarié — quasi toujours true
  estERP                   Boolean @default(false)
  estIGH                   Boolean @default(false)
  estHabitation            Boolean @default(false)  // rare pour TPE/PME, utile pour multi-activité

  // Précisions conditionnelles (null si le flag correspondant est false)
  typeErp                  TypeErp?                 // enum M, N, U, R, L, O, S, T, V, W, X, Y, PA, CTS, SG, PS, REF, GA, OA, EF (~20 valeurs)
  categorieErp             CategorieErp?            // enum N1..N5
  classeIgh                ClasseIgh?               // enum GHA, GHW, GHO, GHR, GHS, GHU, GHZ, ITGH

  // ...
}

enum TypeErp {
  M  // Magasin de vente, centre commercial
  N  // Restaurant, débit de boissons
  O  // Hôtel, pension de famille
  L  // Salle à usage d'audition, conférence, réunion, spectacle
  P  // Salle de danse, salle de jeux
  R  // Établissement d'enseignement, colonies de vacances
  S  // Bibliothèque, centre de documentation
  T  // Salle d'exposition
  U  // Établissement de soins
  V  // Établissement de culte
  W  // Administration, banque, bureau
  X  // Établissement sportif couvert
  Y  // Musée
  PA // Établissement de plein air
  CTS // Chapiteau, tente, structure
  SG  // Structure gonflable
  PS  // Parc de stationnement couvert
  REF // Refuge de montagne
  GA  // Gare accessible au public
  OA  // Hôtel-restaurant d'altitude
  EF  // Établissement flottant
}

enum CategorieErp {
  N1  // 1ʳᵉ catégorie (> 1500)
  N2  // 2ᵉ (701-1500)
  N3  // 3ᵉ (301-700)
  N4  // 4ᵉ (jusqu'à 300, seuil du type)
  N5  // 5ᵉ (sous seuil — règles PE de l'arrêté du 22 juin 1990)
}

enum ClasseIgh {
  GHA  // habitation
  GHW  // bureaux
  GHO  // hôtel
  GHR  // enseignement
  GHS  // archives
  GHU  // sanitaire
  GHZ  // mixte
  ITGH // immeuble de très grande hauteur
}
```

### Pourquoi des flags et pas un enum ?

Parce que **les régimes se cumulent**. Un restaurant qui ouvre au public à plus de 300 couverts est :
- Établissement de travail (Code du travail)
- ERP (type N, catégorie selon effectif accueilli)

Un enum unique forcerait à créer un état « ERP_TYPE_N_CAT_4_TRAVAIL » qui ne scale pas. Les flags permettent au moteur de matching de faire simplement :
```typescript
// Obligation "vérification électrique annuelle ERP" :
if (etablissement.estERP) applique();
// Obligation "contrôle périodique R. 4226-16" (travail) :
if (etablissement.estEtablissementTravail) applique();
// Une obligation spécifique ERP 1ʳᵉ catégorie :
if (etablissement.estERP && etablissement.categorieErp === "N1") applique();
```

### Invariants applicatifs
- Si `estERP = false`, alors `typeErp` et `categorieErp` sont null.
- Si `estIGH = false`, alors `classeIgh` est null.
- `estEtablissementTravail` a la valeur par défaut `true` parce que 99 % des cas tombent dans ce régime ; on permet `false` uniquement pour un futur cas « pur habitation sans salarié ».
- Un même établissement peut être `estERP && estIGH` simultanément.

Ces invariants sont vérifiés applicativement dans les schémas Zod de création/édition.

### Implication pour le référentiel (ADR-003)

Le type `TypologieApplication` dans `Obligation` devient un ensemble de **critères combinables**, pas un enum unique :

```typescript
export type TypologieApplication = {
  travail?: boolean;                          // undefined = indifférent, true = requis, false = exclu
  erp?: boolean | { categories: CategorieErp[] };
  igh?: boolean | { classes: ClasseIgh[] };
  habitation?: boolean;
  effectifMin?: number;                       // seuil de déclenchement
  effectifMax?: number;
};
```

Exemple pour « Contrôle périodique annuel des installations électriques en ERP » (arrêté du 25 juin 1980, art. EL 19) :
```typescript
typologies: { erp: true, travail: true }
// équivaut à "applique si estERP && estEtablissementTravail"
```

Exemple pour « Dispositifs de surveillance qualité de l'air, parcs couverts ERP > 250 véhicules » :
```typescript
typologies: { erp: true }
// + condition d'application sur l'équipement (parking couvert + nbVehicules > 250)
```

## Conséquences

### Positives
- Le modèle colle à la réglementation : régimes cumulables, catégorie en précision du régime ERP.
- Le moteur de matching reste déterministe et explicable (« ERP cat. N1 + IGH GHZ → cumul des deux listes d'obligations »).
- L'UI de création d'établissement peut afficher les flags comme des cases à cocher avec dépliage conditionnel (typeErp + categorieErp seulement si la case ERP est cochée).
- Ajouter un régime futur (ICPE, ATEX) = ajouter un flag + précisions, sans casse.

### Négatives / coûts
- Plus de colonnes qu'un enum. Mais PostgreSQL n'a aucun problème avec ça.
- L'UI de création doit gérer la cohérence flag ↔ précision (Zod s'en charge côté serveur, react-hook-form côté client).
- L'utilisateur TPE moyen ne sait pas toujours s'il est ERP 5ᵉ catégorie ou non. **Mitigation** : un assistant dans l'UI de création d'établissement avec des questions simples (« accueillez-vous du public ? environ combien de personnes simultanément ? ») qui déduit la catégorie. Ce n'est pas une « IA » — c'est une table de décision codée en TypeScript, conforme à l'ED 6419 (INRS) sur la classification ERP.

### Neutres
- Un établissement purement habitation sans salarié n'est pas dans le périmètre V2 (exclusion explicite dans CLAUDE.md). Le flag `estHabitation` reste utile quand une entreprise gère un immeuble d'habitation en plus de son activité principale (rare en TPE).

## Alternatives rejetées

### Alternative A — Enum unique `TypologieEtablissement`
```prisma
enum Typologie { TRAVAIL_CLASSIQUE, ERP_CAT_1, ERP_CAT_2, ..., ERP_CAT_5, IGH_GHA, IGH_GHW, ... }
```
Rejetée : ne permet pas le cumul. Un restaurant ERP type N cat 4 + IGH GHW devient indémêlable.

### Alternative B — Enum `Typologie` + liste de précisions en JSON
```prisma
typologie Typologie
precisions Json  // { categorieErp, classeIgh }
```
Rejetée : perd le typage, force du parsing applicatif, pas queryable.

### Alternative C — Table de jointure `EtablissementRegime`
```prisma
model EtablissementRegime {
  etablissementId String
  regime          String   // "TRAVAIL", "ERP", "IGH"
  precisions      Json?
}
```
Rejetée : over-engineered. Les régimes sont un petit ensemble fermé (4 flags), pas une liste extensible.

### Alternative D — Mapping implicite via le code NAF
Rejetée : le NAF décrit une **activité** pas un **régime**. Un même NAF 56.10A (restauration traditionnelle) peut être ERP cat 4, cat 5, ou même un traiteur non-ERP. Le régime se déclare explicitement.

## Checklist de mise en œuvre

1. **Étape 1** : ajouter les colonnes + enums au schema.prisma.
2. **Étape 1** : à la migration des établissements par défaut (ADR-001), mettre `estEtablissementTravail = true`, tout le reste à `false`/null — valeur conservatrice, l'utilisateur ajustera.
3. **Étape 2** : UI de création/édition d'établissement avec flags + dépliage conditionnel + assistant de classification ERP.
4. **Étape 3** : type `TypologieApplication` dans le référentiel conformité.
5. **Étape 5** : moteur de matching qui consomme `Etablissement` + `TypologieApplication`.

## Notes de conformité

- Arrêté du 25 juin 1980 (dispositions générales du règlement de sécurité contre les risques d'incendie et de panique dans les ERP) : base de la typologie ERP.
- Arrêté du 22 juin 1990 : dispositions applicables aux ERP de 5ᵉ catégorie (PE).
- Arrêté du 30 décembre 2011 : règlement de sécurité pour la construction des IGH.
- Articles R. 143-1 et R. 143-2 du Code de la construction et de l'habitation : définitions ERP et catégories.
- Articles R. 146-3 et suivants du Code de la construction et de l'habitation : définitions IGH et classes.

Sources ajoutées en commentaire dans le fichier `src/lib/referentiels/types-communs.ts` au moment de la mise en œuvre.
