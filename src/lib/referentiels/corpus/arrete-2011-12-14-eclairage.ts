// Corpus : articles cités par le référentiel, dépouillés le 26 août 2026.
//
// Étendue « articles_cites » : cette liste ne contient QUE les articles que le
// référentiel cite. Elle ne dit rien de ce que le texte contient par ailleurs,
// et ne peut donc jamais se déclarer complète. C'est un remboursement de dette,
// pas une preuve d'exhaustivité.

import type { Corpus } from "./types";

export const ARRETE_2011_12_14_ECLAIRAGE: Corpus = {
  id: "arrete-2011-12-14-eclairage",
  intitule:
    "Arrêté du 14 décembre 2011 — éclairage de sécurité des lieux de travail",
  url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000025040771/",
  etendue: "articles_cites",
  portee:
    "Pris pour l'application de R. 4227-14 du Code du travail. Fixe les essais mensuel et semestriel de l'éclairage de sécurité.",
  articles: [
  {
    ref: "Arrêté 2011-12-14 art. 1",
    versionEnVigueur: "2011-12-31",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["incendie-travail-eclairage-securite-autonomie-semestrielle", "incendie-travail-eclairage-securite-essai-mensuel"],
  },
  {
    ref: "Arrêté 2011-12-14 art. 11",
    versionEnVigueur: "2011-12-31",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["incendie-travail-eclairage-securite-autonomie-semestrielle", "incendie-travail-eclairage-securite-essai-mensuel"],
  },
  ],
};
