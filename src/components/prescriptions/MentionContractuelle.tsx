import {
  MARQUAGE_CONTRACTUEL,
  PASTILLE_CONTRACTUELLE,
} from "@/lib/prescriptions/sources";

/**
 * Le marquage d'une ligne née d'un engagement contractuel — ADR-032.
 *
 * Un composant partagé, et pas un bout de chaîne recopié dans chaque écran :
 * le marquage n'est pas optionnel, et la seule façon de tenir cette promesse
 * est qu'il n'existe qu'en un exemplaire. Six surfaces l'affichent ; six
 * formulations approchantes auraient fini par en laisser une de côté.
 *
 * **Ambre, pas rouge** (`docs/charte-board.md` § 1.5) : le rouge dit le
 * retard, et une échéance d'assurance n'est ni en retard ni fautive. L'ambre
 * dit l'attention — ce que la ligne engage n'est pas ce que le reste du
 * calendrier engage. Champ et encre ensemble, jamais l'un sans l'autre.
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
        "inline-flex flex-none items-center rounded-full bg-[color:var(--board-amber)] px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.06em] text-[color:var(--board-amber-ink)] " +
        className
      }
      title={MARQUAGE_CONTRACTUEL}
    >
      <span aria-hidden>{PASTILLE_CONTRACTUELLE}</span>
      <span className="sr-only">{MARQUAGE_CONTRACTUEL}</span>
    </span>
  );
}
