import Link from "next/link";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { LegalBadge, WhyCard, StatusPill } from "@/components/ui-kit";
import { requireEtablissement } from "@/lib/auth/scope";
import { getDashboardData } from "@/lib/dashboard/queries";
import { countAlertesVigilance } from "@/lib/prestataires/queries";
import { prisma } from "@/lib/prisma";
import { formaterDateFr } from "@/lib/dates";

export const metadata = {
  title: "Préparer un contrôle — Dossier 1 clic",
};

type ElementDossier = {
  titre: string;
  description: string;
  present: boolean;
  etat?: "a_jour" | "a_planifier" | "en_retard" | "non_conforme" | "non_applicable";
  reference?: string;
};

export default async function ControlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);

  const [
    dashboard,
    prestatairesAlertes,
    nbPrestataires,
    duerpVersion,
    nbRapports,
    registreAccessibilite,
  ] = await Promise.all([
    getDashboardData(id),
    countAlertesVigilance(id),
    prisma.prestataire.count({ where: { etablissementId: id } }),
    prisma.duerpVersion.findFirst({
      where: { duerp: { etablissementId: id } },
      orderBy: { numero: "desc" },
      select: { numero: true, createdAt: true },
    }),
    prisma.rapportVerification.count({ where: { etablissementId: id } }),
    prisma.registreAccessibilite.findUnique({
      where: { etablissementId: id },
      select: { publie: true },
    }),
  ]);

  const elements: ElementDossier[] = [
    {
      titre: "Dossier de conformité consolidé",
      description: "Synthèse globale de votre posture santé-sécurité.",
      present: true,
      etat: "a_jour",
    },
    {
      titre: "DUERP versionné",
      description: duerpVersion
        ? `Version v${duerpVersion.numero} figée le ${formaterDateFr(duerpVersion.createdAt)}.`
        : "Aucune version figée. Créez-en une depuis le DUERP.",
      present: !!duerpVersion,
      etat: duerpVersion ? "a_jour" : "a_planifier",
      reference: "Art. R4121-1 CT",
    },
    {
      titre: "Registre de sécurité",
      description: `${nbRapports} rapport${nbRapports > 1 ? "s" : ""} de vérification archivé${nbRapports > 1 ? "s" : ""}.`,
      present: true,
      etat:
        dashboard.compteurs.verifsEnRetard > 0 ? "en_retard" : "a_jour",
      reference: "Art. L4711-5 CT",
    },
    {
      titre: "Plan d'actions correctives",
      description:
        dashboard.compteurs.actionsOuvertes +
          dashboard.compteurs.actionsEnCours >
        0
          ? `${dashboard.compteurs.actionsOuvertes + dashboard.compteurs.actionsEnCours} action${dashboard.compteurs.actionsOuvertes + dashboard.compteurs.actionsEnCours > 1 ? "s" : ""} en cours.`
          : "Aucune action en cours.",
      present: true,
      etat: dashboard.compteurs.actionsEnRetard > 0 ? "en_retard" : "a_jour",
      reference: "Art. L4121-2 CT",
    },
    {
      titre: "Registre d'accessibilité ERP",
      description: etablissement.estERP
        ? registreAccessibilite?.publie
          ? "Publié et consultable en ligne."
          : "Registre non publié. À rendre public."
        : "Non applicable — votre établissement n'est pas un ERP.",
      present: etablissement.estERP ? Boolean(registreAccessibilite?.publie) : false,
      etat: !etablissement.estERP
        ? "non_applicable"
        : registreAccessibilite?.publie
          ? "a_jour"
          : "a_planifier",
      reference: "Arrêté 19-04-2017",
    },
    {
      titre: "Attestations prestataires",
      description: nbPrestataires
        ? prestatairesAlertes > 0
          ? `${prestatairesAlertes} attestation${prestatairesAlertes > 1 ? "s" : ""} URSSAF/RC Pro expirée${prestatairesAlertes > 1 ? "s" : ""} ou expirant.`
          : `${nbPrestataires} prestataire${nbPrestataires > 1 ? "s" : ""} · pièces à jour.`
        : "Aucun prestataire déclaré.",
      present: nbPrestataires > 0,
      etat:
        nbPrestataires === 0
          ? "a_planifier"
          : prestatairesAlertes > 0
            ? "en_retard"
            : "a_jour",
      reference: "Art. L8222-1 CT",
    },
  ];

  const nbReady = elements.filter(
    (e) => e.etat === "a_jour" || e.etat === "non_applicable",
  ).length;
  const nbTotal = elements.length;
  const pourcentPret = Math.round((nbReady / nbTotal) * 100);

  return (
    <>
      <AppTopbar
        title="Préparer un contrôle"
        subtitle="Un ZIP, un dossier, 30 secondes."
        crumbs={[
          { href: `/etablissements/${id}`, label: etablissement.raisonDisplay },
          { label: "Contrôle" },
        ]}
      />

      <main className="flex flex-1 flex-col gap-7 bg-[color:var(--board-canvas)] px-[var(--board-gutter)] py-7 pb-16">
        {/* HERO — statut de préparation + gros CTA */}
        <section className="carte-board relative overflow-hidden">
          <div className="grid gap-0 md:grid-cols-[1fr_auto]">
            {/* Gauche : statut */}
            <div className="border-b border-[color:var(--board-slate-line)] px-8 py-8 md:border-b-0 md:border-r md:px-10 md:py-10">
              <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">Dossier 1 clic</p>
              <h1 className="mt-3 text-[clamp(22px,2.2vw,27px)] font-semibold leading-tight tracking-[-0.025em]">
                Vous êtes prêt à
                <br />
                <span>
                  passer un contrôle
                </span>
                {pourcentPret >= 90 ? "." : " ?"}
              </h1>
              <p className="mt-4 max-w-prose text-[0.95rem] leading-relaxed text-[color:var(--board-ink)]/80">
                Cette page rassemble, en un seul dossier ZIP, tout ce qu&apos;un
                inspecteur du travail, une commission de sécurité, un assureur
                ou un bailleur peut demander. Vérifiez l&apos;état de chaque pièce,
                puis téléchargez le dossier.
              </p>
              {pourcentPret < 90 && (
                <p className="mt-4 text-[0.85rem] text-[color:var(--board-signal-ink)]">
                  Certaines pièces sont incomplètes. Le dossier reste
                  téléchargeable, mais corrigez-les avant une présentation
                  formelle.
                </p>
              )}
            </div>

            {/* Droite : score + CTA */}
            <div className="flex flex-col items-center justify-center gap-4 bg-[color:var(--board-slate-pale)] px-8 py-10 md:px-10">
              <div className="relative h-28 w-28">
                <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="var(--board-slate)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke={
                      pourcentPret >= 90
                        ? "var(--board-green-ink)"
                        : pourcentPret >= 60
                          ? "var(--board-amber)"
                          : "var(--board-signal-ink)"
                    }
                    strokeWidth="2"
                    strokeDasharray={`${pourcentPret} 100`}
                    pathLength={100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-[1.75rem] font-semibold tabular-nums">
                    {pourcentPret}
                  </span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[color:var(--board-slate-mid)]">
                    % prêt
                  </span>
                </span>
              </div>
              <a
                href={`/api/etablissements/${id}/controle-zip`}
                className="inline-flex items-center gap-2 rounded-md bg-[color:var(--board-ink)] px-5 py-3 text-[0.92rem] font-medium text-[color:var(--board-card)] shadow-sm transition-colors hover:opacity-90"
              >
                Télécharger le dossier ZIP ↓
              </a>
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--board-slate-mid)]">
                ~5 Mo · généré à la volée
              </p>
            </div>
          </div>
        </section>

        {/* CHECKLIST — ce que contient le dossier */}
        <section className="mt-10">
          <header className="mb-5">
            <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">Contenu du dossier</p>
            <h2 className="mt-1 text-[1.2rem] font-semibold tracking-[-0.015em]">
              Pièces incluses
            </h2>
            <p className="mt-1 text-[0.85rem] text-[color:var(--board-slate-mid)]">
              Chaque pièce est vérifiée avant d&apos;être mise au ZIP. Statut des
              données à l&apos;instant de la génération.
            </p>
          </header>

          <ol className="space-y-3">
            {elements.map((el, idx) => (
              <li
                key={el.titre}
                className="carte-board flex items-start gap-5 px-7 py-6 sm:px-8"
              >
                <span className="shrink-0 font-mono text-[1.1rem] font-light tabular-nums text-[color:var(--board-slate-soft)]">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-[0.98rem] font-semibold">
                      {el.titre}
                    </h3>
                    {el.etat && (
                      <StatusPill charte="board" status={el.etat} size="sm" />
                    )}
                  </div>
                  <p className="mt-1 text-[0.85rem] text-[color:var(--board-slate-mid)]">
                    {el.description}
                  </p>
                  {el.reference && (
                    <p className="mt-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[color:var(--board-slate-soft)]">
                      § {el.reference}
                    </p>
                  )}
                </div>
                <span
                  aria-hidden
                  className={
                    "shrink-0 font-mono text-[1.1rem] " +
                    (el.present ? "text-[color:var(--board-green-ink)]" : "text-[color:var(--board-slate-soft)]")
                  }
                >
                  {el.present ? "✓" : "○"}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Pourquoi ça nous rassure */}
        <section className="mt-10">
          <WhyCard charte="board"
            kicker="Notre engagement"
            titre="Traçabilité totale — zéro IA, zéro reformulation."
            enjeu="Chaque document de ce dossier a été généré à partir de vos saisies brutes, sans retraitement. Les références réglementaires sont sourcées Légifrance et INRS."
            tonalite="info"
          >
            <p>
              Si un inspecteur conteste une pièce, vous pouvez la retrouver en
              base, voir qui l&apos;a modifiée et quand. Aucune opération cachée.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <LegalBadge charte="board" reference="Art. R4121-1 CT · DUERP" />
              <LegalBadge charte="board" reference="Art. L4711-5 CT · Registre" />
              <LegalBadge charte="board" reference="Arrêté 19-04-2017 · Accessibilité" />
              <LegalBadge charte="board" reference="Art. L8222-1 CT · Vigilance" />
            </div>
          </WhyCard>
        </section>

        {/* Rappel footer */}
        <footer className="mt-10 border-t border-dashed border-[color:var(--board-slate)] pt-6 text-center font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[color:var(--board-slate-mid)]">
          Ce dossier est un outil d&apos;aide · la responsabilité juridique
          reste celle de l&apos;employeur.{" "}
          <Link
            href={`/etablissements/${id}/guide`}
            className="text-[color:var(--board-blue-ink)] hover:underline"
          >
            Consulter le guide →
          </Link>
        </footer>
      </main>
    </>
  );
}
