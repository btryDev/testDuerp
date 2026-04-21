# PLAN.md — Construction étape par étape de la plateforme de conformité

## Comment utiliser ce plan

Ce plan décrit la construction de la V2 en **étapes indépendantes et livrables**. Chaque étape doit être **terminée, testée, validée et mergée** avant de passer à la suivante.

**Règle d'or pour Claude Code** : ne jamais enchaîner plusieurs étapes d'un coup. À la fin de chaque étape, s'arrêter, présenter le résultat, attendre validation avant de continuer.

Au début de chaque étape, Claude Code doit :
1. Lire le code existant concerné
2. Proposer son approche (réutilisation / extension / refactor)
3. Écrire un ADR si la décision est structurante
4. Attendre feu vert avant de coder

---

## ÉTAPE 0 — Audit de l'existant et décisions structurantes

**Objectif** : comprendre ce qui est en place et trancher les questions d'architecture avant d'écrire une ligne de code V2.

**Travail à faire** :
- Lire l'intégralité du code existant (modèles Prisma, référentiels TS, moteur de cotation, génération PDF, UI)
- Produire un document `/docs/audit-existant.md` qui résume :
  - Ce qui peut être réutilisé tel quel
  - Ce qui doit être étendu
  - Ce qui doit être refactoré
  - Ce qui peut être supprimé
- Écrire les ADR suivants dans `/docs/adr/` :
  - **ADR-001** : Introduction de l'entité `Etablissement` entre `Entreprise` et le reste du modèle
  - **ADR-002** : Unification des actions correctives (DUERP + vérifications) dans une entité `Action` unique
  - **ADR-003** : Organisation des référentiels (risques sectoriels DUERP + obligations de vérification) — structure de dossiers, typage commun ou séparé
  - **ADR-004** : Représentation de la typologie d'établissement (ERP catégorie, IGH, établissement de travail simple) — enum, flags, ou composition

**Critères de done** :
- Les quatre ADR sont écrits, chacun avec contexte / décision / conséquences / alternatives rejetées
- `/docs/audit-existant.md` est complet
- Une proposition de nouveau schéma Prisma (pas encore migré, juste proposé) est jointe
- Validation explicite avant de passer à l'étape 1

**Ce qu'il NE faut PAS faire** :
- Modifier le code
- Lancer une migration Prisma
- Supprimer quoi que ce soit

---

## ÉTAPE 1 — Refonte du modèle de données

**Objectif** : mettre en place le nouveau modèle de données unifié, migrer proprement, sans casser le DUERP existant.

**Travail à faire** :
- Modifier le schéma Prisma selon les ADR de l'étape 0
- Créer les nouvelles entités : `Etablissement`, `Equipement`, `Obligation`, `Verification`, `RapportVerification`, `Action` (unifiée)
- Écrire une migration propre, avec script de migration des données DUERP existantes vers le nouveau modèle (créer un `Etablissement` par défaut pour chaque `Entreprise` existante, migrer les `Mesure` vers `Action`, etc.)
- Tester la migration en local sur une base de données contenant des données de test DUERP
- Adapter les requêtes existantes (celles du DUERP) pour qu'elles continuent de fonctionner avec le nouveau modèle

**Critères de done** :
- La migration tourne sans erreur sur une base de données contenant des DUERP existants
- Les DUERP créés avant la migration restent consultables et modifiables
- Les tests existants du DUERP passent toujours à 100%
- Nouveaux tests unitaires sur les relations (un établissement a plusieurs équipements, un équipement peut avoir plusieurs vérifications, une action peut être liée soit à un risque soit à une vérification, etc.)
- La génération PDF du DUERP existant fonctionne toujours

**Ce qu'il NE faut PAS faire** :
- Construire l'UI de gestion des établissements (étape 2)
- Créer le référentiel d'obligations (étape 3)
- Toucher aux référentiels DUERP sectoriels

---

## ÉTAPE 2 — Gestion des établissements

**Objectif** : permettre à l'utilisateur de créer et gérer ses établissements.

**Travail à faire** :
- UI de création d'un établissement rattaché à une entreprise : raison d'affichage, adresse, typologie (ERP avec catégorie / IGH / établissement de travail classique), effectif sur site, code d'activité
- UI d'édition et de liste des établissements d'une entreprise
- Redirection depuis la page d'accueil vers la création du premier établissement si aucun n'existe
- Adaptation du parcours DUERP existant : un DUERP est désormais rattaché à un établissement, pas directement à une entreprise. Migration transparente pour les DUERP existants.
- Tests e2e : création entreprise → création établissement → accès au DUERP de cet établissement

**Critères de done** :
- Un utilisateur peut créer plusieurs établissements par entreprise
- Chaque DUERP existant est rattaché à l'établissement par défaut créé à l'étape 1
- Les parcours DUERP continuent de fonctionner sans régression
- Tests e2e verts

**Ce qu'il NE faut PAS faire** :
- Déclaration des équipements (étape 4)
- Obligations et calendrier (étapes 3 et 5)

---

## ÉTAPE 3 — Référentiel d'obligations réglementaires (contenu)

**Objectif** : construire le référentiel d'obligations réglementaires pour les domaines P1 (électricité, incendie, aération).

**Cette étape est principalement du travail de contenu, pas de code.**

**Travail à faire** :
- Créer la structure `/lib/referentiels-conformite/` (ou nom choisi en ADR-003)
- Pour chaque domaine (électricité, incendie, aération), produire un fichier TypeScript typé contenant les obligations :
  - Identifiant unique stable
  - Libellé compréhensible
  - Description longue si nécessaire
  - Référence réglementaire précise (article du Code du travail, CCH, arrêté) avec lien Légifrance en commentaire
  - Périodicité (enum : hebdomadaire, mensuelle, trimestrielle, semestrielle, annuelle, biennale, triennale, quinquennale)
  - Typologie concernée (ERP par catégorie, IGH, établissement de travail, selon effectif)
  - Profil du réalisateur (organisme agréé, personne qualifiée, exploitant, fabricant)
  - Criticité (1 à 5)
  - Conditions d'application (questions de détection qui permettent de savoir si l'obligation s'applique à un établissement donné)
- Rédiger chaque obligation **depuis les sources primaires**. Légifrance et INRS uniquement. Citer la source exacte en commentaire de code.
- Script de seed qui charge ce référentiel en base
- Documentation `/docs/referentiel-conformite.md` qui explique la démarche de construction, les sources utilisées, et comment ajouter une nouvelle obligation

**Critères de done** :
- Minimum 25 obligations couvrant électricité + incendie + aération
- Chaque obligation a une référence légale vérifiable sur Légifrance
- Le seed charge le tout sans erreur
- Tests unitaires de cohérence (périodicités dans l'enum, criticités 1-5, identifiants uniques, conditions d'application bien formées)
- Documentation complète

**Ce qu'il NE faut PAS faire** :
- UI de consultation du référentiel (pas utile pour l'utilisateur final)
- Moteur de matching (étape 5)
- Domaines P2 et P3 (à garder pour plus tard dans le même format)

**Point de rigueur** : si une obligation est trouvée sans référence légale vérifiable, elle n'entre pas dans le référentiel. Mieux vaut 20 obligations solides que 40 bancales. Chaque obligation doit pouvoir tenir face à un inspecteur.

---

## ÉTAPE 4 — Déclaration des équipements

**Objectif** : permettre à l'utilisateur de déclarer les équipements présents dans son établissement via un questionnaire guidé.

**Travail à faire** :
- Parcours par catégorie d'équipements, avec pré-remplissage selon le secteur/NAF de l'entreprise :
  - Installations électriques : type (BT classique, TGBT), date de mise en service approximative
  - Sécurité incendie : extincteurs (nombre, types), BAES, alarme, désenfumage
  - Ventilation : VMC, CTA, hotte professionnelle (restauration)
  - Appareils de cuisson (si restauration)
  - Ascenseurs (si présents)
  - Portes et portails automatiques
- Pour chaque équipement : caractéristiques minimales utiles au matching (type, localisation dans l'établissement, date d'installation si connue)
- Pré-remplissage intelligent : un restaurant coche automatiquement "hotte professionnelle" et "appareils de cuisson ERP", modifiable
- Possibilité d'ajouter / modifier / supprimer un équipement à tout moment après la déclaration initiale
- Vue synthétique des équipements par établissement

**Critères de done** :
- Un utilisateur peut compléter la déclaration des équipements d'un restaurant type en moins de 15 minutes
- Les données sont persistées en base correctement
- Les formulaires sont validés avec Zod, messages d'erreur en français clair
- Test e2e : parcours complet de déclaration pour les 3 secteurs

**Ce qu'il NE faut PAS faire** :
- Générer le calendrier (étape 6)
- Uploader des rapports (étape 7)

---

## ÉTAPE 5 — Moteur de matching équipements ↔ obligations

**Objectif** : logique métier pure qui, à partir des équipements déclarés et du type d'établissement, produit la **liste des obligations applicables**.

**Travail à faire** :
- Fonction pure : `determineObligationsApplicables(etablissement, equipements) : Obligation[]`
- Logique déterministe basée sur :
  - Typologie de l'établissement (ERP catégorie N, IGH, travail classique)
  - Effectif sur site (certaines obligations dépendent du seuil d'effectif)
  - Équipements présents (pas d'obligation ascenseur s'il n'y a pas d'ascenseur)
  - Secteur d'activité
- Mode "explain" : pour chaque obligation retenue, la fonction peut expliquer pourquoi elle s'applique (utile pour le support et pour l'UI future)
- Tests unitaires **massifs** : couvrir systématiquement les combinaisons typologie × équipement × effectif
- Pas d'UI dans cette étape — juste la logique

**Critères de done** :
- Le moteur est couvert par au moins 30 scénarios de test
- 100% des tests passent
- Le mode explain produit des explications claires
- Documentation des règles dans `/docs/regles-matching.md`

**Ce qu'il NE faut PAS faire** :
- Générer les occurrences de vérification dans le temps (étape 6)
- Interface utilisateur

---

## ÉTAPE 6 — Génération du calendrier de vérifications

**Objectif** : à partir des obligations applicables, générer les **occurrences de vérification** dans le temps sur les 24 prochains mois.

**Travail à faire** :
- Fonction pure qui prend : liste d'obligations applicables + équipements + dernière vérification connue (si applicable) et génère les prochaines occurrences `Verification`
- Règles :
  - Si aucune vérif précédente connue → échéance = aujourd'hui, statut `a_planifier_urgence`
  - Si vérif précédente connue → échéance suivante = date précédente + périodicité
  - Gestion des dispenses (exemple : dispense de vérif annuelle l'année d'un contrôle quinquennal)
- Persistance des occurrences en base
- UI calendrier : vue chronologique, filtres par domaine, par urgence, par équipement
- UI détail d'une vérification : obligation liée, équipement, réalisateur requis, dernière vérif, prochaine échéance

**Critères de done** :
- Le calendrier s'affiche correctement pour différents profils d'établissement testés (restaurant ERP catégorie 5, commerce sans ERP, bureau tertiaire)
- Tests unitaires du moteur de génération
- Performance : génération de 100 occurrences en moins de 500 ms
- Tri par urgence (échéance + criticité)
- Test e2e : après création d'un établissement et déclaration d'équipements, le calendrier est automatiquement peuplé

**Ce qu'il NE faut PAS faire** :
- Notifications email / push (hors MVP V2)
- Upload de rapports (étape 7)

---

## ÉTAPE 7 — Registre de sécurité numérique (upload des rapports)

**Objectif** : permettre à l'utilisateur d'uploader ses rapports de vérification et de les rattacher au calendrier.

**Travail à faire** :
- Upload de fichiers (PDF prioritairement, accepter aussi images et DOCX)
- Stockage avec **abstraction** permettant de passer plus tard à S3/R2 (démarrer en filesystem local)
- Validation stricte : type MIME, taille maximale, scan antivirus basique si possible
- Rattachement à une `Verification` précise via l'UI
- Métadonnées saisies manuellement à l'upload : date du rapport, organisme vérificateur, résultat (conforme / observations mineures / écart majeur), commentaires libres
- À l'enregistrement d'un rapport, recalcul automatique de la prochaine échéance de cette vérification
- Vue "registre de sécurité" : liste chronologique de tous les rapports de l'établissement, recherche, filtres
- Export global : génération d'un ZIP contenant tous les rapports + un index PDF généré

**Critères de done** :
- Upload robuste avec gestion d'erreur propre
- Les rapports sont correctement liés aux vérifications
- Le calendrier se met à jour automatiquement après upload
- Export ZIP fonctionnel avec index lisible
- Tests e2e : upload → visualisation → export
- Politique de rétention documentée dans `/docs/rgpd.md`

**Ce qu'il NE faut PAS faire** :
- OCR ou analyse automatique du contenu (c'est de l'IA)
- Extraction automatique de dates ou résultats depuis le PDF (idem)

---

## ÉTAPE 8 — Plan d'actions de conformité (actions correctives unifiées)

**Objectif** : unifier le suivi des actions correctives, qu'elles viennent du DUERP (mesures prévues) ou d'un rapport de vérification (écart détecté).

**Travail à faire** :
- Finaliser l'unification `Mesure` (DUERP) ↔ `Action` décidée en ADR-002
- Une action peut être rattachée :
  - À un risque du DUERP (= mesure de prévention prévue)
  - À une vérification (= levée d'écart sur un rapport)
- Fiche d'action : description, type (selon hiérarchie L4121-2), criticité, échéance, responsable, statut (ouverte / en cours / levée / abandonnée), justificatif de levée
- Vue liste unifiée des actions en cours, filtrable par origine (DUERP / vérification), par criticité, par échéance
- Signal visuel pour les actions en retard
- Garde-fou hiérarchie des mesures (art. L4121-2) maintenu : alerte si seulement EPI/formation pour un risque donné

**Critères de done** :
- Un utilisateur peut créer une action depuis un rapport avec écart
- Les actions DUERP existantes sont visibles dans la même interface
- Une action peut être clôturée avec un justificatif (nouveau rapport, photo, commentaire)
- Export PDF du plan d'actions
- Tests e2e : création action depuis rapport → levée avec justificatif

---

## ÉTAPE 9 — Tableau de bord unifié

**Objectif** : écran d'accueil qui donne en un coup d'œil la situation de conformité globale de l'établissement.

**Travail à faire** :
- Indicateurs clés :
  - Statut DUERP (à jour / à mettre à jour / en retard)
  - Vérifications en retard (nombre + liste rapide)
  - Vérifications à venir sous 30 jours
  - Actions correctives ouvertes (total + nombre en retard)
  - Score de conformité global (% d'obligations respectées — formule à définir proprement)
- Vue "actions recommandées" : les 3-5 prochaines choses utiles à faire, triées par urgence réelle
- Accès direct aux modules (calendrier, registre, DUERP, actions, documents)
- Écran responsive, utilisable sur mobile (un dirigeant consulte rarement depuis un poste fixe)

**Critères de done** :
- Le tableau de bord reflète fidèlement la situation
- Les indicateurs sont calculés en temps réel (pas de cache obsolète)
- Tests unitaires des calculs d'indicateurs
- Test e2e : connexion → lecture tableau de bord → clic sur une action recommandée → arrivée sur le bon module

---

## ÉTAPE 10 — Documents consolidés et dossier de conformité

**Objectif** : rendre possible l'export à la demande de documents propres, présentables à un tiers.

**Travail à faire** :
- **DUERP** : déjà en place, vérifier que tout fonctionne après la refonte
- **Registre de sécurité consolidé** : PDF récapitulatif de toutes les vérifications + ZIP des rapports
- **Plan d'actions de conformité** : PDF listant toutes les actions (ouvertes et closes sur la période)
- **Dossier de conformité complet** : PDF de synthèse regroupant page de garde + DUERP en cours + registre de sécurité + plan d'actions + mentions légales. Pensé pour être remis à un inspecteur, un assureur, un bailleur.
- Versioning : chaque génération du dossier complet crée un snapshot horodaté consultable

**Critères de done** :
- Les 4 documents sont générables à la demande, en moins de 10 secondes chacun
- Le dossier complet est cohérent (pas d'incohérences entre ses sections)
- Tests unitaires sur les fonctions de génération
- Test e2e : création d'un établissement type, parcours complet, export dossier de conformité, vérification de son contenu

---

## ÉTAPE 11 — Extension du référentiel (domaines P2 et P3)

**Objectif** : étendre le référentiel d'obligations aux domaines P2 et P3.

**Travail à faire** :
- Ajouter les obligations pour :
  - Appareils de cuisson ERP et hottes professionnelles (restauration)
  - Ascenseurs (CCH R125-x)
  - Portes et portails automatiques (R4224-15 CT)
  - Équipements sous pression (basique)
  - Stockage de matières dangereuses (limité)
  - Équipements de levage simples
- Même exigence de sources primaires que pour l'étape 3
- Mise à jour du moteur de matching pour intégrer les nouvelles règles
- Tests unitaires supplémentaires

**Critères de done** :
- Le référentiel total atteint minimum 60 obligations
- Tous les tests passent
- La documentation `/docs/referentiel-conformite.md` est à jour

---

## ÉTAPE 12 — Polish, performance, accessibilité

**Objectif** : finitions avant ouverture à un premier cercle d'utilisateurs test.

**Travail à faire** :
- Audit performance : Lighthouse sur les pages principales, optimisations si nécessaire
- Audit accessibilité : WCAG AA minimum sur les parcours critiques
- Responsive mobile sur tous les parcours
- Messages d'erreur en français clair partout
- États vides soignés (pas d'écran blanc quand pas encore de données)
- Onboarding guidé au premier usage
- Documentation utilisateur basique (page d'aide)
- CGU, politique de confidentialité, mentions légales
- Export complet des données utilisateur (RGPD)
- Suppression de compte avec purge (hors documents à conservation 40 ans)

**Critères de done** :
- Lighthouse > 90 sur les pages principales
- Parcours complet utilisable sur mobile
- Textes relus et cohérents
- Documents légaux en place

---

## Hors roadmap V2 (à noter pour plus tard)

Ces éléments sont **explicitement exclus** de la V2 et à ne pas anticiper dans le code :

- Notifications email / push / SMS
- Paiement et gestion d'abonnement
- Multi-utilisateurs par entreprise avec rôles
- Intégration SIRENE
- Import de DUERP existants
- Signature électronique qualifiée
- Dépôt sur portail national dématérialisé du DUERP (dispositif prévu par la loi 2021)
- Extension à des secteurs à risques particuliers (BTP, industrie, santé, chimie)
- API publique
- Application mobile native

Les garder en tête mais ne pas polluer l'architecture V2 avec des anticipations trop précoces.

---

## Règles transverses à toutes les étapes

1. **Un ADR par décision structurante.** Pas d'ADR pour les choix mineurs.
2. **Commits atomiques** avec messages explicites.
3. **Tests écrits avec le code**, pas après.
4. **Jamais de régression sur le DUERP existant** — au moindre doute, vérifier que les tests DUERP passent toujours.
5. **Référentiel : sources primaires uniquement.** Si ce n'est pas sur Légifrance ou INRS, ça n'y entre pas.
6. **Pas de LLM** pour traiter, reformuler, classer, ou analyser du contenu utilisateur.
7. **Pas de conseil juridique automatisé.** L'outil rappelle les obligations, il ne certifie pas la conformité.
8. **S'arrêter à la fin de chaque étape** et présenter le résultat pour validation avant de passer à la suivante.