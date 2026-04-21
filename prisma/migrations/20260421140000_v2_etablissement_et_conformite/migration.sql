-- V2 — Refonte du modèle : introduction de Etablissement + module conformité.
--
-- ADR-001 Etablissement : insertion d'un échelon entre Entreprise et Duerp.
-- ADR-002 Action unifiée : table Mesure supprimée, remplacée par Action.
-- ADR-004 Typologie établissement : flags estERP/estIGH/... + enums précisions.
--
-- La migration préserve les 8 DUERP existants en créant un établissement
-- par défaut pour chaque entreprise puis en réattachant les DUERPs.
-- La table Mesure n'a aucune ligne en prod : DROP sans transformation data.

BEGIN;

-- ============================================================================
-- 1) Enums V2
-- ============================================================================

CREATE TYPE "TypeErp" AS ENUM ('M', 'N', 'O', 'L', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'PA', 'CTS', 'SG', 'PS', 'REF', 'GA', 'OA', 'EF');
CREATE TYPE "CategorieErp" AS ENUM ('N1', 'N2', 'N3', 'N4', 'N5');
CREATE TYPE "ClasseIgh" AS ENUM ('GHA', 'GHW', 'GHO', 'GHR', 'GHS', 'GHU', 'GHZ', 'ITGH');
CREATE TYPE "CategorieEquipement" AS ENUM ('INSTALLATION_ELECTRIQUE', 'EXTINCTEUR', 'BAES', 'ALARME_INCENDIE', 'DESENFUMAGE', 'VMC', 'CTA', 'HOTTE_PRO', 'APPAREIL_CUISSON_ERP', 'ASCENSEUR', 'PORTE_AUTO', 'PORTAIL_AUTO', 'EQUIPEMENT_SOUS_PRESSION', 'STOCKAGE_MATIERE_DANGEREUSE', 'EQUIPEMENT_LEVAGE', 'AUTRE');
CREATE TYPE "StatutVerification" AS ENUM ('a_planifier', 'planifiee', 'realisee_conforme', 'realisee_observations', 'realisee_ecart_majeur', 'depassee');
CREATE TYPE "Periodicite" AS ENUM ('hebdomadaire', 'mensuelle', 'trimestrielle', 'semestrielle', 'annuelle', 'biennale', 'triennale', 'quinquennale', 'decennale', 'mise_en_service_uniquement', 'autre');
CREATE TYPE "Realisateur" AS ENUM ('organisme_agree', 'organisme_accredite', 'personne_qualifiee', 'personne_competente', 'exploitant', 'fabricant', 'bureau_controle');
CREATE TYPE "ResultatVerification" AS ENUM ('conforme', 'observations_mineures', 'ecart_majeur', 'non_verifiable');
CREATE TYPE "TypeAction" AS ENUM ('suppression', 'reduction_source', 'protection_collective', 'protection_individuelle', 'formation', 'organisationnelle');
CREATE TYPE "StatutAction" AS ENUM ('ouverte', 'en_cours', 'levee', 'abandonnee');

-- ============================================================================
-- 2) Table Etablissement
-- ============================================================================

CREATE TABLE "Etablissement" (
    "id" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "raisonDisplay" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "codeNaf" TEXT,
    "effectifSurSite" INTEGER NOT NULL,
    "estEtablissementTravail" BOOLEAN NOT NULL DEFAULT true,
    "estERP" BOOLEAN NOT NULL DEFAULT false,
    "estIGH" BOOLEAN NOT NULL DEFAULT false,
    "estHabitation" BOOLEAN NOT NULL DEFAULT false,
    "typeErp" "TypeErp",
    "categorieErp" "CategorieErp",
    "classeIgh" "ClasseIgh",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Etablissement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Etablissement_entrepriseId_idx" ON "Etablissement"("entrepriseId");

ALTER TABLE "Etablissement"
    ADD CONSTRAINT "Etablissement_entrepriseId_fkey"
    FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Etablissement" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3) Migration des Entreprise existantes vers un établissement par défaut
--    Correspondance 1-1 : chaque Entreprise reçoit un Etablissement dont
--    l'id est déterministe (dérivé de l'id entreprise) pour simplifier la
--    suite de la migration.
-- ============================================================================

INSERT INTO "Etablissement" (
    "id", "entrepriseId", "raisonDisplay", "adresse", "codeNaf",
    "effectifSurSite", "estEtablissementTravail", "estERP", "estIGH",
    "estHabitation", "typeErp", "categorieErp", "classeIgh",
    "createdAt", "updatedAt"
)
SELECT
    'etab_' || e."id",
    e."id",
    e."raisonSociale",
    e."adresse",
    NULL,              -- codeNaf hérité d'Entreprise.codeNaf
    e."effectif",
    true,              -- estEtablissementTravail par défaut
    false, false, false,
    NULL, NULL, NULL,
    e."createdAt",
    e."updatedAt"
FROM "Entreprise" e;

-- ============================================================================
-- 4) Duerp : ajout de etablissementId, remplissage, puis DROP entrepriseId
-- ============================================================================

ALTER TABLE "Duerp" DROP CONSTRAINT "Duerp_entrepriseId_fkey";

ALTER TABLE "Duerp" ADD COLUMN "etablissementId" TEXT;

UPDATE "Duerp" d
SET "etablissementId" = 'etab_' || d."entrepriseId";

-- Vérification de cohérence (échoue explicitement si un DUERP reste orphelin)
DO $$
DECLARE orphelins INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphelins FROM "Duerp" WHERE "etablissementId" IS NULL;
    IF orphelins > 0 THEN
        RAISE EXCEPTION 'Migration abandonnée : % DUERP sans etablissementId', orphelins;
    END IF;
END $$;

ALTER TABLE "Duerp" ALTER COLUMN "etablissementId" SET NOT NULL;
ALTER TABLE "Duerp" DROP COLUMN "entrepriseId";

ALTER TABLE "Duerp"
    ADD CONSTRAINT "Duerp_etablissementId_fkey"
    FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Duerp_etablissementId_idx" ON "Duerp"("etablissementId");

-- ============================================================================
-- 5) Suppression de l'ancienne table Mesure (0 ligne en prod)
--    L'unification Mesure → Action est réalisée en remplaçant le modèle.
-- ============================================================================

ALTER TABLE "Mesure" DROP CONSTRAINT IF EXISTS "Mesure_risqueId_fkey";
DROP TABLE "Mesure";

-- ============================================================================
-- 6) Module Conformité : Equipement, Verification, RapportVerification
-- ============================================================================

CREATE TABLE "Equipement" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "categorie" "CategorieEquipement" NOT NULL,
    "libelle" TEXT NOT NULL,
    "localisation" TEXT,
    "dateMiseEnService" TIMESTAMP(3),
    "caracteristiques" JSONB,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Equipement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Equipement_etablissementId_categorie_idx"
    ON "Equipement"("etablissementId", "categorie");
ALTER TABLE "Equipement"
    ADD CONSTRAINT "Equipement_etablissementId_fkey"
    FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Equipement" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "equipementId" TEXT NOT NULL,
    "obligationId" TEXT NOT NULL,
    "libelleObligation" TEXT NOT NULL,
    "periodicite" "Periodicite" NOT NULL,
    "realisateurRequis" "Realisateur"[],
    "datePrevue" TIMESTAMP(3) NOT NULL,
    "dateRealisee" TIMESTAMP(3),
    "statut" "StatutVerification" NOT NULL DEFAULT 'a_planifier',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Verification_etablissementId_datePrevue_idx"
    ON "Verification"("etablissementId", "datePrevue");
CREATE INDEX "Verification_equipementId_idx" ON "Verification"("equipementId");
CREATE INDEX "Verification_statut_idx" ON "Verification"("statut");
ALTER TABLE "Verification"
    ADD CONSTRAINT "Verification_etablissementId_fkey"
    FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Verification"
    ADD CONSTRAINT "Verification_equipementId_fkey"
    FOREIGN KEY ("equipementId") REFERENCES "Equipement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Verification" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "RapportVerification" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "dateRapport" TIMESTAMP(3) NOT NULL,
    "organismeVerif" TEXT,
    "resultat" "ResultatVerification" NOT NULL,
    "commentaires" TEXT,
    "fichierCle" TEXT NOT NULL,
    "fichierNomOriginal" TEXT NOT NULL,
    "fichierMime" TEXT NOT NULL,
    "fichierTaille" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RapportVerification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "RapportVerification_etablissementId_dateRapport_idx"
    ON "RapportVerification"("etablissementId", "dateRapport");
CREATE INDEX "RapportVerification_verificationId_idx"
    ON "RapportVerification"("verificationId");
ALTER TABLE "RapportVerification"
    ADD CONSTRAINT "RapportVerification_etablissementId_fkey"
    FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RapportVerification"
    ADD CONSTRAINT "RapportVerification_verificationId_fkey"
    FOREIGN KEY ("verificationId") REFERENCES "Verification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RapportVerification" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7) Table Action unifiée (remplace Mesure)
--    CHECK XOR : exactement un de risqueId / verificationId doit être non-null.
-- ============================================================================

CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "risqueId" TEXT,
    "verificationId" TEXT,
    "referentielMesureId" TEXT,
    "libelle" TEXT NOT NULL,
    "description" TEXT,
    "type" "TypeAction" NOT NULL,
    "statut" "StatutAction" NOT NULL DEFAULT 'ouverte',
    "criticite" INTEGER,
    "echeance" TIMESTAMP(3),
    "responsable" TEXT,
    "leveeLe" TIMESTAMP(3),
    "leveeCommentaire" TEXT,
    "leveeRapportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Action_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Action_origine_xor"
        CHECK (("risqueId" IS NULL) <> ("verificationId" IS NULL))
);

CREATE INDEX "Action_etablissementId_statut_idx"
    ON "Action"("etablissementId", "statut");
CREATE INDEX "Action_verificationId_idx" ON "Action"("verificationId");
CREATE UNIQUE INDEX "Action_risqueId_referentielMesureId_key"
    ON "Action"("risqueId", "referentielMesureId");

ALTER TABLE "Action"
    ADD CONSTRAINT "Action_etablissementId_fkey"
    FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Action"
    ADD CONSTRAINT "Action_risqueId_fkey"
    FOREIGN KEY ("risqueId") REFERENCES "Risque"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Action"
    ADD CONSTRAINT "Action_verificationId_fkey"
    FOREIGN KEY ("verificationId") REFERENCES "Verification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Action" ENABLE ROW LEVEL SECURITY;

COMMIT;
