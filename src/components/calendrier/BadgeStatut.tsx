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

// Champs saturés du board éditorial, encre de la même famille : rose
// pour le dépassé et l'écart majeur, paille pour ce qui attend, glacier
// pour le programmé, vert pour l'acquis. Jamais de blanc sur le rose.
const CLASSE: Record<StatutVerification, string> = {
  a_planifier:
    "bg-[color:var(--board-amber)] text-[color:var(--board-amber-ink)]",
  planifiee:
    "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]",
  realisee_conforme:
    "bg-[color:var(--board-green)] text-[color:var(--board-green-ink)]",
  realisee_observations:
    "bg-[color:var(--board-amber)] text-[color:var(--board-amber-ink)]",
  realisee_ecart_majeur:
    "bg-[color:var(--board-signal)] text-[color:var(--board-signal-ink)]",
  depassee:
    "bg-[color:var(--board-signal)] text-[color:var(--board-signal-ink)]",
};

export function BadgeStatut({ statut }: Props) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-[13px] py-[6px] text-[12px] font-semibold ${CLASSE[statut]}`}
    >
      {LABEL[statut]}
    </span>
  );
}
