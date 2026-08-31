# Réglage temporaire — « Confirm email » désactivé

> **Un réglage du produit en ligne est actuellement hors de son état normal.**
> Ce document existe pour qu'il soit remis, et il n'a pas d'autre raison d'être.
> Il se supprime le jour où le réglage est rétabli.

## L'état

| | |
|---|---|
| **Quoi** | Supabase → Authentication → Sign In / Providers → Email → **Confirm email** |
| **État normal** | **activé** |
| **État actuel** | **désactivé** |
| **Depuis le** | 2026-08-31 |
| **Décidé par** | la propriétaire |
| **À rétablir** | dès la fin du contrôle visuel de la PR #10 |

## Pourquoi

Le contrôle visuel de la PR #10 (`controle-visuel-pr10.md`) est exécuté depuis
une autre machine. Les onze écrans à vérifier sont **tous derrière
l'authentification** — `src/lib/supabase/middleware.ts` ne laisse passer sans
compte que `/login`, `/signup`, `/auth`, les routes d'accès par jeton et la page
accessibilité. Sans compte, aucun point n'est atteignable.

La session ne peut pas confirmer une adresse dont elle n'a pas la boîte. Trois
autres voies existaient : un compte jetable créé ici avec ses identifiants
transmis, un sous-adressage `contact+…@btry.fr` confirmé d'un clic, ou déléguer
le contrôle. La désactivation a été retenue.

## Ce que ça ouvre pendant la fenêtre

`main` est déployé sur Vercel : **ce projet Supabase sert le produit en ligne**,
pas seulement le développement. Tant que le réglage est désactivé, **toute
inscription est active sans confirmation d'adresse** — pour tout le monde, pas
seulement pour la session de contrôle. C'est la raison pour laquelle cette
fenêtre doit être courte et pour laquelle ce document existe.

## Remettre à la normale

1. Supabase → Authentication → Sign In / Providers → Email → **réactiver
   « Confirm email »**.
2. Vérifier qu'une inscription neuve redemande bien la confirmation.
3. Passer en revue les comptes créés pendant la fenêtre et supprimer ceux qui
   ne sont pas le compte de contrôle.
4. **Supprimer ce fichier.** Tant qu'il est là, le réglage est réputé anormal.
