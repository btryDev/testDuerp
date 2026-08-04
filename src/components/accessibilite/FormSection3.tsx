"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sauverSection3 } from "@/lib/accessibilite/actions";
import type { RegistreActionState } from "@/lib/accessibilite/actions";

function fmtDate(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function FormSection3({
  etablissementId,
  initial,
}: {
  etablissementId: string;
  initial: {
    personnelForme: boolean;
    dateDerniereFormation: Date | null;
    organismeFormation: string | null;
    effectifForme: number | null;
  } | null;
}) {
  const boundAction = sauverSection3.bind(null, etablissementId);
  const [state, formAction, pending] = useActionState<
    RegistreActionState,
    FormData
  >(boundAction, { status: "idle" });

  return (
    <form action={formAction} className="space-y-5">
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[color:var(--rule-soft)] bg-[color:var(--paper-sunk)] px-4 py-3">
        <input
          type="checkbox"
          name="personnelForme"
          defaultChecked={initial?.personnelForme ?? false}
          className="mt-1"
        />
        <div>
          <p className="text-[0.9rem] font-medium">
            Le personnel d&apos;accueil a été formé à l&apos;accueil des
            personnes en situation de handicap
          </p>
          <p className="mt-1 text-[0.78rem] text-muted-foreground">
            L&apos;arrêté du 19-04-2017 impose de décrire les actions de formation
            du personnel en contact avec le public.
          </p>
        </div>
      </label>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateDerniereFormation">
            Date de dernière formation
          </Label>
          <Input
            id="dateDerniereFormation"
            name="dateDerniereFormation"
            type="date"
            defaultValue={fmtDate(initial?.dateDerniereFormation ?? null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="effectifForme">Effectif formé</Label>
          <Input
            id="effectifForme"
            name="effectifForme"
            type="number"
            min={0}
            defaultValue={initial?.effectifForme ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organismeFormation">Organisme formateur</Label>
        <Input
          id="organismeFormation"
          name="organismeFormation"
          defaultValue={initial?.organismeFormation ?? ""}
          maxLength={200}
          placeholder="Ex : AFPA, CCI, formation interne encadrée par…"
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      {state.status === "success" && state.section === 3 && (
        <p className="text-sm text-[color:var(--accent-vif)]">
          ✓ Section 3 enregistrée.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer la section 3"}
      </Button>
    </form>
  );
}
