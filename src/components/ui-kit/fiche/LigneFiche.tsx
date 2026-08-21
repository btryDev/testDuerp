// La ligne d'une liste du board — une tuile-date, ce qu'elle annonce, et
// le geste offert à droite.
//
// Elle vivait recopiée dans chaque carte : le calendrier, les rapports
// d'une vérification, l'historique d'un ticket. Trois copies d'un même
// objet, dont les gouttières avaient déjà divergé de quelques pixels. La
// tenir ici, à côté de `CarteFiche`, garde la liste et la fiche cousues :
// on clique une ligne, on ouvre une fiche dont la tête est la même ligne
// en plus grand.

import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Voile de fond d'une ligne qui appelle un geste. Il double la tuile-date
 * plutôt que de la remplacer : sur une liste longue, la seule tuile se
 * perd, mais un aplat saturé ferait de chaque échéance une alerte.
 */
const VOILE = {
  retard: "bg-[color:var(--board-signal-wash)]",
  proche: "bg-[color:var(--board-amber-wash)]",
  aucun: "",
} as const;

export function LigneFiche({
  tuile,
  surtitre,
  titre,
  detail,
  droite,
  href,
  voile = "aucun",
}: {
  /** La tuile-date, ou tout autre repère de gauche. */
  tuile?: ReactNode;
  surtitre?: ReactNode;
  titre: ReactNode;
  detail?: ReactNode;
  /** Ce que la ligne propose : une pastille, un bouton, un chevron. */
  droite?: ReactNode;
  /**
   * Rend la ligne entière cliquable. Sans href, la ligne reste inerte —
   * un `droite` peut alors porter son propre lien.
   */
  href?: string;
  voile?: keyof typeof VOILE;
}) {
  const contenu = (
    <>
      {tuile}
      <span className="min-w-0 flex-1">
        {surtitre ? (
          <span className="board-eyebrow m-0 block text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
            {surtitre}
          </span>
        ) : null}
        <span
          className={
            "block text-[16px] font-semibold leading-[1.3] tracking-[-0.01em] text-[color:var(--board-ink)]" +
            (surtitre ? " mt-1.5" : "")
          }
        >
          {titre}
        </span>
        {detail ? (
          <span className="mt-1 block text-[12.5px] leading-[1.45] text-[color:var(--board-slate-mid)]">
            {detail}
          </span>
        ) : null}
      </span>
      {droite ? <span className="flex-none">{droite}</span> : null}
    </>
  );

  const classes =
    "flex items-center gap-5 border-t border-[color:var(--board-slate-line)] px-7 py-4 first:border-t-0 sm:px-8 " +
    VOILE[voile];

  return (
    <li className={href ? "" : classes}>
      {href ? (
        <Link
          href={href}
          className={
            classes +
            " transition-colors hover:bg-[color:var(--board-slate-pale)]"
          }
        >
          {contenu}
        </Link>
      ) : (
        contenu
      )}
    </li>
  );
}

/** Enveloppe des lignes — la liste nue, sans puces ni marge. */
export function LignesFiche({ children }: { children: ReactNode }) {
  return <ul className="m-0 list-none p-0 pb-1.5">{children}</ul>;
}

/**
 * Le repère de gauche d'une ligne sans rendez-vous. Une occurrence « à
 * planifier » porte bien une date en base, mais c'est une date de
 * génération (ADR-010) : l'afficher en grand serait annoncer un rendez-vous
 * que personne n'a pris.
 */
export function TuileMuette({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-[50px] flex-none items-center justify-center rounded-[17px] bg-[color:var(--board-slate-pale)] text-center font-mono text-[9.5px] font-semibold uppercase leading-[1.2] tracking-[0.08em] text-[color:var(--board-slate-mid)]">
      {children}
    </span>
  );
}
