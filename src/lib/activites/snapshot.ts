import type {
  ActiviteCouvertureSnapshot,
  CouvertureSnapshot,
} from "@/lib/versions/snapshot";
import type { QuestionActivite } from "./reponses";

/**
 * Lecture d'un snapshot de version côté document (ADR-020).
 *
 * Tout passe par ces trois fonctions, et elles prennent toutes un
 * `CouvertureSnapshot | undefined` : c'est le seul endroit où l'absence du
 * champ est interprétée, et elle l'est toujours de la même façon — une version
 * validée avant l'introduction de la couverture ne dit rien du périmètre, donc
 * le document régénéré ne dit rien non plus. Aucune mention, aucune réserve,
 * aucun « champ non renseigné » : le document doit rester exactement celui
 * qu'il était le jour de sa validation, pendant quarante ans.
 */

/** Ce que le dirigeant a déclaré exercer et que le référentiel ne couvrait pas. */
export function activitesDeclareesSnapshot(
  couverture: CouvertureSnapshot | undefined,
): ActiviteCouvertureSnapshot[] {
  if (!couverture) return [];
  return couverture.activites.filter((a) => a.exercee === true);
}

/**
 * Les questions posées et restées sans réponse. Elles se disent aussi : une
 * question sans réponse est un fait, et le document préfère l'énoncer plutôt
 * que de laisser croire que tout a été tranché.
 */
export function activitesSansReponseSnapshot(
  couverture: CouvertureSnapshot | undefined,
): ActiviteCouvertureSnapshot[] {
  if (!couverture) return [];
  return couverture.activites.filter((a) => a.exercee === null);
}

/**
 * Convertit les questions de l'écran en lignes de snapshot. Le référentiel est
 * lu ici, une fois, au moment de figer — après quoi le document ne dépend plus
 * de lui. `undefined` (pas de réponse) devient `null` : JSON ne conserve pas
 * les propriétés indéfinies, et une clé disparue serait indistinguable d'une
 * question qui n'aurait jamais été posée.
 */
export function figerCouverture(
  referentielSecteurId: string | null,
  questions: readonly QuestionActivite[],
): CouvertureSnapshot {
  return {
    referentielSecteurId,
    activites: questions.map((q) => ({
      id: q.activite.id,
      libelle: q.activite.libelle,
      cequiManque: q.activite.cequiManque,
      exercee: q.exercee === undefined ? null : q.exercee,
    })),
  };
}
