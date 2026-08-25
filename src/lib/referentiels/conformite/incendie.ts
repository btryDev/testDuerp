/**
 * Obligations réglementaires — Sécurité incendie (P1).
 *
 * Sources primaires :
 *   - Code du travail, articles R. 4227-28 à R. 4227-41 (lutte contre
 *     l'incendie, consignes, exercices) et L. 4711-5 (registre de sécurité).
 *   - Arrêté du 25 juin 1980 modifié (règlement de sécurité ERP) — livre II,
 *     articles MS (moyens de secours), DF (désenfumage) et EC (éclairage).
 *   - Arrêté du 22 juin 1990 modifié (règles PE — ERP 5ᵉ catégorie).
 *   - Arrêté du 30 décembre 2011 (règlement IGH) — article GH 5 (vérifications
 *     techniques par organismes agréés).
 *   - CCH articles R. 143-1 s. (ERP) et R. 146-3 s. (IGH) — registre de
 *     sécurité : R. 143-44 (ERP) et R. 146-35 (IGH).
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
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532081/",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-29",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018489127/",
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
    libelle: "Consigne de sécurité incendie établie et affichée",
    description:
      "Dans les établissements mentionnés à l'article R. 4227-34 (plus de cinquante personnes occupées ou réunies habituellement, ou manipulation de matières visées par R. 4227-22, quel que soit l'effectif), une consigne de sécurité incendie est établie et affichée de manière très apparente : dans chaque local de plus de cinq personnes et dans les locaux à matières inflammables, sinon dans chaque local ou dégagement desservant un groupe de locaux. Elle indique le matériel d'extinction et de secours, les personnes chargées de l'activer, de diriger l'évacuation des travailleurs et du public, les mesures pour les personnes handicapées, les moyens d'alerte, les personnes chargées d'aviser les sapeurs-pompiers, l'adresse et le numéro du service de secours (R. 4227-38). Les autres établissements établissent de simples instructions d'évacuation.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-37 et R. 4227-38",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000024769379/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true, personnesPresentesMin: 51, champR422734: true },
    categoriesEquipement: ["EXTINCTEUR", "ALARME_INCENDIE"],
    notesInternes:
      "Amendement 2026-08-25 (relecture Légifrance R. 4227-34, -37, -38) : la consigne affichée n'est due que dans les établissements de R. 4227-34, par renvoi exprès de R. 4227-37 ; hors de ce champ le texte ne demande que des « instructions » d'évacuation. L'obligation était encodée sans seuil (sur-application à tout employeur) et sa description exigeait une « mise à jour à chaque changement notable » qui ne figure dans aucun des deux articles — retirée. La périodicité annuelle est une convention de rappel, aucun texte ne fixe de périodicité à la consigne. R. 4227-37 porte une version future au 01/01/2027 : à relire à cette date.",
  },
  {
    id: "incendie-travail-exercice-semestriel",
    domaine: "incendie",
    libelle: "Essais du matériel et exercices d'évacuation semestriels",
    description:
      "Dans les établissements mentionnés à l'article R. 4227-34 — plus de cinquante personnes occupées ou réunies habituellement (public compris), ou manipulation et mise en œuvre de matières visées par R. 4227-22 quel que soit l'effectif —, la consigne de sécurité incendie prévoit des essais et visites périodiques du matériel et des exercices au cours desquels les travailleurs apprennent à reconnaître le signal sonore d'alarme générale, à localiser et utiliser les espaces d'attente sécurisés, à se servir des moyens de premier secours et à exécuter les manœuvres nécessaires. Ces exercices et essais ont lieu au moins tous les six mois ; leur date et leurs observations sont consignées sur un registre tenu à la disposition de l'inspection du travail.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-39",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000024769386/",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-34",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532067/",
        note: "Article qui pose le seuil : établissements où peuvent se trouver occupées ou réunies habituellement plus de cinquante personnes, ainsi que ceux, quelle que soit leur importance, où sont manipulées et mises en œuvre des matières inflammables.",
      },
    ],
    periodicite: "semestrielle",
    realisateurs: ["exploitant"],
    criticite: 4,
    typologies: { travail: true, personnesPresentesMin: 51, champR422734: true },
    categoriesEquipement: ["ALARME_INCENDIE"],
    notesInternes:
      "Seuil encodé (amendement 2026-08) : sans seuil, la règle s'appliquait à un salon de coiffure de deux personnes alors que sa propre description citait un seuil. « Plus de cinquante » ⇒ 51, bornes incluses.\n\nAmendement 2026-08-25 (relecture Légifrance R. 4227-22, -34, -37, -39) : le champ de R. 4227-39 est celui de R. 4227-34 par double renvoi (39 → consigne 37 → établissements 34). Il est disjonctif — « plus de cinquante personnes […] ainsi que ceux, quelle que soit leur importance, où sont manipulées et mises en œuvre des matières inflammables mentionnées à l'article R. 4227-22 » — et compte les personnes « occupées ou réunies », public compris (R. 4227-38 3° distingue « les travailleurs et le public »). `effectifMin: 51` (salariés seuls) est remplacé par `personnesPresentesMin: 51` (personnes présentes, repli sur l'effectif salarié si non déclaré) et `champR422734: true` (branche matières R. 4227-22, déclarée par le dirigeant). Le déclencheur ALARME_INCENDIE reste une heuristique : l'alarme est une conséquence de R. 4227-34, pas sa condition.",
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
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006903389/",
      },
      {
        source: "CCH",
        reference: "CCH, art. R. 143-44 (ex R. 123-51) — ERP",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043819037/",
      },
      {
        source: "CCH",
        reference: "CCH, art. R. 146-35 (ex R. 122-29) — IGH",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043819153",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true },
    categoriesEquipement: ["EXTINCTEUR", "ALARME_INCENDIE"],
    notesInternes:
      "Obligation permanente (pas d'échéance périodique). Modélisée sur travail=true en MVP : en pratique tout établissement du scope V2 emploie au moins un salarié (L. 4711-5 CT). Les références CCH R. 143-44 (ERP) et R. 146-35 (IGH) restent citées pour information. Corrigé à l'audit 2026-08 : R. 146-21 était cité à tort — cet article traite du silence de l'administration sur une demande d'agrément et a été abrogé par le décret 2025-1100 ; le registre de sécurité IGH est à R. 146-35.",
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
        reference: "Arrêté du 25 juin 1980, art. MS 73 § 2",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000020317755/",
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
        reference: "Arrêté du 25 juin 1980, art. MS 73 § 2 (vérification annuelle)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000020317755/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee", "organisme_agree"],
    criticite: 5,
    typologies: { erp: true },
    categoriesEquipement: ["ALARME_INCENDIE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait un « arrêté du 2 mai 2005 (SSI) » ; ce texte régit le personnel SSIAP, pas les systèmes de sécurité incendie. Référence retirée.",
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
        reference: "Arrêté du 25 juin 1980, art. MS 73 § 2 (vérification triennale par organisme agréé des SSI de catégorie A ou B)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000020317755/",
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
      "L'éclairage de sécurité est vérifié dans les conditions de l'article EL 19, soit annuellement. À cela s'ajoutent les essais à la charge de l'exploitant : passage en position de fonctionnement et allumage des lampes une fois par mois, autonomie d'une heure une fois tous les six mois, consignés au registre de sécurité.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EC 15 (vérification dans les conditions de l'art. EL 19)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020317456/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EC 13 et EC 14 (entretien et essais périodiques par l'exploitant)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020317456/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { erp: true },
    categoriesEquipement: ["BAES"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : la périodicité annuelle vient d'EC 15 (renvoi à EL 19), non d'EC 14 qui fixe les essais mensuels et semestriels de l'exploitant. La description annonçait à tort des essais « à chaque jour d'exploitation ».",
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
      "Les robinets d'incendie armés, installations fixes de lutte contre l'incendie (MS 14 à MS 17), sont vérifiés au moins une fois par an en cours d'exploitation (MS 73 § 2), dans les conditions de la section II du chapitre Ier du titre Ier du règlement de sécurité.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. MS 73 (appareils et installations fixes)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000020317755/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { erp: true },
    categoriesEquipement: ["RIA", "EXTINCTEUR"],
    conditions: [
      {
        type: "equipement_propriete_non_infirmee",
        categorie: "EXTINCTEUR",
        propriete: "aRobinetsIncendieArmes",
      },
    ],
    notesInternes:
      "Amendement 2026-08-25 : la catégorie d'équipement `RIA` existe désormais (enum Prisma + migration 20260825130000). Un RIA déclaré déclenche l'obligation sans condition. La branche EXTINCTEUR bornée par `aRobinetsIncendieArmes` (forme non_infirmee, criticité 4) est TRANSITOIRE : elle protège les établissements existants qui ont répondu « oui » sur leurs extincteurs, jusqu'à la reprise de données (scripts/reprise-ria.ts) qui crée un équipement RIA à partir de chaque extincteur ainsi marqué. Critère de retrait de la branche : plus aucun équipement EXTINCTEUR ne porte la clé `aRobinetsIncendieArmes` en base — retirer alors « EXTINCTEUR » des catégories, la condition, et la question du formulaire. Un établissement qui aurait à la fois un extincteur « oui » et un RIA déclaré reçoit deux lignes d'ici là.\n\nSources relues ce jour : MS 73 § 2 (LEGIARTI000020317755) fonde la vérification annuelle des installations fixes ; MS 38 ne vise que les extincteurs et ne fonde pas les RIA ; MS 68 ne vise que le SSI. R. 4227-30 CT fonde la présence des RIA « si nécessaire » côté employeur, sans périodicité. En 5ᵉ catégorie, PE 4 § 2 (version au 01/07/2026) prévoit « tous les trois ans au plus » par techniciens compétents : l'annuelle est une sur-application assumée en N5, cohérente avec le traitement des extincteurs. La mention « contrôle visuel trimestriel » (norme NF S 62-201, non opposable) a été retirée.",
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
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000052644979/",
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
    conditions: [
      {
        type: "equipement_propriete_non_infirmee",
        categorie: "ALARME_INCENDIE",
        propriete: "dessertLocauxSommeil",
      },
    ],
    notesInternes:
      "Visite commissionnelle : n'est pas à la charge de l'exploitant au sens opérationnel (initiée par l'administration) mais est à tracer dans le registre. Échéance quinquennale en première approche.\n\nAmendement 2026-08 : la restriction « locaux à sommeil » figurait dans le libellé et la description mais n'était encodée nulle part — l'obligation tombait donc sur tout ERP de 5ᵉ catégorie déclarant une alarme, restaurants et commerces compris. Elle est désormais bornée par la propriété `dessertLocauxSommeil`.\n\nPourquoi une condition d'équipement et non une restriction `types` : la présence de locaux à sommeil est une caractéristique de l'établissement qui traverse les types (un bâtiment de type W peut comporter un logement de fonction, un type O n'est pas nécessairement de 5ᵉ catégorie). Encoder une liste de types équivaudrait à trancher, sans source article par article, quels types d'exploitation comportent des locaux à sommeil — ce que la règle n°6 interdit. Le libellé de l'obligation mentionne aussi les « installations spécifiques », second cas de visite périodique qui n'est pas modélisé : la condition ne couvre que la branche « locaux à sommeil ».\n\nForme `non_infirmee` (criticité 4, obligation déjà publiée) : les établissements existants gardent la ligne jusqu'à une réponse « non » explicite, plutôt que de la perdre en silence à la prochaine régénération.",
  },

  // ---------------------------------------------------------------------------
  // IGH
  // ---------------------------------------------------------------------------
  {
    id: "incendie-igh-moyens-secours-annuelle",
    domaine: "incendie",
    libelle: "Vérification annuelle des moyens de secours et SSI (IGH)",
    description:
      "Dans les immeubles de grande hauteur, le propriétaire fait vérifier annuellement par un organisme agréé les moyens de secours (art. GH 51 à GH 55), les scénarios et le fonctionnement du SSI, les dispositifs de sécurité, les interphones et télécommunications de sécurité. Le désenfumage mécanique est vérifié par cinquième chaque année (100 % en cinq ans).",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 30 décembre 2011 (règlement IGH), art. GH 5 (vérifications techniques par organismes agréés)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000025169258",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["organisme_agree"],
    criticite: 5,
    typologies: { igh: true },
    categoriesEquipement: ["ALARME_INCENDIE", "EXTINCTEUR", "DESENFUMAGE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait « GH 60 à GH 63 ». GH 60 traite de la surveillance, des exercices et de l'information des locataires. Les vérifications techniques périodiques sont à l'article GH 5.",
  },
];
