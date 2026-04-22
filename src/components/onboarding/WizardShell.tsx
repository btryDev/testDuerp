"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { StepIdentite } from "./StepIdentite";
import { StepTypologie } from "./StepTypologie";
import { StepResume } from "./StepResume";
import {
  finaliserOnboarding,
  type OnboardingActionState,
} from "@/lib/onboarding/actions";
import {
  VALEURS_INITIALES,
  type OnboardingState,
  type StepProps,
} from "./types";

type Etape = {
  id: "identite" | "typologie" | "resume";
  numero: number;
  titre: string;
  Component: React.ComponentType<StepProps>;
  /**
   * Validation client locale — empêche de passer à l'étape suivante
   * si les champs obligatoires sont vides ou mal formés. Les vraies
   * erreurs de format final sont re-vérifiées côté serveur (Zod).
   */
  valide: (s: OnboardingState) => string | null;
};

const ETAPES: Etape[] = [
  {
    id: "identite",
    numero: 1,
    titre: "Identité & lieu",
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

  // Erreurs serveur par champ, projetées sur les StepProps pour affichage
  // contextuel en cas d'échec de validation Zod côté serveur.
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

      {/* Le form entoure TOUT pour que la server action reçoive les
          champs cachés générés à partir du state React au moment du
          submit à l'étape 4. Les étapes intermédiaires sont naviguées
          par boutons type="button", sans soumission. */}
      <form action={formAction}>
        <CurrentStep state={state} update={update} errors={serverErrors} />

        {/* Champs cachés qui reflètent le state, toujours sérialisés */}
        <ChampsCaches state={state} />

        {blocage && (
          <p className="mt-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {blocage}
          </p>
        )}

        {serverState.status === "error" && !serverState.fieldErrors && (
          <p className="mt-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {serverState.message}
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-rule/60 pt-6">
          {etapeIdx > 0 ? (
            <Button type="button" variant="outline" onClick={precedent}>
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
            <Button type="button" onClick={suivant}>
              Suivant →
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              {submitting ? "Création en cours…" : "Créer mon espace →"}
            </Button>
          )}
        </div>
      </form>
    </main>
  );
}

/**
 * Champs HTML masqués qui sérialisent le state en FormData pour la
 * server action. Évite de manipuler FormData à la main dans le submit.
 */
function ChampsCaches({ state }: { state: OnboardingState }) {
  // Adresse recomposée : "12 rue des Halles, 44000 Nantes" — forme stable
  // utilisée en base pour Entreprise.adresse / Etablissement.adresse.
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
