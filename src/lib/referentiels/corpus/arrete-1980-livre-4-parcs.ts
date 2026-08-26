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
    obligations: ["aeration-erp-ps-surveillance-qualite-air-inf-250", "aeration-erp-ps-surveillance-qualite-air-sup-250"],
  },
  ],
};
