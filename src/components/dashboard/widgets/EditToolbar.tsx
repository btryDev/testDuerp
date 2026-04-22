"use client";

// Barre de contrôles « Personnaliser le tableau de bord ».
// Hors édition : un simple bouton « Personnaliser ».
// En édition :
//   - indicateur « Mode personnalisation » avec bouton Terminer
//   - liste des widgets masqués qu'on peut réactiver d'un clic

import { Plus, RotateCcw, Settings2, X } from "lucide-react";
import { REGISTRY, tailleEnCol, tousLesWidgetIds } from "./registry";
import type { WidgetId } from "./types";

export function EditToolbar({
  enEdition,
  onToggle,
  actif,
  onAjouter,
  onReinitialiser,
}: {
  enEdition: boolean;
  onToggle: () => void;
  actif: Set<WidgetId>;
  onAjouter: (id: WidgetId) => void;
  onReinitialiser: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {enEdition ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent-vif-soft)] px-3 py-1 text-[0.78rem] font-medium text-[color:var(--accent-vif)]">
              <Settings2 aria-hidden className="size-3.5" />
              Mode personnalisation
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {enEdition ? (
            <button
              type="button"
              onClick={onReinitialiser}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rule bg-transparent px-3 py-1.5 text-[0.8rem] transition-colors hover:border-ink"
              title="Restaurer les widgets par défaut"
            >
              <RotateCcw className="size-3.5" />
              Réinitialiser
            </button>
          ) : null}
          <button
            type="button"
            onClick={onToggle}
            className={
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.82rem] font-medium transition-colors " +
              (enEdition
                ? "bg-[color:var(--accent-vif)] text-[color:var(--paper-elevated)] hover:-translate-y-px"
                : "border border-rule bg-transparent text-ink hover:border-ink")
            }
          >
            {enEdition ? (
              <>
                <X className="size-3.5" />
                Terminer
              </>
            ) : (
              <>
                <Settings2 className="size-3.5" />
                Personnaliser
              </>
            )}
          </button>
        </div>
      </div>

      {enEdition ? <TiroirMasques actif={actif} onAjouter={onAjouter} /> : null}
    </div>
  );
}

function TiroirMasques({
  actif,
  onAjouter,
}: {
  actif: Set<WidgetId>;
  onAjouter: (id: WidgetId) => void;
}) {
  const masques = tousLesWidgetIds().filter((id) => !actif.has(id));

  if (masques.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-rule-soft bg-paper-sunk/40 px-4 py-3 text-[0.82rem] text-muted-foreground">
        Tous les widgets disponibles sont affichés. Retirez-en pour en
        libérer de la place.
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-dashed border-rule-soft bg-paper-sunk/40 p-4">
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
        Widgets disponibles · {masques.length}
      </p>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {masques.map((id) => {
          const def = REGISTRY[id];
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onAjouter(id)}
                className="group flex w-full items-start gap-3 rounded-lg border border-rule-soft bg-paper-elevated px-3 py-2.5 text-left transition-colors hover:border-[color:var(--accent-vif)] hover:bg-[color:color-mix(in_oklch,var(--accent-vif)_5%,var(--paper-elevated))]"
              >
                <span
                  aria-hidden
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-rule-soft bg-paper-sunk text-muted-foreground transition-colors group-hover:border-[color:var(--accent-vif)] group-hover:bg-[color:var(--accent-vif)] group-hover:text-[color:var(--paper-elevated)]"
                >
                  <Plus className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.88rem] font-medium">
                    {def.titre}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[0.76rem] text-muted-foreground">
                    {def.description}
                  </p>
                  <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {def.taille} · {tailleEnCol(def.taille)} col.
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
