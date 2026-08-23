// Le marqueur d'archivage d'une ligne de suivi (ADR-012).
//
// Il vivait dans `generateur.ts`, avec la réconciliation qui le pose. Mais
// il se **lit** ailleurs — partout où l'on décide si une ligne a encore
// quelque chose à annoncer : le dépliage d'une ligne en événements de
// calendrier, la fiche d'un appareil, l'état du parc. Ces modules-là n'ont
// aucune raison de dépendre du moteur de matching que `generateur.ts`
// importe. Trois lignes de texte, un fichier, aucune dépendance.

/**
 * Préfixe apposé au `libelleObligation` d'une ligne qu'on ne peut pas
 * supprimer — elle porte un rapport ou une date de réalisation — mais dont
 * l'obligation ne s'applique plus (équipement retiré du parc, régime de
 * l'établissement modifié, obligation sortie du référentiel).
 *
 * Le marqueur vit dans le libellé, qui est déjà un instantané texte recopié
 * du référentiel : il apparaît donc partout où la ligne apparaît, sans
 * colonne supplémentaire. Limite assumée en ADR-012 — l'enum Prisma
 * `StatutVerification` n'a pas de valeur `archivee`, si bien que le statut
 * d'une ligne archivée reste **gelé** dans son dernier état connu. C'est
 * précisément pourquoi il faut lire le marqueur : le statut, lui, continue
 * de dire « réalisée » et le cycle continue de proposer un rendez-vous
 * suivant que plus personne n'attend.
 */
export const MARQUEUR_NON_APPLICABLE = "Ne s'applique plus — ";

export function estMarqueeNonApplicable(libelle: string): boolean {
  return libelle.startsWith(MARQUEUR_NON_APPLICABLE);
}

export function marquerNonApplicable(libelle: string): string {
  return estMarqueeNonApplicable(libelle)
    ? libelle
    : `${MARQUEUR_NON_APPLICABLE}${libelle}`;
}

/** Retire le marqueur — utilisé quand une obligation redevient applicable
 *  (l'équipement est réactivé, l'établissement redevient ERP…). */
export function libelleSansMarqueur(libelle: string): string {
  return estMarqueeNonApplicable(libelle)
    ? libelle.slice(MARQUEUR_NON_APPLICABLE.length)
    : libelle;
}
