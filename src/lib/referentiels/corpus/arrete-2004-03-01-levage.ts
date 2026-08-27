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
      ref: "Arrêté 2004-03-01 art. 14",
      intitule:
        "Vérification à la mise en service — aptitude non vérifiée en amont",
      versionEnVigueur: "2005-03-31",
      luLe: "2026-08-26",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["levage-epreuve-initiale-fonctionnement"],
      citationCle:
        "« d) De l'épreuve dynamique prévue par l'article 11. Cette épreuve n'est pas exigée pour les appareils de levage mus par la force humaine employée directement sauf s'ils sont conçus pour lever des personnes. »",
      prescrit:
        "Exige, avant mise en service des appareils neufs ou d'occasion dont l'aptitude à l'emploi n'a PAS été vérifiée dans leurs configurations d'utilisation : examen d'adéquation, examen de montage si installé à demeure, épreuve statique et épreuve dynamique. Les articles 6, 10 et 11 DÉFINISSENT ces épreuves ; seul l'article 14 les EXIGE. L'exception du d) était encodée à l'envers dans le référentiel avant le 2026-08-26.",
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
      lecture: "premiere_main",
      statut: "retenu",
      obligations: [
        "levage-vgp-annuelle-charges",
        "levage-vgp-semestrielle-chariot-gerbeur",
        "levage-vgp-semestrielle-personnes",
      ],
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
