-- ============================================================================
-- Champ d'application de R. 4227-34 du Code du travail (2026-08-25)
--
-- « Les établissements dans lesquels peuvent se trouver occupées ou réunies
-- habituellement plus de cinquante personnes, ainsi que ceux, quelle que soit
-- leur importance, où sont manipulées et mises en œuvre des matières
-- inflammables mentionnées à l'article R. 4227-22 sont équipés d'un système
-- d'alarme sonore. » — https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532067
--
-- Ce champ commande, par renvoi, la consigne de sécurité incendie (R. 4227-37)
-- et les exercices semestriels (R. 4227-39). Le moteur ne disposait que de
-- `effectifSurSite` (salariés) : il ne pouvait ni compter le public, ni voir
-- la branche « matières inflammables ». Deux colonnes nullables, sans
-- backfill : `NULL` = non renseigné, le moteur retombe alors sur l'effectif
-- salarié (sous-estimation assumée) et sur « non » pour les matières.
-- ============================================================================

ALTER TABLE "Etablissement"
    ADD COLUMN "personnesPresentesHabituellement" INTEGER,
    ADD COLUMN "manipuleMatieresR422722" BOOLEAN;
