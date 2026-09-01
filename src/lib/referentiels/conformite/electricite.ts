/**
 * Obligations réglementaires — Électricité (P1).
 *
 * Sources primaires :
 *   - Code du travail, Section 5 « Utilisation des installations électriques »,
 *     articles R. 4226-1 à R. 4226-21 (vérifications), R. 4544-1 à R. 4544-11
 *     (habilitation électrique du personnel).
 *   - Arrêté du 26 décembre 2011 relatif aux vérifications ou processus de
 *     vérification des installations électriques en milieu de travail.
 *   - Arrêté du 25 juin 1980 modifié (règlement de sécurité ERP) — section EL
 *     (articles EL 3 à EL 20).
 *   - Arrêté du 22 juin 1990 modifié (règles PE pour ERP 5ᵉ catégorie).
 *   - Arrêté du 30 décembre 2011 (règlement IGH) — article GH 50.
 *
 * Aucune norme privée (APSAD, NF C 15-100) n'est citée comme obligation : ces
 * normes définissent des règles de l'art, mais l'opposabilité vient du texte
 * réglementaire qui les vise.
 */

import type { Obligation } from "./types";

export const obligationsElectricite: Obligation[] = [
  // ---------------------------------------------------------------------------
  // Travail (Code du travail)
  // ---------------------------------------------------------------------------
  {
    id: "elec-travail-mise-en-service",
    domaine: "electricite",
    libelle: "Vérification initiale des installations électriques à la mise en service ou après modification",
    description:
      "À la mise en service et après toute modification de structure, l'employeur fait procéder à une vérification des installations électriques. Le rapport doit être transmis à l'inspection du travail sur demande.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4226-14",
        article: "R. 4226-14",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022765072/",
        versionConstatee: "2011-07-01",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 26 décembre 2011 (vérifications des installations électriques), art. 2 et 6",
        article: "Arrêté 2011-12-26 art. 2",
        url:
          "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000025046978",
        versionConstatee: "2011-12-30",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    nature: "evenementielle",
    pieceAttendue: null,
    realisateurs: ["organisme_accredite"],
    criticite: 4,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    notesInternes: "NATURE : ÉVÉNEMENTIELLE (ADR-026). R. 4226-14 porte deux titres : la mise en service, que le produit date, et « toute modification de structure », qu'il n'observe pas. La règle de résolution retient le second. Conséquence à ne pas manquer : la ligne se solde au premier contrôle, alors que l'obligation, elle, redevient due à chaque modification — et rien dans le produit ne le dira.",
  },
  {
    id: "elec-travail-periodique-annuelle",
    domaine: "electricite",
    libelle: "Vérification périodique annuelle des installations électriques (travail)",
    description:
      "Vérification annuelle par un organisme accrédité ou une personne qualifiée désignée par l'employeur. Les modalités sont fixées par l'arrêté du 26 décembre 2011.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4226-16",
        article: "R. 4226-16",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022765070/",
        versionConstatee: "2011-07-01",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 26 décembre 2011 (vérifications des installations électriques), art. 3",
        article: "Arrêté 2011-12-26 art. 3",
        note: "L'article 3 fixe la périodicité à un an, puis ouvre une faculté que le référentiel ne portait pas : « Toutefois, le délai entre deux vérifications peut être porté à deux ans par le chef d'établissement si le rapport précédent ne présente aucune observation ou si, avant l'échéance, le chef d'établissement a fait réaliser les travaux de mise en conformité de nature à répondre aux observations contenues dans le rapport de vérification. » Le texte ne la subordonne pas à une autorisation : « Le chef d'établissement informe l'inspecteur du travail par lettre recommandée avec accusé de réception, accompagnée des éléments prouvant qu'il n'y a pas de non-conformité ou que les non-conformités ont été levées. Cet envoi doit comprendre, le cas échéant, l'avis des membres du CHSCT ou des délégués du personnel. » Constaté le 2026-08-26.",
        url:
          "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000025046978",
        versionConstatee: "2011-12-30",
      },
    ],
    periodicite: "annuelle",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["organisme_accredite", "personne_qualifiee"],
    criticite: 5,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
  },
  {
    id: "elec-travail-consignation-registre",
    domaine: "electricite",
    libelle: "Consignation des rapports de vérification électrique au registre",
    description:
      "Les résultats des vérifications électriques et les justifications des travaux menés pour remédier aux anomalies relevées sont consignés sur un registre. Lorsque la vérification est réalisée par un organisme accrédité, son rapport est annexé à ce registre.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4226-19",
        article: "R. 4226-19",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022765064/",
        versionConstatee: "2011-07-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "L. 4711-5",
        article: "L. 4711-5",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006903389/",
        versionConstatee: "2008-05-01",
      },
    ],
    periodicite: "autre",
    nature: "etat_permanent",
    pieceAttendue: "registre de sécurité",
    realisateurs: ["exploitant"],
    criticite: 3,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    notesInternes: "NATURE : ÉTAT PERMANENT, `pieceAttendue` NON NULLE (ADR-026). R. 4226-19 n'impose pas de vérifier — d'autres lignes le font — il impose que les résultats soient CONSIGNÉS SUR UN REGISTRE. L'écrit est ici l'obligation, pas la trace d'un acte : c'est la distinction que porte `pieceAttendue`, et elle décide qu'une case à cocher seule ne suffit pas sur cette ligne.",
  },
  {
    id: "elec-travail-habilitation-personnel",
    domaine: "electricite",
    libelle: "Habilitation électrique du personnel opérant sur ou à proximité d'installations électriques",
    description:
      "L'employeur s'assure que les travailleurs qui effectuent des opérations sur ou à proximité d'installations électriques sont titulaires d'une habilitation adaptée au type d'opération. C'est un état à maintenir en permanence, pas un rendez-vous : le Code ne fixe aucune périodicité de renouvellement, il renvoie aux modalités des normes homologuées, qu'il qualifie lui-même de recommandées.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4544-9 à R. 4544-11",
        article: "R. 4544-10",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051500368",
        versionConstatee: "2025-10-01",
      },
      {
        source: "INRS",
        reference: "INRS ED 6127 « Habilitation électrique »",
        article: "INRS ED 6127",
        url:
          "https://www.inrs.fr/media.html?refINRS=ED%206127",
      },
    ],
    // « autre » = état permanent, pas d'échéance datée (ADR-023 § 6).
    //
    // Cette ligne annonçait « triennale ». AUCUN texte ne porte ce chiffre —
    // relu en première main le 2026-08-27 : R. 4544-9 (01/07/2011) n'énonce
    // aucune périodicité ; R. 4544-10 (01/10/2025) dit que l'employeur
    // « délivre, maintient ou renouvelle l'habilitation selon les modalités
    // contenues dans les normes mentionnées à l'article R. 4544-3 » ; et
    // R. 4544-3 (01/07/2011) précise que ces normes contiennent « les
    // modalités RECOMMANDÉES pour leur exécution ». Le Code prescrit donc de
    // suivre des modalités qu'il qualifie de recommandées, et n'écrit aucune
    // durée. Le triennal vient de la NF C 18-510 — une norme, que le
    // référentiel exclut comme source opposable.
    //
    // Une échéance inventée dans un outil de conformité est pire qu'une
    // échéance absente : elle se présente à un contrôle. Ce que l'outil dit
    // désormais est ce que dit le droit — l'habilitation est un état à
    // maintenir —, et ce qu'il DATE est l'attestation médicale quinquennale
    // de R. 4544-11-1, dont les cinq ans sont écrits noir sur blanc.
    periodicite: "autre",
    nature: "etat_permanent",
    pieceAttendue: null,
    realisateurs: ["exploitant"],
    criticite: 4,
    transmet: [
      {
        vers: "salarie_designe",
        // `null`, et c'est une réponse, pas un oubli. R. 4544-10 délivre
        // l'habilitation « à un travailleur désigné » : l'obligation est donc
        // nominative par nature. Mais le catalogue des titres ne porte pas
        // l'habilitation elle-même — seulement l'attestation médicale qui la
        // conditionne, qui est une autre obligation avec sa propre ligne.
        // Pointer vers elle dirait quelque chose de faux ; c'est bien
        // l'habilitation qui manque au catalogue, et le dépouillement des
        // normes qu'elle appelle n'est pas fait.
        titre: null,
        motif:
          "R. 4544-10 fait délivrer l'habilitation à un travailleur désigné : l'obligation suppose une personne nommée. Le produit ne peut pas deviner qui opère sur ou à proximité des installations — ce serait le cinquième déclencheur, non implémenté (ADR-023) — mais il peut dire qu'aucune personne n'est déclarée.",
      },
    ],
    typologies: { travail: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    notesInternes:
      "Périodicité passée de `triennale` à `autre` le 2026-08-27 (ADR-023 § 6) : voir le commentaire au-dessus du champ. Le précédent est celui du Kbis d'un prestataire, suivi sans statut d'expiration au motif que « le texte n'assortit pas la pièce d'une périodicité citable […] le produit informe, il ne décrète pas ».\n\nCe que l'utilisateur perd : une ligne d'échéance à trois ans. Ce qu'il gagne : une échéance réelle à sa place — l'attestation médicale — et un état permanent qui dit ce que le droit dit.\n\nLimite connue, non corrigée ici : la clé d'article est `R. 4544-10` alors que la citation couvre R. 4544-9 à R. 4544-11. Les deux bornes ne sont donc ni déclarées lues, ni surveillées par la veille. R. 4544-9 et R. 4544-11 n'ont d'ailleurs aucune entrée de corpus.\n\nAmendement 2026-08-26 : L. 4711-5 était en refs[0], c'est-à-dire présenté comme l'article FONDATEUR (convention ADR-003). Or il n'institue aucun registre — il autorise à en réunir plusieurs en un seul, ce que le CLAUDE.md du dépôt écrit noir sur blanc. La contradiction était interne. R. 4226-19 passe en premier : c'est lui qui impose la consignation des résultats de vérification. Ce n'est pas cosmétique : le test anti-doublon compare les obligations sur leur article fondateur, donc un refs[0] faux le rend aveugle — le mécanisme même qui masquait le doublon des portails.\n\nNATURE : ÉTAT PERMANENT (ADR-026). La description le dit déjà — « un état à maintenir en permanence, pas un rendez-vous » — et le champ le porte désormais. C'est la ligne qui a fait passer la périodicité de `triennale` à `autre` le 2026-08-27 ; le couple nature + périodicité dit maintenant pourquoi, sans qu'on ait à lire la note.",
  },

  // ---------------------------------------------------------------------------
  // Porteur : le salarié (ADR-023)
  // ---------------------------------------------------------------------------
  {
    id: "elec-salarie-attestation-medicale-voisinage",
    domaine: "electricite",
    libelle:
      "Attestation médicale d'absence de contre-indication au travail sous tension",
    description:
      "L'habilitation à opérer sous tension ou au voisinage de pièces nues sous tension est subordonnée à une attestation d'absence de contre-indication médicale, délivrée par le médecin du travail pour une durée de cinq ans. Le travailleur la présente à son employeur, qui en conserve une copie pendant toute sa durée de validité.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4544-11-1",
        article: "R. 4544-11-1",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051496288",
        versionConstatee: "2025-10-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4544-10 (habilitation délivrée à un travailleur désigné)",
        article: "R. 4544-10",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051500368",
        versionConstatee: "2025-10-01",
      },
    ],
    periodicite: "quinquennale",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    // `medecin_travail` depuis le 2026-08-31, et `exploitant` était une
    // contre-vérité que la note ci-dessous relevait elle-même : le verbatim dit
    // « est délivrée PAR LE MÉDECIN DU TRAVAIL à l'issue d'un examen médical
    // qu'il réalise ». L'écran annonçait donc à un dirigeant qu'il délivre
    // lui-même une attestation médicale — un acte qu'il lui est interdit de
    // réaliser.
    //
    // La valeur n'existait pas quand cette obligation a été écrite ; elle a été
    // ajoutée avec le suivi médical, et son jumeau `R. 4323-56` — issu du MÊME
    // décret n° 2025-355 — la porte. Le référentiel se contredisait sur deux
    // obligations nées le même jour du même texte.
    //
    // Pourquoi maintenant, alors que la correction avait été écartée : l'argument
    // qui la retenait était qu'elle déplace l'empreinte d'une obligation publiée
    // sur des dossiers vivants. Il valait tant que le lot n'était qu'un ajout ;
    // l'intégration en cours déplace l'empreinte massivement de toute façon.
    // Laisser une contre-vérité pour éviter un déplacement qui a lieu quand même,
    // c'est en payer le coût sans en acheter le bénéfice.
    //
    // Le DOMAINE reste `electricite`, délibérément : c'est l'habilitation
    // électrique que cette attestation conditionne, et le déplacer changerait
    // son rangement au calendrier sans rien corriger. Un seul déplacement
    // d'empreinte, pas deux.
    realisateurs: ["medecin_travail"],
    criticite: 4,
    transmet: [],
    typologies: { travail: true },
    porteur: "salarie",
    exclut: [],
    pieceMedicale: true,
    notesInternes:
      "Première obligation à porteur salarié du référentiel (ADR-023).\n\nVerbatim relevé en première main le 2026-08-27 : « L'attestation mentionnée aux articles R. 4544-10 et R. 4544-11, d'une validité de cinq ans, est délivrée par le médecin du travail à l'issue d'un examen médical qu'il réalise. Elle est présentée par le travailleur à l'employeur, qui en conserve une copie pendant toute sa durée de validité. » Les cinq ans sont donc ÉCRITS, contrairement au triennal de l'habilitation elle-même.\n\nCe que l'outil stocke : que l'attestation existe, sa date, son échéance. RIEN d'autre — ni motif, ni sens, ni pièce. C'est plus strict que le texte, qui autorise expressément l'employeur à en conserver copie ; le choix est motivé dans docs/rgpd.md § 2.3. Le drapeau `pieceMedicale` existe pour que l'interface ne propose jamais de téléverser le document : ce serait défaire la décision sans que personne ne la rouvre.\n\nSes lignes naissent d'un `TitreSalarie` déclaré, pas du moteur : rien ne dit qui, dans l'effectif, opère au voisinage de pièces nues sous tension — ce serait le cinquième déclencheur, non implémenté. Aucun titre déclaré, aucune ligne, et c'est juste.\n\nLe décret n° 2025-355 du 18 avril 2025, qui crée l'article et fixe son entrée en vigueur au 1er octobre 2025, n'est PAS cité en référence : il n'est pas dépouillé au corpus, et le cliquet de `corpus.test.ts` interdit d'encoder sur un texte que personne n'a lu. Son contenu est ici, en note, jusqu'à ce qu'il le soit.\n\nTRANSITION À NE PAS RATER : R. 4544-10 prévoit que les attestations d'aptitude délivrées sous le régime antérieur restent valides jusqu'au 2030-10-01. Une échéance calculée sur le régime nouveau chez un salarié couvert par l'ancien serait fausse de plusieurs années. Le modèle le permet : `TitreSalarie.echeanceLe` est déclaré par l'employeur et prime sur tout calcul.",
  },

  // ---------------------------------------------------------------------------
  // ERP (arrêté du 25 juin 1980 et arrêté du 22 juin 1990)
  // ---------------------------------------------------------------------------
  {
    id: "elec-erp-mise-en-service",
    relectureDue: {
      le: "2027-06-01",
      motif:
        "GE 6, cité en premier par cette obligation, affiche « Version en vigueur du 19/11/2007 au 01/06/2027 » : l'arrêté du 19 février 2026 le réécrit à cette date, en même temps que GE 2 et GE 7 (JORFTEXT000053525217, lu au JO le 2026-09-01). GE 6 est l'article de RÉGIME — il dit qui vérifie, organisme agréé ou technicien compétent — et c'est de lui que le réalisateur `organisme_agree` de cette ligne est tiré, par son § 2. Relire GE 6 dans sa version au 1er juin 2027, et avec lui GE 7 et GE 8, cités dans la même `reference` et absents du corpus. Vérifier au passage si le renvoi du § 1 vers « l'article R. 123-43 du code de la construction et de l'habitation » — numérotation disparue à la recodification de 2021 — est enfin corrigé. Le texte modificateur ne s'appliquant qu'aux demandes d'autorisation de travaux déposées à compter de cette date, regarder aussi ce qu'il advient du parc existant.",
    },
    domaine: "electricite",
    libelle: "Vérification électrique à la mise en service ou après travaux (ERP)",
    description:
      "Les installations électriques des ERP sont vérifiées à la mise en service et après travaux par un organisme agréé, qui établit le rapport de vérification réglementaire après travaux (RVRAT).",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. GE 6 à GE 8 (vérifications par organismes agréés, rapport RVRAT)",
        article: "GE 6",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020303884/",
        versionConstatee: "2007-11-19",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EL 19 § 2 (installations neuves ou modifiées)",
        article: "EL 19",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000021231068/",
        versionConstatee: "2010-01-23",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    nature: "evenementielle",
    pieceAttendue: null,
    realisateurs: ["organisme_agree"],
    criticite: 5,
    transmet: [],
    typologies: { erp: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait EL 5, qui définit les locaux de service électrique. La vérification avant ouverture et après travaux relève des articles GE 6 à GE 8 (rapport RVRAT), auxquels EL 19 § 2 renvoie.\n\nSur-application assumée en 5ᵉ catégorie (constatée 2026-08-26). L'article cité relève du Livre II du règlement de sécurité, écarté en 5ᵉ catégorie par PE 1 § 1 ; le dépouillement intégral du Livre III a établi qu'il n'en rouvre que MS 39 et MS 70. GE 7 § 1 le confirme en propre : il ne vise que les établissements des 1ʳᵉ à 4ᵉ catégories. Ce qui traite le même objet en N5 est PE 4 § 1, plus étroit — vérification à la construction et avant ouverture par personnes ou organismes agréés, et seulement « dans les établissements avec locaux à sommeil ». La ligne est MAINTENUE : la retirer créerait un faux négatif muet chez 100 % des utilisateurs, alors qu'une sur-application visible reste corrigeable. À reprendre quand le référentiel saura porter l'attribut « locaux à sommeil ».\n\nNATURE : ÉVÉNEMENTIELLE (ADR-026). Même configuration que `elec-travail-mise-en-service` : EL 19 § 2 vise les installations « neuves OU MODIFIÉES ». Le second titre commande, et le produit n'observe pas les travaux.",
  },
  {
    id: "elec-erp-cat1-4-annuelle",
    domaine: "electricite",
    libelle: "Vérification électrique annuelle (ERP 1ʳᵉ à 4ᵉ catégorie)",
    description:
      "Les installations électriques des ERP des quatre premières catégories font l'objet d'une vérification annuelle par un organisme agréé. Le rapport est consigné au registre de sécurité.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EL 19 § 1 et § 2",
        article: "EL 19",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000021231068/",
        versionConstatee: "2010-01-23",
      },
    ],
    periodicite: "annuelle",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["organisme_agree"],
    criticite: 5,
    transmet: [],
    typologies: {
      erp: { categories: ["N1", "N2", "N3", "N4"] },
    },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
  },
  // `elec-erp-cat5-quinquennale` a été RETIRÉ le 2026-08-27 (ADR-022).
  //
  // Il n'avait pas de fondement propre : son article fondateur était PE 4 § 2,
  // et il n'en projetait qu'un fragment — « les installations électriques » —
  // sur une catégorie d'équipement. Ce découpage n'existait que parce que le
  // modèle exigeait un déclencheur d'équipement. Depuis que le référentiel
  // porte PE 4 § 2 entier
  // (`incendie-erp-pe4-entretien-installations-techniques`), le garder ferait
  // deux lignes triennales pour un seul acte, et maintiendrait la
  // décomposition que ce chantier existe pour écarter.
  //
  // Ce que le retrait ne détruit pas : la réconciliation ne supprime
  // physiquement qu'une ligne SANS rapport, sans action et sans date de
  // réalisation ; toute ligne porteuse d'une preuve est archivée, libellé
  // marqué (ADR-012). Constaté en base au 2026-08-27 avant le retrait : trois
  // lignes, aucune preuve, aucune réalisation.
  //
  // L'id ne doit JAMAIS être réemployé (cf. `Obligation.id`) — il est
  // enregistré dans `OBLIGATIONS_RETIREES`, et un test le vérifie.
  {
    id: "elec-erp-groupe-electrogene-quinzaine",
    domaine: "electricite",
    libelle:
      "Vérification des niveaux du groupe électrogène de sécurité (ERP)",
    description:
      "Tous les quinze jours, l'exploitant vérifie le niveau d'huile, d'eau et de combustible du groupe électrogène de sécurité, le dispositif de réchauffage du moteur et l'état de la source utilisée pour le démarrage (batterie ou air comprimé). Les interventions et leurs résultats sont consignés dans un registre d'entretien tenu à la disposition de la commission de sécurité.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference:
          "Arrêté du 25 juin 1980, art. EL 18 § 4 (première périodicité)",
        article: "EL 18",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038485456/",
        note: "« Les groupes électrogènes de sécurité doivent faire l'objet d'un entretien régulier et d'essais selon la périodicité minimale suivante : ― tous les quinze jours, vérification du niveau d'huile, d'eau et de combustible, du dispositif de réchauffage du moteur et de l'état de la source utilisée pour le démarrage (batterie ou air comprimé) […]. » Verbatim confirmé par relecture indépendante le 2026-08-26.",
        versionConstatee: "2019-07-01",
      },
    ],
    periodicite: "bimensuelle",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["exploitant"],
    criticite: 4,
    transmet: [],
    typologies: { erp: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    notesInternes:
      "Créée le 2026-08-26. EL 18 § 4 fixe DEUX périodicités minimales, et le référentiel n'en portait qu'une : l'obligation unique était encodée « mensuelle », si bien que la vérification des niveaux tous les quinze jours ne produisait aucune échéance. Elle ne vivait que dans la prose d'une description — sur un matériel dont le seul rôle est de démarrer quand tout le reste a lâché.\n\nLa valeur `bimensuelle` a été ajoutée à l'énumération et à la base pour cela : le choix se réduisait auparavant à `hebdomadaire`, qui double la charge réelle, ou `mensuelle`, qui tait l'obligation. Conversion à quatorze jours et non quinze — un multiple de sept fait retomber l'échéance le même jour de la semaine.\n\nSur-application assumée en 5ᵉ catégorie, comme les autres obligations de ce fichier fondées sur le Livre II : EL 18 relève du Livre II, écarté par PE 1 § 1, et ce qui traite du même objet en N5 est PE 4 § 2. La ligne est maintenue pour ne pas créer un faux négatif muet.",
  },
  {
    id: "elec-erp-groupe-electrogene-annuel",
    domaine: "electricite",
    libelle: "Entretien et essais des groupes électrogènes de sécurité (ERP)",
    description:
      "Tous les mois, le groupe électrogène de sécurité fait l'objet, en plus de la vérification des niveaux, d'un essai de démarrage automatique avec une charge minimale de 50 % de la puissance du groupe et d'un fonctionnement sous cette charge pendant une durée minimale de trente minutes. Les interventions et leurs résultats sont consignés dans un registre d'entretien tenu à la disposition de la commission de sécurité.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EL 18 § 4 (entretien et essais des groupes électrogènes de sécurité)",
        article: "EL 18",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038485456/",
        versionConstatee: "2019-07-01",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. EL 19 (vérification annuelle)",
        article: "EL 19",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000021231068/",
        versionConstatee: "2010-01-23",
      },
    ],
    periodicite: "mensuelle",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["exploitant", "personne_qualifiee", "organisme_agree"],
    criticite: 4,
    transmet: [],
    typologies: { erp: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    conditions: [
      {
        type: "equipement_propriete_booleenne",
        categorie: "INSTALLATION_ELECTRIQUE",
        propriete: "aGroupeElectrogene",
        valeur: true,
      },
    ],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait EL 20, qui traite des installations temporaires.\n\nSur-application assumée en 5ᵉ catégorie (constatée 2026-08-26). L'article cité relève du Livre II du règlement de sécurité, écarté en 5ᵉ catégorie par PE 1 § 1 ; le dépouillement intégral du Livre III a établi qu'il n'en rouvre que MS 39 et MS 70. GE 7 § 1 le confirme en propre : il ne vise que les établissements des 1ʳᵉ à 4ᵉ catégories. Ce qui traite le même objet en N5 est PE 4 § 1, plus étroit — vérification à la construction et avant ouverture par personnes ou organismes agréés, et seulement « dans les établissements avec locaux à sommeil ». La ligne est MAINTENUE : la retirer créerait un faux négatif muet chez 100 % des utilisateurs, alors qu'une sur-application visible reste corrigeable. À reprendre quand le référentiel saura porter l'attribut « locaux à sommeil ».\n\nAmendement 2026-08-26 : EL 18 § 4 fixe DEUX périodicités minimales — tous les quinze jours (niveaux d'huile, d'eau, de combustible, réchauffage moteur, source de démarrage) et tous les mois (essai de démarrage automatique sous 50 % de charge pendant trente minutes). Le champ `periodicite` n'en porte qu'une : l'énumération `Periodicite` n'a pas de valeur quinzomadaire, et le seul voisin disponible, `hebdomadaire`, doublerait la charge réelle. La quinzaine ne vit donc que dans la `description` et ne produit aucune échéance — sous-application connue, à lever en ajoutant une valeur à l'énumération.\n\nL'identifiant conserve « annuel » alors que la périodicité est mensuelle : `Verification.obligationId` est stocké en base sous contrainte d'unicité, et le renommer orphelinerait les lignes de calendrier existantes. Le libellé, lui, a été corrigé.\n\n`realisateurs` gagne `exploitant` : EL 18 § 4 n'exige aucun tiers, l'entretien et les essais lui incombent, et le registre d'entretien est tenu à disposition de la commission. L'organisme agréé relève d'EL 19, pas d'EL 18.",
  },

  // ---------------------------------------------------------------------------
  // IGH (arrêté du 30 décembre 2011)
  // ---------------------------------------------------------------------------
  {
    id: "elec-igh-annuelle",
    domaine: "electricite",
    libelle: "Vérification annuelle des installations électriques (IGH)",
    description:
      "Le propriétaire d'un immeuble de grande hauteur fait vérifier annuellement, par un organisme agréé, les installations électriques et l'éclairage des parties communes. Les installations de protection contre la foudre sont vérifiées tous les deux ans.",
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
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait GH 50, qui traite de l'alerte (dispositifs phoniques vers le PC sécurité). Les vérifications techniques périodiques sont à l'article GH 5.",
  },
  {
    id: "incendie-hotel-po-controle-annuel-electricite",
    domaine: "electricite",
    libelle:
      "Contrôle annuel des installations électriques (hôtel de 5ᵉ catégorie)",
    description:
      "Dans un hôtel, les installations électriques sont contrôlées chaque année par un technicien compétent. Cette échéance vise les établissements de 5ᵉ catégorie de type O, que la vérification annuelle des ERP des quatre premières catégories ne couvre pas.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference:
          "Arrêté du 25 juin 1980, art. PO 1 § 3 (règles spécifiques aux hôtels)",
        article: "PO 1",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020374775/2018-01-01",
        note: "« L'ensemble des installations techniques doit être contrôlé par un technicien compétent tous les deux ans, à l'exception des installations électriques et des systèmes de détection incendie qui doivent être contrôlés annuellement. » Verbatim relevé en première main le 2026-08-26.",
        versionConstatee: "2018-01-01",
      },
      {
        source: "ARRETE",
        reference:
          "Arrêté du 25 juin 1980, art. PO 8 § 1 (extension aux hôtels existants)",
        article: "PO 8",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020374775/",
        note: "« Les prescriptions définies dans la présente section sont applicables en complément des articles PE 4, PE 24, PE 26, PE 27, PE 32, PE 36, PO 1 (§ 3) et PO 5. » Verbatim relevé en première main le 2026-08-26. PO 1 § 3 figure dans la section 1, intitulée « Prescriptions applicables aux établissements à construire ou à modifier » ; PO 8 § 1 ouvre la section 2, « Prescriptions applicables aux établissements existant », et l'y réimporte nommément. La périodicité vaut donc pour TOUS les hôtels, pas seulement les neufs.",
        versionConstatee: "2011-10-30",
      },
    ],
    periodicite: "annuelle",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    transmet: [],
    typologies: { erp: { categories: ["N5"], types: ["O"] } },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    notesInternes:
      "Créée le 2026-08-26. `elec-erp-cat1-4-annuelle` s'arrête aux quatre premières catégories : un petit hôtel de 5ᵉ catégorie n'avait AUCUN contrôle électrique annuel, alors que PO 1 § 3 le lui impose nommément. Le manque était déclaré `non_couvert` sur le chapitre PO avec la mention « le manque est un choix, pas une impossibilité » — il ne l'est plus.\n\nLa détection incendie, que le même paragraphe soumet au même rythme annuel, n'est PAS ajoutée ici : `incendie-erp-ssi-annuelle` porte `erp: true` et couvre donc déjà tous les ERP, cinquième catégorie comprise. L'ajouter aurait créé un doublon.\n\n`personne_qualifiee` traduit « technicien compétent » : le texte n'exige ni organisme agréé ni accréditation, et l'exploitant ne peut pas s'en charger lui-même.\n\nDomaine `electricite` et non `incendie` : le domaine décrit l'objet contrôlé, pas le texte qui l'impose. L'obligation vit donc auprès des autres vérifications électriques, où le dirigeant la cherchera.",
  },
  {
    id: "elec-travail-rapport-quadriennal",
    domaine: "electricite",
    libelle: "Rapport quadriennal — mise à jour complète du descriptif électrique",
    description:
      "Tous les quatre ans, l'ensemble des renseignements descriptifs de l'installation électrique fait l'objet d'une mise à jour complète, qui donne lieu à un rapport dit « quadriennal », rédigé comme un rapport de vérification initiale : description des bâtiments et des postes, schéma de principe unifilaire, caractéristiques des canalisations et des dispositifs de protection, classement des locaux et conditions d'influences externes. Les vérifications périodiques des trois autres années s'appuient sur ce descriptif ; sans lui, elles comparent l'installation à un état qui n'existe plus.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference:
          "Arrêté du 26 décembre 2011, annexe II, point 3.5 (mise à jour des renseignements descriptifs)",
        article: "Arrêté 2011-12-26 annexe II",
        url:
          "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000025100353",
        note: "« Une mise à jour complète de l'ensemble des renseignements descriptifs doit être effectuée tous les quatre ans ; elle donnera lieu à un rapport, dit \"quadriennal\", rédigé comme un rapport de visite initiale. » Verbatim relevé en première main le 2026-08-26.",
        versionConstatee: "2011-12-30",
      },
      {
        source: "CODE_TRAVAIL",
        reference: "R. 4226-16 (vérification périodique annuelle)",
        article: "R. 4226-16",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022765070/",
        versionConstatee: "2011-07-01",
      },
    ],
    periodicite: "quadriennale",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["organisme_accredite", "personne_qualifiee"],
    criticite: 4,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    notesInternes:
      "Créée le 2026-08-26, annexe II lue en première main. Le référentiel portait la vérification périodique annuelle mais ignorait le rapport quadriennal, qui n'existait ni en échéance ni en prose. C'est pourtant lui qui empêche la vérification périodique de dériver : les rapports périodiques ne consignent que les non-conformités et les écarts, sur la foi d'un descriptif établi une fois. Tous les quatre ans, ce descriptif est refait comme au premier jour.\n\nL'énumération sautait de `triennale` à `quinquennale` ; la valeur `quadriennale` (1460 jours) a été ajoutée à l'énumération et à l'enum Postgres.\n\nMêmes réalisateurs que la vérification périodique dont il est la forme renforcée : le point 3.5 dit « rédigé comme un rapport de visite initiale », pas « par un organisme accrédité ». L'accréditation n'est requise que pour la vérification initiale elle-même (R. 4226-14) et sur demande de l'inspection.\n\nCriticité 4 et non 5 : l'absence de rapport quadriennal ne crée pas de danger immédiat, elle dégrade la fiabilité de tous les contrôles suivants.",
  },
];
