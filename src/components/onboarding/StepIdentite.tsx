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

/**
 * Étape fusionnée — identité juridique (raison sociale, SIRET) + lieu
 * principal (adresse structurée, NAF, effectif).
 * Le nom d'usage de l'établissement n'est plus demandé : il reprend la
 * raison sociale par défaut côté serveur (rename possible plus tard si
 * l'utilisateur a plusieurs sites avec des noms différents).
 */
export function StepIdentite({ state, update, errors }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="label-admin mb-2">Étape 1 sur 3 · Votre entreprise</p>
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.015em] leading-tight">
          Qui êtes-vous, et où ?
        </h2>
        <p className="mt-3 max-w-xl text-[0.88rem] leading-relaxed text-muted-foreground">
          On ne demande que le strict nécessaire — raison sociale, adresse
          du site principal, secteur et effectif. Si vous gérez plusieurs
          sites, commencez par le principal, vous ajouterez les autres
          ensuite.
        </p>
      </div>

      {/* ─── Identité juridique ──────────────────────────── */}
      <div className="cartouche space-y-6 px-6 py-7 sm:px-8">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
          §&nbsp;I · Identité juridique
        </p>

        <div className="space-y-2">
          <Label htmlFor="raisonSociale">
            Raison sociale <span className="text-destructive">*</span>
          </Label>
          <Input
            id="raisonSociale"
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
            Le nom juridique de votre structure. Apparaîtra en en-tête de
            vos documents officiels (DUERP, registre, plan d&apos;actions).
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

      {/* ─── Adresse & activité ──────────────────────────── */}
      <div className="cartouche space-y-6 px-6 py-7 sm:px-8">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
          §&nbsp;II · Le site principal
        </p>

        <div className="space-y-2">
          <Label htmlFor="adresseRue">
            Numéro et rue <span className="text-destructive">*</span>
          </Label>
          <Input
            id="adresseRue"
            autoComplete="street-address"
            value={state.adresseRue}
            onChange={(e) => update({ adresseRue: e.target.value })}
            required
            placeholder="Ex : 12 rue des Halles"
            aria-invalid={Boolean(errors?.adresse)}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[160px_1fr]">
          <div className="space-y-2">
            <Label htmlFor="adresseCodePostal">
              Code postal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="adresseCodePostal"
              inputMode="numeric"
              pattern="\d{5}"
              maxLength={5}
              value={state.adresseCodePostal}
              onChange={(e) =>
                update({
                  adresseCodePostal: e.target.value.replace(/\D/g, "").slice(0, 5),
                })
              }
              required
              placeholder="44000"
              aria-invalid={Boolean(errors?.adresse)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adresseVille">
              Ville <span className="text-destructive">*</span>
            </Label>
            <Input
              id="adresseVille"
              autoComplete="address-level2"
              value={state.adresseVille}
              onChange={(e) => update({ adresseVille: e.target.value })}
              required
              placeholder="Ex : Nantes"
              aria-invalid={Boolean(errors?.adresse)}
            />
          </div>
        </div>
        {errors?.adresse && (
          <p className="text-sm text-destructive">{errors.adresse}</p>
        )}

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
            <Label
              htmlFor="effectifSurSite"
              className="inline-flex items-center"
            >
              Effectif sur site <span className="ml-1 text-destructive">*</span>
              <InfoTooltip>
                Nombre de salariés travaillant physiquement sur ce lieu.
                Conditionne certaines obligations (équipement incendie,
                exercices d&apos;évacuation…).
              </InfoTooltip>
            </Label>
            <Input
              id="effectifSurSite"
              type="number"
              min={1}
              max={9999}
              value={state.effectifSurSite}
              onChange={(e) =>
                update({ effectifSurSite: e.target.value })
              }
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
