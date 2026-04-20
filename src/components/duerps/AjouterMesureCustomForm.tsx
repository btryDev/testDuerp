"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ajouterMesureCustom,
  type MesureActionState,
} from "@/lib/mesures/actions";
import { LABEL_TYPE_MESURE } from "@/lib/mesures/labels";

export function AjouterMesureCustomForm({ risqueId }: { risqueId: string }) {
  const action = ajouterMesureCustom.bind(null, risqueId);
  const [state, formAction, pending] = useActionState<
    MesureActionState,
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
      className="space-y-3 rounded-lg border border-dashed p-4"
    >
      <p className="text-sm font-medium">Ajouter une mesure</p>

      <div className="space-y-2">
        <Label htmlFor="mesure-libelle">Description *</Label>
        <Input
          id="mesure-libelle"
          name="libelle"
          placeholder="ex. Révision annuelle de la friteuse par un technicien"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="mesure-type">Type *</Label>
          <select
            id="mesure-type"
            name="type"
            required
            className="flex h-8 w-full rounded-lg border bg-background px-2.5 text-sm"
            defaultValue="reduction_source"
          >
            {Object.entries(LABEL_TYPE_MESURE).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mesure-statut">Statut *</Label>
          <select
            id="mesure-statut"
            name="statut"
            required
            className="flex h-8 w-full rounded-lg border bg-background px-2.5 text-sm"
            defaultValue="existante"
          >
            <option value="existante">Existante</option>
            <option value="prevue">Prévue</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="mesure-echeance">Échéance (si prévue)</Label>
          <Input type="date" id="mesure-echeance" name="echeance" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mesure-responsable">Responsable</Label>
          <Input
            id="mesure-responsable"
            name="responsable"
            placeholder="Nom ou rôle"
          />
        </div>
      </div>

      {state.status === "error" && state.fieldErrors?.libelle && (
        <p className="text-sm text-destructive">
          {state.fieldErrors.libelle[0]}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Ajout…" : "Ajouter la mesure"}
      </Button>
    </form>
  );
}
