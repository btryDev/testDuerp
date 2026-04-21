# ADR-001 — Introduction de l'entité `Etablissement`

- **Date** : 2026-04-21
- **Statut** : Acceptée
- **Auteur** : Claude Code (sur brief Paloma)
- **Relatif à** : `spec/PLAN.md` étape 0, `prisma/schema.prisma`

## Contexte

Dans le MVP DUERP, le modèle est `Entreprise → Duerp → UniteTravail → Risque → Mesure`. L'entreprise est la racine, et on suppose implicitement qu'elle n'a qu'un seul site, une seule activité, un seul DUERP actif.

La V2 élargit le périmètre : on gère **plusieurs établissements** par entreprise (groupe avec plusieurs restaurants, une boutique + un bureau, une SARL avec plusieurs boutiques). Chaque établissement a :
- Son adresse propre
- Une **typologie réglementaire** (ERP avec catégorie N, IGH, établissement de travail classique)
- Son effectif sur site (distinct de l'effectif juridique de l'entreprise)
- Ses propres équipements déclarés
- Son propre DUERP (art. R. 4121-1 : obligation par unité de travail, en pratique découpée par site)
- Son propre calendrier de vérifications périodiques

Le Code du travail (R. 4121-1) et le règlement de sécurité ERP (arrêté du 25 juin 1980) parlent tous deux d'« établissement » comme objet de référence pour les obligations. Le DUERP est tenu **au niveau de l'établissement** dans la jurisprudence courante dès que l'entreprise a plusieurs sites.

La question est donc : où placer cette entité dans le modèle ?

## Décision

On introduit `Etablissement` entre `Entreprise` et le reste du modèle.

```
Entreprise 1─N Etablissement 1─N Duerp
                              1─N Equipement
                              1─N Verification (via Equipement + Obligation)
                              1─N Action
```

Concrètement :
- `Entreprise` reste une entité juridique (raison sociale, SIRET, NAF principal, effectif global).
- `Etablissement` porte adresse, typologie réglementaire, effectif sur site, éventuellement code NAF spécifique, catégorie ERP si applicable.
- `Duerp` est déplacé : `duerp.etablissementId` remplace `duerp.entrepriseId` (on accède à l'entreprise via `duerp.etablissement.entreprise`).
- `UniteTravail` reste rattachée au `Duerp` comme aujourd'hui.
- `Equipement`, `Verification`, `RapportVerification`, `Action` seront rattachés directement à `Etablissement` (avec éventuellement `uniteTravailId?` pour rattacher une action à une unité du DUERP — voir ADR-002).

### Règle de migration des données existantes

Chaque `Entreprise` existante reçoit **un établissement par défaut** créé automatiquement lors de la migration V2 :
- `Etablissement.raisonDisplay` = `Entreprise.raisonSociale`
- `Etablissement.adresse` = `Entreprise.adresse`
- `Etablissement.typologie` = `TRAVAIL_CLASSIQUE` (valeur conservatrice, pas d'hypothèse ERP/IGH sans info)
- `Etablissement.effectifSurSite` = `Entreprise.effectif`
- `Etablissement.codeNaf` = `Entreprise.codeNaf`

Les `Duerp` existants sont réattachés à cet établissement par défaut (`duerp.etablissementId = etablissementParDefaut.id`). Leur identité ne change pas, leurs versions restent valides.

## Conséquences

### Positives
- Alignement avec la réalité : la V2 impose une granularité établissement, l'ajouter maintenant évite un refactor majeur plus tard.
- Les modules vérifications / équipements / registre de sécurité ont un point d'ancrage naturel (l'`Etablissement`).
- Le DUERP reste conforme à l'esprit de R. 4121 — un DUERP par établissement est la pratique la plus fréquente quand l'entreprise est multi-sites.
- Le tableau de bord peut agréger plusieurs établissements d'une même entreprise si utile (V3), sans refactor.

### Négatives / coûts
- La migration touche toutes les pages actuelles : liste DUERPs, formulaires, layout header.
- Le chemin `/duerp/[id]` reste, mais le contexte affiché passe d'« entreprise » à « établissement ». Il faudra ajouter un menu de bascule entre établissements d'une même entreprise.
- Les snapshots JSON existants ne connaissent pas `Etablissement`. Ils restent valides en lecture (pas de migration destructrice) mais les nouveaux snapshots V2 enrichissent le format avec une section `etablissement`.

### Neutres
- Aucune dette : le MVP existant ne fait aucune hypothèse de type « l'entreprise a toujours une seule adresse ». On passe simplement d'1 à N.

## Alternatives rejetées

### Alternative A — Garder `Entreprise` comme racine et ajouter `site` comme un simple champ optionnel
Rejetée : ne résout pas la multiplicité (un seul champ par entreprise), ne permet pas de typologie réglementaire propre, et oblige à encoder le site dans le DUERP au lieu du modèle. Dette immédiate.

### Alternative B — Lier `Equipement` et `Verification` directement à l'entreprise, garder le DUERP lié à l'entreprise
Rejetée : même problème. Un restaurant et un bureau dans la même SARL n'ont ni les mêmes obligations de vérification, ni les mêmes risques. Il faut forcément un échelon intermédiaire.

### Alternative C — Utiliser un champ `Duerp.adresseSite` sans créer de modèle
Rejetée : dégrade la qualité du modèle, empêche de rattacher un équipement à un site sans passer par le DUERP (qui pourtant n'est qu'un des 4 modules).

### Alternative D — Tout rattacher à l'entreprise et traiter la multiplicité dans l'UI via un filtre « site »
Rejetée : n'importe quel listing (calendrier, actions, registre) devient une jointure à plat avec des risques de fuite entre établissements. Modèle plat, pas scalable.

## Mise en œuvre (indicative, pas exécutée à l'étape 0)

Voir `docs/schema-prisma-v2-propose.prisma` pour le schéma complet proposé. Extrait pertinent :

```prisma
model Entreprise {
  id            String          @id @default(cuid())
  raisonSociale String
  siret         String?
  codeNaf       String
  effectif      Int
  adresse       String          // siège juridique
  etablissements Etablissement[]
}

model Etablissement {
  id               String           @id @default(cuid())
  entrepriseId     String
  entreprise       Entreprise       @relation(fields: [entrepriseId], references: [id], onDelete: Cascade)
  raisonDisplay    String           // "Restaurant du Marché", ou raison sociale si mono-site
  adresse          String
  codeNaf          String?          // null = hérite d'Entreprise.codeNaf
  typologie        TypologieEtablissement
  categorieErp     CategorieErp?    // null si typologie != ERP
  effectifSurSite  Int
  duerps           Duerp[]
  equipements      Equipement[]
  verifications    Verification[]
  actions          Action[]
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
}
```

La typologie elle-même est traitée dans ADR-004.

## Notes de conformité

- Le DUERP reste **par unité de travail** (R. 4121-1), ce que le modèle respecte via `UniteTravail`. L'établissement est un regroupement en amont qui ne modifie pas cette obligation.
- Dès qu'une entreprise a plusieurs établissements, l'article R. 4121-2 s'applique à chacun — la mise à jour annuelle est à faire pour chaque DUERP.
