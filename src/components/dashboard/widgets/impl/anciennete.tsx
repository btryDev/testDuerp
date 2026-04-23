"use client";

// Widget « Âge des documents ».
// 3 lignes : DUERP · Dernier rapport · Dernière formation/exercice.
// Mesure d'ancienneté utile pour anticiper un contrôle.

import { BentoCell } from "@/components/dashboard/BentoCell";
import type { DashboardBundle } from "../types";

function joursDepuis(d: Date | null): number | null {
  if (!d) return null;
  return Math.max(
    0,
    Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)),
  );
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
  const { duerpDernier, rapportsRecents, dashboard } = bundle;
  const duerpAge = dashboard.duerp.ageJours;
  const duerpLast = dashboard.duerp.derniereVersionAu;
  const rapport = rapportsRecents[0] ?? null;
  const rapportAge = joursDepuis(rapport?.dateRapport ?? null);

  return (
    <BentoCell kicker="Âge des documents">
      <ul className="flex flex-col gap-3">
        <LigneAge
          label="DUERP"
          sousLibelle={
            duerpLast
              ? `v${duerpDernier?.versions[0]?.numero ?? 1} — ${duerpLast.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}`
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
      <p className="mt-auto font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
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
      ? "text-[color:var(--minium)]"
      : tone === "warn"
        ? "text-[color:oklch(0.48_0.14_60)]"
        : tone === "ok"
          ? "text-[color:var(--accent-vif)]"
          : "text-muted-foreground";
  return (
    <li className="grid grid-cols-[1fr_auto] items-baseline gap-4">
      <div className="min-w-0">
        <p className="text-[0.9rem] font-medium">{label}</p>
        <p className="mt-0.5 truncate text-[0.74rem] text-muted-foreground">
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
