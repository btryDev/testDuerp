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
      prescrit:
        "RYTHME NON PORTÉ, relevé le 2026-08-27. La rédaction issue de l'arrêté du 1er septembre 2025 ajoute : « les dispositifs de sécurité et les asservissements liés, visés à l'article CH 35 § 3, doivent être vérifiés dans leur totalité tous les 3 ans », plus un contrôle d'étanchéité des systèmes thermodynamiques. Le référentiel ne porte que l'annuelle. Non encodé parce que le texte vise les seuls SYSTÈMES THERMODYNAMIQUES, qu'aucune propriété d'équipement ne distingue d'une CTA ordinaire : poser la triennale sur CTA sur-appliquerait.",
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
      intitule:
        "Domaine d'application et définitions — seuil de la « grande cuisine »",
      versionEnVigueur: "1980-08-15",
      luLe: "2026-08-26",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["cuisson-erp-verification-initiale"],
      citationCle:
        '« § 3. Un local ou un groupement de locaux non isolés entre eux comportant des appareils de cuisson et des appareils de remise en température dont la puissance utile totale est supérieure à 20 kW est appelé "grande cuisine". »',
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
      obligations: [
        "cuisson-erp-appareils-annuelle",
        "cuisson-erp-extinction-automatique-annuelle",
        "cuisson-erp-verification-initiale",
      ],
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
      intitule: "Appareils mobiles — caractéristiques et vérification des extincteurs",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000020303557/LEGISCTA000020317639/",
      prescrit:
        "§ 4 : un extincteur fait l'objet d'une vérification ANNUELLE et d'une révision TOUS LES DIX ANS par une personne ou un organisme compétent, avec étiquette d'identification portant les années et les mois des vérifications ; le plan d'implantation et le relevé des vérifications sont portés au registre de sécurité. Les § 1 à § 3 portent la dotation, le marquage et les caractéristiques de l'appareil, pas sa vérification. Chemin : Livre II > Titre Ier > Chapitre XI > Section 2 > Sous-section 9 — donc écarté en 5ᵉ catégorie par PE 1 § 1.",
      citationCle:
        "Un extincteur doit faire l'objet d'une vérification annuelle et d'une révision tous les dix ans par une personne ou un organisme compétent. Il doit être marqué d'une étiquette clairement identifiable apposée par la personne ou l'organisme ayant réalisé cette dernière. Les années et les mois des vérifications doivent apparaître sur l'étiquette. Un plan d'implantation des extincteurs et un relevé des vérifications doivent être portés au registre de sécurité.",
      versionEnVigueur: "2008-10-08",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["incendie-erp-extincteurs-annuelle"],      reserve:
        "La RÉVISION DÉCENNALE du § 4 — « une révision tous les dix ans par une personne ou un organisme compétent » — n'est portée par aucune obligation du référentiel. `incendie-erp-extincteurs-annuelle` porte l'annuelle du même paragraphe et rien d'autre. Relevé le 2026-09-01, non corrigé : ce lot est un relevé.",

    },
    {
      ref: "MS 73",
      versionEnVigueur: "1980-08-15",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "incendie-erp-extincteurs-annuelle",
        "incendie-erp-ria-annuelle",
        "incendie-erp-ssi-annuelle",
        "incendie-erp-ssi-triennale",
        "cuisson-erp-extinction-automatique-annuelle",
      ],
      prescrit:
        "La triennale du § 2 ne vise QUE les systèmes de sécurité incendie de catégories A et B et les sprinkleurs, par personne ou organisme agréé — relu le 2026-08-27. Une obligation qui l'appliquerait aux SSI sans distinction de catégorie sur-couvrirait. Le § 2 fonde par ailleurs l'annuelle des dispositifs d'extinction automatique de cuisine, que GC 22 ne fonde pas.",
    },
    {
      ref: "EC 14",
      intitule: "Exploitation de l'éclairage de sécurité (ERP)",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000020303557/LEGISCTA000020317456/",
      prescrit:
        "§ 3 : l'exploitant s'assure lui-même, une fois par mois, du passage en position de fonctionnement et de l'allumage de toutes les lampes, et de l'efficacité de la commande de mise en repos à distance et de la remise automatique en veille ; une fois tous les six mois, de l'autonomie d'au moins 1 heure. Ces opérations peuvent être automatiques avec des blocs SATI. Elles et leurs résultats sont consignés au registre de sécurité. Les § 1 et § 2 portent les états de veille, de repos et d'arrêt, sans périodicité.",
      citationCle:
        "L'exploitant s'assure périodiquement : - une fois par mois : - du passage à la position de fonctionnement en cas de défaillance de l'alimentation normale et à la vérification de l'allumage de toutes les lampes (le fonctionnement doit être strictement limité au temps nécessaire au contrôle visuel) ; - de l'efficacité de la commande de mise en position de repos à distance et de la remise automatique en position de veille au retour de l'alimentation normale. - une fois tous les six mois, de l'autonomie d'au moins 1 heure. Ces opérations peuvent être effectuées automatiquement par l'utilisation de blocs autonomes comportant un système automatique de test intégré (SATI) conforme à la norme NF C 71-820 (mai 1999). Dans les établissements comportant des périodes de fermeture, ces opérations sont effectuées de telle manière qu'au début de chaque période d'ouverture au public l'installation d'éclairage ait retrouvé l'autonomie prescrite. Les opérations ci-dessus et leurs résultats doivent être consignés dans le registre de sécurité.",
      versionEnVigueur: "2010-05-16",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: [
        "incendie-erp-eclairage-securite-autonomie-semestrielle",
        "incendie-erp-eclairage-securite-essai-mensuel",
      ],      reserve:
        "La NF C 71-820 (mai 1999) visée par le § 3 est une norme privée : elle ne fonde rien, c'est EC 14 qui autorise l'automatisation par SATI. L'exception SATI n'est encodée dans aucune condition du référentiel, pas plus côté ERP que côté lieu de travail.",

    },
    {
      ref: "EC 15",
      intitule: "Vérifications des installations d'éclairage (ERP)",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000020303557/LEGISCTA000020317456/",
      prescrit:
        "Rien par lui-même : article de RENVOI d'une phrase. Il soumet les installations d'éclairage aux conditions de EL 19, qui porte seul la périodicité annuelle. Citer EC 15 sans EL 19 ne fonde aucune fréquence.",
      citationCle:
        "Les installations d'éclairage doivent être vérifiées dans les conditions de l'article EL 19.",
      versionEnVigueur: "1980-08-15",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["incendie-erp-baes-annuelle"],
    },
    {
      ref: "EL 19",
      intitule: "Vérifications techniques des installations électriques et d'éclairage (ERP)",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000020303557/LEGISCTA000020314182/",
      prescrit:
        "§ 3 : les vérifications périodiques des installations électriques et d'éclairage NON MODIFIÉES sont ANNUELLES, dans les conditions de GE 10, et portent sur une liste close d'articles — dont EC 13 et EC 14 § 3, ce qui rattache l'éclairage de sécurité à l'annuelle. Le § 2 renvoie à GE 7 et GE 8 § 1 pour les installations neuves ou modifiées. Chemin : Livre II > Titre Ier > Chapitre VII > Section 4 — donc écarté en 5ᵉ catégorie par PE 1 § 1.",
      citationCle:
        "Les vérifications périodiques des installations non modifiées doivent être effectuées annuellement dans les conditions prévues à l'article GE 10. Elles concernent les articles suivants à condition qu'ils soient applicables à l'établissement : ― EL 4 (§ 4) ; EL 5 (§ 1, 4 et 5) ; EL 8 (§ 3) ; EL 10 (§ 4) ; EL 11 (§ 3, 4 et 7) ; EL 15 (§ 3) ; EL 17 et EL 18 ; ― EC 5 (§ 5) ; EC 6 (§ 5 et 6) ; EC 7 ; EC 9 (§ 1) ; EC 13 et EC 14 (§ 3).",
      versionEnVigueur: "2010-01-23",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: [
        "elec-erp-cat1-4-annuelle",
        "elec-erp-groupe-electrogene-annuel",
        "elec-erp-mise-en-service",
        "incendie-erp-baes-annuelle",
      ],      reserve:
        "Le dernier alinéa renvoie à un texte ABROGÉ : « Il conviendra d'adjoindre à ce document le rapport de vérification périodique effectuée au titre du décret n° 88-1056 du 14 novembre 1988. » Ce décret a été abrogé et recodifié aux articles R. 4226-* du Code du travail. Relevé le 2026-09-01, non corrigé : le renvoi est dans le texte officiel, ce n'est pas une erreur du référentiel.",

    },
    {
      ref: "DF 10",
      intitule: "Vérifications techniques des installations de désenfumage (ERP)",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000020303557/LEGISCTA000020304211/",
      prescrit:
        "§ 2 : la périodicité des vérifications de désenfumage est de UN AN, sur six points énumérés (commandes manuelles et automatiques, volets/exutoires/ouvrants, fermeture des éléments mobiles de compartimentage, arrêt de la ventilation de confort, ventilateurs de désenfumage, mesures de pression, débit et vitesse en désenfumage mécanique). § 3 : lorsque coexistent un désenfumage MÉCANIQUE et un SSI de catégorie A ou B, les vérifications sont faites TOUS LES TROIS ANS par un organisme agréé.",
      citationCle:
        "§ 2. La périodicité des vérifications est de un an. Elles concernent : le fonctionnement des commandes manuelles et automatiques ; le fonctionnement des volets, exutoires et ouvrants de désenfumage ; la fermeture des éléments mobiles de compartimentage participant à la fonction désenfumage ; l'arrêt de la ventilation de confort mentionné à l'article DF 3, § 5 ; le fonctionnement des ventilateurs de désenfumage ; les mesures de pression, de débit et de vitesse, dans le cas du désenfumage mécanique. § 3. Lorsque existent une installation de désenfumage mécanique et un système de sécurité incendie de catégorie A ou B, les vérifications sont effectuées tous les trois ans par un organisme agréé.",
      versionEnVigueur: "2007-10-28",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["incendie-erp-desenfumage-annuelle"],      reserve:
        "Le § 3 — triennale par organisme agréé quand désenfumage mécanique ET SSI de catégorie A ou B — n'est porté par aucune obligation : `incendie-erp-desenfumage-annuelle` porte l'annuelle du § 2 et rien d'autre. La cause est connue et inchangée : la condition croise deux catégories d'équipement, que le modèle ne sait pas exprimer. Reconstaté à la source le 2026-09-01.",

    },
    {
      ref: "GE 4",
      intitule: "Visites périodiques des établissements des quatre premières catégories",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000020303557/LEGISCTA000020303874/",
      versionFuture: "2027-06-01",
      prescrit:
        "§ 1 : les établissements des 1re, 2e, 3e et 4e catégories sont visités périodiquement par les commissions de sécurité selon un TABLEAU croisant le type (J, L, M, N, O, P, R avec ou sans hébergement, S, T, U, V, W, X, Y) et la catégorie, qui donne trois ans ou cinq ans. Ce n'est donc pas une périodicité unique. Aucune ligne de 5ᵉ catégorie : l'article relève du Livre II, écarté en 5ᵉ par PE 1 § 1.",
      citationCle:
        "Les établissements des 1re, 2e, 3e et 4e catégories doivent être visités périodiquement par les commissions de sécurité selon la fréquence fixée au tableau suivant en fonction de leur type et de leur catégorie",
      versionEnVigueur: "2015-01-01",
      luLe: "2026-09-01",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: ["incendie-erp-5-visite-commission"],      reserve:
        "Deux relevés du 2026-09-01. (1) Légifrance affiche une FIN DE VIGUEUR au 1er juin 2027 pour cet article : `versionFuture` est posée ici, mais aucune `relectureDue` n'a été ajoutée sur `incendie-erp-5-visite-commission`, qui le cite — ce lot est un relevé. (2) Le § 3 est un PLAFOND, pas un rythme : quand un établissement sans hébergement enchaîne deux visites périodiques favorables, « le délai fixé pour sa prochaine visite par le tableau ci-dessus peut être prolongé dans la limite de cinq ans ». « Dans la limite de cinq ans » n'est pas « tous les cinq ans », et le § 4 permet en outre au maire ou au préfet de modifier la fréquence.",

    },
  ],
};
