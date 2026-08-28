// Corpus : code du travail — portes et portails, maintenance des lieux de travail.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const CODE_TRAVAIL_PORTES: Corpus = {
  id: "code-travail-portes",
  intitule:
    "Code du travail — portes et portails, maintenance des lieux de travail",
  url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000018532219/",
  etendue: "articles_cites",
  portee:
    "Section 2 « Portes et portails » (R. 4224-12, R. 4224-13) et section 4 « Maintenance, entretien et vérifications » (R. 4224-17). R. 4224-13 est un article de renvoi : il n'institue aucun examen.",
  articles: [
    {
      ref: "R. 4224-13",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "porte-auto-maintien-en-etat",
        "porte-auto-verification-initiale",
      ],
    },
    {
      ref: "R. 4224-17",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "porte-auto-dossier-maintenance",
        "porte-auto-maintien-en-etat",
      ],
    },
  ],
};
