"use client";

// Widget « Prochaines échéances » — 2 variants :
//  - list     : liste verticale V2 (titre + equip · date J+N + pill)
//  - timeline : axe horizontal avec dots marqués aux dates (historique)

import Link from "next/link";
import { LienProvenance } from "@/components/navigation/LienProvenance";
import { BentoCell } from "@/components/dashboard/BentoCell";
import { formaterDateCourteFr } from "@/lib/dates";
import { estVerificationEnRetard } from "@/lib/dates/retard";
import { libelleEcart } from "../temps";
import type { DashboardBundle } from "../types";

// Toutes les fonctions temporelles reçoivent la date de référence du
// bundle (`aujourdhui`, figée côté serveur) : un `new Date()` au rendu
// créerait un écart d'hydratation SSR/CSR. L'écart, lui, se compte en
// jours civils (cf. `../temps`) : comparer des instants faisait basculer
// une échéance du jour en « J−1 » vers 14 h, heure de Paris.

function classifier(
  statut: string,
  datePrevue: Date,
  aujourdhui: Date,
): { tone: "alerte" | "warn" | "ok"; libelleDate: string } {
  // Même prédicat que partout ailleurs (ADR-011) : le retard commence à
  // minuit, heure de Paris, du jour qui suit l'échéance — et c'est la
  // date qui le décide, pas le statut. La liste ne porte que des
  // occurrences non réalisées.
  if (
    estVerificationEnRetard(
      { statut, datePrevue, dateRealisee: null },
      aujourdhui,
    )
  ) {
    return { tone: "alerte", libelleDate: formaterDateCourteFr(datePrevue) };
  }
  if (statut === "a_planifier") {
    return { tone: "warn", libelleDate: "—" };
  }
  return { tone: "ok", libelleDate: formaterDateCourteFr(datePrevue) };
}

export function WidgetProchainesEcheances({
  bundle,
  variant,
}: {
  bundle: DashboardBundle;
  variant: string;
}) {
  const { prochainesVerifs, etablissementId, aujourdhui } = bundle;

  if (prochainesVerifs.length === 0) {
    return (
      <section className="bento-cell">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h3 className="v2-title">Prochaines échéances</h3>
            <p className="v2-subtitle">Les 5 prochaines vérifications</p>
          </div>
        </header>
        <p className="text-[0.88rem] text-muted-foreground">
          Aucune vérification planifiée pour l&apos;instant.
        </p>
      </section>
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
        <TimelineEcheances
          verifs={prochainesVerifs}
          etablissementId={etablissementId}
          aujourdhui={aujourdhui}
        />
      </BentoCell>
    );
  }

  // Variant "list" V2 : titre + equip (gauche) · date + J+N + pill (droite)
  return (
    <section className="bento-cell">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="v2-title">Prochaines échéances</h3>
          <p className="v2-subtitle">Les 5 prochaines vérifications</p>
        </div>
        <Link
          href={`/etablissements/${etablissementId}/calendrier`}
          className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/75 hover:text-ink"
        >
          Tout voir ↗
        </Link>
      </header>
      <ul className="flex flex-col">
        {prochainesVerifs.map((v, i) => {
          const c = classifier(v.statut, v.datePrevue, aujourdhui);
          const pillClass =
            c.tone === "alerte"
              ? "pill-v2 pill-v2-alert"
              : c.tone === "warn"
                ? "pill-v2 pill-v2-dashed"
                : "pill-v2 pill-v2-navy-soft";
          const pillLabel =
            c.tone === "alerte"
              ? "Dépassé"
              : c.tone === "warn"
                ? "À planifier"
                : "Planifié";
          const dans =
            v.statut === "a_planifier"
              ? "À planifier"
              : libelleEcart(v.datePrevue, aujourdhui);
          const dansColor =
            c.tone === "alerte" ? "text-[color:var(--board-signal-ink)]" : "text-muted-foreground";
          return (
            <li
              key={v.id}
              style={{
                borderTop: i === 0 ? "0" : "1px dashed var(--rule)",
              }}
            >
              <LienProvenance
                href={`/etablissements/${etablissementId}/verifications/${v.id}`}
                className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-md py-3 transition-colors hover:bg-paper-sunk"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium tracking-[-0.005em]">
                    {v.libelleObligation}
                  </p>
                  <p className="mt-[3px] truncate font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
                    {v.equipement.libelle}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-[12px] tabular-nums text-ink/75">
                    {c.libelleDate}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={"font-mono text-[10.5px] " + dansColor}
                    >
                      {dans}
                    </span>
                    <span className={pillClass}>{pillLabel}</span>
                  </div>
                </div>
              </LienProvenance>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TimelineEcheances({
  verifs,
  etablissementId,
  aujourdhui,
}: {
  verifs: DashboardBundle["prochainesVerifs"];
  etablissementId: string;
  aujourdhui: Date;
}) {
  // Axe temporel : de aujourd'hui à la dernière date prévue (au moins
  // 30 jours d'horizon pour ne pas écraser si toutes proches).
  const toJour = aujourdhui.getTime();
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
          const c = classifier(v.statut, v.datePrevue, aujourdhui);
          const left =
            ((v.datePrevue.getTime() - minPasse) / span) * 100;
          const color =
            c.tone === "alerte"
              ? "var(--minium)"
              : c.tone === "warn"
                ? "var(--warn)"
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
          const c = classifier(v.statut, v.datePrevue, aujourdhui);
          const dotColor =
            c.tone === "alerte"
              ? "var(--minium)"
              : c.tone === "warn"
                ? "var(--warn)"
                : "var(--accent-vif)";
          return (
            <li key={v.id}>
              <LienProvenance
                href={`/etablissements/${etablissementId}/verifications/${v.id}`}
                className="flex items-center gap-3 rounded-md px-1 py-1 text-[0.82rem] transition-colors hover:bg-paper-sunk"
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
              </LienProvenance>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
