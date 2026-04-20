"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { modifierMesure, supprimerMesure } from "@/lib/mesures/actions";
import { LABEL_STATUT, LABEL_TYPE_MESURE } from "@/lib/mesures/labels";
import type { TypeMesure } from "@/lib/referentiels/types";

type Props = {
  id: string;
  libelle: string;
  type: TypeMesure;
  statut: "existante" | "prevue";
  echeance: Date | null;
  responsable: string | null;
  origine: "referentiel" | "custom";
};

export function MesureRow({
  id,
  libelle,
  type,
  statut,
  echeance,
  responsable,
  origine,
}: Props) {
  const [pending, startTransition] = useTransition();

  const toggleStatut = () => {
    startTransition(async () => {
      await modifierMesure(id, {
        statut: statut === "existante" ? "prevue" : "existante",
      });
    });
  };

  return (
    <li className="rounded-lg border bg-card p-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{libelle}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {LABEL_TYPE_MESURE[type]}
            {origine === "custom" && " · ajoutée manuellement"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleStatut}
            disabled={pending}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statut === "existante"
                ? "bg-green-100 text-green-900 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-100"
                : "bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-100"
            }`}
          >
            {LABEL_STATUT[statut]}
          </button>
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              if (!confirm("Supprimer cette mesure ?")) return;
              startTransition(async () => {
                await supprimerMesure(id);
              });
            }}
          >
            Supprimer
          </Button>
        </div>
      </div>

      {statut === "prevue" && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="text-xs text-muted-foreground">
            Échéance
            <Input
              type="date"
              defaultValue={
                echeance ? echeance.toISOString().slice(0, 10) : ""
              }
              onBlur={(e) => {
                const v = e.currentTarget.value;
                startTransition(async () => {
                  await modifierMesure(id, { echeance: v || "" });
                });
              }}
              disabled={pending}
              className="mt-1"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Responsable
            <Input
              defaultValue={responsable ?? ""}
              placeholder="Nom ou rôle"
              onBlur={(e) => {
                const v = e.currentTarget.value.trim();
                startTransition(async () => {
                  await modifierMesure(id, { responsable: v || null });
                });
              }}
              disabled={pending}
              className="mt-1"
            />
          </label>
        </div>
      )}
    </li>
  );
}
