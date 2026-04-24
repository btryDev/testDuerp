"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Pastille réglementaire. Cliquable : déploie un bloc citant
 * l'article et pointe vers Légifrance. Chaque obligation du produit
 * doit s'afficher avec son LegalBadge pour rappeler au dirigeant
 * d'où vient la contrainte. Argument d'auditabilité.
 */
export function LegalBadge({
  reference,
  href,
  extrait,
  children,
  className,
  defaultOpen = false,
}: {
  /** Référence courte, ex: "Art. R4224-17 CT" */
  reference: string;
  /** URL Légifrance / INRS / autre source officielle */
  href?: string;
  /** Extrait court (< 400 car.) cité textuellement */
  extrait?: string;
  /** Contenu rédactionnel optionnel (complément pédagogique) */
  children?: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasDetails = Boolean(extrait || children || href);

  return (
    <div className={cn("inline-flex flex-col gap-2 align-top", className)}>
      <button
        type="button"
        onClick={() => hasDetails && setOpen((o) => !o)}
        className={cn(
          "group inline-flex items-center gap-2 self-start rounded-full border border-[color:var(--rule)] bg-[color:var(--paper-sunk)] px-3 py-1 font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[color:var(--seal)] transition",
          hasDetails && "cursor-pointer hover:border-[color:var(--warm)] hover:text-[color:var(--warm)]",
          !hasDetails && "cursor-default",
        )}
        aria-expanded={hasDetails ? open : undefined}
      >
        <span aria-hidden className="text-[0.75rem] leading-none">§</span>
        <span>{reference}</span>
        {hasDetails && (
          <span
            aria-hidden
            className={cn(
              "inline-block text-[0.6rem] transition-transform",
              open && "rotate-180",
            )}
          >
            ▾
          </span>
        )}
      </button>

      {open && hasDetails && (
        <div className="rounded-lg border border-[color:var(--rule-soft)] bg-[color:var(--paper-elevated)] p-4 text-[0.8rem] leading-relaxed text-[color:var(--ink)] shadow-[0_1px_0_0_var(--rule-soft)]">
          {extrait && (
            <blockquote className="border-l-2 border-[color:var(--warm)] pl-3 text-[color:var(--foreground)] italic">
              «&nbsp;{extrait}&nbsp;»
            </blockquote>
          )}
          {children && <div className="mt-3 text-[color:var(--muted-foreground)]">{children}</div>}
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 font-mono text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[color:var(--warm)] hover:underline"
            >
              Lire la source officielle →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
