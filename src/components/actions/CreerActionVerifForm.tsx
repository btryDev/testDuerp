"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { TYPES_ACTION } from "@/lib/actions/schema";
import { LABEL_TYPE_ACTION } from "@/lib/actions/labels";
import type { ActionPlanState } from "@/lib/actions/plan";

type Props = {
  action: (
    prev: ActionPlanState,
    formData: FormData,
  ) => Promise<ActionPlanState>;
  labelAnnuler?: { libelle: string; href: string };
};

export function CreerActionVerifForm({ action, labelAnnuler }: Props) {
  const [state, formAction, pending] = useActionState<
    ActionPlanState,
    FormData
  >(action, { status: "idle" });

  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ]?.[0] : undefined;

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="libelle">Libellé de l&apos;action *</Label>
        <Input
          id="libelle"
          name="libelle"
          required
          placeholder="Ex : Remettre en état le BAES de l'entrée principale"
          aria-invalid={Boolean(err("libelle"))}
        />
        {err("libelle") && (
          <p className="text-sm text-destructive">{err("libelle")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
          placeholder="Détails : référence, localisation, étapes prévues…"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type" className="inline-flex items-center">
            Type de mesure *
            <InfoTooltip>
              Hiérarchie L. 4121-2 : préférer la suppression à la source
              quand c&apos;est possible, avant les EPI et la formation.
            </InfoTooltip>
          </Label>
          <select
            id="type"
            name="type"
            required
            defaultValue="reduction_source"
            className="h-9 w-full rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm"
          >
            {TYPES_ACTION.map((t) => (
              <option key={t} value={t}>
                {LABEL_TYPE_ACTION[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="criticite" className="inline-flex items-center">
            Criticité (1-5)
            <InfoTooltip>
              1 = correctif mineur, 5 = priorité vitale. Sert au tri du
              plan d&apos;actions. Facultatif.
            </InfoTooltip>
          </Label>
          <Input
            id="criticite"
            name="criticite"
            type="number"
            min={1}
            max={5}
            placeholder="3"
            aria-invalid={Boolean(err("criticite"))}
          />
          {err("criticite") && (
            <p className="text-sm text-destructive">{err("criticite")}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="echeance">Échéance prévue</Label>
          <Input
            id="echeance"
            name="echeance"
            type="date"
            aria-invalid={Boolean(err("echeance"))}
          />
          {err("echeance") && (
            <p className="text-sm text-destructive">{err("echeance")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsable">Responsable</Label>
          <Input
            id="responsable"
            name="responsable"
            placeholder="Ex : DAF, prestataire"
            aria-invalid={Boolean(err("responsable"))}
          />
          {err("responsable") && (
            <p className="text-sm text-destructive">{err("responsable")}</p>
          )}
        </div>
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      {state.status === "success" && (
        <p className="text-sm text-emerald-700">Action créée.</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer l'action"}
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
