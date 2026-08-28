// Corpus : code du travail — vérifications des équipements de travail (levage).
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const CODE_TRAVAIL_LEVAGE: Corpus = {
  id: "code-travail-levage",
  intitule:
    "Code du travail — vérifications des équipements de travail (levage)",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018489757/",
  etendue: "articles_cites",
  portee:
    "Section 4 du chapitre III : vérification initiale (R. 4323-22), vérifications périodiques (R. 4323-23 et s.), remise en service (R. 4323-28), consignation au registre (R. 4323-25 à -27). S'applique à tout employeur.",
  articles: [
    {
      ref: "R. 4323-22",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "levage-epreuve-initiale-fonctionnement",
        "levage-examen-adequation-mise-en-service",
      ],
    },
    {
      ref: "R. 4323-23",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "levage-examen-etat-conservation",
        "levage-vgp-accessoires-annuelle",
        "levage-vgp-annuelle-charges",
        "levage-vgp-semestrielle-chariot-gerbeur",
        "levage-vgp-semestrielle-personnes",
      ],
    },
    {
      ref: "R. 4323-25",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["levage-registre-securite-consignation"],
    },
    {
      ref: "R. 4323-26",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["levage-registre-securite-consignation"],
    },
    {
      ref: "R. 4323-27",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["levage-registre-securite-consignation"],
    },
    {
      ref: "R. 4323-28",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["levage-remise-en-service-apres-reparation"],
    },
  ],
};
