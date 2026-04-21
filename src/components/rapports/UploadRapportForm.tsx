"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { LABEL_RESULTAT, RESULTATS } from "@/lib/rapports/schema";
import type { UploadRapportState } from "@/lib/rapports/actions";
import {
  MIME_AUTORISES,
  TAILLE_MAX_OCTETS,
} from "@/lib/rapports/validator";

type Props = {
  action: (
    prev: UploadRapportState,
    formData: FormData,
  ) => Promise<UploadRapportState>;
  labelAnnuler?: { libelle: string; href: string };
};

export function UploadRapportForm({ action, labelAnnuler }: Props) {
  const [state, formAction, pending] = useActionState<
    UploadRapportState,
    FormData
  >(action, { status: "idle" });

  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ]?.[0] : undefined;

  const tailleMaxMo = Math.round(TAILLE_MAX_OCTETS / 1024 / 1024);

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      <div className="space-y-2">
        <Label htmlFor="fichier">
          Fichier du rapport *
          <InfoTooltip>
            Formats acceptés : PDF, PNG, JPEG, DOCX. Taille max {tailleMaxMo} Mo.
          </InfoTooltip>
        </Label>
        <input
          id="fichier"
          name="fichier"
          type="file"
          required
          accept={MIME_AUTORISES.join(",")}
          className="block w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded file:border-0 file:bg-paper-sunk/70 file:px-3 file:py-1 file:text-[0.78rem] file:uppercase file:tracking-wide"
        />
        {err("fichier") && (
          <p className="text-sm text-destructive">{err("fichier")}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateRapport">Date du rapport *</Label>
          <Input
            id="dateRapport"
            name="dateRapport"
            type="date"
            required
            aria-invalid={Boolean(err("dateRapport"))}
          />
          {err("dateRapport") && (
            <p className="text-sm text-destructive">{err("dateRapport")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="resultat">Résultat *</Label>
          <select
            id="resultat"
            name="resultat"
            required
            defaultValue="conforme"
            className="h-9 w-full rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm"
          >
            {RESULTATS.map((r) => (
              <option key={r} value={r}>
                {LABEL_RESULTAT[r]}
              </option>
            ))}
          </select>
          {err("resultat") && (
            <p className="text-sm text-destructive">{err("resultat")}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organismeVerif">
          Organisme vérificateur
          <InfoTooltip>
            Nom de l&apos;organisme qui a réalisé la vérification
            (facultatif mais recommandé pour l&apos;audit).
          </InfoTooltip>
        </Label>
        <Input
          id="organismeVerif"
          name="organismeVerif"
          placeholder="Ex : Apave, Bureau Veritas, Socotec…"
          aria-invalid={Boolean(err("organismeVerif"))}
        />
        {err("organismeVerif") && (
          <p className="text-sm text-destructive">{err("organismeVerif")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="commentaires">Commentaires libres</Label>
        <textarea
          id="commentaires"
          name="commentaires"
          rows={3}
          className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
          placeholder="Observations, remarques, points à lever…"
        />
        {err("commentaires") && (
          <p className="text-sm text-destructive">{err("commentaires")}</p>
        )}
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      {state.status === "success" && (
        <p className="text-sm text-emerald-700">Rapport enregistré.</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Upload en cours…" : "Enregistrer le rapport"}
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
