import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";

/**
 * Petit picto inline qui révèle une bulle explicative au survol ET au focus.
 * Pure CSS (pas de state React) — le bouton est focusable, `:focus-within`
 * sur le wrapper ouvre la bulle au tap sur mobile et au Tab clavier.
 *
 * Deux variantes :
 *  - `info` (défaut) : pastille noire avec « i », pour l'aide contextuelle
 *    produit (explication d'un concept, d'un champ de formulaire).
 *  - `legal` : pastille noire avec icône « livre ouvert », pour les
 *    références au Code du travail / INRS / règlementaires. Le livre se
 *    distingue au premier coup d'œil et signale « source juridique ».
 */
export function InfoTooltip({
  children,
  align = "center",
  variant = "info",
  label,
}: {
  children: ReactNode;
  align?: "center" | "right" | "left";
  variant?: "info" | "legal";
  /** Libellé accessible du déclencheur — défaut : « Plus d'informations ». */
  label?: string;
}) {
  const posClass =
    align === "right"
      ? "right-0"
      : align === "left"
        ? "left-0"
        : "left-1/2 -translate-x-1/2";
  const arrowClass =
    align === "right"
      ? "right-3"
      : align === "left"
        ? "left-3"
        : "left-1/2 -translate-x-1/2";

  const isLegal = variant === "legal";
  const triggerLabel = label ?? (isLegal ? "Référence légale" : "Plus d'informations");
  const bubbleWidth = isLegal ? "max-w-[20rem]" : "max-w-[16rem]";

  return (
    <span className="group/info relative inline-flex items-center align-baseline">
      <button
        type="button"
        aria-label={triggerLabel}
        className="ml-1.5 inline-flex h-[17px] w-[17px] shrink-0 cursor-help items-center justify-center rounded-full bg-ink text-paper-elevated opacity-70 outline-none transition-all hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-1"
      >
        {isLegal ? (
          <BookOpen aria-hidden className="h-[10px] w-[10px]" strokeWidth={2.4} />
        ) : (
          <span aria-hidden className="text-[0.62rem] font-semibold leading-none">
            i
          </span>
        )}
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full ${posClass} z-30 mb-2 w-max ${bubbleWidth} rounded-md bg-ink px-3 py-2 text-left text-[0.72rem] font-normal normal-case leading-relaxed tracking-normal text-paper-elevated opacity-0 shadow-lg transition-opacity duration-150 [font-family:var(--font-body)] group-hover/info:opacity-100 group-focus-within/info:opacity-100`}
      >
        {children}
        <span
          aria-hidden
          className={`absolute top-full ${arrowClass} border-4 border-transparent border-t-ink`}
        />
      </span>
    </span>
  );
}
