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
    <li className="carte-board px-7 py-6 sm:px-8">
      <p className="m-0 text-[16px] font-semibold leading-[1.3] tracking-[-0.01em] text-[color:var(--board-ink)]">
        {intitule}
      </p>
      <p className="m-0 mt-1.5 max-w-[66ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
        Si oui → ajoute le risque « {libelleRisque} » à votre DUERP.
      </p>
      <div className="mt-4 flex gap-2">
        <Button
          variant={active ? "board" : "boardClair"}
          size="boardSm"
          disabled={pending}
          onClick={() => set(true)}
        >
          Oui
        </Button>
        <Button
          variant="boardClair"
          size="boardSm"
          disabled={pending}
          onClick={() => set(false)}
        >
          Non
        </Button>
      </div>
    </li>
  );
}
