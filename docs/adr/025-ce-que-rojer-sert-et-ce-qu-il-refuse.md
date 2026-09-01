# ADR-025 — Ce que Rojer sert, et ce qu'il refuse

- **Statut : tranché en réunion d'équipe le 2026-09-01.** Ce document a été
  rédigé le 2026-08-31 comme un cadrage proposé, non acquis. Il est devenu la
  décision.
- **Portée** : le périmètre du produit, donc l'onboarding, le moteur de
  matching, le module de couverture, et le contenu du référentiel.
- **Remplace ou amende** : ADR-015 (navigation), ADR-019 (bâtiment), ADR-020
  (nommer plutôt que refuser), ADR-014-prescriptions (sources), ADR-013 (MCP,
  un seul établissement) ; **rend de nouveau effective** l'ADR-001 sur le
  multi-établissements. Chacune de ces décisions a son ADR propre, listée au
  § 9 : celle-ci porte le périmètre, les autres portent les mécanismes.

## Pourquoi ce document existe

Le référentiel est passé de 85 obligations à 116 en une journée, et de 10
domaines à 17. Tant qu'il ne servait que des équipements déclarés, son périmètre
se lisait dans ses catégories d'appareils. Depuis qu'il sert le **statut
d'employeur**, il n'a plus de bord visible : rien, dans le code, ne disait où le
produit s'arrête.

`docs/couverture-declaree-du-produit.md` dit ce que le produit **ne couvre pas**
dossier par dossier. Ce document dit ce qu'il **refuse de couvrir**, toutes
affaires cessantes.

---

## 1. Les régimes servis

**Servi** : Code du travail, ERP, habitation.

**Refusé à la création d'un dossier** : IGH, ICPE, gares, chapiteaux et tentes
(CTS), établissements pénitentiaires, équipements sportifs, ATEX, DRPCE, CEM,
CMR, amiante, plomb, radon, rayonnements ionisants.

**Refusé au niveau de l'équipement, sans refuser le dossier** : équipements sous
pression particuliers et équipements frigorifiques sous pression. Les ESP et les
installations frigorifiques **standards** restent servis — six obligations
`equipement-sous-pression.ts` et huit `froid.ts`. Le critère qui sépare les deux
n'est pas encodé aujourd'hui : il est à établir par lecture de l'arrêté du
20 novembre 2017 avant d'écrire la question qui le pose (lot B4 du plan de
recadrage).

### La différence entre refuser et déclarer, et pourquoi elle est nette

Un régime **refusé** ne crée pas de dossier : l'onboarding s'arrête et dit
pourquoi. Un régime **servi partiellement** crée le dossier et le prévient en
permanence, par le mécanisme de l'ADR-020, qui reste en vigueur pour tout ce qui
n'est pas refusé.

Le critère : on refuse ce que le produit ne sait pas servir **du tout** — un
règlement entier qu'il n'a jamais lu, une exposition qu'il ne sait pas détecter.
On déclare ce qu'il sert **incomplètement**, parce que le dirigeant y gagne quand
même quelque chose et qu'il est prévenu de ce qui manque.

### Deux frictions connues, non résolues par cette décision

- **Neuf obligations portent la typologie `igh`** alors que l'IGH est refusé.
  Leur retrait effectif est différé : le refus à l'entrée suffit
  fonctionnellement, et le retrait toucherait une vingtaine de fichiers pour un
  gain nul tant qu'aucun dossier IGH n'existe. Une seule est `igh`-only
  (`incendie.ts:790`) ; les sept lignes d'ascenseur sont multi-régime et
  survivraient au retrait du flag.
- **Le CMR est partiellement encodé.** `stockage-dangereux.ts` cite `R. 4412-87`.
  Refuser le régime CMR suppose de décider ce que devient cette ligne — à
  trancher après relecture de l'article en première main, pas avant.

**Ce point reste le plus discutable du document.** Refuser l'amiante et le plomb
retire au produit des obligations qu'une TPE du bâtiment rencontre. Le critère
qui les exclut — ce sont des expositions que le produit ne sait pas détecter —
est juste, mais il vaut aussi pour d'autres lignes qu'on garde.

---

## 2. Les catégories d'ERP : servies, mais inégalement, et cela se dit

**Décision du 2026-09-01** : les ERP de 1re à 4e catégorie **ne sont pas
refusés**. Ils sont servis partiellement et prévenus, exactement comme
aujourd'hui — `CATEGORIES_COUVERTES = ["N5"]` reste la déclaration honnête, et
le bandeau de couverture le dit à chaque dossier concerné.

Le premier cadrage envisageait de couvrir pleinement les catégories 1 à 4. Il a
été renversé le jour même, et le motif mérite d'être gravé parce qu'il gouverne
les arbitrages suivants :

> Tout ce recadrage **resserre** la surface du produit — un établissement par
> dossier, cinquante salariés au plus, cinq unités de DUERP, régimes spéciaux
> refusés. Couvrir les catégories 1 à 4 serait le seul point qui
> **augmenterait** la promesse, et il le ferait sur un règlement — le livre II
> de l'arrêté du 25 juin 1980, par type d'activité — dont **aucun chapitre
> type-spécifique n'a jamais été dépouillé**. Le défaut que cela produirait ne
> casserait aucun test : un dirigeant de 2e catégorie verrait un dossier
> d'apparence complète qui ne l'est pas. C'est la famille de défauts la plus
> coûteuse, et celle-là serait construite exprès.

La couverture pleine des catégories 1 à 4 est donc un **chantier postérieur**,
hors du recadrage. Quand il s'ouvrira, il commencera par revérifier en première
main `docs/registre-releve-types-erp.md` — relevé du 2026-08-26 qui couvre neuf
types sur dix-neuf et déclare lui-même n'avoir lu aucun article en première main
— puis dépouillera les dix types manquants et les deux arrêtés modificatifs de
2025 (29 juillet et 1er septembre), jamais ouverts.

**Ce qui reste dans le recadrage** : les obligations par type **au sein de la
5e catégorie** — chapitres PO (hôtels, type O) et PU (soins, type U) du livre
III, vingt articles aujourd'hui `non_couvert` dans
`corpus/arrete-1980-livre-3.ts`. Le mécanisme qui les portera —
`typologies.erp.types` — existe déjà et fonctionne ; il n'a qu'un seul usage
(`electricite.ts:469`).

---

## 3. Un établissement, une zone à trois subdivisions au plus

Un utilisateur peut tenir **plusieurs établissements** — c'était déjà la cible de
l'ADR-001, refermée en août par deux contraintes d'unicité. Chaque établissement
porte **un seul lieu**, subdivisable en **trois zones** au plus.

Le mot « bâtiment » quitte l'interface. Le modèle `Batiment` reste en base sous
ce nom — il porte déjà exactement ce qu'une zone doit porter : un nom, un
complément d'adresse, des équipements — mais l'utilisateur ne lit plus que
« zone ». Voir l'ADR-029, qui remplace l'ADR-019 en en gardant l'invariant : une
zone est un lieu, elle ne porte aucun régime.

**Cette règle est plus restrictive que le modèle : l'appliquer retire une
capacité.** Le plafond de trois vaut à la création ; les dossiers qui portent
déjà plus de trois bâtiments les gardent.

---

## 4. La catégorie d'ERP et la famille d'habitation sont obligatoires

Un dossier ne peut pas se créer sans que son régime soit précisé.

`Etablissement.categorieErp` reste **optionnel en base** — la contrainte vit dans
les schémas de création, pas dans la colonne, pour que les dossiers existants qui
ne l'ont pas continuent d'exister. Ils portent en revanche une indétermination
visible, qui demande de compléter.

**La famille d'habitation n'existait pas du tout.** `estHabitation` était un
booléen ; aucun champ ne portait la famille. Or **neuf obligations portent la
typologie habitation** : elles s'appliquaient sans qu'on sache à quelle famille.

C'est le point où le code était le plus en retard sur le cadrage, et le seul où
l'écart produisait déjà un risque : une obligation d'habitation servie sans
distinction de famille est probablement fausse pour certaines d'entre elles.
C'est pour cette raison que la famille est le **premier lot** du recadrage, et
que l'arrêté du 31 janvier 1986 — jamais ouvert — est le premier dépouillement.

---

## 5. Trois axes transversaux, et deux entrées qui n'en sont pas

L'application s'organise en trois axes : **santé-sécurité**, **équipement et
bâtiment**, **documentation**.

Le rail en portera **cinq entrées** : les trois axes, plus « À faire » et
« Paramètres ». L'écart à la lettre de la directive est assumé et il a une
raison : les trois axes sont **thématiques**, les deux autres sont
**fonctionnelles**. Le calendrier est l'écran le plus consulté du produit ;
l'enterrer dans un axe thématique le cacherait. Voir l'ADR-030, qui remplace
l'ADR-015.

---

## 6. Le DUERP est limité à cinq unités de travail

Cinq **hors** l'unité « Risques transverses », qui est créée systématiquement et
que l'écran masque déjà. Sans cette précision, les pré-remplissages sectoriels
restauration et bureau — cinq unités chacun — seraient refusés dès la première
étape.

C'est le point le plus simple à implémenter et le plus lourd de conséquences
commerciales : il fixe la taille d'entreprise que le produit accepte de servir.
Cinq postes n'est pas cinq salariés — une TPE de six personnes peut n'avoir que
deux postes, un commerce de trois peut en avoir quatre.

---

## 7. Deux questions à poser, qui n'existaient pas

**Les demandes spécifiques de l'assureur.** Un assureur impose des vérifications
que le droit n'impose pas — c'est fréquent en restauration et en commerce. Elles
entrent par le mécanisme des prescriptions particulières, sous une source
nouvelle, et portent un marquage qui les distingue du droit partout où elles
s'affichent. Voir l'ADR-032, qui amende l'ADR-014.

**Les EPI présents.** La question est posée et la réponse consignée. Ce qu'on en
fait dépend d'une lecture qui n'a jamais été faite : `R. 4323-95` à `-106` et
l'arrêté du 19 mars 1993 ne sont ouverts nulle part dans le dépôt. Si la
vérification périodique est fondée pour les EPI qu'une TPE porte — le harnais,
essentiellement —, une catégorie d'équipement la portera. Sinon la réponse reste
une consignation. **Lire avant d'encoder** : c'est un guide commercial, non une
source, qui a fait croire à une périodicité annuelle générale.

---

## 8. Deux interfaces qui disent ce qui manque

**Dans la documentation** : la liste des documents obligatoires, y compris ceux
que le produit ne produit pas.

**Dans la santé-sécurité** : ce qui est exclu du périmètre, avec des indications.
Cette page distingue **trois statuts**, et la distinction est le fond du sujet :
refusé à l'entrée / servi partiellement et prévenu (les ERP de 1re à 4e
catégorie) / hors périmètre déclaré.

C'est le point où le produit était le plus avancé : le bandeau de périmètre du
calendrier dit déjà ce qui n'est pas couvert sur quatre axes, et
`docs/couverture-declaree-du-produit.md` grave ces déclarations, sous la garde
d'un test qui échoue si le document et le corpus divergent.

---

## 9. Les ADR que cette décision déplace

| ADR | Ce qui lui arrive | Portée par |
|---|---|---|
| 001 — établissement | **Redevient effective** : le multi-site était sa cible, refermée en août | ADR-028 |
| 013 — MCP OAuth | Amendée : « la requête ne peut pas rendre deux résultats » tombe | ADR-028 |
| 014 — prescriptions | Amendée : une source contractuelle existe, à côté des actes d'autorité | ADR-032 |
| 015 — rail de navigation | **Remplacée** : cinq entrées deviennent trois axes + deux fonctionnelles | ADR-030 |
| 019 — bâtiment lieu | **Remplacée** : la zone prend la place du bâtiment, plafonnée à trois | ADR-029 |
| 020 — couverture déclarée | Amendée : on refuse à l'entrée les régimes exclus, on nomme tout le reste | ADR-031 |

Aucune n'est supprimée : leur motif d'origine reste utile, c'est leur statut qui
change. Chacune porte en tête un renvoi vers celle qui la remplace.

**À trancher par la propriétaire** : deux fichiers portent le numéro ADR-014
(`014-prescriptions-particulieres.md` et `014-provenance-navigation.md`). La
collision précède ce recadrage ; elle mérite une renumérotation.

---

## 10. Ce que ce document ne fait pas

Il ne modifie pas `.claude/CLAUDE.md`, qui appartient à sa propriétaire. Les
lignes que ce recadrage rend fausses lui sont signalées, sans être touchées :

| Ligne | Ce qui devient faux |
|---|---|
| 71-77 | La section Périmètre ignore la borne à cinquante salariés et le refus à l'entrée |
| 286-287 | « IGH, sites industriels… hors périmètre » et la bascule ICPE en couverture partielle : ces régimes sont désormais refusés à la création. La bascule reste vraie pour les ERP de 1re à 4e catégorie |
| 298 | « Registres non couverts : … EPI » — à requalifier selon l'issue du dépouillement (le registre reste non couvert dans tous les cas) |
| 318 | « régimes cumulables travail / ERP / **IGH** / habitation » — l'IGH est refusé, et la famille entre dans le régime habitation |
| 341, 385-405 | Toute la section Navigation décrit les cinq entrées de l'ADR-015 |
| 355 | ADR-025 y figure comme « proposé, non tranché » |
| 37, 423 | Le DUERP y est décrit sans son plafond de cinq unités |
