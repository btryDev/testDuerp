# RGPD et politique de rétention

Ce document décrit la façon dont la plateforme gère les données personnelles
et les obligations de conservation légale. Il est amené à évoluer avec la
remise en place de l'authentification (post-MVP) et l'ouverture au public.

## Données collectées

### Données d'entreprise et d'établissement
- Raison sociale, SIRET, code NAF, adresse, effectif.
- Typologie réglementaire (ERP, IGH, habitation), précisions (catégorie
  ERP, classe IGH).

Ces données sont **des données d'entreprise**, pas des données
personnelles au sens RGPD — l'outil ne stocke pas d'identifiant
personnel de dirigeant, de CSE ou de salarié.

### Rapports de vérification
- Métadonnées : date du rapport, organisme vérificateur, résultat,
  commentaires libres.
- Fichier binaire (PDF, PNG, JPEG, DOCX) stocké via l'abstraction
  `FileStorage`.

Les rapports **peuvent contenir des données personnelles** (nom du
technicien, signature scannée, numéro d'habilitation). L'utilisateur est
informé qu'il doit s'assurer de la base légale avant de déposer un
document contenant des données d'autrui.

### Risques et mesures du DUERP
- Les risques décrivent des **postes** et **unités de travail**, pas des
  personnes (principe INRS ED 840). Le champ `nombreSalariesExposes` est
  un agrégat, pas une liste.
- Les libellés de mesures peuvent citer un responsable par son nom de
  fonction (DAF, RH…). À charge de l'utilisateur de ne pas y mettre de
  patronyme nominatif.

### Auth (reportée post-MVP)
Aucune donnée utilisateur n'est collectée tant que l'auth n'est pas
remise en place. Lors de sa remise en place, l'email et le mot de passe
haché seront conservés pour la durée de l'abonnement + 1 an (durée de
prescription des actions en responsabilité).

## Hébergement

- Base de données : Supabase (hébergement UE).
- Stockage de fichiers : filesystem local en dev, à migrer vers Supabase
  Storage ou équivalent UE pour la production.

Aucun transfert hors UE n'est réalisé.

## Politique de rétention

| Type de donnée                     | Durée                             | Justification                                                                                  |
| ---------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------- |
| Entreprise / Établissement         | Durée de l'activité + 1 an        | Permet de restaurer un compte fermé par erreur, purge ensuite                                  |
| Versions de DUERP (DuerpVersion)   | **40 ans**                        | Art. R. 4121-4 du Code du travail (loi du 2 août 2021)                                         |
| Rapports de vérification           | Durée de vie de l'établissement   | L. 4711-5 CT — tenue du registre de sécurité pendant toute l'exploitation                      |
| Actions correctives                | Tant que la vérif liée existe     | Supprimées avec la vérification (onDelete: Cascade côté Prisma)                                |
| Fichiers physiques des rapports    | Idem rapports                     | Supprimés automatiquement quand la ligne RapportVerification est supprimée                     |

### Spécificité DUERP : 40 ans

Les versions figées du DUERP (`DuerpVersion.snapshot`) sont à conserver
**40 ans** (article R. 4121-4 du Code du travail, issu de la loi n° 2021-1018
du 2 août 2021). Cette obligation s'impose à tout employeur.

Concrètement, cela signifie :

- Un `DuerpVersion` ne peut **jamais** être supprimé tant que 40 ans ne
  se sont pas écoulés depuis sa création.
- Même en cas de demande d'effacement par le détenteur du compte, les
  versions de DUERP sont exclues du périmètre de l'effacement
  (exception légale RGPD — art. 17.3 RGPD : « respect d'une obligation
  légale »).
- Les risques et unités de travail sont également conservés puisqu'ils
  font partie du snapshot JSON des versions.

### Rapports de vérification

Les rapports ne sont pas soumis à un délai de 40 ans mais à la
conservation « pendant toute l'exploitation de l'établissement » au
titre de l'article L. 4711-5 CT. On reprend en pratique la règle
du DUERP (40 ans) pour les établissements **toujours actifs**. En cas
de fermeture documentée, la durée peut être ramenée à 5 ans après
cessation d'activité.

## Droits des personnes (à remettre en place avec l'auth)

À l'ouverture de l'outil au public, il faudra implémenter :

1. **Droit d'accès et de portabilité (art. 15-20 RGPD)** : export
   complet des données de l'utilisateur au format JSON depuis une page
   `/compte/export`. Génération asynchrone + envoi par email.
2. **Droit de rectification (art. 16 RGPD)** : couvert par les
   formulaires d'édition de chaque entité.
3. **Droit à l'effacement (art. 17 RGPD)** : suppression du compte et
   des données non soumises à obligation légale. Les DuerpVersion
   restent, conformément à l'exception.
4. **Droit d'opposition / limitation (art. 18-21 RGPD)** : contact via
   un email dédié, traitement manuel en V2.

## Sous-traitants

- **Supabase** (Frankfurt, DE) — hébergement DB et stockage.
- **Vercel** (si utilisé pour l'hébergement Next.js) — région UE à
  forcer dans les paramètres du projet.

Aucun autre sous-traitant. Pas de LLM, pas d'analytics tiers, pas de
CDN US.

## Sécurité

- Communications HTTPS uniquement en prod.
- Mots de passe hachés (bcrypt/argon2) côté auth — remis en place post-MVP.
- Stockage de fichiers : validation stricte MIME et taille max 20 Mo
  côté serveur ; pas de ZIP/TAR acceptés pour éviter le contournement
  du typage MIME.
- Path traversal : la classe `LocalFileStorage` refuse toute clé
  contenant `..` ou partant d'une racine absolue (tests unitaires à
  l'appui).

## Logs et télémétrie

Aucune télémétrie applicative en V2. Les logs Next.js standards (requêtes
HTTP, erreurs serveur) sont conservés 30 jours côté hébergeur.

## Contact

Un email `contact@btry.fr` est référencé comme point d'entrée pour toute
demande liée à la protection des données. Un DPO dédié sera nommé au
moment de l'ouverture commerciale.
