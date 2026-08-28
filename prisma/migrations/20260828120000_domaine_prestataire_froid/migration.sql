-- Le domaine de prestataire « froid », qui manquait.
--
-- `DomaineObligation` porte `froid` depuis que le contrôle d'étanchéité des
-- fluides frigorigènes est entré au référentiel. `DomainePrestataire` ne l'a
-- jamais porté. Le produit pouvait donc dire qu'une obligation exige un
-- opérateur certifié (attestation de capacité, règlement (UE) 2024/573) sans
-- pouvoir dire lequel, ni constater qu'aucun n'était déclaré à l'annuaire.
--
-- Additif et rétrocompatible : aucune ligne existante ne change, aucune
-- valeur n'est retirée. `ALTER TYPE ... ADD VALUE` est admis hors transaction
-- depuis PostgreSQL 12 dès lors que la nouvelle valeur n'est pas utilisée
-- dans la même migration — ce qui est le cas ici.

ALTER TYPE "DomainePrestataire" ADD VALUE IF NOT EXISTS 'froid' AFTER 'stockage_dangereux';
