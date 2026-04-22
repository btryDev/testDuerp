"use client";

// Widget « Obligations de l'année » — 2 variants :
//  - bars   : grille 12 mois (BarsObligations existant)
//  - radial : donut agrégé par statut (couvert / à venir / retard)

import { BentoCell } from "@/components/dashboard/BentoCell";
import {
  BarsObligations,
  LegendeBarsObligations,
} from "@/components/dashboard/BarsObligations";
import type { DashboardBundle } from "../types";

export function WidgetBarsObligations({
  bundle,
  variant,
}: {
  bundle: DashboardBundle;
  variant: string;
}) {
  const { barsData, moisCourant } = bundle;
  const vide = barsData.every(
    (b) => b.couvert + b.aVenir + b.retard === 0,
  );

  if (variant === "radial") {
    const totaux = barsData.reduce(
      (acc, b) => ({
        couvert: acc.couvert + b.couvert,
        aVenir: acc.aVenir + b.aVenir,
        retard: acc.retard + b.retard,
      }),
      { couvert: 0, aVenir: 0, retard: 0 },
    );
    return (
      <BentoCell
        kicker={`Obligations ${new Date().getFullYear()}`}
        sub="Répartition par statut"
      >
        {vide ? <EmptyBars /> : <DonutStatuts totaux={totaux} />}
      </BentoCell>
    );
  }

  // Variant "bars" (défaut)
  return (
    <BentoCell
      kicker={`Obligations ${new Date().getFullYear()}`}
      legend={<LegendeBarsObligations />}
    >
      {vide ? (
        <EmptyBars />
      ) : (
        <BarsObligations data={barsData} moisCourant={moisCourant} />
      )}
    </BentoCell>
  );
}

function EmptyBars() {
  return (
    <div className="flex h-[160px] items-center justify-center rounded-md border border-dashed border-rule-soft bg-paper-sunk/40 p-6 text-center text-[0.86rem] text-muted-foreground">
      Le calendrier se remplit dès que vous déclarez vos équipements.
    </div>
  );
}

function DonutStatuts({
  totaux,
}: {
  totaux: { couvert: number; aVenir: number; retard: number };
}) {
  const total = totaux.couvert + totaux.aVenir + totaux.retard;
  const circ = 2 * Math.PI * 48;
  const pct = (n: number) => (total === 0 ? 0 : n / total);
  const offRetard = 0;
  const offAVenir = pct(totaux.retard) * circ;
  const offCouvert = (pct(totaux.retard) + pct(totaux.aVenir)) * circ;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r="48"
            fill="none"
            stroke="var(--rule-soft)"
            strokeWidth="14"
          />
          {totaux.retard > 0 ? (
            <circle
              cx="70"
              cy="70"
              r="48"
              fill="none"
              stroke="var(--minium)"
              strokeWidth="14"
              strokeDasharray={`${pct(totaux.retard) * circ} ${circ}`}
              strokeDashoffset={-offRetard}
            />
          ) : null}
          {totaux.aVenir > 0 ? (
            <circle
              cx="70"
              cy="70"
              r="48"
              fill="none"
              stroke="var(--accent-vif)"
              strokeWidth="14"
              strokeDasharray={`${pct(totaux.aVenir) * circ} ${circ}`}
              strokeDashoffset={-offAVenir}
            />
          ) : null}
          {totaux.couvert > 0 ? (
            <circle
              cx="70"
              cy="70"
              r="48"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="14"
              strokeDasharray={`${pct(totaux.couvert) * circ} ${circ}`}
              strokeDashoffset={-offCouvert}
            />
          ) : null}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[1.8rem] font-semibold leading-none tabular-nums">
            {total}
          </span>
          <span className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
            Au total
          </span>
        </div>
      </div>
      <ul className="flex flex-1 flex-col gap-2 text-[0.88rem]">
        <Item
          color="var(--ink)"
          label="Couvertes"
          value={totaux.couvert}
          total={total}
        />
        <Item
          color="var(--accent-vif)"
          label="À venir"
          value={totaux.aVenir}
          total={total}
        />
        <Item
          color="var(--minium)"
          label="En retard"
          value={totaux.retard}
          total={total}
        />
      </ul>
    </div>
  );
}

function Item({
  color,
  label,
  value,
  total,
}: {
  color: string;
  label: string;
  value: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <li className="flex items-center gap-3">
      <span
        aria-hidden
        className="inline-block size-2 rounded-full"
        style={{ background: color }}
      />
      <span className="flex-1 text-ink">{label}</span>
      <span className="font-mono text-[0.82rem] tabular-nums">
        {value}
        <span className="ml-1 text-muted-foreground">({pct}%)</span>
      </span>
    </li>
  );
}
