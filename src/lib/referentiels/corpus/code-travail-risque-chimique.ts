// Corpus : code du travail — agents chimiques dangereux et équipements de travail.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const CODE_TRAVAIL_RISQUE_CHIMIQUE: Corpus = {
  id: "code-travail-risque-chimique",
  intitule:
    "Code du travail — agents chimiques dangereux et équipements de travail",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018530931/",
  etendue: "articles_cites",
  portee:
    "Prévention du risque chimique (R. 4412-11 et s.), information et formation (R. 4412-38, R. 4412-87), aération (R. 4222-20), et formation à l'utilisation des équipements de travail (R. 4323-1 et s.).",
  articles: [
  {
    ref: "R. 4222-21",
    versionEnVigueur: "2018-01-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["aeration-travail-mise-en-service"],
  },
  {
    ref: "R. 4412-11",
    versionEnVigueur: "2008-05-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["stockage-dangereux-retention", "stockage-dangereux-verification-etancheite"],
  },
  {
    ref: "R. 4412-38",
    versionEnVigueur: "2018-01-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["stockage-dangereux-fiches-donnees", "stockage-dangereux-formation-personnel"],
  },
  {
    ref: "R. 4412-87",
    versionEnVigueur: "2018-01-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["stockage-dangereux-formation-personnel"],
  },
  {
    ref: "R. 4222-20",
    versionEnVigueur: "2008-05-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["aeration-travail-entretien-annuel", "aeration-travail-mise-en-service", "stockage-dangereux-ventilation-locaux"],
  },
  {
    ref: "R. 4323-1",
    versionEnVigueur: "2009-12-29",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["esp-personnel-formation"],
  },
  ],
};
