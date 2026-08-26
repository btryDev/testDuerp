// Corpus : sources institutionnelles INRS.
//
// Ces documents ne sont pas des textes opposables : ce sont des guides
// techniques, cités en appui d'une obligation dont le fondement est ailleurs.
// Ils entrent au registre des corpus pour une seule raison — qu'aucune
// référence du référentiel ne reste hors du décompte. Une source qu'on ne
// compte pas est une source qu'on ne relit pas.
//
// `sans_objet` et non `retenu` : ils n'établissent aucune obligation.

import type { Corpus } from "./types";

export const INRS_DOCUMENTAIRE: Corpus = {
  id: "inrs-documentaire",
  intitule: "INRS — guides et fiches techniques",
  url: "https://www.inrs.fr/",
  etendue: "articles_cites",
  portee:
    "Sources institutionnelles citées en appui. Aucune n'est opposable : le fondement des obligations qui les citent est toujours un texte de droit.",
  articles: [
    {
      ref: "INRS ED 6127",
      intitule: "Habilitation électrique",
      url: "https://www.inrs.fr/media.html?refINRS=ED%206127",
      luLe: "2026-08-26",
      lecture: "premiere_main",
      statut: "sans_objet",
      motif:
        "Guide technique de l'INRS, cité en appui de l'obligation d'habilitation électrique. Il n'institue rien : le fondement est R. 4544-9 et suivants du Code du travail. Aucune échéance n'en découle.",
    },
  ],
};
