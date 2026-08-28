/**
 * Obligations réglementaires — Sécurité incendie (P1).
 *
 * Sources primaires :
 *   - Code du travail, articles R. 4227-28 à R. 4227-41 (lutte contre
 *     l'incendie, consignes, exercices) et L. 4711-5 (registre de sécurité).
 *   - Arrêté du 14 décembre 2011 relatif aux installations d'éclairage de
 *     sécurité, pris pour l'application de l'article R. 4227-14 du code du
 *     travail (conception, exploitation et maintenance en lieu de travail).
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
  // Porteur : l'établissement (ADR-022)
  // ---------------------------------------------------------------------------
  {
    id: "incendie-erp-pe4-entretien-installations-techniques",
    domaine: "incendie",
    libelle:
      "Entretien et vérification de l'ensemble des installations techniques (ERP 5ᵉ catégorie)",
    description:
      "Tous les trois ans au plus, l'exploitant procède ou fait procéder, par des techniciens compétents, aux opérations d'entretien et de vérification de l'ensemble des installations et équipements techniques de son établissement. L'obligation porte sur l'ensemble, avec une liste que le texte laisse ouverte : elle est due même si aucun équipement n'est déclaré dans l'outil.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. PE 4 § 2",
        article: "PE 4",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000024760269",
        versionConstatee: "2026-07-01",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. PE 2 § 3",
        article: "PE 2",
        url: "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020374770",
        versionConstatee: "2026-01-01",
      },
      {
        // C'est ce texte qui donne son rythme à l'article : avant lui, PE 4 § 2
        // n'imposait aucune périodicité en exploitation. Le citer n'est pas
        // décoratif — sans lui, « tous les trois ans » ne serait porté par
        // rien. Repris des deux fragments absorbés (ADR-022), qui le citaient.
        source: "ARRETE",
        reference:
          "Arrêté du 1er décembre 2025 modifiant le règlement de sécurité ERP (applicable au 1er juillet 2026)",
        article: "Arrêté 2025-12-01",
        url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053020948",
        versionConstatee: "2026-07-01",
      },
    ],
    periodicite: "triennale",
    // L'INTERSECTION, pas l'union — corrigé le 2026-08-27 après relecture.
    //
    // La première rédaction unissait les réalisateurs des deux fragments
    // absorbés, au motif de « ne rien retirer à l'utilisateur ». Le
    // raisonnement était faux dans un sens : `realisateurs` est une liste
    // d'intervenants ACCEPTÉS, donc une union prend l'exigence la plus BASSE
    // de chaque branche. Le fragment gaz n'admettait que
    // `personne_qualifiee` ou `organisme_agree` — une personne seulement
    // « compétente » n'était pas acceptable pour une installation de gaz en
    // ERP. L'union l'autorisait, sur une ligne de criticité 5.
    //
    // Entre sur-exiger visiblement et sous-exiger en silence, le référentiel
    // choisit partout la première (cf. les sur-applications assumées de ce
    // fichier). Un exploitant d'ERP N5 dont l'installation électrique était
    // jusqu'ici vérifiable par une personne compétente devra donc une
    // personne qualifiée — c'est une exigence de plus, pas une protection en
    // moins, et elle est écrite ici plutôt que subie.
    realisateurs: ["personne_qualifiee", "organisme_agree"],
    // 5, reprise de `cuisson-gaz-installations-triennale` : le tout absorbe
    // ses fragments, il doit donc en absorber la criticité la plus haute. La
    // rabaisser à 4 déclasserait dans le calendrier un contrôle d'installation
    // de gaz qui y figurait en tête.
    criticite: 5,
    transmet: [],
    // 5ᵉ catégorie SEULEMENT. `{ erp: true }` — la première rédaction — était
    // une sur-application : `evaluerErp` traite `true` comme « tout ERP » sans
    // regarder la catégorie, et un ERP de 2ᵉ catégorie recevait une ligne dont
    // le libellé dit « 5ᵉ catégorie ». PE 4 relève du Livre III, qui régit les
    // établissements du second groupe (PE 1 § 1) ; les quatre premières
    // catégories relèvent du Livre II et de ses propres articles de
    // vérification. Les deux fragments qui citent le même article portent la
    // même restriction (`electricite.ts`, `cuisson-hotte.ts`).
    typologies: { erp: { categories: ["N5"] } },
    porteur: "etablissement",
    equipementsEnContexte: [
      "INSTALLATION_ELECTRIQUE",
      "ALARME_INCENDIE",
      "DESENFUMAGE",
      "APPAREIL_CUISSON_ERP",
      "ASCENSEUR",
      "EXTINCTEUR",
      "RIA",
    ],
    notesInternes:
      "Porteur établissement (ADR-022) — c'est l'obligation qui a motivé le chantier.\n\nVersion relue sur Légifrance le 2026-08-27 : PE 4 est en vigueur dans sa rédaction du 2026-07-01 (arrêté du 1er décembre 2025). Le § 2 disait « En cours d'exploitation » ; il dit désormais « Tous les trois ans AU PLUS ». La périodicité triennale est donc écrite dans le texte, elle n'est plus déduite.\n\nChamp d'application, par renvoi : PE 2 § 3, dans sa version du 2026-01-01 (même arrêté), maintient « PE 4, PE 10 B, PE 24 § 1, PE 26 § 1 et PE 27 » pour les établissements recevant au plus 19 personnes. La rédaction antérieure ne maintenait que « PE 4 § 2 et § 3 ». Le champ s'est donc élargi, et l'argument tient a fortiori : l'obligation atteint les établissements qui ont le MOINS déclaré, ceux-là mêmes chez qui une décomposition par installation ne produirait aucune ligne.\n\n`equipementsEnContexte` n'est pas un déclencheur : ce sont les installations que le texte cite (« chauffage, éclairage, installations électriques, appareils de cuisson, circuits d'extraction, ascenseurs, moyens de secours »), affichées pour aider le dirigeant à voir ce qui est visé chez lui. Le texte finit par « etc. » — l'interface accompagne la liste de la mention « non limitative », et il ne faut pas la refermer.\n\nCe que cette ligne ne fait PAS : elle ne lève aucune des neuf sur-applications du Livre II — six ici, trois dans `electricite.ts`. Leurs notes annoncent « à reprendre lorsque le référentiel saura porter PE 4 § 2 » — le référentiel le sait désormais, mais savoir le porter n'est que la moitié de la condition. L'autre moitié est un point de droit, article par article : le Code du travail fonde-t-il chacune d'elles indépendamment du classement ERP ? Tant que cette relecture n'est pas faite sur Légifrance, retirer les lignes détruirait chez l'utilisateur des échéances dont on n'a pas établi qu'elles ne sont pas dues. Voir la note commune de ces neuf lignes.\n\nLe chapeau neuf de PE 4 (installations de gaz neuves ou modifiées, renvoi à PE 10 B, applicable au 2026-07-01) n'est pas encodé ici : c'est une vérification à la construction ou après travaux, pas une échéance récurrente. À instruire à part.",
  },
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
        article: "R. 4227-28",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532081/",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-29",
        article: "R. 4227-29",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018489127/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["personne_qualifiee", "personne_competente"],
    criticite: 5,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["EXTINCTEUR"],
    notesInternes:
      "AMENDEMENT 2026-08-27, audit systématique des périodicités sans source porteuse. L'obligation affichait une échéance ANNUELLE en ne citant que R. 4227-28 et R. 4227-29. Section R. 4227-28 à R. 4227-41 relue à la source : AUCUN de ces articles ne fixe de périodicité annuelle, pour quoi que ce soit. La seule périodicité de toute la section est celle de R. 4227-39, « au moins tous les six mois », et elle porte sur les exercices et essais, pas sur les extincteurs. R. 4227-29 dit « maintenus en bon état de fonctionnement » — une obligation d'ÉTAT, sans rythme.\n\nLa vérification annuelle des extincteurs existe bien, mais elle vient de la norme NF S 61-919 et des contrats de maintenance, pas du Code du travail. Une norme n'est pas opposable par elle-même. C'est le même motif que la règle APSAD R4 retirée en août.\n\n`periodicite` passe à `autre` : l'obligation reste, parce que doter l'établissement de moyens de lutte et les maintenir en état est bien exigé, mais le produit cesse d'afficher une date que le droit ne donne pas. Les ERP ne perdent rien : `incendie-erp-extincteurs-annuelle` porte l'annuelle pour eux, fondée sur MS 73.",
  },
  {
    id: "incendie-travail-consigne-affichee",
    relectureDue: {
      le: "2027-01-01",
      motif:
        "R. 4227-37 porte une version future au 1er janvier 2027 (décret n° 2025-1100, art. 3), dans le cadre du transfert des dispositions « bâtiments à usage professionnel » vers le CCH. Le champ d'application de la consigne — et donc celui des exercices de R. 4227-39, qui en dépend par renvoi — peut en être modifié. Relire R. 4227-37, R. 4227-34, et les articles R. 144-16 et R. 144-17 créés à la même date.",
    },
    domaine: "incendie",
    libelle: "Consigne de sécurité incendie établie et affichée",
    description:
      "Dans les établissements mentionnés à l'article R. 4227-34 (plus de cinquante personnes occupées ou réunies habituellement, ou manipulation de matières visées par R. 4227-22, quel que soit l'effectif), une consigne de sécurité incendie est établie et affichée de manière très apparente : dans chaque local de plus de cinq personnes et dans les locaux à matières inflammables, sinon dans chaque local ou dégagement desservant un groupe de locaux. Elle indique le matériel d'extinction et de secours, les personnes chargées de l'activer, de diriger l'évacuation des travailleurs et du public, les mesures pour les personnes handicapées, les moyens d'alerte, les personnes chargées d'aviser les sapeurs-pompiers, l'adresse et le numéro du service de secours (R. 4227-38). Les autres établissements établissent de simples instructions d'évacuation.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-37 et R. 4227-38",
        article: "R. 4227-37",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000024769379/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    transmet: [],
    typologies: { travail: true, personnesPresentesMin: 51, champR422734: true },
    categoriesEquipement: ["EXTINCTEUR", "ALARME_INCENDIE"],
    notesInternes:
      "Amendement 2026-08-25 (relecture Légifrance R. 4227-34, -37, -38) : la consigne affichée n'est due que dans les établissements de R. 4227-34, par renvoi exprès de R. 4227-37 ; hors de ce champ le texte ne demande que des « instructions » d'évacuation. L'obligation était encodée sans seuil (sur-application à tout employeur) et sa description exigeait une « mise à jour à chaque changement notable » qui ne figure dans aucun des deux articles — retirée. La périodicité annuelle est une convention de rappel, aucun texte ne fixe de périodicité à la consigne. R. 4227-37 porte une version future au 01/01/2027 : à relire à cette date.\n\nAMENDEMENT 2026-08-27, même audit. L'obligation affichait une échéance ANNUELLE en ne citant que R. 4227-37, qui ne porte aucune périodicité — vérifié sur toute la section. Aucun texte n'impose de réafficher ou de réviser la consigne chaque année.\n\n`periodicite` passe à `autre`. L'affichage de la consigne est une obligation PERMANENTE, pas une échéance : elle est due tant que l'établissement entre dans le champ de R. 4227-34, et elle se met à jour quand l'organisation change — pas à date fixe. Ce qui est bien périodique, dans la même sous-section, ce sont les exercices et essais semestriels de R. 4227-39, portés par `incendie-travail-exercice-semestriel`.",
  },
  {
    id: "incendie-travail-exercice-semestriel",
    relectureDue: {
      le: "2027-01-01",
      motif:
        "Cette obligation ne porte pas son champ : elle le tient de la consigne de R. 4227-37, qui le tient lui-même de R. 4227-34. Or R. 4227-37 affiche « Version en vigueur du 10/11/2011 au 01/01/2027 » — son terme emporte donc le champ des exercices. Relire R. 4227-37 dans sa version au 1er janvier 2027, puis vérifier si `personnesPresentesMin: 51` et `champR422734` restent la bonne traduction. Relire aussi R. 4227-2, second article du chapitre VII à porter un terme à cette date, et absent du référentiel.",
    },
    domaine: "incendie",
    libelle: "Essais du matériel et exercices d'évacuation semestriels",
    description:
      "Dans les établissements mentionnés à l'article R. 4227-34 — plus de cinquante personnes occupées ou réunies habituellement (public compris), ou manipulation et mise en œuvre de matières visées par R. 4227-22 quel que soit l'effectif —, la consigne de sécurité incendie prévoit des essais et visites périodiques du matériel et des exercices au cours desquels les travailleurs apprennent à reconnaître le signal sonore d'alarme générale, à localiser et utiliser les espaces d'attente sécurisés, à se servir des moyens de premier secours et à exécuter les manœuvres nécessaires. Ces exercices et essais ont lieu au moins tous les six mois ; leur date et leurs observations sont consignées sur un registre tenu à la disposition de l'inspection du travail.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-39",
        article: "R. 4227-39",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000024769386/",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-34",
        article: "R. 4227-34",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532067/",
        note: "Article qui pose le seuil : établissements où peuvent se trouver occupées ou réunies habituellement plus de cinquante personnes, ainsi que ceux, quelle que soit leur importance, où sont manipulées et mises en œuvre des matières inflammables.",
      },
    ],
    periodicite: "semestrielle",
    realisateurs: ["exploitant"],
    criticite: 4,
    transmet: [
      {
        vers: "modele_absent",
        modele: "ExerciceSecurite",
        motif:
          "R. 4227-39 impose que la date et les observations des exercices soient consignées sur un registre. Le produit ouvre bien l'échéance, mais ne sait la solder que par un dépôt de fichier — là où le texte attend un formulaire. Manque recensé priorité 1 par docs/registre-securite-ecart.md § 3.2.",
      },
    ],
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
      "En établissement recevant du public, le registre de sécurité porte les renseignements indispensables à la bonne marche du service de sécurité et comprend, outre les pièces attendues aux articles R. 141-10 et R. 141-11 : les dates des travaux d'aménagement et de transformation, leur nature et les noms des entrepreneurs ; l'état nominatif et hiérarchique des personnes appartenant au service de sécurité ; les diverses consignes établies en cas d'incendie, y compris les consignes d'évacuation prenant en compte les différents types de handicap ; les dates des divers contrôles et vérifications ainsi que les observations auxquelles ceux-ci ont donné lieu ; les dates des exercices de sécurité incendie. Côté Code du travail, la date des essais et exercices périodiques et les observations auxquelles ils ont donné lieu sont consignées sur un registre tenu à la disposition de l'inspection du travail.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-39",
        article: "R. 4227-39",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000024769386",
        note: "Consignation sur registre des essais et exercices périodiques, avec leur date et les observations auxquelles ils ont donné lieu.",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "L. 4711-5",
        article: "L. 4711-5",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006903389/",
      },
      {
        source: "CCH",
        reference: "CCH, art. R. 143-44 (ex R. 123-51) — ERP",
        article: "CCH R. 143-44",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043819037/",
        note: "Version en vigueur depuis le 1er juillet 2026 (décret n° 2025-1100 du 19 novembre 2025) : ajout du 5° sur les dates des exercices de sécurité incendie, et renvoi aux articles R. 141-10 et R. 141-11. Vise « les établissements soumis aux prescriptions du présent chapitre » — tous les ERP, 5e catégorie comprise.",
        versionConstatee: "2026-07-01",
      },
      {
        source: "CCH",
        reference: "CCH, art. R. 141-10 — contenu du registre",
        article: "CCH R. 141-10",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000043818891/",
        note: "Créé au 1er juillet 2026. Le registre « comprend en particulier les vérifications réalisées, les mesures de correction des écarts constatés ainsi que les diverses consignes établies en cas d'incendie, y compris concernant l'évacuation et la mise en sécurité des personnes ».",
        versionConstatee: "2026-07-01",
      },
      {
        source: "CCH",
        reference: "CCH, art. R. 141-11 — solutions d'effet équivalent",
        article: "CCH R. 141-11",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000043818891/",
        note: "Créé au 1er juillet 2026. Les éléments identifiant une solution d'effet équivalent sont annexés au registre. Sans objet pour un établissement qui n'en met aucune en œuvre.",
        versionConstatee: "2026-07-01",
      },
      {
        source: "CCH",
        reference: "CCH, art. R. 146-35 (ex R. 122-29) — IGH",
        article: "CCH R. 146-35",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043819153",
        versionConstatee: "2026-07-01",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    transmet: [],
    typologies: { travail: true, erp: true },
    categoriesEquipement: ["EXTINCTEUR", "ALARME_INCENDIE"],
    notesInternes:
      "Obligation permanente (pas d'échéance périodique). Modélisée sur travail=true en MVP : en pratique tout établissement du scope V2 emploie au moins un salarié (L. 4711-5 CT). Les références CCH R. 143-44 (ERP) et R. 146-35 (IGH) restent citées pour information. Corrigé à l'audit 2026-08 : R. 146-21 était cité à tort — cet article traite du silence de l'administration sur une demande d'agrément et a été abrogé par le décret 2025-1100 ; le registre de sécurité IGH est à R. 146-35.\n\nLIMITE CONNUE, NON CORRIGÉE ICI — restaurée le 2026-08-27. Cette note a été écrite le 2026-08-26 (commit 7736869) et perdue : un rebase a laissé ce commit derrière, et sa rapatriation partielle n'en a rien repris ici. Elle disait, et c'était juste : `categoriesEquipement` ancre cette obligation à un extincteur ou une alarme DÉCLARÉS. Un établissement qui n'a déclaré ni l'un ni l'autre ne reçoit AUCUNE ligne « tenue du registre », alors que le registre est dû sans condition d'équipement. Même cause pour `incendie-travail-exercice-semestriel`, ancrée sur ALARME_INCENDIE.\n\nCe qui a changé depuis : la note concluait que corriger ce faux négatif « suppose de rendre le calendrier capable de porter une obligation sans équipement — décision de schéma, à instruire séparément ». C'est fait (ADR-022). Le modèle ne bloque plus ; ces deux obligations peuvent passer au porteur établissement. Elles ne l'ont PAS été dans ce lot, tenu aux deux articles dont le verbatim était relevé en première main (PE 4 § 2, R. 4222-20). C'est le lot suivant, et il est court.\n\nAUTRE PERTE DU MÊME REBASE, non réparée ici et signalée pour qu'elle ne se reperde pas : le commit 7736869 portait aussi trois corrections réglementaires à cette obligation, relevées sur Légifrance le 2026-08-26. (1) R. 143-44 a été RÉÉCRIT au 1er juillet 2026 par le décret n° 2025-1100 ; la description ci-dessus reprend la version antérieure et ignore le 5° (dates des exercices de sécurité incendie) ainsi que le renvoi aux articles R. 141-10 et R. 141-11. (2) `typologies` devait gagner `erp: true` : R. 143-44 fonde le registre en ERP par lui-même, indépendamment de la qualité d'employeur. (3) R. 146-35 (IGH) reste cité sans `igh: true` parce que l'IGH est hors périmètre, non parce que la référence serait décorative. Réparer ces trois points modifie le champ d'application d'une obligation en production : c'est une relecture réglementaire, pas un effet de bord du chantier du porteur.",
  },

  // ---------------------------------------------------------------------------
  // Travail — Éclairage de sécurité (R. 4227-14 CT / arrêté du 14 déc. 2011)
  //
  // Les deux obligations qui suivent sont les deux fréquences distinctes que
  // pose l'article 11 de l'arrêté : un essai de fonctionnement mensuel et une
  // vérification semestrielle de l'autonomie. Elles ne sont PAS absorbées par
  // la vérification périodique annuelle des installations électriques
  // (R. 4226-16 CT / arrêté du 26 décembre 2011) : l'article 11 les rattache
  // expressément à la *maintenance* de l'article R. 4226-7, acte distinct de
  // la vérification périodique, et les fait porter par l'employeur lui-même.
  // Seul le registre est commun (R. 4226-19).
  // ---------------------------------------------------------------------------
  {
    id: "incendie-travail-eclairage-securite-essai-mensuel",
    domaine: "incendie",
    libelle: "Essai mensuel de l'éclairage de sécurité (lieu de travail)",
    description:
      "Une fois par mois, l'employeur vérifie le passage à la position de fonctionnement en cas de défaillance de l'alimentation normale et l'allumage de toutes les lampes, ainsi que l'efficacité de la commande de mise en position de repos à distance et de la remise automatique en position de veille au retour de l'alimentation normale. Le résultat est porté au registre. Sur une installation constituée de blocs autonomes à système automatique de test intégré (SATI), ces opérations peuvent être effectuées automatiquement.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 14 décembre 2011, art. 11",
        article: "Arrêté 2011-12-14 art. 11",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000025072657",
        note: "« Dans le cadre de la maintenance prescrite à l'article R. 4226-7 du code du travail, l'employeur procède aux vérifications de fonctionnement périodiques suivantes : Une fois par mois : a) Du passage à la position de fonctionnement en cas de défaillance de l'alimentation normale et de l'allumage de toutes les lampes […] ; b) De l'efficacité de la commande de mise en position de repos à distance et de la remise automatique en position de veille au retour de l'alimentation normale. »",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-14",
        article: "R. 4227-14",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022764985",
        note: "Fonde l'obligation d'éclairage de sécurité en lieu de travail et renvoie à un arrêté le soin de fixer « les conditions d'exploitation et de maintenance de cet éclairage ». Ne fixe lui-même aucune périodicité : c'est l'arrêté du 14 décembre 2011 qui la pose.",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4226-19",
        article: "R. 4226-19",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022765064/",
        note: "Registre sur lequel l'article 11 de l'arrêté fait porter le résultat des opérations. Support de consignation, pas fondement de la périodicité.",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 14 décembre 2011, art. 1er",
        article: "Arrêté 2011-12-14 art. 1",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000025072663",
        note: "Fonde le `erp: false` : « Dans les établissements recevant du public, pour les locaux dont la fonction essentielle est de recevoir du public et pour les dégagements accessibles au public, les dispositions du règlement de sécurité relatif à de tels établissements sont seules applicables à l'éclairage de sécurité de ces locaux ou dégagements. » Texte relu le 23 août 2026.",
      },
    ],
    periodicite: "mensuelle",
    realisateurs: ["exploitant"],
    criticite: 3,
    transmet: [],
    typologies: { travail: true, erp: false },
    categoriesEquipement: ["BAES"],
    notesInternes:
      "Ajoutée 2026-08 : le pré-remplissage suggérait un BAES à tout bureau tertiaire alors que la seule obligation visant la catégorie BAES était `incendie-erp-baes-annuelle` (erp: true). Un employeur non-ERP déclarait donc l'équipement que l'outil venait de lui conseiller et n'obtenait aucune échéance. `erp: false` **est** une lecture du texte, et non un choix de modélisation comme cette note l'a d'abord affirmé : l'article 1er, alinéa 2, de l'arrêté dit que « dans les établissements recevant du public, pour les locaux dont la fonction essentielle est de recevoir du public et pour les dégagements accessibles au public, les dispositions du règlement de sécurité relatif à de tels établissements sont seules applicables ». Le pendant ERP existe désormais, adossé à EC 14 § 3 (`incendie-erp-eclairage-securite-essai-mensuel` et `-autonomie-semestrielle`) : il porte les mêmes deux fréquences, la note qui parlait d'un « relais » par la seule vérification annuelle était fausse. Deux limites assumées. D'abord, les locaux d'un ERP non accessibles au public (réserves, bureaux) relèvent bien de l'arrêté du 14 décembre 2011, ce que le modèle — qui raisonne par établissement et non par local — ne sait pas exprimer ; les fréquences étant désormais identiques des deux côtés, l'écart est sans effet sur le calendrier. Ensuite, l'alinéa 3 du même article soumet les cantines, restaurants et salles de réunion à la réglementation ERP « lorsque celle-ci s'avère plus contraignante » : une règle comparative, local par local, hors de portée du modèle. Enfin l'exception SATI de l'article 11 n'est pas encodée en condition : aucune propriété d'équipement ne porte encore la question.",
  },
  {
    id: "incendie-travail-eclairage-securite-autonomie-semestrielle",
    domaine: "incendie",
    libelle: "Vérification semestrielle de l'autonomie de l'éclairage de sécurité (lieu de travail)",
    description:
      "Une fois tous les six mois, l'employeur vérifie l'autonomie d'au moins une heure de l'éclairage de sécurité. Dans les établissements comportant des périodes de fermeture, l'opération est conduite de telle manière qu'au début de chaque période d'ouverture l'installation ait retrouvé l'autonomie prescrite. Le résultat est porté au registre.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 14 décembre 2011, art. 11",
        article: "Arrêté 2011-12-14 art. 11",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000025072657",
        note: "« Une fois tous les six mois, de l'autonomie d'au moins une heure. Dans les établissements comportant des périodes de fermeture, ces opérations doivent être effectuées de telle manière qu'au début de chaque période d'ouverture l'installation d'éclairage ait retrouvé l'autonomie prescrite. »",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-14",
        article: "R. 4227-14",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022764985",
        note: "Fonde l'obligation d'éclairage de sécurité en lieu de travail et renvoie à un arrêté le soin de fixer « les conditions d'exploitation et de maintenance de cet éclairage ». Ne fixe lui-même aucune périodicité : c'est l'arrêté du 14 décembre 2011 qui la pose.",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4226-19",
        article: "R. 4226-19",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022765064/",
        note: "Registre sur lequel l'article 11 de l'arrêté fait porter le résultat des opérations. Support de consignation, pas fondement de la périodicité.",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 14 décembre 2011, art. 1er",
        article: "Arrêté 2011-12-14 art. 1",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000025072663",
        note: "Fonde le `erp: false` : « Dans les établissements recevant du public, pour les locaux dont la fonction essentielle est de recevoir du public et pour les dégagements accessibles au public, les dispositions du règlement de sécurité relatif à de tels établissements sont seules applicables à l'éclairage de sécurité de ces locaux ou dégagements. » Texte relu le 23 août 2026.",
      },
    ],
    periodicite: "semestrielle",
    realisateurs: ["exploitant"],
    criticite: 4,
    transmet: [],
    typologies: { travail: true, erp: false },
    categoriesEquipement: ["BAES"],
    notesInternes:
      "Même fondement et même choix de typologie que `incendie-travail-eclairage-securite-essai-mensuel` : voir ses notes internes. Les deux périodicités de l'article 11 sont scindées en deux obligations parce que le modèle ne porte qu'une périodicité par obligation, et parce qu'il s'agit bien de deux actes distincts (contrôle visuel d'allumage / décharge complète sur batterie).",
  },

  // ---------------------------------------------------------------------------
  // ERP — Éclairage de sécurité : ce que l'exploitant s'assure lui-même
  //
  // Symétriques exactes des deux obligations « travail » ci-dessus, et pour
  // cause : l'arrêté du 25 juin 1980 impose à l'exploitant d'ERP les mêmes
  // deux fréquences que l'arrêté du 14 décembre 2011 impose à l'employeur —
  // un essai mensuel, un contrôle semestriel de l'autonomie.
  //
  // Elles manquaient. L'article 1er de l'arrêté de 2011 réserve les parties
  // publiques d'un ERP au seul règlement de sécurité ERP, ce que le
  // référentiel traduit par `erp: false` sur les deux obligations « travail ».
  // Faute d'équivalent ERP, un restaurant ou un commerce — les deux secteurs
  // que ce produit vise — ne recevait qu'une ligne annuelle : quatorze actes
  // par an remplacés par un seul.
  //
  // Aucun risque de double compte : `erp: false` est une exclusion en ET
  // (cf. `matchTypologie`), donc un établissement ERP ne peut pas prendre les
  // deux jeux. La partition est exacte — ERP d'un côté, employeur non-ERP de
  // l'autre.
  // ---------------------------------------------------------------------------
  {
    id: "incendie-erp-eclairage-securite-essai-mensuel",
    domaine: "incendie",
    libelle: "Essai mensuel de l'éclairage de sécurité (ERP)",
    description:
      "Une fois par mois, l'exploitant s'assure du passage à la position de fonctionnement en cas de défaillance de l'alimentation normale et de l'allumage de toutes les lampes, ainsi que de l'efficacité de la commande de mise en position de repos à distance et de la remise automatique en position de veille au retour de l'alimentation normale. Le résultat est consigné au registre de sécurité. Sur une installation constituée de blocs autonomes à système automatique de test intégré (SATI), ces opérations peuvent être effectuées automatiquement.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EC 14 § 3",
        article: "EC 14",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000021838315",
        note: "« L'exploitant s'assure périodiquement : — une fois par mois : — du passage à la position de fonctionnement en cas de défaillance de l'alimentation normale et à la vérification de l'allumage de toutes les lampes (le fonctionnement doit être strictement limité au temps nécessaire au contrôle visuel) ; — de l'efficacité de la commande de mise en position de repos à distance et de la remise automatique en position de veille au retour de l'alimentation normale. — une fois tous les six mois, de l'autonomie d'au moins 1 heure. » Version en vigueur depuis le 16 mai 2010, modifiée par l'arrêté du 11 décembre 2009. Texte relu le 23 août 2026.",
      },
    ],
    periodicite: "mensuelle",
    realisateurs: ["exploitant"],
    criticite: 3,
    transmet: [],
    typologies: { erp: true },
    categoriesEquipement: ["BAES"],
    notesInternes:
      "Ajoutée 2026-08 après lecture du texte : EC 14 § 3 impose à l'exploitant d'ERP exactement les deux fréquences de l'article 11 de l'arrêté du 14 décembre 2011. La note de `incendie-travail-eclairage-securite-essai-mensuel` affirmait que `incendie-erp-baes-annuelle` « prenait le relais » — un relais qui remplaçait quatorze actes annuels par un seul. L'exception SATI (NF C 71-820, mai 1999) n'est pas encodée en condition : aucune propriété d'équipement ne porte encore la question, ici comme du côté travail.\n\nSur-application assumée en 5ᵉ catégorie (constatée 2026-08-26, dépouillement du Livre III). L'article cité relève du Livre II du règlement de sécurité — « Dispositions applicables aux établissements des quatre premières catégories » — et PE 1 § 1 dispose que « les dispositions du livre II ne sont pas applicables sauf celles relevant d'articles expressément mentionnés dans la suite du présent livre ». Le Livre III a été dépouillé article par article : PE 26 n'ouvre le Livre II que sur MS 39, PE 27 que sur MS 70, ni l'un ni l'autre n'étant un article de vérification. L'article cité ne fonde donc PAS cette obligation en N5. Ce qui la fonde en N5 est PE 4 § 2 — « tous les trois ans au plus », par techniciens compétents — et, chez un employeur, le Code du travail, qui s'applique indépendamment du classement ERP. La ligne est MAINTENUE volontairement : la retirer créerait un faux négatif muet chez 100 % des utilisateurs, alors qu'une sur-application visible et documentée reste corrigeable. À reprendre lorsque le référentiel saura porter PE 4 § 2, dont le porteur est l'établissement et non un équipement.\n\nÉtat au 2026-08-27 (ADR-022) : le référentiel sait désormais le porter — `incendie-erp-pe4-entretien-installations-techniques` existe, portée par l'établissement, triennale, et elle atteint tous les ERP y compris ceux qui n'ont rien déclaré. La condition annoncée ci-dessus est donc à moitié levée, et à moitié seulement. Ce qui manque est un point de DROIT, pas de modèle : cette ligne-ci n'est pas seulement fondée sur le Livre II, sa note dit qu'elle l'est aussi, chez un employeur, sur le Code du travail — lequel s'applique indépendamment du classement ERP. Tant que cela n'a pas été vérifié article par article sur Légifrance, retirer la ligne supprimerait chez l'utilisateur une échéance dont on n'a PAS établi qu'elle n'est pas due, et le ferait en silence : sans rapport ni action attachés, la réconciliation la supprime physiquement (ADR-012). La relecture réglementaire de ces six lignes est un chantier distinct, à mener avec la skill de veille ; ce n'est pas un effet de bord du chantier du porteur.",
  },
  {
    id: "incendie-erp-eclairage-securite-autonomie-semestrielle",
    domaine: "incendie",
    libelle: "Vérification semestrielle de l'autonomie de l'éclairage de sécurité (ERP)",
    description:
      "Une fois tous les six mois, l'exploitant s'assure de l'autonomie d'au moins une heure de l'éclairage de sécurité. Dans les établissements comportant des périodes de fermeture, l'opération est conduite de telle manière qu'au début de chaque période d'ouverture au public l'installation ait retrouvé l'autonomie prescrite. Le résultat est consigné au registre de sécurité.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EC 14 § 3",
        article: "EC 14",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000021838315",
        note: "« L'exploitant s'assure périodiquement : — une fois par mois : — du passage à la position de fonctionnement en cas de défaillance de l'alimentation normale et à la vérification de l'allumage de toutes les lampes (le fonctionnement doit être strictement limité au temps nécessaire au contrôle visuel) ; — de l'efficacité de la commande de mise en position de repos à distance et de la remise automatique en position de veille au retour de l'alimentation normale. — une fois tous les six mois, de l'autonomie d'au moins 1 heure. » Version en vigueur depuis le 16 mai 2010, modifiée par l'arrêté du 11 décembre 2009. Texte relu le 23 août 2026.",
      },
    ],
    periodicite: "semestrielle",
    realisateurs: ["exploitant"],
    criticite: 4,
    transmet: [],
    typologies: { erp: true },
    categoriesEquipement: ["BAES"],
    notesInternes:
      "Même fondement et même partition que `incendie-erp-eclairage-securite-essai-mensuel` : voir ses notes internes. Les deux périodicités d'EC 14 § 3 sont scindées en deux obligations pour la même raison que du côté travail — le modèle ne porte qu'une périodicité par obligation, et il s'agit de deux actes distincts (contrôle visuel d'allumage / décharge complète sur batterie).\n\nSur-application assumée en 5ᵉ catégorie (constatée 2026-08-26, dépouillement du Livre III). L'article cité relève du Livre II du règlement de sécurité — « Dispositions applicables aux établissements des quatre premières catégories » — et PE 1 § 1 dispose que « les dispositions du livre II ne sont pas applicables sauf celles relevant d'articles expressément mentionnés dans la suite du présent livre ». Le Livre III a été dépouillé article par article : PE 26 n'ouvre le Livre II que sur MS 39, PE 27 que sur MS 70, ni l'un ni l'autre n'étant un article de vérification. L'article cité ne fonde donc PAS cette obligation en N5. Ce qui la fonde en N5 est PE 4 § 2 — « tous les trois ans au plus », par techniciens compétents — et, chez un employeur, le Code du travail, qui s'applique indépendamment du classement ERP. La ligne est MAINTENUE volontairement : la retirer créerait un faux négatif muet chez 100 % des utilisateurs, alors qu'une sur-application visible et documentée reste corrigeable. À reprendre lorsque le référentiel saura porter PE 4 § 2, dont le porteur est l'établissement et non un équipement.\n\nÉtat au 2026-08-27 (ADR-022) : le référentiel sait désormais le porter — `incendie-erp-pe4-entretien-installations-techniques` existe, portée par l'établissement, triennale, et elle atteint tous les ERP y compris ceux qui n'ont rien déclaré. La condition annoncée ci-dessus est donc à moitié levée, et à moitié seulement. Ce qui manque est un point de DROIT, pas de modèle : cette ligne-ci n'est pas seulement fondée sur le Livre II, sa note dit qu'elle l'est aussi, chez un employeur, sur le Code du travail — lequel s'applique indépendamment du classement ERP. Tant que cela n'a pas été vérifié article par article sur Légifrance, retirer la ligne supprimerait chez l'utilisateur une échéance dont on n'a PAS établi qu'elle n'est pas due, et le ferait en silence : sans rapport ni action attachés, la réconciliation la supprime physiquement (ADR-012). La relecture réglementaire de ces six lignes est un chantier distinct, à mener avec la skill de veille ; ce n'est pas un effet de bord du chantier du porteur.",
  },

  // ---------------------------------------------------------------------------
  // ERP — Moyens de secours (MS)
  // ---------------------------------------------------------------------------
  {
    id: "incendie-erp-extincteurs-annuelle",
    domaine: "incendie",
    libelle: "Vérification annuelle des extincteurs (ERP)",
    description:
      "Un extincteur fait l'objet d'une vérification annuelle et d'une révision tous les dix ans, par une personne ou un organisme compétent. L'appareil porte une étiquette identifiable apposée par le vérificateur, indiquant l'année et le mois des vérifications. Un plan d'implantation des extincteurs et un relevé des vérifications sont portés au registre de sécurité.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. MS 38 § 4",
        article: "MS 38",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000020303557/LEGISCTA000020317639/",
        note: "« Un extincteur doit faire l'objet d'une vérification annuelle et d'une révision tous les dix ans par une personne ou un organisme compétent. Il doit être marqué d'une étiquette clairement identifiable apposée par la personne ou l'organisme ayant réalisé cette dernière. Les années et les mois des vérifications doivent apparaître sur l'étiquette. Un plan d'implantation des extincteurs et un relevé des vérifications doivent être portés au registre de sécurité. » Le § 2 traite du marquage de l'appareil, pas de sa vérification : il était cité à tort.",
        versionConstatee: "2008-10-08",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. MS 73 § 2",
        article: "MS 73",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000020317755/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee", "organisme_agree"],
    criticite: 5,
    transmet: [],
    typologies: { erp: true },
    categoriesEquipement: ["EXTINCTEUR"],
    notesInternes:
      "Sur-application assumée en 5ᵉ catégorie (constatée 2026-08-26, dépouillement du Livre III). L'article cité relève du Livre II du règlement de sécurité — « Dispositions applicables aux établissements des quatre premières catégories » — et PE 1 § 1 dispose que « les dispositions du livre II ne sont pas applicables sauf celles relevant d'articles expressément mentionnés dans la suite du présent livre ». Le Livre III a été dépouillé article par article : PE 26 n'ouvre le Livre II que sur MS 39, PE 27 que sur MS 70, ni l'un ni l'autre n'étant un article de vérification. L'article cité ne fonde donc PAS cette obligation en N5. Ce qui la fonde en N5 est PE 4 § 2 — « tous les trois ans au plus », par techniciens compétents — et, chez un employeur, le Code du travail, qui s'applique indépendamment du classement ERP. La ligne est MAINTENUE volontairement : la retirer créerait un faux négatif muet chez 100 % des utilisateurs, alors qu'une sur-application visible et documentée reste corrigeable. À reprendre lorsque le référentiel saura porter PE 4 § 2, dont le porteur est l'établissement et non un équipement.\n\nÉtat au 2026-08-27 (ADR-022) : le référentiel sait désormais le porter — `incendie-erp-pe4-entretien-installations-techniques` existe, portée par l'établissement, triennale, et elle atteint tous les ERP y compris ceux qui n'ont rien déclaré. La condition annoncée ci-dessus est donc à moitié levée, et à moitié seulement. Ce qui manque est un point de DROIT, pas de modèle : cette ligne-ci n'est pas seulement fondée sur le Livre II, sa note dit qu'elle l'est aussi, chez un employeur, sur le Code du travail — lequel s'applique indépendamment du classement ERP. Tant que cela n'a pas été vérifié article par article sur Légifrance, retirer la ligne supprimerait chez l'utilisateur une échéance dont on n'a PAS établi qu'elle n'est pas due, et le ferait en silence : sans rapport ni action attachés, la réconciliation la supprime physiquement (ADR-012). La relecture réglementaire de ces six lignes est un chantier distinct, à mener avec la skill de veille ; ce n'est pas un effet de bord du chantier du porteur."
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
        article: "MS 73",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000020317755/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee", "organisme_agree"],
    criticite: 5,
    transmet: [],
    typologies: { erp: true },
    categoriesEquipement: ["ALARME_INCENDIE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait un « arrêté du 2 mai 2005 (SSI) » ; ce texte régit le personnel SSIAP, pas les systèmes de sécurité incendie. Référence retirée.\n\nSur-application assumée en 5ᵉ catégorie (constatée 2026-08-26, dépouillement du Livre III). L'article cité relève du Livre II du règlement de sécurité — « Dispositions applicables aux établissements des quatre premières catégories » — et PE 1 § 1 dispose que « les dispositions du livre II ne sont pas applicables sauf celles relevant d'articles expressément mentionnés dans la suite du présent livre ». Le Livre III a été dépouillé article par article : PE 26 n'ouvre le Livre II que sur MS 39, PE 27 que sur MS 70, ni l'un ni l'autre n'étant un article de vérification. L'article cité ne fonde donc PAS cette obligation en N5. Ce qui la fonde en N5 est PE 4 § 2 — « tous les trois ans au plus », par techniciens compétents — et, chez un employeur, le Code du travail, qui s'applique indépendamment du classement ERP. La ligne est MAINTENUE volontairement : la retirer créerait un faux négatif muet chez 100 % des utilisateurs, alors qu'une sur-application visible et documentée reste corrigeable. À reprendre lorsque le référentiel saura porter PE 4 § 2, dont le porteur est l'établissement et non un équipement.\n\nÉtat au 2026-08-27 (ADR-022) : le référentiel sait désormais le porter — `incendie-erp-pe4-entretien-installations-techniques` existe, portée par l'établissement, triennale, et elle atteint tous les ERP y compris ceux qui n'ont rien déclaré. La condition annoncée ci-dessus est donc à moitié levée, et à moitié seulement. Ce qui manque est un point de DROIT, pas de modèle : cette ligne-ci n'est pas seulement fondée sur le Livre II, sa note dit qu'elle l'est aussi, chez un employeur, sur le Code du travail — lequel s'applique indépendamment du classement ERP. Tant que cela n'a pas été vérifié article par article sur Légifrance, retirer la ligne supprimerait chez l'utilisateur une échéance dont on n'a PAS établi qu'elle n'est pas due, et le ferait en silence : sans rapport ni action attachés, la réconciliation la supprime physiquement (ADR-012). La relecture réglementaire de ces six lignes est un chantier distinct, à mener avec la skill de veille ; ce n'est pas un effet de bord du chantier du porteur.",
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
        article: "MS 73",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000020317755/",
      },
    ],
    periodicite: "triennale",
    realisateurs: ["organisme_agree"],
    criticite: 4,
    transmet: [],
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
      "L'éclairage de sécurité (blocs autonomes d'éclairage de sécurité et source centrale) est vérifié annuellement par un technicien compétent. Les essais que l'exploitant conduit lui-même — mensuel et semestriel — font l'objet de leurs propres échéances.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EC 15",
        article: "EC 15",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000020317463",
        note: "« Vérifications. — Les installations d'éclairage doivent être vérifiées dans les conditions de l'article EL 19. » Version en vigueur depuis le 15 août 1980. EC 15 ne fixe donc aucune périodicité : il renvoie, et c'est EL 19 qui porte les conditions. Texte relu le 23 août 2026.",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EL 19",
        article: "EL 19",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000021231068",
        note: "Article de destination du renvoi d'EC 15 : c'est lui qui pose les vérifications techniques des installations d'éclairage, dont la périodicité annuelle. **Texte non encore relu au mot près** — Légifrance ne sert pas le corps des articles de cet arrêté à un client automatisé. À confronter avant toute évolution de cette obligation.",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    transmet: [],
    typologies: { erp: true },
    categoriesEquipement: ["BAES"],
    notesInternes:
      "Régime ERP de l'éclairage de sécurité, volet « vérification technique par un tiers ». Il se coordonne avec le régime travail (arrêté du 14 décembre 2011) par l'article 1er de celui-ci, qui laisse le règlement de sécurité ERP gouverner les locaux et dégagements accessibles au public : les deux obligations « travail » portent donc `erp: false`. Cette ligne n'est PAS l'équivalent ERP de l'article 11 — ce sont `incendie-erp-eclairage-securite-essai-mensuel` et `-autonomie-semestrielle`, fondés sur EC 14 § 3, qui le sont. La référence citait « EC 14 et EC 15 » : EC 14 ne fonde aucune vérification annuelle, il fonde les deux essais de l'exploitant, et EC 15 est un pur renvoi à EL 19. Réserve ouverte : EL 19 n'a pas encore été confronté au mot près, faute d'accès automatisé au corps des articles de cet arrêté.\n\nSur-application assumée en 5ᵉ catégorie (constatée 2026-08-26, dépouillement du Livre III). L'article cité relève du Livre II du règlement de sécurité — « Dispositions applicables aux établissements des quatre premières catégories » — et PE 1 § 1 dispose que « les dispositions du livre II ne sont pas applicables sauf celles relevant d'articles expressément mentionnés dans la suite du présent livre ». Le Livre III a été dépouillé article par article : PE 26 n'ouvre le Livre II que sur MS 39, PE 27 que sur MS 70, ni l'un ni l'autre n'étant un article de vérification. L'article cité ne fonde donc PAS cette obligation en N5. Ce qui la fonde en N5 est PE 4 § 2 — « tous les trois ans au plus », par techniciens compétents — et, chez un employeur, le Code du travail, qui s'applique indépendamment du classement ERP. La ligne est MAINTENUE volontairement : la retirer créerait un faux négatif muet chez 100 % des utilisateurs, alors qu'une sur-application visible et documentée reste corrigeable. À reprendre lorsque le référentiel saura porter PE 4 § 2, dont le porteur est l'établissement et non un équipement.\n\nÉtat au 2026-08-27 (ADR-022) : le référentiel sait désormais le porter — `incendie-erp-pe4-entretien-installations-techniques` existe, portée par l'établissement, triennale, et elle atteint tous les ERP y compris ceux qui n'ont rien déclaré. La condition annoncée ci-dessus est donc à moitié levée, et à moitié seulement. Ce qui manque est un point de DROIT, pas de modèle : cette ligne-ci n'est pas seulement fondée sur le Livre II, sa note dit qu'elle l'est aussi, chez un employeur, sur le Code du travail — lequel s'applique indépendamment du classement ERP. Tant que cela n'a pas été vérifié article par article sur Légifrance, retirer la ligne supprimerait chez l'utilisateur une échéance dont on n'a PAS établi qu'elle n'est pas due, et le ferait en silence : sans rapport ni action attachés, la réconciliation la supprime physiquement (ADR-012). La relecture réglementaire de ces six lignes est un chantier distinct, à mener avec la skill de veille ; ce n'est pas un effet de bord du chantier du porteur.",
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
        article: "DF 10",
        url:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    transmet: [],
    typologies: { erp: true },
    categoriesEquipement: ["DESENFUMAGE"],
    notesInternes:
      "Sur-application assumée en 5ᵉ catégorie (constatée 2026-08-26, dépouillement du Livre III). L'article cité relève du Livre II du règlement de sécurité — « Dispositions applicables aux établissements des quatre premières catégories » — et PE 1 § 1 dispose que « les dispositions du livre II ne sont pas applicables sauf celles relevant d'articles expressément mentionnés dans la suite du présent livre ». Le Livre III a été dépouillé article par article : PE 26 n'ouvre le Livre II que sur MS 39, PE 27 que sur MS 70, ni l'un ni l'autre n'étant un article de vérification. L'article cité ne fonde donc PAS cette obligation en N5. Ce qui la fonde en N5 est PE 4 § 2 — « tous les trois ans au plus », par techniciens compétents — et, chez un employeur, le Code du travail, qui s'applique indépendamment du classement ERP. La ligne est MAINTENUE volontairement : la retirer créerait un faux négatif muet chez 100 % des utilisateurs, alors qu'une sur-application visible et documentée reste corrigeable. À reprendre lorsque le référentiel saura porter PE 4 § 2, dont le porteur est l'établissement et non un équipement.\n\nÉtat au 2026-08-27 (ADR-022) : le référentiel sait désormais le porter — `incendie-erp-pe4-entretien-installations-techniques` existe, portée par l'établissement, triennale, et elle atteint tous les ERP y compris ceux qui n'ont rien déclaré. La condition annoncée ci-dessus est donc à moitié levée, et à moitié seulement. Ce qui manque est un point de DROIT, pas de modèle : cette ligne-ci n'est pas seulement fondée sur le Livre II, sa note dit qu'elle l'est aussi, chez un employeur, sur le Code du travail — lequel s'applique indépendamment du classement ERP. Tant que cela n'a pas été vérifié article par article sur Légifrance, retirer la ligne supprimerait chez l'utilisateur une échéance dont on n'a PAS établi qu'elle n'est pas due, et le ferait en silence : sans rapport ni action attachés, la réconciliation la supprime physiquement (ADR-012). La relecture réglementaire de ces six lignes est un chantier distinct, à mener avec la skill de veille ; ce n'est pas un effet de bord du chantier du porteur."
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
        article: "MS 73",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000020317755/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    transmet: [],
    typologies: { erp: true },
    categoriesEquipement: ["RIA"],
    notesInternes:
      "Amendement 2026-08-25 : la catégorie d'équipement `RIA` existe désormais (enum Prisma + migration 20260825130000). Un RIA déclaré déclenche l'obligation sans condition. La branche EXTINCTEUR bornée par `aRobinetsIncendieArmes` (forme non_infirmee, criticité 4) est TRANSITOIRE : elle protège les établissements existants qui ont répondu « oui » sur leurs extincteurs, jusqu'à la reprise de données (scripts/reprise-ria.ts) qui crée un équipement RIA à partir de chaque extincteur ainsi marqué. Critère de retrait de la branche : plus aucun équipement EXTINCTEUR ne porte la clé `aRobinetsIncendieArmes` en base — retirer alors « EXTINCTEUR » des catégories, la condition, et la question du formulaire. Un établissement qui aurait à la fois un extincteur « oui » et un RIA déclaré reçoit deux lignes d'ici là.\n\nSources relues ce jour : MS 73 § 2 (LEGIARTI000020317755) fonde la vérification annuelle des installations fixes ; MS 38 ne vise que les extincteurs et ne fonde pas les RIA ; MS 68 ne vise que le SSI. R. 4227-30 CT fonde la présence des RIA « si nécessaire » côté employeur, sans périodicité. En 5ᵉ catégorie, PE 4 § 2 (version au 01/07/2026) prévoit « tous les trois ans au plus » par techniciens compétents : l'annuelle est une sur-application assumée en N5, cohérente avec le traitement des extincteurs. La mention « contrôle visuel trimestriel » (norme NF S 62-201, non opposable) a été retirée.",
  },
  {
    id: "incendie-erp-5-visite-commission",
    domaine: "incendie",
    libelle: "Visite périodique de la commission de sécurité (ERP 5ᵉ avec locaux à sommeil ou installations spécifiques)",
    description:
      "Les ERP font l'objet de visites périodiques de contrôle et de visites inopinées par la commission de sécurité compétente, « dans les conditions fixées au règlement de sécurité ». En 5ᵉ catégorie, la périodicité dépend de la présence de locaux à sommeil : les établissements qui en comportent pour le public sont visités TOUS LES CINQ ANS (PE 37), fréquence que le maire ou le préfet peut augmenter par arrêté ; ceux qui n'en comportent pas ne relèvent d'aucune périodicité écrite, le tableau de GE 4 ne visant que les quatre premières catégories. L'échéance est donc portée sans date, et la visite se trace au registre quand elle a lieu.",
    referencesLegales: [
      {
        source: "CCH",
        reference: "CCH, art. R. 143-41 (visites périodiques de la commission)",
        article: "CCH R. 143-41",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000043819015/",
        note: "« Ces établissements doivent faire l'objet, dans les conditions fixées au règlement de sécurité, de visites périodiques de contrôle et de visites inopinées effectuées par la commission de sécurité compétente. » Verbatim relevé en première main le 2026-08-26. L'article FONDE les visites mais ne fixe AUCUNE périodicité : il renvoie au règlement de sécurité.",
        versionConstatee: "2021-07-01",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. GE 4 — n'est PAS applicable en 5ᵉ catégorie",
        article: "GE 4",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000020303557/LEGISCTA000020303874/",
        note: "Cité pour montrer où la périodicité est fixée, et pour quels établissements. « Les établissements des 1re, 2e, 3e et 4e catégories doivent être visités périodiquement par les commissions de sécurité selon la fréquence fixée au tableau suivant. » Le tableau ne comporte aucune ligne de 5ᵉ catégorie, et GE 4 relève du Livre II, écarté par PE 1 § 1. Il ne fonde donc PAS cette obligation.",
        versionConstatee: "2015-01-01",
      },
      {
        source: "ARRETE",
        reference:
          "Arrêté du 25 juin 1980, art. PE 37 (ERP de 5ᵉ catégorie avec locaux à sommeil)",
        article: "PE 37",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020374774/",
        note: "« Ces établissements doivent être visités tous les cinq ans par la commission de sécurité compétente ; la fréquence de ces visites peut être augmentée, s'il est jugé nécessaire, par arrêté du maire ou du préfet, après avis de la commission. » Verbatim relevé en première main le 2026-08-26. SEUL article du Livre III fixant une périodicité de visite de commission — et il ne vise que les établissements comportant, pour le public, des locaux à sommeil.",
        versionConstatee: "2004-11-24",
      },
    ],
    periodicite: "autre",
    realisateurs: ["organisme_agree"],
    criticite: 4,
    transmet: [],
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
      "Visite commissionnelle : n'est pas à la charge de l'exploitant au sens opérationnel (initiée par l'administration) mais est à tracer dans le registre. Échéance quinquennale en première approche.\n\nAmendement 2026-08 : la restriction « locaux à sommeil » figurait dans le libellé et la description mais n'était encodée nulle part — l'obligation tombait donc sur tout ERP de 5ᵉ catégorie déclarant une alarme, restaurants et commerces compris. Elle est désormais bornée par la propriété `dessertLocauxSommeil`.\n\nPourquoi une condition d'équipement et non une restriction `types` : la présence de locaux à sommeil est une caractéristique de l'établissement qui traverse les types (un bâtiment de type W peut comporter un logement de fonction, un type O n'est pas nécessairement de 5ᵉ catégorie). Encoder une liste de types équivaudrait à trancher, sans source article par article, quels types d'exploitation comportent des locaux à sommeil — ce que la règle n°6 interdit. Le libellé de l'obligation mentionne aussi les « installations spécifiques », second cas de visite périodique qui n'est pas modélisé : la condition ne couvre que la branche « locaux à sommeil ».\n\nForme `non_infirmee` (criticité 4, obligation déjà publiée) : les établissements existants gardent la ligne jusqu'à une réponse « non » explicite, plutôt que de la perdre en silence à la prochaine régénération.\n\nAmendement 2026-08-26 : l'obligation portait une périodicité QUINQUENNALE qu'aucun texte ne fonde, et deux références dont aucune ne l'établissait. Trois lectures indépendantes le confirment. R. 143-34 traite des vérifications techniques à la charge de l'exploitant, pas des visites de commission — il est remplacé par R. 143-41, qui les fonde. GE 4 fixe bien des périodicités, mais pour les 1ʳᵉ à 4ᵉ catégories seulement : son tableau ne comporte aucune ligne de 5ᵉ catégorie, et il relève du Livre II, écarté par PE 1 § 1. Il est conservé en référence pour montrer précisément cela. Aucun article du Livre III n'organise de visite périodique de commission. La règle des cinq ans circule dans les guides préfectoraux et remonterait à la circulaire du 22 juin 1995 relative aux CCDSA — non lue au verbatim, et de toute façon non opposable. `periodicite` passe donc à `autre` : la ligne subsiste, parce que les visites existent et se tracent au registre, mais le produit cesse d'afficher une échéance que le droit ne donne pas.\n\nRECTIFIÉ LE 2026-08-26, quelques heures après l'amendement ci-dessus, qui était FAUX sur un point. Il affirmait qu'« aucun article du Livre III n'organise de visite périodique de commission ». PE 37 le fait, et fixe cinq ans. La quinquennale n'était donc pas sans fondement : elle en avait un, que je n'avais pas trouvé, et la description d'origine le disait presque — elle liait déjà la visite aux locaux à sommeil. Je l'ai remplacée par une affirmation d'absence au lieu de chercher plus loin. Ne pas avoir trouvé la source n'est pas la preuve qu'il n'y en a pas.\n\n`periodicite` reste `autre`, mais cette fois pour une raison nommée : PE 37 ne vise QUE les établissements comportant, pour le public, des locaux à sommeil. Le modèle n'a aucun attribut d'établissement pour cette distinction. Poser `quinquennale` sur tous les ERP de 5ᵉ catégorie sur-appliquerait à la boutique et au bureau ; laisser `autre` sous-applique à l'hôtel et à la chambre d'hôtes. Le manque est déclaré sur PE 37 dans le corpus, et l'attribut reste à créer.",
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
        article: "GH 5",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000025169258",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["organisme_agree"],
    criticite: 5,
    transmet: [],
    typologies: { igh: true },
    categoriesEquipement: ["ALARME_INCENDIE", "EXTINCTEUR", "DESENFUMAGE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait « GH 60 à GH 63 ». GH 60 traite de la surveillance, des exercices et de l'information des locataires. Les vérifications techniques périodiques sont à l'article GH 5.",
  },
];
