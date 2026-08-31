# Rapport — lot 7, dépouillement des textes qui portent les obligations de salarié

**Branche** `feat/depouillement-salarie` · **dépouillement du 2026-08-31** ·
42 articles lus sur Légifrance, 15 obligations encodées, 4 corpus créés.

Le référentiel passe de **85 obligations sur 10 domaines** à **100 sur 13**.
Le catalogue des titres de salarié passe de **1 ligne à 11**.

> **Ce rapport a été amendé après revue.** Quatre relecteurs ont passé le lot au
> crible : le dépouillement tient — aucune URL fausse, aucune citation
> fabriquée, le découpage confirmé — mais ils ont trouvé huit défauts dans les
> **conséquences** du lot, dont deux régressions que je livrais sans le voir.
> La section « Ce que la revue a corrigé », en fin de document, les reprend une
> par une. Les chiffres ci-dessus sont ceux d'après revue.

---

## Ce qui a changé pour un dirigeant

C'est la mesure qui compte, et elle est nette. Un bureau de six personnes
**sans le moindre équipement déclaré** voyait, dans le guide « chez vous », **un
seul domaine** : le contrôle de ses installations d'aération. Il en voit
maintenant **quatre**, et doit **sept obligations** dont aucune ne dépend d'un
appareil :

| Ce qu'il doit, dès son premier salarié | Article |
|---|---|
| Organiser la formation à la sécurité | `L. 4141-2` |
| Informer ses salariés, et leur donner accès au DUERP | `R. 4141-3-1` |
| Équiper les lieux d'un matériel de premiers secours | `R. 4224-14` |
| Organiser par écrit les premiers secours | `R. 4224-16` |
| Tenir à jour la liste des postes à risques particuliers, **tous les ans** | `R. 4624-23 III` |

Et **la question de Camille a une réponse** : le catalogue propose désormais une
formation à la sécurité due à *tous* les salariés, la formation à la conduite,
l'autorisation de conduite, l'attestation médicale de conduite, le SST, la VIP
et le suivi renforcé. `chez-vous.test.ts` fige ce passage de 1 à 4 domaines ;
c'est le test qui mesure le lot.

---

## C1 — formation à la sécurité (`L. 4141-*`, `R. 4141-*`)

**26 articles lus, chapitre intégral**, les deux versants du chapitre Ier du
titre IV. Corpus : `code-travail-formation-securite.ts`, `etendue: "integral"`.

### Ce qui est encodé — 3 obligations

| Obligation | Porteur | Périodicité | Fondement |
|---|---|---|---|
| `formation-securite-etablissement-organisation` | établissement | `autre` | `L. 4141-2` |
| `formation-securite-salarie-accueil` | **salarié** | `autre` | `R. 4141-20` |
| `formation-securite-etablissement-information` | établissement | `autre` | `L. 4141-1`, `R. 4141-3-1` |

### Le choix de découpage, et sa raison

Le brief posait la question : « une formation dispensée est-elle portée par le
salarié ou par l'établissement ? Les deux existent peut-être, et alors ce sont
deux obligations. » **La lecture répond oui**, et les deux sont écrites.

- Le texte dit « **L'employeur organise** une formation pratique et appropriée à
  la sécurité » : le sujet de l'obligation est l'employeur, et elle est due dès
  qu'il y a un salarié — **même si aucun titre n'a été déclaré dans l'outil**.
  C'est un porteur établissement, une seule ligne (ADR-022).
- Mais `R. 4141-20` fait courir un délai « dans le mois qui suit l'affectation
  **du travailleur** à son emploi ». C'est une date **par personne**.

Les fondre aurait forcé un choix entre deux erreurs : une obligation qui
**disparaît** quand personne n'est déclaré alors qu'elle est due dès le premier
salarié, ou une obligation qui **ne se solde jamais nominativement** alors que le
délai court par travailleur. Deux obligations, et une transmission (ADR-024) de
la première vers la seconde.

**L'argument décisif pour le porteur salarié est récent et il est dans le
texte.** `L. 4141-5`, en vigueur depuis le **27 juin 2026** (loi n° 2026-534 du
25 juin 2026, art. 70), crée le passeport de prévention et énonce qu'il
« comporte les attestations, certificats, certifications professionnelles et
diplômes obtenus dans le cadre des formations relatives à la santé et à la
sécurité au travail mentionnées au même article `L. 4141-2` ». **Le droit affirme
donc lui-même que ces formations produisent une pièce nominative.** Sans cet
article, le porteur salarié aurait reposé sur une inférence ; avec lui, il repose
sur un texte de deux mois.

### Aucune périodicité, et c'est le résultat du dépouillement

`L. 4141-2` dit « répétée périodiquement dans des conditions déterminées par voie
réglementaire ou par convention ou accord collectif de travail ». **Le pouvoir
réglementaire ne les a jamais déterminées** : les vingt articles `R. 4141-*` ont
été lus un par un, aucun ne porte de durée. La seconde branche renvoie aux
accords collectifs, que l'outil ne lit pas.

La **seule durée chiffrée de tout le chapitre** est le mois de `R. 4141-20`, et
ce n'est pas une périodicité : il court depuis l'affectation, pas depuis la
formation précédente. Il est rappelé en description, **il n'est pas calculé** —
`TitreSalarie.delivreLe` porte la date de la formation reçue, pas celle de
l'embauche, et créer un champ « date d'affectation » excède ce lot.

### Ce qui est lu et non encodé — 3 articles

- **`L. 4141-5`** (passeport de prévention) → `obligation_manquante`. Le
  passeport est intégré au système d'information du compte personnel de formation
  et **géré par la Caisse des dépôts** : rien de ce que l'outil détiendrait ne
  soldrait une obligation qui se remplit chez un tiers. Le V renvoie encore ses
  modalités au comité national de prévention et de santé au travail.
- **`R. 4141-8`** (formation après accident grave ou accidents répétés) et
  **`R. 4141-12`** (après modification des conditions de circulation ou
  d'exploitation) → `obligation_manquante`. Toutes deux **événementielles**, et
  il n'y a pas de déclencheur « événement » dans le modèle. Pour `R. 4141-8`
  s'ajoute que le registre des accidents du travail est hors périmètre : l'outil
  ne connaîtrait pas l'accident qui déclenche l'obligation.

Huit articles sont `sans_objet` (modulation d'étendue, financement, modalités
pédagogiques, renvois). Deux réserves sont portées sur des articles retenus :
`R. 4141-6` (association du médecin du travail, que l'outil ne trace pas) et
`R. 4141-9` (reprise après 21 jours, dont le déclenchement suppose la durée d'un
arrêt de travail — donnée que l'outil ne détient pas et ne détiendra pas).

---

## C2 — suivi médical (`R. 4624-*`)

Le brief prescrivait « dépouillement seul ». **La propriétaire a tranché en cours
de lot : le suivi médical s'encode.** Ce qui suit est donc encodé, avec la
doctrine `docs/rgpd.md` § 2.3 intacte.

**6 articles lus.** Corpus : `code-travail-sante-travail.ts`,
`etendue: "articles_cites"` — la section 2 court de `R. 4624-10` à `R. 4624-45-9`,
une quarantaine d'articles ; six seulement sont lus, et le corpus ne prétend pas
au reste.

### Ce qui est encodé — 4 obligations

| Obligation | Porteur | Périodicité | Nature du chiffre |
|---|---|---|---|
| `sante-travail-salarie-vip` | salarié | `quinquennale` | **plafond** (`R. 4624-16`) |
| `sante-travail-salarie-sir` | salarié | `quadriennale` | **plafond** (`R. 4624-28`) |
| `sante-travail-salarie-sir-visite-intermediaire` | salarié | `biennale` | **plafond** (`R. 4624-28`) |
| `sante-travail-etablissement-liste-postes-risques` | établissement | `annuelle` | **ferme** (`R. 4624-23 III`) |

Les trois obligations salarié portent `pieceMedicale: true`.

### Ce que le texte impose, à qui, à quel rythme

- **VIP** — *tout* travailleur, dans les trois mois de la prise effective du
  poste, par un professionnel de santé (médecin du travail, collaborateur
  médecin, interne ou infirmier). Renouvelée « selon une périodicité **qui ne
  peut excéder cinq ans** », fixée par le médecin du travail.
- **SIR** — les travailleurs affectés à un poste à risques particuliers. Examen
  d'aptitude par le **médecin du travail** avant l'affectation, qui **se substitue
  à la VIP**. Renouvelé « selon une périodicité qu'il détermine et **qui ne peut
  être supérieure à quatre ans** », avec une **visite intermédiaire** par un
  professionnel de santé « **au plus tard deux ans** après ».
- **Postes à risques particuliers** — sept expositions légales (amiante, plomb,
  agents CMR, agents biologiques 3 et 4, rayonnements ionisants, hyperbare, chute
  de hauteur au montage d'échafaudages), plus tout poste conditionné à un examen
  d'aptitude spécifique, plus la liste que l'employeur complète et **met à jour
  tous les ans**.

### Ce que l'outil détient exactement

Pour chaque titre déclaré : **que la visite a eu lieu, sa date, son échéance.**
Rien d'autre. Jamais l'avis d'aptitude ou d'inaptitude, jamais une restriction,
jamais un motif, jamais la pièce. `pieceMedicale: true` fait que l'interface **ne
propose même pas** le téléversement.

C'est plus strict que le droit — `R. 4323-56` autorise expressément l'employeur à
conserver copie de l'attestation de conduite — et c'est un choix produit assumé.
Le passage de « une attestation liée à l'habilitation électrique » à « le suivi
médical de tous les salariés » élargit beaucoup ce que l'outil détient ; **la
doctrine est ce qui rend cet élargissement acceptable**, et elle ne s'est pas
desserrée d'un cran.

### Le point le plus discutable du lot, nommé comme tel

**Trois des cinq périodicités chiffrées du lot sont des plafonds, pas des
rythmes.** `R. 4624-16` et `R. 4624-28` écrivent « qui ne peut excéder » et « qui
ne peut être supérieure à » : le médecin du travail fixe le délai réel, plus
court, au vu de l'âge, de l'état de santé et des risques.

Encoder `quinquennale` revient donc à annoncer **la borne extérieure** — la date
au-delà de laquelle l'employeur est nécessairement en défaut — et non le rythme
que son médecin a retenu. Un dirigeant dont le médecin a fixé trois ans et qui
lirait « échéance dans cinq ans » serait mal informé.

**Pourquoi ce n'est malgré tout pas une périodicité inventée :** cinq, quatre et
deux ans sont *écrits dans le Code*, contrairement au « triennal » d'origine NF
que ce dépôt a eu à retirer. Et deux garde-fous tiennent :

1. chaque `description` dit que le délai est un maximum que le médecin peut
   raccourcir ;
2. **`TitreSalarie.echeanceLe`, déclaré par l'employeur, prime sur tout calcul** —
   un dirigeant dont le médecin a fixé trois ans saisit trois ans, et l'outil ne
   le contredit pas.

Sans le second, il aurait fallu passer à `autre` et ne rien dire du tout, ce qui
était l'état précédent. **C'est le choix du lot que je signale en premier à une
relecture.** Le modèle n'a pas de notion de plafond ; lui en donner une serait un
ADR, pas une ligne de référentiel.

### Comment le SIR se déclenche sans être deviné

Le brief posait le problème : le SIR vise un poste à risques particuliers, et le
produit ne sait pas quels postes le sont — ce serait le cinquième déclencheur,
non implémenté. Appliquer le SIR à tout l'effectif parce qu'un produit chimique
figure au parc serait le faux positif de masse que l'ADR-023 refuse.

**La réponse n'est ni de deviner ni de renoncer : elle est dans le texte.**
`R. 4624-23 III` met à la charge de l'**employeur** une liste des postes à
risques particuliers, motivée par écrit, transmise au service de prévention et de
santé au travail et **mise à jour tous les ans**. L'outil n'a donc pas à savoir
qui relève du SIR : il rappelle une fois par an que la question se pose, et le
suivi des personnes concernées se déclare ensuite nominativement. Une
transmission ADR-024 relie explicitement les deux.

C'est le seul chemin honnête entre dériver et se taire, et c'est la trouvaille du
chantier.

### À surveiller

`R. 4624-23` a été réécrit par le **décret n° 2026-253 du 8 avril 2026**, en
vigueur au **10 avril 2026** — quatre mois avant ce dépouillement. C'est
**l'article le plus récemment modifié de tout le référentiel**.

---

## C3 — secours (`R. 4224-14` à `-16`)

**3 articles lus, section intégrale.** Corpus : `code-travail-secours.ts`,
`etendue: "integral"`.

### Trois obligations, pas deux — et pourquoi

Le brief disait « écris-en deux, jamais une ». **Il y en a trois**, parce que le
texte en porte trois :

| Obligation | Porteur | Article | Objet |
|---|---|---|---|
| `secours-etablissement-materiel` | établissement | `R. 4224-14` | le **matériel** |
| `secours-salarie-secouriste` | **salarié** | `R. 4224-15` | la **personne formée** |
| `secours-etablissement-mesures` | établissement | `R. 4224-16` | le **document d'organisation** |

`R. 4224-16` a été ajouté au découpage : il impose des mesures prises après avis
du médecin du travail, en liaison avec les secours extérieurs, « consignées dans
un document tenu à la disposition de l'agent de contrôle de l'inspection du
travail ». C'est une obligation distincte du matériel comme du secouriste — et
**celle qui concerne le plus sûrement une TPE**, puisque sa condition
d'application est l'*absence d'infirmiers*, c'est-à-dire le cas ordinaire d'une
entreprise de moins de cinquante personnes.

Les fondre en une ligne « premiers secours » aurait laissé un dirigeant cocher
« fait » pour une trousse achetée, sans que personne ne soit formé ni qu'aucun
document existe.

### Le porteur salarié rend l'absence sûre plutôt que fausse

`R. 4224-15` est **conditionnel** : il ne vise que « chaque atelier où sont
accomplis des travaux dangereux » et certains chantiers. Le produit ne détient
pas cette qualification — ni le parc ni le code NAF ne la donnent. Avec un
porteur établissement, il aurait fallu choisir entre afficher la ligne à tout le
monde (faux positif chez un bureau sans atelier) ou à personne. **Le porteur
salarié tranche autrement : aucune ligne tant qu'aucun titre n'est déclaré, une
ligne exacte dès qu'un dirigeant en déclare un.**

### Le piège nommé d'avance, et évité

**Le « recyclage SST tous les vingt-quatre mois » n'est pas dans le Code du
travail.** C'est le rythme de maintien et d'actualisation des compétences du
dispositif INRS/CNAM — une doctrine d'organisme, pas une règle opposable.
`R. 4224-15` écrit seulement « reçoit la formation de secouriste nécessaire ».
Périodicité `autre`, `echeanceLe` nullable : l'employeur qui connaît l'échéance
de son certificat la saisit, l'outil ne l'invente pas.

Même raisonnement pour la **composition et la vérification de la trousse de
secours**, qui relèvent de recommandations INRS : aucune périodicité de contrôle
du matériel n'est encodée.

---

## C4 — conduite et CACES (`R. 4323-55` à `-57`)

**3 articles lus, section intégrale.** Corpus : `code-travail-conduite.ts`,
`etendue: "integral"` — fichier distinct de `code-travail-levage.ts`, qui couvre
la section 4 (vérifications d'un **équipement**) quand celle-ci porte sur la
compétence d'une **personne**.

### Ce qui est encodé — 3 obligations

| Obligation | Domaine | Périodicité | Fondement |
|---|---|---|---|
| `conduite-salarie-formation` | `formation_securite` | `autre` | `R. 4323-55` |
| `conduite-salarie-autorisation` | `formation_securite` | `autre` | `R. 4323-56` al. 1 |
| `conduite-salarie-attestation-medicale` | `sante_travail` | **`quinquennale`** | `R. 4323-56` al. 2 |

### La trouvaille : le jumeau non encodé de l'habilitation électrique

`R. 4323-56` a été **réécrit au 1er octobre 2025 par le décret n° 2025-355 du
18 avril 2025** — *le même décret* qui a créé `R. 4544-11-1`, l'attestation
médicale de l'habilitation électrique, jusqu'ici **la seule obligation salarié du
référentiel**. Les deux articles se lisent presque mot pour mot : même durée de
cinq ans, même délivrance par le médecin du travail à l'issue d'un examen, même
conservation d'une copie par l'employeur.

**Le référentiel n'en portait que la moitié.** Ce n'était pas une coïncidence
mais une réforme unique du suivi médical des travailleurs exposés, dont une seule
branche avait été encodée.

### L'autorisation de conduite n'a pas d'échéance — vérifié

Le brief demandait de vérifier. `R. 4323-56` a été relu en entier dans sa version
du 1er octobre 2025 : **aucune durée n'est attachée à l'autorisation de conduite**.
Les cinq ans portent sur l'attestation médicale, et sur elle seule. Périodicité
`autre` — un état à maintenir.

Mais sa validité est **chaînée** : « La validité de cette autorisation de conduite
est subordonnée à la détention, par le travailleur, d'une attestation… ». Une
autorisation sans attestation valide n'est plus valide, alors même que rien ne la
fait « expirer » au calendrier. C'est exactement ce que l'ADR-024 existe pour
nommer : une transmission le déclare, le produit ne le dérive pas.

### Le CACES, qualifié pour ce qu'il est

**Il n'apparaît dans aucun des trois articles** — vérifié sur les trois. Il n'est
pas dans le Code du travail : c'est un dispositif conventionnel porté par des
recommandations de la Caisse nationale d'assurance maladie. Le Code exige une
« formation adéquate » (`R. 4323-55`) et une « autorisation de conduite »
(`R. 4323-56`) ; le CACES est l'un des moyens usuels de démontrer la première, il
n'est pas l'obligation. **Il n'est pas encodé**, et le « recyclage CACES à cinq
ans » non plus : `R. 4323-55` dit « complétée et réactualisée chaque fois que
nécessaire », sans chiffre.

---

## Ce que le lot a dû ajouter au modèle

Aucun `DomaineObligation` existant ne pouvait accueillir ces obligations : les
dix précédents sont tous matériels. Trois domaines sont ajoutés —
`formation_securite`, `sante_travail`, `secours` — et avec eux, par
exhaustivité de type :

- **`LABEL_DOMAINE`** (calendrier) et le compte de la page publique ;
- **`DOMAINES_PRESTATAIRE_ATTENDUS`**, qui exige une contrepartie **non vide**.
  `autre` était exclu — c'est le mot vide que le commentaire du `Record` interdit
  depuis le précédent `froid`. Deux valeurs `DomainePrestataire` sont donc
  ajoutées : **`organisme_formation`** et **`service_sante_travail`**. Le tiers a
  un nom réel dans les deux cas ; l'adhésion à un SPST est elle-même une
  obligation (`L. 4622-1`), et un dirigeant qui n'en a déclaré aucun n'a pas
  seulement un trou de vigilance.
- Deux valeurs **`Realisateur`** : **`medecin_travail`** et
  **`professionnel_sante_travail`**. Le texte distingue les deux — `R. 4624-28`
  réserve le renouvellement du SIR au *médecin*, `R. 4624-10` ouvre la VIP à
  « l'un des professionnels de santé mentionnés au premier alinéa de
  `L. 4624-1` ». Les rabattre sur une valeur resserrerait la VIP au-delà du Code.
  Sans elles, le repli était `exploitant`, qui annonce au dirigeant qu'il réalise
  lui-même un acte qu'il lui est interdit de réaliser.

### Deux migrations — écrites, **non appliquées**

```
prisma/migrations/20260831120000_realisateur_sante_travail/
prisma/migrations/20260831130000_domaine_prestataire_formation_sante/
```

Additives et rétrocompatibles (`ALTER TYPE … ADD VALUE IF NOT EXISTS`), sur le
modèle de `20260828120000_domaine_prestataire_froid`. **C'est à la propriétaire
de les appliquer.** `prisma generate` a été lancé (il ne touche aucune base) ;
`prisma migrate diff --shadow-database-url` ne l'a **pas** été.

---

## Vérification

| | Attendu au départ | Constaté à l'arrivée |
|---|---|---|
| `pnpm vitest run` | 1745 verts | **1745 verts** |
| `npx tsc --noEmit` | propre | **propre** |
| `npx eslint src` | 1 avertissement préexistant | **1** (`normaliserFormData`) |

Tests mis à jour, chacun étant un registre de ce qu'on affirme :
`EMPREINTE_ATTENDUE` (`98-104d0fb8da32927e`), le compte (`98`), la liste des
obligations manquantes (`corpus.test.ts`), la liste des décisions
`pieceMedicale` (`frontiere-medicale.test.ts`), les domaines vus sans équipement
(`chez-vous.test.ts`), et les cinq entrées de `PERIODICITE_SUR_CODE_JUSTIFIEE`
avec leur verbatim.

### Les garanties ont été éprouvées en réinjectant le défaut

Une garantie qu'on n'a pas cassée est une décoration. Les trois qui protègent ce
lot ont été mises en échec exprès, puis rétablies :

| Défaut réinjecté | Ce qui l'a attrapé |
|---|---|
| `conduite-salarie-formation` passée à `quinquennale` — le faux recyclage CACES | « toute périodicité chiffrée s'appuie sur un texte qui porte un chiffre » tombe, en nommant l'obligation |
| une référence à l'arrêté du 26 septembre 2025, jamais dépouillé | le cliquet de `corpus.test.ts` tombe : « une obligation a été ajoutée sur un texte que personne n'a lu » |
| `pieceMedicale` retiré d'une obligation salarié | **`tsc` refuse de compiler** — la garantie est dans le type, pas dans un test |

---

## Ce que je n'ai pas pu établir, et ce que je laisse ouvert

1. **Le modèle n'exprime pas un plafond.** Les trois périodicités « qui ne peut
   excéder » sont encodées comme des périodicités fermes. C'est le point le plus
   discutable du lot ; il tient parce que `TitreSalarie.echeanceLe` prime. Un
   `Periodicite` porteur d'un caractère « maximum » serait un ADR.
2. **Le modèle n'exprime pas un délai à compter d'un fait d'emploi.** Trois
   délais écrits ne sont donc pas calculés : le mois de `R. 4141-20`, les trois
   mois de `R. 4624-10`, et le point de départ de la visite intermédiaire (la
   visite du médecin, non la précédente intermédiaire). Tous rappelés en
   description. Les exposer supposerait une date d'affectation sur `Salarie`.
3. **Divergence assumée avec le précédent électrique.**
   `elec-salarie-attestation-medicale-voisinage` porte le domaine `electricite`
   et le réalisateur `exploitant` — ce dernier annonçant au dirigeant qu'il
   délivre lui-même une attestation médicale. Son jumeau de ce lot porte
   `sante_travail` et `medecin_travail`. **Je ne l'ai pas corrigée** : changer le
   domaine et le réalisateur d'une obligation publiée déplace son empreinte et
   son affichage sur des dossiers vivants. À trancher séparément.
4. **`R. 4224-16` attend un modèle, et je n'en ai pas inventé le nom.** L'article
   exige un *document* ; le produit n'offre qu'un dépôt de fichier — même
   configuration que `R. 4227-39`. Aucune transmission `modele_absent` n'est
   déclarée, parce que `docs/registre-securite-ecart.md` nomme les modèles
   manquants selon une nomenclature que je n'ai pas vérifiée, et qu'inventer un
   nom aurait créé une référence fantôme. À instruire.
5. **Deux conditions de bonne exécution ne sont tracées nulle part** :
   l'association du médecin du travail à l'élaboration des formations
   (`R. 4141-6`) et son avis préalable aux mesures de secours (`R. 4224-16`).
   Aucun champ ne les porte ; en créer un donnerait une case à cocher dont
   personne ne pourrait vérifier la sincérité.
6. **Trois textes cités et non dépouillés**, donc aucune obligation ne s'y
   appuie : l'arrêté du 26 septembre 2025 (formation à la conduite — c'est lui
   qui fixe **quels équipements** exigent une autorisation, ce que le référentiel
   ne peut donc pas dire), le décret n° 2025-748 du 1er août 2025 (déclaration
   au passeport de prévention), et le décret n° 2025-355 lui-même.
7. **`R. 4141-1` renvoie à `L. 4612-16`, abrogé avec le CHSCT.** Le renvoi est
   mort dans le texte lui-même ; ce n'est pas une erreur du référentiel, et il
   est noté au corpus.
8. **La transmission `titre: null` de l'habilitation électrique reste `null`.**
   `R. 4544-10` délivre un titre d'habilitation qu'aucune ligne de catalogue ne
   porte encore. Hors des quatre chantiers de ce lot ; c'est le candidat évident
   pour le suivant.

## Deux documents corrigés en passant

- **Le tableau « état constaté » de ce brief était faux**, et faux dans le sens
  rassurant : il annonçait « 1 fichier / 2 cités » pour la section secours et
  « 1 cité » pour la conduite. Le référentiel ne citait **aucun** de ces articles.
  Les occurrences comptées étaient des `notesInternes` racontant que ces articles
  avaient été cités **par erreur** puis corrigés à l'audit d'août 2026 — des
  traces de correction prises pour des citations valides.
- **`docs/referentiel-conformite.md`** annonçait « Portes et portails
  automatiques — Code du travail `R. 4224-15` ». Le code avait corrigé cette
  erreur en août 2026 ; le document continuait de l'annoncer. `R. 4224-15` traite
  de la formation de secouriste, et il est désormais dépouillé et encodé pour ce
  qu'il est.

C'est la même famille de défaut que ce chantier passe sa journée à retirer : un
document qui affirme ce que le code ne fait pas.

---

# Ce que la revue a corrigé

Huit défauts, aucun dans la lecture des textes, tous dans ce que le lot
**produit**. Deux étaient des régressions que je livrais sans les voir. Les
quatre premiers ont été vérifiés dans le code ou à la source avant d'être
corrigés — deux revendications se sont d'ailleurs révélées plus graves que
l'énoncé du relecteur, et une de mes propres corrections s'est trompée avant
d'être reprise.

## 1. Le lot éteignait le signal qu'il devait compléter — *régression*

`rapprocher()` faisait taire une transmission `titre: null` « dès qu'un titre
quelconque est déclaré ». Juste avec un catalogue d'une ligne : « un titre
quelconque » et « un titre d'électricité » désignaient alors la même chose.

Avec onze lignes, le scénario devient : un restaurateur déclare une installation
électrique, voit « une habilitation est peut-être due », saisit la formation à
la sécurité de sa plongeuse — **le premier geste que ce lot l'invite à faire** —
et le signal disparaît définitivement. Le silence est désormais indexé sur le
**domaine** du titre déclaré. Ce qui reste imparfait est écrit sur place.

## 2. L'écran promettait ce que le générateur ne tenait pas — *régression*

« Rojer n'inventera pas d'échéance », sous le champ « Valable jusqu'au ». Vrai
par coïncidence : le seul titre existant portait `autre`, pour laquelle
`prochaineDate` rend `null`. Mes six titres à durée chiffrée l'ont rendue
fausse — **et la date inventée est le plafond**, donc la plus permissive.

C'est surtout ce qui ruinait le garde-fou que j'invoquais pour encoder ces
plafonds : `echeanceLe` ne prime que si le dirigeant saisit la date, et l'aide du
champ l'en dissuadait. Le garde-fou et l'écran se contredisaient.

## 3 et 4. Deux populations pour lesquelles le suivi médical était faux

Les deux plus graves du lot, et les deux que je signale à la propriétaire :

- **`R. 4624-17`** — pour le travailleur handicapé, celui qui déclare une pension
  d'invalidité et le travailleur de nuit, la VIP suit « une périodicité qui
  n'excède pas une durée de trois ans ». Ma note affirmait que cinq ans est « la
  borne au-delà de laquelle l'employeur est nécessairement en défaut ». Faux de
  deux ans, dans le sens permissif.
- **`R. 4451-82`** — pour le travailleur exposé aux rayonnements ionisants classé
  en **catégorie A**, la visite « est renouvelée chaque année » et « la visite
  intermédiaire n'est pas requise ». Ma note du SIR citait pourtant les
  rayonnements ionisants comme population couverte par ses quatre ans. Quatre ans
  au lieu d'un, **et une échéance que le droit exclut**.

Chacune a reçu sa ligne de catalogue. Ce que le produit ne fera pas : deviner qui
est concerné. Le questionnaire DUERP pose bien `q-travail-nuit`, mais elle porte
sur l'organisation de l'établissement, pas sur des personnes — s'en servir pour
désigner des salariés transformerait une réponse d'établissement en donnée
sensible individuelle.

**Ce qui reste ouvert ici** : les textes propres à quatre des sept expositions du
`R. 4624-23 I` — CMR, agents biologiques 3 et 4, hyperbare, échafaudages — n'ont
pas été ouverts. Amiante et plomb renvoient à R. 4624-22 à -28 sans y déroger,
vérifié. **Ne pas conclure du silence des quatre autres qu'ils ne dérogent pas** :
c'est l'erreur exacte que ces deux corrections viennent de réparer.

## 5. Quatre textes affirmaient l'état d'avant

Dont un qui se contredisait à l'écran : `equipe/page.tsx` imprimait la liste
réelle du catalogue, puis énumérait en dur « SST, CACES, autorisation de
conduite, formations à la sécurité » comme non encodés — trois figuraient dans la
liste deux lignes plus haut.

Le quatrième cas méritait d'être gardé mais retourné : **le CACES n'est pas « pas
encore encodé », il ne le sera jamais.** L'écran le dit désormais, parce que
c'est là qu'on le cherche.

S'y ajoutait le pire des quatre, parce qu'il portait sur mon propre travail :
`prestataires/domaines.ts` affirmait que le rapprochement « sert justement à
faire voir » qu'un dirigeant n'a déclaré aucun service de santé au travail. **La
chaîne ne tourne jamais** — le moteur écarte les porteurs salarié (ADR-023) et
mes obligations d'établissement sont réalisées par l'exploitant. Les entrées sont
prêtes, pas atteintes ; un registre le fige.

*Ma première correction de ce point s'est trompée elle-même* : le test que
j'écrivais pour figer l'état oubliait l'exclusion des porteurs salarié et classait
`sante_travail` parmi les domaines atteints. L'oubli est écrit sur place.

## 6. Le parc de levage ne nommait pas la conduite

Un commerce déclarait un gerbeur et n'apprenait jamais que son cariste doit une
formation à la conduite — alors que le fait déclencheur était déjà déclaré. Deux
transmissions posées, sur les deux obligations portant des machines qu'on
*conduit* : dix signaux identiques auraient été du bruit, et le bruit fait
ignorer le signal.

## 7. Les textes remis aux personnes ne parlaient que d'« attestation »

Un salarié en suivi renforcé lisait « examen par le médecin du travail », puis
une clause de réassurance qui ne couvrait que les attestations. La protection
s'appliquait — le drapeau la porte — mais rien ne le lui disait, et c'est à lui
que ce texte s'adresse.

`docs/rgpd.md` § 2.3 ne citait qu'un cas de copie légalement détenue ; le décret
n° 2025-355 en a créé deux le même jour.

## 8. Quatre imprécisions de corpus

Un corpus dit ce qu'on a lu ; ses imprécisions se lisent comme des lectures. URL
ne couvrant que le chapitre législatif d'un corpus déclaré intégral sur deux
chapitres ; « deux alinéas non encodés » là où il y en a trois, l'oublié étant la
tenue à disposition de l'inspection ; « sans condition d'effectif » démenti par
le 2° de `R. 4224-15` ; et une migration fondée sur `L. 4622-1`.

**Sur ce dernier point je n'ai pas suivi la correction proposée.** Le relecteur
donnait `L. 4622-7`. Je n'ai ouvert ni l'un ni l'autre, et le titre II du livre VI
n'est dépouillé par aucun corpus : trancher entre deux articles non lus aurait
été refaire l'erreur en la déplaçant. La citation est **retirée**, le domaine se
fondant désormais sur `R. 4624-10` et `R. 4624-28`, lus à la source.

---

## Ajouté hors revue

**`equipe_pluridisciplinaire`**, demandé par le lot 8 pour la fiche d'entreprise
et vérifié à la source avant d'être posé : `R. 4624-46` écrit « le médecin du
travail **ou**, dans les services de prévention et de santé au travail
interentreprises, l'équipe pluridisciplinaire ». C'est le cas ordinaire de la
cible — une TPE adhère à un service interentreprises. Troisième migration
additive, écrite et non appliquée.

## Ce qui reste ouvert après revue

Les huit points de la première version tiennent, moins le n° 4 (`R. 4224-16`
attend toujours un modèle, mais la tenue à disposition de `R. 4323-56` s'y ajoute
comme second cas du même manque). S'y ajoutent :

9. **Les intitulés médicaux sortent en clair du serveur MCP.** Ce n'est pas une
   violation du § 2.3 — un intitulé d'obligation n'est pas une donnée de santé —
   et `docs/rgpd.md` § 6 posait déjà la question. Mais on passe d'**un** intitulé
   médical à **cinq**, et un assistant branché en lecture seule sur le dossier
   restitue désormais « suivi individuel renforcé » pour une personne nommée.
   Signalé à la propriétaire, **non modifié**.
10. **Quatre des sept expositions du `R. 4624-23 I` n'ont pas été ouvertes** (voir
    § 3 et 4 ci-dessus). C'est le point le plus susceptible de cacher une
    troisième dérogation.
11. **Le modèle n'a toujours pas de notion de plafond**, et trois obligations en
    encodent un. Chaque `notesInternes` porte la consigne : ne pas retirer la
    primauté d'`echeanceLe` sans repasser l'obligation à `autre`.
