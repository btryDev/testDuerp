import type { StatutAction } from "@prisma/client";
import { LABEL_STATUT_ACTION } from "@/lib/actions/labels";

// Champs du board, mêmes que `BadgeStatut` (vérifications) : une action
// et une vérification affichées côte à côte — elles le sont, dans la
// liste du calendrier — doivent parler la même langue de couleur.
//
// « Ouverte » porte l'ambre (attention, pas urgence), « en cours » le
// glacier (c'est parti), « levée » le vert de l'acquis, « abandonnée »
// l'ardoise du registre calme. Le rose reste au retard, qui s'ajoute en
// pastille séparée plutôt que de remplacer le statut.
const CLASSE: Record<StatutAction, string> = {
  ouverte:
    "bg-[color:var(--board-amber)] text-[color:var(--board-amber-ink)]",
  en_cours:
    "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]",
  levee: "bg-[color:var(--board-green)] text-[color:var(--board-green-ink)]",
  abandonnee:
    "bg-[color:var(--board-slate-pale)] text-[color:var(--board-slate-mid)]",
};

export function BadgeStatutAction({ statut }: { statut: StatutAction }) {
  return (
    <span className={`pastille-board ${CLASSE[statut]}`}>
      {LABEL_STATUT_ACTION[statut]}
    </span>
  );
}
