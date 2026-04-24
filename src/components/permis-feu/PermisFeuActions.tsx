"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  marquerEnCours,
  marquerTermine,
  supprimerPermisFeu,
} from "@/lib/permis-feu/actions";

export function BoutonDemarrer({ permisFeuId }: { permisFeuId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await marquerEnCours(permisFeuId);
        })
      }
    >
      {pending ? "…" : "Démarrer les travaux →"}
    </Button>
  );
}

export function BoutonTerminer({ permisFeuId }: { permisFeuId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            "Confirmer la fin de la surveillance post-travaux ? Aucun point chaud, aucune fumée à signaler ?",
          )
        )
          return;
        startTransition(async () => {
          await marquerTermine(permisFeuId);
        });
      }}
    >
      {pending ? "…" : "✓ Marquer terminé"}
    </Button>
  );
}

export function BoutonSupprimer({ permisFeuId }: { permisFeuId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Supprimer ce permis de feu ? Cette action est définitive."))
          return;
        startTransition(async () => {
          await supprimerPermisFeu(permisFeuId);
        });
      }}
    >
      {pending ? "…" : "Supprimer"}
    </Button>
  );
}
