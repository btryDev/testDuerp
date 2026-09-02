// Ce que l'annexe d'exposition du DUERP dit d'elle-même.
//
// CE QU'ELLE DISAIT, ET QUI ÉTAIT FAUX. La page s'intitulait « Annexe —
// Exposition (R. 4121-1-1) » et annonçait rendre « la proportion de salariés
// exposés au-delà des seuils réglementaires ». Elle rend un effectif brut par
// risque du référentiel sectoriel du produit, plus un drapeau CMR. Trois
// écarts avec l'article, relevés à sa lecture (voir l'entrée `R. 4121-1-1` de
// `referentiels/corpus/code-travail-duerp.ts`) :
//
//   (a) l'article demande une PROPORTION, le tableau donne un NOMBRE ;
//   (b) l'assiette de l'article est une liste fermée de facteurs de risques
//       professionnels, et le modèle `Risque` ne rattache aucun risque à un
//       facteur : les lignes imprimées sont les risques du référentiel
//       sectoriel, qui est un autre découpage ;
//   (c) « CMR » n'est pas l'un de ces facteurs — celui qui s'en approche vise
//       les agents chimiques dangereux, poussières et fumées comprises, ce
//       qui est plus large et autrement borné.
//
// POURQUOI L'ANNEXE EST GARDÉE PLUTÔT QUE RETIRÉE. Les trois colonnes sont de
// vraies saisies du dirigeant, faites sur ses écrans de risque, et les
// réunir sur une page a une valeur propre : c'est le seul endroit du document
// où l'on voit d'un coup combien de personnes sont concernées et quand les
// dernières mesures physiques datent. Retirer la page perdrait ces faits pour
// corriger une phrase. Ce qui était faux n'était pas le tableau, c'était son
// titre et son chapeau.
//
// POURQUOI ELLE NE PRÉTEND PLUS RIEN CALCULER. Le PDF part chez un tiers —
// inspecteur du travail, assureur, acquéreur, médecin du travail. Une page
// qui porte un numéro d'article dans son titre est lue comme la pièce que cet
// article réclame. Le titre ne le porte donc plus, et le chapeau dit dans
// l'ordre : ce que ce tableau est, qu'il n'est pas l'annexe de l'article, et
// les deux choses qui manquent pour la produire. Nommer le manque vaut mieux
// que le taire : le lecteur qui a besoin de l'annexe de l'article sait
// qu'elle n'est pas là, au lieu de croire l'avoir sous les yeux.
//
// CE QU'ON N'ÉCRIT PAS ICI. Que ces seuils sont introuvables. C'est vrai — le
// dépouillement du 2026-09-02 n'a pas su dire où ils vivent depuis
// l'abrogation des articles qui les portaient — mais c'est un état de la
// recherche interne, pas une pièce du dossier. Un document remis à un tiers
// n'argumente pas contre le texte qu'il cite.
//
// Module **pur** : sorti du JSX pour qu'il se vérifie (même raison que
// `mentions-perimetre.ts` — le dossier `pdf/` n'a presque aucun test de
// rendu, et une phrase inversée y passerait la suite au vert).

/**
 * Le titre de la page. **Il ne porte aucun numéro d'article** : c'est ce qui
 * distingue un tableau de travail de la pièce qu'un texte réclame.
 */
export const TITRE_ANNEXE_EXPOSITION =
  "Expositions relevées — dénombrement indicatif";

/**
 * Le chapeau, en deux paragraphes : ce que la page est, puis ce qu'elle
 * n'est pas.
 */
export const CHAPEAU_ANNEXE_EXPOSITION = [
  "Ce tableau réunit ce qui a été saisi risque par risque dans ce document " +
    "unique : un nombre de salariés exposés, une date de dernières mesures " +
    "physiques, une exposition CMR déclarée. C'est un dénombrement indicatif, " +
    "utile à la lecture de l'évaluation.",
  "Ce n'est pas l'annexe prévue par l'article R. 4121-1-1 et cela ne la " +
    "remplace pas. Cet article demande la proportion de salariés exposés " +
    "au-delà de seuils, rapportée aux facteurs de risques professionnels " +
    "qu'il désigne. Deux choses manquent ici pour la produire : ce document " +
    "ne rattache aucun de ses risques à ces facteurs — les lignes ci-dessous " +
    "sont les risques du référentiel sectoriel, qui est un autre découpage —, " +
    "et il ne compare aucune exposition à un seuil. Le nombre porté dans la " +
    "colonne « Salariés exposés » est donc un effectif, et non une " +
    "proportion.",
] as const;
