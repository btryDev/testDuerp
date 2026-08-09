"use client";

// Grille annuelle des échéances — la vue la plus large du calendrier.
//
// Douze cartes-mois : le volume d'échéances et leur teinte, sans le
// détail des jours — pour repérer d'un coup d'œil les mois chargés.
// Purement présentationnelle : l'année affichée est pilotée par
// l'appelant, et le clic sur un mois lui est remonté pour ouvrir la
// grille mensuelle correspondante.

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  construireGrilleAnnee,
  type EvenementGrille,
} from "@/lib/calendrier/grille";
import { BoutonNav } from "./VueMois";

/** Nombre de points posés dans une carte-mois avant de replier en « +N ». */
const MAX_POINTS = 8;

// Mêmes teintes que les pastilles de la grille mensuelle : rouge pour le
// dépassé, gris pour l'à-planifier, bleu pour le programmé.
const TON_POINT: Record<EvenementGrille["tone"], string> = {
  alerte: "bg-[color:var(--board-signal-mark)]",
  warn: "bg-[color:var(--board-slate-soft)]",
  ok: "bg-[color:var(--board-blue-mid)]",
};

// Le dépassé d'abord : quand la place manque, c'est lui qu'on montre.
const ORDRE_TONS: EvenementGrille["tone"][] = ["alerte", "warn", "ok"];

export function VueAnnee({
  annee,
  evenements,
  aujourdhui,
  fenetre,
  onPrecedent,
  onSuivant,
  onChoisirMois,
  peutReculer = true,
  peutAvancer = true,
}: {
  annee: number;
  evenements: EvenementGrille[];
  aujourdhui: Date;
  /** Bornes de la période chargée : au-delà, il n'y a rien à montrer. */
  fenetre?: { debut: Date; fin: Date };
  onPrecedent: () => void;
  onSuivant: () => void;
  /** Clic sur une carte-mois : l'appelant ouvre la grille mensuelle. */
  onChoisirMois: (mois: Date) => void;
  peutReculer?: boolean;
  peutAvancer?: boolean;
}) {
  const grille = construireGrilleAnnee({
    annee,
    evenements,
    aujourdhui,
    fenetre,
  });

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <BoutonNav
          onClick={onPrecedent}
          label="Année précédente"
          actif={peutReculer}
        >
          <ChevronLeft className="size-4" />
        </BoutonNav>
        <p className="m-0 min-w-[168px] text-center text-[15px] font-semibold tracking-[-0.015em] text-[color:var(--board-ink)]">
          {grille.annee}
        </p>
        <BoutonNav
          onClick={onSuivant}
          label="Année suivante"
          actif={peutAvancer}
        >
          <ChevronRight className="size-4" />
        </BoutonNav>
        <p className="m-0 ml-auto text-[12.5px] text-[color:var(--board-slate-mid)]">
          {grille.nbEvenements === 0
            ? "Aucune échéance cette année"
            : `${grille.nbEvenements} échéance${grille.nbEvenements > 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
        {grille.mois.map((m) => {
          const points = ORDRE_TONS.flatMap((ton) =>
            Array.from({ length: m.nbParTon[ton] }, (_, i) => ({
              cle: `${ton}-${i}`,
              ton,
            })),
          ).slice(0, MAX_POINTS);
          const reste = m.nbTotal - points.length;
          return (
            <button
              key={m.mois.getMonth()}
              type="button"
              onClick={() => onChoisirMois(m.mois)}
              disabled={!m.dansFenetre}
              aria-label={
                `${m.libelle} ${grille.annee} — ` +
                (m.nbTotal === 0
                  ? "aucune échéance"
                  : `${m.nbTotal} échéance${m.nbTotal > 1 ? "s" : ""}`) +
                ", ouvrir le mois"
              }
              className={
                "flex min-h-[84px] flex-col rounded-[14px] p-2.5 text-left transition-shadow " +
                (m.estMoisCourant
                  ? "bg-[color:var(--board-blue-pale)] ring-1 ring-[color:var(--board-blue-mid)]"
                  : "bg-[color:var(--board-slate-pale)]") +
                (m.dansFenetre
                  ? " hover:ring-1 hover:ring-[color:var(--board-blue-mid)]"
                  : " cursor-not-allowed opacity-40")
              }
            >
              <span className="flex items-baseline justify-between gap-2">
                <span
                  className={
                    "text-[12.5px] font-semibold " +
                    (m.estMoisCourant
                      ? "text-[color:var(--board-blue-ink)]"
                      : "text-[color:var(--board-ink)]")
                  }
                >
                  {m.libelle}
                </span>
                {m.nbTotal > 0 ? (
                  <span className="text-[11px] font-semibold tabular-nums text-[color:var(--board-slate-mid)]">
                    {m.nbTotal}
                  </span>
                ) : null}
              </span>

              <span className="mt-auto flex flex-wrap items-center gap-1 pt-2">
                {points.map((p) => (
                  <span
                    key={p.cle}
                    className={"size-2 rounded-full " + TON_POINT[p.ton]}
                  />
                ))}
                {reste > 0 ? (
                  <span className="text-[10px] font-semibold text-[color:var(--board-slate-soft)]">
                    +{reste}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
