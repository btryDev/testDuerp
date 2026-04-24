"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  creerPermisFeu,
  type PermisFeuActionState,
} from "@/lib/permis-feu/actions";
import { NATURES_TRAVAUX, LABEL_NATURE } from "@/lib/permis-feu/schema";
import {
  GROUPES_LABEL,
  mesuresParGroupe,
  type MesurePermisFeu,
} from "@/lib/permis-feu/referentiel";

type PrestataireLite = {
  id: string;
  raisonSociale: string;
  contactNom: string;
  contactEmail: string;
};

export function FormulairePermisFeu({
  etablissementId,
  prestataires,
}: {
  etablissementId: string;
  prestataires: PrestataireLite[];
}) {
  const router = useRouter();
  const boundAction = creerPermisFeu.bind(null, etablissementId);
  const [state, formAction, pending] = useActionState<
    PermisFeuActionState,
    FormData
  >(boundAction, { status: "idle" });

  const [prestataireChoisi, setPrestataireChoisi] =
    useState<PrestataireLite | null>(null);

  useEffect(() => {
    if (state.status === "success") {
      router.push(
        `/etablissements/${etablissementId}/permis-feu/${state.permisFeuId}`,
      );
    }
  }, [state, etablissementId, router]);

  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ]?.[0] : undefined;

  const groupes = mesuresParGroupe();
  const nbObligatoires = (
    Object.values(groupes).flat() as MesurePermisFeu[]
  ).filter((m) => m.priorite === "obligatoire").length;

  return (
    <form action={formAction} className="space-y-10">
      {/* 1 — Prestataire */}
      <section className="cartouche relative overflow-hidden">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "var(--warm)" }}
        />
        <header className="px-7 pb-4 pt-7">
          <p className="label-admin">1 · Qui intervient</p>
          <h2 className="mt-2 text-[1.1rem] font-semibold tracking-[-0.015em]">
            Entreprise qui réalise les travaux
          </h2>
        </header>

        <div className="space-y-5 px-7 pb-7">
          {prestataires.length > 0 && (
            <div>
              <Label>Choisir dans l&apos;annuaire</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {prestataires.map((p) => {
                  const actif = prestataireChoisi?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPrestataireChoisi(actif ? null : p)}
                      className={
                        "rounded-full border px-3 py-1.5 text-[0.82rem] transition " +
                        (actif
                          ? "border-[color:var(--warm)] bg-[color:var(--warm-soft)] text-[color:var(--warm)]"
                          : "border-[color:var(--rule)] bg-[color:var(--paper-elevated)] hover:border-[color:var(--warm)]")
                      }
                    >
                      {p.raisonSociale}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[0.78rem] text-muted-foreground">
                Sinon, saisissez manuellement ci-dessous.
              </p>
            </div>
          )}

          <input
            type="hidden"
            name="prestataireId"
            value={prestataireChoisi?.id ?? ""}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prestataireRaison">Raison sociale *</Label>
              <Input
                id="prestataireRaison"
                name="prestataireRaison"
                required
                maxLength={200}
                defaultValue={prestataireChoisi?.raisonSociale ?? ""}
                key={prestataireChoisi?.id ?? "libre"}
              />
              {err("prestataireRaison") && (
                <p className="text-sm text-destructive">{err("prestataireRaison")}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prestataireContact">Nom du technicien *</Label>
              <Input
                id="prestataireContact"
                name="prestataireContact"
                required
                maxLength={200}
                defaultValue={prestataireChoisi?.contactNom ?? ""}
                key={`contact-${prestataireChoisi?.id ?? "libre"}`}
              />
              {err("prestataireContact") && (
                <p className="text-sm text-destructive">{err("prestataireContact")}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prestataireEmail">Email du technicien *</Label>
            <Input
              id="prestataireEmail"
              name="prestataireEmail"
              type="email"
              required
              maxLength={200}
              placeholder="jean.dupond@entreprise.fr"
              defaultValue={prestataireChoisi?.contactEmail ?? ""}
              key={`email-${prestataireChoisi?.id ?? "libre"}`}
            />
            {err("prestataireEmail") && (
              <p className="text-sm text-destructive">{err("prestataireEmail")}</p>
            )}
            <p className="text-[0.78rem] text-muted-foreground">
              Utilisé pour envoyer le lien de signature au technicien.
            </p>
          </div>
        </div>
      </section>

      {/* 2 — Donneur d'ordre */}
      <section className="cartouche relative overflow-hidden">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "var(--warm)" }}
        />
        <header className="px-7 pb-4 pt-7">
          <p className="label-admin">2 · Donneur d&apos;ordre</p>
          <h2 className="mt-2 text-[1.1rem] font-semibold tracking-[-0.015em]">
            Qui signe côté site
          </h2>
        </header>
        <div className="grid grid-cols-1 gap-4 px-7 pb-7 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="donneurOrdreNom">Nom et prénom *</Label>
            <Input
              id="donneurOrdreNom"
              name="donneurOrdreNom"
              required
              maxLength={200}
            />
            {err("donneurOrdreNom") && (
              <p className="text-sm text-destructive">{err("donneurOrdreNom")}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="donneurOrdreFonction">Fonction</Label>
            <Input
              id="donneurOrdreFonction"
              name="donneurOrdreFonction"
              maxLength={120}
              placeholder="Ex : Gérant, Responsable technique…"
            />
          </div>
        </div>
      </section>

      {/* 3 — Travaux */}
      <section className="cartouche relative overflow-hidden">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "var(--minium)" }}
        />
        <header className="px-7 pb-4 pt-7">
          <p className="label-admin">3 · Nature et lieu des travaux</p>
          <h2 className="mt-2 text-[1.1rem] font-semibold tracking-[-0.015em]">
            Quoi, où, quand
          </h2>
        </header>
        <div className="space-y-5 px-7 pb-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dateDebut">Début des travaux *</Label>
              <Input
                id="dateDebut"
                name="dateDebut"
                type="datetime-local"
                required
              />
              {err("dateDebut") && (
                <p className="text-sm text-destructive">{err("dateDebut")}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dateFin">Fin des travaux *</Label>
              <Input
                id="dateFin"
                name="dateFin"
                type="datetime-local"
                required
              />
              {err("dateFin") && (
                <p className="text-sm text-destructive">{err("dateFin")}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lieu">Lieu précis *</Label>
            <Input
              id="lieu"
              name="lieu"
              required
              maxLength={500}
              placeholder="Ex : Sous-sol, local technique nord, près de la chaudière"
            />
            {err("lieu") && (
              <p className="text-sm text-destructive">{err("lieu")}</p>
            )}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-[0.88rem] font-medium">
              Type(s) de point chaud *
            </legend>
            <div className="flex flex-wrap gap-2">
              {NATURES_TRAVAUX.map((n) => (
                <label
                  key={n}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[color:var(--rule)] bg-[color:var(--paper-elevated)] px-3 py-1.5 text-[0.82rem] transition hover:border-[color:var(--minium)] has-[:checked]:border-[color:var(--minium)] has-[:checked]:bg-[color:color-mix(in_oklch,var(--minium)_12%,transparent)] has-[:checked]:text-[color:var(--minium)]"
                >
                  <input
                    type="checkbox"
                    name="naturesTravaux"
                    value={n}
                    className="sr-only"
                  />
                  {LABEL_NATURE[n]}
                </label>
              ))}
            </div>
            {err("naturesTravaux") && (
              <p className="text-sm text-destructive">{err("naturesTravaux")}</p>
            )}
          </fieldset>

          <div className="space-y-1.5">
            <Label htmlFor="descriptionTravaux">Description des travaux *</Label>
            <textarea
              id="descriptionTravaux"
              name="descriptionTravaux"
              required
              rows={4}
              maxLength={4000}
              minLength={10}
              className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
              placeholder="Ex : Soudage de raccords sur tuyauterie inox au plafond du local technique. 4 soudures, durée estimée 3h."
            />
            {err("descriptionTravaux") && (
              <p className="text-sm text-destructive">{err("descriptionTravaux")}</p>
            )}
          </div>
        </div>
      </section>

      {/* 4 — Mesures de prévention */}
      <section className="cartouche relative overflow-hidden">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "var(--accent-vif)" }}
        />
        <header className="px-7 pb-4 pt-7">
          <p className="label-admin">4 · Mesures de prévention — INRS ED 6030</p>
          <h2 className="mt-2 text-[1.1rem] font-semibold tracking-[-0.015em]">
            Check-list à valider avant, pendant, après
          </h2>
          <p className="mt-2 text-[0.85rem] text-muted-foreground">
            {nbObligatoires} mesures obligatoires. Cochez au fur et à mesure
            qu&apos;elles sont en place.
          </p>
        </header>
        <div className="divide-y divide-dashed divide-rule/50">
          {(["avant", "pendant", "apres"] as const).map((g) => (
            <div key={g} className="px-7 py-5">
              <div className="mb-3">
                <p className="text-[0.95rem] font-semibold">
                  {GROUPES_LABEL[g].label}
                </p>
                <p className="text-[0.78rem] text-muted-foreground">
                  {GROUPES_LABEL[g].sous}
                </p>
              </div>
              <ul className="space-y-2">
                {groupes[g].map((m) => (
                  <li key={m.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[color:var(--rule-soft)] bg-[color:var(--paper-elevated)] p-3 transition hover:border-[color:var(--warm)] has-[:checked]:border-[color:var(--accent-vif)] has-[:checked]:bg-[color:var(--accent-vif-soft)]">
                      <input
                        type="checkbox"
                        name="mesuresValidees"
                        value={m.id}
                        className="mt-0.5 size-4"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[0.88rem] font-medium">
                            {m.libelle}
                          </span>
                          {m.priorite === "obligatoire" && (
                            <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--minium)]">
                              obligatoire
                            </span>
                          )}
                        </div>
                        {m.explication && (
                          <p className="mt-1 text-[0.76rem] leading-relaxed text-muted-foreground">
                            {m.explication}
                          </p>
                        )}
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-dashed border-rule/50 px-7 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="dureeSurveillanceMinutes">
              Durée de surveillance post-travaux *
            </Label>
            <div className="flex flex-wrap gap-2">
              {[120, 240, 360].map((mn) => (
                <label
                  key={mn}
                  className="cursor-pointer rounded-full border border-[color:var(--rule)] bg-[color:var(--paper-elevated)] px-3 py-1.5 text-[0.82rem] transition has-[:checked]:border-[color:var(--minium)] has-[:checked]:bg-[color:color-mix(in_oklch,var(--minium)_10%,transparent)] has-[:checked]:text-[color:var(--minium)]"
                >
                  <input
                    type="radio"
                    name="dureeSurveillanceMinutes"
                    value={mn}
                    defaultChecked={mn === 120}
                    className="sr-only"
                  />
                  {mn / 60}h {mn === 120 ? "(standard)" : mn === 240 ? "(renforcé)" : "(intensif)"}
                </label>
              ))}
            </div>
            <p className="text-[0.78rem] text-muted-foreground">
              2h minimum INRS. Passez à 4h si matières combustibles profondes
              (bois, isolants), 6h si risque incendie élevé.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mesuresNotes">
              Notes additionnelles sur la prévention
            </Label>
            <textarea
              id="mesuresNotes"
              name="mesuresNotes"
              rows={3}
              maxLength={2000}
              className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
              placeholder="Mesures spécifiques liées aux contraintes du site…"
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer le permis et demander les signatures"}
        </Button>
        <Link
          href={`/etablissements/${etablissementId}/permis-feu`}
          className={buttonVariants({ variant: "outline", size: "default" })}
        >
          Annuler
        </Link>
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
    </form>
  );
}
