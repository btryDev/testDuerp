// Les obligations que le produit a lues et ne porte pas — projetées depuis le
// corpus, jamais redéclarées ici.
//
// Module séparé de `faits.ts` pour une raison de dépendances : `faits.ts`
// importe Prisma, ce calcul-ci n'en a pas besoin, et un test qui vérifie la
// projection ne doit pas avoir à monter une base pour le faire.
//
// Séparé de `couverture.ts` pour la raison inverse : c'est le seul point du
// dossier `perimetre/` qui lit le référentiel au **runtime**, et le
// commentaire de `CATEGORIES_COUVERTES` prévient de ce qu'un
// `referentiels → perimetre → referentiels` coûterait. Le concentrer dans un
// fichier d'une fonction laisse le module central sans aucune arête sortante.

import { articlesNonCouverts } from "@/lib/referentiels/corpus";
import type { FamilleNonPortee } from "./couverture";

/**
 * Tous les articles que le produit a lus et dont il ne porte pas
 * l'obligation — sans exception, et c'est le point.
 *
 * ## Pourquoi aucun filtre sur `declareA`
 *
 * La première version filtrait sur l'absence de `declareA`, au motif qu'un
 * manque déjà annoncé ailleurs n'a pas à l'être deux fois. Elle rendait zéro
 * entrée : au 2026-08-28, les vingt-sept articles `non_couvert` portent tous
 * un `declareA`, dont vingt-cinq disent « Non déclaré à ce jour. » et deux
 * citent un fichier de `docs/`. Un axe qui ne peut jamais se déclencher est
 * une décoration, pas une garantie.
 *
 * Le filtre était surtout faux de raisonnement. `declareA` répond à « où ce
 * manque est-il annoncé à l'utilisateur ? ». Cet écran **est** cette adresse :
 * s'en servir pour décider quoi afficher revient à demander à la liste de
 * cacher ce qu'elle existe pour montrer. Les deux entrées qui citent un
 * fichier de `docs/` ne font pas exception — un document interne n'est pas une
 * annonce à l'exploitant.
 *
 * ## Une liste du produit, pas de l'établissement
 *
 * Rien ici ne dépend du dossier. Restreindre aux chapitres qui visent
 * réellement un établissement donné supposerait de rattacher chaque article à
 * un type d'ERP — le déduire du préfixe de la référence (« PO » → hôtel)
 * serait une heuristique sur du texte libre. La donnée existe pourtant en
 * base (`Etablissement.typeErp`, ADR-004) : c'est au corpus de porter le
 * rattachement, et c'est la suite naturelle de ce socle.
 */
export function famillesNonPortees(): FamilleNonPortee[] {
  return articlesNonCouverts().map((a) => ({
    corpus: a.corpus,
    ref: a.ref,
    motif: a.motif,
  }));
}
