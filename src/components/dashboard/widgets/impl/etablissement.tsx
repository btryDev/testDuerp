"use client";

import Link from "next/link";
import { Pencil, Phone } from "lucide-react";
import type { DashboardBundle } from "../types";

function regimes(etab: DashboardBundle["etablissement"]): string[] {
  const out: string[] = [];
  if (etab.estEtablissementTravail) out.push("Établissement de travail");
  if (etab.estERP) {
    const suffixes: string[] = [];
    if (etab.typeErp) suffixes.push(`type ${etab.typeErp}`);
    if (etab.categorieErp) suffixes.push(`cat. ${etab.categorieErp.slice(1)}`);
    out.push(`ERP${suffixes.length ? " · " + suffixes.join(" · ") : ""}`);
  }
  if (etab.estIGH) out.push(`IGH ${etab.classeIgh ?? ""}`.trim());
  if (etab.estHabitation) out.push("Habitation");
  return out;
}

function extraireVille(adresse: string): string {
  const parts = adresse.split(",");
  const last = parts[parts.length - 1]?.trim() ?? "";
  const m = /^\d{5}\s+(.+)$/.exec(last);
  return m ? m[1] : last || adresse;
}

/**
 * Widget « Identité » — layout split horizontal (illustration à gauche,
 * infos à droite) pour ne pas laisser de grand vide central. Fond en
 * gradient navy→warm pour démarquer des autres cells. Pills régimes en
 * pied avec filet pointillé.
 */
export function WidgetEtablissement({ bundle }: { bundle: DashboardBundle }) {
  const etab = bundle.etablissement;
  const regs = regimes(etab);
  const naf = etab.codeNaf ?? etab.entreprise.codeNaf;
  const ville = extraireVille(etab.adresse);
  const chiffreEffectif = String(etab.effectifSurSite).padStart(2, "0");

  return (
    <section
      aria-label="Identité de l'établissement"
      className="flex h-full flex-col overflow-hidden rounded-[14px] border border-[color:var(--navy)]/20 bg-gradient-to-br from-[color:var(--navy)]/10 via-[color:var(--navy)]/4 to-[color:var(--warm)]/10 p-5 transition-colors hover:border-[color:var(--navy)]/35"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--navy)]/80">
            § Établissement
          </p>
          <p className="mt-2 truncate text-[1.15rem] font-semibold leading-[1.15] tracking-[-0.016em] text-ink">
            {etab.raisonDisplay}
          </p>
          <p className="mt-0.5 truncate text-[0.78rem] text-muted-foreground">
            {ville} · {etab.entreprise.raisonSociale}
          </p>
        </div>
        <Link
          href={`/etablissements/${etab.id}/modifier`}
          aria-label="Modifier la fiche établissement"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--navy)]/20 bg-paper-elevated/80 text-muted-foreground transition-colors hover:border-[color:var(--navy)]/40 hover:text-ink"
        >
          <Pencil aria-hidden className="h-3.5 w-3.5" />
        </Link>
      </header>

      <div className="mt-4 flex flex-1 items-center gap-5">
        <FacadeIllustration />
        <dl className="grid min-w-0 flex-1 grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-[0.76rem]">
          <Ligne
            label="Adresse"
            value={etab.adresse}
            truncate
          />
          <Ligne
            label="Effectif"
            value={
              <span>
                <span className="font-mono text-[0.82rem] tabular-nums text-ink">
                  {chiffreEffectif}
                </span>{" "}
                sur site
              </span>
            }
          />
          <Ligne
            label="NAF"
            value={
              <span className="font-mono tabular-nums tracking-[0.04em] text-ink">
                {naf}
              </span>
            }
          />
          {etab.entreprise.siret && (
            <Ligne
              label="SIRET"
              value={
                <span className="font-mono text-[0.7rem] tabular-nums tracking-[0.04em] text-ink">
                  {etab.entreprise.siret}
                </span>
              }
            />
          )}
        </dl>
      </div>

      {regs.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-dashed border-[color:var(--navy)]/15 pt-3">
          {regs.map((r) => (
            <span key={r} className="pill-v2 pill-v2-navy-soft">
              {r}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[0.72rem] leading-snug text-muted-foreground">
          Un doute sur une obligation ?
        </p>
        <button
          type="button"
          disabled
          aria-disabled
          title="Bientôt disponible"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--navy)]/25 bg-paper-elevated/70 px-3 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--navy)] transition-colors hover:border-[color:var(--navy)]/45 hover:bg-paper-elevated disabled:cursor-not-allowed"
        >
          <Phone aria-hidden className="h-3 w-3" />
          Contacter un expert
        </button>
      </div>
    </section>
  );
}

function Ligne({
  label,
  value,
  truncate,
}: {
  label: string;
  value: React.ReactNode;
  truncate?: boolean;
}) {
  return (
    <>
      <dt className="self-center whitespace-nowrap font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`self-center min-w-0 text-muted-foreground ${
          truncate ? "truncate" : ""
        }`}
      >
        {value}
      </dd>
    </>
  );
}

function FacadeIllustration() {
  return (
    <svg
      viewBox="0 0 128 120"
      className="h-[128px] w-[136px] shrink-0 text-[color:var(--navy)]"
      aria-hidden
      fill="none"
    >
      <circle cx="104" cy="22" r="3.5" fill="var(--warm)" opacity="0.95" />
      <line x1="99" y1="22" x2="95" y2="22" stroke="var(--warm)" strokeWidth="0.7" opacity="0.75" />
      <line x1="109" y1="22" x2="113" y2="22" stroke="var(--warm)" strokeWidth="0.7" opacity="0.75" />
      <line x1="104" y1="17" x2="104" y2="14" stroke="var(--warm)" strokeWidth="0.7" opacity="0.75" />
      <line x1="104" y1="27" x2="104" y2="30" stroke="var(--warm)" strokeWidth="0.7" opacity="0.75" />

      <path d="M 20 42 L 64 24 L 108 42" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <rect x="24" y="42" width="80" height="60" stroke="currentColor" strokeWidth="1.2" fill="var(--paper-elevated)" />

      <rect x="32" y="50" width="12" height="12" stroke="currentColor" strokeWidth="0.9" />
      <line x1="38" y1="50" x2="38" y2="62" stroke="currentColor" strokeWidth="0.4" opacity="0.45" />
      <line x1="32" y1="56" x2="44" y2="56" stroke="currentColor" strokeWidth="0.4" opacity="0.45" />

      <rect x="58" y="50" width="12" height="12" stroke="currentColor" strokeWidth="0.9" />
      <line x1="64" y1="50" x2="64" y2="62" stroke="currentColor" strokeWidth="0.4" opacity="0.45" />
      <line x1="58" y1="56" x2="70" y2="56" stroke="currentColor" strokeWidth="0.4" opacity="0.45" />

      <rect x="84" y="50" width="12" height="12" stroke="currentColor" strokeWidth="0.9" />
      <line x1="90" y1="50" x2="90" y2="62" stroke="currentColor" strokeWidth="0.4" opacity="0.45" />
      <line x1="84" y1="56" x2="96" y2="56" stroke="currentColor" strokeWidth="0.4" opacity="0.45" />

      <rect x="24" y="68" width="80" height="3" fill="var(--warm)" opacity="0.85" />

      <rect x="32" y="76" width="14" height="26" stroke="currentColor" strokeWidth="1" />
      <line x1="32" y1="88" x2="46" y2="88" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />

      <rect x="55" y="74" width="18" height="28" stroke="currentColor" strokeWidth="1.1" fill="var(--paper-elevated)" />
      <line x1="64" y1="74" x2="64" y2="102" stroke="currentColor" strokeWidth="0.55" opacity="0.5" />
      <circle cx="60" cy="89" r="0.8" fill="currentColor" opacity="0.6" />
      <circle cx="68" cy="89" r="0.8" fill="currentColor" opacity="0.6" />

      <rect x="82" y="76" width="14" height="26" stroke="currentColor" strokeWidth="1" />
      <line x1="82" y1="88" x2="96" y2="88" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />

      <line x1="4" y1="102" x2="124" y2="102" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M 6 108 L 16 108 M 22 108 L 32 108 M 38 108 L 48 108 M 54 108 L 64 108 M 70 108 L 80 108 M 86 108 L 96 108 M 102 108 L 112 108 M 118 108 L 124 108"
        stroke="currentColor"
        strokeWidth="0.4"
        opacity="0.35"
      />
    </svg>
  );
}
