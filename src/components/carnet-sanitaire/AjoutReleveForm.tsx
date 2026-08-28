"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChampBoard, StatusPill } from "@/components/ui-kit";
import {
  ajouterReleve,
  type CarnetActionState,
} from "@/lib/carnet-sanitaire/actions";
import { cleJourCivil } from "@/lib/dates";

/**
 * Formulaire compact de saisie d'un relevé de température. Pensé pour
 * mobile : grand champ numérique, bouton massif. Utilisable directement sur
 * place (tablette, téléphone).
 */
export function AjoutReleveForm({
  etablissementId,
  pointReleveId,
  seuilMinCelsius,
  typeReseau,
}: {
  etablissementId: string;
  pointReleveId: string;
  seuilMinCelsius: number;
  typeReseau: string;
}) {
  const boundAction = ajouterReleve.bind(null, etablissementId);
  const [state, formAction, pending] = useActionState<
    CarnetActionState,
    FormData
  >(boundAction, { status: "idle" });
  const [temperature, setTemperature] = useState<string>("");
  const [ouvert, setOuvert] = useState(false);

  const tempNum = temperature ? parseFloat(temperature) : null;
  const dansLaPlage =
    tempNum === null
      ? null
      : typeReseau === "EFS"
        ? tempNum <= seuilMinCelsius
        : tempNum >= seuilMinCelsius;

  if (!ouvert) {
    return (
      <Button
        type="button"
        variant="board"
        size="boardSm"
        onClick={() => setOuvert(true)}
      >
        + Saisir un relevé
      </Button>
    );
  }

  // Jour civil de Paris, pas la date UTC du navigateur : entre 00:00 et
  // 02:00 heure d'été, `toISOString()` renvoie encore la veille et le
  // formulaire proposait la mauvaise date de relevé (cf. ADR-011).
  const today = cleJourCivil(new Date());

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-[22px] bg-[color:var(--board-slate-pale)] p-5"
    >
      <input type="hidden" name="pointReleveId" value={pointReleveId} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.5fr]">
        <ChampBoard
          id={`dateReleve-${pointReleveId}`}
          name="dateReleve"
          label="Date"
          requis
          type="date"
          defaultValue={today}
        />
        <div>
          <label
            className="label-board"
            htmlFor={`temperatureCelsius-${pointReleveId}`}
          >
            Température (°C) *
          </label>
          <div className="flex items-center gap-3">
            <input
              id={`temperatureCelsius-${pointReleveId}`}
              name="temperatureCelsius"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              max={100}
              required
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="52.3"
              className="champ-board text-center text-[22px] font-semibold tabular-nums"
              aria-describedby={`seuil-${pointReleveId}`}
            />
            {/* « Conforme » ne se dit pas : l'outil constate qu'une mesure
                tombe dans la plage attendue, ou qu'elle en sort — il ne
                prononce pas la conformité de l'installation (interdits
                16-17). Mêmes mots que la pastille du carnet. */}
            {dansLaPlage !== null && (
              <StatusPill
                charte="board"
                size="sm"
                status={dansLaPlage ? "a_jour" : "non_conforme"}
                label={dansLaPlage ? "Dans la plage" : undefined}
                className="shrink-0"
              />
            )}
          </div>
          <p
            id={`seuil-${pointReleveId}`}
            className="m-0 mt-1.5 text-[12px] leading-[1.5] text-[color:var(--board-slate-mid)]"
          >
            Seuil {typeReseau === "EFS" ? "max" : "min"} : {seuilMinCelsius} °C
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChampBoard
          id={`operateur-${pointReleveId}`}
          name="operateur"
          label="Opérateur (facultatif)"
          maxLength={200}
          placeholder="Prénom Nom"
        />
        <ChampBoard
          id={`commentaire-${pointReleveId}`}
          name="commentaire"
          label="Commentaire"
          maxLength={1000}
          placeholder="Ex : après purge"
        />
      </div>

      {state.status === "error" && (
        <p className="m-0 text-[12.5px] text-[color:var(--board-signal-ink)]">
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="board" size="boardSm" disabled={pending}>
          {pending ? "…" : "Enregistrer le relevé"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setOuvert(false);
            setTemperature("");
          }}
          className="text-[12.5px] font-medium text-[color:var(--board-slate-mid)] transition-colors hover:text-[color:var(--board-ink)]"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
