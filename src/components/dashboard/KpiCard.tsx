// KPI — carte métrique compacte. Tone colore la valeur :
//  - default : ink
//  - ok : vert accent-vif
//  - warn : ambre
//  - alerte : minium (rouge)

import type { ReactNode } from "react";

type KpiTone = "default" | "ok" | "warn" | "alerte";

export function KpiCard({
  label,
  value,
  trend,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  trend?: {
    dir: "up" | "down" | "flat";
    label: string;
  };
  tone?: KpiTone;
}) {
  return (
    <div className="rounded-xl border border-rule-soft bg-paper-elevated px-5 py-4">
      <div className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div
        className={
          "mt-2.5 text-[1.85rem] font-semibold leading-none tracking-[-0.03em] tabular-nums " +
          toneClass(tone)
        }
      >
        {value}
      </div>
      {trend ? (
        <div className={"mt-2 text-[0.74rem] " + trendClass(trend.dir)}>
          {trend.label}
        </div>
      ) : null}
    </div>
  );
}

function toneClass(tone: KpiTone) {
  switch (tone) {
    case "ok":
      return "text-[color:var(--accent-vif)]";
    case "warn":
      return "text-[color:var(--warn-ink)]";
    case "alerte":
      return "text-[color:var(--minium)]";
    default:
      return "text-ink";
  }
}

function trendClass(dir: "up" | "down" | "flat") {
  if (dir === "up") return "text-[color:var(--accent-vif)]";
  if (dir === "down") return "text-[color:var(--minium)]";
  return "text-muted-foreground";
}
