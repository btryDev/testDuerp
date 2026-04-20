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
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
        selectionne ? "border-foreground/30 bg-muted/30" : "hover:bg-muted/20"
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
        className="mt-1"
      />
      <div>
        <p className="font-medium">{libelle}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </label>
  );
}
