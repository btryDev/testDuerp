"use client";

import { Printer } from "lucide-react";

/**
 * Bouton Imprimer — appelle window.print() pour la topbar du guide.
 * Client component car window n'existe pas en SSR.
 */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-transparent px-3 py-1.5 text-[0.8rem] text-ink transition-colors hover:border-ink"
    >
      <Printer aria-hidden className="size-3.5" />
      Imprimer
    </button>
  );
}
