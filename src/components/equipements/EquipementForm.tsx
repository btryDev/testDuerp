"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { CATEGORIES_EQUIPEMENT } from "@/lib/equipements/schema";
import {
  DESCRIPTION_CATEGORIE,
  LABEL_CATEGORIE_EQUIPEMENT,
} from "@/lib/equipements/labels";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";
import type { EquipementActionState } from "@/lib/equipements/actions";

type Valeurs = {
  libelle?: string;
  categorie?: CategorieEquipement;
  localisation?: string | null;
  dateMiseEnService?: Date | null;
  nombre?: number | null;
  aGroupeElectrogene?: boolean;
  estLocalPollutionSpecifique?: boolean;
  nbVehiculesParkingCouvert?: number | null;
  notes?: string | null;
};

type Props = {
  action: (
    prev: EquipementActionState,
    formData: FormData,
  ) => Promise<EquipementActionState>;
  valeursInitiales?: Valeurs;
  libelleSubmit: string;
  labelAnnuler?: { libelle: string; href: string };
};

function toIsoDate(d: Date | null | undefined): string {
  if (!d) return "";
  // yyyy-mm-dd (locale UTC neutralisée)
  return d.toISOString().slice(0, 10);
}

const CATEGORIES_AERATION: readonly CategorieEquipement[] = [
  "VMC",
  "CTA",
  "HOTTE_PRO",
];

export function EquipementForm({
  action,
  valeursInitiales,
  libelleSubmit,
  labelAnnuler,
}: Props) {
  const [state, formAction, pending] = useActionState<
    EquipementActionState,
    FormData
  >(action, { status: "idle" });

  const [categorie, setCategorie] = useState<CategorieEquipement>(
    valeursInitiales?.categorie ?? "INSTALLATION_ELECTRIQUE",
  );

  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ]?.[0] : undefined;

  const estElec = categorie === "INSTALLATION_ELECTRIQUE";
  const estAeration = CATEGORIES_AERATION.includes(categorie);
  const estVmc = categorie === "VMC";

  return (
    <form action={formAction} className="space-y-8">
      {/* Catégorie + libellé */}
      <section className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="categorie">Catégorie *</Label>
          <select
            id="categorie"
            name="categorie"
            value={categorie}
            onChange={(e) =>
              setCategorie(e.currentTarget.value as CategorieEquipement)
            }
            required
            className="h-9 w-full rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm"
            aria-invalid={Boolean(err("categorie"))}
          >
            {CATEGORIES_EQUIPEMENT.map((c) => (
              <option key={c} value={c}>
                {LABEL_CATEGORIE_EQUIPEMENT[c]}
              </option>
            ))}
          </select>
          {DESCRIPTION_CATEGORIE[categorie] && (
            <p className="text-[0.82rem] text-muted-foreground">
              {DESCRIPTION_CATEGORIE[categorie]}
            </p>
          )}
          {err("categorie") && (
            <p className="text-sm text-destructive">{err("categorie")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="libelle">Libellé *</Label>
          <Input
            id="libelle"
            name="libelle"
            defaultValue={valeursInitiales?.libelle}
            required
            placeholder="Ex : TGBT principal, Hotte de la cuisine chaude"
            aria-invalid={Boolean(err("libelle"))}
          />
          {err("libelle") && (
            <p className="text-sm text-destructive">{err("libelle")}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="localisation" className="inline-flex items-center">
              Localisation
              <InfoTooltip>
                Facultatif. Ex : « sous-sol », « cuisine », « local technique
                RDC ». Utile au technicien lors de la vérification.
              </InfoTooltip>
            </Label>
            <Input
              id="localisation"
              name="localisation"
              defaultValue={valeursInitiales?.localisation ?? ""}
              placeholder="Ex : local technique RDC"
              aria-invalid={Boolean(err("localisation"))}
            />
            {err("localisation") && (
              <p className="text-sm text-destructive">{err("localisation")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateMiseEnService" className="inline-flex items-center">
              Date de mise en service
              <InfoTooltip>
                Facultatif. Si vous ne la connaissez pas, laissez vide —
                l&apos;outil se calera sur la première vérification à venir.
              </InfoTooltip>
            </Label>
            <Input
              id="dateMiseEnService"
              name="dateMiseEnService"
              type="date"
              defaultValue={toIsoDate(valeursInitiales?.dateMiseEnService)}
              aria-invalid={Boolean(err("dateMiseEnService"))}
            />
            {err("dateMiseEnService") && (
              <p className="text-sm text-destructive">
                {err("dateMiseEnService")}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombre" className="inline-flex items-center">
            Nombre d&apos;unités
            <InfoTooltip>
              Facultatif. Ex : 12 extincteurs, 3 BAES. À renseigner si vous
              en avez plusieurs du même type.
            </InfoTooltip>
          </Label>
          <Input
            id="nombre"
            name="nombre"
            type="number"
            min={1}
            defaultValue={valeursInitiales?.nombre ?? ""}
            className="sm:w-40"
            aria-invalid={Boolean(err("nombre"))}
          />
          {err("nombre") && (
            <p className="text-sm text-destructive">{err("nombre")}</p>
          )}
        </div>
      </section>

      {/* Caractéristiques spécifiques — dépliage conditionnel */}
      {(estElec || estAeration) && (
        <section className="cartouche overflow-hidden">
          <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Caractéristiques spécifiques
            </p>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
              Ces informations conditionnent la génération des vérifications
              réglementaires applicables (étape suivante).
            </p>
          </div>

          <div className="space-y-5 px-6 py-6 sm:px-8">
            {estElec && (
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="aGroupeElectrogene"
                  defaultChecked={valeursInitiales?.aGroupeElectrogene ?? false}
                  className="mt-1 size-4 rounded border-rule"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.95rem] font-semibold">
                    Groupe électrogène de sécurité présent
                  </p>
                  <p className="text-[0.82rem] text-muted-foreground">
                    Déclenche la vérification annuelle prévue par l&apos;art.
                    EL 20 du règlement ERP.
                  </p>
                </div>
              </label>
            )}

            {estAeration && (
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="estLocalPollutionSpecifique"
                  defaultChecked={
                    valeursInitiales?.estLocalPollutionSpecifique ?? false
                  }
                  className="mt-1 size-4 rounded border-rule"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.95rem] font-semibold">
                    Local à pollution spécifique
                  </p>
                  <p className="text-[0.82rem] text-muted-foreground">
                    Poussières, gaz, vapeurs, aérosols. Contrôle semestriel de
                    l&apos;efficacité du captage (arrêté 8 octobre 1987, art.
                    3 § II).
                  </p>
                </div>
              </label>
            )}

            {estVmc && (
              <div className="space-y-2">
                <Label
                  htmlFor="nbVehiculesParkingCouvert"
                  className="inline-flex items-center"
                >
                  Capacité parking couvert (véhicules)
                  <InfoTooltip>
                    À renseigner uniquement si la VMC ventile un parc de
                    stationnement couvert d&apos;un ERP. Au-dessus de 250
                    véhicules, contrôle annuel — sinon biennal (art. PS 32).
                  </InfoTooltip>
                </Label>
                <Input
                  id="nbVehiculesParkingCouvert"
                  name="nbVehiculesParkingCouvert"
                  type="number"
                  min={0}
                  defaultValue={
                    valeursInitiales?.nbVehiculesParkingCouvert ?? ""
                  }
                  className="sm:w-40"
                  aria-invalid={Boolean(err("nbVehiculesParkingCouvert"))}
                />
                {err("nbVehiculesParkingCouvert") && (
                  <p className="text-sm text-destructive">
                    {err("nbVehiculesParkingCouvert")}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="space-y-2">
        <Label htmlFor="notes">Notes internes</Label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={valeursInitiales?.notes ?? ""}
          rows={3}
          className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
          placeholder="Marque, modèle, références techniques, contact maintenance…"
        />
      </section>

      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      {state.status === "success" && (
        <p className="text-sm text-emerald-700">Enregistré.</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : libelleSubmit}
        </Button>
        {labelAnnuler && (
          <Link
            href={labelAnnuler.href}
            className={buttonVariants({ variant: "outline" })}
          >
            {labelAnnuler.libelle}
          </Link>
        )}
      </div>
    </form>
  );
}
