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
//
// L'instrument se déplace d'année en année : les flèches font défiler la
// même règle sur 2025, 2027… — une dette de l'an dernier ou un contrôle
// quinquennal ne sont plus invisibles, ils sont à un cran de flèche.

import { useId } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  CHAMP_ETAT,
  ENCRE_ETAT,
  type EtatEcheance,
} from "@/lib/calendrier/etats";

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
  lointain: number;
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
  return m.enRetard + m.proche + m.lointain + m.faite;
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
      { cle: "lointain", n: m.lointain },
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
  sansDate,
  actionsSansEcheance,
  onAnneePrecedente,
  onAnneeSuivante,
  verre = false,
}: {
  /** Année que la règle affiche — pas forcément celle d'aujourd'hui. */
  annee: number;
  mois: MoisRegle[];
  /** Clé `AAAA-MM` du mois actuellement déplié, s'il est dans l'année. */
  moisOuvert: string | null;
  onChoisirMois: (cle: string) => void;
  /** Occurrences sans date — hors règle par nature, jamais oubliées. */
  sansDate: number;
  /**
   * Actions correctives ouvertes sans échéance. Le calendrier ne peut pas
   * les poser — inventer un jour serait un mensonge d'affichage (ADR-010) —
   * mais il les annonce : sinon la seule trace de leur absence était un
   * commentaire dans le code. `null` quand la vue est filtrée : la
   * remarque ne vaut que pour la lecture d'ensemble.
   */
  actionsSansEcheance?: { nb: number; href: string } | null;
  /** `undefined` : plus rien dans cette direction, la flèche se grise. */
  onAnneePrecedente?: () => void;
  onAnneeSuivante?: () => void;
  /**
   * Vrai quand l'instrument est collé en haut du défilement : la carte
   * passe en verre — translucide, flou d'arrière-plan, coins hauts fondus
   * dans le bord — pour que la liste se devine à travers au lieu de
   * disparaître sèchement dessous.
   */
  verre?: boolean;
}) {
  const titreId = useId();
  const maxTotal = Math.max(1, ...mois.map(totalDuMois));
  const total = mois.reduce((n, m) => n + totalDuMois(m), 0);

  // Les totaux de l'année affichée, par état : la légende ne se contente
  // pas de nommer les couleurs, elle donne le solde de chacune.
  const totaux = mois.reduce(
    (acc, m) => ({
      enRetard: acc.enRetard + m.enRetard,
      proche: acc.proche + m.proche,
      lointain: acc.lointain + m.lointain,
      faite: acc.faite + m.faite,
    }),
    { enRetard: 0, proche: 0, lointain: 0, faite: 0 },
  );

  return (
    // L'instrument n'est pas une carte : deux strates pleine largeur —
    // le cadran de l'année sur le blanc de la page, puis la bande grise
    // canvas qui porte les graduations. Les marges négatives annulent la
    // gouttière de la page pour toucher les bords ; chaque strate prend
    // son verre quand l'ensemble est collé.
    <section aria-labelledby={titreId} className="-mx-[var(--board-gutter)] flex flex-col">
      {/* Le titre existe pour les lecteurs d'écran ; à l'œil, l'instrument
          se présente seul — sa clé de lecture (hauteur = volume, couleur =
          état) vit dans l'aide d'écran, avec le reste des explications. */}
      <h2 id={titreId} className="sr-only">
        L&apos;année d&apos;un bloc — {total} échéance{total > 1 ? "s" : ""} en{" "}
        {annee}
      </h2>

      {/* Le cadran de l'année : les flèches déplacent la règle, comme sur
          la frise du tableau de bord. Il vit AU-DESSUS de la bande grise,
          sur le blanc de la page — c'est le réglage, pas la mesure. Le
          compte voyage avec le millésime : sans lui, une année déserte
          ressemblerait à un bug. */}
      <div
        className={
          "flex items-center justify-center gap-4 px-[var(--board-gutter)] pb-5 pt-1 transition-[background-color,backdrop-filter] duration-300 ease-out " +
          (verre
            ? "bg-[color:rgba(255,255,255,.72)] backdrop-blur-xl backdrop-saturate-150"
            : "bg-[color:var(--board-card)]")
        }
      >
        <FlecheAnnee
          direction="precedente"
          cible={annee - 1}
          onClick={onAnneePrecedente}
        />
        {/* Le millésime a son champ : c'est la valeur que le cadran règle,
            elle se lit comme un cartouche, pas comme un mot posé là.
            L'encre, pas une couleur d'état : sur cette page le noir dit
            « la valeur active » — le label du mois visé, l'onglet de
            lecture — et aucune barre ne le porte. */}
        <span className="flex min-w-[152px] flex-col items-center gap-1 rounded-[18px] bg-[color:var(--board-ink)] px-7 py-2.5">
          <span className="board-titre text-[27px] tabular-nums leading-none tracking-[-0.02em] text-white">
            {annee}
          </span>
          {/* Le même bleu que l'eyebrow de la bande de titre : c'est la
              couleur des légendes posées sur l'encre. */}
          <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[color:var(--board-blue-soft)]">
            {total === 0
              ? "aucune échéance"
              : `${total} échéance${total > 1 ? "s" : ""}`}
          </span>
        </span>
        <FlecheAnnee
          direction="suivante"
          cible={annee + 1}
          onClick={onAnneeSuivante}
        />
      </div>

      {/* La bande grise : les graduations et leur légende, sur le canvas
          un cran sous le blanc — la mesure a son sol, le réglage vit
          au-dessus. */}
      <div
        className={
          "flex flex-col px-[var(--board-gutter)] pb-5 pt-6 transition-[background-color,box-shadow,backdrop-filter] duration-300 ease-out " +
          (verre
            ? "bg-[color:rgba(242,243,244,.72)] shadow-[0_16px_36px_-20px_rgba(13,18,36,.30)] backdrop-blur-xl backdrop-saturate-150"
            : "bg-[color:var(--board-canvas)]")
        }
      >
      {/* L'instrument. Chaque graduation est un bouton : c'est bien une
          commande, pas une image — le clavier doit y arriver. */}
      <div className="grid grid-cols-12 gap-1.5">
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
                  : actif
                    // Le mois visé garde son champ — blanc sur le canvas
                    // de la bande : le curseur d'encre du label ne
                    // suffisait pas à retrouver d'un regard où on en était.
                    ? "bg-[color:var(--board-card)] shadow-[0_1px_3px_rgba(13,18,36,.10)]"
                    : "hover:bg-white/60")
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
                    className="w-full max-w-[34px] rounded bg-[color:var(--board-slate-line)]"
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
      <div className="mt-3.5 flex flex-wrap items-center gap-x-9 gap-y-2.5 border-t border-[color:var(--board-slate-line)] pt-4">
        <Cle etat="enRetard" libelle="en retard" valeur={totaux.enRetard} />
        <Cle etat="proche" libelle="sous 30 jours" valeur={totaux.proche} />
        <Cle etat="lointain" libelle="à venir" valeur={totaux.lointain} />
        <Cle etat="faite" libelle="faite" valeur={totaux.faite} />
        {/* « Hors année » n'a plus de badge : les flèches du cadran font
            le voyage que le badge se contentait d'annoncer. Le badge « à
            planifier » parle, lui, le vocabulaire des pastilles de statut
            — « sans date » disait la même chose avec d'autres mots. */}
        {sansDate > 0 ? (
          <span className="ml-auto rounded-full bg-[color:var(--board-card)] px-3 py-1.5 text-[12px] font-semibold text-[color:var(--board-slate-mid)]">
            {sansDate} à planifier
          </span>
        ) : null}
        {actionsSansEcheance && actionsSansEcheance.nb > 0 ? (
          <Link
            href={actionsSansEcheance.href}
            className={`rounded-full bg-[color:var(--board-card)] px-3 py-1.5 text-[12px] font-semibold text-[color:var(--board-slate-mid)] underline-offset-4 transition-colors hover:text-[color:var(--board-ink)] hover:underline ${sansDate > 0 ? "" : "ml-auto"}`}
          >
            {actionsSansEcheance.nb} action
            {actionsSansEcheance.nb > 1 ? "s" : ""} sans échéance — les dater
          </Link>
        ) : null}
      </div>
      </div>
    </section>
  );
}

/** Flèche du cadran d'année. Sans cible, elle se grise mais reste posée :
 *  le cadran garde sa symétrie et la limite de la course se voit. */
function FlecheAnnee({
  direction,
  cible,
  onClick,
}: {
  direction: "precedente" | "suivante";
  cible: number;
  onClick?: () => void;
}) {
  const Chevron = direction === "precedente" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={`Afficher l'année ${cible}`}
      className="flex size-8 flex-none items-center justify-center rounded-full border border-[color:rgba(10,10,10,.16)] text-[color:var(--board-ink)] transition-colors hover:bg-[color:var(--board-card)] disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
    >
      <Chevron className="size-4" />
    </button>
  );
}

/**
 * Une clé de légende : le solde dans un cercle qui porte la couleur de
 * l'état — la pastille et la valeur ne font qu'un, le chiffre est SUR sa
 * couleur, et l'œil n'a plus à apparier deux petits objets.
 */
function Cle({
  etat,
  libelle,
  valeur,
}: {
  etat: EtatEcheance;
  libelle: string;
  /** Le solde de l'état sur l'année affichée. */
  valeur: number;
}) {
  return (
    <span className="flex items-center gap-2 text-[12px] text-[color:var(--board-slate-mid)]">
      <span
        className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-none tabular-nums"
        style={{ background: CHAMP_ETAT[etat], color: ENCRE_ETAT[etat] }}
      >
        {valeur}
      </span>
      {libelle}
    </span>
  );
}
