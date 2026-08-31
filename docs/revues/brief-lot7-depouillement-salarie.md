# Lot 7 — dépouiller les textes qui portent les obligations de salarié

## Pourquoi ce lot existe

C'est la question qui a ouvert le chantier :

> « Et sur Camille qui est électricienne, il n'y a pas une formation
> obligatoire ? Ou je suis censée le voir où ? »

Le chantier précédent a réglé le **silence**. Le produit dit maintenant
« Suppose un titre nominatif — aucun n'est déclaré », et l'ADR-024 pose le
mécanisme qui le permet.

Il n'a pas réglé la **couverture**. Le catalogue des titres de salarié ne
contient qu'**une seule ligne** : l'attestation médicale quinquennale de
`R. 4544-11-1`. L'habilitation électrique de Camille n'y est pas — c'est
pourquoi la transmission déclare `titre: null`. Dix-huit obligations de
salarié sont recensées dans `docs/carto-obligations-hors-equipement.md` et
aucune n'est encodée.

Elles ne le sont pas parce qu'**une règle du dépôt l'interdit** : on n'encode
pas sur un texte que personne n'a dépouillé, et `corpus.test.ts` la tient. Le
dépouillement est donc le préalable, pas une formalité — et c'est ce qui
manque. Le modèle, lui, est prêt : les trois porteurs sont implémentés
(ADR-022, ADR-023), le catalogue se dérive du référentiel, l'écran Équipe
existe.

## L'état constaté

| Texte | entrées de corpus | cité au référentiel |
|---|---|---|
| `R. 4141-*` — formation à la sécurité | **0** | **0** |
| `R. 4624-*` — suivi médical | **0** | **0** |
| `R. 4224-14` à `-16` — secours | 1 fichier | 2 |
| `R. 4323-55` — conduite, CACES | **0** | 1 |

---

## Les quatre chantiers

| # | Texte | Ce qu'il porte | Porteur |
|---|---|---|---|
| **C1** | `L. 4141-1` à `-4`, `R. 4141-1` et s. | Formation à la sécurité à l'embauche — l'obligation la plus universelle qui soit | salarié |
| **C2** | `R. 4624-10` et s., `R. 4624-22` et s. | VIP et suivi individuel renforcé | salarié |
| **C3** | `R. 4224-14` à `-16` | Matériel de premiers secours **et** personnel formé (SST) | établissement **+** salarié |
| **C4** | `R. 4323-55` et s. | Formation à la conduite, autorisation de conduite, CACES | salarié |

Ils sont indépendants. Fais-les dans l'ordre que tu veux, sauf que **C1 est le
plus utile** : la formation à la sécurité s'impose à tout employeur dès le
premier salarié, sans condition d'équipement ni de secteur.

### Deux consignes qui priment sur tout le reste

**Dépouiller d'abord, encoder ensuite. Jamais l'inverse.** Pour chaque
article : ouvrir le texte sur Légifrance, relever le verbatim, écrire l'entrée
de corpus avec sa `versionEnVigueur` et son `luLe`. **Ensuite** seulement,
écrire l'obligation qui s'y appuie.

**C2 s'arrête au dépouillement.** N'encode aucune obligation sur `R. 4624-*`.
Voir « La décision en attente », plus bas.

---

## Comment on dépouille, dans ce dépôt

`src/lib/referentiels/corpus/` porte un fichier par texte. Prends
`code-travail-electricite.ts` comme modèle — c'est le plus proche de ce que tu
vas écrire. Un article y ressemble à ça :

```ts
{
  ref: "R. 4544-11-1",
  intitule: "Attestation d'absence de contre-indications médicales",
  versionEnVigueur: "2025-10-01",
  luLe: "2026-08-27",
  lecture: "premiere_main",
  citationCle: "L'attestation mentionnée aux articles R. 4544-10 et R. 4544-11, d'une validité de cinq ans, est délivrée par le médecin du travail…",
  statut: "retenu",
  obligations: ["elec-salarie-attestation-medicale-voisinage"],
}
```

`statut: "non_couvert"` existe pour un article lu et **volontairement** non
encodé — il demande alors un `declareA`, qui dit **où** le manque est annoncé
à l'exploitant. Écris `docs/couverture-declaree-du-produit.md` si c'est là que
ça se dit, et ajoute-l'y. Un cliquet compte les articles « muets » ; il est à
27 et **ne peut que descendre**.

### Ce qu'on ne fait pas

- **On n'invente aucune périodicité.** Si le texte n'écrit pas de durée, la
  périodicité est `"autre"` et l'obligation est un état à maintenir, pas une
  échéance. Ce dépôt a déjà retiré un « triennal » qui venait d'une norme
  NF et non du droit : *une échéance inventée dans un outil de conformité est
  pire qu'une échéance absente, elle se présente à un contrôle.*
- **Aucune norme privée comme source** — NF, APSAD. Légifrance et l'INRS,
  rien d'autre.
- **On ne dérive jamais qui détient quel titre.** Rien ne dit quel salarié
  conduit un chariot : ce serait le cinquième déclencheur, non implémenté.
  L'employeur déclare, le référentiel fournit le catalogue (ADR-023).

---

## Ce que chaque chantier demande en propre

### C1 — formation à la sécurité (`L. 4141-1` et s., `R. 4141-*`)

L'obligation la plus universelle du code du travail, et elle n'est **pas**
qu'une ligne. Le texte distingue plusieurs cas — embauche, changement de
poste, reprise après arrêt, travailleurs temporaires — et une formation
« renouvelée périodiquement » sans que la périodicité soit toujours chiffrée.

Lis avant de décider du découpage. Si le texte porte plusieurs obligations
distinctes, écris-en plusieurs : c'est le défaut que l'ADR-022 a corrigé
ailleurs, ne le refais pas ici.

Attention au **porteur**. Une formation dispensée est-elle portée par le
salarié (un titre qu'il détient) ou par l'établissement (une obligation
d'organiser) ? Les deux existent peut-être, et alors ce sont deux
obligations. Argumente ton choix en `notesInternes`.

### C2 — suivi médical (`R. 4624-*`) — **dépouillement seul**

Dépouille : `R. 4624-10` et s. (visite d'information et de prévention),
`R. 4624-22` et s. (suivi individuel renforcé). Relève les périodicités
réelles, les postes concernés, ce qui déclenche un SIR.

**N'encode rien.** Écris les entrées de corpus avec `statut: "non_couvert"` et
un `declareA` qui pointe la décision en attente. Ton rapport dira ce que le
texte impose ; l'arbitrage suivra.

### C3 — secours (`R. 4224-14` à `-16`) — **deux porteurs, deux obligations**

`R. 4224-14` porte le **matériel** de premiers secours → porteur
`etablissement`.
`R. 4224-15` porte le **personnel formé** (SST) → porteur `salarie`.

**Écris-en deux, jamais une.** Les fondre reproduirait exactement le défaut que
l'ADR-022 a corrigé. Un fichier de corpus existe déjà pour ce texte : complète-le
plutôt que d'en créer un second.

### C4 — conduite et CACES (`R. 4323-55` et s.)

Le texte impose une formation à la conduite et, pour certains équipements, une
**autorisation de conduite** délivrée par l'employeur. Le CACES n'est pas dans
le code du travail — c'est un dispositif conventionnel. **Ne l'encode pas comme
une obligation réglementaire** ; s'il apparaît, qualifie-le pour ce qu'il est.

Vérifie si l'autorisation de conduite porte une échéance dans le texte. Si elle
n'en porte pas, c'est un état à maintenir.

---

## La décision en attente, et ce que tu en fais

Encoder la VIP et le SIR ferait suivre à l'outil des **échéances de visite
médicale par salarié**. La doctrine existe et elle est stricte
(`docs/rgpd.md` § 2.3) : existence, date, échéance — jamais le contenu, jamais
la pièce, plus strict que le texte lui-même.

Mais l'étendre de l'attestation d'habilitation électrique à **l'ensemble du
suivi médical de tous les salariés** change la nature de ce que le produit
détient. Ce n'est pas un choix technique.

**La propriétaire tranche. Toi, tu dépouilles et tu documentes.** Ton rapport
doit lui donner de quoi décider : ce que le texte impose, à qui, à quel rythme,
et ce que l'outil détiendrait exactement s'il l'encodait.

---

## Vérification

`pnpm vitest run`, `npx tsc --noEmit`, `npx eslint src`. Attendu au départ :
**1745 tests verts**, `tsc` propre, **un seul** avertissement eslint
préexistant (`normaliserFormData`).

Chaque obligation ajoutée fait tomber deux tests de `conformite.test.ts` — le
compte (`.toBe(85)`) et `EMPREINTE_ATTENDUE`. **C'est voulu** : ces tests
existent pour qu'on ne modifie pas le référentiel sans le dire. Mets-les à
jour, et mets à jour aussi `.claude/CLAUDE.md`, qui annonce le compte, et la
page publique — un test (`chiffres-publics.test.ts`) t'y forcera, il a été
écrit aujourd'hui parce que ce chiffre était faux depuis des semaines.

---

## Les règles du dépôt

- **Ouvre le texte avant de le qualifier.** Toutes les erreurs coûteuses de ce
  chantier sont venues d'une conclusion tirée d'un `grep`, d'un résumé ou d'un
  message de commit. Un relecteur a rétracté une affirmation exacte en se fiant
  à un résumé ; la rétractation était fausse.
- **Recoupe chaque référence sur Légifrance**, et trace la lecture dans
  `notesInternes` et `luLe`. Une URL qui résout n'est pas une URL juste : sur
  127 liens vérifiés récemment, 6 servaient un autre article que celui annoncé.
- **N'invente jamais une vérification.** Un extrait fabriqué a été livré à
  l'écran entre guillemets sur ce dépôt. Si tu n'as pas lu le texte, dis-le.
- **Un test qui accompagne une correction s'éprouve en réinjectant le défaut.**
  Sinon la garantie est une décoration.
- **pnpm, jamais npm.** Et si tu crées un worktree, installe-lui son propre
  `node_modules` : le client Prisma s'écrit dans le `node_modules` partagé et
  contamine les voisins.
- **Ne pousse jamais sur `main`** — un push sur `main` déploie en production.
  Travaille sur une branche.

## Ce que tu rends

Une branche, et un rapport dans `docs/revues/rapport-lot7-depouillement.md` :

- par chantier : les articles dépouillés, leur verbatim, ce qui est encodé et
  ce qui ne l'est pas ;
- **les choix de découpage et de porteur, avec leur raison** — c'est là que se
  joue la qualité de ce lot ;
- pour C2 : ce que le texte impose, et ce que l'outil détiendrait s'il
  l'encodait, à l'usage de la propriétaire ;
- ce que tu n'as pas pu établir, et pourquoi.

Une question ? Elle vient à la session qui t'a délégué ce lot, pas à la
propriétaire.
