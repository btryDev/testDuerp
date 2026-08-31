-- Les deux domaines de prestataire qu'appellent les obligations hors équipement.
--
-- Le lot 7 fait entrer trois domaines d'obligation qui ne naissent d'aucun
-- équipement : `formation_securite`, `sante_travail`, `secours`.
-- `DOMAINES_PRESTATAIRE_ATTENDUS` (src/lib/prestataires/domaines.ts) exige pour
-- chacun une contrepartie NON VIDE — c'est la garantie écrite après `froid`,
-- qui avait vécu au référentiel sans jamais avoir de domaine de prestataire.
--
-- `autre` aurait compilé. C'est précisément ce que le commentaire de ce Record
-- interdit : « `froid: []` aurait compilé et rétabli exactement le silence
-- qu'on corrige. Un tableau vide serait ici la réponse d'un modèle qui n'a pas
-- de mot, pas la réponse d'un texte. » Le tiers a un nom réel dans les deux
-- cas, et il fallait le donner à l'enum plutôt que le taire :
--
--   * `organisme_formation` — la formation à la sécurité (`L. 4141-2`), la
--     formation de secouriste (`R. 4224-15`) et la formation à la conduite
--     (`R. 4323-55`) sont dispensées par un organisme de formation quand elles
--     ne le sont pas en interne ;
--   * `service_sante_travail` — la VIP et le SIR sont réalisés par le service
--     de prévention et de santé au travail, auquel l'adhésion est elle-même une
--     obligation de l'employeur (`L. 4622-1`). Un dirigeant qui n'en a déclaré
--     aucun n'a pas seulement un trou de vigilance : il a probablement un
--     manquement.
--
-- Additif et rétrocompatible, même régime que la migration `..._froid`.

ALTER TYPE "DomainePrestataire" ADD VALUE IF NOT EXISTS 'organisme_formation' AFTER 'nettoyage';
ALTER TYPE "DomainePrestataire" ADD VALUE IF NOT EXISTS 'service_sante_travail' AFTER 'organisme_formation';
