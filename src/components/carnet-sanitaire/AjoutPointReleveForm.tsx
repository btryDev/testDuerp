"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  creerPointReleve,
  type CarnetActionState,
} from "@/lib/carnet-sanitaire/actions";
import {
  LABEL_RESEAU,
  SEUIL_DEFAUT,
  TYPES_RESEAU,
} from "@/lib/carnet-sanitaire/schema";
import type { TypeReseauEau } from "@prisma/client";

export function AjoutPointReleveForm({
  etablissementId,
}: {
  etablissementId: string;
}) {
  const boundAction = creerPointReleve.bind(null, etablissementId);
  const [state, formAction, pending] = useActionState<
    CarnetActionState,
    FormData
  >(boundAction, { status: "idle" });
  const [type, setType] = useState<TypeReseauEau>("ECS");
  const [ouvert, setOuvert] = useState(false);

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[color:var(--warm)] hover:underline"
      >
        + Ajouter un point de relevé
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-dashed border-[color:var(--rule)] bg-[color:var(--paper-sunk)] p-5">
      <div className="space-y-1.5">
        <Label htmlFor="nom">Nom du point *</Label>
        <Input
          id="nom"
          name="nom"
          required
          maxLength={200}
          placeholder="Ex : Évier cuisine, Douche vestiaire, Lavabo salle 1…"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="localisation">Localisation (facultatif)</Label>
        <Input
          id="localisation"
          name="localisation"
          maxLength={200}
          placeholder="Ex : RDC, local plonge, 2e étage"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
        <div className="space-y-1.5">
          <Label htmlFor="typeReseau">Type de réseau *</Label>
          <select
            id="typeReseau"
            name="typeReseau"
            value={type}
            onChange={(e) => setType(e.target.value as TypeReseauEau)}
            className="h-9 w-full rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm"
          >
            {TYPES_RESEAU.map((t) => (
              <option key={t} value={t}>
                {LABEL_RESEAU[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seuilMinCelsius">
            Seuil {type === "EFS" ? "max" : "min"} (°C)
          </Label>
          <Input
            id="seuilMinCelsius"
            name="seuilMinCelsius"
            type="number"
            step="0.5"
            defaultValue={SEUIL_DEFAUT[type]}
            key={`seuil-${type}`}
          />
        </div>
      </div>

      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Ajout…" : "Ajouter le point"}
        </Button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground hover:text-ink"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
