"use client";

// LA RÈGLE ANNUELLE — l'année du calendrier lue comme un instrument de
// mesure : douze graduations, une barre par mois, un curseur sur le mois
// ouvert.
//
// Deux dimensions, et elles ne disent pas la même chose :
//
//   - la **hauteur** dit le volume (combien d'échéances ce mois-là) ;
//   - la **couleur** dit l'état, et rien d'autre — dépassé, sous 30
//     jours, à venir, fait.
//
// Mélanger les deux (une teinte plus pâle pour dire « moins nombreux »)
// ferait lire un mois à venir comme un retard : c'est le piège de ce
// genre de graphique, et il est interdit ici. Un mois qui mêle plusieurs
// états empile ses segments, le plus urgent en bas.
//
// La règle remplace la pile de douze sections à dérouler : on vise un
// mois, on l'ouvre. Elle ne porte aucune donnée que la liste n'ait pas —
// c'est la même, vue de loin.

import { useId } from "react";
import { CHAMP_ETAT, type EtatEcheance } from "@/lib/calendrier/etats";

/** Un mois de la règle. Les quatre compteurs sont exclusifs entre eux. */
export type MoisRegle = {
  /** Clé `AAAA-MM`, celle des sections de la liste. */
  cle: string;
  /** Libellé court affiché sous la graduation (« Jan », « Fév »…). */
  label: string;
  /** Libellé long, pour les lecteurs d'écran (« janvier 2026 »). */
  labelLong: string;
  enRetard: number;
  proche: number;
  aVenir: number;
  /** Occurrences déjà réalisées — le mois n'est pas qu'une dette. */
  faite: number;
};

/** Hauteur de la barre la plus chargée, en pixels. */
const H_MAX = 92;
/**
 * Hauteur plancher d'un segment non vide. Sans elle, un mois à une seule
 * occurrence rend une barre de 2 px : l'instrument devient décoratif et
 * l'utilisateur ne voit pas ce qui l'attend. Le plancher fausse un peu
 * la proportion en bas d'échelle — c'est un prix accepté, la lisibilité
 * d'une échéance isolée compte plus que l'exactitude du rapport 1/19.
 */
const H_MIN_SEGMENT = 9;
/** Hauteur du trait d'un mois sans aucune échéance. */
const H_VIDE = 6;

type Segment = { cle: string; hauteur: number; fond: string };

/** Total d'un mois, tous états confondus. */
export function totalDuMois(m: MoisRegle): number {
  return m.enRetard + m.proche + m.aVenir + m.faite;
}

/**
 * Découpe la barre d'un mois en segments empilés. L'ordre de rendu va du
 * haut vers le bas : faite, à venir, proche, en retard — le plus urgent
 * porte la base, comme la pile d'une frise.
 */
function segmentsDuMois(m: MoisRegle, maxTotal: number): Segment[] {
  const total = totalDuMois(m);
  if (total === 0) return [];

  const parts = (
    [
      { cle: "faite", n: m.faite },
      { cle: "aVenir", n: m.aVenir },
      { cle: "proche", n: m.proche },
      { cle: "enRetard", n: m.enRetard },
    ] satisfies { cle: EtatEcheance; n: number }[]
  ).filter((p) => p.n > 0);

  // La hauteur visée suit la proportion, mais ne descend jamais sous le
  // plancher cumulé des segments qu'elle doit contenir.
  const proportionnelle = Math.round((total / maxTotal) * H_MAX);
  const plancher = parts.length * H_MIN_SEGMENT;
  const hauteur = Math.max(plancher, Math.min(H_MAX, proportionnelle));

  return parts.map((p) => ({
    cle: p.cle,
    fond: CHAMP_ETAT[p.cle],
    hauteur: Math.max(H_MIN_SEGMENT, Math.round((p.n / total) * hauteur)),
  }));
}

export function RegleAnnuelle({
  annee,
  mois,
  moisOuvert,
  onChoisirMois,
  total,
  sansDate,
  horsAnnee,
}: {
  annee: number;
  mois: MoisRegle[];
  /** Clé `AAAA-MM` du mois actuellement déplié, s'il est dans l'année. */
  moisOuvert: string | null;
  onChoisirMois: (cle: string) => void;
  /** Nombre d'échéances datées dans l'année couverte. */
  total: number;
  /** Occurrences sans date — hors règle par nature, jamais oubliées. */
  sansDate: number;
  /** Échéances datées en dehors de l'année affichée. */
  horsAnnee: number;
}) {
  const titreId = useId();
  const maxTotal = Math.max(1, ...mois.map(totalDuMois));

  return (
    <section
      aria-labelledby={titreId}
      className="flex flex-col"
    >
      {/* Une ligne de repères, pas un titre de carte : l'instrument est
          posé sur le canvas, il n'a plus à s'annoncer comme un objet.
          La clé de lecture se donne avant le graphique, jamais après —
          deux dimensions qui ne disent pas la même chose, ça s'annonce. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2
          id={titreId}
          className="m-0 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--board-slate-mid)]"
        >
          L&apos;année d&apos;un bloc · {total} échéance{total > 1 ? "s" : ""} en{" "}
          {annee}
        </h2>
        <p className="m-0 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--board-slate-soft)]">
          Hauteur = volume · couleur = état · cliquez un mois
        </p>
      </div>

      {/* L'instrument. Chaque graduation est un bouton : c'est bien une
          commande, pas une image — le clavier doit y arriver. */}
      <div className="mt-4 grid grid-cols-12 gap-1.5">
        {mois.map((m) => {
          const nb = totalDuMois(m);
          const segments = segmentsDuMois(m, maxTotal);
          const actif = m.cle === moisOuvert;
          const vide = nb === 0;

          const resume = `${m.labelLong} — ${
            vide
              ? "aucune échéance"
              : `${nb} échéance${nb > 1 ? "s" : ""}` +
                (m.enRetard > 0 ? `, dont ${m.enRetard} en retard` : "")
          }`;
          return (
            <button
              key={m.cle}
              type="button"
              onClick={() => onChoisirMois(m.cle)}
              disabled={vide}
              aria-pressed={actif}
              aria-label={resume}
              className={
                "flex flex-col items-center gap-2 rounded-[14px] px-1 pb-2 pt-1 transition-colors " +
                (vide
                  ? "cursor-default"
                  : "hover:bg-[color:var(--board-slate-pale)]")
              }
            >
              {/* Le compte voyage avec sa barre — posé en haut de la
                  colonne, il flotterait loin d'un mois creux et on ne
                  saurait plus lequel il chiffre. La hauteur donne l'ordre
                  de grandeur, le chiffre donne la valeur. */}
              <span
                className="flex w-full flex-col items-center justify-end gap-1.5"
                style={{ height: H_MAX + 18 }}
              >
                <span
                  aria-hidden
                  className={
                    "font-mono text-[11px] tabular-nums leading-none " +
                    (vide
                      ? "text-transparent"
                      : actif
                        ? "font-semibold text-[color:var(--board-ink)]"
                        : "text-[color:var(--board-slate-mid)]")
                  }
                >
                  {vide ? "0" : nb}
                </span>
                {vide ? (
                  <span
                    className="w-full max-w-[34px] rounded bg-[color:var(--board-slate-pale)]"
                    style={{ height: H_VIDE }}
                  />
                ) : (
                  segments.map((s, i) => (
                    <span
                      key={s.cle}
                      className="w-full max-w-[34px]"
                      style={{
                        height: s.hauteur,
                        background: s.fond,
                        borderTopLeftRadius: i === 0 ? 6 : 0,
                        borderTopRightRadius: i === 0 ? 6 : 0,
                        borderBottomLeftRadius:
                          i === segments.length - 1 ? 6 : 0,
                        borderBottomRightRadius:
                          i === segments.length - 1 ? 6 : 0,
                      }}
                    />
                  ))
                )}
              </span>

              {/* La réglette : trait long sur un mois porteur, court
                  sinon. Le mois ouvert prend le curseur d'encre. */}
              <span
                aria-hidden
                className={
                  "w-px " +
                  (actif
                    ? "h-3.5 bg-[color:var(--board-ink)]"
                    : vide
                      ? "h-1.5 bg-[color:var(--board-slate)]"
                      : "h-2.5 bg-[color:var(--board-slate-soft)]")
                }
                style={actif ? { width: 2 } : undefined}
              />

              <span
                className={
                  "font-mono text-[10.5px] uppercase tracking-[0.1em] " +
                  (actif
                    ? "rounded-full bg-[color:var(--board-ink)] px-2.5 py-1 font-semibold text-white"
                    : vide
                      ? "py-1 text-[color:var(--board-slate)]"
                      : "py-1 text-[color:var(--board-slate-ink)]")
                }
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* La légende. Elle nomme les champs : sans elle, trois couleurs
          côte à côte se lisent comme une échelle de gravité continue. */}
      <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[color:var(--board-slate-line)] pt-3.5">
        <Cle etat="enRetard" libelle="en retard" />
        <Cle etat="proche" libelle="sous 30 jours" />
        <Cle etat="aVenir" libelle="à venir" />
        <Cle etat="faite" libelle="faite" />
        <Cle fond="var(--board-slate-pale)" libelle="aucune échéance" />
        <span className="ml-auto flex flex-wrap items-center gap-2">
          {horsAnnee > 0 ? (
            <span className="rounded-full bg-[color:var(--board-slate-pale)] px-3 py-1.5 text-[12px] font-semibold text-[color:var(--board-slate-mid)]">
              {horsAnnee} hors {annee} — plus bas
            </span>
          ) : null}
          {sansDate > 0 ? (
            <span className="rounded-full bg-[color:var(--board-slate-pale)] px-3 py-1.5 text-[12px] font-semibold text-[color:var(--board-slate-mid)]">
              {sansDate} sans date
            </span>
          ) : null}
        </span>
      </div>
    </section>
  );
}

function Cle({
  etat,
  fond,
  libelle,
}: {
  etat?: EtatEcheance;
  /** Champ libre — le mois vide n'est pas un état d'échéance. */
  fond?: string;
  libelle: string;
}) {
  return (
    <span className="flex items-center gap-2 text-[12px] text-[color:var(--board-slate-mid)]">
      <span
        aria-hidden
        className="size-[9px] rounded-[3px]"
        style={{ background: etat ? CHAMP_ETAT[etat] : fond }}
      />
      {libelle}
    </span>
  );
}
