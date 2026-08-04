# CLAUDE.md — Plateforme de conformité santé-sécurité TPE/PME (V2)

## Vision produit

Application Next.js qui accompagne un **dirigeant de TPE/PME (non-expert)** dans le pilotage **continu** de sa conformité santé-sécurité réglementaire.

Le produit ne vise plus un livrable ponctuel (un DUERP annuel), mais la **gestion au quotidien** d'un ensemble cohérent d'obligations imposées par le Code du travail, le Code de la construction et de l'habitation, et les arrêtés sectoriels.

Le dirigeant se connecte et voit, en un coup d'œil :
- Où il en est de ses obligations (à jour, en retard, à venir)
- Ce qu'il doit faire dans les 30 prochains jours
- Les écarts de conformité ouverts avec leur plan de levée
- Ses documents prêts à présenter en cas de contrôle (inspection, assurance, bailleur, acquéreur)

## Positionnement

Un outil **opérationnel**, pas un simple générateur de documents. Les documents (DUERP, registre de sécurité, plan d'actions, dossier de conformité) sont des **sorties** du système, pas sa raison d'être.

Le cœur de la valeur est la **continuité** : l'utilisateur revient régulièrement, l'outil ne ment pas sur son niveau de conformité, il propose la prochaine action utile.

## Principe fondateur : zéro IA

Toute la valeur vient de trois choses, toutes déterministes :

1. **Qualité du référentiel réglementaire** construit depuis des sources primaires (Légifrance, INRS)
2. **Design du questionnaire** pour traduire des obligations juridiques en questions compréhensibles
3. **Règles métier** (matching équipements/obligations, calcul d'échéances, priorisation)

Pas de LLM pour traiter les réponses, pas de reformulation automatique, pas de détection par analyse de texte libre. Raisons : auditabilité, reproductibilité sur un document à valeur légale, conformité RGPD simple, coût marginal nul, pas de dérive.

## Modules fonctionnels

La plateforme couvre quatre grands blocs d'obligations, intégrés dans une expérience unique :

### 1. Évaluation des risques professionnels (DUERP)
- Articles **R. 4121-1 à R. 4121-4** et **L. 4121-2** du Code du travail
- Inventaire des risques par unité de travail, cotation, mesures de prévention
- Versioning obligatoire (mise à jour annuelle minimum, conservation 40 ans)

### 2. Vérifications périodiques réglementaires
- Articles **R. 4323-22 et suivants** du Code du travail
- Règlement ERP (arrêté du 25 juin 1980)
- CCH articles **R. 123-51** et **R. 122-29**
- Génération automatique du calendrier des vérifications obligatoires selon les équipements et la typologie de l'établissement
- Périodicités : hebdomadaire, mensuelle, semestrielle, annuelle, quinquennale
- Réalisateur requis (organisme agréé, personne qualifiée, exploitant)

### 3. Registre de sécurité numérique
- Article **L. 4711-5** du Code du travail
- Centralisation horodatée de tous les rapports de vérification
- Liaison automatique aux occurrences de vérification du calendrier
- Export consolidé (ZIP + index PDF) présentable en 30 secondes à un inspecteur

### 4. Plan d'actions de conformité
- Article **L. 4121-2** du Code du travail (principes généraux de prévention)
- Fiches d'action correctives pour chaque écart détecté (issu du DUERP ou d'un rapport de vérification)
- Hiérarchie des mesures imposée par la loi
- Suivi jusqu'à la levée avec justificatif

Ces quatre modules partagent un **modèle de données unifié** : un établissement, des équipements, des obligations applicables, des vérifications, des actions. Le DUERP n'est pas un silo, c'est une vue spécifique sur cette donnée.

## Cadre légal de référence

Sources primaires libres d'accès uniquement :
- **Code du travail** (Légifrance)
- **Code de la construction et de l'habitation** (Légifrance)
- **Code de l'environnement** (Légifrance)
- **Arrêtés sectoriels** (Légifrance, Journal Officiel)
- **INRS** : fiches techniques, guides sectoriels
- **Ministère du Travail** : guides de l'employeur, fiches ED

**Attention** : aucune base de données commerciale existante ne doit être recopiée. Le référentiel est reconstruit depuis les textes officiels, avec traçabilité de la source pour chaque obligation.

## Périmètre du MVP V2

### Utilisateurs cibles
- Dirigeants de TPE/PME (1 à 50 salariés)
- Non-experts en prévention et conformité
- Secteurs à faible complexité technique

### Secteurs couverts
On conserve les trois secteurs existants du MVP DUERP :
1. **Restauration** (NAF 56.xx)
2. **Commerce de détail** (NAF 47.xx)
3. **Bureau / services tertiaires**

### Domaines d'obligations couverts (vérifications réglementaires)

**Priorité 1 — obligatoires dans quasi tous les établissements** :
- Installations électriques (art. R4226-16 CT)
- Sécurité incendie (extincteurs, BAES, alarmes — règlement ERP)
- Aération et ventilation (art. R4222-20 et suivants CT)

**Priorité 2 — fréquents selon secteur** :
- Appareils de cuisson et hottes (restauration, ERP)
- Ascenseurs (si présents — CCH R125)
- Portes et portails automatiques (art. R4224-15 CT)

**Priorité 3 — selon équipements déclarés** :
- Équipements sous pression
- Stockage de matières dangereuses (limité)
- Équipements de levage simples

### Hors périmètre V2 (à noter pour plus tard)
- IGH, ICPE complexes, sites industriels
- ATEX, rayonnements ionisants
- Équipements sportifs, piscines
- Dépôt sur portail national dématérialisé du DUERP
- Signature électronique qualifiée
- Multi-utilisateurs par entreprise (rôles, permissions fines)
- Notifications email/push/SMS
- Paiement / abonnement / gestion commerciale
- Intégration SIRENE pour auto-complétion SIRET
- Import de DUERP ou de documents existants
- Analyses comparatives / benchmarks sectoriels

## Stack technique

- **Next.js 15** (App Router, Server Actions)
- **TypeScript strict**
- **PostgreSQL** + **Prisma** (ORM)
- **Supabase Auth** (`@supabase/ssr`) pour l'authentification — cf. ADR-005. Supabase sert uniquement d'auth provider ; la data reste accédée via Prisma (rôle `postgres`, bypass RLS).
- **react-hook-form** + **Zod** pour les formulaires et la validation
- **Tailwind CSS** + **shadcn/ui** pour l'interface
- **@react-pdf/renderer** pour la génération PDF
- **Vitest** pour les tests unitaires
- **Playwright** pour les tests e2e critiques

Le stockage des rapports (PDF uploadés) passe par une **abstraction** permettant de démarrer en filesystem local puis migrer vers S3/R2.

## Architecture cible

La V2 impose un modèle de données plus large que celui du DUERP initial. Les entités clés à considérer :

- `User` — compte utilisateur
- `Entreprise` — entité juridique (raison sociale, SIRET, NAF, effectif)
- `Etablissement` — **nouveau** — site physique rattaché à une entreprise (adresse, typologie ERP/IGH/Travail, catégorie, effectif sur site). Une entreprise peut avoir plusieurs établissements.
- `UniteTravail` — sous-découpage d'un établissement pour le DUERP
- `Equipement` — **nouveau** — équipement déclaré dans un établissement (électricité, hotte, extincteur, ascenseur…)
- `Obligation` — **nouveau** — référentiel d'obligations réglementaires (libellé, référence légale, périodicité, typologie d'application, réalisateur requis, criticité)
- `Verification` — **nouveau** — occurrence de vérification périodique (équipement, obligation, date prévue, date réalisée, statut)
- `RapportVerification` — **nouveau** — fichier uploadé + métadonnées, rattaché à une vérification
- `Risque` — risque identifié dans le DUERP, rattaché à une unité de travail
- `Action` — **unifié** — action corrective, reliable soit à un risque (DUERP) soit à une vérification (écart sur rapport)
- `Duerp` / `DuerpVersion` — document généré et versionné (snapshot)

**Point de vigilance architecture** : le modèle DUERP existant (avec `Mesure` rattachée à `Risque`) doit probablement être refactoré pour unifier avec `Action`. C'est une décision structurante à trancher dès le début de la V2, dans un ADR dédié.

## Expérience utilisateur cible

### Onboarding
1. Création du compte
2. Création de l'entreprise
3. Création du premier établissement (SIRET, adresse, typologie ERP/Travail, effectif, catégorie ERP si applicable)
4. Déclaration guidée des équipements présents (questionnaire par catégorie)
5. L'outil génère automatiquement le référentiel d'obligations applicables et le calendrier de vérifications

### Parcours quotidien
- **Tableau de bord** : statut global, prochaines échéances, actions en cours
- **Calendrier** : vue chronologique des vérifications à faire, filtrable par domaine
- **Registre de sécurité** : archive de tous les rapports, recherche et export
- **DUERP** : accès à la vue risques/unités de travail, mise à jour annuelle facilitée
- **Actions** : liste unifiée des actions correctives en cours (DUERP + vérifications)
- **Documents** : export PDF à la demande (DUERP, registre, dossier de conformité complet)

### Garde-fous
Des règles de cohérence s'appliquent en continu :
- Hiérarchie des mesures de prévention (art. L4121-2) : alerte si seulement des EPI/formation pour un risque
- Détection de sous-cotation dans le DUERP
- Alerte en cas de dépassement d'échéance de vérification
- Alerte en cas d'action non clôturée dépassant son échéance

Jamais bloquant, toujours informatif.

## Génération documentaire

Quatre documents PDF principaux sont générés à la demande :

1. **DUERP** — document légal, versionné, figé à chaque validation
2. **Registre de sécurité** — consolidation horodatée de toutes les vérifications
3. **Plan d'actions de conformité** — liste priorisée des actions ouvertes
4. **Dossier de conformité complet** — synthèse globale présentable à un tiers (inspecteur, assureur, bailleur)

Tous sont générés côté serveur, en mode déterministe, avec rappel des mentions légales (versioning, conservation, obligation de mise à jour).

## Articulation avec l'existant (DUERP MVP)

Le MVP DUERP est en place. Il contient déjà :
- Authentification et gestion de compte
- Modèle `Entreprise` / `Duerp` / `UniteTravail` / `Risque` / `Mesure`
- Référentiels sectoriels en TypeScript pour 3 secteurs
- Moteur de cotation
- Système de versioning par snapshot
- Génération PDF du DUERP

**Claude Code a toute latitude** pour :
- Réutiliser ce qui peut l'être tel quel (authentification, génération PDF, structure générale)
- Étendre les modèles existants (ajouter `Etablissement` entre `Entreprise` et `Duerp`, par exemple)
- Refactorer ce qui doit l'être (probablement : unification `Mesure` ↔ `Action`, rattachement des unités de travail à un établissement)
- Conserver les référentiels sectoriels DUERP tels quels (contenu métier déjà validé)
- Créer de nouveaux modules parallèles pour les obligations de vérification

**Décisions structurantes à documenter en ADR avant de coder** :
1. Garde-t-on `Entreprise` comme racine, ou introduit-on `Etablissement` ? (fortement recommandé : `Etablissement`)
2. Comment unifier les actions correctives issues du DUERP et celles issues des vérifications ?
3. Les référentiels DUERP existants (risques par secteur) restent-ils dans `/lib/referentiels/` ou rejoignent-ils une structure commune avec le référentiel d'obligations ?
4. La typologie d'établissement (ERP, IGH, Travail classique) est-elle un enum ou un ensemble de flags ?

Ces ADR doivent être écrits dans `/docs/adr/` au format classique (contexte, décision, conséquences, alternatives rejetées).

## Règles de conduite pour Claude Code

1. **Lire le code existant avant d'écrire.** Le MVP DUERP est en place, ne pas le casser sans raison.
2. **Proposer une approche avant de coder** pour tout changement structurant (modèles de données, refactors).
3. **Écrire des ADR** pour chaque décision qui engage l'architecture.
4. **Commits atomiques** et messages explicites.
5. **Tests écrits en même temps que le code**, pas après. Les règles métier critiques (matching, cotation, génération de calendrier) ont une couverture de test renforcée.
6. **Ne jamais inventer une référence réglementaire.** Si la source n'est pas vérifiable sur Légifrance ou INRS, l'obligation n'entre pas dans le référentiel.
7. **Pas de LLM** pour traiter, reformuler, classer ou analyser du contenu utilisateur.
8. **Pas de conseil juridique automatisé.** L'outil aide à structurer et rappelle les obligations, il ne dit jamais "vous êtes conforme".
9. **RGPD** : hébergement UE, politique de rétention explicite, export et suppression possibles à tout moment.
10. **Conservation 40 ans** pour les versions de DUERP (obligation légale).

## Ce qu'il ne faut pas faire

- Traiter la V2 comme une simple extension UI du DUERP existant — c'est un changement de nature du produit
- Dupliquer les concepts (deux modèles d'action, deux notions d'équipement) par souci de ne pas refactorer
- Construire le référentiel d'obligations sans sources vérifiables
- Ajouter de l'IA "pour aider" sur un document à valeur légale
- Déclarer qu'un utilisateur est conforme (l'outil assiste, il ne certifie pas)
- Sortir du périmètre des 3 secteurs validés en V2 pour faire plaisir à un utilisateur test

## Critères de done pour la V2 complète

- Un dirigeant de TPE type (restaurant, commerce ou bureau) peut en moins de 90 minutes : créer son compte, son entreprise, son établissement, déclarer ses équipements, remplir son DUERP, et voir son calendrier de vérifications généré automatiquement
- Le tableau de bord reflète fidèlement la situation de conformité
- Les quatre documents PDF (DUERP, registre, plan d'actions, dossier de conformité) sont générables à tout moment et conformes aux exigences légales
- Les tests unitaires couvrent 100% des règles métier critiques
- Au moins trois parcours e2e Playwright passent : création initiale, mise à jour après vérification, génération du dossier de conformité complet
- Les ADR structurants sont documentés
- Le modèle de données est cohérent et unifié (pas de duplication conceptuelle)