"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sauverSection1 } from "@/lib/accessibilite/actions";
import type { RegistreActionState } from "@/lib/accessibilite/actions";
import { HANDICAPS, LABEL_HANDICAP } from "@/lib/accessibilite/schema";
import type { HandicapAccessible } from "@prisma/client";

export function FormSection1({
  etablissementId,
  initial,
}: {
  etablissementId: string;
  initial: {
    prestationsFournies: string | null;
    handicapsAccueillis: HandicapAccessible[];
    servicesAdaptes: string | null;
  } | null;
}) {
  const boundAction = sauverSection1.bind(null, etablissementId);
  const [state, formAction, pending] = useActionState<
    RegistreActionState,
    FormData
  >(boundAction, { status: "idle" });

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="prestationsFournies">
          Prestations fournies par l&apos;établissement *
        </Label>
        <textarea
          id="prestationsFournies"
          name="prestationsFournies"
          defaultValue={initial?.prestationsFournies ?? ""}
          rows={4}
          maxLength={4000}
          className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
          placeholder="Ex : restaurant traditionnel, 48 couverts, service midi et soir. Terrasse en saison. Paiement CB, espèces, titres-restaurant."
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-[0.88rem] font-medium">
          Types de handicaps pour lesquels l&apos;établissement est adapté
        </legend>
        <p className="text-[0.78rem] text-muted-foreground">
          Cochez les catégories concernées — l&apos;arrêté du 19-04-2017 impose
          d&apos;informer le public sur ce point.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {HANDICAPS.map((h) => (
            <label
              key={h}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[color:var(--rule)] bg-[color:var(--paper-elevated)] px-3 py-1.5 text-[0.82rem] transition hover:border-[color:var(--warm)] has-[:checked]:border-[color:var(--warm)] has-[:checked]:bg-[color:var(--warm-soft)] has-[:checked]:text-[color:var(--warm)]"
            >
              <input
                type="checkbox"
                name="handicapsAccueillis"
                value={h}
                defaultChecked={initial?.handicapsAccueillis.includes(h)}
                className="sr-only"
              />
              {LABEL_HANDICAP[h]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="servicesAdaptes">
          Adaptations et services disponibles
        </Label>
        <textarea
          id="servicesAdaptes"
          name="servicesAdaptes"
          defaultValue={initial?.servicesAdaptes ?? ""}
          rows={4}
          maxLength={4000}
          className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
          placeholder="Ex : menu en gros caractères disponible à la demande, personnel formé à l'accueil, place de parking PMR à 20 m, sanitaires accessibles au rez-de-chaussée."
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      {state.status === "success" && state.section === 1 && (
        <p className="text-sm text-[color:var(--accent-vif)]">
          ✓ Section 1 enregistrée.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer la section 1"}
      </Button>
    </form>
  );
}
