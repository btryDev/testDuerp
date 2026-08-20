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
        variant="board"
        size="board"
        onClick={() => setOuvert(true)}
      >
        Clôturer le ticket
      </Button>
    );
  }

  return (
    <div className="space-y-4 rounded-[22px] bg-[color:var(--board-slate-pale)] p-5">
      <div>
        <p className="board-eyebrow m-0 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
          Clôturer
        </p>
        <h3 className="board-titre m-0 mt-2 text-[17px]">
          Comment ce ticket a-t-il été résolu&nbsp;?
        </h3>
      </div>

      <textarea
        rows={3}
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        maxLength={2000}
        className="champ-board bg-[color:var(--board-card)]"
        placeholder="Ex : Porte débloquée après remplacement du mécanisme de verrou. Intervention réalisée par Serrurerie Martin, facture conservée."
      />

      {risqueLieLibelle && (
        <label className="flex cursor-pointer items-start gap-3 rounded-[18px] bg-[color:var(--board-card)] p-4 ring-1 ring-[color:var(--board-slate-line)]">
          <input
            type="checkbox"
            checked={reevaluer}
            onChange={(e) => setReevaluer(e.target.checked)}
            className="mt-1"
          />
          <div className="text-[13px]">
            <p className="m-0 font-semibold">
              Déclencher la réévaluation du risque DUERP lié
            </p>
            <p className="m-0 mt-1.5 text-[12.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
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
          variant="board"
          size="board"
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
          {pending ? "…" : "Confirmer la clôture"}
        </Button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="text-[12.5px] font-semibold text-[color:var(--board-slate-mid)] hover:text-[color:var(--board-ink)]"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
