// Corpus : articles cités par le référentiel, dépouillés le 26 août 2026.
//
// Étendue « articles_cites » : cette liste ne contient QUE les articles que le
// référentiel cite. Elle ne dit rien de ce que le texte contient par ailleurs,
// et ne peut donc jamais se déclarer complète. C'est un remboursement de dette,
// pas une preuve d'exhaustivité.

import type { Corpus } from "./types";

export const CCH_REGISTRE_SECURITE: Corpus = {
  id: "cch-registre-securite",
  intitule:
    "Code de la construction et de l'habitation — registre de sécurité et contrôles",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000043818891/",
  etendue: "articles_cites",
  portee:
    "Articles du CCH fondant le registre de sécurité en ERP et en IGH, réécrits au 1er juillet 2026 par le décret n° 2025-1100.",
  articles: [
    {
      ref: "CCH R. 143-44",
      versionEnVigueur: "2026-07-01",
      luLe: "2026-08-26",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["incendie-registre-securite"],
    },
    {
      ref: "CCH R. 141-10",
      versionEnVigueur: "2026-07-01",
      luLe: "2026-08-26",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["incendie-registre-securite"],
    },
    {
      ref: "CCH R. 141-11",
      versionEnVigueur: "2026-07-01",
      luLe: "2026-08-26",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["incendie-registre-securite"],
    },
    {
      ref: "CCH R. 146-35",
      versionEnVigueur: "2026-07-01",
      luLe: "2026-08-26",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["incendie-registre-securite"],
    },
    {
      ref: "CCH R. 143-41",
      intitule: "Visites périodiques de contrôle par la commission de sécurité",
      versionEnVigueur: "2021-07-01",
      luLe: "2026-08-26",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["incendie-erp-5-visite-commission"],
      citationCle:
        "« Ces établissements doivent faire l'objet, dans les conditions fixées au règlement de sécurité, de visites périodiques de contrôle et de visites inopinées effectuées par la commission de sécurité compétente. »",
      prescrit:
        "Fonde les visites périodiques et inopinées de la commission. Ne fixe AUCUNE périodicité : il renvoie au règlement de sécurité, dont la seule table (GE 4) ne vise que les quatre premières catégories.",
    },
  ],
};
