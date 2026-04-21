import Link from "next/link";
import { notFound } from "next/navigation";
import { EtablissementForm } from "@/components/etablissements/EtablissementForm";
import { creerEtablissement } from "@/lib/etablissements/actions";
import { getEntreprise } from "@/lib/entreprises/queries";

export default async function NouvelEtablissementPage({
  searchParams,
}: {
  searchParams: Promise<{ entrepriseId?: string }>;
}) {
  const { entrepriseId } = await searchParams;
  if (!entrepriseId) notFound();
  const entreprise = await getEntreprise(entrepriseId);
  if (!entreprise) notFound();

  const action = creerEtablissement.bind(null, entrepriseId);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/entreprises/${entrepriseId}`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← {entreprise.raisonSociale}
        </Link>
      </nav>

      <header className="mt-8 space-y-3">
        <p className="label-admin">Nouvel établissement</p>
        <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
          Déclarer un établissement
        </h1>
        <p className="max-w-xl text-[0.9rem] leading-[1.7] text-muted-foreground">
          Chaque établissement a sa propre adresse, sa typologie et son
          DUERP. Une entreprise peut en avoir plusieurs (plusieurs
          restaurants, bureau + boutique…).
        </p>
      </header>

      <div className="mt-10">
        <EtablissementForm
          action={action}
          libelleSubmit="Créer l'établissement →"
          labelAnnuler={{
            libelle: "Annuler",
            href: `/entreprises/${entrepriseId}`,
          }}
        />
      </div>
    </main>
  );
}
