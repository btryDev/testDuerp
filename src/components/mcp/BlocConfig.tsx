"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Bloc de configuration à recopier, avec bouton de copie.
 *
 * Le contenu affiché est aussi le contenu copié — pas de version « propre »
 * reconstituée au clic : ce qui est lu à l'écran est ce qui atterrit dans le
 * presse-papiers.
 *
 * Sous-bloc creux de la charte board : c'est une surface en retrait dans la
 * page, pas une carte de plus.
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
    <figure className="m-0 overflow-hidden rounded-[22px] bg-[color:var(--board-slate-pale)] p-0">
      <figcaption className="flex items-center justify-between gap-4 border-b border-[color:var(--board-slate-line)] px-5 py-3">
        <span className="board-eyebrow m-0 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
          {titre}
        </span>
        <div className="flex items-center gap-3">
          <span className="board-eyebrow m-0 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
            {langue}
          </span>
          <button
            type="button"
            onClick={copier}
            className={cn(
              buttonVariants({ variant: "boardClair", size: "boardSm" }),
              "bg-[color:var(--board-card)]",
            )}
          >
            {copie ? "Copié ✓" : "Copier"}
          </button>
        </div>
      </figcaption>
      <pre className="m-0 overflow-x-auto px-5 py-4 font-mono text-[12.5px] leading-[1.6] text-[color:var(--board-ink)]">
        {contenu}
      </pre>
    </figure>
  );
}
