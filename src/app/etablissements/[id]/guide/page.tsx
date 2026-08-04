import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { GReveal } from "@/components/guide/GReveal";
import { GuideHero } from "@/components/guide/GuideHero";
import { OutilsConformite } from "@/components/guide/OutilsConformite";
import { OutilDetails } from "@/components/guide/OutilDetails";
import { QuiFaitQuoi } from "@/components/guide/QuiFaitQuoi";
import { EnCasControle } from "@/components/guide/EnCasControle";
import { SourcesBloc } from "@/components/guide/SourcesBloc";
import { PrintButton } from "@/components/guide/PrintButton";
import { getEtablissement } from "@/lib/etablissements/queries";

export const metadata = {
  title: "Comprendre vos obligations — Conformité santé-sécurité",
};

/**
 * Page pédagogique — refonte éditoriale (HANDOFF-guide.md).
 * Chaque section est enveloppée d'un GReveal avec délais étagés
 * (0 → 280ms). Respecte prefers-reduced-motion.
 */
export default async function GuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  return (
    <>
      <AppTopbar
        title="Comprendre vos obligations"
        subtitle="Ce que la loi attend d'un employeur, traduit simplement. La plateforme vous aide à tenir le fil — elle ne certifie pas votre conformité."
        crumbs={[
          { href: `/etablissements/${id}`, label: etab.raisonDisplay },
          { label: "Comprendre" },
        ]}
        actions={
          <>
            <PrintButton />
            <Link
              href={`/etablissements/${id}/controle`}
              className={buttonVariants({ size: "sm" })}
            >
              Préparer un contrôle →
            </Link>
          </>
        }
      />

      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-20 px-6 py-10 pb-16 sm:gap-24 sm:px-10 sm:py-12">
        <GReveal delay={0}>
          <GuideHero />
        </GReveal>

        <GReveal delay={80}>
          <OutilsConformite />
        </GReveal>

        <GReveal delay={120}>
          <OutilDetails etablissementId={id} />
        </GReveal>

        <GReveal delay={200}>
          <QuiFaitQuoi />
        </GReveal>

        <GReveal delay={240}>
          <EnCasControle etablissementId={id} />
        </GReveal>

        <GReveal delay={280}>
          <SourcesBloc />
        </GReveal>

        <footer className="border-t border-dashed border-rule-soft pt-6 text-center font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
          § Guide rédigé à partir des sources primaires Légifrance + INRS ·
          Mis à jour 04/2026
        </footer>
      </div>
    </>
  );
}
