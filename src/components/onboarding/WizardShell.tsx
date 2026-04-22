"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import { StepIdentite } from "./StepIdentite";
import { StepTypologie } from "./StepTypologie";
import { StepResume } from "./StepResume";
import {
  finaliserOnboarding,
  type OnboardingActionState,
} from "@/lib/onboarding/actions";
import { evaluerScopeSecteur } from "@/lib/onboarding/scope";
import {
  VALEURS_INITIALES,
  type OnboardingState,
  type StepProps,
} from "./types";

type Etape = {
  id: "identite" | "typologie" | "resume";
  numero: number;
  titre: string;
  sousTitre: string;
  Component: React.ComponentType<StepProps>;
  valide: (s: OnboardingState) => string | null;
};

const ETAPES: Etape[] = [
  {
    id: "identite",
    numero: 1,
    titre: "Identité & lieu",
    sousTitre: "SIRET, adresse, effectif",
    Component: StepIdentite,
    valide: (s) => {
      if (s.raisonSociale.trim().length === 0)
        return "Indiquez la raison sociale pour continuer.";
      if (s.adresseRue.trim().length < 3)
        return "Indiquez le numéro et la rue.";
      if (!/^\d{5}$/.test(s.adresseCodePostal.trim()))
        return "Le code postal doit faire 5 chiffres.";
      if (s.adresseVille.trim().length < 2) return "Indiquez la ville.";
      if (s.codeNaf.trim().length === 0) return "Indiquez le code NAF.";
      if (!/^\d{2}\.?\d{2}[A-Z]?$/i.test(s.codeNaf.trim()))
        return "Le code NAF doit ressembler à 56.10A.";
      const scope = evaluerScopeSecteur(s.codeNaf);
      if (scope.status === "hors_perimetre") {
        return `Secteur non couvert. ${scope.raison}`;
      }
      const n = Number(s.effectifSurSite);
      if (!Number.isInteger(n) || n < 1)
        return "Indiquez un effectif (au moins 1).";
      return null;
    },
  },
  {
    id: "typologie",
    numero: 2,
    titre: "Typologie",
    sousTitre: "Régimes ERP/IGH/Travail",
    Component: StepTypologie,
    valide: (s) => {
      if (
        !s.estEtablissementTravail &&
        !s.estERP &&
        !s.estIGH &&
        !s.estHabitation
      )
        return "Cochez au moins un régime (travail, ERP, IGH ou habitation).";
      if (s.estERP && !s.typeErp) return "Précisez votre activité ERP.";
      if (s.estERP && !s.categorieErp)
        return "Précisez votre capacité d'accueil.";
      if (s.estIGH && !s.classeIgh) return "Précisez la classe IGH.";
      return null;
    },
  },
  {
    id: "resume",
    numero: 3,
    titre: "Résumé",
    sousTitre: "Vérifier et créer",
    Component: StepResume,
    valide: () => null,
  },
];

export function WizardShell() {
  const [state, setState] = useState<OnboardingState>(VALEURS_INITIALES);
  const [etapeIdx, setEtapeIdx] = useState(0);
  const [blocage, setBlocage] = useState<string | null>(null);

  const [serverState, formAction, submitting] = useActionState<
    OnboardingActionState,
    FormData
  >(finaliserOnboarding, { status: "idle" });

  const etape = ETAPES[etapeIdx];
  const CurrentStep = etape.Component;

  const serverErrors =
    serverState.status === "error"
      ? Object.fromEntries(
          Object.entries(serverState.fieldErrors ?? {}).map(([k, v]) => [
            k,
            v?.[0],
          ]),
        )
      : undefined;

  const update = (patch: Partial<OnboardingState>) => {
    setState((s) => ({ ...s, ...patch }));
    setBlocage(null);
  };

  const suivant = () => {
    const err = etape.valide(state);
    if (err) {
      setBlocage(err);
      return;
    }
    setBlocage(null);
    if (etapeIdx < ETAPES.length - 1) setEtapeIdx((i) => i + 1);
  };

  const precedent = () => {
    setBlocage(null);
    if (etapeIdx > 0) setEtapeIdx((i) => i - 1);
  };

  const allerEtape = (idx: number) => {
    // On autorise uniquement de reculer librement ; avancer requiert la
    // validation de chaque étape franchie.
    if (idx <= etapeIdx) {
      setBlocage(null);
      setEtapeIdx(idx);
      return;
    }
    for (let i = etapeIdx; i < idx; i++) {
      const err = ETAPES[i].valide(state);
      if (err) {
        setBlocage(err);
        return;
      }
    }
    setBlocage(null);
    setEtapeIdx(idx);
  };

  const progression = ((etapeIdx + 1) / ETAPES.length) * 100;

  return (
    <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 bg-paper text-ink lg:grid-cols-[320px_1fr]">
      {/* ─── Rail sombre ──────────────────────────────────────── */}
      <aside className="relative hidden flex-col gap-8 overflow-hidden bg-[color:var(--ink)] px-7 py-8 text-[color:var(--paper-elevated)] lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_100%,color-mix(in_oklch,var(--accent-vif)_25%,transparent)_0%,transparent_60%)]"
        />
        <Link
          href="/"
          className="relative flex items-center gap-1.5 text-[1.08rem] font-semibold tracking-[-0.02em] text-[color:var(--accent-vif)]"
        >
          <span className="size-2 rounded-full bg-[color:var(--accent-vif)]" />
          DUERP
          <span className="text-[color:var(--paper-elevated)]">.fr</span>
        </Link>

        <h2 className="relative text-[1.65rem] font-medium leading-[1.1] tracking-[-0.025em]">
          Mise en place
          <br />
          <em className="mt-1 block text-[0.95em] font-normal italic text-[color:var(--accent-vif)] [font-family:var(--font-serif)]">
            de votre espace
          </em>
        </h2>

        <ol className="relative flex flex-col gap-2.5">
          {ETAPES.map((e, i) => {
            const done = i < etapeIdx;
            const active = i === etapeIdx;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => allerEtape(i)}
                  className={
                    "grid w-full grid-cols-[34px_1fr] items-start gap-3 rounded-lg px-3 py-3.5 text-left transition-colors " +
                    (active
                      ? "bg-[color:color-mix(in_oklch,var(--paper-elevated)_12%,transparent)]"
                      : "hover:bg-[color:color-mix(in_oklch,var(--paper-elevated)_7%,transparent)]")
                  }
                >
                  <span
                    className={
                      "flex size-[30px] items-center justify-center rounded-full font-mono text-[0.86rem] font-medium " +
                      (active || done
                        ? "bg-[color:var(--accent-vif)] text-[color:var(--paper-elevated)]"
                        : "bg-[color:color-mix(in_oklch,var(--paper-elevated)_10%,transparent)]")
                    }
                  >
                    {done ? <Check aria-hidden className="size-4" /> : i + 1}
                  </span>
                  <div>
                    <strong className="block text-[0.92rem] font-medium">
                      {e.titre}
                    </strong>
                    <em className="block text-[0.76rem] not-italic text-[color:color-mix(in_oklch,var(--paper-elevated)_65%,transparent)]">
                      {e.sousTitre}
                    </em>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="relative mt-auto text-[0.78rem] text-[color:color-mix(in_oklch,var(--paper-elevated)_70%,transparent)]">
          <div className="mb-1.5 flex items-center gap-2">
            <ShieldCheck aria-hidden className="size-4" /> Données hébergées UE
          </div>
          <em className="not-italic">
            Vous pouvez revenir modifier plus tard.
          </em>
        </div>
      </aside>

      {/* ─── Main ─────────────────────────────────────────────── */}
      <div className="flex flex-col px-6 py-8 sm:px-14 sm:py-9">
        {/* Header mobile : affiche le brand quand le rail est caché */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[1.02rem] font-semibold tracking-[-0.02em] text-[color:var(--accent-vif)]"
          >
            <span className="size-2 rounded-full bg-[color:var(--accent-vif)]" />
            DUERP<span className="text-ink">.fr</span>
          </Link>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
              Étape {etape.numero} / {ETAPES.length}
            </span>
            <Link
              href="/"
              className="text-[0.8rem] text-muted-foreground underline decoration-rule decoration-dotted underline-offset-4 hover:text-ink"
            >
              Enregistrer et quitter
            </Link>
          </div>
          <div
            className="h-1 overflow-hidden rounded-full bg-rule-soft"
            role="progressbar"
            aria-valuenow={etape.numero}
            aria-valuemin={1}
            aria-valuemax={ETAPES.length}
          >
            <div
              className="h-full rounded-full bg-[color:var(--accent-vif)] transition-[width] duration-500"
              style={{ width: `${progression}%` }}
            />
          </div>
        </div>

        <form action={formAction} className="flex flex-1 flex-col">
          <div className="max-w-[720px] flex-1">
            <CurrentStep
              state={state}
              update={update}
              errors={serverErrors}
            />
          </div>

          <ChampsCaches state={state} />

          {blocage ? (
            <p className="mt-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {blocage}
            </p>
          ) : null}

          {serverState.status === "error" && !serverState.fieldErrors ? (
            <p className="mt-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {serverState.message}
            </p>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-rule-soft pt-8">
            {etapeIdx > 0 ? (
              <button
                type="button"
                onClick={precedent}
                className="rounded-lg border border-rule bg-transparent px-4 py-2.5 text-[0.86rem] text-ink transition-colors hover:border-ink"
              >
                ← Précédent
              </button>
            ) : (
              <Link
                href="/"
                className="rounded-lg border border-rule bg-transparent px-4 py-2.5 text-[0.86rem] text-ink transition-colors hover:border-ink"
              >
                Annuler
              </Link>
            )}

            {etapeIdx < ETAPES.length - 1 ? (
              <button
                type="button"
                onClick={suivant}
                className="rounded-lg bg-[color:var(--accent-vif)] px-5 py-2.5 text-[0.88rem] font-medium text-[color:var(--paper-elevated)] transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[0_8px_20px_-8px_color-mix(in_oklch,var(--accent-vif)_60%,transparent)]"
              >
                Suivant →
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[color:var(--accent-vif)] px-6 py-3 text-[0.95rem] font-medium text-[color:var(--paper-elevated)] transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[0_8px_20px_-8px_color-mix(in_oklch,var(--accent-vif)_60%,transparent)] disabled:opacity-60"
              >
                {submitting ? "Création en cours…" : "Créer mon espace →"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function ChampsCaches({ state }: { state: OnboardingState }) {
  const adresseComplete = [
    state.adresseRue.trim(),
    [state.adresseCodePostal.trim(), state.adresseVille.trim()]
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <input type="hidden" name="raisonSociale" value={state.raisonSociale} />
      <input type="hidden" name="siret" value={state.siret} />
      <input type="hidden" name="adresse" value={adresseComplete} />
      <input type="hidden" name="codeNaf" value={state.codeNaf} />
      <input
        type="hidden"
        name="effectifSurSite"
        value={state.effectifSurSite}
      />
      <input
        type="hidden"
        name="estEtablissementTravail"
        value={state.estEtablissementTravail ? "true" : "false"}
      />
      <input type="hidden" name="estERP" value={state.estERP ? "true" : "false"} />
      <input type="hidden" name="estIGH" value={state.estIGH ? "true" : "false"} />
      <input
        type="hidden"
        name="estHabitation"
        value={state.estHabitation ? "true" : "false"}
      />
      <input type="hidden" name="typeErp" value={state.typeErp} />
      <input type="hidden" name="categorieErp" value={state.categorieErp} />
      <input type="hidden" name="classeIgh" value={state.classeIgh} />
    </>
  );
}
