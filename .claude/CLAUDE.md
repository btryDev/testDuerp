# CLAUDE.md — Rojer, plateforme de pilotage de la prévention (TPE/PME)

## Vision produit

> **« Concentrez-vous sur votre activité, Rojer coordonne la prévention des risques de votre structure. »**

**Rojer** (nom du produit, ex-DUERP.fr) est une application Next.js qui accompagne un **dirigeant de TPE/PME (non-expert)** dans le pilotage **continu** de sa conformité santé-sécurité réglementaire.

Le DUERP a été le socle historique du produit, mais il n'en est plus qu'une composante. Rojer centralise aujourd'hui l'ensemble des registres, données et acteurs de la prévention : vérifications périodiques, registre de sécurité, plan d'actions, registre d'accessibilité, permis de feu, plans de prévention, carnet sanitaire, prestataires, interventions, signatures.

Le dirigeant se connecte et voit, en un coup d'œil :
- Où il en est de ses obligations (à jour, en retard, à venir)
- Ce qu'il doit faire dans les 30 prochains jours
- Les écarts de conformité ouverts avec leur plan de levée
- Ses documents prêts à présenter en cas de contrôle (inspection, assurance, bailleur, acquéreur)

## Positionnement

Un outil **opérationnel**, pas un simple générateur de documents. Les documents (DUERP, registre de sécurité, plan d'actions, dossier de conformité) sont des **sorties** du système, pas sa raison d'être.

Le cœur de la valeur est la **coordination continue** : l'utilisateur revient régulièrement, l'outil ne ment pas sur son niveau de conformité, il propose la prochaine action utile, et fait travailler ensemble le dirigeant et ses prestataires (organismes de vérification, entreprises extérieures) autour des mêmes données.

## Principe fondateur : zéro IA

Toute la valeur vient de trois choses, toutes déterministes :

1. **Qualité du référentiel réglementaire** construit depuis des sources primaires (Légifrance, INRS)
2. **Design du questionnaire** pour traduire des obligations juridiques en questions compréhensibles
3. **Règles métier** (matching équipements/obligations, calcul d'échéances, priorisation)

Pas de LLM pour traiter les réponses, pas de reformulation automatique, pas de détection par analyse de texte libre. Raisons : auditabilité, reproductibilité sur un document à valeur légale, conformité RGPD simple, coût marginal nul, pas de dérive.

## Modules fonctionnels

### Socle historique (les 4 blocs d'origine)

1. **Évaluation des risques professionnels (DUERP)** — art. R. 4121-1 à R. 4121-4 et L. 4121-2 CT. Inventaire des risques par unité de travail, cotation, mesures de prévention, versioning obligatoire (mise à jour annuelle minimum, conservation 40 ans). Import XLSX/CSV d'un DUERP existant (parser déterministe, gabarit téléchargeable).
2. **Vérifications périodiques réglementaires** — art. R. 4323-22 et s. CT, règlement ERP (arrêté du 25 juin 1980), CCH. Calendrier généré automatiquement selon équipements et typologie ; périodicités hebdo → quinquennale ; réalisateur requis.
3. **Registre de sécurité numérique** — art. R. 4323-25 CT (consignation des vérifications), R. 4323-26 (annexion des rapports d'un tiers) et R. 4323-27 (tenue sur tout support, via L. 8113-6 — c'est lui qui rend le registre numérique légal). L. 4711-5 n'institue rien : il autorise seulement à réunir plusieurs registres en un seul. Centralisation horodatée des rapports, liaison aux occurrences de vérification, export consolidé (ZIP + index PDF).
4. **Plan d'actions de conformité** — art. L. 4121-2 CT. Actions correctives unifiées (issues du DUERP ou d'un rapport de vérification), hiérarchie des mesures, suivi jusqu'à la levée.

### Registres complémentaires (section « Mes registres » de la sidebar)

5. **Registre public d'accessibilité ERP** — page publique par slug, prestations, attestation, Ad'AP, formation du personnel d'accueil, affiche QR code téléchargeable.
6. **Permis de feu** — travaux par point chaud (réf. INRS ED 6030), référentiel de mesures de prévention, cycle de vie du permis.
7. **Plans de prévention entreprises extérieures** — art. R. 4512 et s. CT (seuil 400 h/an ou travaux dangereux de l'arrêté du 19 mars 1993), inspection commune, lignes de risques d'interférence.
8. **Carnet sanitaire eau / légionelles** — points de relevé, relevés de température ECS, analyses légionelles (UFC/L).

### Acteurs et preuve

9. **Prestataires & obligation de vigilance** — annuaire des prestataires avec suivi des attestations (URSSAF, RC Pro, Kbis) et alertes d'expiration (art. L. 8222-1 / D. 8222-5 CT). Cf. ADR-007.
10. **Accès externe sans compte** — lien magique + OTP email pour qu'un prestataire consulte, dépose un rapport ou signe, avec scopes. Cf. ADR-007.
11. **Signature électronique simple** — hash SHA-256, horodatage, page publique de vérification de preuve. Signature de fichiers et d'objets métier (JSON canonique). Cf. ADR-006 et ADR-008. (Pas de signature qualifiée eIDAS — hors périmètre.)

### Vie quotidienne

12. **Interventions (tickets)** — signalements avec photos, priorité, assignation, commentaires, clôture ; **boucle vers le DUERP** : une clôture peut déclencher la réévaluation d'un risque (le DUERP comme document vivant). Cf. ADR-009.
13. **Guide pédagogique « Comprendre »** — obligations « chez vous » expliquées (mode explain déterministe du moteur de matching), rôles, rythme annuel, comportement en cas de contrôle.

Tous ces modules partagent un **modèle de données unifié** : un établissement, des équipements, des obligations applicables, des vérifications, des actions, des acteurs. Le DUERP n'est pas un silo, c'est une vue spécifique sur cette donnée.

## Cadre légal de référence

Sources primaires libres d'accès uniquement :
- **Code du travail**, **CCH**, **Code de l'environnement** (Légifrance)
- **Arrêtés sectoriels** (Légifrance, Journal Officiel)
- **INRS** : fiches techniques, guides sectoriels
- **Ministère du Travail** : guides de l'employeur, fiches ED

**Attention** : aucune base de données commerciale ne doit être recopiée. Le référentiel est reconstruit depuis les textes officiels, avec traçabilité de la source pour chaque obligation. La fiche AOCR dans `spec/` est une base de travail, pas une source citable.

## Périmètre

### Utilisateurs cibles
- Dirigeants de TPE/PME (1 à 50 salariés), non-experts en prévention
- Secteurs à faible complexité technique

### Secteurs couverts (DUERP)
1. **Restauration** (NAF 56.xx)
2. **Commerce de détail** (NAF 47.xx)
3. **Bureau / services tertiaires**

### Référentiel de conformité (vérifications)
Livré : **65 obligations sur 9 domaines** (P1 + P2 + P3) — électricité, incendie, aération/ventilation, cuisson/hottes, ascenseurs, portes/portails automatiques, équipements sous pression, stockage de matières dangereuses, levage. Le référentiel vit en **TypeScript versionné** (`src/lib/referentiels/conformite/`), pas en base (ADR-003).

### Hors périmètre (à ce jour)
- IGH, ICPE complexes, sites industriels ; ATEX, rayonnements ionisants ; équipements sportifs, piscines
- Dépôt du DUERP sur le portail national dématérialisé
- Signature électronique **qualifiée** (la signature simple existe)
- Multi-utilisateurs internes par entreprise (rôles, permissions fines) — l'accès externe prestataire par token existe, lui
- Notifications de relance (email/push/SMS) — seuls les emails transactionnels existent (OTP, liens d'accès)
- Paiement / abonnement / gestion commerciale
- Intégration SIRENE pour auto-complétion SIRET
- Analyses comparatives / benchmarks sectoriels
- Registres non couverts : accidents du travail / AT bénins, registre unique du personnel, dangers graves et imminents, suivi nominatif formations/habilitations, EPI, visites médicales

## Stack technique

- **Next.js 16** (App Router, Server Actions) + **React 19**
- **TypeScript strict**
- **PostgreSQL** + **Prisma** (ORM)
- **Supabase Auth** (`@supabase/ssr`) pour l'authentification — cf. ADR-005. Supabase sert uniquement d'auth provider ; la data reste accédée via Prisma (rôle `postgres`, bypass RLS). Pas de modèle `User` en base : l'identité vit chez Supabase, `Entreprise.userId` fait le lien.
- **react-hook-form** + **Zod** pour les formulaires et la validation
- **Tailwind CSS** + **shadcn/ui** (+ `@base-ui/react`, `@dnd-kit` pour le board) pour l'interface
- **@react-pdf/renderer** pour la génération PDF ; `jszip` (export contrôle), `qrcode` (affiche accessibilité), `xlsx` (import DUERP)
- **Vitest** pour les tests unitaires
- **Playwright** pour les e2e critiques — **prévu, pas encore installé**

Le stockage des fichiers uploadés passe par une **abstraction** (`src/lib/storage/`) : filesystem local aujourd'hui, S3/R2 possible ensuite.

## Architecture

### Modèle de données (prisma/schema.prisma)

Cœur : `Entreprise` → `Etablissement` (régimes cumulables travail/ERP/IGH/habitation, ADR-001/004) → `UniteTravail`, `Equipement`, `Duerp`/`DuerpVersion`, `Risque`, `Verification`, `RapportVerification`, `Action` (unifiée, XOR risque/vérification — ADR-002 ; `Mesure` a été supprimée).

Modules complémentaires : `Prestataire`, `AccessToken`, `Signature`, `RegistreAccessibilite`, `PermisFeu`, `PlanPrevention`/`LignePlanPrevention`, `CarnetSanitaire`/`PointReleve`/`ReleveTemperature`/`AnalyseLegionelle`, `Intervention`/`CommentaireIntervention`.

Il n'y a **pas** de modèle `Obligation` en base : le référentiel d'obligations est du TypeScript (ADR-003).

### ADR (docs/adr/) — décisions tranchées, ne pas re-débattre
1. **001** — Introduction de l'entité `Etablissement`
2. **002** — Action corrective unifiée (`Mesure` absorbée)
3. **003** — Référentiels en TypeScript versionné, pas en base
4. **004** — Typologie d'établissement = flags cumulables + enums de précision
5. **005** — Authentification Supabase, data via Prisma
6. **006** — Signature électronique horodatée
7. **007** — Prestataires & accès externe par token
8. **008** — Signature multi-objets (JSON canonique)
9. **009** — Boucle tickets ↔ DUERP
10. **010** — Registre de sources d'échéances du calendrier
11. **011** — Dates civiles, fuseau de référence et prédicats de retard
12. **012** — Conservation des preuves : régénération idempotente, suppression logique
13. **013** — Serveur MCP distant authentifié en OAuth 2.1
14. **014** — Le retour dit d'où l'on vient, le fil d'Ariane dit où la fiche vit
15. **015** — « À faire » est un écran (le calendrier), tableau de bord au rail
16. **016** — La nature d'une échéance est un type fermé, la famille s'en déduit
17. **017** — Les opérations ponctuelles ne sont ni des corrections ni des registres
20. **020** — Ce qu'un DUERP ne couvre pas se déclare, et se grave avec lui

Les numéros 018 et 019 sont portés par des chantiers en cours sur d'autres
branches — le retrait du module Interventions et le bâtiment comme lieu. La
puce reprend le numéro de l'ADR plutôt que son rang dans la liste, pour que les
trois branches puissent atterrir dans n'importe quel ordre sans se contredire.

Toute nouvelle décision structurante → nouvel ADR avant de coder.

## Expérience utilisateur

### Navigation (double sidebar : rail + panneau)

Une entrée de rail = une **page d'entrée** + un **panneau** : cliquer navigue
et ouvre le panneau (ADR-015).

- **Tableau de bord** : lien direct, sans panneau — le board de widgets
- **À faire** (→ le calendrier, toutes familles) : Calendrier · Plan d'actions · Interventions · Préparer un contrôle — que des **activités**, jamais l'état filtré d'une autre entrée ; un filtre vit dans l'écran
- **Opérations** (→ Permis de feu) : Permis de feu · Plans de prévention — le
  **ponctuel encadré**, qui naît d'un chantier daté et meurt clos ; ce n'est
  ni une correction ni un registre tenu en continu (ADR-017)
- **Mon établissement** (→ Équipements) : Équipements · Prestataires · Fiche établissement · (Équipe, à venir)
- **Mes registres** (→ DUERP, à plat) : DUERP · Registre de sécurité · Accessibilité · Carnet sanitaire — ce qui se tient en continu
- **Comprendre** : guide pédagogique
- **Connecter** : brancher un assistant en lecture seule sur le dossier (serveur MCP local — spike, cf. `scripts/mcp-server.ts`)
- **Compte**

### Tableau de bord
Le tableau de bord est un **board personnalisable de widgets** (`src/components/dashboard/widgets/`) : un registre central de widgets avec variants de visualisation, un layout par défaut éditorial, un tiroir « Ajouter un widget », drag-and-drop, persistance versionnée en localStorage (`useLayoutPerso`). Le widget Équipements est épinglé (obligatoire). Un bandeau « brief » en tête liste les éléments à traiter.

### Onboarding
Compte → entreprise → établissement (SIRET, régimes, catégorie ERP déduite) → déclaration guidée des équipements → génération automatique des obligations applicables et du calendrier.

### Garde-fous (jamais bloquants, toujours informatifs)
- Hiérarchie des mesures de prévention (L. 4121-2) : alerte si seulement EPI/formation
- Détection de sous-cotation dans le DUERP
- Alerte dépassement d'échéance (vérification, action)
- Alertes vigilance prestataires (documents expirés / à renouveler)

## Génération documentaire

Sorties générées côté serveur, en mode déterministe, avec mentions légales :
1. **DUERP** — versionné, figé à chaque validation
2. **Registre de sécurité** — consolidation horodatée
3. **Plan d'actions de conformité** — liste priorisée
4. **Dossier de conformité complet** — synthèse présentable à un tiers
5. **Export contrôle** — ZIP « 1 clic » (page Préparer un contrôle)
6. **Affiche QR du registre d'accessibilité** — page publique consultable

## État d'avancement

Les étapes 0 à 11 de `spec/PLAN.md` sont livrées. Le travail actuel dépasse le PLAN d'origine : marque Rojer, board à widgets, double sidebar, et les modules 5 à 13 ci-dessus. Reste notamment : e2e Playwright, polish/a11y/RGPD (étape 12), et les registres listés hors périmètre.

## Règles de conduite pour Claude Code

1. **Lire le code existant avant d'écrire.** Ne rien casser sans raison.
2. **Proposer une approche avant de coder** pour tout changement structurant (modèles de données, refactors).
3. **Écrire des ADR** pour chaque décision qui engage l'architecture.
4. **Commits atomiques** et messages explicites.
5. **Tests écrits en même temps que le code.** Les règles métier critiques (matching, cotation, calendrier, vigilance, boucle DUERP) ont une couverture renforcée.
6. **Ne jamais inventer une référence réglementaire.** Si la source n'est pas vérifiable sur Légifrance ou INRS, l'obligation n'entre pas dans le référentiel.
7. **Pas de LLM** pour traiter, reformuler, classer ou analyser du contenu utilisateur.
8. **Pas de conseil juridique automatisé.** L'outil aide à structurer et rappelle les obligations, il ne dit jamais « vous êtes conforme ».
9. **RGPD** : hébergement UE, politique de rétention explicite, export et suppression possibles à tout moment.
10. **Conservation 40 ans** pour les versions de DUERP (obligation légale).

## Ce qu'il ne faut pas faire

- Traiter Rojer comme « le DUERP + des extras » — le DUERP est un module parmi d'autres, pas le centre
- Dupliquer les concepts (deux modèles d'action, deux notions d'équipement) par souci de ne pas refactorer
- Construire ou étendre un référentiel sans sources vérifiables
- Ajouter de l'IA « pour aider » sur un document à valeur légale
- Déclarer qu'un utilisateur est conforme (l'outil assiste, il ne certifie pas)
- Sortir du périmètre des 3 secteurs DUERP validés pour faire plaisir à un utilisateur test
