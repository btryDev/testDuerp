// Le bandeau du parc — clair, pleine largeur, bord à bord.
//
// Il portait un aplat d'encre : le noir posait une troisième bande sombre
// dans un parcours qui en compte déjà deux (la barre latérale, la bande du
// calendrier), et le titre éditorial qu'il portait n'apprenait rien.
// Celui-ci a la même charge que la bande du calendrier — d'où l'on vient,
// où l'on est, une phrase, ce que l'écran propose — mais sur papier.
//
// Les trois chiffres viennent de la même partition que l'en-tête du
// calendrier et le tableau de bord (`compterEtatCalendrier`) : trois
// écrans, un seul compte. Ils ne certifient rien, ce sont des faits datés.

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Compteur({
  nombre,
  legende,
  champ,
  encre,
}: {
  nombre: number;
  legende: string;
  champ: string;
  encre: string;
}) {
  return (
    <span
      className="inline-flex items-baseline gap-2 rounded-full px-4 py-[9px]"
      style={{ background: champ }}
    >
      <span className="board-titre text-[20px] leading-none tabular-nums">
        {nombre}
      </span>
      <span
        className="board-eyebrow text-[9.5px] tracking-[0.12em]"
        style={{ color: encre }}
      >
        {legende}
      </span>
    </span>
  );
}

export function BandeauParc({
  hrefRetour,
  enRetard,
  proches,
  total,
  hrefAjouter,
  suggestions,
}: {
  hrefRetour: string;
  enRetard: number;
  proches: number;
  total: number;
  hrefAjouter: string;
  /** Ce que le référentiel propose encore de déclarer, et où le lire. */
  suggestions?: { nombre: number; href: string } | null;
}) {
  return (
    <>
      <header className="border-b border-[color:var(--board-slate-line)] bg-[color:var(--board-card)] px-[var(--board-gutter)] py-[22px]">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
          <div className="flex min-w-0 items-start gap-4">
            <Link
              href={hrefRetour}
              aria-label="Retour à Mon établissement"
              className="grid size-8 flex-none place-items-center rounded-full bg-[color:var(--board-slate-pale)] text-[color:var(--board-slate-mid)] transition-colors hover:bg-[color:var(--board-blue-pale)] hover:text-[color:var(--board-blue-ink)]"
            >
              <ChevronLeft className="size-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="board-titre m-0 text-[clamp(22px,2.2vw,27px)]">
                Équipements
              </h1>
              <p className="m-0 mt-2 max-w-[68ch] text-[13.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
                Ce que vous avez, et où. Chaque appareil porte ses
                vérifications, ses rapports et ses papiers&nbsp;: ouvrez sa
                fiche pour les voir.
              </p>
            </div>
          </div>

          <div className="flex flex-none flex-wrap items-center gap-2.5">
            <Compteur
              nombre={enRetard}
              legende="en retard"
              champ="var(--board-signal)"
              encre="var(--board-signal-ink)"
            />
            <Compteur
              nombre={proches}
              legende="sous 30 j"
              champ="var(--board-amber)"
              encre="var(--board-amber-ink)"
            />
            <Compteur
              nombre={total}
              legende="au parc"
              champ="var(--board-slate-pale)"
              encre="var(--board-slate-mid)"
            />
            <Link
              href={hrefAjouter}
              className={cn(
                buttonVariants({
                  variant: "board",
                  size: "board",
                  className: "ml-1.5 flex-none",
                }),
              )}
            >
              + Ajouter un équipement
            </Link>
          </div>
        </div>
      </header>

      {suggestions && suggestions.nombre > 0 ? (
        <div className="flex items-center gap-2.5 border-b border-[color:var(--board-slate-line)] bg-[color:var(--board-slate-pale)] px-[var(--board-gutter)] py-[11px]">
          <span
            aria-hidden
            className="size-1.5 flex-none rounded-full bg-[color:var(--board-blue-mid)]"
          />
          <p className="m-0 text-[12.5px] text-[color:var(--board-slate-mid)]">
            D&rsquo;après votre secteur et vos régimes, {suggestions.nombre}{" "}
            catégorie{suggestions.nombre > 1 ? "s" : ""} d&rsquo;équipement
            reste{suggestions.nombre > 1 ? "nt" : ""} à examiner.{" "}
            <Link
              href={suggestions.href}
              className="font-semibold text-[color:var(--board-blue-ink)] hover:text-[color:var(--board-ink)]"
            >
              Voir les suggestions →
            </Link>
          </p>
        </div>
      ) : null}
    </>
  );
}
