# Cadrage V1 — ce qui manque pour que le produit soit complet sur son socle

**Document de cadrage, 2026-08-31.** Il ne recense pas : `docs/carto-obligations-hors-equipement.md`
le fait déjà, pour 62 lignes. Il **coupe** — ce qui entre en V1, ce qui n'y entre
pas, et sur quel critère.

## Où on en est

Le produit couvre **85 obligations**, dont 82 naissent d'un équipement déclaré.
C'est sa force, et c'est aussi tout ce qu'il sait faire : le moteur est un moteur
d'équipement.

Un dirigeant de six personnes en restauration ne pense pas à ses obligations en
termes d'équipements. Il a un extincteur, oui — mais il a surtout **un salarié**,
et c'est ce déclencheur-là que le produit ne sait presque pas servir. Sur les
62 obligations recensées hors équipement : **5 couvertes, 6 mal ancrées,
48 absentes** — dont 13 formations réglementaires.

## Le critère de coupe

**Entre en V1** ce qui remplit les trois conditions :

1. **Ça s'applique à une TPE des trois secteurs cibles** — restauration, commerce
   de détail, bureau — sans condition rare.
2. **Le produit a déjà la donnée pour le déclencher.** Un salarié, un effectif,
   un régime ERP, un équipement : il les a. Une année de permis de construire ou
   une zone à potentiel radon : il ne les a pas, et les collecter est un chantier
   en soi.
3. **Le texte porte une obligation claire**, pas une pratique conventionnelle.

**N'entre pas en V1** ce qui demande une donnée nouvelle, vise un secteur hors
cible, ou repose sur une norme privée.

---

## Palier 1 — les faux négatifs. À faire en premier, et ce n'est pas discutable.

Six obligations **existent** dans le référentiel mais sont accrochées à un
équipement qui ne les conditionne pas. Un établissement qui n'a pas déclaré cet
équipement ne les voit pas — alors qu'il y est soumis.

| Obligation | Ancrée sur | Devrait être |
|---|---|---|
| Tenue du registre de sécurité | `EXTINCTEUR` / `ALARME_INCENDIE` | établissement, sans condition |
| Exercices d'évacuation semestriels | `ALARME_INCENDIE` | établissement |
| Consignes de sécurité incendie | équipement | établissement |
| Visites de la commission de sécurité | équipement | établissement, régime ERP |
| Registre unique de sécurité | partiel | établissement |
| Agents chimiques — notice de poste | équipement | établissement + salarié |

**Pourquoi c'est le palier prioritaire.** Dans un outil de conformité, un faux
négatif est pire qu'un trou : le trou se voit, le faux négatif **rassure à tort**.
Un restaurateur sans alarme déclarée lit aujourd'hui un calendrier qui ne
mentionne aucun exercice d'évacuation, et rien ne lui dit que l'obligation
existe.

**Pourquoi c'est peu coûteux.** Le blocage était le modèle, et il est levé : la
note de `incendie.ts` l'écrit — *« le modèle ne bloque plus ; ces deux obligations
peuvent passer au porteur établissement. C'est le lot suivant, et il est court. »*
L'ADR-022 a livré le porteur établissement, il n'est pas utilisé ici.

**Une réserve à ne pas escamoter** : `R. 143-44` a été **réécrit au 1er juillet
2026** par le décret n° 2025-1100. Corriger l'ancrage sans relire le texte
figerait une description périmée. Le lot est court, la relecture ne l'est pas.

---

## Palier 2 — le socle du statut d'employeur

S'applique **dès le premier salarié**, sans condition d'équipement, de secteur ni
d'effectif. C'est ce qu'un dirigeant de TPE ignore le plus souvent, et ce qu'un
inspecteur regarde en premier.

| Obligation | Référence | État |
|---|---|---|
| Formation à la sécurité à l'embauche | `L. 4141-2`, `R. 4141-1` et s. | **lot 7 en cours** |
| Visite d'information et de prévention, suivi renforcé | `R. 4624-10` et s., `R. 4624-22` et s. | **lot 7 en cours** |
| Matériel de premiers secours **et** personnel formé (SST) | `R. 4224-14` à `-16` | **lot 7 en cours** |
| Formation à la conduite, autorisation de conduite | `R. 4323-55` et s. | **lot 7 en cours** |
| Salarié désigné compétent en prévention | `L. 4644-1` | absent |
| Adhésion à un service de prévention et de santé au travail | `L. 4622-1` | absent |
| Fiche d'entreprise établie par le service | `R. 4624-46` | absent |
| Affichages obligatoires — inspection, médecine, secours | `D. 4711-1` | absent |
| Modalités d'accès au DUERP portées à connaissance | `R. 4121-4` | absent |
| Consignes de premiers secours affichées | `R. 4224-16` | absent |
| Fiches de données de sécurité et notice de poste | `R. 4412-38` et s. | mal ancré |
| Vestiaires, sanitaires, eau potable | `R. 4228-1` et s., `R. 4225-2` | absent |

Le lot 7 en couvre quatre. **Les huit autres sont le palier 2 proprement dit** —
et plusieurs sont triviales à encoder : un affichage est un état permanent, pas
une échéance à calculer.

---

## Palier 3 — l'activité et l'effectif

Deux déclencheurs que le produit sait déjà lire.

**Ce qui naît d'un fait de tâche :**

| Obligation | Référence | Pourquoi c'est V1 |
|---|---|---|
| Protocole de sécurité chargement / déchargement | arrêté du 26/04/1996 | **dès qu'un camion livre** — donc tout commerce, toute restauration |
| Formation à la manutention manuelle | `R. 4541-8` | universel en restauration et commerce |
| Formation « travail sur écran » | `R. 4542-16` | le troisième secteur cible |
| Travail en hauteur, EPI antichute | `R. 4323-104` et s. | fréquent, souvent ignoré |

**Ce qui naît d'un seuil d'effectif** — la donnée existe déjà en base :

CSE à 11 salariés (`L. 2311-2`), formation santé-sécurité des élus
(`L. 2315-18`), local ou emplacement de restauration (`R. 4228-22/23`),
règlement intérieur à 50 (`L. 1311-2`).

---

## Ce qui n'entre pas en V1, et pourquoi

| | Raison |
|---|---|
| **DTA amiante** (`R. 1334-29-5`) | demande l'année du permis de construire, que `Batiment` ne porte pas — l'ADR-019 a tranché « non » et motivé. Rouvrir cette décision est un chantier, pas une ligne. **C'est le plus gros trou assumé.** |
| **Radon, qualité de l'air intérieur** | demandent la zone à potentiel et la typologie précise de l'ERP |
| **ICPE** | les seuils ne sont pratiquement jamais atteints dans les trois secteurs ; encoder la nomenclature est un produit en soi |
| **CREP plomb** | surtout habitation |
| **Coordination SPS, DIUO** | opérations de construction, hors cible |
| **ATEX, rayonnements ionisants** | secteurs industriels, hors périmètre déclaré |
| **Accidents du travail, registre des AT bénins, EPI, danger grave** | hors périmètre déclaré dans `.claude/CLAUDE.md` |
| **CACES** | dispositif conventionnel, pas une obligation du code du travail. La formation à la conduite l'est ; le CACES est une modalité de preuve. |

---

## Ce que ça donne comme forme

| Palier | Lignes | Nature du travail |
|---|---|---|
| 1 — faux négatifs | 6 | rebranchement + une relecture réglementaire |
| 2 — socle employeur | 12 (dont 4 en cours) | dépouillement puis encodage |
| 3 — activité et effectif | 8 | dépouillement puis encodage |

**Une V1 complète sur son socle, c'est donc de l'ordre de vingt-cinq obligations
supplémentaires** — pas quarante-huit. Le reste est soit hors cible, soit
subordonné à une donnée que le produit ne collecte pas.

Et le compte ne serait pas la bonne mesure de toute façon. Ce qui distingue ce
produit n'est pas d'en porter 110 plutôt que 85 : c'est de **nommer ce qu'il ne
couvre pas** au lieu de se taire — `docs/couverture-declaree-du-produit.md`,
l'ADR-024, le bandeau de périmètre. Un spécialiste le verra plus vite qu'un
chiffre.

---

## L'ordre que je propose

1. **Palier 1**, tout de suite après le lot 7. Court, et il retire des affirmations
   fausses par omission.
2. **Palier 2**, ce que le lot 7 ne prend pas. C'est ce qui sert le plus un
   dirigeant de TPE.
3. **Palier 3**, en dernier — utile, mais moins universel.

Le palier 1 avant le 2 pour une raison de principe : **corriger ce qui ment passe
avant ajouter ce qui manque.**
