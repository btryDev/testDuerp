"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  creerVersion,
  MOTIFS_VERSION,
  type MotifVersion,
  type VersionActionState,
} from "@/lib/versions/actions";

export function CreerVersionForm({
  duerpId,
  aucunRisqueNonCote,
}: {
  duerpId: string;
  aucunRisqueNonCote: boolean;
}) {
  const action = creerVersion.bind(null, duerpId);
  const [state, formAction, pending] = useActionState<
    VersionActionState,
    FormData
  >(action, { status: "idle" });
  const [motifCle, setMotifCle] = useState<MotifVersion | "">("");

  const precisionRequise = motifCle === "autre";

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-[calc(var(--radius)*1.4)] border border-rule-soft bg-card p-5"
    >
      <div>
        <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Nouvelle version
        </p>
        <p className="mt-2 text-[0.86rem] leading-relaxed text-muted-foreground">
          L&apos;art. R. 4121-2 impose d&apos;indiquer le motif à chaque mise
          à jour. Choisissez la raison qui déclenche cette nouvelle version.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="sr-only">Motif de mise à jour</legend>
        {(Object.entries(MOTIFS_VERSION) as [MotifVersion, string][]).map(
          ([cle, libelle]) => {
            const id = `motif-${cle}`;
            const checked = motifCle === cle;
            return (
              <label
                key={cle}
                htmlFor={id}
                className={`flex cursor-pointer items-start gap-3 rounded-[calc(var(--radius)*1)] border p-3 transition-colors ${
                  checked
                    ? "border-ink bg-paper-sunk/60"
                    : "border-rule-soft hover:bg-paper-sunk/30"
                }`}
              >
                <input
                  type="radio"
                  id={id}
                  name="motifCle"
                  value={cle}
                  checked={checked}
                  onChange={() => setMotifCle(cle)}
                  className="mt-1 accent-ink"
                  required
                />
                <span className="text-[0.88rem] leading-snug">{libelle}</span>
              </label>
            );
          },
        )}
      </fieldset>

      <div className="space-y-2">
        <Label
          htmlFor="motifPrecision"
          className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground"
        >
          Précision
          {precisionRequise ? " (requise)" : " (facultative)"}
        </Label>
        <Input
          id="motifPrecision"
          name="motifPrecision"
          placeholder="ex. ouverture service de livraison — juin 2026"
          required={precisionRequise}
          maxLength={300}
        />
      </div>

      {!aucunRisqueNonCote && (
        <p className="rounded-[calc(var(--radius)*1)] border border-dashed border-[color:var(--minium)]/40 bg-[color:var(--minium)]/8 p-3 text-[0.8rem] leading-relaxed text-[color:var(--minium)]">
          Certains risques ne sont pas encore cotés. La version figera
          l&apos;état actuel tel quel — la cotation manquante sera marquée
          « n.c. » dans le PDF.
        </p>
      )}

      {state.status === "error" && (
        <p className="text-[0.82rem] text-destructive">{state.message}</p>
      )}
      {state.status === "success" && (
        <p className="text-[0.82rem] text-emerald-700 dark:text-emerald-400">
          Version v{state.numero} créée. Le PDF est disponible ci-dessous.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Création…" : "Valider — créer une nouvelle version"}
      </Button>
    </form>
  );
}
