import Link from "next/link";
import type { PermisFeu, StatutPermisFeu } from "@prisma/client";
import { LABEL_NATURE } from "@/lib/permis-feu/schema";

const LABEL_STATUT: Record<StatutPermisFeu, string> = {
  brouillon: "Brouillon",
  attente_signatures: "En attente de signatures",
  valide: "Validé",
  en_cours: "Travaux en cours",
  termine: "Terminé",
  annule: "Annulé",
};

const COULEUR_STATUT: Record<StatutPermisFeu, string> = {
  brouillon: "var(--seal)",
  attente_signatures: "oklch(0.72 0.15 70)",
  valide: "var(--accent-vif)",
  en_cours: "var(--minium)",
  termine: "var(--seal)",
  annule: "var(--muted-foreground)",
};

function formatDateCourte(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PermisFeuCard({
  etablissementId,
  permis,
}: {
  etablissementId: string;
  permis: PermisFeu;
}) {
  const color = COULEUR_STATUT[permis.statut];
  return (
    <Link
      href={`/etablissements/${etablissementId}/permis-feu/${permis.id}`}
      className="cartouche group relative block overflow-hidden transition-colors hover:bg-paper-sunk"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between gap-4 px-6 py-5">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[1.25rem] font-light tabular-nums text-[color:var(--seal)]">
            PF-{String(permis.numero).padStart(3, "0")}
          </span>
          <div className="min-w-0">
            <p className="text-[0.95rem] font-semibold leading-tight group-hover:underline">
              {permis.prestataireRaison}
            </p>
            <p className="mt-0.5 truncate text-[0.78rem] text-muted-foreground">
              {permis.lieu}
            </p>
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.1em]"
          style={{
            color,
            background: `color-mix(in oklch, ${color} 12%, transparent)`,
          }}
        >
          {LABEL_STATUT[permis.statut]}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-dashed border-rule/50 px-6 py-3">
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-muted-foreground">
          Du {formatDateCourte(permis.dateDebut)} au{" "}
          {formatDateCourte(permis.dateFin)}
        </span>
        <span className="truncate text-[0.78rem] text-[color:var(--ink)]/75">
          {permis.naturesTravaux.map((n) => LABEL_NATURE[n]).join(" · ")}
        </span>
      </div>
    </Link>
  );
}
