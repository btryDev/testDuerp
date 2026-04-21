"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { StepIdentite } from "./StepIdentite";
import { StepEtablissement } from "./StepEtablissement";
import {
  VALEURS_INITIALES,
  type OnboardingState,
  type StepProps,
} from "./types";

type Etape = {
  id: "identite" | "etablissement" | "typologie" | "resume";
  numero: number;
  titre: string;
  Component: React.ComponentType<StepProps>;
  /**
   * Validation client locale — empêche de passer à l'étape suivante
   * si les champs obligatoires sont vides. Les vraies erreurs de
   * format sont remontées côté serveur à la fin.
   */
  valide: (s: OnboardingState) => string | null;
};

function PlaceholderStepTypologie(_props: StepProps) {
  void _props;
  return (
    <div className="space-y-4">
      <p className="label-admin mb-2">Étape 3 sur 4 · À venir</p>
      <h2 className="text-[1.6rem] font-semibold tracking-[-0.015em]">
        Votre type d&apos;établissement
      </h2>
      <p className="max-w-xl text-[0.88rem] leading-relaxed text-muted-foreground">
        Cette étape sera ajoutée dans le commit suivant — elle demandera si
        vous accueillez du public (ERP), la hauteur du bâtiment (IGH) et la
        présence de logements.
      </p>
    </div>
  );
}

function PlaceholderStepResume(_props: StepProps) {
  void _props;
  return (
    <div className="space-y-4">
      <p className="label-admin mb-2">Étape 4 sur 4 · À venir</p>
      <h2 className="text-[1.6rem] font-semibold tracking-[-0.015em]">
        Résumé & confirmation
      </h2>
      <p className="max-w-xl text-[0.88rem] leading-relaxed text-muted-foreground">
        Cette étape montrera un récapitulatif avant création.
      </p>
    </div>
  );
}

const ETAPES: Etape[] = [
  {
    id: "identite",
    numero: 1,
    titre: "Identité",
    Component: StepIdentite,
    valide: (s) =>
      s.raisonSociale.trim().length === 0
        ? "Indiquez la raison sociale pour continuer."
        : null,
  },
  {
    id: "etablissement",
    numero: 2,
    titre: "Établissement",
    Component: StepEtablissement,
    valide: (s) => {
      if (s.raisonDisplay.trim().length === 0)
        return "Indiquez un nom d'usage pour votre établissement.";
      if (s.adresse.trim().length === 0) return "Indiquez l'adresse.";
      if (s.codeNaf.trim().length === 0) return "Indiquez le code NAF.";
      if (!/^\d{2}\.?\d{2}[A-Z]?$/i.test(s.codeNaf.trim()))
        return "Le code NAF doit ressembler à 56.10A.";
      const n = Number(s.effectifSurSite);
      if (!Number.isInteger(n) || n < 1)
        return "Indiquez un effectif (au moins 1).";
      return null;
    },
  },
  {
    id: "typologie",
    numero: 3,
    titre: "Typologie",
    Component: PlaceholderStepTypologie,
    valide: () => null,
  },
  {
    id: "resume",
    numero: 4,
    titre: "Résumé",
    Component: PlaceholderStepResume,
    valide: () => null,
  },
];

export function WizardShell() {
  const [state, setState] = useState<OnboardingState>(VALEURS_INITIALES);
  const [etapeIdx, setEtapeIdx] = useState(0);
  const [blocage, setBlocage] = useState<string | null>(null);

  const etape = ETAPES[etapeIdx];
  const CurrentStep = etape.Component;

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

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10 sm:py-14">
      {/* Fil d'Ariane discret */}
      <nav className="mb-6">
        <Link
          href="/"
          className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← Retour à l&apos;accueil
        </Link>
      </nav>

      {/* Progress segments */}
      <div className="mb-10">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
            Mise en place
          </p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink tabular-nums">
            {etape.numero} / {ETAPES.length}
          </p>
        </div>
        <div className="mt-3 flex gap-1.5" aria-hidden>
          {ETAPES.map((e, i) => (
            <span
              key={e.id}
              className={
                "h-[5px] flex-1 rounded-full transition-colors " +
                (i < etapeIdx
                  ? "bg-emerald-500"
                  : i === etapeIdx
                    ? "bg-ink"
                    : "bg-rule")
              }
            />
          ))}
        </div>
        <ol className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.6rem] uppercase tracking-[0.14em]">
          {ETAPES.map((e, i) => (
            <li
              key={e.id}
              className={
                i === etapeIdx
                  ? "text-ink"
                  : i < etapeIdx
                    ? "text-emerald-700"
                    : "text-muted-foreground"
              }
            >
              {e.numero}. {e.titre}
            </li>
          ))}
        </ol>
      </div>

      <CurrentStep state={state} update={update} />

      {blocage && (
        <p className="mt-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {blocage}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-rule/60 pt-6">
        {etapeIdx > 0 ? (
          <Button variant="outline" onClick={precedent}>
            ← Précédent
          </Button>
        ) : (
          <Link
            href="/"
            className={buttonVariants({ variant: "outline" })}
          >
            Annuler
          </Link>
        )}

        {etapeIdx < ETAPES.length - 1 ? (
          <Button onClick={suivant}>Suivant →</Button>
        ) : (
          <Button disabled>Créer mon espace (bientôt)</Button>
        )}
      </div>
    </main>
  );
}
