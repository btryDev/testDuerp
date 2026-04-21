"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { supprimerRapport } from "@/lib/rapports/actions";

export function SupprimerRapportButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            "Supprimer ce rapport ? Le fichier sera retiré du stockage et, si c'était le seul rapport de cette vérification, celle-ci repassera en « à planifier ».",
          )
        )
          return;
        startTransition(async () => {
          await supprimerRapport(id);
        });
      }}
    >
      {pending ? "Suppression…" : "Supprimer"}
    </Button>
  );
}
