import Link from "next/link";
import type { Intervention } from "@prisma/client";
import { COULEUR_PRIORITE, LABEL_PRIORITE } from "@/lib/interventions/schema";

function formatDateCourte(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function rapportRelatif(d: Date): string {
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 1) return "aujourd'hui";
  if (diff < 7) return `${diff}j`;
  if (diff < 30) return `${Math.floor(diff / 7)}s`;
  return `${Math.floor(diff / 30)}m`;
}

export function TicketCard({
  etablissementId,
  intervention,
}: {
  etablissementId: string;
  intervention: Intervention;
}) {
  const color = COULEUR_PRIORITE[intervention.priorite];
  const enRetard =
    intervention.echeance &&
    intervention.echeance < new Date() &&
    intervention.statut !== "fait" &&
    intervention.statut !== "annule";
  return (
    <Link
      href={`/etablissements/${etablissementId}/interventions/${intervention.id}`}
      className="group block rounded-lg border border-[color:var(--rule-soft)] bg-[color:var(--paper-elevated)] p-3 transition-colors hover:border-[color:var(--warm)]"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-[0.88rem] font-medium leading-tight group-hover:underline">
          {intervention.titre}
        </p>
        <span
          className="shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.1em]"
          style={{ color }}
        >
          {LABEL_PRIORITE[intervention.priorite]}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.68rem] text-muted-foreground">
        <span>#{String(intervention.numero).padStart(3, "0")}</span>
        {intervention.localisation && (
          <>
            <span>·</span>
            <span className="truncate max-w-[120px]">
              {intervention.localisation}
            </span>
          </>
        )}
        {intervention.echeance && (
          <>
            <span>·</span>
            <span
              style={{
                color: enRetard ? "var(--minium)" : undefined,
              }}
            >
              {enRetard ? "⚠ " : ""}
              {formatDateCourte(intervention.echeance)}
            </span>
          </>
        )}
        <span>·</span>
        <span>{rapportRelatif(intervention.createdAt)}</span>
      </div>
      {intervention.photos.length > 0 && (
        <div className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground">
          📎 {intervention.photos.length} photo
          {intervention.photos.length > 1 ? "s" : ""}
        </div>
      )}
    </Link>
  );
}
