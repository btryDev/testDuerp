-- Famille d'habitation — arrêté du 31 janvier 1986 (ADR-025 § 4).
--
-- `Etablissement.estHabitation` était un booléen nu : le produit savait qu'un
-- dossier relevait de l'habitation, jamais de quelle famille. Or neuf
-- obligations portent déjà la typologie habitation — deux d'aération VMC-gaz,
-- sept d'ascenseur — et elles s'appliquaient donc sans distinction de famille.
-- C'est le seul écart du cadrage du 2026-09-01 qui produisait déjà un risque :
-- une obligation servie à une famille qu'elle ne vise pas est une affirmation
-- fausse, et personne ne pouvait s'en apercevoir.
--
-- Cette migration pose le champ. Elle ne conditionne AUCUNE obligation : le
-- rattachement famille par famille suppose de lire l'arrêté du 31 janvier
-- 1986, qui n'a jamais été ouvert dans ce dépôt. Le mécanisme précède la
-- donnée, à dessein — quand la lecture sera faite, il n'y aura qu'à écrire les
-- conditions.
--
-- La 3ᵉ famille est scindée en 3A et 3B dès l'enum : la distinction tient à la
-- desserte par la voie échelle et elle emporte des obligations différentes.
-- La rattraper plus tard aurait supposé de redemander sa famille à chaque
-- dossier déjà saisi.
--
-- Colonne NULLABLE, et c'est une décision, pas une facilité : la contrainte
-- « obligatoire si estHabitation » vit dans les schémas de création
-- (`onboarding/schema.ts`, `etablissements/schema.ts`). Les dossiers
-- d'habitation antérieurs n'ont pas de famille et ne peuvent pas en recevoir
-- une par défaut — inventer « PREMIERE » pour faire propre serait exactement
-- l'affirmation fausse qu'on cherche à retirer. Ils portent une
-- indétermination visible, et on la leur demande.

CREATE TYPE "FamilleHabitation" AS ENUM ('PREMIERE', 'DEUXIEME', 'TROISIEME_A', 'TROISIEME_B', 'QUATRIEME');

ALTER TABLE "Etablissement" ADD COLUMN "familleHabitation" "FamilleHabitation";
