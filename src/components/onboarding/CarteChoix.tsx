"use client";

import type { ReactNode } from "react";

/**
 * Carte cliquable générique pour les grilles de choix (type ERP, classe
 * IGH, tranche d'effectif). Cohérent papier/cartouche, état sélectionné
 * mis en avant par un bord sombre + fond légèrement teinté.
 */
export function CarteChoix({
  id,
  label,
  description,
  badge,
  actif,
  onClick,
  icone,
}: {
  id: string;
  label: string;
  description?: string;
  badge?: string;
  actif: boolean;
  onClick: () => void;
  icone?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={actif}
      onClick={onClick}
      className={
        "group relative flex h-full w-full flex-col items-start gap-2 rounded-md border px-4 py-4 text-left transition-colors " +
        (actif
          ? "border-ink bg-warm-soft/40 shadow-sm"
          : "border-rule bg-paper hover:border-ink/60 hover:bg-paper-sunk/30")
      }
    >
      {/* Coche discrète dans le coin supérieur droit quand actif */}
      {actif && (
        <span
          aria-hidden
          className="absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-ink text-paper"
        >
          <svg
            viewBox="0 0 16 16"
            className="size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 8.5 6.5 12 13 5" />
          </svg>
        </span>
      )}

      <div className="flex items-center gap-3">
        {icone && (
          <span className="flex size-8 items-center justify-center rounded-md bg-paper-sunk/70 ring-1 ring-rule-soft">
            {icone}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[0.92rem] font-semibold tracking-[-0.01em]">
            {label}
          </p>
          {badge && (
            <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
              {badge}
            </p>
          )}
        </div>
      </div>

      {description && (
        <p className="text-[0.78rem] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      <input type="hidden" name={`choix-${id}`} value={actif ? "1" : "0"} />
    </button>
  );
}
