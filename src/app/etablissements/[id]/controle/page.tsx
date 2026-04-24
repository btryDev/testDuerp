import Link from "next/link";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { LegalBadge, WhyCard, StatusPill } from "@/components/ui-kit";
import { requireEtablissement } from "@/lib/auth/scope";
import { getDashboardData } from "@/lib/dashboard/queries";
import { countAlertesVigilance } from "@/lib/prestataires/queries";
import { prisma } from "@/lib/prisma";

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
        ? `Version v${duerpVersion.numero} figée le ${duerpVersion.createdAt.toLocaleDateString("fr-FR")}.`
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

      <main className="mx-auto max-w-4xl px-8 py-8 pb-20">
        {/* HERO — statut de préparation + gros CTA */}
        <section className="cartouche relative overflow-hidden">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{
              background:
                pourcentPret >= 90
                  ? "var(--accent-vif)"
                  : pourcentPret >= 60
                    ? "oklch(0.72 0.15 70)"
                    : "var(--minium)",
            }}
          />
          <div className="grid gap-0 md:grid-cols-[1fr_auto]">
            {/* Gauche : statut */}
            <div className="border-b border-dashed border-rule/60 px-8 py-8 md:border-b-0 md:border-r md:px-10 md:py-10">
              <p className="label-admin">Dossier 1 clic</p>
              <h1 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.025em]">
                Vous êtes prêt à
                <br />
                <span
                  className="accent-serif"
                  style={{ color: "var(--warm)" }}
                >
                  passer un contrôle
                </span>
                {pourcentPret >= 90 ? "." : " ?"}
              </h1>
              <p className="mt-4 max-w-prose text-[0.95rem] leading-relaxed text-ink/80">
                Cette page rassemble, en un seul dossier ZIP, tout ce qu&apos;un
                inspecteur du travail, une commission de sécurité, un assureur
                ou un bailleur peut demander. Vérifiez l&apos;état de chaque pièce,
                puis téléchargez le dossier.
              </p>
              {pourcentPret < 90 && (
                <p className="mt-4 text-[0.85rem] text-[color:var(--minium)]">
                  Certaines pièces sont incomplètes. Le dossier reste
                  téléchargeable, mais corrigez-les avant une présentation
                  formelle.
                </p>
              )}
            </div>

            {/* Droite : score + CTA */}
            <div className="flex flex-col items-center justify-center gap-4 bg-[color:var(--paper-sunk)] px-8 py-10 md:px-10">
              <div className="relative h-28 w-28">
                <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="var(--rule)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke={
                      pourcentPret >= 90
                        ? "var(--accent-vif)"
                        : pourcentPret >= 60
                          ? "oklch(0.72 0.15 70)"
                          : "var(--minium)"
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
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                    % prêt
                  </span>
                </span>
              </div>
              <a
                href={`/api/etablissements/${id}/controle-zip`}
                className="inline-flex items-center gap-2 rounded-md bg-[color:var(--ink)] px-5 py-3 text-[0.92rem] font-medium text-[color:var(--paper-elevated)] shadow-sm transition-colors hover:opacity-90"
              >
                Télécharger le dossier ZIP ↓
              </a>
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.12em] text-muted-foreground">
                ~5 Mo · généré à la volée
              </p>
            </div>
          </div>
        </section>

        {/* CHECKLIST — ce que contient le dossier */}
        <section className="mt-10">
          <header className="mb-5">
            <p className="label-admin">Contenu du dossier</p>
            <h2 className="mt-1 text-[1.2rem] font-semibold tracking-[-0.015em]">
              Pièces incluses
            </h2>
            <p className="mt-1 text-[0.85rem] text-muted-foreground">
              Chaque pièce est vérifiée avant d&apos;être mise au ZIP. Statut des
              données à l&apos;instant de la génération.
            </p>
          </header>

          <ol className="space-y-3">
            {elements.map((el, idx) => (
              <li
                key={el.titre}
                className="cartouche flex items-start gap-5 px-6 py-5 sm:px-7"
              >
                <span className="shrink-0 font-mono text-[1.1rem] font-light tabular-nums text-[color:var(--seal)]">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-[0.98rem] font-semibold">
                      {el.titre}
                    </h3>
                    {el.etat && (
                      <StatusPill status={el.etat} size="sm" />
                    )}
                  </div>
                  <p className="mt-1 text-[0.85rem] text-muted-foreground">
                    {el.description}
                  </p>
                  {el.reference && (
                    <p className="mt-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[color:var(--seal)]">
                      § {el.reference}
                    </p>
                  )}
                </div>
                <span
                  aria-hidden
                  className={
                    "shrink-0 font-mono text-[1.1rem] " +
                    (el.present ? "text-[color:var(--accent-vif)]" : "text-[color:var(--seal)]")
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
          <WhyCard
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
              <LegalBadge reference="Art. R4121-1 CT · DUERP" />
              <LegalBadge reference="Art. L4711-5 CT · Registre" />
              <LegalBadge reference="Arrêté 19-04-2017 · Accessibilité" />
              <LegalBadge reference="Art. L8222-1 CT · Vigilance" />
            </div>
          </WhyCard>
        </section>

        {/* Rappel footer */}
        <footer className="mt-10 border-t border-dashed border-rule pt-6 text-center font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
          Ce dossier est un outil d&apos;aide · la responsabilité juridique
          reste celle de l&apos;employeur.{" "}
          <Link
            href={`/etablissements/${id}/guide`}
            className="text-[color:var(--warm)] hover:underline"
          >
            Consulter le guide →
          </Link>
        </footer>
      </main>
    </>
  );
}
