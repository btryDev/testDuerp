// Corpus : code du travail — opérations de chargement et de déchargement.
//
// Étendue « articles_cites » : huit des neuf articles du chapitre V. Le seul
// manquant est `R. 4515-8`, connu par le renvoi que lui fait `R. 4515-10` mais
// non ouvert. Le chapitre serait presque intégral ; il ne se déclare pas tel,
// parce qu'un article non lu suffit à rendre l'affirmation fausse.
//
// LE FONDEMENT N'EST PAS L'ARRÊTÉ DE 1996, ET C'EST LA CORRECTION PRINCIPALE
// DE CE CORPUS. Le brief du lot 8 datait le protocole de sécurité de l'arrêté
// du 26 avril 1996. Cet arrêté existe — sa version initiale a été lue le
// 2026-08-31 (JORFTEXT000000548018) — et il est bien à l'origine du dispositif.
// Mais il a été pris « en application de l'article R. 237-1 du code du travail »
// et renvoie aux « articles R. 237-7 et suivants » : une numérotation d'avant la
// recodification de 2008, qui ne résout plus. Le dispositif vit aujourd'hui aux
// articles R. 4515-1 à R. 4515-11, en vigueur au 1er mai 2008. C'est cette
// référence qui fonde l'obligation ; l'arrêté n'est pas cité.
//
// CE QUE LE CHAPITRE N'ÉCRIT PAS : aucune périodicité, nulle part. `R. 4515-9`
// prévoit qu'un protocole unique couvre les opérations répétitives et « reste
// applicable aussi longtemps que les employeurs intéressés considèrent que les
// conditions de déroulement des opérations n'ont subi aucune modification
// significative ». C'est une CONDITION de péremption, appréciée par les
// parties, pas une durée. L'obligation porte `periodicite: "autre"`.
//
// CE CHAPITRE EXCLUT LE PLAN DE PRÉVENTION, IL NE S'Y AJOUTE PAS. `R. 4515-1`
// déroge expressément aux articles R. 4512-2 à R. 4512-11, et `R. 4515-4` écrit
// que le protocole « remplace » le plan de prévention. Le module
// `PlanPrevention` du produit sert l'autre versant de la co-activité ; les deux
// ne se recouvrent pas.

import type { Corpus } from "./types";

export const CODE_TRAVAIL_CO_ACTIVITE: Corpus = {
  id: "code-travail-co-activite",
  intitule:
    "Code du travail — protocole de sécurité des opérations de chargement et de déchargement",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018491658/",
  etendue: "articles_cites",
  portee:
    "Le chapitre V du titre Ier du livre V : ce qu'impose la venue d'une entreprise extérieure de transport dans l'enceinte d'un établissement. Champ d'application et dérogation au plan de prévention (R. 4515-1), obligation du protocole écrit (R. 4515-4), son contenu pour chacune des deux parties (R. 4515-5 à R. 4515-7), le protocole unique des opérations répétitives (R. 4515-9), la dérogation quand le prestataire n'est pas identifiable (R. 4515-10) et la tenue d'un exemplaire à disposition (R. 4515-11). R. 4515-8, qui règle l'échange préalable, n'est pas lu.",
  articles: [
    {
      ref: "R. 4515-1",
      intitule: "Champ d'application et dérogations",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036483935",
      versionEnVigueur: "2018-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le chapitre s'applique aux opérations de chargement ou de déchargement réalisées par des entreprises extérieures transportant des marchandises en provenance ou à destination d'un lieu extérieur à l'enceinte de l'entreprise d'accueil, et déroge à l'inspection commune préalable comme au plan de prévention.",
      citationCle:
        "Les dispositions du présent chapitre s'appliquent aux opérations de chargement ou de déchargement réalisées par des entreprises extérieures transportant des marchandises, en provenance ou à destination d'un lieu extérieur à l'enceinte de l'entreprise utilisatrice, dite « entreprise d'accueil ».",
      statut: "retenu",
      obligations: ["co-activite-etablissement-protocole-securite"],
      reserve:
        "Aucun seuil, aucune fréquence minimale, aucune quantité : le champ est celui de toute livraison par un transporteur extérieur. Le produit ne porte aucun attribut d'établissement disant s'il en reçoit ; l'obligation s'applique donc à tout établissement de travail, conformément à la règle du non-renseigné.",
    },
    {
      ref: "R. 4515-4",
      intitule: "Obligation d'un protocole de sécurité écrit",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018529684",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Les opérations de chargement ou de déchargement font l'objet d'un document écrit dit « protocole de sécurité », qui remplace le plan de prévention.",
      citationCle:
        "Les opérations de chargement ou de déchargement, font l'objet d'un document écrit, dit « protocole de sécurité », remplaçant le plan de prévention.",
      statut: "retenu",
      obligations: ["co-activite-etablissement-protocole-securite"],
    },
    {
      ref: "R. 4515-5",
      intitule: "Objet du protocole de sécurité",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018491668/",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le protocole comprend les informations utiles à l'évaluation des risques générés par l'opération et les mesures de prévention à observer à chacune de ses phases.",
      statut: "sans_objet",
      motif:
        "Article de contenu : il dit ce que le protocole doit comporter, pas un acte distinct à porter au calendrier. Son contenu est repris dans la description de l'obligation fondée sur R. 4515-4 ; en faire une obligation à part aurait dédoublé la même ligne.",
    },
    {
      ref: "R. 4515-6",
      intitule: "Contenu du protocole pour l'entreprise d'accueil",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018491668/",
      versionEnVigueur: "2009-03-16",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Pour l'entreprise d'accueil, le protocole comprend notamment les consignes de sécurité, le lieu de livraison, les modalités d'accès et de stationnement avec plan et consignes de circulation, les matériels et engins utilisés, les moyens de secours, et l'identité du responsable désigné.",
      statut: "sans_objet",
      motif:
        "Article de contenu, comme R. 4515-5 : il énumère les cinq rubriques que le protocole doit porter côté entreprise d'accueil. Aucun acte distinct, aucune échéance. Ses rubriques sont reprises dans la description de l'obligation, où elles disent au dirigeant ce qu'il doit y écrire.",
    },
    {
      ref: "R. 4515-7",
      intitule: "Contenu du protocole pour le transporteur",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018491668/",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Pour le transporteur, le protocole décrit notamment les caractéristiques du véhicule, la nature et le conditionnement de la marchandise, et les précautions résultant des substances transportées.",
      statut: "sans_objet",
      motif:
        "Article de contenu portant sur la SECONDE partie au protocole. Il ne crée aucune obligation pour l'employeur d'accueil, qui est le sujet du référentiel : c'est au transporteur de fournir ces éléments. Aucune ligne ne s'y appuie.",
    },
    {
      ref: "R. 4515-8",
      intitule: "Échange préalable entre les employeurs",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018491668/",
      statut: "non_depouille",
    },
    {
      ref: "R. 4515-9",
      intitule: "Protocole unique pour les opérations répétitives",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018529674",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Les opérations répétitives impliquant les mêmes entreprises font l'objet d'un seul protocole établi avant la première opération, applicable tant que les conditions de déroulement n'ont subi aucune modification significative.",
      citationCle:
        "Ce protocole de sécurité reste applicable aussi longtemps que les employeurs intéressés considèrent que les conditions de déroulement des opérations n'ont subi aucune modification significative, dans l'un quelconque de leurs éléments constitutifs.",
      statut: "retenu",
      obligations: ["co-activite-etablissement-protocole-securite"],
      reserve:
        "C'EST L'ARTICLE QUI AURAIT PU FAIRE INVENTER UNE PÉRIODICITÉ, et il n'en écrit aucune. « Aussi longtemps que les employeurs intéressés considèrent que les conditions n'ont subi aucune modification significative » est une condition appréciée par les parties, pas une durée de validité. Encoder une revue annuelle ici aurait fabriqué une échéance à partir d'une prudence, pas d'un texte.",
    },
    {
      ref: "R. 4515-10",
      intitule: "Dérogation quand le prestataire n'est pas identifiable",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018491668/",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Lorsque le prestataire ne peut pas être identifié préalablement, ou que l'échange préalable n'a pas réuni toutes les informations, l'employeur d'accueil fournit et recueille par tout moyen approprié les éléments du protocole.",
      statut: "sans_objet",
      motif:
        "Article de modalité : il règle COMMENT procéder quand l'échange préalable de R. 4515-8 est impossible. L'obligation reste celle de R. 4515-4 — avoir un protocole —, et la dérogation n'en crée pas une seconde.",
    },
    {
      ref: "R. 4515-11",
      intitule: "Tenue d'un exemplaire à disposition",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036484027",
      versionEnVigueur: "2018-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Les chefs d'établissement des entreprises d'accueil et de transport tiennent un exemplaire de chaque protocole, daté et signé, à la disposition des comités sociaux et économiques et de l'inspection du travail.",
      citationCle:
        "Les chefs d'établissement des entreprises d'accueil et de transport tiennent un exemplaire de chaque protocole de sécurité, daté et signé, à la disposition : 1° Des comités sociaux et économiques des entreprises intéressées ; 2° De l'inspection du travail.",
      statut: "retenu",
      obligations: ["co-activite-etablissement-protocole-securite"],
      reserve:
        "C'est cet article qui établit que le transporteur est un CO-SIGNATAIRE et non un prestataire de l'entreprise d'accueil — les deux chefs d'établissement tiennent chacun un exemplaire. Il justifie le marqueur `aucun_tiers_attendu` porté par le domaine `co_activite` dans `DOMAINES_PRESTATAIRE_ATTENDUS`. Le produit n'offre par ailleurs qu'un dépôt de fichier là où le texte attend un écrit daté et signé à deux parties : même écart que R. 4227-39 et R. 4224-16, porté au rapport du lot 8 sans qu'aucune transmission `modele_absent` ne soit déclarée — la nomenclature de `docs/registre-securite-ecart.md` n'a pas été vérifiée.",
    },
  ],
};
