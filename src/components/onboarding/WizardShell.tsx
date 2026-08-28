"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      // Le code NAF n'a plus à désigner un secteur instruit pour qu'on
      // avance. Il doit seulement AVOIR la forme d'un code NAF : sans ça, ni
      // le référentiel sectoriel ni les écrans ne savent quoi en faire, et
      // c'est une erreur de saisie, pas un refus de périmètre.
      //
      // `sans_referentiel` ne bloque rien : l'absence de référentiel se dit à
      // l'écran (`StepIdentite`) puis, en permanence, sur le dossier
      // (`perimetre/couverture.ts`, axe `secteur_duerp`). Barrer ici privait
      // l'établissement de tout le référentiel de conformité — qui ne lit
      // jamais le NAF — pour une cotation de risques qu'il n'avait pas
      // demandée.
      if (evaluerScopeSecteur(s.codeNaf).status === "format_invalide") {
        return "Le code NAF doit ressembler à 56.10A.";
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
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>(VALEURS_INITIALES);
  const [etapeIdx, setEtapeIdx] = useState(0);
  const [blocage, setBlocage] = useState<string | null>(null);

  // Quitter : rien n'est persisté avant l'étape finale (état React pur),
  // donc on le dit honnêtement au lieu d'un « Enregistrer et quitter »
  // trompeur. Confirmation seulement si l'utilisateur a commencé à saisir.
  const quitter = () => {
    const modifie =
      JSON.stringify(state) !== JSON.stringify(VALEURS_INITIALES);
    if (
      modifie &&
      !window.confirm(
        "Quitter la mise en place ?\n\nVos réponses ne seront pas conservées — le questionnaire ne prend que quelques minutes et pourra être repris depuis le début.",
      )
    ) {
      return;
    }
    router.push("/");
  };

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
    <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 bg-[color:var(--board-canvas)] text-[color:var(--board-ink)] lg:grid-cols-[320px_1fr]">
      {/* ─── Rail ─────────────────────────────────────────────── */}
      {/* Même chrome que `AppSidebar` : encre pleine, blancs voilés,
          marque en toutes lettres. La mise en place est le premier écran
          de l'application, pas son antichambre — un rail au dessin propre
          se lirait comme un autre produit. */}
      <aside className="hidden flex-col gap-8 bg-[color:var(--board-ink)] px-7 py-8 text-white lg:flex">
        <Link
          href="/"
          className="flex items-baseline gap-2 text-[17px] font-semibold leading-none tracking-[-0.025em] text-white transition-colors hover:text-white/75"
        >
          Rojer
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
            conformité
          </span>
        </Link>

        <h2 className="board-titre m-0 text-[26px] text-white">
          Mise en place de votre espace
        </h2>

        {/* Les étapes gardent leur numéro : l'ordre porte ici une
            information — on ne peut pas décrire sa typologie avant d'avoir
            dit où l'on est, et l'écran de résumé n'existe qu'après les
            deux. Le numéro n'est pas une décoration, c'est le repère de
            « combien il en reste ». */}
        <ol className="flex flex-col gap-1.5">
          {ETAPES.map((e, i) => {
            const done = i < etapeIdx;
            const active = i === etapeIdx;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => allerEtape(i)}
                  aria-current={active ? "step" : undefined}
                  className={
                    "grid w-full grid-cols-[34px_1fr] items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors " +
                    (active ? "bg-white/10" : "hover:bg-white/[0.06]")
                  }
                >
                  <span
                    aria-hidden
                    className={
                      "flex size-[30px] items-center justify-center rounded-full font-mono text-[12.5px] font-medium tabular-nums " +
                      (active || done
                        ? "bg-white text-[color:var(--board-ink)]"
                        : "bg-white/10 text-white/70")
                    }
                  >
                    {done ? <Check aria-hidden className="size-4" /> : i + 1}
                  </span>
                  <div>
                    {/* La coche remplace le chiffre : sans ce doublon lu à
                        voix haute, une étape franchie perdrait son rang. */}
                    <span className="sr-only">
                      {`Étape ${e.numero}${done ? ", terminée" : ""} : `}
                    </span>
                    <strong className="block text-[13px] font-semibold">
                      {e.titre}
                    </strong>
                    <span className="block text-[11.5px] text-white/55">
                      {e.sousTitre}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-auto text-[12px] leading-[1.5] text-white/60">
          <div className="mb-1.5 flex items-center gap-2">
            <ShieldCheck aria-hidden className="size-4" /> Données hébergées UE
          </div>
          <span>Toutes les informations restent modifiables après la création.</span>
        </div>
      </aside>

      {/* ─── Colonne principale ───────────────────────────────── */}
      <div className="flex flex-col px-[var(--board-gutter)] py-8">
        {/* La marque, quand le rail est replié sous le point de rupture. */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <Link
            href="/"
            className="flex items-baseline gap-2 text-[16px] font-semibold leading-none tracking-[-0.025em] text-[color:var(--board-ink)]"
          >
            Rojer
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--board-slate-soft)]">
              conformité
            </span>
          </Link>
        </div>

        {/* Progression */}
        <div className="mb-8">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="board-eyebrow m-0 text-[10px] tracking-[0.16em] tabular-nums text-[color:var(--board-slate-soft)]">
              Étape {etape.numero} / {ETAPES.length}
            </span>
            <button
              type="button"
              onClick={quitter}
              className="text-[12.5px] text-[color:var(--board-slate-mid)] underline decoration-[color:var(--board-slate)] decoration-dotted underline-offset-4 transition-colors hover:text-[color:var(--board-ink)]"
            >
              Quitter
            </button>
          </div>
          <div
            className="h-1 overflow-hidden rounded-full bg-[color:var(--board-slate-line)]"
            role="progressbar"
            aria-label="Progression de la mise en place"
            aria-valuenow={etape.numero}
            aria-valuemin={1}
            aria-valuemax={ETAPES.length}
          >
            {/* Le board n'a pas d'accent saturé : l'emphase s'y fait à
                l'encre. La barre est donc noire sur filet ardoise. */}
            <div
              className="h-full rounded-full bg-[color:var(--board-ink)] transition-[width] duration-500 motion-reduce:transition-none"
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

          {blocage ? <Blocage>{blocage}</Blocage> : null}

          {serverState.status === "error" && !serverState.fieldErrors ? (
            <Blocage>{serverState.message}</Blocage>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--board-slate-line)] pt-8">
            {etapeIdx > 0 ? (
              <Button
                type="button"
                variant="boardClair"
                size="board"
                onClick={precedent}
              >
                ← Précédent
              </Button>
            ) : (
              <Button
                type="button"
                variant="boardClair"
                size="board"
                onClick={quitter}
              >
                Annuler
              </Button>
            )}

            {etapeIdx < ETAPES.length - 1 ? (
              <Button
                type="button"
                variant="board"
                size="board"
                onClick={suivant}
              >
                Suivant →
              </Button>
            ) : (
              <Button
                type="submit"
                variant="board"
                size="board"
                disabled={submitting}
              >
                {submitting ? "Création en cours…" : "Créer mon espace →"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Le refus d'avancer. C'est la seule réponse à un clic sur « Suivant » qui
 * échoue : sans `role="alert"`, l'écran ne bougeait pas et rien n'était
 * annoncé — le bouton passait pour inerte.
 *
 * Voile rose pleine largeur plutôt que la ligne d'erreur de champ : la
 * phrase ne se rattache à aucun champ précis, elle barre le passage.
 */
function Blocage({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="m-0 mt-6 rounded-[18px] bg-[color:var(--board-signal-wash)] px-4 py-3 text-[12.5px] leading-[1.55] text-[color:var(--board-signal-ink)] shadow-[inset_0_0_0_1px_var(--board-signal-line)]"
    >
      {children}
    </p>
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
      <input
        type="hidden"
        name="personnesPresentesHabituellement"
        value={state.personnesPresentesHabituellement}
      />
      <input
        type="hidden"
        name="manipuleMatieresR422722"
        value={state.manipuleMatieresR422722}
      />
      <input type="hidden" name="typeErp" value={state.typeErp} />
      <input type="hidden" name="categorieErp" value={state.categorieErp} />
      <input type="hidden" name="classeIgh" value={state.classeIgh} />
    </>
  );
}
