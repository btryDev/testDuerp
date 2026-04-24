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
          className="rounded-md border border-[color:var(--rule)] bg-[color:var(--paper-elevated)] px-3 py-1.5 text-[0.78rem] font-medium transition-colors hover:border-[color:var(--warm)] hover:bg-[color:var(--warm-soft)] disabled:opacity-60"
        >
          → {LABEL_STATUT[cible]}
        </button>
      ))}
    </div>
  );
}
