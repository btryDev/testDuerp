-- Supprimer un établissement redevient possible, et les FK optionnelles vers
-- le bâtiment sont indexées.
--
-- 1. `Equipement.batimentId` passe de RESTRICT à NO ACTION.
--
-- L'invariant reste le même : on ne supprime pas un bâtiment qui contient
-- encore un équipement (ADR-019 — l'équipement emporterait ses vérifications
-- et ses rapports, cf. ADR-012). Seul le *moment* du contrôle change.
--
-- RESTRICT est vérifié immédiatement, ligne à ligne. NO ACTION est vérifié en
-- fin d'instruction. Sur `DELETE FROM "Etablissement"`, PostgreSQL déclenche
-- deux cascades — vers "Equipement" et vers "Batiment" — dont l'ordre relatif
-- dépend des OID des triggers RI, donc de l'historique de la base. Quand la
-- cascade vers "Batiment" part la première, le RESTRICT voit des équipements
-- qui pointent vers des bâtiments en cours de suppression et avorte toute la
-- transaction : l'effacement RGPD d'un établissement échouait sur un motif
-- inventé (« documents à conservation obligatoire »), de façon intermittente.
--
-- En NO ACTION, la vérification est repoussée à la fin de l'instruction : les
-- équipements ont alors été supprimés par leur propre cascade, et le contrôle
-- passe. Une suppression de bâtiment isolée, elle, échoue toujours — la fin de
-- l'instruction arrive sans que les équipements aient bougé.
ALTER TABLE "Equipement" DROP CONSTRAINT "Equipement_batimentId_fkey";
ALTER TABLE "Equipement" ADD CONSTRAINT "Equipement_batimentId_fkey"
    FOREIGN KEY ("batimentId") REFERENCES "Batiment"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- 2. Index sur les trois rattachements optionnels.
--
-- `Equipement.batimentId` en avait un dès l'origine, pas les trois autres.
-- Ils sont pourtant parcourus aux mêmes endroits : le `updateMany` de
-- `supprimerBatiment` qui déplace le contenu, et l'application du SET NULL.
CREATE INDEX "PointReleve_batimentId_idx" ON "PointReleve"("batimentId");
CREATE INDEX "PermisFeu_batimentId_idx" ON "PermisFeu"("batimentId");
CREATE INDEX "PlanPrevention_batimentId_idx" ON "PlanPrevention"("batimentId");
