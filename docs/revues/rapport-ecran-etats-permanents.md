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
