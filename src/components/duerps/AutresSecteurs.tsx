"use client";

import { useState } from "react";
import { SecteurCard } from "./SecteurCard";

type SecteurOption = {
  id: string;
  nom: string;
  description: string;
  nombreUnites: number;
  nombreRisques: number;
  codesNaf: string[];
};

export function AutresSecteurs({
  duerpId,
  secteurs,
  secteurChoisiId,
  alignDroite = false,
}: {
  duerpId: string;
  secteurs: SecteurOption[];
  secteurChoisiId: string | null;
  alignDroite?: boolean;
}) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        className={`group inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-ink ${
          alignDroite ? "self-end" : ""
        }`}
      >
        {ouvert ? "Masquer les autres secteurs" : "Changer de secteur"}
        <span aria-hidden className="text-[0.85rem] leading-none">
          {ouvert ? "−" : "+"}
        </span>
      </button>

      {ouvert && (
        <div className="col-span-full mt-8 border-t border-dashed border-rule/60 pt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {secteurs.map((r) => (
            <SecteurCard
              key={r.id}
              duerpId={duerpId}
              secteurId={r.id}
              nom={r.nom}
              description={r.description}
              nombreUnites={r.nombreUnites}
              nombreRisques={r.nombreRisques}
              codesNaf={r.codesNaf}
              recommande={false}
              dejaChoisi={secteurChoisiId === r.id}
            />
          ))}
        </div>
      )}
    </>
  );
}
