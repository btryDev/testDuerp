-- Signature électronique (ADR-006) + accès externe par token (ADR-007).
--
-- Deux briques indépendantes mais co-livrées car la signature via OTP d'un
-- prestataire externe consomme un AccessToken (scope = 'signature').
--
-- Valeurs probatoires :
--   - Art. 1366 et 1367 Code civil : identification fiable + intégrité.
--   - Règlement eIDAS (UE) 910/2014 : niveau « simple » suffisant pour
--     rapports de vérif, permis de feu, plan de prévention, accessibilité.

BEGIN;

-- ============================================================================
-- 1) Enums
-- ============================================================================

CREATE TYPE "ObjetSignable" AS ENUM (
  'rapport_verification',
  'permis_feu',
  'plan_prevention',
  'registre_accessibilite',
  'duerp_version'
);

CREATE TYPE "MethodeSignature" AS ENUM (
  'compte_connecte',
  'otp_email'
);

CREATE TYPE "ScopeAccessToken" AS ENUM (
  'signature',
  'depot_rapport',
  'consultation'
);

-- ============================================================================
-- 2) Table Signature
-- ============================================================================

CREATE TABLE "Signature" (
    "id"                      TEXT NOT NULL,
    "etablissementId"         TEXT NOT NULL,

    "objetType"               "ObjetSignable" NOT NULL,
    "objetId"                 TEXT NOT NULL,

    "signataireNom"           TEXT NOT NULL,
    "signataireEmail"         TEXT NOT NULL,
    "signataireRole"          TEXT,
    "userId"                  UUID,

    "hashDocument"            TEXT NOT NULL,
    "nomDocument"             TEXT,

    "methode"                 "MethodeSignature" NOT NULL,
    "ipAddress"               TEXT,
    "userAgent"               TEXT,

    "horodatageIso"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horodatageQualifieToken" TEXT,

    "createdAt"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signature_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Signature_etablissementId_objetType_objetId_idx"
    ON "Signature"("etablissementId", "objetType", "objetId");
CREATE INDEX "Signature_userId_idx" ON "Signature"("userId");

ALTER TABLE "Signature"
    ADD CONSTRAINT "Signature_etablissementId_fkey"
    FOREIGN KEY ("etablissementId")
    REFERENCES "Etablissement"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Signature" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3) Table AccessToken
-- ============================================================================

CREATE TABLE "AccessToken" (
    "id"                            TEXT NOT NULL,
    "tokenHash"                     TEXT NOT NULL,
    "etablissementId"               TEXT NOT NULL,

    "scope"                         "ScopeAccessToken" NOT NULL,
    "objetType"                     TEXT NOT NULL,
    "objetId"                       TEXT NOT NULL,
    "prestataireId"                 TEXT,

    "emailDestinataire"             TEXT NOT NULL,
    "nomDestinataire"               TEXT,

    "otpHash"                       TEXT,
    "otpEssaisRestants"             INTEGER NOT NULL DEFAULT 3,

    "expireLe"                      TIMESTAMP(3) NOT NULL,
    "utiliseLe"                     TIMESTAMP(3),
    "revoqueLe"                     TIMESTAMP(3),
    "revoqueMotif"                  TEXT,

    "createdByUserId"               UUID NOT NULL,
    "createdAt"                     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "derniereUtilisationIp"         TEXT,
    "derniereUtilisationUserAgent"  TEXT,

    CONSTRAINT "AccessToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AccessToken_tokenHash_key" ON "AccessToken"("tokenHash");
CREATE INDEX "AccessToken_etablissementId_idx" ON "AccessToken"("etablissementId");
CREATE INDEX "AccessToken_objetType_objetId_idx"
    ON "AccessToken"("objetType", "objetId");

ALTER TABLE "AccessToken"
    ADD CONSTRAINT "AccessToken_etablissementId_fkey"
    FOREIGN KEY ("etablissementId")
    REFERENCES "Etablissement"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AccessToken" ENABLE ROW LEVEL SECURITY;

COMMIT;
