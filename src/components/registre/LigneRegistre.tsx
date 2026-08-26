// Une fiche du registre, vue depuis la liste.
//
// Le registre dépliait ses 49 fiches d'un bloc, formulaires ouverts compris :
// on descendait vingt écrans pour atteindre les événements, et un formulaire
// déplié repoussait tout le reste. Ici chaque fiche est une ligne, et
// s'ouvre sur sa propre page — le motif du calendrier et du parc
// d'équipements, où l'on choisit avant d'entrer.
//
// La ligne dit trois choses et pas une de plus : ce qu'est la fiche, où elle
// en est, et qu'on peut l'ouvrir. Ce qu'elle attend en détail se lit dans la
// fiche, pas dans la liste — une liste où chaque entrée s'explique n'est
// plus une liste.

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Completude } from "./completude";
import { PastilleCompletude } from "./PastilleCompletude";

export function LigneRegistre({
  titre,
  href,
  completude,
}: {
  titre: string;
  href: string;
  completude: Completude;
}) {
  return (
    <Link
      href={href}
      className="-mx-3 flex items-center gap-4 rounded-[20px] px-3 py-3 transition-colors hover:bg-[color:var(--board-slate-pale)]"
    >
      <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold leading-[1.3] tracking-[-0.015em] text-[color:var(--board-ink)]">
        {titre}
      </span>
      <PastilleCompletude completude={completude} className="flex-none" />
      <ChevronRight
        aria-hidden
        className="size-4 flex-none text-[color:var(--board-slate-soft)]"
      />
    </Link>
  );
}

/**
 * Un groupe de fiches sous son numéro de partie.
 *
 * Le numéro est celui du registre imprimé (1, 2.1, 3.4) : il n'est pas
 * décoratif, c'est la référence que citera un inspecteur. Il reste donc
 * visible, et à sa place — devant le titre de la partie, jamais recopié sur
 * chaque fiche du groupe.
 */
export function PartieRegistre({
  numero,
  titre,
  children,
}: {
  numero: string;
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="carte-board px-7 py-6 sm:px-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="board-eyebrow m-0 text-[10.5px] tabular-nums tracking-[0.18em] text-[color:var(--board-slate-soft)]">
          {numero}
        </span>
        <h2 className="board-titre m-0 text-[17px]">{titre}</h2>
      </div>
      <div className="mt-3 flex flex-col">{children}</div>
    </section>
  );
}
