"use client";

// Widgets thématiques qui regroupent plusieurs compteurs liés dans une
// même cellule bento — plus lisible qu'une file de petits KPIs isolés.
// Les widgets unitaires (kpi-en-retard, kpi-sous-30j, etc.) restent
// disponibles dans le registre pour les power users qui préfèrent
// composer eux-mêmes.

import { BentoCell } from "@/components/dashboard/BentoCell";
import type { DashboardBundle } from "../types";

type Tone = "alerte" | "warn" | "ok" | "default";

function toneClass(t: Tone) {
  switch (t) {
    case "alerte":
      return "text-[color:var(--minium)]";
    case "warn":
      return "text-[color:oklch(0.48_0.14_60)]";
    case "ok":
      return "text-[color:var(--accent-vif)]";
    default:
      return "text-ink";
  }
}

function MiniStat({
  label,
  valeur,
  tone = "default",
  sub,
}: {
  label: string;
  valeur: number | string;
  tone?: Tone;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p
        className={
          "text-[1.9rem] font-semibold leading-none tabular-nums tracking-[-0.03em] " +
          toneClass(tone)
        }
      >
        {valeur}
      </p>
      {sub ? (
        <p className="text-[0.72rem] text-muted-foreground">{sub}</p>
      ) : null}
    </div>
  );
}

/* ─── Widget « Échéances » ──────────────────────────────── */

export function WidgetEcheances({ bundle }: { bundle: DashboardBundle }) {
  const { verifsEnRetard, verifsAPlanifier, verifsSous30j } =
    bundle.dashboard.compteurs;

  return (
    <BentoCell
      kicker="Échéances"
      sub={
        verifsEnRetard + verifsAPlanifier + verifsSous30j === 0
          ? "Rien à traiter"
          : undefined
      }
    >
      <div className="grid grid-cols-3 gap-4 pt-1">
        <MiniStat
          label="En retard"
          valeur={verifsEnRetard}
          tone={verifsEnRetard > 0 ? "alerte" : "default"}
        />
        <MiniStat
          label="À planifier"
          valeur={verifsAPlanifier}
          tone={verifsAPlanifier > 0 ? "warn" : "default"}
        />
        <MiniStat
          label="Sous 30 j"
          valeur={verifsSous30j}
          tone={verifsSous30j > 0 ? "warn" : "default"}
        />
      </div>
    </BentoCell>
  );
}

/* ─── Widget « Activité » ───────────────────────────────── */

export function WidgetActivite({ bundle }: { bundle: DashboardBundle }) {
  const {
    actionsOuvertes,
    actionsEnCours,
    actionsEnRetard,
    verifsRealisees12m,
  } = bundle.dashboard.compteurs;
  const totalActions = actionsOuvertes + actionsEnCours;
  const jourDernier = bundle.jourDernierRapport;

  return (
    <BentoCell kicker="Activité">
      <div className="grid grid-cols-3 gap-4 pt-1">
        <MiniStat
          label="Actions en cours"
          valeur={totalActions}
          tone={actionsEnRetard > 0 ? "warn" : "default"}
          sub={
            actionsEnRetard > 0
              ? `${actionsEnRetard} en retard`
              : totalActions > 0
                ? "à lever"
                : "aucune"
          }
        />
        <MiniStat
          label="Rapports 12 m"
          valeur={verifsRealisees12m}
          tone="ok"
        />
        <MiniStat
          label="Dernier rapport"
          valeur={jourDernier === null ? "—" : `J-${jourDernier}`}
          tone={
            jourDernier !== null && jourDernier < 30 ? "ok" : "default"
          }
        />
      </div>
    </BentoCell>
  );
}
