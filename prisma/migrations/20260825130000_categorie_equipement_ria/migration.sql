-- ============================================================================
-- Catégorie d'équipement RIA (robinets d'incendie armés) — 2026-08-25
--
-- Jusqu'ici l'obligation de vérification annuelle des RIA en ERP (arrêté du
-- 25 juin 1980, art. MS 73 § 2) était rattachée à la catégorie EXTINCTEUR et
-- bornée par une propriété opt-out `aRobinetsIncendieArmes`. Les RIA sont des
-- installations fixes (MS 14 à MS 17), distinctes des appareils mobiles :
-- ils ont désormais leur catégorie.
--
-- Ce fichier ne contient QUE l'ajout de la valeur d'enum : PostgreSQL refuse
-- d'utiliser une valeur ajoutée par ALTER TYPE ... ADD VALUE dans la même
-- transaction (« unsafe use of new value »), et `prisma migrate deploy`
-- exécute chaque migration dans une transaction. Aucune reprise de données
-- ici — voir scripts/reprise-ria.ts.
-- ============================================================================

ALTER TYPE "CategorieEquipement" ADD VALUE IF NOT EXISTS 'RIA';
