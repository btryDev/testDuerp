# Rapport — les écrans d'un dossier neuf

**Branche** `fix/ecrans-dossier-neuf`, depuis `origin/integration/2026-08-31` ·
dix corrections · **1792 tests verts**, `tsc` propre, un avertissement eslint
préexistant (`normaliserFormData`).

Neuf défauts trouvés en ouvrant les écrans d'un dossier réel — six personnes,
zéro équipement. Six au premier passage, trois au second, après qu'un salarié
et un titre ont été ajoutés. **Aucun n'était visible autrement** : la plupart
vivaient dans du JSX ou dans un SVG, un ne se voyait que dans la console. Aucun
test ne les voyait, et aucun n'aurait pu : ce qu'ils affirment n'était appelable
de nulle part.

Un fil les relie : **une phrase écrite quand elle était vraie, et jamais relue
après que la règle sous elle a bougé.** Trois ont été rendues fausses par des
corrections livrées le matin même — dont deux par les miennes.

---

## 1. Le calendrier annonçait « aucune échéance » au-dessus de deux échéances

**Ce que voyait le dirigeant.** La pastille d'année : « 2026 · AUCUNE
ÉCHÉANCE ». La frise à zéro sur douze mois, les quatre compteurs à zéro. Et à
l'autre bout de la barre, un chip isolé : « 2 à planifier », suivi d'une carte
« Août 2026 · 2 ce mois-ci » avec ses deux lignes. Après ajout d'un titre daté :
« 1 ÉCHÉANCE » au-dessus de **trois** lignes.

**La cause.** « À planifier » est un cinquième état, hors des quatre compteurs.
Leur `datePrevue` est une date de génération, pas un rendez-vous : les poser sur
un mois donnerait à lire un engagement qui n'existe pas. Cette exclusion est
juste — elle n'est pas touchée. Ce qui ne l'était pas, c'est d'écrire « aucune »
quand le seul état peuplé est celui qu'on exclut.

**Ce qu'il voit après.** « aucune datée · 2 à planifier », et « 1 datée · 2 à
planifier » dans la forme aggravée. Le chip demeure ; c'est la phrase à côté qui
a cessé de le contredire.

**Pourquoi c'était urgent, et pas seulement laid.** L'écart s'aggravait tout
seul : tant que « à planifier » reste hors du total, chaque obligation d'état
permanent ajoutée au référentiel creuse la distance entre l'en-tête et la liste.
Ce n'est pas un défaut qui se stabilise.

**Gardé par un test ?** Oui. `libelleTotalAnnee` a été extraite du JSX vers
`lib/calendrier/labels.ts` — **c'est l'extraction qui crée la garantie**, le
test ne fait que la nommer. Quatre cas, dont une contre-épreuve : sans elle, une
implémentation qui écrirait toujours « · 0 à planifier » passerait.

## 2. Le filtre par domaine n'en connaissait que trois

**Ce que voyait le dirigeant.** Une ligne au domaine « Santé au travail », son
domaine lisible sur la ligne — et absent de l'instrument qui la trie. Elle ne
pouvait pas être filtrée.

**La cause.** Trois valeurs en dur, les domaines du palier P1. Le référentiel en
compte dix-sept.

**Ce qu'il voit après.** Les domaines réellement présents dans les échéances du
lieu, dans l'ordre du référentiel. Le patron est celui des pilules de famille —
et il en reprend la précaution : la lecture se fait sur les lignes du **lieu**,
pas sur une liste déjà réduite par le domaine ou l'urgence. Sans cela, choisir un
domaine effacerait tous les autres de la liste des choix et l'on n'en sortirait
plus : c'est le sort que la pilule « Opérations » a déjà évité une fois. La
lecture voyage dans le `Promise.all` existant, donc sans allonger le rendu.

**Gardé par un test ?** Oui, cinq cas — dont un identifiant d'obligation retiré
du référentiel, qui doit être ignoré plutôt que d'inventer un domaine
(`obligationId` n'a pas de clé étrangère, ADR-003).

## 3. Le guide affirmait le contraire de ce que fait le produit

**Ce que voyait le dirigeant.** « Aucun équipement déclaré pour l'instant — la
plateforme ne peut donc calculer **aucune vérification périodique**. » Et rien
d'autre : la liste des domaines avait disparu.

**La cause.** Les deux étaient les branches d'une **alternative**. Déclarer zéro
équipement effaçait la liste. C'était vrai tant que toute obligation naissait
d'un équipement ; depuis l'intégration, un établissement sans le moindre appareil
en reçoit dix-huit. Le paragraphe écrit pour ne pas faire croire à une absence
d'obligations en produisait une lui-même, **sur la page qui explique**.

**Ce qu'il voit après.** L'absence d'équipement est devenue une remarque, pas une
alternative : « les vérifications qui naissent d'un appareil ne peuvent donc pas
être calculées. Ce qui suit ne dépend d'aucun équipement. » Puis la liste.

**Gardé par un test ?** Oui, et en deux moitiés — parce que le défaut en avait
deux. La première vérifie qu'un établissement sans équipement a bien des
domaines à montrer ; la seconde, que la phrase absolue a disparu. Séparées, elles
disent aussi quand le test perdra son objet : si le produit cessait de produire
des obligations sans équipement, la phrase redeviendrait vraie.

## 4. Le guide affichait des valeurs fabriquées

**Ce que voyait le dirigeant.** Sur un dossier créé depuis dix minutes :
`VALIDÉ · v3 · 04/26` sur un tampon, `ÉCHÉANCE · 22 juin` sur un post-it. Une
section plus bas, la page promet « calculé depuis votre dossier ».

**La cause.** Une illustration SVG décorative, `aria-hidden`. Décorative dans
l'intention — mais `aria-hidden` protège les lecteurs d'écran, pas les yeux. Un
dirigeant ne distingue pas un chiffre dessiné d'un chiffre calculé.

**Ce qu'il voit après.** Les libellés génériques restent — « VALIDÉ »,
« ÉCHÉANCE » nomment une nature de document sans rien affirmer sur le sien. Les
valeurs ont disparu ; des traits tiennent leur place graphique.

**Gardé par un test ?** Oui, et il vise une **forme** plutôt que les deux valeurs
retirées : une liste n'aurait attrapé que les fautes connues.

Sa première version interdisait tout chiffre dans un `<text>` — et **elle a
signalé « Art. L. 4121-1 »**, le badge Code du travail. Une référence d'article
n'est pas une donnée de dossier : elle est vraie pour tout le monde, elle ne
prétend rien sur le lecteur, et c'est ce que le produit affiche partout ailleurs.
La garde vise donc les valeurs qui se lisent comme **l'état du dossier** : dates,
numéros de version. Le trop-large a été trouvé par le test lui-même, à sa
première exécution.

## 5. « Prestataire » était un contresens

**Ce que voyait le dirigeant.** « Aucun prestataire déclaré en santé au
travail — Une de vos obligations suppose l'intervention d'un tiers qualifié. »

**La cause.** L'obligation visée est l'adhésion à un service de prévention et de
santé au travail : une obligation légale de l'employeur (`L. 4622-1`), pas un
fournisseur qu'on retient. La règle avait servi dix domaines techniques où
« prestataire » allait de soi ; le onzième l'a fait sortir de son assiette.

**Ce qu'il voit après.** « Aucun intervenant déclaré en santé au travail — Une de
vos obligations suppose un tiers qualifié, s'il intervient déjà chez vous il
reste à l'inscrire. »

**Une phrase ou deux règles ?** J'ai d'abord soutenu qu'une seule suffisait, en
raisonnant que le constat était identique des deux côtés. **C'était insuffisant,
et le § 8 raconte pourquoi** : le jugement rendu à l'écran a montré que la phrase
règle le cas fréquent et rate celui qui compte. Ce paragraphe est conservé tel
qu'il a été écrit, et corrigé par le § 8 plutôt que réécrit — sans quoi ce
rapport ferait exactement ce qu'il reproche aux six premiers défauts : laisser
en place une affirmation devenue fausse.

**Gardé par un test ?** Oui — voir § 8, qui garde les deux règles.

## 6. « Aucun n'est déclaré » dans un dossier où il y en avait un

**Ce que voyait le dirigeant.** Une salariée détenait un certificat de secourisme
déclaré, visible sur sa fiche, avec échéance. Et le tableau de bord affichait,
pour une **autre** obligation : « Organiser la formation à la sécurité des
salariés — *Suppose un titre nominatif, aucun n'est déclaré* ».

**La cause, et elle est de moi.** La phrase était vraie *par construction* : le
signal ne parlait que si le dossier ne portait **aucun** titre. Le matin même,
j'ai indexé ce silence sur le **domaine** — un certificat de secourisme ne fait
plus taire le signal d'électricité. Correction juste, et le contrôle visuel l'a
confirmée en marche. Mais **le libellé n'a pas suivi la règle qui venait de
bouger sous lui**.

**Ce qu'il voit après.** « Suppose un titre nominatif — rien de ce qui est
déclaré n'y répond. » Vrai que le dossier porte zéro titre ou douze.

**Ce que la phrase ne peut pas dire.** Quel titre est attendu : la transmission
ne le sait pas, c'est tout l'objet du `titre: null`, et l'ADR-024 pose que le
produit nomme le trou sans le dériver. Rester générique **sans être fausse** est
plus étroit qu'il n'y paraît.

**Gardé par un test ?** Oui, et il garde les deux bords : que la phrase
n'affirme plus « aucun », et qu'elle continue de parler d'un titre nominatif —
sans quoi une reformulation qui nommerait un titre précis passerait.

---

## 7. Deux enfants React avec la même clé

**Ce que voyait le dirigeant.** Rien — et c'est le point. La console écrivait
deux fois par chargement « Encountered two children with the same key ».

**La cause.** Le tableau de bord employait `href` comme clé React. Juste tant
qu'une destination désignait une recommandation ; toutes les transmissions de
domaine mènent à l'annuaire des prestataires. **C'est ma correction du matin,
qui les a rendues visibles ensemble, qui a rendu la collision atteignable.**

Le défaut s'est révélé plus large que rapporté : les transmissions de **salarié**
partagent de la même façon l'écran Équipe. La mutation le montre — cinq
recommandations s'effondrent sur trois clés.

**Ce qu'il voit après.** Toujours rien, et c'est l'objectif. Une clé absente n'a
pas d'effet ; une clé **en double** en a un, et React le dit : des enfants
« dupliqués et/ou omis ». La liste est statique aujourd'hui. Le jour où elle se
réordonne, une recommandation peut disparaître **sans trace** — un faux négatif
muet, ce que l'ADR-022 existe pour supprimer.

**Gardé par un test ?** Oui, avec une contre-épreuve qui compte : la clé doit
être **stable**, pas seulement unique. Un compteur d'index passerait le test
d'unicité en réintroduisant le défaut au premier réordonnancement.

## 8. « Prestataire » : deux règles, finalement

**Ce que j'avais soutenu.** Qu'une seule phrase suffisait, parce que ce que la
règle constate me semblait identique dans les deux cas.

**Ce que le jugement à l'écran a tranché, et il a raison.** « S'il intervient
déjà chez vous, il reste à l'inscrire » règle le cas fréquent — mais la phrase
est écrite **pour celui qui a déjà un intervenant**. Pour celui qui n'a pas
adhéré, c'est-à-dire le seul cas où le produit pourrait éviter un manquement
réel, « aucun intervenant déclaré » se lit comme un trou de saisie.

Organiser un service de prévention et de santé au travail n'est pas une relation
qu'on peut ne pas avoir : elle est due (`L. 4622-1`). Le domaine technique
constate une **saisie manquante** ; la santé au travail constate une
**obligation peut-être non remplie**. Ce n'est pas une différence de
vocabulaire, et c'est ce que je n'avais pas vu en raisonnant.

**Ce qu'il voit après.** « Aucun service de prévention et de santé au travail
déclaré — Tout employeur doit en organiser un (L. 4622-1) : service autonome, ou
adhésion à un service interentreprises (D. 4622-1), en pratique la voie des
petites structures. Si vous y adhérez déjà, il reste à l'inscrire. »

**Trois moitiés, et la deuxième a été ajoutée après un second jugement de
lecteur.** Le fond était juste — un dirigeant qui n'a adhéré à rien comprenait
que c'était dû — mais **l'action restait implicite**. Le verbe affirmatif était
« organiser », celui du texte, et un employeur de six personnes n'organise pas
un service : il adhère. « Adhérer » ne vivait que dans la clause conditionnelle,
celle qui s'adresse à ceux qui l'ont déjà fait. Son destinataire réel pouvait y
lire « montez un service » — ce qui décourage là où il faut orienter.

Les deux branches ne viennent pas de `L. 4622-1`, qui tient en une ligne, mais
de `D. 4622-1` (autonome ou interentreprises) et `D. 4622-2` (le choix appartient
à l'employeur) — dépouillés au corpus par le lot 8. Ce n'était donc pas une
reformulation : la recommandation s'aligne sur ce que le référentiel avait déjà
établi en lisant les textes d'application.

**Gardé par un test ?** Oui, des trois côtés — ce qui est dû, les deux branches,
l'issue probable — et la contre-épreuve importe autant : faire basculer tous les
domaines sur la formulation « obligation due » accuserait un restaurateur de ne
pas avoir d'électricien.

**Et une garde de plus, sur le risque que cette correction a créé.** Une phrase
d'interface peut désormais citer un article ; la règle du dépôt — on ne cite pas
un texte que personne n'a lu — vaut pour elle comme pour une obligation, mais le
cliquet de `corpus.test.ts` ne garde que les obligations et n'aurait rien vu. Un
test vérifie que tout article cité dans ces phrases est dépouillé au corpus.
Éprouvé en citant `D. 4622-14`, qui règle l'adhésion elle-même et que personne
n'a ouvert.

## 9. Une notation de développeur dans le texte utilisateur

**Ce que voyait le dirigeant.** Sous « pourquoi chez vous » : « effectif sur
site 6 **dans la plage [— ; 49]** ». Notation d'intervalle, tiret cadratin
compris pour dire « pas de borne ».

**Ce qu'il voit après.** Trois formes selon les bornes déclarées : « jusqu'à 49
salariés », « à partir de 11 salariés », « de 11 à 49 salariés ». Une seule
tournure aurait forcé à nommer une borne absente.

**Gardé par un test ?** Oui, trois cas, dont une contre-épreuve : une
implémentation qui n'écrirait qu'une des deux bornes passerait les deux autres.

---

## Ce que je n'ai pas touché

**Les seize obligations d'état permanent que le produit n'affiche nulle part.**
Décision produit en cours d'arbitrage, exclue du lot.

**Le guide ne nomme pas les obligations qu'il compte.** Il leur donne désormais
une première surface — neuf domaines, avec rythme, réalisateur et « pourquoi
chez vous » — mais il écrit « Locaux sociaux — 3 obligations » sans dire
lesquelles. **Le trou n'est donc pas comblé** : les seize restent nommées au
seul endroit du menu déroulant de prescription. L'écran des états permanents est
écrit pour ça ; ce lot ne s'en occupe pas, et il ne faudrait pas lire la nouvelle
surface comme si c'était fait.

## Ce que ce lot suggère pour la suite

Les neuf défauts sont de la même famille, et elle a une signature
reconnaissable :
**une phrase juste au moment où elle a été écrite, laissée en place après que ce
qu'elle décrit a changé.** Trois ont été rendues fausses le jour même par des corrections justes — dont
deux par les miennes, le point 6 et le point 7.

Ce qui les a rendues invisibles est plus intéressant que les phrases elles-mêmes.
Une règle enfermée dans du JSX n'est appelable par aucun test : ce n'est pas
qu'on avait oublié de l'éprouver, c'est qu'on ne le pouvait pas. Les deux
extractions de ce lot — `libelleTotalAnnee` et `domainesPresents` — ne changent
rien à ce que voit l'utilisateur ; **elles rendent testable ce qui ne l'était
pas**, et c'est là qu'est la garantie.

Les trois autres gardes lisent du texte source. C'est un procédé modeste et
sans finesse, mais c'est exactement ce que fait `chiffres-publics.test.ts`
depuis qu'un chiffre faux est resté des semaines sur la page publique — et c'est
la seule chose qui attrape une phrase.

---

## 10. Une phrase juste que le rendu défaisait

Le seul défaut du lot qui ne soit pas une phrase périmée : **une phrase juste,
écrite le jour même, que la mise en page rendait fausse.**

**Ce que voyait le dirigeant.** Mesuré dans le DOM par le contrôle visuel : un
sous-titre de **213 signes**, demandant **1 115 px** pour **638 px** disponibles,
sous `white-space: nowrap` et `text-overflow: ellipsis`. **Tronqué à 57 %.** À
l'écran :

> Tout employeur doit en organiser un (L. 4622-1) : service autonome, ou adhésion à un service interentreprises (D. 46**…**

**Deux dégâts, et le second est de la famille que ce dépôt refuse le plus
fermement.** D'abord, tout ce que la correction du tour précédent avait ajouté
était dans la partie coupée — à commencer par « il reste à l'inscrire », la
clause qui empêche le message de reprocher quelque chose à quelqu'un qui a déjà
fait le nécessaire. Ensuite, la coupe tombait au milieu d'une référence :
`D. 46…` **n'est pas un article**, c'est une référence fabriquée par la mise en
page — sur un produit dont la règle est de ne jamais citer un texte que personne
n'a dépouillé.

**Ce qui a été sacrifié, et pourquoi celui-là.** Les références d'articles
sortent du sous-titre. La raison suffisante est la seconde ci-dessus ; s'y ajoute
que le fondement a déjà sa surface — l'obligation porte `L. 4622-1`, `D. 4622-1`
et `D. 4622-2` avec leurs URL et leurs versions constatées. Le tableau de bord
oriente, il ne plaide pas.

**Ce qu'il voit après**, en 138 signes : « Tout employeur doit en avoir un :
adhésion à un service interentreprises, ou service autonome. Si vous adhérez
déjà, il reste à l'inscrire. » L'action du destinataire passe en tête, ce qui
fait en dix-sept signes de moins le travail de « en pratique la voie des petites
structures ».

**Ce n'était pas ma phrase qui était trop longue, c'était la carte qui tronquait
en silence.** Le témoin le montre : le sous-titre de l'aération occupait
**exactement 638 px** — n'importe quel allongement d'un libellé existant l'aurait
coupé sans que rien ne le dise. La carte passe donc à deux lignes
(`line-clamp-2`), ce qui double la place et borne toujours la hauteur.

**Gardé par un test ?** Oui, et **il faut lire ce qu'il ne fait pas.** Il compte
des **caractères, pas des pixels** : rien ici ne rend la page, et « il » et
« MM » n'ont pas la même largeur. C'est un garde-fou par approximation, calibré
sur la mesure du contrôle visuel — 104 signes ≈ 638 px ≈ une ligne, donc deux
lignes ≈ 208, budget fixé à 170 pour la marge et pour la date que la carte
ajoute au sous-titre.

Ce qu'il attrape : une phrase qui double de longueur, la forme qu'a prise le
défaut. Ce qu'il laisserait passer : un dépassement de quelques signes en
typographie large. **Le dire plutôt que de le simuler** — une garde qui promet
une mesure qu'elle ne fait pas serait elle-même une phrase fausse.

Éprouvé en réinjectant la phrase de 213 signes.

**Une note de méthode.** Le cliquet posé au tour précédent — tout article cité
dans ces phrases doit être dépouillé — exigeait aussi qu'une phrase cite au moins
un article. Bonne intention, démentie par l'écran : c'est cette exigence qui
avait mis deux références dans une phrase qui n'avait la place d'aucune. Elle est
retirée ; la moitié qui compte reste, et elle est la bonne moitié.

### 10 bis. La correction n'était allée que dans le widget que personne ne voit

**Ce que voyait le dirigeant.** La même phrase, toujours coupée. `line-clamp-2`
avait été posé sur `CarteTache` (« Par où commencer ») ; `BlocAFaire` (« À
faire ») gardait son `truncate`. Or **sur un dossier neuf, c'est « À faire » qui
s'affiche** — « Par où commencer » doit être ajouté à la main depuis le tiroir.
La correction était dans le widget caché, le défaut dans celui qui se voit, et
le dossier neuf est précisément la population de ce lot. Mesuré : 138 signes,
719 px pour 638 disponibles.

**Le vrai défaut n'est pas l'oubli.** C'est le **troisième** en une journée à se
loger dans ces deux mêmes fonctions : la file amputée par `priorite <= 5` (les
deux, et il a fallu signaler le second), la clé React en double (les deux), la
troncature (un seul). Trois fois, c'est une donnée.

**Ce que j'ai fusionné, et ce que je n'ai pas fusionné.** Les deux mises en page
diffèrent légitimement — pastille numérotée et bouton « Ouvrir » d'un côté,
ligne cliquable et badge d'écart de l'autre. Ce n'est pas la duplication à
supprimer, et les fondre en un composant aurait produit un objet à paramètres
qui n'aurait servi ni l'un ni l'autre.

Ce qui n'a **aucune raison** de diverger, c'est la politique de troncature : ce
qu'on s'autorise à couper d'une phrase écrite pour être lue ne dépend pas du
widget. Un composant `MetaRecommandation` la tient, les deux l'appellent, et une
correction future y atterrit une seule fois.

**Gardé par un test ?** Oui, deux, et le second est le plus utile : le premier
vérifie qu'aucun `{meta}` n'est rendu dans un paragraphe écrit à la main — c'est
exactement ce qu'était le `truncate` oublié ; le second, que le composant clampe
bien à deux lignes.

### Et mon garde-fou de longueur était faux, pour une autre raison que celle que j'avais annoncée

J'avais écrit dans ce test qu'il comptait des caractères et non des pixels, et
que c'était son approximation. C'était honnête — **et ce n'était pas sa limite.**

Le seuil de 170 valait deux lignes, alors que **le widget réellement affiché
n'en avait qu'une**, donc ~104. Entre 104 et 170, l'écran refusait ce que le test
acceptait : une phrase de 138 signes est passée ici avant d'être coupée là-bas.

Une approximation déclarée reste une approximation ; un seuil calibré sur le
mauvais rendu est simplement faux. Ce qui rend le budget juste aujourd'hui n'est
pas le test de longueur lui-même mais celui qui garde que **les deux** widgets
clampent à deux lignes. Si l'un revenait à une ligne, le budget redeviendrait
faux pour lui seul — et c'est l'autre test qui le dirait.

**La phrase n'a pas été touchée.** Le défaut était dans le rendu ; la
raccourcir aurait armé le piège pour la suivante.
