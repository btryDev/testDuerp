-- Lien optionnel vers l'ID de la mesure dans le référentiel
ALTER TABLE "Mesure" ADD COLUMN "referentielMesureId" TEXT;

-- Empêche le double ajout d'une même mesure référentielle pour un risque
CREATE UNIQUE INDEX "Mesure_risqueId_referentielMesureId_key" ON "Mesure"("risqueId", "referentielMesureId");
