"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChampBoard } from "@/components/ui-kit";
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

  const erreurLibelle =
    state.status === "error" ? state.fieldErrors?.libelle?.[0] : undefined;

  return (
    // Les deux champs n'avaient qu'un placeholder pour libellé : il
    // disparaît dès la première frappe, et un lecteur d'écran n'a plus rien
    // à annoncer. `ChampBoard` pose un vrai `<label>`, l'astérisque du
    // champ requis, et l'erreur en encre de signal.
    <form ref={formRef} action={formAction}>
      <p className="m-0 mb-3 text-[13.5px] font-medium text-[color:var(--board-ink)]">
        Ajouter un risque spécifique à cette unité
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChampBoard
          id="risque-custom-libelle"
          name="libelle"
          label="Risque"
          placeholder="ex. Tension avec les clients lors du rush"
          requis
          erreur={erreurLibelle}
        />
        <ChampBoard
          id="risque-custom-description"
          name="description"
          label="Description"
          placeholder="Facultatif"
        />
      </div>
      <Button
        type="submit"
        variant="board"
        size="board"
        disabled={pending}
        className="mt-4"
      >
        {pending ? "Ajout…" : "Ajouter"}
      </Button>
    </form>
  );
}
