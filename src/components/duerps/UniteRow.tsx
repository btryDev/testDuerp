"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renommerUnite, supprimerUnite } from "@/lib/duerps/actions";

type Props = {
  id: string;
  nom: string;
  description?: string | null;
  nombreRisques: number;
};

export function UniteRow({ id, nom, description, nombreRisques }: Props) {
  const [editing, setEditing] = useState(false);
  const [valeur, setValeur] = useState(nom);
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex items-start justify-between gap-6 px-6 py-5 sm:px-8">
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={valeur}
              onChange={(e) => setValeur(e.target.value)}
              autoFocus
              className="max-w-md"
            />
            <Button
              size="sm"
              disabled={pending || !valeur.trim()}
              onClick={() => {
                startTransition(async () => {
                  await renommerUnite(id, valeur);
                  setEditing(false);
                });
              }}
            >
              OK
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setValeur(nom);
                setEditing(false);
              }}
            >
              Annuler
            </Button>
          </div>
        ) : (
          <>
            <p className="text-[1rem] font-semibold tracking-[-0.01em] leading-snug">
              {nom}
            </p>
            {description && (
              <p className="mt-1 text-[0.88rem] leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
            <p className="mt-2 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-muted-foreground">
              {nombreRisques === 0
                ? "Aucun risque renseigné"
                : `${String(nombreRisques).padStart(2, "0")} risque${nombreRisques > 1 ? "s" : ""} renseigné${nombreRisques > 1 ? "s" : ""}`}
            </p>
          </>
        )}
      </div>
      {!editing && (
        <div className="flex shrink-0 gap-1">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Renommer
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              if (
                nombreRisques > 0 &&
                !confirm(
                  `Supprimer "${nom}" ? Les ${nombreRisques} risque(s) associés seront également supprimés.`,
                )
              )
                return;
              startTransition(async () => {
                await supprimerUnite(id);
              });
            }}
          >
            Supprimer
          </Button>
        </div>
      )}
    </li>
  );
}
