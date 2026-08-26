// Corpus : arrêté du 26 décembre 2011 — vérifications des installations électriques.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const ARRETE_2011_12_26_ELECTRICITE: Corpus = {
  id: "arrete-2011-12-26-electricite",
  intitule:
    "Arrêté du 26 décembre 2011 — vérifications des installations électriques",
  url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000025046978/",
  etendue: "articles_cites",
  portee:
    "Pris pour R. 4226-14 et R. 4226-16. L'article 2 régit la vérification initiale, l'article 3 la vérification périodique et la faculté de porter le délai à deux ans. Version initiale, jamais modifiée.",
  articles: [
  {
    ref: "Arrêté 2011-12-26 art. 2",
    versionEnVigueur: "2011-12-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["elec-travail-mise-en-service"],
  },
  {
    ref: "Arrêté 2011-12-26 art. 3",
    versionEnVigueur: "2011-12-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["elec-travail-periodique-annuelle"],
  },
  ],
};
