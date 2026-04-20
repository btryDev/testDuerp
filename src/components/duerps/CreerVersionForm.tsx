"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  creerVersion,
  type VersionActionState,
} from "@/lib/versions/actions";

export function CreerVersionForm({
  duerpId,
  aucunRisqueNonCote,
}: {
  duerpId: string;
  aucunRisqueNonCote: boolean;
}) {
  const action = creerVersion.bind(null, duerpId);
  const [state, formAction, pending] = useActionState<
    VersionActionState,
    FormData
  >(action, { status: "idle" });

  return (
    <form action={formAction} className="space-y-3 rounded-lg border bg-card p-4">
      <div className="space-y-2">
        <Label htmlFor="motif">Motif (facultatif)</Label>
        <Input
          id="motif"
          name="motif"
          placeholder="ex. Mise à jour annuelle, nouveau poste, incident"
        />
      </div>
      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      {state.status === "success" && (
        <p className="text-sm text-green-600">
          Version v{state.numero} créée. Le PDF est disponible ci-dessous.
        </p>
      )}
      {!aucunRisqueNonCote && (
        <p className="text-xs text-yellow-700 dark:text-yellow-400">
          Attention : certains risques ne sont pas encore cotés. La version
          figera l&apos;état actuel tel quel.
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Création…" : "Valider — créer une nouvelle version"}
      </Button>
    </form>
  );
}
