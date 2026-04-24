"use client";

// Widget « Semaine ».
// Mini-agenda 7 jours : jour courant + 6 suivants, groupés par jour,
// avec les vérifications planifiées dans cette fenêtre.

import Link from "next/link";
import { BentoCell } from "@/components/dashboard/BentoCell";
import type { DashboardBundle } from "../types";

const JOURS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function WidgetSemaine({ bundle }: { bundle: DashboardBundle }) {
  const { evenementsSemaine = [], etablissementId } = bundle;

  // Fenêtre 7 jours à partir d'aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const jours = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  const eventsParJour = new Map<
    string,
    {
      id: string;
      libelle: string;
      tone: "alerte" | "warn" | "ok";
      equipement: string;
    }[]
  >();
  for (const e of evenementsSemaine) {
    const key = e.date.toISOString().slice(0, 10);
    const arr = eventsParJour.get(key) ?? [];
    arr.push({
      id: e.id,
      libelle: e.libelle,
      tone: e.tone,
      equipement: e.equipement,
    });
    eventsParJour.set(key, arr);
  }

  const total = evenementsSemaine.length;

  return (
    <BentoCell
      kicker="Semaine"
      sub={
        total === 0
          ? "Rien de prévu"
          : `${total} ${total > 1 ? "interventions" : "intervention"}`
      }
    >
      <ol className="grid grid-cols-7 gap-1.5">
        {jours.map((d, idx) => {
          const key = d.toISOString().slice(0, 10);
          const events = eventsParJour.get(key) ?? [];
          const isToday = idx === 0;
          return (
            <li
              key={key}
              className={
                "flex min-h-[96px] flex-col rounded-lg p-2 " +
                (isToday
                  ? "bg-[color:var(--accent-vif-soft)]"
                  : "bg-paper-sunk")
              }
            >
              <div
                className={
                  "font-mono text-[0.6rem] uppercase tracking-[0.14em] " +
                  (isToday
                    ? "text-[color:var(--accent-vif)]"
                    : "text-muted-foreground")
                }
              >
                {JOURS[d.getDay()]}
              </div>
              <div
                className={
                  "mt-0.5 text-[0.92rem] font-semibold tabular-nums " +
                  (isToday ? "text-[color:var(--accent-vif)]" : "text-ink")
                }
              >
                {d.getDate()}
              </div>
              <ul className="mt-1.5 flex flex-col gap-0.5">
                {events.slice(0, 3).map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/etablissements/${etablissementId}/verifications/${e.id}`}
                      title={`${e.libelle} — ${e.equipement}`}
                      className={
                        "block truncate rounded-sm px-1 text-[0.62rem] font-medium leading-tight transition-opacity hover:opacity-80 " +
                        (e.tone === "alerte"
                          ? "bg-[color:color-mix(in_oklch,var(--minium)_15%,transparent)] text-[color:var(--minium)]"
                          : e.tone === "warn"
                            ? "bg-[oklch(0.95_0.04_75)] text-[oklch(0.48_0.14_60)]"
                            : "bg-paper-elevated text-ink")
                      }
                    >
                      {e.libelle}
                    </Link>
                  </li>
                ))}
                {events.length > 3 ? (
                  <li>
                    <Link
                      href={`/etablissements/${etablissementId}/calendrier`}
                      className="block text-[0.6rem] text-muted-foreground hover:text-ink hover:underline"
                    >
                      +{events.length - 3}
                    </Link>
                  </li>
                ) : null}
              </ul>
            </li>
          );
        })}
      </ol>
    </BentoCell>
  );
}
