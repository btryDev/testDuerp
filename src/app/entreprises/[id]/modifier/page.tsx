import Link from "next/link";
import { notFound } from "next/navigation";
import { EntrepriseForm } from "@/components/entreprises/EntrepriseForm";
import { modifierEntreprise } from "@/lib/entreprises/actions";
import { getEntreprise } from "@/lib/entreprises/queries";
import { SupprimerEntrepriseButton } from "@/components/entreprises/SupprimerEntrepriseButton";

export default async function ModifierEntreprisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entreprise = await getEntreprise(id);
  if (!entreprise) notFound();

  const action = modifierEntreprise.bind(null, id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <nav className="text-sm text-muted-foreground">
        <Link href={`/entreprises/${id}`} className="hover:underline">
          ← {entreprise.raisonSociale}
        </Link>
      </nav>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Modifier l&apos;entreprise
      </h1>

      <div className="mt-8">
        <EntrepriseForm
          action={action}
          valeursInitiales={entreprise}
          libelleSubmit="Enregistrer"
          labelAnnuler={{
            libelle: "Annuler",
            href: `/entreprises/${id}`,
          }}
        />
      </div>

      <div className="mt-16 border-t pt-8">
        <h2 className="text-sm font-medium text-destructive">Zone sensible</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          La suppression entraîne celle de tous les DUERP et versions associés.
        </p>
        <div className="mt-4">
          <SupprimerEntrepriseButton id={id} />
        </div>
      </div>
    </main>
  );
}
