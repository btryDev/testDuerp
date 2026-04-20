"use client";

import { useTransition } from "react";
import { choisirSecteur } from "@/lib/duerps/actions";

type Props = {
  duerpId: string;
  secteurId: string;
  nom: string;
  description: string;
  nombreUnites: number;
  nombreRisques: number;
  codesNaf: string[];
  recommande: boolean;
  dejaChoisi: boolean;
};

export function SecteurCard({
  duerpId,
  secteurId,
  nom,
  description,
  nombreUnites,
  nombreRisques,
  codesNaf,
  dejaChoisi,
}: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await choisirSecteur(duerpId, secteurId);
        });
      }}
      className={`group relative flex h-full flex-col rounded-2xl border p-7 text-left transition-all hover:border-ink/40 ${
        dejaChoisi
          ? "border-ink/60 bg-paper-elevated shadow-[0_0_0_1px_var(--ink)]"
          : "border-rule bg-paper-elevated"
      } ${pending ? "opacity-60" : ""}`}
    >
      <p className="label-admin">Secteur</p>
      <h3 className="mt-3 text-[1.2rem] font-semibold tracking-[-0.015em] leading-tight">
        {nom}
      </h3>
      <p className="mt-3 text-[0.88rem] leading-[1.65] text-muted-foreground">
        {description}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-y-2 border-t border-dashed border-rule/60 pt-4">
        <dt className="label-admin !text-[0.62rem]">Unités</dt>
        <dd className="text-right [font-family:var(--font-mono)] text-[0.88rem] tabular-nums">
          {nombreUnites}
        </dd>
        <dt className="label-admin !text-[0.62rem]">Risques</dt>
        <dd className="text-right [font-family:var(--font-mono)] text-[0.88rem] tabular-nums">
          {nombreRisques}
        </dd>
      </dl>

      <div className="mt-4 flex flex-wrap gap-1 pt-2">
        {codesNaf.slice(0, 4).map((n) => (
          <span
            key={n}
            className="rounded-full border border-rule-soft px-2 py-0.5 font-mono text-[0.62rem] text-muted-foreground"
          >
            {n}
          </span>
        ))}
        {codesNaf.length > 4 && (
          <span className="self-center font-mono text-[0.62rem] text-muted-foreground">
            +{codesNaf.length - 4}
          </span>
        )}
      </div>

      <span className="mt-6 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink transition-transform group-hover:translate-x-1">
        {pending
          ? "Application…"
          : dejaChoisi
            ? "Confirmer →"
            : "Choisir ce secteur →"}
      </span>
    </button>
  );
}
