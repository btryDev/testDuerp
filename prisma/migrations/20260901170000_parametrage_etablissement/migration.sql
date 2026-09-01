-- ============================================================================
-- Deux questions de paramétrage qui n'avaient nulle part où se poser —
-- ADR-025 § 7, ADR-032.
--
-- LES TROIS COLONNES SONT NULLABLES, ET `null` VEUT DIRE « PAS ENCORE
-- RÉPONDU ». Jamais « non ». C'est la seule chose que ce fichier demande de
-- retenir : un `DEFAULT false` aurait répondu à la place du dirigeant, et la
-- checklist du tableau de bord aurait affiché « fait » sur une question que
-- personne n'a lue. Les prédicats qui s'appuient sur ces colonnes testent donc
-- `IS NOT NULL` — une réponse donnée —, jamais la valeur.
--
-- `aDemandesAssureur` : l'assureur impose-t-il des vérifications que le droit
-- n'impose pas ? Répondue « oui », la question renvoie au formulaire de
-- prescription particulière, pré-réglé sur la source `demande_assureur`
-- (ADR-032). Le champ ne porte AUCUN effet sur le moteur : il n'ouvre pas
-- d'obligation, il ouvre une porte de saisie. Ce sont les prescriptions
-- saisies, elles, qui font naître des échéances.
--
-- `epiPresents` / `epiPresentsDetail` : l'établissement fournit-il des
-- équipements de protection individuelle, et lesquels ? La réponse est
-- CONSIGNÉE, et rien n'en dérive. Les articles R. 4323-95 à R. 4323-106 du
-- Code du travail et l'arrêté du 19 mars 1993 n'ont jamais été ouverts dans ce
-- dépôt, et un guide commercial a déjà fait croire à une périodicité annuelle
-- générale des EPI, qui n'existe pas. Tant que la lecture n'est pas faite,
-- aucune obligation EPI n'est encodée et aucune périodicité n'est inventée
-- (ADR-025 § 7 : « lire avant d'encoder »). Le détail est un texte libre
-- exprès : on ne sait pas encore quelle nomenclature d'EPI le produit devra
-- porter, et figer un enum maintenant serait décider cette question par
-- accident.
--
-- Pas d'enum créé, pas d'ALTER TYPE : les trois colonnes tiennent donc dans un
-- seul fichier, contrairement à 20260901160000.
-- ============================================================================

ALTER TABLE "Etablissement" ADD COLUMN "epiPresents" BOOLEAN;
ALTER TABLE "Etablissement" ADD COLUMN "epiPresentsDetail" TEXT;
ALTER TABLE "Etablissement" ADD COLUMN "aDemandesAssureur" BOOLEAN;
