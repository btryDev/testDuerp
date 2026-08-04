-- Permis de feu — INRS ED 6030, art. R4224-17 CT, MS 52 ERP, APSAD R43.
--
-- Obligation assurance (APSAD R43) pour tout travail par point chaud.
-- Le donneur d'ordre et le prestataire signent électroniquement le permis
-- avant démarrage (cf. Signature + ObjetSignable = 'permis_feu').

BEGIN;

CREATE TYPE "NatureTravauxPointChaud" AS ENUM (
  'soudage_arc',
  'soudage_gaz',
  'soudage_oxyacetylenique',
  'decoupe_plasma',
  'brasage',
  'meulage',
  'tronconnage',
  'chalumeau',
  'travaux_etancheite',
  'decapage_thermique',
  'autre'
);

CREATE TYPE "StatutPermisFeu" AS ENUM (
  'brouillon',
  'attente_signatures',
  'valide',
  'en_cours',
  'termine',
  'annule'
);

CREATE TABLE "PermisFeu" (
    "id"                        TEXT NOT NULL,
    "etablissementId"           TEXT NOT NULL,
    "numero"                    INTEGER NOT NULL,

    "prestataireId"             TEXT,
    "prestataireRaison"         TEXT NOT NULL,
    "prestataireContact"        TEXT NOT NULL,
    "prestataireEmail"          TEXT NOT NULL,

    "donneurOrdreNom"           TEXT NOT NULL,
    "donneurOrdreFonction"      TEXT,

    "dateDebut"                 TIMESTAMP(3) NOT NULL,
    "dateFin"                   TIMESTAMP(3) NOT NULL,
    "lieu"                      TEXT NOT NULL,
    "naturesTravaux"            "NatureTravauxPointChaud"[] NOT NULL DEFAULT ARRAY[]::"NatureTravauxPointChaud"[],
    "descriptionTravaux"        TEXT NOT NULL,

    "mesuresValidees"           TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "mesuresNotes"              TEXT,

    "dureeSurveillanceMinutes"  INTEGER NOT NULL DEFAULT 120,

    "statut"                    "StatutPermisFeu" NOT NULL DEFAULT 'brouillon',

    "createdAt"                 TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"                 TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermisFeu_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PermisFeu_etablissementId_numero_key"
    ON "PermisFeu"("etablissementId", "numero");
CREATE INDEX "PermisFeu_etablissementId_dateDebut_idx"
    ON "PermisFeu"("etablissementId", "dateDebut");
CREATE INDEX "PermisFeu_statut_idx" ON "PermisFeu"("statut");

ALTER TABLE "PermisFeu"
    ADD CONSTRAINT "PermisFeu_etablissementId_fkey"
    FOREIGN KEY ("etablissementId")
    REFERENCES "Etablissement"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PermisFeu" ENABLE ROW LEVEL SECURITY;

COMMIT;
