// Corpus : arrêté du 21 décembre 1993 — portes et portails automatiques.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const ARRETE_1993_12_21_PORTES: Corpus = {
  id: "arrete-1993-12-21-portes",
  intitule: "Arrêté du 21 décembre 1993 — portes et portails automatiques",
  url: "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006082855",
  etendue: "articles_cites",
  portee:
    "Prescriptions techniques des installations (art. 2 à 5), dossier de maintenance (art. 8) et vérification au minimum semestrielle (art. 9). Plusieurs articles citent encore la numérotation du code du travail antérieure à 2008.",
  articles: [
    {
      ref: "Arrêté 1993-12-21 art. 2",
      versionEnVigueur: "1994-07-13",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "porte-auto-portail-piete-coulissant",
        "porte-auto-verification-initiale",
      ],
    },
    {
      ref: "Arrêté 1993-12-21 art. 9",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "porte-auto-dossier-maintenance",
        "porte-auto-verification-semestrielle",
      ],
    },
  ],
};
