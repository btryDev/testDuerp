import Link from "next/link";
import type { Intervention } from "@prisma/client";
import { COULEUR_PRIORITE, LABEL_PRIORITE } from "@/lib/interventions/schema";
import { formaterJourMoisFr, joursCivilsEntre } from "@/lib/dates";
import { estEnRetard } from "@/lib/dates/retard";

function formatDateCourte(d: Date | null): string | null {
  if (!d) return null;
  return formaterJourMoisFr(d);
}

/**
 * Ancienneté du ticket, en jours civils de Paris. Le décompte passait par
 * une division de l'écart en millisecondes par 86 400 000 : un ticket créé
 * hier à 23 h et consulté ce matin à 8 h donnait `0`, donc « aujourd'hui »,
 * alors qu'un minuit a bien été franchi. `joursCivilsEntre` compte les
 * minuits, pas les 24 h.
 */
function rapportRelatif(d: Date, aujourdhui: Date): string {
  const diff = joursCivilsEntre(d, aujourdhui);
  if (diff < 1) return "aujourd'hui";
  if (diff < 7) return `${diff}j`;
  if (diff < 30) return `${Math.floor(diff / 7)}s`;
  return `${Math.floor(diff / 30)}m`;
}

export function TicketCard({
  etablissementId,
  intervention,
  aujourdhui,
}: {
  etablissementId: string;
  intervention: Intervention;
  /** Horloge figée par la page serveur. Jamais `new Date()` au rendu :
   *  ce composant est aussi rendu côté client, et deux horloges donnent
   *  deux couleurs d'échéance (écart d'hydratation). */
  aujourdhui: Date;
}) {
  const color = COULEUR_PRIORITE[intervention.priorite];
  // Retard = prédicat partagé (ADR-011) : une échéance datée d'aujourd'hui
  // n'est pas en retard. La comparaison brute `echeance < new Date()`
  // faisait rougir dès 02:00 (heure d'été) une échéance du jour même.
  const enRetard =
    intervention.echeance !== null &&
    estEnRetard(intervention.echeance, aujourdhui) &&
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
        <span>{rapportRelatif(intervention.createdAt, aujourdhui)}</span>
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
