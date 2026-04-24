import { cn } from "@/lib/utils";
import type { StatutPiece } from "@/lib/prestataires/vigilance";
import { messageExpiration } from "@/lib/prestataires/vigilance";

const STYLE: Record<StatutPiece, string> = {
  a_jour: "bg-[color:var(--accent-vif-soft)] text-[color:var(--accent-vif)]",
  expire_bientot: "bg-amber-100 text-amber-900",
  expiree:
    "bg-[color:color-mix(in_oklch,var(--minium)_14%,transparent)] text-[color:var(--minium)]",
  manquante: "bg-[color:var(--paper-sunk)] text-[color:var(--seal)]",
};

const ICONE: Record<StatutPiece, string> = {
  a_jour: "●",
  expire_bientot: "◐",
  expiree: "■",
  manquante: "—",
};

const LABEL: Record<StatutPiece, string> = {
  a_jour: "À jour",
  expire_bientot: "Expire bientôt",
  expiree: "Expirée",
  manquante: "Non fournie",
};

export function VigilancePiecePill({
  libelle,
  statut,
  jours,
  className,
}: {
  libelle: string;
  statut: StatutPiece;
  jours: number | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-[color:var(--rule-soft)] bg-[color:var(--paper-elevated)] px-3 py-2",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-mono text-[0.85rem]",
          STYLE[statut],
        )}
      >
        {ICONE[statut]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="label-admin">{libelle}</div>
        <div className="mt-0.5 text-[0.85rem] font-medium text-[color:var(--ink)]">
          {LABEL[statut]}
        </div>
        <div className="text-[0.72rem] text-[color:var(--muted-foreground)]">
          {messageExpiration(jours)}
        </div>
      </div>
    </div>
  );
}
