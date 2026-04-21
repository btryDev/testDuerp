"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { creerEquipementsDepuisPreRemplissage } from "@/lib/equipements/actions";
import { LABEL_CATEGORIE_EQUIPEMENT } from "@/lib/equipements/labels";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";

type Suggestion = {
  categorie: CategorieEquipement;
  libelle: string;
  raison: string;
};

type Props = {
  etablissementId: string;
  suggestions: Suggestion[];
};

export function PreRemplissagePanel({ etablissementId, suggestions }: Props) {
  const [selection, setSelection] = useState<Set<string>>(
    () => new Set(suggestions.map((s) => s.categorie)),
  );
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (suggestions.length === 0) return null;

  const toggle = (cat: string) => {
    setSelection((old) => {
      const next = new Set(old);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const valider = () => {
    const entrees = suggestions
      .filter((s) => selection.has(s.categorie))
      .map((s) => ({ categorie: s.categorie, libelle: s.libelle }));

    if (entrees.length === 0) {
      setMessage("Aucune catégorie sélectionnée.");
      return;
    }

    startTransition(async () => {
      const res = await creerEquipementsDepuisPreRemplissage(
        etablissementId,
        entrees,
      );
      setMessage(
        res.created > 0
          ? `${res.created} équipement${res.created > 1 ? "s" : ""} ajouté${
              res.created > 1 ? "s" : ""
            }. Pensez à les affiner si besoin.`
          : "Aucun équipement ajouté.",
      );
    });
  };

  return (
    <section className="cartouche overflow-hidden">
      <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
          Pré-remplissage suggéré
        </p>
        <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
          D&apos;après le code NAF et les régimes de cet établissement, les
          catégories d&apos;équipement ci-dessous sont typiquement présentes.
          Décochez celles qui ne s&apos;appliquent pas, puis validez pour
          créer les fiches correspondantes.
        </p>
      </div>

      <div className="space-y-4 px-6 py-6 sm:px-8">
        <ul className="space-y-3">
          {suggestions.map((s) => {
            const coche = selection.has(s.categorie);
            return (
              <li key={s.categorie} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={`pre-${s.categorie}`}
                  checked={coche}
                  onChange={() => toggle(s.categorie)}
                  className="mt-1 size-4 rounded border-rule"
                />
                <label htmlFor={`pre-${s.categorie}`} className="min-w-0 flex-1">
                  <p className="text-[0.95rem] font-semibold">
                    {LABEL_CATEGORIE_EQUIPEMENT[s.categorie]}
                  </p>
                  <p className="text-[0.82rem] text-muted-foreground">
                    {s.libelle} — {s.raison}
                  </p>
                </label>
              </li>
            );
          })}
        </ul>

        {message && (
          <p className="text-sm text-emerald-700">{message}</p>
        )}

        <div className="flex items-center gap-3">
          <Button type="button" onClick={valider} disabled={pending}>
            {pending
              ? "Création…"
              : `Créer ${selection.size} fiche${selection.size > 1 ? "s" : ""}`}
          </Button>
        </div>
      </div>
    </section>
  );
}
