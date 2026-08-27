-- ADR-022 — Une échéance peut être portée par l'établissement, pas seulement
-- par un équipement déclaré.
--
-- Deux articles en vigueur l'imposent, et ce sont les plus universels du
-- corpus : PE 4 § 2 (arrêté du 25 juin 1980, version du 01/07/2026), dû via
-- PE 2 § 3 par les établissements de 5e catégorie recevant au plus 19
-- personnes — c'est-à-dire par ceux qui ont le moins déclaré — et R. 4222-20
-- du Code du travail, qui vise tout employeur. Les accrocher à un équipement
-- arbitraire les faisait disparaître en silence chez qui ne l'avait pas
-- déclaré.
--
-- Migration ADDITIVE. Aucune ligne existante n'est modifiée : toutes portent
-- un equipementId, et la colonne ne fait que cesser d'être obligatoire.

-- 1. La colonne devient facultative.
ALTER TABLE "Verification" ALTER COLUMN "equipementId" DROP NOT NULL;

-- 2. La clé d'idempotence, reposée.
--
-- POURQUOI À LA MAIN. Prisma ne sait pas exprimer `NULLS NOT DISTINCT`, et
-- sans cette clause l'unicité cesserait de s'appliquer aux lignes portées par
-- l'établissement : en PostgreSQL, deux NULL ne se conflictent pas, et le
-- même couple (établissement, obligation) pourrait être inséré autant de fois
-- qu'on régénère le calendrier. Le `@@unique` de schema.prisma a donc cédé la
-- place à un `@@index`, et l'unicité vit ici.
--
-- Requiert PostgreSQL >= 15. La production est en 17.6.
DROP INDEX IF EXISTS "Verification_etablissementId_obligationId_equipementId_key";

CREATE UNIQUE INDEX "Verification_etablissementId_obligationId_equipementId_key"
  ON "Verification" ("etablissementId", "obligationId", "equipementId")
  NULLS NOT DISTINCT;

-- 3. L'index non unique déclaré par le schéma.
--
-- Il porte le même triplet que la contrainte ci-dessus, qui suffirait à
-- servir les lectures. Il est créé quand même pour que `prisma migrate diff`
-- ne voie pas d'écart entre le schéma et la base : un écart permanent finit
-- par être ignoré, et c'est ainsi qu'on rate le vrai.
CREATE INDEX IF NOT EXISTS "Verification_etablissementId_obligationId_equipementId_idx"
  ON "Verification" ("etablissementId", "obligationId", "equipementId");
