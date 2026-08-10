"use client";

// Carte-mois repliable de la liste du calendrier. Un mois chargé (au
// moins une poignée de lignes) arrive replié : l'en-tête suffit — le
// nom, le compte, et le rouge éventuel — et le chevron déplie le
// détail. Les mois courts restent ouverts d'emblée.

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function SectionMois({
  titre,
  nb,
  nbEnRetard = 0,
  defautOuvert,
  children,
}: {
  titre: string;
  nb: number;
  /** Lignes en alerte du mois — affichées sur l'en-tête même replié. */
  nbEnRetard?: number;
  defautOuvert: boolean;
  children: React.ReactNode;
}) {
  const [ouvert, setOuvert] = useState(defautOuvert);

  return (
    <section className="rounded-[30px] bg-[color:var(--board-card)] px-7 py-[26px] shadow-[0_1px_2px_rgba(13,18,36,.04),0_12px_32px_-14px_rgba(13,18,36,.10)] ring-1 ring-[color:rgba(13,18,36,.06)]">
      {/* Le bouton vit DANS le h2 (l'inverse est du HTML invalide — un
          bouton n'accepte que du contenu phrasé) : le plan de titres
          reste propre, et tout l'en-tête est cliquable au clavier. */}
      <h2 className="m-0">
        <button
          type="button"
          onClick={() => setOuvert((o) => !o)}
          aria-expanded={ouvert}
          className="flex w-full items-center gap-3 text-left"
        >
          <span className="text-[22px] font-semibold capitalize leading-[1.1] tracking-[-0.03em] text-[color:var(--board-ink)]">
            {titre}
          </span>
          <span className="inline-block rounded-full bg-[color:var(--board-blue-pale)] px-[13px] py-[6px] text-[12px] font-semibold text-[color:var(--board-blue-ink)]">
            {nb} ce mois-ci
          </span>
          {nbEnRetard > 0 ? (
            <span className="inline-block rounded-full bg-[color:var(--board-signal)] px-[13px] py-[6px] text-[12px] font-semibold text-[color:var(--board-signal-ink)]">
              {nbEnRetard} en retard
            </span>
          ) : null}
          <span
            aria-hidden
            className={
              "ml-auto flex size-8 flex-none items-center justify-center rounded-full border border-[color:rgba(10,10,10,.16)] text-[color:var(--board-ink)] transition-transform " +
              (ouvert ? "rotate-180" : "")
            }
          >
            <ChevronDown className="size-4" />
          </span>
        </button>
      </h2>

      {ouvert ? children : null}
    </section>
  );
}
