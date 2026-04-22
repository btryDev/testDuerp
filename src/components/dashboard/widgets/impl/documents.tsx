"use client";

// Widget « Vos documents » — hub consolidé.
// Une ligne par document (DUERP, Registre, Plan d'actions, Dossier
// consolidé). Chaque ligne affiche un chip « à faire » contextuel
// (si pertinent) + bouton Voir + bouton Télécharger.

import Link from "next/link";
import {
  Download,
  FileCheck2,
  FileStack,
  ListChecks,
  Package,
  type LucideIcon,
} from "lucide-react";
import { BentoCell } from "@/components/dashboard/BentoCell";
import type { DashboardBundle } from "../types";

type Ligne = {
  titre: string;
  meta: string;
  Icon: LucideIcon;
  voirHref?: string;
  telechargerHref?: string;
  aFaire?: { libelle: string; tone: "warn" | "alerte" | "ok" };
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
        : "pas encore initié",
      Icon: FileCheck2,
      voirHref: duerpDernier ? `/duerp/${duerpDernier.id}` : undefined,
      telechargerHref: duerpDernier
        ? `/duerp/${duerpDernier.id}/pdf/preview`
        : undefined,
      aFaire:
        !dashboard.duerp.estAJour && dashboard.duerp.existe
          ? { libelle: "À mettre à jour", tone: "warn" }
          : undefined,
    },
    {
      titre: "Registre de sécurité",
      meta:
        nbRapports === 0
          ? "aucun rapport"
          : `${nbRapports} rapport${nbRapports > 1 ? "s" : ""} déposé${nbRapports > 1 ? "s" : ""}`,
      Icon: FileStack,
      voirHref: `/etablissements/${etablissementId}/registre`,
      telechargerHref: `/api/etablissements/${etablissementId}/registre/pdf`,
    },
    {
      titre: "Plan d'actions",
      meta:
        actionsACouvrir === 0
          ? "rien à lever"
          : `${actionsACouvrir} ouverte${actionsACouvrir > 1 ? "s" : ""}${actionsEnRetard > 0 ? ` · ${actionsEnRetard} en retard` : ""}`,
      Icon: ListChecks,
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
      titre: "Dossier consolidé",
      meta: "DUERP + Registre + Actions en 1 PDF · 30 secondes",
      Icon: Package,
      telechargerHref: `/api/etablissements/${etablissementId}/dossier-conformite/pdf`,
    },
  ];

  return (
    <BentoCell kicker="Vos documents">
      <ul className="flex flex-col">
        {lignes.map((l) => (
          <LigneDoc key={l.titre} ligne={l} />
        ))}
      </ul>
    </BentoCell>
  );
}

function LigneDoc({ ligne }: { ligne: Ligne }) {
  const { titre, meta, Icon, voirHref, telechargerHref, aFaire } = ligne;

  return (
    <li className="grid grid-cols-[40px_1fr_auto] items-center gap-4 border-b border-dashed border-rule-soft py-3.5 last:border-b-0">
      <div className="flex size-10 items-center justify-center rounded-xl bg-paper-sunk">
        <Icon aria-hidden className="size-4.5 text-ink/80" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[0.95rem] font-medium tracking-[-0.01em]">
          {titre}
        </p>
        <p className="mt-0.5 truncate text-[0.76rem] text-muted-foreground">
          {meta}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {aFaire ? (
          <span
            className={
              aFaire.tone === "alerte"
                ? "pill-alerte"
                : aFaire.tone === "warn"
                  ? "pill-warn"
                  : "pill-ok"
            }
          >
            {aFaire.libelle}
          </span>
        ) : null}
        {voirHref ? (
          <Link
            href={voirHref}
            className="rounded-md border border-rule bg-transparent px-2.5 py-1.5 text-[0.76rem] transition-colors hover:border-ink"
          >
            Voir
          </Link>
        ) : null}
        {telechargerHref ? (
          <Link
            href={telechargerHref}
            className="inline-flex items-center gap-1 rounded-md bg-ink px-2.5 py-1.5 text-[0.76rem] font-medium text-paper-elevated transition-colors hover:bg-[color:color-mix(in_oklch,var(--ink)_85%,var(--accent-vif))]"
            target={telechargerHref.startsWith("/api/") ? "_blank" : undefined}
            rel={telechargerHref.startsWith("/api/") ? "noopener noreferrer" : undefined}
          >
            <Download aria-hidden className="size-3" />
            PDF
          </Link>
        ) : null}
      </div>
    </li>
  );
}
