// Corpus : installations classées — régimes et rétention (hors périmètre produit).
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const ICPE_STOCKAGE: Corpus = {
  id: "icpe-stockage",
  intitule:
    "Installations classées — régimes et rétention (hors périmètre produit)",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074220/LEGISCTA000006159273/",
  etendue: "articles_cites",
  portee:
    "Régimes ICPE (autorisation, enregistrement, déclaration) et valeurs de rétention de l'arrêté du 1er juin 2015. Cités pour situer une frontière : les seuils ne sont pratiquement jamais atteints dans les secteurs couverts.",
  articles: [
    {
      ref: "C. env. L. 512-1",
      versionEnVigueur: "2017-03-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["stockage-dangereux-declaration-icpe"],
    },
    {
      ref: "Arrêté 2015-06-01 art. 22",
      url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000030673177",
      versionEnVigueur: "2022-01-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["stockage-dangereux-retention"],
    },
  ],
};
