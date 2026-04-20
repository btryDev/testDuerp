"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { declarerAucunRisque } from "@/lib/duerps/actions";

export function DeclarerAucunRisqueForm({
  uniteId,
  justifInitiale,
}: {
  uniteId: string;
  justifInitiale: string | null;
}) {
  const [ouvert, setOuvert] = useState(Boolean(justifInitiale));
  const [valeur, setValeur] = useState(justifInitiale ?? "");
  const [pending, startTransition] = useTransition();
  const declaree = Boolean(justifInitiale);

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-ink"
      >
        <span aria-hidden className="text-[0.95rem] leading-none">+</span>
        Déclarer « aucun risque significatif »
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-[color:var(--warm)]/50 bg-[color:var(--warm-soft)] px-6 py-5">
      <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[color:var(--warm)]">
        Déclaration — aucun risque significatif
      </p>
      <p className="mt-2 text-[0.82rem] leading-relaxed text-ink">
        Cette déclaration sera reprise dans le DUERP généré. Précisez la
        nature de l&apos;évaluation (ex : « poste purement administratif, pas
        d&apos;exposition physique identifiée hors risques transverses »).
      </p>
      <textarea
        value={valeur}
        onChange={(e) => setValeur(e.target.value)}
        placeholder="Justification libre (quelques mots)"
        rows={3}
        className="mt-4 w-full rounded-xl border border-rule bg-paper-elevated px-3 py-2 text-[0.9rem] leading-relaxed focus:border-ink focus:outline-none"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={pending || !valeur.trim()}
          onClick={() => {
            startTransition(async () => {
              await declarerAucunRisque(uniteId, valeur);
            });
          }}
        >
          {pending
            ? "Enregistrement…"
            : declaree
              ? "Mettre à jour"
              : "Enregistrer la déclaration"}
        </Button>
        {declaree && (
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await declarerAucunRisque(uniteId, null);
                setValeur("");
                setOuvert(false);
              });
            }}
          >
            Retirer la déclaration
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setValeur(justifInitiale ?? "");
            if (!justifInitiale) setOuvert(false);
          }}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}
