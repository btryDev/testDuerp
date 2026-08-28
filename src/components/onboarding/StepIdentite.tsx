"use client";

import { Check } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { ChampBoard, SectionChamps } from "@/components/ui-kit";
import { BlocCreux } from "@/components/ui-kit/fiche";
import { evaluerScopeSecteur } from "@/lib/onboarding/scope";
import type { StepProps } from "./types";

const SUGGESTIONS_NAF = [
  { code: "56.10A", libelle: "Restauration" },
  { code: "47.11B", libelle: "Alimentation" },
  { code: "70.22Z", libelle: "Conseil" },
  { code: "71.12B", libelle: "Ingénierie" },
];

/**
 * Étape 1 sur 3 — Identité juridique + lieu principal, réunies dans un seul
 * écran, une carte board par section.
 *
 * Les sections portaient une numérotation romaine (« § I », « § II ») : on
 * l'a retirée. Contrairement aux étapes du wizard, ces deux blocs se
 * remplissent dans l'ordre qu'on veut — la numérotation n'y portait aucune
 * information (cf. `SectionChamps`).
 */
export function StepIdentite({ state, update, errors }: StepProps) {
  const scope =
    state.codeNaf.trim().length > 0
      ? evaluerScopeSecteur(state.codeNaf)
      : null;
  const hintEffectif = hintPourEffectif(state.effectifSurSite);

  return (
    <div className="flex flex-col gap-[22px]">
      <div>
        <h2 className="board-titre m-0 text-[clamp(22px,2.2vw,27px)]">
          Décrivez votre établissement
        </h2>
        <p className="m-0 mt-2.5 max-w-[62ch] text-[14.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
          Ces informations servent à identifier vos obligations
          réglementaires — elles ne sont jamais partagées.
        </p>
      </div>

      {/* Chaque section prend la carte blanche du board : posé à même le
          canvas, le creux ardoise du `.champ-board` ne s'en détache plus
          (1,03:1) et les champs s'effacent. */}
      <section className="carte-board px-7 py-6 sm:px-8">
        <SectionChamps titre="Identité juridique">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            <ChampBoard
              className="sm:col-span-2"
              id="raisonSociale"
              name="raisonSociale"
              label="Raison sociale"
              requis
              value={state.raisonSociale}
              onChange={(e) => update({ raisonSociale: e.target.value })}
              placeholder="Ex : Bistrot du marché SARL"
              autoFocus
              erreur={errors?.raisonSociale}
            />

            <div>
              {/* L'infobulle est SORTIE du <label> : elle rend un <button>,
                  et un contrôle interactif dans un label vole le clic au
                  champ tout en entrant dans son nom accessible. */}
              <span className="flex items-center gap-1">
                <label className="label-board" htmlFor="siret">
                  SIRET
                </label>
                <InfoTooltip>
                  Le SIRET figurera en en-tête de vos documents officiels.
                </InfoTooltip>
              </span>
              <input
                className="champ-board"
                id="siret"
                name="siret"
                value={state.siret}
                onChange={(e) => update({ siret: e.target.value })}
                placeholder="812 456 789 00021"
                inputMode="numeric"
                pattern="\d{14}"
                aria-invalid={Boolean(errors?.siret)}
                aria-describedby={
                  errors?.siret ? "siret-aide siret-erreur" : "siret-aide"
                }
              />
              <p
                id="siret-aide"
                className="m-0 mt-1.5 text-[12px] leading-[1.5] text-[color:var(--board-slate-mid)]"
              >
                14 chiffres — facultatif
              </p>
              {errors?.siret && (
                <p
                  id="siret-erreur"
                  className="m-0 mt-1.5 text-[12.5px] text-[color:var(--board-signal-ink)]"
                >
                  {errors.siret}
                </p>
              )}
            </div>
          </div>
        </SectionChamps>
      </section>

      <section className="carte-board px-7 py-6 sm:px-8">
        <SectionChamps titre="Le site principal">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4">
            <ChampBoard
              id="adresseRue"
              name="adresseRue"
              label="Numéro et rue"
              requis
              value={state.adresseRue}
              onChange={(e) => update({ adresseRue: e.target.value })}
              placeholder="12 rue des Halles"
              autoComplete="street-address"
              erreur={errors?.adresse}
            />

            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-[160px_1fr]">
              <ChampBoard
                id="adresseCodePostal"
                name="adresseCodePostal"
                label="Code postal"
                requis
                value={state.adresseCodePostal}
                onChange={(e) =>
                  update({
                    adresseCodePostal: e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 5),
                  })
                }
                placeholder="75011"
                inputMode="numeric"
                pattern="\d{5}"
                maxLength={5}
                aria-invalid={Boolean(errors?.adresse)}
              />
              <ChampBoard
                id="adresseVille"
                name="adresseVille"
                label="Ville"
                requis
                value={state.adresseVille}
                onChange={(e) => update({ adresseVille: e.target.value })}
                placeholder="Paris"
                autoComplete="address-level2"
                aria-invalid={Boolean(errors?.adresse)}
              />
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <div>
                <span className="flex items-center gap-1">
                  <label className="label-board" htmlFor="codeNaf">
                    Code NAF *
                  </label>
                  <InfoTooltip>
                    Code INSEE qui figure sur votre avis de situation.
                    Détermine votre secteur et pré-remplit les risques types
                    pour le DUERP.
                  </InfoTooltip>
                </span>
                <input
                  className="champ-board uppercase"
                  id="codeNaf"
                  name="codeNaf"
                  required
                  value={state.codeNaf}
                  onChange={(e) =>
                    update({ codeNaf: e.target.value.toUpperCase() })
                  }
                  placeholder="56.10A"
                  aria-invalid={
                    Boolean(errors?.codeNaf) ||
                    scope?.status === "hors_perimetre"
                  }
                  // Les trois messages de ce champ lui sont chaînés, et non
                  // le seul premier : le panneau « secteur non couvert »
                  // annonce que l'inscription ne peut pas aboutir. Le champ
                  // passait « invalide » sans que rien ne dise pourquoi.
                  aria-describedby={
                    [
                      errors?.codeNaf ? "codeNaf-erreur" : null,
                      scope?.status === "ok" && !errors?.codeNaf
                        ? "codeNaf-secteur"
                        : null,
                      scope?.status === "hors_perimetre" && !errors?.codeNaf
                        ? "codeNaf-hors-perimetre"
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined
                  }
                />
                {errors?.codeNaf && (
                  <p
                    id="codeNaf-erreur"
                    className="m-0 mt-1.5 text-[12.5px] text-[color:var(--board-signal-ink)]"
                  >
                    {errors.codeNaf}
                  </p>
                )}
                {/* « Secteur reconnu » est un fait de saisie — ce que le code
                    tapé désigne —, pas un jugement de conformité : le vert du
                    board (« fait ») convient, et la coche évite que
                    l'information ne tienne qu'à la couleur. */}
                {scope?.status === "ok" && !errors?.codeNaf ? (
                  <p
                    id="codeNaf-secteur"
                    className="m-0 mt-1.5 flex items-center gap-1.5 text-[12.5px] text-[color:var(--board-green-ink)]"
                  >
                    <Check aria-hidden className="size-3.5" />
                    Secteur reconnu : {scope.secteurNom}
                  </p>
                ) : null}
                {scope?.status === "hors_perimetre" && !errors?.codeNaf ? (
                  <div
                    id="codeNaf-hors-perimetre"
                    role="alert"
                    className="mt-2 rounded-[18px] bg-[color:var(--board-signal-wash)] px-3.5 py-3 text-[12.5px] leading-[1.5] text-[color:var(--board-signal-ink)] shadow-[inset_0_0_0_1px_var(--board-signal-line)]"
                  >
                    <p className="m-0 font-semibold">
                      Secteur non couvert par la V2
                    </p>
                    <p className="m-0 mt-1">{scope.raison}</p>
                    <p className="m-0 mt-2">{scope.exemple}</p>
                  </div>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SUGGESTIONS_NAF.map((s) => (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => update({ codeNaf: s.code })}
                      className="rounded-full bg-[color:var(--board-slate-pale)] px-3 py-1 text-[12px] font-medium text-[color:var(--board-slate-mid)] transition-colors hover:bg-[color:var(--board-blue-pale)] hover:text-[color:var(--board-blue-ink)]"
                    >
                      {s.code} · {s.libelle}
                    </button>
                  ))}
                </div>
              </div>

              {/* Saisie en texte plutôt qu'en `type="number"` : la molette
                  d'un champ nombre modifie une valeur déjà saisie sans qu'on
                  s'en aperçoive (charte § 5). Les bornes restent tenues par
                  Zod côté serveur. */}
              <ChampBoard
                id="effectifSurSite"
                name="effectifSurSite"
                label="Effectif sur site"
                requis
                inputMode="numeric"
                value={state.effectifSurSite}
                onChange={(e) => update({ effectifSurSite: e.target.value })}
                placeholder="8"
                aide="Salariés + apprentis présents régulièrement"
                erreur={errors?.effectifSurSite}
              />

              <ChampBoard
                id="personnesPresentesHabituellement"
                name="personnesPresentesHabituellement"
                label="Personnes habituellement présentes"
                inputMode="numeric"
                value={state.personnesPresentesHabituellement}
                onChange={(e) =>
                  update({ personnesPresentesHabituellement: e.target.value })
                }
                placeholder="60"
                aide="Salariés + clients, élèves, patients, visiteurs réguliers, en même temps. Au-delà de 50 : alarme sonore, consigne affichée et exercices semestriels (R. 4227-34, -37, -39). Vide = l'effectif salarié est utilisé."
                erreur={errors?.personnesPresentesHabituellement}
              />

              <div>
                <label
                  className="label-board"
                  htmlFor="manipuleMatieresR422722"
                >
                  Produits explosifs, comburants ou extrêmement inflammables
                </label>
                <select
                  id="manipuleMatieresR422722"
                  name="manipuleMatieresR422722"
                  value={state.manipuleMatieresR422722}
                  onChange={(e) =>
                    update({
                      manipuleMatieresR422722: e.target.value as
                        | ""
                        | "oui"
                        | "non",
                    })
                  }
                  aria-describedby={
                    errors?.manipuleMatieresR422722
                      ? "manipuleMatieresR422722-aide manipuleMatieresR422722-erreur"
                      : "manipuleMatieresR422722-aide"
                  }
                  className="champ-board"
                >
                  <option value="">Je ne sais pas encore</option>
                  <option value="oui">Oui</option>
                  <option value="non">Non</option>
                </select>
                <p
                  id="manipuleMatieresR422722-aide"
                  className="m-0 mt-1.5 text-[12px] leading-[1.5] text-[color:var(--board-slate-mid)]"
                >
                  Manipulés ou mis en œuvre dans vos locaux — pas seulement
                  stockés (R. 4227-22). Si oui, l&apos;alarme, la consigne et
                  les exercices s&apos;appliquent quel que soit
                  l&apos;effectif.
                </p>
                {errors?.manipuleMatieresR422722 && (
                  <p
                    id="manipuleMatieresR422722-erreur"
                    className="m-0 mt-1.5 text-[12.5px] text-[color:var(--board-signal-ink)]"
                  >
                    {errors.manipuleMatieresR422722}
                  </p>
                )}
              </div>
            </div>

            {/* Rappel de seuil : un repère de lecture, pas un état. Le creux
                ardoise le pose sans lui prêter de couleur — un fond vert y
                dirait « fait », un fond ambre « attention ». */}
            {hintEffectif ? (
              <BlocCreux>
                <strong className="block text-[13.5px] font-semibold text-[color:var(--board-ink)]">
                  {hintEffectif.titre}
                </strong>
                <span className="mt-1 block max-w-[62ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
                  {hintEffectif.corps}
                </span>
              </BlocCreux>
            ) : null}
          </div>
        </SectionChamps>
      </section>
    </div>
  );
}

function hintPourEffectif(
  v: string,
): { titre: string; corps: string } | null {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 1) return null;
  if (n < 11) {
    return {
      titre: `${n} salarié${n > 1 ? "s" : ""}`,
      corps:
        "Seuil CSSCT (11+) non atteint — certaines obligations sont allégées (élections, consultation CSE).",
    };
  }
  if (n < 50) {
    return {
      titre: `${n} salariés`,
      corps:
        "Seuil CSSCT atteint — mise à jour annuelle du DUERP obligatoire, élection d'un CSE sous 12 mois.",
    };
  }
  return {
    titre: `${n} salariés`,
    corps:
      "Seuil 50+ — CSSCT dédiée, programme annuel de prévention à présenter au CSE, bilan HSCT.",
  };
}
