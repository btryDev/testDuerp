"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NouveauTicketForm } from "./NouveauTicketForm";

type RisqueLite = { id: string; libelle: string; uniteNom: string };

/**
 * Bouton qui ouvre un <dialog> modal avec le formulaire de création.
 * Garde la fluidité Linear-like : nouveau ticket en 2 secondes depuis
 * n'importe quelle vue.
 */
export function NouveauTicketTrigger({
  etablissementId,
  risques,
  label = "+ Nouveau ticket",
}: {
  etablissementId: string;
  risques: RisqueLite[];
  label?: string;
}) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOuvert(true)}>
        {label}
      </Button>
      {ouvert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ticket-new-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-[color:color-mix(in_oklch,var(--ink)_60%,transparent)]"
            onClick={() => setOuvert(false)}
          />
          <div className="relative w-full max-w-xl overflow-y-auto rounded-2xl border border-[color:var(--rule)] bg-[color:var(--paper-elevated)] p-6 shadow-2xl max-h-[90vh]">
            <div className="flex items-center justify-between gap-4 border-b border-dashed border-rule/60 pb-3 mb-5">
              <div>
                <p className="label-admin">Nouveau ticket</p>
                <h2
                  id="ticket-new-title"
                  className="mt-1 text-[1.15rem] font-semibold tracking-[-0.015em]"
                >
                  Qu&apos;est-ce qui ne va pas ?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOuvert(false)}
                aria-label="Fermer"
                className="rounded-full border border-[color:var(--rule)] px-2 py-0.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground hover:text-ink"
              >
                ✕
              </button>
            </div>
            <NouveauTicketForm
              etablissementId={etablissementId}
              risques={risques}
              onCreated={() => setOuvert(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
