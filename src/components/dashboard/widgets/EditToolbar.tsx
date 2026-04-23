"use client";

// Barre de contrôles « Mise en page » — mockup V2.
// Hors édition : libellé « Mise en page » + compteur « N widgets actifs »,
//                actions ghost (+ Ajouter, Réinitialiser) + bouton outline Personnaliser.
// En édition : indicateur « Mode personnalisation » + bouton Terminer.
//              Le tiroir de widgets masqués reste disponible sous la barre.

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
        <div className="flex items-center gap-2.5">
          {enEdition ? (
            <span className="pill-v2 pill-v2-green">
              <Settings2 aria-hidden className="size-3" />
              Mode personnalisation
            </span>
          ) : (
            <>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                Mise en page
              </span>
              <span className="font-mono text-[11.5px] text-ink/75">
                {actif.size} widgets actifs
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {enEdition ? (
            <>
              <BtnGhost onClick={onReinitialiser} title="Restaurer les widgets par défaut">
                <RotateCcw className="size-3" />
                Réinitialiser
              </BtnGhost>
              <button
                type="button"
                onClick={onToggle}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[color:var(--navy)] px-3 text-[12px] font-medium text-white transition-colors hover:bg-[color:color-mix(in_oklch,var(--navy)_88%,black)]"
              >
                <X className="size-3.5" />
                Terminer
              </button>
            </>
          ) : (
            <>
              <BtnGhost onClick={onToggle} title="Ajouter un widget">
                <Plus className="size-3" />
                Ajouter un widget
              </BtnGhost>
              <BtnGhost onClick={onReinitialiser} title="Restaurer les widgets par défaut">
                Réinitialiser
              </BtnGhost>
              <button
                type="button"
                onClick={onToggle}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rule bg-paper-elevated px-3 text-[12px] font-medium text-ink transition-colors hover:bg-paper-sunk"
              >
                Personnaliser
              </button>
            </>
          )}
        </div>
      </div>

      {enEdition ? <TiroirMasques actif={actif} onAjouter={onAjouter} /> : null}
    </div>
  );
}

function BtnGhost({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="inline-flex h-[30px] items-center gap-1.5 rounded-lg bg-transparent px-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/75 transition-colors hover:bg-paper-sunk"
    >
      {children}
    </button>
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
                className="group flex w-full items-start gap-3 rounded-lg border border-rule-soft bg-paper-elevated px-3 py-2.5 text-left transition-colors hover:border-[color:var(--navy)] hover:bg-[color:var(--navy-soft)]"
              >
                <span
                  aria-hidden
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-rule-soft bg-paper-sunk text-muted-foreground transition-colors group-hover:border-[color:var(--navy)] group-hover:bg-[color:var(--navy)] group-hover:text-white"
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
