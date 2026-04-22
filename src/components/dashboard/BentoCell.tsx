// Cellule bento du dashboard — en-tête (kicker + méta-droite) + corps.
// Utilise la classe `.bento-cell` (@layer components) pour la boîte.

import Link from "next/link";
import type { ReactNode } from "react";

export function BentoCell({
  kicker,
  sub,
  count,
  more,
  legend,
  children,
  className = "",
}: {
  kicker: string;
  sub?: ReactNode;
  count?: number | string;
  more?: { href: string; label: string };
  legend?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={"bento-cell " + className}>
      <div className="flex items-center justify-between gap-3">
        <span className="bento-kicker">{kicker}</span>
        <div className="flex items-center gap-3">
          {typeof count !== "undefined" ? (
            <span className="rounded-full bg-[color:var(--accent-vif-soft)] px-2.5 py-0.5 text-[0.72rem] font-semibold text-[color:var(--accent-vif)]">
              {count}
            </span>
          ) : null}
          {sub ? (
            <span className="text-[0.78rem] text-muted-foreground">{sub}</span>
          ) : null}
          {legend ? <span className="text-[0.74rem]">{legend}</span> : null}
          {more ? (
            <Link
              href={more.href}
              className="text-[0.8rem] text-[color:var(--accent-vif)] transition-colors hover:opacity-80"
            >
              {more.label} →
            </Link>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
