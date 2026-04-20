-- AlterTable: ajout de la référence au référentiel sectoriel sur les unités
ALTER TABLE "UniteTravail" ADD COLUMN "referentielUniteId" TEXT;

-- AlterTable: referentielId devient nullable pour les risques custom, ajout du flag cotationSaisie
ALTER TABLE "Risque" ALTER COLUMN "referentielId" DROP NOT NULL;
ALTER TABLE "Risque" ADD COLUMN "cotationSaisie" BOOLEAN NOT NULL DEFAULT false;

-- Unique : un même risque référentiel n'apparaît qu'une fois par unité
CREATE UNIQUE INDEX "Risque_uniteId_referentielId_key" ON "Risque"("uniteId", "referentielId");
