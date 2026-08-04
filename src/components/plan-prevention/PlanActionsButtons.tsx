"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cloturerPlan, supprimerPlan } from "@/lib/plan-prevention/actions";

export function BoutonCloturer({ planId }: { planId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Clôturer ce plan ? L'intervention est terminée.")) return;
        startTransition(async () => {
          await cloturerPlan(planId);
        });
      }}
    >
      {pending ? "…" : "✓ Clôturer le plan"}
    </Button>
  );
}

export function BoutonSupprimerPlan({ planId }: { planId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Supprimer / annuler ce plan ?")) return;
        startTransition(async () => {
          await supprimerPlan(planId);
        });
      }}
    >
      {pending ? "…" : "Supprimer"}
    </Button>
  );
}
