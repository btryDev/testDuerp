"use client";

// AIDE D'ÉCRAN — le bouton « ? » d'une page et sa modal.
//
// Chaque écran de Rojer a des choses à expliquer une fois — d'où viennent
// les données, ce que comptent les compteurs, quel article fonde
// l'obligation. Posées en texte courant au-dessus du contenu, ces
// explications coûtent leur hauteur à chaque visite alors qu'on ne les
// lit qu'à la première ; le calendrier ouvrait sur trois lignes et deux
// badges avant sa première barre. Elles vivent donc derrière un « ? »,
// et ce composant est le motif commun : les autres pages rangeront leurs
// notes au même endroit.
//
// La modal reste volontairement bête : pas de portail, pas de pile de
// modales, pas de gestion de focus-trap complète — un écran d'aide est un
// texte qu'on ouvre et qu'on ferme. Échap ferme, le fond ferme, le focus
// arrive sur le panneau pour que le clavier et les lecteurs d'écran y
// entrent directement.

import { useEffect, useId, useRef, useState } from "react";
import { HelpCircle, X } from "lucide-react";

export function AideEcran({
  titre,
  children,
}: {
  /** Titre de la modal — « Comment lire cette page », le plus souvent. */
  titre: string;
  children: React.ReactNode;
}) {
  const [ouvert, setOuvert] = useState(false);
  const titreId = useId();
  const panneau = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ouvert) return;
    panneau.current?.focus();
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };
    document.addEventListener("keydown", surTouche);
    return () => document.removeEventListener("keydown", surTouche);
  }, [ouvert]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        aria-haspopup="dialog"
        aria-label={titre}
        title={titre}
        className="flex size-[34px] flex-none items-center justify-center rounded-full bg-[color:var(--board-card)] text-[color:var(--board-slate-mid)] shadow-[0_0_0_1px_rgba(13,18,36,.08)] transition-colors hover:bg-[color:var(--board-blue-pale)] hover:text-[color:var(--board-blue-ink)]"
      >
        <HelpCircle className="size-[18px]" />
      </button>

      {ouvert ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titreId}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            aria-hidden
            onClick={() => setOuvert(false)}
            className="absolute inset-0 bg-[rgba(10,10,10,.35)]"
          />
          <div
            ref={panneau}
            tabIndex={-1}
            className="relative max-h-[85vh] w-full max-w-[600px] overflow-y-auto rounded-[26px] bg-[color:var(--board-card)] p-7 shadow-[0_0_0_1px_rgba(13,18,36,.06),0_24px_60px_-24px_rgba(13,18,36,.45)] outline-none"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="board-eyebrow m-0">Comprendre</p>
                <h2 id={titreId} className="board-titre m-0 mt-2 text-[22px]">
                  {titre}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOuvert(false)}
                aria-label="Fermer"
                className="flex size-8 flex-none items-center justify-center rounded-full text-[color:var(--board-slate-mid)] shadow-[inset_0_0_0_1px_rgba(10,10,10,.14)] transition-colors hover:bg-[color:var(--board-slate-pale)] hover:text-[color:var(--board-ink)]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-4 text-[13.5px] leading-[1.65] text-[color:var(--board-slate-ink)]">
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
