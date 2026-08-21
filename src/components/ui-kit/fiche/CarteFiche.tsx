// Les blocs d'une fiche de détail, en vocabulaire board.
//
// Ce qu'ils remplacent : le cartouche à filets pointillés et sa <dl> dont
// la valeur était poussée au bord droit — sur une carte de 1 100 px, l'œil
// traversait trente centimètres de vide entre « Échéance » et sa date. Ici
// la clé et la valeur restent voisines, et le filet est plein, comme
// partout ailleurs dans le board.

import type { ReactNode } from "react";

/**
 * Carte blanche à tête. La tête porte un sur-titre mono et, à droite, ce
 * que la section propose (un compteur, un bouton) — jamais un second
 * titre : deux niveaux de titrage dans une carte, c'est un de trop.
 */
export function CarteFiche({
  titre,
  titreFort,
  droite,
  children,
  className = "",
  corpsClassName = "",
}: {
  titre?: string;
  /**
   * Titre plein, quand la carte est un chapitre et non une rubrique : le
   * sur-titre mono suffit pour « Clôture » ou « État », il est trop discret
   * pour ouvrir une liste d'une dizaine de lignes. Les deux s'excluent —
   * deux niveaux de titrage dans une carte, c'est un de trop.
   */
  titreFort?: ReactNode;
  droite?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Pour les corps qui gèrent leur propre gouttière (grilles, listes). */
  corpsClassName?: string;
}) {
  return (
    <section className={"carte-board overflow-hidden " + className}>
      {titre || titreFort || droite ? (
        <div
          className={
            "flex flex-wrap gap-4 px-7 pt-6 sm:px-8 " +
            (titreFort
              ? "items-baseline justify-between"
              : "items-center justify-between")
          }
        >
          {titreFort ? (
            <h2 className="board-titre m-0 text-[22px]">{titreFort}</h2>
          ) : titre ? (
            <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">
              {titre}
            </p>
          ) : (
            <span />
          )}
          {droite}
        </div>
      ) : null}
      <div className={corpsClassName || "px-7 pb-7 pt-4 sm:px-8"}>
        {children}
      </div>
    </section>
  );
}

/**
 * Ligne clé / valeur. `alerte` teinte la valeur en encre de retard — la
 * seule couleur autorisée dans une ligne de champ, et seulement quand un
 * délai est dépassé.
 */
export function ChampFiche({
  cle,
  children,
  alerte = false,
}: {
  cle: string;
  children: ReactNode;
  alerte?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 border-t border-[color:var(--board-slate-line)] py-3.5 first:border-t-0 first:pt-0 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="flex-none text-[12.5px] text-[color:var(--board-slate-mid)] sm:w-[168px]">
        {cle}
      </dt>
      <dd
        className={
          "m-0 min-w-0 flex-1 text-[14px] leading-[1.45] " +
          (alerte
            ? "text-[color:var(--board-signal-ink)]"
            : "text-[color:var(--board-ink)]")
        }
      >
        {children}
      </dd>
    </div>
  );
}

/** Enveloppe des `ChampFiche` — une <dl>, pour que la sémantique suive. */
export function ChampsFiche({ children }: { children: ReactNode }) {
  return <dl className="m-0 flex flex-col">{children}</dl>;
}

/**
 * Cotation en cinq points. « 2 / 5 » demandait de convertir un chiffre en
 * gravité à chaque lecture ; cinq points se comparent d'une fiche à
 * l'autre sans être lus.
 */
export function Cotation({ valeur, sur = 5 }: { valeur: number; sur?: number }) {
  return (
    <span className="inline-flex items-center gap-3 align-middle">
      <span aria-hidden className="inline-flex items-center gap-[5px]">
        {Array.from({ length: sur }, (_, i) => (
          <span
            key={i}
            className="size-[9px] rounded-full"
            style={{
              background:
                i < valeur
                  ? "var(--board-signal-line)"
                  : "var(--board-slate-line)",
            }}
          />
        ))}
      </span>
      <span className="text-[12.5px] text-[color:var(--board-slate-mid)]">
        {valeur} sur {sur}
      </span>
    </span>
  );
}

/**
 * Le bloc creux — état vide, note, rappel. Remplace `cartouche-sunk` dans
 * les fiches : même rôle, jetons du board.
 */
export function BlocCreux({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-[22px] bg-[color:var(--board-slate-pale)] px-6 py-5 " +
        className
      }
    >
      {children}
    </div>
  );
}
