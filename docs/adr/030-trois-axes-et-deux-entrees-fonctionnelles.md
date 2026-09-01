# ADR-030 — Trois axes thématiques, deux entrées fonctionnelles

- **Statut** : acceptée, 2026-09-01 (réunion d'équipe)
- **Portée** : `src/components/layout/sidebar-nav.ts`, `AppSidebar.tsx`,
  `BarreCompte.tsx`, les pages d'entrée de chaque axe
- **Remplace** l'ADR-015 (et, avec elle, l'amendement de l'ADR-017 sur l'entrée
  « Opérations ») · **Découle de** l'ADR-025

## Le problème

L'ADR-015 a posé un rail dont chaque entrée est « une page d'entrée **et** un
panneau », et dont les libellés sont les questions du dirigeant : À faire,
Opérations, Mon établissement, Mes registres, Paramètres. Elle a été révisée
trois fois, chaque fois pour retirer une entrée qui ne désignait pas une page.

Le cadrage du 2026-09-01 organise le produit en trois axes transversaux :
**santé-sécurité**, **équipement et bâtiment**, **documentation**. Ce ne sont
pas les cinq entrées regroupées : c'est une autre découpe, et elle contredit la
précédente.

L'ADR-025 laissait une question ouverte : les trois axes sont-ils une navigation
ou une grille de lecture ? La réponse retenue est **une navigation**. Une grille
de lecture posée par-dessus une navigation qui la contredit ne serait lue par
personne.

## La décision

**Le rail porte cinq entrées : les trois axes, plus « À faire » et
« Paramètres ».**

| Entrée | Nature | Ce qu'elle recueille |
|---|---|---|
| À faire | fonctionnelle | calendrier (page d'entrée), plan d'actions, ce qui doit être en place, préparer un contrôle |
| Santé-sécurité | thématique | DUERP, équipe et titres, prescriptions, éléments exclus du périmètre |
| Équipement et bâtiment | thématique | équipements, zones, vérifications, registre de sécurité, accessibilité, carnet sanitaire |
| Documentation | thématique | documents obligatoires, exports et dossier de contrôle, guide |
| Paramètres | fonctionnelle | fiche établissement, questions de paramétrage, connexion d'un assistant |

**L'écart à la lettre de la directive est assumé et il est motivé.** Les trois
axes sont thématiques — ils répondent à « de quoi s'agit-il ». « À faire » et
« Paramètres » sont fonctionnelles — elles répondent à « qu'est-ce que je fais
maintenant » et « où je règle ». Le calendrier est l'écran le plus consulté du
produit ; le ranger sous « santé-sécurité » le mettrait à deux clics de son
usage quotidien pour gagner une symétrie que personne ne regarde.

**Ce que l'ADR-015 avait raison de poser est conservé** : une entrée de rail
désigne une page réelle, jamais une approximation ; cliquer navigue *et* ouvre le
panneau ; les pastilles de retard suivent l'entrée qui les concerne.

## Le point qui sera difficile, et qu'il faut regarder en face

Un dirigeant qui cherche son registre de sécurité le cherche-t-il sous
« documentation » ou sous « équipement et bâtiment » ? Les deux réponses sont
défendables. Le registre est rangé sous **équipement et bâtiment**, parce que
son contenu est celui du parc — vérifications, rapports, travaux — et que
« documentation » recueille ce qui parle du dossier, pas ce qui parle du lieu.

Ce choix est le plus fragile de l'ADR. S'il se révèle faux à l'usage, il se
corrige en déplaçant une entrée, pas en rouvrant la découpe.
