"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import type { ActionState } from "@/lib/entreprises/actions";

type Valeurs = {
  raisonSociale?: string;
  siret?: string | null;
  codeNaf?: string;
  effectif?: number;
  adresse?: string;
};

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  valeursInitiales?: Valeurs;
  libelleSubmit: string;
  labelAnnuler?: { libelle: string; href: string };
};

export function EntrepriseForm({
  action,
  valeursInitiales,
  libelleSubmit,
  labelAnnuler,
}: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    { status: "idle" },
  );

  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ]?.[0] : undefined;

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="raisonSociale">Raison sociale *</Label>
        <Input
          id="raisonSociale"
          name="raisonSociale"
          defaultValue={valeursInitiales?.raisonSociale}
          required
          aria-invalid={Boolean(err("raisonSociale"))}
        />
        {err("raisonSociale") && (
          <p className="text-sm text-destructive">{err("raisonSociale")}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="siret" className="inline-flex items-center">
            SIRET
            <InfoTooltip>
              Numéro à 14 chiffres identifiant votre établissement. Facultatif
              ici — figurera en en-tête du DUERP s&apos;il est renseigné.
            </InfoTooltip>
          </Label>
          <Input
            id="siret"
            name="siret"
            inputMode="numeric"
            pattern="\d{14}"
            defaultValue={valeursInitiales?.siret ?? ""}
            placeholder="14 chiffres"
            aria-invalid={Boolean(err("siret"))}
          />
          {err("siret") && (
            <p className="text-sm text-destructive">{err("siret")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="codeNaf" className="inline-flex items-center">
            Code NAF *
            <InfoTooltip>
              Code d&apos;activité INSEE (ex : 56.10A pour restauration, 47.11A
              pour commerce alimentaire, 71.12B pour bureau d&apos;études). Il
              sert à pré-remplir les risques types de votre secteur.
            </InfoTooltip>
          </Label>
          <Input
            id="codeNaf"
            name="codeNaf"
            defaultValue={valeursInitiales?.codeNaf}
            placeholder="ex. 56.10A"
            required
            aria-invalid={Boolean(err("codeNaf"))}
          />
          {err("codeNaf") && (
            <p className="text-sm text-destructive">{err("codeNaf")}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="effectif">Effectif *</Label>
        <Input
          id="effectif"
          name="effectif"
          type="number"
          min={1}
          defaultValue={valeursInitiales?.effectif}
          required
          aria-invalid={Boolean(err("effectif"))}
        />
        {err("effectif") && (
          <p className="text-sm text-destructive">{err("effectif")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="adresse">Adresse *</Label>
        <Input
          id="adresse"
          name="adresse"
          defaultValue={valeursInitiales?.adresse}
          required
          aria-invalid={Boolean(err("adresse"))}
        />
        {err("adresse") && (
          <p className="text-sm text-destructive">{err("adresse")}</p>
        )}
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      {state.status === "success" && (
        <p className="text-sm text-green-600">Enregistré.</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : libelleSubmit}
        </Button>
        {labelAnnuler && (
          <Link
            href={labelAnnuler.href}
            className={buttonVariants({ variant: "outline" })}
          >
            {labelAnnuler.libelle}
          </Link>
        )}
      </div>
    </form>
  );
}
