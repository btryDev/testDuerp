"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculerCriticite } from "@/lib/cotation";
import { questionsCotation } from "@/lib/cotation/questions";
import {
  enregistrerCotation,
  type CotationActionState,
} from "@/lib/risques/actions";

type Props = {
  risqueId: string;
  initial: {
    gravite: number;
    probabilite: number;
    maitrise: number;
    nombreSalariesExposes: number | null;
    dateMesuresPhysiques: string | null;
    exposeCMR: boolean;
  };
  cotationSaisie: boolean;
  hrefRetourUnite: string;
  hrefMesures: string;
  hrefSuivant?: string;
};

export function CotationForm({
  risqueId,
  initial,
  cotationSaisie,
  hrefRetourUnite,
  hrefMesures,
  hrefSuivant,
}: Props) {
  const action = enregistrerCotation.bind(null, risqueId);
  const [state, formAction, pending] = useActionState<
    CotationActionState,
    FormData
  >(action, { status: "idle" });

  const [gravite, setGravite] = useState(initial.gravite);
  const [probabilite, setProbabilite] = useState(initial.probabilite);
  const [maitrise, setMaitrise] = useState(initial.maitrise);

  const criticiteLive = useMemo(
    () => calculerCriticite({ gravite, probabilite, maitrise }),
    [gravite, probabilite, maitrise],
  );

  const setter = (axe: string) => {
    if (axe === "gravite") return setGravite;
    if (axe === "probabilite") return setProbabilite;
    return setMaitrise;
  };
  const valeurActuelle = (axe: string) =>
    axe === "gravite" ? gravite : axe === "probabilite" ? probabilite : maitrise;

  return (
    <form action={formAction} className="space-y-8">
      {questionsCotation.map((q) => (
        <fieldset key={q.axe} className="space-y-3">
          <legend className="text-base font-medium">{q.intitule}</legend>
          <div className="space-y-2">
            {q.options.map((opt) => {
              const id = `${q.axe}-${opt.valeur}`;
              const checked = valeurActuelle(q.axe) === opt.valeur;
              return (
                <label
                  key={id}
                  htmlFor={id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    checked
                      ? "border-foreground bg-muted/50"
                      : "hover:bg-muted/20"
                  }`}
                >
                  <input
                    type="radio"
                    id={id}
                    name={q.axe}
                    value={opt.valeur}
                    defaultChecked={checked}
                    onChange={() => setter(q.axe)(opt.valeur)}
                    className="mt-1"
                    required
                  />
                  <span className="text-sm">{opt.libelle}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">Criticité calculée</p>
        <p className="text-3xl font-semibold">{criticiteLive} / 16</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Calcul : (gravité × probabilité) / maîtrise, arrondi et borné 1-16.
        </p>
      </div>

      <fieldset className="space-y-4 rounded-lg border bg-card p-4">
        <legend className="px-2 text-sm font-medium">
          Informations complémentaires (facultatives)
        </legend>
        <p className="text-xs text-muted-foreground">
          Utiles à la traçabilité et à certaines annexes obligatoires
          (pénibilité, CMR, mesures physiques réglementées).
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nombreSalariesExposes" className="text-xs">
              Nombre de salariés exposés
            </Label>
            <Input
              id="nombreSalariesExposes"
              name="nombreSalariesExposes"
              type="number"
              min={0}
              step={1}
              defaultValue={initial.nombreSalariesExposes ?? ""}
              placeholder="ex. 3"
            />
            <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
              Critère d&apos;appréciation recommandé par l&apos;INRS (ED 840).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateMesuresPhysiques" className="text-xs">
              Date des dernières mesures physiques
            </Label>
            <Input
              id="dateMesuresPhysiques"
              name="dateMesuresPhysiques"
              type="date"
              defaultValue={initial.dateMesuresPhysiques ?? ""}
            />
            <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
              Bruit (R. 4432), éclairement (R. 4223-4), ambiances thermiques,
              vibrations (R. 4441). À renseigner si l&apos;activité impose une
              mesure par un organisme habilité.
            </p>
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-md border border-dashed p-3">
          <input
            type="checkbox"
            id="exposeCMR"
            name="exposeCMR"
            defaultChecked={initial.exposeCMR}
            className="mt-0.5"
          />
          <span className="space-y-1 text-xs">
            <span className="block font-medium text-sm">
              Exposition à un agent CMR
            </span>
            <span className="block text-muted-foreground">
              Cancérogène, Mutagène ou toxique pour la Reproduction (art.
              R. 4412-59 et suivants). Cocher si un ou plusieurs salariés sont
              exposés — cela déclenche des obligations renforcées (liste des
              salariés exposés, suivi médical, substitution prioritaire).
            </span>
          </span>
        </label>
      </fieldset>

      {state.status === "success" && state.alerte && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-50 p-4 text-sm text-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-100">
          <p className="font-medium">Attention — cotation inhabituelle</p>
          <p className="mt-1">{state.alerte}</p>
        </div>
      )}

      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <Link
          href={hrefRetourUnite}
          className={buttonVariants({ variant: "outline" })}
        >
          ← Retour à l&apos;unité
        </Link>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button type="submit" disabled={pending}>
            {pending
              ? "Enregistrement…"
              : cotationSaisie
                ? "Mettre à jour"
                : "Enregistrer"}
          </Button>
          <Link href={hrefMesures} className={buttonVariants()}>
            Mesures →
          </Link>
          {hrefSuivant && (
            <Link
              href={hrefSuivant}
              className={buttonVariants({ variant: "outline" })}
            >
              Risque suivant
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}
