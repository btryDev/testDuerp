"use client";

// Apparition au défilement. L'observateur pose lui-même l'attribut sur le
// nœud puis se débranche : pas d'état React, pas de rendu supplémentaire,
// et rien ne rejoue au retour en arrière — c'est ce qui distingue une page
// qui se pose d'une page qui clignote.
// `prefers-reduced-motion` est traité en CSS (.lp-reveal) : même sans JS,
// le contenu reste lisible.

import { useEffect, useRef } from "react";

export function Reveal({
  children,
  delai = 0,
  className,
  as: Balise = "div",
}: {
  children: React.ReactNode;
  /** Décalage de l'apparition, en ms — pour cascader une rangée. */
  delai?: number;
  className?: string;
  as?: "div" | "li" | "section" | "header";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Sans IntersectionObserver (très vieux navigateur), on montre tout.
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.vu = "true";
      return;
    }
    const obs = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.vu = "true";
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Balise
      // @ts-expect-error — ref polymorphe sur un jeu de balises fermé.
      ref={ref}
      data-vu="false"
      style={delai ? ({ "--lp-delai": `${delai}ms` } as React.CSSProperties) : undefined}
      className={"lp-reveal" + (className ? " " + className : "")}
    >
      {children}
    </Balise>
  );
}
