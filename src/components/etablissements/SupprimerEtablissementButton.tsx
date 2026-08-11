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
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
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
        <section
          role="alert"
          className="rounded-[calc(var(--radius)*1.4)] border border-dashed border-[color:var(--minium)]/50 bg-[color:var(--minium)]/8 px-5 py-4"
        >
          <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.2em] text-[color:var(--minium)]">
            Suppression refusée · conservation légale
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/85">
            {refus.message}
          </p>
          <Link
            href={refus.exportHref}
            className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
          >
            Exporter mes documents
          </Link>
        </section>
      )}
    </div>
  );
}
