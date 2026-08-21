// Les pastilles que les fiches posent elles-mêmes, quand aucun badge de
// module ne dit déjà la chose.
//
// Règle tenue ici : le retard ne remplace jamais le statut, il s'ajoute.
// Une action « ouverte » dont l'échéance est passée est ouverte ET en
// retard ; l'écran qui n'affichait que « en retard » perdait l'info que
// personne ne s'en était encore saisi.

import type { ReactNode } from "react";
import { joursDeRetard } from "@/lib/dates/retard";

const TON = {
  retard:
    "bg-[color:var(--board-signal)] text-[color:var(--board-signal-ink)]",
  proche: "bg-[color:var(--board-amber)] text-[color:var(--board-amber-ink)]",
  fait: "bg-[color:var(--board-green)] text-[color:var(--board-green-ink)]",
  bleu: "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]",
  neutre:
    "bg-[color:var(--board-slate-pale)] text-[color:var(--board-slate-mid)]",
} as const;

export function PastilleFiche({
  ton = "neutre",
  children,
}: {
  ton?: keyof typeof TON;
  children: ReactNode;
}) {
  return <span className={`pastille-board ${TON[ton]}`}>{children}</span>;
}

/**
 * « En retard de 13 jours » — le nombre plutôt que le seul mot. Un retard
 * d'un jour et un retard de six mois n'appellent pas le même geste, et
 * l'utilisateur ne devrait pas avoir à soustraire deux dates pour le
 * savoir.
 */
export function PastilleRetard({
  echeance,
  maintenant,
}: {
  echeance: Date;
  maintenant: Date;
}) {
  const jours = joursDeRetard(echeance, maintenant);
  return (
    <PastilleFiche ton="retard">
      {jours <= 1 ? "En retard" : `En retard de ${jours} jours`}
    </PastilleFiche>
  );
}
