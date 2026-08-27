# Chantier B — dire ce qu'on ne couvre pas, puis ouvrir

**Objectif** : qu'un dossier sache déclarer ce qu'il ignore, et qu'un établissement hors des
trois secteurs DUERP puisse enfin en créer un.

Rédigé le 2026-08-27 par la session qui a instruit le sujet. **Ce document n'est pas un ordre
de mission : la section « Ce que vous devriez contester » compte autant que les autres.**

> **Note d'une autre branche, 2026-08-27 (chantier A / ADR-022).** Ce document dit « 85
> obligations » à trois endroits. Le compte est désormais **84** : deux obligations portées par
> l'établissement ont été ajoutées, trois fragments de ces mêmes articles retirés parce qu'elles
> les absorbent. Les chiffres ci-dessous ne sont pas corrigés dans le corps du texte — c'est le
> brief d'un autre chantier, et son argument ne dépend pas de l'unité près. Le compte faisant foi
> est le préfixe d'`EMPREINTE_ATTENDUE` dans `conformite.test.ts`.
>
> Un fait de ce document change en revanche pour de bon : toutes les obligations ne sont plus
> déclenchées par un équipement déclaré. Deux le sont par l'établissement lui-même.

---

## Pourquoi ce chantier existe

Deux constats indépendants qui se rejoignent.

**La porte d'entrée du produit est le DUERP.** `src/lib/onboarding/scope.ts` refuse la création
d'un dossier hors de trois secteurs (56.xx, 47.xx, tertiaire), au motif que « le référentiel
sectoriel est vide, la cotation DUERP n'est pas pré-remplie ». Un hôtelier qui voudrait
seulement tenir son registre de sécurité et ses échéances d'ascenseur — ce que le référentiel de
conformité sait déjà faire — se fait refuser pour une cotation de risques qu'il n'a pas demandée.

**Or le DUERP sectoriel n'est pas un référentiel réglementaire.** `restauration.ts`,
`commerce.ts` et `bureau.ts` citent bien quelques articles (`R. 4511-1`, `R. 4431-2`,
`R. 4433-1`), mais **tous en commentaire ou en prose** : zéro `ReferenceLegale` structurée, zéro
`versionConstatee`, aucune ne produit d'échéance. Ce sont des mentions, pas des obligations. Le
socle documentaire est INRS — ED 880, ED 840, OiRA.

Il n'existe d'ailleurs **aucune référence réglementaire du DU par secteur** : `L. 4121-3` et
`R. 4121-1` disent « évaluez les risques » sans nommer ni secteur, ni unité de travail, ni liste.
Un secteur manque au produit quand l'INRS n'a pas publié son guide — c'est une limite éditoriale,
pas juridique.

**Donc la partie molle du produit verrouille l'accès à la partie dure** : 85 obligations
opposables, déclenchées par équipement et typologie, jamais par le NAF.

---

## Ce qui est tranché

### Le socle avant l'ouverture

Ce n'est pas une préférence d'ordre. Ouvrir la porte à un garage sans lui dire qu'on ignore ses
ponts élévateurs, ses aires de distribution de carburant et l'ICPE 2930, c'est fabriquer
exactement le défaut que ce chantier corrige — un dossier qui a l'air complet parce qu'il a les
mêmes colonnes que les autres.

Le référentiel de conformité **ne dirait rien, sans dire qu'il ne dit rien**.

### Le mécanisme existe déjà, il faut le hisser

L'ADR-020 pose la couverture déclarée du **DUERP** : un DUERP sait dire qu'il ne couvre pas la
boucherie du supermarché, et ça s'imprime avec lui. Un **dossier** ne sait pas dire qu'il ne
couvre pas les ponts élévateurs, ni qu'aucune obligation de formation n'y est encore portée.

Il s'agit de généraliser, pas d'inventer : `src/lib/pdf/mentions-couverture.ts`,
`src/components/duerps/QuestionActiviteRow.tsx`, la page `duerp/[id]/activites`.

### Découpler la porte est sans risque de déploiement

Vérifié : `onboarding/scope.ts` est **hors de l'empreinte du référentiel**. Aucune ligne de
calendrier ne bouge chez personne. C'est l'inverse du chantier A, qui touche
`categoriesEquipement` et se propage automatiquement à tous les dossiers.

### ICPE reste dehors, avec une question fermée de rattrapage

Les seuils ne sont pratiquement jamais atteints dans le périmètre (rubrique 2925 à 600 kW, 1510
à 5 000 m³), et encoder la nomenclature serait un produit en soi. Mais une question fermée à
l'onboarding bascule le dossier en couverture partielle — même mécanisme que les activités non
couvertes, zéro IA, zéro devinette. Les déchets suivent la même règle ; les fluides frigorigènes
restent dedans, ils y sont par la sécurité des équipements.

---

## Contraintes vérifiées

| Contrainte | Où | Ce que ça impose |
|---|---|---|
| Le filtre sectoriel n'a que **trois points d'application** | `WizardShell.tsx`, `StepIdentite.tsx`, `onboarding/schema.ts` (validation Zod) | Surface minuscule |
| `evaluerScopeSecteur(codeNaf)` est la seule API du filtre | `src/lib/onboarding/scope.ts` | Un seul point à faire évoluer |
| Le référentiel de conformité **ne lit jamais le NAF** | `src/lib/matching/engine.ts` | Un garage ou une pharmacie déclencherait correctement les 85 obligations. Rien ne bloque techniquement |
| `matchTypologie` lit `estERP`, `typeErp`, `categorieErp` | idem | Typologie et NAF sont deux axes indépendants |
| Aucune condition d'application ne lit un attribut d'établissement autre que la typologie | `conformite/types.ts` | Confirmé par une seconde session : `codeNaf` n'apparaît nulle part sous `conformite/` ni `corpus/` |
| Les référentiels sectoriels font 410 à 536 lignes | `restauration.ts`, `commerce.ts`, `bureau.ts` | Ordre de grandeur d'un secteur à transcrire |

---

## Étapes proposées

### B0 — le socle

1. **Un état de couverture porté par l'établissement** — ce qui est couvert, ce qui ne l'est pas,
   et pourquoi : secteur DUERP absent, domaine d'équipement non dépouillé, famille d'obligations
   non portée. Sur le modèle de ce qui existe pour le DUERP.
2. **Une surface d'affichage permanente** — tableau de bord et fiche établissement. L'utilisateur
   doit pouvoir répondre « qu'est-ce que cet outil ne me dit pas ? » sans ouvrir un PDF.
3. **La mention dans les documents** — étendre les phrases de méthodologie au dossier de
   conformité et à l'export contrôle, pas seulement au DUERP.

### B1 — découpler la porte

4. **Autoriser la création hors secteur** — conformité active, DUERP explicitement déclaré non
   couvert. Trois points à modifier, tous hors empreinte.
5. **Brancher le socle** — le dossier hors secteur affiche en permanence ce qu'il ne couvre pas.

### B2 — transcrire des secteurs

6. **Les cinq que le code nomme déjà** comme activités non couvertes, avec leurs références déjà
   citées dans le dépôt : hôtels-cafés-restaurants, boucherie-charcuterie (`outil71`, ED 6382),
   boulangerie-pâtisserie (ED 6400), poissonnerie (`outil72`, ED 6380), restauration collective
   (`outil155`). **Les transcrire supprime un aveu de lacune plutôt que d'ajouter une promesse.**
7. **Puis par proximité avec la cible** — restauration rapide, traiteur, commerce alimentaire de
   proximité, coiffure, soins esthétiques, pharmacie d'officine, métiers de la propreté.

---

## Ce que vous devriez contester

**Le chiffre de 43 outils OiRA n'est pas réconcilié.** L'INRS annonce 43, la page de listing en
énumère 47. Je n'ai pas cherché à comprendre l'écart. Ne citez pas « 43 » comme un chiffre
vérifié — comptez vous-même si le nombre porte une décision.

**Je n'ai pas lu le parcours d'onboarding.** L'étape 4 est écrite depuis les trois points
d'application du filtre, pas depuis une lecture du wizard. Un parcours « hors secteur » peut
demander bien plus qu'une condition levée : que devient l'étape de choix de secteur, que voit
l'utilisateur, comment il revient en arrière.

**Je ne sais pas ce que le registre de widgets impose.** L'étape 2 suppose qu'un widget de
couverture s'ajoute comme les autres. Le tableau de bord a un registre, des variants, une
persistance versionnée en `localStorage` — allez voir avant de promettre un affichage
permanent.

**Le socle appartient peut-être au chantier A.** Je l'ai mis ici parce qu'il bloque l'ouverture
et ne fait que profiter au porteur d'échéance. Mais c'est le chantier A qui fera apparaître le
plus de non-couvert, et il pourrait être mieux placé pour définir la forme de la déclaration. Si
les deux sessions se parlent, tranchez entre vous.

**Une mesure manque, et elle changerait peut-être les priorités** : « 85 obligations » dit ce que
le référentiel *porte*, pas ce qu'un établissement donné *déclenche*. Personne ne sait combien
d'obligations sont atteignables par un profil type. Cette mesure est écrivable — le corpus porte
désormais des clés d'article — et elle éclairerait la décision d'ouvrir tel secteur plutôt que
tel autre.

**L'hôtellerie n'est peut-être pas le meilleur premier secteur.** Je la propose parce que OiRA
traite hôtels et restaurants dans le même outil et qu'un hôtel-restaurant partage cuisine,
plonge et service avec ce qui existe. C'est un argument de proximité technique, pas de demande
client. Si vous savez qui sont les utilisateurs réels, cet argument ne vaut rien contre le leur.

**Enfin : ce brief a été écrit sans que son auteur implémente quoi que ce soit.** Si une étape se
révèle beaucoup plus coûteuse que son rang ne le suggère, c'est le brief qui a tort.
