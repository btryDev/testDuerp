"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  supprimerEntreprise,
  type SuppressionEntrepriseResult,
} from "@/lib/entreprises/actions";

/**
 * Même logique que la suppression d'établissement : le refus de conservation
 * (art. R. 4121-4 CT) n'est pas une erreur technique, c'est une réponse que
 * l'utilisateur doit pouvoir lire. En cas de succès l'action redirige, donc le
 * composant ne reçoit rien.
 */
export function SupprimerEntrepriseButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [refus, setRefus] = useState<SuppressionEntrepriseResult | null>(null);

  return (
    <div className="space-y-3">
      <Button
        variant="destructive"
        disabled={pending}
        onClick={() => {
          if (
            !confirm(
              "Supprimer cette entreprise et son établissement ? Si des " +
                "versions de votre DUERP sont archivées, la suppression sera " +
                "refusée : la loi impose de les conserver 40 ans.",
            )
          ) {
            return;
          }
          setRefus(null);
          startTransition(async () => {
            const resultat = await supprimerEntreprise(id);
            if (resultat?.statut === "refus") setRefus(resultat);
          });
        }}
      >
        {pending ? "Suppression…" : "Supprimer l'entreprise"}
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
