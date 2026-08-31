// Corpus : code du travail — matériel de premier secours et secouriste.
//
// Étendue « integral » : la section 3 du chapitre IV compte exactement trois
// articles (R. 4224-14 à R. 4224-16), et les trois sont ici.
//
// POURQUOI UN FICHIER À PART. `code-travail-portes.ts` couvre déjà des articles
// R. 4224-* — mais ceux de la section 2 (portes et portails) et de la section 4
// (maintenance). Il se déclare « portes et portails, maintenance des lieux de
// travail », et y ranger la section secours ferait de sa `portee` un mensonge.
// Les deux sections sont voisines dans le Code et étrangères l'une à l'autre.
//
// À SAVOIR, parce que ce dépôt s'y est déjà trompé : `R. 4224-15` a été cité
// par erreur pour le dossier d'entretien des portes automatiques, et corrigé à
// l'audit d'août 2026 au profit de `R. 4224-17`. Les `notesInternes` de
// `portes-portails.ts` en portent encore la trace. C'est aussi ce qui explique
// qu'un `grep` sur « R. 4224-15 » dans `src/` renvoie des résultats : ils
// racontent une correction, pas une citation.
//
// TROIS ARTICLES, TROIS OBLIGATIONS, DEUX PORTEURS. Le matériel est une chose
// de l'établissement ; le secouriste est une personne nommée ; les mesures
// d'organisation sont un document de l'établissement. Les fondre en une ligne
// « premiers secours » aurait reproduit exactement le défaut que l'ADR-022 a
// corrigé sur `PE 4`.
//
// Lecture : `agent_verbatim`, relevés sur Légifrance le 2026-08-31.

import type { Corpus } from "./types";

export const CODE_TRAVAIL_SECOURS: Corpus = {
  id: "code-travail-secours",
  intitule: "Code du travail — matériel de premier secours et secouriste",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018489002/",
  etendue: "integral",
  portee:
    "Section 3 « Matériel de premier secours et secouriste » du chapitre IV (sécurité des lieux de travail) : le matériel (R. 4224-14), le membre du personnel formé au secourisme (R. 4224-15), et les mesures d'organisation des premiers secours consignées dans un document tenu à disposition de l'inspection du travail (R. 4224-16). S'applique à tout employeur, sans condition d'effectif — les conditions de R. 4224-15 portent sur la nature des travaux, pas sur la taille de l'entreprise.",
  articles: [
    {
      ref: "R. 4224-14",
      intitule: "Matériel de premiers secours",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532205",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Les lieux de travail sont équipés d'un matériel de premiers secours adapté à la nature des risques et facilement accessible.",
      citationCle:
        "Les lieux de travail sont équipés d'un matériel de premiers secours adapté à la nature des risques et facilement accessible.",
      statut: "retenu",
      obligations: ["secours-etablissement-materiel"],
      reserve:
        "L'article ne dit ni ce que le matériel contient, ni à quel rythme il se vérifie, ni quand il se renouvelle. Aucune de ces trois choses n'est encodée, et aucune ne peut l'être depuis ce texte : la composition d'une trousse de secours et sa vérification périodique relèvent de recommandations de l'INRS et de normes privées, jamais du Code. C'est très exactement le piège du « triennal » que ce dépôt a déjà retiré — une périodicité de vérification de la trousse serait une échéance inventée.",
    },
    {
      ref: "R. 4224-15",
      intitule: "Membre du personnel formé au secourisme",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532203",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Un membre du personnel reçoit la formation de secouriste nécessaire dans chaque atelier où sont accomplis des travaux dangereux, et sur chaque chantier d'au moins vingt travailleurs pendant plus de quinze jours où sont réalisés des travaux dangereux.",
      citationCle:
        "Un membre du personnel reçoit la formation de secouriste nécessaire pour donner les premiers secours en cas d'urgence dans : 1° Chaque atelier où sont accomplis des travaux dangereux ; 2° Chaque chantier employant vingt travailleurs au moins pendant plus de quinze jours où sont réalisés des travaux dangereux. Les travailleurs ainsi formés ne peuvent remplacer les infirmiers.",
      statut: "retenu",
      obligations: ["secours-salarie-secouriste"],
      reserve:
        "Le déclenchement de l'article suppose de savoir si l'établissement comporte un « atelier où sont accomplis des travaux dangereux » — une qualification que le produit ne détient pas et ne dérive pas : ni le parc d'équipements ni le code NAF ne la donnent, et la déduire serait le cinquième déclencheur (activité réellement exercée), non implémenté. Le porteur salarié rend l'absence sûre plutôt que fausse : sans titre déclaré, aucune ligne — jamais une ligne à tort chez un bureau qui n'a pas d'atelier.",
    },
    {
      ref: "R. 4224-16",
      intitule: "Mesures d'organisation des premiers secours",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532201",
      versionEnVigueur: "2021-02-13",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "En l'absence d'infirmiers, l'employeur prend, après avis du médecin du travail et en liaison avec les services de secours extérieurs, les mesures nécessaires pour assurer les premiers secours ; ces mesures sont consignées dans un document tenu à la disposition de l'inspection du travail.",
      citationCle:
        "En l'absence d'infirmiers, ou lorsque leur nombre ne permet pas d'assurer une présence permanente, l'employeur prend, après avis du médecin du travail, les mesures nécessaires pour assurer les premiers secours aux accidentés et aux malades. Ces mesures qui sont prises en liaison notamment avec les services de secours d'urgence extérieurs à l'entreprise sont adaptées à la nature des risques. Ces mesures sont consignées dans un document tenu à la disposition de l'agent de contrôle de l'inspection du travail.",
      statut: "retenu",
      obligations: ["secours-etablissement-mesures"],
    },
  ],
};
