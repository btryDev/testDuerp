import { cn } from "@/lib/utils";
import { StatusPill, type StatusKind } from "./StatusPill";

export type TimelineItem = {
  id: string;
  date: Date | string;
  titre: string;
  statut: StatusKind;
  description?: string;
  referenceLegale?: string;
};

/**
 * Frise verticale des échéances d'une obligation / d'un équipement.
 * Pensée pour : « quand ai-je fait ma dernière vérif électrique, quand
 * est la prochaine ? ». Affichée sur la page détail d'un équipement
 * ou d'une vérification.
 */
export function ComplianceTimeline({
  items,
  emptyMessage = "Aucun jalon enregistré pour l'instant.",
  className,
}: {
  items: TimelineItem[];
  emptyMessage?: string;
  className?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[color:var(--rule)] p-6 text-center text-[0.85rem] text-[color:var(--muted-foreground)]">
        {emptyMessage}
      </div>
    );
  }

  const ordered = [...items].sort((a, b) => {
    const da = typeof a.date === "string" ? new Date(a.date) : a.date;
    const db = typeof b.date === "string" ? new Date(b.date) : b.date;
    return da.getTime() - db.getTime();
  });

  return (
    <ol className={cn("relative flex flex-col gap-5", className)}>
      <span
        aria-hidden
        className="filet-vertical absolute top-2 bottom-2 left-[11px]"
      />
      {ordered.map((item) => {
        const d = typeof item.date === "string" ? new Date(item.date) : item.date;
        return (
          <li
            key={item.id}
            className="relative flex gap-4 pl-8"
          >
            <span
              aria-hidden
              className={cn(
                "absolute top-1 left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-[color:var(--paper)] font-mono text-[0.6rem]",
                item.statut === "a_jour" &&
                  "border-[color:var(--accent-vif)] text-[color:var(--accent-vif)]",
                item.statut === "a_planifier" &&
                  "border-[color:var(--warm)] text-[color:var(--warm)]",
                item.statut === "en_retard" && "border-amber-500 text-amber-700",
                item.statut === "non_conforme" &&
                  "border-[color:var(--minium)] text-[color:var(--minium)]",
                item.statut === "non_applicable" &&
                  "border-[color:var(--rule)] text-[color:var(--seal)]",
              )}
            >
              ◆
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--seal)]">
                  {d.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <StatusPill status={item.statut} size="sm" />
              </div>
              <div className="mt-1 text-[0.95rem] font-medium text-[color:var(--ink)]">
                {item.titre}
              </div>
              {item.description && (
                <p className="mt-1 text-[0.82rem] leading-relaxed text-[color:var(--muted-foreground)]">
                  {item.description}
                </p>
              )}
              {item.referenceLegale && (
                <div className="mt-1.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-[color:var(--seal)]">
                  § {item.referenceLegale}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
