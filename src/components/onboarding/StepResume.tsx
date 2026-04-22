"use client";

import type { StepProps } from "./types";
import {
  CHOIX_ACTIVITE_ERP,
  CHOIX_CLASSES_IGH,
} from "@/lib/onboarding/deduction-erp";

/**
 * Étape 4 — Résumé final en langage naturel avant création.
 * Énonce ce que l'outil a compris pour que le dirigeant valide en un
 * coup d'œil. Le lien « Modifier » pour chaque bloc ramène à l'étape
 * concernée.
 */
export function StepResume({ state }: StepProps) {
  const typeErpLabel =
    CHOIX_ACTIVITE_ERP.find((c) => c.typeErp === state.typeErp)?.label ??
    state.typeErp;
  const classeIghLabel =
    CHOIX_CLASSES_IGH.find((c) => c.id === state.classeIgh)?.label ??
    state.classeIgh;

  const regimes: string[] = [];
  if (state.estEtablissementTravail) regimes.push("Établissement de travail");
  if (state.estERP)
    regimes.push(
      `ERP ${state.typeErp ? `· ${typeErpLabel}` : ""}${
        state.categorieErp ? ` · ${state.categorieErp.slice(1)}ᵉ cat.` : ""
      }`,
    );
  if (state.estIGH)
    regimes.push(
      `IGH ${classeIghLabel ? `· ${classeIghLabel}` : ""}`.trim(),
    );
  if (state.estHabitation) regimes.push("Immeuble d'habitation");

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
        <p className="label-admin mb-2">Étape 3 sur 3 · Confirmation</p>
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.015em] leading-tight">
          Tout est prêt, on récapitule.
        </h2>
        <p className="mt-3 max-w-xl text-[0.88rem] leading-relaxed text-muted-foreground">
          Vérifiez ce que l&apos;outil a compris. Vous pourrez tout
          modifier après la création.
        </p>
      </div>

      {/* Carte « ce que l'outil a compris » */}
      <section className="cartouche overflow-hidden">
        <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
            En une phrase
          </p>
          <p className="mt-3 text-[1rem] leading-relaxed">
            Vous êtes <strong>{state.raisonSociale || "—"}</strong>
            {state.siret && (
              <>
                {" "}
                <span className="font-mono text-[0.78rem] text-muted-foreground">
                  (SIRET {state.siret})
                </span>
              </>
            )}
            . Votre site principal est situé{" "}
            <strong>{adresseComplete || "—"}</strong> et emploie{" "}
            <strong>{state.effectifSurSite || "—"}</strong>{" "}
            {Number(state.effectifSurSite) > 1 ? "salariés" : "salarié"} sur
            site. Code activité : <strong>{state.codeNaf || "—"}</strong>.
          </p>
        </div>

        <dl className="divide-y divide-dashed divide-rule/50">
          <FicheLigne label="Raison sociale" valeur={state.raisonSociale} />
          {state.siret && <FicheLigne label="SIRET" valeur={state.siret} />}
          <FicheLigne label="Adresse" valeur={adresseComplete} />
          <FicheLigne label="Code NAF" valeur={state.codeNaf} />
          <FicheLigne
            label="Effectif sur site"
            valeur={String(state.effectifSurSite)}
          />
          <FicheLigne
            label="Régimes réglementaires"
            valeur={regimes.join(" · ") || "—"}
          />
        </dl>
      </section>

      {/* Ce qu'il se passe au clic */}
      <section className="cartouche px-6 py-5 sm:px-8">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          Ce que l&apos;outil va faire
        </p>
        <ul className="mt-3 space-y-2 text-[0.88rem] leading-relaxed">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-ink" />
            <span>
              Créer votre espace d&apos;entreprise + votre premier
              établissement, liés ensemble.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-ink" />
            <span>
              Vous rediriger vers votre tableau de bord où vous pourrez
              déclarer vos équipements (étape suivante).
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-ink" />
            <span>
              Préparer la génération automatique de votre calendrier de
              vérifications réglementaires dès que vous aurez décrit vos
              équipements.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function FicheLigne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 py-3 sm:px-8">
      <dt className="text-[0.78rem] text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right text-[0.88rem] font-medium">
        {valeur || "—"}
      </dd>
    </div>
  );
}
