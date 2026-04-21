"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { supprimerEquipement } from "@/lib/equipements/actions";

export function SupprimerEquipementButton({
  id,
  label = "Supprimer",
}: {
  id: string;
  label?: string;
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
            "Supprimer cet équipement ? Les vérifications associées seront également supprimées.",
          )
        )
          return;
        startTransition(async () => {
          await supprimerEquipement(id);
        });
      }}
    >
      {pending ? "Suppression…" : label}
    </Button>
  );
}
