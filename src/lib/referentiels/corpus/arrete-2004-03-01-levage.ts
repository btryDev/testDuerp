// Corpus : arrêté du 1er mars 2004 — vérification des appareils et accessoires de levage.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const ARRETE_2004_03_01_LEVAGE: Corpus = {
  id: "arrete-2004-03-01-levage",
  intitule:
    "Arrêté du 1er mars 2004 — vérification des appareils et accessoires de levage",
  url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000439029",
  etendue: "articles_cites",
  portee:
    "Fixe le contenu et la périodicité des vérifications de levage. Dernier modificateur : arrêté du 29 décembre 2010. Aucune version future programmée au 2026-08-26.",
  articles: [
  {
    ref: "Arrêté 2004-03-01 annexe",
    versionEnVigueur: "2011-01-09",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["levage-vgp-semestrielle-chariot-gerbeur"],
  },
  {
    ref: "Arrêté 2004-03-01 art. 10-11",
    versionEnVigueur: "2005-03-31",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["levage-epreuve-initiale-fonctionnement"],
  },
  {
    ref: "Arrêté 2004-03-01 art. 19",
    versionEnVigueur: "2008-05-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["levage-remise-en-service-apres-reparation"],
  },
  {
    ref: "Arrêté 2004-03-01 art. 20",
    versionEnVigueur: "2005-03-31",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["levage-vgp-semestrielle-chariot-gerbeur"],
  },
  {
    ref: "Arrêté 2004-03-01 art. 23",
    versionEnVigueur: "2005-03-31",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["levage-vgp-annuelle-charges", "levage-vgp-semestrielle-chariot-gerbeur", "levage-vgp-semestrielle-personnes"],
  },
  {
    ref: "Arrêté 2004-03-01 art. 24",
    versionEnVigueur: "2008-05-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["levage-vgp-accessoires-annuelle"],
  },
  {
    ref: "Arrêté 2004-03-01 art. 5",
    versionEnVigueur: "2005-03-31",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["levage-examen-adequation-mise-en-service"],
  },
  {
    ref: "Arrêté 2004-03-01 art. 9",
    versionEnVigueur: "2005-03-31",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["levage-examen-etat-conservation"],
  },
  ],
};
