"use client";

// « Par métier » — la preuve que l'outil sait de quoi il parle.
// Les lignes viennent du référentiel de conformité, pas d'un texte de
// vitrine : intitulé réglementaire, article cité, périodicité. Le nom
// court est là pour qu'on s'y retrouve ; le reste est vérifiable.

import Link from "next/link";
import { useRef, useState } from "react";
import type { Metier } from "@/lib/landing/metiers";

export function ParMetier({
  metiers,
  ctaHref,
}: {
  metiers: Metier[];
  ctaHref: string;
}) {
  const [actif, setActif] = useState(0);
  const onglets = useRef<(HTMLButtonElement | null)[]>([]);
  const metier = metiers[actif];

  const auClavier = (e: React.KeyboardEvent) => {
    const suivant =
      e.key === "ArrowRight"
        ? (actif + 1) % metiers.length
        : e.key === "ArrowLeft"
          ? (actif - 1 + metiers.length) % metiers.length
          : null;
    if (suivant === null) return;
    e.preventDefault();
    setActif(suivant);
    onglets.current[suivant]?.focus();
  };

  return (
    <section
      id="metiers"
      className="bg-[color:var(--board-canvas)] py-20 sm:py-28"
    >
      <div className="lp-shell grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.25fr] lg:gap-16">
        <div>
          <p className="lp-eyebrow">Par métier</p>
          <h2 className="lp-titre lp-h2 mt-4 max-w-[14ch]">
            Les mêmes textes, pas les mêmes obligations
          </h2>
          <p className="lp-lede mt-5 max-w-[38ch]">
            Une cuisine, une boutique et un bureau ne relèvent pas des mêmes
            articles. Choisissez votre activité : voici ce qui vous attend.
          </p>
          <p className="lp-texte mt-6 max-w-[38ch] text-[color:var(--board-blue-ink)]">
            {metier.note}
          </p>
          <Link href={ctaHref} className="lp-btn lp-btn-ink mt-8">
            Voir mes obligations
            <span className="lp-fleche" aria-hidden>
              →
            </span>
          </Link>
          <p className="mt-6 max-w-[36ch] font-mono text-[0.68rem] uppercase leading-[1.7] tracking-[0.12em] text-[color:var(--board-slate-soft)]">
            Périodicités indicatives — Rojer les ajuste à vos équipements réels
            après déclaration.
          </p>
        </div>

        <div>
          <div
            role="tablist"
            aria-label="Choisir une activité"
            onKeyDown={auClavier}
            className="flex flex-wrap gap-2"
          >
            {metiers.map((m, i) => (
              <button
                key={m.id}
                ref={(el) => {
                  onglets.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`onglet-${m.id}`}
                aria-selected={i === actif}
                aria-controls={`panneau-${m.id}`}
                tabIndex={i === actif ? 0 : -1}
                onClick={() => setActif(i)}
                className={
                  "rounded-full px-4 py-2 text-[0.85rem] font-medium transition-colors " +
                  (i === actif
                    ? "bg-[color:var(--board-ink)] text-white"
                    : "bg-[color:var(--board-card)] text-[color:var(--board-slate-mid)] hover:text-[color:var(--board-ink)]")
                }
              >
                {m.label}
              </button>
            ))}
          </div>

          <ol
            role="tabpanel"
            id={`panneau-${metier.id}`}
            aria-labelledby={`onglet-${metier.id}`}
            className="m-0 mt-6 flex list-none flex-col p-0"
          >
            {metier.lignes.map((l, i) => (
              <li
                key={l.nom + i}
                className="flex items-start gap-4 border-t border-[rgba(10,10,10,.09)] py-4 first:border-t-0 sm:gap-5"
              >
                <span className="mt-0.5 flex size-8 flex-none items-center justify-center rounded-full bg-[color:var(--board-blue-pale)] font-mono text-[0.68rem] font-medium text-[color:var(--board-blue-ink)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.95rem] font-semibold tracking-[-0.015em] text-[color:var(--board-ink)]">
                    {l.nom}
                  </p>
                  <p className="mt-1 text-[0.8rem] leading-[1.5] text-[color:var(--board-slate-mid)]">
                    {l.libelle}
                  </p>
                  {l.reference ? (
                    // Casse d'origine : une référence légale se cite telle
                    // qu'elle s'écrit — « art. MS 38 § 2 », pas en capitales.
                    <p className="mt-1.5 font-mono text-[0.68rem] tracking-[0.02em] text-[color:var(--board-blue-ink)]">
                      {l.reference}
                    </p>
                  ) : null}
                </div>
                <span className="mt-1 flex-none font-mono text-[0.7rem] lowercase tracking-[0.04em] text-[color:var(--board-slate-ink)]">
                  {l.rythme}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
