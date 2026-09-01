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
| 5 | `vip-adaptee` ⟂ `sir` | Même critère que #1, **à un pas de plus**. R. 4624-24 substitue nominativement l'examen du SIR à « la visite d'information et de prévention prévue à l'article R. 4624-10 » ; R. 4624-17 fait courir ses modalités adaptées « à l'issue de la visite d'information et de prévention » — visite qu'un salarié en suivi renforcé n'a pas. |

Et deux de plus par composition des deux critères — `categorie-a` est l'examen
du SIR, donc il se substitue lui aussi à la VIP sous ses deux formes :

| # | Couple | Fondement |
|---|--------|-----------|
| 6 | `sir-categorie-a` ⟂ `vip` | R. 4451-82 renvoie le suivi du travailleur classé aux articles **R. 4624-22 à R. 4624-28**, intervalle qui CONTIENT R. 4624-24. Le renvoi lu en entier fonde le couple nominativement. |
| 7 | `sir-categorie-a` ⟂ `vip-adaptee` | Même chaîne que #6, plus le pas de #5. |

Les sept articles ont été **relus sur Légifrance le 2026-09-01 avant d'être
cités**, et cette relecture a corrigé le fondement de #2 : la note du
référentiel disait « c'est la même visite, à un rythme adapté », mais
R. 4624-17 n'écrit pas cela — il fait bénéficier le travailleur, « à l'issue de
la visite d'information et de prévention », de « modalités de suivi adaptées
[…] selon une périodicité qui n'excède pas une durée de trois ans », et son
seul renvoi normatif est au troisième alinéa de L. 4624-1. **L'exclusion tient,
mais pas pour la raison écrite** : ce qui l'oppose à `vip`, c'est
l'inconciliabilité des plafonds — trois ans ici, cinq à R. 4624-16 pour le
renouvellement du même suivi. Le motif montré au dirigeant a été réécrit en
conséquence, et la note du référentiel avec lui. C'est la règle « le rapport ne
doit pas être plus affirmatif que le texte », appliquée à un motif qui, ici,
s'affiche à l'écran.

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

## 4. La forme retenue, et pourquoi

**Un champ `exclut` sur `ObligationPorteeParSalarie`, requis.** Pas une règle
d'interface, pas une `ConditionApplication`.

- **Au référentiel, pas à l'interface.** L'exclusion est une propriété du
  texte. Une règle écrite dans le formulaire serait invisible à
  `declarerTitre` — action serveur atteignable sans lui — et invisible aux
  dossiers où les deux titres sont **déjà** déclarés. Le dépôt a le précédent
  exact : `transmet` (ADR-024).
- **Requis, et l'arithmétique n'est pas celle qu'on craignait.** Le champ ne
  vit que sur le porteur salarié : **treize** obligations, pas cent seize. Une
  exclusion ne peut mordre que là où un humain DÉCLARE — les instances
  d'équipement et d'établissement sont dérivées par le moteur, qui ne peut pas
  produire un couple interdit. Requis sur treize lignes dont cinq portent
  quelque chose, ce n'est pas du sur-engineering : c'est le cliquet. Et
  l'oubli est ici la faute **constatée**, pas supposée — les deux dernières
  obligations entrées dans ce fichier ont chacune créé une exclusion, l'ont
  écrite en note, et personne ne l'a portée nulle part.
- **Un seul côté déclare : le côté dérogatoire**, celui qui porte le texte
  d'exception. La symétrie se **ferme à la lecture** (`exclusionsDuTitre()`),
  elle n'est donc pas une liste recopiée qu'on vérifie, elle est vraie par
  construction. C'est la règle du dépôt sur les listes tenues à la main.
- **Jamais de fermeture transitive.** A exclut B et B exclut C n'implique pas
  que A exclut C. Chaque couple se déclare avec le texte qui le fonde.

## 5. Ce que le produit fait, et pourquoi il refuse au lieu de signaler

- `declarerTitre` **refuse**, en nommant le titre en conflit et en citant
  l'article. Le dépôt préfère d'ordinaire nommer le trou plutôt que trancher
  (ADR-024) ; ici le texte a déjà tranché — « se substitue à », « n'est pas
  requise ». Et le critère de l'erreur visible par qui la subit tranche dans
  le même sens : un silence produit une ligne de calendrier fausse que
  personne ne remarque, un refus est vu par celui qui vient de cliquer.
- Le formulaire **affiche le titre exclu, désactivé, avec la raison**. Le
  retirer de la liste aurait été le silence que ce dépôt refuse : un dirigeant
  qui ne trouve pas la VIP conclut que Rojer ne la connaît pas.
- La fiche **nomme les cumuls déjà en place** et dit que le calendrier porte
  un rendez-vous non prévu. Rojer ne retire rien de lui-même : lui seul sait
  laquelle des deux visites cette personne passe.

## 6. Les gardes, éprouvées en réinjectant le défaut

Relevé de sortie, pas annonce.

| Injection | Résultat |
|---|---|
| A — l'exclusion VIP/SIR retirée du référentiel | `5 failed` / `11 passed` (16) |
| B — la fermeture par symétrie supprimée | `7 failed` / `9 passed` (16) |
| C — le refus retiré de `declarerTitre`, référentiel intact (**le défaut d'origine, à l'identique**) | `3 failed` / `13 passed` (16) |
| D — un cumul que le droit IMPOSE déclaré exclusif (`-sir` ⟂ visite intermédiaire) | `3 failed` / `13 passed` (16) |

D est la contre-épreuve qui compte autant que les trois autres : elle vérifie
que le mécanisme mord aussi quand il **excède**. Un dispositif qui n'attrape
que la sous-application finirait par retirer du calendrier des rendez-vous
réels.

Suite complète : `135 passed` (fichiers), `1858 passed` (tests) — 1836 de référence + 22.
`tsc --noEmit` propre, `eslint src` avec le seul avertissement préexistant.
