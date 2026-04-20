"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  modifierRisqueCustom,
  type RisqueActionState,
} from "@/lib/risques/actions";

export function ModifierRisqueCustomButton({
  id,
  libelle,
  description,
}: {
  id: string;
  libelle: string;
  description?: string | null;
}) {
  const [ouvert, setOuvert] = useState(false);
  const action = modifierRisqueCustom.bind(null, id);
  const [state, formAction, pending] = useActionState<
    RisqueActionState,
    FormData
  >(action, { status: "idle" });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fermeture du form après succès du Server Action
    if (state.status === "success") setOuvert(false);
  }, [state]);

  if (!ouvert) {
    return (
      <Button size="sm" variant="ghost" onClick={() => setOuvert(true)}>
        Modifier
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <Input
        name="libelle"
        defaultValue={libelle}
        autoFocus
        required
        className="sm:max-w-sm"
        aria-invalid={Boolean(
          state.status === "error" && state.fieldErrors?.libelle,
        )}
      />
      <Input
        name="description"
        defaultValue={description ?? ""}
        placeholder="Description (facultatif)"
        className="sm:max-w-xs"
      />
      <div className="flex gap-1">
        <Button size="sm" type="submit" disabled={pending}>
          {pending ? "…" : "OK"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          type="button"
          onClick={() => setOuvert(false)}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
