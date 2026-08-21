"use client";

import { useActionState, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  creerBatiment,
  modifierBatiment,
  supprimerBatiment,
  type BatimentActionState,
} from "@/lib/batiments/actions";
import type { BatimentListe } from "@/lib/batiments/queries";

/**
 * Les bâtiments d'un établissement : une liste courte, éditable sur place.
 *
 * Un bâtiment est un lieu, rien d'autre (ADR-019) : on le nomme, on le
 * renomme, on le supprime après avoir dit où vont ses équipements. Aucun
 * régime ici — un bâtiment n'est pas « ERP » ou « non ERP », c'est
 * l'établissement qui l'est, pour tous ses bâtiments.
 */

const ETAT_INITIAL: BatimentActionState = { status: "idle" };

const CLASSE_SELECT =
  "h-9 w-full rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm";

function Erreur({ state, champ }: { state: BatimentActionState; champ?: string }) {
  if (state.status !== "error") return null;
  const message = champ ? state.fieldErrors?.[champ]?.[0] : state.message;
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function BatimentsManager({
  etablissementId,
  batiments,
}: {
  etablissementId: string;
  batiments: BatimentListe[];
}) {
  return (
    <div className="space-y-8">
      <ul className="divide-y divide-rule rounded-2xl border border-rule">
        {batiments.map((b) => (
          <LigneBatiment
            key={b.id}
            batiment={b}
            autres={batiments.filter((a) => a.id !== b.id)}
          />
        ))}
      </ul>

      <FormulaireAjout etablissementId={etablissementId} />
    </div>
  );
}

function LigneBatiment({
  batiment,
  autres,
}: {
  batiment: BatimentListe;
  autres: BatimentListe[];
}) {
  const [mode, setMode] = useState<"lecture" | "renommer" | "supprimer">(
    "lecture",
  );

  return (
    <li className="px-5 py-4">
      {mode === "lecture" && (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="font-medium">{batiment.nom}</p>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
              {batiment.nbEquipements === 0
                ? "Aucun équipement"
                : batiment.nbEquipements === 1
                  ? "1 équipement"
                  : `${batiment.nbEquipements} équipements`}
              {batiment.complementAdresse && ` · ${batiment.complementAdresse}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setMode("renommer")}>
              Renommer
            </Button>
            {autres.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("supprimer")}
              >
                Supprimer
              </Button>
            )}
          </div>
        </div>
      )}

      {mode === "renommer" && (
        <FormulaireRenommage
          batiment={batiment}
          onFin={() => setMode("lecture")}
        />
      )}

      {mode === "supprimer" && (
        <FormulaireSuppression
          batiment={batiment}
          autres={autres}
          onFin={() => setMode("lecture")}
        />
      )}
    </li>
  );
}

function FormulaireAjout({ etablissementId }: { etablissementId: string }) {
  const action = creerBatiment.bind(null, etablissementId);
  const [state, formAction, pending] = useActionState(action, ETAT_INITIAL);

  return (
    <form
      action={formAction}
      // Vider le formulaire après succès : la clé change, React remonte.
      key={state.status === "success" ? state.id : "vierge"}
      className="cartouche space-y-5 p-6"
    >
      <p className="label-admin">Ajouter un bâtiment</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nouveau-nom">Nom *</Label>
          <Input
            id="nouveau-nom"
            name="nom"
            required
            maxLength={80}
            placeholder="Ex : Réserve, Atelier, Annexe"
            aria-invalid={state.status === "error" && Boolean(state.fieldErrors?.nom)}
          />
          <Erreur state={state} champ="nom" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nouveau-complement">Complément d&apos;adresse</Label>
          <Input
            id="nouveau-complement"
            name="complementAdresse"
            maxLength={200}
            placeholder="Facultatif — si le bâtiment a sa propre entrée"
          />
        </div>
      </div>
      {state.status === "error" && !state.fieldErrors && <Erreur state={state} />}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Ajout…" : "Ajouter"}
      </Button>
    </form>
  );
}

function FormulaireRenommage({
  batiment,
  onFin,
}: {
  batiment: BatimentListe;
  onFin: () => void;
}) {
  const action = modifierBatiment.bind(null, batiment.id);
  const [state, formAction, pending] = useActionState(
    async (prev: BatimentActionState, fd: FormData) => {
      const r = await action(prev, fd);
      if (r.status === "success") onFin();
      return r;
    },
    ETAT_INITIAL,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`nom-${batiment.id}`}>Nom *</Label>
          <Input
            id={`nom-${batiment.id}`}
            name="nom"
            required
            maxLength={80}
            defaultValue={batiment.nom}
            autoFocus
          />
          <Erreur state={state} champ="nom" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`complement-${batiment.id}`}>
            Complément d&apos;adresse
          </Label>
          <Input
            id={`complement-${batiment.id}`}
            name="complementAdresse"
            maxLength={200}
            defaultValue={batiment.complementAdresse ?? ""}
          />
        </div>
      </div>
      {state.status === "error" && !state.fieldErrors && <Erreur state={state} />}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onFin}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

function FormulaireSuppression({
  batiment,
  autres,
  onFin,
}: {
  batiment: BatimentListe;
  autres: BatimentListe[];
  onFin: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [destination, setDestination] = useState(autres[0]?.id ?? "");
  const [erreur, setErreur] = useState<string | null>(null);
  const aContenu = batiment.nbEquipements > 0;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-foreground/85">
        {aContenu ? (
          <>
            <strong>{batiment.nom}</strong> contient{" "}
            {batiment.nbEquipements === 1
              ? "un équipement"
              : `${batiment.nbEquipements} équipements`}
            . Ils seront déplacés — avec leurs vérifications et leurs rapports —
            vers le bâtiment que vous choisissez. Rien n&apos;est supprimé.
          </>
        ) : (
          <>
            Supprimer <strong>{batiment.nom}</strong> ? Ce qui pourrait encore
            s&apos;y rattacher (équipement retiré du parc, point de relevé,
            permis, plan de prévention) sera déplacé vers le bâtiment que vous
            choisissez.
          </>
        )}
      </p>

      <div className="max-w-sm space-y-2">
        <Label htmlFor={`dest-${batiment.id}`}>Déplacer vers</Label>
        <select
          id={`dest-${batiment.id}`}
          value={destination}
          onChange={(e) => setDestination(e.currentTarget.value)}
          className={CLASSE_SELECT}
        >
          {autres.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nom}
            </option>
          ))}
        </select>
      </div>

      {erreur && (
        <p role="alert" className="text-sm text-destructive">
          {erreur}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => {
            setErreur(null);
            startTransition(async () => {
              const r = await supprimerBatiment(batiment.id, destination);
              if (r.status === "error") setErreur(r.message);
              else onFin();
            });
          }}
        >
          {pending
            ? "Suppression…"
            : aContenu
              ? "Déplacer et supprimer"
              : "Supprimer"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onFin}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
