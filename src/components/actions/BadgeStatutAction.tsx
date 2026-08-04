import type { StatutAction } from "@prisma/client";
import { LABEL_STATUT_ACTION } from "@/lib/actions/labels";

const CLASSE: Record<StatutAction, string> = {
  ouverte: "bg-amber-100 text-amber-900 border-amber-300",
  en_cours: "bg-blue-100 text-blue-900 border-blue-300",
  levee: "bg-emerald-100 text-emerald-900 border-emerald-300",
  abandonnee: "bg-slate-100 text-slate-700 border-slate-300",
};

export function BadgeStatutAction({ statut }: { statut: StatutAction }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] ${CLASSE[statut]}`}
    >
      {LABEL_STATUT_ACTION[statut]}
    </span>
  );
}
