-- ============================================================================
-- Fiches du registre de sécurité à saisie libre, et renseignements généraux
--
-- Le registre de sécurité compte une quarantaine de fiches (CCH R. 143-44,
-- réécrit au 1er juillet 2026 par le décret 2025-1100, qui renvoie désormais
-- aux articles R. 141-10 et R. 141-11). La plupart sont déjà alimentées par un
-- modèle métier : les équipements pour l'inventaire, les rapports de
-- vérification pour les contrôles.
--
-- Restent celles qui ne font que poser des questions et ranger des réponses —
-- téléphones utiles, état nominatif du personnel de sécurité (R. 143-44 2°),
-- contrôles administratifs, événements, dépoussiérage. Leur donner un modèle
-- chacune serait huit tables pour une seule mécanique : elles partagent
-- `FicheRegistre`, et ce sont les questions qui varient, décrites en
-- TypeScript versionné (src/lib/registre/champs.ts), au même titre que le
-- référentiel d'obligations (ADR-003).
--
-- `sectionId` désigne une fiche du catalogue TypeScript. Ce n'est
-- volontairement PAS une clé étrangère — le catalogue n'est pas en base. La
-- contrepartie : un identifiant renommé orphelinerait des réponses. Un test
-- vérifie que tout sectionId écrit existe au catalogue.
--
-- Les quatre colonnes ajoutées à `Etablissement` ne vont PAS dans `contenu` :
-- ce sont des faits d'établissement, que la fiche établissement montre aussi.
-- Deux emplacements pour la même donnée divergent toujours, et c'est le
-- registre — celui qu'on présente à la commission — qui afficherait la valeur
-- périmée.
--
-- Purement additif : aucune colonne existante modifiée, aucun backfill,
-- toutes les colonnes ajoutées sont nullables.
-- ============================================================================

-- CreateTable
CREATE TABLE "FicheRegistre" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "contenu" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FicheRegistre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FicheRegistre_etablissementId_idx" ON "FicheRegistre"("etablissementId");

-- CreateIndex
CREATE UNIQUE INDEX "FicheRegistre_etablissementId_sectionId_key" ON "FicheRegistre"("etablissementId", "sectionId");

-- AddForeignKey
ALTER TABLE "FicheRegistre" ADD CONSTRAINT "FicheRegistre_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Etablissement" ADD COLUMN     "natureActivite" TEXT,
ADD COLUMN     "effectifPublicAdmis" INTEGER,
ADD COLUMN     "dateAutorisationOuverture" TIMESTAMP(3),
ADD COLUMN     "dateCertificatConformite" TIMESTAMP(3);
