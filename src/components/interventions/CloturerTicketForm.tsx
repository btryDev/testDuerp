"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cloturerIntervention } from "@/lib/interventions/actions";

export function CloturerTicketForm({
  etablissementId,
  interventionId,
  risqueLieLibelle,
}: {
  etablissementId: string;
  interventionId: string;
  risqueLieLibelle: string | null;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState("");
  const [reevaluer, setReevaluer] = useState(Boolean(risqueLieLibelle));
  const [pending, startTransition] = useTransition();

  if (!ouvert) {
    return (
      <Button
        type="button"
        size="sm"
        onClick={() => setOuvert(true)}
      >
        ✓ Clôturer le ticket
      </Button>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-dashed border-[color:var(--accent-vif)]/40 bg-[color:var(--accent-vif-soft)] p-5">
      <div>
        <p className="label-admin">Clôturer</p>
        <h3 className="mt-2 text-[1.05rem] font-semibold tracking-[-0.01em]">
          Comment ce ticket a-t-il été résolu ?
        </h3>
      </div>

      <textarea
        rows={3}
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        maxLength={2000}
        className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
        placeholder="Ex : Porte débloquée après remplacement du mécanisme de verrou. Intervention réalisée par Serrurerie Martin, facture conservée."
      />

      {risqueLieLibelle && (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[color:var(--warm)] bg-[color:var(--paper-elevated)] p-3">
          <input
            type="checkbox"
            checked={reevaluer}
            onChange={(e) => setReevaluer(e.target.checked)}
            className="mt-1"
          />
          <div className="text-[0.85rem]">
            <p className="font-medium">
              Déclencher la réévaluation du risque DUERP lié
            </p>
            <p className="mt-1 text-[0.78rem] text-muted-foreground">
              <em>« {risqueLieLibelle} »</em> sera marqué comme à recoter dans
              votre DUERP. C&apos;est la boucle vertueuse : le terrain nourrit
              le document légal.
            </p>
          </div>
        </label>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={pending || !motif.trim()}
          onClick={() =>
            startTransition(async () => {
              await cloturerIntervention(
                etablissementId,
                interventionId,
                motif.trim(),
                reevaluer,
              );
              setOuvert(false);
            })
          }
        >
          {pending ? "…" : "✓ Confirmer la clôture"}
        </Button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground hover:text-ink"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
