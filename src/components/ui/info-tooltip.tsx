import type { ReactNode } from "react";

/**
 * Petite icône ⓘ inline, bulle au hover. Pure CSS, pas de JS.
 * `align` décide du côté d'ancrage quand la bulle risque de déborder.
 */
export function InfoTooltip({
  children,
  align = "center",
}: {
  children: ReactNode;
  align?: "center" | "right" | "left";
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

  return (
    <span className="group/info relative inline-flex items-center align-baseline">
      <span
        aria-hidden
        className="ml-1.5 inline-flex h-[14px] w-[14px] shrink-0 cursor-help items-center justify-center rounded-full border border-current text-[0.55rem] font-semibold leading-none opacity-50 transition-opacity group-hover/info:opacity-100"
      >
        i
      </span>
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full ${posClass} z-30 mb-2 w-max max-w-[16rem] rounded-md bg-ink px-3 py-2 text-left text-[0.72rem] font-normal normal-case leading-relaxed tracking-normal text-paper-elevated opacity-0 shadow-lg transition-opacity duration-150 group-hover/info:opacity-100 [font-family:var(--font-body)]`}
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
