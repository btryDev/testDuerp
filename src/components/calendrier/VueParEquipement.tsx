"use client";

// LA VUE PAR ÉQUIPEMENT — les mêmes échéances, lues par appareil.
//
// La vue par mois répond à « que dois-je faire en août ? ». Celle-ci
// répond à « qu'est-ce que cette hotte me demande dans l'année, et qui
// doit le faire ? ». Même donnée, deux questions que les dirigeants ne
// posent pas au même moment : l'une quand ils organisent leur semaine,
// l'autre quand ils arbitrent un contrat de maintenance.
//
// L'instrument est celui de la vue annuelle, en réduction : douze cases,
// la couleur dit l'état. La hauteur, elle, disparaît — sur une ligne de
// 20 px elle ne dirait rien de fiable ; le compte passe donc en pilules,
// à droite.
//
// Ce que cette vue ne montre pas, et le dit : les échéances qui ne
// tiennent pas à un équipement (attestations de prestataires, analyses,
// travaux du plan d'actions). Elles n'ont pas d'appareil auquel se
// rattacher, et les inventer sous un équipement serait faux.
//
// Une case de mois s'ouvre : le détail se déplie SOUS la carte de
// l'appareil, à sa place. Renvoyer vers la vue par mois ferait perdre
// l'appareil qu'on était en train de regarder — or la question posée
// ici, c'est « et celui-là, qu'est-ce qu'il me demande en août ? ».

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { StatutVerification } from "@prisma/client";
import { BadgeStatut } from "@/components/calendrier/BadgeStatut";
import { MOIS_FR, MOIS_FR_COURT } from "@/lib/calendrier/labels";
import {
  CHAMP_ETAT,
  ENCRE_ETAT,
  type EtatEcheance,
  type RegistreLigne,
} from "@/lib/calendrier/etats";

/** État d'un mois pour un équipement — le plus urgent qu'il porte. */
export type EtatMois = EtatEcheance | null;

export type LigneEquipement = {
  id: string;
  libelle: string;
  categorie: string;
  /** Douze cases, de janvier à décembre de l'année affichée. */
  mois: EtatMois[];
  enRetard: number;
  proche: number;
  aVenir: number;
  faite: number;
  aPlanifier: number;
  /** La prochaine échéance non réalisée, si elle existe. */
  prochaine: { libelle: string; etat: EtatMois } | null;
  /** Les occurrences de l'année, pour le dépli d'un mois. */
  occurrences: OccurrenceEquipement[];
};

/**
 * Une occurrence, mise à plat côté serveur : ce composant s'exécute dans
 * le navigateur, il ne peut recevoir ni date ni composant — seulement des
 * chaînes déjà formatées dans le bon fuseau.
 */
export type OccurrenceEquipement = {
  id: string;
  href: string;
  /** Mois civil, de 1 à 12. */
  mois: number;
  jour: string;
  moisCourt: string;
  titre: string;
  meta: string;
  etat: RegistreLigne;
  statut: StatutVerification;
};

export function VueParEquipement({
  annee,
  moisCourant,
  lignes,
  etablissementId,
  sansEquipement,
  sansEcheance,
}: {
  annee: number;
  /** Mois civil courant, de 1 à 12 — le mois déplié d'emblée. */
  moisCourant: number;
  lignes: LigneEquipement[];
  etablissementId: string;
  /** Échéances qui ne tiennent à aucun équipement. */
  sansEquipement: number;
  /** Équipements déclarés qui n'ont aucune échéance cette année. */
  sansEcheance: number;
}) {
  if (lignes.length === 0) {
    return (
      <section className="rounded-[30px] bg-[color:var(--board-slate-pale)] px-6 py-7">
        <p className="m-0 text-[15px] font-semibold tracking-[-0.015em] text-[color:var(--board-ink)]">
          Aucun équipement ne porte d&apos;échéance
        </p>
        <p className="m-0 mt-2 max-w-[560px] text-[13.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
          Les vérifications périodiques se rattachent aux appareils que vous
          déclarez. Cette lecture se remplira en même temps que votre parc.
        </p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {lignes.map((l) => (
        <CarteEquipement
          key={l.id}
          ligne={l}
          moisCourant={moisCourant}
          etablissementId={etablissementId}
        />
      ))}

      {/* Ce que la lecture par appareil laisse forcément dehors. Le taire
          ferait croire que le parc porte toute la conformité. */}
      {sansEquipement > 0 || sansEcheance > 0 ? (
        <p className="m-0 mt-1 text-[12.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
          {sansEcheance > 0
            ? `${sansEcheance} équipement${sansEcheance > 1 ? "s" : ""} déclaré${sansEcheance > 1 ? "s" : ""} sans aucune échéance en ${annee}.`
            : ""}
          {sansEquipement > 0
            ? `${sansEcheance > 0 ? " " : ""}${sansEquipement} échéance${sansEquipement > 1 ? "s" : ""} ne tien${sansEquipement > 1 ? "nent" : "t"} à aucun appareil — attestations, analyses, travaux — et n'apparaî${sansEquipement > 1 ? "ssent" : "t"} que dans la vue par mois.`
            : ""}
        </p>
      ) : null}
    </div>
  );
}

function CarteEquipement({
  ligne: l,
  moisCourant,
  etablissementId,
}: {
  ligne: LigneEquipement;
  moisCourant: number;
  etablissementId: string;
}) {
  // Mois déplié, de 1 à 12. Un seul à la fois : la carte doit rester une
  // ligne de lecture, pas un second calendrier.
  //
  // À l'arrivée, c'est le mois courant qui s'ouvre — la question qu'on se
  // pose devant un appareil, c'est d'abord « et ce mois-ci ? ». Mais
  // seulement s'il porte quelque chose : un mois vide ouvrirait un tiroir
  // sur rien, et la case surlignée annoncerait un contenu absent.
  const [moisOuvert, setMoisOuvert] = useState<number | null>(
    l.occurrences.some((o) => o.mois === moisCourant) ? moisCourant : null,
  );
  const details = l.occurrences.filter((o) => o.mois === moisOuvert);

  return (
        <article
          className="rounded-[30px] bg-[color:var(--board-card)] px-[26px] py-[22px] shadow-[0_1px_2px_rgba(13,18,36,.04),0_12px_32px_-14px_rgba(13,18,36,.10)] ring-1 ring-[color:rgba(13,18,36,.06)]"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-6">
            <div className="min-w-0 lg:w-[290px] lg:flex-none">
              <p className="m-0 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--board-slate-soft)]">
                {l.categorie}
              </p>
              <h3 className="board-titre m-0 mt-1.5 text-[18px]">
                {l.libelle}
              </h3>
            </div>

            {/* La réduction de la règle : une case par mois. */}
            <div className="min-w-0 flex-1">
              <div className="grid grid-cols-12 gap-1">
                {l.mois.map((etat, i) => {
                  const mois = i + 1;
                  const nb = l.occurrences.filter(
                    (o) => o.mois === mois,
                  ).length;
                  const ouvert = moisOuvert === mois;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={nb === 0}
                      aria-expanded={nb > 0 ? ouvert : undefined}
                      aria-label={`${MOIS_FR[i]} — ${
                        nb === 0
                          ? "aucune échéance"
                          : `${nb} échéance${nb > 1 ? "s" : ""}`
                      }`}
                      onClick={() => setMoisOuvert(ouvert ? null : mois)}
                      className={
                        "h-[18px] rounded-[5px] transition-shadow " +
                        (nb === 0
                          ? "cursor-default"
                          : "cursor-pointer hover:shadow-[0_0_0_2px_var(--board-card),0_0_0_3px_rgba(10,10,10,.2)]") +
                        (ouvert
                          ? " shadow-[0_0_0_2px_var(--board-card),0_0_0_4px_var(--board-ink)]"
                          : "")
                      }
                      style={{
                        background: etat
                          ? CHAMP_ETAT[etat]
                          : "var(--board-slate-pale)",
                      }}
                    />
                  );
                })}
              </div>
              <div className="mt-1.5 grid grid-cols-12 gap-1 border-t border-[color:var(--board-slate-line)] pt-1.5">
                {MOIS_FR_COURT.map((m, i) => (
                  <span
                    key={m}
                    className={
                      "text-center font-mono text-[9.5px] uppercase tracking-[0.06em] " +
                      (moisOuvert === i + 1
                        ? "font-semibold text-[color:var(--board-ink)]"
                        : l.mois[i]
                          ? "text-[color:var(--board-slate-ink)]"
                          : "text-[color:var(--board-slate)]")
                    }
                  >
                    {m.slice(0, 1)}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 lg:w-[230px] lg:flex-none lg:justify-end">
              <div className="text-left lg:text-right">
                <p className="m-0 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[color:var(--board-slate-soft)]">
                  Prochaine
                </p>
                <p
                  className="m-0 mt-1 text-[13.5px] font-semibold"
                  style={{
                    color: l.prochaine?.etat
                      ? ENCRE_ETAT[l.prochaine.etat]
                      : "var(--board-slate-ink)",
                  }}
                >
                  {l.prochaine ? l.prochaine.libelle : "Rien de prévu"}
                </p>
              </div>
              <Link
                href={`/etablissements/${etablissementId}/equipements/${l.id}/modifier`}
                aria-label={`Ouvrir ${l.libelle}`}
                className="flex size-[34px] flex-none items-center justify-center rounded-full border border-[color:rgba(10,10,10,.16)] text-[color:var(--board-ink)] transition-colors hover:bg-[color:var(--board-blue-pale)]"
              >
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-[color:var(--board-slate-line)] pt-3.5">
            <Compte n={l.enRetard} libelle="dépassée" registre="enRetard" />
            <Compte n={l.proche} libelle="sous 30 j" registre="proche" />
            <Compte n={l.aVenir} libelle="à venir" registre="aVenir" />
            <Compte n={l.faite} libelle="faite" registre="faite" />
            <Compte n={l.aPlanifier} libelle="à planifier" registre={null} />
          </div>

          {/* Le mois déplié, à sa place : sous l'appareil, pas ailleurs. */}
          {moisOuvert && details.length > 0 ? (
            <div className="mt-4 rounded-[22px] bg-[color:var(--board-slate-pale)] px-4 py-3.5">
              <p className="m-0 mb-2 px-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[color:var(--board-slate-mid)]">
                {MOIS_FR[moisOuvert - 1]} · {details.length} échéance
                {details.length > 1 ? "s" : ""}
              </p>
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {details.map((o) => (
                  <li key={o.id}>
                    <Link
                      href={o.href}
                      className="flex items-center gap-3.5 rounded-[16px] bg-[color:var(--board-card)] px-3.5 py-2.5 transition-opacity hover:opacity-85"
                    >
                      <span
                        className="flex size-[42px] flex-none flex-col items-center justify-center rounded-[14px]"
                        style={{
                          background: CHAMP_ETAT[o.etat],
                        }}
                      >
                        <span className="board-titre text-[15px] leading-none tabular-nums">
                          {o.jour}
                        </span>
                        <span className="mt-0.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.1em] text-[color:var(--board-slate-ink)]">
                          {o.moisCourt}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-semibold tracking-[-0.01em] text-[color:var(--board-ink)]">
                          {o.titre}
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] text-[color:var(--board-slate-mid)]">
                          {o.meta}
                        </span>
                      </span>
                      <BadgeStatut statut={o.statut} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
    </article>
  );
}

function Compte({
  n,
  libelle,
  registre,
}: {
  n: number;
  libelle: string;
  /** `null` : « à planifier », qui n'est pas un état de la même famille. */
  registre: EtatEcheance | null;
}) {
  if (n === 0) return null;
  const cle: RegistreLigne = registre ?? "aPlanifier";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-[6px] text-[12px] font-semibold leading-none"
      style={{ background: CHAMP_ETAT[cle], color: ENCRE_ETAT[cle] }}
    >
      <span className="tabular-nums">{n}</span>
      {libelle}
      {n > 1 && libelle.endsWith("e") ? "s" : ""}
    </span>
  );
}
