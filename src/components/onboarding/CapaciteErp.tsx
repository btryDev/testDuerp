"use client";

import {
  SEUILS_5E_CATEGORIE,
  deduireCategorieErpComplete,
  type DeductionCategorieErp,
} from "@/lib/onboarding/deduction-erp";
import type { CategorieErp, TypeErp } from "@/lib/referentiels/types-communs";
import { CarteChoix } from "./CarteChoix";
import type { StepProps } from "./types";

/**
 * Sous-question « capacité d'accueil » de l'étape Typologie.
 *
 * Remplace les tranches fixes : l'assistant demande l'effectif du public
 * (et, seulement quand le seuil du type en dépend, le public en sous-sol et
 * en étage), puis applique R. 143-19 et l'article « 1 » du type
 * (`SEUILS_5E_CATEGORIE`). La catégorie proposée est toujours modifiable ;
 * quand le droit ne permet pas de trancher, les deux cartes 4ᵉ / 5ᵉ sont
 * proposées avec la question à poser.
 */
export function CapaciteErp({ state, update, errors }: StepProps) {
  const type = state.typeErp as TypeErp;
  const entree = SEUILS_5E_CATEGORIE[type];
  // Seul un type déductible ouvre les champs par niveau : pour les autres,
  // `deduire4eOu5e` rend `a_confirmer` quelle que soit la répartition, et
  // demander le détail ferait croire qu'il change quelque chose.
  const seuil = entree?.deductible ? entree.seuil : undefined;
  const demandeNiveaux =
    seuil !== undefined &&
    (seuil.sousSol !== undefined || seuil.etages !== undefined);

  const nombre = (v: string): number | undefined =>
    v.trim() === "" ? undefined : Number(v);
  const total = nombre(state.effectifPublicTotal);
  const personnel = Number(state.effectifSurSite) || 0;

  const deduction: DeductionCategorieErp | null =
    total === undefined
      ? null
      : deduireCategorieErpComplete(
          type,
          {
            total,
            sousSol: demandeNiveaux ? nombre(state.effectifPublicSousSol) : 0,
            etages: demandeNiveaux ? nombre(state.effectifPublicEtages) : 0,
          },
          personnel,
        );

  const appliquer = (cat: CategorieErp) => update({ categorieErp: cat });

  return (
    <div className="space-y-4">
      <div className="border-t border-dashed border-rule/60 pt-5">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          Combien de personnes du public pouvez-vous accueillir au maximum ?
        </p>
        <p className="mt-1 text-[0.8rem] text-muted-foreground">
          Public seul, sans le personnel. Votre arrêté d&apos;ouverture, le PV
          de la commission de sécurité ou votre plan d&apos;évacuation
          l&apos;indiquent. La catégorie est proposée d&apos;après le Code de
          la construction (art. R. 143-19) et le règlement de sécurité de votre
          type d&apos;activité ; vous gardez la main.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ChampNombre
          id="effectifPublicTotal"
          label="Au total"
          value={state.effectifPublicTotal}
          onChange={(v) => update({ effectifPublicTotal: v })}
        />
        {demandeNiveaux && seuil?.sousSol !== undefined && (
          <ChampNombre
            id="effectifPublicSousSol"
            label="Dont en sous-sol"
            hint="0 si aucun public en sous-sol"
            value={state.effectifPublicSousSol}
            onChange={(v) => update({ effectifPublicSousSol: v })}
          />
        )}
        {demandeNiveaux && seuil?.etages !== undefined && (
          <ChampNombre
            id="effectifPublicEtages"
            label="Dont en étage, galerie, mezzanine"
            hint="0 si tout est au rez-de-chaussée"
            value={state.effectifPublicEtages}
            onChange={(v) => update({ effectifPublicEtages: v })}
          />
        )}
      </div>

      {deduction?.statut === "proposee" && (
        <div className="rounded-lg border border-[color:color-mix(in_oklch,var(--accent-vif)_20%,transparent)] bg-[color:var(--accent-vif-soft)] px-4 py-3">
          <strong className="block text-[0.92rem] text-[color:var(--accent-vif)]">
            Catégorie proposée : {deduction.categorieErp.slice(1)}ᵉ
          </strong>
          <span className="mt-1 block text-[0.8rem] leading-[1.5] text-ink/80">
            {deduction.motif}
            {deduction.avertissement ? ` ${deduction.avertissement}` : ""}
          </span>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => appliquer(deduction.categorieErp)}
              className={
                state.categorieErp === deduction.categorieErp
                  ? "rounded-md bg-ink px-3 py-1.5 text-sm text-paper"
                  : "rounded-md border border-ink px-3 py-1.5 text-sm"
              }
            >
              {state.categorieErp === deduction.categorieErp
                ? "Retenue"
                : "Retenir cette catégorie"}
            </button>
            <select
              aria-label="Choisir une autre catégorie"
              value={state.categorieErp}
              onChange={(e) => update({ categorieErp: e.target.value })}
              className="h-9 rounded-md border border-rule bg-background px-3 text-sm"
            >
              <option value="">Autre catégorie…</option>
              {(["N1", "N2", "N3", "N4", "N5"] as const).map((c) => (
                <option key={c} value={c}>
                  {c.slice(1)}ᵉ catégorie
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {deduction?.statut === "a_confirmer" && (
        <div className="space-y-3">
          <p className="text-[0.85rem] leading-relaxed text-muted-foreground">
            {deduction.motif} {deduction.question}
          </p>
          <div
            role="radiogroup"
            aria-label="Catégorie ERP"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {deduction.categoriesPossibles.map((c) => (
              <CarteChoix
                key={c}
                id={c}
                label={`${c.slice(1)}ᵉ catégorie`}
                description={
                  c === "N5"
                    ? "Le cas le plus fréquent en TPE, sous le seuil fixé pour votre type d'activité."
                    : "Entraîne la vérification électrique annuelle par organisme agréé et la vérification triennale du SSI."
                }
                badge={`cat. ${c.slice(1)}`}
                actif={state.categorieErp === c}
                onClick={() => appliquer(c)}
              />
            ))}
          </div>
        </div>
      )}

      {errors?.categorieErp && (
        <p className="text-sm text-destructive">{errors.categorieErp}</p>
      )}
    </div>
  );
}

function ChampNombre({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="block text-[0.85rem] font-medium">{label}</span>
      <input
        id={id}
        type="number"
        min={0}
        max={99999}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-rule bg-background px-3 text-[0.95rem]"
      />
      {hint ? (
        <span className="block text-[0.75rem] text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}
