"use client";

// Blocs du « board éditorial » — direction 4a du design Rojer.
//
// Chaque bloc est un widget du registre : il reçoit le bundle et rend une
// carte blanche à grand rayon sur le canvas bleu. Le système de
// personnalisation (DashboardGrid + EditToolbar, le « ⠿ Organiser » du
// mockup) reste donc pleinement opérant — le board n'est que le layout
// par défaut, pas une page figée.
//
// Aucune donnée n'est écrite en dur ici : tout vient du bundle, et les
// dérivations non triviales vivent dans `@/lib/dashboard/{brief,frise,
// obligations}` où elles sont testées.

import { Fragment, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { construireBrief } from "@/lib/dashboard/brief";
import { construireFrise } from "@/lib/dashboard/frise";
import {
  COLONNES_MATRICE,
  compterRestes,
  construireMatrice,
  type EtatCellule,
} from "@/lib/dashboard/obligations";
import type { DashboardBundle } from "../types";

/* ─── Primitives partagées ──────────────────────────────────── */

/**
 * Le design distingue deux rayons : 26 px sur les cartes-chiffre, 30 px
 * sur les grands blocs. Le rayon est donc un paramètre, pas une classe
 * qu'on écraserait depuis l'appelant (l'ordre des classes Tailwind ne
 * décide pas de la priorité).
 */
function CarteBoard({
  children,
  className = "",
  rayon = 30,
}: {
  children: React.ReactNode;
  className?: string;
  rayon?: 26 | 30;
}) {
  return (
    <div
      className={
        "flex h-full flex-col bg-[color:var(--board-card)] " +
        (rayon === 26 ? "rounded-[26px] " : "rounded-[30px] ") +
        className
      }
    >
      {children}
    </div>
  );
}

function TitreBloc({
  titre,
  sousTitre,
  href,
}: {
  titre: string;
  sousTitre?: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="min-w-0">
        <h2 className="m-0 text-[26px] font-semibold leading-[1.1] tracking-[-0.035em] text-[color:var(--board-ink)]">
          {titre}
        </h2>
        {sousTitre ? (
          <p className="mt-[7px] text-[13.5px] text-[color:var(--board-grey-ink)]">
            {sousTitre}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          aria-label={`Ouvrir ${titre}`}
          className="ml-auto flex size-9 flex-none items-center justify-center rounded-full border border-[color:rgba(10,10,10,.16)] text-[color:var(--board-ink)] transition-colors hover:bg-[color:var(--board-blue-pale)]"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

/** Pastille de comptage — bleue par défaut, ambre en alerte. */
function Pastille({
  children,
  ton = "neutre",
}: {
  children: React.ReactNode;
  ton?: "neutre" | "alerte";
}) {
  const classes =
    ton === "alerte"
      ? "bg-[color:var(--board-amber-pale)] text-[color:var(--board-amber-ink)]"
      : "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]";
  return (
    <span
      className={
        "inline-block rounded-full px-[13px] py-[6px] text-[12px] font-semibold " +
        classes
      }
    >
      {children}
    </span>
  );
}

function Lien({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="mt-1 inline-flex items-center gap-2 rounded-full bg-[color:var(--board-ink)] px-4 py-2.5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-85"
    >
      {children}
      <ArrowUpRight className="size-3.5" />
    </Link>
  );
}

/* ─── 1 · Le brief ──────────────────────────────────────────── */

/**
 * Le brief n'est pas un widget : c'est le bandeau de tête du tableau de
 * bord, rendu par la page au-dessus de la grille. Il occupe donc toute la
 * largeur, sans gouttière ni rayon — le canvas bleu ne commence qu'en
 * dessous. Il n'est ni déplaçable ni retirable, et c'est voulu : c'est lui
 * qui répond à « qu'est-ce que je dois faire aujourd'hui ».
 */
export function BlocBrief({ bundle }: { bundle: DashboardBundle }) {
  const { dashboard, nbRapports, aujourdhui } = bundle;
  const brief = construireBrief({
    aujourdhui,
    compteurs: dashboard.compteurs,
    duerp: dashboard.duerp,
    recommandations: dashboard.recommandations,
    nbRapports,
  });

  return (
    // Écart assumé au mockup, qui pose le bandeau en plein-fer : ici il
    // reste dans la gouttière, comme tous les autres blocs, pour que le
    // canvas bleu encadre le board sur ses quatre côtés — y compris le
    // long du rail noir.
    <div className="grid items-center gap-9 bg-[color:var(--board-card)] px-[46px] pb-[50px] pt-[52px] lg:grid-cols-[1.15fr_.85fr]">
      <div>
        <span className="inline-block rounded-full bg-[color:var(--board-blue-pale)] px-[14px] py-[6px] text-[11.5px] font-semibold tracking-[0.06em] text-[color:var(--board-blue-ink)]">
          {brief.datePill}
        </span>
        <h1 className="mt-[26px] max-w-[520px] text-pretty text-[clamp(34px,4vw,56px)] font-semibold leading-[1.02] tracking-[-0.045em] text-[color:var(--board-ink)]">
          {brief.titre}
        </h1>
        <p className="mt-[22px] max-w-[460px] text-[16px] leading-[1.6] text-[color:var(--board-text)]">
          {brief.paragraphe}
        </p>

        {brief.gestes.length > 0 ? (
          <div className="mt-7 flex flex-wrap gap-[9px]">
            {brief.gestes.map((g, i) => {
              // Le premier geste est le primaire (noir), le suivant est
              // secondaire (ambre) — c'est la hiérarchie du design, elle ne
              // dépend pas du type de recommandation.
              const primaire = i === 0;
              return (
                <Link
                  key={g.href + g.tag}
                  href={g.href}
                  title={g.tagComplet}
                  className="inline-flex max-w-full items-center overflow-hidden rounded-full text-[12.5px] font-medium transition-opacity hover:opacity-85"
                >
                  <span
                    className={
                      "truncate px-[14px] py-[10px] " +
                      (primaire
                        ? "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]"
                        : "bg-[color:var(--board-amber-pale)] text-[color:var(--board-amber-ink-strong)]")
                    }
                  >
                    {g.tag}
                  </span>
                  <span
                    className={
                      "flex-none px-4 py-[10px] font-semibold " +
                      (primaire
                        ? "bg-[color:var(--board-ink)] text-white"
                        : "bg-[color:var(--board-amber)] text-[color:var(--board-amber-ink-deep)]")
                    }
                  >
                    {g.label}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>

      <MotifIsometrique />
    </div>
  );
}

/**
 * Le design réserve la moitié droite du hero à une illustration
 * isométrique. En l'absence d'illustration, on rend un motif décoratif
 * dans la même palette plutôt qu'un cartouche « placeholder » : le bloc
 * tient visuellement sans prétendre porter de l'information.
 */
function MotifIsometrique() {
  return (
    <div
      aria-hidden
      className="hidden min-h-[260px] items-center justify-center self-stretch rounded-[30px] bg-[image:repeating-linear-gradient(135deg,rgba(47,95,133,.06)_0_12px,transparent_12px_24px)] lg:flex"
    >
      <svg viewBox="0 0 200 140" className="w-[56%]" fill="none">
        <ellipse cx="100" cy="112" rx="72" ry="18" fill="var(--board-blue-pale)" />
        <path d="M100 34 168 72 100 110 32 72Z" fill="var(--board-blue-soft)" />
        <path d="M100 34 168 72 100 110Z" fill="var(--board-blue-mid)" />
        <path d="M100 12 140 34 100 56 60 34Z" fill="var(--board-card)" />
        <path d="M100 12 140 34 100 56Z" fill="var(--board-blue-pale)" />
        <circle cx="100" cy="34" r="6" fill="var(--board-ink)" />
      </svg>
    </div>
  );
}

/* ─── 2 · La frise ──────────────────────────────────────────── */

/** Largeur de la voie « En retard » + respiration, en pixels. */
const PISTE_DECALAGE = 196;

const TON_POINT: Record<string, string> = {
  alerte: "var(--board-amber)",
  warn: "var(--board-blue-mid)",
  ok: "var(--board-blue-strong)",
};

export function BlocFrise({ bundle }: { bundle: DashboardBundle }) {
  // Bascule inline, comme dans le design. Elle vit ici plutôt que dans le
  // système de variants pour rester accessible hors mode « Organiser ».
  const [horizon, setHorizon] = useState<90 | 365>(90);

  // Une seule requête (365 j) alimente les deux horizons : `construireFrise`
  // se charge de couper à la fenêtre demandée.
  const frise = construireFrise({
    evenements: bundle.evenementsHorizon,
    aujourdhui: bundle.aujourdhui,
    horizonJours: horizon,
  });

  return (
    <CarteBoard className="px-[30px] pb-5 pt-[26px]">
      <div className="flex items-start gap-4">
        <div>
          <h2 className="m-0 text-[30px] font-semibold leading-[1.1] tracking-[-0.035em] text-[color:var(--board-ink)]">
            {horizon === 90 ? "Les 90 prochains jours" : "Les 12 prochains mois"}
          </h2>
          <p className="mt-2 text-[13.5px] text-[color:var(--board-grey-ink)]">
            Ce qui tombe, quand, et ce qui est déjà pris en charge.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {([90, 365] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHorizon(h)}
              aria-pressed={horizon === h}
              className={
                "rounded-full px-[13px] py-[6px] text-[11.5px] font-semibold transition-colors " +
                (horizon === h
                  ? "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]"
                  : "bg-[color:var(--board-grey-pale)] text-[color:var(--board-grey-ink)] hover:text-[color:var(--board-ink)]")
              }
            >
              {h === 90 ? "90 jours" : "12 mois"}
            </button>
          ))}
          <Link
            href={`/etablissements/${bundle.etablissementId}/calendrier`}
            aria-label="Ouvrir le calendrier"
            className="flex size-9 flex-none items-center justify-center rounded-full border border-[color:rgba(10,10,10,.16)] text-[color:var(--board-ink)] transition-colors hover:bg-[color:var(--board-blue-pale)]"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      {frise.marqueurs.length === 0 ? (
        // Rien à placer sur l'axe : on ne dessine pas une frise déserte de
        // 196 px. On dit ce qui bloque, et on donne la porte de sortie.
        <div className="mt-7 flex flex-col items-start gap-3 rounded-[22px] bg-[color:var(--board-grey-pale)] px-6 py-7">
          {bundle.equipements.length === 0 ? (
            <>
              <p className="m-0 text-[15px] font-semibold tracking-[-0.015em] text-[color:var(--board-ink)]">
                Votre calendrier est vide
              </p>
              <p className="m-0 max-w-[560px] text-[13.5px] leading-[1.5] text-[color:var(--board-grey-ink)]">
                Il se remplit tout seul à partir des équipements déclarés — il
                n&apos;y en a pas encore.
              </p>
              <Lien
                href={`/etablissements/${bundle.etablissementId}/equipements/nouveau`}
              >
                Déclarer un équipement
              </Lien>
            </>
          ) : frise.nbEnRetard > 0 ? (
            <>
              <p className="m-0 text-[15px] font-semibold tracking-[-0.015em] text-[color:var(--board-ink)]">
                {frise.nbEnRetard} échéance{frise.nbEnRetard > 1 ? "s" : ""} sans
                date, aucune à venir
              </p>
              <p className="m-0 max-w-[560px] text-[13.5px] leading-[1.5] text-[color:var(--board-grey-ink)]">
                Vos vérifications existent mais aucune n&apos;est encore
                programmée : il n&apos;y a donc rien à poser sur les{" "}
                {horizon === 90 ? "90 prochains jours" : "12 prochains mois"}.
                Posez des dates et la frise se remplira.
              </p>
              <Lien
                href={`/etablissements/${bundle.etablissementId}/calendrier`}
              >
                Programmer les vérifications
              </Lien>
            </>
          ) : (
            <p className="m-0 text-[13.5px] text-[color:var(--board-grey-ink)]">
              Aucune échéance sur cette période.
            </p>
          )}
        </div>
      ) : (
        <div className="relative mt-7 h-[236px]">
          {/* Les retards ne sont pas un point dans le temps mais un cumul :
              ils prennent leur propre voie à gauche, et l'axe des 90 jours
              ne commence qu'après. C'est ce qui empêche la première
              échéance de venir se superposer au bloc ambre. */}
          {frise.nbEnRetard > 0 ? (
            <Link
              href={`/etablissements/${bundle.etablissementId}/calendrier`}
              className="absolute left-0 top-1/2 w-[172px] -translate-y-1/2 rounded-[18px] bg-[color:var(--board-amber-mid)] px-[15px] py-3 transition-opacity hover:opacity-85"
            >
              <p className="m-0 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--board-amber-ink)]">
                En retard
              </p>
              <p className="mt-1.5 text-[14px] font-semibold leading-[1.25] tracking-[-0.015em] text-[color:var(--board-amber-ink)]">
                {frise.nbEnRetard} échéance{frise.nbEnRetard > 1 ? "s" : ""}{" "}
                dépassée{frise.nbEnRetard > 1 ? "s" : ""}
              </p>
            </Link>
          ) : null}

          {/* Piste des 90 jours. */}
          <div
            className="absolute inset-y-0 right-0"
            style={{ left: frise.nbEnRetard > 0 ? PISTE_DECALAGE : 0 }}
          >
            <div className="absolute inset-x-0 top-[112px] h-1 rounded-sm bg-[color:var(--board-grey-line)]" />
            {frise.nbEnRetard > 0 ? (
              <div className="absolute left-0 top-[112px] h-1 w-8 rounded-sm bg-[color:var(--board-amber)]" />
            ) : null}

            {frise.marqueurs.map((m) => (
              <Fragment key={m.id}>
                {/* Le point est à la date exacte — c'est lui qui dit vrai. */}
                <span
                  className="absolute z-10 size-3.5 -translate-x-1/2 rounded-full shadow-[0_0_0_4px_var(--board-card)]"
                  style={{ left: `${m.pct}%`, top: 105, background: TON_POINT[m.tone] }}
                />
                {/* La carte est centrée sur le point, mais bornée pour ne
                    jamais déborder la piste : aux extrémités elle glisse
                    légèrement, le point reste à sa place. */}
                <Link
                  href={`/etablissements/${bundle.etablissementId}/calendrier`}
                  className="absolute w-[172px] -translate-x-1/2 rounded-[18px] bg-[color:var(--board-blue-pale)] px-[15px] py-3 text-center transition-opacity hover:opacity-85"
                  style={{
                    left: `clamp(86px, ${m.pct}%, calc(100% - 86px))`,
                    ...(m.cote === "haut"
                      ? { bottom: 236 - 96 }
                      : { top: 128 }),
                  }}
                >
                  <p className="m-0 text-[14px] font-semibold leading-[1.25] tracking-[-0.015em] text-[color:var(--board-ink)]">
                    {m.libelle}
                  </p>
                  <p className="mt-[5px] text-[11.5px] font-semibold tracking-[0.06em] text-[color:var(--board-blue-ink)]">
                    {m.libelleDate}
                  </p>
                </Link>
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Les graduations s'alignent sur la piste, pas sur la carte : avec
          une voie « En retard » à gauche, une ligne pleine largeur ferait
          mentir les mois. */}
      <div
        className="mt-2.5 flex justify-between border-t border-[color:var(--board-grey-line)] pt-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--board-grey-soft)]"
        style={{
          marginLeft:
            frise.marqueurs.length > 0 && frise.nbEnRetard > 0
              ? PISTE_DECALAGE
              : 0,
        }}
      >
        {frise.mois.map((m, i) => (
          <span
            key={m.label}
            className={i === 0 ? "text-[color:var(--board-ink)]" : undefined}
          >
            {m.label}
          </span>
        ))}
      </div>

      {frise.nbMasques > 0 ? (
        <p className="mt-2 text-[11.5px] text-[color:var(--board-grey-soft)]">
          {frise.nbMasques} autre{frise.nbMasques > 1 ? "s" : ""} échéance
          {frise.nbMasques > 1 ? "s" : ""} sur la période, trop rapprochée
          {frise.nbMasques > 1 ? "s" : ""} pour être placée
          {frise.nbMasques > 1 ? "s" : ""} — voir le calendrier.
        </p>
      ) : null}
    </CarteBoard>
  );
}

/* ─── 3 · Prochaine échéance ────────────────────────────────── */

export function BlocProchaineEcheance({ bundle }: { bundle: DashboardBundle }) {
  const { prochainesVerifs, aujourdhui, etablissementId } = bundle;

  if (prochainesVerifs.length === 0) {
    return (
      <CarteBoard rayon={26} className="justify-center px-[26px] py-6">
        <p className="m-0 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--board-grey-soft)]">
          Prochaine échéance
        </p>
        <p className="mt-3 text-[15px] text-[color:var(--board-grey-ink)]">
          Aucune vérification planifiée pour l&apos;instant.
        </p>
      </CarteBoard>
    );
  }

  const trie = [...prochainesVerifs].sort(
    (a, b) => a.datePrevue.getTime() - b.datePrevue.getTime(),
  );
  const v = trie[0];
  const jours = Math.round(
    (v.datePrevue.getTime() - aujourdhui.getTime()) / 86400000,
  );
  const enRetard = jours < 0;

  return (
    <CarteBoard rayon={26} className="flex-row items-center gap-[18px] px-[26px] py-6">
      <div className="min-w-0 flex-1">
        <p className="m-0 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--board-grey-soft)]">
          Prochaine échéance
        </p>
        <Link
          href={`/etablissements/${etablissementId}/verifications/${v.id}`}
          className="mt-3 block text-[19px] font-semibold leading-[1.2] tracking-[-0.025em] text-[color:var(--board-ink)] hover:underline"
        >
          {v.libelleObligation}
        </Link>
        <span className="mt-2.5 inline-block">
          <Pastille ton={enRetard ? "alerte" : "neutre"}>
            {new Intl.DateTimeFormat("fr-FR", {
              day: "numeric",
              month: "short",
            }).format(v.datePrevue)}{" "}
            · {v.equipement.libelle}
          </Pastille>
        </span>
      </div>
      <div
        className={
          "flex size-24 flex-none flex-col items-center justify-center rounded-[26px] " +
          (enRetard
            ? "bg-[color:var(--board-amber)]"
            : "bg-[color:var(--board-canvas)]")
        }
      >
        <span
          className={
            "text-[34px] font-semibold leading-none tracking-[-0.045em] " +
            (enRetard
              ? "text-[color:var(--board-amber-ink-deep)]"
              : "text-[color:var(--board-ink)]")
          }
        >
          {Math.abs(jours)}
        </span>
        <span
          className={
            "mt-[3px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] " +
            (enRetard
              ? "text-[color:var(--board-amber-ink)]"
              : "text-[color:var(--board-blue-ink)]")
          }
        >
          {enRetard ? "j. de retard" : "jours"}
        </span>
      </div>
    </CarteBoard>
  );
}

/* ─── 4 · Actions en retard ─────────────────────────────────── */

export function BlocActionsEnRetard({ bundle }: { bundle: DashboardBundle }) {
  const stats = bundle.statsRetardActions;
  const href = `/etablissements/${bundle.etablissementId}/actions`;

  return (
    <CarteBoard rayon={26} className="flex-row items-center gap-[18px] px-[26px] py-6">
      <div className="min-w-0 flex-1">
        <p className="m-0 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--board-grey-soft)]">
          Actions en retard
        </p>
        <Link
          href={href}
          className="mt-3 block text-[19px] font-semibold leading-[1.2] tracking-[-0.025em] text-[color:var(--board-ink)] hover:underline"
        >
          {stats.plusAncienne
            ? stats.plusAncienne.libelle
            : "Aucune action dépassée"}
        </Link>
        <span className="mt-2.5 inline-block">
          {stats.nb > 0 ? (
            <Pastille ton="alerte">
              Retard moyen {stats.retardMoyenJours} jour
              {stats.retardMoyenJours > 1 ? "s" : ""}
            </Pastille>
          ) : (
            <Pastille>Plan d&apos;actions à jour</Pastille>
          )}
        </span>
      </div>
      <div
        className={
          "flex size-24 flex-none flex-col items-center justify-center rounded-[26px] " +
          (stats.nb > 0
            ? "bg-[color:var(--board-amber)]"
            : "bg-[color:var(--board-green)]")
        }
      >
        <span
          className={
            "text-[34px] font-semibold leading-none tracking-[-0.045em] " +
            (stats.nb > 0
              ? "text-[color:var(--board-amber-ink-deep)]"
              : "text-[color:var(--board-green-ink)]")
          }
        >
          {String(stats.nb).padStart(2, "0")}
        </span>
        <span
          className={
            "mt-[3px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] " +
            (stats.nb > 0
              ? "text-[color:var(--board-amber-ink)]"
              : "text-[color:var(--board-green-ink)]")
          }
        >
          en retard
        </span>
      </div>
    </CarteBoard>
  );
}

/* ─── 5 · Où en est le plan d'actions ───────────────────────── */

export function BlocPlanActions({ bundle }: { bundle: DashboardBundle }) {
  const c = bundle.dashboard.compteurs;

  // Arcs disjoints : `actionsEnRetard` recoupe ouvertes + en cours (c'est
  // un filtre sur l'échéance, pas un statut), il ne peut donc pas être un
  // arc de plus sans fausser le total. Il est rendu en légende « dont ».
  const arcs = [
    {
      cle: "ouvertes",
      label: "Ouvertes",
      valeur: c.actionsOuvertes,
      couleur: "var(--board-blue-soft)",
    },
    {
      cle: "encours",
      label: "En cours",
      valeur: c.actionsEnCours,
      couleur: "var(--board-blue-strong)",
    },
    {
      cle: "levees",
      label: "Clôturées ce mois",
      valeur: c.actionsLeveesRecemment,
      couleur: "var(--board-green)",
    },
  ];

  const total = arcs.reduce((s, a) => s + a.valeur, 0);
  const ouvertes = c.actionsOuvertes + c.actionsEnCours;

  let curseur = 0;
  const stops = arcs
    .map((a) => {
      const debut = curseur;
      curseur += total > 0 ? (a.valeur / total) * 100 : 0;
      return `${a.couleur} ${debut}% ${curseur}%`;
    })
    .join(",");

  return (
    <CarteBoard className="px-7 py-[26px]">
      <TitreBloc
        titre="Où en est le plan d'actions"
        href={`/etablissements/${bundle.etablissementId}/actions`}
      />

      <div className="mt-6 flex items-center gap-[22px]">
        <div
          className="flex size-[126px] flex-none items-center justify-center rounded-full"
          style={{
            background:
              total > 0
                ? `conic-gradient(${stops})`
                : "var(--board-grey-line)",
          }}
        >
          <div className="flex size-[74px] flex-col items-center justify-center rounded-full bg-[color:var(--board-card)]">
            <span className="text-[24px] font-semibold leading-none tracking-[-0.04em] text-[color:var(--board-ink)]">
              {ouvertes}
            </span>
            <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--board-blue-ink)]">
              ouvertes
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-[11px]">
          {arcs.map((a) => (
            <div
              key={a.cle}
              className="flex items-center gap-[9px] text-[13px] text-[color:var(--board-text-strong)]"
            >
              <span
                className="size-[9px] rounded-[3px]"
                style={{ background: a.couleur }}
              />
              <span className="flex-1">{a.label}</span>
              <span
                className={
                  "font-semibold " +
                  (a.cle === "levees"
                    ? "text-[color:var(--board-green-ink-soft)]"
                    : "text-[color:var(--board-ink)]")
                }
              >
                {a.cle === "levees" && a.valeur > 0 ? "+" : ""}
                {a.valeur}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-[9px] text-[13px] text-[color:var(--board-text-strong)]">
            <span className="size-[9px] rounded-[3px] bg-[color:var(--board-amber)]" />
            <span className="flex-1">dont en retard</span>
            <span className="font-semibold text-[color:var(--board-ink)]">
              {c.actionsEnRetard}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-[22px] border-t border-[color:rgba(10,10,10,.10)] pt-[18px] text-[13px] leading-[1.5] text-[color:var(--board-text-muted)]">
        {ouvertes === 0
          ? "Aucune action ouverte sur cet établissement."
          : c.actionsEnRetard === 0
            ? "Aucune action ne dépasse son échéance."
            : `${c.actionsEnRetard} action${c.actionsEnRetard > 1 ? "s" : ""} sur ${ouvertes} dépasse${c.actionsEnRetard > 1 ? "nt" : ""} son échéance.`}
      </p>
    </CarteBoard>
  );
}

/* ─── 6 · Ce qui a changé ───────────────────────────────────── */

const LIBELLE_RESULTAT: Record<string, string> = {
  conforme: "Conforme",
  observations_mineures: "Observations mineures",
  ecart_majeur: "Écart majeur",
  non_verifiable: "Non vérifiable",
};

export function BlocCeQuiAChange({ bundle }: { bundle: DashboardBundle }) {
  const { rapportsRecents, aujourdhui, etablissementId, dashboard } = bundle;

  const joursDepuis = (d: Date) =>
    Math.floor((aujourdhui.getTime() - d.getTime()) / 86400000);

  const quand = (d: Date) => {
    const j = joursDepuis(d);
    if (j <= 0) return "AUJOURD'HUI";
    if (j === 1) return "HIER";
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" })
      .format(d)
      .toUpperCase();
  };

  // Le premier « à faire » du moteur de recos ferme la liste, comme la
  // ligne ambre du design.
  const aFaire = dashboard.recommandations[0];

  return (
    <CarteBoard className="px-7 py-[26px]">
      <TitreBloc
        titre="Ce qui a changé"
        sousTitre="Les derniers mouvements sur votre dossier."
        href={`/etablissements/${etablissementId}/registre`}
      />

      <div className="mt-5 flex flex-col gap-2">
        {rapportsRecents.length === 0 && !aFaire ? (
          <p className="text-[13.5px] text-[color:var(--board-grey-ink)]">
            Rien de neuf sur les derniers jours.
          </p>
        ) : null}

        {rapportsRecents.slice(0, 3).map((r, i) => (
          <Link
            key={r.id}
            href={`/etablissements/${etablissementId}/verifications/${r.verificationId}`}
            className={
              "flex items-center gap-3 rounded-full px-4 py-[13px] transition-colors hover:bg-[color:var(--board-blue-pale)] " +
              // Le plus récent est mis en avant, comme dans le design.
              (i === 0
                ? "bg-[color:var(--board-blue-pale)]"
                : "bg-[color:var(--board-grey-pale)]")
            }
          >
            <span
              className={
                "flex size-[22px] flex-none items-center justify-center rounded-full text-[11px] " +
                (r.resultat === "ecart_majeur"
                  ? "bg-[color:var(--board-amber)] text-[color:var(--board-amber-ink-deep)]"
                  : "bg-[color:var(--board-green)] text-[color:var(--board-green-ink)]")
              }
            >
              {r.resultat === "ecart_majeur" ? "!" : "✓"}
            </span>
            <span className="flex-1 text-[13.5px] font-medium leading-[1.35] text-[color:var(--board-ink)]">
              {r.verification.libelleObligation} —{" "}
              {LIBELLE_RESULTAT[r.resultat] ?? r.resultat}
            </span>
            <span className="flex-none text-[11.5px] font-semibold text-[color:var(--board-grey-soft)]">
              {quand(r.dateRapport)}
            </span>
          </Link>
        ))}

        {aFaire ? (
          <Link
            href={aFaire.href}
            className="flex items-center gap-3 rounded-full border border-[color:rgba(238,108,43,.3)] bg-[color:var(--board-amber-pale)] px-4 py-[13px] transition-opacity hover:opacity-85"
          >
            <span className="flex size-[22px] flex-none items-center justify-center rounded-full bg-[color:var(--board-amber)] text-[11px] font-semibold text-[color:var(--board-amber-ink-deep)]">
              !
            </span>
            <span className="flex-1 text-[13.5px] font-medium leading-[1.35] text-[color:var(--board-ink)]">
              {aFaire.titre}
            </span>
            <span className="flex-none text-[11.5px] font-semibold text-[color:var(--board-amber-ink-strong)]">
              À FAIRE
            </span>
          </Link>
        ) : null}
      </div>
    </CarteBoard>
  );
}

/* ─── 7 · Vos documents, en un coup d'œil ───────────────────── */

function Rond({ etat }: { etat: EtatCellule }) {
  if (etat === "na") {
    return (
      <span
        title="Sans objet pour cette ligne"
        className="flex size-6 items-center justify-center text-[color:var(--board-grey-soft)]"
      >
        <span className="h-px w-2.5 bg-current" />
      </span>
    );
  }
  if (etat === "ok") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-[color:var(--board-green)] text-[12px] text-[color:var(--board-green-ink)]">
        ✓
      </span>
    );
  }
  return (
    <span
      title="Reste à faire"
      className="size-6 rounded-full bg-[color:var(--board-grey-line)]"
    />
  );
}

export function BlocDocuments({ bundle }: { bundle: DashboardBundle }) {
  const lignes = construireMatrice({
    etablissementId: bundle.etablissementId,
    duerp: bundle.dashboard.duerp,
    nbRapports: bundle.nbRapports,
    nbVerifs: bundle.nbVerifs,
    jourDernierRapport: bundle.jourDernierRapport,
    compteurs: bundle.dashboard.compteurs,
  });
  const restes = compterRestes(lignes);

  return (
    <CarteBoard className="px-7 py-[26px]">
      <TitreBloc titre="Vos documents, en un coup d'œil" />

      <div className="mt-[22px] grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center gap-[7px]">
        <span className="rounded-full bg-[color:var(--board-blue-ink)] px-3.5 py-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-white">
          Document
        </span>
        {COLONNES_MATRICE.map((c) => (
          <span
            key={c}
            className="rounded-full bg-[color:var(--board-grey-pale)] px-2.5 py-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[color:var(--board-grey-ink)]"
          >
            {c}
          </span>
        ))}

        {lignes.map((l) => (
          <Fragment key={l.id}>
            <Link
              href={l.href}
              className="rounded-full bg-[color:var(--board-blue-pale)] px-4 py-[11px] text-[13px] font-medium leading-[1.3] text-[color:var(--board-ink)] transition-opacity hover:opacity-80"
            >
              {l.libelle}
            </Link>
            {l.cellules.map((etat, i) => (
              <span key={i} className="flex justify-center">
                <Rond etat={etat} />
              </span>
            ))}
          </Fragment>
        ))}
      </div>

      <p className="mt-[18px] text-[13px] leading-[1.5] text-[color:var(--board-grey-ink)]">
        {restes === 0
          ? "Tout ce que l'outil sait mesurer est établi. Un tiret signale une colonne sans objet pour la ligne."
          : `Un rond vide n'est pas une faute : c'est ce qu'il reste à faire. ${restes} point${restes > 1 ? "s" : ""} ouvert${restes > 1 ? "s" : ""}.`}
      </p>
    </CarteBoard>
  );
}

/* ─── 8 · Préparer un contrôle ──────────────────────────────── */

export function BlocControle({ bundle }: { bundle: DashboardBundle }) {
  return (
    <CarteBoard className="overflow-hidden">
      <div
        aria-hidden
        className="flex min-h-[240px] flex-1 items-center justify-center bg-[color:var(--board-blue-pale)] bg-[image:repeating-linear-gradient(135deg,rgba(47,95,133,.07)_0_10px,transparent_10px_20px)]"
      >
        <svg viewBox="0 0 160 110" className="w-[52%]" fill="none">
          <rect
            x="34"
            y="20"
            width="92"
            height="72"
            rx="10"
            fill="var(--board-card)"
          />
          <rect
            x="48"
            y="36"
            width="64"
            height="7"
            rx="3.5"
            fill="var(--board-blue-soft)"
          />
          <rect
            x="48"
            y="52"
            width="46"
            height="7"
            rx="3.5"
            fill="var(--board-blue-pale)"
          />
          <rect
            x="48"
            y="68"
            width="54"
            height="7"
            rx="3.5"
            fill="var(--board-blue-pale)"
          />
          <circle cx="118" cy="80" r="16" fill="var(--board-green)" />
          <path
            d="M111 80.5 116 85.5 125.5 75.5"
            stroke="var(--board-green-ink)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <Link
        href={`/etablissements/${bundle.etablissementId}/controle`}
        className="flex items-center gap-3.5 px-6 py-5 transition-colors hover:bg-[color:var(--board-grey-pale)]"
      >
        <div className="min-w-0">
          <p className="m-0 text-[16px] font-semibold tracking-[-0.02em] text-[color:var(--board-ink)]">
            Préparer un contrôle
          </p>
          <p className="mt-1 text-[13px] text-[color:var(--board-grey-ink)]">
            Rassemblez vos pièces avant la visite d&apos;un inspecteur.
          </p>
        </div>
        <span className="ml-auto flex size-[38px] flex-none items-center justify-center rounded-full bg-[color:var(--board-ink)] text-white">
          <ArrowUpRight className="size-4" />
        </span>
      </Link>
    </CarteBoard>
  );
}
