# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Générateur DUERP (MVP)

## Contexte du projet

Application Next.js qui permet à un dirigeant de TPE/PME (non-expert en prévention) de générer son **Document Unique d'Évaluation des Risques Professionnels (DUERP)** conforme au Code du travail français, via un questionnaire guidé.

**Principe fondateur : zéro IA.** Toute la "richesse" vient de référentiels métier curés, d'un questionnaire bien conçu et de règles déterministes. C'est un choix assumé pour des raisons d'auditabilité, de reproductibilité et de conformité RGPD.

## Cadre légal de référence

- Articles **R. 4121-1 à R. 4121-4** du Code du travail (contenu et mise à jour)
- Article **L. 4121-2** (principes généraux de prévention — hiérarchie des mesures)
- Loi du **2 août 2021** (conservation 40 ans, dépôt dématérialisé à venir)
- **Mise à jour annuelle** : obligatoire pour les entreprises ≥ 11 salariés (art. R. 4121-2). En tout état de cause, mise à jour à tout aménagement important, après accident, ou si nouvelle information sur un risque.

## Sources des référentiels métier

Les listes de risques, unités de travail et mesures de prévention pré-suggérées dans les fichiers `src/lib/referentiels/*.ts` sont **strictement sourcées** sur des publications officielles. Chaque fichier porte un en-tête JSDoc citant les références utilisées et chaque risque a une `description` indiquant sa fiche source. Toute modification de contenu doit citer une source équivalente.

- **Restauration** (`restauration.ts`) : INRS ED 880 « La restauration traditionnelle » (nov. 2012), OiRA Restauration.
- **Commerce** (`commerce.ts`) : INRS AC 93 « OiRA commerce non alimentaire » (juin 2016), ED 925 « Commerces alimentaires de proximité ».
- **Bureau / tertiaire** (`bureau.ts`) : INRS dossier « Travail de bureau », ED 950 « Conception des lieux et des situations de travail » (août 2025), ED 6497 « Qualité de l'air intérieur ».
- **Risques transverses** (`commun.ts`) : INRS ED 840 « Évaluation des risques professionnels — Aide au repérage des risques dans les PME-PMI » (oct. 2023, taxonomie officielle des 20 familles de risques) ; ED 6329 (routier) ; ED 6433 (chutes de plain-pied) ; ED 6161 (Prap).

**Ne pas inventer de risques, mesures ou seuils** sans source INRS, Carsat, ameli ou texte réglementaire identifiable. En cas de doute, marquer le contenu comme "valeur indicative interne" plutôt que comme une référence officielle.

## Méthode d'appréciation : ce qui est conforme et ce qui est notre choix

L'INRS ED 840 dit explicitement : « les règles d'appréciation sont à définir au sein de l'entreprise ». Aucune formule de cotation n'est imposée par la réglementation. Nos choix internes :

- **Formule retenue** : criticité = (gravité × probabilité) / maîtrise, arrondie au plus proche entier, bornée [1, 16]. C'est une approche déterministe simplifiée, communément utilisée dans les outils DUERP du marché — pas une méthode INRS officielle.
- **Questions comportementales** : nos libellés (gravité 1 = pansement / 4 = invalidité, etc.) sont notre rédaction — l'INRS recommande l'approche qualitative mais ne fournit pas de grille standard.
- **Seuils `criticiteReferenceSecteur`** : valeurs **indicatives internes** calibrées sur les statistiques INRS (« chutes = 1/3 des accidents en restauration » → seuil élevé). À présenter comme tel dans l'UI, jamais comme « référence INRS » ou « valeur officielle ».
- **Hiérarchie des mesures** : strictement conforme à l'article L. 4121-2.

Le document final doit contenir au minimum :
1. Identification de l'entreprise
2. Liste des unités de travail
3. Inventaire des risques par unité de travail
4. Évaluation (cotation) de chaque risque
5. Mesures de prévention existantes et prévues
6. Plan d'actions priorisé
7. Date et historique des mises à jour (versioning obligatoire)

## Périmètre du MVP

### Inclus
- ~~Création de compte + authentification (email/password)~~ **Reportée** — on valide d'abord le cœur métier sans auth. Entreprise devient la racine, sélection via cookie ou URL.
- Création d'une entreprise (SIRET, NAF, effectif, adresse)
- Définition d'unités de travail (libres ou pré-suggérées selon le NAF)
- Questionnaire guidé pour chaque unité, avec pré-remplissage sectoriel
- Cotation des risques par questions indirectes (pas de "notez de 1 à 4")
- Sélection de mesures de prévention depuis une bibliothèque
- Garde-fous métier (hiérarchie de prévention, détection de sous-cotation)
- Génération du DUERP en PDF
- Versioning : chaque "validation" crée une version horodatée, consultable
- Export des versions antérieures

### Exclu du MVP (à noter pour plus tard)
- Dépôt sur portail national dématérialisé
- Signature électronique qualifiée
- Multi-utilisateurs par entreprise (rôles, permissions)
- Import de DUERP existants
- Intégration SIRENE pour auto-complétion SIRET
- Analyses comparatives / benchmarks sectoriels
- Notifications de mise à jour annuelle
- Paiement / abonnement

### Secteurs couverts au MVP
On se limite à **3 secteurs** pour bien faire, plutôt que 15 mal :
1. **Restauration** (code NAF 56.xx) — restaurants, brasseries, fast-food
2. **Commerce de détail** (47.xx) — boutiques, petits commerces
3. **Bureau / services** (activités tertiaires type conseil, communication)

Chaque secteur doit avoir son référentiel complet (risques types, questions de détection, mesures de prévention).

## Stack technique

- **Next.js 15** (App Router, Server Actions)
- **TypeScript strict**
- **PostgreSQL** + **Prisma** (ORM)
- ~~**NextAuth.js** (ou Auth.js) pour l'authentification~~ — reportée post-validation du cœur
- **react-hook-form** + **Zod** pour les formulaires et la validation
- **Tailwind CSS** + **shadcn/ui** pour l'interface
- **@react-pdf/renderer** pour la génération PDF
- **Vitest** pour les tests unitaires (règles métier, cotation)
- **Playwright** pour quelques tests e2e critiques (parcours complet)

## Architecture du code

```
/app
  /entreprises         → CRUD entreprises (racine, pas d'auth dans le MVP)
  /duerp/[id]          → parcours de remplissage + vue du DUERP
  /duerp/[id]/export   → génération PDF
/components
  /ui                  → shadcn
  /questionnaire       → composants du wizard
  /pdf                 → templates react-pdf
/lib
  /referentiels        → données sectorielles (TS, pas en base)
    /restauration.ts
    /commerce.ts
    /bureau.ts
    /commun.ts         → risques transverses (routier, RPS, etc.)
  /cotation            → moteur de cotation (pur, testé)
  /prevention          → règles de hiérarchie des mesures
  /pdf                 → builders de document
/prisma
  /schema.prisma
  /seed.ts             → seed des référentiels
/tests
  /unit                → règles métier
  /e2e                 → parcours complets
```

### Pourquoi les référentiels en TS plutôt qu'en base

Les référentiels métier (risques par secteur, questions, mesures) évoluent rarement et doivent être versionnés avec le code pour l'auditabilité. On les garde en fichiers TypeScript typés, on les seed en base si besoin pour les jointures, mais la source de vérité est dans le repo.

## Modèle de données (Prisma, schéma indicatif)

```prisma
// User retiré du MVP — auth reportée. Entreprise devient la racine.
// À rajouter dans une itération ultérieure avec relation User → Entreprise.

model Entreprise {
  id         String   @id @default(cuid())
  raisonSociale String
  siret      String?
  codeNaf    String
  effectif   Int
  adresse    String
  duerps     Duerp[]
}

model Duerp {
  id           String   @id @default(cuid())
  entrepriseId String
  entreprise   Entreprise @relation(fields: [entrepriseId], references: [id])
  versions     DuerpVersion[]
  unites       UniteTravail[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model DuerpVersion {
  id        String   @id @default(cuid())
  duerpId   String
  duerp     Duerp    @relation(fields: [duerpId], references: [id])
  numero    Int      // v1, v2, v3...
  snapshot  Json     // snapshot complet figé du DUERP au moment de la validation
  pdfUrl    String?  // stockage du PDF généré
  createdAt DateTime @default(now())
  motif     String?  // "mise à jour annuelle", "nouveau poste", etc.
}

model UniteTravail {
  id        String   @id @default(cuid())
  duerpId   String
  duerp     Duerp    @relation(fields: [duerpId], references: [id])
  nom       String   // "Salle de restaurant", "Cuisine", "Livraison"
  description String?
  risques   Risque[]
}

model Risque {
  id           String   @id @default(cuid())
  uniteId      String
  unite        UniteTravail @relation(fields: [uniteId], references: [id])
  referentielId String  // lien vers l'ID dans le référentiel TS
  libelle      String   // copié du référentiel au moment de la sélection
  description  String?
  gravite      Int      // 1-4
  probabilite  Int      // 1-4
  maitrise     Int      // 1-4 (niveau de maîtrise actuel)
  criticite    Int      // calculé : gravite * probabilite / maitrise ou similaire
  mesures      Mesure[]
}

model Mesure {
  id        String   @id @default(cuid())
  risqueId  String
  risque    Risque   @relation(fields: [risqueId], references: [id])
  libelle   String
  type      String   // "suppression" | "reduction_source" | "protection_collective" | "protection_individuelle" | "formation" | "organisationnelle"
  statut    String   // "existante" | "prevue"
  echeance  DateTime?
  responsable String?
}
```

## Règles métier critiques

### Cotation
Les risques se cotent selon 3 axes sur une échelle 1-4 :
- **Gravité** : conséquences si le risque se réalise (1 = gêne / 4 = irréversible ou mortel)
- **Probabilité** : fréquence d'exposition × probabilité de survenue
- **Maîtrise** : niveau de mesures déjà en place (1 = aucune / 4 = totale)

**Criticité** = `(gravité × probabilité) / maîtrise` arrondi, bornée 1-16.

**Priorisation** dans le plan d'actions : tri par criticité décroissante, puis par gravité décroissante en cas d'égalité.

Les questions posées à l'utilisateur ne doivent **jamais** être "notez de 1 à 4". Elles doivent être **comportementales** :

Exemple pour la gravité d'une coupure en cuisine :
> Si cet accident survenait, quelle serait la conséquence la plus probable ?
> - [ ] Pansement sur place, la personne continue sa journée → **gravité 1**
> - [ ] Passage aux urgences mais retour au travail le lendemain → **gravité 2**
> - [ ] Arrêt de travail de plusieurs jours à plusieurs semaines → **gravité 3**
> - [ ] Séquelles durables, invalidité, ou pire → **gravité 4**

### Hiérarchie des mesures de prévention (art. L. 4121-2)
L'ordre de priorité imposé par la loi :
1. Suppression du risque à la source
2. Réduction du risque à la source
3. Protection collective
4. Protection individuelle (EPI)
5. Formation / information
6. Mesures organisationnelles

**Garde-fou** : si pour un risque donné l'utilisateur n'a sélectionné que des mesures de type "protection_individuelle" ou "formation", afficher un avertissement :
> Avez-vous étudié une solution collective ou de réduction à la source ? Le Code du travail impose de prioriser ces approches avant les EPI.

Ne pas bloquer — juste alerter.

### Détection de sous-cotation
Pour certains risques très courants dans un secteur, si la criticité saisie est anormalement basse par rapport à une valeur de référence sectorielle, afficher :
> Cette cotation est inhabituelle dans votre secteur. Voulez-vous ajouter un commentaire justificatif ?

Ne pas bloquer non plus.

### Questions détecteurs transverses
Quel que soit le secteur, poser systématiquement :
- Conduite dans le cadre professionnel (même occasionnelle) → risque routier
- Travail sur écran > 4h/jour → TMS / fatigue visuelle
- Contact avec du public → RPS (agression verbale, incivilités)
- Travail isolé ou horaires décalés → RPS / sécurité
- Port de charges > 10 kg régulier → TMS / lombalgies
- Tensions, arrêts répétés, turnover élevé → RPS

Chaque "oui" ajoute automatiquement un risque à l'unité de travail concernée, avec pré-remplissage.

## Format des référentiels sectoriels

Exemple de structure type (`/lib/referentiels/restauration.ts`) :

```typescript
export const restauration: Referentiel = {
  codeNaf: ["56.10A", "56.10B", "56.10C", "56.30Z"],
  nom: "Restauration",
  unitesTravailSuggerees: [
    { id: "cuisine", nom: "Cuisine", description: "..." },
    { id: "salle", nom: "Salle de restaurant", description: "..." },
    { id: "livraison", nom: "Livraison", description: "..." },
  ],
  risques: [
    {
      id: "coupure-cuisine",
      libelle: "Coupure avec couteaux ou trancheuse",
      unitesAssociees: ["cuisine"],
      gravitéParDefaut: 2,
      probabiliteParDefaut: 3,
      mesuresRecommandees: [
        { id: "...", libelle: "Utilisation de gants anti-coupure", type: "protection_individuelle" },
        { id: "...", libelle: "Trancheuse avec protection intégrée", type: "protection_collective" },
        { id: "...", libelle: "Formation à l'affûtage et à la manipulation", type: "formation" },
      ],
    },
    // ... etc
  ],
  questionsDetection: [
    // questions spécifiques au secteur en plus des transverses
  ],
};
```

## Parcours utilisateur (wizard)

1. **Onboarding entreprise** : raison sociale, SIRET (optionnel), NAF, effectif, adresse
2. **Choix du secteur** (pré-sélectionné depuis le NAF, modifiable)
3. **Définition des unités de travail** : pré-suggérées depuis le référentiel, modifiables/ajoutables
4. **Pour chaque unité de travail** :
   - Affichage des risques pré-cochés (issus du référentiel)
   - L'utilisateur décoche ceux qui ne s'appliquent pas et peut en ajouter
   - Pour chaque risque retenu : 3 questions indirectes (gravité, probabilité, maîtrise) → calcul auto de la criticité
   - Sélection des mesures existantes + mesures prévues (avec échéance et responsable)
   - Garde-fous affichés si nécessaire
5. **Questions détecteurs transverses** (une seule fois)
6. **Synthèse** : vue d'ensemble, plan d'actions priorisé auto-généré
7. **Validation** : crée une version figée (snapshot JSON), génère le PDF
8. **Écran final** : téléchargement PDF, rappel de la mise à jour annuelle obligatoire

## Génération PDF

Structure du document généré :

1. **Page de garde** : raison sociale, SIRET, date de version, numéro de version
2. **Sommaire**
3. **Présentation de l'entreprise**
4. **Méthodologie d'évaluation** (texte fixe expliquant la grille de cotation)
5. **Pour chaque unité de travail** :
   - Description
   - Tableau des risques avec cotation et mesures
6. **Plan d'actions priorisé** (tous risques confondus, triés par criticité)
7. **Historique des versions**
8. **Mentions légales** : rappel des obligations de mise à jour, de conservation 40 ans, de consultation par le CSE/DP le cas échéant

Le PDF doit être généré côté serveur (Server Action) et stocké (filesystem local pour le MVP, S3/R2 plus tard).

## Points d'attention RGPD

- Hébergement UE obligatoire
- Pas de données de santé individuelles dans le DUERP (il parle de postes, pas de personnes)
- Politique de rétention : les versions anciennes sont conservées 40 ans conformément à la loi
- Export complet des données de l'utilisateur + suppression du compte
- Mentions légales et CGU à prévoir

## Ce qu'il ne faut PAS faire

- **Pas de LLM** pour traiter ou reformuler les réponses. Tout est déterministe.
- **Pas de conseil juridique automatisé** : l'outil aide à structurer, il ne dit pas "vous êtes conforme". Toujours positionner comme aide à la rédaction.
- **Pas de cotation libre** sans garde-fou : toujours passer par les questions indirectes.
- **Pas de "validation" sans versioning** : chaque validation = snapshot figé.
- **Pas de modification silencieuse d'une version validée** : une fois validée, elle est en lecture seule. Toute modification crée une nouvelle version.

## Ordre de construction suggéré

1. Setup Next.js + Prisma + shadcn (pas d'auth dans le MVP)
2. Modèle de données + migrations
3. Référentiel "restauration" complet en TS (le plus petit, pour valider le format)
4. CRUD entreprise + création DUERP vide
5. Wizard : unités de travail
6. Wizard : sélection des risques pré-cochés
7. Moteur de cotation + questions indirectes (avec tests unitaires)
8. Sélection des mesures + garde-fous hiérarchie
9. Questions détecteurs transverses
10. Synthèse + plan d'actions priorisé
11. Versioning + snapshot
12. Génération PDF
13. Ajout des référentiels "commerce" et "bureau"
14. Tests e2e du parcours complet
15. Polish UI + responsive

## Critères de "done" du MVP

- Un utilisateur non-initié peut créer une entreprise, remplir son DUERP pour une TPE de restauration, et télécharger un PDF conforme en moins de 45 minutes (auth ajoutée dans une itération ultérieure)
- Le document généré contient les 7 éléments obligatoires listés plus haut
- Le versioning fonctionne : une v2 peut être créée et les deux versions sont consultables
- Les tests unitaires du moteur de cotation passent à 100%
- Un test e2e Playwright couvre le parcours complet de A à Z