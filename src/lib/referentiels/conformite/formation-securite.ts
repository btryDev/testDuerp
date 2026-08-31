/**
 * Domaine « formation à la sécurité » — obligations d'information et de
 * formation (L. 4141-1 et s., R. 4141-1 et s.) et conduite d'équipements
 * (R. 4323-55 et s.).
 *
 * C'EST LE PREMIER DOMAINE DU RÉFÉRENTIEL QUI NE NAÎT D'AUCUN ÉQUIPEMENT.
 * Les dix domaines précédents partent tous d'une chose déclarée au parc — un
 * tableau électrique, un ascenseur, une hotte. Ici, le déclencheur est le
 * statut d'employeur : dès le premier salarié, sans condition de secteur,
 * d'effectif ni de matériel.
 *
 * POURQUOI CE FICHIER EXISTE. La question qui a ouvert le chantier était :
 * « et sur Camille qui est électricienne, il n'y a pas une formation
 * obligatoire ? ou je suis censée le voir où ? ». Le produit savait déjà DIRE
 * qu'un titre nominatif manquait (ADR-024) ; il n'avait aucune ligne de
 * catalogue à proposer. Le catalogue des titres de salarié en comptait
 * exactement une, l'attestation médicale de `R. 4544-11-1`.
 *
 * AUCUNE PÉRIODICITÉ N'EST INVENTÉE ICI, ET C'EST LE POINT DÉLICAT.
 * Le chapitre `R. 4141-*` ne chiffre aucune durée, et `L. 4141-2` renvoie la
 * répétition à « des conditions déterminées par voie réglementaire ou par
 * convention ou accord collectif de travail » — conditions que le règlement
 * n'a jamais fixées. Toutes les obligations de formation de ce fichier portent
 * donc `periodicite: "autre"` : un état à maintenir, pas un rendez-vous.
 * **Aucune obligation de ce fichier ne porte de périodicité chiffrée**, et ce
 * n'est pas un manque de dépouillement : c'est ce que les textes disent.
 *
 * La seule durée écrite de la section 7 — les cinq ans de l'attestation
 * médicale de `R. 4323-56` — n'est pas ici : elle est délivrée par le médecin
 * du travail et vit dans le domaine `sante_travail`, où l'annuaire attend un
 * service de prévention et de santé au travail et non un organisme de
 * formation. `conduite-salarie-autorisation` la nomme par une transmission,
 * puisque sa propre validité en dépend.
 *
 * Ce dépôt a déjà eu à retirer un « triennal » venu d'une norme NF et non du
 * droit. Une échéance inventée dans un outil de conformité est pire qu'une
 * échéance absente : elle se présente à un contrôle.
 */

import type { Obligation } from "./types";

export const obligationsFormationSecurite: Obligation[] = [
  // ---------------------------------------------------------------------------
  // Information et formation à la sécurité (L. 4141-*, R. 4141-*)
  // ---------------------------------------------------------------------------
  {
    id: "formation-securite-etablissement-organisation",
    domaine: "formation_securite",
    libelle: "Organiser la formation à la sécurité des salariés",
    description:
      "L'employeur organise une formation pratique et appropriée à la sécurité pour les travailleurs qu'il embauche, ceux qui changent de poste ou de technique, les salariés temporaires, et — à la demande du médecin du travail — ceux qui reprennent après un arrêt d'au moins vingt et un jours. Elle porte sur les conditions de circulation, les conditions d'exécution du travail et la conduite à tenir en cas d'accident. Le Code ne fixe aucune périodicité de renouvellement : il la renvoie à un règlement qui ne l'a pas fixée, ou à un accord collectif. C'est donc une obligation permanente, à maintenir, et non une échéance qui tombe à date.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "L. 4141-2 (formation pratique et appropriée à la sécurité, bénéficiaires)",
        article: "L. 4141-2",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006903166",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4141-3 (objet et contenu de la formation)",
        article: "R. 4141-3",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532878",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4141-11 (formation aux conditions de circulation)",
        article: "R. 4141-11",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532860",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4141-13 (formation aux conditions d'exécution du travail)",
        article: "R. 4141-13",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532854",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4141-15 (tâches ouvrant droit à formation en cas de création ou modification de poste)",
        article: "R. 4141-15",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532850",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4141-17 (objet de la formation à la conduite à tenir en cas d'accident)",
        article: "R. 4141-17",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532844",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4141-6 (association du médecin du travail à l'élaboration des actions de formation)",
        article: "R. 4141-6",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000019960823",
        versionConstatee: "2008-12-20",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4141-9 (formation à la reprise après un arrêt d'au moins vingt et un jours, à la demande du médecin du travail)",
        article: "R. 4141-9",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532866",
        versionConstatee: "2008-05-01",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 4,
    typologies: { travail: true },
    porteur: "etablissement",
    transmet: [
      {
        vers: "salarie_designe",
        titre: "formation-securite-salarie-accueil",
        motif:
          "L'obligation d'organiser est portée par l'établissement, mais elle ne se solde que salarié par salarié : R. 4141-20 fait courir un délai « à compter de l'affectation du travailleur à son emploi », et L. 4141-5 (passeport de prévention) confirme depuis le 27 juin 2026 que ces formations produisent des attestations et certificats nominatifs. Le produit ne peut pas deviner qui a été formé et quand : l'employeur le déclare.",
      },
    ],
    notesInternes:
      "PORTEUR ÉTABLISSEMENT, ET C'EST UN CHOIX ARGUMENTÉ. Le texte écrit « L'employeur organise » : le sujet de l'obligation est l'employeur, et l'obligation d'organiser existe dès qu'il y a un salarié, même si aucun titre n'a été déclaré dans l'outil. Une seule ligne, indépendante des équipements — exactement la sémantique de l'ADR-022.\n\nPOURQUOI ELLE N'EST PAS SEULE. `formation-securite-salarie-accueil` la double côté salarié, et ce n'est pas une redondance : la première est due même avec zéro titre déclaré, la seconde ne produit de ligne que par personne déclarée. Les fondre aurait forcé un choix entre deux erreurs — soit une obligation qui disparaît quand personne n'est déclaré (alors qu'elle est due dès le premier salarié), soit une obligation qui ne se solde jamais nominativement (alors que le délai d'un mois de R. 4141-20 court par travailleur). Le brief du lot 7 posait la question — « les deux existent peut-être, et alors ce sont deux obligations » — et la lecture du texte répond oui.\n\nPÉRIODICITÉ « AUTRE », DÉLIBÉRÉMENT. L. 4141-2 dit « répétée périodiquement dans des conditions déterminées par voie réglementaire ou par convention ou accord collectif de travail ». Les vingt articles R. 4141-* ne fixent aucune durée — vérifié article par article le 2026-08-31 —, et l'autre branche renvoie aux accords collectifs, que l'outil ne lit pas. Écrire « annuelle » aurait fabriqué une échéance que le droit ne porte pas.\n\nCE QUE L'ARTICLE R. 4141-6 IMPOSE ET QUE L'OUTIL NE TRACE PAS : l'association du médecin du travail à l'élaboration des actions de formation. Aucun champ ne la porte, et en créer un sans arbitrage donnerait une case à cocher invérifiable. La référence est citée, la réserve est au corpus.\n\nDEUX ARTICLES DU CHAPITRE RESTENT NON ENCODÉS, tous deux événementiels : R. 4141-8 (formation après accident grave ou accidents répétés) et R. 4141-12 (après modification des conditions de circulation ou d'exploitation). Ils sont inscrits au corpus en `obligation_manquante`. Il n'y a pas de déclencheur « événement » dans le modèle, et le registre des accidents du travail est hors périmètre.",
  },

  {
    id: "formation-securite-salarie-accueil",
    domaine: "formation_securite",
    libelle: "Formation à la sécurité reçue par le salarié",
    description:
      "Chaque travailleur bénéficie de la formation à la sécurité lors de son embauche, lors d'un changement de poste ou de technique, et lorsqu'il est affecté à l'une des tâches énumérées par R. 4141-15 (machines, produits chimiques, manutention, entretien, conduite d'engins, échafaudages, travaux sur cordes, contact avec des animaux dangereux). Le volet « conduite à tenir en cas d'accident ou de sinistre » est dispensé dans le mois qui suit l'affectation à l'emploi. Aucun texte ne fixe de durée de validité : la formation reçue n'expire pas, elle se complète quand le poste change.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4141-20 (formation dispensée dans le mois qui suit l'affectation du travailleur à son emploi)",
        article: "R. 4141-20",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532838",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "L. 4141-2 (bénéficiaires : embauche, changement de poste, salariés temporaires, reprise)",
        article: "L. 4141-2",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006903166",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4141-2 (information et formation dispensées lors de l'embauche et chaque fois que nécessaire)",
        article: "R. 4141-2",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000019960813",
        versionConstatee: "2008-12-20",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4141-15 (tâches concernées)",
        article: "R. 4141-15",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532850",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4141-16 (changement de poste de travail ou de technique)",
        article: "R. 4141-16",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532848",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4141-18 (bénéficiaires de la formation à la conduite à tenir en cas d'accident)",
        article: "R. 4141-18",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532842",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4141-19 (formation à la conduite à tenir lors d'un changement de poste)",
        article: "R. 4141-19",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532840",
        versionConstatee: "2008-05-01",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 4,
    typologies: { travail: true },
    porteur: "salarie",
    pieceMedicale: false,
    transmet: [],
    notesInternes:
      "C'EST LA LIGNE DE CATALOGUE QUI RÉPOND À LA QUESTION DE CAMILLE. Jusqu'ici le catalogue des titres de salarié n'en comptait qu'une, l'attestation médicale de R. 4544-11-1, et la transmission de l'habilitation électrique déclarait `titre: null`. Celle-ci est due à TOUS les salariés, pas seulement aux électriciens.\n\nPOURQUOI UN TITRE ALORS QUE LE TEXTE DIT « L'EMPLOYEUR ORGANISE ». Deux raisons écrites. D'abord R. 4141-20 : le délai d'un mois court « à compter de l'affectation DU TRAVAILLEUR à son emploi » — c'est une date par personne, pas par établissement. Ensuite L. 4141-5, en vigueur depuis le 27 juin 2026 : le passeport de prévention « comporte les attestations, certificats, certifications professionnelles et diplômes obtenus dans le cadre des formations relatives à la santé et à la sécurité au travail mentionnées au même article L. 4141-2 ». Le droit affirme donc lui-même que ces formations produisent une pièce nominative. C'est l'argument décisif, et il est récent.\n\nPÉRIODICITÉ « AUTRE » ET `echeanceLe` NULLE. Aucun texte ne donne de durée de validité à la formation à la sécurité. `TitreSalarie.echeanceLe` est nullable précisément pour ce cas — c'est déjà celui de l'habilitation électrique. Une formation reçue reste acquise ; elle se complète lors d'un changement de poste, ce qui est un événement, pas une expiration.\n\nLE DÉLAI D'UN MOIS N'EST PAS CALCULÉ. Il court depuis l'affectation à l'emploi, et le modèle ne porte pas la date d'affectation : `TitreSalarie.delivreLe` est la date de la formation reçue, pas celle de l'embauche. Le mois est rappelé en description, il n'engendre aucune ligne de calendrier. L'exposer supposerait un champ « date d'affectation » sur `Salarie`, qui n'existe pas et que ce lot n'a pas à créer.\n\n`pieceMedicale: false` — une attestation de formation à la sécurité n'a rien de médical. Le drapeau est requis pour que l'oubli ne compile pas ; ici il est faux à bon droit, et l'interface peut proposer d'en conserver la trace.",
  },

  {
    id: "formation-securite-etablissement-information",
    domaine: "formation_securite",
    libelle: "Informer les salariés sur les risques et l'accès au DUERP",
    description:
      "L'employeur informe les travailleurs, d'une manière compréhensible pour chacun, sur les risques pour leur santé et leur sécurité. Cette information porte notamment sur les modalités d'accès au document unique d'évaluation des risques, sur les mesures de prévention qu'il retient, sur le rôle du service de santé au travail, sur le règlement intérieur le cas échéant, et sur les consignes de sécurité incendie ainsi que l'identité des personnes chargées de l'évacuation. Obligation permanente : elle est due à l'embauche et chaque fois que nécessaire.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "L. 4141-1 (obligation générale d'information)",
        article: "L. 4141-1",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000027326445",
        versionConstatee: "2013-04-18",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4141-3-1 (contenu de l'information due aux travailleurs)",
        article: "R. 4141-3-1",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000021723595",
        versionConstatee: "2010-01-23",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4141-2 (information dispensée lors de l'embauche et chaque fois que nécessaire)",
        article: "R. 4141-2",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000019960813",
        versionConstatee: "2008-12-20",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true },
    porteur: "etablissement",
    transmet: [],
    notesInternes:
      "INFORMER N'EST PAS FORMER, ET LE CHAPITRE LE DIT DANS SON TITRE : « Obligation générale d'information ET de formation ». L. 4141-1 porte l'information, L. 4141-2 la formation ; R. 4141-3-1 détaille le contenu de la première, R. 4141-3 celui de la seconde. Les fondre en une obligation « information et formation » aurait effacé la distinction que le Code prend soin de faire.\n\nCELLE-CI EST PARTICULIÈREMENT UTILE À UNE TPE, et c'est ce qui a fait qu'elle est encodée plutôt que laissée en `obligation_manquante` : le 1° de R. 4141-3-1 impose d'informer les salariés des MODALITÉS D'ACCÈS AU DUERP. Un dirigeant qui tient son document unique dans cet outil et ne l'a jamais montré à ses salariés est en défaut sur ce point précis, et ne le sait pas.\n\nPORTEUR ÉTABLISSEMENT et périodicité « autre » : c'est un état à maintenir, dû à l'embauche et « chaque fois que nécessaire » (R. 4141-2). Aucune durée n'est écrite, aucune n'est inventée.\n\nCriticité 3 et non 4 : le manquement est réel et sanctionnable, mais il n'expose pas directement à un dommage corporel comme l'absence de formation elle-même.",
  },

  // ---------------------------------------------------------------------------
  // Conduite d'équipements mobiles automoteurs et de levage (R. 4323-55 et s.)
  // ---------------------------------------------------------------------------
  {
    id: "conduite-salarie-formation",
    domaine: "formation_securite",
    libelle: "Formation à la conduite d'équipements mobiles ou de levage",
    description:
      "La conduite des équipements de travail mobiles automoteurs et des équipements servant au levage est réservée aux travailleurs ayant reçu une formation adéquate, complétée et réactualisée chaque fois que nécessaire. Le Code ne fixe aucune durée de validité ni aucun rythme de recyclage : c'est un acquis à entretenir, pas une échéance. Le CACES est l'un des moyens usuels de démontrer cette formation ; il n'est pas exigé par le Code du travail.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4323-55 (conduite réservée aux travailleurs ayant reçu une formation adéquate)",
        article: "R. 4323-55",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531407",
        versionConstatee: "2008-05-01",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 5,
    typologies: { travail: true },
    porteur: "salarie",
    pieceMedicale: false,
    transmet: [],
    notesInternes:
      "LE CACES N'EST PAS ENCODÉ, ET C'EST DÉLIBÉRÉ. Il n'apparaît dans aucun des trois articles de la section 7 — vérifié le 2026-08-31 sur les trois. C'est un dispositif conventionnel porté par des recommandations de la Caisse nationale d'assurance maladie ; le Code exige une « formation adéquate » et une « autorisation de conduite », jamais un CACES. L'encoder comme obligation réglementaire aurait fait entrer une source non opposable dans un référentiel qui n'en accepte aucune (ADR-003).\n\nAUCUN RECYCLAGE QUINQUENNAL. Les cinq ans que l'on rencontre partout sont la durée de validité d'un CACES, fixée par les recommandations CNAM — pas par le droit. R. 4323-55 dit « complétée et réactualisée chaque fois que nécessaire », sans chiffre. C'est exactement la configuration du « triennal » que ce dépôt a déjà eu à retirer, et la réponse est la même : `periodicite: \"autre\"`.\n\nATTENTION À NE PAS CONFONDRE avec `conduite-salarie-attestation-medicale`, qui porte bien cinq ans — mais parce que R. 4323-56 les écrit, et ils s'appliquent à l'attestation médicale, pas à la formation.\n\nQUELS ÉQUIPEMENTS ? R. 4323-55 vise « les équipements de travail mobiles automoteurs et les équipements de travail servant au levage » — sans liste. Le porteur salarié évite d'avoir à trancher : aucune ligne ne naît d'un équipement déclaré, l'employeur déclare qui conduit quoi.",
  },

  {
    id: "conduite-salarie-autorisation",
    domaine: "formation_securite",
    libelle: "Autorisation de conduite délivrée par l'employeur",
    description:
      "La conduite de certains équipements présentant des risques particuliers est subordonnée à une autorisation de conduite délivrée par l'employeur. L'autorisation et une copie de l'attestation médicale sont tenues à la disposition de l'inspection du travail et des services de prévention des organismes de sécurité sociale. Le Code ne donne aucune durée de validité à l'autorisation elle-même : elle vaut tant qu'elle n'est pas retirée — mais sa validité est subordonnée à celle de l'attestation médicale, qui vaut cinq ans.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4323-56, alinéa 1 (autorisation de conduite délivrée par l'employeur)",
        article: "R. 4323-56",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769343",
        versionConstatee: "2025-10-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4323-57 (arrêtés fixant les catégories d'équipements soumises à autorisation)",
        article: "R. 4323-57",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531403",
        versionConstatee: "2008-05-01",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 5,
    typologies: { travail: true },
    porteur: "salarie",
    pieceMedicale: false,
    transmet: [
      {
        vers: "salarie_designe",
        titre: "conduite-salarie-attestation-medicale",
        motif:
          "R. 4323-56 : « La validité de cette autorisation de conduite est subordonnée à la détention, par le travailleur, d'une attestation qu'il ne présente pas de contre-indications médicales ». L'autorisation ne porte pas d'échéance propre, mais elle tombe avec l'attestation — qui, elle, expire au bout de cinq ans. Le produit ne dérive pas ce lien : il le nomme, pour qu'une autorisation déclarée sans attestation ne passe pas pour complète.",
      },
    ],
    notesInternes:
      "PAS D'ÉCHÉANCE DANS LE TEXTE, ET C'EST LA RÉPONSE À LA QUESTION POSÉE PAR LE BRIEF. R. 4323-56 a été relu en entier le 2026-08-31 dans sa version du 1er octobre 2025 : aucune durée n'est attachée à l'autorisation de conduite. Les cinq ans qu'il mentionne portent sur l'attestation médicale, et sur elle seule. `periodicite: \"autre\"` — un état à maintenir.\n\nMAIS LA VALIDITÉ EST CHAÎNÉE, et c'est ce que la transmission dit. Une autorisation sans attestation valide n'est plus valide, alors même que rien ne la fait « expirer » au calendrier. C'est précisément le cas que l'ADR-024 existe pour nommer : le produit ne dérive pas, il déclare.\n\nLE RÉFÉRENTIEL NE PEUT PAS DIRE QUELS ÉQUIPEMENTS SONT CONCERNÉS. R. 4323-57, 2° confie à des arrêtés le soin de fixer « les catégories d'équipements de travail dont la conduite nécessite d'être titulaire d'une autorisation de conduite ». Un arrêté du 26 septembre 2025 relatif à la formation à la conduite existe ; il n'est pas dépouillé, donc aucune obligation ne s'y appuie et aucune liste d'équipements n'est encodée. Le corpus le dit en toutes lettres.",
  },
];
