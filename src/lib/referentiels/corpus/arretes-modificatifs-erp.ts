// Corpus : textes modificateurs du règlement de sécurité ERP.
//
// Un arrêté modificatif n'est pas un article du règlement : il le réécrit. Le
// ranger dans le corpus du Livre III faussait le compte de ses articles — 59
// au lieu de 58 — et un test l'a refusé. Il a donc son corpus.
//
// Ces textes sont cités par le référentiel pour dater une rédaction ; ils
// n'établissent aucune obligation en propre.

import type { Corpus } from "./types";

export const ARRETES_MODIFICATIFS_ERP: Corpus = {
  id: "arretes-modificatifs-erp",
  intitule: "Arrêtés modificatifs du règlement de sécurité ERP",
  url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053020948",
  etendue: "articles_cites",
  portee:
    "Textes qui réécrivent le règlement de sécurité. Cités pour dater une rédaction, jamais comme fondement d'une obligation.",
  articles: [
  {
    ref: "Arrêté 2025-12-01",
    intitule:
      "Arrêté du 1er décembre 2025 modifiant le règlement de sécurité ERP",
    url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053020948",
    versionEnVigueur: "2026-07-01",
    luLe: "2026-08-26",
    lecture: "premiere_main",
    statut: "retenu",
    obligations: ["cuisson-gaz-installations-triennale", "elec-erp-cat5-quinquennale"],
    prescrit:
      "Texte modificateur. Il réécrit PE 4 § 2 — « En cours d'exploitation » devient « Tous les trois ans au plus », et « installations de gaz » est ajouté à la liste — et PE 10. Entrée en vigueur différée au 1er juillet 2026, donc en vigueur à ce jour.",
  },
  ],
};
