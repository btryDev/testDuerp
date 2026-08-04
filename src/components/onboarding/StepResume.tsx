"use client";

import type { StepProps } from "./types";
import {
  CHOIX_ACTIVITE_ERP,
  CHOIX_CLASSES_IGH,
} from "@/lib/onboarding/deduction-erp";

/**
 * Étape 3 — Résumé & forecast.
 * Carte summary des informations saisies + carte forecast « ce qu'on va
 * générer pour vous », alignée sur le design Direction B.
 */
export function StepResume({ state }: StepProps) {
  const typeErpLabel =
    CHOIX_ACTIVITE_ERP.find((c) => c.typeErp === state.typeErp)?.label ??
    state.typeErp;
  const classeIghLabel =
    CHOIX_CLASSES_IGH.find((c) => c.id === state.classeIgh)?.label ??
    state.classeIgh;

  const regimes: string[] = [];
  if (state.estEtablissementTravail) regimes.push("Travail");
  if (state.estERP) {
    const precisions = [
      state.typeErp ? typeErpLabel : null,
      state.categorieErp ? `${state.categorieErp.slice(1)}ᵉ cat.` : null,
    ].filter(Boolean);
    regimes.push(
      precisions.length > 0 ? `ERP · ${precisions.join(" · ")}` : "ERP",
    );
  }
  if (state.estIGH) {
    regimes.push(
      classeIghLabel ? `IGH · ${classeIghLabel}` : "IGH",
    );
  }
  if (state.estHabitation) regimes.push("Habitation");

  const adresseComplete = [
    state.adresseRue.trim(),
    [state.adresseCodePostal.trim(), state.adresseVille.trim()]
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[2rem] font-semibold leading-tight tracking-[-0.03em]">
          Vérification
        </h2>
        <p className="mt-3 max-w-[56ch] text-[0.95rem] leading-[1.55] text-muted-foreground">
          Tout est bon ? En créant l&apos;espace, on génère votre premier
          établissement et la trame DUERP pré-remplie.
        </p>
      </div>

      {/* Summary card */}
      <section className="rounded-2xl border border-rule-soft bg-paper-elevated p-6">
        <div>
          <strong className="text-[1.2rem] font-semibold tracking-[-0.02em]">
            {state.raisonSociale || "—"}
          </strong>
          {state.siret ? (
            <em className="mt-1 block font-mono text-[0.82rem] not-italic text-muted-foreground">
              SIRET {state.siret}
            </em>
          ) : null}
        </div>
        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <SumLigne label="Adresse" valeur={adresseComplete || "—"} />
          <SumLigne label="Code NAF" valeur={state.codeNaf || "—"} />
          <SumLigne
            label="Effectif"
            valeur={
              state.effectifSurSite
                ? `${state.effectifSurSite} salarié${Number(state.effectifSurSite) > 1 ? "s" : ""}`
                : "—"
            }
          />
          <SumLignePills
            label="Régimes"
            pills={regimes.length > 0 ? regimes : ["—"]}
          />
        </dl>
      </section>

      {/* Forecast */}
      <section className="rounded-2xl border border-[color:color-mix(in_oklch,var(--accent-vif)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--accent-vif)_5%,var(--paper-elevated))] px-6 py-5">
        <div>
          <strong className="block text-[1rem] font-medium text-[color:var(--accent-vif)]">
            Ce qu&apos;on va générer pour vous
          </strong>
          <em className="mt-1 block text-[0.82rem] not-italic text-muted-foreground">
            Dès que vous déclarerez vos équipements, le calendrier des
            vérifications se remplira automatiquement.
          </em>
        </div>
        <ul className="mt-4 flex flex-col gap-2 text-[0.9rem]">
          <ForecastLi>
            Espace entreprise + premier établissement liés
          </ForecastLi>
          <ForecastLi>Trame DUERP pré-remplie pour votre secteur</ForecastLi>
          <ForecastLi>Registre de sécurité horodaté</ForecastLi>
          <ForecastLi>
            Modèle de plan d&apos;actions prêt à suivre
          </ForecastLi>
        </ul>
      </section>
    </div>
  );
}

function SumLigne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="border-t border-dashed border-rule-soft pt-4">
      <dt className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 text-[0.92rem]">{valeur}</dd>
    </div>
  );
}

function SumLignePills({
  label,
  pills,
}: {
  label: string;
  pills: string[];
}) {
  return (
    <div className="border-t border-dashed border-rule-soft pt-4">
      <dt className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 flex flex-wrap gap-1.5">
        {pills.map((p, i) => (
          <span
            key={`${p}-${i}`}
            className="rounded-full bg-[color:var(--accent-vif-soft)] px-2.5 py-0.5 text-[0.76rem] font-medium text-[color:var(--accent-vif)]"
          >
            {p}
          </span>
        ))}
      </dd>
    </div>
  );
}

function ForecastLi({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="inline-block size-1.5 rounded-full bg-[color:var(--accent-vif)]"
      />
      {children}
    </li>
  );
}
