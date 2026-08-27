-- ADR-023 — Le salarié porte ses titres.
--
-- Trois choses : l'entité `Salarie`, la déclaration `TitreSalarie`, et la
-- colonne qui permet à une échéance de désigner une personne.
--
-- POURQUOI UNE COLONNE, et non un `equipementId` nul de plus : depuis
-- l'ADR-022, `equipementId IS NULL` SIGNIFIE « porté par l'établissement ». La
-- sémantique était binaire ; elle devient ternaire. On ne pouvait donc pas
-- surcharger ce `null` sans rendre les deux cas indiscernables.
--
-- Migration ADDITIVE : aucune ligne existante n'est modifiée. La seule
-- opération destructive est le remplacement de l'index unique, recréé plus bas
-- dans le même fichier.

-- DropIndex
DROP INDEX "Verification_etablissementId_obligationId_equipementId_key";

-- AlterTable
ALTER TABLE "Verification" ADD COLUMN     "salarieId" TEXT;

-- CreateTable
CREATE TABLE "Salarie" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "poste" TEXT,
    "entreLe" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salarie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TitreSalarie" (
    "id" TEXT NOT NULL,
    "salarieId" TEXT NOT NULL,
    "obligationId" TEXT NOT NULL,
    "delivreLe" TIMESTAMP(3) NOT NULL,
    "echeanceLe" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TitreSalarie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Salarie_etablissementId_actif_idx" ON "Salarie"("etablissementId", "actif");

-- CreateIndex
CREATE UNIQUE INDEX "TitreSalarie_salarieId_obligationId_key" ON "TitreSalarie"("salarieId", "obligationId");

-- CreateIndex
CREATE INDEX "Verification_salarieId_idx" ON "Verification"("salarieId");

-- CreateIndex
-- ATTENTION — clause ajoutée à la main, Prisma ne sait pas l'exprimer.
--
-- `equipementId` ET `salarieId` sont nullables : sans `NULLS NOT DISTINCT`,
-- PostgreSQL considère deux NULL comme distincts et l'unicité cesserait de
-- s'appliquer aux lignes portées par l'établissement — le même couple
-- (établissement, obligation) s'insérerait à chaque régénération du calendrier,
-- une ligne de plus par ouverture de page.
--
-- Le nom est celui que Prisma attend, pour que `migrate diff` ne voie aucune
-- dérive : il compare nom, colonnes et unicité, jamais la clause.
CREATE UNIQUE INDEX "Verification_etablissementId_obligationId_equipementId_sala_key"
  ON "Verification" ("etablissementId", "obligationId", "equipementId", "salarieId")
  NULLS NOT DISTINCT;

-- AddForeignKey
-- RESTRICT, pas CASCADE : supprimer un salarié ne doit pas emporter ses
-- échéances, dont certaines portent un rapport — c'est-à-dire la preuve qu'il
-- était habilité au moment où il a opéré. Même garde-fou que DuerpVersion.
-- La sortie prévue est la désactivation (`actif = false`), pas la suppression.
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_salarieId_fkey" FOREIGN KEY ("salarieId") REFERENCES "Salarie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salarie" ADD CONSTRAINT "Salarie_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TitreSalarie" ADD CONSTRAINT "TitreSalarie_salarieId_fkey" FOREIGN KEY ("salarieId") REFERENCES "Salarie"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Un porteur, pas deux (ADR-023).
--
-- Comme le XOR d'origine des actions (ADR-002), cette règle n'est pas
-- exprimable en Prisma : elle n'existe que dans ce fichier, et
-- `src/lib/migrations-contraintes.test.ts` la garde.
--
-- Les DEUX nuls ensemble restent valides — c'est le porteur établissement.
-- Ce que la contrainte interdit est de renseigner les deux : une ligne qui
-- désignerait à la fois un appareil et une personne n'aurait pas de clé de
-- réconciliation univoque, et `cleDeLigne` devrait deviner laquelle prime.
ALTER TABLE "Verification"
  ADD CONSTRAINT "Verification_porteur_xor"
  CHECK ("equipementId" IS NULL OR "salarieId" IS NULL);
