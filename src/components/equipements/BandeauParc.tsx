// Le bandeau d'encre en tête du parc.
//
// La page Équipements s'ouvrait sur un titre nu et un inventaire : elle
// disait ce qu'on possède, jamais où l'on en est. Les trois chiffres
// portés ici — retards, échéances sous trente jours, taille du parc —
// sont ceux que le dirigeant vient chercher avant de descendre dans la
// liste, et ils reprennent les champs d'état du board pour se lire sans
// être comptés (rose = retard, jaune = proche).
//
// Ils ne certifient rien : ce sont des faits datés, pas un score de
// conformité.

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Tuile({
  nombre,
  legende,
  champ,
  encre,
  // Le chiffre est noir sur les champs saturés (le blanc n'y tient pas :
  // 2,0 de contraste sur le rose) et blanc sur le voile translucide.
  encreNombre = "var(--board-ink)",
}: {
  nombre: number;
  legende: string;
  champ: string;
  encre: string;
  encreNombre?: string;
}) {
  return (
    <div
      className="min-w-[150px] flex-1 rounded-[22px] px-5 pb-4 pt-[18px]"
      style={{ background: champ }}
    >
      <p
        className="board-titre m-0 text-[44px] leading-none tabular-nums"
        style={{ color: encreNombre }}
      >
        {nombre}
      </p>
      <p
        className="board-eyebrow m-0 mt-2.5 text-[10px] tracking-[0.14em]"
        style={{ color: encre }}
      >
        {legende}
      </p>
    </div>
  );
}

export function BandeauParc({
  enRetard,
  proches,
  total,
  hrefAjouter,
  suggestions,
}: {
  enRetard: number;
  proches: number;
  total: number;
  hrefAjouter: string;
  /** Ce que le référentiel propose encore de déclarer, et où le lire. */
  suggestions?: { nombre: number; href: string } | null;
}) {
  return (
    <section className="carte-board overflow-hidden bg-[color:var(--board-ink)] text-white">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6 px-7 pb-8 pt-9 sm:px-10">
        <div className="max-w-[560px]">
          <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-blue-soft)]">
            Mon établissement · Équipements
          </p>
          <h1 className="board-titre m-0 mt-2.5 text-[clamp(28px,3vw,40px)] text-white">
            Le parc,{" "}
            <span
              className="accent-serif"
              style={{ color: "var(--board-sky)" }}
            >
              pièce par pièce
            </span>
          </h1>
          <p className="m-0 mt-3.5 text-[15px] leading-[1.5] text-white/70">
            Chaque équipement porte ses vérifications, ses rapports et ses
            actions. Sa fiche raconte ce qui a été fait et ce qui reste à
            faire.
          </p>
        </div>

        <div className="flex flex-none flex-wrap gap-3.5">
          <Tuile
            nombre={enRetard}
            legende="En retard"
            champ="var(--board-signal)"
            encre="var(--board-signal-ink)"
          />
          <Tuile
            nombre={proches}
            legende="Sous 30 jours"
            champ="var(--board-amber)"
            encre="var(--board-amber-ink)"
          />
          <Tuile
            nombre={total}
            legende={total > 1 ? "Équipements" : "Équipement"}
            champ="rgba(255,255,255,.1)"
            encre="var(--board-blue-soft)"
            encreNombre="#ffffff"
          />
        </div>
      </div>

      <div className="mx-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/12 pb-6 pt-[18px] sm:mx-10">
        <p className="m-0 max-w-[62ch] text-[13px] leading-[1.5] text-white/60">
          {suggestions && suggestions.nombre > 0 ? (
            <>
              D&apos;après votre secteur et vos régimes, {suggestions.nombre}{" "}
              catégorie{suggestions.nombre > 1 ? "s" : ""} d&apos;équipement
              reste{suggestions.nombre > 1 ? "nt" : ""} à examiner.{" "}
              <Link
                href={suggestions.href}
                className="font-semibold text-[color:var(--board-sky)] hover:text-white"
              >
                Voir les suggestions →
              </Link>
            </>
          ) : (
            <>
              Un équipement déclaré ici génère ses obligations et son
              calendrier. Un équipement oublié n&apos;en génère aucune.
            </>
          )}
        </p>
        <Link
          href={hrefAjouter}
          className={cn(
            buttonVariants({
              variant: "boardBlanc",
              size: "board",
              className: "flex-none",
            }),
          )}
        >
          + Ajouter un équipement
        </Link>
      </div>
    </section>
  );
}
