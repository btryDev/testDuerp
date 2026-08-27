// Corpus : arrêté du 25 juin 1980, livre iv — parcs de stationnement couverts (type ps).
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const ARRETE_1980_LIVRE_4_PARCS: Corpus = {
  id: "arrete-1980-livre-4-parcs",
  intitule:
    "Arrêté du 25 juin 1980, Livre IV — parcs de stationnement couverts (type PS)",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000024812448/",
  etendue: "articles_cites",
  portee:
    "PS 32 « Maintenance et vérifications ». Le Livre IV n'est PAS le Livre II : l'exclusion de PE 1 § 1 ne le couvre pas, et son applicabilité en 5e catégorie n'a pas été instruite.",
  articles: [
    {
      ref: "PS 32",
      versionEnVigueur: "2006-07-09",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "aeration-erp-ps-surveillance-qualite-air-inf-250",
        "aeration-erp-ps-surveillance-qualite-air-sup-250",
      ],
      prescrit:
        "LECTURE TROP ÉTROITE, relevée le 2026-08-27. Le biennal/annuel selon le seuil de 250 véhicules ne porte PAS sur la seule qualité de l'air : il couvre sept familles d'installations — électriques, désenfumage mécanique, signalisation, alarme, détection, sécurité incendie, moyens de lutte, obturation coupe-feu — dont les dispositifs de surveillance de la qualité de l'air. S'y AJOUTE « lors de leur mise en service puis au moins une fois tous les cinq ans par un organisme agréé », dont la qualité de l'air est le seul poste expressément exclu : la différence porte sur le vérificateur, pas sur la cadence. Non encodés, faute de pouvoir énumérer sans décider à la place du texte.",
    },
  ],
};
