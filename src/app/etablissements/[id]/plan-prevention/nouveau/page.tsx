import Link from "next/link";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { FormulairePlanPrevention } from "@/components/plan-prevention/FormulairePlanPrevention";
import { requireEtablissement } from "@/lib/auth/scope";
import { listPrestataires } from "@/lib/prestataires/queries";

export const metadata = {
  title: "Nouveau plan de prévention",
};

export default async function NouveauPlanPreventionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);
  const prestatairesAnnuaire = await listPrestataires(id);

  const prestataires = prestatairesAnnuaire.map((p) => ({
    id: p.id,
    raisonSociale: p.raisonSociale,
    contactNom: p.contactNom,
    contactEmail: p.contactEmail,
    siret: p.siret,
  }));

  return (
    <>
      <AppTopbar
        title="Nouveau plan de prévention"
        subtitle="Diagnostic, inspection commune, matrice risques/mesures."
        crumbs={[
          { href: `/etablissements/${id}`, label: etablissement.raisonDisplay },
          {
            href: `/etablissements/${id}/plan-prevention`,
            label: "Plans de prévention",
          },
          { label: "Nouveau" },
        ]}
        actions={
          <Link
            href={`/etablissements/${id}/plan-prevention`}
            className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground hover:text-ink"
          >
            Retour à la liste →
          </Link>
        }
      />

      <main className="mx-auto max-w-3xl px-8 py-8 pb-16">
        <FormulairePlanPrevention
          etablissementId={id}
          prestataires={prestataires}
        />
      </main>
    </>
  );
}
