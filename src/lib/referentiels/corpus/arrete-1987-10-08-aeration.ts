// Corpus : arrêté du 8 octobre 1987 — contrôle périodique des installations d'aération.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const ARRETE_1987_10_08_AERATION: Corpus = {
  id: "arrete-1987-10-08-aeration",
  intitule:
    "Arrêté du 8 octobre 1987 — contrôle périodique des installations d'aération",
  url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000863044/",
  etendue: "articles_cites",
  portee:
    "Pris pour R. 4222-20. L'article 4 fixe le contrôle annuel des locaux à pollution spécifique, et un contrôle semestriel supplémentaire lorsqu'il existe un système de recyclage.",
  articles: [
    {
      ref: "Arrêté 1987-10-08 art. 3",
      versionEnVigueur: "1988-04-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "aeration-travail-entretien-annuel",
        "aeration-travail-mise-en-service",
      ],
    },
    {
      ref: "Arrêté 1987-10-08 art. 4",
      versionEnVigueur: "1988-04-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "aeration-travail-locaux-pollution-specifique",
        "stockage-dangereux-ventilation-locaux",
      ],
      prescrit:
        "RYTHME NON PORTÉ, relevé le 2026-08-27. Le b) impose « au minimum tous les six mois lorsqu'il existe un système de recyclage » le contrôle de la concentration en poussières ou autres polluants dans les gaines de recyclage, et de tous les systèmes de surveillance. Il S'AJOUTE à l'annuel du a) et porte sur des objets DIFFÉRENTS — l'un les débits et l'état, l'autre les concentrations. Non encodé : la présence d'un système de recyclage est un attribut d'équipement que le modèle n'a pas.",
    },
  ],
};
