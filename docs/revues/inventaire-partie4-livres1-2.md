# Inventaire de couverture — Code du travail, quatrième partie, livres I et II

**Document de constat. Il ne recommande rien et ne modifie aucun référentiel.**
Établi le 2026-09-02.

---

## 1. Le plan a été consulté, pas récité

Le plan retenu ci-dessous vient de Légifrance, pages de sommaire ouvertes ce jour :

| Ce qui a été ouvert | URL |
|---|---|
| Quatrième partie (sommaire) | `codes/section_lc/LEGITEXT000006072050/LEGISCTA000006132338/` |
| Livre Ier — partie législative | `.../LEGISCTA000006145407/` |
| Livre Ier — partie réglementaire | `.../LEGISCTA000018488238/` |
| Livre II — partie législative | `.../LEGISCTA000006145408/` |
| Livre II — partie réglementaire | `.../LEGISCTA000018488606/` |
| Livre II, Titre Ier (maître d'ouvrage) | `.../LEGISCTA000018488608/` |
| Livre II, Titre II (employeur) | `.../LEGISCTA000018488852/` |

**Le brief de commande se trompait sur deux points de plan, et c'est le plan qui tranche.**

1. **Le livre II n'a pas six titres, il en a trois** : Titre Ier « Obligations du maître
   d'ouvrage pour la conception des lieux de travail » (R. 4211-1 à R. 4217-2), Titre II
   « Obligations de l'employeur pour l'utilisation des lieux de travail » (L. 4221-1 à
   L. 4228-1 / R. 4221-1 à R. 4228-37), Titre III « Vigilance du donneur d'ordre en
   matière d'hébergement » (L. 4231-1 / R. 4231-1 à R. 4231-4). Ce que le brief appelait
   « titres I à VI » est la liste des **chapitres du Titre II**.
2. **`R. 4111-*` n'existe pas.** Le Titre Ier du livre Ier n'a aucune disposition
   réglementaire : la partie réglementaire du livre Ier commence à `R. 4121-1` et finit à
   `D. 4163-48`. Le périmètre réel est donc `L. 4111-1 → L. 4163-22` et
   `R. 4121-1 → D. 4163-48` pour le livre I, `L. 4221-1 → L. 4231-1` et
   `R. 4211-1 → R. 4231-4` pour le livre II.

Le Titre VI du livre Ier ne porte pas non plus le nom que lui donne le brief : ce n'est pas
« pénibilité » mais « Dispositions relatives à la prévention des effets de l'exposition à
certains facteurs de risques professionnels **et au compte professionnel de prévention** ».
Le mot compte : l'obligation qui en sort est une **déclaration annuelle**, pas une
évaluation.

## 2. Ce qui a été lu dans le dépôt, et comment

Les statuts ci-dessous ne sont pas comptés au grep. Ils viennent de l'exécution du module
`src/lib/referentiels/corpus/index.ts` (les 37 corpus, article par article, avec leur
`statut`) et de `src/lib/referentiels/conformite` (les 135 obligations et leurs
`referencesLegales`). Le grep n'a servi qu'à **chercher hors corpus** — et il a trouvé :
deux articles du périmètre sont lus à la source dans
`src/lib/referentiels/documents-obligatoires.ts`, avec `citationCle`,
`versionConstatee` et `luLe`, sans entrée de corpus (`R. 4121-1`, `D. 4132-1`).

### Vocabulaire

- **couvert** — au moins un article du chapitre est lu et classé dans le dépôt. Précisé
  *intégral* ou *partiel*, avec ce qui manque.
- **écarté** — un motif écrit existe (CLAUDE.md § « Hors périmètre », `statut:
  "hors_perimetre"` au corpus avec son `MotifExclusion`, ou un ADR).
- **jamais ouvert** — aucun article du chapitre n'est lu nulle part.

Un quatrième cas est apparu et il est signalé en clair partout où il se présente :
**« lu hors corpus »** — le chapitre a été ouvert et cité verbatim dans un document de
revue (`docs/revues/lot-d3-recoupement-droit.md`) sans qu'aucun article n'entre au corpus.
Ce n'est pas « jamais ouvert » — écrire « rien, nulle part » serait faux — et ce n'est pas
« écarté » : la revue conclut l'inverse (« FONDÉE. Dans le périmètre matériel »).

**Aucun chapitre du périmètre ne porte de motif d'exclusion écrit.** Le vocabulaire
d'exclusion existe (`src/lib/referentiels/corpus/perimetre.ts`, quatre motifs dont
`construction`), mais il n'est appliqué à **aucun** article des livres I et II : les 22
entrées `hors_perimetre` du corpus — comptées en appelant le module, pas au grep — visent
toutes des arrêtés (17 articles PE de l'arrêté du 25 juin 1980, l'annexe IV de l'arrêté du
26 décembre 2011, l'article 7 de l'arrêté du 21 décembre 2004, les articles 97 à 99 de
l'arrêté du 31 janvier 1986). **Aucune ne vise un article du Code du travail.**
La seule exclusion écrite qui morde sur ce périmètre est infra-chapitre : **ATEX**
(CLAUDE.md), soit la section 6 du chapitre VII, `R. 4227-42` à `R. 4227-54`.

---

## 3. Livre Ier — Dispositions générales

### Titre Ier — Champ et dispositions d'application

| Chapitre | Articles | Statut | Ce qui est lu / ce qui manque | Obligation plausible pour une TPE des 3 secteurs |
|---|---|---|---|---|
| Chapitre unique | L. 4111-1 à L. 4111-6 · aucune disposition réglementaire | **jamais ouvert** | Rien. `L. 4111-1` à `L. 4111-3` n'apparaissent que **dans le verbatim d'un arrêté** (`arrete-2004-03-01-levage.ts`, qui borne son champ par renvoi) — ce n'est pas une lecture du chapitre | **Non.** Ouvert ce jour : `L. 4111-1` délimite le champ (employeurs de droit privé et leurs travailleurs), `L. 4111-6` habilite les décrets. Aucune prescription, ni périodique ni permanente |

### Titre II — Principes généraux de prévention

| Chapitre | Articles | Statut | Ce qui est lu / ce qui manque | Obligation plausible pour une TPE des 3 secteurs |
|---|---|---|---|---|
| I — Obligations de l'employeur | L. 4121-1 à L. 4121-5 · R. 4121-1, R. 4121-1-1, R. 4121-2, R. 4121-3, R. 4121-4, R. 4121-5 (D. 4121-5 à D. 4121-9 abrogés au 1ᵉʳ janvier 2015) | **couvert — partiel, 2 articles sur 11** | Lus : `R. 4121-1` (`documents-obligatoires.ts`, verbatim, version 2011-04-01, lu le 2026-09-01) et `R. 4121-4` (corpus `code-travail-information-travailleurs`, dernier alinéa seul). **Non lus : `L. 4121-1` à `L. 4121-5`, `R. 4121-1-1`, `R. 4121-2`, `R. 4121-3`, `R. 4121-5`.** `L. 4121-3-1` est cité deux fois avec version constatée mais n'a **aucune entrée de corpus** | — (chapitre couvert ; voir § 6, c'est le trou le plus lourd de l'inventaire) |
| II — Obligations des travailleurs | L. 4122-1, L. 4122-2 · aucune disposition réglementaire | **jamais ouvert** | Rien. `L. 4122-1` n'apparaît qu'**à l'intérieur du verbatim de `L. 1321-1`** recopié dans `code-travail-organisation-prevention.ts` | **Non, pas à la charge de l'employeur.** Ouvert ce jour : `L. 4122-1` met une obligation de prudence sur le travailleur ; `L. 4122-2` interdit d'en faire supporter la charge financière au travailleur. Aucune échéance |

### Titre III — Droits d'alerte et de retrait

| Chapitre | Articles | Statut | Ce qui est lu / ce qui manque | Obligation plausible pour une TPE des 3 secteurs |
|---|---|---|---|---|
| I — Principes | L. 4131-1 à L. 4131-4 · aucune disposition réglementaire | **jamais ouvert** | Rien. `L. 4131-2` n'apparaît qu'à l'intérieur du verbatim de `D. 4132-1` | **Non directement.** Ouvert ce jour : le chapitre organise le droit du **travailleur** d'alerter et de se retirer, et la suite donnée par l'employeur. Aucun acte daté |
| II — Conditions d'exercice | L. 4132-1 à L. 4132-5 · D. 4132-1, D. 4132-2 | **couvert — partiel, 1 article sur 7** | Lu : `D. 4132-1` (`documents-obligatoires.ts`, entrée `registre-danger-grave-imminent`, verbatim, version 2018-01-01, lu le 2026-09-01, `produitParRojer: false`). Non lus : `L. 4132-1` à `-5`, `D. 4132-2` | — |
| III — Alerte en matière de santé publique et d'environnement | L. 4133-1 à L. 4133-4 · D. 4133-1 à D. 4133-3 | **jamais ouvert** | Rien, nulle part | **Marginale.** Ouvert ce jour : `L. 4133-1` vise le travailleur qui estime que « les produits ou procédés de fabrication utilisés ou mis en œuvre par l'établissement font peser un risque grave sur la santé publique ou l'environnement », et l'alerte « est consignée par écrit ». **État permanent** (un registre), et un déclencheur qui vise l'industrie plus que le comptoir |

### Titre IV — Information et formation des travailleurs

| Chapitre | Articles | Statut | Ce qui est lu / ce qui manque | Obligation plausible pour une TPE des 3 secteurs |
|---|---|---|---|---|
| I — Obligation générale | L. 4141-1 à L. 4141-5 · R. 4141-1 à R. 4141-20 (+ R. 4141-3-1) | **couvert — INTÉGRAL, 26 articles sur 26** | Corpus `code-travail-formation-securite`, `etendue: "integral"`, aucun `non_depouille`. 3 articles y sont classés `obligation_manquante` (`L. 4141-5` passeport de prévention, `R. 4141-8`, `R. 4141-12`) | — |
| II — Formations particulières | L. 4142-1 à L. 4142-4 · aucune disposition réglementaire | **jamais ouvert** | **Zéro occurrence** dans `src/`, `docs/`, `spec/`, `scripts/`, `prisma/` | **Oui.** `L. 4142-2` : les salariés en CDD et les salariés temporaires « affectés à des postes de travail présentant des risques particuliers » bénéficient d'une **formation renforcée à la sécurité**. `L. 4142-4` : toute modification du poste pour raisons de sécurité ouvre « une période d'adaptation de deux semaines au moins ». **Ponctuel à l'affectation, pas périodique** ; les extras et saisonniers de la restauration et du commerce y sont en plein |
| III — Consultation des représentants | L. 4143-1 · R. 4143-1, R. 4143-2 | **jamais ouvert** | **Zéro occurrence** | **Faible.** `L. 4143-1` : le CSE « est consulté sur les programmes de formation et veille à leur mise en œuvre effective ». Suppose un CSE, donc onze salariés. **État permanent**, pas d'échéance chiffrée |

### Titre V — Dispositions particulières à certaines catégories de travailleurs

| Chapitre | Articles | Statut | Ce qui est lu / ce qui manque | Obligation plausible pour une TPE des 3 secteurs |
|---|---|---|---|---|
| I — Champ d'application | L. 4151-1 · aucune disposition réglementaire | **jamais ouvert** | Zéro occurrence | **Non.** Ouvert ce jour : article de champ |
| II — Femmes enceintes, venant d'accoucher ou allaitant | L. 4152-1, L. 4152-2 · R. 4152-2 à D. 4152-29 | **jamais ouvert** | Zéro occurrence dans `src/` ; une seule ligne de recensement en `docs/carto-obligations-hors-equipement.md` (E12, statut ❌) | **Partiellement.** `L. 4152-1` pose une interdiction d'affectation à certains travaux ; les sections réglementaires déclinent agents biologiques, rayonnements, ACD, manutention. Le local d'allaitement (`R. 4152-13` et s.) suppose un effectif que les 3 secteurs cibles n'atteignent pas. **États permanents**, aucune périodicité |
| III — Jeunes travailleurs | L. 4153-1 à L. 4153-9 · D. 4153-1 à R. 4153-52 | **jamais ouvert** | Zéro occurrence dans `src/` ; une ligne de recensement en carto (E11, ❌, « CT R.4153-38 et s. », référence *présumée* de l'aveu du document) | **Oui, franchement.** `R. 4153-41` : déclaration de dérogation adressée à l'inspection du travail « par tout moyen conférant date certaine » avant d'affecter un mineur en formation à des travaux réglementés. `R. 4153-44` : « La déclaration prévue à l'article R. 4153-41 **est renouvelée tous les trois ans** ». `R. 4153-40` : évaluation des risques, actions de prévention, formation, encadrement et **avis médical d'aptitude annuel**. **Deux échéances périodiques écrites** (3 ans, 1 an). Apprentis mineurs en cuisine et en commerce : cas central, pas cas limite |
| IV — Salariés en CDD et salariés temporaires | L. 4154-1 à L. 4154-4 · D. 4154-1 à D. 4154-6 | **jamais ouvert** | **Zéro occurrence** | **Oui.** `L. 4154-2` : la **liste des postes à risques particuliers** « est établie par l'employeur, après avis du médecin du travail et du comité social et économique, s'il existe. Elle est tenue à la disposition des agents de contrôle de l'inspection du travail ». `L. 4154-3` en fait une présomption de faute inexcusable en cas d'AT. **État permanent**, universel dès le premier extra ou intérimaire |

### Titre VI — Prévention des effets de l'exposition à certains facteurs de risques professionnels et compte professionnel de prévention

| Chapitre | Articles | Statut | Ce qui est lu / ce qui manque | Obligation plausible pour une TPE des 3 secteurs |
|---|---|---|---|---|
| I — Facteurs de risques professionnels | L. 4161-1 · D. 4161-1 à R. 4161-5 | **jamais ouvert au corpus — mais lu hors corpus** | Aucune entrée de corpus, aucune `ReferenceLegale`. `L. 4161-1` est ouvert et cité **verbatim intégral** dans `docs/revues/lot-d3-recoupement-droit.md` (version en vigueur depuis le 2017-10-01) | **Non par lui-même** — la revue le constate : « `L. 4161-1` n'impose rien. C'est un article de définition. » Il ne fait que nommer les dix facteurs |
| II — Accords en faveur de la prévention | D. 4162-1 à R. 4162-8 (partie L. : L. 4162-1 à L. 4162-18) | **jamais ouvert** | Zéro occurrence | **Non.** Ouvert ce jour : `D. 4162-1` conditionne le dispositif à des **proportions minimales de salariés exposés et à un indice de sinistralité**, avec des seuils d'effectif ; les sections 2 et 3 sont procédure et pénalité administrative |
| III — Compte professionnel de prévention | L. 4163-1 à L. 4163-22 · D. 4163-1 à D. 4163-48 (dont R. 4163-1 à R. 4163-30) | **jamais ouvert au corpus — mais lu hors corpus** | Aucune entrée de corpus. `L. 4163-1`, `D. 4163-2`, `D. 4163-3`, `D. 4163-4` et `R. 4163-8` sont ouverts, datés et cités verbatim dans `lot-d3-recoupement-droit.md`, verdict « **FONDÉE. Dans le périmètre matériel, partiellement hors du périmètre outillé** » | **Oui, sous seuils.** `R. 4163-8` : « Au terme de chaque année civile et au plus tard au titre de la paie du mois de décembre, l'employeur déclare […] » — **échéance annuelle avec date butoir**, portée par la DSN. `D. 4163-4` : fiche individuelle de suivi, « au terme de chaque année civile ». `D. 4163-2` fixe les seuils : 900 h/an à ≥ 30 °C, 100 nuits/an d'heure travaillée **entre minuit et 5 h**. Une cuisine de restaurant peut les atteindre ; une boutique et un bureau, non |

---

## 4. Livre II — Dispositions applicables aux lieux de travail

### Titre Ier — Obligations du maître d'ouvrage pour la conception des lieux de travail

Les sept chapitres sont **jamais ouverts**, sans exception et sans motif écrit. Le motif
existerait pourtant : `perimetre.ts` porte l'exclusion `construction` (« Le produit
accompagne l'exploitation d'un établissement existant »). **Elle n'est appliquée à aucun
de ces articles**, donc au sens de cet inventaire ce titre n'est pas écarté, il est vide.

| Chapitre | Articles | Statut | Ce qui est lu / ce qui manque | Obligation plausible pour une TPE des 3 secteurs |
|---|---|---|---|---|
| I — Principes généraux (dont dossier de maintenance) | R. 4211-1 à R. 4211-5 | **jamais ouvert** | `R. 4211-3` apparaît **dans deux verbatims recopiés** (`code-travail-portes.ts`, `arrete-1993-12-21-portes.ts`) et en carto D6 (❌). Aucun article n'a d'entrée | **Oui, par ricochet.** Ouvert ce jour : `R. 4211-3` met le dossier de maintenance des lieux de travail à la charge du **maître d'ouvrage**, mais `R. 4211-5` dispose que « Le dossier de maintenance des lieux de travail **est tenu à la disposition de l'inspection du travail** et des agents des services de prévention des organismes de sécurité sociale ». **État permanent** à la charge de qui détient les lieux |
| II — Aération et assainissement | R. 4212-1 à R. 4212-7 | **jamais ouvert** | `R. 4212-7` apparaît dans deux verbatims recopiés et dans l'extrait AOCR (`docs/audit-aocr/`) | **Non directement.** `R. 4212-7` : c'est le **maître d'ouvrage** qui transmet la notice d'instructions à l'employeur. L'obligation de l'employeur qui en découle est la consigne de `R. 4222-21`, chapitre voisin |
| III — Éclairage, insonorisation et ambiance thermique | R. 4213-1 à R. 4213-9 | **jamais ouvert** | Zéro occurrence | **Non directement.** `R. 4213-4` : « Le maître d'ouvrage consigne dans une notice d'instructions qu'il transmet à l'employeur les niveaux minimum d'éclairement […] ». Destinataire : maître d'ouvrage |
| IV — Sécurité des lieux de travail | R. 4214-1 à R. 4214-28 | **jamais ouvert** | Zéro occurrence | **Non.** Cinq sections de conception : caractéristiques des bâtiments, voies de circulation, quais et rampes, aménagement, accessibilité des travailleurs handicapés. Aucun acte d'exploitant |
| V — Installations électriques des bâtiments | R. 4215-1 à R. 4215-17 | **jamais ouvert** | Zéro occurrence dans `src/` ; l'extrait AOCR cite `R. 4215-2` | **Oui, par ricochet.** `R. 4215-2` : « Le maître d'ouvrage établit et transmet à l'employeur un dossier technique comportant la description et les caractéristiques des installations électriques réalisées. » Pièce que l'exploitant détient et présente. **État permanent** |
| VI — Risques d'incendies, d'explosions et évacuation | R. 4216-1 à R. 4216-34 | **jamais ouvert** | `R. 4216-2` n'apparaît qu'**dans le verbatim de `R. 4227-38`** recopié au corpus incendie | **Non.** Dégagements, désenfumage, résistance au feu : dimensionnement à la construction |
| VII — Installations sanitaires, restauration | R. 4217-1, R. 4217-2 | **jamais ouvert** | Zéro occurrence | **Non.** Ouvert ce jour : `R. 4217-1` renvoie en conception aux exigences de `R. 4228-1` à `-15` et `R. 4228-22` à `-25` ; `R. 4217-2` traite du cabinet d'aisance accessible quand il y en a dix ou plus. Règles de conception |

### Titre II — Obligations de l'employeur pour l'utilisation des lieux de travail

C'est le titre du périmètre qui porte le plus d'obligations d'exploitant, et le seul où le
dépôt a lu quelque chose.

| Chapitre | Articles | Statut | Ce qui est lu / ce qui manque | Obligation plausible pour une TPE des 3 secteurs |
|---|---|---|---|---|
| I — Dispositions générales | L. 4221-1 · R. 4221-1 | **jamais ouvert** | `L. 4221-1` apparaît dans trois verbatims recopiés (arrêté levage, `R. 4141-*`). Aucune entrée | **Non.** Ouvert ce jour : `R. 4221-1` **définit** le lieu de travail. Aucune prescription |
| II — Aération, assainissement | R. 4222-1 à R. 4222-26 | **couvert — partiel, 3 sur 26** | Lus : `R. 4222-20` (retenu), `R. 4222-21` (`obligation_manquante` — la consigne d'utilisation de la ventilation n'est encodée nulle part), `R. 4222-22` (sans objet). **Non lus : 23 articles**, dont toute la section 3 « locaux à pollution spécifique » (`R. 4222-10` à `-17`), les eaux usées, le travail en espace confiné et la protection individuelle | — |
| III — Éclairage, ambiance thermique | R. 4223-1 à R. 4223-15 | **jamais ouvert** | **Aucune entrée, aucune `ReferenceLegale`.** Trois mentions seulement : `R. 4223-4` en texte d'aide d'écran (`CotationForm.tsx`) et dans le PDF DUERP, `R. 4223-11` **à l'intérieur du verbatim de `R. 4224-17`** recopié au corpus | **Oui, et c'est le plus universel des jamais-ouverts du livre II.** Ouvert ce jour : `R. 4223-11` — « Le matériel d'éclairage est installé de manière à pouvoir être entretenu aisément. **L'employeur fixe les règles d'entretien périodique** du matériel » et les communique au CSE. **Périodique, et l'écrit qui la porte est déjà à demi encodé** : `R. 4224-17`, qui est au corpus, agrège nommément « la consigne et les documents prévus […] aux articles R. 4222-21 et R. 4223-11 ». Le dépôt cite le contenant sans le contenu. Le reste du chapitre est un état permanent : `R. 4223-4` (40 à 200 lux), `R. 4223-13` à `-15` (ambiance thermique) |
| IV — Sécurité des lieux de travail | R. 4224-1 à R. 4224-24 | **couvert — partiel, 5 sur 24** | Lus : `R. 4224-13`, `R. 4224-17` (corpus portes), `R. 4224-14`, `R. 4224-15`, `R. 4224-16` (corpus secours, `etendue: integral` sur la section 3 seule). **Non lus : la section 1 « Caractéristiques des lieux de travail » entière (`R. 4224-1` à `-8` — propreté, nettoyage, évacuation des déchets), `R. 4224-9` à `-12`, `R. 4224-18`, `R. 4224-19`, et la section 5 « Signalisation et matérialisation » entière (`R. 4224-20` à `-24`)** | — |
| V — Aménagement des postes de travail | R. 4225-1 à R. 4225-8 | **couvert — partiel, 2 sur 8** | Lus : `R. 4225-2` (retenu, réécrit au 2025-06-02 par le décret n° 2025-482), `R. 4225-3` (`obligation_manquante`, boisson gratuite). **Non lus : `R. 4225-1` (postes extérieurs), `R. 4225-4`, `R. 4225-5`, et la section 3 « Travailleurs handicapés » entière (`R. 4225-6` à `-8`)** | — |
| VI — Installations électriques | R. 4226-1 à R. 4226-21 | **couvert — partiel, 3 sur 21** | Lus : `R. 4226-14`, `R. 4226-16`, `R. 4226-19`. **Non lus : 18 articles**, dont la section 1 « Champ d'application et définitions » (`R. 4226-1` à `-4`), `R. 4226-5` à `-13` (surveillance, entretien, opérations) et `R. 4226-20`, `R. 4226-21` | — |
| VII — Risques d'incendies et d'explosions et évacuation | R. 4227-1 à R. 4227-57 | **couvert — partiel, 7 sur 57** | Lus : `R. 4227-14`, `-28`, `-29`, `-34`, `-37`, `-38`, `-39`. **Non lus : 50 articles** — section 1 champ (`-1` à `-3`), dégagements (`-4` à `-13`), chauffage (`-15` à `-21`), emploi et stockage de matières explosives et inflammables (`-22` à `-27`), `-30` à `-33`, `-35`, `-36`, `-40`, `-41`, et les dispenses de l'autorité administrative (`-55` à `-57`). La section 6 « Prévention des explosions » (`-42` à `-54`) est **la seule zone du périmètre couverte par un motif d'exclusion écrit** : ATEX, CLAUDE.md § Hors périmètre — mais l'exclusion n'est pas portée par une entrée de corpus | — |
| VIII — Installations sanitaires, restauration et hébergement | L. 4228-1 · R. 4228-1 à R. 4228-37 | **couvert — partiel, 3 sur 38** | Lus : `R. 4228-1`, `R. 4228-22`, `R. 4228-23`. La `portee` du corpus déclare elle-même le reste non dépouillé. **Non lus : `L. 4228-1`, `R. 4228-2` à `-18` (vestiaires, lavabos, douches, cabinets d'aisance), `R. 4228-19` à `-21`, `R. 4228-24`, `R. 4228-25`, et toute la section 3 « Hébergement » (`R. 4228-26` à `-37`)** | — |

### Titre III — Vigilance du donneur d'ordre en matière d'hébergement

| Chapitre | Articles | Statut | Ce qui est lu / ce qui manque | Obligation plausible pour une TPE des 3 secteurs |
|---|---|---|---|---|
| Chapitre unique | L. 4231-1 · R. 4231-1 à R. 4231-4 | **jamais ouvert** | **Zéro occurrence** | **Faible.** Ouvert ce jour : le dispositif (décret n° 2015-364, lutte contre la fraude au détachement) fait suite à une **injonction de l'agent de contrôle** : réponse du donneur d'ordre sous vingt-quatre heures, puis prise en charge à ses frais de l'hébergement collectif conforme à `R. 4228-26` à `-37`. **Événementiel**, jamais périodique, et il suppose de faire héberger les salariés d'un sous-traitant |

---

## 5. Ce que je n'ai pas pu établir

1. **Le compte exact d'articles de trois chapitres réglementaires du livre Ier.** Les
   sommaires du Titre V (`R. 4152-*`, `D. 4153-*`, `D. 4154-*`) et du Titre VI
   (`D. 4161-*` à `D. 4163-48`) n'ont pas été dépliés article par article : j'ai les
   sections et les bornes, pas l'énumération. Les statuts « jamais ouvert » n'en dépendent
   pas — ils sont établis par l'absence de toute occurrence dans le dépôt — mais je ne peux
   pas écrire « 0 sur N » pour ces chapitres comme je le fais pour le livre II.
2. **Une lecture du sommaire de Légifrance a produit un plan faux, et je l'ai écartée.**
   Une des pages du Livre Ier réglementaire m'a été rendue avec un « Titre VI : Surveillance
   médicale des travailleurs » et quatre chapitres inventés. Le titre réel a été
   contre-vérifié sur sa propre page de section (`LEGISCTA000029560008`) avant d'entrer ici.
   Je le signale parce que c'est exactement l'angle mort que la consigne du dépôt vise :
   deux lectures peuvent concorder et se tromper ensemble.
3. **Je n'ai pas ouvert `D. 4154-1` à `D. 4154-6`** (travaux dangereux interdits aux CDD et
   intérimaires). Le chapitre IV du Titre V est classé « jamais ouvert » sur son versant
   législatif, ouvert et cité ; son versant réglementaire, non.
4. **Je n'ai pas instruit la question de savoir si l'exclusion `construction` de
   `perimetre.ts` *devrait* couvrir le Titre Ier du livre II.** Je constate seulement
   qu'elle ne le couvre pas aujourd'hui : aucun article `R. 4211-*` à `R. 4217-*` ne porte
   d'entrée, donc aucun ne porte de motif. Trancher est une décision, pas un constat.

### Deux écarts relevés en chemin, hors commande

- **Une `portee` annonce un article qui n'est pas là.**
  `src/lib/referentiels/corpus/code-travail-portes.ts` écrit : « Section 2 “Portes et
  portails” (**R. 4224-12**, R. 4224-13) ». Le corpus ne contient que deux entrées,
  `R. 4224-13` et `R. 4224-17`. `R. 4224-12` — « Les portes et portails sont entretenus et
  contrôlés régulièrement » — n'est ni dépouillé ni cité par une obligation.
- **`L. 4121-3-1` est cité deux fois avec `versionConstatee` et `luLe`, sans entrée de
  corpus.** Il fonde la conservation quarante ans et la liste d'actions de prévention, deux
  choses que le produit sert. `referencesDepouillees()` ne le connaît pas.

---

## 6. Le compte

Le chapitre est compté une fois, ses versants législatif et réglementaire réunis — c'est
ainsi que le code lui-même les fait correspondre.

| | Livre Ier | Livre II | **Total** |
|---|---|---|---|
| Chapitres du périmètre | 16 | 16 | **32** |
| **couverts** | 3 | 6 | **9** |
| — dont intégral | 1 | 0 | **1** |
| — dont partiel | 2 | 6 | **8** |
| **écartés avec motif écrit** | 0 | 0 | **0** |
| **jamais ouverts** | 13 | 10 | **23** |
| — dont lus hors corpus (revue, sans entrée) | 2 | 0 | **2** |

**9 chapitres couverts, 0 écartés avec motif, 23 jamais ouverts.**

Un seul chapitre sur trente-deux est lu de bout en bout : le chapitre Ier du Titre IV du
livre Ier, information et formation à la sécurité. Sur les huit chapitres couverts
partiellement, la couverture va de 2 articles sur 8 à 3 articles sur 57.

Le chapitre le plus lourdement partiel n'est pas le plus gros : c'est le chapitre Ier du
Titre II du livre Ier — **2 articles lus sur 11**, aucun au corpus des deux. `R. 4121-2`,
qui porte la mise à jour du document unique « au moins chaque année dans les entreprises
d'au moins onze salariés » (version en vigueur depuis le 2022-03-31), n'est lu nulle part.
`R. 4121-1-1`, dont le PDF du produit imprime une annexe qui porte son numéro
(`src/lib/pdf/DuerpDocument.tsx:725`), n'est lu nulle part. `R. 4121-5`, qui oblige
l'employeur à informer l'agent de contrôle de l'inspection du travail en cas d'accident du
travail mortel (version en vigueur depuis le 2023-06-12), n'est lu nulle part.
