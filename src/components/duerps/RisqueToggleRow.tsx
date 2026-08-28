"use client";

import { useTransition } from "react";
import { toggleRisqueReferentiel } from "@/lib/risques/actions";

type Props = {
  uniteId: string;
  referentielId: string;
  libelle: string;
  description?: string;
  selectionne: boolean;
};

export function RisqueToggleRow({
  uniteId,
  referentielId,
  libelle,
  description,
  selectionne,
}: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-[16px] border p-3 transition-colors ${
        selectionne
          ? "border-[color:var(--board-ink)] bg-[color:var(--board-slate-pale)]"
          : "border-[color:var(--board-slate-line)] hover:bg-[color:var(--board-slate-pale)]"
      } ${pending ? "opacity-60" : ""}`}
    >
      <input
        type="checkbox"
        checked={selectionne}
        disabled={pending}
        onChange={() => {
          startTransition(async () => {
            await toggleRisqueReferentiel(uniteId, referentielId);
          });
        }}
        className="mt-1 accent-[color:var(--board-ink)]"
      />
      <div className="min-w-0">
        <p className="m-0 text-[14px] font-medium leading-[1.45] text-[color:var(--board-ink)]">
          {libelle}
        </p>
        {description && (
          <p className="m-0 mt-0.5 max-w-[62ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
            {description}
          </p>
        )}
      </div>
    </label>
  );
}
