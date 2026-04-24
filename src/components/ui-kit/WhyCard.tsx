import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * « Pourquoi je dois faire ça ? »
 * Carte pédagogique à poser en tête de page ou de section. Objectif :
 * un dirigeant non-expert comprend en 10 secondes d'où vient l'obligation,
 * ce qu'il risque, et ce qu'on va lui demander.
 */
export function WhyCard({
  kicker = "Pourquoi",
  titre,
  enjeu,
  children,
  tonalite = "info",
  className,
}: {
  kicker?: string;
  titre: string;
  /** Phrase courte type « Vous risquez {X} si vous ne faites pas {Y}. » */
  enjeu?: string;
  children?: ReactNode;
  /** info = navy, alerte = minium, ok = vert */
  tonalite?: "info" | "alerte" | "ok";
  className?: string;
}) {
  const accent: Record<typeof tonalite, string> = {
    info: "border-l-[color:var(--warm)] before:bg-[color:var(--warm)]",
    alerte: "border-l-[color:var(--minium)] before:bg-[color:var(--minium)]",
    ok: "border-l-[color:var(--accent-vif)] before:bg-[color:var(--accent-vif)]",
  };

  return (
    <section
      className={cn(
        "relative rounded-2xl border border-[color:var(--rule-soft)] border-l-4 bg-[color:var(--paper-elevated)] p-6 shadow-[0_1px_0_0_var(--rule-soft)]",
        accent[tonalite],
        className,
      )}
    >
      <div className="g-kicker mb-2">{kicker}</div>
      <h2 className="display-lg text-[1.35rem] text-[color:var(--ink)]">
        {titre}
      </h2>
      {enjeu && (
        <p className="mt-3 text-[0.95rem] leading-relaxed text-[color:var(--ink)]">
          <span className="accent-serif text-[color:var(--warm)]">→</span>{" "}
          {enjeu}
        </p>
      )}
      {children && (
        <div className="mt-4 text-[0.9rem] leading-relaxed text-[color:var(--muted-foreground)]">
          {children}
        </div>
      )}
    </section>
  );
}
