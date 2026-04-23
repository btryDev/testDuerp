"use client";

// Widget « Flux registre ».
// Feed chronologique inverse des derniers rapports déposés, avec
// résultat coloré et date relative.

import Link from "next/link";
import { BentoCell } from "@/components/dashboard/BentoCell";
import type { DashboardBundle } from "../types";

function dateRelative(d: Date): string {
  const jours = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (jours === 0) return "aujourd'hui";
  if (jours === 1) return "hier";
  if (jours < 7) return `il y a ${jours} j`;
  if (jours < 30) return `il y a ${Math.round(jours / 7)} sem.`;
  if (jours < 365) return `il y a ${Math.round(jours / 30)} mois`;
  return `il y a ${Math.round(jours / 365)} an`;
}

export function WidgetFluxRegistre({
  bundle,
}: {
  bundle: DashboardBundle;
}) {
  const { rapportsRecents, etablissementId } = bundle;

  if (rapportsRecents.length === 0) {
    return (
      <BentoCell kicker="Activité registre">
        <p className="text-[0.88rem] text-muted-foreground">
          Aucun rapport déposé pour l&apos;instant.
        </p>
      </BentoCell>
    );
  }

  return (
    <BentoCell
      kicker="Activité registre"
      more={{
        href: `/etablissements/${etablissementId}/registre`,
        label: "Ouvrir",
      }}
    >
      <ul className="flex flex-col">
        {rapportsRecents.map((r, i) => {
          const resultat = r.resultat;
          const dotColor =
            resultat === "conforme"
              ? "var(--accent-vif)"
              : resultat === "ecart_majeur"
                ? "var(--minium)"
                : "oklch(0.72 0.15 70)";
          const libelleResultat =
            resultat === "conforme"
              ? "Conforme"
              : resultat === "observations_mineures"
                ? "Observations"
                : resultat === "ecart_majeur"
                  ? "Écart majeur"
                  : "Non vérifiable";
          return (
            <li
              key={r.id}
              className={
                "grid grid-cols-[10px_1fr_auto] items-start gap-3 py-2.5 " +
                (i < rapportsRecents.length - 1
                  ? "border-b border-dashed border-rule-soft"
                  : "")
              }
            >
              <span
                aria-hidden
                className="mt-1 size-2 rounded-full"
                style={{ background: dotColor }}
              />
              <div className="min-w-0">
                <p className="truncate text-[0.86rem] font-medium">
                  {r.verification.libelleObligation}
                </p>
                <p className="mt-0.5 text-[0.72rem] text-muted-foreground">
                  {libelleResultat} · {dateRelative(r.dateRapport)}
                </p>
              </div>
              <Link
                href={`/etablissements/${etablissementId}/registre`}
                className="shrink-0 self-center font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
              >
                Voir
              </Link>
            </li>
          );
        })}
      </ul>
    </BentoCell>
  );
}
