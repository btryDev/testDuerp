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
    "Articles R. 4227-* et R. 4226-19 du Code du travail, plus L. 4711-5. S'appliquent à tout employeur, indépendamment du classement ERP — c'est le fondement réel de la plupart des échéances portées pour la 5e catégorie.",
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
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["incendie-registre-securite"],
    },
  ],
};
