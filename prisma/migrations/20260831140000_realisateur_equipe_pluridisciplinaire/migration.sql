-- L'équipe pluridisciplinaire, que `R. 4624-46` distingue du médecin du travail.
--
-- « Pour chaque entreprise ou établissement, le médecin du travail OU, dans les
-- services de prévention et de santé au travail interentreprises, l'ÉQUIPE
-- PLURIDISCIPLINAIRE établit et met à jour une fiche d'entreprise ou
-- d'établissement… » — verbatim relevé sur Légifrance le 2026-08-31, version en
-- vigueur du 2022-04-28 (décret n° 2022-679 du 26 avril 2022, art. 2).
--
-- Ce n'est pas un cas limite, c'est le cas ORDINAIRE de la cible du produit :
-- une TPE de six personnes adhère à un service interentreprises, elle ne
-- salarie pas de médecin du travail. Sans cette valeur, la fiche d'entreprise
-- devait se rabattre sur `medecin_travail` ou `professionnel_sante_travail` —
-- fausse pour la majorité des dossiers dans le premier cas, et restreignant au
-- personnel soignant, dans le second, une mission que le texte confie à une
-- équipe qui ne l'est pas toute.
--
-- Additif et rétrocompatible, même régime que les migrations
-- `..._realisateur_sante_travail` et `..._domaine_prestataire_formation_sante`.

ALTER TYPE "Realisateur" ADD VALUE IF NOT EXISTS 'equipe_pluridisciplinaire' AFTER 'professionnel_sante_travail';
