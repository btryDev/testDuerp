# Contrôle visuel — « Ce qui doit être en place »

Branche `integration/2026-08-31` (`2ef6ad3`), le 31 août 2026, sur **deux
dossiers** :

- **Atelier Vermeil** — bureau, 6 personnes, aucun équipement, un salarié à titre
  daté. Base de référence gelée depuis le contrôle précédent.
- **Le Bistrot du Marché** — 2 bâtiments, 9 équipements, 28 vérifications.
  Restauré dans une **seconde base** (`duerp_bistrot`), à côté de la première,
  jamais à sa place.

*Note de mise en route : le dump utilisé est celui du matin (`6169ba50…`) et non
celui préparé ce soir (`bad69680…`). Les données sont identiques — les six
chiffres attendus tombent au chiffre près — seul le schéma était en retard de
quatre migrations additives, appliquées après restauration. Le dump de ce soir
est disponible et n'a pas été restauré : refaire l'opération aurait ajouté du
risque sans rien apprendre.*

---

## Les deux vérifications demandées

### 1. Le portail : au calendrier, et pas ici — **conforme**

Le Bistrot porte trois obligations « portes et portails » qui sont des
`Verification` datées :

```
Examen de sécurité à la mise en service (porte automatique)      mise_en_service_uniquement
Sécurité positive et détection d'obstacle (portail motorisé)     mise_en_service_uniquement
Vérification semestrielle du bon fonctionnement (porte auto.)    semestrielle
```

**Les trois sont au calendrier** — vérifié à l'écran, elles y figurent nommément.
**Aucune n'est sur le nouvel écran** — recherche sur le texte rendu : « mise en
service », « Sécurité positive », « détection d'obstacle », « Examen de
sécurité », « semestrielle » sont tous absents.

L'écran affiche bien une section **PORTES ET PORTAILS**, mais avec deux *autres*
obligations, qui sont des états : « Maintien en état et réparation sans délai »
et « Tenue du dossier de maintenance ». La frontière est au bon endroit : ce qui
porte une date reste au calendrier, ce qui n'en porte pas vient ici. **Pas de
double surface.**

### 2. Le compteur d'en-tête : il n'absorbe pas la ligne datée — **conforme**

| Dossier | Lignes « Déclarer en place » | Lignes « Marquer comme fait » | Compteur annoncé |
|---|---|---|---|
| Atelier Vermeil | 12 | 1 | **0 sur 12** |
| Le Bistrot du Marché | 19 | 1 | **0 sur 19** |

Sur les deux dossiers, le compteur exclut la ligne au second verbe. La règle
tient hors du cas qui l'a produite.

---

## La question : est-ce que la distinction se lit dans l'écran ?

**Non. Elle est écrite, elle n'est pas montrée.**

Sur la carte « FORMATION À LA SÉCURITÉ », deux lignes se suivent :

| Ligne | Bouton |
|---|---|
| Formation à la manutention manuelle (gestes et postures) | `Déclarer en place` |
| Organiser la formation à la sécurité des salariés | `Marquer comme fait` |

Les deux pastilles sont **strictement identiques** : même fond bleu pâle, même
rayon, même graisse, même taille, même position en bout de ligne. Rien d'autre ne
sépare les deux lignes — pas d'icône, pas de teinte, pas de regroupement, aucune
mention sur la ligne elle-même. **La seule différence est dans les trois mots du
bouton**, et il faut les lire avant de cliquer pour la voir.

Or l'écran est conçu pour qu'on clique vite, et il le dit : « Passez-les en
revue », « Une bonne partie est sans doute déjà vraie chez vous ». J'ai coché les
douze en **sept secondes** sans lire une seule ligne. Dans ce geste-là, deux
pastilles qui se ressemblent sont la même action.

L'explication existe — dernier paragraphe du pied de page, sous les treize
cartes : « Une ligne se date (« fait le ») plutôt que de se déclarer en place ».
Elle est juste, elle est bien écrite, et elle est à l'endroit où l'on arrive
**après** avoir tout coché.

**Mon jugement, avec la formule qu'on s'est donnée** : en l'état, cette
distinction est une note interne. Elle vit dans le code, dans le brief, dans le
libellé d'un bouton et dans un paragraphe de bas de page — nulle part dans ce que
l'œil parcourt. Sur ce dossier il n'y a qu'une ligne concernée sur treize ; un
dirigeant passera dessus sans la remarquer.

Ce n'est pas un défaut de correction — la règle est juste et le compteur le
prouve. C'est un choix de rendu à reprendre si la distinction compte.

---

## Le contre-test : peut-on tout cocher sans rien avoir fait ?

**Oui. Douze cases en sept secondes**, sans une seule friction : pas de
confirmation, pas de date à saisir, pas de question. Le compteur passe de
« 0 sur 12 » à « 12 sur 12 ».

**Mais rien ne bouge ailleurs, et c'est la bonne réponse.**

| Indicateur | Avant | Après 12 déclarations |
|---|---|---|
| « Préparer un contrôle » — % prêt | **67 %** | **67 %** |
| Pièces « À jour » | 3 | 3 |

C'est ce que je redoutais le plus et qui n'arrive pas : **déclarer douze états ne
fait pas monter l'indicateur qu'on ouvre devant un inspecteur.** Le produit ne
récompense pas une déclaration non vérifiée. Le pied de page le dit d'ailleurs
sans détour, et c'est le meilleur paragraphe de l'écran :

> « Ce que vous cochez ici est une déclaration, et elle est enregistrée comme
> telle : Rojer note que vous avez déclaré, et à quelle date. Ce n'est pas une
> vérification, ce n'est pas une pièce justificative, **et cela ne rend aucun
> dossier conforme**. »

Et : « Une ligne non cochée n'est pas un manquement constaté : c'est une question
à laquelle vous n'avez pas encore répondu. » L'écran ne culpabilise pas — la
demande était explicite, elle est tenue.

---

## Ce qui m'a paru faux

### a. Le tableau de bord contredit l'écran sur la même obligation ★

J'ai déclaré « Service de prévention et de santé au travail — adhésion ou service
autonome » **en place** sur le nouvel écran. Le tableau de bord, rechargé,
affiche toujours :

> **Aucun service de prévention et de santé au travail déclaré**
> *Tout employeur doit en avoir un…*

**Deux écrans, deux vérités, un même mot.** L'un dit « déclaré en place le
31/08/2026 », l'autre dit « aucun … déclaré ». Les deux se défendent séparément —
la recommandation parle de l'annuaire des prestataires, la case parle de l'état —
mais **elles emploient le même verbe pour dire l'inverse**, et le dirigeant qui
vient de cocher lit sur son écran d'accueil qu'il n'a rien déclaré.

C'est la double surface que ce lot cherchait à retirer, revenue par l'écran conçu
pour la corriger. La bonne nouvelle : elle est de rédaction, pas de structure.

### b. Deux fautes dans le texte, dont une d'assemblage

**Le chapô, première phrase que lit un dirigeant** (`page.tsx:92`) :

> « Passez-les en revue : ce qui restera **décochera** ce qu'il vous reste à faire. »

La phrase ne se tient pas. L'intention est « ce qui restera **décoché dira** ce
qu'il vous reste à faire ».

**Le pied de page** (`page.tsx:205`) :

> « Elle **n'entrepas** dans le compte ci-dessus »

Ce n'est pas une coquille de rédaction mais **une soudure JSX** :

```jsx
{faitsDates === 1 ? "Elle n'entre" : "Elles n'entrent"} pas
```

L'expression se termine par « n'entre », le mot « pas » commence à la ligne
suivante, et JSX mange l'espace. C'est la même famille que les règles qui
vivaient dans du JSX où rien ne pouvait les appeler : **le texte assemblé n'est
relu par personne, ni humain ni test.** Il faudrait `{" pas"}` ou déplacer
l'espace dans les deux branches.

### Et ce qui m'a paru juste

- **La frontière avec le calendrier est nette** et tient sur les deux dossiers.
- **Le compteur ne triche pas** — ni en absorbant la ligne datée, ni en faisant
  monter le « % prêt ».
- **Le pied de page est le meilleur texte du produit** sur ce que vaut une
  déclaration. Il dit ce que la page ne fait pas avant qu'on le demande.
- **« Le texte attend un écrit : registre de sécurité »**, en note sous certaines
  lignes, distingue une obligation qui se satisfait d'un fait d'une obligation
  qui exige un document. C'est une distinction utile, et celle-là **se voit**.
- **Console propre** sur les deux dossiers, aucun écran cassé.

## Ce que je n'ai pas jugé

- **Si un dirigeant cochera** : je ne peux pas l'observer. J'ai mesuré ce qui s'en
  approche — le coût du premier geste, qui est nul.
- **Si une ligne est cochable à tort de bonne foi** : « Emplacement pour se
  restaurer » peut être coché en pensant à une machine à café. L'écran ne donne
  aucune aide sur ce que la ligne recouvre. C'est du terrain, pas de la revue.

## État laissé

Les douze déclarations du contre-test sont **conservées** sur Atelier Vermeil
(« 12 sur 12 ») : elles montrent l'écran dans son second état. Dites-le si vous
voulez la base revenue à zéro déclaration, c'est une suppression de lignes dans
la table neuve, sans effet sur le reste.


---

# Seconde passe — la section séparée, jugée sur deux dossiers

## Les deux corrections mineures : conformes

**Les fautes de texte sont réparées.** Le chapô dit « ce qui restera **décoché
dira** ce qu'il vous reste à faire ». Le collage `n'entrepas` a disparu — et la
locution ne se coupe plus, ce qui est le vrai correctif : une phrase qui
n'existe nulle part en entier n'est relue par personne.

**Le tableau de bord ne partage plus le verbe.** Il dit maintenant « Aucun
service de prévention et de santé au travail **à votre annuaire** ». Les deux
constats coexistent sans se contredire : la case dit « déclaré en place le
31/08/2026 » — un état —, la recommandation dit qu'il manque à l'annuaire — une
saisie. Objets différents, verbes différents. Vérifié avec ma déclaration en
place : plus aucune contradiction lisible.

**Et le pied de page n'a rien perdu.** Sa meilleure phrase est conditionnelle et
je l'avais crue disparue : elle ne s'affichait pas sur Atelier Vermeil parce que
les douze lignes y étaient cochées. Sur le Bistrot, à « 0 sur 19 », elle est bien
là : « **19 lignes restent à passer en revue. Une ligne non cochée n'est pas un
manquement constaté : c'est une question à laquelle vous n'avez pas encore
répondu.** » Ce qui est parti du pied, c'est le paragraphe sur le second verbe —
et il est parti à l'endroit où il sert, contre la ligne qu'il explique.

## La section « Ce qui revient, sans rythme écrit » — mon avis

**Elle éclaire plus qu'elle n'alourdit. Je la garderais.** Mais pas telle quelle,
et la raison n'est pas celle qu'on attendait.

**Ce qui marche.** L'explication est adossée à la ligne : on ne peut plus
atteindre le bouton sans avoir le paragraphe au-dessus des yeux. Et la ligne n'a
plus de voisine « Déclarer en place » à côté d'elle — les deux verbes ne se
touchent plus, ce qui était le défaut d'origine.

**Ce qui ne marche pas encore.** Le sur-titre de la section est composé
**exactement comme un titre de domaine** : mêmes petites capitales, même graisse,
même gris, même position en tête de carte que `PREMIERS SECOURS` ou `SANTÉ AU
TRAVAIL`. À l'œil qui parcourt, `CE QUI REVIENT, SANS RYTHME ÉCRIT` occupe la
place où l'on attend un nom de domaine — et se lit donc comme **un dixième
domaine**, pas comme une autre nature de chose. Les mots diffèrent, la forme
non. Pour une distinction qui doit se voir sans se lire, c'est là qu'elle
échoue encore.

**Ce qui la rend visible aujourd'hui est une anomalie, pas un dessin.** Trois
lignes d'explication pour une ligne d'obligation : le rapport est inversé, et
c'est cette bizarrerie qui accroche l'œil. Sur un dossier à quatre lignes de ce
type le rapport se normalisera et la section se lira bien ; ici, elle se lit
comme une note de bas de page promue en carte. Le signal vient du déséquilibre,
et le déséquilibre disparaîtra.

**Et elle ne sauve pas l'utilisateur de sept secondes.** Celui qui déroule en
cliquant les pastilles cliquera « Marquer comme fait » aussi vite que les autres.
La section aide celui qui s'arrête. Mais la version précédente n'aidait personne :
c'est un progrès réel, pas un progrès complet.

**Ma recommandation, plus petite que le repli proposé** : garder la section, et
donner à son sur-titre une forme qui ne soit pas celle d'un domaine. Retirer la
section ferait perdre l'adossement de l'explication à la ligne, qui est ce que
cette passe a gagné de plus solide.

Capture : `captures-etats-permanents/91-section.png`.


---

# Troisième passe — `2e64fea`, dernier regard avant merge

Deux dossiers, le 1er septembre 2026. Les cinq migrations appliquées sur les deux
bases.

## 1. La section, avec son nouveau titre — **elle se lit enfin comme autre chose**

Mesuré dans le DOM, les deux en-têtes côte à côte :

| | Balise | Taille | Graisse | Casse | Couleur |
|---|---|---|---|---|---|
| Domaine (`SANTÉ AU TRAVAIL`) | `h2` | **10,5 px** | 500 | majuscules | gris `#5C7182` |
| Section (`Ce qui revient…`) | `h2` | **22 px** | 600 | normale | noir `#0A0A0A` |

Deux fois plus grand, noir contre gris, casse normale contre capitales. Dans le
défilement, c'est le **seul grand titre noir** de la page : il ne se confond plus
avec un nom de domaine, et la différence se voit sans se lire. Mon reproche
précédent est levé.

**Jugée à cinq lignes, comme je l'avais exigé** : elle tient mieux qu'à une. Un
titre reste un titre quel que soit ce qu'il coiffe, alors qu'une teinte ou une
icône se seraient diluées en se répétant cinq fois. Et le rapport
explication/contenu, aujourd'hui inversé — trois lignes pour une —, se
normalisera au lieu de se dégrader. **La forme retenue est celle qui vieillit le
mieux**, ce qui n'était vrai d'aucune des autres.

Capture : `captures-etats-permanents/A1-titre.png`.

## 2. La ligne quinquennale — **le chemin est praticable, et mieux que décrit**

**D'abord une correction de prémisse : elle n'apparaît que sur un dossier, pas
deux.** Atelier Vermeil est un bureau (NAF 70.22Z) sans aucun équipement : il n'a
pas d'alarme, donc pas de ligne. Vérifié à l'écran — ni « commission de
sécurité », ni « quinquennale », ni « PE 37 ». **Un faux positif sur un, pas deux
sur deux.**

Sur le Bistrot, elle apparaît :

> « Visite périodique de la commission de sécurité (**ERP 5ᵉ avec locaux à sommeil
> ou installations spécifiques**) — Bâtiment principal · Alarme type 4 · tous les
> 5 ans »

**Le libellé porte lui-même sa condition** — « avec locaux à sommeil » est dans le
titre de la ligne. C'est déjà la moitié du chemin : un restaurateur lit la
condition avant d'ouvrir quoi que ce soit.

**Le chemin, mesuré de bout en bout :**

1. **La fiche de la vérification explique la règle**, sans jargon et sans se
   dérober : « En 5ᵉ catégorie, la périodicité dépend de la présence de locaux à
   sommeil : les établissements qui en comportent pour le public sont visités
   tous les cinq ans (PE 37) … ceux qui n'en comportent pas ne relèvent d'aucune
   périodicité écrite. »
2. Un bouton **« Modifier l'équipement »** y mène.
3. La question est sur la fiche de l'alarme, et **son texte d'aide nomme le cas
   exact** :

> **Votre établissement dispose-t-il de locaux où des personnes dorment ?**
> *Chambres d'hôtel, hébergement, internat, dortoir, logement de fonction ouvert
> au public. **Un restaurant, un commerce ou un bureau sans hébergement :
> répondez « non ».** En 5ᵉ catégorie, c'est ce qui déclenche la visite
> périodique de la commission de sécurité.*

Trois choix : « Je ne sais pas encore » (valeur par défaut), « Oui », « Non ».

4. **Répondre « non » et enregistrer : 4 secondes.** La ligne disparaît du
   calendrier, et la valeur est bien conservée — vérifiée en base
   (`dessertLocauxSommeil: false`) **et** re-affichée « Non » au rechargement de
   la fiche.

**Mon avis : oui, un dirigeant peut faire ce clic.** Le texte d'aide fait le
travail décisif — il ne se contente pas de définir « locaux à sommeil », il dit à
un restaurateur ce qu'il doit répondre. C'est rare et c'est bien vu. L'argument
du faux positif visible tient : l'erreur se voit, elle s'explique, elle se corrige
en quatre secondes.

**Une réserve, qui ne remet pas l'arbitrage en cause** : rien ne relie le geste à
son effet. Après enregistrement, l'écran ne dit pas qu'une échéance vient d'être
retirée du calendrier — le dirigeant doit y retourner pour le constater. Sur une
question dont l'unique fonction est de faire disparaître une obligation
réglementaire, un mot suffirait.

Captures : `A2-fiche-verif.png`, `A3-equipement.png`.

*État rendu : j'ai répondu « non » pour éprouver le chemin, puis **remis
l'attribut à son état non renseigné** — le Bistrot porte de nouveau la ligne, tel
que la session principale l'a laissé.*

## 3. La tenancy — **conforme**

Le dossier bureau ne propose que ce qui le concerne : aucune mention d'ascenseur
sur l'écran des états permanents, 12 lignes inchangées.

## Ce qui m'a paru faux

### a. « Voir les 1 mois précédents » ★

Sur **les deux dossiers**, le calendrier affiche en tête de liste :

> **Voir les 1 mois précédents**

Source : `AnneeCalendrier.tsx:320` — `` `Voir les ${nbCartesPassees} mois précédents` ``.
Aucun singulier. À un mois, la phrase devrait être « Voir le mois précédent ».

C'est **exactement la famille que la garde de ce lot vient de couvrir** — une
phrase qui s'accorde en nombre, écrite en interpolation — mais dans un autre
fichier, que la garde ne regarde pas. La leçon vaut d'être notée : une garde
posée sur l'écran où le défaut est apparu ne protège pas les écrans où il
existait déjà.

Cette formulation n'apparaît qu'à partir du 1er septembre : au 31 août, aucun
mois n'était encore passé. Elle était donc invisible hier, et l'est devenue par
le seul passage du temps.

### b. Une alerte que j'ai failli écrire, et qui n'existait pas

Juste après avoir enregistré la réponse « non », j'ai lu le formulaire et vu le
select revenu sur « Je ne sais pas encore ». J'ai cru tenir un défaut de
persistance — le pire possible sur une question qui retire une obligation.

**C'était une lecture d'un DOM périmé**, pris avant que la page ne se re-rende
depuis le serveur. Sur un chargement neuf, la fiche affiche « Non ». La base et
l'écran sont d'accord.

Je le consigne parce que c'est le symétrique de tout ce que ce rapport reproche
au produit : j'ai failli affirmer une divergence entre deux surfaces en n'en
ayant regardé qu'une, et au mauvais moment. La vérification qui l'a écartée est
la même que celle que je demande au code — relire après que l'état a bougé.
