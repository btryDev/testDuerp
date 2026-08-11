"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  supprimerEquipement,
  type SuppressionEquipementResult,
} from "@/lib/equipements/actions";

/**
 * Retirer un équipement ne détruit plus son historique : dès qu'une
 * vérification porte un rapport, une action corrective ou une date de
 * réalisation, l'équipement est **désactivé** et ses preuves sont conservées
 * (art. L. 4711-5 CT). Le message de confirmation annonçait exactement
 * l'inverse, et le résultat de l'action — désactivation, ou échec du recalcul
 * des échéances — était jeté.
 */
export function SupprimerEquipementButton({
  id,
  label = "Supprimer",
}: {
  id: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [resultat, setResultat] = useState<SuppressionEquipementResult | null>(
    null,
  );

  const estErreur = resultat?.statut === "erreur";

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          if (
            !confirm(
              "Retirer cet équipement du parc ? Il ne générera plus d'échéance. " +
                "Ses rapports de vérification et ses actions correctives sont " +
                "conservés : la loi impose de pouvoir les présenter en cas de " +
                "contrôle.",
            )
          )
            return;
          setResultat(null);
          startTransition(async () => {
            setResultat(await supprimerEquipement(id));
          });
        }}
      >
        {pending ? "Retrait…" : label}
      </Button>

      {resultat && resultat.statut !== "supprime" && (
        <section
          role="alert"
          className={
            "rounded-[calc(var(--radius)*1.4)] border border-dashed px-5 py-4 " +
            (estErreur
              ? "border-[color:var(--minium)]/50 bg-[color:var(--minium)]/8"
              : "border-foreground/20 bg-foreground/5")
          }
        >
          <p
            className={
              "font-mono text-[0.62rem] font-medium uppercase tracking-[0.2em] " +
              (estErreur
                ? "text-[color:var(--minium)]"
                : "text-foreground/70")
            }
          >
            {estErreur
              ? "Échéances non recalculées"
              : "Équipement retiré · historique conservé"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/85">
            {resultat.message}
          </p>
        </section>
      )}
    </div>
  );
}
