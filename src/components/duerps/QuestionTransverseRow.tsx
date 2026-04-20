"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleRisqueTransverse } from "@/lib/transverses/actions";

type Props = {
  duerpId: string;
  referentielId: string;
  intitule: string;
  libelleRisque: string;
  active: boolean;
};

export function QuestionTransverseRow({
  duerpId,
  referentielId,
  intitule,
  libelleRisque,
  active,
}: Props) {
  const [pending, startTransition] = useTransition();

  const set = (desiredActive: boolean) => {
    if (desiredActive === active) return;
    startTransition(async () => {
      await toggleRisqueTransverse(duerpId, referentielId);
    });
  };

  return (
    <li className="rounded-lg border bg-card p-4">
      <p className="font-medium">{intitule}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Si oui → ajoute le risque « {libelleRisque} » à votre DUERP.
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant={active ? "default" : "outline"}
          disabled={pending}
          onClick={() => set(true)}
        >
          Oui
        </Button>
        <Button
          size="sm"
          variant={!active ? "default" : "outline"}
          disabled={pending}
          onClick={() => set(false)}
        >
          Non
        </Button>
      </div>
    </li>
  );
}
