"use client";

import { useState } from "react";

/**
 * Bloc de configuration à recopier, avec bouton de copie.
 *
 * Le contenu affiché est aussi le contenu copié — pas de version « propre »
 * reconstituée au clic : ce qui est lu à l'écran est ce qui atterrit dans le
 * presse-papiers.
 */
export function BlocConfig({
  titre,
  contenu,
  langue = "json",
}: {
  titre: string;
  contenu: string;
  /** Étiquette affichée en tête du bloc (json, shell…). */
  langue?: string;
}) {
  const [copie, setCopie] = useState(false);

  async function copier() {
    try {
      await navigator.clipboard.writeText(contenu);
      setCopie(true);
      setTimeout(() => setCopie(false), 1500);
    } catch {
      // Presse-papiers refusé (contexte non sécurisé, permission) : le bloc
      // reste sélectionnable à la main, on ne prétend pas avoir copié.
      setCopie(false);
    }
  }

  return (
    <figure className="cartouche-sunk overflow-hidden p-0">
      <figcaption className="flex items-center justify-between gap-4 border-b border-dashed border-rule/60 px-5 py-3">
        <span className="label-admin">{titre}</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
            {langue}
          </span>
          <button
            type="button"
            onClick={copier}
            className="rounded-md border border-[color:var(--rule)] px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-colors hover:bg-[color:var(--paper-elevated)]"
          >
            {copie ? "Copié ✓" : "Copier"}
          </button>
        </div>
      </figcaption>
      <pre className="overflow-x-auto px-5 py-4 font-mono text-[0.78rem] leading-relaxed">
        {contenu}
      </pre>
    </figure>
  );
}
