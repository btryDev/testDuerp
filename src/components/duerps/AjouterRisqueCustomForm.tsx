"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ajouterRisqueCustom,
  type RisqueActionState,
} from "@/lib/risques/actions";

export function AjouterRisqueCustomForm({ uniteId }: { uniteId: string }) {
  const action = ajouterRisqueCustom.bind(null, uniteId);
  const [state, formAction, pending] = useActionState<
    RisqueActionState,
    FormData
  >(action, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-lg border border-dashed p-4"
    >
      <p className="mb-3 text-sm font-medium">
        Ajouter un risque spécifique à cette unité
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="libelle"
          placeholder="ex. Tension avec les clients lors du rush"
          required
          aria-invalid={Boolean(
            state.status === "error" && state.fieldErrors?.libelle,
          )}
        />
        <Input
          name="description"
          placeholder="Description (facultatif)"
          className="sm:max-w-xs"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Ajout…" : "Ajouter"}
        </Button>
      </div>
      {state.status === "error" && state.fieldErrors?.libelle && (
        <p className="mt-2 text-sm text-destructive">
          {state.fieldErrors.libelle[0]}
        </p>
      )}
    </form>
  );
}
