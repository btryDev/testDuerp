"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { supprimerEtablissement } from "@/lib/etablissements/actions";

export function SupprimerEtablissementButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            "Supprimer cet établissement ? Tous ses DUERP, versions et rapports seront également supprimés.",
          )
        )
          return;
        startTransition(async () => {
          await supprimerEtablissement(id);
        });
      }}
    >
      {pending ? "Suppression…" : "Supprimer"}
    </Button>
  );
}
