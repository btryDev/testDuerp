"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <div className="space-y-1">
          <Label htmlFor="auteurNom">Votre nom</Label>
          <Input
            id="auteurNom"
            name="auteurNom"
            defaultValue={auteurDefaut ?? ""}
            required
            maxLength={200}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contenu">Message</Label>
          <textarea
            id="contenu"
            name="contenu"
            required
            maxLength={2000}
            rows={2}
            className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
            placeholder="Ajouter un commentaire, une mise à jour…"
          />
        </div>
      </div>
      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "…" : "Ajouter le commentaire"}
      </Button>
    </form>
  );
}
