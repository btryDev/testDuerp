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

## 1. Ce qui reste du champ de R. 4227-34 — `manipuleMatieresR422722`

**Le gros de l'entrée est fait, le 2026-09-03.** La question « personnes
habituellement présentes » n'est pas revenue au parcours, le repli a changé de
sens et le bandeau a quitté le calendrier. Ce que le moteur fait désormais est
écrit dans `evaluerPersonnesPresentes` (`src/lib/matching/engine.ts`) et dans
l'ADR-022 § 7 : borne basse par la catégorie d'ERP puis par l'effectif salarié,
« à confirmer » sous la borne pour qui reçoit du public, rejet pour
l'établissement de travail seul où l'effectif EST le total. L'axe `public_recu`
de la couverture est parti avec sa cause, et `matching/public-recu.ts` avec lui.

**Ce qui reste est le second attribut**, que l'ADR-022 recensait avec le
premier : `manipuleMatieresR422722` absent est lu « non ». Il ne retire rien
aujourd'hui — sa branche n'ajoute des cas qu'à un champ déjà ouvert par le seuil
de personnes présentes. Il en retirerait le jour où une obligation s'appuierait
sur cette branche seule, et le corpus dit lequel :
`code-travail-matieres-inflammables.ts` a relevé le 2026-09-02 que `R. 4227-22`
oblige sans condition d'effectif ni d'équipement, qu'il vise « entreposées OU
manipulées » là où l'attribut ne demande que la manipulation, et que deux états
permanents en découlent que le référentiel ne porte pas.

**Ce qui le bloque** : rien de technique. C'est une décision sur le champ de la
question posée au dirigeant — l'élargir à l'entreposage ferait entrer dans les
obligations de `R. 4227-34` des établissements que ce texte-là ne vise pas.

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

**Le blocage est levé depuis le 2026-09-03.** `scripts/seed-dossier-complet.ts`
(`pnpm seed:complet --user <uuid>`) **crée** un dossier de bout en bout sur une
base vide et migrée, là où les trois seeds précédents ne savaient que **remplir**
un dossier existant — et où `seed-demo.ts` codait en dur deux `cuid` d'une seule
machine. C'était la cause, mesurée, de ce que le contrôle visuel n'ait jamais pu
se faire ailleurs.

Le dossier semé porte 3 zones, 10 équipements sur 8 domaines, 5 salariés et
7 titres, un DUERP validé, 3 prestataires aux attestations échelonnées, permis de
feu, plan de prévention, carnet sanitaire, accessibilité publiée, 36 échéances
dont 6 en retard, et 28 actions. La prescription d'assureur y tombe **seule à
J+160** — sa voisine à 48 jours, au-dessus du seuil de regroupement de la frise —
pour que la pastille de l'ADR-032 soit jugeable, ce qu'elle n'était pas le
2026-09-02.

**Le calendrier semé est un point fixe de sa propre régénération**, vérifié à
blanc : `0 à créer · 0 à modifier · 0 à supprimer · 36 inchangées`. Ouvrir
`/calendrier` ne le déplace donc pas — ce qui est ce qu'il faut, l'ouverture de
cet écran écrivant (§ 7).

**Ce qui reste** : la passe elle-même, sur les sept écrans que personne n'a
jamais pu regarder avec des données — `/equipe`, `/duerp`, `/permis-feu`,
`/plan-prevention`, `/carnet-sanitaire`, `/accessibilite`, `/plan-actions`.

Deux choses ne seront pas jugeables et ce n'est pas un défaut : les rapports de
vérification, signatures et jetons d'accès ne sont pas semés — ils exigent un
fichier réellement stocké, et en fabriquer produirait des entrées de registre
pointant vers un fichier absent ; et les déclarations d'états permanents non plus,
l'ADR-027 disant qu'une déclaration se coche et ne se sème pas.

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
- **Comptes de test en production — à la main de la propriétaire, pas à
  supprimer d'office.** `contact+controle-pr10@btry.fr` et « Bistrot de la
  Verification SARL » (`cmtj4wq7y0002cigd4zauyfmw`) sont **gardés
  volontairement** ; ils ont servi au contrôle visuel du 2026-09-02 et le
  dossier a reçu une régénération de calendrier depuis. Une première version de
  cette liste les rangeait « à supprimer » : c'était une décision prise à la
  place de la propriétaire.

  S'y ajoute `controle-visuel-seed@btry.fr` (uuid
  `e2d350b2-534b-4500-8cc0-550d8e579047`), **créé par erreur** le 2026-09-03 par
  le lot du seed, sur le projet Supabase de production. Non confirmé, jamais
  utilisé. La cause est un défaut de brief : la session distante avait
  l'interdiction écrite de toucher la prod, ce lot-là ne l'avait pas — on lui
  demandait de traiter la question de l'authentification sans lui dire où il
  n'avait pas le droit de la traiter. **Tout lot qui approche l'auth doit porter
  cette interdiction explicitement**, l'auth vivant chez Supabase et non en base
  (ADR-005) : un `.env` qui pointe une base locale peut parfaitement écrire dans
  l'auth de production.

---

## 7. Ce que le contrôle visuel a rendu — 2026-09-02

Passe faite sur `42df046` par une session distante, sur un dossier construit à
la main : **6 corrections confirmées à l'écran, 2 défauts toujours là, 11 constats
neufs.** Aucun n'est corrigé.

**Le contrôle n'est pas un second œil indépendant, et l'agent l'a dit lui-même** :
ses seize constats de la veille étaient dans sa fenêtre, il ne pouvait pas les
désapprendre. Il a compensé en donnant ce qu'il voit plutôt que ce que le commit
annonce, et en consacrant la moitié de la passe à des écrans jamais ouverts — d'où
viennent presque tous les constats neufs.

### Les trois qui comptent

**L'îlot de navigation est encore translucide sur la section CLAIRE.** Le
correctif du 2026-09-01 n'a traité que le fond sombre. À une position de
défilement intermédiaire, on lit « Dépassée depuis lundi · 6 appareils » *à
travers* la barre de navigation, et la photo du héros transparaît sur sa moitié
gauche. Sur la page de vente. Demi-correction, pas correction.

**`/equipements` tranche une ambiguïté du mauvais côté.** Sous les compteurs :
« Les chiffres ci-dessus et les familles ci-dessous portent sur tout
l'établissement. » C'est faux — ils portent sur les équipements seuls. La phrase
existe pour lever la confusion et elle la scelle à l'envers. L'écart est
exactement la répartition du référentiel : 86 obligations portées par un
équipement, 45 par l'établissement, 14 par un salarié.

**Quatre comptes divergents pour le même dossier** : 22 dépassées au tableau de
bord, 19 sur la carte de zone, « 22 datées · 5 à planifier » au calendrier,
« 19 en retard · 1 à planifier » sur `/equipements`. L'écart s'explique — porteur
équipement contre porteur établissement — mais **aucun écran ne le dit**.

### Les autres

- `J−3` affiché sur une ligne « en retard » : le signe est inversé, et il se lit
  « dans trois jours » à qui a déjà dépassé.
- « 22 échéances à traiter cette semaine » au-dessus de « 22 dépassées · 0 sous
  30 j » : le titre annonce un délai que ses propres chiffres démentent.
- Deux espaces manquantes après un `<strong>` : « couvertespar l'application »
  (`/registre`, dans un H2) et « tous les six mois**l'attestation** »
  (`/prestataires`). Deux pages, donc un `grep` plutôt que deux correctifs.
- La troisième carte de zone est tranchée en plein glyphe : « At », « 0 équ »,
  une pastille réduite à un « À ».
- « À jour » affiché sur une zone à **zéro équipement** — on certifie à jour un
  lieu où rien n'a jamais été déclaré.
- Pastille ambre « Engagement d'assurance » absente du widget « À faire », alors
  que la ligne a de la place.
- Le guide reste à « étape 4 sur 6 » alors que l'étape 5 paraît satisfaite ; un
  bouton primaire y est indiscernable d'un choix déjà fait.
- Le héros de la page d'accueil reste un aplat noir ~4 s avant que la photo
  arrive. Pas cassé, lent — sur la première image d'une page de vente.

### Et un fait de conception, découvert en le cherchant

**Charger la page calendrier ÉCRIT.** `calendrier/page.tsx:296-306` appelle
`regenererSansInvalider(id)` dès que le calendrier est désynchronisé. C'est la
régénération idempotente de l'ADR-012, pas un défaut — mais elle a pour
conséquence qu'**une consigne de « lecture seule en naviguant » n'est pas tenable
sur ce produit**, ce qui a été demandé à tort à la session distante et exécuté sur
la base de production. À savoir avant de refaire regarder un dossier réel.

### Ce qui reste injugeable sans le seed du § 5

`/equipe`, `/duerp`, `/permis-feu`, `/plan-prevention`, `/carnet-sanitaire`,
`/accessibilite` et `/plan-actions` s'affichent vides — un écran vide ne prouve
rien sur une correction de charte. S'y ajoutent tout l'onboarding, le refus de la
4ᵉ zone et le reset du formulaire de prescription : ce sont des écritures.

---

## 8. Ce que l'onboarding permet de déduire — à instruire, bas de liste

**Idée de la propriétaire, 2026-09-03.** Le lot « personnes habituellement
présentes » a montré qu'une question posée au dirigeant était **déjà répondue**
par une autre : dès la 3ᵉ catégorie d'ERP, le public dépasse 301, donc les 51 de
`R. 4227-34`. La question a pu partir.

Il y a probablement **d'autres cas du même genre**, et il se peut aussi que le
produit les traite déjà très bien — c'est à mesurer, pas à supposer.

### La ligne de partage, à poser avant d'instruire

Sans elle, ce chantier contredirait la décision du 2026-09-01, dont le commit
s'intitule « L'onboarding cesse de deviner ». Les deux se concilient, et la
distinction est nette :

- **Deviner un fait** — ce qui a été retiré. Le parcours déduisait la catégorie
  d'ERP d'un effectif de public saisi, puis **l'inscrivait au dossier comme si
  elle avait été constatée**. Un dirigeant connaît son classement : il est sur
  son arrêté d'ouverture ou au procès-verbal de la commission. On le lui demande.
- **Tirer la conséquence d'un fait déclaré** — ce qui est légitime, et ce que
  fait le lot `R. 4227-34`. La catégorie est déclarée par le dirigeant ; le
  franchissement du seuil de 51 en découle par le texte, sans qu'on demande rien
  et sans qu'on écrive au dossier un fait que personne n'a constaté.

**La règle** : on ne déduit jamais une donnée qui sera stockée et présentée comme
déclarée. On déduit des **conséquences** — quelles obligations s'appliquent,
quelles questions deviennent inutiles.

Et une seconde règle, tirée du même lot : **une déduction ne vaut que dans le
sens où elle est sûre.** La catégorie donne une borne basse du public, ce qui
suffit à conclure « au-dessus de 51 » et jamais « en dessous ». Une déduction
retournée devient une sur-application ou un faux négatif.

### Ce qu'il faudrait établir

Pour chaque réponse d'onboarding — régime travail / ERP / IGH / habitation, type
et catégorie d'ERP, famille d'habitation, effectif, secteur d'activité, zones,
équipements déclarés :

1. **Ce qui en découle mécaniquement** aujourd'hui, mesuré en appelant le moteur
   et non en lisant le code.
2. **Ce qui pourrait en découler et n'en découle pas** — le gisement.
3. **Quelles questions ultérieures deviennent alors inutiles**, comme
   « personnes habituellement présentes » l'est devenue pour les catégories 1 à 3.

Le sens du chantier n'est pas d'ajouter des déductions : c'est de **retirer des
questions**. Chaque question de moins à l'accueil est un dirigeant de plus qui
finit son dossier.

**Point de départ** : `src/lib/matching/engine.ts` pour ce qui découle déjà,
`docs/adr/004-typologie-etablissement.md` pour les seuils, et le mode `explain`
du moteur — qui sait déjà dire *pourquoi* une obligation s'applique chez vous, et
qui est donc l'inventaire des déductions existantes.
