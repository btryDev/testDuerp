"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleRisqueTransverse } from "@/lib/transverses/actions";

/**
 * Une question transverse, et son couple Oui / Non.
 *
 * Seul « Oui » peut apparaître sélectionné : `active` se déduit de l'existence
 * d'un `Risque` en base, et répondre « Non » supprime cette ligne
 * (`toggleRisqueTransverse`). Un « non » délibéré et une question jamais lue
 * produisent donc le même état — mettre « Non » en évidence par défaut
 * afficherait une réponse que personne n'a donnée, sur un document à valeur
 * légale. Tant que le refus n'est pas persisté, l'absence de réponse se montre
 * comme telle : aucun des deux boutons n'est mis en avant.
 */
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
          variant="outline"
          disabled={pending}
          onClick={() => set(false)}
        >
          Non
        </Button>
      </div>
    </li>
  );
}
