// Corpus : suivi en service des équipements sous pression — code de l'environnement et arrêté du 20 novembre 2017.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const ESP_SUIVI_EN_SERVICE: Corpus = {
  id: "esp-suivi-en-service",
  intitule:
    "Suivi en service des équipements sous pression — Code de l'environnement et arrêté du 20 novembre 2017",
  url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036128632",
  etendue: "articles_cites",
  portee:
    "Déclaration et contrôle de mise en service, inspection périodique, requalification, interventions. ATTENTION : les articles 4, 26 et 28 ont été modifiés par l'arrêté du 5 septembre 2025, en vigueur depuis le 8 septembre 2025.",
  articles: [
  {
    ref: "C. env. R. 557-14-1",
    url:
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033741441",
    versionEnVigueur: "2016-12-31",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["esp-declaration-mise-en-service"],
  },
  {
    ref: "Arrêté 2017-11-20 art. 6",
    versionEnVigueur: "2018-01-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["esp-dossier-suivi"],
  },
  {
    ref: "Arrêté 2017-11-20 art. 7-11",
    versionEnVigueur: "2018-01-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["esp-declaration-mise-en-service"],
  },
  {
    ref: "Arrêté 2017-11-20 art. 15",
    versionEnVigueur: "2018-01-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["esp-inspection-periodique"],
  },
  {
    ref: "Arrêté 2017-11-20 art. 18-19",
    versionEnVigueur: "2018-01-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["esp-requalification-decennale"],
  },
  {
    ref: "Arrêté 2017-11-20 art. 26-28",
    versionEnVigueur: "2025-09-08",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["esp-intervention-reparation"],
  },
  ],
};
