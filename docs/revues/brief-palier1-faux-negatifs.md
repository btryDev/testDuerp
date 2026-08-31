# Palier 1 — les obligations que le produit doit et ne montre pas

## Pourquoi ce lot passe avant les autres

Six obligations **existent** dans le référentiel. Elles sont accrochées à une
catégorie d'équipement qui ne les conditionne pas — et un établissement qui n'a
pas déclaré cet équipement ne les voit donc **jamais**, alors qu'il y est soumis.

Un restaurateur qui n'a pas déclaré d'alarme incendie lit aujourd'hui un
calendrier sans le moindre exercice d'évacuation. Le produit ne dit pas « je ne
sais pas » : il ne dit rien.

**Dans un outil de conformité, un faux négatif est pire qu'un trou.** Le trou se
voit ; le faux négatif rassure à tort. C'est pourquoi ce lot passe avant tout
ajout de couverture : corriger ce qui ment avant d'ajouter ce qui manque.

**Le blocage est levé.** La note de `src/lib/referentiels/conformite/incendie.ts`
l'écrit elle-même, à propos de ces obligations exactes :

> *« La note concluait que corriger ce faux négatif suppose de rendre le
> calendrier capable de porter une obligation sans équipement — décision de
> schéma, à instruire séparément. C'est fait (ADR-022). Le modèle ne bloque
> plus ; ces deux obligations peuvent passer au porteur établissement. Elles ne
> l'ont PAS été dans ce lot […]. C'est le lot suivant, et il est court. »*

Tu es ce lot suivant.

---

## Ce n'est pas un lot de rebranchement

Si c'était trois champs à changer, il serait déjà fait. **Le vrai contenu est une
relecture réglementaire**, et le rebranchement en est la conséquence.

> **RECTIFIÉ le 2026-08-31, après vérification par l'agent qui a exécuté ce lot.**
>
> Ce paragraphe annonçait que la description de `R. 143-44` était périmée et
> qu'il fallait la relire. **C'était faux.** La description porte déjà le 5° et
> le renvoi à `R. 141-10`/`R. 141-11`, et la référence porte
> `versionConstatee: "2026-07-01"`. Les points (1) et (2) avaient été réparés
> avant ce lot ; c'est la **note** d'`incendie.ts` qui était restée périmée, pas
> le contenu — et j'ai lu la note comme si elle décrivait le code.
>
> Seul le point (3) tenait : `R. 146-35` reste cité sans `igh: true`, l'IGH étant
> hors périmètre.
>
> Ce que ça ne change pas : la relecture au verbatim reste le premier geste du
> lot, et elle a servi — elle a confirmé « dans les établissements soumis aux
> prescriptions du présent chapitre », c'est-à-dire tous les ERP, aucun
> équipement nommé. C'est ce qui fonde le rebranchement.
>
> **Ce que ça enseigne** : une note qui annonce un travail à faire ne dit pas
> qu'il reste à faire. Ouvrir le fichier, pas la note.

---

## Les six

Vérifie chacune sur pièce : cette liste vient d'un document de travail
(`docs/carto-obligations-hors-equipement.md`) et d'une note de code, pas d'une
lecture des textes. **Deux d'entre elles sont confirmées** par la note de
`incendie.ts` ; les quatre autres sont à établir.

| # | Obligation | Ancrage actuel présumé | Devrait être | Issue |
|---|---|---|---|---|
| 1 | Tenue du registre de sécurité | `EXTINCTEUR` / `ALARME_INCENDIE` | établissement, sans condition d'équipement | **rebranchée** |
| 2 | Exercices d'évacuation semestriels | `ALARME_INCENDIE` | établissement | **rebranchée** |
| 3 | Consignes de sécurité incendie | équipement | établissement | **rebranchée** |
| 4 | Visites de la commission de sécurité | équipement | établissement, sous régime ERP | **refusée** — `PE 37` ne vise que les établissements comportant des locaux à sommeil pour le public. Rebrancher ferait naître une échéance chez chaque boutique de 5ᵉ catégorie. Demande un attribut d'établissement qu'on ne collecte pas |
| 5 | Registre unique de sécurité | partiel | établissement | **refusée** — `L. 4711-5` dit « l'employeur **est autorisé à** réunir ces informations ». C'est une **faculté**, pas une obligation. La carto la qualifiait mal, ce brief l'a recopiée |
| 6 | Agents chimiques — notice de poste | équipement | à établir | **refusée** — `R. 4412-38` se déclenche sur la présence d'agents chimiques : le cinquième déclencheur, non implémenté. Rebrancher imposerait la formation au risque chimique à un cabinet |

*Colonne « issue » remplie le 2026-08-31, après exécution. Trois des six lignes de
ce brief ne tenaient pas à la vérification — elles venaient d'un document de
travail que je n'avais pas recoupé. L'agent a eu raison de les refuser, et c'est
ce que le brief lui demandait de faire.*

**Si une ligne ne tient pas à la vérification, dis-le et n'y touche pas.** Un
rebranchement injustifié ferait naître des échéances qui ne sont pas dues —
l'erreur symétrique, et tout aussi grave.

Pour la 4 : `R. 143-41` fonde les visites mais **ne fixe aucun rythme** en
5ᵉ catégorie. Une quinquennale a déjà été affichée ici sans fondement textuel et
retirée. N'invente aucune périodicité — si le texte n'en écrit pas, l'obligation
est un état à maintenir (`periodicite: "autre"`), pas une échéance.

---

## Frontière avec le lot 7, qui tourne en parallèle

Un autre agent travaille sur `feat/depouillement-salarie` : le dépouillement des
textes portant les obligations de salarié. **Ne t'en approche pas.**

**Ce qui est à lui, pas à toi :**

- `DOMAINES_OBLIGATION` dans `conformite/types.ts` — il en ajoute, tu n'y touches
  pas. Tes six obligations gardent le domaine qu'elles ont.
- `prisma/schema.prisma` et toute migration.
- `prestataires/domaines.ts`.
- Tout fichier de corpus sur `R. 4141-*`, `R. 4624-*`, `R. 4224-14` à `-16`,
  `R. 4323-55`.

**Ce que vous toucherez tous les deux, et c'est prévu :**

- `conformite.test.ts` — le compte d'obligations et `EMPREINTE_ATTENDUE`.
  L'empreinte hache `categoriesEquipement` **et** le porteur : la changer est
  inévitable pour toi. Mets-la à jour chez toi ; celui qui merge en second
  recalculera. Ce n'est pas un problème, c'est une ligne.
- `.claude/CLAUDE.md`, qui annonce le compte.

Si tu crois avoir besoin de quelque chose qui est à lui, **demande-moi** — je
coordonne les deux.

---

## Vérification

`pnpm vitest run`, `npx tsc --noEmit`, `npx eslint src`. Attendu au départ :
**1745 tests verts**, `tsc` propre, un seul avertissement eslint préexistant
(`normaliserFormData`).

**Ce lot a une vérification qui lui est propre, et elle compte plus que les
tests.** Le point du lot est qu'une obligation apparaisse là où elle
n'apparaissait pas. Un test vert ne le montre pas. Donc, pour chaque obligation
rebranchée, écris un test qui l'établit **par le moteur** : un établissement
sans aucun équipement déclaré doit recevoir cette obligation. Et éprouve-le en
réinjectant le défaut — remets l'ancrage d'origine, le test doit tomber, seul et
nommé. Une garantie qu'on n'a pas cassée est une décoration.

Attention au piège que ce dépôt a déjà rencontré : un test qui recopie le
prédicat qu'il prétend vérifier reste vert quand la garantie est neutralisée.
Fais-le passer par le vrai moteur (`determineObligationsApplicables`).

---

## Les règles du dépôt

- **Ouvre le texte avant de le qualifier.** Les erreurs coûteuses de ce chantier
  viennent toutes d'une conclusion tirée d'un `grep`, d'un résumé ou d'une note.
  Y compris deux erreurs dans les briefs que j'ai écrits cette semaine.
- **Recoupe chaque référence sur Légifrance** et trace la lecture (`luLe`,
  `versionConstatee`, `notesInternes`). Sur 127 liens vérifiés récemment, 6
  servaient un autre article que celui annoncé.
- **N'invente jamais une périodicité.** Si le texte n'écrit pas de durée,
  `periodicite: "autre"`.
- **Aucune norme privée** — NF, APSAD — comme source opposable.
- **N'invente jamais une vérification.** Si tu n'as pas lu le texte, dis-le.
- **pnpm, jamais npm.** Un worktree a son propre `node_modules`.
- **Ne pousse jamais sur `main`.** Branche : `fix/faux-negatifs-ancrage`.

## Ce que tu rends

Une branche et un rapport dans `docs/revues/rapport-palier1.md` :

- la relecture de `R. 143-44` version 1ᵉʳ juillet 2026 : ce qui change, ce que la
  description doit dire, et si `typologies` doit gagner `erp: true` ;
- par obligation : l'ancrage constaté, ce que le texte fonde réellement, le
  porteur retenu et **pourquoi** ;
- celles que tu n'as **pas** rebranchées, et ce qui t'en a empêché ;
- combien d'obligations un établissement sans équipement reçoit avant et après.
  C'est la mesure du lot.

Une question ? Elle vient à la session qui t'a délégué ce lot, pas à la
propriétaire.
