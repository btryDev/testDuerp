"use client";

// Un objet qui grandit pendant qu'on le remonte à l'écran : il entre un
// peu en retrait, atteint sa taille pleine quand il est bien en vue, et
// s'y arrête. Rien au-delà de 1 — on ne dépasse jamais la taille réelle,
// sinon le contenu se met à baver.
//
// La transformation ne change pas la hauteur réservée : la section garde
// sa place dès le départ, seul l'objet respire à l'intérieur. C'est ce
// qui évite que la page se réajuste pendant qu'on descend.
//
// `prefers-reduced-motion` sert directement la taille pleine.

import { useEffect, useRef, useState } from "react";

export function ZoomAuDefilement({
  children,
  depart = 0.9,
  className,
}: {
  children: React.ReactNode;
  /** Échelle à l'entrée dans l'écran. 1 = pas de zoom. */
  depart?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [echelle, setEchelle] = useState(depart);

  useEffect(() => {
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const mesurer = () => {
      frame = 0;
      // Mouvement réduit : taille pleine, tout de suite et pour de bon.
      if (reduit.matches) {
        setEchelle(1);
        return;
      }
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 quand le haut de l'objet pointe par le bas de l'écran ;
      // 1 quand il est remonté à un sixième du haut. La course est
      // volontairement longue : un zoom court se lit comme un à-coup.
      const p = (vh - rect.top) / (vh * 0.85);
      setEchelle(depart + (1 - depart) * Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(mesurer);
    };
    // Première mesure différée d'une frame : un setState synchrone dans
    // le corps de l'effet déclenche un rendu en cascade (et le
    // compilateur React le refuse).
    frame = requestAnimationFrame(mesurer);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [depart]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transform: `scale(${echelle})`, transformOrigin: "center" }}
    >
      {children}
    </div>
  );
}
