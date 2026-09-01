# Les quatorze qui n'iront pas sur l'écran des états permanents

Suite du lot `nature` (ADR-026), même branche `feat/nature-obligation`.
**Lecture seule sur le code produit** : ce rapport ne propose pas d'écran, il
établit ce que chacune des trois natures restantes appelle, et ce que le produit
porte déjà.

Rappel du chiffre : sur les 43 obligations sans périodicité, **trente sont des
états permanents** et vont sur l'écran de checklist. Les **quatorze autres** se
répartissent en quatre récurrentes sans rythme écrit, sept événementielles et
trois ponctuelles.

---

## La réponse en un paragraphe

**Quatorze devient dix.** Quatre des quatorze sont portées par un salarié, et
l'écran Équipe leur donne déjà une surface complète et juste — j'ai ouvert le
rendu : un titre déclaré sans échéance s'affiche « **Sans terme écrit** · Délivré
le 12/03/2025 · aucune date de fin portée sur le titre »
(`equipe/[salarieId]/page.tsx:37-43` et `:141-146`). Aucune date inventée, la
date du fait affichée, le dirigeant juge. C'est exactement ce que le brief de
l'écran des états permanents cherche à faire, et c'est déjà écrit.

Restent **dix obligations sans aucune surface**, et elles n'appellent pas la même
chose :

| Nature | Combien | Ce qu'elle appelle | Le produit a-t-il la brique ? |
|---|---|---|---|
| **ponctuelle** | 1 | rien de neuf — une **périodicité**, pas un écran | oui, entièrement |
| **récurrente sans rythme** | 4 | le même écran que les états permanents, **avec un autre verbe** et hors du compteur | oui, à condition de ne pas les compter comme « en place » |
| **événementielle** | 5 | pas un écran d'état : un **rappel attaché au fait**, ou, à défaut, la mention de ce qui la redéclenche | pour **une** sur cinq, oui — et la brique existe, inutilisée |

---

## 1. Ce que l'écran Équipe porte déjà — quatre sur quatorze

| Obligation | Nature |
|---|---|
| `formation-securite-salarie-accueil` | événementielle |
| `conduite-salarie-formation` | événementielle |
| `formation-securite-salarie-designe-competent` | ponctuelle |
| `secours-salarie-secouriste` | ponctuelle |

`genererVerificationsDepuisTitres` refuse de leur fabriquer une ligne de
calendrier — `if (echeance === null) continue` — et c'est juste. Mais le titre
déclaré existe en base (`TitreSalarie`), et `classerTitre` le range en
`aPlanifier`, dont le libellé de l'écran est « Sans terme écrit », avec ce
commentaire au-dessus :

> Pas « en retard » : un titre sans terme écrit n'a pas de rendez-vous manqué. Le
> Code renvoie ici à des modalités qu'il qualifie lui-même de recommandées
> (ADR-023 § 6) — décréter une échéance serait inventer une non-conformité.

**Une réserve, et elle est réelle** : cette surface n'existe que **si l'employeur
a déclaré le titre**. Rien n'est dérivé (ADR-023), et c'est la décision. Ce qui
manque n'est donc pas une surface, c'est un **rappel** — voir § 4.

---

## 2. La ponctuelle — une périodicité, pas un écran

`stockage-dangereux-declaration-icpe` est la seule ponctuelle sans surface.

Elle n'a besoin d'aucun écran neuf : le produit sait déjà servir une obligation
faite une fois, et il le fait bien. `mise_en_service_uniquement` produit **une**
ligne, `a_planifier`, **non urgente** — le générateur s'en explique en huit
lignes de commentaire —, et l'audit du 2026-08-31 a établi qu'une fois soldée
elle **survit** avec sa date, son statut réalisé et ses rapports.

Ce qui lui manque est un **fait qui la date**, et le produit l'a :
`Equipement.dateMiseEnService` du stockage déclaré. La qualification ICPE est due
quand le stockage existe ; c'est le même fait.

**Non fait, et pourquoi.** Changer sa périodicité de `autre` à
`mise_en_service_uniquement` fait apparaître une ligne chez **tout utilisateur
ayant déclaré un stockage de matières dangereuses**. C'est un déplacement de
lignes dans le parc, pas une correction de champ : cela se décide pour soi-même,
et cela demande de vérifier que le fait « le stockage existe » et le fait « les
quantités justifient une démarche ICPE » ne se confondent pas — l'obligation est
de **vérifier le régime**, pas de déclarer. À instruire.

---

## 3. Les récurrentes sans rythme — même écran, autre verbe

| Obligation | Porteur | Ce que le texte écrit |
|---|---|---|
| `formation-securite-etablissement-organisation` | établissement | « **répétée périodiquement** » (L. 4141-2) |
| `stockage-dangereux-verification-etancheite` | équipement | « vérifie **régulièrement** » (R. 4412-11) |
| `stockage-dangereux-formation-personnel` | équipement | « **renouvelée régulièrement** » (R. 4412-38) |
| `incendie-erp-5-visite-commission` | équipement | « **tous les cinq ans** » (PE 37) — le rythme est écrit, la périodicité ne l'est pas encore |

**Le critère.** Elles peuvent tenir sur l'écran des états permanents, à deux
conditions qui ne sont pas cosmétiques :

1. **Le verbe change.** Un état permanent se déclare « **en place** » — c'est un
   état, vrai jusqu'à preuve du contraire. Une récurrente se déclare « **fait le
   12/03/2025** » — c'est un fait daté, qui vieillit. Cocher « en place » sur une
   obligation qui revient est le même mensonge, d'une autre forme, que celui que
   l'ADR-026 vient de supprimer.
2. **Elles n'entrent pas dans le compteur d'en-tête.** « 6 sur 16 déclarés en
   place » ne peut pas compter une obligation qui revient : le dénominateur
   dirait qu'elle est faite, alors qu'elle est seulement datée. Le brief pose
   déjà que le compteur se prend au moteur ; il faut qu'il se prenne sur
   `nature === "etat_permanent"` seul.

Le critère d'affichage est donc :

```ts
nature === "etat_permanent"                              // « en place »,   compté
|| (nature === "echeance_recurrente" && periodicite === "autre")  // « fait le », non compté
```

**Une réserve sur la quatrième.** `incendie-erp-5-visite-commission` n'a rien à
faire sur un écran de déclaration, quel que soit le verbe : la visite est
**initiée par l'administration**, pas par l'exploitant. Ce qui se trace est la
visite quand elle a eu lieu — ce que le registre de sécurité fait déjà. Sa vraie
correction est la périodicité `quinquennale` que PE 37 écrit, et elle attend une
relecture à la source.

---

## 4. Les événementielles — ce n'est pas un état, et ça ne se coche pas

| Obligation | Porteur | Le fait qui la redéclenche | Le produit l'observe-t-il ? |
|---|---|---|---|
| `formation-securite-etablissement-information` | établissement | une **embauche**, un risque nouveau | **oui** — `Salarie.entreLe` |
| `formation-securite-etablissement-travail-sur-ecran` | établissement | modification substantielle du poste | non |
| `co-activite-etablissement-protocole-securite` | établissement | un **nouveau transporteur**, un nouveau lieu de livraison | non — aucun modèle ne porte un transporteur, et `DomainePrestataire` n'a pas de valeur `transport` |
| `froid-controle-etancheite-apres-modification` | équipement | modification du circuit, réparation de fuite | non |
| `stockage-dangereux-fiches-donnees` | équipement | changement de FDS chez le fournisseur | non |

**Aucune ne va sur un écran d'état**, dans aucun des deux verbes. « En place »
ment (elle redevient due), « fait le » ment aussi (l'acte n'est pas dû tant que
le fait n'a pas eu lieu). Une case cochée sur « contrôle d'étanchéité après
modification » dirait « aucune modification n'attend son contrôle » — ce que le
produit ne peut pas savoir, et sa propre note le dit : « un événement […] que
l'outil n'observe pas ».

Deux sorties, selon que le fait est observé.

### 4.1 Le fait est observé — et la brique existe sans servir

**Une seule des cinq est dans ce cas, et c'est un défaut net.**
`Salarie.entreLe` existe au schéma, est saisi au formulaire, affiché sur la fiche
et exporté au titre du RGPD. Sa documentation, dans `prisma/schema.prisma`,
écrit :

> Date d'entrée dans l'effectif. **Point de départ des obligations « à
> l'embauche ».** Sans elle, une telle obligation n'aurait d'autre départ que le
> jour de la saisie, c'est-à-dire un retard inventé.

**Elle ne date rien.** J'ai relevé ses quatre usages hors schéma
(`salaries/queries.ts`, `salaries/actions.ts`, `salaries/droits.ts`,
`equipe/[salarieId]/page.tsx`) : saisie, affichage, export. Aucun calcul.

Ce champ pourrait dater deux obligations — `formation-securite-etablissement-information`
(R. 4141-2, « lors de l'embauche ») et `formation-securite-salarie-accueil`
(R. 4141-20, « **dans le mois qui suit l'affectation** du travailleur à son
emploi », un délai chiffré que rien n'exploite).

**Et le signal qui existe est trop grossier pour le remplacer.** Le tableau de
bord porte la transmission ADR-024 « Organiser la formation à la sécurité —
suppose un titre nominatif, aucun n'est déclaré ». Elle se tait dès qu'**un
seul** titre `formation-securite-salarie-accueil` est déclaré, dans tout
l'établissement : `rapprocher` teste `titresDeclares.has(t.titre)`, un ensemble
d'identifiants d'obligation, sans compter les personnes. Un restaurateur qui
déclare la formation de sa plongeuse éteint le signal pour les cinq personnes
embauchées après elle. C'est la même famille de défaut que celle que ce même
module a déjà corrigée en passant du « n'importe quel titre » au « titre du même
domaine » — un grain trop gros qui éteint un signal encore dû.

### 4.2 Le fait n'est pas observé — le nommer, et rien de plus

Pour les quatre autres, il n'y a **rien d'honnête à cocher ni à dater**. Ce qui
est dû au dirigeant est une phrase, pas un état : *« cette obligation revient à
chaque modification du circuit ; Rojer ne voit pas les modifications. »*

C'est le registre exact de l'ADR-024 — « nommer le trou sans le combler » — et de
`equipements/hors-referentiel.ts` — « le silence ne doit jamais ressembler à une
réponse ». Deux d'entre elles sont portées par un équipement et ont donc un
endroit naturel : **la fiche de l'appareil**, qui affiche déjà « les obligations
qui pèsent sur cet appareil » — mais depuis les `Verification` persistées
(`equipements/fiche.ts:267`), donc sans elles. Les deux autres sont portées par
l'établissement et n'ont pas d'endroit équivalent aujourd'hui.

**Ce qu'il faudrait pour rendre ça comptable**, et qui n'est pas fait : la forme
`Transmission.declencheur_absent` évoquée dans l'ADR-026. Elle nommerait le fait
qui redéclenche, comme `attribut_absent` nomme l'attribut qui manque. Dix
obligations la porteraient. Elle touche l'ADR-024 ; c'est une décision, pas une
correction.

---

## 5. Ce que ça change au brief de l'écran

Trois phrases, à verser telles quelles :

1. **Le critère de sélection est `nature`, pas `periodicite`.** Trente lignes
   pour « en place », quatre de plus si l'écran accepte le second verbe « fait
   le », et le compteur d'en-tête ne porte que sur les trente.
2. **Cinq obligations ne doivent jamais y figurer**, sous aucun verbe : les
   événementielles. Leur y donner une case serait recréer le défaut d'un cran
   plus loin.
3. **Quatre sont déjà servies ailleurs** — l'écran Équipe, et il le fait bien.
   Ne pas les dupliquer : deux surfaces pour la même obligation, c'est deux états
   qui divergeront.

---

## 6. Ce que je n'ai pas établi

- **Aucun écran ouvert dans un navigateur.** Le rendu de l'écran Équipe cité au
  § 1 est lu dans le source (`page.tsx:37-43`, `:141-146`), pas constaté à
  l'écran.
- **Aucun article relu sur Légifrance**, ici non plus. Les faits déclencheurs du
  § 4 sont ceux que le référentiel porte dans ses `description` et ses verbatims.
- **Je n'ai pas cherché si `DomainePrestataire` pourrait porter le transport.**
  J'ai constaté qu'il ne le porte pas et que `docs/registre-securite-ecart.md`
  propose d'y ajouter `eau, gaz, chauffage, telephonie` — pas `transport`. Savoir
  si un transporteur a sa place à l'annuaire de vigilance est une question
  produit que je n'ouvre pas : `R. 4515-11` en fait un **co-signataire**, pas un
  prestataire de l'employeur, et la note de l'obligation le dit déjà.
- **Le grain de la transmission du § 4.1 n'est pas corrigé**, et c'est une
  question de modèle, pas d'affinage. Les trois crans sont désormais écrits dans
  la docstring de `rapprocher` (`dashboard/transmissions.ts`), là où les deux
  premiers étaient déjà racontés :

  1. **n'importe quel titre** — juste tant que le catalogue tenait en une ligne ;
  2. **un titre du même domaine** — l'état actuel, qui tombera dès que deux
     titres coexisteront dans un domaine ;
  3. **il ignore les personnes** — `titresDeclares` est un ensemble
     d'identifiants d'obligation : il dit *qu'un* titre existe, jamais combien
     de personnes le détiennent.

  Les deux premiers étaient des questions de granularité — quel ensemble
  consulter. Le troisième demande de trancher ce que « déclaré » veut dire quand
  l'obligation est due **par personne**, et il y a trois réponses possibles :
  chaque salarié actif, chaque salarié entré depuis moins d'un mois
  (`R. 4141-20`), ou seulement ceux dont le poste l'appelle — ce que le produit
  refuse de déduire (ADR-023). Le choix n'est pas fait, et le faire n'est pas de
  l'affinage.
