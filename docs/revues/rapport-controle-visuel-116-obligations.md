# Contrôle visuel — le passage à 116 obligations

Exécuté le **31 août 2026** depuis une seconde machine, sur
`integration/2026-08-31` (`888a32c`). Base locale **remise à zéro**, les trois
migrations additives appliquées, puis **un dossier créé par l'onboarding** :

> **Atelier Vermeil** — NAF `70.22Z` (conseil), **6 personnes sur site**,
> non-ERP, non-IGH, non-habitation, **aucun équipement déclaré**.

C'est le cas demandé : un dirigeant qui vient d'ouvrir son dossier et n'a rien
déclaré d'autre que son effectif. Un dossier vidé à la main n'aurait pas été la
même chose ; celui-ci est né du parcours.

Référence de calcul fournie par la session principale, vérifiée applicable :
**18 obligations**, toutes déclenchées par le seul effectif, dont **16 états
permanents** et 2 périodicités réelles.

---

## La réponse aux trois questions posées

**1. Est-ce que l'écran hiérarchise ou assène ?** Ni l'un ni l'autre : **il ne
montre presque rien.** Le calendrier affiche **2 lignes sur 18**.

**2. Que deviennent les états permanents dans un écran fait pour des
rendez-vous ?** Ils n'y entrent pas. Et ils n'entrent nulle part ailleurs :
**16 obligations sur 18 ne sont présentées au dirigeant sur aucun écran.**

**3. Est-ce que la rangée de filtres déborde avec dix-sept domaines ?** Non — et
pour une raison qui est elle-même un défaut : **les sept nouveaux domaines
n'arrivent jamais jusqu'au filtre.**

---

## 1. Seize obligations sur dix-huit n'existent nulle part pour le dirigeant ★

Le premier fait, mesuré en base : **2 lignes persistées** sur 18.

```
select count(*) from "Verification" where "etablissementId" = '…'  →  2

Contrôle périodique de l'ensemble des installations d'aération …  | annuelle | a_planifier
Liste des postes à risques particuliers : la mettre à jour, si …  | annuelle | a_planifier
```

Ce sont exactement les deux qui portent une périodicité réelle. Les **seize états
permanents** — affichages, locaux sociaux, premiers secours, adhésion au service
de santé au travail, formations, salarié désigné compétent, protocole de
chargement — ne sont pas persistés.

**Où le dirigeant peut-il les lire ?** J'ai cherché sur sept écrans :

| Écran | Les seize y sont ? |
|---|---|
| Calendrier | non |
| Tableau de bord | non |
| Préparer un contrôle | non |
| Registre de sécurité | non |
| Équipements | non |
| DUERP | non |
| Plan d'actions | non |
| Guide « Comprendre » | non (une seule y est nommée, en passant) |
| **Prescriptions** | **oui — et c'est le problème** |

Elles apparaissent à **un seul endroit** : le menu déroulant « Obligation
concernée » du formulaire **« Déclarer une prescription »**, sur
`/prescriptions`. C'est-à-dire dans un champ de saisie, sur un écran dont l'objet
est de déclarer *ce qu'une autorité vous a prescrit à vous seul* — un écran dont
le texte d'accueil dit lui-même : « Si aucune autorité ne vous a rien prescrit,
il n'y a rien à faire ici. »

Le déroulé les liste pourtant toutes, avec leur état :

> Tenue du registre de sécurité — *actuellement Sans échéance*
> Organiser la formation à la sécurité des salariés — *actuellement Sans échéance*
> Service de prévention et de santé au travail — adhésion ou service autonome — *actuellement Sans échéance*
> Matériel de premiers secours sur les lieux de travail — *actuellement Sans échéance*
> Vestiaires, lavabos et cabinets d'aisance — *actuellement Sans échéance*
> Eau potable et fraîche à disposition des travailleurs — *actuellement Sans échéance*
> … *(seize au total)*

**Le référentiel les connaît, le moteur les calcule, l'interface les possède —
et aucun écran ne les présente comme des obligations.** Un dirigeant de six
personnes qui ouvre Rojer aujourd'hui repart avec deux lignes.

Capture : `captures-pr10b/12-prescriptions.png`.

## 2. Le calendrier annonce « aucune échéance » au-dessus de deux échéances ★

Sur le premier écran qu'un dirigeant ouvre après la création de son dossier :

| Élément | Ce qu'il affiche |
|---|---|
| Pilule d'année | **2026 · AUCUNE ÉCHÉANCE** |
| Titre lecteur d'écran | « L'année d'un bloc — **0 échéance** en 2026 » |
| Les douze mois de la frise | 0 partout, **août compris** |
| Compteurs d'état | 0 en retard · 0 sous 30 jours · 0 à venir · 0 faite |
| Chip isolé, à l'extrême droite | **2 à planifier** |
| Carte du mois | **Août 2026 · 2 ce mois-ci · 2 à planifier** |
| Liste | **deux lignes** |

Le total d'année exclut l'état « à planifier », que la liste inclut. Résultat :
l'écran dit « aucune échéance » et en affiche deux, dans la même colonne, à
trois centimètres d'écart.

C'est la même famille que le défaut corrigé ce matin — un en-tête et une liste
qui ne parlent pas du même ensemble — mais elle frappe ici le cas le plus
sensible : **le tout premier calendrier, sur un dossier neuf.**

Le tableau de bord, lui, gère la même situation correctement, et montre la
formule qui manque au calendrier :

> « Aucune échéance cette année »
> « **2 vérifications à planifier n'ont pas encore de date — datez-les au
> calendrier pour qu'elles apparaissent ici.** »

Capture : `captures-pr10b/10-calendrier.png`, `14-filtres.png`.

## 3. Le filtre par domaine ignore les sept nouveaux domaines ★

Le panneau « Filtres » propose, sous **DOMAINE DES CONTRÔLES**, exactement
trois entrées : **Électricité**, **Incendie / sécurité**, **Aération /
ventilation**. Ce sont les trois domaines historiques (`DOMAINES_P1`,
`calendrier/page.tsx:1023`), passés en dur.

Or ce dossier n'a que deux lignes, et l'une d'elles porte le domaine
**« Santé au travail »**, affiché sous son libellé dans la liste :

> *Liste des postes à risques particuliers … · Vérification · Tout
> l'établissement · annuelle · **Santé au travail***

**Ce domaine n'existe pas dans le filtre.** Vérifié : filtrer sur « Aération /
ventilation » isole bien sa ligne (1 sur 2) ; il n'existe aucun moyen d'isoler
l'autre. Un domaine est affiché sur une ligne et absent de l'instrument censé
la trier.

La rangée ne déborde donc pas — mais parce qu'elle ne connaît pas les sept
nouveaux domaines. La question posée trouve sa réponse à l'envers.

## 4. Le guide affirme le contraire de ce que le produit fait ★

Sur `/guide`, section « Chez vous, concrètement », calculée depuis le dossier :

> « **Aucun équipement déclaré pour l'instant — la plateforme ne peut donc
> calculer aucune vérification périodique.** Ce silence ne signifie pas
> qu'aucune obligation ne vous concerne : il signifie que rien n'est déclaré. »

Cette phrase était vraie ce matin. **Elle est fausse sur cette branche** : sans
aucun équipement, la plateforme calcule deux vérifications périodiques, les
persiste et les affiche au calendrier. Le paragraphe qui existait précisément
pour ne pas faire croire à une absence d'obligations en produit désormais une
lui-même — et il le fait sur la page dont le rôle est d'expliquer.

Capture : `captures-pr10b/13-guide.png`.

## 5. Le message de conséquence, tel qu'un dirigeant le lit

C'est le premier de sa famille qu'un utilisateur verra. Sur le tableau de bord,
carte **PRIORITÉS · À faire** (« Vérifications et actions, par ordre
d'urgence »), cinq entrées, dans cet ordre :

| # | Titre | Sous-titre |
|---|---|---|
| 1 | Déclarez vos équipements | Le point de départ : ils déterminent vos vérifications obligatoires |
| 2 | Déposez votre premier rapport | Chaque rapport reçu rejoint votre registre de sécurité |
| 3 | **Aucun prestataire déclaré en aération / ventilation** | Une de vos obligations suppose l'intervention d'un tiers qualifié |
| 4 | **Aucun prestataire déclaré en santé au travail** | Une de vos obligations suppose l'intervention d'un tiers qualifié |
| 5 | **Organiser la formation à la sécurité des salariés** | Suppose un titre nominatif — aucun n'est déclaré |

Les amorçages passent devant, les transmissions suivent : l'ordre annoncé est
tenu, et le correctif de ce matin porte ses fruits sur un dossier réel.

**Deux remarques de formulation, à trancher côté produit — je ne les compte pas
comme des défauts.**

- L'obligation visée en 4 est « **Service de prévention et de santé au travail —
  adhésion ou service autonome** ». Le message dit « aucun **prestataire**
  déclaré en santé au travail ». Un dirigeant qui doit *adhérer à un SPST* ne
  reconnaîtra pas forcément son obligation sous le mot « prestataire », qui
  évoque un fournisseur qu'on choisit. Le sous-titre générique ne l'aide pas.
- En 5, le titre est une obligation d'**organisation** et le sous-titre parle
  d'un **titre nominatif**. La construction est voulue — la règle ne peut pas
  nommer le titre attendu et le dit en termes généraux — mais le rapprochement
  « organiser une formation » / « aucun titre déclaré » demande au lecteur un
  pas que rien ne lui donne.

Capture : `captures-pr10b/11-tdb.png`.

---

## Ce qui m'a paru faux sans être dans la liste

### a. Le guide affiche un état de dossier sur un dossier qui n'en a pas

En tête de `/guide`, sur ce dossier créé il y a dix minutes, sans aucune version
de DUERP et sans aucune vérification datée :

> `VALIDÉ` · **v3 · 04/26**  —  `ÉCHÉANCE` · **22 juin** · *vérif. annuelle*

Ces valeurs ne peuvent pas venir du dossier : il n'a ni version 3, ni avril 2026,
ni échéance au 22 juin. Ce sont vraisemblablement des valeurs d'illustration
figées dans l'en-tête. Sur une page qui promet à la ligne suivante « ce que vous
lisez ici est calculé depuis votre dossier », un badge `VALIDÉ` inventé est le
pire endroit où poser un exemple.

### b. « 2 à planifier » est un état de plus, hors des quatre compteurs

Les compteurs du calendrier en annoncent quatre — en retard, sous 30 jours, à
venir, faite — et un cinquième état existe, « à planifier », posé à part, à
l'autre bout de la ligne, et exclu du total. Sur un dossier neuf, **c'est le seul
état peuplé** : les quatre compteurs affichent 0 et toute l'information est dans
le chip isolé. C'est la cause mécanique du §2.

### Et ce qui m'a paru juste

- **Le mécanisme de conséquence tourne, et il vise juste.** Deux domaines sans
  prestataire nommés correctement, aucune transmission parasite.
- **Le tableau de bord dit ce que le calendrier tait** : « 2 vérifications à
  planifier n'ont pas encore de date — datez-les au calendrier pour qu'elles
  apparaissent ici ». La bonne phrase existe déjà dans le produit.
- **L'onboarding accepte un NAF hors des trois secteurs sans broncher** —
  `70.22Z` passe, le dossier se crée, le parcours va à son terme. Le point 11 du
  contrôle précédent, resté partiel faute de compte vierge, est **levé** : le
  parcours aboutit.
- **Le formulaire de prescription** distingue l'avis de l'acte (« un
  procès-verbal de commission est un avis ; l'acte qui prescrit est l'arrêté ») et
  refuse d'enregistrer un allègement. C'est du soin rare.

## 6. Avec un salarié : la correction de l'habilitation tient, et elle rend une phrase fausse

Ajout d'une personne par l'interface — **Nadia Kerbrat**, assistante de
direction, entrée le 4 mars 2024 — puis déclaration d'**un titre non
électrique** : *Membre du personnel formé au secourisme (SST)*, délivré le
10 septembre 2024, valable jusqu'au 10 septembre 2026, badge « Expire bientôt »,
pastille `§ R. 4224-15`.

**Le catalogue offre bien treize titres** (comptés dans le DOM, `input[type=radio]`) :

```
conduite-salarie-attestation-medicale        formation-securite-salarie-cse-sst
elec-salarie-attestation-medicale-voisinage  secours-salarie-secouriste
conduite-salarie-autorisation                sante-travail-salarie-sir
conduite-salarie-formation                   sante-travail-salarie-sir-categorie-a
formation-securite-salarie-accueil           sante-travail-salarie-sir-visite-intermediaire
formation-securite-salarie-designe-competent sante-travail-salarie-vip-adaptee
                                             sante-travail-salarie-vip
```

**La correction fonctionne.** Avec un titre déclaré — mais pas celui attendu — le
signal continue de parler :

> **Organiser la formation à la sécurité des salariés**
> *Suppose un titre nominatif — aucun n'est déclaré*

Avant la correction, n'importe quel titre l'aurait fait taire. C'est le faux
négatif muet que l'ADR-022 existe pour supprimer, et il ne se produit plus.

**Mais la correction crée un état que la phrase n'avait pas prévu.** Nadia
Kerbrat détient un titre, déclaré, visible sur sa fiche. Et le tableau de bord
lui dit « **aucun n'est déclaré** ». La phrase voulait dire « aucun titre de ce
type » ; elle dit « aucun », dans un dossier où il y en a un. Avant la
correction, cet état était impossible : un titre déclaré fermait le message. La
correction l'a rendu atteignable, et le libellé n'a pas suivi.

C'est exactement la famille de contradiction relevée aux §2 et §4 : un compteur
ou une phrase qui n'a pas été relue après que la règle sous lui a changé.

**Et la famille « Titres du personnel » apparaît bien** dans le panneau de
filtres dès qu'un titre daté existe, avec son icône `IdCard` — vérifiée ce matin
dans le DOM.

**Le §2 s'aggrave d'un cran.** Avec ce titre daté au 10 septembre 2026, l'écran
affiche maintenant :

| | |
|---|---|
| Pilule d'année | **2026 · 1 ÉCHÉANCE** |
| Compteurs | 0 en retard · **1 sous 30 jours** · 0 à venir · 0 faite |
| Chip isolé | **2 à planifier** |
| Carte d'août | 2 ce mois-ci · 2 à planifier |
| Carte de septembre | 1 ce mois-ci |
| **Lignes réellement listées** | **trois** |

« 1 échéance » au-dessus de trois lignes. Le total d'année ne compte que ce qui
porte une date ; la liste montre tout. L'écart n'est plus de deux à zéro, il est
de trois à un — et il grandira à chaque obligation sans date.

Captures : `captures-pr10b/20-titre.png`, `21-tdb-apres-titre.png`,
`22-calendrier-titre.png`.

## L'état de référence, et sa date de péremption

Ce dossier sert de base de comparaison pour la revue des corrections. Il est
**gelé** : Atelier Vermeil, Nadia Kerbrat, son titre SST — rien ne doit y être
touché, sans quoi l'avant/après ne vaut plus rien.

**Il porte une sensibilité au calendrier qu'il faut connaître avant de relire les
chiffres.** Le titre SST est valable jusqu'au **10 septembre 2026**. Relevé le
31 août, il compte pour « sous 30 jours ». À partir du 10 septembre il bascule en
retard, **sans qu'aucune correction n'y soit pour rien** :

| | au 31 août 2026 | à partir du 10 septembre |
|---|---|---|
| Compteurs d'état | 0 en retard · **1 sous 30 jours** | **1 en retard** · 0 sous 30 jours |
| Pilule d'année | 2026 · 1 ÉCHÉANCE | 2026 · 1 ÉCHÉANCE |
| Chip isolé | 2 à planifier | 2 à planifier |
| Lignes réellement listées | trois | trois |

**Ce qui se mesure ne bouge pas** : l'écart entre un total d'année à 1 et trois
lignes listées ne dépend pas de la date. Seuls les deux compteurs d'état
glissent. Si la revue tombe après le 10, ce glissement ne doit pas être lu comme
un effet d'une correction — et une base neuve vaudra mieux qu'une base ambiguë.

**Les cinq compteurs à confronter**, pour la revue du §2. L'écran en porte cinq,
et un seul est un fait :

1. la pilule d'année ;
2. les quatre compteurs d'état ;
3. le chip isolé « à planifier » ;
4. les « N ce mois-ci » de chaque carte de mois ;
5. **le nombre de lignes réellement listées** — le seul qui ne soit pas un
   compteur, et donc celui contre lequel les quatre autres se mesurent.

Une correction qui en accorde deux sur cinq déplace la contradiction au lieu de
la retirer. Les lignes se comptent à la main.

## Ce que je n'ai pas regardé

- Les obligations conditionnées par les réponses d'onboarding — exercices
  d'évacuation, consignes incendie — hors du cas demandé.
- Le rendu des 116 obligations sur un dossier chargé en équipements : ce contrôle
  portait sur le dossier neuf.

## Ce que je n'ai pas fait

Aucune correction de code, aucun `push` sur `main`, aucune donnée fabriquée.
Playwright installé hors du dépôt. Les trois migrations appliquées sur la seule
copie locale, qui avait été remise à zéro pour l'occasion.
