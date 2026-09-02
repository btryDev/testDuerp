# Chantiers ouverts

**Arrêté au 2026-09-02**, au sortir de la journée qui a fermé le référentiel :
trois trous du guide professionnel comblés, le Code cartographié, et trois
cliquets à zéro.

Ce document est la **liste de ce qui reste**, pas un rapport. Chaque entrée dit
ce qu'il y a à faire, pourquoi, et ce qui la bloque quand quelque chose la
bloque. Une entrée sans blocage nommé est prête à être prise.

Il existe parce que la liste vivait dans des messages de commit, des rapports
d'agent et une conversation — trois endroits qu'on ne rouvre pas. Voir aussi
`docs/dette-chantier-porteur-echeance.md`, borné au chantier du 2026-08-27, et
`docs/journal-des-verifications.md` pour l'état des relectures.

---

## 1. Retirer la question « personnes habituellement présentes »

**Décidé par la propriétaire le 2026-09-02.** La question ne revient pas dans le
parcours — la décision du 1ᵉʳ septembre tient — et **le rattrapage actuel s'en va
aussi** : le dirigeant ne doit plus lire ce bandeau sur son calendrier.

### Ce qu'il faut faire à la place

**Déduire pour les catégories 1 à 3.** `docs/adr/004-typologie-etablissement.md`
donne les seuils : 3ᵉ catégorie = 301 à 700 personnes de public. Dès la 3ᵉ, le
public seul dépasse cinquante-et-un, donc `R. 4227-34` s'applique **sans qu'on
ait rien à demander**. La catégorie est déclarée par le dirigeant depuis le
2026-09-01 : la donnée est là, il suffit de s'en servir.

**Cesser de résoudre le silence en « non » pour les 4ᵉ et 5ᵉ.** Ces deux
catégories ne donnent qu'une fourchette — la 4ᵉ va du seuil du type jusqu'à
300 —, donc rien ne se déduit. Aujourd'hui `engine.ts:410` fait
`personnesPresentesHabituellement ?? effectifSurSite` : le silence retombe sur
l'effectif salarié, ce qui **sous-estime pour tout ERP**, un ERP recevant du
public par définition. Les deux obligations concernées — consigne de sécurité
incendie et exercices semestriels, `incendie-travail-consigne-affichee` et
`incendie-travail-exercice-semestriel` — doivent s'afficher **« à confirmer »**
plutôt que disparaître. C'est ce que le produit fait déjà pour la famille
d'habitation.

### Pourquoi ça compte plus que ça n'en a l'air

Un restaurant de huit salariés qui sert trois cents couverts est le profil que
`CLAUDE.md` nomme comme cœur de cible. Il dépasse cinquante-et-une personnes tous
les jours. **La sous-estimation n'est donc pas un cas limite pour les trois
secteurs : c'est le cas ordinaire**, et elle fait disparaître en silence deux
obligations qu'un inspecteur regarde en premier.

### Ce que ça touche

`src/lib/matching/engine.ts` (le repli, l. 400-420), `src/lib/perimetre/couverture.ts`
(le message), `src/components/perimetre/BandeauCouverture.tsx`, et ses deux points
d'appel — `src/app/etablissements/[id]/perimetre/page.tsx` et
**`src/app/etablissements/[id]/calendrier/page.tsx:1076`**, celui que la
propriétaire a vu.

`CLAUDE.md` recense cet attribut comme **l'un des deux qui violent la règle du
non-renseigné** (*« l'incertitude ne réduit jamais la couverture »*). Le second,
`manipuleMatieresR422722`, est du même lot : à traiter ensemble ou à ne pas
oublier.

---

## 2. La date de remise de l'attestation de vigilance

**Recommandé par le lot du 2026-09-02, non fait** : c'est un champ, donc une
migration.

`opposabiliteUrssaf()` compte les six mois de `D. 8222-5` depuis
`prestataire.updatedAt`. Ce n'est pas un décalage borné, c'est **une remise à
zéro à chaque écriture** : la fiche d'un prestataire actif est retouchée plus
souvent que tous les six mois, donc la borne n'arrive jamais. L'écran reste vert
indéfiniment, et rien dans le calcul ne peut le rattraper.

Depuis le 2026-09-02, l'écran **le dit** — c'est le palliatif, pas le remède.

La même migration servirait la seconde exigence de `D. 8222-5`, aujourd'hui
impossible à porter : l'attestation doit **dater de moins de six mois** à la
remise, et le produit ne stocke qu'une fin de validité, jamais une date
d'émission. Un `DateTime?` nullable suffit, la borne actuelle servant de repli
tant qu'il est vide.

**À trancher avec** : est-ce la date de remise ou la date d'émission qui pilote
quoi. Les deux sont exigées et ne servent pas la même règle.

---

## 3. Deux obligations que rien ne bloque

- **`R. 4223-11`** — l'employeur *fixe les règles d'entretien périodique* du
  matériel d'éclairage, consignées dans un document communiqué au CSE. Jumeau
  exact de `R. 4222-21`, et `R. 4224-17` — déjà au corpus — **agrège nommément
  les deux documents** alors que sa réserve n'en relevait qu'un. Dépouillé le
  2026-09-02, `obligation_manquante`.
- **`R. 4323-24`** — la liste des personnes qualifiées, tenue à la disposition de
  l'inspection du travail. Vaut pour tout employeur détenant un équipement soumis
  à vérification générale périodique, et le lot « compacteur » du 2026-09-02 a
  **augmenté le parc concerné sans la traiter**.

---

## 4. Ce qui attend une décision, pas un développement

**La vigilance prestataires est dans le périmètre servi et hors du périmètre
déclaré.** Le chapitre est en huitième partie — travail illégal, pas
santé-sécurité — et `CLAUDE.md` écarte le « RH non-SST ». Mais le produit a un
module entier et vingt citations dessus. Deux issues : l'assumer, ou déclarer le
**module** hors référentiel comme le plan de prévention l'est déjà. Ne pas
choisir « ne pas lire les articles ».

**Blocage technique pour cette décision** : `EXCLUSIONS` (`corpus/perimetre.ts`)
est un ensemble fermé de quatre motifs, et **aucun ne dit « RH non-SST »**.
`L. 8221-5` a dû être classé `sans_objet`, qui dit autre chose. Son commentaire
prévoit qu'une exclusion « se discute et s'ajoute là ».

**Le type ERP `J` n'existe pas dans l'enum**, et `R` n'est pas subdivisé en
`R(1)` / `R(2)`. Un EHPAD ne peut pas se déclarer pour ce qu'il est. Origine
établie : la liste d'`ADR-004` a été écrite une fois avec la mention « ~20
valeurs » et jamais reconfrontée à la nomenclature. Migration.

**Les 55 `obligation_manquante` du corpus ne sont pas une liste de tâches.** La
plupart demandent un attribut de modèle, et dans le cadre arrêté le 2026-09-02
elles se **déclarent**, elles ne s'encodent pas.

---

## 5. Ce qu'aucun test ne comblera

**La vérification visuelle.** Cinquante-cinq commits ont touché `src/app` et
`src/components` depuis le 2026-08-31, dont une quinzaine de corrections
d'interface et de charte que personne n'a regardées à l'écran.

**Ce qui l'empêche est identifié**, et c'est un défaut du dépôt : les trois seeds
(`scripts/seed-demo.ts`, `prisma/seed.ts`, `scripts/seed-salaries-demo.ts`)
**remplissent** un dossier, aucun n'en **crée** un — et `seed-demo.ts` code en dur
deux `cuid` qui n'existent que sur la machine de la propriétaire. Le contrôle
visuel est donc impossible ailleurs que là, ce qui explique qu'il n'ait jamais
été fait.

**Le remède est un seed qui crée un dossier complet sur une base fraîchement
migrée.** Il débloque le contrôle sur n'importe quelle machine.

---

## 6. Plus petit, mais mesuré

- **30 URL de section** au lieu d'URL d'article au corpus, sous cliquet
  (`PLAFOND_URLS_DE_SECTION`), aucune corrigée.
- **`R. 4512-8`** — le contenu minimal du plan de prévention compte cinq
  rubriques, le produit n'en porte qu'une. Ni premiers secours, ni instructions
  aux travailleurs, ni organisation du commandement — alors que Rojer **émet** le
  document. Le corpus dit que ce n'est « qu'un formulaire à quatre champs près ».
- **Le seuil des 400 heures ne se recalcule pas en cours d'exécution**, alors que
  `R. 4512-7` le déclenche « dès lors qu'il apparaît » qu'elles seront atteintes.
  Depuis le 2026-09-02, l'aide de saisie le dit au dirigeant ; le module ne le
  fait toujours pas.
- **Un compte de test à supprimer en prod** : `contact+controle-pr10@btry.fr` et
  « Bistrot de la Verification SARL » (`cmtj4wq7y0002cigd4zauyfmw`).
