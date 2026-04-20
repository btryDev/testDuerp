"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { supprimerRisque } from "@/lib/risques/actions";

export function SupprimerRisqueButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => {
        if (!confirm("Supprimer ce risque et ses mesures associées ?")) return;
        startTransition(async () => {
          await supprimerRisque(id);
        });
      }}
    >
      Supprimer
    </Button>
  );
}
