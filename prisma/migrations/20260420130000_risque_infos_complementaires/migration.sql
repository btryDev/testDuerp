-- Informations complémentaires par risque, recommandées par INRS ED 840
-- et par la réglementation sur les mesures physiques / CMR.

ALTER TABLE "Risque" ADD COLUMN "nombreSalariesExposes" INTEGER;
ALTER TABLE "Risque" ADD COLUMN "dateMesuresPhysiques" TIMESTAMP(3);
ALTER TABLE "Risque" ADD COLUMN "exposeCMR" BOOLEAN NOT NULL DEFAULT false;
