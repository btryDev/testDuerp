/**
 * Obligations réglementaires — Sécurité incendie (P1).
 *
 * Sources primaires :
 *   - Code du travail, articles R. 4227-28 à R. 4227-41 (lutte contre
 *     l'incendie, consignes, exercices) et L. 4711-5 (registre de sécurité).
 *   - Arrêté du 25 juin 1980 modifié (règlement de sécurité ERP) — livre II,
 *     articles MS (moyens de secours), DF (désenfumage) et EC (éclairage).
 *   - Arrêté du 22 juin 1990 modifié (règles PE — ERP 5ᵉ catégorie).
 *   - Arrêté du 30 décembre 2011 (règlement IGH) — articles GH 60 à GH 63.
 *   - CCH articles R. 143-1 s. (ERP) et R. 146-3 s. (IGH) — registre de
 *     sécurité : R. 143-44 (ERP) et R. 146-21 (IGH).
 *
 * Note sur les extincteurs :
 *   La NF EN 3 et la règle APSAD R4 ne sont pas des textes opposables en tant
 *   que tels. L'obligation opposable vient de l'arrêté du 25 juin 1980 (art.
 *   MS 38) et du Code du travail R. 4227-29. On cite les deux, sans les normes
 *   privées.
 */

import type { Obligation } from "./types";

export const obligationsIncendie: Obligation[] = [
  // ---------------------------------------------------------------------------
  // Travail (Code du travail) — consignes, exercices, moyens de lutte
  // ---------------------------------------------------------------------------
  {
    id: "incendie-travail-moyens-lutte",
    domaine: "incendie",
    libelle: "Présence et maintien en état des moyens de lutte contre l'incendie (travail)",
    description:
      "Les établissements doivent être dotés de moyens de lutte contre l'incendie adaptés (extincteurs appropriés, RIA le cas échéant), maintenus en bon état et accessibles. La vérification annuelle des extincteurs est la règle de fait.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-28",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531783/",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-29",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531785/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee", "personne_competente"],
    criticite: 5,
    typologies: { travail: true },
    categoriesEquipement: ["EXTINCTEUR"],
  },
  {
    id: "incendie-travail-consigne-affichee",
    domaine: "incendie",
    libelle: "Consigne incendie affichée et mise à jour",
    description:
      "Dans chaque établissement, une consigne est établie et affichée de manière apparente. Elle indique le matériel d'extinction, les personnes chargées de l'alerte et l'évacuation, les mesures spécifiques à l'établissement. Elle est mise à jour à chaque changement notable.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-37 et R. 4227-38",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531801/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true },
    categoriesEquipement: ["EXTINCTEUR", "ALARME_INCENDIE"],
  },
  {
    id: "incendie-travail-exercice-semestriel",
    domaine: "incendie",
    libelle: "Exercice d'évacuation et de maniement des moyens de secours (semestriel)",
    description:
      "Dans les établissements où le Code du travail impose un équipement d'alarme de type 4 a minima (≥ 50 salariés ou matières inflammables), des exercices et essais périodiques ont lieu au moins tous les six mois et sont consignés au registre de sécurité.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-39",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531805/",
      },
    ],
    periodicite: "semestrielle",
    realisateurs: ["exploitant"],
    criticite: 4,
    typologies: { travail: true },
    categoriesEquipement: ["ALARME_INCENDIE"],
  },
  {
    id: "incendie-registre-securite",
    domaine: "incendie",
    libelle: "Tenue du registre de sécurité",
    description:
      "Le registre de sécurité consigne les vérifications techniques, les exercices, les observations effectuées par les commissions de sécurité, les travaux et toute modification importante. Il est tenu à disposition de l'inspection et de la commission de sécurité.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "L. 4711-5",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006903157/",
      },
      {
        source: "CCH",
        reference: "CCH, art. R. 143-44 (ex R. 123-51) — ERP",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044276935/",
      },
      {
        source: "CCH",
        reference: "CCH, art. R. 146-21 (ex R. 122-29) — IGH",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044276958/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true },
    categoriesEquipement: ["EXTINCTEUR", "ALARME_INCENDIE"],
    notesInternes:
      "Obligation permanente (pas d'échéance périodique). Modélisée sur travail=true en MVP : en pratique tout établissement du scope V2 emploie au moins un salarié (L. 4711-5 CT). Les références CCH R. 143-44 / R. 146-21 restent citées pour information.",
  },

  // ---------------------------------------------------------------------------
  // ERP — Moyens de secours (MS)
  // ---------------------------------------------------------------------------
  {
    id: "incendie-erp-extincteurs-annuelle",
    domaine: "incendie",
    libelle: "Vérification annuelle des extincteurs (ERP)",
    description:
      "Les extincteurs portatifs et mobiles des ERP font l'objet d'une vérification annuelle par un technicien compétent. Un contrôle approfondi (révision) est réalisé selon les préconisations du fabricant.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. MS 38 § 2",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. MS 73",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { erp: true },
    categoriesEquipement: ["EXTINCTEUR"],
  },
  {
    id: "incendie-erp-ssi-annuelle",
    domaine: "incendie",
    libelle: "Vérification annuelle des systèmes de sécurité incendie (SSI) en ERP",
    description:
      "Les systèmes de sécurité incendie, notamment les SSI de catégorie A et B (détection, alarme, compartimentage, désenfumage), font l'objet d'un contrôle annuel par un technicien compétent.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. MS 73 § 1",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 2 mai 2005 (SSI)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000809625/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee", "organisme_agree"],
    criticite: 5,
    typologies: { erp: true },
    categoriesEquipement: ["ALARME_INCENDIE"],
  },
  {
    id: "incendie-erp-ssi-triennale",
    domaine: "incendie",
    libelle: "Vérification triennale approfondie des SSI de catégorie A ou B (ERP)",
    description:
      "En complément du contrôle annuel, les SSI de catégorie A ou B sont soumis à une vérification triennale approfondie par un organisme agréé.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. MS 73 § 2",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "triennale",
    realisateurs: ["organisme_agree"],
    criticite: 4,
    typologies: {
      erp: { categories: ["N1", "N2", "N3", "N4"] },
    },
    categoriesEquipement: ["ALARME_INCENDIE"],
  },
  {
    id: "incendie-erp-baes-annuelle",
    domaine: "incendie",
    libelle: "Vérification annuelle de l'éclairage de sécurité / BAES (ERP)",
    description:
      "L'éclairage de sécurité (blocs autonomes d'éclairage de sécurité et source centrale) est vérifié annuellement par un technicien compétent. Les essais de fonctionnement sont réalisés à chaque jour d'exploitation (bascule sur secours) et consignés.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EC 14 et EC 15",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { erp: true },
    categoriesEquipement: ["BAES"],
  },
  {
    id: "incendie-erp-desenfumage-annuelle",
    domaine: "incendie",
    libelle: "Vérification annuelle des installations de désenfumage (ERP)",
    description:
      "Les dispositifs de désenfumage (DENFC, volets, clapets, amenées d'air) des ERP font l'objet d'une vérification annuelle par un technicien compétent.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. DF 10",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { erp: true },
    categoriesEquipement: ["DESENFUMAGE"],
  },
  {
    id: "incendie-erp-ria-annuelle",
    domaine: "incendie",
    libelle: "Vérification annuelle des robinets d'incendie armés (RIA) en ERP",
    description:
      "Les robinets d'incendie armés sont vérifiés annuellement : essai de fonctionnement, débit et pression, état général. Un contrôle visuel trimestriel est en pratique réalisé par l'exploitant.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. MS 73",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { erp: true },
    categoriesEquipement: ["EXTINCTEUR"],
    notesInternes:
      "Modélisé via la catégorie EXTINCTEUR en première approche ; à scinder si on ajoute une catégorie RIA dédiée en étape 11.",
  },
  {
    id: "incendie-erp-5-visite-commission",
    domaine: "incendie",
    libelle: "Visite périodique de la commission de sécurité (ERP 5ᵉ avec locaux à sommeil ou installations spécifiques)",
    description:
      "En ERP de 5ᵉ catégorie, la visite périodique par la commission de sécurité ne concerne en règle générale que les établissements disposant de locaux à sommeil. La périodicité dépend du type et de la catégorie (en général quinquennale).",
    referencesLegales: [
      {
        source: "CCH",
        reference: "CCH, art. R. 143-34 (ex R. 123-48)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044276929/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. GE 4",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "quinquennale",
    realisateurs: ["organisme_agree"],
    criticite: 4,
    typologies: { erp: { categories: ["N5"] } },
    categoriesEquipement: ["ALARME_INCENDIE"],
    notesInternes:
      "Visite commissionnelle : n'est pas à la charge de l'exploitant au sens opérationnel (initiée par l'administration) mais est à tracer dans le registre. Échéance quinquennale en première approche.",
  },

  // ---------------------------------------------------------------------------
  // IGH
  // ---------------------------------------------------------------------------
  {
    id: "incendie-igh-moyens-secours-annuelle",
    domaine: "incendie",
    libelle: "Vérification annuelle des moyens de secours et SSI (IGH)",
    description:
      "Dans les immeubles de grande hauteur, les moyens de secours et le SSI sont vérifiés annuellement par un organisme agréé, en application du règlement IGH.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 30 décembre 2011, art. GH 60 à GH 63",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000025118025/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["organisme_agree"],
    criticite: 5,
    typologies: { igh: true },
    categoriesEquipement: ["ALARME_INCENDIE", "EXTINCTEUR", "DESENFUMAGE"],
  },
];
