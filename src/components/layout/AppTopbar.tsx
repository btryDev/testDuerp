// Barre haute sticky du shell d'app (dashboard et pages établissement).
// Cf. HANDOFF.md Direction B — crumbs, titre, sous-titre, actions à droite.

import Link from "next/link";
import type { ReactNode } from "react";

export type Crumb = {
  href?: string;
  label: string;
};

export function AppTopbar({
  title,
  subtitle,
  crumbs,
  actions,
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-start justify-between gap-6 border-b border-rule-soft bg-paper-elevated px-8 pt-6 pb-5">
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 ? (
          <nav
            aria-label="Fil d'Ariane"
            className="mb-1.5 flex items-center text-[0.8rem] text-muted-foreground"
          >
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <span key={i} className="flex items-center">
                  {c.href && !last ? (
                    <Link
                      href={c.href}
                      className="transition-colors hover:text-ink"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <strong
                      className={last ? "font-medium text-ink" : "font-normal"}
                    >
                      {c.label}
                    </strong>
                  )}
                  {!last ? (
                    <span aria-hidden className="mx-1.5 opacity-50">
                      ›
                    </span>
                  ) : null}
                </span>
              );
            })}
          </nav>
        ) : null}
        <h1 className="text-[1.55rem] font-semibold leading-tight tracking-[-0.025em]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 max-w-[700px] text-[0.86rem] text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2.5">{actions}</div>
      ) : null}
    </header>
  );
}
