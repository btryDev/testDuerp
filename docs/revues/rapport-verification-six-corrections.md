# Vérification des six corrections — dossier neuf

Branche **`fix/ecrans-dossier-neuf`** (`65b3ef0`), vérifiée à l'écran le
31 août 2026 sur **Atelier Vermeil inchangé** — 6 personnes, aucun équipement,
Nadia Kerbrat et son titre SST du 10 septembre 2026. Base identique à celle du
rapport précédent : 3 `Verification`, 1 salarié, 1 titre.

| # | Point | Verdict |
|---|---|---|
| 1 | Total d'année contre lignes listées | **corrigé** — les cinq compteurs s'accordent |
| 2 | Filtre par domaine figé sur trois valeurs | **corrigé** |
| 3 | Le guide contredisait le produit | **corrigé, et au-delà** |
| 4 | Valeurs d'illustration présentées comme réelles | **corrigé** |
| 5 | « prestataire » pour une adhésion obligatoire | **corrigé au second tour** (`68a92d7`) — cf. §B |
| 6 | « aucun n'est déclaré » dans un dossier qui en porte un | **corrigé** |

Et **un défaut neuf**, ouvert par la correction de ce matin : §A.

---

## 1. Les cinq compteurs s'accordent — vérifié en comptant les lignes

La pastille annonce ce qui était attendu : **`2026 · 1 DATÉE · 2 À PLANIFIER`**,
et le titre lecteur d'écran le dit en toutes lettres — « 1 échéance datée en
2026, et 2 à planifier, sans date arrêtée ».

Les cinq signaux, confrontés au seul qui soit un fait :

| Signal | Ce qu'il dit | Accord |
|---|---|---|
| Pilule d'année | 1 datée · 2 à planifier = **3** | ✔ |
| Quatre compteurs d'état | 0 · 1 · 0 · 0 = **1**, explicitement les datées | ✔ |
| Chip isolé | **2** à planifier | ✔ |
| Cartes de mois | août « 2 ce mois-ci » + septembre « 1 ce mois-ci » = **3** | ✔ |
| **Lignes comptées à la main** | août 2 + septembre 1 = **3** | — |

Aucun des quatre ne diverge, et le total ne cache plus rien : la contradiction
est retirée, pas déplacée. La ligne de septembre, dépliée, porte bien sa date
réelle : « **10 SEPT.** — Membre du personnel formé au secourisme (SST) — *Titre
salarié · Nadia Kerbrat · permanente · Premiers secours* — Planifiée ».

**Une réserve qui n'était pas dans la liste, et un sixième signal.** La frise des
douze mois **n'affiche rien pour août** — pas de barre, pas de chiffre — alors
que la carte d'août porte deux lignes. Elle ne trace que les datées, ce que la
pastille annonce désormais ; mais la frise, elle, ne le dit pas. Un dirigeant qui
lit l'instrument voit un août vide et un septembre plein, quand la liste dessous
porte l'inverse. Ce n'est pas la contradiction d'origine — les nombres
s'accordent — c'est le dessin qui ne suit pas.

Capture : `captures-pr10c/30-calendrier-corrige.png`.

## 2. Le filtre par domaine suit le dossier — corrigé

Le panneau propose maintenant **Aération / ventilation**, **Santé au travail**,
**Premiers secours** : exactement les trois domaines portés par les trois lignes
du dossier. Plus de trio codé en dur, et la ligne « Santé au travail » est
devenue triable. La rangée ne déborde pas — elle affiche ce qui existe, pas les
dix-sept.

Capture : `captures-pr10c/31-filtres-corriges.png`.

## 3. Le guide ne contredit plus le produit — et il fait davantage

La phrase fautive a disparu. À sa place :

> « Aucun équipement déclaré pour l'instant — **les vérifications qui naissent
> d'un appareil** ne peuvent donc pas être calculées. **Ce qui suit ne dépend
> d'aucun équipement : ce sont les obligations qui vous incombent comme
> employeur, dès le premier salarié.** »

La distinction est juste, et elle ouvre ce qui manquait : le guide **liste
ensuite les dix-huit obligations**, groupées par domaine, avec leur rythme, leur
réalisateur et une ligne « pourquoi chez vous ».

```
Incendie / sécurité            1     Organisation de la prévention  1
Aération / ventilation         1     Information des travailleurs   2
Formation à la sécurité        4     Locaux sociaux                 3
Santé au travail               3     Co-activité                    1
Premiers secours               2                          TOTAL    18
```

**C'est la première surface qu'ont ces obligations**, et elle répond en partie au
constat central du rapport précédent. Deux réserves, cependant :

- **Les obligations ne sont pas nommées.** Un dirigeant lit « Locaux sociaux —
  3 obligations · permanente » et ne sait toujours pas qu'il s'agit des
  vestiaires, de l'eau potable et d'un emplacement pour se restaurer. Le compte
  et le motif sont là, l'objet ne l'est pas. Les seize ne sont toujours nommées
  qu'à un seul endroit : le menu déroulant du formulaire de prescription.
- **Une notation de développeur affleure** dans le texte destiné au dirigeant :
  « effectif sur site 6 **dans la plage [— ; 49]** ». L'intervalle ouvert écrit
  en notation mathématique, tiret cadratin compris, sur une page qui promet de
  traduire simplement.

## 4. L'illustration ne porte plus de valeurs — corrigé

`v3 · 04/26` et `22 juin` ont disparu. Le dessin garde ses étiquettes `VALIDÉ` et
`ÉCHÉANCE · vérif. annuelle`, mais **sans aucune valeur** : le sceau porte un
tiret, la note jaune n'a pas de date, le document a des barres grises à la place
du texte. Il se lit comme une illustration, plus comme un état de dossier.

Capture : `captures-pr10c/32-guide-corrige.png`.

## 5. « Intervenant » à la place de « prestataire » — la moitié du cas est réglée

La phrase est maintenant :

> **Aucun intervenant déclaré en santé au travail**
> *Une de vos obligations suppose un tiers qualifié — s'il intervient déjà chez
> vous, il reste à l'inscrire*

**Ce qui est gagné.** « Intervenant » ne présume plus un fournisseur qu'on
choisit, et la seconde moitié de la phrase est la vraie trouvaille : *« s'il
intervient déjà chez vous, il reste à l'inscrire »* nomme le cas le plus
fréquent — l'employeur a déjà un service de santé au travail et ne l'a pas saisi
— et retire au message tout ton de reproche. Sur ce cas-là, ça marche.

**Ce qui reste.** La phrase est écrite pour un employeur qui a déjà quelqu'un.
Pour celui qui n'a **pas** adhéré — le cas qui compte, celui où le produit
pourrait éviter un vrai manquement — elle dit « aucun intervenant déclaré », ce
qui se lit comme un trou de saisie, pas comme une obligation légale à remplir.
L'adhésion à un service de prévention et de santé au travail n'est pas une
relation qu'on peut ne pas avoir : elle est due. Rien dans la phrase ne le dit.

Je ne propose pas de rédaction — mais la règle sert deux cas dont l'un est
« inscrivez ce que vous avez déjà » et l'autre « ceci est obligatoire, et vous ne
l'avez peut-être pas ». Une seule phrase peut porter le premier ; je ne crois pas
qu'elle porte le second.

## 6. « Rien de ce qui est déclaré n'y répond » — corrigé

> **Organiser la formation à la sécurité des salariés**
> *Suppose un titre nominatif — **rien de ce qui est déclaré n'y répond***

Jugée du point de vue d'un patron de six personnes qui vient de saisir le titre
SST de Nadia : **la phrase ne lui reproche plus de n'avoir rien fait.** Elle
reconnaît implicitement qu'il a déclaré quelque chose, et dit que ce quelque
chose ne répond pas à cette obligation-là. C'est exact, et c'est le point qui
était faux.

Ce qu'elle ne dit pas, et ne peut pas dire : **lequel** répondrait. La règle ne
sait pas nommer le titre attendu — c'est écrit dans le moteur, `titre: null` — et
la formule reste donc abstraite. Un dirigeant comprend qu'il lui manque quelque
chose, sans savoir quoi chercher dans une liste de treize. C'est une limite
connue, pas un défaut de cette correction.

Capture : `captures-pr10c/34-tdb-corrige.png`.

---

## A. Ce que la correction a ouvert à côté : deux recommandations, une seule clé React ★

Console du tableau de bord, à chaque chargement, **deux fois** :

> `Encountered two children with the same key,` `/etablissements/<id>/prestataires`
> `Keys should be unique … Non-unique keys may cause children to be duplicated
> and/or omitted — the behavior is unsupported.`

**La cause.** Les deux widgets qui rendent la file de recommandations utilisent
l'URL de destination comme clé React — `key={r.href}`, `impl/board.tsx:594` et
`:1322`. Or **toutes** les recommandations de transmission « aucun intervenant
déclaré en … » pointent la même page, l'annuaire des prestataires. Dès qu'il
manque un intervenant sur **deux** domaines, deux frères portent la même clé.

Ce dossier en a deux — aération et santé au travail. Le dossier Bistrot du
rapport de ce matin en avait quatre.

**Pourquoi c'est neuf.** Avant la correction de ce matin, les transmissions
étaient retirées de la file dès qu'une urgence existait : deux d'entre elles ne
pouvaient jamais s'afficher ensemble, et la collision de clés était
inatteignable. La correction les a rendues visibles — et a rendu la collision
atteignable du même coup. C'est le tour où l'on introduit des défauts, et il en a
introduit un.

**Ce que ça risque.** React l'écrit lui-même : des enfants « dupliqués et/ou
omis ». Aujourd'hui la liste est statique et rien ne se voit ; le jour où elle se
réordonne — un filtre, une actualisation, un item soldé — une des deux
recommandations peut disparaître sans trace. Ce serait un faux négatif muet, la
famille que l'ADR-022 existe pour supprimer.

Ce n'est pas un avertissement de développement comme celui de ce matin : les
clés en double ont un effet, contrairement aux clés absentes.

## Le reste des écrans

Seize écrans du dossier ouverts après correction — tableau de bord, calendrier,
guide, contrôle, prescriptions, registre, équipements, équipe, prestataires,
DUERP, actions, carnet, accessibilité, permis de feu, plan de prévention, fiche
établissement. Tous à 200, aucun cassé, **aucune autre erreur console** que celle
du §A.

L'avertissement de clé manquante dans `BarreAnnee`, noté non résolu au rapport
précédent, **n'apparaît plus** sur ce dossier. Je ne l'attribue à aucune
correction : sa cause n'avait pas été trouvée, et son absence ici ne prouve pas
sa disparition.


---

# Seconde passe — `68a92d7`

Vérifiée sur le même dossier gelé.

## A-bis. La collision de clés est levée, et elle était plus large

**Console propre sur trois chargements du tableau de bord** : plus aucune erreur,
ni la collision de clés, ni autre chose.

La session principale signale que le défaut portait aussi sur les transmissions
de **salarié**, qui pointaient toutes l'écran Équipe — cinq recommandations
s'effondrant sur trois clés, là où j'en avais vu deux sur une. **Je n'en avais vu
que la moitié**, et pour une raison qui vaut d'être notée : ce dossier ne porte
qu'une seule obligation supposant un titre. La collision côté salarié n'était pas
observable ici. Un défaut ne se voit que sur un dossier qui l'exerce.

**La file n'a ni perdu ni gagné d'entrée** : cinq recommandations avant, cinq
après. Quatre sont identiques, au mot près et dans le même ordre relatif. La
cinquième — celle du service de santé au travail — a changé de libellé et est
remontée d'un rang, ce qui est la conséquence voulue du §B : elle est devenue une
règle distincte, avec sa propre priorité.

## B. Deux règles au lieu d'une — le cas difficile est traité

**Le domaine technique garde ce qu'il avait gagné :**

> **Aucun intervenant déclaré en aération / ventilation**
> *Une de vos obligations suppose un tiers qualifié — s'il intervient déjà chez
> vous, il reste à l'inscrire*

**Et la santé au travail a sa propre phrase :**

> **Aucun service de prévention et de santé au travail déclaré**
> *Tout employeur doit en organiser un (**L. 4622-1**) — si vous adhérez déjà à
> un service, il reste à l'inscrire*

**Jugé pour le cas qui compte** — un dirigeant de six personnes qui n'a adhéré à
aucun service : **oui, il comprend que c'est dû.** « Tout employeur doit en
organiser un » est une phrase d'obligation, pas de saisie ; l'article la fonde
sans encombrer ; et la seconde moitié continue de servir celui qui a déjà un
service sans l'avoir inscrit. Une phrase, deux situations, sans que l'une écrase
l'autre. C'est ce que la formule unique ne parvenait pas à faire.

**Une réserve de vocabulaire, mineure et à trancher côté produit.** Le verbe
retenu est celui du texte — L. 4622-1 fait *organiser* un service — mais un
employeur de six personnes n'organise pas un service : il **adhère** à un service
interentreprises. Or « adhérer » n'apparaît que dans la clause conditionnelle,
celle qui s'adresse à ceux qui l'ont déjà fait. Pour celui qui ne l'a pas fait —
le destinataire du message —, le seul verbe affirmatif est « organiser », qui
peut se lire comme « monter un service » et décourager là où il faudrait
orienter. Le fond est juste, c'est l'action à entreprendre qui reste implicite.

## C. La notation d'intervalle est corrigée

`effectif sur site 6 dans la plage [— ; 49]` est devenu :

> « effectif sur site 6 — **obligation applicable jusqu'à 49 salariés** »

Borne haute seule, en français, sans notation mathématique. C'est la forme
attendue pour ce dossier.

## D. Ce qui reste ouvert, et qu'il ne faut pas croire réglé

Le guide continue de compter les obligations par domaine **sans les nommer** —
neuf domaines, 18 au total, toujours aucun libellé individuel. Vérifié à nouveau
sur cette branche : `Vestiaires`, `Eau potable`, `Salarié désigné compétent` sont
absents de la page.

**La nouvelle surface du guide n'est pas le trou comblé.** Les seize obligations
sans date restent nommées à un seul endroit du produit : le menu déroulant du
formulaire de déclaration de prescription. C'est l'écran de checklist annoncé qui
répondra à ce constat, pas celui-ci.


---

# Troisième passe — `3738a15` : la phrase est juste, l'écran la coupe ★

La réserve de vocabulaire est traitée dans le texte. Le sous-titre dit
désormais :

> *Tout employeur doit en organiser un (L. 4622-1) : service autonome, ou
> adhésion à un service interentreprises (D. 4622-1) — en pratique la voie des
> petites structures. Si vous y adhérez déjà, il reste à l'inscrire.*

C'est la bonne réponse à ma réserve : les deux branches sont nommées, « en
pratique » n'impose rien que le Code ne dise, et un dirigeant de six personnes
sait **quoi faire** et plus seulement que c'est dû.

**Sauf qu'il ne la lit pas.** Voici ce que l'écran affiche :

> Tout employeur doit en organiser un (L. 4622-1) : service autonome, ou adhésion
> à un service interentreprises (D. 46**…**

Mesuré dans le DOM :

| | |
|---|---|
| Texte réel | **213 caractères** |
| Largeur nécessaire | **1 115 px** |
| Largeur disponible | **638 px** |
| Style | `white-space: nowrap` · `overflow: hidden` · `text-overflow: ellipsis` |
| Tronqué | **oui**, à ~57 % |
| Témoin — sous-titre de l'aération | 104 caractères, 638 px, **pile la largeur, non tronqué** |

Le sous-titre est rendu sur **une seule ligne, sans retour à la ligne possible**.
La carte a été dimensionnée pour des phrases d'une centaine de signes — celle de
l'aération tient au pixel près. Tout ce que la correction a ajouté tombe dans la
partie coupée : « en pratique la voie des petites structures », et surtout
**« Si vous y adhérez déjà, il reste à l'inscrire »** — la clause qui évite le
ton de reproche, celle qui avait été saluée au §5.

**Et la coupe tombe au milieu d'une référence d'article.** L'écran affiche
`(D. 46…`. Sur un produit dont la règle est de ne jamais citer un texte que
personne n'a dépouillé, une référence tronquée par la mise en page est un
problème d'une autre nature qu'une phrase coupée : `D. 46…` n'est pas un article.

C'est le même motif que les neuf autres défauts de la journée, à un cran de
plus : **la correction est juste dans le modèle, et le rendu la défait.** Le test
qui vérifie que l'article cité est dépouillé ne peut rien voir de cela — il lit
la chaîne, pas la largeur.

Capture : `captures-pr10c/53-carte.png`.

**Rien d'autre à signaler sur cette passe** : console propre sur trois
chargements, cinq recommandations, ordre inchangé, et les trois autres
sous-titres tiennent dans la largeur.


---

# Quatrième passe — `ad3b20d` : la phrase est raccourcie, l'écran la coupe encore ★

La phrase fait maintenant **138 signes** au lieu de 213, les références d'articles
sont sorties du sous-titre, et l'adhésion est passée en tête et à l'affirmative :

> *Tout employeur doit en avoir un : adhésion à un service interentreprises, ou
> service autonome. Si vous adhérez déjà, il reste à l'inscrire*

**Sur le fond, elle tient son travail, et mieux qu'avant.** Un dirigeant de six
personnes qui n'a rien fait lit « adhésion à un service interentreprises » en
premier, à l'affirmative : il sait quoi faire, et l'ordre des deux branches fait
en dix-sept signes de moins ce que « en pratique la voie des petites structures »
faisait en une proposition. C'est plus court **et** plus clair.

**Mais elle est toujours coupée.** Mesuré dans le DOM, sur le tableau de bord du
dossier neuf :

| Sous-titre | Signes | Nécessaire / disponible | |
|---|---|---|---|
| Déclarez vos équipements | 67 | 638 / 638 px | ✓ |
| Déposez votre premier rapport | 54 | 638 / 638 px | ✓ |
| **Service de prévention et de santé au travail** | **138** | **719 / 638 px** | **✗ tronqué** |
| Aucun intervenant déclaré en aération | 104 | 638 / 638 px | ✓ |
| Organiser la formation à la sécurité | 66 | 638 / 638 px | ✓ |

L'élément porte encore `class="… truncate …"` — soit `white-space: nowrap`,
`overflow: hidden`, `text-overflow: ellipsis` — pour une hauteur de **18 px**,
une seule ligne. Il manque 81 px, la fin de la phrase tombe.

**La cause est que la correction n'a été appliquée qu'à l'un des deux widgets.**
`impl/board.tsx` porte deux rendus de la file :

| Ligne | Composant | Widget | Classe du sous-titre |
|---|---|---|---|
| **381** | `CarteTache` | « Par où commencer » | **`line-clamp-2`** ✔ |
| **1356** | liste | **« À faire »** | **`truncate`** ✘ |

Le commentaire posé en 363-376 raisonne juste, et cite la mesure des 638 px —
mais il est au-dessus de la ligne 381, pas de la 1356.

**Et c'est le widget non corrigé qui est dans le layout par défaut.** Sur un
dossier neuf, le tableau de bord affiche « À faire ». « Par où commencer » doit
être ajouté à la main depuis le tiroir. Autrement dit : **la correction est dans
le widget que personne ne voit, et le défaut dans celui que tout le monde voit.**

C'est le troisième défaut de la journée qui vit dans ces deux mêmes rendus. Le
premier — la file amputée par `priorite <= 5` — était aux lignes 563 et 1245, et
il avait fallu les deux. Celui-ci n'en a eu qu'une.

**Rien d'autre n'a bougé** : les quatre autres sous-titres tiennent exactement
leur largeur, la hauteur des lignes de la file est identique (60-61 px), console
propre sur trois chargements.

**Sur la garantie posée** — un test qui refuse un sous-titre de plus de 170
signes — elle est honnête sur ce qu'elle mesure, et elle n'aurait pas attrapé
ceci : **138 signes passent le seuil, et sont pourtant coupés à 638 px.** Le
seuil est calibré sur 104 signes ≈ 638 px ; entre 104 et 170, il existe une plage
où la phrase est refusée par l'écran et acceptée par le test. Celle-ci est dedans.


---

# Cinquième passe — `4bb7ded` : la phrase s'affiche en entier

Mesuré dans le DOM, sur le tableau de bord du dossier neuf, layout par défaut :

| Sous-titre | Signes | scrollW / clientW | Hauteur | clamp | |
|---|---|---|---|---|---|
| Déclarez vos équipements | 67 | 638 / 638 | 18 px | 2 | ✓ |
| Déposez votre premier rapport | 54 | 638 / 638 | 18 px | 2 | ✓ |
| **Service de prévention et de santé au travail** | **138** | **638 / 638** | **36 px** | **2** | **✓ entier** |
| Aucun intervenant déclaré en aération | 104 | 638 / 638 | 18 px | 2 | ✓ |
| Organiser la formation à la sécurité | 66 | 638 / 638 | 18 px | 2 | ✓ |

`scrollWidth == clientWidth` sur les cinq : **plus rien n'est coupé**, ni en
largeur ni en hauteur. La phrase du service de santé au travail occupe ses deux
lignes et se lit jusqu'au bout, « Si vous adhérez déjà, il reste à l'inscrire »
compris — la clause qui évite le reproche est enfin visible.

**Le passage à deux lignes n'a rien cassé.** Les quatre autres sous-titres
gardent leur hauteur d'origine (18 px, une ligne) : `line-clamp-2` autorise la
seconde ligne sans l'imposer. Seule la ligne concernée grandit — 79 px contre 61
pour les autres —, les séparateurs restent alignés, le pied « 1 autre échéance
sous 30 jours » est en place, et la colonne voisine n'a pas bougé. Console
propre.

**Les deux widgets portent la même politique.** « Par où commencer », ajouté
depuis le tiroir, affiche `line-clamp-2` sur ses sous-titres comme « À faire ».
Je n'ai pas pu confronter *la même phrase* dans les deux — « Par où commencer »
ne montre que deux entrées et la recommandation du service de santé au travail
est en troisième position — mais la classe est identique de part et d'autre, et
c'est ce qui divergeait.

Capture : `captures-pr10c/70-final.png`.

---

## Ce que ce lot laisse comme leçon

Onze défauts trouvés à l'écran sur ce dossier neuf, dont **deux nés de
corrections justes du même jour** et **un né d'une garde** posée pour prévenir un
autre défaut.

Le motif est constant : **des phrases justes à l'écriture, laissées debout après
que ce qu'elles décrivaient a bougé.** Aucune n'était fausse quand elle a été
écrite ; toutes l'étaient devenues. Et aucune n'était atteignable par un test,
une revue de diff ou une relecture — elles vivaient dans le rendu, à l'endroit
exact où rien d'automatique ne va.

Deux corollaires, tirés de ce lot :

- **Une garde peut produire le défaut qu'elle prévient.** Le cliquet qui exigeait
  qu'une phrase d'interface cite au moins un article a fait mettre deux
  références dans une phrase qui n'avait la place d'aucune.
- **Déclarer l'approximation d'une garde ne dispense pas de vérifier qu'elle
  mesure la bonne chose.** Le seuil de 170 signes n'était pas approximatif, il
  était faux : calibré sur deux lignes quand le widget affiché n'en avait qu'une.
  Le défaut s'est produit deux fois dans la plage que le test laissait passer.

Et une limite de méthode, qui vaut pour tout ce rapport : **je ne trouve que ce
que le dossier sous les yeux exerce.** La collision de clés côté salarié
existait ; ce dossier ne la déclenchait pas, et je ne l'ai pas vue. Le prochain
contrôle passera sur deux dossiers.
