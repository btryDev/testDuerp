"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ajouterUnite,
  type UniteActionState,
} from "@/lib/duerps/actions";

export function AjouterUniteForm({ duerpId }: { duerpId: string }) {
  const action = ajouterUnite.bind(null, duerpId);
  const [state, formAction, pending] = useActionState<
    UniteActionState,
    FormData
  >(action, { status: "idle" });
  const [ouvert, setOuvert] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fermeture du form après succès du Server Action
      setOuvert(false);
    }
  }, [state]);

  if (!ouvert) {
    return (
      <div className="px-6 py-4 sm:px-8">
        <button
          type="button"
          onClick={() => setOuvert(true)}
          className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-ink"
        >
          <span aria-hidden className="text-[0.95rem] leading-none">+</span>
          Ajouter une unité de travail
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-paper-sunk/40 px-6 py-5 sm:px-8"
    >
      <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
        Nouvelle unité
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          name="nom"
          placeholder="ex. Terrasse, Atelier, Entrepôt"
          required
          autoFocus
          aria-invalid={Boolean(
            state.status === "error" && state.fieldErrors?.nom,
          )}
        />
        <Input
          name="description"
          placeholder="Description courte (facultatif)"
          className="sm:max-w-xs"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Ajout…" : "Ajouter"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOuvert(false)}
        >
          Annuler
        </Button>
      </div>
      {state.status === "error" && state.fieldErrors?.nom && (
        <p className="mt-2 text-sm text-destructive">
          {state.fieldErrors.nom[0]}
        </p>
      )}
    </form>
  );
}
