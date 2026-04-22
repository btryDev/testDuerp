// Frise calendaire sur 12 mois.
// Deux modes :
//  - pédagogique (pas d'events passés en props) : données d'exemple
//    figées pour une restauration · 8 salariés · ERP 5ème cat.
//  - réel : utilise `evenements` calculés depuis les vérifications
//    de l'établissement (cf. lib/dashboard/queries → listerEvenementsParMois).
//
// Le header / fallback s'adaptent selon le mode.

type Evenement = {
  mois: number;
  titre: string;
  tag: string;
  hot?: boolean;
} | null;

const EXEMPLE_MOIS: Evenement[] = [
  { mois: 0, titre: "Revue annuelle", tag: "DUERP", hot: true },
  { mois: 1, titre: "Vérif. électrique", tag: "Annuel" },
  { mois: 2, titre: "Extincteurs", tag: "Annuel" },
  { mois: 3, titre: "Hotte — 1ᵉʳ semestre", tag: "Semestriel", hot: true },
  { mois: 4, titre: "Éclairage secours", tag: "Semestriel" },
  { mois: 5, titre: "Point mi-année", tag: "Interne" },
  null,
  null,
  { mois: 8, titre: "Rentrée sécurité", tag: "Interne" },
  { mois: 9, titre: "Hotte — 2ᵉ semestre", tag: "Semestriel" },
  { mois: 10, titre: "Éclairage secours", tag: "Semestriel" },
  { mois: 11, titre: "Préparation DUERP N+1", tag: "Interne" },
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
        e ? { mois: e.mois, titre: e.libelle, tag: e.tag, hot: e.hot } : null,
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

      <div className="relative overflow-x-auto">
        <div className="relative min-w-[960px] pt-6 pb-8">
          <div className="absolute left-0 right-0 top-[54px] h-px bg-rule" />

          <ol className="relative grid grid-cols-12">
            {NOMS_MOIS.map((nom, i) => {
              const ev = mois[i] ?? null;
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
                  <div className="mt-4 min-h-[72px] w-full px-1">
                    {ev ? <CarteEvenement evenement={ev} /> : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-4 text-[0.8rem]">
        <div className="flex items-center gap-4 text-muted-foreground">
          <LegendeDot color="var(--accent-vif)" label="Événement clé" />
          <LegendeDot color="var(--ink)" label="Vérification régulière" />
          <LegendeDot color="var(--rule)" label="Période calme" />
        </div>
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground">
          {modeReel
            ? "Un seul événement par mois — voir tous les détails dans Calendrier."
            : "Votre calendrier réel est généré à partir de vos équipements déclarés."}
        </p>
      </div>
    </section>
  );
}

function CarteEvenement({ evenement }: { evenement: Exclude<Evenement, null> }) {
  const { titre, tag, hot } = evenement;
  return (
    <div
      className={
        "rounded-lg border px-2.5 py-2 text-center " +
        (hot
          ? "border-[color:var(--accent-vif)]/40 bg-[color:var(--accent-vif-soft)]"
          : "border-rule-soft bg-paper-elevated")
      }
    >
      <p
        className={
          "truncate text-[0.8rem] font-medium " +
          (hot ? "text-[color:var(--accent-vif)]" : "text-ink")
        }
      >
        {titre}
      </p>
      <p className="mt-0.5 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
        {tag}
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
