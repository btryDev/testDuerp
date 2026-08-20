"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  ajouterCommentaire,
  type InterventionActionState,
} from "@/lib/interventions/actions";

export function CommentaireForm({
  etablissementId,
  interventionId,
  auteurDefaut,
}: {
  etablissementId: string;
  interventionId: string;
  auteurDefaut?: string | null;
}) {
  const boundAction = ajouterCommentaire.bind(
    null,
    etablissementId,
    interventionId,
  );
  const [state, formAction, pending] = useActionState<
    InterventionActionState,
    FormData
  >(boundAction, { status: "idle" });

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[200px_1fr]">
        <div>
          <label className="label-board" htmlFor="auteurNom">
            Votre nom
          </label>
          <input
            id="auteurNom"
            name="auteurNom"
            className="champ-board"
            defaultValue={auteurDefaut ?? ""}
            required
            maxLength={200}
          />
        </div>
        <div>
          <label className="label-board" htmlFor="contenu">
            Message
          </label>
          <textarea
            id="contenu"
            name="contenu"
            required
            maxLength={2000}
            rows={2}
            className="champ-board"
            placeholder="Ajouter un commentaire, une mise à jour…"
          />
        </div>
      </div>
      {state.status === "error" && (
        <p className="text-[13px] text-[color:var(--board-signal-ink)]">
          {state.message}
        </p>
      )}
      <Button type="submit" variant="board" size="boardSm" disabled={pending}>
        {pending ? "…" : "Ajouter le commentaire"}
      </Button>
    </form>
  );
}
