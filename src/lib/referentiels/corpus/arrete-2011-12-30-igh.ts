// Corpus : articles cités par le référentiel, dépouillés le 26 août 2026.
//
// Étendue « articles_cites » : cette liste ne contient QUE les articles que le
// référentiel cite. Elle ne dit rien de ce que le texte contient par ailleurs,
// et ne peut donc jamais se déclarer complète. C'est un remboursement de dette,
// pas une preuve d'exhaustivité.

import type { Corpus } from "./types";

export const ARRETE_2011_12_30_IGH: Corpus = {
  id: "arrete-2011-12-30-igh",
  intitule:
    "Arrêté du 30 décembre 2011 — règlement de sécurité des IGH",
  url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000025167121/",
  etendue: "articles_cites",
  portee:
    "Régime IGH, hors périmètre produit. Le référentiel porte quelques obligations héritées qui le citent.",
  articles: [
  {
    ref: "GH 5",
    versionEnVigueur: "2026-01-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["incendie-igh-moyens-secours-annuelle"],
  },
  ],
};
