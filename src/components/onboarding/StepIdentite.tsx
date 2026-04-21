"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import type { StepProps } from "./types";

export function StepIdentite({ state, update, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="label-admin mb-2">Étape 1 sur 4 · Identité</p>
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.015em] leading-tight">
          Comment s&apos;appelle votre entreprise ?
        </h2>
        <p className="mt-3 max-w-xl text-[0.88rem] leading-relaxed text-muted-foreground">
          On ne demande que le strict nécessaire ici — vous compléterez les
          détails juste après. Ces informations apparaîtront en en-tête de
          vos documents officiels (DUERP, registre, plan d&apos;actions).
        </p>
      </div>

      <div className="cartouche space-y-6 px-6 py-7 sm:px-8">
        <div className="space-y-2">
          <Label htmlFor="raisonSociale">
            Raison sociale <span className="text-destructive">*</span>
          </Label>
          <Input
            id="raisonSociale"
            name="raisonSociale"
            value={state.raisonSociale}
            onChange={(e) => update({ raisonSociale: e.target.value })}
            required
            autoFocus
            placeholder="Ex : Bistrot du marché SARL"
            aria-invalid={Boolean(errors?.raisonSociale)}
          />
          {errors?.raisonSociale && (
            <p className="text-sm text-destructive">{errors.raisonSociale}</p>
          )}
          <p className="text-[0.78rem] text-muted-foreground">
            Le nom juridique de votre structure. Modifiable plus tard si
            besoin.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="siret" className="inline-flex items-center">
            SIRET
            <InfoTooltip>
              14 chiffres. Facultatif ici — vous pourrez le renseigner plus
              tard. Si vous l&apos;ajoutez, il figurera automatiquement en
              en-tête de vos documents officiels.
            </InfoTooltip>
          </Label>
          <Input
            id="siret"
            name="siret"
            inputMode="numeric"
            pattern="\d{14}"
            value={state.siret}
            onChange={(e) => update({ siret: e.target.value })}
            placeholder="14 chiffres (facultatif)"
            aria-invalid={Boolean(errors?.siret)}
          />
          {errors?.siret && (
            <p className="text-sm text-destructive">{errors.siret}</p>
          )}
        </div>
      </div>
    </div>
  );
}
