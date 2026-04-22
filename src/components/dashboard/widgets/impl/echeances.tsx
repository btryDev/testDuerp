"use client";

// Widget « Prochaines échéances » — 2 variants :
//  - list     : liste verticale (classique)
//  - timeline : axe horizontal avec dots marqués aux dates

import { BentoCell } from "@/components/dashboard/BentoCell";
import type { DashboardBundle } from "../types";

function formatDateCourte(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function classifier(
  statut: string,
  datePrevue: Date,
): { tone: "alerte" | "warn" | "ok"; libelleDate: string } {
  const now = new Date();
  if (statut === "depassee" || (statut === "planifiee" && datePrevue < now)) {
    return { tone: "alerte", libelleDate: formatDateCourte(datePrevue) };
  }
  if (statut === "a_planifier") {
    return { tone: "warn", libelleDate: "À planifier" };
  }
  return { tone: "ok", libelleDate: formatDateCourte(datePrevue) };
}

export function WidgetProchainesEcheances({
  bundle,
  variant,
}: {
  bundle: DashboardBundle;
  variant: string;
}) {
  const { prochainesVerifs, etablissementId } = bundle;

  if (prochainesVerifs.length === 0) {
    return (
      <BentoCell kicker="Prochaines échéances">
        <p className="text-[0.88rem] text-muted-foreground">
          Aucune vérification planifiée pour l&apos;instant.
        </p>
      </BentoCell>
    );
  }

  if (variant === "timeline") {
    return (
      <BentoCell
        kicker="Prochaines échéances"
        more={{
          href: `/etablissements/${etablissementId}/calendrier`,
          label: "Tout voir",
        }}
      >
        <TimelineEcheances verifs={prochainesVerifs} />
      </BentoCell>
    );
  }

  // Variant "list" (défaut)
  return (
    <BentoCell
      kicker="Prochaines échéances"
      more={{
        href: `/etablissements/${etablissementId}/calendrier`,
        label: "Tout voir",
      }}
    >
      <ul className="flex flex-col">
        {prochainesVerifs.map((v) => {
          const c = classifier(v.statut, v.datePrevue);
          const dotColor =
            c.tone === "alerte"
              ? "var(--minium)"
              : c.tone === "warn"
                ? "oklch(0.72 0.15 70)"
                : "var(--accent-vif)";
          const dateClass =
            c.tone === "alerte"
              ? "text-[color:var(--minium)]"
              : c.tone === "warn"
                ? "text-[color:oklch(0.48_0.14_60)]"
                : "text-muted-foreground";
          return (
            <li
              key={v.id}
              className="grid grid-cols-[10px_1fr_auto] items-center gap-3 border-b border-dashed border-rule-soft py-3 last:border-b-0"
            >
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ background: dotColor }}
              />
              <div className="min-w-0">
                <p className="truncate text-[0.9rem] font-medium">
                  {v.libelleObligation}
                </p>
                <p className="truncate text-[0.74rem] text-muted-foreground">
                  {v.equipement.libelle}
                </p>
              </div>
              <span className={"font-mono text-[0.78rem] " + dateClass}>
                {c.libelleDate}
              </span>
            </li>
          );
        })}
      </ul>
    </BentoCell>
  );
}

function TimelineEcheances({
  verifs,
}: {
  verifs: DashboardBundle["prochainesVerifs"];
}) {
  // Axe temporel : de aujourd'hui à la dernière date prévue (au moins
  // 30 jours d'horizon pour ne pas écraser si toutes proches).
  const now = new Date();
  const toJour = now.getTime();
  const maxFutur = Math.max(
    ...verifs.map((v) => v.datePrevue.getTime()),
    toJour + 30 * 86_400_000,
  );
  const minPasse = Math.min(
    ...verifs.map((v) => v.datePrevue.getTime()),
    toJour,
  );
  const span = Math.max(1, maxFutur - minPasse);

  return (
    <div className="flex flex-col gap-5 pt-2">
      {/* Axe avec ticks d'aujourd'hui */}
      <div className="relative h-16 w-full">
        {/* Ligne de base */}
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-rule" />
        {/* Marker "aujourd'hui" */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${((toJour - minPasse) / span) * 100}%` }}
        >
          <div className="h-8 w-px bg-ink" />
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[0.58rem] uppercase tracking-[0.2em] text-ink">
            aujourd&apos;hui
          </span>
        </div>
        {/* Markers des échéances */}
        {verifs.map((v) => {
          const c = classifier(v.statut, v.datePrevue);
          const left =
            ((v.datePrevue.getTime() - minPasse) / span) * 100;
          const color =
            c.tone === "alerte"
              ? "var(--minium)"
              : c.tone === "warn"
                ? "oklch(0.72 0.15 70)"
                : "var(--accent-vif)";
          return (
            <div
              key={v.id}
              className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%` }}
            >
              <span
                aria-hidden
                className="block size-3 rounded-full border-2 border-paper-elevated"
                style={{ background: color }}
              />
              <span
                className="invisible absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-0.5 font-mono text-[0.62rem] text-paper-elevated group-hover:visible"
                role="tooltip"
              >
                {v.libelleObligation} · {c.libelleDate}
              </span>
            </div>
          );
        })}
      </div>

      {/* Légende / liste compacte */}
      <ul className="flex flex-col gap-1.5">
        {verifs.slice(0, 5).map((v) => {
          const c = classifier(v.statut, v.datePrevue);
          const dotColor =
            c.tone === "alerte"
              ? "var(--minium)"
              : c.tone === "warn"
                ? "oklch(0.72 0.15 70)"
                : "var(--accent-vif)";
          return (
            <li
              key={v.id}
              className="flex items-center gap-3 text-[0.82rem]"
            >
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ background: dotColor }}
              />
              <span className="flex-1 truncate">{v.libelleObligation}</span>
              <span className="font-mono text-[0.76rem] text-muted-foreground">
                {c.libelleDate}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
