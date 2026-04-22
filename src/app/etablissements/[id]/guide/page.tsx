import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { BentoCell } from "@/components/dashboard/BentoCell";
import { getEtablissement } from "@/lib/etablissements/queries";
import { getOptionalUser } from "@/lib/auth/require-user";

export const metadata = {
  title: "Comprendre vos obligations — Conformité santé-sécurité",
};

/**
 * Guide pédagogique pour dirigeants de TPE/PME.
 *
 * Objectif : présenter, en langage clair, ce que la loi attend d'un
 * employeur en matière de santé-sécurité et comment la plateforme aide à
 * le tenir. Strictement factuel, références Légifrance à l'appui —
 * jamais de « vous êtes conforme » ni de conseil juridique automatisé
 * (cf. CLAUDE.md règles 6, 7, 8).
 */
export default async function GuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [etab, user] = await Promise.all([
    getEtablissement(id),
    getOptionalUser(),
  ]);
  if (!etab) notFound();

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[248px_1fr]">
      <AppSidebar etablissement={etab} active="guide" user={user} />

      <div className="flex min-w-0 flex-col">
        <AppTopbar
          title="Comprendre vos obligations"
          subtitle="Ce que la loi attend d'un employeur, traduit simplement. La plateforme vous aide à tenir le fil — elle ne certifie pas votre conformité."
          crumbs={[
            {
              href: `/etablissements/${id}`,
              label: etab.raisonDisplay,
            },
            { label: "Comprendre" },
          ]}
        />

        <div className="flex flex-col gap-5 px-8 py-6 pb-16">
          {/* ─── Intro ─────────────────────────────── */}
          <BentoCell kicker="§ I · Le cadre légal">
            <div className="max-w-[68ch] space-y-3 text-[0.95rem] leading-[1.65]">
              <p>
                En tant qu&apos;employeur, vous êtes <strong>responsable
                de la santé et de la sécurité de vos salariés</strong>{" "}
                (art. L. 4121-1 du Code du travail). C&apos;est une
                obligation de résultat : quelle que soit votre taille,
                quatre volets structurent ce que la loi vous demande.
              </p>
              <p className="text-muted-foreground">
                La plateforme couvre ces quatre volets pour un
                établissement tertiaire, commerce ou restauration. Les
                références citées ci-dessous sont issues de Légifrance
                et des publications INRS — vous pouvez toutes les
                vérifier en ligne.
              </p>
            </div>
          </BentoCell>

          {/* ─── Les 4 piliers ─────────────────────── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Pilier
              titre="1. Document unique (DUERP)"
              source="Art. R. 4121-1 à R. 4121-4 du Code du travail"
              quoi="Inventaire écrit des risques professionnels présents dans votre établissement, unité de travail par unité de travail, avec une cotation et les mesures de prévention prévues ou existantes."
              quand="À la première installation, puis au moins une fois par an pour les entreprises de 11 salariés et plus. En tout état de cause : après tout aménagement important, après un accident, ou dès qu'une information nouvelle sur un risque apparaît."
              conservation="40 ans depuis la loi du 2 août 2021 — chaque version antérieure reste consultable."
              ctaHref={`/etablissements/${id}`}
              ctaLabel="Ouvrir mon DUERP"
            />
            <Pilier
              titre="2. Vérifications périodiques"
              source="Art. R. 4323-22 et suivants, arrêté du 25 juin 1980 (ERP), CCH R. 123-51 et R. 122-29"
              quoi="Contrôles réguliers des équipements à risque (installation électrique, extincteurs, BAES, hottes, portes automatiques, ascenseurs…). Réalisés par un organisme agréé, une personne qualifiée ou l'exploitant selon les cas."
              quand="Périodicité imposée par texte : annuelle (électricité, extincteurs), semestrielle (hottes), quinquennale, etc. L'outil calcule vos échéances à partir des équipements que vous avez déclarés."
              conservation="Le rapport de chaque vérification est conservé dans le registre de sécurité, au minimum 5 ans."
              ctaHref={`/etablissements/${id}/calendrier`}
              ctaLabel="Voir mon calendrier"
            />
            <Pilier
              titre="3. Registre de sécurité"
              source="Art. L. 4711-5 du Code du travail"
              quoi="Centralisation horodatée de tous les rapports de vérification, avis, observations ou mises en demeure relatifs à la sécurité. Présenté à l'inspection du travail, à l'assureur ou au bailleur sur demande."
              quand="Tenue continue — chaque rapport reçu est déposé et lié à la vérification correspondante. L'outil recalcule alors automatiquement la prochaine échéance."
              conservation="Consultable à tout moment. Export ZIP + index PDF possible en 30 secondes."
              ctaHref={`/etablissements/${id}/registre`}
              ctaLabel="Ouvrir le registre"
            />
            <Pilier
              titre="4. Plan d'actions"
              source="Art. L. 4121-2 (principes généraux de prévention)"
              quoi="Suivi des actions correctives à mener pour lever les risques identifiés (issu du DUERP) ou les écarts constatés sur un rapport de vérification. La loi impose une hiérarchie : supprimer le risque avant d'en protéger."
              quand="Chaque risque évalué > 0 ou chaque écart détecté ouvre une action. Elle reste ouverte jusqu'à justificatif de levée (nouveau rapport, photo, commentaire signé)."
              conservation="Le plan en cours est accessible à tout moment ; les actions clôturées restent auditables."
              ctaHref={`/etablissements/${id}/actions`}
              ctaLabel="Ouvrir le plan"
            />
          </div>

          {/* ─── Cycle annuel ──────────────────────── */}
          <BentoCell kicker="§ II · Votre année, en un coup d'œil">
            <p className="max-w-[68ch] text-[0.95rem] leading-[1.6] text-ink/80">
              Voici un exemple de rythme pour un établissement type —
              votre calendrier réel est généré automatiquement par
              l&apos;outil selon vos équipements et votre typologie.
            </p>
            <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Mois
                label="Janvier"
                actes={["Revue annuelle du DUERP", "Plan d'actions de l'année"]}
              />
              <Mois
                label="Au fil de l'année"
                actes={[
                  "Vérifications périodiques selon calendrier",
                  "Dépôt des rapports reçus au registre",
                ]}
              />
              <Mois
                label="À chaque événement"
                actes={[
                  "Nouvel équipement ou aménagement → MàJ du DUERP",
                  "Accident ou incident → analyse + action corrective",
                ]}
              />
              <Mois
                label="En cas de contrôle"
                actes={[
                  "Export du dossier de conformité (1 PDF)",
                  "Accès direct au registre horodaté",
                ]}
              />
            </ul>
          </BentoCell>

          {/* ─── Qui fait quoi ─────────────────────── */}
          <BentoCell kicker="§ III · Qui fait quoi">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Role
                qui="Vous (dirigeant)"
                quoi="Décidez des actions de prévention, signez le DUERP, déposez les rapports, levez les écarts."
              />
              <Role
                qui="Vos salariés"
                quoi="Sont consultés lors de la rédaction du DUERP (art. L. 4121-3). Remontent les situations dangereuses."
              />
              <Role
                qui="Organismes agréés / bureaux de contrôle"
                quoi="Réalisent les vérifications périodiques qui exigent leur intervention (électricité, ascenseurs…)."
              />
              <Role
                qui="Médecine du travail"
                quoi="Avis sur les postes, fiche d'entreprise. Obligatoire dès le 1ᵉʳ salarié."
              />
              <Role
                qui="CSE / CSSCT (11 salariés et plus)"
                quoi="Consultation sur le DUERP et le plan de prévention. Contribue à l'analyse des accidents."
              />
              <Role
                qui="Inspection du travail"
                quoi="Peut demander à tout moment : DUERP à jour, registre, plan d'actions, preuves des vérifications."
              />
            </dl>
          </BentoCell>

          {/* ─── En cas de contrôle ─────────────────── */}
          <BentoCell kicker="§ IV · En cas de contrôle — quoi présenter">
            <p className="max-w-[68ch] text-[0.95rem] leading-[1.6] text-ink/80">
              Un contrôleur (inspecteur du travail, assureur, acquéreur,
              bailleur, commission de sécurité) a besoin de vérifier que
              votre dispositif tient la route. Quatre documents suffisent
              dans la plupart des cas :
            </p>
            <ul className="mt-2 flex flex-col gap-2.5 text-[0.9rem]">
              <ChecklistLi>
                <strong>Le DUERP en cours</strong> — version datée et
                signée, avec les risques cotés et les mesures associées.
              </ChecklistLi>
              <ChecklistLi>
                <strong>Le registre de sécurité</strong> — tous les
                rapports de vérification, classés par équipement ou
                chronologiquement.
              </ChecklistLi>
              <ChecklistLi>
                <strong>Le plan d&apos;actions</strong> — actions ouvertes
                avec échéance, actions levées avec justificatif.
              </ChecklistLi>
              <ChecklistLi>
                <strong>Un dossier de conformité consolidé</strong> — PDF
                de synthèse reprenant les trois premiers, généré en
                quelques secondes depuis la plateforme.
              </ChecklistLi>
            </ul>
            <div className="mt-3">
              <Link
                href={`/api/etablissements/${id}/dossier-conformite/pdf`}
                className={buttonVariants({ size: "sm" })}
              >
                Générer mon dossier PDF ↓
              </Link>
            </div>
          </BentoCell>

          {/* ─── Sources primaires ─────────────────── */}
          <BentoCell kicker="§ V · Pour aller plus loin">
            <p className="max-w-[68ch] text-[0.9rem] leading-[1.6] text-muted-foreground">
              Toutes les obligations citées sont construites à partir de
              sources primaires libres d&apos;accès. Vous pouvez les
              consulter directement :
            </p>
            <ul className="flex flex-col gap-2 text-[0.88rem]">
              <SourceExterne
                libelle="Légifrance — Code du travail, partie Santé-sécurité (articles L. 4121 à L. 4641)"
                url="https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000006160964/"
              />
              <SourceExterne
                libelle="INRS — publications ED sur l'évaluation des risques (ED 840, etc.)"
                url="https://www.inrs.fr/"
              />
              <SourceExterne
                libelle="Ministère du Travail — fiches « Prévention des risques »"
                url="https://travail-emploi.gouv.fr/sante-au-travail/prevention-des-risques-pour-la-sante-au-travail"
              />
            </ul>
            <p className="mt-3 max-w-[68ch] text-[0.78rem] text-muted-foreground">
              La plateforme vous aide à structurer et rappelle les
              échéances. Elle ne remplace pas l&apos;avis d&apos;un
              professionnel de la prévention lorsque votre activité
              présente des risques particuliers.
            </p>
          </BentoCell>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components locaux ───────────────────────── */

function Pilier({
  titre,
  source,
  quoi,
  quand,
  conservation,
  ctaHref,
  ctaLabel,
}: {
  titre: string;
  source: string;
  quoi: string;
  quand: string;
  conservation: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <BentoCell kicker={titre}>
      <p className="font-mono text-[0.7rem] text-muted-foreground">{source}</p>
      <div className="mt-1 space-y-3 text-[0.9rem] leading-[1.55]">
        <LigneGlose label="Ce que la loi demande" texte={quoi} />
        <LigneGlose label="Rythme" texte={quand} />
        <LigneGlose label="Conservation" texte={conservation} />
      </div>
      <Link
        href={ctaHref}
        className="mt-auto inline-flex w-fit items-center gap-1.5 self-start text-[0.82rem] font-medium text-[color:var(--accent-vif)] transition-opacity hover:opacity-80"
      >
        {ctaLabel} →
      </Link>
    </BentoCell>
  );
}

function LigneGlose({ label, texte }: { label: string; texte: string }) {
  return (
    <div>
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-ink/85">{texte}</p>
    </div>
  );
}

function Mois({ label, actes }: { label: string; actes: string[] }) {
  return (
    <li className="rounded-lg border border-rule-soft bg-paper-sunk/40 p-3.5">
      <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <ul className="mt-2 flex flex-col gap-1.5 text-[0.86rem]">
        {actes.map((a, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              aria-hidden
              className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-[color:var(--accent-vif)]"
            />
            <span>{a}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}

function Role({ qui, quoi }: { qui: string; quoi: string }) {
  return (
    <div className="border-t border-dashed border-rule-soft pt-3 first:border-t-0 first:pt-0 sm:border-t-0 sm:pt-0 sm:[&:nth-child(n+3)]:border-t sm:[&:nth-child(n+3)]:pt-3">
      <dt className="text-[0.92rem] font-medium">{qui}</dt>
      <dd className="mt-1 text-[0.84rem] leading-[1.55] text-ink/75">
        {quoi}
      </dd>
    </div>
  );
}

function ChecklistLi({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 rounded-lg bg-paper-sunk px-3 py-2.5">
      <span
        aria-hidden
        className="mt-1.5 inline-block size-2 shrink-0 rounded-full bg-[color:var(--accent-vif)]"
      />
      <span className="leading-[1.55]">{children}</span>
    </li>
  );
}

function SourceExterne({
  libelle,
  url,
}: {
  libelle: string;
  url: string;
}) {
  return (
    <li className="flex items-start gap-2">
      <span aria-hidden className="mt-1 text-muted-foreground">
        ↗
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-ink underline decoration-rule decoration-dotted underline-offset-4 hover:decoration-ink"
      >
        {libelle}
      </a>
    </li>
  );
}
