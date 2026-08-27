"use client";

import type { ReactNode } from "react";

/**
 * Carte cliquable des grilles de choix (type ERP, classe IGH, catégorie à
 * confirmer).
 *
 * Charte board : le choix retenu passe du creux ardoise au champ glacier —
 * la même bascule que les puces de domaine du formulaire prestataire
 * (`has-[:checked]:bg-[--board-blue-pale]`), ici pilotée par `aria-checked`
 * puisqu'il s'agit d'un `role="radio"` et non d'une case.
 *
 * Le champ ne suffit pas : il porte aussi la coche d'encre. Une sélection
 * qui ne tiendrait qu'à la teinte disparaît en niveaux de gris et pour qui
 * n'y voit pas (charte, interdit 10).
 *
 * L'`<input type="hidden">` que la carte posait a été retiré : imbriqué dans
 * un `<button>` il produisait du HTML invalide, et son nom `choix-…` n'était
 * lu nulle part — les valeurs partent par les champs cachés du wizard.
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
      data-choix={id}
      onClick={onClick}
      className={
        "relative flex h-full w-full flex-col items-start gap-2 rounded-[18px] px-4 py-4 text-left transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--board-blue-strong)] " +
        (actif
          ? "bg-[color:var(--board-blue-pale)]"
          : "bg-[color:var(--board-slate-pale)] hover:bg-[color:var(--board-blue-pale)]")
      }
    >
      {/* Coche d'encre dans le coin, quand la carte est retenue. */}
      {actif && (
        <span
          aria-hidden
          className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-[color:var(--board-ink)] text-white"
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
          <span className="flex size-8 items-center justify-center rounded-[10px] bg-[color:var(--board-card)] text-[color:var(--board-slate-mid)] ring-1 ring-[color:var(--board-slate-line)]">
            {icone}
          </span>
        )}
        <div className="min-w-0">
          <p className="m-0 text-[13.5px] font-semibold leading-[1.3] tracking-[-0.01em] text-[color:var(--board-ink)]">
            {label}
          </p>
          {badge && (
            <p className="board-eyebrow m-0 mt-1 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
              {badge}
            </p>
          )}
        </div>
      </div>

      {description && (
        <p className="m-0 text-[12.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
          {description}
        </p>
      )}
    </button>
  );
}
