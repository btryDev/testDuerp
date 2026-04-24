-- Carnet sanitaire eau — arrêté du 1er février 2010, art. R1321-23 CSP.
--
-- Obligation d'un carnet pour établissements avec ECS (eau chaude sanitaire) :
--   - points de puisage configurés
--   - relevés de température hebdo (seuil ECS ≥ 50°C au puisage)
--   - analyses de légionelles annuelles (seuil d'action 1000 UFC/L)

BEGIN;

CREATE TYPE "TypeReseauEau" AS ENUM ('ECS', 'EFS', 'ECS_BOUCLAGE');

CREATE TABLE "CarnetSanitaire" (
    "id"                TEXT NOT NULL,
    "etablissementId"   TEXT NOT NULL,
    "descriptionReseau" TEXT,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CarnetSanitaire_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CarnetSanitaire_etablissementId_key"
    ON "CarnetSanitaire"("etablissementId");

ALTER TABLE "CarnetSanitaire"
    ADD CONSTRAINT "CarnetSanitaire_etablissementId_fkey"
    FOREIGN KEY ("etablissementId")
    REFERENCES "Etablissement"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CarnetSanitaire" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "PointReleve" (
    "id"                TEXT NOT NULL,
    "carnetId"          TEXT NOT NULL,
    "nom"               TEXT NOT NULL,
    "localisation"      TEXT,
    "typeReseau"        "TypeReseauEau" NOT NULL,
    "seuilMinCelsius"   DOUBLE PRECISION NOT NULL DEFAULT 50,
    "actif"             BOOLEAN NOT NULL DEFAULT true,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PointReleve_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PointReleve_carnetId_idx" ON "PointReleve"("carnetId");

ALTER TABLE "PointReleve"
    ADD CONSTRAINT "PointReleve_carnetId_fkey"
    FOREIGN KEY ("carnetId")
    REFERENCES "CarnetSanitaire"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PointReleve" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "ReleveTemperature" (
    "id"                  TEXT NOT NULL,
    "pointReleveId"       TEXT NOT NULL,
    "dateReleve"          TIMESTAMP(3) NOT NULL,
    "temperatureCelsius"  DOUBLE PRECISION NOT NULL,
    "conforme"            BOOLEAN NOT NULL,
    "operateur"           TEXT,
    "commentaire"         TEXT,
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReleveTemperature_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ReleveTemperature_pointReleveId_dateReleve_idx"
    ON "ReleveTemperature"("pointReleveId", "dateReleve");

ALTER TABLE "ReleveTemperature"
    ADD CONSTRAINT "ReleveTemperature_pointReleveId_fkey"
    FOREIGN KEY ("pointReleveId")
    REFERENCES "PointReleve"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReleveTemperature" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "AnalyseLegionelle" (
    "id"            TEXT NOT NULL,
    "carnetId"      TEXT NOT NULL,
    "dateAnalyse"   TIMESTAMP(3) NOT NULL,
    "laboratoire"   TEXT,
    "valeurUfcParL" INTEGER,
    "conforme"      BOOLEAN NOT NULL,
    "rapportCle"    TEXT,
    "rapportNom"    TEXT,
    "commentaire"   TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyseLegionelle_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AnalyseLegionelle_carnetId_dateAnalyse_idx"
    ON "AnalyseLegionelle"("carnetId", "dateAnalyse");

ALTER TABLE "AnalyseLegionelle"
    ADD CONSTRAINT "AnalyseLegionelle_carnetId_fkey"
    FOREIGN KEY ("carnetId")
    REFERENCES "CarnetSanitaire"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AnalyseLegionelle" ENABLE ROW LEVEL SECURITY;

COMMIT;
