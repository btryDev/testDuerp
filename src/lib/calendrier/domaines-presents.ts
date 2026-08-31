import {
  DOMAINES_OBLIGATION,
  type DomaineObligation,
} from "@/lib/referentiels/conformite/types";
import { obligationParId } from "@/lib/referentiels/conformite";

/**
 * Les domaines proposés au filtre du calendrier : ceux qui sont RÉELLEMENT
 * présents dans les échéances du lieu, jamais une liste écrite à la main.
 *
 * Ce filtre a porté trois valeurs en dur — électricité, incendie, aération —
 * les trois domaines du palier P1. Le référentiel en compte dix-sept. Sur un
 * dossier de contrôle, une ligne s'affichait avec le domaine « Santé au
 * travail » et **ne pouvait pas être filtrée** : le domaine était visible sur
 * la ligne, et absent de l'instrument qui la trie.
 *
 * Le patron est celui des pilules de famille, qui ne proposent que les familles
 * présentes — et il en reprend la précaution : la lecture se fait sur les
 * lignes du LIEU, pas sur une liste déjà réduite par le domaine ou l'urgence.
 * Sans cela, choisir un domaine ferait disparaître tous les autres de la liste
 * des choix, et l'on ne pourrait plus en sortir : c'est exactement le sort que
 * la pilule « Opérations » a déjà évité une fois.
 *
 * Vit ici plutôt que dans la page pour être éprouvable : une page serveur ne
 * s'importe pas depuis un test.
 */
export function domainesPresents(
  verifs: readonly { obligationId: string }[],
): DomaineObligation[] {
  const vus = new Set<DomaineObligation>();
  for (const v of verifs) {
    const o = obligationParId(v.obligationId);
    if (o) vus.add(o.domaine);
  }
  // L'ordre du référentiel, pas celui de la première rencontre : deux dossiers
  // comparables doivent présenter leurs filtres dans le même ordre, et un
  // ordre d'apparition rendrait le filtre instable au fil des saisies.
  return DOMAINES_OBLIGATION.filter((d) => vus.has(d));
}

/**
 * Le paramètre d'URL désigne-t-il un domaine du référentiel ?
 *
 * Séparé de `domainesPresents` à dessein : la validation d'une URL et la
 * construction des choix ne répondent pas à la même question. Un lien partagé
 * vers un domaine absent du dossier doit être rejeté proprement, pas traité
 * comme un domaine inconnu.
 */
export function estDomaineConnu(v: string | undefined): v is DomaineObligation {
  return (
    v !== undefined && (DOMAINES_OBLIGATION as readonly string[]).includes(v)
  );
}
