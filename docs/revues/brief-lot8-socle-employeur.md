# Lot 8 — le socle de l'employeur, l'activité et l'effectif

## Ce que ce lot achève

Le produit couvre 85 obligations, dont 82 naissent d'un **équipement déclaré**.
Un dirigeant de six personnes en restauration ne pense pas à ses obligations en
termes d'équipements : il a surtout **un salarié**, un local, et des livraisons.

`docs/cadrage-v1.md` a coupé dans les 48 obligations hors équipement recensées et
en a retenu **26** pour une V1 complète sur son socle. Deux lots en traitent onze :

- `feat/depouillement-salarie` (lot 7) — formation à la sécurité, suivi médical,
  secours, conduite ;
- `fix/faux-negatifs-ancrage` (palier 1) — six obligations existantes accrochées
  à un équipement qui ne les conditionne pas.

**Les quinze qui restent sont ce lot.** Avec lui, la V1 est complète sur son
périmètre déclaré.

---

## Les quinze

Deux groupes, deux déclencheurs que le produit sait déjà lire.

### A — Le statut d'employeur (7)

S'applique **dès le premier salarié**, sans condition d'équipement, de secteur ni
d'effectif. C'est ce qu'un dirigeant de TPE ignore le plus souvent, et ce qu'un
inspecteur regarde en premier.

| # | Obligation | Référence présumée |
|---|---|---|
| A1 | Salarié désigné compétent en protection et prévention | `L. 4644-1` |
| A2 | Adhésion à un service de prévention et de santé au travail | `L. 4622-1` |
| A3 | Fiche d'entreprise établie par le service | `R. 4624-46` |
| A4 | Affichages obligatoires — inspection du travail, médecine du travail, secours | `D. 4711-1` |
| A5 | Modalités d'accès au DUERP portées à la connaissance des salariés | `R. 4121-4` |
| A6 | Mesures d'organisation des premiers secours, **consignées dans un document** | `R. 4224-16` |
| A7 | Vestiaires, sanitaires, lavabos ; eau potable à disposition | `R. 4228-1` et s., `R. 4225-2/3` |

> **RECTIFIÉ le 2026-08-31.** Ce brief annonçait A6 comme « consignes de
> premiers secours **affichées** ». Le texte n'écrit ni « consignes » ni
> « affiche » : l'employeur *prend des mesures* après avis du médecin du
> travail, et « ces mesures sont **consignées dans un document** tenu à la
> disposition de l'agent de contrôle de l'inspection du travail ».
>
> C'est un document écrit, pas une affiche. L'affichage des secours existe, mais
> il est dans `D. 4711-1` 2° — donc dans A4, où il est déjà couvert. Encodé
> comme un affichage, A6 aurait fait **deux fois l'affichage et zéro fois le
> document** : un faux positif et un faux négatif dans la même ligne.
>
> L'erreur vient de la carto (ligne A12), recopiée sans être recoupée sur le
> texte. L'agent a ouvert Légifrance et l'a signalée avant d'encoder.

### B — L'activité et l'effectif (8)

| # | Obligation | Référence présumée | Pourquoi V1 |
|---|---|---|---|
| B1 | Protocole de sécurité chargement / déchargement | arrêté du 26/04/1996 | **dès qu'un camion livre** — donc tout commerce, toute restauration |
| B2 | Formation à la manutention manuelle | `R. 4541-8` | universel en restauration et commerce |
| B3 | Formation « travail sur écran » | `R. 4542-16` | le troisième secteur cible |
| B4 | Travail en hauteur, EPI antichute | `R. 4323-104` et s. | fréquent, souvent ignoré |
| B5 | Mise en place du CSE — 11 salariés sur 12 mois consécutifs | `L. 2311-2` | l'effectif est en base |
| B6 | Formation santé-sécurité des membres du CSE | `L. 2315-18` | idem |
| B7 | Local ou emplacement de restauration | `R. 4228-22/23` | seuil 50 / moins de 50 |
| B8 | Règlement intérieur — volet hygiène et sécurité, 50 salariés | `L. 1311-2` | |

**Ces références viennent d'un document de travail, pas de Légifrance.** Aucune
ne se recopie telle quelle : chacune se relève sur le texte en vigueur, verbatim,
avant encodage. Plusieurs sont probablement mal numérotées.

---

## La méthode, qui prime sur le volume

**Dépouiller d'abord, encoder ensuite. Jamais l'inverse.** Ouvrir le texte sur
Légifrance, relever le verbatim, écrire l'entrée de corpus avec sa
`versionEnVigueur` et son `luLe` — *ensuite* l'obligation. Une règle du dépôt
l'impose et `corpus.test.ts` la tient. Prends
`src/lib/referentiels/corpus/code-travail-electricite.ts` comme modèle.

**Quinze lignes, c'est beaucoup. Ne compense pas par la vitesse.** Si tu n'en
livres que dix, dépouillées proprement, c'est un meilleur résultat que quinze
dont trois reposent sur une référence non vérifiée. Dis ce que tu n'as pas fait ;
une ligne manquante annoncée vaut mieux qu'une ligne fausse encodée.

**Commence par A4, A5 et A6** — les affichages et l'accès au DUERP. Ce sont des
**états permanents**, pas des échéances : pas de périodicité à établir, donc les
plus rapides. Ça te donne le patron avant d'attaquer les textes plus lourds.

---

## Trois questions de modélisation, à trancher et à argumenter

Elles décident de la qualité du lot bien plus que le compte.

**1. Un affichage est-il une obligation, et de quelle nature ?**
`D. 4711-1` impose d'afficher des coordonnées. Ce n'est pas une échéance
récurrente : c'est un **état permanent à constituer puis maintenir**
(`periodicite: "autre"`). Le dépôt a un précédent — l'habilitation électrique,
passée de `triennale` à `autre` parce que le texte n'écrit aucune durée. Suis-le.

**2. Le seuil d'effectif : déclencheur ou condition ?**
Le CSE naît au franchissement de 11 salariés sur 12 mois consécutifs. Le produit
connaît l'effectif. Mais `.claude/CLAUDE.md` écrit qu'**il n'y a pas de sixième
déclencheur « événement »** : un franchissement de seuil *date* une obligation, il
ne la fait pas naître. Regarde comment `conditions` exprime déjà un seuil, et
n'invente pas un mécanisme si un existant suffit. **Si aucun ne suffit,
arrête-toi et demande-moi** — un nouveau type de condition est une décision
d'architecture, pas un détail d'encodage.

**3. Le porteur.**
Une formation à la manutention : portée par le salarié (un titre qu'il détient)
ou par l'établissement (une obligation d'organiser) ? Les deux existent
peut-être, et ce sont alors **deux obligations**. C'est le défaut que l'ADR-022 a
corrigé pour `R. 4224-14`/`-15` ; ne le refais pas. Argumente chaque choix en
`notesInternes`.

Rappel : **on ne dérive jamais qui détient quel titre.** Rien ne dit quel salarié
travaille en hauteur — ce serait le cinquième déclencheur, non implémenté.
L'employeur déclare, le référentiel fournit le catalogue (ADR-023).

---

## Ce qu'on ne fait pas

- **On n'invente aucune périodicité.** Si le texte n'écrit pas de durée,
  `periodicite: "autre"` et l'obligation est un état à maintenir. Ce dépôt a déjà
  retiré un « triennal » qui venait d'une norme NF et non du droit : *une échéance
  inventée dans un outil de conformité est pire qu'une échéance absente — elle se
  présente à un contrôle.*
- **Aucune norme privée** — NF, APSAD — comme source opposable. Légifrance et
  l'INRS, rien d'autre.
- **On n'élargit pas le périmètre.** Le registre unique du personnel, les
  accidents du travail, les EPI, le danger grave et imminent sont **hors
  périmètre déclaré** dans `.claude/CLAUDE.md`. Si tu croises une obligation qui
  te semble devoir y entrer, signale-la, ne l'encode pas.

---

## Frontière avec les deux lots qui tournent en parallèle

**Lot 7** (`feat/depouillement-salarie`) — à lui, pas à toi :
`DOMAINES_OBLIGATION` dans `conformite/types.ts`, `prisma/schema.prisma` et toute
migration, `prestataires/domaines.ts`, et les corpus sur `R. 4141-*`,
`R. 4624-*`, `R. 4224-14` à `-16`, `R. 4323-55`.

**Attention** : `R. 4224-16` (consignes de premiers secours) est ton A6, et
`R. 4224-14`/`-15` sont à lui. **Le même fichier de corpus.** Écris ton article
dans le fichier qu'il aura créé si tu le trouves ; sinon, dis-le moi plutôt que
d'en créer un second sur le même texte.

**Palier 1** (`fix/faux-negatifs-ancrage`) — à lui : les six obligations mal
ancrées, dont les **agents chimiques et la notice de poste**. N'y touche pas.

**Ce que vous changerez tous les trois, et c'est prévu** : `conformite.test.ts`
(le compte et `EMPREINTE_ATTENDUE`) et `.claude/CLAUDE.md`, qui annonce le
compte. Deux lignes. Celui qui merge en dernier recalcule.

Si tu crois avoir besoin de quelque chose qui est à eux, **demande-moi** — je
coordonne les trois.

---

## Vérification

`pnpm vitest run`, `npx tsc --noEmit`, `npx eslint src`. Attendu au départ :
**1745 tests verts**, `tsc` propre, un seul avertissement eslint préexistant
(`normaliserFormData`).

Chaque obligation ajoutée fait tomber le compte et l'empreinte de
`conformite.test.ts`. C'est voulu — ils existent pour qu'on ne touche pas au
référentiel sans le dire. Le chiffre de la page publique est gardé par
`chiffres-publics.test.ts`, qui le recompte tout seul.

**La mesure de ce lot** : combien d'obligations un établissement de six personnes,
sans aucun équipement déclaré, reçoit avant et après. C'est le chiffre qui dit si
le lot sert à quelque chose.

## Les règles du dépôt

- **Ouvre le texte avant de le qualifier.** Les erreurs coûteuses de ce chantier
  viennent toutes d'un `grep`, d'un résumé ou d'une note — y compris deux erreurs
  dans les briefs que j'ai écrits cette semaine, l'une rattrapée par un agent.
- **Recoupe chaque référence sur Légifrance** et trace la lecture. Sur 127 liens
  vérifiés récemment, 6 servaient un autre article que celui annoncé.
- **N'invente jamais une vérification.** Si tu n'as pas lu le texte, dis-le.
- **Un test qui accompagne une obligation s'éprouve en réinjectant le défaut.**
- **pnpm, jamais npm.** Un worktree a son propre `node_modules`.
- **Ne pousse jamais sur `main`.** Branche : `feat/socle-employeur`.

## Ce que tu rends

Une branche et un rapport dans `docs/revues/rapport-lot8-socle.md` :

- par obligation : les articles dépouillés, leur verbatim, la périodicité **et son
  fondement textuel** — ou l'absence de fondement, qui se dit ;
- **les choix de découpage, de porteur et de nature, avec leur raison** ;
- ce que tu n'as pas encodé, et pourquoi ;
- la mesure avant / après.

Une question ? Elle vient à la session qui t'a délégué ce lot, pas à la
propriétaire.
