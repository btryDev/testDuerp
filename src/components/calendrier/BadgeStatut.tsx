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
// pour le dépassé et l'écart majeur, glacier pour le programmé, vert pour
// l'acquis. Jamais de blanc sur le rose.
//
// « À planifier » porte l'ardoise, pas la paille : ce n'est pas une
// urgence, c'est l'absence de rendez-vous — un état calme. L'ambre est
// réservé aux signaux d'attention (échéance sous 30 jours, réalisation
// avec observations) ; le même statut arborait deux couleurs selon
// l'endroit de l'écran, et la légende de la règle annuelle disait une
// troisième chose du même jaune.
const CLASSE: Record<StatutVerification, string> = {
  a_planifier:
    "bg-[color:var(--board-slate-pale)] text-[color:var(--board-slate-mid)]",
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
