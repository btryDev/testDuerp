-- ADR-028 (2026-09-01) : un utilisateur possède une entreprise ; une entreprise
-- porte autant d'établissements qu'elle en a.
--
-- L'unicité retirée ici n'était pas une erreur. La migration
-- `20260810120000_integrite_et_conservation` l'avait posée pour qu'aucun écran
-- ne suppose silencieusement le multi-site pendant que le produit n'en avait
-- pas — et elle l'avait posée avec sa marche de sortie, écrite dans
-- `schema.prisma` : « le jour où le multi-site entrera au périmètre, il suffira
-- de retirer le @unique ». Ce jour est aujourd'hui, et la promesse a tenu :
-- aucun des dix helpers de `src/lib/auth/scope.ts` n'a été réécrit.
--
-- CE QUE CETTE MIGRATION NE TOUCHE PAS, et c'est l'essentiel :
-- `Entreprise.userId` reste `@unique`. Un compte reste une entreprise. C'est
-- cette unicité-là qui est la racine de tenancy de l'ADR-005 — tous les `where`
-- du produit remontent à `entreprise.userId` — et c'est elle qui rend univoque
-- le chemin `jeton.sub → Entreprise` du serveur MCP. Le multi-utilisateur reste
-- hors roadmap (ADR-028, « ce qui n'est pas décidé ici »).
--
-- L'index simple revient là où l'unique s'en était allé : `entrepriseId` reste
-- la colonne par laquelle on liste les établissements d'un compte, et le
-- sélecteur de la barre haute le fait à chaque rendu. C'est très exactement
-- l'index `Etablissement_entrepriseId_idx` que la migration d'août avait déposé
-- pour lui substituer la contrainte.
--
-- Le sens de cette migration est le retrait d'une contrainte : elle ne peut pas
-- buter sur des données existantes, et n'a donc pas de garde préalable — au
-- contraire de celle d'août, qui refusait de s'appliquer tant qu'un compte
-- portait plusieurs établissements.

DROP INDEX "Etablissement_entrepriseId_key";

CREATE INDEX "Etablissement_entrepriseId_idx" ON "Etablissement"("entrepriseId");
