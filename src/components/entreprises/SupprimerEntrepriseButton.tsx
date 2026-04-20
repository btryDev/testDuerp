"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { supprimerEntreprise } from "@/lib/entreprises/actions";

export function SupprimerEntrepriseButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            "Supprimer définitivement cette entreprise et ses DUERP ? Cette action est irréversible.",
          )
        ) {
          return;
        }
        startTransition(async () => {
          await supprimerEntreprise(id);
        });
      }}
    >
      {pending ? "Suppression…" : "Supprimer l'entreprise"}
    </Button>
  );
}
