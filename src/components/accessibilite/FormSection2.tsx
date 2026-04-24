"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sauverSection2 } from "@/lib/accessibilite/actions";
import type { RegistreActionState } from "@/lib/accessibilite/actions";
import { REGIMES, LABEL_REGIME } from "@/lib/accessibilite/schema";
import type { RegimeConformiteErp } from "@prisma/client";

function fmtDate(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function FormSection2({
  etablissementId,
  initial,
}: {
  etablissementId: string;
  initial: {
    conformiteRegime: RegimeConformiteErp | null;
    dateConformite: Date | null;
    numeroAttestationAccess: string | null;
    dateDepotAdap: Date | null;
  } | null;
}) {
  const boundAction = sauverSection2.bind(null, etablissementId);
  const [state, formAction, pending] = useActionState<
    RegistreActionState,
    FormData
  >(boundAction, { status: "idle" });

  return (
    <form action={formAction} className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="text-[0.88rem] font-medium">
          Régime de conformité de l&apos;établissement *
        </legend>
        <div className="space-y-2">
          {REGIMES.map((r) => (
            <label
              key={r}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-[color:var(--rule-soft)] bg-[color:var(--paper-elevated)] px-4 py-3 transition hover:border-[color:var(--warm)] has-[:checked]:border-[color:var(--warm)] has-[:checked]:bg-[color:var(--warm-soft)]"
            >
              <input
                type="radio"
                name="conformiteRegime"
                value={r}
                defaultChecked={initial?.conformiteRegime === r}
                className="mt-1"
              />
              <span className="text-[0.88rem]">{LABEL_REGIME[r]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateConformite">Date de mise en conformité</Label>
          <Input
            id="dateConformite"
            name="dateConformite"
            type="date"
            defaultValue={fmtDate(initial?.dateConformite ?? null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numeroAttestationAccess">
            N° d&apos;attestation d&apos;accessibilité
          </Label>
          <Input
            id="numeroAttestationAccess"
            name="numeroAttestationAccess"
            defaultValue={initial?.numeroAttestationAccess ?? ""}
            maxLength={120}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateDepotAdap">
          Date de dépôt de l&apos;Ad&apos;AP
          <span className="ml-1 text-[0.78rem] font-normal text-muted-foreground">
            (si applicable)
          </span>
        </Label>
        <Input
          id="dateDepotAdap"
          name="dateDepotAdap"
          type="date"
          defaultValue={fmtDate(initial?.dateDepotAdap ?? null)}
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      {state.status === "success" && state.section === 2 && (
        <p className="text-sm text-[color:var(--accent-vif)]">
          ✓ Section 2 enregistrée.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer la section 2"}
      </Button>
    </form>
  );
}
