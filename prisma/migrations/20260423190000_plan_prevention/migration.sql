-- Plan de prévention — art. R4512-6 à R4512-12 CT (décret 92-158).
--
-- Obligatoire écrit si :
--   - travaux > 400h / an de l'entreprise extérieure, OU
--   - travaux figurant sur la liste dangereuse (arrêté 19-03-1993).
-- Inspection commune préalable obligatoire (art. R4512-7).

BEGIN;

CREATE TYPE "StatutPlanPrevention" AS ENUM (
  'brouillon',
  'inspection_faite',
  'attente_signatures',
  'valide',
  'clos',
  'annule'
);

CREATE TABLE "PlanPrevention" (
    "id"                              TEXT NOT NULL,
    "etablissementId"                 TEXT NOT NULL,
    "numero"                          INTEGER NOT NULL,

    "prestataireId"                   TEXT,
    "entrepriseExterieureRaison"      TEXT NOT NULL,
    "entrepriseExterieureSiret"       TEXT,
    "efChefNom"                       TEXT NOT NULL,
    "efChefEmail"                     TEXT NOT NULL,
    "efEffectifIntervenant"           INTEGER NOT NULL,

    "euChefNom"                       TEXT NOT NULL,
    "euChefFonction"                  TEXT,

    "dateDebut"                       TIMESTAMP(3) NOT NULL,
    "dateFin"                         TIMESTAMP(3) NOT NULL,
    "dureeHeuresEstimee"              INTEGER,
    "lieux"                           TEXT NOT NULL,
    "naturesTravaux"                  TEXT NOT NULL,
    "travauxDangereux"                BOOLEAN NOT NULL DEFAULT false,

    "inspectionDate"                  TIMESTAMP(3),
    "inspectionParticipants"          TEXT,

    "statut"                          "StatutPlanPrevention" NOT NULL DEFAULT 'brouillon',

    "createdAt"                       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"                       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanPrevention_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlanPrevention_etablissementId_numero_key"
    ON "PlanPrevention"("etablissementId", "numero");
CREATE INDEX "PlanPrevention_etablissementId_dateDebut_idx"
    ON "PlanPrevention"("etablissementId", "dateDebut");

ALTER TABLE "PlanPrevention"
    ADD CONSTRAINT "PlanPrevention_etablissementId_fkey"
    FOREIGN KEY ("etablissementId")
    REFERENCES "Etablissement"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlanPrevention" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "LignePlanPrevention" (
    "id"                            TEXT NOT NULL,
    "planPreventionId"              TEXT NOT NULL,
    "ordre"                         INTEGER NOT NULL DEFAULT 0,
    "risque"                        TEXT NOT NULL,
    "mesureEntrepriseUtilisatrice"  TEXT,
    "mesureEntrepriseExterieure"    TEXT,

    CONSTRAINT "LignePlanPrevention_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LignePlanPrevention_planPreventionId_ordre_idx"
    ON "LignePlanPrevention"("planPreventionId", "ordre");

ALTER TABLE "LignePlanPrevention"
    ADD CONSTRAINT "LignePlanPrevention_planPreventionId_fkey"
    FOREIGN KEY ("planPreventionId")
    REFERENCES "PlanPrevention"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LignePlanPrevention" ENABLE ROW LEVEL SECURITY;

COMMIT;
