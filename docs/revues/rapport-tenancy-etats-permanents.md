# Rapport — tenancy et gardes du module « états permanents »

**Branche** `fix/tenancy-etats-permanents`, depuis `origin/integration/2026-08-31` ·
quatre corrections · **1834 tests verts** (1824 au départ), `tsc` propre, un
avertissement eslint préexistant (`normaliserFormData`).

---

## 1. Une lecture sans prédicat d'appartenance

**Corrigé.** `listerEtatsPermanents` lisait
`declarationEtatPermanent` sur le seul `etablissementId`, sans `requireUser()`
ni `etablissement: { entreprise: { userId } }`.

**Aucune fuite aujourd'hui** — l'unique appelant passe par
`requireEtablissement(id)`. Ce qui rendait la lecture dangereuse était sa
**signature** : elle accepte n'importe quel `EtablissementMatching`. Le jour où
un second appelant la nourrit d'un id non confronté au user, les déclarations
d'un autre compte sortent, avec leur note libre — du texte écrit par un
dirigeant sur sa propre conformité.

Le prédicat est désormais porté par la lecture, comme `batimentParDefaut` le
fait malgré un appelant vérifié, avec la note « décrit l'usage, pas une
dispense ».

## 2. La garde de l'action ignorait les surcharges de prescription

**Corrigé.** `obligationDeclarable` appelait `modeDeclaration(o)` sur la
périodicité du référentiel ; l'écran, lui, calculait la périodicité **effective**.
Deux lectures de la même règle, dont une fausse.

Conséquence, sans franchissement de compte : une obligation `etat_permanent` à
qui une prescription particulière donne un rythme quitte cet écran pour le
calendrier — mais un POST forgé passait la garde et **écrivait une ligne que
l'écran n'affichera jamais**. C'est la double surface que le commentaire du
module prétend empêcher, atteignable par requête directe.

**Ce que j'ai corrigé n'est pas seulement l'oubli.** La règle acceptait une
périodicité en second argument, avec un défaut commode — et c'est ce défaut qui
a permis à un appelant de l'oublier. Elle vit maintenant dans
`modeDeclarationApplique(app)`, qui prend l'obligation **telle qu'elle
s'applique à ce dossier** et fait la recherche de surcharge lui-même. L'écran et
la garde l'appellent tous les deux : **il n'y a plus d'argument à ne pas
passer.**

La garde a dû devenir asynchrone et charger l'établissement et son parc. Le coût
est une passe de matching par déclaration — c'est une action utilisateur, et une
garde ne peut pas être juste sans connaître le dossier.

**Un second trou apparu en chemin**, que l'ancienne garde laissait passer sans
même invoquer une surcharge : elle ne regardait que le référentiel, jamais
l'établissement. Une obligation d'ascenseur se déclarait « en place » chez un
bureau qui n'en a pas.

## 3. `note` sans borne

**Corrigé.** 500 signes, comme `TitreSalarie.note` — deux notes libres du même
produit n'ont pas à diverger. **Refusée et non tronquée** : couper stockerait une
phrase que le dirigeant n'a pas écrite, sur un écran où il affirme quelque chose
sur sa propre conformité.

## 4. Un accord faux, figé par son propre test

**Corrigé.** `phraseFaitsDates(3, 1)` rendait « 1 sur 3 **portent** une date. »,
et deux assertions le recopiaient mot pour mot. Elles passaient, elles seraient
passées toujours — et elles rendaient la correction **décourageante** : qui
corrigeait l'accord faisait tomber un test vert.

C'est la seule branche interpolée du fichier ; toutes les autres traitent le
singulier, parce qu'elles sont écrites en toutes lettres et que l'œil le voit.
**Le singulier a été traité partout où il était écrit, jamais là où un nombre
s'insère.** J'ai relu les quatre autres interpolations du fichier : les trois
autres sont gardées par une branche `=== 1`.

---

# Les deux questions, et mes réponses

## Une garde mécanique est-elle possible sur le patron de tenancy ?

**Oui, et elle est écrite** (`src/lib/auth/tenancy-lectures.test.ts`). Mais pas
sous la forme demandée, et le détour vaut d'être raconté.

**Première rédaction — treize faux positifs.** Chercher `userId` dans le `where`
de chaque appel donnait treize sites fautifs. En les ouvrant, aucun ne l'était :
le dépôt porte la portée de **trois** façons, toutes justes.

1. le prédicat dans le `where` ;
2. un helper qui l'encapsule — `where: { etablissementId, etablissement }` où
   `etablissement` vient de `portee()` (`salaries/queries.ts`) ;
3. la fonction établit elle-même l'appartenance et n'emploie ensuite que l'id
   vérifié (`prestataires/queries.ts`).

Exiger une seule forme aurait crié à tort treize fois — **la façon la plus sûre
de faire désactiver un garde-fou.**

**L'invariant retenu est plus faible et plus vrai** : une fonction qui lit une
ligne rattachée à un établissement doit établir sa portée d'une manière ou d'une
autre. Sur les 22 modules `queries.ts`, il ne laisse **qu'une seule exception**,
et elle est délibérée : `getRegistrePublicParSlug`, la page publique du registre
d'accessibilité. Elle est inscrite nommément plutôt que détectée — une exemption
qui se devine est une exemption qu'on s'accorde sans y penser.

**Ce qu'il n'attrape pas, et je le dis dans le test** : une fonction qui
appellerait `requireUser()` sans se servir du résultat. Il attrape exactement la
forme des neuf défauts constatés — une lecture qui ne mentionne la portée nulle
part.

### La garde était décorative, et c'est la mutation qui l'a montré

En retirant le prédicat pour éprouver le test, **il est resté vert**. La raison :
il cherchait les marqueurs dans le source brut, et le commentaire que je venais
d'écrire pour expliquer le prédicat contient le mot « requireEtablissement ».
**Le code était nu, la prose le couvrait.**

C'est le mode d'échec propre aux gardes qui lisent du source, et il est
particulièrement vicieux ici : ce sont les modules **les mieux commentés** —
donc ceux qui expliquent leur portée — qui se seraient exemptés tout seuls. Le
test retire commentaires et chaînes avant de chercher. Sans la mutation, j'aurais
livré une garde qui ne gardait rien et je l'aurais annoncée comme une garantie.

## Une assertion peut-elle attraper un accord faux sans recopier la sortie ?

**Oui pour cette forme-là, non en général**, et la distinction est le cœur de la
réponse.

Un test de propriété balaie tout l'espace des entrées et vérifie une **règle** :
le verbe s'accorde avec le nombre qui le précède. Il ne contient aucune phrase
attendue. Éprouvé en réinjectant l'accord faux, il tombe — **et il rapporte
`phraseFaitsDates(2, 1)`, un cas qu'aucune assertion écrite à la main ne
couvrait.** C'est la preuve qu'il généralise au-delà de l'exemple connu, ce que
l'assertion recopiée ne faisait pas.

**Ce qu'il ne fait pas** : contrôler « l'accord » en général. L'accord du
français ne se vérifie pas sans grammaire, et prétendre le contraire serait la
promesse creuse que ce dépôt refuse ailleurs. Il couvre une forme : un nombre
interpolé suivi d'un verbe — celle où le défaut s'est logé, et où il se logera
encore.

Et il porte sa propre contre-épreuve : si la tournure « N sur M » disparaissait
d'une refonte, le test deviendrait vert et vide. Un second test le refuse.

---

## Ce que ces quatre défauts ont en commun

Le premier n'est pas un oubli isolé, et c'est la conclusion qui compte : la règle
était **écrite dans le dépôt**, avec son explication, dans un module voisin. Elle
n'a pas empêché un neuvième cas d'être écrit hier soir dans le seul module qui
ait ajouté des appels Prisma ce jour-là.

**Une convention écrite ne se fait pas respecter par un lot pressé.** Les deux
gardes de ce lot ne remplacent pas les conventions : elles les rendent
opposables au moment où on les enfreint, plutôt qu'au moment où quelqu'un relit.
