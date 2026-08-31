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
// Il est désormais inscrit, en `obligation_manquante`. Il ne l'a pas été du
// premier coup : une première lecture n'avait rendu qu'une restitution
// partielle, moitié traduite, et un article dont on n'a pas le texte ne
// s'inscrit pas au corpus — c'est la règle que ce fichier sert. Le verbatim du I
// a été obtenu à la relecture du 2026-08-31, en redemandant explicitement le
// français sans traduction.
//
// DEUX PIÈGES DANS CET ARTICLE, tous deux nommés dans l'entrée :
//  * les quatre ans du III sont la durée d'AGRÉMENT DES ORGANISMES de formation,
//    accordée par le ministre. Ils pèsent sur l'organisme, pas sur l'exploitant,
//    et ne sont pas une périodicité d'obligation ;
//  * le I renvoie aux NORMES de R. 4544-3 pour les modalités de délivrance et de
//    renouvellement. C'est le renvoi exact qui avait produit le « triennal »
//    NF C 18-510 déjà retiré de ce dépôt. Aucune périodicité ne se dérive de là.

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
      ref: "R. 4544-11",
      intitule:
        "Habilitation spécifique aux travaux sous tension, et vérification préalable par l'employeur",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033200717",
      versionEnVigueur: "2025-10-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le travailleur qui effectue des travaux sous tension détient une habilitation spécifique, délivrée par l'employeur après obtention d'un document d'un organisme de formation agréé ; sa validité est subordonnée à une attestation d'absence de contre-indication médicale. L'employeur s'assure en outre, avant toute formation, que le travailleur a les capacités, compétences et expérience requises.",
      citationCle:
        "I.-Tout travailleur qui effectue des travaux sous tension est titulaire d'une habilitation spécifique délivrée par l'employeur après l'obtention d'un document délivré par un organisme de formation agréé attestant qu'il a acquis les connaissances et les compétences nécessaires. Cette habilitation spécifique est délivrée, maintenue ou renouvelée selon les modalités contenues dans les normes mentionnées à l'article R. 4544-3. La validité de l'habilitation spécifique est subordonnée à la détention, par le travailleur, d'une attestation qu'il ne présente pas de contre-indications médicales à la réalisation de travaux sous tension.",
      statut: "obligation_manquante",
      motif:
        "DEUX obligations d'employeur, distinctes de l'habilitation ordinaire de R. 4544-10 que le référentiel porte déjà, et aucune des deux n'est encodée.\n\n(1) L'habilitation SPÉCIFIQUE aux travaux sous tension : elle suppose un document d'un organisme de formation agréé, et sa validité est subordonnée à une attestation médicale distincte de celle de R. 4544-11-1 — celle-ci vise le travail sous tension, celle-là le voisinage.\n\n(2) Le II, que personne n'avait relevé : « L'employeur s'assure avant toute formation que les travailleurs qui suivent la formation mentionnée au I ont les capacités et les compétences et expérience professionnelles requises dans le domaine des opérations d'ordre électrique. » C'est une vérification préalable à la charge de l'employeur, antérieure à la formation elle-même.\n\nDEUX CHIFFRES À NE PAS REPRENDRE. Les quatre ans du III sont la durée d'agrément des ORGANISMES de formation, accordée par le ministre : ils pèsent sur l'organisme, pas sur l'exploitant, et n'ont rien à faire au référentiel. Et le I renvoie aux normes de R. 4544-3 pour la délivrance, le maintien et le renouvellement — c'est le renvoi exact qui avait produit le « triennal » NF C 18-510 que ce dépôt a déjà retiré. Aucune périodicité ne se dérive de ce renvoi : une norme n'est pas une source opposable ici.",
      bloquePar:
        "Obligation nominative — le porteur salarié existe et saurait la porter —, mais elle n'est pas encodable en l'état : le Code ne lui donne aucune durée de validité propre, la renvoyant à des normes que le référentiel n'accepte pas comme source. L'encoder supposerait de trancher ce que « maintenue ou renouvelée selon les modalités contenues dans les normes » veut dire pour l'outil, et ce n'est pas un choix technique. Cette entrée existe pour que la question soit posée, pas pour la résoudre.",
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
