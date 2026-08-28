# Ce que Rojer couvre, et ce qu'il ne couvre pas

Rédigé le 2026-08-28, à la sortie du chantier B (lot 6). **Document interne** :
il sert au point que la propriétaire veut faire sur ce que le produit fait
réellement, et pour qui.

Il remplace la carte « Ce que Rojer ne couvre pas » du tableau de bord, retirée
pour une raison qui vaut d'être écrite ici : **déclarer à chaque dirigeant ce
que le produit ne couvre pas, avant d'avoir tranché ce qu'il couvre, met la
charrue avant les bœufs.** Le mécanisme reste ; c'est sa surface généraliste
qui part.

> Ce document est l'adresse citée par le champ `declareA` des articles
> `non_couvert` du corpus. Un manque doit toujours avoir une adresse — sans
> quoi « on le dit clairement » est un silence documenté en interne.

---

## 1. Cinq axes, et ce que chacun établit vraiment

Quatre axes sont actifs. Le cinquième, `famille_obligation`, a existé une
journée et a été retiré — le § 3 bis dit pourquoi, et il est décrit ici parce
que le comprendre est nécessaire pour lire le § 3.

`src/lib/perimetre/couverture.ts` rend deux listes — des **manques** (faits
établis) et des **indéterminations** (questions ouvertes dont la réponse
appartient au dirigeant). Jamais un total, jamais un score : quatre manques sur
quatre axes ne font pas « 4 », ils font quatre phrases vraies de quatre choses
différentes. Un chiffre laisserait croire à une mesure de complétude que rien
ne fonde.

Le module **n'ajoute aucune source de vérité** : il projette celles qui
existent. C'est la règle à tenir dans toute évolution — un axe qui déclare au
lieu de projeter en fait une troisième déclaration de ce que le produit couvre,
ce que le dépôt s'interdit.

| Axe | Ce qu'il établit | Ce qu'il n'établit **pas** | Source projetée |
|---|---|---|---|
| `igh` | L'établissement est déclaré IGH, donc hors du régime que le référentiel connaît | Rien sur ce qui lui est dû : le règlement IGH n'est pas dépouillé du tout | `Etablissement.estIGH` |
| `categorie_erp` | L'ERP relève d'une catégorie 1 à 4, donc le livre II s'applique en entier (PE 1 § 1) | L'ampleur du manque. On sait qu'il existe, pas de combien | `CATEGORIES_COUVERTES` |
| `secteur_duerp` | Ce que le DUERP déclare ne pas couvrir, et si son référentiel est celui du code NAF | Que le reste du DUERP soit complet — « aucun manque identifié » n'est pas « complet » | ADR-020 (`duerps/couverture.ts`) + `perimetre/secteur.ts` |
| `domaine_equipement` | Des appareils du parc ne déclenchent aucune obligation du référentiel | Qu'aucune vérification ne leur soit due. C'est un fait sur l'outil, pas sur le droit | `equipements/hors-referentiel.ts` |
| ~~`famille_obligation`~~ **(retiré, § 3 bis)** | Des articles lus imposent quelque chose que le produit ne porte pas | **Qu'ils visent cet établissement-là.** Voir § 2 | statut `non_couvert` du corpus |

Deux garanties de construction méritent d'être connues avant de toucher au
module :

- **`secteur_duerp` lit l'ADR-020, il ne la redéclare pas.** Le type
  `EtatCouverture` est importé et consommé par un `switch` exhaustif terminé
  par un `never`, sans `default`. Le jour où l'ADR-020 gagne un état, la
  compilation s'arrête là et quelqu'un doit décider de la phrase. C'est la
  seule chose qui empêche cet axe de dériver en seconde source de vérité.
- **Le module est pur et sans arête sortante au runtime** — que des imports de
  type. Les faits lui sont donnés ; `faits.ts` les collecte (Prisma),
  `familles.ts` et `secteur.ts` isolent les lectures du référentiel. Le cycle
  `referentiels → perimetre → referentiels`, annoncé par le commentaire de
  `CATEGORIES_COUVERTES`, reste à distance.

### Deux affirmations que le mécanisme a failli faire, et ne fait pas

Elles sont notées parce qu'elles se reproduiront à la prochaine évolution.

**« Aucun référentiel n'est instruit pour votre activité. »** Une première
version le disait dès que le secteur retenu différait de celui du code NAF. Or
la comparaison n'établit que la différence. Une boulangerie-salon de thé en
`47.24Z` a bien son référentiel commerce, instruit et recommandé — et la page
de choix offre quand même « Changer de secteur ». Le produit lui affirmait donc,
jusque dans le PDF remis à un tiers, un fait qu'il ne savait pas. Corrigé par un
troisième état qui porte le référentiel que le NAF désigne.

**Le silence sur un établissement sans code NAF propre.**
`Etablissement.codeNaf` est optionnel — renseigné seulement s'il diffère de
celui de l'entreprise. Lu seul, il faisait taire l'axe sur exactement le dossier
qu'il devait signaler. Le repli vit désormais dans `nafEffectif`, et le **type**
exige les deux codes : l'oubli est devenu une erreur de compilation, pas un
sixième `??` recopié.

---

## 2. La liste des familles non portées vaut pour le produit, pas pour l'établissement

C'est la limite la plus importante de ce document, et la raison directe du
retrait de la carte.

Les 27 articles ci-dessous sont ceux que le dépouillement a lus, qui imposent
quelque chose à un exploitant, et que le référentiel ne porte pas. **Rien ne les
restreint aux établissements que leur chapitre vise.** Un bureau tertiaire les
voyait tous, y compris les onze articles propres aux hôtels.

Le rattachement manque côté corpus, pas côté base : `Etablissement.typeErp`
existe depuis l'ADR-004 et porte déjà `O` pour un hôtel, `U` pour un
établissement de soins. Ce qu'il faudrait est un champ sur l'article disant quel
type d'ERP il vise. Le déduire du préfixe de la référence (« PO » → hôtel)
serait une heuristique sur du texte libre, ce que ce dépôt refuse partout.

**C'est la suite naturelle de ce socle**, et c'est littéralement ce que
réclamaient les `declareA` d'origine : « Un exploitant hôtelier ne verra rien
qui l'avertisse que ces trois obligations lui manquent. »

---

## 3. Les 27 articles lus et non portés

Cinq familles. Les motifs sont ceux du corpus, cités et non réécrits : ils ont
été rédigés par la personne qui a lu l'article, et une reformulation ici
vieillirait à part de la source.

### Locaux à sommeil, 5ᵉ catégorie — 9 articles

`PE 28` · `PE 29` · `PE 30` · `PE 31` · `PE 32` · `PE 33` · `PE 34` · `PE 35` ·
`PE 36`

> Chapitre III — établissements de 5ᵉ catégorie comportant des locaux réservés
> au sommeil. Ce sont des ERP du deuxième groupe comme les autres : rien dans le
> texte ne les met hors de portée du produit. Ce qui manque est chez nous —
> l'attribut « locaux à sommeil » n'existe pas en base, alors que quatre
> articles du Livre III s'y adossent (PE 4 § 1, PE 28, PE 32, PE 37). C'est un
> manque de couverture assumé, pas une non-question.

**Le blocage est un attribut manquant, pas une décision.** `Etablissement`
ne porte pas « locaux à sommeil » ; la caractéristique `dessertLocauxSommeil`
existe mais qualifie un **équipement**, et ne peut donc pas conditionner une
obligation qu'aucun équipement ne déclenche.

### Hôtels (type O), 5ᵉ catégorie — 10 articles

`PO 2` · `PO 3` · `PO 4` · `PO 5` · `PO 6` · `PO 9` · `PO 10` · `PO 11` ·
`Annexe à l'article PO 11`

> Chapitre IV — règles spécifiques aux hôtels (type O), établissements de
> 5ᵉ catégorie. PO 1 § 3 et PO 7 portent les périodicités chiffrées du
> chapitre IV — PE 37 en porte une autre, la visite quinquennale de commission :
> contrôle biennal des installations techniques, annuel pour l'électricité et la
> détection, et deux séances d'instruction du personnel par an. Un très petit
> hôtel est exactement le genre de TPE que le produit sait servir par ailleurs —
> le manque est un choix, pas une impossibilité.

`PO 13` porte son propre motif, et c'est le plus intéressant du lot :

> Définit le « très petit hôtel » : « un établissement qui accueille 20 personnes
> au plus au titre du public dans les chambres et dont le plancher bas de l'étage
> le plus élevé accessible au public est situé à moins de 8 mètres du niveau
> d'accès des secours ». Ce seuil n'est PAS un régime allégé : il ouvre des
> atténuations (dispense d'encloisonnement des escaliers, dispense de BAEH) mais
> aussi une AGGRAVATION — « En aggravation de l'article PE 32, la détection
> automatique d'incendie est installée dans les circulations horizontales
> lorsqu'elles existent et dans tous les locaux, à l'exception des sanitaires. »
> L'exploitant qui renonce à l'encloisonnement hérite d'une détection
> généralisée. Aucune périodicité, mais un attribut d'établissement de plus que
> le modèle ne porte, distinct de « locaux à sommeil ».

### Petits établissements de soins (type U) — 6 articles

`PU 1` · `PU 2` · `PU 3` · `PU 4` · `PU 5` · `PU 6`

> Chapitre V — petits établissements de soins (type U). Ces articles n'imposent
> aucune échéance récurrente à l'exploitant : ce sont des règles de construction
> et d'équipement, plus un renvoi aux articles PE.

### Établissements sportifs — 1 article

`PX 1`

> Chapitre VI — établissements sportifs. Article de pur renvoi qui importe tout
> le chapitre XII du Livre II, non dépouillé. Les équipements sportifs figurent
> par ailleurs parmi les risques spécialisés que le produit déclare ne pas
> traiter.

### Gaz en habitation collective — 1 article

`Arrêté du 23-02-2018, art. 26 § 6 et § 7`

> Le § 6° impose de retirer et remplacer toute tuyauterie ou accessoire en fonte
> grise dans l'année suivant le signalement de sa découverte (trois mois pour le
> distributeur). Le § 7° plafonne la durée d'exploitation des détendeurs — 10, 20
> ou 30 ans selon leur emplacement, avec des échéances calendaires échelonnées de
> 2024 à 2041. Aucune des deux ne se réduit à une périodicité : la première est
> un délai déclenché par un événement, la seconde une durée de vie maximale d'un
> composant. Le modèle ne porte ni l'un ni l'autre. Ces règles pèsent sur le
> distributeur et le propriétaire d'immeuble collectif, à la marge du périmètre.

---

## 3 bis. Ces 27 articles ont eu une adresse visible. Elle a été retirée.

À lire avant de conclure quoi que ce soit du § 3, parce que l'histoire compte
autant que la liste.

Entre le 2026-08-28 après-midi et le soir du même jour, ces 27 articles ont été
**annoncés à l'exploitant** : une carte en tête du tableau de bord de chaque
établissement les nommait un par un, avec leur motif, et les 25 `declareA` qui
disaient « Non déclaré à ce jour » ont été réécrits pour pointer vers elle. Le
cliquet `MUETS` est passé de 31 à 0.

**Elle a été retirée le soir même, par décision produit, et non parce qu'elle
était fausse.** La raison est la seule qui compte pour qui relit ceci : déclarer
sur l'écran de chaque dirigeant ce que le produit ne couvre pas suppose d'avoir
tranché ce qu'il couvre — et cette question n'est pas encore tranchée. L'axe
répondait à une question qui n'était pas posée.

Deux conséquences à ne pas perdre :

- **`MUETS` est remonté à 25**, et le nombre doit se lire avec sa cause. Il ne
  remonte pas parce que le référentiel a régressé : il remonte parce que la
  surface qui déclarait ces articles a été retirée. Le laisser à 0 aurait fait
  affirmer au test que 27 manques sont annoncés à quelqu'un, ce qui est faux —
  et un cliquet qui ment est pire que pas de cliquet. Le faire redescendre
  suppose de **couvrir** ces obligations, ou de leur rendre une adresse
  **visible par l'exploitant**. Pas de trouver un autre document interne où les
  ranger : ce document-ci n'en est pas une.
- **Le mécanisme, lui, est intact.** Les quatre autres axes tournent, les
  bandeaux et le PDF les portent. Réactiver `famille_obligation` est un ajout
  de quelques lignes le jour où la question sera tranchée — de préférence
  après le rattachement article → `typeErp` du § 2, qui le rendra propre au
  dossier plutôt que général.

Ce qui a été appris au passage, et qui survit au retrait : **le champ `declareA`
mélange deux choses de nature différente** — une adresse produit, visible par
l'exploitant, et une note interne comme ce document. Le cliquet les compte
pareil. La distinction reste à trancher (elle relève du lot 3) ; elle n'est pas
théorique, puisque le même chantier a produit les deux formes en une soirée.

---

## 4. Ce que la construction a appris, et qui vaut pour le point à faire

**Le corpus attendait déjà cette surface.** Au 2026-08-28, les 27 articles
`non_couvert` portaient tous un `declareA`, dont 25 disaient « Non déclaré à ce
jour. » — un champ qui déclare ne rien déclarer. Deux d'entre eux nommaient le
défaut mot pour mot :

> « Le bandeau de couverture annonce la catégorie d'ERP, pas les locaux à
> sommeil. »
>
> « Un exploitant hôtelier ne verra rien qui l'avertisse que ces trois
> obligations lui manquent. »

Et `corpus.test.ts` portait un cliquet dessus — `MUETS`, avec la consigne « ce
chiffre doit descendre, soit en couvrant, soit en déclarant ». **La question
« que ne couvre-t-on pas ? » n'a donc pas été ouverte par ce chantier : elle
était posée, comptée et suivie depuis le dépouillement.** Ce qui manquait était
une adresse. C'est ce document, désormais.

**Deux limites du cliquet, à connaître avant de s'y fier** (elles relèvent du
lot 3, non traité ici) :

1. Il cherche la chaîne littérale « Non déclaré », définie nulle part et écrite
   à la main dans chaque entrée. Une reformulation sort un article du compte en
   silence. La branche est aujourd'hui **morte** — plus aucun article ne la
   déclenche — donc le piège est armé sans occurrence.
2. Il vérifie qu'un `declareA` est **présent**, jamais que l'adresse citée
   **existe**. Un meilleur invariant serait : *tout article `non_couvert` a une
   adresse, et cette adresse mène quelque part.* Le premier est un plafond qu'on
   abaisse à la main, le second une garantie qui ne peut pas dériver.

**Le référentiel sectoriel du DUERP n'est pas un référentiel réglementaire.**
`restauration.ts`, `commerce.ts` et `bureau.ts` citent des articles
(`R. 4511-1`, `R. 4431-2`, `R. 4433-1`) mais tous en commentaire ou en prose :
zéro `ReferenceLegale` structurée, zéro `versionConstatee`, aucune ne produit
d'échéance. Ce sont des mentions, pas des obligations. Le socle documentaire est
INRS — ED 880, ED 840, OiRA.

**Et il n'existe aucune référence réglementaire du document unique par secteur.**
`L. 4121-3` et `R. 4121-1` disent « évaluez les risques » sans nommer ni secteur,
ni unité de travail, ni liste. Un secteur manque au produit quand l'INRS n'a pas
publié son guide : c'est une limite éditoriale, pas juridique. Ce constat a
défait le verrou d'onboarding, qui refusait la création d'un dossier hors des
trois secteurs « parce que le DUERP produit ne serait pas fiable » — un motif qui
invoquait un droit qui ne dit pas cela.

---

## 5. Ce qui reste à l'écran, et pourquoi

La carte du tableau de bord est retirée. Ce qui reste :

- **Le bandeau du calendrier et celui du registre.** Ils se lisent avant le
  contenu qu'ils qualifient — un dirigeant hors périmètre doit savoir que ce
  qui suit est incomplet avant de le lire, pas après. Ce sont les deux écrans
  qu'on suit pour savoir quoi faire, et les deux qu'on présente à une
  commission.
- **Le bloc « Ce que ce dossier ne couvre pas » du dossier de conformité PDF.**
  Le détail article par article n'y est **pas** imprimé : vingt-sept motifs de
  dépouillement rédigés pour un relecteur interne feraient passer une note de
  travail pour une pièce du dossier. Le décompte y est.
- **Tout le socle `perimetre/`**, inchangé.

Aucune de ces surfaces ne qualifie la situation au regard du droit : ni
« conforme », ni « non conforme », ni « incomplet ». Elles décrivent ce que
l'outil sait, à sa version courante. Une obligation que le produit ne traite pas
reste due si un texte l'impose — et c'est la phrase que le chapeau du PDF doit
toujours porter.

---

## 6. La question ouverte, pour le point à venir

Ce document dit ce que le produit ne couvre pas. Il ne dit pas ce qu'il couvre,
et cette mesure manque toujours : **« 84 obligations » dit ce que le référentiel
porte, pas ce qu'un établissement donné déclenche.** Personne ne sait combien
d'obligations sont atteignables par un profil type — un restaurant de 6
personnes, un commerce de 3, un bureau de 12.

Elle est écrivable : le corpus porte des clés d'article, le moteur rend les
obligations applicables pour un couple (typologie, parc). C'est probablement le
premier chiffre à produire pour trancher « ce que Rojer fait réellement, et pour
qui ».
