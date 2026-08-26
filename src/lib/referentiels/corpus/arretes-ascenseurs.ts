// Corpus : arrêtés du 18 novembre 2004 et du 7 août 2012 — entretien et contrôles techniques des ascenseurs.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const ARRETES_ASCENSEURS: Corpus = {
  id: "arretes-ascenseurs",
  intitule:
    "Arrêtés du 18 novembre 2004 et du 7 août 2012 — entretien et contrôles techniques des ascenseurs",
  url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000254219",
  etendue: "articles_cites",
  portee:
    "ATTENTION : les deux arrêtés ont été modifiés par l'arrêté du 4 mars 2026, en vigueur les 1er avril et 15 mai 2026. L'annexe de l'arrêté de 2004, sur laquelle reposent deux obligations, a changé et n'a pas pu être relue de façon fiable.",
  articles: [
  {
    ref: "Arrêté 2004-11-18",
    versionEnVigueur: "2026-04-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["ascenseur-entretien-contrat", "ascenseur-examen-annuel-securite", "ascenseur-examen-semestriel-secours"],
  },
  {
    ref: "Arrêté 2012-08-07",
    versionEnVigueur: "2026-05-15",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["ascenseur-controle-technique-quinquennal"],
  },
  ],
};
