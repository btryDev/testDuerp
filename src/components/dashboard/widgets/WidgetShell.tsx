"use client";

// Enveloppe d'un widget en mode édition.
// Hors édition : transparent, laisse passer le rendu d'origine.
// En édition : affiche un overlay discret avec les contrôles (retirer,
// monter/descendre, changer de variant). L'overlay n'efface PAS la
// donnée — on voit toujours le widget en dessous, ce qui permet de
// juger l'effet d'un changement de variant en direct.

import { useState } from "react";
import { ArrowDown, ArrowUp, Check, Shuffle, X } from "lucide-react";
import { REGISTRY } from "./registry";
import type { WidgetId } from "./types";

export function WidgetShell({
  widgetId,
  variant,
  enEdition,
  estPremier,
  estDernier,
  onRetirer,
  onDeplacer,
  onChangerVariant,
  colSpan,
  children,
}: {
  widgetId: WidgetId;
  variant: string;
  enEdition: boolean;
  estPremier: boolean;
  estDernier: boolean;
  onRetirer: () => void;
  onDeplacer: (dir: "up" | "down") => void;
  onChangerVariant: (variant: string) => void;
  colSpan: number;
  children: React.ReactNode;
}) {
  const def = REGISTRY[widgetId];
  const aVariants = def.variants.length > 1;

  return (
    <div
      className={
        "relative " +
        (enEdition
          ? "rounded-2xl ring-1 ring-dashed ring-[color:var(--accent-vif)]/50 ring-offset-2 ring-offset-paper"
          : "")
      }
      style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}
    >
      {children}

      {enEdition ? (
        <ShellOverlay
          titre={def.titre}
          variant={variant}
          variants={def.variants}
          aVariants={aVariants}
          estPremier={estPremier}
          estDernier={estDernier}
          onRetirer={onRetirer}
          onDeplacer={onDeplacer}
          onChangerVariant={onChangerVariant}
        />
      ) : null}
    </div>
  );
}

function ShellOverlay({
  titre,
  variant,
  variants,
  aVariants,
  estPremier,
  estDernier,
  onRetirer,
  onDeplacer,
  onChangerVariant,
}: {
  titre: string;
  variant: string;
  variants: readonly { id: string; label: string }[];
  aVariants: boolean;
  estPremier: boolean;
  estDernier: boolean;
  onRetirer: () => void;
  onDeplacer: (dir: "up" | "down") => void;
  onChangerVariant: (variant: string) => void;
}) {
  const [ouvertVariants, setOuvertVariants] = useState(false);

  return (
    <>
      {/* Bandeau flottant top-right avec contrôles */}
      <div className="absolute -right-2 -top-2 z-10 flex items-center gap-1 rounded-full border border-rule bg-paper-elevated px-1.5 py-1 shadow-sm">
        <span className="truncate px-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {titre}
        </span>
        <BoutonCtrl
          onClick={() => onDeplacer("up")}
          disabled={estPremier}
          titre="Déplacer vers le haut"
        >
          <ArrowUp className="size-3" />
        </BoutonCtrl>
        <BoutonCtrl
          onClick={() => onDeplacer("down")}
          disabled={estDernier}
          titre="Déplacer vers le bas"
        >
          <ArrowDown className="size-3" />
        </BoutonCtrl>
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

      {/* Popover variants */}
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
  disabled,
  titre,
  variant,
  actif,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  titre: string;
  variant?: "destructive";
  actif?: boolean;
}) {
  const classes =
    "flex size-6 items-center justify-center rounded-full transition-colors disabled:opacity-30 disabled:pointer-events-none " +
    (variant === "destructive"
      ? "text-[color:var(--minium)] hover:bg-[color:color-mix(in_oklch,var(--minium)_10%,transparent)]"
      : actif
        ? "bg-[color:var(--accent-vif-soft)] text-[color:var(--accent-vif)]"
        : "text-ink/70 hover:bg-paper-sunk hover:text-ink");
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={titre}
      aria-label={titre}
      className={classes}
    >
      {children}
    </button>
  );
}
