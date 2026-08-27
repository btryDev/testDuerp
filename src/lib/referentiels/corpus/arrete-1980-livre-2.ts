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
    ref: "GC 8",
    intitule: "Moyens d'extinction des installations de cuisson",
    versionEnVigueur: "1980-08-15",
    luLe: "2026-08-27",
    lecture: "premiere_main",
    statut: "retenu",
    obligations: ["cuisson-erp-extinction-automatique-annuelle"],
    citationCle:
      "« Dans les grandes cuisines ouvertes et les îlots de cuisson, des dispositifs d'extinction automatique adaptés au feu d'huile doivent être installés à l'aplomb des friteuses ouvertes. »",
    prescrit:
      "Fonde l'EXISTENCE du dispositif d'extinction automatique, pas sa vérification — laquelle relève de MS 73 § 2. Les deux articles étaient absents de l'obligation, qui ne citait que GC 22, où l'expression « extinction automatique » n'apparaît pas.",
  },
  {
    ref: "GC 1",
    intitule: "Domaine d'application et définitions — seuil de la « grande cuisine »",
    versionEnVigueur: "1980-08-15",
    luLe: "2026-08-26",
    lecture: "premiere_main",
    statut: "retenu",
    obligations: ["cuisson-erp-verification-initiale"],
    citationCle:
      "« § 3. Un local ou un groupement de locaux non isolés entre eux comportant des appareils de cuisson et des appareils de remise en température dont la puissance utile totale est supérieure à 20 kW est appelé \"grande cuisine\". »",
    prescrit:
      "Définit le seuil qui déclenche tout le chapitre X : 20 kW de puissance utile totale, et RIEN D'AUTRE. Aucune mention d'un nombre de couverts, ici ni ailleurs dans le chapitre. Le référentiel annonçait « > 20 kW ou production > 500 couverts simultanés, cf. art. GC 1 » — second critère inventé, corrigé le 2026-08-26. GC 1 distingue par ailleurs la grande cuisine de l'office de remise en température, de l'îlot de cuisson et du module ou conteneur spécialisé, qui relèvent de sections distinctes.",
  },
  {
    ref: "GC 21",
    intitule: "Entretien des installations de cuisson",
    versionEnVigueur: "1980-08-15",
    luLe: "2026-08-26",
    lecture: "premiere_main",
    statut: "retenu",
    obligations: [
      "cuisson-erp-circuits-extraction-nettoyage",
      "cuisson-erp-filtres-hebdomadaire",
    ],
    citationCle:
      "« § 2. Au moins une fois par an, il doit être procédé au ramonage des conduits d\'évacuation et à la vérification de leur vacuité. […] Les filtres doivent être nettoyés ou remplacés aussi souvent que nécessaire et, en tout cas, au minimum une fois par semaine. »",
    prescrit:
      "DEUX rythmes : ramonage annuel des conduits avec vérification de leur vacuité, et nettoyage ou remplacement des filtres au minimum HEBDOMADAIRE. Le second ne produisait aucune échéance avant le 2026-08-26 — il vivait dans le libellé d\'une référence. Le § 3 impose en outre de noter les dates des vérifications et opérations d\'entretien, et d\'annexer ce relevé au registre de sécurité.",
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
    obligations: ["incendie-erp-extincteurs-annuelle", "incendie-erp-ria-annuelle", "incendie-erp-ssi-annuelle", "incendie-erp-ssi-triennale", "cuisson-erp-extinction-automatique-annuelle"],
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
