"use client";

// Widget « Vos documents » — hub consolidé.
// Une ligne par document (DUERP, Registre, Plan d'actions, Dossier
// consolidé). Chaque ligne affiche un chip « à faire » contextuel
// (si pertinent) + bouton Voir + bouton Télécharger. Si le DUERP
// n'existe pas encore, un bouton « Commencer → » déclenche la
// création via la server action `creerDuerp`.

import { useTransition } from "react";
import Link from "next/link";
import { creerDuerp } from "@/lib/duerps/actions";
import type { DashboardBundle } from "../types";

type Ligne = {
  titre: string;
  meta: string;
  voirHref?: string;
  telechargerHref?: string;
  aFaire?: { libelle: string; tone: "warn" | "alerte" | "ok" };
  /** CTA primaire de substitution quand l'entité n'existe pas encore
   *  (ex. DUERP pas initié). Rendu en priorité sur Voir/Télécharger. */
  commencer?: {
    libelle: string;
    onStart: () => Promise<void>;
  };
};

export function WidgetDocuments({ bundle }: { bundle: DashboardBundle }) {
  const { etablissementId, nbRapports, duerpDernier, dashboard } = bundle;
  const actionsACouvrir =
    dashboard.compteurs.actionsOuvertes + dashboard.compteurs.actionsEnCours;
  const actionsEnRetard = dashboard.compteurs.actionsEnRetard;

  const lignes: Ligne[] = [
    {
      titre: "DUERP",
      meta: duerpDernier
        ? duerpDernier.versions[0]
          ? `v${duerpDernier.versions[0].numero} du ${duerpDernier.versions[0].createdAt.toLocaleDateString("fr-FR")}`
          : "en cours — pas encore validé"
        : "pas encore initié — à faire",
      voirHref: duerpDernier ? `/duerp/${duerpDernier.id}` : undefined,
      telechargerHref: duerpDernier
        ? `/duerp/${duerpDernier.id}/pdf/preview`
        : undefined,
      aFaire: duerpDernier
        ? !dashboard.duerp.estAJour && dashboard.duerp.existe
          ? { libelle: "À mettre à jour", tone: "warn" }
          : undefined
        : { libelle: "À faire", tone: "alerte" },
      commencer: duerpDernier
        ? undefined
        : {
            libelle: "Commencer",
            onStart: () => creerDuerp(etablissementId),
          },
    },
    {
      titre: "Registre de sécurité",
      meta:
        nbRapports === 0
          ? "aucun rapport"
          : `${nbRapports} rapport${nbRapports > 1 ? "s" : ""} déposé${nbRapports > 1 ? "s" : ""}`,
      voirHref: `/etablissements/${etablissementId}/registre`,
      telechargerHref: `/api/etablissements/${etablissementId}/registre/pdf`,
    },
    {
      titre: "Plan d'actions",
      meta:
        actionsACouvrir === 0
          ? "rien à lever"
          : `${actionsACouvrir} ouverte${actionsACouvrir > 1 ? "s" : ""}${actionsEnRetard > 0 ? ` · ${actionsEnRetard} en retard` : ""}`,
      voirHref: `/etablissements/${etablissementId}/actions`,
      telechargerHref: `/api/etablissements/${etablissementId}/plan-actions/pdf`,
      aFaire:
        actionsEnRetard > 0
          ? {
              libelle: `${actionsEnRetard} en retard`,
              tone: "alerte",
            }
          : actionsACouvrir > 0
            ? {
                libelle: `${actionsACouvrir} à lever`,
                tone: "warn",
              }
            : undefined,
    },
    {
      titre: "Dossier de conformité",
      meta: "DUERP + Registre + Actions · PDF complet",
      telechargerHref: `/api/etablissements/${etablissementId}/dossier-conformite/pdf`,
    },
  ];

  return (
    <section className="bento-cell">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="v2-title">Vos documents</h3>
          <p className="v2-subtitle">
            DUERP, registre, plan d&apos;actions, dossier complet
          </p>
        </div>
        <Link
          href={`/api/etablissements/${etablissementId}/dossier-conformite/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/75 hover:text-ink"
        >
          Tout télécharger ↓
        </Link>
      </header>

      <ul className="flex flex-col">
        {lignes.map((l, i) => (
          <LigneDoc key={l.titre} ligne={l} first={i === 0} />
        ))}
      </ul>
    </section>
  );
}

function LigneDoc({ ligne, first }: { ligne: Ligne; first: boolean }) {
  const { titre, meta, voirHref, telechargerHref, aFaire, commencer } = ligne;
  const [pending, startTransition] = useTransition();

  return (
    <li
      className="grid grid-cols-[auto_1fr_auto] items-center gap-3.5 py-3"
      style={{ borderTop: first ? "0" : "1px dashed var(--rule)" }}
    >
      {/* Icône feuille stylisée — coin replié + lignes mono */}
      <div
        aria-hidden
        className="relative flex h-[48px] w-[40px] flex-col justify-end gap-0.5 rounded-[6px] bg-paper-elevated p-1.5"
        style={{ boxShadow: "0 0 0 1px var(--rule), 0 1px 2px rgba(0,0,0,0.02)" }}
      >
        <span
          className="absolute right-[3px] top-[3px] block h-2 w-2"
          style={{
            borderTop: "1px solid var(--rule)",
            borderLeft: "1px solid var(--rule)",
            background: "var(--paper-sunk)",
          }}
        />
        <span className="block h-0.5 bg-paper-sunk" />
        <span className="block h-0.5 w-[70%] bg-paper-sunk" />
        <span className="block h-0.5 bg-paper-sunk" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[13.5px] font-medium tracking-[-0.005em]">
          {titre}
        </p>
        <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
          {meta}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {aFaire ? (
          <span
            className={
              aFaire.tone === "alerte"
                ? "pill-v2 pill-v2-alert"
                : aFaire.tone === "warn"
                  ? "pill-v2 pill-v2-amber"
                  : "pill-v2 pill-v2-green"
            }
          >
            {aFaire.libelle}
          </span>
        ) : null}
        {commencer ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await commencer.onStart();
              });
            }}
            className="inline-flex items-center gap-1 rounded-md bg-[color:var(--navy)] px-3 py-1.5 text-[0.78rem] font-medium text-white transition-colors hover:bg-[color:color-mix(in_oklch,var(--navy)_88%,black)] disabled:opacity-60"
          >
            {pending ? "…" : `${commencer.libelle} →`}
          </button>
        ) : null}
        {voirHref ? (
          <Link
            href={voirHref}
            className="inline-flex h-[30px] items-center rounded-lg px-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/75 transition-colors hover:bg-paper-sunk hover:text-ink"
          >
            Voir
          </Link>
        ) : null}
        {telechargerHref ? (
          <Link
            href={telechargerHref}
            className="inline-flex h-[30px] items-center rounded-lg px-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/75 transition-colors hover:bg-paper-sunk hover:text-ink"
            target={telechargerHref.startsWith("/api/") ? "_blank" : undefined}
            rel={
              telechargerHref.startsWith("/api/")
                ? "noopener noreferrer"
                : undefined
            }
            aria-label={`Télécharger ${titre}`}
          >
            ↓
          </Link>
        ) : null}
      </div>
    </li>
  );
}
