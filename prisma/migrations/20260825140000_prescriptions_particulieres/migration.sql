-- ============================================================================
-- Prescriptions particulières propres à un établissement (ADR-014)
--
-- Le calendrier est dérivé d'un référentiel générique (ADR-003). Un arrêté du
-- maire ou du préfet (CCH R. 143-45), un arrêté préfectoral ICPE
-- (C. env. L. 512-7-3, L. 512-12) ou une demande de l'inspection du travail
-- (C. trav. L. 4722-1) imposent des obligations qui ne valent que pour un
-- établissement. Elles ne peuvent pas entrer dans le référentiel : elles
-- vivent ici, comme donnée d'établissement, et modulent ses effets.
--
-- Deux effets exclusifs, garantis par CHECK (même technique que
-- `Action_origine_xor`, ADR-002) :
--   - renforce_periodicite : cible une obligation du référentiel et impose une
--     périodicité plus courte. La règle « plus courte que le référentiel » ne
--     peut pas être une CHECK puisque le référentiel n'est pas en base : elle
--     est appliquée par le code (Zod + moteur).
--   - obligation_sur_mesure : libellé + périodicité + catégorie ou équipement.
--
-- `Verification.prescriptionId` trace l'origine ; SET NULL à la suppression :
-- la réconciliation (ADR-012) décide ensuite seule du sort de la ligne, et ne
-- détruit jamais une ligne porteuse de preuve.
--
-- Aucune donnée existante n'est modifiée ; aucun backfill.
-- ============================================================================

CREATE TYPE "SourcePrescription" AS ENUM (
    'arrete_prefectoral',
    'arrete_municipal',
    'pv_commission_securite',
    'arrete_icpe',
    'inspection_travail',
    'autre'
);

CREATE TYPE "EffetPrescription" AS ENUM (
    'renforce_periodicite',
    'obligation_sur_mesure'
);

CREATE TABLE "PrescriptionParticuliere" (
    "id"                  TEXT NOT NULL,
    "etablissementId"     TEXT NOT NULL,
    "source"              "SourcePrescription" NOT NULL,
    "effet"               "EffetPrescription" NOT NULL,
    "reference"           TEXT NOT NULL,
    "autorite"            TEXT,
    "dateDocument"        TIMESTAMP(3) NOT NULL,
    "dateFin"             TIMESTAMP(3),
    "actif"               BOOLEAN NOT NULL DEFAULT true,
    "obligationId"        TEXT,
    "libelle"             TEXT,
    "description"         TEXT,
    "periodicite"         "Periodicite" NOT NULL,
    "realisateurRequis"   "Realisateur"[],
    "categorieEquipement" "CategorieEquipement",
    "equipementId"        TEXT,
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"           TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrescriptionParticuliere_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PrescriptionParticuliere"
    ADD CONSTRAINT "PrescriptionParticuliere_etablissementId_fkey"
    FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- SET NULL et non CASCADE : la prescription est une trace opposable qui
-- survit à la disparition de l'équipement ; seul le lien se perd.
ALTER TABLE "PrescriptionParticuliere"
    ADD CONSTRAINT "PrescriptionParticuliere_equipementId_fkey"
    FOREIGN KEY ("equipementId") REFERENCES "Equipement"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Exclusivité des effets.
ALTER TABLE "PrescriptionParticuliere"
    ADD CONSTRAINT "PrescriptionParticuliere_effet_xor" CHECK (
        (
            "effet" = 'renforce_periodicite'
            AND "obligationId" IS NOT NULL
            AND "libelle" IS NULL
            AND "categorieEquipement" IS NULL
        ) OR (
            "effet" = 'obligation_sur_mesure'
            AND "obligationId" IS NULL
            AND "libelle" IS NOT NULL
            AND ("categorieEquipement" IS NOT NULL OR "equipementId" IS NOT NULL)
        )
    );

-- Une prescription sans échéance n'a rien à faire dans le calendrier.
-- `mise_en_service_uniquement` reste permis : c'est la vérification ponctuelle
-- à délai demandée par l'inspection du travail (R. 4722-5).
ALTER TABLE "PrescriptionParticuliere"
    ADD CONSTRAINT "PrescriptionParticuliere_periodicite_datee"
    CHECK ("periodicite" <> 'autre');

CREATE INDEX "PrescriptionParticuliere_etablissementId_actif_idx"
    ON "PrescriptionParticuliere"("etablissementId", "actif");

CREATE INDEX "PrescriptionParticuliere_equipementId_idx"
    ON "PrescriptionParticuliere"("equipementId");

-- ----------------------------------------------------------------------------
-- Verification.prescriptionId — trace d'origine
-- ----------------------------------------------------------------------------

ALTER TABLE "Verification"
    ADD COLUMN "prescriptionId" TEXT;

ALTER TABLE "Verification"
    ADD CONSTRAINT "Verification_prescriptionId_fkey"
    FOREIGN KEY ("prescriptionId") REFERENCES "PrescriptionParticuliere"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Verification_prescriptionId_idx"
    ON "Verification"("prescriptionId");
