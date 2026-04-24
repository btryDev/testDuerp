"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ajouterReleve,
  type CarnetActionState,
} from "@/lib/carnet-sanitaire/actions";

/**
 * Formulaire compact de saisie d'un relevé de température. Pensé pour
 * mobile : grand champ numérique, bouton massif. Utilisable directement sur
 * place (tablette, téléphone).
 */
export function AjoutReleveForm({
  etablissementId,
  pointReleveId,
  seuilMinCelsius,
  typeReseau,
}: {
  etablissementId: string;
  pointReleveId: string;
  seuilMinCelsius: number;
  typeReseau: string;
}) {
  const boundAction = ajouterReleve.bind(null, etablissementId);
  const [state, formAction, pending] = useActionState<
    CarnetActionState,
    FormData
  >(boundAction, { status: "idle" });
  const [temperature, setTemperature] = useState<string>("");
  const [ouvert, setOuvert] = useState(false);

  const tempNum = temperature ? parseFloat(temperature) : null;
  const conformePreview =
    tempNum === null
      ? null
      : typeReseau === "EFS"
        ? tempNum <= seuilMinCelsius
        : tempNum >= seuilMinCelsius;

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="inline-flex items-center gap-1 rounded-md bg-[color:var(--warm)] px-3 py-1.5 text-[0.82rem] font-medium text-white transition-colors hover:opacity-90"
      >
        + Saisir un relevé
      </button>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-dashed border-[color:var(--rule)] bg-[color:var(--paper-sunk)] p-5">
      <input type="hidden" name="pointReleveId" value={pointReleveId} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.5fr]">
        <div className="space-y-1.5">
          <Label htmlFor={`dateReleve-${pointReleveId}`}>Date *</Label>
          <Input
            id={`dateReleve-${pointReleveId}`}
            name="dateReleve"
            type="date"
            required
            defaultValue={today}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`temperatureCelsius-${pointReleveId}`}>
            Température (°C) *
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id={`temperatureCelsius-${pointReleveId}`}
              name="temperatureCelsius"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              max={100}
              required
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="52.3"
              className="text-center text-2xl font-semibold tabular-nums"
            />
            {conformePreview !== null && (
              <span
                className={
                  "shrink-0 rounded-full px-3 py-1 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] " +
                  (conformePreview
                    ? "bg-[color:var(--accent-vif-soft)] text-[color:var(--accent-vif)]"
                    : "bg-[color:color-mix(in_oklch,var(--minium)_12%,transparent)] text-[color:var(--minium)]")
                }
              >
                {conformePreview ? "✓ conforme" : "⚠ non conforme"}
              </span>
            )}
          </div>
          <p className="text-[0.72rem] text-muted-foreground">
            Seuil {typeReseau === "EFS" ? "max" : "min"} : {seuilMinCelsius} °C
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`operateur-${pointReleveId}`}>
            Opérateur (facultatif)
          </Label>
          <Input
            id={`operateur-${pointReleveId}`}
            name="operateur"
            maxLength={200}
            placeholder="Prénom Nom"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`commentaire-${pointReleveId}`}>Commentaire</Label>
          <Input
            id={`commentaire-${pointReleveId}`}
            name="commentaire"
            maxLength={1000}
            placeholder="Ex : après purge"
          />
        </div>
      </div>

      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "…" : "Enregistrer le relevé"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setOuvert(false);
            setTemperature("");
          }}
          className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground hover:text-ink"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
