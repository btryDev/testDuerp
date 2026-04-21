import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

/**
 * État vide pédagogique. Objectif pour un dirigeant non-expert :
 *   - expliquer **à quoi sert** le module (pourquoi je suis ici)
 *   - suggérer **quoi faire maintenant** (une action claire)
 *   - éviter d'inquiéter (pas d'icône "warning" alarmiste)
 *
 * L'illustration est discrète (motif géométrique en SVG) pour rester
 * dans l'esthétique papier sans introduire d'iconographie lourde.
 */

export function EmptyState({
  titre,
  pourquoi,
  quoiFaire,
  cta,
  ctaHref,
  ctaSecondary,
  variant = "neutral",
}: {
  titre: string;
  pourquoi: string;
  quoiFaire: string;
  cta?: string;
  ctaHref?: string;
  ctaSecondary?: { libelle: string; href: string };
  variant?: "neutral" | "info";
}) {
  return (
    <div className="cartouche relative overflow-hidden px-6 py-10 sm:px-10 sm:py-12">
      {/* Motif discret en arrière-plan — cohérent papier */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-10 h-56 w-56 opacity-[0.06]"
        viewBox="0 0 200 200"
      >
        <defs>
          <pattern
            id="empty-dots"
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#empty-dots)" />
      </svg>

      <div className="relative max-w-xl space-y-4">
        <p
          className={
            "font-mono text-[0.62rem] uppercase tracking-[0.18em] " +
            (variant === "info" ? "text-indigo-700" : "text-muted-foreground")
          }
        >
          À quoi sert cette page
        </p>
        <h3 className="text-[1.1rem] font-semibold tracking-[-0.01em] leading-snug">
          {titre}
        </h3>
        <p className="text-[0.88rem] leading-relaxed text-muted-foreground">
          {pourquoi}
        </p>
        <p className="text-[0.9rem] leading-relaxed">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
            Pour commencer —
          </span>{" "}
          {quoiFaire}
        </p>

        {(cta || ctaSecondary) && (
          <div className="flex flex-wrap gap-3 pt-2">
            {cta && ctaHref && (
              <Link
                href={ctaHref}
                className={buttonVariants({ size: "sm" })}
              >
                {cta}
              </Link>
            )}
            {ctaSecondary && (
              <Link
                href={ctaSecondary.href}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {ctaSecondary.libelle}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
