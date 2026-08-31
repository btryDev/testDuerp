/**
 * Domaine « santé au travail » — suivi individuel de l'état de santé
 * (R. 4624-10 et s.) et attestation médicale de conduite (R. 4323-56).
 *
 * CE FICHIER EST LE PLUS SENSIBLE DU RÉFÉRENTIEL, ET IL FAUT LE LIRE COMME TEL.
 * Il fait passer le produit d'« une attestation médicale liée à l'habilitation
 * électrique » à « le suivi médical de tous les salariés ». Ce n'est pas une
 * extension technique : c'est un changement de ce que l'outil détient sur des
 * personnes. La décision a été prise par la propriétaire du produit, avec un
 * objectif énoncé — aider un dirigeant de TPE/PME sur une obligation basique
 * qu'il ignore souvent avoir.
 *
 * CE QUI REND CETTE EXTENSION ACCEPTABLE, et qui ne doit pas se desserrer d'un
 * cran : `docs/rgpd.md` § 2.3. L'outil ne détient que **l'existence, la date et
 * l'échéance**. Jamais l'avis d'aptitude ou d'inaptitude. Jamais une
 * restriction. Jamais un motif. Jamais la pièce. Toutes les obligations salarié
 * de ce fichier portent `pieceMedicale: true`, pour que l'interface ne propose
 * même pas le téléversement.
 *
 * LES PÉRIODICITÉS SONT DES PLAFONDS. Le Code écrit « qui ne peut excéder cinq
 * ans » (R. 4624-16) et « qui ne peut être supérieure à quatre ans »
 * (R. 4624-28) : dans les deux cas c'est le médecin du travail qui fixe le
 * délai réel, plus court, au vu de l'âge, de l'état de santé et des risques.
 * Les nombres encodés sont donc la borne extérieure — la date au-delà de
 * laquelle l'employeur est nécessairement en défaut — et non le rythme retenu
 * par le médecin.
 *
 * Ce n'est PAS une périodicité inventée : cinq et quatre ans sont écrits dans
 * le Code, contrairement au « triennal » venu d'une norme NF que ce dépôt a eu
 * à retirer. Mais un dirigeant qui lirait « échéance dans cinq ans » là où son
 * médecin a fixé trois ans serait mal informé. D'où deux garde-fous : chaque
 * `description` dit que le délai est un maximum que le médecin peut raccourcir,
 * et `TitreSalarie.echeanceLe`, déclaré par l'employeur, prime sur tout calcul.
 * Le second est décisif — sans lui, encoder un plafond aurait été indéfendable.
 *
 * VIP ET SIR NE SE CUMULENT JAMAIS. R. 4624-24 est explicite : l'examen
 * d'aptitude du suivi renforcé « se substitue à la visite d'information et de
 * prévention prévue à l'article R. 4624-10 ». Un salarié relève de l'un ou de
 * l'autre. Comme les lignes naissent de titres déclarés par l'employeur, rien
 * n'empêche matériellement de déclarer les deux — c'est à l'interface de ne pas
 * y inviter, et la note de chaque obligation le dit.
 */

import type { Obligation } from "./types";

export const obligationsSanteTravail: Obligation[] = [
  {
    id: "sante-travail-salarie-vip",
    domaine: "sante_travail",
    libelle: "Visite d'information et de prévention (VIP)",
    description:
      "Tout travailleur bénéficie d'une visite d'information et de prévention, réalisée par un professionnel de santé du service de prévention et de santé au travail, dans un délai qui n'excède pas trois mois à compter de la prise effective du poste. Elle est ensuite renouvelée selon une périodicité fixée par le médecin du travail, qui ne peut excéder cinq ans. Attention : ces cinq ans sont un maximum légal, pas un rythme. Le médecin du travail fixe un délai plus court s'il le juge nécessaire au regard des conditions de travail, de l'âge, de l'état de santé et des risques — et c'est alors ce délai-là qui s'impose.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4624-16 (renouvellement selon une périodicité qui ne peut excéder cinq ans)",
        article: "R. 4624-16",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769063",
        versionConstatee: "2017-01-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4624-10 (visite initiale dans un délai n'excédant pas trois mois à compter de la prise effective du poste)",
        article: "R. 4624-10",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769085",
        versionConstatee: "2017-01-01",
      },
    ],
    periodicite: "quinquennale",
    realisateurs: ["professionnel_sante_travail"],
    criticite: 4,
    typologies: { travail: true },
    porteur: "salarie",
    pieceMedicale: true,
    transmet: [],
    notesInternes:
      "UNE OBLIGATION ET NON DEUX, malgré deux articles. R. 4624-10 (visite initiale, trois mois) et R. 4624-16 (renouvellement, cinq ans) décrivent la MÊME visite à deux moments de sa vie, pas deux rendez-vous distincts. En faire deux obligations aurait produit deux lignes de calendrier par salarié pour une seule visite — l'excès inverse du défaut que l'ADR-022 a corrigé. Le test du découpage est : le texte crée-t-il deux choses à suivre séparément ? Ici, non.\n\nLE DÉLAI DE TROIS MOIS N'EST PAS CALCULÉ. Il court depuis la prise effective du poste, et le modèle ne porte pas cette date : `TitreSalarie.delivreLe` est la date de la visite reçue. Le délai est rappelé en description ; l'exposer supposerait un champ « date de prise de poste » sur `Salarie`, qui n'existe pas.\n\nLES CINQ ANS SONT UN PLAFOND, PAS UN RYTHME. Verbatim relevé le 2026-08-31 : « selon une périodicité qui ne peut excéder cinq ans. Ce délai […] est fixé par le médecin du travail dans le cadre du protocole ». Encoder `quinquennale` revient à annoncer la borne extérieure DU RÉGIME GÉNÉRAL — et il faut lire la suite, parce que la première rédaction de cette note s'est trompée ici. Cinq ans n'est PAS « la borne au-delà de laquelle l'employeur est nécessairement en défaut » pour tout le monde : `R. 4624-17` ramène la périodicité à trois ans au plus pour le travailleur handicapé, celui qui déclare une pension d'invalidité et le travailleur de nuit. Ces salariés relèvent de `sante-travail-salarie-vip-adaptee`, pas de cette obligation-ci. C'est défendable — le nombre est dans le texte, et sans lui le produit ne dirait rien du tout, ce qui était l'état précédent — mais ce n'est vrai que parce que `TitreSalarie.echeanceLe` déclaré par l'employeur prime sur le calcul. Un dirigeant dont le médecin a fixé trois ans saisit trois ans, et l'outil ne le contredit pas. Ne retirez pas la primauté d'`echeanceLe` sans repasser cette obligation à `autre` : c'est elle, et elle seule, qui empêche le plafond de se présenter comme un rendez-vous. Signalé au rapport du lot 7 comme le choix le plus discutable du lot.\n\nEXCLUSIF DU SIR. R. 4624-24 : l'examen d'aptitude du suivi renforcé « se substitue à la visite d'information et de prévention prévue à l'article R. 4624-10 ». Un salarié a l'un ou l'autre, jamais les deux. Rien dans le modèle ne l'empêche matériellement puisque l'employeur déclare les titres ; l'interface ne doit pas proposer les deux pour la même personne.\n\nCE QUE L'OUTIL DÉTIENT : que la visite a eu lieu, quand, quand la suivante est due. Rien d'autre. `pieceMedicale: true` (docs/rgpd.md § 2.3).",
  },

  {
    id: "sante-travail-salarie-sir",
    domaine: "sante_travail",
    libelle: "Suivi individuel renforcé — examen par le médecin du travail",
    description:
      "Le travailleur affecté à un poste présentant des risques particuliers bénéficie d'un suivi individuel renforcé. Il commence par un examen médical d'aptitude réalisé par le médecin du travail avant l'affectation sur le poste, qui remplace la visite d'information et de prévention. Cet examen est ensuite renouvelé par le médecin du travail selon une périodicité qu'il détermine et qui ne peut être supérieure à quatre ans. Ces quatre ans sont un maximum légal : le médecin du travail fixe un délai plus court s'il le juge nécessaire.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4624-28 (renouvellement par le médecin du travail, périodicité ne pouvant excéder quatre ans)",
        article: "R. 4624-28",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769094",
        versionConstatee: "2017-01-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4624-22 (champ du suivi individuel renforcé : postes à risques particuliers)",
        article: "R. 4624-22",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769092",
        versionConstatee: "2017-01-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4624-24 (examen médical d'aptitude préalable à l'affectation, substitué à la VIP)",
        article: "R. 4624-24",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769104",
        versionConstatee: "2017-01-01",
      },
    ],
    periodicite: "quadriennale",
    realisateurs: ["medecin_travail"],
    criticite: 5,
    typologies: { travail: true },
    porteur: "salarie",
    pieceMedicale: true,
    transmet: [
      {
        vers: "salarie_designe",
        titre: "sante-travail-salarie-sir-visite-intermediaire",
        motif:
          "R. 4624-28 impose, entre deux examens du médecin du travail, une visite intermédiaire par un professionnel de santé au plus tard deux ans après. Elle a son propre rythme et son propre intervenant : elle est portée par une obligation distincte, et déclarer le suivi renforcé sans elle laisserait la moitié du dispositif hors du calendrier.",
      },
    ],
    notesInternes:
      "LE PRODUIT NE SAIT PAS QUELS POSTES SONT À RISQUES PARTICULIERS, ET NE DOIT PAS L'INVENTER. R. 4624-23 I énumère sept expositions — amiante, plomb, agents CMR, agents biologiques des groupes 3 et 4, rayonnements ionisants, hyperbare, chute de hauteur au montage d'échafaudages. Rien dans le modèle ne dit à quoi un salarié est exposé : le déduire serait le cinquième déclencheur (activité réellement exercée), non implémenté, et l'appliquer à tout l'effectif parce qu'un produit chimique figure au parc serait un faux positif de masse — exactement le raisonnement de l'ADR-023 sur l'habilitation électrique.\n\nMAIS LE TEXTE DONNE UNE PRISE, ET C'EST CE QUI REND CE LOT UTILE. R. 4624-23 III met à la charge de l'employeur une liste des postes à risques particuliers, motivée par écrit, transmise au service de prévention et de santé au travail et MISE À JOUR TOUS LES ANS. C'est une obligation d'établissement, datable, encodée sous `sante-travail-etablissement-liste-postes-risques`. L'outil ne devine donc pas qui relève du SIR : il rappelle au dirigeant qu'il doit lui-même tenir la liste qui le dit. C'est le seul chemin honnête entre dériver et se taire.\n\nUNE OBLIGATION POUR L'EXAMEN INITIAL ET SON RENOUVELLEMENT, comme pour la VIP : R. 4624-24 et R. 4624-28 décrivent le même examen à deux moments. La visite intermédiaire, elle, est séparée — autre intervenant, autre rythme, et elle s'intercale au lieu de succéder.\n\nQUATRE ANS = PLAFOND, PAS UN RYTHME, ET PAS POUR TOUT LE MONDE. « selon une périodicité qu'il détermine et qui ne peut être supérieure à quatre ans » — verbatim relevé le 2026-08-31. EXCEPTION relevée à la relecture, et elle porte sur une population que cette note citait elle-même comme couverte : `R. 4451-82` impose, pour le travailleur exposé aux rayonnements ionisants CLASSÉ EN CATÉGORIE A, une visite renouvelée CHAQUE ANNÉE, et exclut expressément la visite intermédiaire. Ces salariés relèvent de `sante-travail-salarie-sir-categorie-a`. C'est le médecin du travail qui fixe le délai réel, et il peut le raccourcir. Le chiffre encodé est la borne extérieure : la date au-delà de laquelle l'employeur est nécessairement en défaut, pas le rendez-vous que son médecin a retenu.\n\nCE QUI REND CET ENCODAGE ACCEPTABLE, et il faut le lire avant de toucher à la périodicité : `TitreSalarie.echeanceLe`, déclaré par l'employeur, PRIME SUR TOUT CALCUL. Un dirigeant dont le médecin a fixé deux ans saisit deux ans, et l'outil ne le contredit pas. Sans cette échappatoire, il aurait fallu passer à `autre` et ne rien dire du tout — ce qui était l'état précédent. Ne retirez pas la primauté d'`echeanceLe` sans repasser cette obligation à `autre`.\n\nCriticité 5 : par construction, ce suivi ne concerne que des postes exposant à l'amiante, au plomb, aux CMR, aux rayonnements ionisants — un manquement y est d'une autre nature qu'un retard de VIP en bureau. Amiante (`R. 4412-118`) et plomb (`R. 4412-160`) renvoient à R. 4624-22 à -28 sans y déroger, vérifié le 2026-08-31 ; les textes propres aux CMR, aux agents biologiques 3 et 4, au risque hyperbare et au montage d'échafaudages n'ont PAS été ouverts, et il ne faut pas conclure de ce silence qu'ils ne dérogent pas.\n\nEXCLUSIF DE LA VIP (R. 4624-24).",
  },

  {
    id: "sante-travail-salarie-sir-visite-intermediaire",
    domaine: "sante_travail",
    libelle: "Suivi individuel renforcé — visite intermédiaire",
    description:
      "Entre deux examens réalisés par le médecin du travail, le salarié en suivi individuel renforcé bénéficie d'une visite intermédiaire, effectuée par un professionnel de santé du service de prévention et de santé au travail, au plus tard deux ans après la visite avec le médecin du travail.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4624-28, seconde phrase (visite intermédiaire par un professionnel de santé, au plus tard deux ans après la visite avec le médecin du travail)",
        article: "R. 4624-28",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769094",
        versionConstatee: "2017-01-01",
      },
    ],
    periodicite: "biennale",
    realisateurs: ["professionnel_sante_travail"],
    criticite: 3,
    typologies: { travail: true },
    porteur: "salarie",
    pieceMedicale: true,
    transmet: [],
    notesInternes:
      "POURQUOI ELLE EST SÉPARÉE DU SIR, ET PAS FONDUE DEDANS. Trois différences écrites, pas une : elle est réalisée par un professionnel de santé et non par le médecin du travail ; son délai est de deux ans et non de quatre ; et elle s'INTERCALE entre deux examens au lieu de leur succéder. Fondue dans `sante-travail-salarie-sir` à quatre ans, elle disparaissait purement et simplement du calendrier — un salarié en suivi renforcé n'aurait vu qu'un rendez-vous sur deux. C'est la définition du silence que ce chantier existe pour retirer.\n\nDEUX ANS = PLAFOND, comme le reste du dispositif : « au plus tard deux ans après la visite avec le médecin du travail ». Le point de départ est la visite du médecin, pas la précédente visite intermédiaire — nuance que `Periodicite` n'exprime pas, une périodicité biennale se calculant depuis la dernière occurrence du même acte. En pratique les deux coïncident tant que le cycle est régulier ; ils divergent si le médecin raccourcit son propre rythme. `TitreSalarie.echeanceLe`, déclaré par l'employeur, PRIME SUR TOUT CALCUL, et c'est ce qui rend l'encodage d'un plafond acceptable ici comme pour la VIP et le SIR : le dirigeant qui connaît la date fixée par le service de santé la saisit, et l'outil ne la recalcule pas. Ne retirez pas cette primauté sans repasser l'obligation à `autre`.\n\nCriticité 3 : c'est une visite de veille intercalaire, pas l'examen d'aptitude qui conditionne l'affectation.\n\n`pieceMedicale: true` — même régime que tout ce fichier.",
  },

  {
    id: "sante-travail-etablissement-liste-postes-risques",
    domaine: "sante_travail",
    // Le libellé porte le conditionnel que la description portait déjà, et il
    // le doit : le III de R. 4624-23 s'ouvre sur « S'il le juge nécessaire,
    // l'employeur complète la liste… ». C'est l'établissement de la liste qui
    // est facultatif ; sa mise à jour annuelle ne l'est plus une fois qu'elle
    // existe. Un libellé impératif au calendrier — « Tenir à jour la liste » —
    // annonçait donc une obligation à des dirigeants qui n'en ont aucune,
    // faute d'avoir jugé nécessaire d'établir une liste. La périodicité reste
    // annuelle et ferme (ADR-022 § 7) ; c'est le libellé qui mentait, pas elle.
    libelle:
      "Liste des postes à risques particuliers : la mettre à jour, si vous en tenez une",
    description:
      "Lorsqu'il le juge nécessaire, l'employeur complète la liste légale des postes à risques particuliers par des postes propres à son établissement. Cette liste est établie après avis du médecin et du comité social et économique s'il existe, en cohérence avec l'évaluation des risques et la fiche d'entreprise ; chaque inscription est motivée par écrit. Elle est transmise au service de prévention et de santé au travail, tenue à disposition de l'administration et des services de prévention de la sécurité sociale, et mise à jour tous les ans.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4624-23, III (liste complétée par l'employeur, motivée par écrit, transmise au SPST et mise à jour tous les ans)",
        article: "R. 4624-23",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036483826",
        versionConstatee: "2026-04-10",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["exploitant"],
    criticite: 4,
    typologies: { travail: true },
    porteur: "etablissement",
    transmet: [
      {
        vers: "salarie_designe",
        titre: "sante-travail-salarie-sir",
        motif:
          "La liste des postes à risques particuliers est ce qui détermine quels salariés relèvent du suivi individuel renforcé. Le produit ne peut pas la calculer — rien ne dit à quoi chacun est exposé — mais il peut dire que la tenir est une obligation, et que le suivi renforcé des personnes qui y figurent se déclare ensuite nominativement.",
      },
    ],
    notesInternes:
      "L'ANNUELLE EST ÉCRITE, ET C'EST LA SEULE DE TOUT LE LOT 7. Verbatim relevé le 2026-08-31 : « Cette liste est transmise au service de prévention et de santé au travail, tenue à disposition […] et mise à jour tous les ans. » Pas un plafond, pas un « périodiquement » : une périodicité ferme. Contrairement aux cinq et quatre ans du suivi médical, celle-ci ne demande aucune précaution de lecture.\n\nPOURQUOI CETTE OBLIGATION COMPTE PLUS QUE SA TAILLE NE LE SUGGÈRE. Elle est la charnière du chantier C2. Le brief posait le problème ainsi : le SIR se déclenche sur un poste à risque, et le produit ne sait pas quels postes le sont. La réponse n'était ni de deviner ni de renoncer — elle est dans le texte. C'est l'EMPLOYEUR qui établit cette liste, et il doit la revoir chaque année. L'outil n'a donc pas à savoir : il a à rappeler que la question se pose, une fois par an.\n\nPORTEUR ÉTABLISSEMENT, une seule ligne. La liste est un document de l'établissement, pas un titre d'une personne.\n\nCE QUI N'EST PAS ENCODÉ. Le I de R. 4624-23 (les sept expositions légales) n'est pas un déclencheur : rien dans le modèle ne dit à quoi un salarié est exposé. Le II (postes conditionnés à un examen d'aptitude spécifique prévu par le Code) non plus. Le IV vise le Conseil d'orientation des conditions de travail, pas l'employeur. Le corpus porte la réserve.\n\nARTICLE LE PLUS RÉCENT DU RÉFÉRENTIEL : R. 4624-23 a été réécrit par le décret n° 2026-253 du 8 avril 2026, en vigueur au 10 avril 2026 — quatre mois avant ce dépouillement. La veille doit le surveiller de près.",
  },

  {
    id: "sante-travail-salarie-vip-adaptee",
    domaine: "sante_travail",
    libelle: "Visite d'information et de prévention — modalités adaptées",
    description:
      "Le travailleur dont l'état de santé, l'âge, les conditions de travail ou les risques le nécessitent bénéficie de modalités de suivi adaptées, selon une périodicité qui ne peut excéder trois ans — et non cinq. Le Code cite nommément le travailleur handicapé, celui qui déclare être titulaire d'une pension d'invalidité et le travailleur de nuit. Le travailleur de nuit et le travailleur de moins de dix-huit ans bénéficient en outre de leur visite d'information et de prévention AVANT leur affectation au poste, et non dans les trois mois qui suivent. Ces trois ans sont un maximum : le médecin du travail fixe un délai plus court s'il le juge nécessaire.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4624-17 (modalités de suivi adaptées, périodicité qui n'excède pas trois ans)",
        article: "R. 4624-17",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769059",
        versionConstatee: "2017-01-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4624-18 (visite préalable à l'affectation : travailleurs de nuit et travailleurs de moins de dix-huit ans)",
        article: "R. 4624-18",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769047",
        versionConstatee: "2017-01-01",
      },
    ],
    periodicite: "triennale",
    realisateurs: ["professionnel_sante_travail"],
    criticite: 4,
    typologies: { travail: true },
    porteur: "salarie",
    pieceMedicale: true,
    transmet: [],
    notesInternes:
      "CETTE OBLIGATION EXISTE PARCE QUE LA PRÉCÉDENTE MENTAIT. `sante-travail-salarie-vip` affirmait que cinq ans est « la borne au-delà de laquelle l'employeur est nécessairement en défaut ». C'est faux pour les travailleurs handicapés, les titulaires d'une pension d'invalidité et les travailleurs de nuit : `R. 4624-17` ramène la périodicité à trois ans au plus. Deux ans d'écart, dans le sens permissif — le pire sens pour un outil de conformité.\n\nCE QUE LE PRODUIT NE FAIT SURTOUT PAS : déduire qui est concerné. Rien dans le modèle ne dit qu'un salarié est handicapé ou titulaire d'une pension d'invalidité, et il ne faut PAS l'y mettre — ce serait une donnée sensible au sens du RGPD, très au-delà de ce que `docs/rgpd.md` § 2.3 autorise, et sans commune mesure avec l'existence d'une visite. Le questionnaire DUERP pose bien `q-travail-nuit`, mais elle porte sur l'ORGANISATION de l'établissement, pas sur des personnes nommées ; s'en servir pour désigner des salariés serait détourner une réponse d'établissement en donnée individuelle.\n\nL'employeur déclare le titre pour qui il sait concerné. C'est la règle de l'ADR-023, et elle est ici doublement justifiée : par le modèle, et par ce que l'outil s'interdit de savoir.\n\nLA VISITE PRÉALABLE DE R. 4624-18 N'EST PAS CALCULÉE. Elle renverse le calendrier d'entrée — avant l'affectation, quand R. 4624-10 admet trois mois après — mais le modèle ne porte pas la date d'affectation et `Periodicite` décrit une récurrence, pas un délai à compter d'un fait d'emploi. Elle est écrite dans la description.\n\nRECOUVREMENT PARTIEL À CONNAÎTRE : le travailleur de moins de dix-huit ans est visé par R. 4624-18 (visite préalable) mais PAS par R. 4624-17 (trois ans). Il relève donc du rythme général de cinq ans avec une visite d'entrée anticipée. Les deux articles ne se superposent pas, et cette obligation les porte tous les deux — c'est le cas le moins net du lot, faute d'un modèle qui distingue un délai d'entrée d'une périodicité.\n\nEXCLUSIF de `sante-travail-salarie-vip` : c'est la même visite, à un rythme adapté, pas une visite de plus.\n\nTROIS ANS = PLAFOND. Comme partout dans ce fichier, `TitreSalarie.echeanceLe` déclaré par l'employeur PRIME SUR TOUT CALCUL, et c'est ce qui rend l'encodage d'un plafond acceptable. Ne retirez pas cette primauté sans repasser l'obligation à `autre`.",
  },

  {
    id: "sante-travail-salarie-sir-categorie-a",
    domaine: "sante_travail",
    libelle:
      "Suivi individuel renforcé — rayonnements ionisants, catégorie A",
    description:
      "Pour le travailleur exposé aux rayonnements ionisants et classé en catégorie A, la visite médicale du suivi individuel renforcé est renouvelée chaque année — et non tous les quatre ans. La visite intermédiaire prévue pour le suivi renforcé de droit commun n'est pas requise.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4451-82 (catégorie A : visite renouvelée chaque année, visite intermédiaire non requise)",
        article: "R. 4451-82",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037024438",
        versionConstatee: "2018-07-01",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["medecin_travail"],
    criticite: 5,
    typologies: { travail: true },
    porteur: "salarie",
    pieceMedicale: true,
    transmet: [],
    notesInternes:
      "DEUX DÉROGATIONS, ET LA SECONDE COMPTE AUTANT QUE LA PREMIÈRE. `R. 4451-82` écrit : « Pour un travailleur classé en catégorie A, la visite médicale mentionnée à l'article R. 4624-28 est renouvelée chaque année. La visite intermédiaire mentionnée au même article n'est pas requise. » Verbatim relevé le 2026-08-31, version en vigueur du 2018-07-01 (décret n° 2018-437 du 4 juin 2018).\n\nLa périodicité passe donc de quatre ans à un an, ET la visite intermédiaire biennale disparaît. Déclarer `sante-travail-salarie-sir-visite-intermediaire` à un travailleur de catégorie A inscrirait au calendrier une échéance que le droit EXCLUT expressément — c'est le genre d'échéance inventée qui se présente à un contrôle. L'interface ne doit pas proposer les deux ensemble.\n\nPOURQUOI UNE OBLIGATION À PART plutôt qu'une condition sur le SIR. Les conditions du modèle (`ConditionApplication`) portent sur des propriétés d'ÉQUIPEMENT ; elles sont d'ailleurs interdites sur un porteur salarié. Et surtout, la classification en catégorie A (`R. 4451-57`) est un fait que le produit ne détient pas et ne dérivera pas. Une ligne de catalogue distincte, que l'employeur choisit, est le seul mécanisme disponible — et c'est le bon : il déclare ce qu'il sait.\n\nCETTE ANNUELLE EST FERME, pas un plafond : « est renouvelée chaque année », sans « au plus » ni « qui ne peut excéder ». C'est la seule périodicité de suivi médical du référentiel dans ce cas, avec l'annuelle de la liste des postes à risques. `TitreSalarie.echeanceLe` prime malgré tout, comme partout.\n\nCriticité 5 : exposition aux rayonnements ionisants, catégorie la plus exposée du classement.\n\nCE QUI RESTE NON OUVERT, et qu'il ne faut pas prendre pour une absence de dérogation : les textes propres aux quatre autres expositions du `R. 4624-23 I` — agents CMR, agents biologiques des groupes 3 et 4, risque hyperbare, montage d'échafaudages. Amiante (`R. 4412-118`) et plomb (`R. 4412-160`) renvoient à R. 4624-22 à -28 sans y déroger, vérifié le 2026-08-31.",
  },

  {
    id: "conduite-salarie-attestation-medicale",
    domaine: "sante_travail",
    libelle:
      "Attestation médicale d'absence de contre-indication à la conduite",
    description:
      "La validité de l'autorisation de conduite est subordonnée à la détention par le travailleur d'une attestation d'absence de contre-indication médicale à la conduite des équipements autorisés. Cette attestation, d'une validité de cinq ans, est délivrée par le médecin du travail à l'issue d'un examen médical. Le travailleur la présente à l'employeur, qui en conserve une copie pendant toute sa durée de validité.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4323-56, alinéa 2 (attestation d'une validité de cinq ans délivrée par le médecin du travail)",
        article: "R. 4323-56",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769343",
        versionConstatee: "2025-10-01",
      },
    ],
    periodicite: "quinquennale",
    realisateurs: ["medecin_travail"],
    criticite: 4,
    typologies: { travail: true },
    porteur: "salarie",
    pieceMedicale: true,
    transmet: [],
    notesInternes:
      "LE JUMEAU EXACT DE `elec-salarie-attestation-medicale-voisinage`. Les deux articles ont été réécrits le même jour par le même texte — le décret n° 2025-355 du 18 avril 2025, en vigueur au 1er octobre 2025 — et se lisent presque mot pour mot : même durée de cinq ans, même délivrance par le médecin du travail à l'issue d'un examen, même conservation d'une copie par l'employeur. Le référentiel n'en portait que la moitié ; voici la seconde.\n\nLES CINQ ANS SONT ÉCRITS, sans plafond ni interprétation : « Cette attestation, d'une validité de cinq ans, est délivrée par le médecin du travail à l'issue d'un examen médical qu'il réalise. » Verbatim relevé le 2026-08-31. C'est, avec l'annuelle de la liste des postes à risques, la seule périodicité ferme du lot 7.\n\nPOURQUOI DANS `sante_travail` PLUTÔT QUE DANS `formation_securite`, où vivent l'autorisation de conduite et la formation qu'elle suppose. Parce que le domaine ne sert pas à ranger par sujet, il sert à dire quel tiers l'obligation appelle : `DOMAINES_PRESTATAIRE_ATTENDUS` traduit chaque domaine en catégorie de prestataire attendue à l'annuaire. Une attestation délivrée par le médecin du travail appelle un service de prévention et de santé au travail, jamais un organisme de formation. La ranger avec la formation aurait fait dire à l'outil « aucun organisme de formation déclaré » à un dirigeant qui a besoin d'un SPST.\n\nCELA DIVERGE DU PRÉCÉDENT ÉLECTRIQUE, qui range son attestation médicale dans le domaine `electricite`. La divergence est assumée et signalée au rapport du lot 7 : à l'époque aucun domaine de santé n'existait, le choix n'en était pas un. L'obligation électrique n'est pas déplacée ici — changer le domaine et le réalisateur d'une obligation publiée déplace son empreinte et son affichage sur des dossiers vivants, ce qui excède le périmètre de ce lot.\n\nLE LIEN AVEC L'AUTORISATION EST NOMMÉ, PAS DÉRIVÉ : `conduite-salarie-autorisation` porte une transmission vers ce titre, parce que sa validité en dépend (R. 4323-56).\n\nCE QUE L'OUTIL EN DÉTIENT : existence, date, échéance. Rien d'autre (docs/rgpd.md § 2.3).",
  },

  // ---------------------------------------------------------------------------
  // Le socle de l'employeur (lot 8) — ce qui est dû AVANT tout suivi individuel
  //
  // Les cinq obligations qui précèdent supposent toutes un service de
  // prévention et de santé au travail : sans lui, aucune visite d'information
  // et de prévention, aucun suivi renforcé, aucune attestation. Les deux qui
  // suivent portent ce préalable — y adhérer, et recevoir la fiche d'entreprise
  // qu'il établit.
  // ---------------------------------------------------------------------------
  {
    id: "sante-travail-etablissement-adhesion-spst",
    domaine: "sante_travail",
    libelle:
      "Service de prévention et de santé au travail — adhésion ou service autonome",
    description:
      "Les employeurs organisent des services de prévention et de santé au travail. Le service est organisé sous la forme soit d'un service autonome, soit d'un service de prévention et de santé au travail interentreprises ; lorsque l'entreprise a le choix entre les deux, ce choix appartient à l'employeur. En pratique, une TPE ou une PME adhère à un service interentreprises. C'est le préalable de tout le suivi individuel de l'état de santé : sans adhésion, aucune visite d'information et de prévention ne peut avoir lieu.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "L. 4622-1 (les employeurs organisent des services de prévention et de santé au travail)",
        article: "L. 4622-1",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043893834",
        versionConstatee: "2022-03-31",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "D. 4622-1 (le service est organisé sous la forme soit d'un service autonome, soit d'un service interentreprises)",
        article: "D. 4622-1",
        url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018492757/",
        versionConstatee: "2022-04-28",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "D. 4622-2 (le choix entre les deux formes de service est fait par l'employeur)",
        article: "D. 4622-2",
        url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018492757/",
        versionConstatee: "2022-04-28",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 4,
    typologies: { travail: true },
    porteur: "etablissement",
    transmet: [],
    notesInternes:
      "LE TEXTE ÉCRIT « ORGANISENT », PAS « ADHÈRENT », ET LE LIBELLÉ LE SUIT DEPUIS. Première rédaction : « Adhésion à un service de prévention et de santé au travail ». C'est le mot du terrain, et c'est ce que fait une TPE — mais ce n'est pas le verbe de `L. 4622-1`, qui dit « organisent ». L'adhésion à un service interentreprises est UNE MODALITÉ de cette organisation, l'autre étant le service autonome (`D. 4622-1`), et le choix appartient à l'employeur (`D. 4622-2`). Les articles qui règlent l'adhésion elle-même — `D. 4622-14` et suivants — ne sont dépouillés par personne. Afficher « adhésion » comme si c'était l'obligation aurait resserré le texte sur une de ses deux branches et fait passer une pratique pour une prescription. Le libellé nomme donc les deux ; l'identifiant garde `adhesion-spst`, qui est une clé stable et non une affirmation.\n\nL'ARTICLE FONDATEUR EST D'UNE MINCEUR REMARQUABLE, ET IL A FALLU LE VÉRIFIER. `L. 4622-1`, dans sa version en vigueur depuis le 2022-03-31, tient en une phrase, relevée sur Légifrance le 2026-08-31 : « Les employeurs relevant du présent titre organisent des services de prévention et de santé au travail. » Rien d'autre : ni « adhèrent », ni « interentreprises », ni délai.\n\nCE QUE J'AI VÉRIFIÉ AVANT DE M'EN CONTENTER. `L. 4622-7` est souvent cité comme l'article de l'adhésion. Ouvert le 2026-08-31, il dit tout autre chose : « Lorsque le service de prévention et de santé au travail est assuré par un groupement ou organisme distinct de l'établissement employant les travailleurs bénéficiaires de ce service, les responsables de ce groupement ou de cet organisme sont soumis, dans les mêmes conditions que l'employeur et sous les mêmes sanctions, aux prescriptions du présent titre. » C'est la responsabilité des dirigeants du service, pas l'obligation de l'employeur. Le citer en fondateur aurait été l'erreur exacte que la règle du dépôt existe pour empêcher.\n\nCE SONT DONC `D. 4622-1` ET `D. 4622-2` QUI DONNENT SA FORME À L'OBLIGATION : le service est autonome ou interentreprises, et le choix appartient à l'employeur quand il l'a. Ils sont en contexte, pas en fondateur — ils organisent, ils n'imposent pas.\n\nAUCUNE PÉRIODICITÉ. Ni `L. 4622-1` ni les articles D. ne fixent de durée, de renouvellement, ni d'échéance d'adhésion. `periodicite: \"autre\"` : un état à constituer puis maintenir. Une cotisation annuelle existe en pratique, elle n'est pas dans le texte et n'a pas à devenir une échéance.\n\nRÉALISATEUR `exploitant` ET NON `service_sante_travail`, ce qui peut surprendre dans ce domaine. L'acte à accomplir est ADHÉRER, et c'est l'employeur qui adhère ; le service ne s'auto-adhère pas. Mettre `service_sante_travail` aurait annoncé au dirigeant qu'un tiers réalise à sa place la démarche qui lui incombe. Le domaine `sante_travail` attend malgré tout un `service_sante_travail` à l'annuaire, ce qui est le bon rapprochement : un dossier sans SPST déclaré signale ici, précisément, un manquement probable.\n\nCriticité 4 : l'absence d'adhésion éteint tout le suivi médical. Ce n'est pas un manquement formel, c'est celui qui en entraîne cinq autres.",
  },

  {
    id: "sante-travail-etablissement-fiche-entreprise",
    domaine: "sante_travail",
    libelle: "Fiche d'entreprise établie par le service de santé au travail",
    description:
      "Pour chaque entreprise ou établissement, le médecin du travail ou, dans les services de prévention et de santé au travail interentreprises, l'équipe pluridisciplinaire établit et met à jour une fiche d'entreprise ou d'établissement sur laquelle figurent, notamment, les risques professionnels et les effectifs de salariés qui y sont exposés. Pour les entreprises adhérentes à un service interentreprises, la fiche est établie dans l'année qui suit l'adhésion. Elle est transmise à l'employeur.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4624-46 (le médecin du travail ou l'équipe pluridisciplinaire établit et met à jour une fiche d'entreprise)",
        article: "R. 4624-46",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000045677119",
        versionConstatee: "2022-04-28",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4624-47 (pour les entreprises adhérentes à un service interentreprises, la fiche est établie dans l'année qui suit l'adhésion)",
        article: "R. 4624-47",
        url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018493214/",
        versionConstatee: "2022-04-28",
      },
    ],
    periodicite: "autre",
    realisateurs: ["medecin_travail", "equipe_pluridisciplinaire"],
    criticite: 2,
    typologies: { travail: true },
    porteur: "etablissement",
    transmet: [],
    notesInternes:
      "LA SEULE OBLIGATION DE CE LOT QUE L'EMPLOYEUR NE RÉALISE PAS, et c'est ce qui a décidé de son réalisateur. `R. 4624-46` confie la fiche « au médecin du travail ou, dans les services de prévention et de santé au travail interentreprises, à l'équipe pluridisciplinaire » — verbatim relevé le 2026-08-31, version en vigueur depuis le 2022-04-28. L'employeur ne l'écrit pas : il la reçoit. `realisateurs: [\"medecin_travail\", \"equipe_pluridisciplinaire\"]`, dans l'ordre où le texte les cite.\n\nLA SECONDE VALEUR N'EXISTAIT PAS QUAND CETTE LIGNE A ÉTÉ ÉCRITE, et le repli d'alors était faux pour la cible du produit. `professionnel_sante_travail` désigne « l'un des professionnels de santé mentionnés au premier alinéa de L. 4624-1 » ; l'équipe pluridisciplinaire de `L. 4622-8` est plus large — elle comprend les intervenants en prévention des risques professionnels, qui ne sont pas des soignants. Or c'est elle, et non le médecin seul, qui établit la fiche d'une TPE adhérant à un service interentreprises : le cas ORDINAIRE. `equipe_pluridisciplinaire` a été ajoutée à l'enum par le lot 7 et la ligne est corrigée.\n\nPOURQUOI L'ENCODER MALGRÉ TOUT COMME UNE OBLIGATION DE L'ÉTABLISSEMENT. Parce que c'est ainsi qu'elle se présente en contrôle : l'inspection demande la fiche d'entreprise, et l'employeur qui n'en a pas est en défaut, même si l'acte incombe au service. C'est exactement le régime des vérifications périodiques réalisées par un organisme agréé — l'obligation est celle de l'exploitant, la réalisation celle d'un tiers.\n\nAUCUNE PÉRIODICITÉ, ET C'ÉTAIT LE PIÈGE. `R. 4624-46` écrit « établit ET MET À JOUR », sans dire à quel rythme. On lit couramment que la fiche se met à jour tous les quatre ans, ou à chaque changement notable ; aucune de ces durées n'est dans l'article. `periodicite: \"autre\"`. Ce dépôt a déjà retiré un « triennal » qui venait d'une norme NF ; un « quadriennal » venant d'un usage professionnel serait la même faute.\n\nL'ANNÉE DE `R. 4624-47` EST UN DÉLAI, PAS UNE PÉRIODICITÉ. « La fiche d'entreprise est établie dans l'année qui suit l'adhésion » : c'est un point de départ unique, pas un rythme. Le produit ne porte pas la date d'adhésion au service, donc ce délai n'engendre aucune ligne de calendrier ; il est rappelé en description. L'exposer supposerait un attribut d'établissement qui n'existe pas — et je n'en déclare pas de `Transmission` `attribut_absent`, parce que cet attribut ne conditionne pas l'APPLICABILITÉ de l'obligation, seulement la date à laquelle elle devient exigible. Nommer un attribut absent pour une échéance qu'on ne calcule de toute façon pas aurait été du bruit.\n\nCriticité 2 : le manquement est réel en contrôle, mais il ne pèse pas d'abord sur l'employeur — c'est au service qu'il incombe d'établir la fiche.",
  },
];
