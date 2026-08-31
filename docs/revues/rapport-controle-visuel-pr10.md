# Rapport — contrôle visuel PR #10

Exécuté le **31 août 2026** depuis une seconde machine, sur la branche
`integration/2026-08-28` (`8de0902` au moment du contrôle), base locale restaurée
depuis le dump de la machine principale (`sha256 6169ba50…`, 105 129 octets).

Écrans ouverts dans un navigateur réel (Chromium piloté), pas lus dans le code.
Captures dans `captures-pr10/`.

**Compte utilisé** — à supprimer à la fin du contrôle, il existe sur le projet
Supabase qui sert le produit en ligne : le compte créé par la propriétaire depuis
le dashboard Supabase le 31 août 2026 (« Auto Confirm User »), UUID
`5f6fe9e5-a0f4-4ae5-8e98-ab1c676f1aad`. **Aucun compte n'a été créé pendant la
fenêtre où « Confirm email » était désactivé** : le point 3 de
`reglage-temporaire-confirm-email.md` est sans objet. Si un compte apparaît sur
ce créneau, il n'est pas celui du contrôle.

`Entreprise.userId` du dossier « Le Bistrot du Marché » a été repointé sur cet
UUID (`UPDATE 1`). Le second dossier, `e9492ba5-…`, est resté intact et ignoré.

---

## Tableau de synthèse

| # | Point | Verdict |
|---|---|---|
| 1 | Filtre par bâtiment sous « en retard seulement » | **conforme** |
| 2 | Pilule « Titres du personnel » | **conforme** (une réserve, cf. §2) |
| 3 | Pastilles réglementaires cliquables | **conforme** (deux nuances) |
| 4 | Aucun référentiel privé présenté comme du droit | **conforme** |
| 5 | Carnet sanitaire et sa citation | **conforme** |
| 6 | Carte de couverture disparue du tableau de bord | **conforme** |
| 7 | Bandeau de couverture du calendrier | **non vérifié** — aucun axe déclenché |
| 8 | Deux nouvelles recommandations | **non vérifié** — et une observation gênante |
| 9 | Écrans Équipe | **conforme** |
| 10 | Nom de l'opérateur sur le carnet sanitaire | **non vérifié** — données absentes |
| 11 | Onboarding hors des trois secteurs | **partiellement vérifié** |

---

## 1. Le filtre par bâtiment sous « en retard seulement » — conforme

Établissement « Le Bistrot du Marché », deux bâtiments.

| Filtre | En-tête (année) | En-tête (mois) | Lignes listées |
|---|---|---|---|
| Bâtiment principal, sans urgence | 24 échéances | 21 ce mois-ci · 21 en retard | 19 principal + 2 « Tout l'établissement » = **21** |
| Bâtiment principal **+ en retard seulement** | 21 échéances | 21 ce mois-ci · 21 en retard | 19 principal + 2 « Tout l'établissement » = **21** |
| Annexe **+ en retard seulement** | 7 échéances | 7 ce mois-ci · 7 en retard | 5 annexe + 2 « Tout l'établissement » = **7** |

L'en-tête et la liste disent le même nombre dans les deux sens. **Aucune ligne du
bâtiment B n'apparaît sous le filtre A**, ni l'inverse. Et le piège se referme
bien : les échéances sans lieu (« Tout l'établissement ») **restent visibles sous
les deux bâtiments** — elles ne sont pas avalées par le filtre.

Captures : `p1-01-haut.png`, `p1-04-batA-retard.png`, `p1-06-annexe-retard.png`.

## 2. La pilule « Titres du personnel » — conforme, avec une réserve

La pilule est présente dans la rangée de filtres, sous « TYPE D'ÉCHÉANCE ».

**L'icône est la bonne.** Vérifiée dans le DOM, pas à l'œil :
`class="lucide lucide-id-card flex-none size-4"`, avec les tracés d'une carte
(rect + circle + deux lignes). Ce n'est pas `Users`. La même `IdCard` sert aux
chips « 1 titre » des écrans Équipe.

**Elle filtre.** Sur 2024, le filtre isole une seule ligne — l'attestation
médicale dépassée de Léa Fontaine — comptée « 1 en retard »
(`p2-02-titres-2024.png`).

**Les lignes de titre ne sont plus comptées dans « Vérifications ».** Deux
preuves : « Attestation médicale » est absent de la liste sous
« Vérifications périodiques » ; et sous ce filtre la flèche de recul d'année est
**désactivée** à 2026, alors qu'elle mène jusqu'à 2024 sous « Titres du
personnel ». Les bornes de navigation se calculent sur l'ensemble filtré : le
titre de 2024 n'est donc pas dans l'ensemble des vérifications.

**Réserve.** Sur l'année en cours (2026), le filtre « Titres du personnel »
affiche **0 échéance** — « De août à décembre, aucune échéance ». C'est
arithmétiquement exact (les trois titres sont datés 2024, 2029 et 2030), mais le
tableau de bord annonce au même moment « 1 titre de salarié » et « 27 dépassées »
là où le calendrier 2026 en compte 26. Voir le défaut décrit plus bas : un
dirigeant qui ouvre le filtre « Titres du personnel » y lit qu'il n'a rien en
retard, alors qu'un titre l'est depuis novembre 2024.

## 3. Les pastilles réglementaires — conforme

**14 pastilles ouvertes une par une**, sur les huit écrans demandés. Toutes
s'ouvrent, toutes montrent quelque chose.

| Écran | Pastilles | Résultat |
|---|---|---|
| Contrôle | 4 (R. 4121-1, R. 4323-25, R. 164-6 CCH, L. 8222-1) | extrait + lien Légifrance |
| Permis de feu (liste) | 3 (INRS ED 6030, R. 4224-17, GN 13) | extrait + lien |
| Permis de feu (fiche) | 1 (R. 4224-17 · ED 6030) | extrait + lien |
| Plan de prévention (liste) | 2 (R4512-6 à R4512-12, arrêté 19 mars 1993) | cf. nuance |
| Plan de prévention (fiche) | 1 (R. 4512-6 à R. 4512-12) | extrait + lien |
| Registre | **0** | cf. nuance |
| Carnet sanitaire | 2 (arrêté 1er févr. 2010 art. 3, R. 1321-23 CSP) | cf. nuance |
| Accessibilité | 1 (R. 164-6 CCH) | extrait + lien |
| Prestataires | 1 (L. 8222-1 CT) | extrait + lien |

Deux nuances, ni l'une ni l'autre n'étant un défaut au sens de la fiche :

- **Deux pastilles s'ouvrent sur un lien seul**, sans extrait ni explication :
  `§ ART. R. 1321-23 CSP` (carnet sanitaire) et `§ ART. R4512-6 À R4512-12 CT`
  (plan de prévention, liste). Contenu déplié complet, vérifié dans le DOM :
  `"§ / ART. R. 1321-23 CSP / ▾ / LIRE LA SOURCE OFFICIELLE →"`. La fiche accepte
  « un extrait, un lien Légifrance, **ou les deux** » : c'est donc conforme. Mais
  ces deux-là sont visiblement plus pauvres que leurs voisines, et sur le même
  écran que des pastilles qui, elles, citent le texte.
- **La page Registre ne porte aucune pastille.** Rien ne s'y ouvre sur du vide —
  il n'y a rien. À confirmer côté conception : la fiche liste « Registre » parmi
  les écrans à ouvrir, ce qui laisse penser qu'une pastille y était attendue.

Sur les deux fiches (permis de feu, plan de prévention), la pastille est
**dépliée par défaut** (`aria-expanded="true"` au chargement) : le premier clic
la referme. Comportement cohérent, signalé pour qui relira les chiffres.

Captures : `p3-controle.png`, `p3-permis-feu-fiche-ouvert.png`.

## 4. Aucun référentiel privé présenté comme du droit — conforme

Balayage de onze écrans, toutes pastilles dépliées. `APSAD` apparaît **2 fois**
(contre six auparavant), et les deux fois il est **explicitement qualifié** :

> « Votre assureur l'exigera probablement au titre de la règle APSAD R43. C'est un
> référentiel de la profession de l'assurance, opposable par votre contrat — pas
> par le droit. » *(permis de feu, liste)*

> « …au titre de la règle APSAD R43 — un référentiel de la profession de
> l'assurance, opposable par le contrat et non par le droit. » *(permis de feu,
> fiche)*

La seconde occurrence est **à l'intérieur d'une pastille réglementaire**. La
fiche demandait d'abord qu'APSAD n'y apparaisse plus ; elle accepte à défaut
qu'il soit qualifié sans ambiguïté. C'est le cas, et la qualification est dans la
même phrase, pas en note de bas de page.

## 5. Le carnet sanitaire et sa citation — conforme

La citation se termine bien par la bonne formule :

> « …dans un fichier sanitaire des installations, **qui est tenu à disposition du
> directeur général de l'agence régionale de santé**. »

« des autorités sanitaires » est **absent de la page** (vérifié par recherche sur
le texte rendu). Le lien pointe
`https://www.legifrance.gouv.fr/loda/id/JORFTEXT000021795143/`, l'arrêté du
1er février 2010.

Un paragraphe suit la citation et distingue le vocabulaire du texte de celui du
produit : « Le texte dit "fichier sanitaire des installations". "Carnet
sanitaire" est le nom que cet outil donne à son module, pas celui de l'arrêté ».

Capture : `p5-carnet.png`.

## 6. La carte de couverture a disparu du tableau de bord — conforme

Aucune occurrence de « couverture », « ce que Rojer couvre », « ne couvre pas »
ni « hors périmètre » sur le tableau de bord.

**Et rien ne reste à sa place.** Le board s'enchaîne proprement : bandeau brief
(« 27 échéances à traiter cette semaine », trois compteurs), carte établissement
à deux bâtiments, rangée de filtres par bâtiment, guide de mise en place, widget
calendrier, widget équipements. Pas de trou, pas de colonne vide, pas de grille
désalignée.

Capture : `p6-tdb.png`.

## 7. Le bandeau de couverture du calendrier — non vérifié

**Aucun bandeau de couverture ne se rend sur le calendrier de cet
établissement.** Recherche sur le texte rendu : « IGH », « secteur », « domaine »,
« couvre », « couverture », « hors » — aucune occurrence.

C'est très probablement le résultat juste, et la fiche le prévoit : cet
établissement ne déclenche aucun des quatre axes.

| Axe | Valeur | Déclenche ? |
|---|---|---|
| IGH | `estIGH = false` | non |
| Catégorie d'ERP | type N, catégorie 5 | non |
| Secteur du DUERP | NAF `56.10A` — restauration, secteur couvert | non |
| Domaine d'équipement | 9 catégories, toutes dans les 10 domaines livrés | non |

**Mais je n'ai donc jamais vu ce bandeau rendu.** Sa lisibilité et sa justesse
restent invérifiées : il faudrait un établissement qui déclenche au moins un axe
— un NAF hors des trois secteurs, ou un équipement d'un domaine non couvert.

## 8. Les deux nouvelles recommandations — non vérifié, et une observation

**Aucune des deux ne s'affiche.** Recherche sur le texte rendu du tableau de
bord : « titre nominatif », « Suppose », « prestataire », « recommand » — aucune
occurrence. Le mot « prestataire » n'apparaît nulle part sur cet écran.

Pour la première (« suppose un titre nominatif — aucun n'est déclaré »),
**l'absence est juste** : les trois salariés ont chacun un titre déclaré, la
condition n'est pas réunie.

Pour la seconde, **la condition semble réunie et le message manque**. Les deux
prestataires de l'annuaire couvrent `incendie`, `entretien_general`,
`electricite` et `bureau_controle`. Les équipements déclarés relèvent en plus de
l'aération/ventilation (VMC), de la cuisson (hotte professionnelle, appareil de
cuisson ERP), des portes et portails automatiques, et du froid (installation
frigorifique) — **quatre domaines d'obligation sans prestataire correspondant**.

Je ne le qualifie pas de défaut, pour une raison précise : le tableau de bord est
un board personnalisable, et je ne peux pas distinguer « le message est absent
alors qu'il devrait être là » de « le widget qui le porte n'est pas dans le
layout par défaut ». **À trancher côté conception**, avec le jeu de données de ce
dump qui remplit la condition.

## 9. Les écrans Équipe — conforme

**Liste Équipe** : trois cartes de personnes à la grammaire du board — mêmes
rayons, mêmes teintes, chip `1 titre` avec l'icône `IdCard`, pastille de retard
rose sur Léa Fontaine, bouton `1 TITRE À RENOUVELER`. Bloc pédagogique « Un seul
titre au catalogue, pour l'instant » avec pastille `§ ART. R. 4544-10 CT`.

**Fiche d'un salarié** (Camille Roussel) : mêmes cartes arrondies, même
typographie, pastille `§ R. 4544-11-1`, badge « Sans terme écrit », mention
« Rojer n'enregistre que l'existence de cette attestation et ses dates. Le
document reste chez vous. »

Aucun des deux n'a l'air d'appartenir à une autre application.

Captures : `p9-01-equipe.png`, `p9-02-fiche-salarie.png`.

## 10. Le nom de l'opérateur sur le carnet sanitaire — non vérifié

**Impossible à atteindre : le dump ne contient aucun point de relevé.**
`select count(*) from "PointReleve"` → `0`. L'écran affiche « Aucun point de
relevé configuré ». Il n'y a donc aucune fiche de point de relevé à ouvrir, et
donc aucun nom d'opérateur à lire.

Pour y arriver il faudrait un dump contenant au moins un `PointReleve` et un
`ReleveTemperature` avec son champ `operateur` renseigné. Je n'en ai pas fabriqué.

## 11. L'onboarding s'ouvre hors des trois secteurs — partiellement vérifié

**Ce qui est vérifié, et qui est le cœur du point : il n'y a pas de refus.**

Le champ « Code NAF » est un `<input type="text">` libre, pas une liste fermée :
les quatre codes proposés (56.10A, 47.11B, 70.22Z, 71.12B) sont des raccourcis,
pas des contraintes. La saisie de `45.20A` (garage) est acceptée et déclenche un
message d'information, pas un blocage :

> **Pas de référentiel de risques types pour ce secteur.** Aucun référentiel de
> risques types n'est encore instruit pour ce code d'activité. Vous pouvez créer
> votre dossier : le suivi des obligations, le calendrier des vérifications et le
> registre de sécurité ne dépendent pas de votre code d'activité — ils se
> déclenchent sur vos équipements et sur votre typologie d'établissement. Seul le
> document unique démarrera sans unités de travail ni risques pré-remplis : vous
> choisirez le secteur le plus proche, ou vous les saisirez vous-même. Votre
> dossier indiquera en permanence que ce point n'est pas couvert.

Le message dit ce qui sera couvert et ce qui ne le sera pas, sans promettre une
couverture DUERP que le produit ne tient pas. L'étape 1 se valide avec ce NAF.

**Ce qui n'est pas vérifié : le parcours mené jusqu'à la création du dossier.**
Deux tentatives se sont arrêtées après l'étape 2, en retombant sur le tableau de
bord existant sans créer d'entreprise (`select "raisonSociale" from "Entreprise"`
→ toujours deux lignes, aucune « Garage »). L'explication la plus probable est
structurelle et non un défaut de l'onboarding : `Entreprise.userId` est
`@unique` (`prisma/schema.prisma:32`), donc **un compte ne peut posséder qu'une
entreprise**, et celui du contrôle en possède déjà une.

Pour clore ce point il faut un second compte, vierge de tout dossier. Je ne l'ai
pas demandé : la fenêtre « Confirm email » a été refermée, et rouvrir un réglage
d'authentification du produit en ligne pour finir une vérification ne le vaut
pas.

Capture : `p11-02-rempli.png`.

---

## Ce qui m'a paru faux sans être dans la liste

### a. Un titre en retard depuis 2024 est invisible dans le calendrier, et les compteurs ne s'accordent pas

**C'est le constat le plus sérieux du rapport.** Trois écrans disent trois choses
différentes du même fait.

Léa Fontaine a une attestation médicale dépassée depuis le **20 novembre 2024**
(`statut = depassee`).

| Où | Ce qui est affiché |
|---|---|
| Tableau de bord, bandeau brief | « **27 échéances** à traiter cette semaine », « **27 dépassées** » |
| Tableau de bord, widget calendrier | « 25 vérifications · 1 opération · **1 titre de salarié** » · « 27 en retard » |
| Calendrier, année 2026, sans filtre | « 29 échéances », « **26 en retard** » |
| Calendrier, année 2026, filtre « Titres du personnel » | « **De août à décembre — aucune échéance** », 0 en retard |

Vérité SQL pour 2026 : **25 vérifications, 0 titre**. Les trois titres sont datés
2024, 2029 et 2030.

Le widget du tableau de bord remonte donc le titre dépassé de 2024 dans la vue de
l'année en cours et le compte comme retard ; le calendrier, lui, filtre
strictement sur l'année de `datePrevue` et le laisse en 2024. Les deux lectures
se défendent séparément. Ensemble, elles produisent le résultat qu'il ne faut
pas : **un dirigeant qui clique sur « Titres du personnel » — le filtre fait
exactement pour ça — lit qu'il n'a aucune échéance de titre, alors que le
bandeau, deux écrans plus haut, en compte une en retard.** Pour la voir, il faut
reculer de deux années à la main.

Reproduction : `/etablissements/<id>` puis `/etablissements/<id>/calendrier`,
filtre « Titres du personnel », année 2026.

### b. Le message de validation d'e-mail de Supabase remonte brut, en anglais

Sur `/signup`, une adresse refusée par Supabase affiche le message du fournisseur
tel quel, au milieu d'une page entièrement en français :

> `Email address "controle.pr10.…@rojer-test.fr" is invalid`

C'est ce que voit un dirigeant qui se trompe de domaine à l'inscription.

### c. La landing annonce « 64 obligations · 9 domaines »

Sur la page d'accueil publique, la carte « Le calendrier des vérifications »
affiche « 64 obligations · 9 domaines ». Le `CLAUDE.md` de cette branche en
annonce **85 sur 10 domaines**. Un des deux chiffres est périmé, et c'est le seul
qui soit public.

### d. Changer de filtre de type ramène le calendrier à l'année en cours

En 2024 sous « Titres du personnel », basculer sur « Vérifications périodiques »
ramène l'écran à 2026 sans le dire. L'année choisie est perdue au changement de
famille.

### Et ce qui m'a paru juste

- Le **fil du point 1** tient dans les deux sens, y compris sur le piège des
  échéances sans lieu. C'est le point qui portait le défaut d'origine.
- L'**écran d'attente de confirmation d'inscription** est soigné : trois étapes
  numérotées, « Regardez dans vos spams au cas où », « J'ai déjà cliqué · Me
  connecter », « Mail absent ? Réessayer ». Il traite un moment où l'utilisateur
  est habituellement laissé seul.
- Les **pastilles réglementaires** citent le texte au lieu de le paraphraser, et
  distinguent le vocabulaire du produit de celui du droit (carnet sanitaire),
  ainsi que le référentiel d'assureur du droit (APSAD).
- La **frontière médicale** est tenue à l'écran, pas seulement dans les
  documents : « Ne déposez pas le document. Rojer enregistre qu'une attestation
  existe, sa date et son échéance — rien d'autre. »

---

## Ce que je n'ai pas pu atteindre, et ce qu'il aurait fallu

| Point | Ce qui manquait | Ce qu'il faudrait |
|---|---|---|
| 7 — bandeau de couverture | Un établissement déclenchant au moins un des quatre axes | Un dossier au NAF hors des trois secteurs, ou avec un équipement d'un domaine non couvert |
| 8 — recommandations | Impossible de distinguer « message absent » de « widget hors layout par défaut » | Savoir quel widget les porte, et s'il est épinglé par défaut |
| 10 — opérateur du carnet sanitaire | `PointReleve` = 0 dans le dump | Un dump avec au moins un point de relevé et un relevé de température dont `operateur` est renseigné |
| 11 — fin du parcours d'onboarding | `Entreprise.userId` est `@unique` : le compte possède déjà un dossier | Un second compte Supabase vierge |

Trois remarques de mise en route, pour la prochaine fois :

- `docker-compose.override.yml` doit porter **`ports: !override`** ; sans le tag,
  Compose *ajoute* le port à la liste du fichier de base au lieu de la remplacer,
  et le conflit revient. Corrigé depuis dans le `.gitignore` (`8de0902`).
- Le dump a été déposé **à la racine du dépôt**. Déplacé hors du dépôt avant
  restauration ; un fichier de données à cet endroit finit par être commité.
- Les échéances portées par l'établissement ont `equipementId` **à NULL**, pas un
  équipement sans bâtiment. Une jointure interne `Verification × Equipement` les
  fait disparaître en silence — c'est le piège du point 1, transposé au SQL.

## Ce que je n'ai pas fait

Aucune correction de code, aucun `push` sur `main`, aucune donnée fabriquée pour
combler une vérification manquante. Playwright a été installé **hors du dépôt**
(`/tmp/controle-pr10`) : ni `package.json` ni le lockfile n'ont été touchés.
