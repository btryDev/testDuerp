# Lot A — constats au fil de l'eau

Branche `lot-a/exclusions-mutuelles`, worktree propre parti de `origin/main`
(`2a54efb`), `node_modules` à lui.

## 1. Ce que le code fait aujourd'hui — lu, pas grepé

- `salaries/catalogue.ts:33` `cataloguerTitres()` = `obligationsConformite`
  filtré sur `estPorteeParSalarie`, trié par libellé. Aucune notion
  d'incompatibilité, et il n'y a pas de place pour en mettre une : le catalogue
  se **dérive** du référentiel, délibérément (sa docstring l'argumente).
- `salaries/actions.ts` `declarerTitre` valide : schéma zod, appartenance du
  titre au catalogue (`titreParId`), appartenance du salarié à l'établissement,
  puis `upsert` sur `(salarieId, obligationId)`. **Aucun regard sur les autres
  titres déjà portés par la même personne.**
- `components/salaries/FormulaireTitre.tsx` reçoit déjà `dejaDeclares:
  string[]` — les `obligationId` de la personne — et s'en sert **uniquement**
  pour dire « renouvellement » plutôt que « déclarer ». La donnée nécessaire
  est donc déjà à l'écran ; c'est le savoir qui manque, pas le câblage.
- `app/etablissements/[id]/equipe/[salarieId]/page.tsx:218-227` projette le
  catalogue vers le formulaire en ne gardant que `id, libelle, description,
  pieceMedicale, periodicite`.

## 2. Les couples d'exclusion réellement écrits au référentiel

Relevés en **lisant** les sept obligations de `sante-travail.ts`, pas au grep.

Treize titres salarié au catalogue, dont **cinq** portent le suivi médical :
`sante-travail-salarie-vip` (quinquennale), `-vip-adaptee` (triennale), `-sir`
(quadriennale), `-sir-visite-intermediaire` (biennale), `-sir-categorie-a`
(annuelle).

Le balayage serré (`EXCLUSIF`, `se substitue`, `ne se cumule`, `jamais les
deux`, `n'est pas requise`, `ne doit pas proposer les deux`) sur les dix-sept
fichiers du référentiel ne rend **que `sante-travail.ts`**. Aucune exclusion
n'est écrite ailleurs — les huit autres titres salarié (habilitation,
formations, secourisme, conduite) ne s'excluent ni entre eux ni avec ceux-ci.

Trois exclusions sont écrites dans les notes :

| # | Couple | Fondement écrit | Où |
|---|--------|-----------------|-----|
| 1 | `vip` ⟂ `sir` | R. 4624-24, « se substitue à la VIP » | notes des DEUX obligations (`:81`, `:141`) |
| 2 | `vip-adaptee` ⟂ `vip` | « c'est la même visite, à un rythme adapté, pas une visite de plus » | note de `vip-adaptee` seule (`:251`) |
| 3 | `sir-categorie-a` ⟂ `sir-visite-intermediaire` | R. 4451-82, « la visite intermédiaire […] n'est pas requise » | note de `categorie-a` seule (`:281`) |

**Le coordinateur a raison : il y en a plus de deux. Et il y en a plus de
trois.** Deux couples de plus tiennent au MÊME critère que ceux déjà écrits,
appliqué aux deux obligations entrées en dernier :

| # | Couple | Fondement |
|---|--------|-----------|
| 4 | `sir-categorie-a` ⟂ `sir` | Même critère que #2. C'est la **même visite de R. 4624-28** à un rythme annuel : la description de `categorie-a` écrit elle-même « renouvelée chaque année — **et non tous les quatre ans** », et sa note « la périodicité passe donc de quatre ans à un an ». |
| 5 | `vip-adaptee` ⟂ `sir` | Même critère que #1. R. 4624-24 substitue l'examen du SIR à « la visite d'information et de prévention prévue à l'article R. 4624-10 » ; `vip-adaptee` EST cette visite, aux modalités adaptées de R. 4624-17. |

Et deux de plus par composition des deux critères — `categorie-a` est l'examen
du SIR, donc il se substitue lui aussi à la VIP sous ses deux formes :

| # | Couple |
|---|--------|
| 6 | `sir-categorie-a` ⟂ `vip` |
| 7 | `sir-categorie-a` ⟂ `vip-adaptee` |

**Sept couples, sous deux critères et un seul, pas sept décisions.** Un
mécanisme dimensionné sur deux en aurait trouvé sept : c'est exactement
l'avertissement du coordinateur.

## 3. La ligne que je ne franchis pas : exclu ≠ incohérent

Trois autres couples restent possibles sur le papier et je ne les déclare
PAS — c'est ce qui empêche la table de devenir un treillis inventé :

- `vip` ⟂ `sir-visite-intermediaire`, `vip-adaptee` ⟂ `sir-visite-intermediaire`.
  La visite intermédiaire s'intercale « entre deux examens réalisés par le
  médecin du travail » : chez un salarié qui n'a que sa VIP, elle **ne naît
  pas**. Ce n'est pas la même chose qu'une exclusion. Aucun texte n'écrit
  qu'elle est interdite ou non requise pour lui — R. 4451-82 l'écrit pour la
  catégorie A, et c'est pourquoi ce couple-là, lui, est déclaré.
- `sir` ⟂ `sir-visite-intermediaire` est le contraire d'une exclusion : c'est
  une **transmission déjà déclarée** (`transmet` de `sir`, ADR-024). Les deux
  se cumulent, et doivent se cumuler.

**Le champ porte ce qu'un texte EXCLUT, pas ce qui serait seulement
incohérent.** Sans cette ligne, la table grossit sans fondement et le produit
se met à refuser des saisies que le droit n'interdit pas — le faux positif que
la propriétaire proscrit.
