# ADR-002 — Unification des actions correctives dans une entité `Action`

- **Date** : 2026-04-21
- **Statut** : Acceptée
- **Auteur** : Claude Code (sur brief Paloma)
- **Relatif à** : ADR-001, `spec/PLAN.md` étapes 1 et 8

## Contexte

Le MVP DUERP gère des **mesures de prévention** (`Mesure`) rattachées aux risques du DUERP. Elles ont un type (suppression / réduction source / protection collective / EPI / formation / organisationnelle — cf. art. L. 4121-2), un statut (`existante` | `prevue`), une échéance, un responsable.

La V2 introduit un second type d'actions correctives : les **levées d'écart** issues des rapports de vérification périodique (électricité, incendie, etc.). Quand un rapport mentionne un écart, il faut le tracer, définir un responsable, une échéance, et stocker le justificatif de levée.

Les deux concepts ont le même ADN :
- Un libellé
- Une origine (un risque du DUERP **ou** une vérification)
- Un type (la hiérarchie L. 4121-2 s'applique aussi aux écarts — une mise en conformité électrique peut être une suppression à la source ou seulement organisationnelle)
- Un statut (ouverte / en cours / levée / abandonnée)
- Une échéance, un responsable
- Un justificatif de levée (commentaire, fichier, nouvelle vérification)

Il y a donc un choix à faire : deux tables séparées, ou une table `Action` unifiée ?

## Décision

On unifie dans une seule entité `Action` qui remplace `Mesure`. Une action est rattachée **soit** à un risque du DUERP, **soit** à une vérification (écart détecté), mais jamais aux deux simultanément.

```prisma
model Action {
  id              String       @id @default(cuid())
  etablissementId String
  etablissement   Etablissement @relation(fields: [etablissementId], references: [id], onDelete: Cascade)

  // Origine : exactement l'un des deux champs doit être renseigné.
  risqueId        String?
  risque          Risque?      @relation(fields: [risqueId], references: [id], onDelete: Cascade)
  verificationId  String?
  verification    Verification? @relation(fields: [verificationId], references: [id], onDelete: Cascade)

  libelle         String
  description     String?
  type            TypeAction   // enum hiérarchie L4121-2 (existant)
  statut          StatutAction // "ouverte" | "en_cours" | "levee" | "abandonnee"
  criticite       Int?         // 1-16, hérité du risque ou saisi manuellement
  echeance        DateTime?
  responsable     String?

  // Levée
  leveeLe         DateTime?
  leveeCommentaire String?
  leveeRapportId  String?      // lien optionnel vers un RapportVerification ou une preuve

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([etablissementId, statut])
  @@index([risqueId])
  @@index([verificationId])
}
```

### Invariants applicatifs
- Contrainte **XOR** : exactement un de `risqueId` ou `verificationId` est non-null. Vérifiée au niveau applicatif dans les server actions de création (Prisma ne supporte pas les check constraints en ligne, on pose une CHECK SQL dans la migration).
- Le champ `type` conserve les mêmes valeurs que l'ancien `Mesure.type` pour préserver la compatibilité avec le garde-fou `mesuresUniquementBasNiveau` dans `src/lib/prevention`.
- Le champ `statut` **élargit** celui de `Mesure` : `existante` et `prevue` sont remplacés par `ouverte` / `en_cours` / `levee` / `abandonnee`. Règle de migration explicite ci-dessous.

### Règle de migration des `Mesure` existantes

À la migration V2, chaque `Mesure` devient une `Action` selon la table suivante :

| `Mesure.statut` ancien | `Action.statut` V2 | Notes |
|---|---|---|
| `existante` | `levee` | La mesure est en place ; on marque l'action comme levée à la date `createdAt`. |
| `prevue` (echeance future ou nulle) | `ouverte` | Mesure planifiée, pas encore en place. |
| `prevue` (echeance passée) | `en_cours` | Conservation prudente, l'utilisateur pourra marquer `levee` ou décaler. |

La `Mesure.type` devient `Action.type` sans transformation (même enum).

Le champ `Mesure.referentielMesureId` est préservé sous `Action.referentielMesureId` pour garder le pattern « toggle on/off » du référentiel.

### Impact sur `src/lib/prevention` et `src/lib/duerps/synthese.ts`

Ces modules consomment aujourd'hui une structure `Mesure[]` avec un champ `type`. On les adapte à consommer `Action[]` filtré sur `statut != "abandonnee"`. La logique de la hiérarchie des mesures reste identique.

### Impact sur les snapshots existants

Les `DuerpVersion.snapshot` déjà stockés contiennent un format JSON avec `mesures: MesureSnapshot[]`. Ils restent **immuables et lisibles en l'état**. Le lecteur PDF V2 continue de supporter l'ancien format (chemin de compatibilité). Les nouveaux snapshots V2 utilisent `actions: ActionSnapshot[]`.

## Conséquences

### Positives
- Un seul modèle à apprendre pour l'utilisateur et pour le code.
- La vue « plan d'actions » agrège naturellement DUERP + vérifications.
- Le garde-fou hiérarchie reste au même endroit.
- Le PDF « Plan d'actions de conformité » de l'étape 10 consomme directement `Action[]`.

### Négatives / coûts
- Migration non triviale : `Mesure` → `Action` avec transformation de statut. À tester sur une base avec plusieurs DUERPs et versions.
- Compatibilité snapshot : le builder doit produire un format enrichi tout en restant capable de lire l'ancien. Un test de régression sur les DUERPs validés avant la V2 est critique.
- Le check XOR ne peut pas être exprimé en Prisma seul. On l'écrit dans la migration SQL manuelle :
  ```sql
  ALTER TABLE "Action" ADD CONSTRAINT action_origine_xor
    CHECK (("risqueId" IS NULL) <> ("verificationId" IS NULL));
  ```

### Neutres
- Le vocabulaire UI change : « mesure de prévention » devient « action » dans les listes globales. Dans le wizard DUERP, on peut conserver « mesure » comme libellé pour ne pas perdre le lecteur non-technique — l'entité sous-jacente est la même.

## Alternatives rejetées

### Alternative A — Deux tables distinctes (`MesureDuerp` + `ActionVerification`)
Rejetée : duplication de code (deux CRUD, deux PDF, deux vues liste, deux snapshots). Difficulté à construire une vue unifiée « plan d'actions » sans UNION complexes.

### Alternative B — Table polymorphique générique (champ `originType` + `originId`)
Rejetée : perd les foreign keys, désactive `onDelete: Cascade`, complique Prisma. Le XOR à deux champs explicite est plus simple.

### Alternative C — Étendre `Mesure` avec un champ `verificationId` sans rien renommer
Considérée. Avantage : moins de refactor immédiat. Inconvénient : le nom « mesure » porte une connotation « préventive » (L. 4121-2) qui ne colle pas à la levée d'écart post-contrôle. On préfère renommer maintenant pour éviter qu'une génération future ait une confusion conceptuelle.

### Alternative D — Garder `Mesure` tel quel + ajouter un module indépendant `EcartVerification`
Rejetée : même problème que A, plus une rupture dans la vue « plan d'actions » qui est pourtant une sortie PDF distincte.

## Checklist de mise en œuvre (étape 1)

1. Ajouter enum `TypeAction`, `StatutAction` dans `schema.prisma`.
2. Créer la table `Action` avec FKs optionnelles vers `Risque` et `Verification`.
3. Écrire le script de migration SQL :
   - Création table + contrainte CHECK XOR
   - Copie `Mesure` → `Action` avec transformation `statut`
   - Suppression `Mesure`
4. Adapter `src/lib/mesures/actions.ts` → `src/lib/actions/actions.ts` (nouveau module).
5. Adapter `src/lib/duerps/synthese.ts` et le PDF pour consommer `actions` au lieu de `mesures`.
6. Préserver la compatibilité de lecture des snapshots `DuerpVersion` antérieurs à la V2.
7. Tests unitaires : garde-fou hiérarchie, priorisation, synthèse, snapshot builder (ancien + nouveau format).

## Notes de conformité

- L'article L. 4121-2 impose une **hiérarchie** des mesures de prévention. Le garde-fou `mesuresUniquementBasNiveau` est préservé et s'applique aux `Action` de type préventif (origine = risque DUERP) **et** aux actions de levée d'écart quand c'est pertinent.
- L'article R. 4121-1 impose que le DUERP inclue « un inventaire des risques identifiés **et** les actions de prévention ». Une `Action` rattachée à un risque est bien ce dont parle le texte.
- L'obligation de conservation 40 ans porte sur les **versions** du DUERP (snapshot figé), pas sur la table `Action` vivante. La conservation est donc gérée au niveau `DuerpVersion`.
