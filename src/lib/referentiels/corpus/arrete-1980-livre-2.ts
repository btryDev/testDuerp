// Corpus : articles cités par le référentiel, dépouillés le 26 août 2026.
//
// Étendue « articles_cites » : cette liste ne contient QUE les articles que le
// référentiel cite. Elle ne dit rien de ce que le texte contient par ailleurs,
// et ne peut donc jamais se déclarer complète. C'est un remboursement de dette,
// pas une preuve d'exhaustivité.

import type { Corpus } from "./types";

export const ARRETE_1980_LIVRE_2: Corpus = {
  id: "arrete-1980-livre-2",
  intitule:
    "Arrêté du 25 juin 1980, Livre II — établissements des quatre premières catégories",
  url: "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
  etendue: "articles_cites",
  portee:
    "Dispositions générales (MS, EC, EL, DF, GE) et particulières par type. PE 1 § 1 l'écarte en 5e catégorie sauf renvoi exprès : le Livre III n'en ouvre que MS 39 et MS 70. Les articles listés ici sont cités par le référentiel malgré cette exclusion — la sur-application est documentée obligation par obligation.",
  articles: [
  {
    ref: "CH 57",
    versionEnVigueur: "1980-08-15",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["aeration-erp-chauffage-ventilation-annuelle"],
  },
  {
    ref: "CH 58",
    versionEnVigueur: "2025-09-10",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["aeration-erp-chauffage-ventilation-annuelle"],
  },
  {
    ref: "GC 21",
    versionEnVigueur: "1980-08-15",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["cuisson-erp-circuits-extraction-nettoyage"],
  },
  {
    ref: "GC 22",
    versionEnVigueur: "1980-08-15",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["cuisson-erp-appareils-annuelle", "cuisson-erp-extinction-automatique-annuelle", "cuisson-erp-verification-initiale"],
  },
  {
    ref: "GZ 15",
    versionEnVigueur: "2026-01-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["cuisson-gaz-installations-annuelle"],
  },
  {
    ref: "GE 6",
    versionEnVigueur: "2007-11-19",
    versionFuture: "2027-06-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["elec-erp-mise-en-service"],
  },
  {
    ref: "EL 18",
    versionEnVigueur: "2019-07-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["elec-erp-groupe-electrogene-annuel"],
  },
  {
    ref: "MS 38",
    versionEnVigueur: "2008-10-08",
    luLe: "2026-08-26",
    lecture: "premiere_main",
    statut: "retenu",
    obligations: ["incendie-erp-extincteurs-annuelle"],
  },
  {
    ref: "MS 73",
    versionEnVigueur: "1980-08-15",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["incendie-erp-extincteurs-annuelle", "incendie-erp-ria-annuelle", "incendie-erp-ssi-annuelle", "incendie-erp-ssi-triennale"],
  },
  {
    ref: "EC 14",
    versionEnVigueur: "2010-05-16",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["incendie-erp-eclairage-securite-autonomie-semestrielle", "incendie-erp-eclairage-securite-essai-mensuel"],
  },
  {
    ref: "EC 15",
    versionEnVigueur: "1980-08-15",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["incendie-erp-baes-annuelle"],
  },
  {
    ref: "EL 19",
    versionEnVigueur: "2010-01-23",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["elec-erp-cat1-4-annuelle", "elec-erp-groupe-electrogene-annuel", "elec-erp-mise-en-service", "incendie-erp-baes-annuelle"],
  },
  {
    ref: "DF 10",
    versionEnVigueur: "2007-10-28",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["incendie-erp-desenfumage-annuelle"],
  },
  {
    ref: "GE 4",
    versionEnVigueur: "2015-01-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["incendie-erp-5-visite-commission"],
  },
  ],
};
