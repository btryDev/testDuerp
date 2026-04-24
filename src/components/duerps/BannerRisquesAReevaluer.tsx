import Link from "next/link";

type RisqueLite = {
  id: string;
  libelle: string;
  uniteNom: string;
  uniteId: string;
  duerpId: string;
  dernierTicket: { titre: string; dateCloture: Date | null; numero: number };
};

/**
 * Bandeau affiché en tête du DUERP quand des risques ont été marqués
 * à recoter suite à la clôture d'un ticket. Matérialise la boucle
 * ticket ↔ DUERP imposée par l'art. R4121-2 CT (mise à jour à chaque
 * changement important).
 */
export function BannerRisquesAReevaluer({
  risques,
}: {
  risques: RisqueLite[];
}) {
  if (risques.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[color:var(--minium)]/40 bg-[color:color-mix(in_oklch,var(--minium)_6%,transparent)] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--minium)]">
            À recoter · Art. R4121-2 CT
          </p>
          <h2 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.015em]">
            {risques.length} risque{risques.length > 1 ? "s" : ""} à
            réévaluer suite à résolution de ticket
            {risques.length > 1 ? "s" : ""}
          </h2>
          <p className="mt-2 max-w-prose text-[0.88rem] text-[color:var(--ink)]">
            Un ticket clôturé a potentiellement changé l&apos;exposition —
            recotez ces risques pour maintenir votre DUERP à jour.
          </p>
        </div>
      </div>
      <ul className="mt-5 space-y-2">
        {risques.slice(0, 5).map((r) => (
          <li key={r.id}>
            <Link
              href={`/duerp/${r.duerpId}/risques/${r.uniteId}/${r.id}`}
              className="group flex items-start justify-between gap-3 rounded-lg bg-[color:var(--paper-elevated)] px-4 py-3 transition-colors hover:bg-[color:var(--paper-sunk)]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[0.92rem] font-medium group-hover:underline">
                  {r.libelle}
                </p>
                <p className="mt-0.5 text-[0.76rem] text-muted-foreground">
                  {r.uniteNom} · suite au ticket #
                  {String(r.dernierTicket.numero).padStart(3, "0")}{" "}
                  <em>{r.dernierTicket.titre}</em>
                </p>
              </div>
              <span
                aria-hidden
                className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[color:var(--minium)] group-hover:underline"
              >
                Recoter →
              </span>
            </Link>
          </li>
        ))}
        {risques.length > 5 && (
          <li className="px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
            + {risques.length - 5} autre{risques.length - 5 > 1 ? "s" : ""}…
          </li>
        )}
      </ul>
    </section>
  );
}
