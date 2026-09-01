"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChampBoard } from "@/components/ui-kit";
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
  bimensuelle: "Tous les 15 jours",
  mensuelle: "Mensuelle",
  six_semaines: "Toutes les 6 semaines",
  trimestrielle: "Trimestrielle",
  semestrielle: "Semestrielle",
  annuelle: "Annuelle",
  biennale: "Tous les 2 ans",
  triennale: "Tous les 3 ans",
  quadriennale: "Tous les 4 ans",
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
  medecin_travail: "Médecin du travail",
  professionnel_sante_travail: "Professionnel de santé au travail",
  equipe_pluridisciplinaire: "Équipe pluridisciplinaire (service de santé au travail)",
};

/** Un choix de case ou de bouton radio, dans la voix du board. */
const OPTION_COCHABLE =
  "flex cursor-pointer items-center gap-2.5 rounded-full bg-[color:var(--board-slate-pale)] px-3.5 py-2 text-[12.5px] font-medium text-[color:var(--board-slate-ink)] transition-colors has-[:checked]:bg-[color:var(--board-blue-pale)] has-[:checked]:text-[color:var(--board-blue-ink)]";

const CASE_A_COCHER =
  "size-4 rounded border-[color:var(--board-slate)] accent-[color:var(--board-ink)]";

function Erreur({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="m-0 mt-1.5 text-[12.5px] text-[color:var(--board-signal-ink)]">
      {message}
    </p>
  );
}

export function PrescriptionForm({ action, obligations, equipements }: Props) {
  const [state, formAction, pending] = useActionState(action, {
    status: "idle",
  });
  const [effet, setEffet] = useState<
    "renforce_periodicite" | "obligation_sur_mesure"
  >("renforce_periodicite");
  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ]?.[0] : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-7">
      <section className="carte-board flex flex-col gap-5 px-7 py-6 sm:px-8">
        <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">
          L&apos;acte
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-board" htmlFor="source">
              Nature de l&apos;acte *
            </label>
            <select id="source" name="source" className="champ-board">
              {SOURCES_PRESCRIPTION.map((s) => (
                <option key={s} value={s}>
                  {LABEL_SOURCE_PRESCRIPTION[s]}
                </option>
              ))}
            </select>
          </div>
          <ChampBoard
            id="reference"
            name="reference"
            label="Référence"
            requis
            placeholder="AP n° 2026-123"
            erreur={err("reference")}
          />
          <ChampBoard
            id="autorite"
            name="autorite"
            label="Autorité"
            placeholder="Préfecture du Rhône, Mairie de…"
          />
          <ChampBoard
            id="dateDocument"
            name="dateDocument"
            label="Date de l'acte"
            type="date"
            requis
            erreur={err("dateDocument")}
          />
        </div>
        <p className="m-0 max-w-[66ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
          Un procès-verbal de commission est un avis ; l&apos;acte qui prescrit
          est l&apos;arrêté du maire ou du préfet qui le suit (CCH, art. R.
          143-45). Rojer n&apos;enregistre qu&apos;une prescription qui
          <strong> renforce</strong> vos obligations : un allègement se conserve
          dans vos pièces, il n&apos;est pas pris en compte dans le calendrier.
        </p>
      </section>

      <section className="carte-board flex flex-col gap-5 px-7 py-6 sm:px-8">
        <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">
          Ce que la prescription impose
        </p>
        <div className="flex flex-wrap gap-3">
          <label className={OPTION_COCHABLE}>
            <input
              type="radio"
              name="effet"
              value="renforce_periodicite"
              className={CASE_A_COCHER}
              checked={effet === "renforce_periodicite"}
              onChange={() => setEffet("renforce_periodicite")}
            />
            Un rythme plus court sur une obligation existante
          </label>
          <label className={OPTION_COCHABLE}>
            <input
              type="radio"
              name="effet"
              value="obligation_sur_mesure"
              className={CASE_A_COCHER}
              checked={effet === "obligation_sur_mesure"}
              onChange={() => setEffet("obligation_sur_mesure")}
            />
            Une vérification qui n&apos;est pas dans le référentiel
          </label>
        </div>

        {effet === "renforce_periodicite" ? (
          <div>
            <label className="label-board" htmlFor="obligationId">
              Obligation concernée *
            </label>
            <select
              id="obligationId"
              name="obligationId"
              className="champ-board"
            >
              {obligations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.libelle} — actuellement{" "}
                  {LABEL_PERIODICITE[o.periodicite as Periodicite] ??
                    o.periodicite}
                </option>
              ))}
            </select>
            <Erreur message={err("obligationId")} />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <ChampBoard
              className="sm:col-span-2"
              id="libelle"
              name="libelle"
              // L'astérisque sans `requis` : le champ est obligatoire pour le
              // serveur, mais il vit dans une branche que le navigateur ne
              // voit pas toujours — le rendre `required` bloquerait la
              // soumission de l'autre branche.
              label="Libellé de la vérification *"
              erreur={err("libelle")}
            />
            <ChampBoard
              className="sm:col-span-2"
              id="description"
              name="description"
              label="Description"
            />
            <div>
              <label className="label-board" htmlFor="categorieEquipement">
                Catégorie d&apos;équipement
              </label>
              <select
                id="categorieEquipement"
                name="categorieEquipement"
                className="champ-board"
                defaultValue=""
              >
                <option value="">— ou un équipement précis ci-contre —</option>
                {CATEGORIES_EQUIPEMENT.map((c) => (
                  <option key={c} value={c}>
                    {LABEL_CATEGORIE_EQUIPEMENT[c]}
                  </option>
                ))}
              </select>
              <Erreur message={err("categorieEquipement")} />
            </div>
            <fieldset className="m-0 border-0 p-0 sm:col-span-2">
              <legend className="label-board">Réalisateur requis *</legend>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {REALISATEURS.map((r) => (
                  <label key={r} className={OPTION_COCHABLE}>
                    <input
                      type="checkbox"
                      name="realisateurRequis"
                      value={r}
                      className={CASE_A_COCHER}
                    />
                    {LABEL_REALISATEUR[r]}
                  </label>
                ))}
              </div>
              <Erreur message={err("realisateurRequis")} />
            </fieldset>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-board" htmlFor="periodicite">
              Périodicité imposée *
            </label>
            <select id="periodicite" name="periodicite" className="champ-board">
              {PERIODICITES.filter((p) => p !== "autre").map((p) => (
                <option key={p} value={p}>
                  {LABEL_PERIODICITE[p]}
                </option>
              ))}
            </select>
            <Erreur message={err("periodicite")} />
          </div>
          <div>
            <label className="label-board" htmlFor="equipementId">
              Équipement précis (optionnel)
            </label>
            <select
              id="equipementId"
              name="equipementId"
              className="champ-board"
              defaultValue=""
            >
              <option value="">Tous les équipements concernés</option>
              {equipements.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.libelle} (
                  {LABEL_CATEGORIE_EQUIPEMENT[
                    e.categorie as keyof typeof LABEL_CATEGORIE_EQUIPEMENT
                  ] ?? e.categorie}
                  )
                </option>
              ))}
            </select>
            <Erreur message={err("equipementId")} />
          </div>
        </div>
      </section>

      {state.status === "error" && (
        <p className="m-0 text-[12.5px] text-[color:var(--board-signal-ink)]">
          {state.message}
        </p>
      )}
      <div>
        <Button type="submit" variant="board" size="board" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer la prescription"}
        </Button>
      </div>
    </form>
  );
}
