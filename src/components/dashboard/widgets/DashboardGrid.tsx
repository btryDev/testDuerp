"use client";

// Orchestrateur du tableau de bord configurable.
// Reçoit le bundle de données pré-fetché côté serveur, lit le layout
// persistant en local et rend chaque widget du registre dans l'ordre
// choisi par l'utilisateur.

import { useState } from "react";
import { EditToolbar } from "./EditToolbar";
import { WidgetShell } from "./WidgetShell";
import { REGISTRY, tailleEnCol } from "./registry";
import { useLayoutPerso } from "./useLayoutPerso";
import type { DashboardBundle } from "./types";

export function DashboardGrid({ bundle }: { bundle: DashboardBundle }) {
  const {
    layout,
    actif,
    ajouter,
    retirer,
    changerVariant,
    deplacer,
    reinitialiser,
  } = useLayoutPerso(bundle.etablissementId);

  const [enEdition, setEnEdition] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <EditToolbar
        enEdition={enEdition}
        onToggle={() => setEnEdition((e) => !e)}
        actif={actif}
        onAjouter={ajouter}
        onReinitialiser={reinitialiser}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 [grid-auto-flow:dense]">
        {layout.items.map((item, idx) => {
          const def = REGISTRY[item.widgetId];
          if (!def) return null;
          if (def.visibleQuand && !def.visibleQuand(bundle)) return null;

          const Component = def.Component;
          const colSpan = tailleEnCol(def.taille);

          return (
            <WidgetShell
              key={item.widgetId}
              widgetId={item.widgetId}
              variant={item.variant}
              enEdition={enEdition}
              estPremier={idx === 0}
              estDernier={idx === layout.items.length - 1}
              onRetirer={() => retirer(item.widgetId)}
              onDeplacer={(dir) => deplacer(item.widgetId, dir)}
              onChangerVariant={(v) => changerVariant(item.widgetId, v)}
              colSpan={colSpan}
            >
              <Component bundle={bundle} variant={item.variant} />
            </WidgetShell>
          );
        })}
      </div>
    </div>
  );
}
