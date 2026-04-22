"use client";

// Widgets « simples » sans variant — plan d'actions, registre, équipements,
// DUERP, guide, recos. Chacun est une cellule bento ciblée.

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BentoCell } from "@/components/dashboard/BentoCell";
import type { DashboardBundle } from "../types";

function formatDateCourte(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

/* ─── Plan d'actions ────────────────────────────────────── */

export function WidgetPlanActions({ bundle }: { bundle: DashboardBundle }) {
  const { actionsEnCours, etablissementId, dashboard } = bundle;
  const actionsACouvrir =
    dashboard.compteurs.actionsOuvertes + dashboard.compteurs.actionsEnCours;
  const actionsEnRetard = dashboard.compteurs.actionsEnRetard;
  return (
    <BentoCell
      kicker="Plan d'actions"
      sub={
        actionsACouvrir === 0
          ? "Rien à lever"
          : `${actionsACouvrir} ouverte${actionsACouvrir > 1 ? "s" : ""}${actionsEnRetard > 0 ? ` · ${actionsEnRetard} en retard` : ""}`
      }
      more={
        actionsEnCours.length > 0
          ? {
              href: `/etablissements/${etablissementId}/actions`,
              label: "Plan complet",
            }
          : undefined
      }
    >
      {actionsEnCours.length === 0 ? (
        <p className="text-[0.88rem] text-muted-foreground">
          Aucune action en cours ✓
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {actionsEnCours.map((a) => {
            const enRetard =
              a.echeance != null && a.echeance < new Date();
            return (
              <li
                key={a.id}
                className="grid grid-cols-[86px_1fr_auto] items-center gap-3 rounded-lg bg-paper-sunk px-3 py-2.5"
              >
                <span className={enRetard ? "pill-alerte" : "pill-warn"}>
                  {enRetard ? "En retard" : "En cours"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[0.88rem] font-medium">
                    {a.libelle}
                  </p>
                  {a.echeance ? (
                    <p className="truncate text-[0.74rem] text-muted-foreground">
                      échéance {formatDateCourte(a.echeance)}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </BentoCell>
  );
}

/* ─── Registre ──────────────────────────────────────────── */

function PillResultat({
  resultat,
}: {
  resultat:
    | "conforme"
    | "observations_mineures"
    | "ecart_majeur"
    | "non_verifiable";
}) {
  if (resultat === "conforme") return <span className="pill-ok">OK</span>;
  if (resultat === "observations_mineures")
    return <span className="pill-warn">Observations</span>;
  if (resultat === "ecart_majeur")
    return <span className="pill-alerte">Écart majeur</span>;
  return <span className="pill-warn">Non vérifiable</span>;
}

export function WidgetRegistre({ bundle }: { bundle: DashboardBundle }) {
  const { rapportsRecents, etablissementId } = bundle;
  return (
    <BentoCell
      kicker="Registre — dernières entrées"
      more={{
        href: `/etablissements/${etablissementId}/registre`,
        label: "Ouvrir",
      }}
    >
      {rapportsRecents.length === 0 ? (
        <p className="text-[0.88rem] text-muted-foreground">
          Aucun rapport déposé pour l&apos;instant.
        </p>
      ) : (
        <table className="w-full border-collapse text-[0.88rem]">
          <thead>
            <tr className="border-b border-rule-soft text-left font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
              <th className="py-2 font-medium">Date</th>
              <th className="py-2 font-medium">Document</th>
              <th className="py-2 text-right font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rapportsRecents.map((r) => (
              <tr
                key={r.id}
                className="border-b border-dashed border-rule-soft last:border-b-0"
              >
                <td className="py-2.5 font-mono text-[0.82rem] text-muted-foreground">
                  {formatDateCourte(r.dateRapport)}
                </td>
                <td className="truncate py-2.5">
                  {r.verification.libelleObligation}
                </td>
                <td className="py-2.5 text-right">
                  <PillResultat resultat={r.resultat} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </BentoCell>
  );
}

/* ─── Équipements ───────────────────────────────────────── */

function libelleCategorie(c: string): string {
  return c.replace(/_/g, " ").toLowerCase();
}

type PastilleStatut =
  | { libelle: string; tone: "alerte" | "warn" | "ok" }
  | null;

/**
 * Règle de priorité pour afficher UNE pastille pertinente par carte
 * équipement (on évite la surcharge visuelle) :
 *  1. Retard → « N en retard » alerte
 *  2. À planifier → « N à planifier » warn
 *  3. Sous 30 j → « Sous Nj » warn
 *  4. Vérifié récemment → « À jour » ok
 *  5. Aucune stat → null
 */
function pastillePrincipale(stats: {
  enRetard: number;
  aPlanifier: number;
  sous30j: number;
  derniereRealisee: Date | null;
  prochaineDate: Date | null;
}): PastilleStatut {
  if (stats.enRetard > 0) {
    return {
      libelle: `${stats.enRetard} en retard`,
      tone: "alerte",
    };
  }
  if (stats.aPlanifier > 0) {
    return {
      libelle: `${stats.aPlanifier} à planifier`,
      tone: "warn",
    };
  }
  if (stats.prochaineDate && stats.sous30j > 0) {
    const jours = Math.max(
      0,
      Math.round(
        (stats.prochaineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    );
    return { libelle: `Sous ${jours} j`, tone: "warn" };
  }
  if (stats.derniereRealisee) {
    return { libelle: "À jour", tone: "ok" };
  }
  return null;
}

export function WidgetEquipements({ bundle }: { bundle: DashboardBundle }) {
  const { equipements, etablissementId } = bundle;
  return (
    <BentoCell
      kicker={`Équipements déclarés · ${equipements.length}`}
      more={{
        href: `/etablissements/${etablissementId}/equipements`,
        label: "Gérer",
      }}
    >
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {equipements.slice(0, 8).map((eq) => {
          const pastille = eq.stats ? pastillePrincipale(eq.stats) : null;
          return (
            <Link
              key={eq.id}
              href={`/etablissements/${etablissementId}/equipements`}
              className="flex min-h-[96px] flex-col justify-between gap-2 rounded-lg border border-rule-soft bg-paper-sunk p-3 transition-all hover:-translate-y-0.5 hover:border-ink"
            >
              <div className="flex flex-col gap-1">
                <strong className="line-clamp-2 text-[0.84rem] font-medium leading-tight">
                  {eq.libelle}
                </strong>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
                  {libelleCategorie(eq.categorie)}
                </span>
              </div>
              {pastille ? (
                <span
                  className={
                    "w-fit self-start " +
                    (pastille.tone === "alerte"
                      ? "pill-alerte"
                      : pastille.tone === "warn"
                        ? "pill-warn"
                        : "pill-ok")
                  }
                >
                  {pastille.libelle}
                </span>
              ) : (
                <span className="inline-flex w-fit items-center self-start rounded-full border border-rule-soft bg-paper-elevated px-2 py-0.5 font-mono text-[0.62rem] text-muted-foreground">
                  Aucune vérif
                </span>
              )}
            </Link>
          );
        })}
        <Link
          href={`/etablissements/${etablissementId}/equipements/nouveau`}
          className="flex min-h-[96px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-rule bg-transparent p-3 text-center text-muted-foreground transition-colors hover:border-[color:var(--accent-vif)] hover:bg-[color:var(--accent-vif-soft)] hover:text-[color:var(--accent-vif)]"
        >
          <span className="text-xl leading-none">+</span>
          <strong className="text-[0.82rem] font-medium">
            Ajouter un équipement
          </strong>
        </Link>
      </div>
    </BentoCell>
  );
}

/* ─── DUERP ─────────────────────────────────────────────── */

export function WidgetDuerp({ bundle }: { bundle: DashboardBundle }) {
  const { duerpDernier } = bundle;
  if (!duerpDernier) {
    return (
      <BentoCell kicker="DUERP">
        <p className="text-[0.88rem] text-muted-foreground">
          Pas encore initié. Il se crée automatiquement dès la première
          unité de travail évaluée.
        </p>
      </BentoCell>
    );
  }
  const derniereVersion = duerpDernier.versions[0];
  return (
    <BentoCell kicker="DUERP">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[0.95rem] font-medium">
            Document Unique d&apos;Évaluation des Risques
          </p>
          <p className="mt-0.5 text-[0.78rem] text-muted-foreground">
            {derniereVersion
              ? `v${derniereVersion.numero} du ${derniereVersion.createdAt.toLocaleDateString("fr-FR")}`
              : "En cours — pas encore validé"}
          </p>
        </div>
        <Link
          href={`/duerp/${duerpDernier.id}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Ouvrir →
        </Link>
      </div>
    </BentoCell>
  );
}

/* ─── Guide pédagogique (entrée) ────────────────────────── */

export function WidgetGuide({ bundle }: { bundle: DashboardBundle }) {
  const { etablissementId } = bundle;
  return (
    <Link
      href={`/etablissements/${etablissementId}/guide`}
      className="group relative flex items-center justify-between gap-6 rounded-2xl border border-[color:color-mix(in_oklch,var(--accent-vif)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--accent-vif)_5%,var(--paper-elevated))] px-6 py-5 transition-colors hover:border-[color:var(--accent-vif)]"
    >
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[color:var(--accent-vif)]">
          Guide · Comprendre vos obligations
        </p>
        <p className="mt-1.5 text-[1.05rem] font-medium tracking-[-0.015em]">
          Que demande vraiment la loi, et comment l&apos;outil vous aide
          à la tenir ?
        </p>
        <p className="mt-1 max-w-[60ch] text-[0.86rem] leading-[1.55] text-muted-foreground">
          Les quatre obligations structurantes, le rythme annuel, les
          rôles — expliqués sans jargon, avec les références Légifrance.
        </p>
      </div>
      <span
        aria-hidden
        className="shrink-0 text-[color:var(--accent-vif)] transition-transform group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}

/* ─── Recommandations (optionnel, masqué par défaut) ────── */

export function WidgetRecos({ bundle }: { bundle: DashboardBundle }) {
  const recos = bundle.dashboard.recommandations.slice(0, 3);
  return (
    <BentoCell kicker="À faire en priorité" count={recos.length}>
      {recos.length === 0 ? (
        <p className="text-[0.88rem] text-muted-foreground">
          Aucune action prioritaire pour l&apos;instant — tout est à jour. ✓
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {recos.map((r, i) => {
            const tone =
              r.kind === "verif_depassee" || r.kind === "action_en_retard"
                ? "alerte"
                : r.kind === "verif_proche" || r.kind === "action_proche"
                  ? "warn"
                  : "info";
            const bgClass =
              tone === "alerte"
                ? "border-l-[color:var(--minium)] bg-[color:color-mix(in_oklch,var(--minium)_4%,var(--paper-sunk))]"
                : tone === "warn"
                  ? "border-l-[color:oklch(0.72_0.15_70)] bg-[oklch(0.98_0.03_75)]"
                  : "border-l-[color:var(--accent-vif)] bg-paper-sunk";
            const dotColor =
              tone === "alerte"
                ? "var(--minium)"
                : tone === "warn"
                  ? "oklch(0.72 0.15 70)"
                  : "var(--accent-vif)";
            return (
              <li
                key={i}
                className={
                  "grid grid-cols-[10px_1fr_auto] items-center gap-3.5 rounded-lg border-l-[3px] px-3.5 py-3 " +
                  bgClass
                }
              >
                <span
                  aria-hidden
                  className="size-2.5 rounded-full"
                  style={{ background: dotColor }}
                />
                <div className="min-w-0">
                  <strong className="block truncate text-[0.9rem] font-medium">
                    {r.titre}
                  </strong>
                  {r.sousTitre ? (
                    <em className="mt-0.5 block truncate text-[0.76rem] not-italic text-muted-foreground">
                      {r.sousTitre}
                    </em>
                  ) : null}
                </div>
                <Link
                  href={r.href}
                  className="rounded-md bg-ink px-3 py-1.5 text-[0.78rem] text-paper-elevated transition-colors hover:bg-[color:color-mix(in_oklch,var(--ink)_85%,var(--accent-vif))]"
                >
                  Ouvrir →
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </BentoCell>
  );
}
