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
      "UNE OBLIGATION ET NON DEUX, malgré deux articles. R. 4624-10 (visite initiale, trois mois) et R. 4624-16 (renouvellement, cinq ans) décrivent la MÊME visite à deux moments de sa vie, pas deux rendez-vous distincts. En faire deux obligations aurait produit deux lignes de calendrier par salarié pour une seule visite — l'excès inverse du défaut que l'ADR-022 a corrigé. Le test du découpage est : le texte crée-t-il deux choses à suivre séparément ? Ici, non.\n\nLE DÉLAI DE TROIS MOIS N'EST PAS CALCULÉ. Il court depuis la prise effective du poste, et le modèle ne porte pas cette date : `TitreSalarie.delivreLe` est la date de la visite reçue. Le délai est rappelé en description ; l'exposer supposerait un champ « date de prise de poste » sur `Salarie`, qui n'existe pas.\n\nLES CINQ ANS SONT UN PLAFOND, PAS UN RYTHME. Verbatim relevé le 2026-08-31 : « selon une périodicité qui ne peut excéder cinq ans. Ce délai […] est fixé par le médecin du travail dans le cadre du protocole ». Encoder `quinquennale` revient à annoncer la borne extérieure. C'est défendable — le nombre est dans le texte, et sans lui le produit ne dirait rien du tout, ce qui était l'état précédent — mais ce n'est vrai que parce que `TitreSalarie.echeanceLe` déclaré par l'employeur prime sur le calcul. Un dirigeant dont le médecin a fixé trois ans saisit trois ans, et l'outil ne le contredit pas. Ce point est signalé au rapport du lot 7 comme le choix le plus discutable du lot.\n\nEXCLUSIF DU SIR. R. 4624-24 : l'examen d'aptitude du suivi renforcé « se substitue à la visite d'information et de prévention prévue à l'article R. 4624-10 ». Un salarié a l'un ou l'autre, jamais les deux. Rien dans le modèle ne l'empêche matériellement puisque l'employeur déclare les titres ; l'interface ne doit pas proposer les deux pour la même personne.\n\nCE QUE L'OUTIL DÉTIENT : que la visite a eu lieu, quand, quand la suivante est due. Rien d'autre. `pieceMedicale: true` (docs/rgpd.md § 2.3).",
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
      "LE PRODUIT NE SAIT PAS QUELS POSTES SONT À RISQUES PARTICULIERS, ET NE DOIT PAS L'INVENTER. R. 4624-23 I énumère sept expositions — amiante, plomb, agents CMR, agents biologiques des groupes 3 et 4, rayonnements ionisants, hyperbare, chute de hauteur au montage d'échafaudages. Rien dans le modèle ne dit à quoi un salarié est exposé : le déduire serait le cinquième déclencheur (activité réellement exercée), non implémenté, et l'appliquer à tout l'effectif parce qu'un produit chimique figure au parc serait un faux positif de masse — exactement le raisonnement de l'ADR-023 sur l'habilitation électrique.\n\nMAIS LE TEXTE DONNE UNE PRISE, ET C'EST CE QUI REND CE LOT UTILE. R. 4624-23 III met à la charge de l'employeur une liste des postes à risques particuliers, motivée par écrit, transmise au service de prévention et de santé au travail et MISE À JOUR TOUS LES ANS. C'est une obligation d'établissement, datable, encodée sous `sante-travail-etablissement-liste-postes-risques`. L'outil ne devine donc pas qui relève du SIR : il rappelle au dirigeant qu'il doit lui-même tenir la liste qui le dit. C'est le seul chemin honnête entre dériver et se taire.\n\nUNE OBLIGATION POUR L'EXAMEN INITIAL ET SON RENOUVELLEMENT, comme pour la VIP : R. 4624-24 et R. 4624-28 décrivent le même examen à deux moments. La visite intermédiaire, elle, est séparée — autre intervenant, autre rythme, et elle s'intercale au lieu de succéder.\n\nQUATRE ANS = PLAFOND. « selon une périodicité qu'il détermine et qui ne peut être supérieure à quatre ans ». Même raisonnement et mêmes garde-fous que la VIP.\n\nCriticité 5 : par construction, ce suivi ne concerne que des postes exposant à l'amiante, au plomb, aux CMR, aux rayonnements ionisants — un manquement y est d'une autre nature qu'un retard de VIP en bureau.\n\nEXCLUSIF DE LA VIP (R. 4624-24).",
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
      "POURQUOI ELLE EST SÉPARÉE DU SIR, ET PAS FONDUE DEDANS. Trois différences écrites, pas une : elle est réalisée par un professionnel de santé et non par le médecin du travail ; son délai est de deux ans et non de quatre ; et elle s'INTERCALE entre deux examens au lieu de leur succéder. Fondue dans `sante-travail-salarie-sir` à quatre ans, elle disparaissait purement et simplement du calendrier — un salarié en suivi renforcé n'aurait vu qu'un rendez-vous sur deux. C'est la définition du silence que ce chantier existe pour retirer.\n\nDEUX ANS = PLAFOND, comme le reste du dispositif : « au plus tard deux ans après la visite avec le médecin du travail ». Le point de départ est la visite du médecin, pas la précédente visite intermédiaire — nuance que `Periodicite` n'exprime pas, une périodicité biennale se calculant depuis la dernière occurrence du même acte. En pratique les deux coïncident tant que le cycle est régulier ; ils divergent si le médecin raccourcit son propre rythme. `TitreSalarie.echeanceLe` déclaré par l'employeur reste l'échappatoire, et c'est signalé au rapport du lot 7.\n\nCriticité 3 : c'est une visite de veille intercalaire, pas l'examen d'aptitude qui conditionne l'affectation.\n\n`pieceMedicale: true` — même régime que tout ce fichier.",
  },

  {
    id: "sante-travail-etablissement-liste-postes-risques",
    domaine: "sante_travail",
    libelle:
      "Tenir à jour la liste des postes à risques particuliers",
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
];
