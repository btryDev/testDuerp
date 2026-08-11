-- ============================================================================
-- Resynchronisation du calendrier sur le référentiel de conformité (ADR-003)
--
-- Le référentiel d'obligations vit en TypeScript versionné, mais ses effets
-- sont écrits en base : chaque `Verification` fige un libellé, une périodicité
-- et une liste de réalisateurs au moment de sa génération.
--
-- Sans repère de version, une correction du référentiel ne se propageait qu'au
-- hasard d'une mutation d'équipement ou d'un dépôt de rapport. Deux
-- établissements identiques pouvaient afficher deux échéances différentes selon
-- la date de leur dernière modification, et une obligation retirée du
-- référentiel laissait des lignes orphelines : `obligationParId` renvoyait
-- `undefined`, le domaine devenait `null`, et l'occurrence disparaissait
-- silencieusement des filtres du registre et du dossier de contrôle.
--
-- La colonne mémorise la version ayant servi à la dernière réconciliation.
-- `NULL` signifie « jamais réconcilié depuis l'introduction du mécanisme » :
-- l'établissement sera réaligné au prochain affichage de son calendrier.
-- On ne backfille donc PAS de valeur : laisser `NULL` est précisément ce qui
-- déclenche le rattrapage.
-- ============================================================================

ALTER TABLE "Etablissement"
    ADD COLUMN "referentielVersionCalendrier" TEXT;
