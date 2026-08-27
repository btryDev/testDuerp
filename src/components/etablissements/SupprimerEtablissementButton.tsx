"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  supprimerEtablissement,
  type SuppressionResult,
} from "@/lib/etablissements/actions";

/**
 * La suppression peut être **refusée par la loi** : les versions figées du DUERP
 * se conservent 40 ans (art. R. 4121-4 CT). L'action ne redirige donc plus
 * systématiquement, elle peut rendre un refus motivé — et ce refus doit être
 * lu par l'utilisateur. Ignorer la valeur de retour, comme on le faisait,
 * produisait le pire des comportements : le clic ne faisait rien, sans un mot
 * d'explication.
 *
 * En cas de succès, l'action redirige côté serveur : le composant ne reçoit
 * rien et la navigation se fait seule.
 */
export function SupprimerEtablissementButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [refus, setRefus] = useState<SuppressionResult | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="boardClair"
        size="boardSm"
        disabled={pending}
        onClick={() => {
          if (
            !confirm(
              "Supprimer cet établissement ? Ses équipements, vérifications et " +
                "rapports seront effacés. Si des versions de votre DUERP sont " +
                "archivées, la suppression sera refusée : la loi impose de les " +
                "conserver 40 ans.",
            )
          )
            return;
          setRefus(null);
          startTransition(async () => {
            const resultat = await supprimerEtablissement(id);
            if (resultat?.statut === "refus") setRefus(resultat);
          });
        }}
      >
        {pending ? "Suppression…" : "Supprimer"}
      </Button>

      {refus && (
        // Le refus est un état, pas une décoration : champ du signal et
        // encre du signal, jamais l'un sans l'autre.
        <section
          role="alert"
          className="rounded-[22px] bg-[color:var(--board-signal-wash)] px-5 py-4 ring-1 ring-[color:var(--board-signal)]"
        >
          <p className="board-eyebrow m-0 text-[10px] tracking-[0.16em] text-[color:var(--board-signal-ink)]">
            Suppression refusée · conservation légale
          </p>
          <p className="m-0 mt-2 max-w-[66ch] text-[13.5px] leading-[1.6] text-[color:var(--board-ink)]">
            {refus.message}
          </p>
          <Link
            href={refus.exportHref}
            className="mt-3 inline-block text-[12.5px] font-semibold text-[color:var(--board-blue-ink)] hover:text-[color:var(--board-ink)]"
          >
            Exporter mes documents
          </Link>
        </section>
      )}
    </div>
  );
}
