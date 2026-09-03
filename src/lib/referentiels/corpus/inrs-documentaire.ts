// Corpus : sources institutionnelles INRS.
//
// Ces documents ne sont pas des textes opposables : ce sont des guides
// techniques, cités en appui d'une obligation dont le fondement est ailleurs.
// Ils entrent au registre des corpus pour une seule raison — qu'aucune
// référence du référentiel ne reste hors du décompte. Une source qu'on ne
// compte pas est une source qu'on ne relit pas.
//
// `sans_objet` et non `retenu` : ils n'établissent aucune obligation.

import type { Corpus } from "./types";

export const INRS_DOCUMENTAIRE: Corpus = {
  id: "inrs-documentaire",
  intitule: "INRS — guides et fiches techniques",
  url: "https://www.inrs.fr/",
  etendue: "articles_cites",
  portee:
    "Sources institutionnelles citées en appui. Aucune n'est opposable : le fondement des obligations qui les citent est toujours un texte de droit.",
  articles: [
    {
      ref: "INRS ED 6127",
      intitule: "Habilitation électrique",
      url: "https://www.inrs.fr/media.html?refINRS=ED%206127",
      luLe: "2026-08-26",
      lecture: "premiere_main",
      statut: "sans_objet",
      motif:
        "Guide technique de l'INRS, cité en appui de l'obligation d'habilitation électrique. Il n'institue rien : le fondement est R. 4544-9 et suivants du Code du travail. Aucune échéance n'en découle.",
    },
    {
      ref: "INRS ED 6030",
      intitule: "Le permis de feu — Démarche et document support",
      url: "https://www.inrs.fr/media.html?refINRS=ED%206030",
      versionEnVigueur: "2019-08-01",
      luLe: "2026-09-03",
      lecture: "agent_verbatim",
      prescrit:
        "Rien. Brochure de douze pages, révisée en août 2019, éditée par une association loi 1901 : elle décrit une démarche et fournit un modèle de permis de feu à remplir. Aucune autorité ne la rend opposable.",
      // Deux passages, et ce sont EUX le résultat du lot. Le premier est la
      // définition de la p. 3, section « Les travaux concernés » ; le second
      // est la rubrique du formulaire modèle (p. 1/2 du document support), où
      // les deux lignes vides sont imprimées dans le document.
      citationCle:
        "Les travaux par points chauds regroupent : les opérations d'enlèvement de matières ou de désassemblage d'équipements (découpage, meulage, ébarbage…), les opérations d'assemblage (soudures) ou d'étanchéité (bitume). De manière générale, cette désignation comprend tous les travaux générateurs d'étincelles ou de surfaces chaudes. [Document support, rubrique « Type de travaux par points chauds » :] soudage / tronçonnage / découpage / meulage / […deux lignes laissées vides…]. [Rubrique voisine « Matériels utilisés » :] poste à souder / chalumeau / laser / tronçonneuse / […deux lignes laissées vides…].",
      statut: "sans_objet",
      motif:
        "Brochure de recommandations de l'INRS, citée en appui du module `PermisFeu` et de son référentiel de mesures. Elle n'institue rien — le fondement le plus proche est l'arrêté du 19 mars 1993, art. 1er, 21° (voir `code-travail-plan-prevention.ts`), qui vise le seul soudage oxyacétylénique et pour le seul objet du plan de prévention ÉCRIT. Aucune échéance n'en découle.\n\nCE QUE LE VERBATIM ÉTABLIT, ET C'EST LE RÉSULTAT DU LOT DU 2026-09-03. `NatureTravauxPointChaud` (onze valeurs) est réputée transcrire cette brochure. Elle ne le peut pas : ED 6030 NE PORTE AUCUNE NOMENCLATURE FERMÉE. Sa définition est ouverte par construction — deux catégories suivies de points de suspension, puis un fourre-tout explicite (« tous les travaux générateurs d'étincelles ou de surfaces chaudes ») —, et sa seule liste cochable en compte QUATRE, avec deux lignes vides imprimées pour en ajouter. Une liste que son auteur laisse ouverte n'est pas une nomenclature, et un test qui prétendrait y tenir les onze valeurs feindrait de vérifier quelque chose.\n\nDEUX RUBRIQUES CONFONDUES, relevé au passage. `chalumeau` est une valeur de `NatureTravauxPointChaud` ; dans ED 6030, « chalumeau » est un MATÉRIEL, pas un type de travaux. Le modèle a fusionné les deux colonnes du formulaire. Ce n'est pas faux au sens où le dirigeant s'y retrouve, mais cela interdit de présenter la liste comme le reflet d'un document.",
    },
  ],
};
