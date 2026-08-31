# Brief de revue — PR #10, l'assemblage des six lots

Tu es une session de revue externe. Ce document est ton périmètre complet.
Tu travailles **en lecture seule** : tu ne corriges rien, tu ne commites rien,
tu ne pousses rien. Tu rends un rapport.

## Ce qu'il faut relire

La branche `integration/2026-08-28` face à `main` (`00919c4`) :

```
git -C /Users/palomasanchezc/Documents/duerp_outils/testDuerp diff main...integration/2026-08-28
```

119 fichiers, +7305 / −520, 53 commits. Six lots développés **en parallèle**,
dans six worktrees frères, puis fusionnés.

## L'angle mort que tu es là pour couvrir

**Chaque lot a déjà été relu deux ou trois fois, isolément.** Ces revues ont
sorti dix-huit défauts, dont plusieurs introduits par la correction du tour
précédent. Ne les refais pas.

Ce que personne n'a regardé, c'est **la combinaison**. Six branches parties du
même commit, qui ne se sont jamais vues avant le merge. Git a annoncé zéro
conflit — ce qui veut dire zéro conflit *textuel*, pas zéro incohérence.

Neuf fichiers ont été touchés par plus d'un lot :

| Fichier | lots |
|---|---|
| `src/lib/dashboard/queries.ts` | **3** |
| `src/lib/dashboard/brief.ts` | 2 |
| `src/lib/referentiels/conformite/electricite.ts` | 2 |
| `src/lib/referentiels/conformite/portes-portails.ts` | 2 |
| `src/app/etablissements/[id]/calendrier/page.tsx` | 2 |
| `src/app/etablissements/[id]/carnet-sanitaire/page.tsx` | 2 |
| `prisma/schema.prisma` | 2 |
| `docs/rgpd.md` | 2 |
| `docs/adr/023-porteur-salarie.md` | 2 |

**C'est là que tu commences.** Pour chacun : les deux modifications
tiennent-elles ensemble, ou est-ce que la seconde a rendu la première
inopérante sans que rien ne le signale ?

Un précédent qui dit ce que tu cherches : deux modules projetaient les mêmes
données avec des champs différents ; le guide annonçait **1** obligation
incendie là où le calendrier en générait **3**. Aucun test ne tombait. Le
défaut n'est apparu qu'en rendant deux champs de type obligatoires — ce qui a
alors révélé **un cinquième** site de projection, non couvert par le moindre
test. Cherche la même forme ailleurs.

## Les six lots, pour situer

1. **Tenancy et vérité des documents** — prédicat d'appartenance porté dans les
   `where` de `salaries/queries.ts` puis balayage des ~15 `queries.ts` ;
   documents qui affirmaient ce que le code ne faisait pas.
2. **Le mécanisme de conséquence** (ADR-024) — champ `transmet` requis sur les
   85 obligations ; deux règles de recommandation fondées sur une incohérence
   entre modules, non sur une date.
3. **Ce que le produit affirme à l'écran** — badges réglementaires sans source,
   un référentiel privé (APSAD) présenté comme du droit, deux champs de texte
   libre qui sortent dans l'export ZIP.
4. **La famille « personnel » du calendrier** — nouveau `TypeEcheance`, filtre,
   et scission de `retards.ts`.
5. **Couverture et ouverture** — ce que le produit déclare ne pas couvrir.
6. **URLs Légifrance et veille** — 127 URLs ouvertes une par une, 17 fausses.

## Ce que tu cherches, par ordre de gravité

1. **Une garantie qu'un autre lot a rendue muette.** Le dépôt tient plusieurs
   invariants par des tests qui lisent le texte de `src/` et échouent sur une
   forme interdite, et par des cliquets numériques (`PLAFOND`, `MUETS`) qui ne
   peuvent que descendre. Un lot a-t-il déplacé du code hors de la portée du
   balayage d'un autre ? Un cliquet a-t-il été relâché plutôt qu'abaissé ?
2. **Deux modules qui projettent la même chose différemment.** Cf. le
   précédent ci-dessus.
3. **Une affirmation de document qui n'est plus vraie après le merge.** Les
   ADR ont été modifiés par plusieurs lots.
4. **Un test vert pour la mauvaise raison.** Si un test accompagne une
   correction, il doit tomber quand on réinjecte le défaut qu'il prétend
   interdire. Vérifie-le en le cassant réellement, pas en le lisant.

## Les règles du dépôt, non négociables

- **Ouvre le fichier avant de qualifier ce qu'il contient.** Toutes les erreurs
  coûteuses de ce chantier sont venues d'une conclusion tirée d'un `grep` ou
  d'un message de commit.
- **Pas de faux positif, pas de sur-ingénierie.** Un signalement sans scénario
  de défaillance concret — quelles données en entrée, quel résultat faux en
  sortie — n'est pas un signalement. Aucune proposition de refactoring.
- **Une référence réglementaire se recoupe sur Légifrance avant d'être
  contestée.** Un relecteur a rétracté une affirmation exacte de ce chantier
  en se fiant à un résumé ; la rétractation était fausse. Ouvre le texte.
- **N'invente jamais une vérification.** Si tu n'as pas pu contrôler quelque
  chose, dis-le. Un relecteur de ce chantier a écrit comme sourcée une
  vérification qu'il n'avait pas faite.
- **Pas de rustine.** Desserrer une limite ne corrige rien.

## Environnement

- Le dépôt utilise **pnpm**, jamais npm.
- `pnpm vitest run`, `npx tsc --noEmit`, `npx eslint src`. Attendu : **1730
  tests verts**, `tsc` propre, **un seul** avertissement eslint préexistant
  (`normaliserFormData`).
- **Si tu crées un worktree, installe-lui son propre `node_modules`.** Le
  client Prisma est écrit dans le `node_modules` partagé et contamine les
  worktrees frères — une session a conclu que `tsc` était rouge sur `main`
  à cause de ça.
- Ne lance **jamais** `prisma migrate diff --shadow-database-url "$DIRECT_URL"`.
  Cette commande a effacé la base de production le 2026-08-27.
- Ne pousse rien. Un push sur `main` déploie en production.

## Ce que tu rends

Un rapport, dans ce fichier ou en réponse :

- Les défauts, du plus grave au plus léger, chacun avec **fichier:ligne**, le
  scénario de défaillance concret, et comment tu l'as vérifié.
- Ce que tu as regardé sans rien trouver — c'est une information, pas du
  remplissage.
- Ce que tu n'as pas pu vérifier, et pourquoi.

Si tu ne trouves rien sur les neuf fichiers croisés, dis-le franchement et
passe au reste du diff. Un rapport vide et honnête vaut mieux qu'un rapport
rempli.
