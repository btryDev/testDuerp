-- Interventions / tickets — gestion du quotidien.
-- Art. R4224-17 CT : obligation de maintien en état de conformité.
-- Boucle avec DUERP : un ticket peut être lié à un risque, sa clôture
-- invite à réévaluer le risque concerné.

BEGIN;

CREATE TYPE "PrioriteIntervention" AS ENUM (
  'basse',
  'moyenne',
  'urgente',
  'bloquante'
);

CREATE TYPE "StatutIntervention" AS ENUM (
  'ouvert',
  'assigne',
  'en_cours',
  'fait',
  'annule'
);

CREATE TABLE "Intervention" (
    "id"              TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "numero"          INTEGER NOT NULL,

    "titre"           TEXT NOT NULL,
    "description"     TEXT,
    "photos"          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

    "priorite"        "PrioriteIntervention" NOT NULL DEFAULT 'moyenne',
    "statut"          "StatutIntervention"   NOT NULL DEFAULT 'ouvert',
    "localisation"    TEXT,

    "uniteTravailId"  TEXT,
    "risqueId"        TEXT,
    "prestataireId"   TEXT,

    "creeParUserId"   UUID NOT NULL,
    "assigneA"        TEXT,
    "echeance"        TIMESTAMP(3),
    "dateCloture"     TIMESTAMP(3),
    "motifCloture"    TEXT,

    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intervention_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Intervention_etablissementId_numero_key"
    ON "Intervention"("etablissementId", "numero");
CREATE INDEX "Intervention_etablissementId_statut_idx"
    ON "Intervention"("etablissementId", "statut");
CREATE INDEX "Intervention_etablissementId_priorite_statut_idx"
    ON "Intervention"("etablissementId", "priorite", "statut");
CREATE INDEX "Intervention_risqueId_idx" ON "Intervention"("risqueId");

ALTER TABLE "Intervention"
    ADD CONSTRAINT "Intervention_etablissementId_fkey"
    FOREIGN KEY ("etablissementId")
    REFERENCES "Etablissement"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Intervention" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "CommentaireIntervention" (
    "id"             TEXT NOT NULL,
    "interventionId" TEXT NOT NULL,
    "auteurNom"      TEXT NOT NULL,
    "contenu"        TEXT NOT NULL,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommentaireIntervention_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommentaireIntervention_interventionId_idx"
    ON "CommentaireIntervention"("interventionId");

ALTER TABLE "CommentaireIntervention"
    ADD CONSTRAINT "CommentaireIntervention_interventionId_fkey"
    FOREIGN KEY ("interventionId")
    REFERENCES "Intervention"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CommentaireIntervention" ENABLE ROW LEVEL SECURITY;

COMMIT;
