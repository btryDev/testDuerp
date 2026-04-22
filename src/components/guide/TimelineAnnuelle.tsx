"use client";

// Frise calendaire sur 12 mois.
// Deux modes :
//  - pédagogique (pas d'events passés en props) : données d'exemple
//    figées pour une restauration · 8 salariés · ERP 5ème cat.
//  - réel : utilise `evenements` calculés depuis les vérifications.
//
// Quand un mois a plusieurs événements, seul le plus ancien est
// affiché ; un badge « +N » cliquable déplie la liste juste dessous.

import { useState } from "react";

type AutreEvenement = { libelle: string; tag: string; hot: boolean };

type Evenement = {
  mois: number;
  titre: string;
  tag: string;
  hot?: boolean;
  /** Nombre d'autres événements ce mois (hors celui affiché). */
  autres?: number;
  /** Détail des autres événements, dépliés au clic sur « +N ». */
  autresItems?: AutreEvenement[];
} | null;

const EXEMPLE_MOIS: Evenement[] = [
  { mois: 0, titre: "Revue annuelle", tag: "DUERP", hot: true, autres: 0 },
  { mois: 1, titre: "Vérif. électrique", tag: "Annuel", autres: 0 },
  { mois: 2, titre: "Extincteurs", tag: "Annuel", autres: 1 },
  { mois: 3, titre: "Hotte — 1ᵉʳ semestre", tag: "Semestriel", hot: true, autres: 0 },
  { mois: 4, titre: "Éclairage secours", tag: "Semestriel", autres: 0 },
  { mois: 5, titre: "Point mi-année", tag: "Interne", autres: 0 },
  null,
  null,
  { mois: 8, titre: "Rentrée sécurité", tag: "Interne", autres: 0 },
  { mois: 9, titre: "Hotte — 2ᵉ semestre", tag: "Semestriel", autres: 0 },
  { mois: 10, titre: "Éclairage secours", tag: "Semestriel", autres: 0 },
  { mois: 11, titre: "Préparation DUERP N+1", tag: "Interne", autres: 0 },
];

const NOMS_MOIS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Jui",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

export type EvenementMoisReel = {
  mois: number;
  libelle: string;
  tag: string;
  hot: boolean;
  autres: number;
  autresItems: AutreEvenement[];
};

export function TimelineAnnuelle({
  nbEquipements,
  etablissementId,
  evenements,
}: {
  nbEquipements: number;
  etablissementId: string;
  /** Données réelles de l'année — si fournies et non vides, la frise
   *  bascule en mode « calendrier réel ». Sinon on retombe sur
   *  l'exemple pédagogique (restauration type). */
  evenements?: Array<EvenementMoisReel | null>;
}) {
  const nonVidesReels =
    evenements?.filter((e): e is EvenementMoisReel => e !== null).length ?? 0;
  const modeReel = nonVidesReels > 0;

  const mois: Evenement[] = modeReel
    ? (evenements ?? []).map((e) =>
        e
          ? {
              mois: e.mois,
              titre: e.libelle,
              tag: e.tag,
              hot: e.hot,
              autres: e.autres,
              autresItems: e.autresItems,
            }
          : null,
      )
    : EXEMPLE_MOIS;

  // Le fallback (bandeau « déclarez vos équipements ») ne s'affiche
  // que si AUCUN équipement n'est déclaré. En mode réel il n'y a pas
  // lieu de le montrer. En mode exemple (avec équipements mais pas
  // encore de vérifs calculées) on considère que c'est transitoire.
  const montrerFallback = nbEquipements === 0 && !modeReel;
  const anneeCourante = new Date().getFullYear();

  return (
    <section>
      <header className="mb-10 max-w-[72ch]">
        <p className="g-kicker">§ Calendrier · {anneeCourante}</p>
        {modeReel ? (
          <>
            <h2 className="g-h2 mt-3">
              Votre année,{" "}
              <span className="g-h2-em">en un coup d&apos;œil</span>.
            </h2>
            <p className="g-sub mt-3">
              Un événement marquant par mois, tiré de vos vérifications.
              Le détail complet est sur la page{" "}
              <a
                href={`/etablissements/${etablissementId}/calendrier`}
                className="text-ink underline decoration-rule decoration-dotted underline-offset-4 hover:decoration-ink"
              >
                Calendrier
              </a>
              .
            </p>
          </>
        ) : (
          <>
            <h2 className="g-h2 mt-3">
              Une année <span className="g-h2-em">rythmée</span>, pas
              surchargée.
            </h2>
            <p className="g-sub mt-3">
              <strong>Votre calendrier</strong> est généré automatiquement
              à partir des équipements que vous déclarez et de votre
              typologie d&apos;établissement. L&apos;exemple ci-dessous
              correspond à une restauration · 8 salariés · ERP 5ème cat.
            </p>
          </>
        )}
      </header>

      {montrerFallback ? (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-dashed border-[color:var(--accent-vif)]/40 bg-[color:var(--accent-vif-soft)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.9rem] leading-[1.5] text-ink/80">
            <em className="accent-serif not-italic text-[color:var(--accent-vif)]">
              Vous n&apos;avez pas encore déclaré d&apos;équipements.
            </em>{" "}
            Voici un exemple pour une restauration type.
          </p>
          <a
            href={`/etablissements/${etablissementId}/equipements/nouveau`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[color:var(--accent-vif)] px-3.5 py-2 text-[0.82rem] font-medium text-[color:var(--paper-elevated)] transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[0_8px_20px_-8px_color-mix(in_oklch,var(--accent-vif)_60%,transparent)]"
          >
            Déclarer mes équipements →
          </a>
        </div>
      ) : null}

      <TimelineGrille mois={mois} anneeCourante={anneeCourante} />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-4 text-[0.8rem]">
        <div className="flex items-center gap-4 text-muted-foreground">
          <LegendeDot color="var(--accent-vif)" label="Événement clé" />
          <LegendeDot color="var(--ink)" label="Vérification régulière" />
          <LegendeDot color="var(--rule)" label="Période calme" />
        </div>
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground">
          {modeReel
            ? "Cliquez sur « +N » pour déplier les événements multiples du mois."
            : "Votre calendrier réel est généré à partir de vos équipements déclarés."}
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────── */

function TimelineGrille({
  mois,
  anneeCourante,
}: {
  mois: Evenement[];
  anneeCourante: number;
}) {
  const [deplies, setDeplies] = useState<Set<number>>(new Set());
  const toggle = (i: number) => {
    setDeplies((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="relative overflow-x-auto">
      <div className="relative min-w-[960px] pt-6 pb-8">
        <div className="absolute left-0 right-0 top-[54px] h-px bg-rule" />

        <ol className="relative grid grid-cols-12 items-start">
          {NOMS_MOIS.map((nom, i) => {
            const ev = mois[i] ?? null;
            const deplie = deplies.has(i);
            return (
              <li key={i} className="flex flex-col items-center">
                <time
                  dateTime={`${anneeCourante}-${String(i + 1).padStart(2, "0")}`}
                  className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground"
                >
                  {nom}
                </time>
                <span
                  aria-hidden
                  className={
                    "relative mt-4 inline-block rounded-full transition-transform " +
                    (ev?.hot
                      ? "size-3 bg-[color:var(--accent-vif)] ring-4 ring-[color:var(--accent-vif-soft)]"
                      : ev
                        ? "size-2.5 bg-ink"
                        : "size-1.5 bg-rule")
                  }
                />
                <div className="mt-4 w-full px-1">
                  {ev ? (
                    <>
                      <CarteEvenement
                        evenement={ev}
                        deplie={deplie}
                        onToggle={() => toggle(i)}
                      />
                      {deplie && ev.autresItems && ev.autresItems.length > 0 ? (
                        <ul className="mt-1.5 flex flex-col gap-1.5">
                          {ev.autresItems.map((a, idx) => (
                            <li key={idx}>
                              <CarteEvenementCompact evt={a} />
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function CarteEvenement({
  evenement,
  deplie,
  onToggle,
}: {
  evenement: Exclude<Evenement, null>;
  deplie: boolean;
  onToggle: () => void;
}) {
  const { titre, tag, hot, autres = 0 } = evenement;
  const tooltip =
    autres > 0
      ? `${titre} (+${autres} autre${autres > 1 ? "s" : ""} ce mois — cliquez sur +${autres} pour déplier)`
      : titre;
  return (
    <div
      className={
        "relative rounded-lg border px-2 py-2 text-center " +
        (hot
          ? "border-[color:var(--accent-vif)]/40 bg-[color:var(--accent-vif-soft)]"
          : "border-rule-soft bg-paper-elevated")
      }
      title={tooltip}
    >
      {autres > 0 ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label={
            deplie
              ? `Replier les ${autres} autres événements du mois`
              : `Déplier les ${autres} autres événements du mois`
          }
          aria-expanded={deplie}
          className={
            "absolute -right-1.5 -top-1.5 inline-flex min-w-[20px] cursor-pointer items-center justify-center rounded-full px-1.5 py-0.5 font-mono text-[0.58rem] font-semibold shadow-sm transition-colors " +
            (deplie
              ? "bg-[color:var(--accent-vif)] text-[color:var(--paper-elevated)]"
              : "bg-ink text-paper-elevated hover:bg-[color:color-mix(in_oklch,var(--ink)_85%,var(--accent-vif))]")
          }
        >
          {deplie ? `−${autres}` : `+${autres}`}
        </button>
      ) : null}
      <p
        className={
          "line-clamp-2 text-[0.76rem] font-medium leading-tight " +
          (hot ? "text-[color:var(--accent-vif)]" : "text-ink")
        }
      >
        {titre}
      </p>
      <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.14em] text-muted-foreground">
        {tag}
      </p>
    </div>
  );
}

function CarteEvenementCompact({ evt }: { evt: AutreEvenement }) {
  return (
    <div
      className={
        "rounded-md border px-2 py-1.5 text-center " +
        (evt.hot
          ? "border-[color:var(--accent-vif)]/40 bg-[color:var(--accent-vif-soft)]"
          : "border-rule-soft bg-paper-sunk")
      }
      title={evt.libelle}
    >
      <p
        className={
          "line-clamp-2 text-[0.7rem] font-medium leading-tight " +
          (evt.hot ? "text-[color:var(--accent-vif)]" : "text-ink")
        }
      >
        {evt.libelle}
      </p>
      <p className="mt-0.5 font-mono text-[0.54rem] uppercase tracking-[0.14em] text-muted-foreground">
        {evt.tag}
      </p>
    </div>
  );
}

function LegendeDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="inline-block size-2 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
