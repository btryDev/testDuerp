"use client";

// Widget « Météo du mois ».
// Heatmap 30 jours glissants. Chaque cellule = un jour, couleur selon
// la pire urgence du jour (retard > à planifier > OK > rien).

import { BentoCell } from "@/components/dashboard/BentoCell";
import type { DashboardBundle } from "../types";

export function WidgetMeteo({ bundle }: { bundle: DashboardBundle }) {
  const { evenementsMois = [] } = bundle;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const jours = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Pour chaque jour : tone dominant.
  type Tone = "alerte" | "warn" | "ok";
  const tonePriorite: Record<Tone, number> = { alerte: 3, warn: 2, ok: 1 };
  const toneParJour = new Map<string, Tone>();
  for (const e of evenementsMois) {
    const key = e.date.toISOString().slice(0, 10);
    const actuel = toneParJour.get(key);
    const etone = e.tone as Tone;
    if (!actuel || tonePriorite[etone] > tonePriorite[actuel]) {
      toneParJour.set(key, etone);
    }
  }

  const compte = {
    alerte: evenementsMois.filter((e) => e.tone === "alerte").length,
    warn: evenementsMois.filter((e) => e.tone === "warn").length,
    ok: evenementsMois.filter((e) => e.tone === "ok").length,
  };

  return (
    <BentoCell
      kicker="Météo · 30 jours"
      sub={
        evenementsMois.length === 0
          ? "Aucune tâche"
          : `${evenementsMois.length} sur la période`
      }
    >
      <div className="grid grid-cols-10 gap-1.5">
        {jours.map((d, idx) => {
          const key = d.toISOString().slice(0, 10);
          const tone = toneParJour.get(key);
          const bg = tone
            ? tone === "alerte"
              ? "var(--minium)"
              : tone === "warn"
                ? "oklch(0.72 0.15 70)"
                : "var(--accent-vif)"
            : "var(--rule-soft)";
          const isToday = idx === 0;
          return (
            <div
              key={key}
              title={
                tone
                  ? `${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })} — ${tone === "alerte" ? "retard" : tone === "warn" ? "à planifier" : "planifié"}`
                  : `${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })} — libre`
              }
              className={
                "aspect-square rounded " +
                (isToday
                  ? "outline outline-2 outline-offset-1 outline-[color:var(--ink)]"
                  : "")
              }
              style={{ background: bg, opacity: tone ? 1 : 0.5 }}
            />
          );
        })}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
        <LegendePt color="var(--minium)" label={`${compte.alerte} retard`} />
        <LegendePt
          color="oklch(0.72 0.15 70)"
          label={`${compte.warn} à planifier`}
        />
        <LegendePt color="var(--accent-vif)" label={`${compte.ok} planifié`} />
      </div>
    </BentoCell>
  );
}

function LegendePt({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="inline-block size-2 rounded-sm"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
