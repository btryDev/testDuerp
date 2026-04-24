import Link from "next/link";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { LegalBadge, WhyCard } from "@/components/ui-kit";
import { FormSection1 } from "@/components/accessibilite/FormSection1";
import { FormSection2 } from "@/components/accessibilite/FormSection2";
import { FormSection3 } from "@/components/accessibilite/FormSection3";
import { FormSection4 } from "@/components/accessibilite/FormSection4";
import { PublicationPanel } from "@/components/accessibilite/PublicationPanel";
import { requireEtablissement } from "@/lib/auth/scope";
import {
  calculerProgression,
  getRegistreAccessibilite,
} from "@/lib/accessibilite/queries";
import { genererQrCodeDataUrl } from "@/lib/accessibilite/qrcode";
import { publicAppUrl } from "@/lib/email";

export const metadata = {
  title: "Registre d'accessibilité ERP",
};

function Section({
  numero,
  titre,
  sousTitre,
  rempli,
  children,
}: {
  numero: string;
  titre: string;
  sousTitre: string;
  rempli: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="cartouche group relative overflow-hidden" open={!rempli}>
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background: rempli
            ? "var(--accent-vif)"
            : "color-mix(in oklch, var(--rule) 40%, transparent)",
        }}
      />
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-7 py-5 sm:px-10">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[1.5rem] font-light tabular-nums text-[color:var(--seal)]">
            {numero}
          </span>
          <div>
            <p className="text-[1.05rem] font-semibold tracking-[-0.015em]">
              {titre}
            </p>
            <p className="mt-0.5 text-[0.82rem] text-muted-foreground">
              {sousTitre}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {rempli && (
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[color:var(--accent-vif)]">
              ✓ Rempli
            </span>
          )}
          <span
            aria-hidden
            className="text-[0.78rem] text-muted-foreground transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </div>
      </summary>
      <div className="border-t border-dashed border-rule/60 px-7 py-7 sm:px-10">
        {children}
      </div>
    </details>
  );
}

export default async function AccessibilitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);

  if (!etablissement.estERP) {
    return (
      <>
        <AppTopbar
          title="Registre d'accessibilité"
          crumbs={[
            { href: `/etablissements/${id}`, label: etablissement.raisonDisplay },
            { label: "Accessibilité" },
          ]}
        />
        <main className="mx-auto max-w-3xl px-8 py-12">
          <div className="cartouche-sunk p-8 text-center">
            <p className="label-admin">Non applicable</p>
            <h1 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em]">
              Cet établissement n&apos;est pas un ERP
            </h1>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-muted-foreground">
              Le registre d&apos;accessibilité est une obligation qui ne concerne
              que les <strong>Établissements Recevant du Public</strong>{" "}
              (restaurants, commerces, bureaux ouverts au public…). Vous pouvez
              modifier le régime de votre établissement si celui-ci doit être
              déclaré ERP.
            </p>
            <Link
              href={`/etablissements/${id}/modifier`}
              className="mt-5 inline-block font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[color:var(--warm)] hover:underline"
            >
              Modifier la fiche établissement →
            </Link>
          </div>
        </main>
      </>
    );
  }

  const registre = await getRegistreAccessibilite(id);
  const progression = calculerProgression(registre);

  // Génération du QR code — seulement si un slug existe déjà.
  let qrDataUrl = "";
  let urlPublique = "";
  if (registre?.slugPublic) {
    urlPublique = `${publicAppUrl()}/accessibilite/${registre.slugPublic}`;
    qrDataUrl = await genererQrCodeDataUrl(urlPublique);
  }

  const section1Rempli = Boolean(
    registre?.prestationsFournies && registre.handicapsAccueillis.length > 0,
  );
  const section2Rempli = Boolean(registre?.conformiteRegime);
  const section3Rempli = Boolean(
    registre?.personnelForme || registre?.dateDerniereFormation,
  );
  const section4Rempli = Boolean(
    registre?.equipementsAccessibilite && registre?.modalitesMaintenance,
  );

  return (
    <>
      <AppTopbar
        title="Registre d'accessibilité"
        subtitle="Document obligatoire pour tout ERP — à tenir à disposition du public."
        crumbs={[
          { href: `/etablissements/${id}`, label: etablissement.raisonDisplay },
          { label: "Accessibilité" },
        ]}
      />

      <main className="mx-auto max-w-4xl px-8 py-8 pb-16">
        {/* Why */}
        <WhyCard
          kicker="Obligation"
          titre="Ce que la loi attend de vous"
          enjeu={
            registre?.publie
              ? "Votre registre est publié. Continuez à le tenir à jour à chaque changement."
              : "Tout ERP doit tenir à disposition du public un registre décrivant les dispositions d'accessibilité prises. Objectif : permettre à une personne en situation de handicap de savoir, avant de venir, ce qu'elle trouvera sur place."
          }
          tonalite={registre?.publie ? "ok" : "info"}
        >
          <LegalBadge
            reference="Arrêté du 19 avril 2017 · Art. D111-19-33 CCH"
            href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000034463079/"
            extrait="Le registre public d'accessibilité précise les dispositions prises pour permettre à tous, notamment aux personnes handicapées, quel que soit leur handicap, de bénéficier des prestations en vue desquelles cet établissement a été conçu."
          >
            L&apos;arrêté définit <strong>4 rubriques obligatoires</strong> :
            prestations fournies, pièces administratives d&apos;accessibilité,
            formation du personnel, et modalités de maintenance.
          </LegalBadge>
        </WhyCard>

        {/* Progression */}
        <div className="mt-8 flex items-center gap-4 rounded-xl border border-[color:var(--rule-soft)] bg-[color:var(--paper-elevated)] p-5">
          <div className="relative h-14 w-14 shrink-0">
            <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
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
                  progression === 100
                    ? "var(--accent-vif)"
                    : "var(--warm)"
                }
                strokeWidth="2"
                strokeDasharray={`${progression} 100`}
                pathLength={100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-[0.78rem] font-semibold tabular-nums">
              {progression}%
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.95rem] font-medium">
              {progression === 0
                ? "Registre vide"
                : progression === 100
                  ? "Registre complet"
                  : "En cours de remplissage"}
            </p>
            <p className="mt-0.5 text-[0.82rem] text-muted-foreground">
              {progression < 100
                ? "Remplissez chaque section en plusieurs passes — rien n'est bloquant."
                : "Toutes les rubriques de l'arrêté sont renseignées."}
            </p>
          </div>
        </div>

        {/* Publication */}
        {registre && (
          <div className="mt-6">
            <PublicationPanel
              etablissementId={id}
              slugPublic={registre.slugPublic}
              publie={registre.publie}
              urlPublique={urlPublique}
              qrDataUrl={qrDataUrl}
            />
          </div>
        )}

        {/* Sections */}
        <div className="mt-10 space-y-4">
          <Section
            numero="01"
            titre="Prestations fournies au public"
            sousTitre="Ce que vous proposez et à qui"
            rempli={section1Rempli}
          >
            <FormSection1
              etablissementId={id}
              initial={
                registre
                  ? {
                      prestationsFournies: registre.prestationsFournies,
                      handicapsAccueillis: registre.handicapsAccueillis,
                      servicesAdaptes: registre.servicesAdaptes,
                    }
                  : null
              }
            />
          </Section>

          <Section
            numero="02"
            titre="Régime de conformité et pièces administratives"
            sousTitre="Attestation, Ad'AP, dérogation — état juridique"
            rempli={section2Rempli}
          >
            <FormSection2
              etablissementId={id}
              initial={
                registre
                  ? {
                      conformiteRegime: registre.conformiteRegime,
                      dateConformite: registre.dateConformite,
                      numeroAttestationAccess: registre.numeroAttestationAccess,
                      dateDepotAdap: registre.dateDepotAdap,
                    }
                  : null
              }
            />
          </Section>

          <Section
            numero="03"
            titre="Formation du personnel d'accueil"
            sousTitre="Actions de formation réalisées"
            rempli={section3Rempli}
          >
            <FormSection3
              etablissementId={id}
              initial={
                registre
                  ? {
                      personnelForme: registre.personnelForme,
                      dateDerniereFormation: registre.dateDerniereFormation,
                      organismeFormation: registre.organismeFormation,
                      effectifForme: registre.effectifForme,
                    }
                  : null
              }
            />
          </Section>

          <Section
            numero="04"
            titre="Équipements et maintenance"
            sousTitre="Ce qui est installé et comment c'est entretenu"
            rempli={section4Rempli}
          >
            <FormSection4
              etablissementId={id}
              initial={
                registre
                  ? {
                      equipementsAccessibilite: registre.equipementsAccessibilite,
                      modalitesMaintenance: registre.modalitesMaintenance,
                      dernierControleMaintenance:
                        registre.dernierControleMaintenance,
                    }
                  : null
              }
            />
          </Section>
        </div>
      </main>
    </>
  );
}
