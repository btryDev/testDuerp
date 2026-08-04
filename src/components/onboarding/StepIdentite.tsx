"use client";

import { InfoTooltip } from "@/components/ui/info-tooltip";
import { evaluerScopeSecteur } from "@/lib/onboarding/scope";
import type { StepProps } from "./types";

const SUGGESTIONS_NAF = [
  { code: "56.10A", libelle: "Restauration" },
  { code: "47.11B", libelle: "Alimentation" },
  { code: "70.22Z", libelle: "Conseil" },
  { code: "71.12B", libelle: "Ingénierie" },
];

/**
 * Étape 1 — Identité juridique + lieu principal, fusionnées dans un seul
 * écran avec deux sections visuellement distinctes. Inputs stylisés pour
 * le shell onboarding Direction B (larges, rounded-lg, focus vert).
 */
export function StepIdentite({ state, update, errors }: StepProps) {
  const scope =
    state.codeNaf.trim().length > 0
      ? evaluerScopeSecteur(state.codeNaf)
      : null;
  const hintEffectif = hintPourEffectif(state.effectifSurSite);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-[2rem] font-semibold leading-tight tracking-[-0.03em]">
          Décrivez votre établissement
        </h2>
        <p className="mt-3 max-w-[56ch] text-[0.95rem] leading-[1.55] text-muted-foreground">
          Ces informations servent à identifier vos obligations
          réglementaires — elles ne sont jamais partagées.
        </p>
      </div>

      {/* ─── Identité juridique ─────────────────────── */}
      <section className="space-y-1">
        <p className="bento-kicker mb-4">§&nbsp;I · Identité juridique</p>
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          <OnbField
            label="Raison sociale"
            required
            fullWidth
            error={errors?.raisonSociale}
          >
            <OnbInput
              id="raisonSociale"
              value={state.raisonSociale}
              onChange={(v) => update({ raisonSociale: v })}
              placeholder="Ex : Bistrot du marché SARL"
              autoFocus
              ariaInvalid={Boolean(errors?.raisonSociale)}
            />
          </OnbField>

          <OnbField
            label="SIRET"
            hint="14 chiffres — facultatif"
            labelExtra={
              <InfoTooltip>
                Le SIRET figurera en en-tête de vos documents officiels.
              </InfoTooltip>
            }
            error={errors?.siret}
          >
            <OnbInput
              id="siret"
              value={state.siret}
              onChange={(v) => update({ siret: v })}
              placeholder="812 456 789 00021"
              inputMode="numeric"
              pattern="\d{14}"
              ariaInvalid={Boolean(errors?.siret)}
            />
          </OnbField>
        </div>
      </section>

      {/* ─── Site principal ────────────────────────── */}
      <section className="space-y-1">
        <p className="bento-kicker mb-4">§&nbsp;II · Le site principal</p>

        <div className="grid grid-cols-1 gap-x-5 gap-y-4">
          <OnbField label="Numéro et rue" required error={errors?.adresse}>
            <OnbInput
              id="adresseRue"
              value={state.adresseRue}
              onChange={(v) => update({ adresseRue: v })}
              placeholder="12 rue des Halles"
              autoComplete="street-address"
              ariaInvalid={Boolean(errors?.adresse)}
            />
          </OnbField>

          <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-[160px_1fr]">
            <OnbField label="Code postal" required>
              <OnbInput
                id="adresseCodePostal"
                value={state.adresseCodePostal}
                onChange={(v) =>
                  update({
                    adresseCodePostal: v.replace(/\D/g, "").slice(0, 5),
                  })
                }
                placeholder="75011"
                inputMode="numeric"
                pattern="\d{5}"
                maxLength={5}
                ariaInvalid={Boolean(errors?.adresse)}
              />
            </OnbField>
            <OnbField label="Ville" required>
              <OnbInput
                id="adresseVille"
                value={state.adresseVille}
                onChange={(v) => update({ adresseVille: v })}
                placeholder="Paris"
                autoComplete="address-level2"
                ariaInvalid={Boolean(errors?.adresse)}
              />
            </OnbField>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            <OnbField
              label="Code NAF"
              required
              error={errors?.codeNaf}
              labelExtra={
                <InfoTooltip>
                  Code INSEE qui figure sur votre avis de situation. Détermine
                  votre secteur et pré-remplit les risques types pour le DUERP.
                </InfoTooltip>
              }
            >
              <OnbInput
                id="codeNaf"
                value={state.codeNaf}
                onChange={(v) => update({ codeNaf: v.toUpperCase() })}
                placeholder="56.10A"
                ariaInvalid={
                  Boolean(errors?.codeNaf) ||
                  scope?.status === "hors_perimetre"
                }
                className="uppercase"
              />
              {scope?.status === "ok" && !errors?.codeNaf ? (
                <p className="mt-1 flex items-center gap-1.5 text-[0.78rem] text-[color:var(--accent-vif)]">
                  <span aria-hidden>✓</span>
                  Secteur reconnu : {scope.secteurNom}
                </p>
              ) : null}
              {scope?.status === "hors_perimetre" && !errors?.codeNaf ? (
                <div className="mt-1.5 rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2.5 text-[0.82rem] leading-[1.5] text-destructive">
                  <p className="font-medium">Secteur non couvert par la V2</p>
                  <p className="mt-1">{scope.raison}</p>
                  <p className="mt-2 text-destructive/80">{scope.exemple}</p>
                </div>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-1.5">
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
            </OnbField>

            <OnbField
              label="Effectif sur site"
              required
              hint="Salariés + apprentis présents régulièrement"
              error={errors?.effectifSurSite}
            >
              <OnbInput
                id="effectifSurSite"
                type="number"
                value={state.effectifSurSite}
                onChange={(v) => update({ effectifSurSite: v })}
                placeholder="8"
                min={1}
                max={9999}
                ariaInvalid={Boolean(errors?.effectifSurSite)}
              />
            </OnbField>
          </div>

          {hintEffectif ? (
            <div className="rounded-lg border border-[color:color-mix(in_oklch,var(--accent-vif)_20%,transparent)] bg-[color:var(--accent-vif-soft)] px-4 py-3">
              <strong className="block text-[0.92rem] text-[color:var(--accent-vif)]">
                {hintEffectif.titre}
              </strong>
              <span className="mt-1 block text-[0.8rem] leading-[1.5] text-ink/80">
                {hintEffectif.corps}
              </span>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

/* ─── Building blocks ──────────────────────────────────── */

function OnbField({
  label,
  required,
  hint,
  error,
  fullWidth,
  labelExtra,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  fullWidth?: boolean;
  labelExtra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={"flex flex-col gap-1.5 " + (fullWidth ? "sm:col-span-2" : "")}
    >
      <span className="flex items-center gap-1 text-[0.84rem] font-medium">
        {label}
        {required ? <span className="text-destructive">*</span> : null}
        {labelExtra}
      </span>
      {children}
      {hint ? (
        <span className="text-[0.74rem] text-muted-foreground">{hint}</span>
      ) : null}
      {error ? (
        <span className="text-[0.8rem] text-destructive">{error}</span>
      ) : null}
    </div>
  );
}

function OnbInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  pattern,
  maxLength,
  min,
  max,
  autoComplete,
  autoFocus,
  ariaInvalid,
  className = "",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "email";
  inputMode?: "numeric" | "text";
  pattern?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  ariaInvalid?: boolean;
  className?: string;
}) {
  return (
    <input
      id={id}
      name={id}
      type={type}
      inputMode={inputMode}
      pattern={pattern}
      maxLength={maxLength}
      min={min}
      max={max}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-invalid={ariaInvalid}
      className={
        "w-full rounded-lg border border-rule bg-paper-elevated px-3.5 py-3 text-[0.95rem] transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground/60 focus:border-[color:var(--accent-vif)] focus:shadow-[0_0_0_3px_var(--accent-vif-soft)] aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_color-mix(in_oklch,var(--destructive)_12%,transparent)] " +
        className
      }
    />
  );
}

function hintPourEffectif(
  v: string,
): { titre: string; corps: string } | null {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 1) return null;
  if (n < 11) {
    return {
      titre: `${n} salarié${n > 1 ? "s" : ""}`,
      corps:
        "Seuil CSSCT (11+) non atteint — certaines obligations sont allégées (élections, consultation CSE).",
    };
  }
  if (n < 50) {
    return {
      titre: `${n} salariés`,
      corps:
        "Seuil CSSCT atteint — mise à jour annuelle du DUERP obligatoire, élection d'un CSE sous 12 mois.",
    };
  }
  return {
    titre: `${n} salariés`,
    corps:
      "Seuil 50+ — CSSCT dédiée, programme annuel de prévention à présenter au CSE, bilan HSCT.",
  };
}
