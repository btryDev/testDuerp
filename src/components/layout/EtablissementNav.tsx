"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Navigation contextuelle affichée sur toutes les pages d'un établissement.
 * Reprend les 4 modules principaux (dashboard, calendrier, actions, registre).
 * Le module "actif" est mis en avant en fonction du pathname courant.
 */
export function EtablissementNav({
  etablissementId,
  raisonDisplay,
  entrepriseRaison,
  entrepriseId,
}: {
  etablissementId: string;
  raisonDisplay: string;
  entrepriseRaison: string;
  entrepriseId: string;
}) {
  const pathname = usePathname();
  const base = `/etablissements/${etablissementId}`;

  const items: { label: string; href: string; match: (p: string) => boolean }[] = [
    {
      label: "Vue d'ensemble",
      href: base,
      match: (p) =>
        p === base ||
        p === `${base}/modifier` ||
        p === `${base}/equipements` ||
        p.startsWith(`${base}/equipements/`),
    },
    {
      label: "Calendrier",
      href: `${base}/calendrier`,
      match: (p) => p.startsWith(`${base}/calendrier`),
    },
    {
      label: "Registre de sécurité",
      href: `${base}/registre`,
      match: (p) =>
        p.startsWith(`${base}/registre`) ||
        p.startsWith(`${base}/verifications`),
    },
    {
      label: "Plan d'actions",
      href: `${base}/actions`,
      match: (p) => p.startsWith(`${base}/actions`),
    },
  ];

  return (
    <div className="border-b border-dashed border-rule/60 bg-paper-sunk/40">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        {/* Fil d'Ariane */}
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-4 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
          <Link
            href="/entreprises"
            className="transition-colors hover:text-ink"
          >
            Mes entreprises
          </Link>
          <span aria-hidden className="text-rule">
            /
          </span>
          <Link
            href={`/entreprises/${entrepriseId}`}
            className="truncate transition-colors hover:text-ink"
          >
            {entrepriseRaison}
          </Link>
          <span aria-hidden className="text-rule">
            /
          </span>
          <span className="truncate text-ink">{raisonDisplay}</span>
        </nav>

        {/* Onglets modules */}
        <ul className="mt-3 flex flex-wrap gap-x-1 gap-y-1 overflow-x-auto pb-0">
          {items.map((it) => {
            const actif = it.match(pathname ?? "");
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  aria-current={actif ? "page" : undefined}
                  className={
                    "relative inline-flex items-center px-3 py-2 text-[0.82rem] transition-colors " +
                    (actif
                      ? "font-semibold text-ink"
                      : "text-muted-foreground hover:text-ink")
                  }
                >
                  {it.label}
                  {actif && (
                    <span
                      aria-hidden
                      className="absolute inset-x-2 -bottom-px h-[2px] bg-ink"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
