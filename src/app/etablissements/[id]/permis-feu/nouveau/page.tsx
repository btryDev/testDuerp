import Link from "next/link";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { FormulairePermisFeu } from "@/components/permis-feu/FormulairePermisFeu";
import { requireEtablissement } from "@/lib/auth/scope";
import { listPrestataires } from "@/lib/prestataires/queries";

export const metadata = {
  title: "Nouveau permis de feu",
};

export default async function NouveauPermisFeuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);
  const prestatairesAnnuaire = await listPrestataires(id);

  // Filtre sur les domaines pertinents pour du point chaud : BTP + entretien
  const prestataires = prestatairesAnnuaire
    .filter((p) =>
      p.domaines.some((d) =>
        ["travaux_btp", "entretien_general", "autre"].includes(d),
      ) || p.domaines.length === 0,
    )
    .map((p) => ({
      id: p.id,
      raisonSociale: p.raisonSociale,
      contactNom: p.contactNom,
      contactEmail: p.contactEmail,
    }));

  return (
    <>
      <AppTopbar
        title="Nouveau permis de feu"
        subtitle="À créer avant l'arrivée du prestataire sur site."
        crumbs={[
          { href: `/etablissements/${id}`, label: etablissement.raisonDisplay },
          { href: `/etablissements/${id}/permis-feu`, label: "Permis de feu" },
          { label: "Nouveau" },
        ]}
        actions={
          <Link
            href={`/etablissements/${id}/permis-feu`}
            className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground hover:text-ink"
          >
            Retour à la liste →
          </Link>
        }
      />

      <main className="mx-auto max-w-3xl px-8 py-8 pb-16">
        <FormulairePermisFeu
          etablissementId={id}
          prestataires={prestataires}
        />
      </main>
    </>
  );
}
