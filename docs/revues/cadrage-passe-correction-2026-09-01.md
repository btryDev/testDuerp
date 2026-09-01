# Passe de correction — les 35 défauts du relevé du 1ᵉʳ septembre

Trois lots ont ouvert **70 articles** sur Légifrance et écrit leurs relevés dans
le corpus. Ils avaient consigne de **relever et ne rien corriger** : corriger au
fil de l'eau sur un inventaire incomplet a produit trois défauts cette semaine.

Voici l'inventaire. Il est complet, et c'est ce qui permet de le trier.

---

## A. Onze obligations reposent sur un texte qui ne les porte pas

**Porte (b), aucune dette possible.** Chacune a été vérifiée au verbatim,
article ouvert un par un. Ce ne sont pas des approximations de rédaction : le
produit affiche à un dirigeant une obligation dont l'article cité ne dit pas ce
qu'on lui fait dire.

| Obligation | Ce qui est cité | Ce que l'article dit |
|---|---|---|
| `porte-auto-verification-initiale` **(criticité 5)** | arrêté du 21/12/1993 | **Aucun** de ses articles 2, 3, 4, 8, 9 n'impose d'examen à la mise en service |
| `stockage-dangereux-verification-etancheite` | `R. 4412-11` | Ni « rétention » ni « étanchéité » dans ses sept alinéas |
| `aeration-travail-mise-en-service` | `R. 4222-21` | Une **consigne d'utilisation écrite**, pas un contrôle |
| `levage-examen-adequation-mise-en-service` | arrêté 01/03/2004 art. 5 | **Définit** l'examen d'adéquation ; c'est l'art. 14 qui l'impose |
| `levage-examen-etat-conservation` | arrêté 01/03/2004 art. 9 | **Définit** ; ce sont les art. 22 et 23 qui l'exigent et le cadencent |
| `ascenseur-carnet-entretien` | `CCH R. 134-10` | Ne régit que le propriétaire entretenant **par ses propres moyens** ; le cas ordinaire est `R. 134-7` |
| `ascenseur-telealarme-liaison` | `CCH R. 134-1` | Article de **définition** ; l'objectif est à `R. 134-2` |
| `elec-erp-cat1-4-annuelle` | `EL 19 § 1 et § 2` | L'annuelle est au **§ 3** ; le § 2 vise les installations neuves — l'objet de l'autre ligne |
| `elec-erp-mise-en-service` | `EL 19` | Cite le même paragraphe que la précédente, **pour l'acte inverse** |
| `incendie-travail-eclairage-securite-*` (2 lignes) | `R. 4226-19` | Renvoie **nommément** à `R. 4226-14` et `-16`, à rien d'autre |
| `cuisson-extinction-automatique` | `GC 22` | Ses quatre points ne visent pas l'extinction automatique ; ce sont `GC 8` et `MS 73` |

S'y ajoute **`aeration-erp-chauffage-ventilation-annuelle`**, qui confond deux
actes distincts sous une ligne : le **ramonage** annuel de `CH 57` et la
**vérification technique** par technicien compétent de `CH 58`.

**Le travail est de recaler le fondement**, pas de retirer l'obligation : dans
la plupart des cas l'obligation existe, c'est l'article cité qui est le mauvais.
Les deux cas où aucun texte n'a été trouvé — portes et étanchéité — demandent
une décision : chercher l'article qui les porte, ou retirer la ligne.

---

## B. Quatre plafonds encodés comme des rythmes — décision produit

Le motif est apparu **quatre fois dans la même soirée**, ce qui en fait une
façon de lire plutôt qu'une erreur isolée. La doctrine du dépôt est d'encoder le
plafond comme « la date au-delà de laquelle l'exploitant est nécessairement en
défaut » — mais elle suppose que le plafond soit **unique**, et ici il ne l'est
pas.

- **`Arrêté 2017-11-20 art. 18`** (requalification ESP) : « l'**échéance
  maximale** […] est fixée à » puis **2, 3, 6 et 10 ans** selon l'équipement. Le
  référentiel encode `decennale` — le cas **résiduel**. Régime distinct non
  porté : extincteurs > 30 bar. Fait générateur non porté : le II, changement
  simultané d'établissement **et** d'exploitant.
- **`GE 4 § 3`** (visite de commission) : le tableau du § 1 croise type ×
  catégorie et donne **3 ou 5 ans** ; le § 3 permet de prolonger « dans la
  limite de cinq ans » après deux visites favorables ; le § 4 laisse le maire
  modifier la fréquence.
- **`Arrêté 1993-12-21 art. 9`** (portes) : « **au minimum** semestrielle et
  adaptée à la fréquence de l'utilisation ». Second déclencheur non encodé :
  « à la suite de toute défaillance ».
- **`Arrêté 2017-11-20 art. 15`** (inspection ESP) : déjà traité le 2026-09-01
  par le champ `premierDelai`. Il reste les **deux ans** des générateurs de
  vapeur et des appareils à couvercle amovible, faute d'attribut.

**Ce que ces quatre cas ont en commun** : le texte donne une **échelle**, le
modèle ne sait porter qu'une valeur. Le champ `premierDelai` a réglé le cas où
la deuxième valeur est un premier cycle ; il ne règle pas celui où elle dépend
d'une propriété de l'équipement.

---

## C. Dix obligations existent en droit et manquent au référentiel

Toutes relevées **au verbatim** pendant le relevé, aucune supposée.

| Ce que le texte impose | Article |
|---|---|
| Révision décennale des extincteurs | `MS 38 § 4` (le même § porte l'annuelle, encodée) |
| Essais et visites périodiques **du matériel**, semestriels | `R. 4227-39` (le référentiel n'a que l'exercice) |
| Vérification triennale du désenfumage mécanique + SSI A/B | `DF 10 § 3` — bloquée par une condition croisant deux catégories |
| Rapport annuel d'activité de l'ascensoriste | `CCH R. 134-7 III` |
| Formation du personnel d'entretien en régie | décret n° 95-826 art. 9 |
| Présence physique d'une personne qualifiée pendant l'ouverture au public | `EL 18 § 2` (ERP 1ʳᵉ et 2ᵉ cat.) |
| Régimes ICPE **enregistrement** et **déclaration** | `C. env. L. 512-7` et `L. 512-8` — les seuls utiles à un commerce |
| Vérification du gaz avant mise en service | `GZ 13` |
| Carnet de prescriptions remis à chaque travailleur | `R. 4544-10` |
| Exception SATI — éclairage à test automatique | arrêté 2011 art. 11 et `EC 14 § 3` |

Cette dernière n'ajoute pas une obligation, elle en **retire** : une
installation SATI reçoit aujourd'hui les mêmes échéances mensuelle et
semestrielle qu'une installation testée à la main.

---

## D. Traçabilité — mécanique, sans décision

- **`R. 4227-38` n'est nulle part au corpus**, alors que la description de
  `incendie-travail-consigne-affichee` en reprend les huit points et que sa
  référence l'annonce.
- **`D. 4711-3` est daté faux** : `2008-05-01` au corpus, **16/03/2009** sur
  Légifrance. Sa citation ampute aussi ses mots d'ouverture et sa dernière
  phrase.
- **`R. 4323-1` est rangé dans le corpus « risque chimique »** alors qu'il
  relève des équipements de travail et vise tout employeur.
- **Trois `CORPUS_NE_RENVOIE_PAS`** : la liste `obligations` de l'entrée de
  corpus est incomplète pour `Arrêté 2004-03-01 art. 23`, `R. 4323-23` et
  `CCH R. 134-6`.
- **`GE 4` a une fin de vigueur au 1ᵉʳ juin 2027** et aucune `relectureDue` ne
  la surveille.
- **Trois renvois vers une numérotation abrogée**, dans les textes officiels
  eux-mêmes : `GE 6 → R. 123-43`, arrêté 1993 → `R. 235-5` et `R. 232-1-13`,
  arrêté 1987 → `R. 235-10`. Relevés, non recopiés comme vivants.
- **`GZ 15`** : le chapitre a été renuméroté au 1ᵉʳ janvier 2026 — c'est
  l'ancien `GZ 30` que la littérature cite encore. L'article s'ouvre sur
  « Elles » sans antécédent : `GZ 13` et `GZ 14` manquent au corpus.

---

## L'ordre

**A d'abord** — onze obligations affichées sur un fondement faux, dont une de
criticité 5. Porte (b), pas de dette.

**D en parallèle** — mécanique, aucun croisement avec A.

**B et C attendent une décision.** B demande d'arbitrer, pour chaque échelle,
entre encoder la borne la plus stricte, ajouter l'attribut qui distingue les
cas, ou nommer le trou. C demande de dire lesquelles des dix entrent au
périmètre — plusieurs le touchent de près, `L. 512-7` et `L. 512-8` en premier.

## Ce que la passe ne doit pas refaire

Les trois lots de relevé ont réussi parce qu'ils ont écrit **dans le corpus**.
Une correction qui vivrait dans un rapport ne compterait pas davantage que les
123 articles lus le 26 août. Le contrôle est le même : après la passe,
`pnpm relecture` doit montrer moins de `PERIODICITE_SANS_TEXTE_PORTEUR` et de
`CORPUS_NE_RENVOIE_PAS`, et l'empreinte du référentiel **doit** avoir bougé —
contrairement au relevé, une correction change ce que le produit calcule.
