"use client";

// Widget « Âge des documents ».
// 2 lignes : DUERP · Dernier rapport.
// Mesure d'ancienneté utile pour anticiper un contrôle.

import { BentoCell } from "@/components/dashboard/BentoCell";
import { formaterDateCourteFr, joursCivilsEntre } from "@/lib/dates";
import type { DashboardBundle } from "../types";

/** Ancienneté en **jours civils** de Paris : la division de l'écart en
 *  millisecondes par 86 400 000 perdait un jour dès qu'un changement
 *  d'heure était traversé, et sous-estimait donc l'âge affiché. */
function joursDepuis(reference: Date, d: Date | null): number | null {
  if (!d) return null;
  return Math.max(0, joursCivilsEntre(d, reference));
}

function toneFromAge(
  jours: number | null,
  limiteOk: number,
  limiteWarn: number,
): "alerte" | "warn" | "ok" | "default" {
  if (jours === null) return "default";
  if (jours <= limiteOk) return "ok";
  if (jours <= limiteWarn) return "warn";
  return "alerte";
}

export function WidgetAnciennete({ bundle }: { bundle: DashboardBundle }) {
  const { duerpDernier, rapportsRecents, dashboard, aujourdhui } = bundle;
  const duerpAge = dashboard.duerp.ageJours;
  const duerpLast = dashboard.duerp.derniereVersionAu;
  const rapport = rapportsRecents[0] ?? null;
  const rapportAge = joursDepuis(aujourdhui, rapport?.dateRapport ?? null);

  return (
    <BentoCell kicker="Âge des documents">
      <ul className="flex flex-col gap-3">
        <LigneAge
          label="DUERP"
          sousLibelle={
            duerpLast
              ? `v${duerpDernier?.versions[0]?.numero ?? 1} — ${formaterDateCourteFr(duerpLast)}`
              : "non initié"
          }
          age={duerpAge}
          seuilOk={180}
          seuilWarn={330}
        />
        <LigneAge
          label="Dernier rapport"
          sousLibelle={
            rapport
              ? rapport.verification.libelleObligation.slice(0, 40) +
                (rapport.verification.libelleObligation.length > 40
                  ? "…"
                  : "")
              : "aucun"
          }
          age={rapportAge}
          seuilOk={60}
          seuilWarn={180}
        />
      </ul>
      <p className="mt-auto font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--board-slate-mid)]">
        Un document de plus d&apos;un an perd sa valeur d&apos;audit.
      </p>
    </BentoCell>
  );
}

function LigneAge({
  label,
  sousLibelle,
  age,
  seuilOk,
  seuilWarn,
}: {
  label: string;
  sousLibelle: string;
  age: number | null;
  seuilOk: number;
  seuilWarn: number;
}) {
  const tone = toneFromAge(age, seuilOk, seuilWarn);
  const toneClass =
    tone === "alerte"
      ? "text-[color:var(--board-signal-ink)]"
      : tone === "warn"
        ? "text-[color:var(--board-amber-ink)]"
        : tone === "ok"
          ? "text-[color:var(--board-green-ink)]"
          : "text-[color:var(--board-slate-mid)]";
  return (
    <li className="grid grid-cols-[1fr_auto] items-baseline gap-4">
      <div className="min-w-0">
        <p className="text-[0.9rem] font-medium">{label}</p>
        <p className="mt-0.5 truncate text-[12px] text-[color:var(--board-slate-mid)]">
          {sousLibelle}
        </p>
      </div>
      <div className={"text-right font-semibold tabular-nums " + toneClass}>
        <span className="text-[1.35rem] leading-none">
          {age === null ? "—" : `J+${age}`}
        </span>
      </div>
    </li>
  );
}
