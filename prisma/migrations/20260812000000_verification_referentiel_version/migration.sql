-- ============================================================================
-- Rattrapage : Verification.referentielVersion
--
-- La colonne a été déclarée dans `schema.prisma` par le commit 42b723f
-- (« intégrité, conservation légale et repère de version du référentiel »),
-- mais aucune des deux migrations livrées par ce commit ne l'a créée :
-- 20260810120000 traite l'intégrité et la conservation, 20260811090000 ajoute
-- `Etablissement.referentielVersionCalendrier`. L'ALTER sur `Verification` a
-- été omis.
--
-- Conséquence en production : `prisma migrate status` répond « up to date »
-- (les migrations sont bien toutes appliquées), mais tout `findMany` sans
-- `select` explicite sur `Verification` demande la colonne au client généré et
-- échoue en P2022. Le tableau de bord d'un établissement rendait un 500.
--
-- Colonne nullable, sans backfill : `null` signifie « ligne écrite avant
-- l'introduction du suivi de version », donc à resynchroniser — c'est la
-- sémantique décrite dans le schéma, et laisser `NULL` est précisément ce qui
-- déclenchera le rattrapage.
-- ============================================================================

ALTER TABLE "Verification"
    ADD COLUMN "referentielVersion" TEXT;

-- ============================================================================
-- Dérive résiduelle : defaults en base que le schéma ne déclare plus
--
-- Trois colonnes de type liste portent encore un DEFAULT posé par une migration
-- antérieure, alors que `schema.prisma` ne l'exprime plus. La divergence est
-- inoffensive au runtime — Prisma envoie toujours une valeur explicite pour un
-- champ liste, le default n'est donc jamais consulté — mais elle faisait
-- remonter une dérive permanente à chaque `prisma migrate diff`, ce qui masque
-- les écarts réels comme celui corrigé ci-dessus.
--
-- Aucune donnée existante n'est modifiée : retirer un DEFAULT ne réécrit pas
-- les lignes déjà en base.
-- ============================================================================

ALTER TABLE "PermisFeu" ALTER COLUMN "naturesTravaux" DROP DEFAULT;
ALTER TABLE "Prestataire" ALTER COLUMN "domaines" DROP DEFAULT;
ALTER TABLE "RegistreAccessibilite" ALTER COLUMN "handicapsAccueillis" DROP DEFAULT;
