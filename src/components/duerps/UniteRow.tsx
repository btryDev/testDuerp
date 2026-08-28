"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
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
    <li className="flex items-start justify-between gap-6 px-7 py-5 sm:px-8">
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex flex-wrap items-center gap-2">
            {/* Renommage sur place : le libellé serait redondant avec le nom
                qu'on est en train de corriger, mais un champ sans nom
                accessible ne s'annonce pas — d'où l'`aria-label`. */}
            <input
              className="champ-board max-w-md"
              aria-label="Nom de l'unité de travail"
              value={valeur}
              onChange={(e) => setValeur(e.target.value)}
              autoFocus
            />
            <Button
              variant="board"
              size="boardSm"
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
              variant="boardClair"
              size="boardSm"
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
            <p className="m-0 text-[16px] font-semibold leading-[1.3] tracking-[-0.01em] text-[color:var(--board-ink)]">
              {nom}
            </p>
            {description && (
              <p className="m-0 mt-1 max-w-[62ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
                {description}
              </p>
            )}
            <p className="board-eyebrow m-0 mt-2 text-[10px] tracking-[0.16em] tabular-nums text-[color:var(--board-slate-soft)]">
              {nombreRisques === 0
                ? "Aucun risque renseigné"
                : `${String(nombreRisques).padStart(2, "0")} risque${nombreRisques > 1 ? "s" : ""} renseigné${nombreRisques > 1 ? "s" : ""}`}
            </p>
          </>
        )}
      </div>
      {!editing && (
        <div className="flex shrink-0 gap-1.5">
          <Button
            variant="boardClair"
            size="boardSm"
            onClick={() => setEditing(true)}
          >
            Renommer
          </Button>
          <Button
            variant="boardClair"
            size="boardSm"
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
