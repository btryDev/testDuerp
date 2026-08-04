import type { StatutVerification } from "@prisma/client";

type Props = { statut: StatutVerification };

const LABEL: Record<StatutVerification, string> = {
  a_planifier: "À planifier",
  planifiee: "Planifiée",
  realisee_conforme: "Conforme",
  realisee_observations: "Observations",
  realisee_ecart_majeur: "Écart majeur",
  depassee: "En retard",
};

const CLASSE: Record<StatutVerification, string> = {
  a_planifier:
    "bg-amber-100 text-amber-900 border-amber-300",
  planifiee:
    "bg-slate-100 text-slate-800 border-slate-300",
  realisee_conforme:
    "bg-emerald-100 text-emerald-900 border-emerald-300",
  realisee_observations:
    "bg-yellow-100 text-yellow-900 border-yellow-300",
  realisee_ecart_majeur:
    "bg-rose-100 text-rose-900 border-rose-300",
  depassee:
    "bg-rose-100 text-rose-900 border-rose-300",
};

export function BadgeStatut({ statut }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] ${CLASSE[statut]}`}
    >
      {LABEL[statut]}
    </span>
  );
}
