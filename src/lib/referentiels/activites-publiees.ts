// Le registre des identifiants d'activité déjà exposés aux dirigeants.
//
// Les activités non couvertes (ADR-020) ne sont pas du référentiel comme le
// reste. Un libellé de risque se reformule sans conséquence : il n'existe
// qu'ici, en TypeScript, et le prochain rendu prend la nouvelle version. Un
// identifiant d'activité, lui, part en base — c'est la clé de
// `Duerp.reponsesActivitesNonCouvertes` — puis dans le snapshot d'une version
// figée, conservée quarante ans.
//
// D'où la seule règle de ce fichier : **un identifiant publié ne se retire
// jamais, ne se renomme jamais, ne se réemploie jamais pour autre chose.**
//
// Ce que le retrait produirait, concrètement : `questionsActivites` n'itère
// que sur le référentiel courant, donc une réponse dont l'identifiant a
// disparu n'est plus lue nulle part. Elle ne provoque pas d'erreur, elle
// devient invisible. Le dirigeant qui avait déclaré son rayon boucherie
// regrave alors un DUERP muet sur la boucherie — le cas même que l'ADR-020
// existe pour empêcher, obtenu cette fois par une correction de référentiel
// qui paraissait anodine.
//
// ## Scinder ou remplacer une activité
//
// C'est légitime, et ça se fait en ajoutant, jamais en retirant :
//
//  1. les nouveaux identifiants entrent dans le référentiel **et** ici ;
//  2. l'ancien reste dans le référentiel tant que des réponses le portent,
//     quitte à ce que sa question soit reformulée ;
//  3. si l'ancien doit vraiment cesser d'être posé, il faut d'abord une
//     migration qui traduise les réponses existantes vers les nouveaux
//     identifiants — après quoi le retrait se déclare ici, en connaissance
//     de cause, en déplaçant la ligne dans `ACTIVITES_RETIREES`.
//
// Le test `referentiels.test.ts` compare ce registre au référentiel courant :
// retirer un identifiant sans passer par là fait échouer la suite. C'est le
// but — trancher doit coûter une ligne, pas une relecture.

/**
 * Tout identifiant d'activité qui a été, à un moment, posé comme question à
 * un dirigeant. Trié par secteur puis par ordre d'apparition.
 */
export const ACTIVITES_PUBLIEES: readonly string[] = [
  // commerce
  "com-decoupe-viande",
  "com-rayon-maree",
  "com-fabrication-boulangere",
  "com-intervention-chez-client",
  // restauration
  "resto-fabrication-boulangere",
  "resto-caisse-espece-fermeture",
  "resto-repas-hors-site",
  // bureau
  "bur-intervention-site-tiers",
  "bur-teletravail",
  "bur-travail-casque",
];

/**
 * Les identifiants retirés du référentiel **après** migration des réponses
 * qui les portaient. Ils restent listés : leur réemploi pour une autre
 * activité ferait dire à d'anciens snapshots autre chose que ce qu'ils
 * disaient.
 *
 * Vide à ce jour, et c'est l'état normal. Une ligne ici doit citer la
 * migration qui a traduit les réponses.
 */
export const ACTIVITES_RETIREES: readonly string[] = [];
