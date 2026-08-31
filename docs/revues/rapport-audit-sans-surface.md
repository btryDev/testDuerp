# Audit — les obligations que le produit calcule et n'affiche pas

Mesure en lecture seule, exécutée le **2026-08-31** sur
`origin/integration/2026-08-31` (`0590cae`), dans un worktree dédié avec son
propre `node_modules`. **Aucune modification de code, aucun commit.**

Méthode : lecture du code des surfaces, plus appels directs à
`determineObligationsApplicables` sur quatre dossiers types. La base locale
(Docker 5433) a servi à **une seule chose** — lire la composition réelle du parc
du jeu de démonstration plutôt que de l'inventer — et n'a été qu'interrogée.

---

## Réponse en une page

**Le chiffre demandé — combien des 43 ne sont atteignables par aucun chemin — est
zéro, et ce zéro ne dit rien de bon.** Les 43 sont toutes atteignables, mais
**30 d'entre elles ne le sont que par le menu déroulant d'un formulaire de
saisie** : le `<select>` « Obligation concernée » de *Déclarer une prescription*,
sur un écran dont le texte d'accueil dit « si aucune autorité ne vous a rien
prescrit, il n'y a rien à faire ici ».

Les 13 autres sont nommées ailleurs, mais aucune ne l'est sur un écran qui la
présente comme une obligation due :

| Chemin | Combien des 43 | Ce qu'il en dit |
|---|---|---|
| Guide « Comprendre » → panneau **Par métier** | 3 | nommées, avec article et « permanente » — mais dans un panneau **statique**, identique pour tous les dossiers |
| Tableau de bord → **transmission** ADR-024 | 5 | nommées, mais sous l'angle « suppose un titre nominatif », et **elles disparaissent** dès qu'un titre du domaine est déclaré |
| Écran **Équipe** → catalogue des titres | 5 | nommées en prose, mais comme *titres déclarables*, jamais comme obligations dues |
| `<select>` du formulaire **Prescriptions** | 38 (dont **30 par ce seul chemin**) | libellé + « actuellement Sans échéance » |
| **Aucun chemin du tout** | **0** | — |

Et la réponse à la question de fond de l'audit :

> **Sur les quatre natures que nomme l'ADR-022, une seule a une surface.** Le
> produit a un calendrier ; il n'a rien pour l'état permanent, rien pour la
> ponctuelle, et pour l'événementielle il a **deux modules dédiés qui ne
> couvrent pas tout ce que le corpus classe ainsi**.

---

## 1. Les 43 sans périodicité, une par une

Décompte confirmé par appel du référentiel : **116 obligations, 43 en
`periodicite: "autre"`** (37 %) — **18** portées par un équipement, **20** par
l'établissement, **5** par un salarié. Plus **12** en
`mise_en_service_uniquement`, traitées au § 3.

Légende de la colonne *Surface* :

- **`<select>` seul** — nulle part ailleurs que le menu déroulant du formulaire
  de prescription ;
- **Guide/métier** — nommée dans le panneau statique « Par métier » du guide
  (`src/lib/guide/metiers.ts`), avec son article et le rythme « permanente » ;
- **TdB** — nommée sur le tableau de bord par la transmission ADR-024
  (`src/lib/dashboard/transmissions.ts`), **tant qu'aucun titre de son domaine
  n'est déclaré** ;
- **Équipe** — nommée en clair dans la phrase « Rojer ne propose que les titres
  dont il a lu le texte fondateur… Aujourd'hui : … »
  (`equipe/page.tsx:151-156`), sur tous les dossiers.

### Porteur équipement — 18

| # | Obligation | Domaine | Crit. | Surface |
|---|---|---|---|---|
| 1 | `elec-travail-consignation-registre` — Consignation des rapports de vérification électrique au registre | électricité | 3 | `<select>` seul |
| 2 | `elec-travail-habilitation-personnel` — Habilitation électrique du personnel | électricité | 4 | **TdB** |
| 3 | `incendie-travail-moyens-lutte` — Présence et maintien en état des moyens de lutte | incendie | 5 | **Guide/métier** (onglet *Bureau*) |
| 4 | `incendie-erp-5-visite-commission` — Visite périodique de la commission de sécurité | incendie | 4 | `<select>` seul |
| 5 | `ascenseur-entretien-contrat` — Contrat d'entretien avec prestations minimales | ascenseur | 4 | `<select>` seul |
| 6 | `ascenseur-carnet-entretien` — Tenue du carnet d'entretien | ascenseur | 3 | `<select>` seul |
| 7 | `ascenseur-telealarme-liaison` — Liaison permanente avec un service d'intervention | ascenseur | **5** | `<select>` seul |
| 8 | `porte-auto-dossier-maintenance` — Tenue du dossier de maintenance | porte/portail | 3 | `<select>` seul |
| 9 | `porte-auto-maintien-en-etat` — Maintien en état et réparation sans délai | porte/portail | **5** | `<select>` seul |
| 10 | `esp-dossier-suivi` — Tenue du dossier de suivi | ESP | 3 | `<select>` seul |
| 11 | `esp-personnel-formation` — Formation et information des opérateurs | ESP | 3 | `<select>` seul |
| 12 | `stockage-dangereux-declaration-icpe` — Vérification du régime ICPE applicable | stockage | 4 | `<select>` seul |
| 13 | `stockage-dangereux-retention` — Capacité de rétention | stockage | **5** | `<select>` seul |
| 14 | `stockage-dangereux-verification-etancheite` — Vérification régulière de l'état du stockage | stockage | 4 | `<select>` seul |
| 15 | `stockage-dangereux-fiches-donnees` — FDS à jour et accessibles | stockage | 3 | `<select>` seul |
| 16 | `stockage-dangereux-formation-personnel` — Formation du personnel manipulant | stockage | 3 | `<select>` seul |
| 17 | `levage-registre-securite-consignation` — Tenue du registre de sécurité (levage) | levage | 3 | `<select>` seul |
| 18 | `froid-controle-etancheite-apres-modification` — Contrôle d'étanchéité après modification | froid | 4 | `<select>` seul |

**Trois de criticité 5 n'ont aucun chemin hors le `<select>`** : la téléalarme
d'ascenseur, le maintien en état d'une porte automatique, la rétention d'un
stockage de liquides dangereux.

**Sur l'ancienneté du défaut, une correction au brief.** Les 18 fichiers de
domaine datent bien d'avant les lots d'aujourd'hui (`git log --diff-filter=A` :
17 au 2026-04-21, `froid.ts` au 2026-08-21). Mais **six de ces obligations
n'étaient pas en `autre` à l'origine** — leurs `notesInternes`, que j'ai lues,
datent la conversion :

| Obligation | Ce que la note dit |
|---|---|
| `incendie-travail-moyens-lutte` | « AMENDEMENT 2026-08-27, audit systématique des périodicités sans source porteuse… `periodicite` passe à `autre` » (elle affichait une échéance **annuelle**) |
| `elec-travail-habilitation-personnel` | « Périodicité passée de `triennale` à `autre` le 2026-08-27 (ADR-023 § 6) » |
| `stockage-dangereux-verification-etancheite` | « l'obligation passe en « autre » et n'est plus planifiée au calendrier » (elle était **mensuelle**) |
| `stockage-dangereux-formation-personnel` | amendement du 2026-08-27, même audit (elle était **triennale**) |
| `incendie-erp-5-visite-commission` | « Amendement 2026-08-26 : l'obligation portait une périodicité… » |
| `incendie-travail-consigne-affichee` (établissement) | même famille d'amendement (2026-08-25) |

Ce n'est pas un reproche à l'audit des périodicités — retirer une périodicité
que le droit ne porte pas était juste. Mais il faut le dire dans ces termes :
**ces six-là étaient visibles au calendrier il y a cinq jours, et ne le sont
plus.** Le défaut de surface n'est donc pas seulement ancien, il **s'aggrave à
chaque relecture réglementaire honnête** — chaque fois qu'on retire une
périodicité inventée, on retire aussi la seule surface de l'obligation.

### Porteur établissement — 20

| # | Obligation | Domaine | Crit. | Surface |
|---|---|---|---|---|
| 1 | `incendie-travail-consigne-affichee` — Consigne de sécurité incendie affichée | incendie | 3 | **Guide/métier** (*Commerce*) |
| 2 | `incendie-registre-securite` — Tenue du registre de sécurité | incendie | 3 | **Guide/métier** (*Commerce*, *Bureau*) |
| 3 | `formation-securite-etablissement-organisation` — Organiser la formation à la sécurité | formation | 4 | **TdB** |
| 4 | `formation-securite-etablissement-information` — Informer sur les risques et l'accès au DUERP | formation | 3 | `<select>` seul |
| 5 | `formation-securite-etablissement-manutention` — Formation à la manutention manuelle | formation | 3 | `<select>` seul |
| 6 | `formation-securite-etablissement-travail-sur-ecran` — Travail sur écran | formation | 2 | `<select>` seul |
| 7 | `sante-travail-etablissement-adhesion-spst` — SPST : adhésion ou service autonome | santé travail | 4 | `<select>` seul |
| 8 | `sante-travail-etablissement-fiche-entreprise` — Fiche d'entreprise | santé travail | 2 | `<select>` seul |
| 9 | `secours-etablissement-materiel` — Matériel de premiers secours | secours | 4 | `<select>` seul |
| 10 | `secours-etablissement-mesures` — Mesures d'organisation des premiers secours | secours | 3 | **TdB** |
| 11 | `prevention-etablissement-salarie-designe` — Salarié désigné compétent | organisation | 3 | **TdB** |
| 12 | `prevention-etablissement-cse` — Mise en place du CSE (11 salariés) | organisation | 3 | **TdB** |
| 13 | `prevention-etablissement-reglement-interieur` — Règlement intérieur (50 salariés) | organisation | 2 | `<select>` seul |
| 14 | `information-etablissement-affichages-obligatoires` — Affichage des coordonnées | information | 3 | `<select>` seul |
| 15 | `information-etablissement-avis-acces-duerp` — Avis sur l'accès au DUERP | information | 2 | `<select>` seul |
| 16 | `locaux-etablissement-installations-sanitaires` — Vestiaires, lavabos, cabinets | locaux sociaux | 3 | `<select>` seul |
| 17 | `locaux-etablissement-eau-potable` — Eau potable et fraîche | locaux sociaux | 3 | `<select>` seul |
| 18 | `locaux-etablissement-local-restauration` — Local de restauration (≥ 50) | locaux sociaux | 2 | `<select>` seul |
| 19 | `locaux-etablissement-emplacement-restauration` — Emplacement pour se restaurer (< 50) | locaux sociaux | 2 | `<select>` seul |
| 20 | `co-activite-etablissement-protocole-securite` — Protocole de sécurité chargement/déchargement | co-activité | 4 | `<select>` seul |

### Porteur salarié — 5

Aucune n'est dans le `<select>` des prescriptions : `evaluerObligation` rend
`null` pour ce porteur (`matching/engine.ts:456`), donc elles n'entrent jamais
dans `applicables`. Elles sont en revanche **toutes nommées sur l'écran Équipe**,
sur tous les dossiers, parce que le catalogue se dérive du référentiel filtré par
porteur (`salaries/catalogue.ts:33`).

| # | Obligation | Domaine | Crit. | Surface |
|---|---|---|---|---|
| 1 | `formation-securite-salarie-accueil` | formation | 4 | Équipe (catalogue) |
| 2 | `conduite-salarie-formation` | formation | **5** | Équipe (catalogue) |
| 3 | `conduite-salarie-autorisation` | formation | **5** | Équipe (catalogue) |
| 4 | `formation-securite-salarie-designe-competent` | formation | 3 | Équipe (catalogue) |
| 5 | `secours-salarie-secouriste` | secours | 4 | Équipe (catalogue) |

`conduite-salarie-autorisation` porte une transmission `salarie_designe`, mais
elle **n'atteint jamais le tableau de bord** : `rapprocher` ne filtre que les
`applicables`, d'où le porteur salarié est absent par construction. C'est une
transmission déclarée qui ne peut pas s'afficher.

### Les surfaces que j'ai ouvertes, et ce qu'elles font

Ouvertes et lues, une par une :

| Surface | Lit quoi | Les 43 y sont ? |
|---|---|---|
| Calendrier (`calendrier/page.tsx`, `calendrier/queries.ts`) | `Verification` | **non** — le filtre par domaine ne connaît d'ailleurs que les trois domaines P1 |
| Tableau de bord (`dashboard/queries.ts`) | `Verification` | **non**, sauf par la carte *transmissions* (5 obligations, conditionnelles) |
| « Préparer un contrôle » (`controle/page.tsx`) | `getDashboardData` + compteurs de modules | **non** — aucune lecture du référentiel |
| Registre de sécurité (`registre/page.tsx`, `registre/contenu-ailleurs.ts`) | `Verification` filtrées par catégorie d'équipement | **non**, et le module l'écrit : « une échéance portée par l'établissement n'a **aucune fiche où atterrir** » |
| Fiche d'équipement (`equipements/fiche.ts:267`) | `eq.verifications` | **non** — `obligationsDeLEquipement` part des lignes persistées |
| Page Équipements (`equipements/page.tsx`) | badge `aucune_echeance_datable` | **partiellement, et sans nommer** — voir ci-dessous |
| PDF registre / dossier de conformité / plan d'actions (`pdf/builders.ts`) | `Verification` | **non** |
| Mentions de périmètre des PDF (`pdf/mentions-perimetre.ts`) | les 4 axes de `perimetre/couverture.ts` | **non** — aucun axe ne parle d'obligation sans date |
| Serveur MCP (`lib/mcp/tools.ts`) | `Verification` | **non** |
| Guide → « Chez vous » (`guide/chez-vous.ts`) | le **moteur** | **comptées, jamais nommées** — voir ci-dessous |
| Guide → « Par métier » (`guide/metiers.ts`) | référentiel, liste écrite à la main | **3 sur 43** |
| Écran Équipe (`equipe/page.tsx`) | catalogue dérivé du référentiel | **les 5 salarié** |
| Formulaire Prescriptions (`prescriptions/queries.ts:162`, `PrescriptionForm.tsx:185`) | le **moteur** | **38 sur 43** |

Deux surfaces méritent d'être décrites plus précisément, parce qu'elles
ressemblent à des chemins et n'en sont pas :

**Le guide « Chez vous, concrètement » compte les 43 sans jamais en nommer une.**
`construireChezVous` agrège **toutes** les obligations applicables par domaine et
en rend `nbObligations` + la liste des périodicités. Une obligation en `autre`
gonfle donc le compteur d'un domaine et ajoute la pastille « permanente » — mais
son libellé n'apparaît nulle part, et la carte se termine par « Le détail daté de
chaque vérification vit dans votre **calendrier** », ce qui est faux pour elles.
**Pire : quand aucun équipement n'est déclaré, `data.aucunEquipement` est vrai et
tout le bloc des domaines est remplacé** par « Aucun équipement déclaré pour
l'instant — la plateforme ne peut donc calculer aucune vérification périodique ».
Sur le dossier bureau, les 16 obligations d'établissement passent donc de
« comptées sans être nommées » à **rien du tout**, sous une phrase qui affirme le
contraire de ce que le moteur vient de calculer. (Ce point était déjà relevé au
§ 4 de `rapport-controle-visuel-116-obligations.md` ; je le confirme par lecture
du code.)

**Le badge « Aucune échéance calculée » ne se déclenche presque jamais.**
`reperterSansEcheance` ne pose `aucune_echeance_datable` que si un équipement a
**zéro** obligation datable. Un extincteur qui porte trois échéances datées et
`incendie-travail-moyens-lutte` en `autre` n'affiche aucun badge : l'obligation
permanente est avalée par ses voisines. Et quand le badge apparaît, il ne nomme
pas l'obligation — « Les obligations qui visent cet équipement sont
permanentes ». `compterSansObligation` exclut d'ailleurs ce motif du compteur du
bandeau de couverture, à raison et avec un commentaire qui l'explique.

---

## 2. Le poids réel, dossier type par dossier type

Mesuré en appelant `determineObligationsApplicables`, sans base pour trois des
quatre cas. Le parc du restaurant est le **parc réel du jeu de démonstration**,
lu en base (9 équipements, un par catégorie) et non inventé :
`INSTALLATION_ELECTRIQUE`, `EXTINCTEUR`, `ALARME_INCENDIE`, `BAES`,
`APPAREIL_CUISSON_ERP`, `HOTTE_PRO`, `VMC`, `INSTALLATION_FRIGORIFIQUE`,
`PORTAIL_AUTO`.

« Lignes » = lignes de `Verification` engendrées, une par équipement concerné
pour un porteur équipement, une seule pour un porteur établissement (ADR-022 § 4).

| Dossier | Obligations applicables | Lignes **datées** | Lignes **jamais engendrées** | Part invisible |
|---|---|---|---|---|
| **Bureau** — Atelier Vermeil, 6 pers., non-ERP, 0 équipement | 18 | **2** | **16** | **89 %** |
| **Restaurant** — Le Bistrot du Marché, 12 pers., ERP N5 type N, 9 équipements | 51 | **26** | **25** | **49 %** |
| **Commerce de détail** — 4 pers., ERP N5 type M, 4 équipements | 34 | **14** | **20** | **59 %** |
| **Restaurant, avant toute déclaration d'équipement** — mêmes régimes, 0 équipement | 22 | **4** | **18** | **82 %** |

Le cas bureau **reproduit exactement** la mesure du contrôle visuel (18 / 2 / 16),
ce qui vaut recoupement de la méthode.

Détail des 25 du restaurant : **7 portées par un équipement** (consignation au
registre électrique, habilitation électrique, moyens de lutte, visite de
commission, dossier de maintenance du portail, maintien en état du portail,
contrôle d'étanchéité après modification) et **18 portées par l'établissement**.

**Le défaut est structurel, pas marginal.** Il ne descend jamais sous la moitié
des obligations applicables, et il est **maximal sur le dossier neuf** —
c'est-à-dire au moment exact où le dirigeant se fait une idée de ce que l'outil
sait faire.

Un fait secondaire relevé au passage : le dossier de démonstration en base porte
**28 lignes** là où le référentiel actuel en produirait 29 (25 + 3 titres de
salarié, et il manque `sante-travail-etablissement-liste-postes-risques`). Ce
n'est pas un défaut : le calendrier est simplement d'une version antérieure du
référentiel et se réconciliera à sa prochaine ouverture (ADR-012). Je le note
pour qui compterait les lignes en base sans le savoir.

---

## 3. `mise_en_service_uniquement` — que devient la ligne une fois soldée ?

**Elle survit. Le second trou redouté n'existe pas — mais la ligne survit par un
chemin différent de celui que le code laisse croire, et ça vaut d'être écrit.**

`generateur.ts:320` ouvre par `if (derniere) continue;` — « déjà réalisé, pas de
nouvelle occurrence ». Lu seul, cela dit que la ligne cesse d'être générée, donc
qu'elle tombe dans la boucle finale de la réconciliation.

**Or ce `continue` n'est jamais atteint en production.** `derniere` se lit dans
`verificationsPrecedentes`, et l'unique appelant du générateur passe une **`Map`
vide** : `calendrier/actions.ts:198` appelle
`genererProchainesVerifications(obligations, new Map(), …)`. Vérifié : c'est le
seul appel hors tests (`grep genererProchainesVerifications`). Une obligation
`mise_en_service_uniquement` est donc **toujours régénérée**, retrouvée par clé
dans `reconcilierCalendrier`, et prise en charge par la branche
`ex.dateRealisee !== null` → `prochaineDate(...) === null` :

```ts
// Périodicité sans échéance suivante (`mise_en_service_uniquement`,
// `autre`) : le one-shot est consommé, plus rien à replanifier.
datePrevue = ex.datePrevue;
dateRealisee = ex.dateRealisee;
statut = ex.statut;                 // reste « realisee_… »
```

La ligne est reconduite à l'identique : sa date de réalisation, son statut réalisé
et ses rapports restent attachés. **Une vérification de mise en service faite il y
a trois ans reste au dossier**, visible au registre, au PDF et sur la fiche de
l'appareil.

Et si un jour un appelant passait une `Map` non vide, le filet tiendrait quand
même : la ligne tomberait dans la boucle finale, `obligationsEncoreApplicables`
contient bien son `obligationId` (`actions.ts:247`), et `porteUneTrace` est vrai
dès qu'il y a une `dateRealisee` — donc `inchangees`, pas `aSupprimer`.

**Deux réserves, à porter au dossier plutôt qu'à corriger ici :**

1. `if (derniere) continue;` est **du code mort sur le seul chemin de
   production**, et sa doc dit ce qui se passerait plutôt que ce qui se passe.
   C'est exactement le genre de commentaire dont ce chantier a appris à se
   méfier — je l'ai cru avant d'ouvrir `actions.ts`.
2. Les 12 obligations `mise_en_service_uniquement` sont **toutes portées par un
   équipement**, et **7 d'entre elles ont bien une ligne dans le jeu de
   démonstration**, toutes en `a_planifier`. Le comportement « une fois soldée »
   n'a donc **pas pu être observé en base** — il est établi par lecture du code,
   pas par constat.

---

## 4. L'événementiel est-il couvert ?

**Non, pas entièrement — et le référentiel n'a d'ailleurs aucun moyen de dire
qu'une obligation est événementielle.**

### 4.1 La nature n'est pas encodée

L'ADR-022 § 8 écrit : « `TypeEcheance` reste calculé à la lecture et jamais
stocké ; **la nature, elle, vit dans le référentiel TypeScript** ». **C'est faux
aujourd'hui.** J'ai ouvert `conformite/types.ts` en entier : `ObligationCommune`
ne porte **aucun champ `nature`**, et `grep -n "nature"` sur les deux fichiers de
types ne renvoie que de la prose. La seule trace machine est
`periodicite: "autre"`, que l'ADR présente lui-même comme un **proxy** de l'état
permanent.

Conséquence directe et vérifiable dans les 43 : **`autre` mélange trois natures
distinctes.** Trois exemples, tirés de leurs propres `description` /
`notesInternes` :

| Obligation | Ce que le référentiel en dit | Nature réelle |
|---|---|---|
| `froid-controle-etancheite-apres-modification` | « elle se **déclenche sur un événement** — une modification du circuit, une réparation de fuite — que l'outil n'observe pas » | **événementielle** |
| `stockage-dangereux-declaration-icpe` | « **Étape de qualification initiale.** Une fois le régime connu… » | **ponctuelle** |
| `incendie-erp-5-visite-commission` | « les établissements qui comportent [des locaux à sommeil] sont visités **tous les cinq ans** (PE 37) […] ceux qui n'en comportent pas ne relèvent d'aucune périodicité écrite » — et la visite est **initiée par l'administration** | **récurrente sans rythme écrit** |

Un écran « états permanents » qui prendrait `periodicite === "autre"` pour
critère ramasserait ces trois-là avec les autres. C'est le point le plus lourd
du § 5.

### 4.2 Les modules dédiés couvrent deux lignes sur six

`docs/carto-obligations-hors-equipement.md` classe six lignes en `ÉVÈN`
(colonne *Nature*). Les modèles Prisma correspondants, vérifiés dans
`prisma/schema.prisma` :

| Ligne de la carto | Module |
|---|---|
| E15 — Plan de prévention (`R. 4512-6` et s.) | ✅ `PlanPrevention` |
| E16 — Permis de feu (arrêté 19/03/1993) | ✅ `PermisFeu` |
| D3 — Repérage amiante avant travaux (`R. 4412-97`) | ❌ aucun module, aucune obligation encodée |
| E17 — Coordination SPS (`L. 4532-2`) | ❌ aucun module |
| A17 — Déclaration d'AT (`CSS L. 441-2`) | ❌ — hors périmètre assumé (ADR-022) |
| B3 — CSSCT ≥ 300 salariés (`CT L. 2315-36`) | ❌ — hors cible |

**Deux manques réels dans la cible** : le repérage amiante avant travaux et la
coordination SPS. Aucun des deux n'est encodé au référentiel, donc aucun n'est
« invisible » au sens de cet audit — ils sont **absents**, ce qui est un autre
défaut et se déclare ailleurs (`docs/couverture-declaree-du-produit.md`).

S'y ajoutent deux articles nommés dans les `notesInternes` de
`formation-securite-etablissement-organisation` : **`R. 4141-8`** (formation
après accident grave ou accidents répétés) et **`R. 4141-12`** (après
modification des conditions de circulation), tous deux inscrits au corpus en
`obligation_manquante`, tous deux événementiels, tous deux sans mécanisme.

### 4.3 `docs/registre-securite-ecart.md` : à jour sur le fond, en retard d'un cran

Le registre recense six modèles Prisma manquants — `PersonnelSecurite`,
`ExerciceSecurite`, `AppareilInventaire`, `ControleAdministratif`,
`EvenementRegistre`, `PieceJointeRegistre`. **Vérifié : aucun des six n'existe
dans `prisma/schema.prisma`.** Le document est donc exact sur son objet, et sa
dernière modification date du 2026-08-26.

En revanche, **le compte de « trois obligations qui attendent un modèle » n'est
pas lisible par une machine.** Une seule obligation déclare une transmission
`modele_absent` : `incendie-travail-exercice-semestriel` → `ExerciceSecurite`
(`incendie.ts:215`). Les deux autres **refusent délibérément de la déclarer**, et
le disent dans leurs `notesInternes` presque mot pour mot :

- `secours-etablissement-mesures` (`R. 4224-16`) : « Aucune transmission
  `modele_absent` n'est déclarée : `docs/registre-securite-ecart.md` recense les
  modèles manquants sous des noms précis, et en inventer un ici sans avoir
  vérifié sa nomenclature créerait une référence fantôme. »
- `co-activite-etablissement-protocole-securite` (`R. 4515-4`) : la même phrase,
  au mot près.

La prudence est saine, mais le résultat ne l'est pas : **deux manques réels ne
sont portés que par de la prose**, donc invisibles à tout compteur et à tout
écran. Les deux nomenclatures existent pourtant côté document (§ 3.2 et § 3.3 du
registre d'écart) ; le rapprochement n'a simplement jamais été fait. C'est une
correction à un ou deux caractères près, et elle rendrait le chiffre « trois »
vrai dans le code comme il l'est dans le brief.

---

## 5. Les quatre natures de l'ADR-022 et leur surface — la conclusion

| Nature (ADR-022 § 8) | Combien | Mécanisme | Surface |
|---|---|---|---|
| **Échéance récurrente** | 61 obligations | `Verification` + `prochaineDate` | **Calendrier**, tableau de bord, registre, PDF, fiche d'équipement, MCP — six surfaces |
| **État permanent** | l'essentiel des 43 | `periodicite: "autre"`, sauté par le générateur (`generateur.ts:295`) | **aucune** — hors un `<select>` de formulaire |
| **Obligation ponctuelle** | les 12 `mise_en_service_uniquement`, plus au moins une des 43 (`stockage-dangereux-declaration-icpe`) | ligne unique non replanifiée | le calendrier pour les 12 ; **aucune** pour celles rangées en `autre` |
| **Obligation événementielle** | 2 servies par module, ≥ 4 nommées et non servies, ≥ 1 rangée en `autre` (`froid-…-apres-modification`) | `PermisFeu`, `PlanPrevention` | **partielle**, et rien ne relie les modules au référentiel |

Trois choses tombent de ce tableau :

1. **Le produit a une surface par mécanisme, pas une surface par nature.** Ce qui
   produit une `Verification` est vu ; ce qui n'en produit pas ne l'est pas.
   L'ADR-022 nomme quatre natures ; le code n'en connaît qu'une distinction, et
   elle est technique.
2. **`periodicite: "autre"` n'est pas la nature « état permanent ».** C'est
   « pas de rythme écrit », ce qui recouvre au moins trois natures. Tout écran
   bâti sur ce critère héritera du mélange.
3. **Le mécanisme de déclaration des manques existe déjà et ne couvre pas
   celui-ci.** `perimetre/couverture.ts` a quatre axes — régime, DUERP,
   équipements sans échéance, corpus non couvert — et son en-tête pose la règle :
   « un axe qui **déclare** au lieu de **projeter** fait de ce module la
   troisième déclaration que son propre commentaire interdisait ». Aucun des
   quatre ne dit « votre dossier porte 25 obligations que cet outil ne sait pas
   dater ». C'est le cinquième axe, et il **projetterait** une source existante —
   le moteur — donc il respecterait la règle du module.

---

## 6. Ce que cette mesure change au brief de l'écran « états permanents »

**Elle le contredit sur trois points, et le premier suffit à dire que ce n'est
pas le même écran.**

### 6.1 Le dimensionnement : 16 devient 25, et 7 d'entre elles portent sur un appareil

Le brief est écrit sur « seize obligations d'établissement », et sa maquette ne
montre que des lignes d'établissement (affichages, locaux sociaux, organisation).
Seize est **le chiffre d'un dossier de bureau sans aucun équipement** — le plus
petit des quatre que j'ai mesurés.

Sur le restaurant réel, l'écran devrait porter **25 lignes, dont 7 portées par un
équipement** ; sur le commerce, **20 dont 4**. Et une obligation d'équipement ne
se coche pas une fois : « Tenue du dossier de maintenance (porte automatique) »
se déclare **par porte**, « Tenue du carnet d'entretien » **par ascenseur**. La
maquette « domaine → ligne → case » n'a pas de place pour cette dimension.

C'est le point que le brief demandait de trancher : **oui, ta mesure le
contredit**, et l'écran doit soit accueillir un niveau « par appareil », soit
déclarer explicitement qu'il ne porte que le porteur établissement — auquel cas
il laisse 18 obligations sur 43 exactement où elles sont.

### 6.2 « Une déclaration seule, aucune pièce » ne tient pas pour les 18 d'équipement

La décision est juste pour ce sur quoi elle a été prise : une affiche au mur, de
l'eau potable, un salarié désigné ne produisent pas de document.

Mais **dix des 43 sont précisément des obligations de tenue de document**, et le
texte les nomme. **Sept sont portées par un équipement** :
`elec-travail-consignation-registre` (« consignés sur un registre »),
`ascenseur-carnet-entretien`, `ascenseur-entretien-contrat` (« contrat écrit »),
`porte-auto-dossier-maintenance`, `esp-dossier-suivi`,
`levage-registre-securite-consignation`, `stockage-dangereux-fiches-donnees`.
**Trois par l'établissement** : `incendie-registre-securite`,
`secours-etablissement-mesures` (« consignées dans un document tenu à
disposition de l'inspection »), `co-activite-etablissement-protocole-securite`
(« document écrit, dit protocole de sécurité »). Cocher « en place » sur un registre de sécurité sans
qu'il y ait rien derrière, c'est le geste que la dernière section du brief
interdit — une déclaration qui ressemble à une preuve.

Je ne rouvre pas la décision ; je dis que **son argument (« la plupart n'ont pas
de document ») est vrai des 16 sur lesquelles elle a été prise et faux des 25 du
restaurant.**

### 6.3 Trois des 43 ne sont pas des états permanents, et une case à cocher leur ment

Détaillé au § 4.1. En particulier :

- `incendie-erp-5-visite-commission` (criticité 4) est une **visite quinquennale
  décidée par l'administration**. « Déclaré en place le 31/08/2026 » n'a pas de
  sens : le dirigeant ne la met pas en place, il la subit et la consigne.
- `froid-controle-etancheite-apres-modification` est **événementielle**. Une case
  cochée y dirait « aucune modification n'est en attente de contrôle », ce que
  l'outil ne peut pas savoir — sa note dit explicitement que l'événement est
  « que l'outil n'observe pas ».
- `stockage-dangereux-declaration-icpe` est **ponctuelle** : une qualification
  faite une fois, à refaire quand les quantités changent.

Le critère de sélection de l'écran ne peut donc pas être `periodicite === "autre"`
sans produire un écran qui ment sur trois lignes. Il lui faut soit un champ
`nature` au référentiel — ce que l'ADR-022 § 8 croit déjà avoir —, soit une
liste d'exclusions explicite, qui est exactement le genre de liste exhaustive que
`feedback_pas_de_liste_exhaustive_en_test` proscrit.

### 6.4 Ce que la mesure **confirme** du brief

- **« Ne fabrique pas d'échéance »** : validé sans réserve. Six des 43 ont perdu
  une périodicité inventée entre le 25 et le 27 août ; en refabriquer une par
  l'écran annulerait ce travail.
- **« Une déclaration n'est pas une preuve »** : validé, et le § 6.2 en donne le
  cas limite le plus dangereux — les huit obligations de tenue de document.
- **L'en-tête « n sur N » calculé par le moteur** : validé. N vaut 16 sur le
  bureau, 25 sur le restaurant, 20 sur le commerce. Écrit à la main, il aurait
  été faux sur trois dossiers sur quatre.
- **La contrainte d'idempotence** : le § 3 montre que le mécanisme existant sait
  déjà distinguer « retirée du référentiel » de « n'a plus d'échéance datable »,
  et que `obligationsEncoreApplicables` est la clé à réutiliser.

---

## 7. Ce que je n'ai pas pu établir

- **Aucun écran n'a été ouvert dans un navigateur.** Toutes les conclusions de ce
  rapport viennent de la lecture du code et d'appels au moteur. Là où je recoupe
  un constat visuel, je cite `rapport-controle-visuel-116-obligations.md` comme
  source, sans le refaire.
- **Le comportement d'une ligne `mise_en_service_uniquement` réellement soldée
  n'a pas été observé en base** : les 7 lignes du jeu de démonstration sont
  toutes en `a_planifier`. Le § 3 est établi par lecture, pas par constat.
- **Le dossier bureau « Atelier Vermeil » n'existe plus dans la base locale.** Je
  l'ai reconstitué à partir des paramètres publiés (NAF 70.22Z, 6 personnes,
  non-ERP, 0 équipement) ; il rend 18 / 2 / 16, identique à la mesure d'origine,
  mais ce n'est pas la même instance.
- **Le parc du commerce de détail est composé par moi** (installation électrique,
  extincteurs, BAES, chambre froide). Aucun jeu de démonstration ne porte de
  commerce ; je n'ai pas trouvé de parc type par secteur dans le code
  (`onboarding/`, `equipements/pre-remplissage.ts`).
- **`pg_restore` sur `duerp-dump-20260831.dump` m'a été refusé** par la politique
  de la session. Le dump n'a donc pas été inspecté ; la composition du parc de
  démonstration vient de la base locale, qui le porte.
- **Les modules `PermisFeu` et `PlanPrevention` n'ont été vérifiés qu'au schéma
  Prisma et par la carto.** Je n'ai pas ouvert leurs écrans ni leurs `queries` :
  je peux affirmer que les modèles existent, pas décrire ce qu'ils affichent.
- **Je n'ai pas relu sur Légifrance** les articles cités dans ce rapport. Toutes
  les citations réglementaires sont **reprises du référentiel** (`description`,
  `referencesLegales`, `notesInternes`) et signalées comme telles. Aucune n'est
  une lecture de première main.
- **Le décompte « ≥ 4 événementielles non servies » du § 4.2 est un plancher**,
  pas un total : il agrège la carto (D3, E17) et deux articles nommés en
  `notesInternes` (`R. 4141-8`, `R. 4141-12`). Un dépouillement complet du corpus
  en donnerait probablement plus, et je ne l'ai pas fait.
