"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sauverSection4 } from "@/lib/accessibilite/actions";
import type { RegistreActionState } from "@/lib/accessibilite/actions";

function fmtDate(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function FormSection4({
  etablissementId,
  initial,
}: {
  etablissementId: string;
  initial: {
    equipementsAccessibilite: string | null;
    modalitesMaintenance: string | null;
    dernierControleMaintenance: Date | null;
  } | null;
}) {
  const boundAction = sauverSection4.bind(null, etablissementId);
  const [state, formAction, pending] = useActionState<
    RegistreActionState,
    FormData
  >(boundAction, { status: "idle" });

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="equipementsAccessibilite">
          Équipements d&apos;accessibilité présents
        </Label>
        <textarea
          id="equipementsAccessibilite"
          name="equipementsAccessibilite"
          defaultValue={initial?.equipementsAccessibilite ?? ""}
          rows={4}
          maxLength={4000}
          className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
          placeholder="Ex : rampe d'accès en entrée, plateforme élévatrice vers la salle, sanitaires PMR au RDC, bande de guidage podotactile, boucle magnétique au comptoir."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="modalitesMaintenance">
          Modalités de maintenance de ces équipements
        </Label>
        <textarea
          id="modalitesMaintenance"
          name="modalitesMaintenance"
          defaultValue={initial?.modalitesMaintenance ?? ""}
          rows={4}
          maxLength={4000}
          className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
          placeholder="Ex : contrôle annuel de la plateforme élévatrice par Otis, vérification mensuelle des bandes podotactiles en interne, contrat de maintenance boucle magnétique avec Sonova."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dernierControleMaintenance">
          Date du dernier contrôle de maintenance
        </Label>
        <Input
          id="dernierControleMaintenance"
          name="dernierControleMaintenance"
          type="date"
          defaultValue={fmtDate(initial?.dernierControleMaintenance ?? null)}
          className="max-w-xs"
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      {state.status === "success" && state.section === 4 && (
        <p className="text-sm text-[color:var(--accent-vif)]">
          ✓ Section 4 enregistrée.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer la section 4"}
      </Button>
    </form>
  );
}
