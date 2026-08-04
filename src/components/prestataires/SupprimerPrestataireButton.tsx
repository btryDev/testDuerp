"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { supprimerPrestataire } from "@/lib/prestataires/actions";

export function SupprimerPrestataireButton({
  etablissementId,
  prestataireId,
}: {
  etablissementId: string;
  prestataireId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            "Supprimer ce prestataire ? Les pièces justificatives téléversées seront retirées du stockage.",
          )
        )
          return;
        startTransition(async () => {
          await supprimerPrestataire(etablissementId, prestataireId);
        });
      }}
    >
      {pending ? "Suppression…" : "Supprimer"}
    </Button>
  );
}
