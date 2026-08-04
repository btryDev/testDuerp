"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  CATEGORIES_ERP,
  CLASSES_IGH,
  TYPE_ERP,
} from "@/lib/etablissements/schema";
import type { EtablissementActionState } from "@/lib/etablissements/actions";

const LABEL_TYPE_ERP: Record<(typeof TYPE_ERP)[number], string> = {
  M: "M · Magasin de vente, centre commercial",
  N: "N · Restaurant, débit de boissons",
  O: "O · Hôtel, pension de famille",
  L: "L · Salle de spectacle, conférence",
  P: "P · Salle de danse, salle de jeux",
  R: "R · Établissement d'enseignement, colonies",
  S: "S · Bibliothèque, centre de documentation",
  T: "T · Salle d'exposition",
  U: "U · Établissement de soins",
  V: "V · Établissement de culte",
  W: "W · Administration, banque, bureau",
  X: "X · Établissement sportif couvert",
  Y: "Y · Musée",
  PA: "PA · Établissement de plein air",
  CTS: "CTS · Chapiteau, tente, structure",
  SG: "SG · Structure gonflable",
  PS: "PS · Parc de stationnement couvert",
  REF: "REF · Refuge de montagne",
  GA: "GA · Gare accessible au public",
  OA: "OA · Hôtel-restaurant d'altitude",
  EF: "EF · Établissement flottant",
};

const LABEL_CATEGORIE_ERP: Record<(typeof CATEGORIES_ERP)[number], string> = {
  N1: "1ʳᵉ catégorie (> 1500 personnes)",
  N2: "2ᵉ catégorie (701 à 1500)",
  N3: "3ᵉ catégorie (301 à 700)",
  N4: "4ᵉ catégorie (jusqu'à 300, seuil du type)",
  N5: "5ᵉ catégorie (petits établissements, règles PE)",
};

const LABEL_CLASSE_IGH: Record<(typeof CLASSES_IGH)[number], string> = {
  GHA: "GHA · Habitation",
  GHW: "GHW · Bureaux",
  GHO: "GHO · Hôtel",
  GHR: "GHR · Enseignement",
  GHS: "GHS · Archives",
  GHU: "GHU · Sanitaire",
  GHZ: "GHZ · Mixte",
  ITGH: "ITGH · Immeuble de très grande hauteur",
};

type Valeurs = {
  raisonDisplay?: string;
  adresse?: string;
  codeNaf?: string | null;
  effectifSurSite?: number;
  estEtablissementTravail?: boolean;
  estERP?: boolean;
  estIGH?: boolean;
  estHabitation?: boolean;
  typeErp?: string | null;
  categorieErp?: string | null;
  classeIgh?: string | null;
};

type Props = {
  action: (
    prev: EtablissementActionState,
    formData: FormData,
  ) => Promise<EtablissementActionState>;
  valeursInitiales?: Valeurs;
  libelleSubmit: string;
  labelAnnuler?: { libelle: string; href: string };
};

export function EtablissementForm({
  action,
  valeursInitiales,
  libelleSubmit,
  labelAnnuler,
}: Props) {
  const [state, formAction, pending] = useActionState<
    EtablissementActionState,
    FormData
  >(action, { status: "idle" });

  // États locaux pour le dépliage conditionnel ERP/IGH — cohérence UI
  // immédiate sans tour serveur.
  const [estERP, setEstERP] = useState<boolean>(
    valeursInitiales?.estERP ?? false,
  );
  const [estIGH, setEstIGH] = useState<boolean>(
    valeursInitiales?.estIGH ?? false,
  );

  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ]?.[0] : undefined;

  return (
    <form action={formAction} className="space-y-8">
      {/* Identité */}
      <section className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="raisonDisplay">
            Nom de l&apos;établissement *
          </Label>
          <Input
            id="raisonDisplay"
            name="raisonDisplay"
            defaultValue={valeursInitiales?.raisonDisplay}
            required
            placeholder="Ex : Restaurant du Marché, Bureau de Nantes"
            aria-invalid={Boolean(err("raisonDisplay"))}
          />
          {err("raisonDisplay") && (
            <p className="text-sm text-destructive">{err("raisonDisplay")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="adresse">Adresse *</Label>
          <Input
            id="adresse"
            name="adresse"
            defaultValue={valeursInitiales?.adresse}
            required
            aria-invalid={Boolean(err("adresse"))}
          />
          {err("adresse") && (
            <p className="text-sm text-destructive">{err("adresse")}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="codeNaf" className="inline-flex items-center">
              Code NAF du site
              <InfoTooltip>
                Facultatif. Si vide, on utilise le code NAF de l&apos;entreprise.
                À renseigner si ce site a une activité distincte de celle du
                siège.
              </InfoTooltip>
            </Label>
            <Input
              id="codeNaf"
              name="codeNaf"
              defaultValue={valeursInitiales?.codeNaf ?? ""}
              placeholder="ex. 56.10A"
              aria-invalid={Boolean(err("codeNaf"))}
            />
            {err("codeNaf") && (
              <p className="text-sm text-destructive">{err("codeNaf")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="effectifSurSite">Effectif sur site *</Label>
            <Input
              id="effectifSurSite"
              name="effectifSurSite"
              type="number"
              min={0}
              defaultValue={valeursInitiales?.effectifSurSite}
              required
              aria-invalid={Boolean(err("effectifSurSite"))}
            />
            {err("effectifSurSite") && (
              <p className="text-sm text-destructive">
                {err("effectifSurSite")}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Régimes réglementaires */}
      <section className="cartouche overflow-hidden">
        <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
            Régimes réglementaires applicables
          </p>
          <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
            Cochez tous les régimes applicables — ils se cumulent.
            Par défaut, tout établissement ayant des salariés relève du
            Code du travail (art. R. 4121-1).
          </p>
        </div>

        <div className="space-y-5 px-6 py-6 sm:px-8">
          {/* Travail */}
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="estEtablissementTravail"
              defaultChecked={
                valeursInitiales?.estEtablissementTravail ?? true
              }
              className="mt-1 size-4 rounded border-rule"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[0.95rem] font-semibold">
                Établissement de travail
              </p>
              <p className="text-[0.82rem] text-muted-foreground">
                Au moins un salarié présent. Obligations DUERP + vérifications
                électriques / aération / incendie au titre du Code du travail.
              </p>
            </div>
          </label>

          {/* ERP */}
          <div className="space-y-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="estERP"
                checked={estERP}
                onChange={(e) => setEstERP(e.currentTarget.checked)}
                className="mt-1 size-4 rounded border-rule"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[0.95rem] font-semibold">
                  Établissement Recevant du Public (ERP)
                </p>
                <p className="text-[0.82rem] text-muted-foreground">
                  Accueille du public (clients, patients, visiteurs…).
                  Règlement de sécurité du 25 juin 1980 — obligations
                  supplémentaires selon type et catégorie.
                </p>
              </div>
            </label>

            {estERP && (
              <div className="ml-7 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="typeErp">Type ERP *</Label>
                  <select
                    id="typeErp"
                    name="typeErp"
                    defaultValue={valeursInitiales?.typeErp ?? ""}
                    required={estERP}
                    className="h-9 w-full rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm"
                    aria-invalid={Boolean(err("typeErp"))}
                  >
                    <option value="">— Sélectionner —</option>
                    {TYPE_ERP.map((t) => (
                      <option key={t} value={t}>
                        {LABEL_TYPE_ERP[t]}
                      </option>
                    ))}
                  </select>
                  {err("typeErp") && (
                    <p className="text-xs text-destructive">{err("typeErp")}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categorieErp" className="inline-flex items-center">
                    Catégorie *
                    <InfoTooltip>
                      La catégorie dépend du nombre total de personnes
                      (public + personnel) que peut accueillir
                      l&apos;établissement. En cas de doute, commencez par la
                      5ᵉ — vous ajusterez après vérification.
                    </InfoTooltip>
                  </Label>
                  <select
                    id="categorieErp"
                    name="categorieErp"
                    defaultValue={valeursInitiales?.categorieErp ?? ""}
                    required={estERP}
                    className="h-9 w-full rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm"
                    aria-invalid={Boolean(err("categorieErp"))}
                  >
                    <option value="">— Sélectionner —</option>
                    {CATEGORIES_ERP.map((c) => (
                      <option key={c} value={c}>
                        {LABEL_CATEGORIE_ERP[c]}
                      </option>
                    ))}
                  </select>
                  {err("categorieErp") && (
                    <p className="text-xs text-destructive">
                      {err("categorieErp")}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* IGH */}
          <div className="space-y-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="estIGH"
                checked={estIGH}
                onChange={(e) => setEstIGH(e.currentTarget.checked)}
                className="mt-1 size-4 rounded border-rule"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[0.95rem] font-semibold">
                  Immeuble de Grande Hauteur (IGH)
                </p>
                <p className="text-[0.82rem] text-muted-foreground">
                  Hauteur &gt; 28 m (habitation) ou &gt; 50 m (autres
                  activités). Arrêté du 30 décembre 2011 — rare en TPE/PME.
                </p>
              </div>
            </label>

            {estIGH && (
              <div className="ml-7">
                <div className="space-y-2">
                  <Label htmlFor="classeIgh">Classe IGH *</Label>
                  <select
                    id="classeIgh"
                    name="classeIgh"
                    defaultValue={valeursInitiales?.classeIgh ?? ""}
                    required={estIGH}
                    className="h-9 w-full rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm"
                    aria-invalid={Boolean(err("classeIgh"))}
                  >
                    <option value="">— Sélectionner —</option>
                    {CLASSES_IGH.map((c) => (
                      <option key={c} value={c}>
                        {LABEL_CLASSE_IGH[c]}
                      </option>
                    ))}
                  </select>
                  {err("classeIgh") && (
                    <p className="text-xs text-destructive">
                      {err("classeIgh")}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Habitation */}
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="estHabitation"
              defaultChecked={valeursInitiales?.estHabitation ?? false}
              className="mt-1 size-4 rounded border-rule"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[0.95rem] font-semibold">
                Immeuble d&apos;habitation
              </p>
              <p className="text-[0.82rem] text-muted-foreground">
                Logements collectifs. Code de la construction et de
                l&apos;habitation — paratonnerres, ramonage, ascenseurs.
              </p>
            </div>
          </label>
        </div>
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
