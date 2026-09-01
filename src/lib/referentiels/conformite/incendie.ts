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
    nature: "echeance_recurrente",
    pieceAttendue: null,
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
    nature: "etat_permanent",
    pieceAttendue: null,
    realisateurs: ["personne_qualifiee", "personne_competente"],
    criticite: 5,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["EXTINCTEUR"],
    notesInternes:
      "AMENDEMENT 2026-08-27, audit systématique des périodicités sans source porteuse. L'obligation affichait une échéance ANNUELLE en ne citant que R. 4227-28 et R. 4227-29. Section R. 4227-28 à R. 4227-41 relue à la source : AUCUN de ces articles ne fixe de périodicité annuelle, pour quoi que ce soit. La seule périodicité de toute la section est celle de R. 4227-39, « au moins tous les six mois », et elle porte sur les exercices et essais, pas sur les extincteurs. R. 4227-29 dit « maintenus en bon état de fonctionnement » — une obligation d'ÉTAT, sans rythme.\n\nLa vérification annuelle des extincteurs existe bien, mais elle vient de la norme NF S 61-919 et des contrats de maintenance, pas du Code du travail. Une norme n'est pas opposable par elle-même. C'est le même motif que la règle APSAD R4 retirée en août.\n\n`periodicite` passe à `autre` : l'obligation reste, parce que doter l'établissement de moyens de lutte et les maintenir en état est bien exigé, mais le produit cesse d'afficher une date que le droit ne donne pas. Les ERP ne perdent rien : `incendie-erp-extincteurs-annuelle` porte l'annuelle pour eux, fondée sur MS 73.\n\nNATURE : ÉTAT PERMANENT (ADR-026). C'est la lecture que l'amendement du 2026-08-27 avait faite du texte — « R. 4227-29 dit « maintenus en bon état de fonctionnement » — une obligation d'ÉTAT, sans rythme » — sans qu'aucun champ ne puisse la porter. Elle l'est désormais, et `periodicite: \"autre\"` cesse d'être le seul indice.",
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
        note: "« Dans les établissements mentionnés à l'article R. 4227-34, une consigne de sécurité incendie est établie et affichée de manière très apparente [...] » Verbatim relevé le 2026-08-31. L'article ne subordonne la consigne à AUCUN équipement : il ne nomme ni extincteur ni alarme. Son seul critère est le champ de R. 4227-34.",
        versionConstatee: "2011-11-10",
      },
    ],
    periodicite: "autre",
    nature: "etat_permanent",
    pieceAttendue: "consigne de sécurité incendie",
    realisateurs: ["exploitant"],
    criticite: 3,
    transmet: [],
    porteur: "etablissement",
    typologies: { travail: true, personnesPresentesMin: 51, champR422734: true },
    equipementsEnContexte: ["EXTINCTEUR", "ALARME_INCENDIE"],
    notesInternes:
      "Amendement 2026-08-25 (relecture Légifrance R. 4227-34, -37, -38) : la consigne affichée n'est due que dans les établissements de R. 4227-34, par renvoi exprès de R. 4227-37 ; hors de ce champ le texte ne demande que des « instructions » d'évacuation. L'obligation était encodée sans seuil (sur-application à tout employeur) et sa description exigeait une « mise à jour à chaque changement notable » qui ne figure dans aucun des deux articles — retirée. La périodicité annuelle est une convention de rappel, aucun texte ne fixe de périodicité à la consigne. R. 4227-37 porte une version future au 01/01/2027 : à relire à cette date.\n\nAMENDEMENT 2026-08-27, même audit. L'obligation affichait une échéance ANNUELLE en ne citant que R. 4227-37, qui ne porte aucune périodicité — vérifié sur toute la section. Aucun texte n'impose de réafficher ou de réviser la consigne chaque année.\n\n`periodicite` passe à `autre`. L'affichage de la consigne est une obligation PERMANENTE, pas une échéance : elle est due tant que l'établissement entre dans le champ de R. 4227-34, et elle se met à jour quand l'organisation change — pas à date fixe. Ce qui est bien périodique, dans la même sous-section, ce sont les exercices et essais semestriels de R. 4227-39, portés par `incendie-travail-exercice-semestriel`.\n\nAMENDEMENT 2026-08-31, lot « faux négatifs d'ancrage ». `categoriesEquipement: [EXTINCTEUR, ALARME_INCENDIE]` est retiré au profit du porteur établissement (ADR-022). R. 4227-37 relu au verbatim ce jour : il ne mentionne aucun équipement. Le champ de l'obligation est celui de R. 4227-34, et il est DÉJÀ encodé — `personnesPresentesMin: 51` et `champR422734`. La liste d'équipements ne restreignait donc rien de ce que le texte restreint : elle ajoutait une condition que le texte n'écrit pas, et qui produisait un faux négatif chez tout établissement du champ de R. 4227-34 n'ayant déclaré ni extincteur ni alarme. Les deux catégories passent en `equipementsEnContexte`, à titre indicatif — c'est bien le matériel que la consigne doit désigner (R. 4227-38 1°), mais le désigner n'est pas en avoir déclaré un dans l'outil.\n\nNATURE : ÉTAT PERMANENT, `pieceAttendue: \"consigne de sécurité incendie\"` (ADR-026). R. 4227-37 fait ÉTABLIR la consigne avant de la faire afficher : c'est un écrit, et son contenu est fixé par R. 4227-38. Deux affichages voisins n'en sont pas — l'affichage des coordonnées (D. 4711-1) et l'avis d'accès au DUERP (R. 4121-4) portent `pieceAttendue: null`, parce que ce que le texte exige y est l'affichage lui-même, pas la détention d'une pièce.",
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
        note: "« La consigne de sécurité incendie prévoit des essais et visites périodiques du matériel et des exercices [...] Ces exercices et essais périodiques ont lieu au moins tous les six mois. Leur date et les observations auxquelles ils peuvent avoir donné lieu sont consignées sur un registre tenu à la disposition de l'inspection du travail. » Verbatim relevé le 2026-08-31. Aucun équipement n'y conditionne l'exercice.",
        versionConstatee: "2011-11-10",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4227-34",
        article: "R. 4227-34",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532067/",
        note: "Article qui pose le seuil : « Les établissements dans lesquels peuvent se trouver occupées ou réunies habituellement plus de cinquante personnes, ainsi que ceux, quelle que soit leur importance, où sont manipulées et mises en œuvre des matières inflammables mentionnées à l'article R. 4227-22 SONT ÉQUIPÉS d'un système d'alarme sonore. » Verbatim relevé le 2026-08-31. Le point décisif pour l'ancrage : cet article IMPOSE l'alarme aux établissements de son champ. L'alarme est donc l'objet d'une obligation qui découle du champ, jamais le critère qui y fait entrer.",
        versionConstatee: "2008-05-01",
      },
    ],
    periodicite: "semestrielle",
    nature: "echeance_recurrente",
    pieceAttendue: "registre des exercices et essais",
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
    porteur: "etablissement",
    typologies: { travail: true, personnesPresentesMin: 51, champR422734: true },
    equipementsEnContexte: ["ALARME_INCENDIE"],
    notesInternes:
      "Seuil encodé (amendement 2026-08) : sans seuil, la règle s'appliquait à un salon de coiffure de deux personnes alors que sa propre description citait un seuil. « Plus de cinquante » ⇒ 51, bornes incluses.\n\nAmendement 2026-08-25 (relecture Légifrance R. 4227-22, -34, -37, -39) : le champ de R. 4227-39 est celui de R. 4227-34 par double renvoi (39 → consigne 37 → établissements 34). Il est disjonctif — « plus de cinquante personnes […] ainsi que ceux, quelle que soit leur importance, où sont manipulées et mises en œuvre des matières inflammables mentionnées à l'article R. 4227-22 » — et compte les personnes « occupées ou réunies », public compris (R. 4227-38 3° distingue « les travailleurs et le public »). `effectifMin: 51` (salariés seuls) est remplacé par `personnesPresentesMin: 51` (personnes présentes, repli sur l'effectif salarié si non déclaré) et `champR422734: true` (branche matières R. 4227-22, déclarée par le dirigeant). Le déclencheur ALARME_INCENDIE reste une heuristique : l'alarme est une conséquence de R. 4227-34, pas sa condition.\n\nAMENDEMENT 2026-08-31, lot « faux négatifs d'ancrage ». La phrase ci-dessus avait raison et n'avait pas été suivie d'effet : le déclencheur ALARME_INCENDIE est retiré, l'obligation passe au porteur établissement (ADR-022). R. 4227-34 relu au verbatim ce jour, et il tranche seul : les établissements de son champ « SONT ÉQUIPÉS d'un système d'alarme sonore ». L'alarme y est le CONTENU d'une obligation, pas la condition d'une autre. Ancrer l'exercice semestriel dessus revenait à ne l'exiger que de ceux qui avaient déjà obéi — et à laisser sans aucune ligne d'exercice l'établissement de plus de cinquante personnes qui n'a rien déclaré, c'est-à-dire précisément celui qui est en défaut. C'est le faux négatif le plus lourd du lot : criticité 4, échéance semestrielle réelle, et zéro ligne affichée.\n\nCe qui NE change pas : le champ. `personnesPresentesMin: 51` et `champR422734` restent la seule restriction, et ils portent le double renvoi 39 → 37 → 34. Le salon de coiffure de deux personnes ne reçoit toujours rien. ALARME_INCENDIE passe en `equipementsEnContexte`.",
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
        reference: "L. 4711-1 — mentions obligatoires des pièces de vérification",
        article: "L. 4711-1",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000006178110/",
        note: "« Les attestations, consignes, résultats et rapports relatifs aux vérifications et contrôles mis à la charge de l'employeur au titre de la santé et de la sécurité au travail comportent des mentions obligatoires déterminées par voie réglementaire. » Verbatim relevé le 2026-08-31. Aucune condition d'effectif, d'équipement ni de classement ERP : c'est l'un des deux articles qui fondent réellement la branche `travail: true`.",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "L. 4711-2 — conservation des observations de l'inspection",
        article: "L. 4711-2",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000006178110/",
        note: "« Les observations et mises en demeure notifiées par l'inspection du travail en matière de santé et de sécurité, de médecine du travail et de prévention des risques sont conservées par l'employeur. » Verbatim relevé le 2026-08-31. Second fondement de la branche `travail: true`, sans condition d'effectif ni d'équipement.",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "D. 4711-2 — datation et identité du vérificateur",
        article: "D. 4711-2",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018493740/",
        note: "« [Les pièces] sont datés. Ils mentionnent l'identité de la personne ou de l'organisme chargé du contrôle ou de la vérification ainsi que celle de la personne qui a réalisé le contrôle ou la vérification. » Verbatim relevé le 2026-08-31. Ce sont les « mentions obligatoires » que L. 4711-1 renvoie au pouvoir réglementaire.",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "D. 4711-3 — conservation cinq ans",
        article: "D. 4711-3",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018493740/",
        note: "« L'employeur conserve les documents [...] des cinq dernières années et, en tout état de cause, ceux des deux derniers contrôles ou vérifications. » Verbatim relevé le 2026-08-31. Cette durée n'est portée par aucun champ du référentiel — voir la réserve inscrite sur cet article au corpus.",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "L. 4711-5 — faculté de regroupement, PAS un fondement",
        article: "L. 4711-5",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006903389/",
        note: "« [...] l'employeur EST AUTORISÉ À réunir ces informations dans un registre unique dès lors que cette mesure est de nature à faciliter la conservation et la consultation de ces informations. » Verbatim relevé le 2026-08-31. Le verbe est une AUTORISATION, pas une prescription : cet article ne fonde aucune obligation, il en assouplit la forme. Cité pour cela, et parce qu'il était jusqu'ici la seule référence Code du travail à porter la branche `travail: true` — ce qui faisait reposer une obligation sur une faculté.",
        versionConstatee: "2008-05-01",
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
    nature: "etat_permanent",
    pieceAttendue: "registre de sécurité",
    realisateurs: ["exploitant"],
    criticite: 3,
    transmet: [],
    porteur: "etablissement",
    typologies: { travail: true, erp: true },
    equipementsEnContexte: ["EXTINCTEUR", "ALARME_INCENDIE"],
    notesInternes:
      "Obligation permanente (pas d'échéance périodique). Modélisée sur travail=true en MVP : en pratique tout établissement du scope V2 emploie au moins un salarié (L. 4711-5 CT). Les références CCH R. 143-44 (ERP) et R. 146-35 (IGH) restent citées pour information. Corrigé à l'audit 2026-08 : R. 146-21 était cité à tort — cet article traite du silence de l'administration sur une demande d'agrément et a été abrogé par le décret 2025-1100 ; le registre de sécurité IGH est à R. 146-35.\n\nLIMITE CONNUE, NON CORRIGÉE ICI — restaurée le 2026-08-27. Cette note a été écrite le 2026-08-26 (commit 7736869) et perdue : un rebase a laissé ce commit derrière, et sa rapatriation partielle n'en a rien repris ici. Elle disait, et c'était juste : `categoriesEquipement` ancre cette obligation à un extincteur ou une alarme DÉCLARÉS. Un établissement qui n'a déclaré ni l'un ni l'autre ne reçoit AUCUNE ligne « tenue du registre », alors que le registre est dû sans condition d'équipement. Même cause pour `incendie-travail-exercice-semestriel`, ancrée sur ALARME_INCENDIE.\n\nCe qui a changé depuis : la note concluait que corriger ce faux négatif « suppose de rendre le calendrier capable de porter une obligation sans équipement — décision de schéma, à instruire séparément ». C'est fait (ADR-022). Le modèle ne bloque plus ; ces deux obligations peuvent passer au porteur établissement. Elles ne l'ont PAS été dans ce lot, tenu aux deux articles dont le verbatim était relevé en première main (PE 4 § 2, R. 4222-20). C'est le lot suivant, et il est court.\n\nAUTRE PERTE DU MÊME REBASE, non réparée ici et signalée pour qu'elle ne se reperde pas : le commit 7736869 portait aussi trois corrections réglementaires à cette obligation, relevées sur Légifrance le 2026-08-26. (1) R. 143-44 a été RÉÉCRIT au 1er juillet 2026 par le décret n° 2025-1100 ; la description ci-dessus reprend la version antérieure et ignore le 5° (dates des exercices de sécurité incendie) ainsi que le renvoi aux articles R. 141-10 et R. 141-11. (2) `typologies` devait gagner `erp: true` : R. 143-44 fonde le registre en ERP par lui-même, indépendamment de la qualité d'employeur. (3) R. 146-35 (IGH) reste cité sans `igh: true` parce que l'IGH est hors périmètre, non parce que la référence serait décorative. Réparer ces trois points modifie le champ d'application d'une obligation en production : c'est une relecture réglementaire, pas un effet de bord du chantier du porteur.\n\nAMENDEMENT 2026-08-31, lot « faux négatifs d'ancrage ». C'est le lot annoncé ci-dessus, et il fait deux choses.\n\n(A) LE PORTEUR. `categoriesEquipement: [EXTINCTEUR, ALARME_INCENDIE]` est retiré, `porteur: etablissement`. R. 143-44 relu au verbatim le 2026-08-31 dans sa version en vigueur depuis le 2026-07-01 : « DANS LES ÉTABLISSEMENTS SOUMIS AUX PRESCRIPTIONS DU PRÉSENT CHAPITRE, il doit être tenu un registre de sécurité [...] » Le champ est le chapitre ERP tout entier, 5ᵉ catégorie comprise ; l'article ne nomme aucun équipement. Côté travail, L. 4711-1 et L. 4711-2 relus le même jour ne posent pas davantage de condition d'équipement. Les deux catégories passent en `equipementsEnContexte`.\n\n(B) LA BRANCHE TRAVAIL REPOSAIT SUR UNE FACULTÉ. Constat non prévu par le brief de ce lot, et c'est le plus gênant des deux. Les seules références Code du travail portées ici étaient R. 4227-39 — dont le champ est celui de R. 4227-34, donc PAS tout employeur — et L. 4711-5, qui dispose que « l'employeur EST AUTORISÉ À réunir ces informations dans un registre unique ». Une autorisation ne fonde rien. `travail: true` s'appliquait donc à tout employeur sans qu'aucune des références citées ne l'établisse pour lui. L. 4711-1, L. 4711-2, D. 4711-2 et D. 4711-3 sont ajoutés : ce sont eux qui obligent tout employeur, sans seuil, à tenir datées et à conserver cinq ans les pièces des vérifications. La typologie ne bouge pas ; ce qui la fonde est désormais écrit. L. 4711-5 reste cité, requalifié en toutes lettres.\n\nCE QUI ÉTAIT DÉJÀ RÉPARÉ, contrairement à ce que la note ci-dessus annonce. Les points (1) et (2) de la « autre perte du même rebase » ont été traités avant ce lot : la description porte bien le 5° et le renvoi à R. 141-10 / R. 141-11, et `typologies` porte bien `erp: true`. Vérifié ligne à ligne contre le verbatim du 2026-08-31. Le point (3) tient toujours : R. 146-35 reste cité sans `igh: true` parce que l'IGH est hors périmètre. La note qui les annonçait comme non réparés est restée en place après leur correction — c'est elle qui m'a fait ouvrir R. 143-44, ce qui est le comportement voulu, mais une note qui décrit un état révolu finit par faire refaire le travail.\n\nNATURE : ÉTAT PERMANENT, `pieceAttendue: \"registre de sécurité\"` (ADR-026). Un registre tenu, pas un acte à refaire.",
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
    nature: "echeance_recurrente",
    pieceAttendue: null,
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
    nature: "echeance_recurrente",
    pieceAttendue: null,
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
    nature: "echeance_recurrente",
    pieceAttendue: null,
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
    nature: "echeance_recurrente",
    pieceAttendue: null,
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
    nature: "echeance_recurrente",
    pieceAttendue: null,
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
    nature: "echeance_recurrente",
    pieceAttendue: null,
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
    nature: "echeance_recurrente",
    pieceAttendue: null,
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
    nature: "echeance_recurrente",
    pieceAttendue: null,
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
    nature: "echeance_recurrente",
    pieceAttendue: null,
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
    nature: "echeance_recurrente",
    pieceAttendue: null,
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
      "Les ERP font l'objet de visites périodiques de contrôle et de visites inopinées par la commission de sécurité compétente, « dans les conditions fixées au règlement de sécurité ». En 5ᵉ catégorie, la périodicité dépend de la présence de locaux à sommeil : les établissements qui en comportent pour le public sont visités TOUS LES CINQ ANS (PE 37), fréquence que le maire ou le préfet peut augmenter par arrêté ; ceux qui n'en comportent pas ne relèvent d'aucune périodicité écrite, le tableau de GE 4 ne visant que les quatre premières catégories. L'échéance est donc quinquennale, et la visite se trace au registre quand elle a lieu.",
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
    periodicite: "quinquennale",
    nature: "echeance_recurrente",
    pieceAttendue: null,
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
      "Visite commissionnelle : n'est pas à la charge de l'exploitant au sens opérationnel (initiée par l'administration) mais est à tracer dans le registre. Échéance quinquennale en première approche.\n\nAmendement 2026-08 : la restriction « locaux à sommeil » figurait dans le libellé et la description mais n'était encodée nulle part — l'obligation tombait donc sur tout ERP de 5ᵉ catégorie déclarant une alarme, restaurants et commerces compris. Elle est désormais bornée par la propriété `dessertLocauxSommeil`.\n\nPourquoi une condition d'équipement et non une restriction `types` : la présence de locaux à sommeil est une caractéristique de l'établissement qui traverse les types (un bâtiment de type W peut comporter un logement de fonction, un type O n'est pas nécessairement de 5ᵉ catégorie). Encoder une liste de types équivaudrait à trancher, sans source article par article, quels types d'exploitation comportent des locaux à sommeil — ce que la règle n°6 interdit. Le libellé de l'obligation mentionne aussi les « installations spécifiques », second cas de visite périodique qui n'est pas modélisé : la condition ne couvre que la branche « locaux à sommeil ».\n\nForme `non_infirmee` (criticité 4, obligation déjà publiée) : les établissements existants gardent la ligne jusqu'à une réponse « non » explicite, plutôt que de la perdre en silence à la prochaine régénération.\n\nAmendement 2026-08-26 : l'obligation portait une périodicité QUINQUENNALE qu'aucun texte ne fonde, et deux références dont aucune ne l'établissait. Trois lectures indépendantes le confirment. R. 143-34 traite des vérifications techniques à la charge de l'exploitant, pas des visites de commission — il est remplacé par R. 143-41, qui les fonde. GE 4 fixe bien des périodicités, mais pour les 1ʳᵉ à 4ᵉ catégories seulement : son tableau ne comporte aucune ligne de 5ᵉ catégorie, et il relève du Livre II, écarté par PE 1 § 1. Il est conservé en référence pour montrer précisément cela. Aucun article du Livre III n'organise de visite périodique de commission. La règle des cinq ans circule dans les guides préfectoraux et remonterait à la circulaire du 22 juin 1995 relative aux CCDSA — non lue au verbatim, et de toute façon non opposable. `periodicite` passe donc à `autre` : la ligne subsiste, parce que les visites existent et se tracent au registre, mais le produit cesse d'afficher une échéance que le droit ne donne pas.\n\nRECTIFIÉ LE 2026-08-26, quelques heures après l'amendement ci-dessus, qui était FAUX sur un point. Il affirmait qu'« aucun article du Livre III n'organise de visite périodique de commission ». PE 37 le fait, et fixe cinq ans. La quinquennale n'était donc pas sans fondement : elle en avait un, que je n'avais pas trouvé, et la description d'origine le disait presque — elle liait déjà la visite aux locaux à sommeil. Je l'ai remplacée par une affirmation d'absence au lieu de chercher plus loin. Ne pas avoir trouvé la source n'est pas la preuve qu'il n'y en a pas.\n\n`periodicite` reste `autre`, mais cette fois pour une raison nommée : PE 37 ne vise QUE les établissements comportant, pour le public, des locaux à sommeil. Le modèle n'a aucun attribut d'établissement pour cette distinction. Poser `quinquennale` sur tous les ERP de 5ᵉ catégorie sur-appliquerait à la boutique et au bureau ; laisser `autre` sous-applique à l'hôtel et à la chambre d'hôtes. Le manque est déclaré sur PE 37 dans le corpus, et l'attribut reste à créer.\n\nEXAMINÉE ET NON REBRANCHÉE — 2026-08-31, lot « faux négatifs d'ancrage ». Le brief de ce lot attendait un passage au porteur établissement. Il ne peut pas se faire, et voici ce qui l'en empêche.\n\nLe faux négatif est RÉEL : R. 143-41, relu au verbatim ce jour (version en vigueur depuis le 2021-07-01), dit « CES ÉTABLISSEMENTS doivent faire l'objet [...] de visites périodiques de contrôle et de visites inopinées effectuées par la commission de sécurité compétente », l'antécédent étant les établissements soumis au chapitre. Aucun équipement n'y figure. Un hôtel qui n'a pas déclaré d'alarme ne reçoit donc aucune ligne, alors qu'il est visité tous les cinq ans.\n\nMais le rebranchement produirait le faux positif symétrique, et plus large. PE 37, relu au verbatim ce jour, est intitulé « Contrôle des établissements de 5e catégorie comportant des locaux à sommeil » et ne vise que « les établissements comportant, POUR LE PUBLIC, des locaux à sommeil ». C'est le SEUL article du Livre III qui organise une visite périodique en 5ᵉ catégorie — GE 4 ne couvre que les 1ʳᵉ à 4ᵉ, et relève du Livre II écarté par PE 1 § 1. La restriction « locaux à sommeil » ne module donc pas un rythme : elle décide de l'EXISTENCE de la visite périodique. La retirer ferait naître une échéance chez chaque restaurant et chaque boutique de 5ᵉ catégorie.\n\nOr `ObligationPorteeParEtablissement` interdit `conditions` — à raison : une condition porte sur une propriété d'équipement, et il n'y aurait plus d'équipement pour la porter. Aujourd'hui la caractéristique `dessertLocauxSommeil` vit sur l'ALARME_INCENDIE, ce qui est un pis-aller : les locaux à sommeil sont un attribut de l'ÉTABLISSEMENT, pas de son alarme.\n\nLe déblocage est donc un attribut d'établissement — quelque chose comme `comporteLocauxSommeilPublic` — c'est-à-dire une migration de schéma. Ce lot n'y touche pas : `prisma/schema.prisma` est explicitement hors de son périmètre. La question est remontée à la session qui l'a délégué, avec ce constat.\n\nEn attendant, l'ancrage d'origine est CONSERVÉ tel quel. Entre un faux négatif borné aux établissements à locaux à sommeil sans alarme déclarée et un faux positif sur tous les ERP de 5ᵉ catégorie, on garde le premier — et on l'écrit ici plutôt que de le corriger de travers.\n\nNATURE : ÉCHÉANCE RÉCURRENTE (ADR-026), ET LE COUPLE AVEC `periodicite: \"autre\"` EST ICI UN MANQUE, PAS UNE DESCRIPTION. Troisième cas d'école de l'audit du 2026-08-31. La description ci-dessus est explicite : PE 37 fixe CINQ ANS pour les établissements de 5ᵉ catégorie comportant des locaux à sommeil, et la condition `dessertLocauxSommeil` restreint déjà cette ligne à ceux-là. Le rythme est donc écrit, et la périodicité devrait pouvoir être `quinquennale`. Elle ne l'est pas encore, et ce lot ne la change pas : PE 37 n'a pas été relu à la source dans ce lot, et une périodicité se pose sur un verbatim, jamais sur une description. À reprendre avec la relecture réglementaire, en gardant que le maire ou le préfet peut augmenter la fréquence par arrêté — ce qui relève d'une prescription particulière (ADR-014), pas du référentiel.\n\nSECONDE RÉSERVE, indépendante : la visite est initiée par l'administration, pas par l'exploitant. Une déclaration « en place » n'aurait aucun sens sur cette ligne ; ce qui se trace est la visite quand elle a eu lieu.\n\n⚠ AMENDEMENT 2026-08-31, SOIR — `periodicite` PASSE À `quinquennale`. CE QUI SUIT REMPLACE LES DEUX JUSTIFICATIONS CI-DESSUS (« reste `autre` » du 2026-08-26, et la réserve ADR-026). Elles sont conservées parce qu'elles racontent comment on s'est trompé deux fois de suite sur cet article, pas parce qu'elles décrivent encore le choix fait.\n\nLE FONDEMENT. PE 37, version en vigueur depuis le 2004-11-24 : « Ces établissements doivent être visités TOUS LES CINQ ANS par la commission de sécurité compétente ; la fréquence de ces visites peut être augmentée, s'il est jugé nécessaire, par arrêté du maire ou du préfet, après avis de la commission. » C'est un rythme, pas un plafond — le texte n'écrit pas « au moins ». La seconde phrase ouvre un raccourcissement par acte administratif individuel : c'est une prescription particulière (ADR-014), qui surcharge la périodicité sur un dossier donné, et non une raison de n'en poser aucune au référentiel.\n\nTROIS RELEVÉS INDÉPENDANTS ET CONCORDANTS, tous en première main : celui du 2026-08-26 porté par `referencesLegales[2].note` ci-dessus, celui du corpus (`arrete-1980-livre-3.ts`, PE 37), et celui de la session de coordination le 2026-08-31 au soir. La date de version — 24 novembre 2004 — a été recoupée une quatrième fois sur Légifrance ce jour ; le CORPS de l'article n'a pas pu l'être, la page rendant sa table des matières sans le texte et l'URL d'article répondant 403. C'est dit ici plutôt que passé sous silence : la valeur repose sur trois lectures humaines concordantes, pas sur une quatrième vérification automatique.\n\nPOURQUOI LA JUSTIFICATION DU 2026-08-26 NE TIENT PLUS — ET POURQUOI CE N'EST PAS POUR LA RAISON QU'ON CROIT. Elle disait : « Poser `quinquennale` sur tous les ERP de 5ᵉ catégorie sur-appliquerait à la boutique et au bureau. » On serait tenté de répondre que la condition `dessertLocauxSommeil` restreint déjà la ligne aux établissements que PE 37 vise. **C'est faux, et il faut le dire précisément.** La condition est de forme `equipement_propriete_non_infirmee` : elle est satisfaite TANT QUE l'utilisateur n'a pas répondu « non ». La ligne tombe donc sur tout ERP de 5ᵉ catégorie ayant déclaré une alarme et n'ayant pas encore répondu à la question — c'est-à-dire, aujourd'hui, sur la boutique et le bureau exactement comme le craignait la note.\n\nCE QUI CHANGE VRAIMENT, c'est la NATURE de cette sur-application, et c'est une règle que ce dépôt a déjà écrite. Avec `autre`, elle était MUETTE : le générateur sautait la ligne, aucun écran ne la montrait, et personne ne pouvait la corriger puisque personne ne la voyait. Avec `quinquennale`, elle devient une échéance datée, visible au calendrier, et **corrigeable par une réponse « non »** — la question est posée au formulaire d'équipement, avec cette aide : « Un restaurant, un commerce ou un bureau sans hébergement : répondez « non ». » C'est mot pour mot la doctrine que `ConditionApplication` énonce pour la forme `non_infirmee` : « sur une obligation de criticité élevée, une sur-application visible et corrigeable par une réponse « non » est toujours préférable à un faux négatif muet ». La valeur est posée sur ce fondement-là, pas sur l'idée que la condition suffirait.\n\nCE QUE CELA PRODUIT, SANS ENJOLIVER : à la prochaine régénération, tout établissement de 5ᵉ catégorie ayant déclaré une alarme sans répondre à la question voit apparaître une ligne « Visite périodique de la commission de sécurité », criticité 4, « à planifier » et urgente — y compris s'il n'a aucun local à sommeil. Répondre « non » à la question la fait disparaître. C'est assumé ; ce n'est pas indolore.\n\nL'AMPLEUR, MESURÉE PLUTÔT QU'ESTIMÉE — DEUX SUR DEUX. Le 2026-09-01, sur le jeu de démonstration : les deux dossiers sont des restaurants ERP de type N, 5ᵉ catégorie, chacun avec une ALARME_INCENDIE déclarée et `dessertLocauxSommeil` **vide** — pas « non », vide. `determineObligationsApplicables` rend la ligne pour les deux. Ce n'est pas un cas limite, c'est le cas NORMAL : rien n'oblige un dirigeant à répondre à cette question, et un parc repris ou importé n'y aura jamais répondu. Le taux à attendre sur le parc réel est donc proche de 100 % des ERP de 5ᵉ catégorie ayant déclaré une alarme, jusqu'à ce que chacun réponde « non ».\n\nLe chiffre est écrit ici, et pas seulement la réserve, pour une raison précise : une sur-application assumée qui ne dit pas son ampleur se redécouvre plus tard et se prend pour un bug. Quelqu'un verra deux restaurants sur deux porter une échéance de visite commissionnelle et croira à un défaut d'ancrage. C'en est un — il est nommé au (1) et au (2) ci-dessous —, mais il est CHOISI, et il se corrige d'un clic du côté de l'utilisateur, pas d'un correctif du côté du produit.\n\nDEUX RÉSERVES D'ANCRAGE, INCHANGÉES PAR CET AMENDEMENT — elles existaient à l'identique avant, et ne sont pas corrigées ici.\n\n(1) FAUX NÉGATIF, déjà documenté plus haut : un hôtel qui n'a déclaré aucune ALARME_INCENDIE ne reçoit rien, alors que PE 37 le vise. Le déblocage est un attribut d'établissement (`comporteLocauxSommeilPublic`), donc une migration et une donnée à collecter.\n\n(2) FAUX POSITIF, NON DOCUMENTÉ JUSQU'ICI, et c'est l'apport de cet amendement : PE 37 écrit « des locaux à sommeil POUR LE PUBLIC ». `dessertLocauxSommeil` ne distingue pas le sommeil du public de celui du personnel — et la note du 2026-08 invoque justement un logement de fonction pour justifier le choix d'une condition d'équipement plutôt qu'une restriction par type. Or un logement de fonction occupé par le personnel n'est pas un local à sommeil pour le public. **La condition est donc plus large que l'article**, dans un second sens, indépendant du précédent. L'aide du formulaire dit « logement de fonction ouvert au public », ce qui est plus juste que le nom du champ ; le nom, lui, reste trompeur. Nommé, non corrigé : le resserrer suppose de reposer la question à des utilisateurs qui y ont déjà répondu.",
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
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["organisme_agree"],
    criticite: 5,
    transmet: [],
    typologies: { igh: true },
    categoriesEquipement: ["ALARME_INCENDIE", "EXTINCTEUR", "DESENFUMAGE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait « GH 60 à GH 63 ». GH 60 traite de la surveillance, des exercices et de l'information des locataires. Les vérifications techniques périodiques sont à l'article GH 5.",
  },

  // ---------------------------------------------------------------------------
  // Habitation — arrêté du 31 janvier 1986 (titre VIII, obligations des
  // propriétaires)
  //
  // Le texte qui définit les familles d'habitation, dépouillé le 2026-09-01 —
  // il n'avait jamais été ouvert dans ce dépôt. Voir
  // `corpus/arrete-1986-habitation.ts` pour le détail article par article, et
  // notamment pour ce que la lecture N'A PAS établi : aucune des trois
  // obligations ci-dessous ne porte de restriction de famille, parce que
  // l'arrêté n'en pose aucune sur ce qu'il demande à l'exploitant. Les
  // familles y gouvernent la construction, pas l'entretien.
  //
  // Les trois lignes vivent en domaine `incendie` — c'est l'objet de l'arrêté
  // — et sont portées par l'ÉTABLISSEMENT : l'article 101 vise « le
  // propriétaire » sans subordonner quoi que ce soit à un équipement déclaré.
  // Les y accrocher reproduirait le faux négatif d'ancrage corrigé le
  // 2026-08-31 sur le registre de sécurité et la consigne incendie.
  // ---------------------------------------------------------------------------
  {
    id: "habitation-verification-annuelle-installations-securite",
    domaine: "incendie",
    libelle:
      "Vérification annuelle des installations de sécurité (immeuble d'habitation)",
    description:
      "Au moins une fois par an, le propriétaire de l'immeuble d'habitation — ou la personne responsable qu'il désigne — fait effectuer la vérification des installations de détection, de désenfumage et de ventilation, de toutes les installations fonctionnant automatiquement et des colonnes sèches. Il s'assure en particulier du bon fonctionnement des portes coupe-feu, des ferme-portes et des dispositifs de manœuvre des ouvertures en partie haute des escaliers. Les vérifications sont effectuées par des organismes ou techniciens compétents, qu'il choisit.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference:
          "Arrêté du 31 janvier 1986, art. 101 (vérifications annuelles à la charge du propriétaire)",
        article: "Arrêté 1986-01-31 art. 101",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006828539",
        note: "« Le propriétaire ou, le cas échéant, la personne responsable désignée par ses soins, est tenu de faire effectuer, AU MOINS UNE FOIS PAR AN, les vérifications des installations de détection, de désenfumage, de ventilation, ainsi que de toutes les installations fonctionnant automatiquement et des colonnes sèches. Il doit s'assurer, en particulier, du bon fonctionnement des portes coupe-feu, des ferme-portes ainsi que des dispositifs de manoeuvre des ouvertures en partie haute des escaliers. » Relevé sur Légifrance le 2026-09-01, puis relu sur une seconde URL distincte : les deux relevés sont identiques mot pour mot. Version en vigueur depuis le 5 mars 1986, aucun texte modificateur.",
        versionConstatee: "1986-03-05",
      },
      {
        source: "ARRETE",
        reference:
          "Arrêté du 31 janvier 1986, art. 103 (qualité du vérificateur)",
        article: "Arrêté 1986-01-31 art. 103",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006828541",
        note: "« Les vérifications visées à l'article 101 ci-avant doivent être effectuées par des organismes ou techniciens COMPÉTENTS, choisis par le propriétaire. » Relevé le 2026-09-01. C'est cet article qui fixe `realisateurs` — et il n'exige ni agrément, ni accréditation, ni certification.",
        versionConstatee: "2015-10-01",
      },
      {
        source: "ARRETE",
        reference:
          "Arrêté du 31 janvier 1986, art. 1er (champ d'application : habitations dont le plancher bas du logement le plus haut est à 50 m au plus)",
        article: "Arrêté 1986-01-31 art. 1",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000042744547",
        note: "Contexte, pas fondement : cet article borne le champ des quatre familles. Au-delà de 50 mètres, l'immeuble relève du régime IGH et non de cet arrêté.",
        versionConstatee: "2020-12-25",
      },
    ],
    periodicite: "annuelle",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    transmet: [],
    porteur: "etablissement",
    typologies: { habitation: true },
    equipementsEnContexte: ["DESENFUMAGE", "VMC", "ALARME_INCENDIE"],
    notesInternes:
      "Créée le 2026-09-01, au dépouillement de l'arrêté du 31 janvier 1986. C'est l'unique obligation périodique du texte, et le référentiel ne la portait pas : neuf obligations déclaraient la typologie `habitation` — sept d'ascenseur, deux de VMC-gaz — mais aucune ne venait de l'arrêté qui régit la sécurité incendie des immeubles d'habitation.\n\nPAS DE RESTRICTION DE FAMILLE, ET C'EST LE RÉSULTAT PRINCIPAL DU LOT. L'article 101 ne mentionne aucune famille, ni directement ni par renvoi : il vise « le propriétaire » de tout bâtiment entrant dans le champ de l'article 1er, c'est-à-dire les quatre familles. La tentation était de poser `familles: [\"TROISIEME_B\", \"QUATRIEME\"]` puisque les colonnes sèches, l'un des objets de la vérification, n'existent que là (art. 98). Ce serait une erreur de lecture : l'article 98 dispense en outre les 3ᵉ famille B d'au plus sept étages desservies par une voie échelles, si bien que la famille ne détermine même pas la présence de la colonne sèche. Et surtout, une telle condition ferait disparaître la ligne chez un propriétaire de 1ʳᵉ ou 2ᵉ famille à qui l'article impose bel et bien de vérifier SES installations de ventilation et ses ferme-portes. La famille décide de ce que le bâtiment contient ; l'article fait vérifier ce qui est là.\n\nRÉALISATEUR. `personne_qualifiee` seul, sur le verbatim de l'article 103 : « organismes ou techniciens compétents, choisis par le propriétaire ». Ni `organisme_agree` ni `organisme_accredite` ni `bureau_controle` — aucun agrément n'est requis, à la différence du contrôle technique quinquennal des ascenseurs (R. 134-12 CCH). Ajouter l'une de ces valeurs inventerait une exigence de qualification que le texte ne pose pas, et pousserait un propriétaire vers une prestation plus coûteuse que celle qu'on lui doit.\n\nPORTEUR ÉTABLISSEMENT, `equipementsEnContexte` non limitatif. L'article énumère détection, désenfumage, ventilation, « toutes les installations fonctionnant automatiquement » et colonnes sèches. Les trois catégories affichées sont celles que le modèle connaît ; « toutes les installations fonctionnant automatiquement » n'a pas d'équivalent au parc, et le dispositif d'appel prioritaire des pompiers de la 4ᵉ famille (art. 97) en est un exemple qu'aucune catégorie ne porte.\n\nCE QUE LA LIGNE NE COUVRE PAS, dit ici plutôt que passé sous silence : l'article 101 impose aussi d'« assurer l'entretien de toutes les installations concourant à la sécurité », sans rythme. Cet entretien n'est pas encodé — il n'a pas de périodicité propre et se confondrait avec les contrats d'entretien que d'autres lignes portent déjà (VMC-gaz, ascenseur). Le registre, lui, a sa ligne : `habitation-registre-securite`.\n\nNATURE : ÉCHÉANCE RÉCURRENTE (ADR-026). Un acte à refaire chaque année.",
  },
  {
    id: "habitation-registre-securite",
    domaine: "incendie",
    libelle: "Tenue du registre de sécurité (immeuble d'habitation)",
    description:
      "Le propriétaire assure l'entretien de toutes les installations concourant à la sécurité de l'immeuble et doit pouvoir le justifier par la tenue d'un registre de sécurité. Ce registre comprend au minimum les rapports des vérifications annuelles exigées par l'article 101, les rapports d'intervention d'entretien et les opérations de maintenance. Le propriétaire présente toutes les justifications utiles concernant l'entretien et la vérification des installations sur demande des agents assermentés et commissionnés à cet effet.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference:
          "Arrêté du 31 janvier 1986, art. 103 (contenu minimal du registre)",
        article: "Arrêté 1986-01-31 art. 103",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006828541",
        note: "« Le registre défini à l'article R. 111-13 du code de la construction et de l'habitation comprend a minima : - les rapports des vérifications exigées à l'article 101 du présent arrêté ; - les rapports d'intervention d'entretien ; - les opérations de maintenance. » Relevé le 2026-09-01. La liste vient de l'arrêté du 19 juin 2015 et ne s'impose, aux termes de son article d'application, qu'aux bâtiments dont le permis de construire a été déposé après le 1er octobre 2015 ; l'existence du registre, elle, est d'origine (art. 101).",
        versionConstatee: "2015-10-01",
      },
      {
        source: "ARRETE",
        reference:
          "Arrêté du 31 janvier 1986, art. 101 in fine (le registre justifie l'entretien)",
        article: "Arrêté 1986-01-31 art. 101",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006828539",
        note: "« Il doit également assurer l'entretien de toutes les installations concourant à la sécurité et doit pouvoir le justifier par la TENUE D'UN REGISTRE DE SÉCURITÉ. » Relevé le 2026-09-01, relu sur une seconde URL distincte. C'est l'article qui crée le registre ; l'article 103 en fixe le contenu.",
        versionConstatee: "1986-03-05",
      },
      {
        source: "ARRETE",
        reference:
          "Arrêté du 31 janvier 1986, art. 104 (présentation aux agents assermentés)",
        article: "Arrêté 1986-01-31 art. 104",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006828542",
        note: "« Le propriétaire est tenu de présenter toutes les justifications utiles concernant l'entretien et la vérification des installations sur demande des agents assermentés et commissionnés à cet effet. » Relevé le 2026-09-01. C'est ce qui rend le registre opposable.",
        versionConstatee: "1986-03-05",
      },
    ],
    periodicite: "autre",
    nature: "etat_permanent",
    pieceAttendue: "registre de sécurité",
    realisateurs: ["exploitant"],
    criticite: 3,
    transmet: [],
    porteur: "etablissement",
    typologies: { habitation: true },
    notesInternes:
      "Créée le 2026-09-01. DISTINCTE DE `incendie-registre-securite`, et il faut dire pourquoi plutôt que de laisser croire à un doublon. Celle-là est fondée sur R. 143-44 CCH et L. 4711-1 CT, et vise `{ travail: true, erp: true }` : le registre de l'employeur et celui de l'exploitant d'ERP. Celle-ci est fondée sur l'arrêté du 31 janvier 1986 et vise l'habitation. Les contenus imposés diffèrent — l'article 103 énumère les rapports de vérification, les rapports d'intervention d'entretien et les opérations de maintenance, là où R. 143-44 énumère les travaux d'aménagement, l'état nominatif du service de sécurité, les consignes et les dates d'exercices. Un immeuble d'habitation sans salarié et sans ERP ne recevait donc aucune ligne « registre », alors que l'article 101 lui en impose un. Ajouter `habitation: true` à l'obligation existante aurait fusionné deux registres au contenu différent sous un libellé et une description qui ne parlent que d'ERP et de Code du travail.\n\nUn même établissement peut recevoir les deux lignes — un immeuble d'habitation dont le rez-de-chaussée est un ERP, ou qui emploie un gardien. Ce n'est pas un défaut : ce sont deux registres que deux textes imposent, et les fondre reviendrait à décider à la place du propriétaire qu'un seul document satisfait les deux, ce qu'aucun des deux textes ne dit.\n\nPAS DE RESTRICTION DE FAMILLE : ni l'article 101, ni l'article 103, ni l'article 104 n'en mentionnent une.\n\nRENVOI NON VÉRIFIÉ, ET DÉCLARÉ COMME TEL. L'article 103 nomme « le registre défini à l'article R. 111-13 du code de la construction et de l'habitation ». Cet article du CCH N'A PAS ÉTÉ OUVERT dans ce lot. La recodification du CCH de 2021 a déplacé la numérotation R. 111-*, et ce renvoi peut désigner aujourd'hui un autre article que celui que le rédacteur de 2015 visait. L'obligation ne repose pas dessus — elle repose sur les articles 101, 103 et 104 relevés au verbatim — mais la description reprend le contenu que l'article 103 attache à ce renvoi. À rouvrir : si R. 111-13 impose davantage, la description est incomplète.\n\nNATURE : ÉTAT PERMANENT, `pieceAttendue: \"registre de sécurité\"` (ADR-026). Un registre tenu, pas un acte à refaire à date.",
  },
  {
    id: "habitation-consignes-plans-intervention",
    domaine: "incendie",
    libelle:
      "Affichage des consignes d'incendie et des plans d'intervention (immeuble d'habitation)",
    description:
      "Le propriétaire — ou la personne responsable qu'il désigne — affiche dans les halls d'entrée, près des accès aux escaliers et aux ascenseurs, les consignes à respecter en cas d'incendie ainsi que les plans des sous-sols et du rez-de-chaussée. Les consignes particulières à l'immeuble sont également affichées dans les parcs de stationnement, s'il en existe, à proximité des accès aux escaliers et aux ascenseurs. Les plans d'intervention portent au minimum l'emplacement des cloisonnements principaux et des cheminements des sous-sols, les dégagements et voies permettant d'atteindre l'extérieur, l'emplacement des ascenseurs et monte-charge avec leurs accès, celui des locaux poubelles et réceptacles de vide-ordures, et celui des moyens de secours — notamment les prises de colonnes sèches et les commandes de désenfumage.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference:
          "Arrêté du 31 janvier 1986, art. 100 (affichage des consignes et des plans d'intervention)",
        article: "Arrêté 1986-01-31 art. 100",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006828538",
        note: "« Le propriétaire ou, le cas échéant, la personne responsable désignée par ses soins, est tenu d'afficher dans les halls d'entrée, près des accès aux escaliers et aux ascenseurs : les consignes à respecter en cas d'incendie ; les plans de sous-sols et du rez-de-chaussée. » Relevé sur Légifrance le 2026-09-01. Version en vigueur depuis le 1er octobre 2015, arrêté du 19 juin 2015 - art. 9.",
        versionConstatee: "2015-10-01",
      },
    ],
    periodicite: "autre",
    nature: "etat_permanent",
    pieceAttendue: "consignes d'incendie et plans d'intervention affichés",
    realisateurs: ["exploitant"],
    criticite: 4,
    transmet: [],
    porteur: "etablissement",
    typologies: { habitation: true },
    notesInternes:
      "Créée le 2026-09-01. À ne pas confondre avec `incendie-travail-consigne-affichee`, fondée sur R. 4227-37 et s. du Code du travail et due à l'employeur : celle-ci est due au propriétaire d'un immeuble d'habitation, y compris sans aucun salarié, et son contenu est différent — le Code du travail ne demande pas de plan des sous-sols ni l'emplacement des prises de colonnes sèches.\n\nPAS DE RESTRICTION DE FAMILLE : l'article 100 n'en mentionne aucune. Une maison individuelle de 1ʳᵉ famille n'a ni hall d'entrée ni accès commun aux escaliers, si bien que l'affichage y est matériellement sans objet — mais c'est une conséquence de fait, pas une dispense écrite, et l'encoder en `familles` ferait dire au texte ce qu'il ne dit pas. Le moteur retenant l'obligation lorsque la famille n'est pas renseignée, un propriétaire de maison individuelle peut voir la ligne : elle est visible, donc corrigible en renseignant la famille, ce qui est le sens qui a été donné à cette dissymétrie.\n\nDEUX RÉGIMES DANS UN SEUL ARTICLE, et l'obligation ne les sépare pas. L'affichage des consignes est d'origine (1986). La liste des cinq éléments du plan d'intervention a été ajoutée par l'arrêté du 19 juin 2015, dont l'article d'application la réserve aux bâtiments dont le permis de construire a été déposé après le 1er octobre 2015. Le modèle porte bien une année de permis de construire côté établissement, mais `TypologieApplication` ne sait pas conditionner sur elle. La ligne est donc écrite au régime le plus complet : un propriétaire d'immeuble antérieur à 2015 se verra demander un plan d'intervention que l'arrêté ne lui impose pas dans cette forme. Sur-application assumée et bornée — le contenu du plan, pas l'affichage lui-même — plutôt que de taire la liste, auquel cas les immeubles postérieurs à 2015 ne sauraient pas ce qu'on attend d'eux.\n\nNATURE : ÉTAT PERMANENT, `pieceAttendue` non nulle (ADR-026). Ce qui est dû est un écrit affiché : une case cochée sans consigne au mur serait la déclaration-qui-ressemble-à-une-preuve que l'écran d'états permanents interdit.",
  },
];
