"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LABEL_SOURCE_PRESCRIPTION,
  SOURCES_PRESCRIPTION,
} from "@/lib/prescriptions/schema";
import type { PrescriptionActionState } from "@/lib/prescriptions/actions";
import {
  CATEGORIES_EQUIPEMENT,
  PERIODICITES,
  REALISATEURS,
  type Periodicite,
  type Realisateur,
} from "@/lib/referentiels/types-communs";
import { LABEL_CATEGORIE_EQUIPEMENT } from "@/lib/equipements/labels";

type Props = {
  action: (
    prev: PrescriptionActionState,
    fd: FormData,
  ) => Promise<PrescriptionActionState>;
  obligations: { id: string; libelle: string; periodicite: string }[];
  equipements: { id: string; libelle: string; categorie: string }[];
};

/**
 * Libellés « en toutes lettres » des périodicités, propres à ce formulaire :
 * `@/lib/calendrier/labels` porte des libellés minuscules destinés à être
 * insérés dans une phrase, pas à être lus seuls dans un `<select>`.
 * Typés `Record<Periodicite, …>` — et non `Record<string, …>` — pour qu'une
 * valeur ajoutée à l'enum casse la compilation au lieu de s'afficher en brut.
 */
const LABEL_PERIODICITE: Record<Periodicite, string> = {
  hebdomadaire: "Hebdomadaire",
  mensuelle: "Mensuelle",
  trimestrielle: "Trimestrielle",
  semestrielle: "Semestrielle",
  annuelle: "Annuelle",
  biennale: "Tous les 2 ans",
  triennale: "Tous les 3 ans",
  quinquennale: "Tous les 5 ans",
  decennale: "Tous les 10 ans",
  mise_en_service_uniquement: "Une seule fois (vérification à délai)",
  // Refusée à la saisie (schéma + CHECK SQL), présente pour l'exhaustivité du
  // type : une prescription sans échéance n'a rien à faire au calendrier.
  autre: "Sans échéance",
};

/** Idem : formulation à la deuxième personne, adressée au dirigeant. */
const LABEL_REALISATEUR: Record<Realisateur, string> = {
  organisme_agree: "Organisme agréé",
  organisme_accredite: "Organisme accrédité",
  personne_qualifiee: "Personne qualifiée",
  personne_competente: "Personne compétente",
  exploitant: "Exploitant (vous-même)",
  fabricant: "Fabricant / installateur",
  bureau_controle: "Bureau de contrôle",
};

export function PrescriptionForm({ action, obligations, equipements }: Props) {
  const [state, formAction, pending] = useActionState(action, {
    status: "idle",
  });
  const [effet, setEffet] = useState<"renforce_periodicite" | "obligation_sur_mesure">(
    "renforce_periodicite",
  );
  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ]?.[0] : undefined;

  return (
    <form action={formAction} className="space-y-8">
      <section className="cartouche space-y-5 px-6 py-6 sm:px-8">
        <p className="label-admin">L&apos;acte</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="source">Nature de l&apos;acte *</Label>
            <select
              id="source"
              name="source"
              className="h-9 w-full rounded-md border border-rule bg-background px-3 text-sm"
            >
              {SOURCES_PRESCRIPTION.map((s) => (
                <option key={s} value={s}>
                  {LABEL_SOURCE_PRESCRIPTION[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reference">Référence *</Label>
            <Input id="reference" name="reference" placeholder="AP n° 2026-123" required />
            {err("reference") && <p className="text-sm text-destructive">{err("reference")}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="autorite">Autorité</Label>
            <Input id="autorite" name="autorite" placeholder="Préfecture du Rhône, Mairie de…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateDocument">Date de l&apos;acte *</Label>
            <Input id="dateDocument" name="dateDocument" type="date" required />
            {err("dateDocument") && <p className="text-sm text-destructive">{err("dateDocument")}</p>}
          </div>
        </div>
        <p className="text-[0.82rem] leading-relaxed text-muted-foreground">
          Un procès-verbal de commission est un avis ; l&apos;acte qui prescrit
          est l&apos;arrêté du maire ou du préfet qui le suit (CCH, art.
          R. 143-45). Rojer n&apos;enregistre qu&apos;une prescription qui
          <strong> renforce</strong> vos obligations : un allègement se conserve
          dans vos pièces, il n&apos;est pas pris en compte dans le calendrier.
        </p>
      </section>

      <section className="cartouche space-y-5 px-6 py-6 sm:px-8">
        <p className="label-admin">Ce que la prescription impose</p>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="effet"
              value="renforce_periodicite"
              checked={effet === "renforce_periodicite"}
              onChange={() => setEffet("renforce_periodicite")}
            />
            Un rythme plus court sur une obligation existante
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="effet"
              value="obligation_sur_mesure"
              checked={effet === "obligation_sur_mesure"}
              onChange={() => setEffet("obligation_sur_mesure")}
            />
            Une vérification qui n&apos;est pas dans le référentiel
          </label>
        </div>

        {effet === "renforce_periodicite" ? (
          <div className="space-y-2">
            <Label htmlFor="obligationId">Obligation concernée *</Label>
            <select
              id="obligationId"
              name="obligationId"
              className="h-9 w-full rounded-md border border-rule bg-background px-3 text-sm"
            >
              {obligations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.libelle} — actuellement{" "}
                  {LABEL_PERIODICITE[o.periodicite as Periodicite] ?? o.periodicite}
                </option>
              ))}
            </select>
            {err("obligationId") && <p className="text-sm text-destructive">{err("obligationId")}</p>}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="libelle">Libellé de la vérification *</Label>
              <Input id="libelle" name="libelle" />
              {err("libelle") && <p className="text-sm text-destructive">{err("libelle")}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categorieEquipement">Catégorie d&apos;équipement</Label>
              <select
                id="categorieEquipement"
                name="categorieEquipement"
                className="h-9 w-full rounded-md border border-rule bg-background px-3 text-sm"
                defaultValue=""
              >
                <option value="">— ou un équipement précis ci-contre —</option>
                {CATEGORIES_EQUIPEMENT.map((c) => (
                  <option key={c} value={c}>
                    {LABEL_CATEGORIE_EQUIPEMENT[c]}
                  </option>
                ))}
              </select>
              {err("categorieEquipement") && (
                <p className="text-sm text-destructive">{err("categorieEquipement")}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Réalisateur requis *</Label>
              <div className="flex flex-wrap gap-3">
                {REALISATEURS.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="realisateurRequis" value={r} />
                    {LABEL_REALISATEUR[r]}
                  </label>
                ))}
              </div>
              {err("realisateurRequis") && (
                <p className="text-sm text-destructive">{err("realisateurRequis")}</p>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="periodicite">Périodicité imposée *</Label>
            <select
              id="periodicite"
              name="periodicite"
              className="h-9 w-full rounded-md border border-rule bg-background px-3 text-sm"
            >
              {PERIODICITES.filter((p) => p !== "autre").map((p) => (
                <option key={p} value={p}>
                  {LABEL_PERIODICITE[p]}
                </option>
              ))}
            </select>
            {err("periodicite") && <p className="text-sm text-destructive">{err("periodicite")}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="equipementId">Équipement précis (optionnel)</Label>
            <select
              id="equipementId"
              name="equipementId"
              className="h-9 w-full rounded-md border border-rule bg-background px-3 text-sm"
              defaultValue=""
            >
              <option value="">Tous les équipements concernés</option>
              {equipements.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.libelle} ({LABEL_CATEGORIE_EQUIPEMENT[e.categorie as keyof typeof LABEL_CATEGORIE_EQUIPEMENT] ?? e.categorie})
                </option>
              ))}
            </select>
            {err("equipementId") && <p className="text-sm text-destructive">{err("equipementId")}</p>}
          </div>
        </div>
      </section>

      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer la prescription"}
      </Button>
    </form>
  );
}
