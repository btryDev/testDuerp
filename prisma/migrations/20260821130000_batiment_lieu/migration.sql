-- ============================================================================
-- Le bâtiment est un lieu, le classement reste à l'établissement (ADR-019)
--
-- Cinq champs de texte libre (`Equipement.localisation`,
-- `PointReleve.localisation`, `PermisFeu.lieu`, `PlanPrevention.lieux`)
-- disaient « où » sans qu'on puisse ni filtrer ni regrouper. `Batiment` donne
-- un lieu nommé ; les colonnes texte restent la précision à l'intérieur.
--
-- `Batiment` ne porte AUCUN régime : ERP/IGH et la catégorie restent sur
-- `Etablissement`. Le classement ERP s'attache à un ensemble de bâtiments non
-- isolés, pas à chaque corps — le poser ici serait faux (cf. ADR-019, section
-- « ensemble classé »).
--
-- Invariant : tout établissement a au moins un bâtiment, et tout équipement est
-- dans un bâtiment. On backfille donc AVANT de poser le NOT NULL :
--   1. un « Bâtiment principal » (ordre 0) par établissement existant ;
--   2. chaque équipement y est rattaché ;
--   3. la colonne devient NOT NULL.
-- La clé étrangère des équipements est RESTRICT, jamais CASCADE : supprimer un
-- bâtiment ne doit pas emporter un équipement et, derrière lui, ses
-- vérifications et ses rapports (ADR-012). On déplace d'abord.
-- ============================================================================

-- 1. La table
CREATE TABLE "Batiment" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "complementAdresse" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batiment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Batiment_etablissementId_ordre_idx" ON "Batiment"("etablissementId", "ordre");
CREATE UNIQUE INDEX "Batiment_etablissementId_nom_key" ON "Batiment"("etablissementId", "nom");

ALTER TABLE "Batiment" ADD CONSTRAINT "Batiment_etablissementId_fkey"
    FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Un bâtiment principal par établissement existant.
-- L'id est un uuid textuel et non un cuid : Prisma génère les cuid côté client,
-- le SQL n'y a pas accès. Les deux formats cohabitent sans conséquence — la
-- colonne est un TEXT opaque.
INSERT INTO "Batiment" ("id", "etablissementId", "nom", "ordre", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, e."id", 'Bâtiment principal', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Etablissement" e;

-- 3. Les équipements rejoignent le bâtiment principal de leur établissement,
--    puis la colonne devient obligatoire.
ALTER TABLE "Equipement" ADD COLUMN "batimentId" TEXT;

UPDATE "Equipement" eq
SET "batimentId" = b."id"
FROM "Batiment" b
WHERE b."etablissementId" = eq."etablissementId" AND b."ordre" = 0;

ALTER TABLE "Equipement" ALTER COLUMN "batimentId" SET NOT NULL;

CREATE INDEX "Equipement_batimentId_idx" ON "Equipement"("batimentId");

ALTER TABLE "Equipement" ADD CONSTRAINT "Equipement_batimentId_fkey"
    FOREIGN KEY ("batimentId") REFERENCES "Batiment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. Rattachements optionnels : le texte libre reste la précision, le bâtiment
--    n'est posé que si l'utilisateur le dit. Pas de backfill — deviner un
--    bâtiment depuis « sous-sol » serait une inférence, pas une donnée.
ALTER TABLE "PointReleve" ADD COLUMN "batimentId" TEXT;
ALTER TABLE "PointReleve" ADD CONSTRAINT "PointReleve_batimentId_fkey"
    FOREIGN KEY ("batimentId") REFERENCES "Batiment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PermisFeu" ADD COLUMN "batimentId" TEXT;
ALTER TABLE "PermisFeu" ADD CONSTRAINT "PermisFeu_batimentId_fkey"
    FOREIGN KEY ("batimentId") REFERENCES "Batiment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PlanPrevention" ADD COLUMN "batimentId" TEXT;
ALTER TABLE "PlanPrevention" ADD CONSTRAINT "PlanPrevention_batimentId_fkey"
    FOREIGN KEY ("batimentId") REFERENCES "Batiment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
