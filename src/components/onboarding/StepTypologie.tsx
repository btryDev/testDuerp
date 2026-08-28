"use client";

import { useState } from "react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  CATEGORIES_ERP,
  CLASSES_IGH,
  TYPE_ERP,
} from "@/lib/etablissements/schema";
import {
  CHOIX_ACTIVITE_ERP,
  CHOIX_CLASSES_IGH,
  type ChoixActiviteId,
  typeErpDepuisChoix,
} from "@/lib/onboarding/deduction-erp";
import { CarteChoix } from "./CarteChoix";
import { CapaciteErp } from "./CapaciteErp";
import type { StepProps } from "./types";

/**
 * Étape 2 sur 3 — Assistant pour déterminer la typologie d'établissement
 * (ERP / IGH / habitation). Trois questions avec grille visuelle pour le
 * type d'activité et la classe IGH.
 *
 * Un mode avancé permet aux utilisateurs qui connaissent déjà leur
 * catégorie ERP et leur classe IGH de les saisir directement via des
 * dropdowns.
 *
 * Les questions ne sont plus numérotées : elles sont posées toutes les
 * trois en même temps et se répondent dans n'importe quel ordre — le
 * numéro n'y portait aucune information, contrairement aux étapes du
 * wizard. Le compteur d'étape reste, lui, dans l'enveloppe.
 */
export function StepTypologie({ state, update, errors }: StepProps) {
  const [modeAvance, setModeAvance] = useState(false);

  // Reverse lookup pour pré-sélectionner les cartes en mode basique
  const activiteSelectionnee: ChoixActiviteId | undefined =
    CHOIX_ACTIVITE_ERP.find((c) => c.typeErp === state.typeErp)?.id;

  const selectActivite = (id: ChoixActiviteId) => {
    const typeErp = typeErpDepuisChoix(id);
    update({
      estERP: true,
      typeErp,
      // Changer d'activité change le seuil de 5ᵉ catégorie (`SEUILS_5E_CATEGORIE`,
      // art. « 1 » des dispositions particulières) : la catégorie retenue pour
      // le type précédent ne vaut plus. La garder afficherait une proposition
      // et une catégorie enregistrée qui se contredisent — et l'assistant
      // laisserait passer la contradiction, `categorieErp` étant renseignée.
      ...(typeErp !== state.typeErp ? { categorieErp: "" } : {}),
    });
  };


  return (
    <div className="flex flex-col gap-[22px]">
      <div>
        <p className="board-eyebrow m-0 mb-2 text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">
          Type d&apos;établissement
        </p>
        <h2 className="board-titre m-0 text-[clamp(22px,2.2vw,27px)]">
          Quelques questions pour cadrer les obligations applicables.
        </h2>
        <p className="m-0 mt-2.5 max-w-[62ch] text-[14.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
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
          {/* ─── Accueil du public (ERP) ──────────────────────── */}
          <section className="carte-board flex flex-col gap-6 px-7 py-6 sm:px-8">
            <div>
              <h3 className="board-titre m-0 text-[22px]">
                Accueillez-vous du public sur ce lieu ?
              </h3>
              <p className="m-0 mt-2 max-w-[62ch] text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
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
              <div className="flex flex-col gap-4">
                <SousQuestion
                  question="Quelle est votre activité principale ?"
                  aide="Choisissez la catégorie la plus proche."
                />
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
                  <p className="m-0 text-[12.5px] text-[color:var(--board-signal-ink)]">
                    {errors.typeErp}
                  </p>
                )}
              </div>
            )}

            {/* Sub-question capacité → catégorie */}
            {state.estERP && state.typeErp && (
              <CapaciteErp state={state} update={update} errors={errors} />
            )}
          </section>

          {/* ─── IGH ─────────────────────────────────────────── */}
          <section className="carte-board flex flex-col gap-6 px-7 py-6 sm:px-8">
            <div>
              <h3 className="board-titre m-0 text-[22px]">
                Votre bâtiment fait-il plus de 28 mètres de hauteur ?
              </h3>
              <p className="m-0 mt-2 max-w-[62ch] text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
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
              <div className="flex flex-col gap-4">
                <SousQuestion question="Quelle est la nature du bâtiment ?" />
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
                  <p className="m-0 text-[12.5px] text-[color:var(--board-signal-ink)]">
                    {errors.classeIgh}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* ─── Habitation ──────────────────────────────────── */}
          <section className="carte-board flex flex-col gap-4 px-7 py-6 sm:px-8">
            <div>
              <h3 className="board-titre m-0 text-[22px]">
                Gérez-vous un immeuble d&apos;habitation ?
              </h3>
              <p className="m-0 mt-2 max-w-[62ch] text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
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
          className="board-eyebrow m-0 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)] underline decoration-[color:var(--board-slate)] decoration-dotted underline-offset-4 transition-colors hover:text-[color:var(--board-ink)]"
        >
          {modeAvance
            ? "← Revenir au mode guidé"
            : "Je connais déjà ma catégorie ERP →"}
        </button>
      </div>
    </div>
  );
}

/**
 * L'amorce d'une sous-question, sous le filet qui la sépare de la question
 * principale. Elle reste un paragraphe et non un titre : une carte board ne
 * porte jamais deux niveaux de titrage (charte, interdit 11).
 */
function SousQuestion({
  question,
  aide,
}: {
  question: string;
  aide?: string;
}) {
  return (
    <div className="border-t border-[color:var(--board-slate-line)] pt-5">
      <p className="m-0 text-[14px] font-semibold leading-[1.35] tracking-[-0.01em] text-[color:var(--board-ink)]">
        {question}
      </p>
      {aide ? (
        <p className="m-0 mt-1.5 max-w-[62ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
          {aide}
        </p>
      ) : null}
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
        "min-w-[100px] rounded-full px-5 py-2 text-[12.5px] font-semibold tracking-[-0.01em] transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--board-blue-strong)] " +
        (actif
          ? "bg-[color:var(--board-ink)] text-white"
          : "bg-[color:var(--board-slate-pale)] text-[color:var(--board-slate-mid)] hover:bg-[color:var(--board-blue-pale)] hover:text-[color:var(--board-blue-ink)]")
      }
    >
      {label}
    </button>
  );
}

function ModeAvance({ state, update, errors }: StepProps) {
  return (
    <section className="carte-board flex flex-col gap-6 px-7 py-6 sm:px-8">
      <div>
        <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">
          Mode avancé
        </p>
        <p className="m-0 mt-2 max-w-[62ch] text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
          Cochez les régimes qui s&apos;appliquent puis précisez les
          catégories. Les invariants ERP ↔ catégorie et IGH ↔ classe sont
          vérifiés à la validation.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={state.estEtablissementTravail}
            onChange={(e) =>
              update({ estEtablissementTravail: e.currentTarget.checked })
            }
            className="mt-1 size-4 rounded border-[color:var(--board-slate)] accent-[color:var(--board-ink)]"
          />
          <div className="min-w-0">
            <p className="m-0 text-[13.5px] font-semibold text-[color:var(--board-ink)]">
              Établissement de travail
            </p>
            <p className="m-0 mt-1 text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
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
            className="mt-1 size-4 rounded border-[color:var(--board-slate)] accent-[color:var(--board-ink)]"
          />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[13.5px] font-semibold text-[color:var(--board-ink)]">
              Établissement Recevant du Public
            </p>
            {state.estERP && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="label-board" htmlFor="typeErp">
                    Type ERP *
                  </label>
                  <select
                    id="typeErp"
                    value={state.typeErp}
                    onChange={(e) => update({ typeErp: e.currentTarget.value })}
                    className="champ-board"
                  >
                    <option value="">— Sélectionner —</option>
                    {TYPE_ERP.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors?.typeErp && (
                    <p className="m-0 mt-1.5 text-[12.5px] text-[color:var(--board-signal-ink)]">
                      {errors.typeErp}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label-board" htmlFor="categorieErp">
                    Catégorie *
                    <InfoTooltip>
                      La catégorie dépend de la capacité d&apos;accueil :
                      1ʳᵉ (&gt;1500) · 2ᵉ (701-1500) · 3ᵉ (301-700) ·
                      4ᵉ/5ᵉ (≤300).
                    </InfoTooltip>
                  </label>
                  <select
                    id="categorieErp"
                    value={state.categorieErp}
                    onChange={(e) =>
                      update({ categorieErp: e.currentTarget.value })
                    }
                    className="champ-board"
                  >
                    <option value="">— Sélectionner —</option>
                    {CATEGORIES_ERP.map((c) => (
                      <option key={c} value={c}>
                        {c.slice(1)}ᵉ catégorie
                      </option>
                    ))}
                  </select>
                  {errors?.categorieErp && (
                    <p className="m-0 mt-1.5 text-[12.5px] text-[color:var(--board-signal-ink)]">
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
            className="mt-1 size-4 rounded border-[color:var(--board-slate)] accent-[color:var(--board-ink)]"
          />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[13.5px] font-semibold text-[color:var(--board-ink)]">
              Immeuble de Grande Hauteur
            </p>
            {state.estIGH && (
              <div className="mt-3">
                <label className="label-board" htmlFor="classeIgh">
                  Classe *
                </label>
                <select
                  id="classeIgh"
                  value={state.classeIgh}
                  onChange={(e) => update({ classeIgh: e.currentTarget.value })}
                  className="champ-board"
                >
                  <option value="">— Sélectionner —</option>
                  {CLASSES_IGH.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors?.classeIgh && (
                  <p className="m-0 mt-1.5 text-[12.5px] text-[color:var(--board-signal-ink)]">
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
            className="mt-1 size-4 rounded border-[color:var(--board-slate)] accent-[color:var(--board-ink)]"
          />
          <div className="min-w-0">
            <p className="m-0 text-[13.5px] font-semibold text-[color:var(--board-ink)]">
              Immeuble d&apos;habitation
            </p>
          </div>
        </label>
      </div>
    </section>
  );
}
