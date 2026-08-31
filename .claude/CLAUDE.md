# CLAUDE.md — Rojer, plateforme de pilotage de la prévention (TPE/PME)

## Vision produit

> **« Concentrez-vous sur votre activité, Rojer coordonne la prévention des risques de votre structure. »**

**Rojer** (nom du produit, ex-DUERP.fr) est une application Next.js qui accompagne un **dirigeant de TPE/PME (non-expert)** dans le pilotage **continu** de sa conformité santé-sécurité réglementaire.

Le DUERP a été le socle historique du produit, mais il n'en est plus qu'une composante. Rojer centralise aujourd'hui l'ensemble des registres, données et acteurs de la prévention : vérifications périodiques, registre de sécurité, plan d'actions, registre d'accessibilité, permis de feu, plans de prévention, carnet sanitaire, prestataires, signatures.

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

12. **Guide pédagogique « Comprendre »** — obligations « chez vous » expliquées (mode explain déterministe du moteur de matching), rôles, rythme annuel, comportement en cas de contrôle.

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
Livré : **115 obligations sur 17 domaines** — électricité, incendie, aération/ventilation, cuisson/hottes, ascenseurs, portes/portails automatiques, équipements sous pression, stockage de matières dangereuses, levage, froid (contrôle d'étanchéité des fluides frigorigènes), et depuis le 2026-08-31 formation à la sécurité, santé au travail, premiers secours, organisation de la prévention, information des travailleurs, locaux sociaux, co-activité. Le référentiel vit en **TypeScript versionné** (`src/lib/referentiels/conformite/`), pas en base (ADR-003).

**82 d'entre elles sont déclenchées par un équipement déclaré, vingt et une sont portées
par l'établissement, douze par un salarié.**

Les obligations d'établissement s'appliquent **même si aucun équipement n'est
déclaré**, et produisent **une seule ligne** chacune, jamais une par installation
(ADR-022) : `PE 4 § 2` (entretien triennal des installations techniques en ERP de
5ᵉ catégorie), `R. 4222-20` (contrôle annuel des installations d'aération), les cinq
entrées du lot 7 — organiser la formation à la sécurité (`L. 4141-2`), informer les
salariés et leur donner accès au DUERP (`R. 4141-3-1`), tenir à jour la liste des postes
à risques particuliers (`R. 4624-23 III`, annuelle), équiper les lieux d'un matériel de
premiers secours (`R. 4224-14`) et organiser par écrit les premiers secours
(`R. 4224-16`) — et les quatorze du lot 8 : désigner un salarié compétent
(`L. 4644-1`), adhérer à un service de prévention et de santé au travail (`L. 4622-1`),
recevoir la fiche d'entreprise (`R. 4624-46`), afficher les coordonnées du service de
santé, des secours et de l'inspection (`D. 4711-1`), afficher l'avis d'accès au DUERP
(`R. 4121-4`), mettre à disposition sanitaires (`R. 4228-1`) et eau potable
(`R. 4225-2`), établir un protocole de sécurité de chargement (`R. 4515-4`), organiser
la formation à la manutention (`R. 4541-8`) et au travail sur écran (`R. 4542-16`), plus
quatre lignes qui dépendent d'un seuil d'effectif — CSE à 11 (`L. 2311-2`), règlement
intérieur à 50 (`L. 1321-1`), et les deux régimes exclusifs de restauration qui se
partagent le seuil de 50 (`R. 4228-22` et `R. 4228-23`).

**Aucune de ces quatorze n'a de périodicité** : les quatorze portent `autre`. C'est le
résultat du dépouillement, pas une commodité — aucun des textes lus n'écrit de durée.
Les seuls chiffres qu'ils portent sont des seuils d'effectif, des délais d'entrée en
obligation (douze mois) et des durées de stage.

**Les sept derniers domaines ne naissent d'aucun équipement**, et c'est ce qui les
distingue des dix premiers : leur déclencheur est le statut d'employeur, l'effectif ou
la co-activité. Un bureau de six personnes sans le moindre appareil déclaré doit
désormais **dix-sept obligations** — une seule avant le 2026-08-31, six après le lot 7,
dix-sept après le lot 8. À douze salariés il en doit dix-huit (le CSE s'ajoute), à
cinquante-cinq dix-neuf (le règlement intérieur s'ajoute, et le local de restauration
remplace l'emplacement).

Le type `Obligation` est une union discriminée sur `porteur` : catégorie d'équipement
requise et non vide d'un côté, interdite de l'autre. Le compte faisant foi est le préfixe
d'`EMPREINTE_ATTENDUE` (`conformite.test.ts`), doublé d'un test qui nomme le nombre.

### Registre des obligations : déclencheurs et porteurs

Rojer couvre les obligations de **santé-sécurité au travail et de sécurité du bâtiment**
— Code du travail, CCH, et Code de l'environnement quand il porte sur la sécurité des
installations ou des personnes. Une obligation y naît de cinq déclencheurs possibles :

1. **Équipement déclaré** — 82 obligations livrées
2. **Statut d'employeur** — dès un salarié. **15 obligations livrées au lot 7**
   (2026-08-31) : formation à la sécurité, information et accès au DUERP, VIP, suivi
   individuel renforcé et sa visite intermédiaire, liste des postes à risques, matériel
   et organisation des premiers secours, secouriste, conduite d'équipements. **11 de
   plus au lot 8** le même jour : salarié désigné compétent, adhésion au service de
   prévention et de santé au travail, fiche d'entreprise, affichages obligatoires
   (`D. 4711-1`), avis d'accès au DUERP (`R. 4121-4`), sanitaires, eau potable,
   protocole de sécurité de chargement, formation à la manutention, formation au travail
   sur écran, et l'emplacement de restauration
3. **Effectif** — seuils 11, 25, 50. **4 obligations livrées au lot 8** (2026-08-31),
   les premières à s'appuyer sur `TypologieApplication.effectifMin` hors du domaine
   incendie : CSE à 11, règlement intérieur à 50, et les deux régimes de restauration.
   Le mécanisme existait depuis l'ADR-004 ; il n'a pas fallu de déclencheur
   « événement » pour l'employer. Ce que le produit ne sait pas faire, et qui est écrit
   dans chaque `notesInternes` : `L. 2311-2` et `L. 1311-2` datent l'obligation par une
   durée de douze mois à compter du franchissement, et le modèle n'historise pas
   l'effectif. La ligne apparaît au franchissement constaté — en avance sur l'échéance
   légale, jamais en retard
4. **Typologie et caractéristiques du bâtiment** — ERP, locaux à sommeil, année du permis
5. **Activité réellement exercée** — un fait de tâche, ni statut ni équipement : habilitation électrique, conduite d'engins, travail en hauteur

Elle est portée par un **équipement**, un **salarié** ou l'**établissement** — trois
porteurs, pas quatre : le bâtiment est un **lieu** et ne porte aucune échéance (ADR-019),
le bâtiment d'une échéance se lisant en remontant la chaîne par l'équipement. Elle prend
quatre natures : échéance récurrente, état permanent à constituer puis maintenir,
obligation ponctuelle, obligation événementielle.

**Il n'y a pas de sixième déclencheur « événement ».** Un accident, une embauche ou un
chantier *datent* une obligation, ils ne la font pas naître — et les seules lignes
réellement événementielles recensées sont hors périmètre (déclaration d'AT, registre des
accidents bénins) ou déjà servies par le module `PlanPrevention`. L'axe est nommé dans
l'ADR-022, sans mécanisme.

**Les trois porteurs sont implémentés** : équipement et établissement (ADR-022), salarié
(ADR-023). Le porteur salarié se distingue des deux autres sur un point : ses instances ne
sont **pas dérivées** par le moteur. Rien ne dit qu'une personne opère sur des installations
électriques — ce serait le cinquième déclencheur, non implémenté —, donc l'employeur déclare
qui détient quel titre (`Salarie`, `TitreSalarie`), et le référentiel fournit le catalogue.

**Douze obligations salarié sont livrées** depuis les lots 7 et 8 (2026-08-31) — le catalogue n'en
comptait qu'une jusque-là, l'attestation médicale quinquennale de `R. 4544-11-1` :
formation à la sécurité reçue (`R. 4141-20`, due à TOUS les salariés), formation à la
conduite et autorisation de conduite (`R. 4323-55`, `R. 4323-56`), attestation médicale de
conduite (`R. 4323-56`, quinquennale), secouriste SST (`R. 4224-15`), VIP (`R. 4624-16`,
quinquennale), suivi individuel renforcé (`R. 4624-28`, quadriennale) et sa visite
intermédiaire (biennale) ; le lot 8 y ajoute la formation en santé, sécurité et
conditions de travail des membres du CSE et du salarié désigné compétent (`L. 2315-18`,
sans périodicité — cinq et trois jours sont des durées de stage, et le rythme suit un
mandat que le produit ne modélise pas).

Le lot 8 ajoute six corpus, tous `articles_cites` et tous disant dans leur `portee` ce
qu'ils laissent non lu : `code-travail-organisation-prevention` (5 articles),
`code-travail-information-travailleurs` (2), `code-travail-locaux-sociaux` (5),
`code-travail-co-activite` (9, dont un non dépouillé), `code-travail-service-prevention-sante`
(4) et `code-travail-manutention-ecran` (2). Il complète aussi `code-travail-sante-travail`
avec `R. 4624-46` et `-47` (fiche d'entreprise). **Deux références du brief se sont
révélées fausses à la lecture** et sont corrigées : le protocole de sécurité de
chargement ne se fonde pas sur l'arrêté du 26 avril 1996 mais sur `R. 4515-4` et
suivants, qui l'ont codifié en 2008 ; et le règlement intérieur n'entre dans le périmètre
santé-sécurité que par `L. 1321-1` 1°, `L. 1311-2` ne portant que le seuil.

**Deux dérogations de périodicité, à ne pas oublier en étendant le suivi médical** : la VIP
tombe à **trois ans au plus** pour le travailleur handicapé, celui qui déclare une pension
d'invalidité et le travailleur de nuit (`R. 4624-17`), et le suivi renforcé passe à **un an
ferme sans visite intermédiaire** pour le travailleur exposé aux rayonnements ionisants
classé en catégorie A (`R. 4451-82`). Chacune a sa ligne de catalogue. Les textes propres
aux quatre autres expositions du `R. 4624-23 I` — CMR, agents biologiques 3 et 4,
hyperbare, échafaudages — **n'ont pas été ouverts** ; ne pas conclure de ce silence qu'ils
ne dérogent pas.

Les corpus `R. 4141-*` (26 articles, intégral), `R. 4624-*` (6 articles cités),
`R. 4224-14` à `-16` (intégral) et `R. 4323-55` à `-57` (intégral) sont dépouillés.
**Le CACES n'est pas encodé et ne doit pas l'être** : il n'est dans aucun des trois
articles de la section 7 — c'est un dispositif conventionnel de la CNAM, le Code
n'exigeant qu'une « formation adéquate » et une autorisation de conduite.

Les quatre déclencheurs non implémentés représentent **62 obligations recensées** — détail et
sources dans `docs/carto-obligations-hors-equipement.md`.

**Ce que le chantier laisse ouvert est écrit** : `docs/dette-chantier-porteur-echeance.md`.
Limites connues, promesses non tenues et décisions repoussées, chacune avec sa raison — dont
une à lire avant de s'y fier : l'export JSON du titulaire du compte et la suppression de
compte **n'existent pas**. `docs/rgpd.md` § 5.1 le dit désormais et renvoie à une demande
manuelle ; la **règle 9 de ce fichier continue de les annoncer au présent**, et c'est le
manque qui reste ouvert (`docs/dette-chantier-porteur-echeance.md` § 1.1). À consulter avant
d'ouvrir un lot sur ce périmètre, pour ne pas redécouvrir une limite déjà tranchée.

**Données de salariés** : `docs/rgpd.md` est le document qui fait foi. Base légale RGPD 6.1.c,
jamais le consentement. L'outil ne stocke d'une pièce médicale que son existence, sa date et
son échéance — plus strict que le texte, qui autorise l'employeur à en conserver copie.

**Règle du non-renseigné** — *l'incertitude ne réduit jamais la couverture*. Posée par
l'ADR-022, **pas encore appliquée partout** : deux attributs d'établissement font
aujourd'hui l'inverse et sont recensés dans l'ADR (`manipuleMatieresR422722` absent lu
« non », `personnesPresentesHabituellement` absent retombant sur `effectifSurSite`). Toute
condition d'établissement **nouvelle** suit la règle. `null` ne
vaut pas « non » : une obligation conditionnée à un attribut d'établissement non renseigné
s'affiche « à confirmer », et un allègement de régime conditionné à l'absence de cet
attribut ne s'applique pas tant que l'absence n'est pas déclarée. C'est l'inverse de
`equipement_propriete_booleenne`, où l'absence rend la condition non satisfaite : une
propriété d'équipement absente dit « cet équipement n'a pas cette caractéristique », une
propriété d'établissement absente dit « on ne sait pas encore ».

**Suivi nominatif des salariés** — dans le périmètre. L'obligation est nominative par
nature : R. 4544-10 fait délivrer le titre d'habilitation à un travailleur désigné, et il
en va de même d'une attestation SST, d'un CACES ou d'une autorisation de conduite. Un
suivi par poste produit un compteur, jamais une preuve. Base légale : obligation légale de
l'employeur, jamais le consentement, qui n'est pas libre en situation de subordination.

**Frontière sur la santé.** Le dossier médical en santé au travail appartient au service
de prévention, pas à l'employeur : celui-ci ne reçoit que l'avis d'aptitude ou
d'inaptitude, les propositions d'aménagement et les restrictions. **Aucun élément de
diagnostic ne lui est transmis, jamais** — c'est la contrainte légale.

Nuance : l'employeur détient légalement certaines pièces. R. 4544-11-1 lui fait conserver
copie de l'attestation d'absence de contre-indication médicale pendant sa durée de
validité. La règle de l'application est donc **plus stricte que le texte**, et c'est un
choix produit assumé, pas une obligation : on ne stocke que l'existence de la pièce, sa
date et son échéance. Un outil qui héberge des pièces médicales de salariés change de
nature réglementaire et de surface de risque ; la valeur ajoutée d'en garder le contenu
est nulle, la conservation reste à la charge de l'employeur hors de l'outil.

### Hors périmètre (à ce jour)
- IGH, sites industriels ; ATEX, rayonnements ionisants ; équipements sportifs, piscines
- **ICPE** — les seuils ne sont pratiquement jamais atteints dans les 3 secteurs cibles (rubrique 2925 à 600 kW, 1510 à 5 000 m³), et encoder la nomenclature serait un produit en soi. Une question fermée à l'onboarding bascule le dossier en couverture partielle. Les déchets suivent la même règle ; les fluides frigorigènes restent dedans, ils y sont par la sécurité des équipements
- **Obligations d'exploitation non-SST** : affichages commerciaux (prix, allergènes, origine des viandes, licence), HACCP / PMS / agrément sanitaire, débit de boissons, métrologie des instruments de pesage, SACEM, décret tertiaire / OPERAT, vidéosurveillance, assurances
- **RH non-SST** : DPAE, registre unique du personnel, BDESE, index égapro, DOETH
- Dépôt du DUERP sur le portail national dématérialisé
- Signature électronique **qualifiée** (la signature simple existe)
- Multi-utilisateurs internes par entreprise (rôles, permissions fines) — l'accès externe prestataire par token existe, lui
- Notifications de relance (email/push/SMS) — seuls les emails transactionnels existent (OTP, liens d'accès)
- Paiement / abonnement / gestion commerciale
- Intégration SIRENE pour auto-complétion SIRET
- Analyses comparatives / benchmarks sectoriels
- Signalements de terrain / ticketing : le module Interventions a été retiré (ADR-018) ; rien ne relie plus un constat à une action datée
- Registres non couverts : accidents du travail / AT bénins, dangers graves et imminents, EPI

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

Modules complémentaires : `Prestataire`, `AccessToken`, `Signature`, `RegistreAccessibilite`, `PermisFeu`, `PlanPrevention`/`LignePlanPrevention`, `CarnetSanitaire`/`PointReleve`/`ReleveTemperature`/`AnalyseLegionelle`.

`Intervention`/`CommentaireIntervention` restent dans le schéma sans aucun code qui les lise : le module a été retiré (ADR-018), le `drop` des tables viendra dans une migration dédiée.

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
9. **009** — Boucle tickets ↔ DUERP (**annulée par l'ADR-018**)
10. **010** — Registre de sources d'échéances du calendrier
11. **011** — Dates civiles, fuseau de référence et prédicats de retard
12. **012** — Conservation des preuves : régénération idempotente, suppression logique
13. **013** — Serveur MCP distant authentifié en OAuth 2.1
14. **014** — Le retour dit d'où l'on vient, le fil d'Ariane dit où la fiche vit
15. **015** — « À faire » est un écran (le calendrier)
16. **016** — La nature d'une échéance est un type fermé, la famille s'en déduit
17. **017** — Les opérations ponctuelles ne sont ni des corrections ni des registres
18. **018** — Le module Interventions est retiré
19. **019** — Le bâtiment est un lieu : il ne porte aucun régime, et
    `Verification`/`Action` n'ont pas de `batimentId` — le bâtiment d'une
    échéance se lit en remontant la chaîne
20. **020** — Ce qu'un DUERP ne couvre pas se déclare, et se grave avec lui
21. **021** — Le registre est composé, pas imprimé à l'identique
22. **022** — Une obligation naît d'un déclencheur et se porte sur un sujet
    (équipement, établissement, salarié)
23. **023** — Le salarié porte ses titres, et l'outil n'en garde que l'échéance
24. **024** — Une obligation déclare ce qu'elle implique ailleurs : le
    produit nomme la transmission, il ne la dérive jamais

La puce reprend le numéro de l'ADR et non son rang dans la liste, pour que les
branches puissent atterrir dans n'importe quel ordre sans se contredire.

**Deux fichiers portent le numéro 014** — `014-prescriptions-particulieres.md`
et `014-provenance-navigation.md`. La liste ci-dessus n'en cite qu'un (le
second) ; les deux sont en vigueur. Collision à trancher, elle ne l'est pas ici.

Toute nouvelle décision structurante → nouvel ADR avant de coder.

## Expérience utilisateur

**La charte visuelle est dans `docs/charte-board.md`** — tokens, barème
typographique, composants du kit, patrons d'écran, et les interdits avec leur
raison. À lire avant d'écrire un écran.

Le point qu'on rate le plus souvent : **deux chartes cohabitent**. Le « board »
(`--board-*`, `carte-board`, rayon 30) est en vigueur ; le « papier »
(`cartouche`, `label-admin`, rayon 6) est de la dette, jamais une option. Or
plusieurs modules non repris — prestataires, DUERP, accessibilité — sont en
papier. Copier le module fonctionnellement le plus proche produit donc
régulièrement un écran hors charte.

### Navigation (double sidebar : rail + panneau)

Une entrée de rail = une **page d'entrée** + un **panneau** : cliquer navigue
et ouvre le panneau (ADR-015).

- **La marque « Rojer »**, en tête de rail : le retour au **tableau de bord**, qui n'a pas d'entrée de navigation — un résumé n'est pas une des questions du dirigeant, il y répond toutes (ADR-015, seconde révision)
- **À faire** (→ le calendrier, toutes familles) : Calendrier · Plan d'actions · Préparer un contrôle — que des **activités**, jamais l'état filtré d'une autre entrée ; un filtre vit dans l'écran
- **Opérations** (→ Permis de feu) : Permis de feu · Plans de prévention — le
  **ponctuel encadré**, qui naît d'un chantier daté et meurt clos ; ce n'est
  ni une correction ni un registre tenu en continu (ADR-017)
- **Mon établissement** (→ Équipements) : Équipements · Prestataires · Fiche établissement · Équipe
- **Mes registres** (→ DUERP, à plat) : DUERP · Registre de sécurité · Accessibilité · Carnet sanitaire — ce qui se tient en continu
- **Paramètres** (→ Connecter) : entrée sans panneau — régler le dossier et y
  brancher un assistant en lecture seule (serveur MCP local — spike, cf.
  `scripts/mcp-server.ts`)

Le **compte** a quitté le pied de rail pour la barre haute (`BarreCompte`) :
la sidebar porte la hiérarchie du produit, la barre haute les utilitaires de
session. Le **guide « Comprendre »** n'a plus d'entrée de rail ; sa page vit
toujours et se rejoint depuis « Préparer un contrôle », « Connecter » et la
fiche d'un équipement. Aucune tuile ne s'allume dessus — une entrée de rail
désigne une page, pas une approximation.

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

Les étapes 0 à 11 de `spec/PLAN.md` sont livrées. Le travail actuel dépasse le PLAN d'origine : marque Rojer, board à widgets, double sidebar, et les modules 5 à 12 ci-dessus. Reste notamment : e2e Playwright, polish/a11y/RGPD (étape 12), et les registres listés hors périmètre.

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
