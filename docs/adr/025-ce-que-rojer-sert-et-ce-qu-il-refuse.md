# ADR-025 — Ce que Rojer sert, et ce qu'il refuse

**Statut : proposé, non tranché.** Ce document met par écrit un cadrage produit
énoncé le 2026-08-31. Il n'est pas une décision acquise : plusieurs de ses points
contredisent des ADR en vigueur, et l'écart entre ce qu'il pose et ce que le code
fait aujourd'hui est mesuré ci-dessous, point par point.

Il est écrit pour être **discuté**, y compris avec un préventeur. C'est sa
fonction : un cadrage qu'on peut contredire vaut mieux qu'un périmètre implicite
qu'on découvre en s'y cognant.

## Pourquoi maintenant

Le référentiel est passé de 85 obligations à 116 en une journée, et de 10 domaines
à 17. Tant qu'il ne servait que des équipements déclarés, son périmètre se lisait
dans ses catégories d'appareils. Depuis qu'il sert le **statut d'employeur**, il
n'a plus de bord visible : rien, dans le code, ne dit où le produit s'arrête.

`docs/couverture-declaree-du-produit.md` dit ce que le produit **ne couvre pas**
dossier par dossier. Ce document dit ce qu'il **refuse de couvrir**, toutes
affaires cessantes.

---

## 1. Les régimes servis

**Servi** : Code du travail, ERP, habitation.

**Refusé** : IGH, ICPE, gares, chapiteaux et tentes (CTS), établissements
pénitentiaires, équipements sous pression particuliers, équipements frigorifiques
sous pression, ATEX, DRPCE, CEM, CMR, amiante, plomb, radon, rayonnements
ionisants, équipements sportifs.

### Écart mesuré

`.claude/CLAUDE.md` déclare déjà hors périmètre : IGH, ICPE, ATEX, rayonnements
ionisants, équipements sportifs, piscines. **Ne sont pas déclarés** : gares, CTS,
établissements pénitentiaires, CEM, DRPCE, amiante, plomb, radon.

Deux frictions réelles :

- **Neuf obligations portent la typologie `igh`** alors que l'IGH est refusé. Le
  produit le dit à l'utilisateur — un bandeau de périmètre s'affiche sur un
  établissement déclaré IGH, vérifié à l'écran le 2026-08-31 — mais le référentiel
  garde les lignes. À trancher : les retirer, ou assumer qu'elles servent à
  qualifier le refus.
- **Le CMR est partiellement encodé.** `stockage-dangereux.ts` cite `R. 4412-87`
  (agents CMR), et le suivi individuel renforcé nomme les CMR parmi les sept
  expositions qu'il ne sait pas identifier. Refuser le CMR suppose de décider ce
  que devient cette ligne.

**Ce point est le plus discutable du document.** Refuser l'amiante et le plomb
retire au produit des obligations qu'une TPE du bâtiment rencontre. Le critère qui
les exclut — ce sont des expositions que le produit ne sait pas détecter — est
juste, mais il vaut aussi pour d'autres lignes qu'on garde.

---

## 2. Un bâtiment par SIRET, jusqu'à trois zones

Un établissement porte **un seul bâtiment**, subdivisable en **trois zones** au
plus.

### Écart mesuré

Le modèle permet aujourd'hui **N bâtiments** par établissement, sans limite, et il
n'a pas de notion de zone. Le jeu de démonstration en porte deux depuis le
2026-08-31.

**Cette règle est plus restrictive que le modèle : l'appliquer retire une
capacité.** Ce n'est pas un simple réglage.

Elle interroge aussi l'**ADR-019**, qui pose que le bâtiment est un lieu et ne
porte aucun régime. Un « bâtiment unique avec trois zones » est un autre objet
qu'« un bâtiment parmi N » : si la zone porte des équipements, elle devient le lieu
que l'ADR-019 confie au bâtiment ; si elle n'en porte pas, elle est décorative.

**À trancher avant d'écrire une ligne de code** : qu'est-ce qu'une zone porte ?

---

## 3. La catégorie d'ERP ou la famille d'habitation est obligatoire

Un dossier ne peut pas exister sans que son régime soit précisé.

### Écart mesuré

`Etablissement.categorieErp` est **optionnel** en base (`CategorieErp?`). La rendre
obligatoire demande une migration et une reprise de l'onboarding — plus une
décision sur les dossiers existants qui ne l'ont pas.

**La famille d'habitation n'existe pas du tout.** `estHabitation` est un booléen ;
aucun champ ne porte la famille. Or **neuf obligations portent déjà la typologie
habitation** : elles s'appliquent aujourd'hui sans qu'on sache à quelle famille.

C'est le point où le code est le plus en retard sur le cadrage, et le seul où
l'écart produit déjà un risque : une obligation d'habitation servie sans
distinction de famille est probablement fausse pour certaines d'entre elles.

---

## 4. Trois axes transversaux

L'application s'organise en trois axes : **santé-sécurité**, **équipement et
bâtiment**, **documentation**.

### Écart mesuré

La navigation actuelle porte **cinq entrées de rail** — À faire, Opérations, Mon
établissement, Mes registres, Paramètres — posées par l'**ADR-015**, qui écrit
qu'une entrée de rail désigne une page et non une approximation.

Passer à trois axes est une **refonte de la navigation**, pas un regroupement de
menus. Elle demande de rouvrir l'ADR-015 et de dire ce que devient chacune des
cinq entrées.

**Une question que ce document ne tranche pas** : les trois axes sont-ils une
navigation, ou une grille de lecture ? Un dirigeant qui cherche son registre de
sécurité le cherche-t-il sous « documentation » ou sous « santé-sécurité » ? Les
deux réponses sont défendables et elles produisent deux produits différents.

---

## 5. Le DUERP est limité à cinq postes de travail

### Écart mesuré

Aucune limite n'existe aujourd'hui.

C'est le point le plus simple à implémenter et le plus lourd de conséquences
commerciales : il fixe la taille d'entreprise que le produit accepte de servir.
Cinq postes n'est pas cinq salariés — une TPE de six personnes peut n'avoir que
deux postes, un commerce de trois peut en avoir quatre.

**À vérifier avant de le poser** : combien de postes portent les dossiers réels ?
La limite doit sortir d'une mesure, pas d'une intuition.

---

## 6. Deux questions à poser, qui n'existent pas

**Les demandes spécifiques de l'assureur.** Un assureur impose des vérifications
que le droit n'impose pas — c'est fréquent en restauration et en commerce. Le
produit n'a aucun endroit pour les recevoir, et le référentiel refuse par
construction les référentiels privés comme sources opposables.

La question posée à l'onboarding permettrait de **nommer** ces demandes sans les
confondre avec du droit. C'est la même distinction que l'ADR-024 pose pour les
transmissions : nommer sans dériver.

**Les EPI présents.** Les EPI sont aujourd'hui **hors périmètre déclaré**. Poser la
question sans encoder l'obligation est cohérent — l'outil saurait ce qu'il ne
couvre pas — mais il faut décider ce qu'il en fait, sous peine de collecter une
donnée qui ne sert à rien.

---

## 7. Deux interfaces qui disent ce qui manque

**Dans la documentation** : la liste des documents obligatoires, y compris ceux que
le produit ne produit pas.

**Dans la santé-sécurité** : ce qui est exclu du périmètre, avec des indications.

### Écart mesuré

C'est le point où le produit est **le plus avancé**. Le bandeau de périmètre du
calendrier dit déjà ce qui n'est pas couvert sur quatre axes, et
`docs/couverture-declaree-du-produit.md` grave ces déclarations. L'ADR-020 en pose
le mécanisme.

Ce qui manque est l'écran documentation, et l'extension du bandeau aux régimes
refusés par le présent document.

---

## Ce que ce document ne fait pas

Il ne modifie aucun code. Il ne modifie pas `.claude/CLAUDE.md`, qui appartient à
sa propriétaire et dont la liste hors périmètre reste la référence tant que ce
cadrage n'est pas tranché.

Il ne classe pas les sept points par priorité : trois touchent le modèle
(bâtiment, catégorie, famille d'habitation), un touche la navigation, un touche le
périmètre réglementaire, deux ajoutent des questions. Ce ne sont pas des travaux de
même nature, et les mêmes arbitrages ne les gouvernent pas.

## Ce qui reste à trancher, en une ligne chacun

| # | Question |
|---|---|
| 1 | Que deviennent les neuf obligations IGH, et la ligne CMR ? |
| 2 | Qu'est-ce qu'une zone porte, et l'ADR-019 tient-il ? |
| 3 | La famille d'habitation : quel champ, et que faire des dossiers sans catégorie ? |
| 4 | Les trois axes sont-ils une navigation ou une grille de lecture ? |
| 5 | Cinq postes : mesuré sur quoi ? |
| 6 | La demande d'assureur : nommée seulement, ou suivie ? |
| 7 | L'écran documentation : que liste-t-il exactement ? |
