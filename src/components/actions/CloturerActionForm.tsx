"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
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
      <div>
        <label className="label-board" htmlFor="commentaire">
          Justificatif de clôture *
        </label>
        <textarea
          id="commentaire"
          name="commentaire"
          required
          rows={3}
          className="champ-board"
          placeholder="Décrivez brièvement l'action menée et son résultat (traçabilité)."
        />
        {err("commentaire") && (
          <p className="m-0 mt-1.5 text-[12.5px] text-[color:var(--board-signal-ink)]">
            {err("commentaire")}
          </p>
        )}
      </div>

      {rapportsDisponibles && rapportsDisponibles.length > 0 && (
        <div>
          <label className="label-board" htmlFor="rapportId">
            Rapport de levée (facultatif)
          </label>
          <select
            id="rapportId"
            name="rapportId"
            className="champ-board"
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
        <p
          role="alert"
          className="m-0 text-[12.5px] text-[color:var(--board-signal-ink)]"
        >
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p
          role="status"
          className="m-0 text-[12.5px] text-[color:var(--board-green-ink)]"
        >
          Action clôturée.
        </p>
      )}

      <div>
        <Button type="submit" variant="board" size="board" disabled={pending}>
          {pending ? "Clôture…" : "Clôturer l'action"}
        </Button>
      </div>
    </form>
  );
}
