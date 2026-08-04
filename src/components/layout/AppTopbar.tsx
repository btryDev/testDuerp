// Barre haute sticky du shell d'app (dashboard et pages établissement).
// Mockup de référence : « Tableau de bord V2.html » — kicker mono +
// pastille « Actif » verte, H1 32px, sous-titre liste (adresse +
// régimes en pills navy-soft), actions à droite.

import Link from "next/link";
import type { ReactNode } from "react";

export type Crumb = {
  href?: string;
  label: string;
};

/** Élément affiché à droite du kicker dans le sous-titre (pills régimes). */
export type TopbarRegime = {
  label: string;
};

export function AppTopbar({
  title,
  subtitle,
  subtitleSegments,
  kicker,
  statut,
  crumbs,
  actions,
}: {
  title: string;
  /** Sous-titre en texte libre — fallback quand `subtitleSegments` n'est pas fourni. */
  subtitle?: string;
  /** Segments du sous-titre : chaque entrée est soit une chaîne affichée en
   *  texte, soit un objet `{ pill: string }` rendu en pastille navy-soft.
   *  Les segments sont séparés par un point médian discret. */
  subtitleSegments?: Array<string | { pill: string }>;
  /** Libellé mono-kicker affiché au-dessus du titre — ex. "Établissements / Boulangerie…". */
  kicker?: string;
  /** Pastille de statut à droite du kicker (ex. « ● Actif »). */
  statut?: { label: string; tone: "ok" | "warn" | "alerte" };
  crumbs?: Crumb[];
  actions?: ReactNode;
}) {
  const toneToPill =
    statut?.tone === "ok"
      ? "pill-v2 pill-v2-green"
      : statut?.tone === "warn"
        ? "pill-v2 pill-v2-amber"
        : "pill-v2 pill-v2-alert";

  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-end justify-between gap-6 border-b border-rule-soft bg-paper px-8 pt-[22px] pb-[18px]">
      <div className="min-w-0">
        {kicker || statut ? (
          <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
            {kicker ? (
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                {kicker}
              </span>
            ) : null}
            {statut ? (
              <span className={toneToPill}>
                <span aria-hidden>●</span>
                {statut.label}
              </span>
            ) : null}
          </div>
        ) : null}

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

        <h1 className="text-[2rem] font-semibold leading-[1.05] tracking-[-0.022em]">
          {title}
        </h1>

        {subtitleSegments && subtitleSegments.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[0.84rem] text-muted-foreground">
            {subtitleSegments.map((seg, i) => {
              const isPill = typeof seg !== "string";
              return (
                <span key={i} className="flex items-center gap-2.5">
                  {i > 0 ? (
                    <span aria-hidden className="text-rule">
                      ·
                    </span>
                  ) : null}
                  {isPill ? (
                    <span className="pill-v2 pill-v2-navy-soft">{seg.pill}</span>
                  ) : (
                    <span>{seg}</span>
                  )}
                </span>
              );
            })}
          </div>
        ) : subtitle ? (
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
