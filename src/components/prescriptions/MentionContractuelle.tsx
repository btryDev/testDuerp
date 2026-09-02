import {
  MARQUAGE_CONTRACTUEL,
  PASTILLE_CONTRACTUELLE,
} from "@/lib/prescriptions/sources";

/**
 * Le marquage d'une ligne née d'un engagement contractuel — ADR-032.
 *
 * Un composant partagé, et pas un bout de chaîne recopié dans chaque écran :
 * le marquage n'est pas optionnel, et la seule façon de tenir cette promesse
 * est qu'il n'existe qu'en un exemplaire. Huit surfaces l'affichent ; huit
 * formulations approchantes auraient fini par en laisser une de côté.
 *
 * **Ambre, pas rouge** (`docs/charte-board.md` § 1.5) : le rouge dit le
 * retard, et une échéance d'assurance n'est ni en retard ni fautive. L'ambre
 * dit l'attention — ce que la ligne engage n'est pas ce que le reste du
 * calendrier engage.
 *
 * **Mais pas l'ambre PLEIN.** Cet argument-là tient toujours ; ce qui ne
 * tenait pas, c'est la peinture. Le couple champ/encre `--board-amber` /
 * `--board-amber-ink` est celui de l'état « proche » (`CHAMP_ETAT` /
 * `ENCRE_ETAT`), donc celui de la pastille « Échéance aujourd'hui ». Sur la
 * fiche d'une vérification, les deux se posaient côte à côte avec le même
 * fond et la même encre : seule la casse les séparait. Le seul signal qui
 * dise « ceci n'est pas du droit » portait la peinture d'un signal
 * d'urgence — et un marquage qu'on lit comme une urgence n'est plus un
 * marquage.
 *
 * D'où le champ en **voile** (`--board-amber-wash`) cerné d'un filet ambre,
 * plutôt qu'en champ plein. La famille ne change pas — c'est toujours
 * l'ambre, toujours l'attention —, le registre change : les états du
 * calendrier sont pleins, cette annotation est cernée. Un état se remplit,
 * une note se souligne. Le couple champ/encre reste complet, comme la
 * charte l'exige : voile ambre, encre ambre (contraste ~8:1).
 *
 * Le texte court est visible, le texte complet est dans le `title` **et**
 * dans un `sr-only` : un survol n'est pas une lecture, et l'information qui
 * distingue un engagement d'assurance du droit ne peut pas dépendre d'une
 * souris.
 */
export function MentionContractuelle({ className = "" }: { className?: string }) {
  return (
    <span
      className={
        "inline-flex flex-none items-center rounded-full bg-[color:var(--board-amber-wash)] px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.06em] text-[color:var(--board-amber-ink)] ring-1 ring-inset ring-[color:color-mix(in_oklch,var(--board-amber-ink)_40%,transparent)] " +
        className
      }
      title={MARQUAGE_CONTRACTUEL}
    >
      <span aria-hidden>{PASTILLE_CONTRACTUELLE}</span>
      <span className="sr-only">{MARQUAGE_CONTRACTUEL}</span>
    </span>
  );
}
