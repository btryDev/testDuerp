"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  creerIntervention,
  type InterventionActionState,
} from "@/lib/interventions/actions";
import {
  COULEUR_PRIORITE,
  LABEL_PRIORITE,
  PRIORITES,
} from "@/lib/interventions/schema";

type RisqueLite = {
  id: string;
  libelle: string;
  uniteNom: string;
};

/**
 * Création d'un ticket, photo-first : l'utilisateur prend une photo
 * directement depuis son téléphone (capture="environment") ou uploade
 * depuis le fichier. Pensé pour saisir en 10 secondes sur le terrain.
 */
export function NouveauTicketForm({
  etablissementId,
  risques,
  onCreated,
}: {
  etablissementId: string;
  risques: RisqueLite[];
  onCreated?: () => void;
}) {
  const router = useRouter();
  const boundAction = creerIntervention.bind(null, etablissementId);
  const [state, formAction, pending] = useActionState<
    InterventionActionState,
    FormData
  >(boundAction, { status: "idle" });
  const [priorite, setPriorite] = useState<(typeof PRIORITES)[number]>("moyenne");

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      onCreated?.();
    }
  }, [state, router, onCreated]);

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="space-y-5"
    >
      {/* Titre */}
      <div className="space-y-1.5">
        <Label htmlFor="titre">Que se passe-t-il ? *</Label>
        <Input
          id="titre"
          name="titre"
          required
          maxLength={200}
          placeholder="Ex : Porte des vestiaires bloquée"
          className="text-[1.05rem]"
          autoFocus
        />
      </div>

      {/* Photos */}
      <div className="space-y-1.5">
        <Label htmlFor="photos">Photos (facultatif)</Label>
        <input
          id="photos"
          name="photos"
          type="file"
          multiple
          accept="image/*,application/pdf"
          capture="environment"
          className="block w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded file:border-0 file:bg-paper-sunk file:px-3 file:py-1 file:text-[0.78rem] file:uppercase file:tracking-wide"
        />
        <p className="text-[0.72rem] text-muted-foreground">
          Une photo vaut 1000 mots — surtout sur le terrain.
        </p>
      </div>

      {/* Priorité */}
      <div className="space-y-1.5">
        <Label>Priorité</Label>
        <div className="flex flex-wrap gap-2">
          {PRIORITES.map((p) => {
            const actif = priorite === p;
            return (
              <label
                key={p}
                className={
                  "cursor-pointer rounded-full border px-3 py-1.5 text-[0.82rem] transition " +
                  (actif
                    ? "text-white"
                    : "border-[color:var(--rule)] bg-[color:var(--paper-elevated)] hover:border-[color:var(--warm)]")
                }
                style={
                  actif
                    ? {
                        borderColor: COULEUR_PRIORITE[p],
                        background: COULEUR_PRIORITE[p],
                      }
                    : undefined
                }
              >
                <input
                  type="radio"
                  name="priorite"
                  value={p}
                  checked={actif}
                  onChange={() => setPriorite(p)}
                  className="sr-only"
                />
                {LABEL_PRIORITE[p]}
              </label>
            );
          })}
        </div>
      </div>

      {/* Détails pliables */}
      <details className="rounded-xl border border-[color:var(--rule-soft)] bg-[color:var(--paper-sunk)] p-4">
        <summary className="cursor-pointer font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
          + Détails (facultatifs)
        </summary>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="description">Description détaillée</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={4000}
              className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
              placeholder="Contexte, historique, impact…"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="localisation">Lieu</Label>
              <Input
                id="localisation"
                name="localisation"
                maxLength={200}
                placeholder="Ex : RDC — local technique"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assigneA">Assigné à</Label>
              <Input
                id="assigneA"
                name="assigneA"
                maxLength={200}
                placeholder="Nom ou email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="echeance">Échéance</Label>
              <Input id="echeance" name="echeance" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="risqueId">
                Risque DUERP concerné (facultatif)
              </Label>
              <select
                id="risqueId"
                name="risqueId"
                className="h-9 w-full rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm"
                defaultValue=""
              >
                <option value="">— Aucun —</option>
                {risques.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.uniteNom}] {r.libelle}
                  </option>
                ))}
              </select>
              <p className="text-[0.72rem] text-muted-foreground">
                Lier un ticket à un risque permet de déclencher sa réévaluation
                après clôture.
              </p>
            </div>
          </div>
        </div>
      </details>

      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer le ticket"}
        </Button>
      </div>
    </form>
  );
}

export function BadgePriorite({
  priorite,
}: {
  priorite: (typeof PRIORITES)[number];
}) {
  const color = COULEUR_PRIORITE[priorite];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.1em]"
      style={{
        color,
        background: `color-mix(in oklch, ${color} 12%, transparent)`,
      }}
    >
      {LABEL_PRIORITE[priorite]}
    </span>
  );
}

export const BADGE_PRIORITE_COULEUR = COULEUR_PRIORITE;
