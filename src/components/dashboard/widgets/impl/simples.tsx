"use client";

// Widgets « simples » sans variant — registre, équipements, DUERP, guide,
// recos. Chacun est une cellule bento ciblée.
//
// Le plan d'actions a migré vers `impl/board.tsx` (rendu en anneau) lors
// de la refonte du tableau de bord ; il garde le même id de registre.

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BentoCell } from "@/components/dashboard/BentoCell";
import { CarteBoard } from "@/components/dashboard/widgets/impl/board";
import { PictoEquipement } from "@/components/equipements/PictoEquipement";
import type { DashboardBundle } from "../types";

function formatDateCourte(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
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

/** Mini-pastille de signal sur tuile glacier : fond blanc, point de
 *  marque saturée + texte encré. Le champ pastel (rose, vert) ne se pose
 *  pas sur le glacier — trop proche en valeur — donc c'est la marque qui
 *  porte la couleur, conformément à la règle de la charte pervenche. */
function PastilleTuile({
  point,
  encre,
  children,
}: {
  point?: string;
  encre: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--board-card)] px-2.5 py-[5px] text-[10.5px] font-semibold"
      style={{ color: encre }}
    >
      {point ? (
        <span
          aria-hidden
          className="size-[7px] rounded-full"
          style={{ background: point }}
        />
      ) : null}
      {children}
    </span>
  );
}

export function WidgetEquipements({ bundle }: { bundle: DashboardBundle }) {
  const { equipements, etablissementId } = bundle;
  const totalEq = equipements.length;
  const tuiles = equipements.slice(0, 8);
  const nbRestants = totalEq - tuiles.length;

  return (
    <CarteBoard className="gap-6 px-7 py-[26px]">
      <div className="flex items-start gap-4">
        <div className="min-w-0">
          <h2 className="m-0 text-[26px] font-semibold leading-[1.1] tracking-[-0.035em] text-[color:var(--board-ink)]">
            Équipements
          </h2>
          <p className="mt-[7px] text-[13.5px] text-[color:var(--board-slate-mid)]">
            {totalEq} type{totalEq > 1 ? "s" : ""} déclaré
            {totalEq > 1 ? "s" : ""}
            {nbRestants > 0 ? ` · ${nbRestants} autres non affichés` : ""}
          </p>
        </div>
        <div className="ml-auto flex flex-none items-center gap-2.5">
          <Link
            href={`/etablissements/${etablissementId}/equipements/nouveau`}
            className="rounded-full bg-[color:var(--board-ink)] px-4 py-2.5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-85"
          >
            + Ajouter
          </Link>
          <Link
            href={`/etablissements/${etablissementId}/equipements`}
            aria-label="Gérer les équipements"
            className="flex size-9 flex-none items-center justify-center rounded-full border border-[color:rgba(10,10,10,.16)] text-[color:var(--board-ink)] transition-colors hover:bg-[color:var(--board-blue-pale)]"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      {totalEq === 0 ? (
        <p className="text-[13.5px] text-[color:var(--board-slate-mid)]">
          Aucun équipement déclaré pour l&apos;instant.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {tuiles.map((eq) => {
            const s = eq.stats;
            const fait = s?.derniereRealisee ? 1 : 0;
            const retard = s?.enRetard ?? 0;
            const aPlanif = s?.aPlanifier ?? 0;
            const totalSignals = fait + retard + aPlanif;
            const pct = totalSignals
              ? Math.round(100 * (fait / totalSignals))
              : 0;
            const alert = retard > 0;
            return (
              <Link
                key={eq.id}
                href={`/etablissements/${etablissementId}/equipements`}
                className="group flex min-h-[118px] overflow-hidden rounded-[20px] bg-[color:var(--board-blue-pale)] transition-colors hover:bg-[color:color-mix(in_oklch,var(--board-blue-pale)_70%,var(--board-blue-soft))]"
              >
                <div className="flex w-[84px] flex-none items-center justify-center">
                  <PictoEquipement
                    categorie={eq.categorie}
                    taille={60}
                    className="transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col py-4 pr-4">
                  <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--board-blue-ink)]">
                    {libelleCategorie(eq.categorie)}
                  </p>
                  <p className="mt-1 text-[14.5px] font-semibold leading-[1.25] text-[color:var(--board-ink)]">
                    {eq.libelle}
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <div
                      className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-[color:var(--board-card)]"
                      aria-hidden
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: alert
                            ? "var(--board-signal-mark)"
                            : "var(--board-blue-strong)",
                        }}
                      />
                    </div>
                    <span className="font-mono text-[10.5px] tabular-nums text-[color:var(--board-slate-soft)]">
                      {pct}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {fait > 0 ? (
                      <PastilleTuile
                        point="var(--board-green)"
                        encre="var(--board-green-ink)"
                      >
                        {fait} fait
                      </PastilleTuile>
                    ) : null}
                    {retard > 0 ? (
                      <PastilleTuile
                        point="var(--board-signal-mark)"
                        encre="var(--board-signal-ink)"
                      >
                        {retard} dépassé{retard > 1 ? "s" : ""}
                      </PastilleTuile>
                    ) : null}
                    {aPlanif > 0 ? (
                      <PastilleTuile encre="var(--board-slate-mid)">
                        {aPlanif} à planif.
                      </PastilleTuile>
                    ) : null}
                    {!fait && !retard && !aPlanif ? (
                      <PastilleTuile encre="var(--board-slate-soft)">
                        Aucune vérif
                      </PastilleTuile>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </CarteBoard>
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
