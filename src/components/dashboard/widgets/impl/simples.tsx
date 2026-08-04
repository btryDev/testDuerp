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

  const sub =
    actionsACouvrir === 0
      ? "Rien à lever"
      : `${actionsACouvrir} ouverte${actionsACouvrir > 1 ? "s" : ""}${actionsEnRetard > 0 ? ` · ${actionsEnRetard} en retard` : ""}`;

  return (
    <section className="bento-cell">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="v2-title">Plan d&apos;actions</h3>
          <p className="v2-subtitle">
            Actions correctives en cours · triées par échéance
          </p>
        </div>
        {actionsEnCours.length > 0 ? (
          <Link
            href={`/etablissements/${etablissementId}/actions`}
            className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/75 hover:text-ink"
          >
            Voir les {actionsACouvrir} ↗
          </Link>
        ) : null}
      </header>

      {actionsEnCours.length === 0 ? (
        <p className="text-[0.88rem] text-muted-foreground">
          Aucune action en cours ✓ · {sub}
        </p>
      ) : (
        <ul className="flex flex-col">
          {actionsEnCours.map((a, i) => {
            const enRetard = a.echeance != null && a.echeance < new Date();
            const tone = enRetard ? "alert" : "amber";
            const color =
              tone === "alert" ? "var(--alert)" : "var(--amber)";
            return (
              <li
                key={a.id}
                style={{
                  borderTop: i === 0 ? "0" : "1px dashed var(--rule)",
                }}
              >
                <Link
                  href={`/etablissements/${etablissementId}/actions/${a.id}`}
                  className="grid grid-cols-[auto_1fr] items-start gap-3 rounded-md py-3 transition-colors hover:bg-paper-sunk"
                >
                  <div
                    aria-hidden
                    className="grid size-[26px] place-items-center rounded-md"
                    style={{ border: `1px dashed ${color}` }}
                  >
                    <span
                      className="inline-block size-1.5 rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium leading-[1.3]">
                      {a.libelle}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="pill-v2 pill-v2-neutral">
                        {a.statut === "en_cours" ? "En cours" : "Ouverte"}
                      </span>
                      {a.echeance ? (
                        <span className="font-mono text-[11px] text-muted-foreground">
                          échéance ·{" "}
                          <strong className="text-ink/75">
                            {formatDateCourte(a.echeance)}
                          </strong>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
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
                className="group cursor-pointer border-b border-dashed border-rule-soft transition-colors last:border-b-0 hover:bg-paper-sunk"
              >
                <td className="py-2.5 font-mono text-[0.82rem] text-muted-foreground">
                  <Link
                    href={`/etablissements/${etablissementId}/verifications/${r.verificationId}`}
                    className="block"
                    aria-label={`Ouvrir ${r.verification.libelleObligation}`}
                  >
                    {formatDateCourte(r.dateRapport)}
                  </Link>
                </td>
                <td className="truncate py-2.5">
                  <Link
                    href={`/etablissements/${etablissementId}/verifications/${r.verificationId}`}
                    className="block group-hover:underline"
                  >
                    {r.verification.libelleObligation}
                  </Link>
                </td>
                <td className="py-2.5 text-right">
                  <Link
                    href={`/etablissements/${etablissementId}/verifications/${r.verificationId}`}
                    className="inline-block"
                  >
                    <PillResultat resultat={r.resultat} />
                  </Link>
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

export function WidgetEquipements({ bundle }: { bundle: DashboardBundle }) {
  const { equipements, etablissementId } = bundle;
  const totalEq = equipements.length;
  const tuiles = equipements.slice(0, 8);
  const nbRestants = totalEq - tuiles.length;

  return (
    <section className="bento-cell">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="v2-title">Équipements</h3>
          <p className="v2-subtitle">
            {totalEq} type{totalEq > 1 ? "s" : ""} déclaré
            {totalEq > 1 ? "s" : ""}
            {nbRestants > 0 ? ` · ${nbRestants} autres non affichés` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/etablissements/${etablissementId}/equipements`}
            className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/75 hover:text-ink"
          >
            Gérer ↗
          </Link>
          <Link
            href={`/etablissements/${etablissementId}/equipements/nouveau`}
            className="inline-flex h-[30px] items-center gap-1.5 rounded-lg border border-rule bg-paper-elevated px-2.5 text-[12px] transition-colors hover:bg-paper-sunk"
          >
            + Ajouter
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tuiles.map((eq) => {
          const s = eq.stats;
          const fait = s?.derniereRealisee ? 1 : 0;
          const retard = s?.enRetard ?? 0;
          const aPlanif = s?.aPlanifier ?? 0;
          const totalSignals = fait + retard + aPlanif;
          const pct = totalSignals ? Math.round(100 * (fait / totalSignals)) : 0;
          const alert = retard > 0;
          return (
            <Link
              key={eq.id}
              href={`/etablissements/${etablissementId}/equipements`}
              className="v2-equip-tile"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {libelleCategorie(eq.categorie)}
                </span>
                <span aria-hidden className="text-[0.78rem] text-ink/50">
                  ↗
                </span>
              </div>
              <div className="text-[14px] font-medium leading-[1.25]">
                {eq.libelle}
              </div>
              <div className="mt-auto flex items-center gap-2">
                <div
                  className="v2-bar-track flex-1"
                  style={{ height: 4 }}
                  aria-hidden
                >
                  <div
                    className="v2-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: alert ? "var(--alert)" : "var(--navy)",
                    }}
                  />
                </div>
                <span className="font-mono text-[10.5px] tabular-nums text-muted-foreground">
                  {pct}%
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {fait > 0 ? (
                  <span className="pill-v2 pill-v2-green">{fait} fait</span>
                ) : null}
                {retard > 0 ? (
                  <span className="pill-v2 pill-v2-alert">
                    {retard} dépassé{retard > 1 ? "s" : ""}
                  </span>
                ) : null}
                {aPlanif > 0 ? (
                  <span className="pill-v2 pill-v2-dashed">
                    {aPlanif} à planif.
                  </span>
                ) : null}
                {!fait && !retard && !aPlanif ? (
                  <span className="pill-v2 pill-v2-dashed">Aucune vérif</span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
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

/* ─── Guide pédagogique (carte sombre V2) ───────────────── */

const GUIDE_ETAPES = [
  { k: "01", t: "Déclarer les équipements soumis à contrôle" },
  { k: "02", t: "Planifier les vérifications périodiques" },
  { k: "03", t: "Consigner chaque rapport au registre" },
  { k: "04", t: "Tenir le DUERP à jour (au moins 1 fois / an)" },
];

export function WidgetGuide({ bundle }: { bundle: DashboardBundle }) {
  const { etablissementId } = bundle;
  return (
    <section
      className="relative flex flex-col gap-3 overflow-hidden rounded-[14px] px-6 py-[22px]"
      style={{ background: "var(--ink)", color: "#fff" }}
    >
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/55">
        Guide pédagogique
      </p>
      <h3 className="max-w-[320px] text-[18px] font-semibold leading-[1.2] tracking-[-0.015em]">
        Ce qu&apos;on attend de vous,
        <br />
        <span
          className="italic"
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            fontWeight: 400,
            color: "#9AB7FF",
          }}
        >
          par obligation légale.
        </span>
      </h3>
      <ul className="mt-1 flex flex-col gap-2">
        {GUIDE_ETAPES.map((x) => (
          <li
            key={x.k}
            className="grid grid-cols-[auto_1fr] items-center gap-2.5 rounded-[10px] px-2.5 py-2"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <span
              className="font-mono tabular-nums text-[11px]"
              style={{ color: "#9AB7FF", letterSpacing: "0.08em" }}
            >
              {x.k}
            </span>
            <span className="text-[13px]" style={{ color: "#D4DAE6" }}>
              {x.t}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href={`/etablissements/${etablissementId}/guide`}
        className="mt-2 inline-flex h-[34px] w-fit items-center gap-1.5 rounded-[10px] bg-white px-3.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-white/90"
      >
        Lire le guide complet →
      </Link>
    </section>
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
