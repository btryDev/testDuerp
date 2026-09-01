// Corpus : articles cités par le référentiel, dépouillés le 26 août 2026.
//
// Étendue « articles_cites » : cette liste ne contient QUE les articles que le
// référentiel cite. Elle ne dit rien de ce que le texte contient par ailleurs,
// et ne peut donc jamais se déclarer complète. C'est un remboursement de dette,
// pas une preuve d'exhaustivité.

import type { Corpus } from "./types";

export const CODE_TRAVAIL_INCENDIE: Corpus = {
  id: "code-travail-incendie",
  intitule: "Code du travail — prévention des incendies, lieux de travail",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018489127/",
  etendue: "articles_cites",
  portee:
    "Articles R. 4227-* et R. 4226-19 du Code du travail, plus le chapitre unique L. 4711-1 à L. 4711-5 et D. 4711-2 à D. 4711-3 (pièces de vérification : mentions, datation, conservation). S'appliquent à tout employeur, indépendamment du classement ERP — c'est le fondement réel de la plupart des échéances portées pour la 5e catégorie.",
  articles: [
    {
      ref: "R. 4227-28",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["incendie-travail-moyens-lutte"],
    },
    {
      ref: "R. 4227-29",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["incendie-travail-moyens-lutte"],
    },
    {
      ref: "R. 4227-14",
      versionEnVigueur: "2011-07-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "incendie-travail-eclairage-securite-autonomie-semestrielle",
        "incendie-travail-eclairage-securite-essai-mensuel",
      ],
    },
    {
      ref: "R. 4226-19",
      intitule:
        "Consignation au registre des résultats des vérifications électriques",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022765064",
      versionEnVigueur: "2011-07-01",
      luLe: "2026-09-01",
      lecture: "agent_verbatim",
      prescrit:
        "Les résultats des SEULES vérifications de R. 4226-14 (initiale) et R. 4226-16 (périodique) sont consignés sur un registre. Rien sur l'éclairage de sécurité.",
      citationCle:
        "Les résultats des vérifications prévues aux articles R. 4226-14 et R. 4226-16 ainsi que les justifications des travaux et modifications effectués pour porter remède aux défectuosités constatées sont consignés sur un registre. Lorsque les vérifications sont effectuées par un organisme accrédité, les rapports établis à la suite de ces vérifications sont annexés à ce registre.",
      statut: "retenu",
      obligations: [
        "incendie-travail-eclairage-securite-autonomie-semestrielle",
        "incendie-travail-eclairage-securite-essai-mensuel",
      ],
      reserve:
        "RÉFÉRENCE À TORT, constat du 2026-09-01, article ouvert à la source. R. 4226-19 se borne aux vérifications électriques de R. 4226-14 et R. 4226-16, et son chemin le confirme : Chapitre VI « Installations électriques », Section 5 « Vérification des installations électriques ». Il ne fonde ni l'essai mensuel ni l'autonomie semestrielle de l'éclairage de sécurité, qui relèvent de R. 4227-14 et de l'arrêté du 14 décembre 2011. La question avait été ouverte quatre fois depuis le 2026-08-27, une fois dans chaque sens ; elle est tranchée. Retirer la référence des deux obligations n'était pas dans le lot de relevé.",
    },
    {
      ref: "R. 4227-39",
      versionEnVigueur: "2011-11-10",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "incendie-registre-securite",
        "incendie-travail-exercice-semestriel",
      ],
    },
    {
      ref: "R. 4227-34",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["incendie-travail-exercice-semestriel"],
    },
    {
      ref: "R. 4227-37",
      versionEnVigueur: "2011-11-10",
      versionFuture: "2027-01-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["incendie-travail-consigne-affichee"],
    },
    {
      ref: "L. 4711-5",
      intitule: "Faculté de réunir les registres en un registre unique",
      versionEnVigueur: "2008-05-01",
      prescrit:
        "Rien. L'article AUTORISE, il n'impose pas : il permet de regrouper en un seul registre des informations dont d'autres textes prévoient qu'elles figurent dans des registres distincts.",
      citationCle:
        "Lorsqu'il est prévu que les informations énumérées aux articles L. 4711-1 et L. 4711-2 figurent dans des registres distincts, l'employeur est autorisé à réunir ces informations dans un registre unique dès lors que cette mesure est de nature à faciliter la conservation et la consultation de ces informations.",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["incendie-registre-securite"],
      reserve:
        "Relu le 2026-08-31 : cet article ne fonde PAS l'obligation, contrairement à ce que son rattachement laissait croire. Le verbe est « est autorisé à » — une faculté. Il était pourtant la seule référence Code du travail portant la branche `travail: true` de `incendie-registre-securite`, c'est-à-dire que l'obligation s'appliquait à tout employeur sans qu'aucun texte cité ne l'établisse. L. 4711-1, L. 4711-2, D. 4711-2 et D. 4711-3 sont entrés au corpus le même jour pour porter réellement cette branche. L. 4711-5 reste rattaché parce que l'obligation le cite encore, désormais pour ce qu'il est : la forme permise, pas le fondement.",
    },
    {
      ref: "L. 4711-1",
      intitule:
        "Mentions obligatoires des attestations, consignes, résultats et rapports de vérification",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000006178110/",
      versionEnVigueur: "2008-05-01",
      prescrit:
        "Tout employeur : les pièces des vérifications et contrôles de santé-sécurité qui lui incombent portent des mentions obligatoires fixées par voie réglementaire (D. 4711-2). Aucune condition d'effectif, d'équipement ni de classement ERP.",
      citationCle:
        "Les attestations, consignes, résultats et rapports relatifs aux vérifications et contrôles mis à la charge de l'employeur au titre de la santé et de la sécurité au travail comportent des mentions obligatoires déterminées par voie réglementaire.",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["incendie-registre-securite"],
    },
    {
      ref: "L. 4711-2",
      intitule:
        "Conservation des observations et mises en demeure de l'inspection du travail",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000006178110/",
      versionEnVigueur: "2008-05-01",
      prescrit:
        "Tout employeur conserve les observations et mises en demeure notifiées par l'inspection du travail en matière de santé, de sécurité, de médecine du travail et de prévention des risques.",
      citationCle:
        "Les observations et mises en demeure notifiées par l'inspection du travail en matière de santé et de sécurité, de médecine du travail et de prévention des risques sont conservées par l'employeur.",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["incendie-registre-securite"],
    },
    {
      ref: "D. 4711-2",
      intitule: "Ce que les pièces de vérification doivent porter",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018493740/",
      versionEnVigueur: "2008-05-01",
      prescrit:
        "Les pièces visées à L. 4711-1 sont datées et mentionnent l'identité de la personne ou de l'organisme chargé du contrôle ainsi que celle de la personne qui l'a réalisé.",
      citationCle:
        "Les attestations, consignes, résultats et rapports relatifs aux vérifications et contrôles mis à la charge de l'employeur au titre de la santé et de la sécurité au travail sont datés. Ils mentionnent l'identité de la personne ou de l'organisme chargé du contrôle ou de la vérification ainsi que celle de la personne qui a réalisé le contrôle ou la vérification.",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["incendie-registre-securite"],
    },
    {
      ref: "D. 4711-3",
      intitule: "Durée de conservation des pièces de vérification",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018493740/",
      versionEnVigueur: "2008-05-01",
      prescrit:
        "Tout employeur conserve les documents des vérifications et contrôles des cinq dernières années et, en tout état de cause, ceux des deux derniers contrôles — ainsi que les observations et mises en demeure de l'inspection du travail.",
      citationCle:
        "L'employeur conserve les documents concernant les observations et mises en demeure de l'inspection du travail ainsi que ceux concernant les vérifications et contrôles mis à la charge des employeurs au titre de la santé et de la sécurité au travail des cinq dernières années et, en tout état de cause, ceux des deux derniers contrôles ou vérifications.",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["incendie-registre-securite"],
      reserve:
        "La durée de conservation — cinq ans, et en tout état de cause les deux derniers contrôles — n'est portée par aucun champ du référentiel. `incendie-registre-securite` est en `periodicite: autre`, ce qui dit « état à maintenir » et ne dit rien d'une rétention. Le produit conserve les rapports déposés sans jamais annoncer la durée que le texte exige.",
    },
  ],
};
