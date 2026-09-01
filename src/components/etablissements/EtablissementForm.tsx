"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChampBoard, SectionChamps } from "@/components/ui-kit";
import {
  CATEGORIES_ERP,
  CLASSES_IGH,
  TYPE_ERP,
} from "@/lib/etablissements/schema";
import { CHOIX_FAMILLES_HABITATION } from "@/lib/onboarding/deduction-erp";
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

/** La case à cocher du board : encre pleine à l'état coché, filet d'ardoise. */
const CASE_A_COCHER =
  "mt-0.5 size-4 flex-none rounded border-[color:var(--board-slate)] accent-[color:var(--board-ink)]";

/** Le message de validation, à l'encre du signal et jamais en `destructive`. */
function Erreur({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="m-0 mt-1.5 text-[12.5px] text-[color:var(--board-signal-ink)]">
      {message}
    </p>
  );
}

type Valeurs = {
  raisonDisplay?: string;
  adresse?: string;
  codeNaf?: string | null;
  effectifSurSite?: number;
  personnesPresentesHabituellement?: number | null;
  manipuleMatieresR422722?: boolean | null;
  estEtablissementTravail?: boolean;
  estERP?: boolean;
  estIGH?: boolean;
  estHabitation?: boolean;
  typeErp?: string | null;
  categorieErp?: string | null;
  natureActivite?: string | null;
  effectifPublicAdmis?: number | null;
  dateAutorisationOuverture?: string | null;
  dateCertificatConformite?: string | null;
  classeIgh?: string | null;
  familleHabitation?: string | null;
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
  const [estHabitation, setEstHabitation] = useState<boolean>(
    valeursInitiales?.estHabitation ?? false,
  );
  const [estIGH, setEstIGH] = useState<boolean>(
    valeursInitiales?.estIGH ?? false,
  );

  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ]?.[0] : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {/* Identité */}
      <section className="flex flex-col gap-5">
        <ChampBoard
          id="raisonDisplay"
          name="raisonDisplay"
          label="Nom de l'établissement"
          requis
          defaultValue={valeursInitiales?.raisonDisplay}
          placeholder="Ex : Restaurant du Marché, Bureau de Nantes"
          erreur={err("raisonDisplay")}
        />

        <ChampBoard
          id="adresse"
          name="adresse"
          label="Adresse"
          requis
          defaultValue={valeursInitiales?.adresse}
          erreur={err("adresse")}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ChampBoard
            id="codeNaf"
            name="codeNaf"
            label="Code NAF du site"
            defaultValue={valeursInitiales?.codeNaf ?? ""}
            placeholder="ex. 56.10A"
            aide="Facultatif. Si vide, on utilise le code NAF de l'entreprise. À renseigner si ce site a une activité distincte de celle du siège."
            erreur={err("codeNaf")}
          />

          <ChampBoard
            id="effectifSurSite"
            name="effectifSurSite"
            label="Effectif sur site"
            requis
            // Un champ `type="number"` change de valeur à la molette, sur une
            // saisie déjà faite et sans que rien ne le signale. Le contrôle de
            // borne reste au serveur, où il est de toute façon rejoué.
            type="text"
            inputMode="numeric"
            defaultValue={valeursInitiales?.effectifSurSite}
            erreur={err("effectifSurSite")}
          />

          {/* Fiche « Renseignements généraux » du registre de sécurité
              (CCH R. 143-44). La donnée vit ici, le registre la lit — il ne
              la recopie pas, sans quoi les deux écrans divergeraient. */}
          <div className="sm:col-span-2">
            <label className="label-board" htmlFor="natureActivite">
              Nature de l&apos;activité
            </label>
            <textarea
              id="natureActivite"
              name="natureActivite"
              rows={2}
              defaultValue={valeursInitiales?.natureActivite ?? ""}
              className="champ-board"
              aria-invalid={Boolean(err("natureActivite"))}
              aria-describedby="natureActivite-aide"
            />
            <p
              id="natureActivite-aide"
              className="m-0 mt-1.5 text-[12px] leading-[1.5] text-[color:var(--board-slate-mid)]"
            >
              Ce que l&apos;on fait ici, en clair — pas le code NAF. Cette
              phrase figure au registre de sécurité.
            </p>
            <Erreur message={err("natureActivite")} />
          </div>

          {/* Champ de R. 4227-34 CT : alarme sonore → consigne → exercices
              semestriels. Deux questions distinctes de l'effectif salarié. */}
          <ChampBoard
            className="sm:col-span-2"
            id="personnesPresentesHabituellement"
            name="personnesPresentesHabituellement"
            label="Personnes habituellement présentes (salariés + public)"
            type="text"
            inputMode="numeric"
            defaultValue={
              valeursInitiales?.personnesPresentesHabituellement ?? ""
            }
            aide="Salariés, clients, élèves, patients, visiteurs réguliers — tous ceux qui se trouvent habituellement dans vos locaux en même temps. Au-delà de 50, le Code du travail impose une alarme sonore, une consigne incendie affichée et des exercices tous les six mois (art. R. 4227-34, R. 4227-37, R. 4227-39). Laissez vide si vous ne savez pas : l'effectif salarié sera utilisé."
            erreur={err("personnesPresentesHabituellement")}
          />

          <div className="sm:col-span-2">
            <label className="label-board" htmlFor="manipuleMatieresR422722">
              Manipulez-vous des produits explosifs, comburants ou extrêmement
              inflammables ?
            </label>
            <select
              id="manipuleMatieresR422722"
              name="manipuleMatieresR422722"
              className="champ-board"
              aria-describedby="manipuleMatieresR422722-aide"
              defaultValue={
                valeursInitiales?.manipuleMatieresR422722 === true
                  ? "oui"
                  : valeursInitiales?.manipuleMatieresR422722 === false
                    ? "non"
                    : ""
              }
            >
              <option value="">Je ne sais pas encore</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
            <p
              id="manipuleMatieresR422722-aide"
              className="m-0 mt-1.5 max-w-[66ch] text-[12px] leading-[1.5] text-[color:var(--board-slate-mid)]"
            >
              Produits classés explosifs, comburants ou extrêmement inflammables
              (art. R. 4227-22 du Code du travail), manipulés ou mis en œuvre
              dans vos locaux — pas seulement stockés. Si oui, l&apos;alarme
              sonore, la consigne et les exercices semestriels s&apos;appliquent
              quel que soit l&apos;effectif.
            </p>
          </div>
        </div>
      </section>

      {/* Régimes réglementaires — le filet suffit à séparer : une carte dans
          une carte poserait un second rayon 30 au milieu du premier. */}
      <div className="border-t border-[color:var(--board-slate-line)] pt-7">
        <SectionChamps
          titre="Régimes réglementaires applicables"
          chapeau="Cochez tous les régimes applicables — ils se cumulent. Par défaut, tout établissement ayant des salariés relève du Code du travail (art. R. 4121-1)."
        >
          <div className="flex flex-col gap-5">
            {/* Travail */}
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="estEtablissementTravail"
                defaultChecked={
                  valeursInitiales?.estEtablissementTravail ?? true
                }
                className={CASE_A_COCHER}
              />
              <div className="min-w-0 flex-1">
                <p className="m-0 text-[14px] font-semibold leading-[1.35] text-[color:var(--board-ink)]">
                  Établissement de travail
                </p>
                <p className="m-0 mt-1 max-w-[66ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
                  Au moins un salarié présent. Obligations DUERP + vérifications
                  électriques / aération / incendie au titre du Code du travail.
                </p>
              </div>
            </label>

            {/* ERP */}
            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="estERP"
                  checked={estERP}
                  onChange={(e) => setEstERP(e.currentTarget.checked)}
                  className={CASE_A_COCHER}
                />
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[14px] font-semibold leading-[1.35] text-[color:var(--board-ink)]">
                    Établissement Recevant du Public (ERP)
                  </p>
                  <p className="m-0 mt-1 max-w-[66ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
                    Accueille du public (clients, patients, visiteurs…).
                    Règlement de sécurité du 25 juin 1980 — obligations
                    supplémentaires selon type et catégorie.
                  </p>
                </div>
              </label>

              {estERP && (
                <div className="ml-7 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label-board" htmlFor="typeErp">
                      Type ERP *
                    </label>
                    <select
                      id="typeErp"
                      name="typeErp"
                      defaultValue={valeursInitiales?.typeErp ?? ""}
                      required={estERP}
                      className="champ-board"
                      aria-invalid={Boolean(err("typeErp"))}
                    >
                      <option value="">— Sélectionner —</option>
                      {TYPE_ERP.map((t) => (
                        <option key={t} value={t}>
                          {LABEL_TYPE_ERP[t]}
                        </option>
                      ))}
                    </select>
                    <Erreur message={err("typeErp")} />
                  </div>

                  <div>
                    <label className="label-board" htmlFor="categorieErp">
                      Catégorie *
                    </label>
                    <select
                      id="categorieErp"
                      name="categorieErp"
                      defaultValue={valeursInitiales?.categorieErp ?? ""}
                      required={estERP}
                      className="champ-board"
                      aria-invalid={Boolean(err("categorieErp"))}
                      aria-describedby="categorieErp-aide"
                    >
                      <option value="">— Sélectionner —</option>
                      {CATEGORIES_ERP.map((c) => (
                        <option key={c} value={c}>
                          {LABEL_CATEGORIE_ERP[c]}
                        </option>
                      ))}
                    </select>
                    {/* La règle du classement se lit en clair sous le champ :
                        une infobulle n'existe pas au doigt. */}
                    <p
                      id="categorieErp-aide"
                      className="m-0 mt-1.5 max-w-[66ch] text-[12px] leading-[1.5] text-[color:var(--board-slate-mid)]"
                    >
                      La catégorie dépend du nombre total de personnes (public +
                      personnel) que peut accueillir l&apos;établissement. En
                      cas de doute, commencez par la 5ᵉ — vous ajusterez après
                      vérification.
                    </p>
                    <Erreur message={err("categorieErp")} />
                  </div>

                  {/* Fiche « Établissement recevant du public » du registre de
                      sécurité (CCH R. 143-44). Trois faits que seul
                      l'exploitant détient — le registre les lit ici. */}
                  <ChampBoard
                    className="sm:col-span-2"
                    id="effectifPublicAdmis"
                    name="effectifPublicAdmis"
                    label="Effectif du public susceptible d'être admis"
                    type="text"
                    inputMode="numeric"
                    defaultValue={valeursInitiales?.effectifPublicAdmis ?? ""}
                    aide="Le chiffre retenu à votre classement ERP — distinct de votre effectif salarié et des personnes présentes."
                    erreur={err("effectifPublicAdmis")}
                  />

                  <ChampBoard
                    id="dateAutorisationOuverture"
                    name="dateAutorisationOuverture"
                    label="Autorisation d'ouverture donnée le"
                    type="date"
                    defaultValue={
                      valeursInitiales?.dateAutorisationOuverture ?? ""
                    }
                    erreur={err("dateAutorisationOuverture")}
                  />

                  <ChampBoard
                    id="dateCertificatConformite"
                    name="dateCertificatConformite"
                    label="Certificat de conformité délivré le"
                    type="date"
                    defaultValue={
                      valeursInitiales?.dateCertificatConformite ?? ""
                    }
                    erreur={err("dateCertificatConformite")}
                  />
                </div>
              )}
            </div>

            {/* IGH */}
            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="estIGH"
                  checked={estIGH}
                  onChange={(e) => setEstIGH(e.currentTarget.checked)}
                  className={CASE_A_COCHER}
                />
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[14px] font-semibold leading-[1.35] text-[color:var(--board-ink)]">
                    Immeuble de Grande Hauteur (IGH)
                  </p>
                  <p className="m-0 mt-1 max-w-[66ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
                    Hauteur &gt; 28 m (habitation) ou &gt; 50 m (autres
                    activités). Arrêté du 30 décembre 2011 — rare en TPE/PME.
                  </p>
                </div>
              </label>

              {estIGH && (
                <div className="ml-7">
                  <div className="max-w-sm">
                    <label className="label-board" htmlFor="classeIgh">
                      Classe IGH *
                    </label>
                    <select
                      id="classeIgh"
                      name="classeIgh"
                      defaultValue={valeursInitiales?.classeIgh ?? ""}
                      required={estIGH}
                      className="champ-board"
                      aria-invalid={Boolean(err("classeIgh"))}
                    >
                      <option value="">— Sélectionner —</option>
                      {CLASSES_IGH.map((c) => (
                        <option key={c} value={c}>
                          {LABEL_CLASSE_IGH[c]}
                        </option>
                      ))}
                    </select>
                    <Erreur message={err("classeIgh")} />
                  </div>
                </div>
              )}
            </div>

            {/* Habitation */}
            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="estHabitation"
                  checked={estHabitation}
                  onChange={(e) => setEstHabitation(e.currentTarget.checked)}
                  className={CASE_A_COCHER}
                />
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[14px] font-semibold leading-[1.35] text-[color:var(--board-ink)]">
                    Immeuble d&apos;habitation
                  </p>
                  <p className="m-0 mt-1 max-w-[66ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
                    Logements collectifs. Code de la construction et de
                    l&apos;habitation — paratonnerres, ramonage, ascenseurs.
                  </p>
                </div>
              </label>

              {estHabitation && (
                <div className="ml-7">
                  <div className="max-w-sm">
                    <label className="label-board" htmlFor="familleHabitation">
                      Famille d&apos;habitation
                    </label>
                    <select
                      id="familleHabitation"
                      name="familleHabitation"
                      defaultValue={valeursInitiales?.familleHabitation ?? ""}
                      className="champ-board"
                      aria-invalid={Boolean(err("familleHabitation"))}
                    >
                      <option value="">— Sélectionner —</option>
                      {CHOIX_FAMILLES_HABITATION.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                    {/* Sans astérisque, et sans `required` : ce formulaire sert
                        aussi à modifier un dossier créé avant le 2026-09-01,
                        qui n'a pas de famille. L'exiger ici bloquerait toute
                        modification — y compris celles qui n'ont rien à voir —
                        tant que le dirigeant ne l'a pas retrouvée. Le dossier
                        le lui demande ailleurs, en permanence. */}
                    <p className="m-0 mt-1.5 text-[12px] leading-[1.5] text-[color:var(--board-slate-mid)]">
                      Arrêté du 31 janvier 1986. Le classement figure au dossier
                      de l&apos;immeuble ; votre syndic ou votre bureau de
                      contrôle vous le donne.
                    </p>
                    <Erreur message={err("familleHabitation")} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </SectionChamps>
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <p className="m-0 text-[12.5px] text-[color:var(--board-signal-ink)]">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p className="m-0 text-[12.5px] text-[color:var(--board-green-ink)]">
          Enregistré.
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="board" size="board" disabled={pending}>
          {pending ? "Enregistrement…" : libelleSubmit}
        </Button>
        {labelAnnuler && (
          <Link
            href={labelAnnuler.href}
            className={buttonVariants({
              variant: "boardClair",
              size: "board",
            })}
          >
            {labelAnnuler.libelle}
          </Link>
        )}
      </div>
    </form>
  );
}
