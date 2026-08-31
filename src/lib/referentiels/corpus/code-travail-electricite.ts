// Corpus : code du travail — installations électriques et habilitation.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite, plus
// R. 4544-9, inscrit pour lever une ambiguïté de la `portee` — voir sa note.
//
// ⚠ CE QUE LA SECTION 4 PORTE ET QUE LE RÉFÉRENTIEL N'ENCODE PAS. `R. 4544-11`
// a été réécrit au 1er octobre 2025 par le décret n° 2025-355, et son I met à la
// charge de l'employeur une obligation DISTINCTE de l'habilitation ordinaire :
// tout travailleur effectuant des travaux SOUS TENSION doit détenir une
// habilitation spécifique, délivrée par l'employeur après obtention d'un
// document établi par un organisme de formation agréé. Aucune obligation du
// référentiel ne la porte.
//
// Elle n'est pas déclarée `obligation_manquante` ici, et c'est délibéré : la
// lecture de R. 4544-11 n'a pas rendu de verbatim exploitable, seulement une
// restitution partielle. Un article dont on n'a pas le texte ne s'inscrit pas au
// corpus — c'est la règle même que ce fichier sert. Il reste donc à dépouiller,
// et cette note existe pour qu'on sache où chercher.
//
// À ne pas confondre : les quatre ans du III de R. 4544-11 sont la durée
// d'AGRÉMENT DES ORGANISMES de formation, accordée par le ministre. Ils pèsent
// sur l'organisme, pas sur l'exploitant, et n'ont rien à faire au référentiel.

import type { Corpus } from "./types";

export const CODE_TRAVAIL_ELECTRICITE: Corpus = {
  id: "code-travail-electricite",
  intitule: "Code du travail — installations électriques et habilitation",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018489059/",
  etendue: "articles_cites",
  portee:
    "Vérifications des installations électriques (R. 4226-14 et s.) et habilitation des travailleurs (section 4, R. 4544-9 à R. 4544-11-2). ATTENTION : R. 4544-10 et R. 4544-11 ont été réécrits au 1er octobre 2025 par le décret n° 2025-355, qui a aussi créé R. 4544-11-1 et -11-2. R. 4544-11-1 EST cité et retenu depuis le 2026-08-27 ; seul R. 4544-11-2 ne l'est pas — la portée annonçait les deux comme non cités, ce que le premier article de la liste démentait. Corrigé le 2026-08-31.",
  articles: [
    {
      ref: "R. 4544-11-1",
      intitule: "Attestation d'absence de contre-indications médicales",
      versionEnVigueur: "2025-10-01",
      luLe: "2026-08-27",
      lecture: "premiere_main",
      citationCle:
        "L'attestation mentionnée aux articles R. 4544-10 et R. 4544-11, d'une validité de cinq ans, est délivrée par le médecin du travail à l'issue d'un examen médical qu'il réalise. Elle est présentée par le travailleur à l'employeur, qui en conserve une copie pendant toute sa durée de validité.",
      statut: "retenu",
      obligations: ["elec-salarie-attestation-medicale-voisinage"],
    },
    {
      ref: "R. 4544-9",
      intitule: "Opérations réservées aux travailleurs habilités",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022849102",
      versionEnVigueur: "2011-07-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Les opérations sur les installations électriques ou dans leur voisinage sont réservées aux travailleurs habilités.",
      citationCle:
        "Les opérations sur les installations électriques ou dans leur voisinage ne peuvent être effectuées que par des travailleurs habilités.",
      statut: "sans_objet",
      motif:
        "Règle de champ, en une phrase : elle dit QUI peut opérer, sans instituer d'acte, de pièce ni de durée. L'habilitation elle-même est délivrée par R. 4544-10, que le référentiel retient.\n\nElle est inscrite ici parce que la `portee` de ce corpus désignait « R. 4544-9 et s. » comme le siège de l'habilitation, ce qui est trompeur : c'est la borne d'ouverture de la section, et elle ne porte rien. L'article qui coûte est R. 4544-11 — voir la note du corpus.",
    },
    {
      ref: "R. 4226-14",
      versionEnVigueur: "2011-07-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["elec-travail-mise-en-service"],
    },
    {
      ref: "R. 4226-16",
      versionEnVigueur: "2011-07-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["elec-travail-periodique-annuelle"],
    },
    {
      ref: "R. 4226-19",
      versionEnVigueur: "2011-07-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "elec-travail-consignation-registre",
        "incendie-travail-eclairage-securite-autonomie-semestrielle",
        "incendie-travail-eclairage-securite-essai-mensuel",
      ],
    },
    {
      ref: "R. 4544-10",
      versionEnVigueur: "2025-10-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["elec-travail-habilitation-personnel"],
    },
    {
      ref: "L. 4711-5",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "elec-travail-consignation-registre",
        "incendie-registre-securite",
      ],
    },
  ],
};
