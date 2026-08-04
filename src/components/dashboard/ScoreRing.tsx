"use client";

// Anneau SVG animé — indicateur de conformité globale.
// Anime le compteur de 0 à `value` via requestAnimationFrame, easing cubic.
// Taille paramétrable, rendu en pixel ratio stable.

import { useEffect, useRef, useState } from "react";

export function ScoreRing({
  value,
  size = 140,
  label = "À jour",
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const [v, setV] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setV(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 1400;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setV(Math.round(eased * value));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, prefersReducedMotion]);

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = (v / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Score de conformité ${value}%`}
    >
      <svg viewBox="0 0 140 140" className="h-full w-full">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="var(--rule-soft)"
          strokeWidth="8"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="var(--accent-vif)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${offset} ${circumference}`}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray 80ms" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <div className="text-[2rem] font-semibold leading-none tracking-[-0.03em]">
          {v}
          <span className="ml-0.5 text-[0.9em] text-[color:var(--accent-vif)]">
            %
          </span>
        </div>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

function usePrefersReducedMotion() {
  const ref = useRef(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    ref.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}
