"use client";

import { useTransition } from "react";
import {
  changerStatutIntervention,
} from "@/lib/interventions/actions";
import type { StatutIntervention } from "@prisma/client";
import { LABEL_STATUT } from "@/lib/interventions/schema";

const TRANSITIONS: Record<StatutIntervention, StatutIntervention[]> = {
  ouvert: ["assigne", "en_cours", "fait", "annule"],
  assigne: ["en_cours", "fait", "annule"],
  en_cours: ["fait", "annule"],
  fait: ["en_cours"],
  annule: ["ouvert"],
};

export function ChangerStatutButtons({
  etablissementId,
  interventionId,
  statut,
}: {
  etablissementId: string;
  interventionId: string;
  statut: StatutIntervention;
}) {
  const [pending, startTransition] = useTransition();
  const cibles = TRANSITIONS[statut] ?? [];

  return (
    <div className="flex flex-wrap gap-2">
      {cibles.map((cible) => (
        <button
          key={cible}
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await changerStatutIntervention(
                etablissementId,
                interventionId,
                cible,
              );
            })
          }
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold text-[color:var(--board-ink)] ring-1 ring-[color:rgba(10,10,10,.18)] transition-colors hover:bg-[color:var(--board-slate-pale)] disabled:opacity-60"
        >
          → {LABEL_STATUT[cible]}
        </button>
      ))}
    </div>
  );
}
