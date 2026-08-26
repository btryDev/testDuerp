// Corpus : code de la construction et de l'habitation — sécurité des ascenseurs.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const CCH_ASCENSEURS: Corpus = {
  id: "cch-ascenseurs",
  intitule:
    "Code de la construction et de l'habitation — sécurité des ascenseurs",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000043818721/",
  etendue: "articles_cites",
  portee:
    "Mise en sécurité, entretien et contrôle technique quinquennal. R. 134-6, R. 134-7 et R. 134-11 ont été réécrits par le décret n° 2026-166 du 4 mars 2026, en vigueur les 1er avril et 15 mai 2026.",
  articles: [
  {
    ref: "CCH R. 134-1",
    versionEnVigueur: "2021-07-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["ascenseur-telealarme-liaison"],
  },
  {
    ref: "CCH R. 134-6",
    versionEnVigueur: "2026-04-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["ascenseur-entretien-contrat", "ascenseur-examen-annuel-securite", "ascenseur-examen-semestriel-secours"],
  },
  {
    ref: "CCH R. 134-10",
    versionEnVigueur: "2021-07-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["ascenseur-carnet-entretien"],
  },
  {
    ref: "CCH R. 134-11",
    versionEnVigueur: "2026-05-15",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["ascenseur-controle-technique-quinquennal"],
  },
  ],
};
