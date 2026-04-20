-- Drapeau de validation des questions transverses sur le DUERP
ALTER TABLE "Duerp" ADD COLUMN "transversesRepondues" BOOLEAN NOT NULL DEFAULT false;

-- Drapeau distinguant l'unité virtuelle qui porte les risques transverses
ALTER TABLE "UniteTravail" ADD COLUMN "estTransverse" BOOLEAN NOT NULL DEFAULT false;
