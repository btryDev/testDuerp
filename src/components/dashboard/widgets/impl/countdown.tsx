"use client";

// Widget « Prochaine échéance critique ».
// Sélectionne la vérif la plus urgente parmi les 5 prochaines :
//  - Retard en premier (ordre d'ancienneté)
//  - Puis planifiée la plus proche
// Typo monumentale : J-N / J+N, libellé compact en dessous.

import Link from "next/link";
import { BentoCell } from "@/components/dashboard/BentoCell";
import type { DashboardBundle } from "../types";

function joursEcoules(d: Date): number {
  const ms = d.getTime() - Date.now();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function WidgetCountdown({ bundle }: { bundle: DashboardBundle }) {
  const { prochainesVerifs, etablissementId } = bundle;

  if (prochainesVerifs.length === 0) {
    return (
      <BentoCell kicker="Prochaine échéance">
        <p className="text-[0.88rem] text-muted-foreground">
          Aucune vérification planifiée pour l&apos;instant.
        </p>
      </BentoCell>
    );
  }

  // Tri interne : retard d'abord, puis ordre des datePrevue.
  const now = new Date();
  const trie = [...prochainesVerifs].sort((a, b) => {
    const aRetard =
      a.statut === "depassee" ||
      (a.statut === "planifiee" && a.datePrevue < now);
    const bRetard =
      b.statut === "depassee" ||
      (b.statut === "planifiee" && b.datePrevue < now);
    if (aRetard && !bRetard) return -1;
    if (bRetard && !aRetard) return 1;
    return a.datePrevue.getTime() - b.datePrevue.getTime();
  });
  const v = trie[0];

  const jours = joursEcoules(v.datePrevue);
  const enRetard =
    v.statut === "depassee" ||
    (v.statut === "planifiee" && v.datePrevue < now);
  const aPlanifier = v.statut === "a_planifier";

  const tone: "alerte" | "warn" | "ok" = enRetard
    ? "alerte"
    : aPlanifier || jours <= 30
      ? "warn"
      : "ok";

  const bigLabel = aPlanifier
    ? "À planifier"
    : jours < 0
      ? `J+${Math.abs(jours)}`
      : jours === 0
        ? "Aujourd'hui"
        : `J-${jours}`;

  const toneClass =
    tone === "alerte"
      ? "text-[color:var(--minium)]"
      : tone === "warn"
        ? "text-[color:oklch(0.48_0.14_60)]"
        : "text-[color:var(--accent-vif)]";

  return (
    <BentoCell kicker="Prochaine échéance">
      <div className="flex flex-col gap-3">
        <div
          className={
            "text-[3.2rem] font-semibold leading-none tracking-[-0.04em] tabular-nums " +
            toneClass
          }
        >
          {bigLabel}
        </div>
        <div>
          <p className="text-[0.95rem] font-medium leading-snug">
            {v.libelleObligation}
          </p>
          <p className="mt-1 text-[0.78rem] text-muted-foreground">
            {v.equipement.libelle}
            {!aPlanifier ? (
              <>
                {" · "}
                {v.datePrevue.toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </>
            ) : null}
          </p>
        </div>
        <Link
          href={`/etablissements/${etablissementId}/verifications/${v.id}`}
          className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink underline decoration-rule decoration-dotted underline-offset-4 hover:decoration-ink"
        >
          Détail de la vérification →
        </Link>
      </div>
    </BentoCell>
  );
}
