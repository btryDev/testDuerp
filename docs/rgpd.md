# RGPD et politique de rétention

Ce document décrit les données personnelles que la plateforme traite, à quel
titre, et combien de temps elle les garde.

**Réécrit le 2026-08-27**, avant l'introduction de l'entité `Salarie`
(ADR-023). La version précédente affirmait que l'outil « ne stocke pas
d'identifiant personnel de dirigeant, de CSE ou de salarié ». Cette phrase
était déjà fausse quand elle a été écrite — `Signature.signataireNom` et
`PermisFeu.donneurOrdreNom` existaient — et elle le devient tout à fait avec le
suivi nominatif des habilitations. Elle est retirée, pas amendée.

---

## 1. Le principe : une obligation légale, jamais un consentement

Le traitement des données de salariés repose sur l'**article 6.1.c du RGPD** —
le respect d'une obligation légale à laquelle l'employeur est soumis.

Ce n'est pas un choix de commodité. Le consentement (6.1.a) est écarté
**parce qu'il ne serait pas valable** : il doit être libre, et il ne l'est pas
dans une relation de subordination. Un salarié qui refuserait de voir son
habilitation électrique suivie ne pourrait pas travailler sous tension ; son
« consentement » n'en serait pas un. Fonder le traitement sur une obligation
légale est donc à la fois plus exact et plus protecteur : le salarié n'a rien
à autoriser, et l'employeur n'a rien à lui demander.

Les obligations qui fondent le traitement sont nominatives dans le texte
lui-même. `R. 4544-10` fait délivrer le titre d'habilitation « à un travailleur
désigné » ; il en va de même d'une attestation SST, d'un CACES ou d'une
autorisation de conduite. Un suivi par poste produirait un compteur — « deux
caristes à habiliter » — et ne prouverait jamais rien devant un contrôle.

---

## 2. Ce que l'outil collecte

### 2.1 Données d'entreprise et d'établissement

Raison sociale, SIRET, code NAF, adresse, effectif, typologie réglementaire
(ERP, IGH, habitation) et ses précisions.

Ce sont des données d'entreprise. Le SIRET d'une entreprise individuelle est
toutefois rattachable à une personne physique : il est traité avec le reste.

### 2.2 Salariés — suivi des habilitations et formations

| Donnée | Pourquoi |
|---|---|
| Nom, prénom | Une habilitation est délivrée à une personne désignée (`R. 4544-10`). Sans le nom, il n'y a pas de preuve. |
| Poste ou fonction | Aide l'employeur à voir quels titres sont pertinents pour cette personne. **Ne déclenche rien** : l'outil ne déduit aucune obligation d'un intitulé de poste, c'est l'employeur qui déclare les titres. Champ facultatif — un dossier sans poste renseigné fonctionne à l'identique. |
| Note libre sur un titre | Organisme formateur, niveau d'habilitation. Facultatif. **Jamais un élément médical** — ni motif, ni diagnostic, ni restriction : le champ est saisi par l'employeur, l'outil ne peut pas le contrôler, et cette ligne est l'avertissement qui en tient lieu. |
| Date d'entrée dans l'effectif | Point de départ des obligations « à l'embauche » (formation à la sécurité, visite d'information et de prévention). |
| Nature, date et échéance de chaque titre | L'objet même du suivi. |
| Présence ou absence de la pièce justificative | Ce que l'outil sait dire : « l'attestation existe et court jusqu'au … ». |

Une précision sur la ligne « poste », parce que la première rédaction de ce
document disait l'inverse et que c'est la nécessité du champ qui en dépendait :
il n'a **aucune fonction opérante**. Le moteur ne sait pas déduire d'un intitulé
de poste qu'une personne opère sous tension — ce serait le déclencheur
« activité réellement exercée », que le produit n'implémente pas. Le champ est
donc collecté pour l'usage humain, et à ce titre il reste facultatif.

**Ce que l'outil ne collecte pas, et ne collectera pas :** date de naissance,
NIR, adresse personnelle, coordonnées privées, rémunération, situation
familiale. Aucune de ces données n'est nécessaire à une obligation de
santé-sécurité. Les demander « au cas où » créerait un fichier du personnel,
qui n'est pas ce produit.

### 2.3 La frontière sur la santé

C'est la partie qui demande le plus de précision, parce que le droit y est
précis et que l'erreur y coûte cher.

**Ce que l'employeur ne reçoit jamais** — le dossier médical en santé au
travail est constitué et détenu par le service de prévention et de santé au
travail (`L. 4624-8`). Aucun élément de diagnostic, aucun motif, aucun résultat
d'examen ne parvient à l'employeur. Ce n'est pas une politique du produit,
c'est la loi.

**Ce que l'employeur détient légalement** — et l'outil ne doit pas prétendre
l'ignorer :

- l'**avis d'aptitude ou d'inaptitude**, transmis à l'employeur, qui « le
  conserve pour pouvoir le présenter à tout moment, sur leur demande, à
  l'inspecteur du travail et au médecin inspecteur du travail »
  (`R. 4624-55`) ;
- les propositions d'aménagement de poste et les restrictions ;
- la **copie de l'attestation d'absence de contre-indication médicale** au
  travail sous tension, que l'employeur « conserve pendant toute sa durée de
  validité » (`R. 4544-11-1`, en vigueur depuis le 01/10/2025).

**Ce que l'outil choisit de stocker — moins que ce que le droit permet.**
Pour toute pièce médicale, l'outil enregistre trois choses : qu'elle existe, sa
date, son échéance. Jamais le motif, jamais le sens détaillé, jamais le fichier.

C'est un **choix produit, pas une obligation** : `R. 4544-11-1` autorise
expressément l'employeur à conserver copie de l'attestation. Le choix se
justifie ainsi — un outil qui héberge des pièces médicales de salariés change
de nature réglementaire et de surface de risque ; la valeur ajoutée d'en garder
le contenu est nulle, puisque l'échéance suffit à piloter ; et la conservation
de la pièce elle-même reste à la charge de l'employeur, hors de l'outil.

Ce choix est révisable, mais il ne doit pas l'être par inadvertance : ajouter
un champ de téléversement sur une échéance médicale suffirait à le défaire.

### 2.4 Rapports de vérification

Métadonnées (date, organisme, résultat, commentaires) et fichier binaire.

Les rapports **contiennent des données personnelles, et c'est le texte qui
l'exige** : `D. 4711-2` impose que l'attestation ou le rapport mentionne
« l'identité de la personne ou de l'organisme chargé du contrôle ou de la
vérification ». Le nom du technicien n'y est pas par accident.

L'utilisateur reste responsable de ce qu'il dépose : un rapport peut contenir
davantage (signature scannée, numéro d'habilitation d'un tiers).

**La portée de `D. 4711-2` s'arrête ici.** L'article vise les vérifications et
contrôles mis à la charge de l'employeur « au titre de la santé et de la
sécurité **au travail** ». Il ne couvre donc ni `Action.responsable` — la
personne à qui l'employeur confie une action corrective n'est pas un
vérificateur — ni `ReleveTemperature.operateur` : un relevé d'eau chaude
sanitaire relève du carnet sanitaire (arrêté du 1er février 2010,
`R. 1321-23` CSP), dont l'article 3 demande de consigner « les modalités et
les résultats » de la surveillance, et non l'identité de qui relève.

Le maintien de `responsable` dans les documents remis est donc un fondement
**produit**, pas légal : un plan d'actions sans porteur nommé perd sa
fonction. Ce qu'aucun texte n'impose, aucune formulation de ce document ne
doit le faire croire.

### 2.5 Autres personnes physiques déjà en base

Pour que l'inventaire soit complet, et parce que l'ancienne version de ce
document les passait sous silence :

| Champ | Objet |
|---|---|
| `Prestataire.contactNom`, `contactEmail` | contact d'une personne morale |
| `Signature.signataireNom`, `signataireEmail` | journal d'actes de signature |
| `AccessToken.nomDestinataire`, `emailDestinataire` | destinataire d'un accès temporaire |
| `PermisFeu.prestataireContact`, `donneurOrdreNom` | instantané d'une opération datée |
| `PlanPrevention.efChefNom`, `euChefNom` | instantané d'une inspection commune |
| `Action.responsable` | texte libre saisi par l'utilisateur |
| `ReleveTemperature.operateur` | texte libre : qui a fait le relevé — lu sur l'écran du carnet sanitaire, jamais exporté |

`operateur` manquait à ce tableau, qui se présente pourtant comme
l'inventaire complet. Le champ existait depuis le carnet sanitaire.

**Où ces deux champs sortent, et où ils ne sortent pas.** Un inventaire qui ne
distingue pas les destinataires ne dit pas grand-chose : les deux champs sont
du texte libre nominatif, et la décision du 2026-08-28 ne les traite pas
pareil.

| Champ | Sort | Ne sort pas | Pourquoi |
|---|---|---|---|
| `Action.responsable` | PDF du plan d'actions, dossier de conformité, DUERP — et le snapshot conservé 40 ans, qui conserve ce qui a été remis | serveur MCP (`src/lib/mcp/`) | L'employeur remet ces documents lui-même, en connaissance de cause. Le MCP alimente l'assistant qu'il branche : un nom lu là part vers un LLM tiers par défaut, contre le principe « zéro IA sur le contenu utilisateur ». |
| `ReleveTemperature.operateur` | rien | export ZIP de contrôle (`app/api/`) | Le ZIP est remis « à un inspecteur, un assureur, un bailleur ou un acquéreur ». Le fichier sanitaire, lui, est tenu à disposition de l'ARS — et n'exige pas ce nom. |

**Où `operateur` est lu, et pourquoi il l'est.** Sur l'écran du carnet
sanitaire (`app/etablissements/[id]/carnet-sanitaire/page.tsx`), sur la carte
de chaque point de relevé : « Dernier relevé le 12/08/2026 · par … ».
L'exploitant sait à qui demander quand une mesure surprend, ce qui est
l'usage pour lequel le formulaire demande ce nom. Le champ ne sort pas de
l'établissement, déjà responsable de traitement des personnes qu'il emploie.

Cette finalité a été rendue au champ le 2026-08-28, après qu'il l'eut perdue
le même jour. Le retrait du ZIP était juste — aucun texte n'exige ce nom, et
le ZIP part vers un tiers — mais il laissait un champ que le formulaire
demande, que le schéma valide, que la base conserve, et que plus rien ne
lisait. Une donnée collectée sans finalité tient plus mal sous le principe de
minimisation que la même donnée employée à quelque chose : la corriger
demandait de lui rendre un usage interne, pas de la ressortir.

Une rédaction antérieure de ce paragraphe affirmait déjà que le champ « reste
en base et à l'écran ». Elle était fausse au moment où elle a été écrite —
aucun écran ne le rendait. Une affirmation invérifiable inscrite dans le
registre RGPD lui-même est exactement la classe de défaut que ce lot corrige
ailleurs ; elle a été relevée en revue, et non par celui qui l'avait écrite.

Les deux retenues sont posées dans la **requête** et non dans le formateur :
une colonne ajoutée plus tard au formateur ne peut pas faire ressortir ce que
la requête ne charge pas. Elles sont tenues par
`src/lib/rgpd/frontiere-medicale.test.ts`, éprouvé en réinjectant chaque
défaut plutôt qu'en le décrivant.

**Ce que la garde tient, et ce qu'elle ne tient pas.** Sur `src/lib/mcp/`,
elle tient les deux bouts : les six formes sous lesquelles on lit un champ
nommément, et la **forme des requêtes**. Ce second volet est indispensable —
une requête sans `select` rend tous les scalaires du modèle sans qu'aucun nom
de champ n'apparaisse dans le source. C'est ainsi que `DuerpVersion.snapshot`,
qui porte le `responsable` de chaque mesure, revenait dans le serveur MCP :
vu par un relecteur, pas par la garde.

La règle de forme exige un `select` **à chaque niveau**, et non un `select`
quelque part dans la requête. La nuance n'est pas théorique : une première
rédaction se contentait du second, et une relation imbriquée sans `select`
propre la satisfaisait tout en ramenant la ligne entière — le défaut d'origine
se réécrivait à l'identique sous garde verte, sous la graphie la plus naturelle
pour qui vient de lire « pas d'`include`, mets un `select` ».

**La règle échoue fermée.** Une deuxième rédaction listait les relations, lues
dans `prisma/schema.prisma`, et refusait `X: true` quand `X` en était une.
Cette polarité-là échoue **ouverte** : toute lacune d'analyse retire un nom de
la liste, et le `X: true` correspondant passe au vert. Une revue l'a montré en
indentant `model Prestataire {` d'un espace — schéma toujours valide pour
`prisma validate`, garde toujours verte, `select: { prestataires: true }`
devenu acceptable.

La polarité est donc inversée : `X: true` n'est accepté que si `X` est un
scalaire **reconnu** — type primitif Prisma ou énumération déclarée. Tout ce
que l'analyse ne comprend pas est refusé : une relation, une variable, une
diffusion, une clé entre guillemets ou calculée, un ternaire, un nom que la
lecture du schéma n'a pas vu. Chacun de ces cas peut cacher une relation
entière, et chacun produit désormais un rouge bruyant plutôt qu'un vert muet.
C'est la dissymétrie tenue partout ailleurs ici : le pire échec possible doit
être le faux rouge.

Un cliquet sur le nombre de relations aurait fermé la moitié du trou — il
aurait vu le modèle indenté, dont le compte baisse, mais pas une relation
**ajoutée** dans une graphie non reconnue, dont le compte ne bouge pas. Et son
plancher se relève à la main au moment précis où l'on ajoute des relations,
c'est-à-dire au seul moment où une relation invisible est indiscernable.

Sur `app/api/`, elle ne tient que les lectures nommées d'`operateur`. La règle
de forme n'y est **pas** appliquée : elle obligerait des dizaines de routes
internes à énumérer leurs colonnes sans rien protéger, et une règle qu'on
excepte partout finit par ne plus être lue. Une route qui ferait un
`findMany` sans `select` sur `ReleveTemperature` chargerait donc `operateur`
en silence. Elle ne l'écrirait nulle part — le second volet de la garde reste
absent, il est écrit ici pour ne pas passer pour acquis.

### 2.6 Risques et mesures du DUERP

Les risques décrivent des **postes** et des **unités de travail**, pas des
personnes (principe INRS ED 840). `nombreSalariesExposes` est un agrégat.

Les libellés de mesures peuvent citer une fonction (DAF, RH). À charge de
l'utilisateur de ne pas y porter de patronyme — l'outil ne peut pas l'en
empêcher, il l'en informe.

### 2.7 Comptes utilisateurs

L'authentification est **en place** (ADR-005) : elle repose sur Supabase Auth,
qui détient l'identité (email, mot de passe haché). Il n'y a pas de modèle
`User` en base applicative ; `Entreprise.userId` fait le lien.

---

## 3. Hébergement

- Base de données et authentification : **Supabase**, région UE (Francfort).
- Stockage de fichiers : filesystem local en développement, à migrer vers un
  stockage UE en production (`src/lib/storage/`).

Aucun transfert hors UE.

---

## 4. Durées de conservation

Le **référentiel CNIL « durées de conservation — gestion des ressources
humaines »** (publié le 2 avril 2026, mis à jour le 20 mai 2026) sert de
cadre. Deux précisions à son sujet, faute de quoi on lui ferait dire ce qu'il
ne dit pas :

- il distingue la **base active** (le temps de l'usage courant) de
  l'**archivage intermédiaire** (après l'objectif atteint, quand la donnée
  reste nécessaire à une obligation légale ou à une preuve en cas de
  contentieux) ;
- il **ne couvre ni les formations, ni les habilitations de sécurité, ni le
  suivi médical**. Ses rubriques vont du recrutement à la paie, aux accidents
  du travail et au contentieux. Pour nos échéances de salarié, il donne le
  cadre du dossier professionnel, pas une durée toute faite.

| Donnée | Base active | Archivage | Fondement |
|---|---|---|---|
| Entreprise / Établissement | Durée de l'activité | + 1 an | Restauration d'un compte fermé par erreur |
| **Versions de DUERP** | — | **40 ans** | `R. 4121-4` CT (loi du 2 août 2021) — **obligation** |
| **Rapports et attestations de vérification** | Exploitation courante | **5 ans au moins**, et en tout état de cause les **deux dernières** vérifications | `D. 4711-3` CT — **obligation** |
| **Salarié — identité et poste** | Durée de la relation de travail | Jusqu'à l'expiration des délais de prescription applicables | Référentiel CNIL, « gestion du dossier professionnel » (recommandation) |
| **Salarié — titres et échéances** | Durée de validité du titre | Jusqu'au terme du délai de prescription de l'action en responsabilité | `D. 4711-3` par analogie : la preuve d'une habilitation se présente au même contrôle que le rapport qui l'accompagne |
| Actions correctives | Tant que la vérification liée existe | — | Suppression en cascade |
| Fichiers physiques des rapports | Idem rapports | — | Supprimés avec la ligne |

### 4.1 Correction d'une erreur de la version précédente

L'ancienne table justifiait la conservation des rapports par `L. 4711-5` et
retenait « la durée de vie de l'établissement ». Les deux étaient inexacts.
`L. 4711-5` **n'institue aucune durée** : il autorise seulement à réunir
plusieurs registres en un seul document (`.claude/CLAUDE.md` le dit déjà). Le
texte qui fixe la durée est **`D. 4711-3`** — cinq ans au moins, et les deux
dernières vérifications quoi qu'il arrive. La CNIL le cite d'ailleurs comme
obligation dans sa rubrique « gestion des accidents du travail ».

Conserver plus longtemps reste possible et souvent utile — un registre de
sécurité se tient dans la continuité — mais c'est alors un choix
d'exploitation, pas une obligation, et il doit se dire comme tel.

### 4.2 Les 40 ans du DUERP

Les versions figées (`DuerpVersion.snapshot`) sont conservées **40 ans**
(`R. 4121-4`). Concrètement :

- une `DuerpVersion` ne peut jamais être supprimée avant ce terme ;
- même sur demande d'effacement, elles sont exclues du périmètre — exception de
  l'**article 17.3.b du RGPD**, respect d'une obligation légale ;
- les risques et unités de travail suivent, puisqu'ils font partie du snapshot.

### 4.3 Sortie d'un salarié de l'effectif

Un salarié qui quitte l'entreprise est **désactivé, pas supprimé** tant que ses
titres sont dans leur délai de conservation : la preuve qu'il était habilité au
moment où il a opéré subsiste, et c'est elle qui protège l'employeur en cas de
contrôle portant sur une période passée. Passé le délai, ses données sont
effacées.

Cas particulier, à ne pas perdre de vue : `R. 4544-10` prévoit que les
attestations d'aptitude délivrées avant le 01/10/2025 restent valides
**jusqu'au 01/10/2030**. Une échéance calculée sur le régime nouveau chez un
salarié couvert par l'ancien serait fausse.

---

## 5. Droits des personnes

Deux catégories de personnes, deux chemins.

### 5.1 Le titulaire du compte (le dirigeant)

1. **Accès et portabilité** (art. 15 et 20) — export JSON complet.
2. **Rectification** (art. 16) — les formulaires d'édition.
3. **Effacement** (art. 17) — suppression du compte, hors ce qui est soumis à
   obligation légale (`DuerpVersion`).
4. **Opposition et limitation** (art. 18 et 21) — par courriel, traitement
   manuel.

### 5.2 Le salarié suivi — il n'est pas l'utilisateur, et ses droits existent quand même

C'est le point que l'introduction du porteur salarié rend indispensable : la
personne dont les données sont traitées **n'a pas accès à l'outil**. Ses droits
s'exercent auprès de son employeur, qui est le responsable de traitement.

- **Information** (art. 13) — l'employeur doit informer ses salariés de ce
  traitement, de sa base légale et de sa durée. L'outil lui fournit un texte
  d'information réutilisable ; il ne peut pas informer à sa place.
- **Accès** (art. 15) — le salarié peut demander à son employeur les données le
  concernant. L'outil doit pouvoir les extraire pour une personne donnée.
- **Rectification** (art. 16) — une date d'habilitation erronée se corrige.
- **Effacement** (art. 17) — **limité** : les données conservées au titre d'une
  obligation légale (preuve d'habilitation, `D. 4711-3`) ne sont pas effaçables
  à la demande, exception de l'article 17.3.b. Le dire clairement vaut mieux
  que de promettre un droit qu'on ne peut pas honorer.
- **Opposition** (art. 21) — **sans objet** sur un traitement fondé sur 6.1.c :
  le droit d'opposition ne s'applique pas à une obligation légale. Le salarié
  ne peut pas s'opposer à ce que son habilitation soit suivie, pas plus qu'il
  ne peut s'opposer à son bulletin de paie.

### 5.3 Ce qui est livré, et ce qui ne l'est pas

**Livrés avec l'écran Équipe** (2026-08-27), parce que cet écran est
précisément ce qui rend possible de saisir un salarié réel :

- **L'extraction par personne** (5.2, accès) — `GET
  /api/etablissements/<id>/equipe/<salarieId>/donnees`, bouton « Éditer ses
  données » sur la fiche. JSON lisible, chaque bloc portant son explication en
  français : la personne a droit à un format exploitable, et l'employeur doit
  pouvoir relire ce qu'il transmet.
- **Le texte d'information** (art. 13) — `texteInformation()`, affiché sur
  l'écran Équipe dès qu'une personne y figure. Il est **écrit sur ce que
  l'outil collecte réellement**, et non repris d'un modèle générique qui
  décrirait un autre traitement. L'outil le fournit ; il n'informe pas à la
  place de l'employeur, qui reste le responsable de traitement.

**Non livré, et à ne pas confondre avec ce qui précède** : l'export complet du
titulaire du compte annoncé au 5.1 (art. 15 et 20, « export JSON complet »)
**n'existe pas**. Aucune route, aucune action. La phrase du 5.1 décrit une
intention, pas une fonctionnalité — elle est due, elle n'est pas rendue, et
c'est un manque distinct de celui que l'écran Équipe vient de combler.

---

## 6. Sous-traitants

- **Supabase** (Francfort, DE) — base de données, authentification, stockage.
- **Vercel** — hébergement applicatif, région UE.

Aucun autre. Pas de LLM, pas d'analytics tiers, pas de CDN hors UE. Le principe
« zéro IA » du produit a une conséquence directe : **le produit** n'envoie
aucune donnée à un service d'inférence, pour aucun traitement.

**Nuance importante, et elle a d'abord été ratée.** Le produit expose un serveur
MCP (ADR-013) auquel l'utilisateur branche l'assistant de son choix. Ce qui
sort par là quitte notre périmètre. La première version de cette section
affirmait qu'« aucune donnée de salarié n'est envoyée à un service d'inférence,
jamais » — et c'était faux le jour même où la phrase a été écrite : le nom des
salariés partait par le MCP, parce qu'un correctif d'affichage juste dans le
produit avait été appliqué tel quel à une surface sortante.

**Ce qui sort du produit ne nomme donc plus personne.** Une échéance portée par
une personne y lit « Un salarié ». Cela vaut pour le serveur MCP et pour les
trois documents imprimés remis à un tiers — registre de sécurité, dossier de
conformité, export contrôle. Savoir qu'une attestation expire ne demande pas de
savoir de qui : le nom se lit dans l'application, par l'employeur.

Reste une question ouverte, qui n'est pas tranchée ici : le dossier de
conformité est décrit comme présentable à un **bailleur ou un acquéreur**, et
l'intitulé d'une obligation peut rester parlant même anonymisé. Faut-il en
retirer les lignes à porteur salarié plutôt que les anonymiser ? Voir
`docs/dette-chantier-porteur-echeance.md`.

---

## 7. Sécurité

- HTTPS exclusivement en production.
- Authentification déléguée à Supabase (mots de passe hachés côté fournisseur).
- Cloisonnement par établissement : chaque lecture porte le prédicat
  d'appartenance. Prisma opère en rôle `postgres` et contourne donc RLS
  (ADR-005) — l'isolation est une **convention applicative**, ce qui la rend
  d'autant plus critique à respecter dans toute nouvelle requête. Une lecture
  de données de salariés qui omettrait le scope serait une fuite.
- Fichiers : validation MIME et taille (20 Mo), pas d'archives, refus des
  chemins remontants (`LocalFileStorage`).

**Habilitations d'accès internes** : le multi-utilisateur par entreprise n'est
pas implémenté. Il n'y a donc aujourd'hui qu'un seul accès par entreprise,
celui du dirigeant. Le jour où plusieurs comptes coexisteront, l'accès aux
données de salariés devra être restreint — tout le monde n'a pas à voir les
échéances médicales de tout le monde.

---

## 8. Journalisation

Aucune télémétrie applicative. Les journaux HTTP standards sont conservés
30 jours chez l'hébergeur.

**Manque assumé** : les accès aux données de salariés ne sont pas journalisés.
La CNIL recommande de savoir qui consulte quoi. C'est sans objet tant qu'il n'y
a qu'un compte par entreprise ; ce sera dû avec le multi-utilisateur.

---

## 9. Contact

`contact@btry.fr` est le point d'entrée pour toute demande relative aux données
personnelles. Un DPO sera désigné à l'ouverture commerciale si les seuils de
l'article 37 du RGPD sont atteints.

---

## Ce que ce document ne couvre pas

- Le **registre des activités de traitement** (art. 30), que l'éditeur doit
  tenir pour son propre compte.
- L'**analyse d'impact** (art. 35) : le suivi d'habilitations de sécurité sur
  un effectif de TPE ne remplit a priori aucun des critères de la liste CNIL,
  mais l'évaluation reste à formaliser avant l'ouverture commerciale.
- Le **contrat de sous-traitance** (art. 28) liant l'éditeur à ses clients : le
  dirigeant est responsable de traitement, l'éditeur est sous-traitant. Ce
  contrat est dû avant le premier client payant.
