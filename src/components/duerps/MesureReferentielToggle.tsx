"use client";

import { useTransition } from "react";
import { toggleMesureReferentiel } from "@/lib/mesures/actions";
import { LABEL_TYPE_MESURE } from "@/lib/mesures/labels";
import type { TypeMesure } from "@/lib/referentiels/types";

type Props = {
  risqueId: string;
  mesureRefId: string;
  libelle: string;
  type: TypeMesure;
  selectionne: boolean;
};

export function MesureReferentielToggle({
  risqueId,
  mesureRefId,
  libelle,
  type,
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
            await toggleMesureReferentiel(risqueId, mesureRefId);
          });
        }}
        className="mt-1"
      />
      <div>
        <p className="font-medium">{libelle}</p>
        <p className="text-xs text-muted-foreground">
          {LABEL_TYPE_MESURE[type]}
        </p>
      </div>
    </label>
  );
}
