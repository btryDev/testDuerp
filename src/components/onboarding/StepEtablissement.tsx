"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import type { StepProps } from "./types";

const SUGGESTIONS_NAF = [
  { code: "56.10A", libelle: "Restauration traditionnelle" },
  { code: "56.10C", libelle: "Restauration de type rapide" },
  { code: "47.11B", libelle: "Commerce alimentaire de proximité" },
  { code: "47.25Z", libelle: "Commerce de boissons" },
  { code: "70.22Z", libelle: "Conseil en affaires" },
  { code: "71.12B", libelle: "Ingénierie, études techniques" },
];

export function StepEtablissement({ state, update, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="label-admin mb-2">Étape 2 sur 4 · Votre lieu d&apos;activité</p>
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.015em] leading-tight">
          Où est situé votre établissement ?
        </h2>
        <p className="mt-3 max-w-xl text-[0.88rem] leading-relaxed text-muted-foreground">
          C&apos;est sur ce lieu que l&apos;outil calculera vos obligations
          (vérifications électriques, incendie, aération…). Si vous avez
          plusieurs sites, commencez par le principal — vous ajouterez les
          autres ensuite.
        </p>
      </div>

      <div className="cartouche space-y-6 px-6 py-7 sm:px-8">
        <div className="space-y-2">
          <Label htmlFor="raisonDisplay" className="inline-flex items-center">
            Nom d&apos;usage <span className="ml-1 text-destructive">*</span>
            <InfoTooltip>
              Comment appelez-vous ce lieu au quotidien ? (ex : « Le
              bistrot du marché », « Boutique rue Crébillon »). Pour vous
              aider à vous repérer si vous avez plusieurs établissements.
            </InfoTooltip>
          </Label>
          <Input
            id="raisonDisplay"
            name="raisonDisplay"
            value={state.raisonDisplay}
            onChange={(e) => update({ raisonDisplay: e.target.value })}
            required
            autoFocus
            placeholder="Ex : Le bistrot du marché"
            aria-invalid={Boolean(errors?.raisonDisplay)}
          />
          {errors?.raisonDisplay && (
            <p className="text-sm text-destructive">{errors.raisonDisplay}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="adresse">
            Adresse complète <span className="text-destructive">*</span>
          </Label>
          <Input
            id="adresse"
            name="adresse"
            value={state.adresse}
            onChange={(e) => update({ adresse: e.target.value })}
            required
            placeholder="Ex : 12 rue des Halles, 44000 Nantes"
            aria-invalid={Boolean(errors?.adresse)}
          />
          {errors?.adresse && (
            <p className="text-sm text-destructive">{errors.adresse}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="codeNaf" className="inline-flex items-center">
              Code NAF <span className="ml-1 text-destructive">*</span>
              <InfoTooltip>
                Code d&apos;activité INSEE qui figure sur votre avis de
                situation. Détermine votre secteur et pré-remplit les
                risques types pour le DUERP.
              </InfoTooltip>
            </Label>
            <Input
              id="codeNaf"
              name="codeNaf"
              value={state.codeNaf}
              onChange={(e) => update({ codeNaf: e.target.value })}
              required
              placeholder="Ex : 56.10A"
              className="uppercase"
              aria-invalid={Boolean(errors?.codeNaf)}
            />
            {errors?.codeNaf && (
              <p className="text-sm text-destructive">{errors.codeNaf}</p>
            )}
            {/* Suggestions cliquables */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTIONS_NAF.map((s) => (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => update({ codeNaf: s.code })}
                  className="rounded-full border border-rule bg-paper-sunk/40 px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-ink hover:text-ink"
                >
                  {s.code} · {s.libelle}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="effectifSurSite" className="inline-flex items-center">
              Effectif sur site <span className="ml-1 text-destructive">*</span>
              <InfoTooltip>
                Nombre de salariés travaillant physiquement sur ce lieu.
                Conditionne certaines obligations (équipement incendie,
                exercices d&apos;évacuation…).
              </InfoTooltip>
            </Label>
            <Input
              id="effectifSurSite"
              name="effectifSurSite"
              type="number"
              min={1}
              max={9999}
              value={state.effectifSurSite}
              onChange={(e) => update({ effectifSurSite: e.target.value })}
              required
              placeholder="Ex : 8"
              aria-invalid={Boolean(errors?.effectifSurSite)}
            />
            {errors?.effectifSurSite && (
              <p className="text-sm text-destructive">
                {errors.effectifSurSite}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
