// Barres mensuelles des obligations de vérification — 12 mois glissants
// (mois courant mis en évidence). Server component : reçoit les données
// agrégées depuis `compterObligationsParMois`.

export type BarMois = {
  mois: number; // 0-11 (janv = 0)
  annee: number;
  couvert: number; // statuts réalisés / planifiés
  aVenir: number; // à planifier / planifiée > aujourd'hui
  retard: number; // dépassée / a_planifier avec datePrevue passée
};

const LABELS_MOIS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function BarsObligations({
  data,
  moisCourant,
}: {
  data: BarMois[];
  moisCourant: number;
}) {
  // Hauteur normalisée sur le max total (100%).
  const totals = data.map((d) => d.couvert + d.aVenir + d.retard);
  const max = Math.max(1, ...totals);

  return (
    <div className="grid h-[160px] grid-cols-12 items-end gap-2.5">
      {data.map((d, i) => {
        const total = d.couvert + d.aVenir + d.retard;
        const heightPct = (total / max) * 100;
        const isCourant = d.mois === moisCourant;
        const tone =
          d.retard > 0
            ? "var(--minium)"
            : d.aVenir > 0
              ? "var(--accent-vif)"
              : total > 0
                ? "var(--ink)"
                : "var(--rule)";
        return (
          <div
            key={`${d.annee}-${d.mois}`}
            className="flex h-full flex-col items-center justify-end gap-1.5"
          >
            <div
              className={
                "w-full rounded-t transition-[height] duration-500 " +
                (isCourant
                  ? "outline outline-2 outline-offset-2 outline-[color:var(--accent-vif)]"
                  : "")
              }
              style={{
                height: `${heightPct}%`,
                minHeight: total > 0 ? 4 : 0,
                background: tone,
              }}
              title={`${total} obligation${total > 1 ? "s" : ""} — ${d.couvert} couvertes, ${d.aVenir} à venir, ${d.retard} en retard`}
            />
            <span className="font-mono text-[0.66rem] text-muted-foreground">
              {LABELS_MOIS[d.mois]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function LegendeBarsObligations() {
  return (
    <span className="flex items-center gap-3 text-[0.72rem] text-muted-foreground">
      <LegendDot color="var(--ink)" /> Couvert
      <LegendDot color="var(--accent-vif)" /> À venir
      <LegendDot color="var(--minium)" /> Retard
    </span>
  );
}

function LegendDot({ color }: { color: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        aria-hidden
        className="inline-block size-1.5 rounded-full"
        style={{ background: color }}
      />
    </span>
  );
}
