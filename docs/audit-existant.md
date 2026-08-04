# Audit de l'existant — DUERP MVP → plateforme V2

> État du code au 21 avril 2026, avant les travaux V2 décrits dans `spec/PLAN.md`.
> L'objectif est de cartographier ce qui est en place pour décider, dans les ADR
> qui suivent, ce qu'on réutilise, étend, refactore ou supprime.

---

## 1. Vue d'ensemble de la base de code

### Stack
- Next.js 16.2.4 (App Router, Server Actions)
- TypeScript strict
- Prisma 6 + PostgreSQL (Supabase en prod, Docker local en dev)
- Tailwind 4 + shadcn (wrapper léger autour de `@base-ui/react`)
- `@react-pdf/renderer` pour le PDF
- `react-hook-form` + `zod`
- Vitest (tests unitaires uniquement)
- Pas de Playwright encore installé

### Arborescence actuelle

```
/prisma
  schema.prisma                 → Entreprise, Duerp, DuerpVersion, UniteTravail, Risque, Mesure
  migrations/                   → 7 migrations incrémentales
/src/app
  page.tsx                      → accueil (liste des entreprises)
  entreprises/                  → CRUD entreprises (racine, pas d'auth)
  duerp/[id]/                   → wizard secteur → unités → risques → transverses → synthèse
  duerp/[id]/pdf                → route de téléchargement PDF
/src/components
  duerps/                       → 20+ composants du wizard
  entreprises/                  → formulaire entreprise
  ui/                           → primitives shadcn
/src/lib
  referentiels/                 → TS : restauration, commerce, bureau, commun (transverses)
  cotation/                     → moteur pur (criticité, priorisation) + tests
  prevention/                   → garde-fou hiérarchie L. 4121-2 + tests
  duerps/                       → actions (creerDuerp, choisirSecteur…), synthèse, étapes
  entreprises/                  → actions + queries + schéma Zod
  mesures/                      → actions CRUD mesures + labels UI
  risques/                      → actions CRUD + cotation + helpers
  transverses/                  → actions questions détecteurs
  versions/                     → snapshot builder + création de version
  pdf/                          → DuerpDocument.tsx (react-pdf)
  prisma.ts                     → client Prisma singleton
```

### Points forts
- Moteur de cotation **pur et testé** (`src/lib/cotation`). Réutilisable tel quel.
- Hiérarchie de prévention **isolée et testée** (`src/lib/prevention`). Réutilisable.
- Référentiels sectoriels **bien sourcés** (INRS ED 880, ED 925, ED 840, etc.) — contenu métier validé.
- Snapshot JSON **figé** à chaque version (auditabilité conforme aux exigences R. 4121).
- Convention de server actions propre (`_prev: State, formData: FormData` → `State`).
- Pas de dépendance à une libraire d'auth encore (auth reportée selon CLAUDE.md).

### Points faibles au regard de la V2
- `Duerp` est rattaché directement à `Entreprise` — pas d'`Etablissement` intermédiaire.
  La V2 exige plusieurs établissements par entreprise, donc on ajoute une couche.
- Pas de `Equipement`, pas d'`Obligation`, pas de `Verification`. Tout à construire.
- `Mesure` (DUERP) et la future `Action` de vérification risquent de faire doublon.
  Décision à trancher en ADR-002.
- Pas d'abstraction de stockage de fichiers (prévue pour les rapports de vérification).
- Pas de test e2e (Playwright à installer).

---

## 2. Modèle Prisma existant (synthèse)

| Modèle          | Clés                         | Notes |
|-----------------|------------------------------|-------|
| `Entreprise`    | id, raisonSociale, siret?, codeNaf, effectif, adresse | Racine actuelle. |
| `Duerp`         | id, entrepriseId, referentielSecteurId?, transversesRepondues | 1 DUERP par entreprise aujourd'hui. |
| `DuerpVersion`  | id, duerpId, numero, snapshot (Json), pdfUrl?, motif? | Versioning via snapshot JSON. |
| `UniteTravail`  | id, duerpId, nom, description?, referentielUniteId?, estTransverse, aucunRisqueJustif? | Unité = sous-découpage du DUERP. |
| `Risque`        | id, uniteId, referentielId?, libelle, gravite, probabilite, maitrise, criticite, cotationSaisie, nombreSalariesExposes?, dateMesuresPhysiques?, exposeCMR | Cotation intégrée. `(uniteId, referentielId)` unique. |
| `Mesure`        | id, risqueId, referentielMesureId?, libelle, type, statut, echeance?, responsable? | `(risqueId, referentielMesureId)` unique. |

### Contraintes et cascades
- Toutes les relations ont `onDelete: Cascade` depuis `Entreprise` jusqu'aux `Mesure`.
- `DuerpVersion.numero` est unique par DUERP.
- `Risque.(uniteId, referentielId)` empêche les doublons quand un risque vient d'un référentiel.

---

## 3. Fichier par fichier — classification pour la V2

### À réutiliser tel quel

| Fichier | Pourquoi |
|---|---|
| `src/lib/cotation/*` | Moteur pur, testé, conforme à notre méthode interne documentée dans CLAUDE.md. Pas de dépendance DUERP. |
| `src/lib/prevention/*` | Garde-fou hiérarchie L. 4121-2, testé. Utile pour le module Actions unifié de la V2. |
| `src/lib/referentiels/restauration.ts`, `commerce.ts`, `bureau.ts`, `commun.ts` | Contenu métier sourcé INRS. Aucune raison d'y toucher. |
| `src/lib/referentiels/types.ts` | Types partagés par les référentiels sectoriels. Reste valable. |
| `src/lib/cotation/questions.ts` | Questions comportementales génériques (gravité/probabilité/maîtrise). |
| `src/lib/versions/snapshot.ts` | Types du snapshot DUERP. À enrichir plus tard si on ajoute des champs liés aux établissements. |
| `src/lib/prisma.ts`, `src/lib/utils.ts` | Utilitaires techniques. |
| `src/components/ui/*` | Primitives UI. |

### À étendre (pas casser — ajouter)

| Fichier | Extension V2 |
|---|---|
| `prisma/schema.prisma` | Ajouter `Etablissement`, `Equipement`, `Obligation`, `Verification`, `RapportVerification`. Voir ADR-001. Renommer ou élargir `Mesure` → `Action` (ADR-002). |
| `src/lib/referentiels/index.ts` | Ajouter une référence au référentiel d'obligations de conformité sans casser les exports actuels (ADR-003). |
| `src/lib/versions/snapshot.ts` / `snapshot-builder.ts` | Le snapshot doit pointer vers un établissement, plus seulement vers une entreprise. |
| `src/lib/pdf/DuerpDocument.tsx` | Ajouter l'en-tête établissement + inchangé pour le reste. |

### À refactorer

| Fichier | Raison |
|---|---|
| `src/lib/duerps/actions.ts::creerDuerp(entrepriseId)` | Doit prendre un `etablissementId` à la place. Un établissement par défaut sera créé à la migration de chaque entreprise existante (ADR-001). |
| `src/app/duerp/[id]/layout.tsx` | L'en-tête affiche aujourd'hui `entreprise.raisonSociale` + NAF ; elle devra afficher l'établissement actif. |
| `src/lib/entreprises/queries.ts`, `src/app/entreprises/[id]/page.tsx` | Passer par `Etablissement` pour lister les DUERPs. |
| `src/lib/mesures/*` | À terme renommée/absorbée par le module `actions` unifié (ADR-002). Transition en deux temps : garder `Mesure` derrière une façade `Action` le temps de la migration, puis supprimer. |

### Peut rester en l'état, à surveiller

| Fichier | Note |
|---|---|
| `src/components/duerps/*` | Le wizard DUERP continue d'exister en V2. Les composants n'ont pas à connaître l'existence d'`Etablissement` — ils recevront un `duerp` déjà résolu par le layout/routeur. |

### Rien à supprimer

Aucun fichier mort détecté. Le MVP est compact et cohérent.

---

## 4. Extrait exploitable de la fiche AOCR

`spec/Fiche Audit AOCR 09102018.xlsx` contient **481 obligations** structurées sur 31 domaines. C'est un référentiel terrain utilisé par un bureau de contrôle — pas une source primaire, mais une **liste de travail** qui nous évite de repartir d'une feuille blanche.

### Ce qui est exploitable pour la V2

- **31 domaines** identifiés. Pour le MVP V2 on retient les 3 P1 : `Incendie` (100 obligations), `Électricité` (24 obligations), `Aération et ventilation` (15 obligations). Total : 139 obligations pour P1 — couvrage large.
- **Colonnes utiles** : `Domaine`, `Sous-domaine`, `Libellé détaillé`, `Référence` (articles du Code, arrêtés), `Réalisateur`, `Personne obligée`, flags `Habitation`/`Travail`/`ERP-IGH`, `Urgence`.
- **Types de réalisateur** identifiés : Personne qualifiée, Personne accréditée, Exploitant, Fabricant, Bureau de contrôle, Chef d'établissement, Organisme agréé, Personne compétente, Entreprise spécialisée formée, Constructeur.
- **Personnes obligées** : Chef d'établissement, Chef d'entreprise, Exploitant, Propriétaire, Employeur.
- **Typologie d'application** : flags 0/1 sur trois axes Habitation / Travail / ERP-IGH. Cohérent avec ADR-004.

### Ce qui n'est pas exploitable en l'état
- La colonne `Validité` (périodicité normalisée) est vide dans la feuille principale. La périodicité est encodée dans le libellé du sous-domaine (« Vérification Périodique 1 an », « 6 mois », « 5 ans », « hebdomadaire », « mensuelle », « semestrielle », « trimestrielle », « annuelle », etc.). À parser pour construire notre enum `Periodicite`.
- Le champ `Réalisateur` n'est renseigné que sur ~30 lignes. Il faudra compléter depuis les sources primaires au moment de la rédaction du référentiel (étape 3).
- Les références citent parfois des textes non primaires (APSAD = règles assureurs, pas réglementaire — à sortir du périmètre ou à qualifier « bonne pratique »).

### Extrait JSON généré

`docs/audit-aocr/obligations-p1-extract.json` contient les 139 lignes P1 extraites de la feuille `Audit`. Utilisable comme **base de travail** pour l'étape 3, à condition de :
1. Vérifier chaque référence sur Légifrance.
2. Éliminer les obligations qui ne relèvent pas d'une source primaire (APSAD, NF, etc.) ou les classer comme « bonne pratique non réglementaire ».
3. Compléter les champs manquants (réalisateur, périodicité normalisée, criticité 1-5).

> **Règle rappelée** : le référentiel V2 est reconstruit depuis Légifrance et INRS. La fiche AOCR est une aide au travail, pas une source citable.

---

## 5. Dette technique identifiée

Aucune dette bloquante. À surveiller :
- `Duerp` contient déjà `transversesRepondues` et `referentielSecteurId`. Ces colonnes restent pertinentes avec `Etablissement` — à migrer tel quel.
- `Risque.cotationSaisie` est un booléen qui évite de prendre des valeurs par défaut pour une cotation non saisie. À préserver.
- `Mesure.referentielMesureId` + contrainte unique `(risqueId, referentielMesureId)` : modèle propre pour toggle on/off. On voudra le même schéma pour les occurrences de vérification (`Verification.obligationId` + unicité par équipement/date).

---

## 6. Décisions structurantes

Documentées dans `docs/adr/` :

- **ADR-001** — Introduction de l'entité `Etablissement`
- **ADR-002** — Unification `Mesure` / `Action`
- **ADR-003** — Organisation des référentiels
- **ADR-004** — Typologie d'établissement

Un projet de schéma Prisma V2 est également joint à l'étape 0 :
`docs/schema-prisma-v2-propose.prisma`. Pas encore migré.
