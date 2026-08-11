// Numérotation des versions de DUERP — utilitaires purs, testables sans
// base de données.
//
// Le numéro d'une version est calculé en lisant le plus grand numéro
// existant puis en ajoutant 1. Deux validations simultanées sur le même
// DUERP lisent donc la même valeur et tentent d'écrire le même numéro.
// L'intégrité est garantie en base par `@@unique([duerpId, numero])` — le
// second écrivain reçoit une violation de contrainte P2002. Ce module
// permet de reconnaître ce conflit précis pour le rejouer, au lieu de
// laisser fuiter une erreur Prisma brute dans l'interface.

/** Nombre de tentatives d'insertion avant d'abandonner et de rendre la
 *  main à l'utilisateur. Deux validations concurrentes se résolvent en une
 *  seule reprise ; trois tentatives couvrent très largement le cas réel
 *  (un dirigeant, éventuellement deux onglets ouverts). */
export const TENTATIVES_NUMEROTATION = 3;

/**
 * L'erreur est-elle une collision sur `@@unique([duerpId, numero])` ?
 *
 * On n'importe pas `Prisma.PrismaClientKnownRequestError` (dépendance au
 * client généré, coûteuse à charger en test) : on reconnaît la forme de
 * l'erreur — code `P2002` et cible contenant `numero`. Toute autre erreur
 * doit remonter telle quelle : la masquer ferait passer une panne réelle
 * pour un conflit de concurrence.
 */
export function estConflitDeNumeroVersion(erreur: unknown): boolean {
  if (typeof erreur !== "object" || erreur === null) return false;
  const e = erreur as { code?: unknown; meta?: { target?: unknown } };
  if (e.code !== "P2002") return false;
  const target = e.meta?.target;
  if (Array.isArray(target)) return target.includes("numero");
  if (typeof target === "string") return target.includes("numero");
  // P2002 sans cible exploitable (selon le connecteur) : on considère le
  // conflit comme rejouable, la seule contrainte unique de la table étant
  // précisément (duerpId, numero).
  return true;
}
