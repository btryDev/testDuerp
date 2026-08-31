-- Les deux réalisateurs que le suivi médical rendait nécessaires.
--
-- Le référentiel dit QUI réalise une obligation. Jusqu'ici, aucune valeur ne
-- pouvait dire « le médecin du travail » : le repli était `exploitant`, et
-- c'est celui qu'avait pris `elec-salarie-attestation-medicale-voisinage`.
-- Sur une visite d'information et de prévention, ce repli annonce au dirigeant
-- qu'il réalise lui-même un acte qu'il lui est interdit de réaliser.
--
-- Deux valeurs et non une, parce que le texte en distingue deux :
--   * `R. 4624-28` réserve le renouvellement du suivi individuel renforcé au
--     MÉDECIN DU TRAVAIL ;
--   * `R. 4624-10` (VIP) et la visite intermédiaire de `R. 4624-28` l'ouvrent à
--     « l'un des professionnels de santé mentionnés au premier alinéa de
--     l'article L. 4624-1 » — ce qui inclut le collaborateur médecin, l'interne
--     et l'infirmier de santé au travail.
-- Les rabattre sur une seule valeur resserrerait la VIP au-delà du Code.
--
-- Additif et rétrocompatible : aucune ligne existante ne change, aucune valeur
-- n'est retirée. `ALTER TYPE ... ADD VALUE` est admis hors transaction depuis
-- PostgreSQL 12 dès lors que la nouvelle valeur n'est pas utilisée dans la même
-- migration — ce qui est le cas ici.

ALTER TYPE "Realisateur" ADD VALUE IF NOT EXISTS 'medecin_travail' AFTER 'bureau_controle';
ALTER TYPE "Realisateur" ADD VALUE IF NOT EXISTS 'professionnel_sante_travail' AFTER 'medecin_travail';
