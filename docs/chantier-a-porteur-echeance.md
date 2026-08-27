# Chantier A — le porteur d'échéance

**Objectif** : permettre qu'une obligation naisse d'autre chose qu'un équipement déclaré, et
qu'une échéance soit portée par un salarié ou par l'établissement.

Rédigé le 2026-08-27 par la session qui a instruit le sujet. **Ce document n'est pas un ordre
de mission : la section « Ce que vous devriez contester » compte autant que les autres.**

---

## Pourquoi ce chantier existe

`Obligation.categoriesEquipement` est obligatoire et non vide
(`src/lib/referentiels/conformite/types.ts`). Conséquence : toute obligation dont le
déclencheur n'est pas un équipement est soit absente, soit accrochée à un équipement
arbitraire — et elle disparaît alors **en silence** pour l'établissement qui n'a pas déclaré
cet équipement.

Ce n'est pas une hypothèse. Six articles en vigueur portent ce motif, dont deux qui visent la
totalité de la base :

| Article | Ce qu'il impose | Pourquoi il ne rentre pas |
|---|---|---|
| `R. 4222-20` | « L'employeur maintient **l'ensemble des installations mentionnées au présent chapitre** en bon état de fonctionnement et en assure régulièrement le contrôle » | Découpé en 3 fragments (`VMC`, `CTA`, `STOCKAGE_MATIERE_DANGEREUSE`). Vise **tout employeur** |
| `PE 4 § 2` | entretien et vérification triennaux de l'ensemble des installations techniques | Découpé en 3 fragments par domaine. Via `PE 2 § 3`, vise **100 % de la base** |
| `PO 1 § 3` | contrôle biennal, hors élec et SDI annuels | Ensemble moins des retraits nommés |
| `PE 4 § 1` | contrat annuel du SDI | Condition « locaux à sommeil », attribut inexistant |
| `PE 27 § 5` | instruction du personnel | Porteur salarié |
| `R. 4544-11-1` | attestation médicale quinquennale conditionnant l'habilitation au voisinage — **en vigueur depuis le 01/10/2025** | Porteur salarié **et** donnée médicale |

Trois faux négatifs sont documentés dans le référentiel lui-même, à
`src/lib/referentiels/conformite/incendie.ts`, sous « LIMITE CONNUE, NON CORRIGÉE ICI ».

L'inventaire complet — 62 obligations hors équipement — est dans
`docs/carto-obligations-hors-equipement.md`.

---

## Ce qui est tranché

Chaque décision est donnée **avec sa raison**, pour que vous puissiez juger si elle tient.
Rouvrez-en une si vous avez un argument, pas par principe.

### Le porteur salarié est nominatif

`R. 4544-10` fait délivrer le titre d'habilitation **à un travailleur désigné**. Idem pour une
attestation SST, un CACES, une autorisation de conduite. Un porteur « poste » produit un
compteur — « 2 caristes à habiliter » — et ne permet jamais de prouver quoi que ce soit en
contrôle.

Base légale du traitement : **obligation légale de l'employeur** (RGPD 6.1.c), jamais le
consentement, qui n'est pas libre en situation de subordination.

**Frontière sur la santé.** Contrainte légale : aucun élément de diagnostic ne parvient à
l'employeur, le dossier médical appartient au service de prévention. Choix produit assumé,
plus strict que le texte : on ne stocke que l'existence de la pièce, sa date et son échéance —
`R. 4544-11-1` autorise pourtant l'employeur à en conserver copie. La raison de ce choix est
dans `CLAUDE.md`, section « Registre des obligations ».

### L'incertitude ne réduit jamais la couverture

`null` ne vaut pas « non ». Une obligation conditionnée à un attribut d'établissement non
renseigné s'affiche « à confirmer » ; un allègement de régime conditionné à l'absence de cet
attribut ne s'applique pas tant que l'absence n'est pas déclarée.

C'est **l'inverse** de `equipement_propriete_booleenne`, où l'absence rend la condition non
satisfaite. Le contraste est volontaire : une propriété d'équipement absente dit « cet
équipement n'a pas cette caractéristique », une propriété d'établissement absente dit « on ne
sait pas encore ».

### Une obligation portée par l'établissement produit UNE ligne, pas N

Argument décisif : `PE 2 § 3` maintient `PE 4` pour les ERP de 5ᵉ catégorie sans locaux à
sommeil recevant au plus 19 personnes — donc pour les établissements qui ont le **moins**
déclaré. Une décomposition par installation produirait **zéro ligne** chez eux : on corrigerait
le faux négatif d'un côté en le réintroduisant de l'autre, sur l'obligation la plus universelle
du lot.

`PO 1 § 3` confirme par la forme : « l'ensemble des installations techniques […] **à
l'exception** des installations électriques et des systèmes de détection incendie ». Un tout
avec des retraits nommés, pas une énumération.

Les équipements déclarés s'affichent **en contexte**, avec la mention explicite que la liste
n'est pas limitative — le texte dit « etc. », le produit ne doit pas prétendre le contraire.

### Locaux à sommeil : attribut déclaré, pas dérivé

`PE 4 § 1`, `PE 28`, `PE 32`, `PE 37` s'y adossent, et `PE 2 § 3` en fait le critère du régime
allégé. La dérivation depuis `typeErp` est incomplète des deux côtés (un type N peut comporter
des chambres, un R sans internat n'en a pas) et `typeErp` est nullable (ADR-004). Une
dérivation muette rendrait « non » par défaut : le faux négatif exact qu'on supprime.

---

## Contraintes vérifiées

Relevées en première main sur `main`, pas de mémoire.

| Contrainte | Où | Ce que ça impose |
|---|---|---|
| `@@unique([etablissementId, obligationId, equipementId])` | `prisma/schema.prisma` | **Le vrai obstacle.** Rendre le champ nullable ne suffit pas : en Postgres deux `NULL` ne se conflictent pas, on obtiendrait des lignes en double. La prod est en **PostgreSQL 17.6** (vérifié), donc `UNIQUE NULLS NOT DISTINCT` est disponible |
| `matchEquipements` rend `ok: false` sans déclencheur | `src/lib/matching/engine.ts` | Il faut une branche « pas de déclencheur équipement », pas seulement un champ optionnel |
| Invariant testé `categoriesEquipement.length > 0` | `src/lib/referentiels/conformite/conformite.test.ts` | À revoir avec le type |
| `porteUnePreuve` ne compte que `rapports` et `actions` | `src/lib/calendrier/actions.ts` | **Piège** : un nouveau porteur de preuve non déclaré fait supprimer la ligne en silence, avec ce qu'elle portait |
| `empreinteReferentiel()` couvre `categoriesEquipement` | `src/lib/referentiels/conformite/index.ts` | Toute modification réconcilie les calendriers de **tous** les établissements à leur prochaine ouverture, sans que personne appuie sur un bouton |
| `equipementId` — 64 occurrences, 14 fichiers hors tests | `generateur.ts` en concentre 11 | Périmètre de revue borné |
| Le `.env` pointe sur la production | — | Aucune commande Prisma à l'aveugle. Les migrations additives (ajout de valeur d'enum) sont sûres, le reste ne l'est pas |

---

## Étapes proposées

L'ordre est contraint : le modèle doit pouvoir porter le contenu avant qu'on écrive le contenu.
Toute entrée écrite avant l'étape 3 serait un contournement de plus.

1. **Réécrire `docs/rgpd.md`** — il affirme que l'outil ne stocke aucun identifiant personnel de
   salarié. Faux dès que l'entité existe. Un encadré de péremption y est déjà posé, avec la
   liste de ce qu'il faut traiter. **Avant la migration, pas après.**
2. **ADR** — déclencheur, porteur, nature temporelle, règle du non-renseigné. Prochain numéro
   libre : **022** (le 019 est porté par une branche en vol, le 021 est livré).
3. **Élargir le type `Obligation`** — `categoriesEquipement` optionnel, `declencheur`, `porteur`.
   Ajouter **CSP** (santé publique — DTA, radon, plomb) et **CSS** (sécurité sociale — registre
   des accidents bénins, déclaration d'AT) à `SOURCES_LEGALES`, avec un commentaire justificatif
   sur le modèle de celui de `REGLEMENT_UE`.
4. **Moteur de matching** — la branche sans déclencheur équipement. Le mode *explain* doit savoir
   dire pourquoi l'obligation s'applique quand ce n'est pas un équipement qui la déclenche.
5. **Migration** — entité `Salarie`, `equipementId` nullable, `UNIQUE NULLS NOT DISTINCT`,
   `Etablissement.locauxSommeil`. Puis la revue des 14 fichiers.
6. **Calendrier** — générateur, réconciliation (ADR-012), et `porteUnePreuve`.
7. **Le test du lien retour** — un champ `rythmes` sur l'entrée de corpus, comparé au nombre
   d'obligations distinctes citant l'article. Écrivable seulement depuis que chaque référence
   porte une clé d'article canonique. Six articles à rythme manquant sont déjà déclarés dans le
   corpus avec leur verbatim ; au moins quinze sont soupçonnés.
8. **Contenu, par lots sourcés** — les 13 formations depuis INRS **ED 6298** en premier :
   périmètre fini, source unique, gratuite, citable.
9. **Onglet Personnel** — une habilitation se périme par personne et se prouve par une
   attestation nominative.

---

## Ce que vous devriez contester

Cette section est là parce que deux sessions se sont mutuellement corrigées hier, et que chaque
correction valait plus que ce qu'elle a coûté. Ce qui suit est fragile — cherchez-y les erreurs.

**Je n'ai pas lu le code de réconciliation en profondeur.** L'étape 6 est écrite depuis
`porteUnePreuve` et le nom des fichiers, pas depuis une lecture ligne à ligne de
`reconciliation.ts`. Il peut y avoir là des invariants que je n'ai pas vus, et qui changent le
coût de l'étape 5.

**Le sixième déclencheur est affirmé, pas conçu.** J'ai d'abord classé l'événement (un accident,
un chantier, une embauche) comme une *nature* temporelle, puis reconnu que c'est aussi un
déclencheur. Je n'ai pas instruit ce que ça implique dans le moteur. Il se peut que ce soit un
mécanisme entièrement distinct qui n'a rien à faire dans ce chantier.

**Le porteur « bâtiment » manque peut-être à ma liste.** Le modèle `Batiment` existe, et un DTA
se déclenche sur l'année du permis de construire — donc par bâtiment, pas par établissement, qui
peut en occuper plusieurs d'époques différentes. Le chantier ADR-019 « le bâtiment est un lieu »
tourne sur une autre branche : allez voir avant de figer le nombre de porteurs.

**L'entité `Salarie` est peut-être trop lourde pour commencer.** La décision « nominatif » tient
sur le fond, mais rien n'oblige à livrer d'un coup un référentiel du personnel. Un porteur
minimal — nom, poste, échéances — peut suffire au premier lot et éviter d'ouvrir un module RH.

**Une septième source d'échéances existe et n'est pas dans ce brief** : la prescription
particulière (ADR-014, modèle `PrescriptionParticuliere`) — arrêté du maire, mise en demeure,
PV de commission. Elle est traitée à part, et bien. Vérifiez qu'elle ne rentre pas en collision
avec le nouveau `porteur`.

**Enfin : ce brief a été écrit sans que son auteur implémente quoi que ce soit.** Les estimations
d'effort en sont absentes pour cette raison. Si une étape se révèle beaucoup plus coûteuse que
son rang ne le suggère, c'est le brief qui a tort.
