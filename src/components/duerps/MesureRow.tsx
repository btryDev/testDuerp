"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { modifierMesure, supprimerMesure } from "@/lib/mesures/actions";
import { LABEL_TYPE_MESURE } from "@/lib/mesures/labels";
import type { TypeMesure } from "@/lib/referentiels/types";

function formatDateISO(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

type Statut = "existante" | "prevue";

type Props = {
  id: string;
  libelle: string;
  type: TypeMesure;
  statut: Statut;
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

  const setStatut = (next: Statut) => {
    if (next === statut) return;
    startTransition(async () => {
      await modifierMesure(id, { statut: next });
    });
  };

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{libelle}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {LABEL_TYPE_MESURE[type]}
            {origine === "custom" && " · ajoutée manuellement"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="radiogroup"
            aria-label="Statut de cette mesure"
            className="inline-flex items-center rounded-full border border-rule/70 bg-paper-sunk/40 p-0.5 text-[0.72rem] font-medium"
          >
            <SegButton
              active={statut === "existante"}
              activeTone="green"
              onClick={() => setStatut("existante")}
              disabled={pending}
              label="Déjà en place"
            />
            <SegButton
              active={statut === "prevue"}
              activeTone="warm"
              onClick={() => setStatut("prevue")}
              disabled={pending}
              label="À prévoir"
            />
          </div>
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
          <ChampValidable
            label="Échéance"
            type="date"
            initial={formatDateISO(echeance)}
            onSave={async (v) => {
              await modifierMesure(id, { echeance: v || "" });
            }}
          />
          <ChampValidable
            label="Responsable"
            placeholder="Nom ou rôle"
            initial={responsable ?? ""}
            transformAvantSave={(v) => v.trim()}
            onSave={async (v) => {
              await modifierMesure(id, { responsable: v || null });
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Champ texte/date avec validation explicite.
 * - Tant que la valeur ne diffère pas de la dernière enregistrée : UI neutre.
 * - Dès qu'elle diffère : bouton « Enregistrer » apparaît à droite.
 * - Après save réussi : le bouton disparaît, un ✓ « Enregistré » s'affiche
 *   ~1,8 s puis s'efface.
 * - Filet de sécurité : `onBlur` déclenche aussi la sauvegarde (mais un clic
 *   sur le bouton est le signal explicite attendu par l'utilisateur).
 */
function ChampValidable({
  label,
  initial,
  type = "text",
  placeholder,
  transformAvantSave,
  onSave,
}: {
  label: string;
  initial: string;
  type?: "text" | "date";
  placeholder?: string;
  transformAvantSave?: (v: string) => string;
  onSave: (v: string) => Promise<void>;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [etat, setEtat] = useState<"idle" | "saving" | "saved">("idle");

  const normaliser = (v: string) =>
    transformAvantSave ? transformAvantSave(v) : v;
  const valeurNormalisee = normaliser(value);
  const dirty = valeurNormalisee !== saved;

  const enregistrer = async () => {
    if (!dirty) return;
    const v = valeurNormalisee;
    setEtat("saving");
    try {
      await onSave(v);
      setValue(v);
      setSaved(v);
      setEtat("saved");
      window.setTimeout(() => {
        setEtat((prev) => (prev === "saved" ? "idle" : prev));
      }, 1800);
    } catch {
      setEtat("idle");
    }
  };

  return (
    <label className="block text-xs text-muted-foreground">
      <span className="block">{label}</span>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.currentTarget.value)}
        onBlur={enregistrer}
        disabled={etat === "saving"}
        className="mt-1"
      />
      <span className="mt-5 flex h-[20px] items-center justify-end gap-2">
        {dirty ? (
          <>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[color:var(--warm)]">
              Non enregistré
            </span>
            <Button
              type="button"
              size="sm"
              onClick={enregistrer}
              disabled={etat === "saving"}
              className="h-7 rounded-full px-3 text-[0.72rem]"
            >
              {etat === "saving" ? "…" : "Enregistrer"}
            </Button>
          </>
        ) : etat === "saved" ? (
          <span className="inline-flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[color:var(--green-dash)]">
            <Check aria-hidden className="h-2.5 w-2.5" strokeWidth={3} />
            Enregistré
          </span>
        ) : null}
      </span>
    </label>
  );
}

function SegButton({
  active,
  activeTone,
  onClick,
  disabled,
  label,
}: {
  active: boolean;
  activeTone: "green" | "warm";
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  const activeClass =
    activeTone === "green"
      ? "bg-[color:var(--green-dash)] text-paper-elevated shadow-sm"
      : "bg-[color:var(--warm)] text-paper-elevated shadow-sm";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-3 py-1 transition-colors ${
        active
          ? activeClass
          : "text-muted-foreground hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
