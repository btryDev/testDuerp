"use client";

// Widget « Calendrier · 12 mois ».
// Branche la frise `TimelineAnnuelle` sur les vraies données de
// l'établissement (évènements agrégés par mois, 1 par mois max).
// Tombe sur l'exemple pédagogique si aucune vérification n'existe
// encore (cas « utilisateur fraîchement arrivé »).

import { TimelineAnnuelle } from "@/components/guide/TimelineAnnuelle";
import type { DashboardBundle } from "../types";

export function WidgetCalendrierType({
  bundle,
}: {
  bundle: DashboardBundle;
}) {
  return (
    <div className="rounded-2xl border border-rule-soft bg-paper-elevated p-6">
      <TimelineAnnuelle
        nbEquipements={bundle.equipements.length}
        etablissementId={bundle.etablissementId}
        evenements={bundle.evenementsAnnee}
      />
    </div>
  );
}
