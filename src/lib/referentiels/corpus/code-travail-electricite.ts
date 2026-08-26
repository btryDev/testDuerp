// Corpus : code du travail — installations électriques et habilitation.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const CODE_TRAVAIL_ELECTRICITE: Corpus = {
  id: "code-travail-electricite",
  intitule:
    "Code du travail — installations électriques et habilitation",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018532293/",
  etendue: "articles_cites",
  portee:
    "Vérifications des installations électriques (R. 4226-14 et s.) et habilitation des travailleurs (R. 4544-9 et s.). ATTENTION : R. 4544-10 et R. 4544-11 ont été réécrits au 1er octobre 2025 par le décret n° 2025-355, et deux articles ont été créés (R. 4544-11-1 et -11-2) — non encore cités par le référentiel.",
  articles: [
  {
    ref: "R. 4226-14",
    versionEnVigueur: "2011-07-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["elec-travail-mise-en-service"],
  },
  {
    ref: "R. 4226-16",
    versionEnVigueur: "2011-07-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["elec-travail-periodique-annuelle"],
  },
  {
    ref: "R. 4226-19",
    versionEnVigueur: "2011-07-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["elec-travail-consignation-registre", "incendie-travail-eclairage-securite-autonomie-semestrielle", "incendie-travail-eclairage-securite-essai-mensuel"],
  },
  {
    ref: "R. 4544-10",
    versionEnVigueur: "2025-10-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["elec-travail-habilitation-personnel"],
  },
  {
    ref: "L. 4711-5",
    versionEnVigueur: "2008-05-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["elec-travail-consignation-registre", "incendie-registre-securite"],
  },
  ],
};
