"use client";

import { Button } from "@/components/ui/button";
import { ChampBoard } from "@/components/ui-kit";
import { BlocCreux } from "@/components/ui-kit/fiche";
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
    <div className="flex flex-col gap-4">
      <div className="border-t border-[color:var(--board-slate-line)] pt-5">
        <p className="m-0 text-[14px] font-semibold leading-[1.35] tracking-[-0.01em] text-[color:var(--board-ink)]">
          Combien de personnes du public pouvez-vous accueillir au maximum ?
        </p>
        <p className="m-0 mt-1.5 max-w-[62ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
          Public seul, sans le personnel. Votre arrêté d&apos;ouverture, le PV
          de la commission de sécurité ou votre plan d&apos;évacuation
          l&apos;indiquent. La catégorie est proposée d&apos;après le Code de
          la construction (art. R. 143-19) et le règlement de sécurité de votre
          type d&apos;activité ; vous gardez la main.
        </p>
      </div>

      {/* Saisie en texte plutôt qu'en `type="number"` : la molette d'un champ
          nombre modifie une valeur déjà saisie sans qu'on s'en aperçoive
          (charte § 5), et ici une valeur changée par accident déplace la
          catégorie proposée. */}
      <div className="grid gap-4 sm:grid-cols-3">
        <ChampBoard
          id="effectifPublicTotal"
          label="Au total"
          inputMode="numeric"
          value={state.effectifPublicTotal}
          onChange={(e) => update({ effectifPublicTotal: e.target.value })}
        />
        {demandeNiveaux && seuil?.sousSol !== undefined && (
          <ChampBoard
            id="effectifPublicSousSol"
            label="Dont en sous-sol"
            aide="0 si aucun public en sous-sol"
            inputMode="numeric"
            value={state.effectifPublicSousSol}
            onChange={(e) => update({ effectifPublicSousSol: e.target.value })}
          />
        )}
        {demandeNiveaux && seuil?.etages !== undefined && (
          <ChampBoard
            id="effectifPublicEtages"
            label="Dont en étage, galerie, mezzanine"
            aide="0 si tout est au rez-de-chaussée"
            inputMode="numeric"
            value={state.effectifPublicEtages}
            onChange={(e) => update({ effectifPublicEtages: e.target.value })}
          />
        )}
      </div>

      {/* La proposition se pose sur le creux ardoise, sans couleur d'état :
          une catégorie déduite n'est ni un fait acquis (le vert du board dit
          « fait ») ni une alerte. Elle le devient quand on la retient. */}
      {deduction?.statut === "proposee" && (
        <BlocCreux>
          <strong className="block text-[13.5px] font-semibold text-[color:var(--board-ink)]">
            Catégorie proposée : {deduction.categorieErp.slice(1)}ᵉ
          </strong>
          <span className="mt-1 block max-w-[62ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
            {deduction.motif}
            {deduction.avertissement ? ` ${deduction.avertissement}` : ""}
          </span>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={
                state.categorieErp === deduction.categorieErp
                  ? "board"
                  : "boardClair"
              }
              size="boardSm"
              onClick={() => appliquer(deduction.categorieErp)}
            >
              {state.categorieErp === deduction.categorieErp
                ? "Retenue"
                : "Retenir cette catégorie"}
            </Button>
            <select
              aria-label="Choisir une autre catégorie"
              value={state.categorieErp}
              onChange={(e) => update({ categorieErp: e.target.value })}
              className="champ-board h-8 w-auto bg-[color:var(--board-card)] py-0 text-[12px]"
            >
              <option value="">Autre catégorie…</option>
              {(["N1", "N2", "N3", "N4", "N5"] as const).map((c) => (
                <option key={c} value={c}>
                  {c.slice(1)}ᵉ catégorie
                </option>
              ))}
            </select>
          </div>
        </BlocCreux>
      )}

      {deduction?.statut === "a_confirmer" && (
        <div className="flex flex-col gap-3">
          <p className="m-0 max-w-[62ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
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
        <p className="m-0 text-[12.5px] text-[color:var(--board-signal-ink)]">
          {errors.categorieErp}
        </p>
      )}
    </div>
  );
}
