"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EvidenceDropzone } from "@/components/ui-kit";
import {
  ajouterAnalyseLegionelle,
  type CarnetActionState,
} from "@/lib/carnet-sanitaire/actions";
import { SEUIL_LEGIONELLE_UFC_PAR_L } from "@/lib/carnet-sanitaire/schema";

export function AjoutAnalyseForm({
  etablissementId,
}: {
  etablissementId: string;
}) {
  const boundAction = ajouterAnalyseLegionelle.bind(null, etablissementId);
  const [state, formAction, pending] = useActionState<
    CarnetActionState,
    FormData
  >(boundAction, { status: "idle" });
  const [ouvert, setOuvert] = useState(false);
  const [valeur, setValeur] = useState<string>("");

  const ufcNum = valeur ? parseInt(valeur, 10) : null;
  const conforme = ufcNum !== null && ufcNum < SEUIL_LEGIONELLE_UFC_PAR_L;

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[color:var(--warm)] hover:underline"
      >
        + Enregistrer une analyse
      </button>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="space-y-4 rounded-xl border border-dashed border-[color:var(--rule)] bg-[color:var(--paper-sunk)] p-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="dateAnalyse">Date de l&apos;analyse *</Label>
          <Input
            id="dateAnalyse"
            name="dateAnalyse"
            type="date"
            required
            defaultValue={today}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="laboratoire">Laboratoire</Label>
          <Input
            id="laboratoire"
            name="laboratoire"
            maxLength={200}
            placeholder="Ex : Eurofins, Inovalys"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="valeurUfcParL">
          Résultat (UFC/L de Legionella pneumophila)
        </Label>
        <div className="flex items-center gap-3">
          <Input
            id="valeurUfcParL"
            name="valeurUfcParL"
            type="number"
            min={0}
            value={valeur}
            onChange={(e) => setValeur(e.target.value)}
            placeholder="0"
            className="max-w-[180px] text-center text-xl font-semibold tabular-nums"
          />
          {ufcNum !== null && (
            <span
              className={
                "shrink-0 rounded-full px-3 py-1 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] " +
                (conforme
                  ? "bg-[color:var(--accent-vif-soft)] text-[color:var(--accent-vif)]"
                  : "bg-[color:color-mix(in_oklch,var(--minium)_12%,transparent)] text-[color:var(--minium)]")
              }
            >
              {conforme
                ? "✓ sous le seuil d'action"
                : "⚠ action obligatoire"}
            </span>
          )}
        </div>
        <p className="text-[0.72rem] text-muted-foreground">
          Seuil d&apos;action légal : {SEUIL_LEGIONELLE_UFC_PAR_L} UFC/L
          (arrêté 01-02-2010 annexe II). Au-delà, mesures correctives
          immédiates obligatoires.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Rapport du laboratoire (facultatif)</Label>
        <EvidenceDropzone
          name="rapport"
          label="Rapport d'analyse PDF"
          hint="Fichier fourni par le laboratoire"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="commentaire">Commentaire / mesures correctives</Label>
        <textarea
          id="commentaire"
          name="commentaire"
          rows={3}
          maxLength={2000}
          className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
          placeholder="Ex : Choc thermique programmé le JJ/MM, prélèvement de contrôle à 2 semaines"
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer l'analyse"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setOuvert(false);
            setValeur("");
          }}
          className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground hover:text-ink"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
