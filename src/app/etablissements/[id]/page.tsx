import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";
import {
  OnboardingChecklist,
  type EtapeOnboarding,
} from "@/components/layout/OnboardingChecklist";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { BentoCell } from "@/components/dashboard/BentoCell";
import {
  BarsObligations,
  LegendeBarsObligations,
} from "@/components/dashboard/BarsObligations";
import { getEtablissement } from "@/lib/etablissements/queries";
import { listerEquipementsDeLEtablissement } from "@/lib/equipements/queries";
import {
  compterObligationsParMois,
  getDashboardData,
} from "@/lib/dashboard/queries";
import { getOptionalUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/prisma";
import type { Recommandation } from "@/lib/dashboard/recommandations";

function regimes(etab: {
  estEtablissementTravail: boolean;
  estERP: boolean;
  estIGH: boolean;
  estHabitation: boolean;
  typeErp: string | null;
  categorieErp: string | null;
  classeIgh: string | null;
}): string[] {
  const out: string[] = [];
  if (etab.estEtablissementTravail) out.push("Établissement de travail");
  if (etab.estERP)
    out.push(
      `ERP ${etab.typeErp ?? ""}${
        etab.categorieErp ? ` · cat. ${etab.categorieErp.slice(1)}` : ""
      }`.trim(),
    );
  if (etab.estIGH) out.push(`IGH ${etab.classeIgh ?? ""}`.trim());
  if (etab.estHabitation) out.push("Habitation");
  return out;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function tonePourReco(
  kind: Recommandation["kind"],
): "alerte" | "warn" | "info" {
  if (kind === "verif_depassee" || kind === "action_en_retard")
    return "alerte";
  if (kind === "verif_proche" || kind === "action_proche") return "warn";
  return "info";
}

export default async function EtablissementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  const [
    equipements,
    dashboard,
    barsData,
    nbVerifs,
    nbRapports,
    prochainesVerifs,
    actionsEnCours,
    rapportsRecents,
    user,
  ] = await Promise.all([
    listerEquipementsDeLEtablissement(id),
    getDashboardData(id),
    compterObligationsParMois(id),
    prisma.verification.count({ where: { etablissementId: id } }),
    prisma.rapportVerification.count({ where: { etablissementId: id } }),
    prisma.verification.findMany({
      where: {
        etablissementId: id,
        statut: { in: ["a_planifier", "planifiee", "depassee"] },
      },
      include: { equipement: true },
      orderBy: { datePrevue: "asc" },
      take: 5,
    }),
    prisma.action.findMany({
      where: {
        etablissementId: id,
        statut: { in: ["ouverte", "en_cours"] },
      },
      orderBy: [{ echeance: "asc" }, { criticite: "desc" }],
      take: 3,
    }),
    prisma.rapportVerification.findMany({
      where: { etablissementId: id },
      include: { verification: true },
      orderBy: { dateRapport: "desc" },
      take: 4,
    }),
    getOptionalUser(),
  ]);

  // La checklist ne liste QUE les étapes actionnables par l'utilisateur.
  // Le dépôt d'un premier rapport dépend d'un prestataire externe (organisme
  // agréé, bureau de contrôle) : on ne bloque pas l'accueil sur ce point,
  // le registre reste accessible via la sidebar et la cellule bento dédiée.
  const etapesOnboarding: EtapeOnboarding[] = [
    {
      id: "etablissement",
      titre: "Décrire votre établissement",
      pourquoi:
        "Adresse, effectif sur site et régimes (ERP, IGH, travail). Ces informations conditionnent les obligations qui vous sont applicables.",
      faite: true,
    },
    {
      id: "equipements",
      titre: "Déclarer vos équipements",
      pourquoi:
        "Installation électrique, extincteurs, hotte, ascenseur… Ce sont eux qui déclenchent les vérifications périodiques à faire.",
      faite: equipements.length > 0,
      href: `/etablissements/${id}/equipements`,
      cta: equipements.length === 0 ? "Commencer la déclaration" : undefined,
    },
    {
      id: "calendrier",
      titre: "Consulter votre calendrier de vérifications",
      pourquoi:
        "Dès que vos équipements sont déclarés, l'outil calcule tout seul les dates des prochaines vérifications obligatoires.",
      faite: nbVerifs > 0,
      href: `/etablissements/${id}/calendrier`,
      cta: nbVerifs === 0 ? "Ouvrir le calendrier" : undefined,
    },
  ];
  const onboardingFini = etapesOnboarding.every((e) => e.faite);

  // Récup'un DUERP existant pour le lien d'entrée
  const duerpDernier = etab.duerps[0] ?? null;

  const recos = dashboard.recommandations.slice(0, 3);
  const verifsEnRetard = dashboard.compteurs.verifsEnRetard;
  const verifsAPlanifier = dashboard.compteurs.verifsAPlanifier;
  const verifsSous30j = dashboard.compteurs.verifsSous30j;
  const actionsACouvrir =
    dashboard.compteurs.actionsOuvertes + dashboard.compteurs.actionsEnCours;
  const actionsEnRetard = dashboard.compteurs.actionsEnRetard;
  const regs = regimes(etab);
  const moisCourant = new Date().getMonth();

  const jourDernierRapport = rapportsRecents[0]
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - rapportsRecents[0].dateRapport.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[248px_1fr]">
      <AppSidebar
        etablissement={etab}
        active="tableau"
        counts={{
          equipements: equipements.length,
          verificationsEnRetard: verifsEnRetard,
          actions: actionsACouvrir,
        }}
        user={user}
      />

      <div className="flex min-w-0 flex-col">
        <AppTopbar
          title="Tableau de bord"
          subtitle={`${etab.raisonDisplay} · ${etab.adresse}${regs.length > 0 ? " · " + regs.join(" · ") : ""}`}
          actions={
            <>
              <Link
                href={`/etablissements/${id}/modifier`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Fiche établissement
              </Link>
              <Link
                href={`/api/etablissements/${id}/dossier-conformite/pdf`}
                className={buttonVariants({ size: "sm" })}
              >
                Dossier PDF ↓
              </Link>
            </>
          }
        />

        <div className="flex flex-col gap-5 px-8 py-6 pb-12">
          {/* Onboarding checklist — si incomplet */}
          {!onboardingFini ? (
            <OnboardingChecklist
              etapes={etapesOnboarding}
              etablissementRaison={etab.raisonDisplay}
            />
          ) : null}

          {/* ─── Row 1 : Score + Recos ─────────────── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1.3fr]">
            <BentoCell
              kicker="Conformité générale"
              sub={
                dashboard.duerp.derniereVersionAu
                  ? `DUERP v${dashboard.duerp.derniereVersionAu.toLocaleDateString("fr-FR")}`
                  : dashboard.duerp.existe
                    ? "DUERP en cours"
                    : "Pas encore de DUERP"
              }
            >
              <div className="flex flex-wrap items-center gap-6">
                <ScoreRing value={dashboard.score.valeur} />
                <dl className="flex-1 min-w-[200px] space-y-1.5">
                  <BrkRow
                    label="Équipements déclarés"
                    value={`${equipements.length}`}
                  />
                  <BrkRow
                    label="Vérifications à jour"
                    value={`${Math.max(0, nbVerifs - verifsEnRetard)} / ${nbVerifs || 0}`}
                  />
                  <BrkRow label="Rapports déposés" value={`${nbRapports}`} />
                  <BrkRow
                    label="Actions ouvertes"
                    value={`${actionsACouvrir}`}
                  />
                </dl>
              </div>
              <div className="flex flex-wrap gap-2">
                {verifsEnRetard > 0 ? (
                  <span className="pill-alerte">
                    {verifsEnRetard} en retard
                  </span>
                ) : null}
                {verifsAPlanifier > 0 ? (
                  <span className="pill-warn">
                    {verifsAPlanifier} à planifier
                  </span>
                ) : null}
                {verifsSous30j > 0 ? (
                  <span className="pill-warn">
                    {verifsSous30j} sous 30&nbsp;j
                  </span>
                ) : null}
                {nbVerifs -
                  verifsEnRetard -
                  verifsAPlanifier -
                  verifsSous30j >
                0 ? (
                  <span className="pill-ok">
                    {nbVerifs -
                      verifsEnRetard -
                      verifsAPlanifier -
                      verifsSous30j}{" "}
                    à jour
                  </span>
                ) : null}
              </div>
            </BentoCell>

            <BentoCell kicker="À faire en priorité" count={recos.length}>
              {recos.length === 0 ? (
                <p className="text-[0.88rem] text-muted-foreground">
                  Aucune action prioritaire pour l&apos;instant — tout est
                  à jour. ✓
                </p>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {recos.map((r, i) => (
                    <RecoItem key={i} reco={r} />
                  ))}
                </ul>
              )}
            </BentoCell>
          </div>

          {/* ─── Row 2 : KPIs ─────────────────────── */}
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <KpiCard
              label="En retard"
              value={verifsEnRetard}
              tone={verifsEnRetard > 0 ? "alerte" : "default"}
              trend={
                verifsAPlanifier > 0
                  ? {
                      dir: "flat",
                      label: `+ ${verifsAPlanifier} à planifier`,
                    }
                  : undefined
              }
            />
            <KpiCard
              label="Échéances sous 30 j"
              value={verifsSous30j}
              tone={verifsSous30j > 0 ? "warn" : "default"}
            />
            <KpiCard
              label="Actions en cours"
              value={actionsACouvrir}
              tone={actionsEnRetard > 0 ? "warn" : "default"}
              trend={
                actionsEnRetard > 0
                  ? {
                      dir: "down",
                      label: `${actionsEnRetard} en retard`,
                    }
                  : undefined
              }
            />
            <KpiCard
              label="Rapports 12 mois"
              value={dashboard.compteurs.verifsRealisees12m}
              tone="ok"
            />
          </div>

          {/* ─── Row 3 : Bars + Prochaines échéances ── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <BentoCell
              kicker={`Obligations ${new Date().getFullYear()}`}
              legend={<LegendeBarsObligations />}
            >
              {barsData.every((b) => b.couvert + b.aVenir + b.retard === 0) ? (
                <EmptyBar>
                  Le calendrier se remplit dès que vous déclarez vos équipements.
                </EmptyBar>
              ) : (
                <BarsObligations data={barsData} moisCourant={moisCourant} />
              )}
            </BentoCell>

            <BentoCell
              kicker="Prochaines échéances"
              more={{
                href: `/etablissements/${id}/calendrier`,
                label: "Tout voir",
              }}
            >
              {prochainesVerifs.length === 0 ? (
                <p className="text-[0.88rem] text-muted-foreground">
                  Aucune vérification planifiée.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {prochainesVerifs.map((v) => {
                    const nowDate = new Date();
                    const enRetard =
                      v.statut === "depassee" ||
                      (v.statut === "planifiee" && v.datePrevue < nowDate);
                    const aPlanifier = v.statut === "a_planifier";
                    const tone: "alerte" | "warn" | "ok" = enRetard
                      ? "alerte"
                      : aPlanifier
                        ? "warn"
                        : "ok";
                    const dotColor =
                      tone === "alerte"
                        ? "var(--minium)"
                        : tone === "warn"
                          ? "oklch(0.72 0.15 70)"
                          : "var(--accent-vif)";
                    const libelleDate = aPlanifier
                      ? "À planifier"
                      : formatDate(v.datePrevue);
                    const dateColorClass =
                      tone === "alerte"
                        ? "text-[color:var(--minium)]"
                        : tone === "warn"
                          ? "text-[color:oklch(0.48_0.14_60)]"
                          : "text-muted-foreground";
                    return (
                      <li
                        key={v.id}
                        className="grid grid-cols-[10px_1fr_auto] items-center gap-3 border-b border-dashed border-rule-soft py-3 last:border-b-0"
                      >
                        <span
                          aria-hidden
                          className="size-2 rounded-full"
                          style={{ background: dotColor }}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[0.9rem] font-medium">
                            {v.libelleObligation}
                          </p>
                          <p className="truncate text-[0.74rem] text-muted-foreground">
                            {v.equipement.libelle}
                          </p>
                        </div>
                        <span
                          className={
                            "font-mono text-[0.78rem] " + dateColorClass
                          }
                        >
                          {libelleDate}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </BentoCell>
          </div>

          {/* ─── Row 4 : Actions + Registre ─────────── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
                      href: `/etablissements/${id}/actions`,
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
                        <span
                          className={enRetard ? "pill-alerte" : "pill-warn"}
                        >
                          {enRetard ? "En retard" : "En cours"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[0.88rem] font-medium">
                            {a.libelle}
                          </p>
                          {a.echeance ? (
                            <p className="truncate text-[0.74rem] text-muted-foreground">
                              échéance {formatDate(a.echeance)}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </BentoCell>

            <BentoCell
              kicker="Registre — dernières entrées"
              more={{
                href: `/etablissements/${id}/registre`,
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
                          {formatDate(r.dateRapport)}
                        </td>
                        <td className="py-2.5 truncate">
                          {r.verification.libelleObligation}
                        </td>
                        <td className="py-2.5 text-right">
                          <StatutRapportPill resultat={r.resultat} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </BentoCell>
          </div>

          {/* ─── Row 5 : Équipements grid ─────────── */}
          <BentoCell
            kicker={`Équipements déclarés · ${equipements.length}`}
            more={{
              href: `/etablissements/${id}/equipements`,
              label: "Gérer",
            }}
          >
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
              {equipements.slice(0, 8).map((eq) => (
                <Link
                  key={eq.id}
                  href={`/etablissements/${id}/equipements`}
                  className="flex min-h-[88px] flex-col justify-between gap-2 rounded-lg border border-rule-soft bg-paper-sunk p-3.5 transition-all hover:-translate-y-0.5 hover:border-ink"
                >
                  <strong className="truncate text-[0.86rem] font-medium">
                    {eq.libelle}
                  </strong>
                  <span className="font-mono text-[0.68rem] text-muted-foreground">
                    {libelleCategorie(eq.categorie)}
                  </span>
                </Link>
              ))}
              <Link
                href={`/etablissements/${id}/equipements/nouveau`}
                className="flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-rule bg-transparent p-3.5 text-center text-muted-foreground transition-colors hover:border-[color:var(--accent-vif)] hover:bg-[color:var(--accent-vif-soft)] hover:text-[color:var(--accent-vif)]"
              >
                <span className="text-xl leading-none">+</span>
                <strong className="text-[0.82rem] font-medium">
                  Ajouter un équipement
                </strong>
              </Link>
            </div>
          </BentoCell>

          {duerpDernier ? (
            <BentoCell kicker="DUERP">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.95rem] font-medium">
                    Document Unique d&apos;Évaluation des Risques
                  </p>
                  <p className="mt-0.5 text-[0.78rem] text-muted-foreground">
                    {duerpDernier.versions[0]
                      ? `v${duerpDernier.versions[0].numero} du ${duerpDernier.versions[0].createdAt.toLocaleDateString("fr-FR")}`
                      : "En cours — pas encore validé"}
                  </p>
                </div>
                <Link
                  href={`/duerp/${duerpDernier.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Ouvrir le DUERP →
                </Link>
              </div>
            </BentoCell>
          ) : null}

          {/* Widget pédagogique — lien vers /guide */}
          <WidgetGuide etablissementId={id} />
        </div>
      </div>
    </div>
  );
}

function WidgetGuide({ etablissementId }: { etablissementId: string }) {
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
          Les quatre obligations structurantes (DUERP, vérifications,
          registre, plan d&apos;actions), la hiérarchie des mesures de
          prévention, le rythme annuel — expliqués sans jargon, avec les
          références Légifrance à l&apos;appui.
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

/* ─── Sub-components ─────────────────────────────── */

function BrkRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-rule-soft py-1.5 text-[0.86rem] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <strong className="font-semibold tabular-nums">{value}</strong>
    </div>
  );
}

function RecoItem({ reco }: { reco: Recommandation }) {
  const tone = tonePourReco(reco.kind);
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
        <strong className="block truncate text-[0.92rem] font-medium">
          {reco.titre}
        </strong>
        {reco.sousTitre ? (
          <em className="mt-0.5 block truncate text-[0.76rem] not-italic text-muted-foreground">
            {reco.sousTitre}
          </em>
        ) : null}
      </div>
      <Link
        href={reco.href}
        className="rounded-md bg-ink px-3 py-1.5 text-[0.78rem] text-paper-elevated transition-colors hover:bg-[color:color-mix(in_oklch,var(--ink)_85%,var(--accent-vif))]"
      >
        Ouvrir →
      </Link>
    </li>
  );
}

function EmptyBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[160px] items-center justify-center rounded-md border border-dashed border-rule-soft bg-paper-sunk/40 p-6 text-center text-[0.86rem] text-muted-foreground">
      {children}
    </div>
  );
}

function StatutRapportPill({
  resultat,
}: {
  resultat: "conforme" | "observations_mineures" | "ecart_majeur" | "non_verifiable";
}) {
  if (resultat === "conforme") return <span className="pill-ok">OK</span>;
  if (resultat === "observations_mineures")
    return <span className="pill-warn">Observations</span>;
  if (resultat === "ecart_majeur")
    return <span className="pill-alerte">Écart majeur</span>;
  return <span className="pill-warn">Non vérifiable</span>;
}

function libelleCategorie(c: string): string {
  return c.replace(/_/g, " ").toLowerCase();
}
