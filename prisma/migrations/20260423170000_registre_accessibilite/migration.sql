-- Registre d'accessibilité ERP (arrêté du 19 avril 2017, art. D111-19-33 CCH).
--
-- Tout ERP doit tenir un registre public consultable. Notre valeur ajoutée :
-- publication sous URL stable (slugPublic) + QR code à coller à l'accueil.

BEGIN;

CREATE TYPE "HandicapAccessible" AS ENUM (
  'moteur',
  'visuel',
  'auditif',
  'mental',
  'cognitif',
  'psychique'
);

CREATE TYPE "RegimeConformiteErp" AS ENUM (
  'conforme_origine',
  'conforme_apres_travaux',
  'derogation_accordee',
  'adap_en_cours',
  'non_conforme_sans_adap'
);

CREATE TABLE "RegistreAccessibilite" (
    "id"                             TEXT NOT NULL,
    "etablissementId"                TEXT NOT NULL,
    "slugPublic"                     TEXT NOT NULL,

    "prestationsFournies"            TEXT,
    "handicapsAccueillis"            "HandicapAccessible"[] NOT NULL DEFAULT ARRAY[]::"HandicapAccessible"[],
    "servicesAdaptes"                TEXT,

    "conformiteRegime"               "RegimeConformiteErp",
    "dateConformite"                 TIMESTAMP(3),
    "numeroAttestationAccess"        TEXT,
    "attestationCle"                 TEXT,
    "attestationNom"                 TEXT,
    "dateDepotAdap"                  TIMESTAMP(3),
    "agendaAdapCle"                  TEXT,
    "agendaAdapNom"                  TEXT,

    "personnelForme"                 BOOLEAN NOT NULL DEFAULT false,
    "dateDerniereFormation"          TIMESTAMP(3),
    "organismeFormation"             TEXT,
    "attestationFormationCle"        TEXT,
    "attestationFormationNom"        TEXT,
    "effectifForme"                  INTEGER,

    "equipementsAccessibilite"       TEXT,
    "modalitesMaintenance"           TEXT,
    "dernierControleMaintenance"     TIMESTAMP(3),

    "publie"                         BOOLEAN NOT NULL DEFAULT false,
    "publieLe"                       TIMESTAMP(3),

    "createdAt"                      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"                      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistreAccessibilite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RegistreAccessibilite_etablissementId_key"
    ON "RegistreAccessibilite"("etablissementId");
CREATE UNIQUE INDEX "RegistreAccessibilite_slugPublic_key"
    ON "RegistreAccessibilite"("slugPublic");
CREATE INDEX "RegistreAccessibilite_slugPublic_idx"
    ON "RegistreAccessibilite"("slugPublic");

ALTER TABLE "RegistreAccessibilite"
    ADD CONSTRAINT "RegistreAccessibilite_etablissementId_fkey"
    FOREIGN KEY ("etablissementId")
    REFERENCES "Etablissement"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RegistreAccessibilite" ENABLE ROW LEVEL SECURITY;

COMMIT;
