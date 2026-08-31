-- ADR-027 — Une déclaration n'est pas une preuve.
--
-- Le support de persistance qui manquait à la deuxième des quatre natures
-- d'obligation de l'ADR-022. Le calendrier sert la première (`Verification`) ;
-- les états permanents n'avaient rien, et trente obligations dépouillées et
-- encodées n'étaient visibles sur aucun écran.
--
-- POURQUOI UNE TABLE À PART, ET NON UNE `Verification` SANS DATE. Une
-- `Verification` porte une échéance, donc une affirmation datée — c'est ce qui
-- l'oblige, quand son obligation quitte le référentiel, à tout l'appareil
-- d'archivage de la boucle finale du générateur : une ligne orpheline qui porte
-- une date ment. Une déclaration ne porte aucune échéance, il n'y a rien à
-- barrer, et elle survit à la régénération par construction puisque le
-- générateur ne lit ni n'écrit cette table.
--
-- `obligationId` sans clé étrangère : le référentiel vit en TypeScript
-- (ADR-003), comme pour `TitreSalarie.obligationId`.
--
-- Migration ADDITIVE : une table neuve, aucune ligne existante touchée, aucune
-- colonne ni contrainte retirée.

-- CreateTable
CREATE TABLE "DeclarationEtatPermanent" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "obligationId" TEXT NOT NULL,
    "declareLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeclarationEtatPermanent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
--
-- Un établissement ne déclare qu'une fois le même état. Pas d'index séparé sur
-- `etablissementId` : il est la colonne de TÊTE de cet index unique, qui sert
-- donc déjà `WHERE etablissementId = ?`. Un second index ne serait jamais
-- choisi et chaque écriture en paierait la mise à jour — c'est le motif de la
-- migration `index_redondant`.
CREATE UNIQUE INDEX "DeclarationEtatPermanent_etablissementId_obligationId_key" ON "DeclarationEtatPermanent"("etablissementId", "obligationId");

-- AddForeignKey
--
-- `Cascade` : une déclaration n'a aucune valeur de preuve et n'est soumise à
-- aucune obligation de conservation — contrairement à `DuerpVersion`, dont le
-- `Restrict` protège une pièce à valeur légale (ADR-012). Supprimer un
-- établissement emporte ses déclarations, et c'est juste.
ALTER TABLE "DeclarationEtatPermanent" ADD CONSTRAINT "DeclarationEtatPermanent_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
