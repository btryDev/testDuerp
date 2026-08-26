// Dire au dirigeant que ce qu'il lit est incomplet.
//
// Un établissement hors périmètre n'est pas bloqué : il n'y a rien de
// dangereux à consulter ses équipements, et lui fermer la porte ne
// l'aiderait pas. Ce qui serait dangereux, c'est qu'il lise un calendrier et
// un registre d'apparence complète en ignorant qu'ils laissent de côté la
// moitié du règlement qui le vise. C'est cet écran-là qu'on présente à une
// commission.
//
// D'où un bandeau, et pas une note en pied de page : il se lit avant le
// contenu qu'il qualifie, sinon il arrive trop tard.
//
// Deux tons, jamais confondus. « Hors périmètre » est un fait établi et
// durable — encre signal. « Indéterminé » est une question ouverte dont la
// réponse appartient au dirigeant — ambre, et un geste à faire.

import Link from "next/link";
import { AlertTriangle, HelpCircle } from "lucide-react";
import type { Couverture } from "@/lib/perimetre/couverture";

export function BandeauCouverture({
  couverture,
  hrefEtablissement,
}: {
  couverture: Couverture;
  /** La fiche établissement, où se corrige ou se renseigne le régime. */
  hrefEtablissement: string;
}) {
  if (couverture.statut === "couvert") return null;

  const horsPerimetre = couverture.statut === "hors_perimetre";

  return (
    <section
      className="carte-board flex gap-4 px-7 py-5 sm:px-8"
      style={{
        background: horsPerimetre
          ? "var(--board-signal-wash)"
          : "var(--board-amber-wash)",
        boxShadow: `0 0 0 1px ${
          horsPerimetre ? "var(--board-signal-line)" : "var(--board-amber)"
        }`,
      }}
      role="note"
    >
      <span
        className="mt-0.5 flex-none"
        style={{
          color: horsPerimetre
            ? "var(--board-signal-ink)"
            : "var(--board-amber-ink)",
        }}
      >
        {horsPerimetre ? (
          <AlertTriangle aria-hidden className="size-[18px]" />
        ) : (
          <HelpCircle aria-hidden className="size-[18px]" />
        )}
      </span>

      <div className="min-w-0">
        <p
          className="m-0 text-[14px] font-semibold leading-[1.4] tracking-[-0.015em]"
          style={{
            color: horsPerimetre
              ? "var(--board-signal-ink)"
              : "var(--board-amber-ink)",
          }}
        >
          {couverture.motif}
        </p>
        <p className="m-0 mt-2 max-w-[68ch] text-[13.5px] leading-[1.6] text-[color:var(--board-slate-ink)]">
          {horsPerimetre ? couverture.consequence : couverture.quoiFaire}
        </p>
        <Link
          href={hrefEtablissement}
          className="mt-3 inline-block text-[12.5px] font-semibold text-[color:var(--board-blue-ink)] hover:text-[color:var(--board-ink)]"
        >
          {horsPerimetre
            ? "Vérifier le régime de l'établissement"
            : "Renseigner la catégorie"}
        </Link>
      </div>
    </section>
  );
}
