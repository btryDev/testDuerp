"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ActionPlanState } from "@/lib/actions/plan";

type Props = {
  action: (
    prev: ActionPlanState,
    formData: FormData,
  ) => Promise<ActionPlanState>;
  rapportsDisponibles?: { id: string; label: string }[];
};

export function CloturerActionForm({ action, rapportsDisponibles }: Props) {
  const [state, formAction, pending] = useActionState<
    ActionPlanState,
    FormData
  >(action, { status: "idle" });

  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ]?.[0] : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="commentaire">
          Justificatif de clôture *
        </Label>
        <textarea
          id="commentaire"
          name="commentaire"
          required
          rows={3}
          className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
          placeholder="Décrivez brièvement l'action menée et son résultat (traçabilité)."
        />
        {err("commentaire") && (
          <p className="text-sm text-destructive">{err("commentaire")}</p>
        )}
      </div>

      {rapportsDisponibles && rapportsDisponibles.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="rapportId">Rapport de levée (facultatif)</Label>
          <select
            id="rapportId"
            name="rapportId"
            className="h-9 w-full rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm"
            defaultValue=""
          >
            <option value="">— Aucun rapport spécifique —</option>
            {rapportsDisponibles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      {state.status === "success" && (
        <p className="text-sm text-emerald-700">Action clôturée.</p>
      )}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Clôture…" : "Clôturer l'action"}
        </Button>
      </div>
    </form>
  );
}
