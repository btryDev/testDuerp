// Carte métrique compacte du tableau de bord. `tone` colore la VALEUR, et les
// quatre tons reprennent le vocabulaire d'état du produit — l'encre neutre, le
// vert « fait », l'ambre « proche », le rose « en retard ». Ils viennent de
// `ENCRE_ETAT`, source unique, et non d'une cinquième table locale.
//
// La TENDANCE, elle, ne porte plus de couleur, et c'est un changement de sens
// assumé. Elle peignait « up » en vert et « down » en rouge, ce qui suppose
// qu'une hausse est toujours bonne — or ces cartes comptent aussi bien des
// vérifications faites que des échéances en retard, où c'est l'inverse. Une
// couleur qui juge sans savoir de quoi elle parle vaut moins que pas de
// couleur : la flèche et le libellé disent la direction, le lecteur juge.

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
    <div className="rounded-[18px] bg-[color:var(--board-slate-pale)] px-5 py-4">
      <div className="board-eyebrow text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
        {label}
      </div>
      <div
        className={
          "mt-2.5 text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums " +
          toneClass(tone)
        }
      >
        {value}
      </div>
      {trend ? (
        <div className="mt-2 text-[12px] text-[color:var(--board-slate-mid)]">
          {trend.label}
        </div>
      ) : null}
    </div>
  );
}

const ENCRE_DU_TON: Record<KpiTone, string> = {
  default: "text-[color:var(--board-ink)]",
  ok: "text-[color:var(--board-green-ink)]",
  warn: "text-[color:var(--board-amber-ink)]",
  alerte: "text-[color:var(--board-signal-ink)]",
};

function toneClass(tone: KpiTone) {
  return ENCRE_DU_TON[tone];
}
