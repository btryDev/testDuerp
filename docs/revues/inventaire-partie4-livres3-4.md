# Inventaire de couverture — Code du travail, quatrième partie, livres III et IV

**Nature du document : constat.** Aucun fichier de référentiel n'a été modifié.
Aucun encodage n'est proposé, aucun chantier n'est recommandé.

**Date du relevé : 2026-09-02.** Plan et articles relevés sur Légifrance ce jour
(`LEGITEXT000006072050`). Le plan n'est pas récité de mémoire : chaque titre,
chaque chapitre et chaque plage d'articles ci-dessous vient d'une page
Légifrance ouverte, et la colonne « lecture » dit par quel moyen.

---

## 0. Comment lire ce document

### Les trois statuts

| Statut | Ce qu'il veut dire |
|---|---|
| **couvert** | Des articles du chapitre sont au corpus (`src/lib/referentiels/corpus/*.ts`). Intégral ou partiel, et ce qui manque est dit. |
| **écarté** | Le chapitre est hors périmètre produit **et un motif écrit existe** — `.claude/CLAUDE.md` § « Hors périmètre », une entrée `statut: "hors_perimetre"` au corpus, ou un ADR. |
| **jamais ouvert** | Ni corpus, ni obligation, ni motif d'exclusion. |

### La nuance qu'il faut poser avant de compter

Huit chapitres « jamais ouverts » portent tout de même **une trace** dans le
dépôt : une citation d'article dans un référentiel DUERP (`commun.ts`,
`restauration.ts`), dans le PDF, dans un écran, ou un dépouillement rendu en
revue et jamais encodé. Ce n'est ni du corpus, ni une obligation, ni un motif :
ils restent **jamais ouverts** au sens du tableau, et la colonne « trace »
enregistre l'exception. Le compte final est donc reproductible : il porte sur
la présence au corpus, à l'ensemble des obligations, et aux motifs
d'exclusion — rien d'autre.

### Ce qui a été lu, et comment

- **lu (verbatim)** — page Légifrance ouverte par `WebFetch`, texte de l'article
  relevé.
- **plan lu** — page de titre ou de chapitre Légifrance ouverte : intitulés et
  plages d'articles relevés, articles non ouverts un à un.
- **titre relevé** — intitulé et plage d'articles pris sur le **titre de page
  Légifrance** rendu par une recherche (`site:legifrance.gouv.fr`). C'est la
  source officielle pour l'intitulé et la plage ; ce n'est **pas** une lecture
  du texte des articles.

Là où je n'ai pas ouvert, j'écris **« non ouvert par moi »**. Je n'écris nulle
part « probablement ».

### Une remarque de méthode sur l'outil

`WebFetch` rend Légifrance à travers un résumeur. Sur les pages longues il a
**inventé deux fois** un intitulé qu'il ne pouvait pas lire : les sections du
chapitre `R. 4324-*` et l'intitulé de la section 9 du chapitre `R. 4323-*` sont
revenus faux ou tronqués d'une première passe, la page l'annonçant elle-même
(« les intitulés exacts […] ne sont pas détaillés dans le contenu fourni »).
Les deux ont été repris sur les titres de page Légifrance. **Tout intitulé de ce
document vient soit d'une page ouverte, soit d'un titre de page Légifrance ;
aucun ne vient d'une reformulation.**

---

## 1. Livre III — Équipements de travail et moyens de protection

**Plan réel, relevé le 2026-09-02.**
Partie réglementaire : `R. 4311-1` à `R. 4324-53`
([LEGISCTA000018489300](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018489300/)).
Partie législative : `L. 4311-1` à `L. 4321-5`
([LEGISCTA000006145409](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000006145409/)).
**Deux titres, huit chapitres.** Il n'y a pas de titre III.

### Titre Ier — Conception et mise sur le marché des équipements de travail et des moyens de protection (`R. 4311-1` à Annexe II à l'art. `R. 4312-6`)

| Chapitre | Intitulé exact | Articles | Statut | Lecture | Constat |
|---|---|---|---|---|---|
| `R. 4311-*` | Règles générales | `R. 4311-1` à `R. 4311-13` | **jamais ouvert** | titre relevé + `R. 4311-1` en résumé | Zéro occurrence de `4311-` dans `src/`, `docs/`, `spec/`. `R. 4311-1` définit ce qu'est un équipement « mis sur le marché pour la première fois », « neuf » ou « à l'état neuf » — un vocabulaire de mise sur le marché. Le destinataire du titre est fixé par `L. 4311-1` : celui qui expose, met sur le marché, vend, importe, loue, met à disposition ou cède. **Aucune obligation d'exploitant** pour les trois secteurs cibles : ni échéance, ni état permanent. |
| `R. 4312-*` | Règles techniques de conception | `R. 4312-1` à `R. 4312-9` + annexes | **jamais ouvert** | titre relevé | Zéro occurrence. Règles de **conception** annexées, adressées au concepteur. Aucune obligation d'exploitant. |
| `R. 4313-*` | Procédures de certification de conformité | `R. 4313-1` à `R. 4313-89` | **jamais ouvert** | titre relevé | Zéro occurrence. Procédures d'évaluation de conformité et d'organismes notifiés. Aucune obligation d'exploitant. |
| `R. 4314-*` | Surveillance du marché | `R. 4314-1` à `R. 4314-17` | **jamais ouvert** | titre relevé | Zéro occurrence. `R. 4314-2` désigne les ministres exerçant la mission de surveillance ; `R. 4314-10` décrit les mesures correctives que l'autorité **impose** à l'opérateur économique. Le chapitre s'adresse à l'administration et aux opérateurs économiques, pas à l'employeur utilisateur. |

> Les quatre chapitres du titre Ier n'ont **aucun motif d'exclusion écrit** dans
> le dépôt. Ils ne sont pas « écartés » : ils sont absents. La raison qui les
> écarterait — « règle de conception, pas d'exploitation » — existe pourtant au
> vocabulaire (`EXCLUSIONS.construction`, `perimetre.ts`) et n'a jamais été
> appliquée ici.

### Titre II — Utilisation des équipements de travail et des moyens de protection (`R. 4321-1` à `R. 4324-53`)

Plan lu sur
[LEGISCTA000018489672](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018489672/).

| Chapitre | Intitulé exact | Articles | Statut | Lecture | Constat |
|---|---|---|---|---|---|
| `R. 4321-*` | Règles générales | `R. 4321-1` à `R. 4321-6` | **jamais ouvert** | lu (verbatim, `R. 4321-1` à `-5`) | **Voir § 3, le cas central.** Zéro occurrence de `4321-` dans tout le dépôt. |
| `R. 4322-*` | Maintien en état de conformité | `R. 4322-1` à `R. 4322-3` | **jamais ouvert** | lu (verbatim, les trois) | **Voir § 3, le cas central.** Zéro occurrence de `4322-`. |
| `R. 4323-*` | Mesures d'organisation et conditions d'utilisation des équipements de travail et des équipements de protection individuelle | `R. 4323-1` à `R. 4323-110` | **couvert (partiel)** | plan lu + 4 sections lues | **Voir § 2, le détail section par section.** |
| `R. 4324-*` | Utilisation des équipements de travail non soumis à des règles de conception lors de leur première mise sur le marché | `R. 4324-1` à `R. 4324-53` | **jamais ouvert** | plan lu ; articles non ouverts un à un | Zéro occurrence de `4324-`. **Ce chapitre s'adresse à l'employeur utilisateur**, pas au fabricant : il porte les prescriptions techniques que doit respecter un équipement **mis sur le marché avant** les règles de conception CE. Quatre sections, intitulés relevés sur les titres de page Légifrance : S1 « Prescriptions techniques communes » (`R. 4324-1` à `-23`), S2 prescriptions complémentaires levage de charges et de personnes (`R. 4324-24` à `-29`), S3 « Prescriptions complémentaires pour les équipements de travail mobiles » (`R. 4324-30` à `-45`), S4 « Prescriptions complémentaires pour les équipements de travail desservant des niveaux définis à l'aide d'un habitacle » (`R. 4324-46` à `-53`). **Porte des états permanents, pas d'échéance** — le contenu de chaque prescription n'est pas ouvert par moi. |

---

## 2. Le chapitre `R. 4323-*`, section par section

C'est le seul chapitre du livre III que le dépôt touche, et il faut le
détailler : **dix sections, quatre partiellement ou entièrement lues.** Le
chapitre compte 110 articles ; le corpus en porte **43** (1 + 6 + 3 + 33),
compté en listant les `ref` des quatre corpus concernés, pas au grep.

| Section | Intitulé exact | Articles | Au corpus ? | Constat |
|---|---|---|---|---|
| 1 | Information et formation des travailleurs | `R. 4323-1` à `-5` | **1 sur 5** | `code-travail-equipements-information` (`etendue: "articles_cites"`). Sa `portee` le dit : « R. 4323-2 à R. 4323-5, non dépouillés ». `R. 4323-3` est lu et cité dans `code-travail-travail-en-hauteur` sans y être inscrit comme article. |
| 2 | Installation des équipements de travail | `R. 4323-6` à `-13` | **0 sur 8** | Aucune occurrence. Prescriptions d'installation — stabilité, espace libre entre éléments mobiles, largeur d'au moins 80 cm des passages entre équipements, interdiction d'un poste permanent dans une zone de projection. **États permanents, aucune échéance.** Articles non ouverts un à un par moi ; intitulés et objets relevés sur les titres de page et sur la page de section. |
| 3 | Utilisation et maintenance des équipements de travail | `R. 4323-14` à `-21` | **0 sur 8** | Aucune occurrence. **Lu en verbatim ce jour.** Trois articles y portent un objet documentaire que le produit sert ailleurs : `R. 4323-19` fait établir et **tenir à jour un carnet de maintenance** pour les équipements que des arrêtés désignent, `R. 4323-20` le fait tenir à disposition de l'inspection du travail et du CSE, `R. 4323-21` en règle le support. **Un état permanent, avec pièce.** Le dépôt connaît l'arrêté du 2 mars 2004 (carnet de maintenance des appareils de levage) : il est cité comme source dans `docs/referentiel-conformite.md:288` et dans l'en-tête de `conformite/levage.ts`, il n'a **aucun corpus** et **aucune obligation** ne le porte. `R. 4323-15` impose en outre une **instruction écrite** de l'employeur pour les travaux qu'il est techniquement impossible d'accomplir à l'arrêt. |
| 4 | Vérifications des équipements de travail | `R. 4323-22` à `-28` | **6 sur 7** | `code-travail-levage` (`articles_cites`). **`R. 4323-24` n'est pas au corpus** : il est cité dans la `reference` d'une obligation (`conformite/levage.ts:138`, « R. 4323-23 et R. 4323-24 ») et nommé dans deux commentaires de `code-travail-travail-en-hauteur`, sans jamais avoir d'entrée lue et datée. Sa `portee` porte la limite qui compte : `R. 4323-23` habilite **tous** les équipements de travail, et le corpus ne l'a instruit que par sa branche levage (arrêté du 1er mars 2004). L'**arrêté du 5 mars 1993** (vérifications des machines hors appareils de levage) n'est instruit nulle part — constat déjà écrit dans le corpus et repris par `docs/revues/lot-d3-recoupement-droit.md`. |
| 5 | Dispositions particulières applicables aux équipements de travail servant au levage de charges | `R. 4323-29` à `-49` | **0 sur 21** | Aucune occurrence. Règles d'utilisation : stabilité en usage, levage de personnes réservé aux équipements prévus à cet effet, poste de commande, interdiction de dépasser la charge marquée. **États permanents.** Le dépôt porte dix obligations de levage, toutes fondées sur la section 4 et l'arrêté du 1er mars 2004 ; la section qui règle l'**usage** de ces mêmes appareils n'est pas lue. Articles non ouverts un à un par moi. |
| 6 | Dispositions particulières applicables aux équipements de travail mobiles | `R. 4323-50` à `-54` | **0 sur 5** | Aucune occurrence. Règles de circulation, séparation piétons / engins, transport de travailleurs. **États permanents.** Articles non ouverts un à un par moi. |
| 7 | Autorisation de conduite pour l'utilisation de certains équipements de travail mobiles ou servant au levage de charges | `R. 4323-55` à `-57` | **3 sur 3** | `code-travail-conduite`, `etendue: "integral"`. |
| 8 | Dispositions particulières applicables à l'exécution de travaux temporaires en hauteur et à certains équipements de travail utilisés à cette fin | `R. 4323-58` à `-90` | **33 sur 33** | `code-travail-travail-en-hauteur`, `etendue: "integral"`. Le corpus **mesure le trou sans le combler** : aucun des 33 articles ne porte de périodicité, la seule échéance du domaine est à l'art. 6 de l'arrêté du 21 décembre 2004 (examen trimestriel des échafaudages), classée `obligation_manquante` faute d'une catégorie d'équipement « échafaudage ». |
| 9 | Dispositions particulières pour l'utilisation des équipements de protection individuelle | `R. 4323-91` à `-106` | **0 au corpus** | **Voir § 4, le cas EPI.** Trois sous-sections : S/S 1 « Caractéristiques des équipements et conditions d'utilisation » (`-91` à `-98`), **S/S 2 « Vérifications périodiques » (`-99` à `-103`)**, S/S 3 « Information et formation des travailleurs » (`-104` à `-106`). |
| 10 | Dispositions particulières applicables aux ascenseurs et équipements de travail desservant des niveaux définis à l'aide d'un habitacle | `R. 4323-107` à `-110` | **0 sur 4** | Aucune occurrence. Le dépôt porte tout un domaine « ascenseurs », fondé sur le CCH (`R. 134-*`) et les arrêtés d'ascenseurs, **pas** sur ces quatre articles du Code du travail. `R. 4323-108` réserve l'accès aux locaux de machinerie aux personnes chargées de la mise en œuvre et formées aux risques — **état permanent**. Articles non ouverts un à un par moi. |

---

## 3. Le cas central — `R. 4321-*` et `R. 4322-*`

Le constat de départ est vérifié : **zéro occurrence de `4321-` et de `4322-`
dans `src/`, `docs/` et `spec/`.** Ni encodés, ni écartés, ni mentionnés. Or la
section 4 du chapitre `R. 4323-*` — les vérifications périodiques — est au
corpus avec ses sept articles. Le dépôt a donc lu la section des vérifications
sans lire les deux chapitres qui la précèdent dans le même titre.

### `R. 4321-*` — Règles générales (chapitre Ier)

**Section 1 « Principes » (`R. 4321-1` à `-5`), lue en verbatim le 2026-09-02**
([LEGISCTA000018489676](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018489676/)).
Section 2 « Conventions conclues avec les organisations professionnelles »
(`R. 4321-6`) : intitulé relevé au plan du titre II, article non ouvert par moi.

| Article | Version | Ce qu'il prescrit | Nature |
|---|---|---|---|
| `R. 4321-1` | 01/05/2008 | « L'employeur met à la disposition des travailleurs les équipements de travail nécessaires, appropriés au travail à réaliser ou convenablement adaptés à cet effet, en vue de préserver leur santé et leur sécurité. » | **État permanent.** Aucune échéance. |
| `R. 4321-2` | 01/05/2008 | Le choix des équipements se fait en fonction des conditions et caractéristiques du travail, en tenant compte des caractéristiques de l'établissement susceptibles d'être à l'origine de risques. | **État permanent.** Aucune échéance. |
| `R. 4321-3` | 01/05/2008 | Si les mesures des deux articles précédents ne suffisent pas, l'employeur agit sur l'installation, l'organisation ou les procédés de travail. | **État permanent.** Aucune échéance. |
| `R. 4321-4` | 01/05/2008 | « L'employeur met à la disposition des travailleurs, en tant que de besoin, les équipements de protection individuelle appropriés et, lorsque le caractère particulièrement insalubre ou salissant des travaux l'exige, les vêtements de travail appropriés. **Il veille à leur utilisation effective.** » | **État permanent.** Aucune échéance. |
| `R. 4321-5` | 01/01/2017 | Les EPI et vêtements de travail ne constituent pas des avantages en nature au sens de `L. 3141-25`. | Règle de qualification. Ne prescrit rien à l'employeur. |

**Verdict `R. 4321-*` : aucune échéance périodique, quatre états permanents.**
`R. 4321-4` est le siège de la mise à disposition des EPI — celui que la note du
dépôt sur les EPI (`parametrage.ts`, ADR-025 § 7) ne nomme pas, sa liste allant
de `R. 4323-95` à `-106`.

### `R. 4322-*` — Maintien en état de conformité (chapitre II)

**Les trois articles lus en verbatim le 2026-09-02**, sur leurs pages d'article
Légifrance. Chemin hiérarchique confirmé sur la page de `R. 4322-1` : Partie
réglementaire › Quatrième partie › Livre III › Titre II › Chapitre II.

| Article | Version | Verbatim | Nature |
|---|---|---|---|
| `R. 4322-1` | 01/05/2008 | « Les équipements de travail et moyens de protection, **quel que soit leur utilisateur, sont maintenus en état de conformité** avec les règles techniques de conception et de construction applicables lors de leur mise en service dans l'établissement, y compris au regard de la notice d'instructions. Ces dispositions ne font pas obstacle à l'application des règles d'utilisation prévues au chapitre IV. » | **État permanent.** Aucune échéance. |
| `R. 4322-2` | 01/05/2008 | « Les moyens de protection détériorés pour quelque motif que ce soit, **y compris du seul fait de la survenance du risque contre lequel ils sont prévus** et dont la réparation n'est pas susceptible de garantir le niveau de protection antérieur à la détérioration, sont **immédiatement remplacés et mis au rebut**. » | **État permanent**, déclenché par un fait (la détérioration). Aucune échéance. |
| `R. 4322-3` | 01/05/2008 | « **La notice d'instructions** des équipements de travail et moyens de protection **est tenue à la disposition** de l'inspection du travail, du service de prévention des organismes de sécurité sociale et de l'organisme agréé saisi conformément à l'article `R. 4722-26`. » | **État permanent, avec pièce** — exactement la forme que le référentiel sait porter (`pieceAttendue`). Aucune échéance. |

### Ce que ces deux chapitres établissent

1. **Aucun des neuf articles ne porte d'échéance périodique.** Pas un seul
   chiffre de durée, pas un « renouvelé », pas un « tous les ». Le dépôt n'a
   donc manqué **aucune date** en ne les lisant pas.
2. **Sept portent un état permanent**, et deux d'entre eux portent une pièce
   opposable : la notice d'instructions de `R. 4322-3`, tenue à disposition de
   trois destinataires nommés ; et, en amont, la mise à disposition d'EPI
   appropriés et leur usage effectif de `R. 4321-4`.
3. **`R. 4322-1` est le fondement général du domaine « équipements » du
   produit.** Le référentiel porte quatre-vingts obligations déclenchées par un
   équipement déclaré ; l'article qui dit que cet équipement doit rester
   conforme à ses règles de conception, notice comprise, n'y figure pas.
4. **`R. 4322-1` renvoie au chapitre IV** — « ces dispositions ne font pas
   obstacle à l'application des règles d'utilisation prévues au chapitre IV »,
   c'est-à-dire à `R. 4324-*`, l'autre chapitre entièrement absent. Les deux
   trous se tiennent par un renvoi explicite du texte.
5. La notice d'instructions est déjà **nommée** en trois endroits du référentiel
   — `R. 4323-1` 2° au corpus, `R. 4323-22` au corpus, le dossier de maintenance
   des portes automatiques — sans que l'article qui fait tenir la notice à
   disposition soit lu.

---

## 4. Le cas EPI — ce que dit vraiment le motif

`.claude/CLAUDE.md`, § « Hors périmètre (à ce jour) », dernière puce :

> « Registres non couverts : accidents du travail / AT bénins, dangers graves et
> imminents, **EPI** »

**Ce motif porte sur un registre, pas sur une obligation de vérification.** Le
dépôt le sait et l'a écrit deux fois :

- `code-travail-travail-en-hauteur.ts`, en tête : « le sujet avait été rangé
  avec les EPI, qui sont hors périmètre. Vérification faite […] : l'exclusion y
  porte sur le REGISTRE des EPI ».
- `docs/adr/025`, § 7 et son tableau ligne 310 : « “Registres non couverts : …
  EPI” — reste vrai ; à requalifier seulement si le dépouillement de
  `R. 4323-95` à `-106` change la donne », et « `R. 4323-95` à `-106` et
  l'arrêté du 19 mars 1993 ne sont ouverts nulle part dans le dépôt ».
- `src/lib/etablissements/parametrage.ts` : « `epiPresents` est une
  **consignation**. `R. 4323-95` à `R. 4323-106` CT et l'arrêté du 19 mars 1993
  n'ont jamais été ouverts dans ce dépôt […] Lire avant d'encoder. »

**Constat.** La sous-section 2 de la section 9, `R. 4323-99` à `R. 4323-103`,
s'intitule **« Vérifications périodiques »** (intitulé relevé sur le titre de
page Légifrance). Trois de ses articles ont été lus en verbatim ce jour :

- `R. 4323-99` — « Des arrêtés des ministres chargés du travail ou de
  l'agriculture déterminent les équipements de protection individuelle et
  catégories d'équipement de protection individuelle pour lesquels l'employeur
  procède ou fait procéder à des **vérifications générales périodiques** afin
  que soit décelé en temps utile toute défectuosité […] »
- `R. 4323-100` — les vérifications sont réalisées par des personnes qualifiées
  « dont la **liste est tenue à la disposition de l'inspection du travail** ».
- `R. 4323-101` — « Le résultat des vérifications périodiques est **consigné sur
  le ou les registres de sécurité** mentionnés à l'article `L. 4711-5`. »

C'est **la même mécanique d'habilitation** que `R. 4323-23` pour les équipements
de travail, et le dépôt a instruit celle-là par son arrêté (1er mars 2004,
levage) sans instruire celle-ci par le sien.

**L'arrêté dédié n'est pas ouvert et n'est pas identifié dans le dépôt.** Deux
arrêtés portent la date du 19 mars 1993 ; le dépôt n'en connaît qu'un, celui des
travaux dangereux fondant le plan de prévention (`documents-obligatoires.ts:236`,
écran `plan-prevention/page.tsx:196`). Celui que visent `R. 4323-99` et l'ADR-025
n'a **pas été ouvert par moi** — je ne peux donc pas dire quels EPI il désigne
ni à quelle périodicité.

**Ce qui existe déjà et n'est pas rien.** `documents-obligatoires.ts` porte une
entrée `verifications-epi` fondée sur `R. 4323-99` et `R. 4323-101`, lus le
2026-09-01, qui dit au dirigeant que Rojer « n'engendre aucune échéance de
vérification d'équipement de protection individuelle ». C'est une déclaration de
non-couverture, pas une couverture — et ce n'est pas un motif d'exclusion : elle
dit que le produit ne le fait pas, pas que le texte ne s'applique pas.

**Verdict.** Le motif écrit couvre le **registre** des EPI. Il ne couvre **pas**
les obligations de vérification périodique de `R. 4323-99` à `-103`, ni la mise
à disposition de `R. 4321-4`, ni la formation au port de `R. 4323-106`. Sur ces
trois-là, le statut n'est pas « écarté », c'est « jamais ouvert » — et le dépôt
le dit lui-même en trois endroits, sans en avoir tiré le classement.

---

## 5. Livre IV — Prévention de certains risques d'exposition

**Plan réel, relevé le 2026-09-02.**
Partie réglementaire : `R. 4411-1` à `R. 4463-8`
([LEGISCTA000018490113](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018490113/)).
Partie législative : `L. 4411-1` à `L. 4461-1`
([LEGISCTA000006145410](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000006145410/)).
**Six titres, vingt-neuf chapitres.**

> **Attention au décalage législatif / réglementaire.** Le livre IV législatif
> s'arrête à `L. 4461-1` et ne connaît que six chapitres. Le réglementaire va
> jusqu'à `R. 4463-8` : deux chapitres réglementaires — pyrotechnie et chaleur
> intense — n'ont **pas** de chapitre législatif miroir. Lire le plan législatif
> seul aurait fait manquer les deux, dont celui qui mord le plus sur la cible.

### Titre Ier — Risques chimiques (`R. 4411-1` à `R. 4412-159`)

| Chapitre | Intitulé exact | Articles | Statut | Trace | Constat |
|---|---|---|---|---|---|
| `R. 4411-*` | Mise sur le marché des substances et mélanges | `R. 4411-1` à `-86` | **jamais ouvert** | — | Zéro occurrence. Classification, étiquetage et emballage, par renvoi au règlement (CE) n° 1272/2008 ; destinataire : le fournisseur. `R. 4411-1` règle en outre une répartition de compétence entre ministres. **Aucune obligation d'exploitant pour les trois secteurs cibles** — ni échéance, ni état permanent. Articles non ouverts un à un par moi. |
| `R. 4412-*` | Mesures de prévention des risques chimiques | `R. 4412-1` à `-159` | **couvert (partiel)** | corpus | `code-travail-risque-chimique`, `etendue: "articles_cites"` : **4 articles sur 159** — `R. 4412-11`, `-17`, `-38`, `-87`. Sa `portee` annonce « R. 4412-11 et s. » et « information et formation », ce qui est exact mais ne dit pas la proportion. Les sous-sections CMR, amiante et plomb sont dans **ce** chapitre : le motif de `.claude/CLAUDE.md` (« ATEX, rayonnements ionisants, amiante, plomb, radon, CMR : non couverts, mais déclarés ») **écarte des parties de ce chapitre, pas le chapitre**. Deux références de ces parties sont d'ailleurs lues et datées au dépôt (`R. 4412-118` amiante, `R. 4412-160` plomb, abrogé le 10/04/2026), et `R. 4412-97` (repérage amiante avant travaux) est recensé « ❌ » dans `docs/carto-obligations-hors-equipement.md` — recensé comme manque, pas comme exclusion. |

> **Où est ATEX ?** Nulle part dans mon périmètre. Le motif ATEX de
> `.claude/CLAUDE.md` et de `EXCLUSIONS.risque_specialise` vise la prévention des
> explosions, qui est au **livre II** (`R. 4227-42` et s.), pas au livre IV. Il
> n'écarte donc aucun chapitre des livres III et IV.

### Titre II — Prévention des risques biologiques (`R. 4421-1` à `R. 4427-5`)

Plan lu sur
[LEGISCTA000018490782](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018490782/).

| Chapitre | Intitulé exact | Articles | Statut | Trace | Ce que ça porte pour la cible |
|---|---|---|---|---|---|
| `R. 4421-*` | Dispositions générales | `R. 4421-1` à `-4` | **jamais ouvert** | `referentiels/commun.ts:294` et `:303` (fiche de risque DUERP) | Champ d'application lu : s'applique « dans les établissements où la nature de l'activité peut conduire à exposer les travailleurs à des agents biologiques », et **écarte certains articles** lorsque l'activité n'implique pas l'utilisation délibérée d'un agent biologique et que l'évaluation ne révèle aucun risque spécifique. La restauration entre par la première phrase et sort d'une partie du titre par la seconde. Classification en quatre groupes : **état permanent**, aucune échéance. |
| `R. 4422-*` | Principes de prévention | `R. 4422-1` | **jamais ouvert** | — | Un article. Non ouvert par moi. |
| `R. 4423-*` | Évaluation des risques | `R. 4423-1` à `-4` | **jamais ouvert** | `referentiels/commun.ts:303` (cite `R. 4423-1` dans une fiche DUERP) | L'employeur détermine la nature, la durée et les conditions de l'exposition. **État permanent** rattaché au DUERP. Articles non ouverts un à un par moi. |
| `R. 4424-*` | Mesures et moyens de prévention | `R. 4424-1` à `-11` | **jamais ouvert** | — | Non ouvert par moi. |
| `R. 4425-*` | Information et formation des travailleurs | `R. 4425-1` à `-7` | **jamais ouvert** | — | Non ouvert par moi. Sept articles d'information et de formation : c'est le siège le plus plausible d'une obligation de restauration dans ce titre, et je ne l'ai pas ouvert. |
| `R. 4426-*` | Suivi individuel de l'état de santé | `R. 4426-1` à `-13` | **jamais ouvert** | — | Non ouvert par moi. Le dépôt a par ailleurs écrit, dans `conformite/sante-travail.ts`, que les textes propres aux expositions du `R. 4624-23 I` — dont les agents biologiques des groupes 3 et 4 — « n'ont pas été ouverts » et qu'il ne faut pas conclure de ce silence qu'ils ne dérogent pas. Ce chapitre est l'un d'eux. |
| `R. 4427-*` | Déclaration administrative | `R. 4427-1` à `-5` | **jamais ouvert** | — | Non ouvert par moi. |

### Titre III — Prévention des risques d'exposition au bruit (`R. 4431-1` à `R. 4437-4`)

Plan lu sur
[LEGISCTA000018490904](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018490904/).

| Chapitre | Intitulé exact | Articles | Statut | Trace | Ce que ça porte pour la cible |
|---|---|---|---|---|---|
| `R. 4431-*` | Dispositions générales | `R. 4431-1` à `-4` | **jamais ouvert** | `referentiels/restauration.ts:402` (commentaire citant `R. 4431-2`) | **Lu en verbatim.** Trois seuils : valeurs limites 87 dB(A) / 140 dB(C) crête ; valeurs supérieures déclenchant l'action 85 dB(A) / 137 dB(C) ; valeurs inférieures 80 dB(A) / 135 dB(C). Ce sont les **seuils qui commandent tout le titre**. Aucune échéance ici. |
| `R. 4432-*` | Principes de prévention | `R. 4432-1` à `-3` | **jamais ouvert** | `lib/pdf/DuerpDocument.tsx:777` (cite « `R. 4432-1` et suiv. » dans le PDF DUERP) | Non ouvert par moi. |
| `R. 4433-*` | Évaluation des risques | `R. 4433-1` à `-7` | **jamais ouvert** | `restauration.ts:408`, `commun.ts:245` (fiche de risque DUERP) | **Lu en verbatim ce jour.** `R. 4433-1` : « L'employeur évalue et, si nécessaire, mesure les niveaux de bruit auxquels les travailleurs sont exposés. » `R. 4433-2` : évaluation et mesurage planifiés et réalisés par des personnes compétentes ; **les mesurages sont renouvelés au moins tous les cinq ans** et lors de toute modification susceptible d'augmenter le bruit. `R. 4433-3` : résultats conservés **dix ans**. `R. 4433-4` : résultats communiqués au médecin du travail, tenus à disposition du CSE, de l'inspection du travail et des services de prévention. **Une échéance périodique chiffrée (5 ans) et deux états permanents.** |
| `R. 4434-*` | Mesures et moyens de prévention | `R. 4434-1` à `-10` | **jamais ouvert** | `app/etablissements/[id]/permis-feu/page.tsx:139` (cite `R. 4434-9`) | Section 2 « Protection individuelle » (`-7` à `-10`), intitulé relevé sur le titre de page. `R. 4434-7` : au-delà des **valeurs inférieures** (80 dB(A)), l'employeur **met à disposition** des protecteurs auditifs individuels ; au-delà des valeurs supérieures (85 dB(A)), il **veille à leur utilisation effective**. **États permanents**, déclenchés par un seuil mesuré. Articles lus en résumé de page Légifrance, pas en verbatim intégral. |
| `R. 4435-*` | Surveillance médicale | `R. 4435-2` à `-4` | **jamais ouvert** | — | `R. 4435-2` : au-delà des valeurs inférieures d'exposition, le travailleur bénéficie, **à sa demande ou à celle du médecin du travail**, d'un examen audiométrique préventif. Conditionné à une demande : ce n'est pas une échéance que l'employeur tient. Lu en résumé de page, pas en verbatim. |
| `R. 4436-*` | Information et formation des travailleurs | `R. 4436-1` | **jamais ouvert** | — | Un article. Non ouvert par moi. |
| `R. 4437-*` | Dispositions dérogatoires | `R. 4437-1` à `-4` | **jamais ouvert** | — | Non ouvert par moi. |

### Titre IV — Prévention des risques d'exposition aux vibrations mécaniques (`R. 4441-1` à `R. 4447-1`)

Plan lu sur
[LEGISCTA000018490997](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018490997/).

| Chapitre | Intitulé exact | Articles | Statut | Trace | Ce que ça porte pour la cible |
|---|---|---|---|---|---|
| `R. 4441-*` | Dispositions générales | `R. 4441-1` à `-2` | **jamais ouvert** | `lib/pdf/DuerpDocument.tsx:778` (cite « `R. 4441-1` et suiv. ») | **Lu en verbatim.** Deux définitions : vibrations transmises aux mains et aux bras, vibrations transmises à l'ensemble du corps. Aucune prescription. |
| `R. 4442-*` | Principes de prévention | `R. 4442-1` à `-2` | **jamais ouvert** | — | Non ouvert par moi. |
| `R. 4443-*` | Valeurs limites d'exposition | `R. 4443-1` à `-2` | **jamais ouvert** | — | Non ouvert par moi. |
| `R. 4444-*` | Évaluation des risques | `R. 4444-1` à `-7` | **jamais ouvert** | — | Structure parallèle à celle du bruit : l'employeur évalue et, si nécessaire, mesure. La page du titre indique une conservation **dix ans** des résultats à `R. 4444-3` ; l'article n'est pas ouvert par moi, et je n'ai **pas** relevé de périodicité de renouvellement du mesurage dans ce titre. **Un état permanent au moins.** Le déclencheur est un outil vibrant tenu à la main ou un engin conduit — rare dans les trois secteurs cibles. |
| `R. 4445-*` | Mesures et moyens de prévention | `R. 4445-1` à `-6` | **jamais ouvert** | — | Non ouvert par moi. |
| `R. 4446-*` | Suivi individuel de l'état de santé | `R. 4446-2` à `-4` | **jamais ouvert** | — | Non ouvert par moi. |
| `R. 4447-*` | Information et formation des travailleurs | `R. 4447-1` | **jamais ouvert** | — | Non ouvert par moi. |

### Titre V — Prévention des risques d'exposition aux rayonnements (`R. 4451-1` à `R. 4453-34`)

| Chapitre | Intitulé exact | Articles | Statut | Motif / trace | Constat |
|---|---|---|---|---|---|
| `R. 4451-*` | Prévention des risques d'exposition aux rayonnements ionisants | `R. 4451-1` à `-146` | **écarté** (motif écrit) | `.claude/CLAUDE.md` § « Hors périmètre » (« ATEX, **rayonnements ionisants**, amiante, plomb, radon, CMR : non couverts, mais **déclarés** et non refusés ») **et** `corpus/perimetre.ts`, `EXCLUSIONS.risque_specialise` (« ICPE soumises à autorisation, ATEX, **rayonnements ionisants**, équipements sportifs, piscines ») | **Le motif porte sur le chapitre entier, et il est écrit à deux endroits.** Une nuance : trois articles du chapitre sont tout de même **lus** au dépôt — `R. 4451-82` est **au corpus** (`code-travail-sante-travail`) parce qu'il déroge à la périodicité du suivi individuel renforcé ; `R. 4451-57` (classement en catégorie A) et `R. 4451-65` sont cités dans `lib/salaries/`. Ce n'est pas une couverture du chapitre : c'est une dérogation lue depuis le chapitre voisin du livre VI. Le motif de `.claude/CLAUDE.md` est par ailleurs **amendé** par l'ADR-025 (tableau, ligne 298) : ces risques « se déclarent au lieu de se refuser ». Le **radon**, nommé au motif, est une section de ce chapitre — l'exclusion en couvre donc bien la partie. |
| `R. 4452-*` | Prévention des risques d'exposition aux rayonnements optiques artificiels | `R. 4452-1` à Annexe III | **jamais ouvert** | — | Zéro occurrence de `4452`. **Aucun motif écrit ne le couvre** : `.claude/CLAUDE.md` nomme les rayonnements *ionisants*, pas les optiques artificiels. `R. 4452-1` définit les rayonnements optiques comme les rayonnements électromagnétiques de 100 nm à 1 mm — donc **artificiels** ; le soleil et l'éclairage ordinaire n'en relèvent pas. Chapitre ouvert au champ et aux principes (`R. 4452-2`) ; **je n'ai pas pu établir sa périodicité** — le résumé de page m'a rendu un « au moins tous les cinq ans » à `R. 4452-9` que je n'ai pas confirmé sur le texte, et qui reproduit mot pour mot la formule du bruit. Non retenu. Pertinence pour les trois secteurs : non établie par moi. |
| `R. 4453-*` | Prévention des risques d'exposition aux champs électromagnétiques | `R. 4453-1` à `-34` | **jamais ouvert** | — | Zéro occurrence de `4453`. Aucun motif écrit. `R. 4453-1` définit les champs de 0 Hz à 300 GHz. Le chapitre compte neuf sections ; l'employeur y procède au mesurage, au calcul ou à la simulation des niveaux. **Articles non ouverts un à un par moi** — je ne peux pas dire s'il porte une échéance ni s'il exempte les équipements ordinaires de bureau et de commerce. |

### Titre VI — Autres risques (`R. 4461-1` à `R. 4463-8`)

| Chapitre | Intitulé exact | Articles | Statut | Trace | Constat |
|---|---|---|---|---|---|
| `R. 4461-*` | Prévention des risques en milieu hyperbare | `R. 4461-1` à `-49` | **jamais ouvert** | — | Zéro occurrence de `4461`. **Aucun motif écrit** : l'hyperbare n'est nommé dans `.claude/CLAUDE.md` que comme l'une des expositions du `R. 4624-23 I` « non ouvertes », ce qui est un aveu de lecture, pas une exclusion. Champ lu : s'applique lorsque des travailleurs sont exposés à une pression relative supérieure à 100 hectopascals. **Sans objet pour la restauration, le commerce de détail et le bureau** — mais le dépôt ne le dit nulle part. |
| `R. 4462-*` | Prévention du risque pyrotechnique | `R. 4462-1` à `-36` | **jamais ouvert** | — | Zéro occurrence de `4462`. **Aucun motif écrit.** `R. 4462-1` lu en verbatim : le chapitre vise les employeurs qui fabriquent, étudient, expérimentent, conditionnent, conservent ou détruisent des substances ou objets explosibles, et il **exclut expressément les espaces de vente des magasins soumis à la réglementation ERP incendie**. C'est le texte lui-même qui écarte le commerce de détail — au sens de `EXCLUSIONS.categorie_erp`, « écarté par le règlement lui-même ». **Sans objet pour les trois secteurs**, par le texte. |
| `R. 4463-*` | **Prévention des risques liés aux épisodes de chaleur intense** | `R. 4463-1` à `-8` | **jamais ouvert** | `docs/revues/lot-d3-recoupement-droit.md` (dépouillement complet du 2026-09-01, **rien encodé**) ; `docs/journal-des-verifications.md:319` | Zéro occurrence dans `src/`. **Aucun motif écrit** — au contraire, le dépouillement du dépôt conclut « FONDÉE. Dans le périmètre. Mord directement sur la cible. » Chapitre créé par le décret n° 2025-482 du 27 mai 2025, en vigueur au 2 juin 2025. `R. 4463-2` **relu à la source par moi le 2026-09-02** : « L'employeur évalue les risques liés à l'exposition des travailleurs à des épisodes de chaleur intense, **en intérieur ou en extérieur**. Lorsque l'évaluation identifie un risque […] l'employeur définit les mesures ou les actions de prévention prévues au III de l'article `L. 4121-3-1` » — chemin confirmé : Livre IV › Titre VI › Chapitre III › Section 2. Le seul point du chapitre que le dépôt touche est `R. 4463-3` 5° (augmentation de l'eau fraîche en épisode), et il le touche **par l'autre bout**, par `R. 4225-2` qui porte la mise à disposition permanente. **États permanents, aucune échéance périodique.** |

---

## 6. Ce que je n'ai pas pu établir

1. **L'arrêté de `R. 4323-99`** — quels EPI sont soumis à vérification générale
   périodique, et à quelle périodicité. Le dépôt ne connaît qu'un arrêté du
   19 mars 1993, celui des travaux dangereux ; celui des EPI n'a pas été ouvert
   par moi. Sans lui, je ne peux pas dire si l'obligation mord sur un harnais de
   TPE, et **je ne l'affirme pas**.
2. **`R. 4452-*` (rayonnements optiques artificiels)** — le chapitre porte-t-il
   une périodicité ? Le résumeur m'a rendu un « au moins tous les cinq ans » à
   `R. 4452-9` identique mot pour mot à la formule du bruit ; je ne l'ai pas
   confirmé sur le texte et je ne le retiens pas.
3. **`R. 4453-*` (champs électromagnétiques)** — articles non ouverts. Je ne
   sais ni s'il porte une échéance, ni s'il exempte les équipements ordinaires
   d'un bureau ou d'un commerce.
4. **`R. 4424-*`, `R. 4425-*`, `R. 4426-*`, `R. 4427-*` (biologique)** —
   articles non ouverts. `R. 4425-*` (information et formation, sept articles)
   est le siège le plus plausible d'une obligation de restauration dans ce
   titre, et je ne peux pas dire ce qu'il prescrit.
5. **Le contenu de `R. 4324-1` à `-53`** — j'ai le plan, les quatre intitulés de
   section et le destinataire (l'employeur utilisateur), pas le texte des
   prescriptions. Je ne peux pas dire lesquelles mordent sur une machine de
   cuisine ou de réserve achetée d'occasion.
6. **`R. 4323-29` à `-49`, `-50` à `-54`, `-6` à `-13`, `-107` à `-110`** —
   objets relevés au plan et sur les pages de section, articles non ouverts un à
   un.
7. **Le contenu de `R. 4312-*` et `R. 4313-*`** — je conclus à l'absence
   d'obligation d'exploitant depuis le destinataire du titre (`L. 4311-1`,
   `R. 4311-1`, `R. 4314-2`), pas depuis une lecture des 98 articles.
8. **Les annexes** — `R. 4312-6` et le chapitre `R. 4452-*` portent des annexes
   que je n'ai pas ouvertes.
9. **Les articles `D. 43xx-*` et `D. 44xx-*`** — le plan Légifrance des livres
   III et IV ne m'en a rendu aucun dans les plages consultées. Je ne conclus pas
   qu'il n'en existe pas : je n'ai pas cherché la partie « décrets simples »
   séparément.

---

## 7. Le compte

Le décompte porte sur les **chapitres de la partie réglementaire** des livres
III et IV, tels que Légifrance les affiche au 2026-09-02.

| Livre | Titres | Chapitres |
|---|---|---|
| Livre III | 2 | 8 |
| Livre IV | 6 | 29 |
| **Total** | **8** | **37** |

**2 chapitres couverts, 1 écarté avec motif, 34 jamais ouverts.**

- **Couverts (2)** — `R. 4323-*` (43 articles sur 110, quatre sections sur dix)
  et `R. 4412-*` (4 articles sur 159).
- **Écarté avec motif (1)** — `R. 4451-*`, rayonnements ionisants : motif écrit
  à deux endroits (`.claude/CLAUDE.md` § « Hors périmètre » et
  `corpus/perimetre.ts`, `EXCLUSIONS.risque_specialise`), portant sur le
  chapitre entier, amendé par l'ADR-025 en « déclaré, non refusé ». Trois
  articles y sont tout de même lus, dont un au corpus, par la dérogation de
  suivi médical.
- **Jamais ouverts (34)** — dont **8 portent une trace** dans le dépôt
  (`R. 4421`, `R. 4423`, `R. 4431`, `R. 4432`, `R. 4433`, `R. 4434`, `R. 4441`,
  `R. 4463`) : citation en fiche de risque DUERP, en PDF, en écran, ou
  dépouillement rendu en revue et non encodé. Aucune de ces traces n'est un
  corpus, une obligation ni un motif.

**Trois observations sur les motifs, puisque la mission demandait de les
vérifier :**

1. `.claude/CLAUDE.md` écarte « ATEX, rayonnements ionisants, amiante, plomb,
   radon, CMR ». Sur les six, **un seul correspond à un chapitre entier de mon
   périmètre** (`R. 4451-*`). ATEX n'y est pas du tout (livre II). Amiante,
   plomb et CMR sont des **sections** du chapitre `R. 4412-*`, qui est par
   ailleurs partiellement couvert ; radon est une section de `R. 4451-*`.
   Le motif n'a donc jamais la granularité du chapitre, sauf une fois.
2. `EXCLUSIONS` (`corpus/perimetre.ts`) nomme les rayonnements ionisants, mais
   **pas** l'amiante, le plomb, le radon ni les CMR. Le vocabulaire d'exclusion
   reproductible du dépôt est plus étroit que la prose du CLAUDE.md.
3. Le motif EPI porte sur un **registre**. Il ne couvre ni `R. 4321-4`, ni
   `R. 4323-99` à `-103`, ni `R. 4323-106`. Le dépôt l'a écrit trois fois
   (`code-travail-travail-en-hauteur.ts`, ADR-025 § 7, `parametrage.ts`) sans en
   tirer le classement.
