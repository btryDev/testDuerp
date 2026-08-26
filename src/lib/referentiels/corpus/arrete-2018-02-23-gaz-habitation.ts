// Corpus : arrêté du 23 février 2018 — installations de gaz des bâtiments d'habitation.
//
// Étendue « articles_cites ». Cette entrée est DÉLIBÉRÉMENT laissée non
// dépouillée : quatre tentatives de lecture se sont interrompues à l'article
// 11.2, et le tiers non lu est précisément celui qui traite du contrôle et de
// l'entretien. Trois affirmations du référentiel en dépendent — l'abrogation
// de l'arrêté du 25 avril 1985, la périodicité annuelle, l'exigence d'un
// contrat écrit — et aucune n'est confirmée.
//
// L'obligation concernée est de criticité 5. La déclarer lue serait le pire
// service à lui rendre.

import type { Corpus } from "./types";

export const ARRETE_2018_02_23_GAZ_HABITATION: Corpus = {
  id: "arrete-2018-02-23-gaz-habitation",
  intitule:
    "Arrêté du 23 février 2018 — installations de gaz combustible des bâtiments d'habitation",
  url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000036667631",
  etendue: "articles_cites",
  portee:
    "Titres Ier à VIII, articles 1 à 34. Le titre VIII traite des essais, certificats de conformité et contrôle des installations.",
  articles: [
    {
      ref: "Arrêté 2018-02-23",
      intitule: "Titre VIII — contrôle et entretien des installations",
      statut: "non_depouille",
    },
  ],
};
