"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { genererCalendrier } from "@/lib/calendrier/actions";

// Bouton du board éditorial : pilule à bordure cheveu, hover glacier —
// la même touche que les portes rondes des cartes.
export function GenererCalendrierButton({
  etablissementId,
  libelle = "Générer le calendrier",
}: {
  etablissementId: string;
  libelle?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await genererCalendrier(etablissementId);
            setMessage(
              `Calendrier régénéré : ${res.created} vérification${
                res.created > 1 ? "s" : ""
              } planifiée${res.created > 1 ? "s" : ""} (${res.deleted} remplacée${
                res.deleted > 1 ? "s" : ""
              }).`,
            );
            router.refresh();
          })
        }
        className="inline-flex items-center gap-2 rounded-full border border-[color:rgba(10,10,10,.16)] bg-[color:var(--board-card)] px-4 py-[9px] text-[12.5px] font-semibold text-[color:var(--board-ink)] transition-colors hover:bg-[color:var(--board-blue-pale)] disabled:cursor-wait disabled:opacity-60"
      >
        <RefreshCw
          className={"size-3.5 " + (pending ? "animate-spin" : "")}
        />
        {pending ? "Génération…" : libelle}
      </button>
      {message && (
        <p className="m-0 text-[12px] text-[color:var(--board-slate-mid)]">
          {message}
        </p>
      )}
    </div>
  );
}
