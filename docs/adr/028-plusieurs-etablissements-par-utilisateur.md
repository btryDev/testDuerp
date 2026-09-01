# ADR-028 — Un utilisateur tient plusieurs établissements

- **Statut** : acceptée, 2026-09-01 (réunion d'équipe)
- **Portée** : `prisma/schema.prisma` (`Etablissement.entrepriseId`),
  `src/lib/auth/scope.ts`, `src/lib/etablissements/`, `src/lib/mcp/`,
  `src/components/layout/BarreCompte.tsx`
- **Rend de nouveau effective** l'ADR-001 · **Amende** l'ADR-013 · **Découle
  de** l'ADR-025

## Le problème

L'ADR-001 posait, le 2026-04-21, que la V2 gère « plusieurs établissements par
entreprise », et prévoyait jusqu'au « menu de bascule entre établissements ».
Quatre mois plus tard, la base dit l'inverse : `Etablissement.entrepriseId` et
`Entreprise.userId` portent chacun une contrainte d'unicité, posées par la
migration `20260810120000_integrite_et_conservation`, et le commentaire du schéma
énonce l'invariant « 1 entreprise = 1 établissement ».

Ce verrou n'était pas une erreur : il a servi à ce qu'aucun écran ne suppose
silencieusement le multi-site pendant que le produit n'en avait pas. Il a même
été posé avec sa marche de sortie, écrite dans le schéma : « le jour où le
multi-site entrera au périmètre, il suffira de retirer le `@unique` — sans
réécrire le code appelant. »

Ce jour est le 2026-09-01. Un dirigeant qui tient deux commerces ne veut pas deux
comptes.

## La décision

**Un utilisateur possède une entreprise ; une entreprise porte autant
d'établissements qu'elle en a.**

- `Etablissement.entrepriseId @unique` **tombe**.
- `Entreprise.userId @unique` **reste**. Un compte reste une entreprise : la
  racine de tenancy de l'ADR-005 ne bouge pas, et c'est ce qui permet de ne
  toucher aucun des dix helpers de `auth/scope.ts` — ils bornent déjà par
  `entreprise.userId` en prenant toujours un identifiant explicite.

Trois conséquences, et elles suffisent.

**1. « L'établissement du compte » devient « l'établissement actif ».**
`getOptionalUserEtablissement()` faisait un `findFirst` trié par date de
création. Il lira désormais un cookie `etablissement-actif`, posé par le
sélecteur, avec repli sur le `findFirst` quand il est absent ou périmé. Pas de
table, pas de colonne : les URL portent déjà l'identifiant partout où il compte,
et ce repli n'a besoin d'être qu'un défaut raisonnable.

**2. Le MCP doit désambiguïser.** `chercherEtablissementDeUtilisateur` prenait le
premier élément d'une liste en s'appuyant explicitement sur l'invariant — c'est
le seul `[0]` du code de production, et il est documenté comme sûr par une phrase
qui devient fausse. L'outil accepte un identifiant d'établissement ; à défaut, il
répond en listant, il ne choisit pas. **C'est l'amendement à l'ADR-013.**

**3. Créer un second établissement redevient possible.** `creerEtablissement`
redirigeait vers l'existant ; il crée. Les gardes de périmètre de l'ADR-031 —
régimes refusés, borne d'effectif — s'appliquent là comme à l'onboarding : c'est
une création de dossier.

## Ce qui n'est pas décidé ici

Le partage d'un établissement entre plusieurs utilisateurs. Un compte reste une
entreprise, une entreprise reste à un utilisateur ; le multi-utilisateur est
toujours hors roadmap.

## Ce que ça coûte si on se trompe

Le risque est l'étanchéité : deux établissements du même compte qui se mêlent.
Il est faible — le scoping ne change pas — mais il ne se voit pas tout seul. Un
test d'isolation entre deux établissements d'une même entreprise accompagne la
migration, et la contrainte retirée doit disparaître de
`migrations-contraintes.test.ts`, qui la garde aujourd'hui.
