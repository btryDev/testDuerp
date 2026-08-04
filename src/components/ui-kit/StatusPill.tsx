import { cn } from "@/lib/utils";

/**
 * Grammaire unifiée de statut conformité.
 * Jamais la couleur seule : toujours picto + label pour WCAG 2.1 AA.
 */
export type StatusKind =
  | "a_jour"
  | "a_planifier"
  | "en_retard"
  | "non_conforme"
  | "non_applicable";

const ICONE: Record<StatusKind, string> = {
  a_jour: "●",
  a_planifier: "◐",
  en_retard: "◎",
  non_conforme: "■",
  non_applicable: "—",
};

const LABEL: Record<StatusKind, string> = {
  a_jour: "À jour",
  a_planifier: "À planifier",
  en_retard: "En retard",
  non_conforme: "Non conforme",
  non_applicable: "Non applicable",
};

const STYLE: Record<StatusKind, string> = {
  a_jour: "bg-[color:var(--accent-vif-soft)] text-[color:var(--accent-vif)]",
  a_planifier: "bg-[color:var(--warm-soft)] text-[color:var(--warm)]",
  en_retard: "bg-amber-100 text-amber-900",
  non_conforme:
    "bg-[color:color-mix(in_oklch,var(--minium)_14%,transparent)] text-[color:var(--minium)]",
  non_applicable: "bg-[color:var(--paper-sunk)] text-[color:var(--seal)]",
};

export function StatusPill({
  status,
  label,
  size = "md",
  className,
}: {
  status: StatusKind;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full font-mono font-semibold tracking-[0.04em]";
  const sz =
    size === "sm"
      ? "px-2 py-0.5 text-[0.62rem]"
      : "px-2.5 py-1 text-[0.7rem]";
  return (
    <span
      className={cn(base, sz, STYLE[status], className)}
      role="status"
      aria-label={label ?? LABEL[status]}
    >
      <span aria-hidden>{ICONE[status]}</span>
      <span>{label ?? LABEL[status]}</span>
    </span>
  );
}

export const STATUS_LABEL = LABEL;
