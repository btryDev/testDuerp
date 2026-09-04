"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useConfirmation } from "@/components/ui-kit/Confirmation";
import { supprimerRisque } from "@/lib/risques/actions";

export function SupprimerRisqueButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const { demander, confirmation } = useConfirmation();

  return (
    <>
      <Button
        variant="boardClair"
        size="boardSm"
        disabled={pending}
        onClick={() =>
          demander({
            titre: "Supprimer ce risque de l'unité de travail ?",
            detail:
              "Sa cotation et les mesures qui lui étaient rattachées — celles " +
              "déjà en place comme celles à prévoir — sont supprimées avec " +
              "lui. Le DUERP n'en gardera pas trace.",
            agir: "Supprimer le risque",
            alors: () =>
              startTransition(async () => {
                await supprimerRisque(id);
              }),
          })
        }
      >
        Supprimer
      </Button>
      {confirmation}
    </>
  );
}
