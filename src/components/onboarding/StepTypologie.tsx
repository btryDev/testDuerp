"use client";

import { CATEGORIES_ERP, TYPE_ERP } from "@/lib/etablissements/schema";
import {
  LABEL_CATEGORIE_ERP,
  LABEL_TYPE_ERP,
} from "@/lib/etablissements/labels";
import {
  CHOIX_CLASSES_IGH,
  CHOIX_FAMILLES_HABITATION,
} from "@/lib/onboarding/deduction-erp";
import { CarteChoix } from "./CarteChoix";
import type { StepProps } from "./types";

/**
 * Étape 2 sur 3 — la typologie de l'établissement (ERP / IGH / habitation).
 *
 * **Le parcours ne devine plus, il fait déclarer** (décision du 2026-09-01).
 * Il proposait auparavant huit cartes d'activité — huit types sur vingt et un
 * — puis déduisait la catégorie d'un effectif de public saisi, table de seuils
 * à l'appui. Deux défauts, et le second est le vrai : la liste tronquée ne
 * laissait aucune place à qui n'y figurait pas, et la catégorie *déduite*
 * s'inscrivait au dossier comme si elle avait été constatée, alors qu'elle
 * était calculée à partir d'un chiffre approximatif. Un dirigeant connaît son
 * classement — il est sur son arrêté d'ouverture ou au procès-verbal de la
 * commission de sécurité — et il vaut mieux le lui demander que le recalculer
 * moins bien que lui.
 *
 * Il n'y a donc plus de mode guidé ni de mode avancé : le mode avancé
 * n'existait que pour échapper à la déduction.
 *
 * Les questions ne sont pas numérotées : elles sont posées toutes les trois en
 * même temps et se répondent dans n'importe quel ordre.
 */
export function StepTypologie({ state, update, errors }: StepProps) {

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
          Trois questions, et deux précisions si vous y répondez oui. Votre
          classement figure sur votre arrêté d&apos;ouverture ou au
          procès-verbal de la commission de sécurité — nous ne le devinons
          pas à votre place.
        </p>
      </div>

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

            {state.estERP && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  <SousQuestion
                    question="Quel est votre type d'établissement ?"
                    aide="Les vingt et un types du règlement de sécurité. Le vôtre y figure."
                  />
                  <select
                    id="typeErp"
                    aria-label="Type d'ERP"
                    value={state.typeErp}
                    onChange={(e) => update({ typeErp: e.currentTarget.value })}
                    className="champ-board max-w-md"
                    aria-invalid={Boolean(errors?.typeErp)}
                  >
                    <option value="">— Sélectionner —</option>
                    {TYPE_ERP.map((t) => (
                      <option key={t} value={t}>
                        {LABEL_TYPE_ERP[t]}
                      </option>
                    ))}
                  </select>
                  {errors?.typeErp && (
                    <p className="m-0 text-[12.5px] text-[color:var(--board-signal-ink)]">
                      {errors.typeErp}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <SousQuestion
                    question="Quelle est votre catégorie ?"
                    aide="Elle compte le public admis, pas vos salariés — un petit restaurant qui sert trois cents couverts est en 3ᵉ catégorie."
                  />
                  <select
                    id="categorieErp"
                    aria-label="Catégorie d'ERP"
                    value={state.categorieErp}
                    onChange={(e) =>
                      update({ categorieErp: e.currentTarget.value })
                    }
                    className="champ-board max-w-md"
                    aria-invalid={Boolean(errors?.categorieErp)}
                  >
                    <option value="">— Sélectionner —</option>
                    {CATEGORIES_ERP.map((c) => (
                      <option key={c} value={c}>
                        {LABEL_CATEGORIE_ERP[c]}
                      </option>
                    ))}
                  </select>
                  {errors?.categorieErp && (
                    <p className="m-0 text-[12.5px] text-[color:var(--board-signal-ink)]">
                      {errors.categorieErp}
                    </p>
                  )}
                </div>
              </div>
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

            {state.estHabitation && (
              <div className="flex flex-col gap-4">
                <SousQuestion question="À quelle famille l'immeuble appartient-il ?" />
                <p className="m-0 max-w-[62ch] text-[13px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                  Ce classement figure au dossier de l&apos;immeuble. En cas de
                  doute, votre syndic ou votre bureau de contrôle vous le
                  donne — ne le devinez pas : il change les obligations qui
                  vous seront présentées.
                </p>
                <div
                  role="radiogroup"
                  aria-label="Famille d'habitation"
                  className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                >
                  {CHOIX_FAMILLES_HABITATION.map((f) => (
                    <CarteChoix
                      key={f.id}
                      id={f.id}
                      label={f.label}
                      actif={state.familleHabitation === f.id}
                      onClick={() => update({ familleHabitation: f.id })}
                    />
                  ))}
                </div>
                {errors?.familleHabitation && (
                  <p className="m-0 text-[12.5px] text-[color:var(--board-signal-ink)]">
                    {errors.familleHabitation}
                  </p>
                )}
              </div>
            )}
          </section>
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
