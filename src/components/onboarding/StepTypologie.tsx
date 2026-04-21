"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  CATEGORIES_ERP,
  CLASSES_IGH,
  TYPE_ERP,
} from "@/lib/etablissements/schema";
import {
  CHOIX_ACTIVITE_ERP,
  CHOIX_CLASSES_IGH,
  TRANCHES_EFFECTIF_PUBLIC,
  categorieErpDepuisTranche,
  type ChoixActiviteId,
  type TrancheEffectifPublicId,
  typeErpDepuisChoix,
} from "@/lib/onboarding/deduction-erp";
import { CarteChoix } from "./CarteChoix";
import type { StepProps } from "./types";

/**
 * Étape 3 — Assistant ludique pour déterminer la typologie d'établissement
 * (ERP / IGH / habitation). Trois questions séquentielles avec grille
 * visuelle pour le type d'activité et la classe IGH.
 *
 * Un mode avancé permet aux utilisateurs qui connaissent déjà leur
 * catégorie ERP et leur classe IGH de les saisir directement via des
 * dropdowns.
 */
export function StepTypologie({ state, update, errors }: StepProps) {
  const [modeAvance, setModeAvance] = useState(false);

  // Reverse lookup pour pré-sélectionner les cartes en mode basique
  const activiteSelectionnee: ChoixActiviteId | undefined =
    CHOIX_ACTIVITE_ERP.find((c) => c.typeErp === state.typeErp)?.id;
  const trancheSelectionnee: TrancheEffectifPublicId | undefined =
    TRANCHES_EFFECTIF_PUBLIC.find((t) => t.categorieErp === state.categorieErp)
      ?.id;

  const selectActivite = (id: ChoixActiviteId) => {
    update({
      estERP: true,
      typeErp: typeErpDepuisChoix(id),
    });
  };

  const selectTranche = (id: TrancheEffectifPublicId) => {
    update({
      categorieErp: categorieErpDepuisTranche(id),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="label-admin mb-2">Étape 3 sur 4 · Type d&apos;établissement</p>
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.015em] leading-tight">
          Quelques questions pour cadrer les obligations applicables.
        </h2>
        <p className="mt-3 max-w-xl text-[0.88rem] leading-relaxed text-muted-foreground">
          Pas de jargon : on vous guide pour déterminer votre régime
          réglementaire. Aucun champ n&apos;est bloquant — en cas de doute,
          cochez le choix le plus proche, vous pourrez ajuster plus tard.
        </p>
      </div>

      {/* Mode avancé (dropdown direct) */}
      {modeAvance ? (
        <ModeAvance state={state} update={update} errors={errors} />
      ) : (
        <>
          {/* ─── Question 1 — Accueil du public (ERP) ─────────── */}
          <section className="cartouche space-y-6 px-6 py-7 sm:px-8">
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                Question 1
              </p>
              <h3 className="mt-1 text-[1.05rem] font-semibold tracking-[-0.01em]">
                Accueillez-vous du public sur ce lieu ?
              </h3>
              <p className="mt-1 text-[0.82rem] text-muted-foreground">
                Clients, patients, élèves, visiteurs… Si oui, votre
                établissement est un ERP (Établissement Recevant du
                Public) et des règles incendie spécifiques s&apos;appliquent.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <BoutonOuiNon
                actif={state.estERP}
                label="Oui"
                onClick={() =>
                  update({ estERP: true })
                }
              />
              <BoutonOuiNon
                actif={!state.estERP && (state.typeErp === "" || state.typeErp === undefined)}
                label="Non"
                onClick={() =>
                  update({
                    estERP: false,
                    typeErp: "",
                    categorieErp: "",
                  })
                }
              />
            </div>

            {/* Sub-question activité ERP */}
            {state.estERP && (
              <div className="space-y-4">
                <div className="border-t border-dashed border-rule/60 pt-5">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                    Quelle est votre activité principale ?
                  </p>
                  <p className="mt-1 text-[0.8rem] text-muted-foreground">
                    Choisissez la catégorie la plus proche.
                  </p>
                </div>
                <div
                  role="radiogroup"
                  aria-label="Activité principale"
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {CHOIX_ACTIVITE_ERP.map((c) => (
                    <CarteChoix
                      key={c.id}
                      id={c.id}
                      label={c.label}
                      description={c.description}
                      badge={`Type ${c.typeErp}`}
                      actif={activiteSelectionnee === c.id}
                      onClick={() => selectActivite(c.id)}
                    />
                  ))}
                </div>
                {errors?.typeErp && (
                  <p className="text-sm text-destructive">{errors.typeErp}</p>
                )}
              </div>
            )}

            {/* Sub-question capacité → catégorie */}
            {state.estERP && state.typeErp && (
              <div className="space-y-4">
                <div className="border-t border-dashed border-rule/60 pt-5">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                    Combien de personnes pouvez-vous accueillir simultanément ?
                  </p>
                  <p className="mt-1 text-[0.8rem] text-muted-foreground">
                    Public + personnel. Votre attestation d&apos;ouverture ou
                    votre plan d&apos;évacuation l&apos;indique souvent. En cas
                    de doute, choisissez la tranche la plus basse.
                  </p>
                </div>
                <div role="radiogroup" aria-label="Capacité d'accueil" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {TRANCHES_EFFECTIF_PUBLIC.map((t) => (
                    <CarteChoix
                      key={t.id}
                      id={t.id}
                      label={t.label}
                      description={t.hint}
                      badge={`${t.categorieErp.slice(0)} · cat. ${t.categorieErp.slice(1)}`}
                      actif={trancheSelectionnee === t.id}
                      onClick={() => selectTranche(t.id)}
                    />
                  ))}
                </div>
                {errors?.categorieErp && (
                  <p className="text-sm text-destructive">
                    {errors.categorieErp}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* ─── Question 2 — IGH ─────────────────────────────── */}
          <section className="cartouche space-y-6 px-6 py-7 sm:px-8">
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                Question 2
              </p>
              <h3 className="mt-1 text-[1.05rem] font-semibold tracking-[-0.01em]">
                Votre bâtiment fait-il plus de 28 mètres de hauteur ?
              </h3>
              <p className="mt-1 text-[0.82rem] text-muted-foreground">
                Environ 9 étages et plus. Ce cas (IGH) est très rare en
                TPE/PME — si vous êtes au rez-de-chaussée ou dans un
                immeuble de quelques étages, répondez « Non ».
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <BoutonOuiNon
                actif={state.estIGH}
                label="Oui"
                onClick={() => update({ estIGH: true })}
              />
              <BoutonOuiNon
                actif={!state.estIGH}
                label="Non"
                onClick={() =>
                  update({ estIGH: false, classeIgh: "" })
                }
              />
            </div>

            {state.estIGH && (
              <div className="space-y-4">
                <div className="border-t border-dashed border-rule/60 pt-5">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                    Quelle est la nature du bâtiment ?
                  </p>
                </div>
                <div
                  role="radiogroup"
                  aria-label="Classe IGH"
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {CHOIX_CLASSES_IGH.map((c) => (
                    <CarteChoix
                      key={c.id}
                      id={c.id}
                      label={c.label}
                      description={c.description}
                      badge={c.id}
                      actif={state.classeIgh === c.id}
                      onClick={() => update({ classeIgh: c.id })}
                    />
                  ))}
                </div>
                {errors?.classeIgh && (
                  <p className="text-sm text-destructive">{errors.classeIgh}</p>
                )}
              </div>
            )}
          </section>

          {/* ─── Question 3 — Habitation ───────────────────────── */}
          <section className="cartouche space-y-4 px-6 py-7 sm:px-8">
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                Question 3
              </p>
              <h3 className="mt-1 text-[1.05rem] font-semibold tracking-[-0.01em]">
                Gérez-vous un immeuble d&apos;habitation ?
              </h3>
              <p className="mt-1 text-[0.82rem] text-muted-foreground">
                Uniquement si vous êtes propriétaire ou syndic d&apos;un
                logement collectif (ramonage, VMC-Gaz…). Rare pour les
                commerces et restaurants.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <BoutonOuiNon
                actif={state.estHabitation}
                label="Oui"
                onClick={() => update({ estHabitation: true })}
              />
              <BoutonOuiNon
                actif={!state.estHabitation}
                label="Non"
                onClick={() => update({ estHabitation: false })}
              />
            </div>
          </section>
        </>
      )}

      {/* Toggle mode avancé */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setModeAvance((v) => !v)}
          className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground underline decoration-dashed underline-offset-4 hover:text-ink"
        >
          {modeAvance
            ? "← Revenir au mode guidé"
            : "Je connais déjà ma catégorie ERP →"}
        </button>
      </div>
    </div>
  );
}

function BoutonOuiNon({
  actif,
  label,
  onClick,
}: {
  actif: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={
        "min-w-[100px] rounded-full border px-5 py-2 text-[0.88rem] font-semibold tracking-[-0.005em] transition-colors " +
        (actif
          ? "border-ink bg-ink text-paper"
          : "border-rule bg-paper text-muted-foreground hover:border-ink hover:text-ink")
      }
    >
      {label}
    </button>
  );
}

function ModeAvance({ state, update, errors }: StepProps) {
  return (
    <section className="cartouche space-y-6 px-6 py-7 sm:px-8">
      <div>
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          Mode avancé
        </p>
        <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
          Cochez les régimes qui s&apos;appliquent puis précisez les
          catégories. Les invariants ERP ↔ catégorie et IGH ↔ classe sont
          vérifiés à la validation.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={state.estEtablissementTravail}
            onChange={(e) =>
              update({ estEtablissementTravail: e.currentTarget.checked })
            }
            className="mt-1 size-4 rounded border-rule"
          />
          <div className="min-w-0">
            <p className="text-[0.9rem] font-semibold">Établissement de travail</p>
            <p className="text-[0.78rem] text-muted-foreground">
              Coché par défaut — désactivez uniquement en cas d&apos;immeuble
              sans salarié.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={state.estERP}
            onChange={(e) =>
              update({
                estERP: e.currentTarget.checked,
                typeErp: e.currentTarget.checked ? state.typeErp : "",
                categorieErp: e.currentTarget.checked ? state.categorieErp : "",
              })
            }
            className="mt-1 size-4 rounded border-rule"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[0.9rem] font-semibold">Établissement Recevant du Public</p>
            {state.estERP && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="typeErp">Type ERP *</Label>
                  <select
                    id="typeErp"
                    value={state.typeErp}
                    onChange={(e) => update({ typeErp: e.currentTarget.value })}
                    className="mt-1 h-9 w-full rounded-md border border-rule bg-background px-3 text-sm"
                  >
                    <option value="">— Sélectionner —</option>
                    {TYPE_ERP.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors?.typeErp && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.typeErp}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="categorieErp" className="inline-flex items-center">
                    Catégorie *
                    <InfoTooltip>
                      La catégorie dépend de la capacité d&apos;accueil :
                      1ʳᵉ (&gt;1500) · 2ᵉ (701-1500) · 3ᵉ (301-700) ·
                      4ᵉ/5ᵉ (≤300).
                    </InfoTooltip>
                  </Label>
                  <select
                    id="categorieErp"
                    value={state.categorieErp}
                    onChange={(e) =>
                      update({ categorieErp: e.currentTarget.value })
                    }
                    className="mt-1 h-9 w-full rounded-md border border-rule bg-background px-3 text-sm"
                  >
                    <option value="">— Sélectionner —</option>
                    {CATEGORIES_ERP.map((c) => (
                      <option key={c} value={c}>
                        {c.slice(1)}ᵉ catégorie
                      </option>
                    ))}
                  </select>
                  {errors?.categorieErp && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.categorieErp}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={state.estIGH}
            onChange={(e) =>
              update({
                estIGH: e.currentTarget.checked,
                classeIgh: e.currentTarget.checked ? state.classeIgh : "",
              })
            }
            className="mt-1 size-4 rounded border-rule"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[0.9rem] font-semibold">Immeuble de Grande Hauteur</p>
            {state.estIGH && (
              <div className="mt-3">
                <Label htmlFor="classeIgh">Classe *</Label>
                <select
                  id="classeIgh"
                  value={state.classeIgh}
                  onChange={(e) => update({ classeIgh: e.currentTarget.value })}
                  className="mt-1 h-9 w-full rounded-md border border-rule bg-background px-3 text-sm"
                >
                  <option value="">— Sélectionner —</option>
                  {CLASSES_IGH.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors?.classeIgh && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.classeIgh}
                  </p>
                )}
              </div>
            )}
          </div>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={state.estHabitation}
            onChange={(e) => update({ estHabitation: e.currentTarget.checked })}
            className="mt-1 size-4 rounded border-rule"
          />
          <div className="min-w-0">
            <p className="text-[0.9rem] font-semibold">Immeuble d&apos;habitation</p>
          </div>
        </label>
      </div>
    </section>
  );
}
