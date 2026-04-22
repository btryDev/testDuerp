"use client";

// Enveloppe d'un widget en mode édition.
// Hors édition : transparent, laisse passer le rendu d'origine.
// En édition : ring dashed + bandeau flottant (drag handle · retirer ·
// variant). Le drag-handle est le seul moyen de déplacer — les autres
// boutons ne déclenchent PAS de drag (pointerDown s'arrête là).

import { useState } from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Shuffle, X } from "lucide-react";
import { REGISTRY } from "./registry";
import type { WidgetId } from "./types";

export function WidgetShell({
  widgetId,
  variant,
  enEdition,
  onRetirer,
  onChangerVariant,
  colSpan,
  children,
}: {
  widgetId: WidgetId;
  variant: string;
  enEdition: boolean;
  onRetirer: () => void;
  onChangerVariant: (variant: string) => void;
  colSpan: number;
  children: React.ReactNode;
}) {
  const def = REGISTRY[widgetId];
  const aVariants = def.variants.length > 1;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widgetId,
    disabled: !enEdition,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${colSpan} / span ${colSpan}`,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        "relative " +
        (enEdition
          ? "rounded-2xl ring-1 ring-dashed ring-[color:var(--accent-vif)]/50 ring-offset-2 ring-offset-paper"
          : "")
      }
    >
      {children}

      {enEdition ? (
        <ShellOverlay
          titre={def.titre}
          variant={variant}
          variants={def.variants}
          aVariants={aVariants}
          onRetirer={onRetirer}
          onChangerVariant={onChangerVariant}
          dragAttributes={attributes}
          dragListeners={listeners}
          setDragActivator={setActivatorNodeRef}
        />
      ) : null}
    </div>
  );
}

type DragActivator = (element: HTMLElement | null) => void;

function ShellOverlay({
  titre,
  variant,
  variants,
  aVariants,
  onRetirer,
  onChangerVariant,
  dragAttributes,
  dragListeners,
  setDragActivator,
}: {
  titre: string;
  variant: string;
  variants: readonly { id: string; label: string }[];
  aVariants: boolean;
  onRetirer: () => void;
  onChangerVariant: (variant: string) => void;
  dragAttributes: DraggableAttributes;
  dragListeners: SyntheticListenerMap | undefined;
  setDragActivator: DragActivator;
}) {
  const [ouvertVariants, setOuvertVariants] = useState(false);

  return (
    <>
      <div className="absolute -right-2 -top-2 z-10 flex items-center gap-1 rounded-full border border-rule bg-paper-elevated px-1.5 py-1 shadow-sm">
        <button
          ref={setDragActivator}
          type="button"
          title="Glisser pour déplacer"
          aria-label={`Déplacer ${titre}`}
          {...dragAttributes}
          {...dragListeners}
          className="flex size-6 cursor-grab items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-paper-sunk hover:text-ink active:cursor-grabbing"
        >
          <GripVertical className="size-3.5" />
        </button>
        <span className="truncate px-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {titre}
        </span>
        {aVariants ? (
          <BoutonCtrl
            onClick={() => setOuvertVariants((v) => !v)}
            titre="Changer de visualisation"
            actif={ouvertVariants}
          >
            <Shuffle className="size-3" />
          </BoutonCtrl>
        ) : null}
        <BoutonCtrl
          onClick={onRetirer}
          titre="Retirer du tableau de bord"
          variant="destructive"
        >
          <X className="size-3" />
        </BoutonCtrl>
      </div>

      {aVariants && ouvertVariants ? (
        <div className="absolute right-0 top-8 z-20 min-w-[170px] rounded-lg border border-rule bg-paper-elevated p-1.5 shadow-md">
          <p className="px-2 pb-1 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
            Visualisation
          </p>
          {variants.map((v) => {
            const actif = v.id === variant;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  onChangerVariant(v.id);
                  setOuvertVariants(false);
                }}
                className={
                  "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[0.82rem] transition-colors " +
                  (actif
                    ? "bg-[color:var(--accent-vif-soft)] text-[color:var(--accent-vif)]"
                    : "hover:bg-paper-sunk")
                }
              >
                {v.label}
                {actif ? <Check className="size-3.5" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

function BoutonCtrl({
  children,
  onClick,
  titre,
  variant,
  actif,
}: {
  children: React.ReactNode;
  onClick: () => void;
  titre: string;
  variant?: "destructive";
  actif?: boolean;
}) {
  const classes =
    "flex size-6 items-center justify-center rounded-full transition-colors " +
    (variant === "destructive"
      ? "text-[color:var(--minium)] hover:bg-[color:color-mix(in_oklch,var(--minium)_10%,transparent)]"
      : actif
        ? "bg-[color:var(--accent-vif-soft)] text-[color:var(--accent-vif)]"
        : "text-ink/70 hover:bg-paper-sunk hover:text-ink");
  return (
    <button
      type="button"
      onClick={onClick}
      title={titre}
      aria-label={titre}
      className={classes}
    >
      {children}
    </button>
  );
}
