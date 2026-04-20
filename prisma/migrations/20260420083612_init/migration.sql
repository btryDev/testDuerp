-- CreateTable
CREATE TABLE "Entreprise" (
    "id" TEXT NOT NULL,
    "raisonSociale" TEXT NOT NULL,
    "siret" TEXT,
    "codeNaf" TEXT NOT NULL,
    "effectif" INTEGER NOT NULL,
    "adresse" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entreprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Duerp" (
    "id" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Duerp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuerpVersion" (
    "id" TEXT NOT NULL,
    "duerpId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "motif" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DuerpVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniteTravail" (
    "id" TEXT NOT NULL,
    "duerpId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "UniteTravail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Risque" (
    "id" TEXT NOT NULL,
    "uniteId" TEXT NOT NULL,
    "referentielId" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "description" TEXT,
    "gravite" INTEGER NOT NULL,
    "probabilite" INTEGER NOT NULL,
    "maitrise" INTEGER NOT NULL,
    "criticite" INTEGER NOT NULL,

    CONSTRAINT "Risque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mesure" (
    "id" TEXT NOT NULL,
    "risqueId" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statut" TEXT NOT NULL,
    "echeance" TIMESTAMP(3),
    "responsable" TEXT,

    CONSTRAINT "Mesure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DuerpVersion_duerpId_numero_key" ON "DuerpVersion"("duerpId", "numero");

-- AddForeignKey
ALTER TABLE "Duerp" ADD CONSTRAINT "Duerp_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuerpVersion" ADD CONSTRAINT "DuerpVersion_duerpId_fkey" FOREIGN KEY ("duerpId") REFERENCES "Duerp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniteTravail" ADD CONSTRAINT "UniteTravail_duerpId_fkey" FOREIGN KEY ("duerpId") REFERENCES "Duerp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risque" ADD CONSTRAINT "Risque_uniteId_fkey" FOREIGN KEY ("uniteId") REFERENCES "UniteTravail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mesure" ADD CONSTRAINT "Mesure_risqueId_fkey" FOREIGN KEY ("risqueId") REFERENCES "Risque"("id") ON DELETE CASCADE ON UPDATE CASCADE;
