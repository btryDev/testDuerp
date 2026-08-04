-- Annuaire prestataires — ADR-007.
--
-- Matérialise l'obligation de vigilance du donneur d'ordre (art. L8222-1
-- et D8222-5 CT) : stockage des attestations URSSAF (à renouveler tous les
-- 6 mois), RC Pro, Kbis, avec alertes d'expiration.
--
-- Table neuve, pas de data migration.

BEGIN;

-- ============================================================================
-- 1) Enum des domaines d'intervention
-- ============================================================================

CREATE TYPE "DomainePrestataire" AS ENUM (
  'electricite',
  'incendie',
  'ascenseur',
  'porte_automatique',
  'ventilation_vmc',
  'cuisson_hotte',
  'equipement_pression',
  'levage',
  'stockage_dangereux',
  'carnet_sanitaire',
  'bureau_controle',
  'entretien_general',
  'travaux_btp',
  'nettoyage',
  'autre'
);

-- ============================================================================
-- 2) Table Prestataire
-- ============================================================================

CREATE TABLE "Prestataire" (
    "id"                              TEXT NOT NULL,
    "etablissementId"                 TEXT NOT NULL,

    "raisonSociale"                   TEXT NOT NULL,
    "siret"                           TEXT,
    "estOrganismeAgree"               BOOLEAN NOT NULL DEFAULT false,
    "domaines"                        "DomainePrestataire"[] NOT NULL DEFAULT ARRAY[]::"DomainePrestataire"[],

    "contactNom"                      TEXT NOT NULL,
    "contactEmail"                    TEXT NOT NULL,
    "contactTelephone"                TEXT,

    "attestationUrssafCle"            TEXT,
    "attestationUrssafNom"            TEXT,
    "attestationUrssafValableJusquA"  TIMESTAMP(3),

    "assuranceRcProCle"               TEXT,
    "assuranceRcProNom"               TEXT,
    "assuranceRcProValableJusquA"     TIMESTAMP(3),

    "kbisCle"                         TEXT,
    "kbisNom"                         TEXT,
    "kbisDateEmission"                TIMESTAMP(3),

    "notesInternes"                   TEXT,

    "createdAt"                       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"                       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prestataire_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Prestataire_etablissementId_idx"
    ON "Prestataire"("etablissementId");
CREATE INDEX "Prestataire_etablissementId_raisonSociale_idx"
    ON "Prestataire"("etablissementId", "raisonSociale");

ALTER TABLE "Prestataire"
    ADD CONSTRAINT "Prestataire_etablissementId_fkey"
    FOREIGN KEY ("etablissementId")
    REFERENCES "Etablissement"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Cohérent avec le RLS activé sur les autres tables rattachées à Etablissement.
ALTER TABLE "Prestataire" ENABLE ROW LEVEL SECURITY;

COMMIT;
